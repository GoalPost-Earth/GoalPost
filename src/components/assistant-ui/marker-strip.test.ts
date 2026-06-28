import {
  BLOOM_MARKER,
  PERSON_MARKER,
  extractBalancedJson,
  stripMarker,
  stripTrailingPartialMarker,
  collectPayloads,
  parsePersonElements,
} from './marker-strip'

const bloom = (json: string) => `${BLOOM_MARKER} ${json}`
const person = (json: string) => `${PERSON_MARKER} ${json}`

describe('extractBalancedJson', () => {
  it('returns the first balanced object after the offset', () => {
    const text = 'noise {"a":1} tail'
    expect(extractBalancedJson(text, 0)?.json).toBe('{"a":1}')
  })

  it('respects nested braces and braces inside strings', () => {
    const text = 'x {"a":{"b":1},"c":"}"} y'
    expect(extractBalancedJson(text, 0)?.json).toBe('{"a":{"b":1},"c":"}"}')
  })

  it('returns null while the object is still streaming (unbalanced)', () => {
    expect(extractBalancedJson('{"a":1', 0)).toBeNull()
  })
})

describe('stripMarker — BLOOM (hideIncomplete=true): GOAL-280', () => {
  const strip = (text: string) => stripMarker(text, BLOOM_MARKER, true)

  it('removes a fully-streamed marker block', () => {
    const json = '{"summary":"s","nodes":[],"relationships":[]}'
    expect(strip(`Done.\n\n${bloom(json)}`)).toBe('Done.\n\n')
  })

  it('keeps prose that comes after a completed marker', () => {
    const json = '{"summary":"s","nodes":[],"relationships":[]}'
    expect(strip(`A ${bloom(json)} B`).replace(/\s+/g, ' ').trim()).toBe('A B')
  })

  it('hides a still-streaming (unbalanced) payload instead of flashing it', () => {
    const partial = `Pulled it up.\n\n${BLOOM_MARKER} {"summary":"s","nodes":[{"id":"p`
    expect(strip(partial)).toBe('Pulled it up.\n\n')
  })

  it('hides a bare marker with no JSON yet', () => {
    expect(strip(`Here:\n\n${BLOOM_MARKER}`)).toBe('Here:\n\n')
  })

  it('hides a trailing partial prefix of the marker token', () => {
    expect(strip('Here you go.\n\nBLOOM_GRAPH_OV')).toBe('Here you go.\n\n')
  })

  it('processes multiple markers: complete one removed, streaming one hidden', () => {
    const complete = '{"summary":"a","nodes":[],"relationships":[]}'
    const text = `${bloom(complete)} middle ${BLOOM_MARKER} {"summary":"b"`
    expect(strip(text).replace(/\s+/g, ' ').trim()).toBe('middle')
  })

  it('does NOT clip ordinary prose that merely ends in a common letter', () => {
    expect(strip('The garden is in full bloom')).toBe(
      'The garden is in full bloom'
    )
    expect(strip('Pick option B')).toBe('Pick option B')
  })

  it('leaves marker-free text untouched', () => {
    expect(strip('Just a normal reply.')).toBe('Just a normal reply.')
  })
})

describe('stripMarker — PERSON (default hideIncomplete=false): unchanged behavior', () => {
  const strip = (text: string) => stripMarker(text, PERSON_MARKER)

  it('removes a completed person marker block', () => {
    expect(strip(`Hi ${person('{"name":"A"}')} bye`)).toBe('Hi  bye')
  })

  it('LEAVES a still-streaming person marker in place (historical behavior)', () => {
    const partial = `Hi ${PERSON_MARKER} {"name":`
    expect(strip(partial)).toBe(partial)
  })
})

describe('stripTrailingPartialMarker', () => {
  it('trims a >=6 char trailing prefix', () => {
    expect(stripTrailingPartialMarker('end BLOOM_G', BLOOM_MARKER)).toBe('end ')
  })

  it('ignores short (<6 char) trailing prefixes to protect real prose', () => {
    expect(stripTrailingPartialMarker('in bloom B', BLOOM_MARKER)).toBe(
      'in bloom B'
    )
  })
})

describe('collectPayloads', () => {
  it('returns every closed payload and ignores an unbalanced trailing one', () => {
    const a = '{"summary":"a","nodes":[],"relationships":[]}'
    const b = '{"summary":"b","nodes":[],"relationships":[]}'
    const text = `${bloom(a)} x ${bloom(b)} y ${BLOOM_MARKER} {"summary":"c"`
    expect(collectPayloads(text, BLOOM_MARKER)).toEqual([a, b])
  })
})

describe('parsePersonElements: person-card regression guard', () => {
  // The fix: parse off Bloom-stripped text that STILL contains the PERSON
  // marker. Feeding person-stripped text (the old bug) drops every card.
  it('emits a person element from a completed person marker', () => {
    const raw = `Here is who I found. ${person('{"name":"Robert"}')}`
    const els = parsePersonElements(raw, 'Here is who I found.')
    expect(els.map((e) => e.type)).toContain('person')
    const personEl = els.find((e) => e.type === 'person')
    expect((personEl?.content as { name: string }).name).toBe('Robert')
  })

  it('keeps prose before and after the person marker', () => {
    const raw = `Intro. ${person('{"name":"A"}')} Outro.`
    const els = parsePersonElements(raw, 'Intro. Outro.')
    expect(els[0]).toEqual({ type: 'text', content: 'Intro.' })
    expect(els.some((e) => e.type === 'person')).toBe(true)
    expect(els.some((e) => e.content === 'Outro.')).toBe(true)
  })

  it('falls back to the cleaned text when no marker is present', () => {
    const els = parsePersonElements('Just prose.', 'Just prose.')
    expect(els).toEqual([{ type: 'text', content: 'Just prose.' }])
  })

  it('demonstrates the bug: person-stripped input yields no card', () => {
    // What the component did before the fix — strip the marker first, then try
    // to split on it. Nothing to split → no person element.
    const raw = `Here's who I found. ${person('{"name":"Robert"}')}`
    const personStripped = stripMarker(raw, PERSON_MARKER)
    const els = parsePersonElements(personStripped, personStripped.trim())
    expect(els.some((e) => e.type === 'person')).toBe(false)
  })
})
