import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Centralised rate-limit primitive (GOAL-249).
 *
 * Backed by @upstash/ratelimit on top of Upstash Redis. Picked over
 * @vercel/edge-rate-limit for two reasons: (1) the Upstash sliding-window
 * algorithm is the right shape for "5 / minute / IP" probe-throttling
 * without false negatives at window boundaries, (2) the same Upstash
 * Redis instance can be reused for other use cases later (e.g. job
 * locks, idempotency keys) without adding a second infra dependency.
 *
 * Usage:
 *   const { allowed, retryAfter } = await rateLimit({
 *     policy: 'auth-burst',
 *     key: ip,
 *   })
 *   if (!allowed) return rateLimited(retryAfter)
 *
 * Policies are declared as constants below so every call site uses the
 * same window and limit. To tune one, change the constant; routes don't
 * need to know the numbers.
 *
 * Failure modes (see POLICY_FAILURE_MODE) — applied both when Redis errors
 * at runtime AND when KV_REST_API_URL / KV_REST_API_TOKEN are missing:
 *   - fail-open for the read-y unauthenticated endpoints (login, accept,
 *     reset-password, request-reset, refresh-token) and for the
 *     authenticated, size-capped bulk-import. If Redis is unreachable we'd
 *     rather let legitimate users in than 503 the whole auth surface.
 *   - fail-CLOSED for invite-blast. A broken limiter must NOT let a
 *     compromised admin blast unlimited emails through info@goalpost.earth
 *     and torch our sender reputation.
 */

export type PolicyName =
  | 'auth-burst'
  | 'invite-blast'
  | 'reset-request'
  | 'bulk-import'

interface RateLimitArgs {
  policy: PolicyName
  key: string
}

interface RateLimitResult {
  allowed: boolean
  /** Seconds until the requester can try again. 0 if allowed. */
  retryAfter: number
}

// Lazy-singleton: the Redis client opens a connection on first call; we
// don't want one per cold start. Wrapped in a function so import-time
// has no env-var dependency (tests that don't touch rate limiting won't
// blow up on missing creds).
let redisClient: Redis | null = null
function getRedis(): Redis | null {
  if (redisClient) return redisClient
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  redisClient = new Redis({ url, token })
  return redisClient
}

// Per-policy Ratelimit instances are also lazy + memoised. Each gets its
// own prefix so keys don't collide across policies (an IP keyed under
// "auth-burst" and the same IP under "invite-blast" must be independent).
const limiterCache = new Map<PolicyName, Ratelimit>()

// One Upstash database is shared by production, preview, and local dev, so
// the environment goes into every key prefix — otherwise a tester bursting
// logins from their IP against the preview deploy would also throttle that
// same IP on production. VERCEL_ENV is 'production' | 'preview' |
// 'development' on Vercel and undefined locally, where 'dev' keeps local
// buckets separate from all deploys.
const ENV_PREFIX = process.env.VERCEL_ENV ?? 'dev'

function getLimiter(policy: PolicyName): Ratelimit | null {
  const cached = limiterCache.get(policy)
  if (cached) return cached
  const redis = getRedis()
  if (!redis) return null
  let limiter: Ratelimit
  switch (policy) {
    case 'auth-burst':
      // 5 requests per minute per IP. Sliding-window so a burst that
      // straddles the wall-clock minute doesn't get a free 10/min.
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        prefix: `rl:${ENV_PREFIX}:auth-burst`,
      })
      break
    case 'invite-blast':
      // 20 invites per hour per inviting-account. Hour window because
      // legit admins onboarding a team can plausibly send 15-20 in a
      // sitting; anything beyond that is bulk-blast territory.
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 h'),
        prefix: `rl:${ENV_PREFIX}:invite-blast`,
      })
      break
    case 'reset-request':
      // 3 reset requests per hour per email. Tight because legitimate
      // users almost never need >1 in a sitting; harvesting probes hit
      // this fast.
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        prefix: `rl:${ENV_PREFIX}:reset-request`,
      })
      break
    case 'bulk-import':
      // 10 spreadsheet imports per hour per account (GOAL-317). At the
      // 300-row cap that's 3000 rows/hour — generous for a member working
      // through a large article list in batches, but it bounds the embedding
      // spend a looping caller can incur (each batch ends in a resonance
      // discovery sweep with OpenAI round-trips, run by the import worker
      // since GOAL-326 — it is no longer a post-response `after()` callback).
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'),
        prefix: `rl:${ENV_PREFIX}:bulk-import`,
      })
      break
  }
  limiterCache.set(policy, limiter)
  return limiter
}

// Whether to allow or deny when the limiter itself fails (Redis down,
// env vars missing, etc.). See header comment for rationale.
const POLICY_FAILURE_MODE: Record<PolicyName, 'allow' | 'deny'> = {
  'auth-burst': 'allow',
  'invite-blast': 'deny',
  'reset-request': 'allow',
  // Fail-OPEN, re-affirmed in GOAL-326 now that Redis is actually
  // provisioned. Considered flipping to closed since the 10/hour cap exists
  // to bound OpenAI spend on the post-import embedding sweep, but: imports
  // are authenticated, capped at MAX_ARTICLE_IMPORT_ROWS (300) per request,
  // and a member working through a large article backlog is exactly who a
  // Redis outage would punish. Unmetered spend for the length of an outage
  // is recoverable; a member losing the ability to import is a visible
  // product failure. Revisit if import spend ever becomes the dominant cost.
  'bulk-import': 'allow',
}

export async function rateLimit({
  policy,
  key,
}: RateLimitArgs): Promise<RateLimitResult> {
  const limiter = getLimiter(policy)
  if (!limiter) {
    // Hard guard: production must fail FAST and LOUD on missing config, not
    // degrade. Below this, missing config falls back to POLICY_FAILURE_MODE —
    // fine for localhost (VERCEL_ENV undefined) and previews ('preview'),
    // but in prod that would mean silently unenforced fail-open limiters and
    // every invite denied with a misleading "try again in 1 minute" message.
    // A 500 on the auth surface gets noticed and fixed; quiet misbehavior
    // doesn't.
    if (process.env.VERCEL_ENV === 'production') {
      throw new Error(
        '[rate-limit] FATAL: no Upstash Redis configured (KV_REST_API_URL/' +
          'KV_REST_API_TOKEN) in production — invite-blast would be unenforced. ' +
          'Provision Upstash KV before deploying to production.'
      )
    }
    // Missing config honors POLICY_FAILURE_MODE, same as a runtime error
    // (GOAL-326): fail-open policies degrade gracefully with a warning,
    // while invite-blast fails CLOSED — an unconfigured env must not be
    // able to blast unlimited emails through info@goalpost.earth. Upstash
    // Redis is provisioned for prod, preview, and dev; a denied invite
    // here means this env is missing KV_REST_API_URL / KV_REST_API_TOKEN
    // (locally: copy them from Vercel project env into .env.local).
    const allowed = POLICY_FAILURE_MODE[policy] === 'allow'
    const logFn = allowed ? console.warn : console.error
    logFn(
      `[rate-limit] no redis configured (KV_REST_API_URL/KV_REST_API_TOKEN); ` +
        `policy=${policy} key=${redactKey(key)} → ${allowed ? 'allow' : 'deny'}`
    )
    return { allowed, retryAfter: allowed ? 0 : 60 }
  }

  try {
    const result = await limiter.limit(key)
    if (!result.success) {
      const retryAfter = Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000)
      )
      console.info(
        `[rate-limit] blocked; policy=${policy} key=${redactKey(
          key
        )} retry=${retryAfter}s`
      )
      return { allowed: false, retryAfter }
    }
    return { allowed: true, retryAfter: 0 }
  } catch (err) {
    const allowed = POLICY_FAILURE_MODE[policy] === 'allow'
    // Promote to error when fail-CLOSED: a Redis outage on invite-blast
    // means real admin invites get blocked, which warrants alerting,
    // not just a warning line scrolling past. Fail-OPEN policies stay
    // at warn — the worst case there is "limiter not enforcing", which
    // is graceful degradation.
    const logFn = allowed ? console.warn : console.error
    logFn(
      `[rate-limit] limiter error; policy=${policy} key=${redactKey(
        key
      )} → ${allowed ? 'allow' : 'deny'} (${err instanceof Error ? err.message : 'unknown'})`
    )
    return { allowed, retryAfter: allowed ? 0 : 60 }
  }
}

// Show first 4 chars + an ellipsis so a log reader can correlate
// repeated hits without disclosing the full IP/email.
function redactKey(key: string): string {
  if (!key) return '(empty)'
  if (key.length <= 6) return `${key[0]}…`
  return `${key.slice(0, 4)}…`
}

/**
 * Extract a best-effort client IP from request headers. Vercel sets
 * `x-forwarded-for`; we take the first hop because subsequent hops are
 * untrusted proxies that the client controls.
 */
export function clientIp(req: { headers: Headers }): string {
  const xff = req.headers.get('x-forwarded-for') ?? ''
  const firstHop = xff.split(',')[0]?.trim()
  if (firstHop) return firstHop
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * Standard 429 response body for any rate-limited route. Includes the
 * Retry-After header per RFC 7231 §7.1.3. Error shape mirrors the rest
 * of the auth API so callers don't need a special branch.
 */
export function rateLimited(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Try again shortly.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  )
}
