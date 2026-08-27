import {
  WEAVE_STATUS,
  getWeaveOriginLabel,
  getWeaveStatusLabel,
  isAwaitingReview,
  normalizeWeaveStatus,
} from './promise-weave'

// The migration copied the legacy CarePoint status verbatim, casing and all.
// Dev's 9 starting-point weaves hold exactly these three spellings — these
// tests pin the real values, not hypothetical ones.
const LEGACY_VALUES = ['Active', 'Inactive', 'active'] as const

describe('normalizeWeaveStatus', () => {
  it('passes canonical lifecycle values through', () => {
    expect(normalizeWeaveStatus('proposed')).toBe(WEAVE_STATUS.PROPOSED)
    expect(normalizeWeaveStatus('active')).toBe(WEAVE_STATUS.ACTIVE)
    expect(normalizeWeaveStatus('fulfilled')).toBe(WEAVE_STATUS.FULFILLED)
    expect(normalizeWeaveStatus('dissolved')).toBe(WEAVE_STATUS.DISSOLVED)
  })

  it('compares case-insensitively and ignores surrounding whitespace', () => {
    expect(normalizeWeaveStatus('Active')).toBe(WEAVE_STATUS.ACTIVE)
    expect(normalizeWeaveStatus('  PROPOSED  ')).toBe(WEAVE_STATUS.PROPOSED)
  })

  it('classifies the legacy "Inactive" value as dissolved', () => {
    expect(normalizeWeaveStatus('Inactive')).toBe(WEAVE_STATUS.DISSOLVED)
    expect(normalizeWeaveStatus('inactive')).toBe(WEAVE_STATUS.DISSOLVED)
  })

  // Getting this backwards would park every migrated care point behind a
  // confirmation gate it never had.
  it('reads a missing status as active, never as proposed', () => {
    expect(normalizeWeaveStatus(null)).toBe(WEAVE_STATUS.ACTIVE)
    expect(normalizeWeaveStatus(undefined)).toBe(WEAVE_STATUS.ACTIVE)
    expect(normalizeWeaveStatus('')).toBe(WEAVE_STATUS.ACTIVE)
    expect(normalizeWeaveStatus('   ')).toBe(WEAVE_STATUS.ACTIVE)
  })

  it('classifies an unrecognised value as active rather than gating it', () => {
    expect(normalizeWeaveStatus('archived')).toBe(WEAVE_STATUS.ACTIVE)
  })
})

describe('isAwaitingReview', () => {
  it('is true only for proposed', () => {
    expect(isAwaitingReview('proposed')).toBe(true)
    expect(isAwaitingReview('Proposed')).toBe(true)
  })

  it('is false for every value the migration left behind', () => {
    for (const value of LEGACY_VALUES) {
      expect(isAwaitingReview(value)).toBe(false)
    }
    expect(isAwaitingReview(null)).toBe(false)
    expect(isAwaitingReview(undefined)).toBe(false)
  })
})

describe('getWeaveStatusLabel', () => {
  it('labels canonical lifecycle values', () => {
    expect(getWeaveStatusLabel('proposed')).toBe('Proposed')
    expect(getWeaveStatusLabel('active')).toBe('Active')
    expect(getWeaveStatusLabel('fulfilled')).toBe('Fulfilled')
    expect(getWeaveStatusLabel('dissolved')).toBe('Dissolved')
  })

  it('never shows the raw lowercase value', () => {
    expect(getWeaveStatusLabel('active')).not.toBe('active')
  })

  // The badge must not claim a migrated weave is Active when it is not.
  it('surfaces a legacy value verbatim instead of renaming it', () => {
    expect(getWeaveStatusLabel('Inactive')).toBe('Inactive')
    expect(getWeaveStatusLabel('inactive')).toBe('Inactive')
    expect(getWeaveStatusLabel('archived')).toBe('Archived')
  })

  it('falls back to Active only when there is no status at all', () => {
    expect(getWeaveStatusLabel(null)).toBe('Active')
    expect(getWeaveStatusLabel('')).toBe('Active')
  })

  it('matches the real dev spread', () => {
    expect(LEGACY_VALUES.map(getWeaveStatusLabel)).toEqual([
      'Active',
      'Inactive',
      'Active',
    ])
  })
})

describe('getWeaveOriginLabel', () => {
  it('distinguishes member-authored, AI-proposed, and migrated weaves', () => {
    expect(getWeaveOriginLabel('user')).toBe('Woven by a member')
    expect(getWeaveOriginLabel('ai')).toBe('Proposed by the assistant')
    expect(getWeaveOriginLabel(null)).toBe(
      'Carried over from a migrated care point'
    )
  })
})
