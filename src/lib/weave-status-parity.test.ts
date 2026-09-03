import {
  NOT_LIVE_WEAVE_STATUSES,
  WEAVE_STATUS,
  normalizeWeaveStatus,
} from './promise-weave'

/**
 * `NOT_LIVE_WEAVE_STATUSES` exists so raw Cypher can ask "is this weave live?"
 * without hand-rolling its own status vocabulary — raw Cypher cannot call
 * `normalizeWeaveStatus`. That only helps if the two actually agree, and the
 * way they drift is subtle: the dedup guard originally allow-listed
 * `['proposed','active']`, which looks equivalent but classifies an
 * UNRECOGNISED legacy value as not-live, while `normalizeWeaveStatus` — and so
 * every reader in the app — treats an unknown value as `active`.
 *
 * These pin the agreement in both directions so a future edit to either list
 * fails here rather than in a duplicate-proposal bug nobody traces back.
 */
describe('NOT_LIVE_WEAVE_STATUSES agrees with normalizeWeaveStatus', () => {
  it('lists exactly the values that normalize to dissolved', () => {
    for (const status of NOT_LIVE_WEAVE_STATUSES) {
      expect(normalizeWeaveStatus(status)).toBe(WEAVE_STATUS.DISSOLVED)
    }
  })

  it('omits every lifecycle status that means the weave is live', () => {
    for (const status of [
      WEAVE_STATUS.PROPOSED,
      WEAVE_STATUS.ACTIVE,
      WEAVE_STATUS.FULFILLED,
    ]) {
      expect(NOT_LIVE_WEAVE_STATUSES).not.toContain(status)
      expect(normalizeWeaveStatus(status)).not.toBe(WEAVE_STATUS.DISSOLVED)
    }
  })

  it('leaves an unrecognised legacy value OUT, so it reads as live in Cypher too', () => {
    // The migration carried CarePoint statuses through verbatim; a value nobody
    // anticipated must behave the same on both sides of the boundary.
    for (const unknown of ['archived', 'Pending review', 'weird-legacy-value']) {
      expect(normalizeWeaveStatus(unknown)).toBe(WEAVE_STATUS.ACTIVE)
      expect(NOT_LIVE_WEAVE_STATUSES).not.toContain(unknown.toLowerCase())
    }
  })

  it('covers the legacy `Inactive` the migration actually produced', () => {
    // Dev holds three of these. Cypher lowercases and trims before the test,
    // so the list must hold the lowercase form.
    expect(normalizeWeaveStatus('Inactive')).toBe(WEAVE_STATUS.DISSOLVED)
    expect(NOT_LIVE_WEAVE_STATUSES).toContain('inactive')
  })

  it('is all-lowercase and trimmed, matching how Cypher normalises before comparing', () => {
    for (const status of NOT_LIVE_WEAVE_STATUSES) {
      expect(status).toBe(status.trim().toLowerCase())
    }
  })

  it('treats a null/blank status as live, never as dissolved', () => {
    // A missing status is the migration default and reads as `active`. If it
    // ever landed in this list, every migrated care point would stop deduping.
    expect(normalizeWeaveStatus(null)).toBe(WEAVE_STATUS.ACTIVE)
    expect(NOT_LIVE_WEAVE_STATUSES).not.toContain('')
  })
})
