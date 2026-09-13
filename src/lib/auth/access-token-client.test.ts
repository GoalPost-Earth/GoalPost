/**
 * GOAL-375 — the client-side access-token cache.
 *
 * The three behaviours worth pinning are the ones that decide how many
 * `/api/auth/access-token` round-trips a session pays:
 *
 *   1. the cache follows the token's real `exp`, not a flat 60s, so a
 *      60s-interval background poll stops re-fetching a live token;
 *   2. login / signup can seed the cache, so the first query after login
 *      makes no round-trip at all;
 *   3. the head bootstrap's in-flight promise is adopted rather than
 *      duplicated, and is consumed exactly once.
 *
 * The module is `'use client'` and module-scoped, so each test re-requires
 * it under `jest.isolateModules` to get a fresh cache.
 */

/* eslint-disable @typescript-eslint/no-require-imports */

type Client = typeof import('./access-token-client')

const MINUTE = 60

/** Build an unsigned JWT-shaped token whose `exp` is `ttlSeconds` away. */
function tokenExpiringIn(ttlSeconds: number): string {
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return [
    b64({ alg: 'HS256', typ: 'JWT' }),
    b64({
      user: { id: 'person-1' },
      exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    }),
    'not-a-real-signature',
  ].join('.')
}

function loadClient(): Client {
  let mod!: Client
  jest.isolateModules(() => {
    mod = require('./access-token-client') as Client
  })
  return mod
}

function okResponse(accessToken: string, expiresAt?: number) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ accessToken, expiresAt }),
  } as unknown as Response
}

function errorResponse(status: number) {
  return {
    ok: false,
    status,
    json: async () => ({ error: 'nope' }),
  } as unknown as Response
}

describe('GOAL-375: access-token client cache', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    delete (globalThis as { window?: unknown }).window
    jest.restoreAllMocks()
  })

  describe('cache TTL follows the token lifetime', () => {
    it('reuses a 30-minute token across calls a minute apart (no second hop)', async () => {
      const token = tokenExpiringIn(30 * MINUTE)
      const fetchMock = jest.fn(async () => okResponse(token))
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      const nowSpy = jest.spyOn(Date, 'now')
      const t0 = Date.now()

      nowSpy.mockReturnValue(t0)
      await expect(client.getAccessToken()).resolves.toBe(token)

      // Where the old flat 60s TTL expired, the real token has ~29 minutes
      // left — this is the NotificationPanel poll, and it must not re-fetch.
      nowSpy.mockReturnValue(t0 + 61_000)
      await expect(client.getAccessToken()).resolves.toBe(token)
      // ...nor should the one after it, five minutes in.
      nowSpy.mockReturnValue(t0 + 5 * 60_000)
      await expect(client.getAccessToken()).resolves.toBe(token)

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('re-fetches once the token is inside the 60s expiry skew', async () => {
      const first = tokenExpiringIn(30 * MINUTE)
      const second = tokenExpiringIn(30 * MINUTE)
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(okResponse(first))
        .mockResolvedValueOnce(okResponse(second))
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      const nowSpy = jest.spyOn(Date, 'now')
      const t0 = Date.now()

      nowSpy.mockReturnValue(t0)
      await expect(client.getAccessToken()).resolves.toBe(first)

      // 29m30s in: inside `exp - 60s`, so the cached token is retired even
      // though it has not technically expired yet.
      nowSpy.mockReturnValue(t0 + (29 * 60 + 30) * 1000)
      await expect(client.getAccessToken()).resolves.toBe(second)
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('prefers the server-supplied expiresAt over the token payload', async () => {
      // Payload says 30 minutes; the server says 90 seconds. The server wins,
      // so the token is retired after 90s - 60s skew = 30s.
      const token = tokenExpiringIn(30 * MINUTE)
      const t0 = Date.now()
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(okResponse(token, Math.floor(t0 / 1000) + 90))
        .mockResolvedValueOnce(okResponse(tokenExpiringIn(30 * MINUTE)))
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      const nowSpy = jest.spyOn(Date, 'now')
      nowSpy.mockReturnValue(t0)
      await expect(client.getAccessToken()).resolves.toBe(token)

      nowSpy.mockReturnValue(t0 + 31_000)
      await client.getAccessToken()
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('caps the cache at 30 minutes even for an absurd exp', async () => {
      // A wrong-unit `exp` (milliseconds where seconds were meant) reads as
      // ~55,000 years out. It must degrade to "re-fetch sooner than needed",
      // never "cache a dead token for the life of the document".
      const token = tokenExpiringIn(500 * 365 * 24 * 3600)
      const fetchMock = jest.fn(async () => okResponse(token))
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      const nowSpy = jest.spyOn(Date, 'now')
      const t0 = Date.now()
      nowSpy.mockReturnValue(t0)
      await client.getAccessToken()

      nowSpy.mockReturnValue(t0 + 30 * 60_000 + 1_000)
      await client.getAccessToken()
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('falls back to a flat 60s when `exp` is unreadable', async () => {
      const opaque = 'not-a-jwt'
      const fetchMock = jest.fn(async () => okResponse(opaque))
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      const nowSpy = jest.spyOn(Date, 'now')
      const t0 = Date.now()

      nowSpy.mockReturnValue(t0)
      await expect(client.getAccessToken()).resolves.toBe(opaque)
      nowSpy.mockReturnValue(t0 + 30_000)
      await expect(client.getAccessToken()).resolves.toBe(opaque)
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // Past 60s the undecodable token is not trusted any further — this is
      // the pre-GOAL-375 behaviour, i.e. "as slow as before", never "cached
      // past expiry".
      nowSpy.mockReturnValue(t0 + 61_000)
      await client.getAccessToken()
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('seeding from a login / signup response', () => {
    it('serves the seeded token without any round-trip', async () => {
      const fetchMock = jest.fn()
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      const token = tokenExpiringIn(30 * MINUTE)
      client.seedAccessToken(token)

      await expect(client.getAccessToken()).resolves.toBe(token)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('honours an explicit expiresAt over the token payload', async () => {
      const fetchMock = jest.fn(async () =>
        okResponse(tokenExpiringIn(30 * MINUTE))
      )
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      const nowSpy = jest.spyOn(Date, 'now')
      const t0 = Date.now()
      nowSpy.mockReturnValue(t0)

      // Server says this token dies in 90s, whatever its payload claims.
      client.seedAccessToken('opaque-token', Math.floor(t0 / 1000) + 90)
      await expect(client.getAccessToken()).resolves.toBe('opaque-token')
      expect(fetchMock).not.toHaveBeenCalled()

      // 90s - 60s skew = usable for 30s, then a real fetch.
      nowSpy.mockReturnValue(t0 + 31_000)
      await client.getAccessToken()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('is dropped by invalidateAccessTokenCache (no cross-session reuse)', async () => {
      const replacement = tokenExpiringIn(30 * MINUTE)
      const fetchMock = jest.fn(async () => okResponse(replacement))
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      client.seedAccessToken(tokenExpiringIn(30 * MINUTE))
      client.invalidateAccessTokenCache()

      await expect(client.getAccessToken()).resolves.toBe(replacement)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('ignores an empty seed rather than caching a falsy bearer', async () => {
      const token = tokenExpiringIn(30 * MINUTE)
      const fetchMock = jest.fn(async () => okResponse(token))
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      client.seedAccessToken('')

      await expect(client.getAccessToken()).resolves.toBe(token)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('is wiped when invalidate runs AFTER the seed (the ordering hazard)', async () => {
      // Documents why the login/signup pages must call seedAccessToken AFTER
      // setUser: setUser -> setUserAndPersist -> invalidateAccessTokenCache.
      // In this order the seed is lost and the hop comes back.
      const replacement = tokenExpiringIn(30 * MINUTE)
      const fetchMock = jest.fn(async () => okResponse(replacement))
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      client.seedAccessToken(tokenExpiringIn(30 * MINUTE))
      client.invalidateAccessTokenCache()

      await client.getAccessToken()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('dedupe and the negative cache (pre-existing guarantees)', () => {
    it('collapses concurrent callers onto a single fetch', async () => {
      // The original reason this module exists: N parallel callers must not
      // each trigger a refresh, because the refresh route ROTATES the token
      // and only the first would win.
      const token = tokenExpiringIn(30 * MINUTE)
      let release!: (r: Response) => void
      const pending = new Promise<Response>((res) => {
        release = res
      })
      const fetchMock = jest.fn(() => pending)
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      const all = Promise.all([
        client.getAccessToken(),
        client.getAccessToken(),
        client.getAccessToken(),
      ])
      release(okResponse(token))

      await expect(all).resolves.toEqual([token, token, token])
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('negative-caches "no token" for 3s instead of re-hitting the endpoint', async () => {
      const fetchMock = jest.fn(async () => errorResponse(500))
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      const nowSpy = jest.spyOn(Date, 'now')
      const t0 = Date.now()

      nowSpy.mockReturnValue(t0)
      await expect(client.getAccessToken()).resolves.toBeNull()
      nowSpy.mockReturnValue(t0 + 1_000)
      await expect(client.getAccessToken()).resolves.toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(1)

      nowSpy.mockReturnValue(t0 + 3_100)
      await client.getAccessToken()
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('emits onSessionExpired on a 401 from the normal fetch path', async () => {
      global.fetch = jest.fn(async () =>
        errorResponse(401)
      ) as unknown as typeof fetch

      const client = loadClient()
      const onExpired = jest.fn()
      client.onSessionExpired(onExpired)

      await expect(client.getAccessToken()).resolves.toBeNull()
      expect(onExpired).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleUnauthenticatedResponse', () => {
    it('drops a live cached token and re-resolves it', async () => {
      // This is the safety net that replaces the old flat 60s TTL: a session
      // revoked mid-token-lifetime must not keep being served a dead bearer.
      const stale = tokenExpiringIn(30 * MINUTE)
      const fresh = tokenExpiringIn(30 * MINUTE)
      const fetchMock = jest.fn(async () => okResponse(fresh))
      global.fetch = fetchMock as unknown as typeof fetch

      const client = loadClient()
      client.seedAccessToken(stale)
      await expect(client.getAccessToken()).resolves.toBe(stale)
      expect(fetchMock).not.toHaveBeenCalled()

      client.handleUnauthenticatedResponse()
      await Promise.resolve()
      await Promise.resolve()

      expect(fetchMock).toHaveBeenCalledTimes(1)
      await expect(client.getAccessToken()).resolves.toBe(fresh)
    })

    it('bounces the session when the re-resolve 401s', async () => {
      global.fetch = jest.fn(async () =>
        errorResponse(401)
      ) as unknown as typeof fetch

      const client = loadClient()
      const onExpired = jest.fn()
      client.onSessionExpired(onExpired)
      client.seedAccessToken(tokenExpiringIn(30 * MINUTE))

      client.handleUnauthenticatedResponse()
      await new Promise((r) => setTimeout(r, 0))

      expect(onExpired).toHaveBeenCalledTimes(1)
    })
  })

  describe('adopting the head bootstrap fetch', () => {
    it('uses the in-flight boot result instead of issuing its own request', async () => {
      const token = tokenExpiringIn(30 * MINUTE)
      const fetchMock = jest.fn()
      global.fetch = fetchMock as unknown as typeof fetch
      ;(globalThis as { window?: unknown }).window = {
        __GP_AUTH_BOOT__: Promise.resolve({ status: 200, accessToken: token }),
      }

      const client = loadClient()
      await expect(client.getAccessToken()).resolves.toBe(token)
      expect(fetchMock).not.toHaveBeenCalled()
      // Consumed exactly once — the token must not stay readable on window.
      expect(
        (globalThis.window as { __GP_AUTH_BOOT__?: unknown }).__GP_AUTH_BOOT__
      ).toBeUndefined()
    })

    it('still fires onSessionExpired when the boot fetch 401s', async () => {
      const fetchMock = jest.fn()
      global.fetch = fetchMock as unknown as typeof fetch
      ;(globalThis as { window?: unknown }).window = {
        __GP_AUTH_BOOT__: Promise.resolve({ status: 401 }),
      }

      const client = loadClient()
      const onExpired = jest.fn()
      client.onSessionExpired(onExpired)

      await expect(client.getAccessToken()).resolves.toBeNull()
      expect(onExpired).toHaveBeenCalledTimes(1)
      // A terminal 401 is not retried into a request storm.
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('falls back to a normal fetch when the boot request never completed', async () => {
      const token = tokenExpiringIn(30 * MINUTE)
      const fetchMock = jest.fn(async () => okResponse(token))
      global.fetch = fetchMock as unknown as typeof fetch
      ;(globalThis as { window?: unknown }).window = {
        __GP_AUTH_BOOT__: Promise.resolve(null),
      }

      const client = loadClient()
      await expect(client.getAccessToken()).resolves.toBe(token)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('falls through to a real fetch on a transient boot 5xx', async () => {
      // A single bad response must not start the whole first render
      // unauthenticated when a retry would have worked.
      const token = tokenExpiringIn(30 * MINUTE)
      const fetchMock = jest.fn(async () => okResponse(token))
      global.fetch = fetchMock as unknown as typeof fetch
      ;(globalThis as { window?: unknown }).window = {
        __GP_AUTH_BOOT__: Promise.resolve({ status: 503 }),
      }

      const client = loadClient()
      await expect(client.getAccessToken()).resolves.toBe(token)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('does NOT retry a boot 429 back into the rate limiter', async () => {
      const fetchMock = jest.fn()
      global.fetch = fetchMock as unknown as typeof fetch
      ;(globalThis as { window?: unknown }).window = {
        __GP_AUTH_BOOT__: Promise.resolve({ status: 429 }),
      }

      const client = loadClient()
      await expect(client.getAccessToken()).resolves.toBeNull()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('uses the boot response expiresAt for cache sizing', async () => {
      const token = tokenExpiringIn(30 * MINUTE)
      const t0 = Date.now()
      const fetchMock = jest.fn(async () =>
        okResponse(tokenExpiringIn(30 * MINUTE))
      )
      global.fetch = fetchMock as unknown as typeof fetch
      ;(globalThis as { window?: unknown }).window = {
        __GP_AUTH_BOOT__: Promise.resolve({
          status: 200,
          accessToken: token,
          expiresAt: Math.floor(t0 / 1000) + 90,
        }),
      }

      const client = loadClient()
      const nowSpy = jest.spyOn(Date, 'now')
      nowSpy.mockReturnValue(t0)
      await expect(client.getAccessToken()).resolves.toBe(token)
      expect(fetchMock).not.toHaveBeenCalled()

      // 90s server expiry - 60s skew = usable for 30s only.
      nowSpy.mockReturnValue(t0 + 31_000)
      await client.getAccessToken()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('adopts the boot exactly once — a later resolution re-fetches', async () => {
      const bootToken = tokenExpiringIn(30 * MINUTE)
      const netToken = tokenExpiringIn(30 * MINUTE)
      const fetchMock = jest.fn(async () => okResponse(netToken))
      global.fetch = fetchMock as unknown as typeof fetch
      ;(globalThis as { window?: unknown }).window = {
        __GP_AUTH_BOOT__: Promise.resolve({
          status: 200,
          accessToken: bootToken,
        }),
      }

      const client = loadClient()
      const nowSpy = jest.spyOn(Date, 'now')
      const t0 = Date.now()
      nowSpy.mockReturnValue(t0)
      await expect(client.getAccessToken()).resolves.toBe(bootToken)

      // Force a cache miss; the boot is spent, so this must hit the network.
      client.invalidateAccessTokenCache()
      await expect(client.getAccessToken()).resolves.toBe(netToken)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('authorizationHeaders', () => {
    it('attaches the bearer when a token resolves, and nothing when it does not', async () => {
      const token = tokenExpiringIn(30 * MINUTE)
      global.fetch = jest.fn(async () =>
        okResponse(token)
      ) as unknown as typeof fetch
      const client = loadClient()
      await expect(client.authorizationHeaders()).resolves.toEqual({
        Authorization: `Bearer ${token}`,
      })

      global.fetch = jest.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      })) as unknown as typeof fetch
      const anon = loadClient()
      await expect(anon.authorizationHeaders()).resolves.toEqual({})
    })
  })
})
