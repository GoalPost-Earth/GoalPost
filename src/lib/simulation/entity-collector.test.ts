import {
  buildFocusParam,
  extractEntitiesFromToolResult,
  MAX_PIVOT_ENTITIES,
  parseFocusParam,
} from './entity-collector'

describe('extractEntitiesFromToolResult', () => {
  test('extracts single-entity shape (get_focal_entity)', () => {
    const out = extractEntitiesFromToolResult({
      status: 'ok',
      type: 'PersonPulse',
      id: 'p-1',
      label: 'Sarah Chen',
      record: { firstName: 'Sarah' },
    })
    expect(out).toEqual([{ type: 'PersonPulse', id: 'p-1', name: 'Sarah Chen' }])
  })

  test('extracts spaces array (get_my_spaces / search_space)', () => {
    const out = extractEntitiesFromToolResult({
      found: true,
      spaces: [
        { id: 'me_a', name: "Wade's MeSpace", type: 'MeSpace' },
        { id: 'ws_b', name: 'Climbing Crew', type: 'WeSpace' },
      ],
    })
    expect(out).toEqual([
      { type: 'MeSpace', id: 'me_a', name: "Wade's MeSpace" },
      { type: 'WeSpace', id: 'ws_b', name: 'Climbing Crew' },
    ])
  })

  test('extracts pulses array using item-declared type', () => {
    const out = extractEntitiesFromToolResult({
      pulses: [
        { id: 'pulse-1', title: 'Ship the thing', type: 'GoalPulse' },
        { id: 'pulse-2', title: 'A note', type: 'StoryPulse' },
      ],
    })
    expect(out).toEqual([
      { type: 'GoalPulse', id: 'pulse-1', name: 'Ship the thing' },
      { type: 'StoryPulse', id: 'pulse-2', name: 'A note' },
    ])
  })

  test('falls back to fieldContexts -> FieldContext type', () => {
    const out = extractEntitiesFromToolResult({
      fieldContexts: [{ id: 'ctx-1', title: 'Care Practices' }],
    })
    expect(out).toEqual([
      { type: 'FieldContext', id: 'ctx-1', name: 'Care Practices' },
    ])
  })

  test('skips entries missing id or name', () => {
    const out = extractEntitiesFromToolResult({
      spaces: [
        { id: 'me_a', name: 'OK', type: 'MeSpace' },
        { id: '', name: 'no id', type: 'MeSpace' },
        { id: 'ws_b', type: 'WeSpace' }, // no name
      ],
    })
    expect(out).toEqual([{ type: 'MeSpace', id: 'me_a', name: 'OK' }])
  })

  test('skips entries with unknown type and no fallback', () => {
    const out = extractEntitiesFromToolResult({
      results: [{ id: 'x', name: 'thing', type: 'Mystery' }],
    })
    expect(out).toEqual([])
  })

  test('returns empty for non-object input', () => {
    expect(extractEntitiesFromToolResult(null)).toEqual([])
    expect(extractEntitiesFromToolResult(undefined)).toEqual([])
    expect(extractEntitiesFromToolResult('string')).toEqual([])
  })
})

describe('buildFocusParam', () => {
  test('joins type:id pairs with commas', () => {
    expect(
      buildFocusParam([
        { type: 'MeSpace', id: 'me_a', name: 'A' },
        { type: 'GoalPulse', id: 'g-1', name: 'B' },
      ])
    ).toBe('MeSpace:me_a,GoalPulse:g-1')
  })

  test('caps the list at MAX_PIVOT_ENTITIES', () => {
    const many = Array.from({ length: MAX_PIVOT_ENTITIES + 5 }, (_, i) => ({
      type: 'GoalPulse' as const,
      id: `g-${i}`,
      name: `G${i}`,
    }))
    const param = buildFocusParam(many)
    expect(param.split(',').length).toBe(MAX_PIVOT_ENTITIES)
  })
})

describe('parseFocusParam', () => {
  test('parses well-formed pairs', () => {
    expect(parseFocusParam('MeSpace:me_a,GoalPulse:g-1')).toEqual([
      { type: 'MeSpace', id: 'me_a' },
      { type: 'GoalPulse', id: 'g-1' },
    ])
  })

  test('drops unknown types and malformed segments', () => {
    expect(parseFocusParam('Mystery:x,MeSpace:me_a,:,broken,Space:s-1')).toEqual([
      { type: 'MeSpace', id: 'me_a' },
      { type: 'Space', id: 's-1' },
    ])
  })

  test('dedupes repeated entries', () => {
    expect(parseFocusParam('MeSpace:me_a,MeSpace:me_a,WeSpace:ws_b')).toEqual([
      { type: 'MeSpace', id: 'me_a' },
      { type: 'WeSpace', id: 'ws_b' },
    ])
  })

  test('returns empty for null/empty input', () => {
    expect(parseFocusParam(null)).toEqual([])
    expect(parseFocusParam('')).toEqual([])
    expect(parseFocusParam(undefined)).toEqual([])
  })

  test('respects the MAX_PIVOT_ENTITIES cap', () => {
    const raw = Array.from(
      { length: MAX_PIVOT_ENTITIES + 5 },
      (_, i) => `GoalPulse:g-${i}`
    ).join(',')
    expect(parseFocusParam(raw).length).toBe(MAX_PIVOT_ENTITIES)
  })
})
