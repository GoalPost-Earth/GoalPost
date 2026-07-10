import { resolveTriageRating } from './resolve-rating'

/**
 * Regression test for the failure-triage false-positive fix (dashboard read).
 *
 * Background: the inline suggestion cards record an ACCEPT as POSITIVE
 * `user_thumb` feedback. The classifier already excludes positives
 * (listUnclassifiedFeedback → rating: 'negative'), so such rows never get a
 * classification or cluster. But the /dev/ai-quality dashboard read applied no
 * default rating filter, so those unclassified positive rows STILL surfaced in
 * the failure-triage list and each minted a bogus "Fix this in Claude Code"
 * task — the false positive this fix closes.
 *
 * The dashboard now defaults to negative-only. This pins that: a missing or
 * unrecognized rating param resolves to 'negative', while an explicit
 * 'positive' is still honored (golden-set curation).
 */
describe('resolveTriageRating', () => {
  it('defaults to negative (failure-only) when no rating param is present', () => {
    expect(resolveTriageRating(undefined)).toBe('negative')
    expect(resolveTriageRating('')).toBe('negative')
  })

  it('honors an explicit negative filter', () => {
    expect(resolveTriageRating('negative')).toBe('negative')
  })

  it('honors an explicit positive filter (curators can inspect successes)', () => {
    expect(resolveTriageRating('positive')).toBe('positive')
  })

  it('falls back to negative for an unrecognized value (never widens to all)', () => {
    expect(resolveTriageRating('all')).toBe('negative')
    expect(resolveTriageRating('garbage')).toBe('negative')
    expect(resolveTriageRating('Positive')).toBe('negative')
  })
})
