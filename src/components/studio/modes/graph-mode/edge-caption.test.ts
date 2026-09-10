import { edgeCaption, DEFAULT_EDGE_CAPTIONS, MAX_EDGE_CAPTION } from './edge-caption'

describe('edgeCaption (GOAL-362)', () => {
  it('renders the edge\'s own words when it has any', () => {
    expect(edgeCaption('Author of the blog post', 'INITIATED_BY')).toBe(
      'AUTHOR OF THE BLOG POST'
    )
    expect(edgeCaption('my wife', 'CONNECTED_TO')).toBe('MY WIFE')
  })

  it('falls back to the type default when the label is missing or blank', () => {
    for (const blank of [null, undefined, '', '   ', '\n\t']) {
      expect(edgeCaption(blank, 'INITIATED_BY')).toBe('AUTHORED')
    }
  })

  it('uppercases every caption — canvas edge labels are shouted (GOAL-362)', () => {
    // Uppercase separates relationship labels from node captions (entity
    // names), which stay as written. The legend keeps title case.
    expect(edgeCaption('Interviewed', 'MENTIONED_IN')).toBe('INTERVIEWED')
    for (const type of Object.keys(DEFAULT_EDGE_CAPTIONS)) {
      const out = edgeCaption(null, type)
      expect(out).toBe(out.toUpperCase())
    }
  })

  it('never returns a blank caption for any known relationship type', () => {
    for (const type of Object.keys(DEFAULT_EDGE_CAPTIONS)) {
      expect(edgeCaption(null, type).trim()).not.toBe('')
    }
  })

  it('says "Authored", matching the entity drawer, not the schema word', () => {
    // The drawer has always labelled INITIATED_BY as "Authored"
    // (src/lib/person-related-pulses.ts). One surface saying "Authored" while
    // the canvas said "initiated" is what made the edge look absent.
    expect(edgeCaption(null, 'INITIATED_BY')).toBe('AUTHORED')
    expect(edgeCaption(null, 'CREATED_BY')).toBe('AUTHORED')
    expect(edgeCaption(null, 'MENTIONED_IN')).toBe('MENTIONED')
  })

  it('drops a label that leaked a raw entity id (kb/07 Rule 1)', () => {
    expect(
      edgeCaption('author of pulse_8d2dd0ac-8120-4375-8cc8-551f2281b4f6', 'INITIATED_BY')
    ).toBe('AUTHORED')
    expect(
      edgeCaption('person_f75a0f3f-27ef-4079-9943-453d0d7b7964', 'MENTIONED_IN')
    ).toBe('MENTIONED')
    expect(
      edgeCaption('7373eca9-f2fb-4587-88ed-9f2d1ea1c686', 'CONNECTED_TO')
    ).toBe('CONNECTED')
  })

  it('truncates an over-long label rather than letting it overrun the edge', () => {
    const long =
      'Author of the article "Distraction is the New Poverty" published in 2019'
    const out = edgeCaption(long, 'INITIATED_BY')
    expect(out.length).toBeLessThanOrEqual(MAX_EDGE_CAPTION + 1)
    expect(out.endsWith('…')).toBe(true)
    expect(long.toUpperCase().startsWith(out.slice(0, -1).trimEnd())).toBe(true)
  })

  it('collapses internal whitespace so a multi-line label stays on one line', () => {
    expect(edgeCaption('author\n  of   the\tpost', 'INITIATED_BY')).toBe(
      'AUTHOR OF THE POST'
    )
  })

  it('humanizes an unknown relationship type instead of leaking the constant', () => {
    // This is what the generic sweep hands us the first time a new edge type
    // is added to ALLOWED_RELATIONSHIPS without a default here.
    expect(edgeCaption(null, 'SOME_NEW_EDGE')).toBe('SOME NEW EDGE')
    expect(edgeCaption(null, '')).toBe('RELATED')
  })
})
