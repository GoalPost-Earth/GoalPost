/**
 * Theme grouping for the resonance review queue.
 *
 * Pure unit tests — `groupSuggestionsByTheme` touches no Neo4j, no LLM and no
 * React, so nothing is mocked and no OPENAI_API_KEY is needed.
 *
 * What is pinned here:
 *
 * - Collapsing: suggestions sharing a `themeId` become one group whose `count`
 *   and `minConfidence`/`maxConfidence` span the whole group.
 * - Ordering: biggest group first (the reviewer's time is the scarce thing),
 *   ties broken alphabetically by label, and the ungrouped bucket always last
 *   however large it grows.
 * - Identity: grouping is by `themeId` and NEVER by label. Two Spaces, or two
 *   concurrent sweeps, can mint separate FieldResonance nodes with the same
 *   name; merging them would let one "Accept all" button imply authority over
 *   pairs its theme-scoped request will not touch.
 * - Labelling: `themeLabel` wins, then the pair's own `label`, then
 *   UNGROUPED_LABEL — and a `themeId` of '' is a real theme, not the catch-all
 *   (the implementation keys the catch-all on a `\u0000ungrouped` sentinel
 *   precisely so the empty string stays distinguishable).
 * - Description: an empty description on the first pair of a group is filled in
 *   by a later non-empty one, because a theme write can fail for one pair and
 *   succeed for the next and an empty header reads as a bug.
 */

import {
  groupSuggestionsByTheme,
  UNGROUPED_LABEL,
  type GroupableSuggestion,
} from './group-suggestions'

// ─── helpers ────────────────────────────────────────────────────────────────

/** Ids only have to be distinct; nothing under test reads them. */
let seq = 0
const nextId = () => `rs_${(seq += 1)}`

function suggestion(
  overrides: Partial<GroupableSuggestion> = {}
): GroupableSuggestion {
  return {
    id: nextId(),
    label: 'Shared care',
    description: 'Both pulses tend the same need.',
    confidence: 0.9,
    themeId: null,
    themeLabel: null,
    ...overrides,
  }
}

/** A themed pair, the shape discovery writes once a FieldResonance exists. */
function themed(
  themeId: string,
  themeLabel: string,
  overrides: Partial<GroupableSuggestion> = {}
): GroupableSuggestion {
  return suggestion({ themeId, themeLabel, label: themeLabel, ...overrides })
}

const shape = (groups: ReturnType<typeof groupSuggestionsByTheme>) =>
  groups.map((g) => [g.themeId, g.label, g.count])

// ─── collapsing ─────────────────────────────────────────────────────────────

describe('groupSuggestionsByTheme — collapsing a flat list', () => {
  it('returns an empty array for an empty list', () => {
    expect(groupSuggestionsByTheme([])).toEqual([])
  })

  it('collapses every pair sharing a themeId into one group', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons'),
      themed('fr_commons', 'Regenerative Commons'),
      themed('fr_commons', 'Regenerative Commons'),
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].themeId).toBe('fr_commons')
    expect(groups[0].label).toBe('Regenerative Commons')
    expect(groups[0].count).toBe(3)
    expect(groups[0].suggestions).toHaveLength(3)
  })

  it('spans the group’s confidence range with min/maxConfidence', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons', { confidence: 0.82 }),
      themed('fr_commons', 'Regenerative Commons', { confidence: 0.97 }),
      themed('fr_commons', 'Regenerative Commons', { confidence: 0.76 }),
    ])

    expect(groups[0].minConfidence).toBe(0.76)
    expect(groups[0].maxConfidence).toBe(0.97)
  })

  it('reports min === max for a group of one', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons', { confidence: 0.83 }),
    ])

    expect(groups[0].count).toBe(1)
    expect(groups[0].minConfidence).toBe(0.83)
    expect(groups[0].maxConfidence).toBe(0.83)
  })

  it('keeps each suggestion in the group in the order it arrived, intact', () => {
    // The review UI renders the pair rows from these, so nothing may be
    // reshaped on the way through — extra fields included.
    const a = { ...themed('fr_commons', 'Regenerative Commons'), rank: 1 }
    const b = { ...themed('fr_commons', 'Regenerative Commons'), rank: 2 }

    const groups = groupSuggestionsByTheme([a, b])

    expect(groups[0].suggestions).toEqual([a, b])
    expect(groups[0].suggestions.map((s) => s.rank)).toEqual([1, 2])
  })

  it('counts each group independently rather than sharing a running total', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons', { confidence: 0.9 }),
      themed('fr_tools', 'Tool Library', { confidence: 0.8 }),
      themed('fr_commons', 'Regenerative Commons', { confidence: 0.99 }),
    ])

    expect(shape(groups)).toEqual([
      ['fr_commons', 'Regenerative Commons', 2],
      ['fr_tools', 'Tool Library', 1],
    ])
    expect(groups[1].minConfidence).toBe(0.8)
    expect(groups[1].maxConfidence).toBe(0.8)
  })
})

// ─── ordering ───────────────────────────────────────────────────────────────

describe('groupSuggestionsByTheme — ordering', () => {
  it('puts the largest group first, so one decision saves the most', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_small', 'Tool Library'),
      themed('fr_big', 'Regenerative Commons'),
      themed('fr_big', 'Regenerative Commons'),
      themed('fr_big', 'Regenerative Commons'),
      themed('fr_mid', 'Mutual Repair'),
      themed('fr_mid', 'Mutual Repair'),
    ])

    expect(shape(groups)).toEqual([
      ['fr_big', 'Regenerative Commons', 3],
      ['fr_mid', 'Mutual Repair', 2],
      ['fr_small', 'Tool Library', 1],
    ])
  })

  it('breaks a size tie alphabetically by label', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_z', 'Zephyr Gardens'),
      themed('fr_m', 'Mutual Repair'),
      themed('fr_a', 'Aquifer Care'),
    ])

    expect(groups.map((g) => g.label)).toEqual([
      'Aquifer Care',
      'Mutual Repair',
      'Zephyr Gardens',
    ])
  })

  it('applies the label tie-break only within a size band', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_a', 'Aquifer Care'),
      themed('fr_z', 'Zephyr Gardens'),
      themed('fr_z', 'Zephyr Gardens'),
    ])

    // Size wins over the alphabet: Zephyr is bigger, so it leads.
    expect(groups.map((g) => g.label)).toEqual([
      'Zephyr Gardens',
      'Aquifer Care',
    ])
  })
})

// ─── the ungrouped bucket ───────────────────────────────────────────────────

describe('groupSuggestionsByTheme — the ungrouped bucket', () => {
  const untitled = (overrides: Partial<GroupableSuggestion> = {}) =>
    suggestion({ themeId: null, themeLabel: null, label: '', ...overrides })

  it('gathers every themeless pair into ONE bucket', () => {
    const groups = groupSuggestionsByTheme([
      untitled({ confidence: 0.8 }),
      untitled({ confidence: 0.95 }),
      untitled({ confidence: 0.77 }),
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].themeId).toBeNull()
    expect(groups[0].label).toBe(UNGROUPED_LABEL)
    expect(groups[0].count).toBe(3)
    expect(groups[0].minConfidence).toBe(0.77)
    expect(groups[0].maxConfidence).toBe(0.95)
  })

  it('sorts the bucket LAST even when it dwarfs every real theme', () => {
    const groups = groupSuggestionsByTheme([
      ...Array.from({ length: 12 }, () => untitled()),
      themed('fr_commons', 'Regenerative Commons'),
    ])

    expect(shape(groups)).toEqual([
      ['fr_commons', 'Regenerative Commons', 1],
      [null, UNGROUPED_LABEL, 12],
    ])
  })

  it('sorts last whichever side of the comparison it lands on', () => {
    // Guards both branches of the null check: themed-then-ungrouped and
    // ungrouped-then-themed must produce the same order.
    const themedFirst = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons'),
      untitled(),
      untitled(),
    ])
    const ungroupedFirst = groupSuggestionsByTheme([
      untitled(),
      untitled(),
      themed('fr_commons', 'Regenerative Commons'),
    ])

    expect(shape(themedFirst)).toEqual(shape(ungroupedFirst))
    expect(shape(themedFirst)).toEqual([
      ['fr_commons', 'Regenerative Commons', 1],
      [null, UNGROUPED_LABEL, 2],
    ])
  })

  it('still sorts last when it ties on size with a real theme', () => {
    const groups = groupSuggestionsByTheme([
      untitled(),
      themed('fr_aaa', 'Aquifer Care'),
    ])

    // 'Aquifer Care' < 'Ungrouped' alphabetically too, so pin it against a
    // theme whose label sorts AFTER 'Ungrouped' as well.
    const reversed = groupSuggestionsByTheme([
      untitled(),
      themed('fr_zzz', 'Zephyr Gardens'),
    ])

    expect(groups.map((g) => g.themeId)).toEqual(['fr_aaa', null])
    expect(reversed.map((g) => g.themeId)).toEqual(['fr_zzz', null])
  })

  it('is never hidden — a lone ungrouped pair is still returned', () => {
    const groups = groupSuggestionsByTheme([untitled()])

    expect(groups).toHaveLength(1)
    expect(groups[0].themeId).toBeNull()
  })
})

// ─── identity: themeId, not label ───────────────────────────────────────────

describe('groupSuggestionsByTheme — groups are keyed on themeId, never on label', () => {
  it('keeps two FieldResonance nodes with the SAME label as separate groups', () => {
    // Two Spaces, or two concurrent sweeps, mint same-named theme nodes. If
    // these merged, "Accept all" would post one theme-scoped request and
    // silently leave the other theme's pairs pending.
    const groups = groupSuggestionsByTheme([
      themed('fr_commons_a', 'Regenerative Commons'),
      themed('fr_commons_b', 'Regenerative Commons'),
      themed('fr_commons_a', 'Regenerative Commons'),
    ])

    expect(groups).toHaveLength(2)
    expect(shape(groups)).toEqual([
      ['fr_commons_a', 'Regenerative Commons', 2],
      ['fr_commons_b', 'Regenerative Commons', 1],
    ])
  })

  it('keeps one theme together even when its pairs carry different labels', () => {
    // The pair's own label copy can drift from the node's; the id is the truth.
    const groups = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons'),
      suggestion({
        themeId: 'fr_commons',
        themeLabel: 'Regenerative Commons (renamed)',
        label: 'Something else entirely',
      }),
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].themeId).toBe('fr_commons')
    expect(groups[0].count).toBe(2)
    // The first pair's label names the group; later ones do not rewrite it.
    expect(groups[0].label).toBe('Regenerative Commons')
  })

  it('treats a themeId of "" as a real theme, not as ungrouped', () => {
    const groups = groupSuggestionsByTheme([
      suggestion({ themeId: '', themeLabel: 'Empty Id Theme' }),
      suggestion({ themeId: null, themeLabel: null, label: '' }),
      suggestion({ themeId: null, themeLabel: null, label: '' }),
      suggestion({ themeId: null, themeLabel: null, label: '' }),
    ])

    expect(groups).toHaveLength(2)
    // The empty-string theme keeps its own identity...
    expect(groups[0].themeId).toBe('')
    expect(groups[0].label).toBe('Empty Id Theme')
    expect(groups[0].count).toBe(1)
    // ...and is NOT sorted last despite being the smaller group, because only
    // a null themeId is the catch-all.
    expect(groups[1].themeId).toBeNull()
    expect(groups[1].count).toBe(3)
  })

  it('does not merge a themeId of "" into the null bucket even when both are present', () => {
    const groups = groupSuggestionsByTheme([
      suggestion({ themeId: null, themeLabel: null, label: '' }),
      suggestion({ themeId: '', themeLabel: 'Empty Id Theme' }),
    ])

    expect(groups.map((g) => g.themeId)).toEqual(['', null])
    expect(groups.map((g) => g.count)).toEqual([1, 1])
  })
})

// ─── labelling ──────────────────────────────────────────────────────────────

describe('groupSuggestionsByTheme — the group label', () => {
  it('prefers themeLabel over the pair’s own label', () => {
    const groups = groupSuggestionsByTheme([
      suggestion({
        themeId: 'fr_commons',
        themeLabel: 'Regenerative Commons',
        label: 'Pair-level label',
      }),
    ])

    expect(groups[0].label).toBe('Regenerative Commons')
  })

  it('falls back to the pair’s own label when themeLabel is null', () => {
    // A suggestion written before themes existed still renders with a name.
    const groups = groupSuggestionsByTheme([
      suggestion({
        themeId: 'fr_commons',
        themeLabel: null,
        label: 'Shared care',
      }),
    ])

    expect(groups[0].label).toBe('Shared care')
  })

  it('treats a whitespace-only themeLabel as absent', () => {
    const groups = groupSuggestionsByTheme([
      suggestion({
        themeId: 'fr_commons',
        themeLabel: '   ',
        label: 'Shared care',
      }),
    ])

    expect(groups[0].label).toBe('Shared care')
  })

  it('trims the label it settles on', () => {
    const groups = groupSuggestionsByTheme([
      suggestion({
        themeId: 'fr_commons',
        themeLabel: '  Regenerative Commons  ',
      }),
    ])

    expect(groups[0].label).toBe('Regenerative Commons')
  })

  it('falls back to UNGROUPED_LABEL when neither label survives trimming', () => {
    const groups = groupSuggestionsByTheme([
      suggestion({ themeId: null, themeLabel: '  ', label: '   ' }),
    ])

    expect(groups[0].label).toBe(UNGROUPED_LABEL)
  })

  it('uses UNGROUPED_LABEL for an unnameable THEME without making it ungrouped', () => {
    const groups = groupSuggestionsByTheme([
      suggestion({ themeId: 'fr_nameless', themeLabel: '', label: '' }),
      suggestion({ themeId: null, themeLabel: null, label: '' }),
      suggestion({ themeId: null, themeLabel: null, label: '' }),
    ])

    // Same displayed name, but the theme keeps its id and its ordering rights.
    expect(shape(groups)).toEqual([
      ['fr_nameless', UNGROUPED_LABEL, 1],
      [null, UNGROUPED_LABEL, 2],
    ])
  })

  it('names the ungrouped bucket after its first pair when that pair has a label', () => {
    // Documented consequence of the shared fallback chain: the catch-all is
    // identified by `themeId === null`, not by its displayed name.
    const groups = groupSuggestionsByTheme([
      suggestion({ themeId: null, themeLabel: null, label: 'Shared care' }),
      suggestion({ themeId: null, themeLabel: null, label: 'Shared water' }),
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].themeId).toBeNull()
    expect(groups[0].label).toBe('Shared care')
  })
})

// ─── description ────────────────────────────────────────────────────────────

describe('groupSuggestionsByTheme — the group description', () => {
  it('takes the description from the first pair in the group', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons', {
        description: 'Tending shared ground.',
      }),
      themed('fr_commons', 'Regenerative Commons', {
        description: 'A later, different wording.',
      }),
    ])

    expect(groups[0].description).toBe('Tending shared ground.')
  })

  it('backfills an empty first description from a later pair in the same group', () => {
    // A theme write can fail for one pair and succeed for the next; an empty
    // header reads as a bug rather than as missing data.
    const groups = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons', { description: '' }),
      themed('fr_commons', 'Regenerative Commons', {
        description: 'Tending shared ground.',
      }),
    ])

    expect(groups[0].description).toBe('Tending shared ground.')
  })

  it('takes the FIRST non-empty description, not the last', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons', { description: '' }),
      themed('fr_commons', 'Regenerative Commons', { description: 'First real.' }),
      themed('fr_commons', 'Regenerative Commons', { description: 'Second real.' }),
    ])

    expect(groups[0].description).toBe('First real.')
  })

  it('leaves the description empty when no pair in the group has one', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons', { description: '' }),
      themed('fr_commons', 'Regenerative Commons', { description: '' }),
    ])

    expect(groups[0].description).toBe('')
  })

  it('backfills within the ungrouped bucket too', () => {
    const groups = groupSuggestionsByTheme([
      suggestion({ themeId: null, label: '', description: '' }),
      suggestion({ themeId: null, label: '', description: 'A late explanation.' }),
    ])

    expect(groups[0].description).toBe('A late explanation.')
  })

  it('never leaks one theme’s description into another’s', () => {
    const groups = groupSuggestionsByTheme([
      themed('fr_commons', 'Regenerative Commons', { description: '' }),
      themed('fr_tools', 'Tool Library', { description: 'Sharing what we own.' }),
      themed('fr_commons', 'Regenerative Commons', {
        description: 'Tending shared ground.',
      }),
    ])

    expect(groups.map((g) => g.description)).toEqual([
      'Tending shared ground.',
      'Sharing what we own.',
    ])
  })
})
