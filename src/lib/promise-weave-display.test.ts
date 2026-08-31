import {
  WEAVE_FALLBACK_TITLE,
  weaveDisplayTitle,
  weavePersonName,
} from './promise-weave-display'

/**
 * GOAL-343 — a weave with a null title must neither crash a card nor render
 * an empty one, and no surface may ever fall through to a `weave_*` id
 * (kb/07 Rule 1). Pure helpers, so this suite needs no Neo4j connection.
 */
describe('weaveDisplayTitle', () => {
  it('prefers the weave own title', () => {
    expect(
      weaveDisplayTitle({
        title: 'Demo promise weave (JD)',
        weaves: [{ title: 'Some pulse' }],
      })
    ).toBe('Demo promise weave (JD)')
  })

  it('falls back to the woven pulse title when the weave has none', () => {
    expect(
      weaveDisplayTitle({
        title: null,
        weaves: [{ title: 'Meditation: Co-sensing With Radical Tenderness' }],
      })
    ).toBe('Meditation: Co-sensing With Radical Tenderness')
  })

  it('skips blank pulse titles and blank weave titles', () => {
    expect(
      weaveDisplayTitle({
        title: '   ',
        weaves: [{ title: '  ' }, null, { title: 'Real pulse' }],
      })
    ).toBe('Real pulse')
  })

  it('uses the generic label — never an id — when nothing is titled', () => {
    expect(weaveDisplayTitle({})).toBe(WEAVE_FALLBACK_TITLE)
    expect(weaveDisplayTitle({ title: null, weaves: [] })).toBe(
      WEAVE_FALLBACK_TITLE
    )
    expect(weaveDisplayTitle({ title: null, weaves: null })).toBe(
      WEAVE_FALLBACK_TITLE
    )
  })
})

describe('weavePersonName', () => {
  it('returns the person the weave is woven for', () => {
    expect(weavePersonName({ wovenFor: [{ name: 'John-Dag Addy' }] })).toBe(
      'John-Dag Addy'
    )
  })

  it('returns null rather than a placeholder when no one is named', () => {
    expect(weavePersonName({})).toBeNull()
    expect(weavePersonName({ wovenFor: [] })).toBeNull()
    expect(weavePersonName({ wovenFor: [{ name: '  ' }, null] })).toBeNull()
  })
})
