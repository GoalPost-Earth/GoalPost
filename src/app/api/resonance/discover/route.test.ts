/**
 * GOAL-368 — POST /api/resonance/discover, the manual field-initiated
 * resonance discovery sweep.
 *
 * Pins the route's gate order and its contract with the manual-sweep helpers:
 *
 *   400 (no / bad fieldContextId)  →  401 (no JWT)  →  scope + canEditContent
 *   (403, same body for unknown field and non-editor)  →  Space + member claim
 *   (null → 403, refused → 429 + Retry-After + reason)  →  sweep (200)
 *
 * and that `finishManualResonanceSweep(spaceId, userId, { failed })` always
 * runs once a claim is held — `failed: true` when the sweep throws (500 with a
 * generic message that never leaks the thrown text). The sweep helpers are
 * stubbed — their own
 * behavior is covered by src/lib/resonance/discovery/manual-sweep.test.ts —
 * so no Neo4j or OpenAI call is made.
 */
import { NextRequest } from 'next/server'

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

const MANUAL_SWEEP_BUDGET_MS = 240_000
const MANUAL_SWEEP_COOLDOWN_SECONDS = 600
jest.mock('@/lib/resonance/discovery/manual-sweep', () => ({
  MANUAL_SWEEP_BUDGET_MS: 240_000,
  MANUAL_SWEEP_COOLDOWN_SECONDS: 600,
  claimManualResonanceSweep: jest.fn(),
  finishManualResonanceSweep: jest.fn(),
  resolveFieldSweepScope: jest.fn(),
  runManualResonanceSweep: jest.fn(),
}))

import { POST, maxDuration } from './route'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { getSession } from '@/app/api/auth/neo4j'
import { canEditContent } from '@/lib/permissions/space-permissions'
import {
  claimManualResonanceSweep,
  finishManualResonanceSweep,
  resolveFieldSweepScope,
  runManualResonanceSweep,
} from '@/lib/resonance/discovery/manual-sweep'

const mockResolveUser = resolveAuthenticatedUserId as jest.Mock
const mockGetSession = getSession as jest.Mock
const mockCanEdit = canEditContent as jest.Mock
const mockResolveScope = resolveFieldSweepScope as jest.Mock
const mockClaim = claimManualResonanceSweep as jest.Mock
const mockFinish = finishManualResonanceSweep as jest.Mock
const mockRun = runManualResonanceSweep as jest.Mock

const URL_ = 'http://localhost:3000/api/resonance/discover'
const USER_ID = 'user_member'
const FIELD_ID = 'ctx_sub_field'
const SCOPE = { spaceId: 'ws_commons', rootContextId: 'ctx_root_field' }
const NOW = 1_780_000_000_000
const GENERIC_500 = 'Resonance discovery failed.'

const SWEEP_RESULT = {
  embeddedCount: 3,
  suggestionsCreated: 4,
  crossFieldSuggestionsCreated: 2,
  completed: true,
}

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

/** Every gate open: authenticated editor, live field, fresh claim. */
function allowEverything() {
  mockGetSession.mockReturnValue(permSession)
  permSessionClose.mockResolvedValue(undefined)
  mockResolveUser.mockReturnValue(USER_ID)
  mockResolveScope.mockResolvedValue(SCOPE)
  mockCanEdit.mockResolvedValue(true)
  mockClaim.mockResolvedValue({ claimed: true })
  mockRun.mockResolvedValue(SWEEP_RESULT)
  mockFinish.mockResolvedValue(undefined)
}

function expectNoSweepWork() {
  expect(mockClaim).not.toHaveBeenCalled()
  expect(mockRun).not.toHaveBeenCalled()
  expect(mockFinish).not.toHaveBeenCalled()
}

describe('POST /api/resonance/discover (GOAL-368)', () => {
  let nowSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW)
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    allowEverything()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('keeps the route inside the 300s plan ceiling the cooldown is sized against', () => {
    expect(maxDuration).toBe(300)
  })

  describe('when fieldContextId is missing or malformed (400)', () => {
    it.each([
      ['an empty object', JSON.stringify({})],
      ['a numeric fieldContextId', JSON.stringify({ fieldContextId: 42 })],
      ['an empty-string fieldContextId', JSON.stringify({ fieldContextId: '' })],
      ['an array fieldContextId', JSON.stringify({ fieldContextId: ['ctx_a'] })],
      ['a null fieldContextId', JSON.stringify({ fieldContextId: null })],
      ['a JSON null body', 'null'],
      ['invalid JSON', '{not json'],
      ['a whitespace-only body', '   '],
    ])('rejects %s with 400', async (_label, body) => {
      const res = await POST(post(body))

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toMatch(/fieldContextId is required/)
      // Global discovery stays cron-only — the message says so.
      expect(json.error).toMatch(/scheduled job/)
    })

    it('rejects a request with no body at all', async () => {
      const res = await POST(post())
      expect(res.status).toBe(400)
    })

    it('answers 400 before checking authentication', async () => {
      mockResolveUser.mockReturnValue(null)

      const res = await POST(postJson({}))

      expect(res.status).toBe(400)
      expect(mockResolveUser).not.toHaveBeenCalled()
      expect(mockResolveScope).not.toHaveBeenCalled()
      expectNoSweepWork()
    })
  })

  describe('when the caller is not authenticated (401)', () => {
    it('returns 401 and never resolves scope, checks permissions, claims, or sweeps', async () => {
      mockResolveUser.mockReturnValue(null)

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ success: false, error: 'Unauthorized' })
      expect(mockResolveScope).not.toHaveBeenCalled()
      expect(mockCanEdit).not.toHaveBeenCalled()
      expect(mockGetSession).not.toHaveBeenCalled()
      expectNoSweepWork()
    })
  })

  describe('Space-based authorization (403)', () => {
    it('resolves the sweep scope from the triggering field', async () => {
      await POST(postJson({ fieldContextId: FIELD_ID }))
      expect(mockResolveScope).toHaveBeenCalledWith(FIELD_ID)
    })

    it('checks canEditContent for the authenticated user on the field’s Space', async () => {
      await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(mockCanEdit).toHaveBeenCalledTimes(1)
      expect(mockCanEdit).toHaveBeenCalledWith(permSession, USER_ID, SCOPE.spaceId)
    })

    it('403s an unknown or deleted field without consulting canEditContent', async () => {
      mockResolveScope.mockResolvedValue(null)

      const res = await POST(postJson({ fieldContextId: 'ctx_missing' }))

      expect(res.status).toBe(403)
      expect(await res.json()).toEqual({ success: false, error: 'Forbidden' })
      expect(mockCanEdit).not.toHaveBeenCalled()
      expect(permSessionClose).toHaveBeenCalledTimes(1)
      expectNoSweepWork()
    })

    it('403s a caller without edit rights (e.g. a GUEST or a non-member)', async () => {
      mockCanEdit.mockResolvedValue(false)

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(403)
      expect(await res.json()).toEqual({ success: false, error: 'Forbidden' })
      expect(permSessionClose).toHaveBeenCalledTimes(1)
      expectNoSweepWork()
    })

    it('answers an unknown field and a forbidden field with an identical body', async () => {
      mockResolveScope.mockResolvedValueOnce(null)
      const unknown = await POST(postJson({ fieldContextId: 'ctx_missing' }))

      mockResolveScope.mockResolvedValueOnce(SCOPE)
      mockCanEdit.mockResolvedValueOnce(false)
      const forbidden = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(unknown.status).toBe(forbidden.status)
      expect(await unknown.json()).toEqual(await forbidden.json())
    })

    it('does not attempt the cooldown claim until the permission check has passed', async () => {
      await POST(postJson({ fieldContextId: FIELD_ID }))

      const canEditOrder = mockCanEdit.mock.invocationCallOrder[0]
      const sessionCloseOrder = permSessionClose.mock.invocationCallOrder[0]
      const claimOrder = mockClaim.mock.invocationCallOrder[0]
      expect(canEditOrder).toBeLessThan(claimOrder)
      // The permission session is released before the sweep starts.
      expect(sessionCloseOrder).toBeLessThan(claimOrder)
    })

    it('500s — without claiming — when the permission check itself fails, and still closes its session', async () => {
      mockCanEdit.mockRejectedValue(new Error('neo4j unavailable'))

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe(GENERIC_500)
      expect(permSessionClose).toHaveBeenCalledTimes(1)
      expectNoSweepWork()
    })

    it('500s without claiming when scope resolution throws, without leaking the error text', async () => {
      mockResolveScope.mockRejectedValue(new Error('graph down at neo4j+s://secret-host'))

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(500)
      const json = await res.json()
      expect(json.error).toBe(GENERIC_500)
      expect(JSON.stringify(json)).not.toContain('secret-host')
      expectNoSweepWork()
    })

    it('403s when the Space vanished before the claim (claim returns null)', async () => {
      mockClaim.mockResolvedValue(null)

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(403)
      expect(await res.json()).toEqual({ success: false, error: 'Forbidden' })
      expect(mockClaim).toHaveBeenCalledWith(SCOPE.spaceId, USER_ID)
      expect(mockRun).not.toHaveBeenCalled()
      expect(mockFinish).not.toHaveBeenCalled()
    })
  })

  describe('when a manual sweep is refused by a cooldown (429)', () => {
    it.each([
      ['space_running', 570, 'Resonance discovery is already running for this space.'],
      ['space_cooldown', 1, 'Resonance discovery ran recently for this space.'],
      [
        'user_running',
        240,
        'You already have resonance discovery running in another space.',
      ],
    ])(
      'answers reason=%s with Retry-After=%s and the matching message',
      async (reason, retryAfterSeconds, message) => {
        mockClaim.mockResolvedValue({ claimed: false, reason, retryAfterSeconds })

        const res = await POST(postJson({ fieldContextId: FIELD_ID }))

        expect(res.status).toBe(429)
        expect(res.headers.get('Retry-After')).toBe(String(retryAfterSeconds))
        // Exact shape — the old `running` boolean is gone.
        expect(await res.json()).toEqual({
          success: false,
          error: message,
          reason,
          retryAfterSeconds,
        })
        expect(mockRun).not.toHaveBeenCalled()
        // Not our claim — we must not mark a peer's sweep finished.
        expect(mockFinish).not.toHaveBeenCalled()
      }
    )
  })

  describe('when the claim is granted', () => {
    it('runs the sweep with the Space scope, the triggering field, and the request deadline', async () => {
      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(200)
      expect(mockRun).toHaveBeenCalledTimes(1)
      expect(mockRun).toHaveBeenCalledWith({
        spaceId: SCOPE.spaceId,
        rootContextId: SCOPE.rootContextId,
        triggerContextId: FIELD_ID,
        actorUserId: USER_ID,
        deadline: NOW + MANUAL_SWEEP_BUDGET_MS,
      })
    })

    it('measures the deadline from the start of the request, not from the claim', async () => {
      // Time passes during scope resolution + permission check.
      mockResolveScope.mockImplementation(async () => {
        nowSpy.mockReturnValue(NOW + 5_000)
        return SCOPE
      })

      await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(mockRun.mock.calls[0][0].deadline).toBe(NOW + MANUAL_SWEEP_BUDGET_MS)
    })

    it('returns 200 with the sweep result and the cooldown length', async () => {
      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      const json = await res.json()
      expect(json).toMatchObject({
        success: true,
        ...SWEEP_RESULT,
        cooldownSeconds: MANUAL_SWEEP_COOLDOWN_SECONDS,
      })
      expect(typeof json.timestamp).toBe('string')
    })

    it('claims the Space and the calling member together', async () => {
      await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(mockClaim).toHaveBeenCalledTimes(1)
      expect(mockClaim).toHaveBeenCalledWith(SCOPE.spaceId, USER_ID)
    })

    it('marks the sweep finished (not failed) for the Space and member after it completes', async () => {
      await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(mockFinish).toHaveBeenCalledTimes(1)
      expect(mockFinish).toHaveBeenCalledWith(SCOPE.spaceId, USER_ID, {
        failed: false,
      })
      expect(mockRun.mock.invocationCallOrder[0]).toBeLessThan(
        mockFinish.mock.invocationCallOrder[0]
      )
    })

    it('treats a budget-truncated sweep (completed=false) as finished, not failed', async () => {
      mockRun.mockResolvedValue({ ...SWEEP_RESULT, completed: false })

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(200)
      expect((await res.json()).completed).toBe(false)
      expect(mockFinish).toHaveBeenCalledWith(SCOPE.spaceId, USER_ID, {
        failed: false,
      })
    })

    it('attributes the sweep to the JWT user, ignoring any user id in the body', async () => {
      await POST(
        postJson({
          fieldContextId: FIELD_ID,
          userId: 'user_spoofed',
          actorUserId: 'user_spoofed',
          spaceId: 'ws_other',
        })
      )

      expect(mockCanEdit).toHaveBeenCalledWith(permSession, USER_ID, SCOPE.spaceId)
      expect(mockClaim).toHaveBeenCalledWith(SCOPE.spaceId, USER_ID)
      expect(mockRun.mock.calls[0][0]).toMatchObject({
        spaceId: SCOPE.spaceId,
        actorUserId: USER_ID,
      })
      expect(mockFinish).toHaveBeenCalledWith(SCOPE.spaceId, USER_ID, {
        failed: false,
      })
    })

    it('still returns 200 when marking the sweep finished fails', async () => {
      mockFinish.mockRejectedValue(new Error('write conflict'))

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(200)
      expect((await res.json()).success).toBe(true)
      expect(mockFinish).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the sweep throws (500)', () => {
    it('marks the sweep FAILED for the Space and member, and answers a generic 500', async () => {
      mockRun.mockRejectedValue(
        new Error('OpenAI 429: quota exceeded for org-abc123')
      )

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(500)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe(GENERIC_500)
      // Upstream error text is not for members' eyes.
      expect(JSON.stringify(json)).not.toContain('org-abc123')
      expect(mockFinish).toHaveBeenCalledTimes(1)
      expect(mockFinish).toHaveBeenCalledWith(SCOPE.spaceId, USER_ID, {
        failed: true,
      })
    })

    it('uses the same generic message for a non-Error rejection', async () => {
      mockRun.mockRejectedValue('boom')

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe(GENERIC_500)
      expect(mockFinish).toHaveBeenCalledWith(SCOPE.spaceId, USER_ID, {
        failed: true,
      })
    })

    it('still answers the generic 500 when marking the failed sweep finished also fails', async () => {
      mockRun.mockRejectedValue(new Error('sweep failed'))
      mockFinish.mockRejectedValue(new Error('finish failed'))

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(500)
      const json = await res.json()
      expect(json.error).toBe(GENERIC_500)
      expect(JSON.stringify(json)).not.toMatch(/sweep failed|finish failed/)
      expect(mockFinish).toHaveBeenCalledWith(SCOPE.spaceId, USER_ID, {
        failed: true,
      })
    })

    it('does not mark anything finished when the claim itself throws', async () => {
      mockClaim.mockRejectedValue(new Error('lock timeout'))

      const res = await POST(postJson({ fieldContextId: FIELD_ID }))

      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe(GENERIC_500)
      expect(mockRun).not.toHaveBeenCalled()
      expect(mockFinish).not.toHaveBeenCalled()
    })
  })
})
