/**
 * GOAL-323 integration tests — logout ends the caller's session, and only
 * the caller's session.
 *
 * Drives the REAL route handler (`POST` from ./route) with real
 * `NextRequest`s against a live Neo4j from .env.local, in the same style as
 * src/lib/auth/token-hash.integration.test.ts. The route handler is the
 * subject on purpose: the security property this story fixes lives in the
 * auth gate, not in the Cypher, so a test that only replayed the SET clause
 * would pass even if the gate were deleted.
 *
 * The two properties worth locking down forever:
 *   1. A caller who can prove they hold a session gets it ended — cookies
 *      expired with attributes matching login, `refreshTokenRevoked` set.
 *   2. Nobody can end SOMEONE ELSE'S session. The route previously took an
 *      `email` from the request body, which made forced logout of any user
 *      a one-line unauthenticated request.
 *
 * Fixtures are namespaced under PREFIX and torn down in afterAll.
 */

import { Session } from 'neo4j-driver'
import { NextRequest } from 'next/server'
import { POST as logout } from './route'
import { hashPassword, signJWT } from '../utils'
// Share the app's driver singleton rather than opening a second pool: the
// route under test already uses it, and closing it in afterAll is what stops
// this suite from leaving an open handle that hangs the whole `npm test` run.
import { driver, closeDriver } from '@/lib/neo4j/driver'

const PREFIX = 'goal323_test_'

function uniqueId(suffix: string): string {
  return `${PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${suffix}`
}

describe('GOAL-323: POST /api/auth/logout', () => {
  let session: Session

  beforeAll(() => {
    if (!process.env.NEO4J_URI || !process.env.NEO4J_PASSWORD) {
      throw new Error(
        'Neo4j env vars missing — set NEO4J_URI / NEO4J_PASSWORD in .env.local'
      )
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET missing — set it in .env.local')
    }

    session = driver.session()
  })

  afterAll(async () => {
    try {
      await session.run(
        `MATCH (p:Person) WHERE p.id STARTS WITH $prefix DETACH DELETE p`,
        { prefix: PREFIX }
      )
    } finally {
      await session.close()
      await closeDriver()
    }
  })

  /**
   * Create a Person holding a live session: a bcrypt-hashed refresh token
   * (mirroring what login/route.ts persists) plus the raw token the browser
   * would be carrying in its cookie.
   */
  async function createLoggedInPerson(suffix: string): Promise<{
    id: string
    email: string
    rawRefreshToken: string
    accessToken: string
  }> {
    const id = uniqueId(suffix)
    const email = `${id}@example.test`
    // Compound `${userId}.${secret}` — the format login issues and the
    // refresh path parses. The id itself must stay dot-free.
    const rawRefreshToken = `${id}.${crypto.randomUUID()}`

    await session.run(
      `CREATE (p:Person {
         id: $id,
         email: $email,
         createdAt: datetime(),
         refreshToken: $refreshToken,
         refreshTokenExp: $refreshTokenExp,
         refreshTokenRevoked: false
       })`,
      {
        id,
        email,
        refreshToken: await hashPassword(rawRefreshToken),
        refreshTokenExp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      }
    )

    const accessToken = signJWT({
      user: { id, email },
      expiresAt: Math.floor(Date.now() / 1000) + 60 * 30,
    })

    return { id, email, rawRefreshToken, accessToken }
  }

  async function readSession(id: string) {
    const r = await session.run(
      `MATCH (p:Person {id: $id})
       RETURN p.refreshTokenRevoked AS revoked, p.refreshToken AS token`,
      { id }
    )
    return r.records[0].toObject() as {
      revoked: boolean | null
      token: string | null
    }
  }

  /** Build a request the way a browser would — cookies, optional JSON body. */
  function logoutRequest(opts: {
    cookies?: Record<string, string>
    body?: unknown
    bearer?: string
  }): NextRequest {
    const headers: Record<string, string> = {}
    const jar = Object.entries(opts.cookies ?? {})
    if (jar.length) {
      headers.cookie = jar.map(([k, v]) => `${k}=${v}`).join('; ')
    }
    if (opts.bearer) headers.authorization = `Bearer ${opts.bearer}`
    if (opts.body !== undefined) headers['content-type'] = 'application/json'

    return new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers,
      ...(opts.body !== undefined
        ? { body: JSON.stringify(opts.body) }
        : {}),
    })
  }

  describe('ends the caller’s own session', () => {
    it('expires both cookies and revokes the refresh token for a JWT-authenticated caller', async () => {
      const user = await createLoggedInPerson('actor1')

      const res = await logout(
        logoutRequest({
          cookies: {
            accessToken: user.accessToken,
            refreshToken: user.rawRefreshToken,
          },
        })
      )

      expect(res.status).toBe(200)

      // Cookie attributes must match the ones login set, or the browser
      // silently keeps the original cookie instead of replacing it.
      for (const name of ['accessToken', 'refreshToken'] as const) {
        const cookie = res.cookies.get(name)
        expect(cookie).toBeDefined()
        expect(cookie?.value).toBe('')
        expect(cookie?.maxAge).toBe(0)
        expect(cookie?.path).toBe('/')
        expect(cookie?.httpOnly).toBe(true)
        expect(cookie?.sameSite).toBe('lax')
      }

      const after = await readSession(user.id)
      expect(after.revoked).toBe(true)
      expect(after.token).toBeNull()
    })

    it('accepts the Bearer transport as well as the cookie', async () => {
      const user = await createLoggedInPerson('actor2')

      const res = await logout(logoutRequest({ bearer: user.accessToken }))

      expect(res.status).toBe(200)
      expect((await readSession(user.id)).revoked).toBe(true)
    })

    it('still revokes when the access token has lapsed and only the refresh cookie remains', async () => {
      // The case that matters most on a shared device: the 30-minute access
      // token expires long before the 30-day refresh token. Refusing to
      // revoke here would leave the long-lived credential alive.
      const user = await createLoggedInPerson('actor3')

      const res = await logout(
        logoutRequest({ cookies: { refreshToken: user.rawRefreshToken } })
      )

      expect(res.status).toBe(200)
      expect((await readSession(user.id)).revoked).toBe(true)
    })
  })

  describe('cannot end anyone else’s session', () => {
    it('ignores an email in the request body from an unauthenticated caller', async () => {
      // The pre-fix route revoked by body email with no authentication at
      // all — a one-request forced logout of any user, by address.
      const victim = await createLoggedInPerson('victim1')

      const res = await logout(logoutRequest({ body: { email: victim.email } }))

      // Cookie-clearing is unconditional (it only ever affects the calling
      // browser), so a 200 is expected — but nothing may be revoked.
      expect(res.status).toBe(200)
      const after = await readSession(victim.id)
      expect(after.revoked).toBe(false)
      expect(after.token).not.toBeNull()
    })

    it('revokes only the JWT holder when the body names a different user', async () => {
      const actor = await createLoggedInPerson('actor4')
      const victim = await createLoggedInPerson('victim2')

      const res = await logout(
        logoutRequest({
          cookies: { accessToken: actor.accessToken },
          body: { email: victim.email, userId: victim.id },
        })
      )

      expect(res.status).toBe(200)
      expect((await readSession(actor.id)).revoked).toBe(true)
      expect((await readSession(victim.id)).revoked).toBe(false)
    })

    it('rejects a forged refresh cookie carrying a real user id', async () => {
      // The `${userId}.${secret}` prefix is only a routing hint for an
      // indexed lookup — possession is proved by the bcrypt comparison.
      // A forged prefix must identify nobody.
      const victim = await createLoggedInPerson('victim3')

      const res = await logout(
        logoutRequest({
          cookies: { refreshToken: `${victim.id}.not-the-real-secret` },
        })
      )

      expect(res.status).toBe(200)
      expect((await readSession(victim.id)).revoked).toBe(false)
    })

    it('rejects an access token signed with the wrong secret', async () => {
      const victim = await createLoggedInPerson('victim4')

      // Same payload shape, different signing key — verifyJWT must reject it
      // rather than trusting the decoded `user.id`.
      const jwt = await import('jsonwebtoken')
      const forged = jwt.default.sign(
        { user: { id: victim.id, email: victim.email } },
        'not-the-real-jwt-secret',
        { algorithm: 'HS256', expiresIn: '30m' }
      )

      const res = await logout(logoutRequest({ cookies: { accessToken: forged } }))

      expect(res.status).toBe(200)
      expect((await readSession(victim.id)).revoked).toBe(false)
    })
  })

  describe('idempotence', () => {
    it('is safe to call twice — the second call finds nothing to revoke', async () => {
      const user = await createLoggedInPerson('actor5')

      const first = await logout(
        logoutRequest({ cookies: { accessToken: user.accessToken } })
      )
      expect(first.status).toBe(200)

      // The browser no longer has cookies, but a retry (or a second tab)
      // must not error.
      const second = await logout(
        logoutRequest({ cookies: { accessToken: user.accessToken } })
      )
      expect(second.status).toBe(200)
      expect((await readSession(user.id)).revoked).toBe(true)
    })
  })
})
