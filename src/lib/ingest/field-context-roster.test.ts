import { loadFieldContextRoster } from './field-context-roster'

describe('FieldContextRoster (v1 skeleton — empty roster)', () => {
  it('returns { persons: [], pulses: [] } regardless of fieldContextId', async () => {
    // Slice 1 ships with an empty roster; the extractor gets no dedup context.
    // Slice 4 (GOAL-239) replaces this implementation with a Neo4j-backed
    // version that returns the actual persons and pulses in the context.
    const roster = await loadFieldContextRoster({ fieldContextId: 'ctx_anything' })
    expect(roster.persons).toEqual([])
    expect(roster.pulses).toEqual([])
  })

  it('always returns plain arrays (never null/undefined)', async () => {
    const roster = await loadFieldContextRoster({ fieldContextId: '' })
    expect(Array.isArray(roster.persons)).toBe(true)
    expect(Array.isArray(roster.pulses)).toBe(true)
  })
})
