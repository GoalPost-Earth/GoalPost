/**
 * POST /api/resonance/suggestions/decline-bulk — reject a whole theme (or a
 * whole confidence band) of pending resonance suggestions in one pass.
 *
 * Pins the route's gate order and its contract, where the risk actually lives:
 *
 *   400 (no spaceId) → 400 (bad minConfidence) → 400 (no filter at all)
 *   → 401 (no JWT) → 403 (canEditContent false) → write (200)
 *
 * The Cypher's semantics are verified separately against a real database; here
 * the graph, the permission session, the auth helper and the activity-log
 * writer are all stubbed, so no Neo4j, OpenAI or LLM call is made and no
 * OPENAI_API_KEY is needed.
 *
 * Also pinned: the LangChain layer hands `count()` back as a STRING, so the
 * declined total is coerced; the audit log is written only when something was
 * actually declined; and a failing log never fails the request.
 */
import { NextRequest } from 'next/server'

const graphQuery = jest.fn()
jest.mock('@/modules/graph', () => ({
  initGraph: async () => ({
    query: (...args: unknown[]) => graphQuery(...args),
  }),
}))

jest.mock('@/app/api/auth/utils', () => ({
  resolveAuthenticatedUserId: jest.fn(),
}))

const permSessionClose = jest.fn().mockResolvedValue(undefined)
const permSession = { close: permSessionClose }
jest.mock('@/app/api/auth/neo4j', () => ({
  initializeDB: jest.fn(),
  getSession: jest.fn(() => permSession),
}))

jest.mock('@/lib/permissions/space-permissions', () => ({
  canEditContent: jest.fn(),
}))

jest.mock('@/lib/activity-logs/create-log', () => ({
  createLog: jest.fn(),
}))

import { POST } from './route'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { getSession, initializeDB } from '@/app/api/auth/neo4j'
import { canEditContent } from '@/lib/permissions/space-permissions'
import { createLog } from '@/lib/activity-logs/create-log'

const mockResolveUser = resolveAuthenticatedUserId as jest.Mock
const mockGetSession = getSession as jest.Mock
const mockInitDB = initializeDB as jest.Mock
const mockCanEdit = canEditContent as jest.Mock
const mockCreateLog = createLog as jest.Mock

const URL_ =
  'http://localhost:3000/api/resonance/suggestions/decline-bulk'
const USER_ID = 'user_member'
const SPACE_ID = 'ws_commons'
const THEME_ID = 'fr_regenerative_commons'
const GENERIC_500 = 'Failed to dismiss resonance suggestions'

function post(body?: string): NextRequest {
  return new NextRequest(URL_, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    ...(body === undefined ? {} : { body }),
  })
}

function postJson(payload: unknown): NextRequest {
  return post(JSON.stringify(payload))
}

/** Every gate open: authenticated editor, and a write that declines `n`. */
function allowEverything(declined: number | string = 3) {
  mockGetSession.mockReturnValue(permSession)
  permSessionClose.mockResolvedValue(undefined)
  mockResolveUser.mockReturnValue(USER_ID)
  mockCanEdit.mockResolvedValue(true)
  mockCreateLog.mockResolvedValue('log_1')
  graphQuery.mockResolvedValue([{ declined }])
}

/** Nothing may be declined, and nothing may be logged. */
function expectNoWrite() {
  expect(graphQuery).not.toHaveBeenCalled()
  expect(mockCreateLog).not.toHaveBeenCalled()
}

/** The single status-only write, and the params it was given. */
const writeParams = () =>
  graphQuery.mock.calls[0]?.[1] as Record<string, unknown> | undefined

describe('POST /api/resonance/suggestions/decline-bulk', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    allowEverything()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ─── request validation (400) ─────────────────────────────────────────────

  describe('when spaceId is missing (400)', () => {
    it.each([
      ['no body at all', undefined],
      ['an empty object', JSON.stringify({})],
      ['a whitespace-only body', '   '],
      ['an omitted spaceId with a valid filter', JSON.stringify({ minConfidence: 0.8 })],
      ['an empty-string spaceId', JSON.stringify({ spaceId: '', minConfidence: 0.8 })],
      [
        'a whitespace-only spaceId',
        JSON.stringify({ spaceId: '   ', fieldResonanceId: THEME_ID }),
      ],
    ])('rejects %s with 400', async (_label, body) => {
      const res = await POST(post(body))

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('spaceId is required')
      expectNoWrite()
    })

    it('answers 400 before authenticating or opening a permission session', async () => {
      mockResolveUser.mockReturnValue(null)

      const res = await POST(postJson({}))

      expect(res.status).toBe(400)
      expect(mockResolveUser).not.toHaveBeenCalled()
      expect(mockInitDB).not.toHaveBeenCalled()
      expect(mockGetSession).not.toHaveBeenCalled()
      expect(mockCanEdit).not.toHaveBeenCalled()
      expectNoWrite()
    })

    it('rejects a malformed JSON body with 400', async () => {
      const res = await POST(post('{not json'))

      expect(res.status).toBe(400)
      expect((await res.json()).error).toBe('Invalid JSON body')
      expectNoWrite()
    })
  })

  describe('when no filter at all is supplied (400)', () => {
    it('refuses to read an empty filter set as "decline the whole Space"', async () => {
      const res = await POST(postJson({ spaceId: SPACE_ID }))

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toMatch(/fieldResonanceId/)
      expect(json.error).toMatch(/minConfidence above 0/)
      expect(json.error).toMatch(/not supported here/)
      expectNoWrite()
    })

    it('treats a blank fieldResonanceId as no filter at all', async () => {
      for (const fieldResonanceId of ['', '   ']) {
        jest.clearAllMocks()
        allowEverything()

        const res = await POST(postJson({ spaceId: SPACE_ID, fieldResonanceId }))

        expect(res.status).toBe(400)
        expect((await res.json()).error).toMatch(/minConfidence above 0/)
        expectNoWrite()
      }
    })

    it('answers 400 before authenticating', async () => {
      mockResolveUser.mockReturnValue(null)

      const res = await POST(postJson({ spaceId: SPACE_ID }))

      expect(res.status).toBe(400)
      expect(mockResolveUser).not.toHaveBeenCalled()
      expectNoWrite()
    })

    it('accepts a theme alone', async () => {
      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect(res.status).toBe(200)
      expect(writeParams()).toEqual({
        spaceId: SPACE_ID,
        contextId: null,
        fieldResonanceId: THEME_ID,
        minConfidence: null,
      })
    })

    it('accepts a confidence floor alone', async () => {
      const res = await POST(postJson({ spaceId: SPACE_ID, minConfidence: 0.8 }))

      expect(res.status).toBe(200)
      expect(writeParams()).toEqual({
        spaceId: SPACE_ID,
        contextId: null,
        fieldResonanceId: null,
        minConfidence: 0.8,
      })
    })

    it('accepts both together', async () => {
      const res = await POST(
        postJson({
          spaceId: SPACE_ID,
          fieldResonanceId: `  ${THEME_ID}  `,
          minConfidence: 0.9,
        })
      )

      expect(res.status).toBe(200)
      // The theme id is trimmed before it reaches the Cypher.
      expect(writeParams()).toEqual({
        spaceId: SPACE_ID,
        contextId: null,
        fieldResonanceId: THEME_ID,
        minConfidence: 0.9,
      })
    })
  })

  describe('when minConfidence is out of range (400)', () => {
    it.each([
      ['below zero', -0.1],
      ['far below zero', -1],
      ['above one', 1.1],
      ['far above one', 42],
      ['a non-numeric string', 'high'],
      ['an object', { gte: 0.8 }],
      ['NaN-producing input', 'NaN'],
      ['Infinity as a string', 'Infinity'],
    ])('rejects %s with 400', async (_label, minConfidence) => {
      const res = await POST(postJson({ spaceId: SPACE_ID, minConfidence }))

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('minConfidence must be a number between 0 and 1')
      expectNoWrite()
    })

    it('rejects an out-of-range floor even when a valid theme is also given', async () => {
      const res = await POST(
        postJson({
          spaceId: SPACE_ID,
          fieldResonanceId: THEME_ID,
          minConfidence: 2,
        })
      )

      expect(res.status).toBe(400)
      expect((await res.json()).error).toBe(
        'minConfidence must be a number between 0 and 1'
      )
      expectNoWrite()
    })

    it('answers 400 before authenticating', async () => {
      mockResolveUser.mockReturnValue(null)

      const res = await POST(postJson({ spaceId: SPACE_ID, minConfidence: 9 }))

      expect(res.status).toBe(400)
      expect(mockResolveUser).not.toHaveBeenCalled()
      expectNoWrite()
    })

    it.each([
      ['the inclusive upper bound', 1],
      ['a mid-range floor', 0.75],
    ])('accepts %s', async (_label, minConfidence) => {
      const res = await POST(postJson({ spaceId: SPACE_ID, minConfidence }))

      expect(res.status).toBe(200)
      expect(writeParams()?.minConfidence).toBe(minConfidence)
    })

    /**
     * REGRESSION. `Number(null)` is 0 — as are `false`, `''` and `[]` — so a
     * route that coerced before type-checking read any of these as a
     * deliberate floor of 0. That satisfied the range check AND the "at least
     * one filter" gate, and then declined EVERY pending suggestion in the
     * Space: the exact action this route exists to refuse, reachable from a
     * body a client sends by accident when an unset field serialises as null.
     *
     * The value must now BE a number, not merely coerce to one.
     */
    it.each([
      ['null', null],
      ['false', false],
      ['an empty string', ''],
      ['an empty array', []],
      ['a numeric string', '0.85'],
    ])(
      'rejects %s as minConfidence rather than coercing it to a floor',
      async (_label, minConfidence) => {
        const res = await POST(postJson({ spaceId: SPACE_ID, minConfidence }))

        expect(res.status).toBe(400)
        expect((await res.json()).error).toMatch(/minConfidence/i)
        expectNoWrite()
      }
    )

    /**
     * A floor of 0 is not a filter: on its own it selects everything pending,
     * so it is a whole-Space decline through the front door. It stays valid
     * BESIDE a theme, which is how "every pair under this theme regardless of
     * score" is expressed.
     */
    it('rejects minConfidence 0 on its own as a whole-Space decline', async () => {
      const res = await POST(postJson({ spaceId: SPACE_ID, minConfidence: 0 }))

      expect(res.status).toBe(400)
      expectNoWrite()
    })

    it('accepts minConfidence 0 when a theme narrows it', async () => {
      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID, minConfidence: 0 })
      )

      expect(res.status).toBe(200)
      expect(writeParams()).toEqual({
        spaceId: SPACE_ID,
        contextId: null,
        fieldResonanceId: THEME_ID,
        minConfidence: 0,
      })
    })

    it('rejects a literal JSON null body with 400 rather than 500', async () => {
      const res = await POST(postJson(null))

      expect(res.status).toBe(400)
      expectNoWrite()
    })
  })

  // ─── authentication + Space authorization ─────────────────────────────────

  describe('when the caller is not authenticated (401)', () => {
    it('returns 401 and never checks permissions or writes', async () => {
      mockResolveUser.mockReturnValue(null)

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ success: false, error: 'Unauthorized' })
      expect(mockInitDB).not.toHaveBeenCalled()
      expect(mockGetSession).not.toHaveBeenCalled()
      expect(mockCanEdit).not.toHaveBeenCalled()
      expectNoWrite()
    })
  })

  describe('Space-based authorization (403)', () => {
    it('checks canEditContent for the JWT user on the body’s Space', async () => {
      await POST(postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID }))

      expect(mockCanEdit).toHaveBeenCalledTimes(1)
      expect(mockCanEdit).toHaveBeenCalledWith(permSession, USER_ID, SPACE_ID)
    })

    it('403s a caller without edit rights (a GUEST or a non-member) and writes nothing', async () => {
      mockCanEdit.mockResolvedValue(false)

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect(res.status).toBe(403)
      expect(await res.json()).toEqual({ success: false, error: 'Forbidden' })
      expect(permSessionClose).toHaveBeenCalledTimes(1)
      expectNoWrite()
    })

    it('ignores any actor id smuggled in the body', async () => {
      await POST(
        postJson({
          spaceId: SPACE_ID,
          fieldResonanceId: THEME_ID,
          userId: 'user_spoofed',
          actorId: 'user_spoofed',
        })
      )

      expect(mockCanEdit).toHaveBeenCalledWith(permSession, USER_ID, SPACE_ID)
      expect(mockCreateLog.mock.calls[0][0].userId).toBe(USER_ID)
    })

    it('closes the permission session before the write, on the happy path too', async () => {
      await POST(postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID }))

      expect(permSessionClose).toHaveBeenCalledTimes(1)
      expect(permSessionClose.mock.invocationCallOrder[0]).toBeLessThan(
        graphQuery.mock.invocationCallOrder[0]
      )
    })

    it('500s — without writing — when the permission check itself fails, and still closes its session', async () => {
      mockCanEdit.mockRejectedValue(new Error('neo4j unavailable'))

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe(GENERIC_500)
      expect(permSessionClose).toHaveBeenCalledTimes(1)
      expectNoWrite()
    })
  })

  // ─── the decline itself ───────────────────────────────────────────────────

  describe('when the decline succeeds (200)', () => {
    it('returns the declined count and echoes the filter it applied', async () => {
      allowEverything(7)

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json).toMatchObject({
        success: true,
        declined: 7,
        fieldResonanceId: THEME_ID,
        minConfidence: null,
      })
      expect(typeof json.timestamp).toBe('string')
    })

    it('coerces a count handed back as a STRING by the LangChain layer', async () => {
      allowEverything('31')

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      const json = await res.json()
      expect(json.declined).toBe(31)
      expect(typeof json.declined).toBe('number')
    })

    it('reports 0 when the query returns no row at all', async () => {
      graphQuery.mockResolvedValue([])

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect(res.status).toBe(200)
      expect((await res.json()).declined).toBe(0)
    })

    it('reports 0 rather than NaN when the count is unreadable', async () => {
      graphQuery.mockResolvedValue([{ declined: 'not-a-number' }])

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect((await res.json()).declined).toBe(0)
    })

    it('issues exactly one status-only write', async () => {
      await POST(postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID }))

      expect(graphQuery).toHaveBeenCalledTimes(1)
      const cypher = graphQuery.mock.calls[0][0] as string
      // Declining only flips status: nothing is deleted and no link is made.
      expect(cypher).toContain("SET sug.status = 'declined'")
      // Comments stripped first: a relationship NAME containing DELETE
      // (HAS_DELETED_CONTEXT, which the soft-delete guard references) is not a
      // DELETE clause, and matching raw text would fail on prose.
      const clauses = cypher.replace(/\/\/[^\n]*/g, '')
      expect(clauses).not.toMatch(/\bDETACH\s+DELETE\b|\bDELETE\s+\w/i)
      expect(clauses).not.toMatch(/MERGE \(.*ResonanceLink/i)
      // Scoped to the Space's own pending queue.
      expect(cypher).toContain('$spaceId')
      expect(cypher).toContain("status: 'pending'")
    })
  })

  // ─── activity log ─────────────────────────────────────────────────────────

  describe('activity logging', () => {
    it('writes one Space-level log attributing the decline to the JWT user', async () => {
      allowEverything(4)

      await POST(postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID }))

      expect(mockCreateLog).toHaveBeenCalledTimes(1)
      const input = mockCreateLog.mock.calls[0][0]
      expect(input.userId).toBe(USER_ID)
      expect(input.metadata).toEqual({
        event: 'resonance_bulk_declined',
        spaceId: SPACE_ID,
        fieldResonanceId: THEME_ID,
        minConfidence: null,
        declined: 4,
      })
      // Declining touches no pulse, so the log anchors to none.
      expect(input.pulseIds).toBeUndefined()
    })

    it('names the theme in the description when one was given', async () => {
      allowEverything(4)

      await POST(postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID }))

      expect(mockCreateLog.mock.calls[0][0].description).toBe(
        'Dismissed 4 resonance suggestions under one theme'
      )
    })

    it('omits the theme phrasing for a confidence-only decline', async () => {
      allowEverything(4)

      await POST(postJson({ spaceId: SPACE_ID, minConfidence: 0.8 }))

      expect(mockCreateLog.mock.calls[0][0].description).toBe(
        'Dismissed 4 resonance suggestions'
      )
    })

    it('says "suggestion" in the singular when exactly one was declined', async () => {
      allowEverything(1)

      await POST(postJson({ spaceId: SPACE_ID, minConfidence: 0.8 }))

      expect(mockCreateLog.mock.calls[0][0].description).toBe(
        'Dismissed 1 resonance suggestion'
      )
    })

    it('logs nothing when the filter matched nothing', async () => {
      allowEverything(0)

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect(res.status).toBe(200)
      expect((await res.json()).declined).toBe(0)
      expect(mockCreateLog).not.toHaveBeenCalled()
    })

    it('logs nothing when a string "0" comes back from the graph', async () => {
      allowEverything('0')

      await POST(postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID }))

      expect(mockCreateLog).not.toHaveBeenCalled()
    })

    it('still returns 200 with the real count when the log write fails', async () => {
      allowEverything(5)
      mockCreateLog.mockRejectedValue(new Error('log write conflict'))

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.declined).toBe(5)
      expect(console.warn).toHaveBeenCalledWith(
        '[Resonance Bulk Decline] activity log failed:',
        expect.any(Error)
      )
    })
  })

  // ─── failure ──────────────────────────────────────────────────────────────

  describe('when the write fails (500)', () => {
    it('answers a generic 500 without leaking the driver’s error text', async () => {
      graphQuery.mockRejectedValue(
        new Error('Neo.ClientError at neo4j+s://secret-host: MATCH (space:Space')
      )

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect(res.status).toBe(500)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe(GENERIC_500)
      expect(JSON.stringify(json)).not.toContain('secret-host')
      expect(JSON.stringify(json)).not.toContain('MATCH')
      expect(mockCreateLog).not.toHaveBeenCalled()
    })

    it('uses the same generic message for a non-Error rejection', async () => {
      graphQuery.mockRejectedValue('boom')

      const res = await POST(
        postJson({ spaceId: SPACE_ID, fieldResonanceId: THEME_ID })
      )

      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe(GENERIC_500)
    })
  })
})
