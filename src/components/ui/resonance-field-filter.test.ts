/**
 * Per-field hide / show for the resonance review queue (GOAL-384).
 *
 * Pure unit tests for the helpers exported from resonance-field-filter.tsx —
 * `matchedFieldKey`, `matchedFieldLabel` and `fieldFilterRows` touch no Neo4j,
 * no LLM and no React state, so nothing is mocked. The hook and components in
 * the same module are deliberately NOT exercised here.
 *
 * What is pinned here:
 *
 * - Keying: a suggestion keys on its `matchedContextId`; a null, undefined or
 *   empty id falls into the single OTHER_SPACE_FIELD_KEY bucket.
 * - Labelling: no `matchedContextId` → OTHER_SPACE_FIELD_LABEL ('Outside
 *   this Space'), whatever title it carries; a blank / whitespace / missing title on
 *   a real field → 'Untitled field'; otherwise the trimmed title.
 * - Rows: one row per field present, `count` = suggestions in that field,
 *   sorted by count descending, ties broken by label.
 * - Hidden-independence: `fieldFilterRows` takes only the suggestion list, so
 *   counts are read off the UNFILTERED list — rows built from the full list do
 *   not change when a field is hidden, which is what keeps a hidden switch (and
 *   its count) on screen.
 */

import {
  OTHER_SPACE_FIELD_KEY,
  OTHER_SPACE_FIELD_LABEL,
  fieldFilterRows,
  matchedFieldKey,
  matchedFieldLabel,
} from './resonance-field-filter'

const inField = (id: string, title: string | null = id) => ({
  matchedContextId: id,
  matchedContextTitle: title,
})

describe('OTHER_SPACE constants', () => {
  it('uses a sentinel key that cannot collide with a ctx_ id and the "Outside this Space" label', () => {
    expect(OTHER_SPACE_FIELD_KEY).toBe('__other_space__')
    expect(OTHER_SPACE_FIELD_LABEL).toBe('Outside this Space')
  })
})

describe('matchedFieldKey', () => {
  it('keys on the matched FieldContext id', () => {
    expect(matchedFieldKey(inField('ctx_a', 'Garden'))).toBe('ctx_a')
  })

  it.each([
    ['null', { matchedContextId: null, matchedContextTitle: 'Garden' }],
    ['undefined', { matchedContextTitle: 'Garden' }],
    ['empty', { matchedContextId: '', matchedContextTitle: 'Garden' }],
    ['entirely missing', {}],
  ])('falls back to OTHER_SPACE_FIELD_KEY when matchedContextId is %s', (_, s) => {
    expect(matchedFieldKey(s)).toBe(OTHER_SPACE_FIELD_KEY)
  })
})

describe('matchedFieldLabel', () => {
  it('uses the trimmed field title', () => {
    expect(matchedFieldLabel(inField('ctx_a', '  Garden  '))).toBe('Garden')
  })

  it.each([
    ['null', { matchedContextId: null, matchedContextTitle: 'Garden' }],
    ['undefined', { matchedContextTitle: 'Garden' }],
    ['empty', { matchedContextId: '', matchedContextTitle: 'Garden' }],
  ])(
    'says "Outside this Space" when matchedContextId is %s, ignoring any title',
    (_, s) => {
      expect(matchedFieldLabel(s)).toBe(OTHER_SPACE_FIELD_LABEL)
    }
  )

  it.each([
    ['an empty', ''],
    ['a whitespace-only', '   '],
    ['a null', null],
  ])('says "Untitled field" for a real field with %s title', (_, title) => {
    expect(matchedFieldLabel(inField('ctx_a', title))).toBe('Untitled field')
  })

  it('says "Untitled field" when the title is missing entirely', () => {
    expect(matchedFieldLabel({ matchedContextId: 'ctx_a' })).toBe(
      'Untitled field'
    )
  })
})

describe('fieldFilterRows', () => {
  it('returns no rows for an empty queue', () => {
    expect(fieldFilterRows([])).toEqual([])
  })

  it('makes one row per field with its suggestion count, most first', () => {
    const rows = fieldFilterRows([
      inField('ctx_a', 'Garden'),
      inField('ctx_b', 'Housing'),
      inField('ctx_b', 'Housing'),
      inField('ctx_b', 'Housing'),
      inField('ctx_a', 'Garden'),
      inField('ctx_c', 'Care'),
    ])
    expect(rows).toEqual([
      { key: 'ctx_b', label: 'Housing', count: 3 },
      { key: 'ctx_a', label: 'Garden', count: 2 },
      { key: 'ctx_c', label: 'Care', count: 1 },
    ])
  })

  it('breaks count ties by label, not by first appearance', () => {
    const rows = fieldFilterRows([
      inField('ctx_z', 'Zoning'),
      inField('ctx_a', 'Allotments'),
      inField('ctx_m', 'Meals'),
    ])
    expect(rows.map((r) => r.label)).toEqual(['Allotments', 'Meals', 'Zoning'])
  })

  it('collects every no-field match into one "Outside this Space" row', () => {
    const rows = fieldFilterRows([
      { matchedContextId: null, matchedContextTitle: 'Theirs' },
      { matchedContextTitle: 'Other' },
      {},
      inField('ctx_a', 'Garden'),
    ])
    expect(rows).toEqual([
      { key: OTHER_SPACE_FIELD_KEY, label: OTHER_SPACE_FIELD_LABEL, count: 3 },
      { key: 'ctx_a', label: 'Garden', count: 1 },
    ])
  })

  it('keys rows by id, so two fields sharing a title stay separate rows', () => {
    const rows = fieldFilterRows([
      inField('ctx_a', 'Garden'),
      inField('ctx_b', 'Garden'),
      inField('ctx_b', 'Garden'),
    ])
    expect(rows).toEqual([
      { key: 'ctx_b', label: 'Garden', count: 2 },
      { key: 'ctx_a', label: 'Garden', count: 1 },
    ])
  })

  it('labels a blank-titled field "Untitled field"', () => {
    expect(fieldFilterRows([inField('ctx_a', '  ')])).toEqual([
      { key: 'ctx_a', label: 'Untitled field', count: 1 },
    ])
  })

  describe('when a field is hidden', () => {
    const all = [
      inField('ctx_a', 'Garden'),
      inField('ctx_a', 'Garden'),
      inField('ctx_b', 'Housing'),
    ]
    const hidden = new Set(['ctx_a'])

    it('keeps the hidden row and its count, because rows read the unfiltered list', () => {
      const before = fieldFilterRows(all)
      // Hiding is applied downstream of the rows; rebuilding from the same
      // unfiltered list must give identical rows.
      const after = fieldFilterRows(all)
      expect(after).toEqual(before)
      expect(after.find((r) => hidden.has(r.key))).toEqual({
        key: 'ctx_a',
        label: 'Garden',
        count: 2,
      })
    })

    it('would lose the hidden row if fed the filtered list (why callers must not)', () => {
      const visible = all.filter((s) => !hidden.has(matchedFieldKey(s)))
      expect(fieldFilterRows(visible).map((r) => r.key)).toEqual(['ctx_b'])
    })

    it('does not mutate the input list', () => {
      const copy = all.map((s) => ({ ...s }))
      fieldFilterRows(all)
      expect(all).toEqual(copy)
    })
  })
})
