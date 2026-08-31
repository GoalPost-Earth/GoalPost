/**
 * Unit + mocked-Redis tests for the central rate-limit primitive (GOAL-249).
 *
 * Two test groups in this file:
 *
 *   1. "no Redis configured" — covers the fail-mode contract for each
 *      policy when KV_REST_API_URL / KV_REST_API_TOKEN aren't set. This
 *      is the dev-laptop / first-deploy scenario; if it breaks, every
 *      auth route starts 503-ing.
 *
 *   2. "with a mocked Redis" — uses jest.doMock on @upstash/ratelimit to
 *      replace the limiter with a tiny in-memory sliding-window so we can
 *      assert burst-then-block and cross-key isolation without standing
 *      up Upstash. Mocking the limiter (not the Redis client) lets us
 *      keep the production code path exactly intact — getLimiter() still
 *      runs, the policy switch still runs, only the actual algorithm is
 *      swapped.
 *
 * The clock is the controlled variable: we drive Date.now() forward by
 * advancing a counter the mocked limiter reads. No fake-timers needed
 * because the limiter doesn't await wall time, it just compares ms.
 */

import { clientIp, rateLimited } from './rate-limit'

describe('rateLimit() — no Redis configured (fail-mode contract)', () => {
  // The rate-limit module memoises the Redis client + limiters at module
  // scope. Each test in this block needs a clean module + a clean env so
  // a previous test's KV_REST_API_URL doesn't leak through.
  const ORIGINAL_ENV = { ...process.env }

  beforeEach(() => {
    jest.resetModules()
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
  })

  afterAll(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('auth-burst: fails OPEN — legitimate users keep authing when Redis is down', async () => {
    // Rationale per POLICY_FAILURE_MODE: a broken limiter must not 503
    // the whole login surface. The blast radius of letting a brute-force
    // through for a window is small (login is bcrypt-bound, password is
    // strong) compared to locking every user out of the product.
    const { rateLimit } = await import('./rate-limit')
    const result = await rateLimit({ policy: 'auth-burst', key: '1.2.3.4' })
    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBe(0)
  })

  it('invite-blast: fails CLOSED — a missing limiter must not allow email blasts', async () => {
    // GOAL-326 restored this after Upstash Redis was provisioned for every
    // environment. Rationale per POLICY_FAILURE_MODE: an env with no Redis
    // configured must not let a compromised admin blast unlimited invites
    // through info@goalpost.earth. A deny here in local dev means
    // KV_REST_API_URL / KV_REST_API_TOKEN are missing from .env.local.
    const { rateLimit } = await import('./rate-limit')
    const result = await rateLimit({
      policy: 'invite-blast',
      key: 'invite-blast:1.2.3.4',
    })
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBe(60)
  })

  it('bulk-import: fails OPEN — a misconfigured env must not brick imports', async () => {
    // bulk-import is the one fail-open policy that is authenticated and
    // write-y, so it's easy to mis-read as "should be closed". It isn't:
    // imports are size-capped at 300 rows, and /api/import/articles turns a
    // deny into a hard 429, so flipping this to 'deny' would brick every
    // spreadsheet import in any env missing Redis. Pinned as a test because
    // before GOAL-326 all four policies collapsed to the same bypass and
    // nothing would have caught the flip.
    const { rateLimit } = await import('./rate-limit')
    const result = await rateLimit({
      policy: 'bulk-import',
      key: 'user-1',
    })
    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBe(0)
  })

  it('reset-request: fails OPEN — request-reset surface stays responsive', async () => {
    // Same reasoning as auth-burst: the route returns a uniform 201
    // success envelope on the happy + rate-limited paths, so fail-open
    // can't be used as an enumeration oracle either. Keeps the public
    // "I forgot my password" page useful when Redis is down.
    const { rateLimit } = await import('./rate-limit')
    const result = await rateLimit({
      policy: 'reset-request',
      key: 'reset-request:alice@example.com',
    })
    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBe(0)
  })
})

describe('clientIp()', () => {
  it('takes the first hop from x-forwarded-for and trims whitespace', () => {
    // Vercel + most proxies prepend on the LEFT, so the first entry is
    // the originating client; subsequent hops are untrusted because they
    // could be forged by intermediate proxies the request walked through.
    const req = {
      headers: new Headers({
        'x-forwarded-for': '  203.0.113.7 , 10.0.0.1, 10.0.0.2',
      }),
    }
    expect(clientIp(req)).toBe('203.0.113.7')
  })

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    // Some edges (older nginx configs, manual reverse proxies) only set
    // x-real-ip; we still want a usable key rather than collapsing every
    // such requester into a single "unknown" bucket.
    const req = { headers: new Headers({ 'x-real-ip': '198.51.100.42' }) }
    expect(clientIp(req)).toBe('198.51.100.42')
  })

  it('returns "unknown" when neither header is set', () => {
    // Defensive: local curl / unit tests / a misconfigured deployment.
    // Returning a stable sentinel keys all such requests into one
    // bucket, which is the safest default — a real attacker behind no
    // proxy would still get rate-limited, just shared.
    const req = { headers: new Headers() }
    expect(clientIp(req)).toBe('unknown')
  })

  it('does NOT prefer x-real-ip over x-forwarded-for', () => {
    // Per the implementation comment, x-forwarded-for wins when both are
    // present because Vercel sets it and it's the multi-hop-aware header.
    // Documenting the precedence as a test so it can't drift.
    const req = {
      headers: new Headers({
        'x-forwarded-for': '203.0.113.7',
        'x-real-ip': '198.51.100.42',
      }),
    }
    expect(clientIp(req)).toBe('203.0.113.7')
  })

  it('treats an empty x-forwarded-for as absent and falls through', () => {
    // Some sanitisers strip the value but leave the header. Don't end up
    // keying every requester under empty string.
    const req = {
      headers: new Headers({
        'x-forwarded-for': '',
        'x-real-ip': '198.51.100.42',
      }),
    }
    expect(clientIp(req)).toBe('198.51.100.42')
  })
})

describe('rateLimited()', () => {
  it('returns a 429 with Retry-After in seconds (RFC 7231 §7.1.3)', async () => {
    const res = rateLimited(42)
    expect(res.status).toBe(429)
    // Retry-After per the RFC is "either an HTTP-date or a number of
    // seconds." We send seconds because it's relative and clock-safe.
    expect(res.headers.get('Retry-After')).toBe('42')
    expect(res.headers.get('Content-Type')).toBe('application/json')
    const body = await res.json()
    // Same generic "Too many requests" envelope across every call site
    // so a polling client can branch on status code, not body shape.
    expect(body).toEqual({ error: 'Too many requests. Try again shortly.' })
  })
})

/**
 * Mocked-Redis tests for rateLimit(). We replace @upstash/ratelimit's
 * Ratelimit class with a tiny in-memory sliding-window keyed by
 * (prefix, identifier). Two reasons this is the right mock surface:
 *
 *   - Mocking the *limiter* (not the Redis client) keeps getLimiter()
 *     and the policy switch in production code under test — only the
 *     algorithm itself is replaced.
 *
 *   - It's also where the unit-of-correctness lives: "the 6th request
 *     in 60s should be denied" is a limiter property, not a Redis
 *     property, so a fake limiter is faithful to the AC.
 *
 * We also stub @upstash/redis so the lazy getRedis() succeeds without
 * a real connection.
 */
describe('rateLimit() — mocked Redis (burst-then-block, key isolation)', () => {
  const ORIGINAL_ENV = { ...process.env }
  let currentTime = 1_700_000_000_000 // arbitrary epoch ms; advance per test
  // Every prefix the production code hands to the Ratelimit constructor, in
  // construction order. Used by the env-isolation test below.
  let constructedPrefixes: string[] = []

  beforeEach(() => {
    jest.resetModules()
    process.env.KV_REST_API_URL = 'https://fake-upstash.invalid'
    process.env.KV_REST_API_TOKEN = 'fake-token'
    // ENV_PREFIX is read at module scope, so each test decides its own
    // VERCEL_ENV. Cleared here so a leaked value can't silently change the
    // key namespace another test asserts on.
    delete process.env.VERCEL_ENV
    currentTime = 1_700_000_000_000
    constructedPrefixes = []

    // Stub the Redis client so getRedis() returns a non-null instance.
    // We never call methods on it — the mocked Ratelimit does its own
    // bookkeeping in-memory.
    jest.doMock('@upstash/redis', () => ({
      Redis: jest.fn().mockImplementation(() => ({})),
    }))

    // In-memory sliding-window. Each (prefix, identifier) tuple gets
    // its own timestamp queue. Window + max are taken from the
    // arguments slidingWindow() receives in production code, parsed
    // out of the duration string ("1 m" → 60_000ms, "1 h" → 3_600_000).
    const buckets = new Map<string, number[]>()

    function parseDuration(d: string): number {
      const [, n, unit] = /^(\d+)\s*([smh])$/.exec(d.trim()) ?? []
      const mult = unit === 'h' ? 3_600_000 : unit === 'm' ? 60_000 : 1_000
      return Number(n) * mult
    }

    const slidingWindow = (max: number, duration: string) => ({
      __max: max,
      __windowMs: parseDuration(duration),
    })

    class FakeRatelimit {
      private readonly max: number
      private readonly windowMs: number
      private readonly prefix: string
      constructor(opts: {
        redis: unknown
        limiter: { __max: number; __windowMs: number }
        prefix: string
      }) {
        this.max = opts.limiter.__max
        this.windowMs = opts.limiter.__windowMs
        this.prefix = opts.prefix
        constructedPrefixes.push(opts.prefix)
      }
      async limit(identifier: string) {
        const key = `${this.prefix}::${identifier}`
        const now = currentTime
        const cutoff = now - this.windowMs
        const arr = (buckets.get(key) ?? []).filter((t) => t > cutoff)
        if (arr.length >= this.max) {
          // Mirror the real limiter shape: { success, reset } where
          // reset is wall-clock ms at which the oldest timestamp falls
          // out of the window. Production rateLimit() converts this
          // into a positive integer Retry-After.
          const reset = arr[0] + this.windowMs
          buckets.set(key, arr)
          return { success: false, limit: this.max, remaining: 0, reset }
        }
        arr.push(now)
        buckets.set(key, arr)
        return {
          success: true,
          limit: this.max,
          remaining: this.max - arr.length,
          reset: now + this.windowMs,
        }
      }
    }
    Object.assign(FakeRatelimit, { slidingWindow })

    jest.doMock('@upstash/ratelimit', () => ({
      Ratelimit: FakeRatelimit,
    }))

    // Production rateLimit() calls Date.now() once after limit() to
    // convert the reset timestamp into a Retry-After delta. Pin
    // Date.now to our advancing counter so retryAfter is deterministic.
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.dontMock('@upstash/redis')
    jest.dontMock('@upstash/ratelimit')
  })

  afterAll(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('auth-burst: 5 allowed in a minute, the 6th is denied with retryAfter > 0', async () => {
    // Direct expression of the AC: "Login burst-then-block: 6 attempts
    // in 60s → 6th gets 429 + Retry-After." Same shape applies to
    // every auth-burst call site (login / accept-invite / reset-password
    // / refresh-token / request-reset's per-IP wrapper).
    const { rateLimit } = await import('./rate-limit')
    const key = 'login:203.0.113.1'

    for (let i = 1; i <= 5; i++) {
      // Stagger by 1ms so timestamps are distinct (irrelevant to the
      // result; just makes the test debuggable if it ever fails).
      currentTime += 1
      const r = await rateLimit({ policy: 'auth-burst', key })
      expect(r.allowed).toBe(true)
      expect(r.retryAfter).toBe(0)
    }

    currentTime += 1
    const sixth = await rateLimit({ policy: 'auth-burst', key })
    expect(sixth.allowed).toBe(false)
    expect(sixth.retryAfter).toBeGreaterThan(0)
    // Retry-After must be sane: bounded by the window length (60s for
    // auth-burst). If we got 3600s back here, something's wrong with
    // the duration parse.
    expect(sixth.retryAfter).toBeLessThanOrEqual(60)
  })

  it('invite-blast: 20 allowed in an hour, the 21st is denied', async () => {
    // AC: "addSpaceMember invite-blast: 21st mutation in 60min →
    // GraphQLError code RATE_LIMITED". This test proves the limiter
    // side of that contract; the resolver-side assertions (no email,
    // no token, no log) live in the resolver test.
    const { rateLimit } = await import('./rate-limit')
    const key = 'invite-blast:203.0.113.2'

    for (let i = 1; i <= 20; i++) {
      currentTime += 1
      const r = await rateLimit({ policy: 'invite-blast', key })
      expect(r.allowed).toBe(true)
    }

    currentTime += 1
    const twentyFirst = await rateLimit({ policy: 'invite-blast', key })
    expect(twentyFirst.allowed).toBe(false)
    expect(twentyFirst.retryAfter).toBeGreaterThan(0)
    // Window is 1h; Retry-After must be within that bound.
    expect(twentyFirst.retryAfter).toBeLessThanOrEqual(3600)
  })

  it('reset-request: 3 allowed in an hour, the 4th is denied', async () => {
    // AC: "request-reset email-blast: 4th request in 60min for same
    // email" — at the limiter level, that means 4th call to rateLimit()
    // is denied. The route then converts this into a no-op (no email
    // sent) plus the standard 201 envelope.
    const { rateLimit } = await import('./rate-limit')
    const key = 'reset-request:alice@example.com'

    for (let i = 1; i <= 3; i++) {
      currentTime += 1
      const r = await rateLimit({ policy: 'reset-request', key })
      expect(r.allowed).toBe(true)
    }

    currentTime += 1
    const fourth = await rateLimit({ policy: 'reset-request', key })
    expect(fourth.allowed).toBe(false)
    expect(fourth.retryAfter).toBeGreaterThan(0)
  })

  it('distinct keys do NOT share a bucket within the same policy', async () => {
    // Cross-IP isolation: two attackers from different IPs must each
    // get their full quota — otherwise one attacker bursting could
    // accidentally lock out an unrelated legitimate user.
    const { rateLimit } = await import('./rate-limit')

    // Burn the auth-burst budget for IP A.
    for (let i = 0; i < 5; i++) {
      currentTime += 1
      await rateLimit({ policy: 'auth-burst', key: 'login:203.0.113.10' })
    }
    currentTime += 1
    const aBlocked = await rateLimit({
      policy: 'auth-burst',
      key: 'login:203.0.113.10',
    })
    expect(aBlocked.allowed).toBe(false)

    // IP B is in a different bucket and must still be allowed.
    currentTime += 1
    const bAllowed = await rateLimit({
      policy: 'auth-burst',
      key: 'login:203.0.113.11',
    })
    expect(bAllowed.allowed).toBe(true)
  })

  it('distinct policies do NOT share a bucket on the same key (prefix isolation)', async () => {
    // The whole reason for per-policy `prefix: 'rl:<policy>'` is that
    // an IP keyed under auth-burst and the same IP keyed under
    // invite-blast must NOT clobber each other. If this regresses, a
    // user who hit 5 logins would also be locked out of triggering
    // invites, or vice-versa — opposite buckets bleeding into each
    // other in either direction.
    const { rateLimit } = await import('./rate-limit')
    const ip = '203.0.113.20'

    // Burn auth-burst for this IP.
    for (let i = 0; i < 5; i++) {
      currentTime += 1
      await rateLimit({ policy: 'auth-burst', key: `login:${ip}` })
    }
    currentTime += 1
    expect(
      (await rateLimit({ policy: 'auth-burst', key: `login:${ip}` })).allowed
    ).toBe(false)

    // invite-blast for the same IP still has its full quota — different
    // prefix, different bucket.
    currentTime += 1
    const invite = await rateLimit({
      policy: 'invite-blast',
      key: `invite-blast:${ip}`,
    })
    expect(invite.allowed).toBe(true)
  })

  it('namespaces keys by environment so prod/preview/dev share no buckets', async () => {
    // GOAL-326: one Upstash database serves production, preview, AND local
    // dev, so the environment is baked into every key prefix. Without it, a
    // tester bursting logins from their IP against a preview deploy would
    // also throttle that same IP on production. Asserting the constructed
    // prefix (not just behavior) because the bleed this prevents is
    // cross-process — no single-process test could observe it.
    process.env.VERCEL_ENV = 'preview'
    const preview = await import('./rate-limit')
    await preview.rateLimit({ policy: 'auth-burst', key: 'login:198.51.100.1' })
    expect(constructedPrefixes).toEqual(['rl:preview:auth-burst'])

    // Same policy, different environment → a different namespace.
    jest.resetModules()
    constructedPrefixes = []
    process.env.VERCEL_ENV = 'production'
    const production = await import('./rate-limit')
    await production.rateLimit({
      policy: 'auth-burst',
      key: 'login:198.51.100.1',
    })
    expect(constructedPrefixes).toEqual(['rl:production:auth-burst'])

    // Unset (a developer's laptop, where VERCEL_ENV doesn't exist) gets its
    // own 'dev' namespace rather than colliding with a deployed environment.
    jest.resetModules()
    constructedPrefixes = []
    delete process.env.VERCEL_ENV
    const local = await import('./rate-limit')
    await local.rateLimit({ policy: 'invite-blast', key: 'invite-blast:u1' })
    expect(constructedPrefixes).toEqual(['rl:dev:invite-blast'])
  })

  it('returns a positive integer retryAfter (never 0, never a fraction)', async () => {
    // rateLimited(retryAfter) renders this verbatim into the
    // Retry-After header. A 0 or fractional value would render as
    // "Retry-After: 0" / "Retry-After: 0.4" and let a polling client
    // hammer immediately. The clamp `Math.max(1, Math.ceil(...))` in
    // production code is what we're guarding.
    const { rateLimit } = await import('./rate-limit')
    const key = 'login:203.0.113.30'

    // Cluster all 5 timestamps tightly so the oldest is still inside
    // the window after the upcoming advance — otherwise the sliding
    // window would expire entries and the 6th call would be allowed.
    for (let i = 0; i < 5; i++) {
      currentTime += 10
      await rateLimit({ policy: 'auth-burst', key })
    }
    // Advance the clock to a point where the raw delta from now to
    // reset is sub-second — naive truncation would yield 0, but the
    // production code's Math.max(1, Math.ceil(…)) must clamp to 1.
    // Reset = oldestTimestamp + 60_000. Oldest = base + 10. To leave a
    // delta of ~500ms we set now = base + 10 + 60_000 - 500.
    const oldestTs = 1_700_000_000_000 + 10
    currentTime = oldestTs + 60_000 - 500
    const blocked = await rateLimit({ policy: 'auth-burst', key })
    expect(blocked.allowed).toBe(false)
    expect(Number.isInteger(blocked.retryAfter)).toBe(true)
    expect(blocked.retryAfter).toBeGreaterThanOrEqual(1)
  })
})
