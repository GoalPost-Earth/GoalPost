/**
 * GOAL-346 — unit tests for the roster/document split.
 *
 * `HAS_PERSON` is overloaded: it means both "on this field's roster" and "this
 * document named them". These two functions are the only thing separating the
 * two meanings, and they run purely client-side over already-fetched data, so
 * every branch is reachable without a database.
 *
 * The load-bearing case is the no-documents fallback (see its describe block):
 * it fails OPEN, returning every attached person, because a surface that could
 * not load documents must not silently vanish people from its roster.
 */
import {
  extractedPersonIds,
  partitionFieldRoster,
  type RosterDocument,
  type RosterPerson,
} from './field-roster-visibility'

/** A roster person carrying extra fields, to prove the generic is preserved. */
interface TestPerson extends RosterPerson {
  name: string
  isMember?: boolean
}

const person = (id: string, name = id): TestPerson => ({ id, name })

const doc = (...personIds: string[]): RosterDocument => ({
  extractedPeople: personIds.map((id) => ({ id })),
})

describe('extractedPersonIds', () => {
  describe('when there is nothing to read', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['an empty array', []],
    ])('returns an empty set for %s documents', (_label, documents) => {
      expect(extractedPersonIds(documents)).toEqual(new Set())
    })

    it('ignores documents with null or empty extractedPeople', () => {
      const documents: RosterDocument[] = [
        { extractedPeople: null },
        { extractedPeople: [] },
        {},
        doc('p1'),
      ]
      expect(extractedPersonIds(documents)).toEqual(new Set(['p1']))
    })

    it('skips extracted person entries that carry no id', () => {
      const documents = [
        { extractedPeople: [{ id: '' }, { id: 'p1' }] },
        // Ingestion has been seen to hand back a hole in the list.
        { extractedPeople: [null, undefined, { id: 'p2' }] },
      ] as unknown as RosterDocument[]
      expect(extractedPersonIds(documents)).toEqual(new Set(['p1', 'p2']))
    })
  })

  describe('when documents name people', () => {
    it('collects every extracted id across all documents', () => {
      const ids = extractedPersonIds([doc('p1', 'p2'), doc('p3')])
      expect(ids).toEqual(new Set(['p1', 'p2', 'p3']))
    })

    it('lists a person extracted by several documents exactly once', () => {
      const ids = extractedPersonIds([
        doc('shared', 'p1'),
        doc('shared'),
        doc('shared', 'p2'),
      ])
      expect(ids.size).toBe(3)
      expect([...ids].filter((id) => id === 'shared')).toHaveLength(1)
    })

    it('lists a person listed twice within ONE document exactly once', () => {
      expect(extractedPersonIds([doc('dupe', 'dupe')])).toEqual(
        new Set(['dupe'])
      )
    })
  })

  it('does not mutate the documents it reads', () => {
    const documents: RosterDocument[] = [doc('p1', 'p2'), doc('p3')]
    const snapshot = JSON.stringify(documents)
    extractedPersonIds(documents)
    expect(JSON.stringify(documents)).toBe(snapshot)
  })
})

describe('partitionFieldRoster', () => {
  describe('when there are no attached people', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['an empty array', []],
    ])('returns two empty arrays for %s people', (_label, people) => {
      expect(partitionFieldRoster(people, [doc('p1')], [])).toEqual({
        roster: [],
        fromDocuments: [],
      })
    })

    it('returns two empty arrays when every argument is empty', () => {
      expect(partitionFieldRoster([], [], [])).toEqual({
        roster: [],
        fromDocuments: [],
      })
    })

    it('returns two empty arrays when every argument is null', () => {
      expect(partitionFieldRoster(null, null, null)).toEqual({
        roster: [],
        fromDocuments: [],
      })
    })

    it('returns two empty arrays when every argument is undefined', () => {
      expect(partitionFieldRoster(undefined, undefined, undefined)).toEqual({
        roster: [],
        fromDocuments: [],
      })
    })
  })

  /**
   * The deliberate fail-open. A caller that cannot supply documents has no way
   * to explain a person's absence, so it gets today's behaviour — the full
   * attached list — rather than a tidier list with people quietly missing.
   */
  describe('the no-documents fallback (fail-open)', () => {
    const people = [person('a'), person('b'), person('c')]

    it('returns EVERY attached person in roster when documents is undefined', () => {
      const { roster, fromDocuments } = partitionFieldRoster(
        people,
        undefined,
        []
      )
      expect(roster).toEqual(people)
      expect(fromDocuments).toEqual([])
    })

    it('returns EVERY attached person in roster when documents is null', () => {
      const { roster, fromDocuments } = partitionFieldRoster(people, null, [])
      expect(roster).toEqual(people)
      expect(fromDocuments).toEqual([])
    })

    /**
     * `documents: []` means "documents loaded, there are none" and
     * `documents: undefined` means "documents not loaded". Both land in the
     * fallback, and for an empty list that is also the correct answer on the
     * merits: with no documents nobody can be extracted, so nobody hides.
     */
    it('treats documents: [] the same as documents: undefined', () => {
      expect(partitionFieldRoster(people, [], [])).toEqual(
        partitionFieldRoster(people, undefined, [])
      )
    })

    it('keeps a person in roster even when a curated list is absent', () => {
      const { roster } = partitionFieldRoster(people, undefined, undefined)
      expect(roster.map((p) => p.id)).toEqual(['a', 'b', 'c'])
    })

    it('returns a copy, not the caller’s own array', () => {
      const { roster } = partitionFieldRoster(people, undefined, [])
      expect(roster).not.toBe(people)
      roster.push(person('injected'))
      expect(people).toHaveLength(3)
    })
  })

  describe('when documents name some of the attached people', () => {
    const people = [person('hand-added'), person('extracted'), person('both')]
    const documents = [doc('extracted'), doc('both')]

    it('defers extracted people to fromDocuments', () => {
      const { fromDocuments } = partitionFieldRoster(people, documents, [])
      expect(fromDocuments.map((p) => p.id)).toEqual(['extracted', 'both'])
    })

    it('keeps people no document named on the roster', () => {
      const { roster } = partitionFieldRoster(people, documents, [])
      expect(roster.map((p) => p.id)).toEqual(['hand-added'])
    })

    it('places every attached person in exactly one of the two arrays', () => {
      const { roster, fromDocuments } = partitionFieldRoster(
        people,
        documents,
        []
      )
      expect([...roster, ...fromDocuments].map((p) => p.id).sort()).toEqual(
        people.map((p) => p.id).sort()
      )
      expect(roster.length + fromDocuments.length).toBe(people.length)
    })

    it('preserves the input order within each array', () => {
      const ordered = [
        person('z-hand'),
        person('a-extracted'),
        person('m-hand'),
        person('b-extracted'),
      ]
      const { roster, fromDocuments } = partitionFieldRoster(
        ordered,
        [doc('a-extracted', 'b-extracted')],
        []
      )
      expect(roster.map((p) => p.id)).toEqual(['z-hand', 'm-hand'])
      expect(fromDocuments.map((p) => p.id)).toEqual([
        'a-extracted',
        'b-extracted',
      ])
    })

    it('lists a person extracted by SEVERAL documents once, in fromDocuments', () => {
      const { roster, fromDocuments } = partitionFieldRoster(
        [person('shared')],
        [doc('shared'), doc('shared', 'other'), doc('shared')],
        []
      )
      expect(fromDocuments.map((p) => p.id)).toEqual(['shared'])
      expect(roster).toEqual([])
    })

    it('ignores extracted ids that match nobody attached', () => {
      const { roster, fromDocuments } = partitionFieldRoster(
        [person('hand-added')],
        [doc('never-attached')],
        []
      )
      expect(roster.map((p) => p.id)).toEqual(['hand-added'])
      expect(fromDocuments).toEqual([])
    })

    it('keeps everyone on the roster when documents extracted nobody', () => {
      const { roster, fromDocuments } = partitionFieldRoster(
        people,
        [{ extractedPeople: null }, { extractedPeople: [] }],
        []
      )
      expect(roster).toEqual(people)
      expect(fromDocuments).toEqual([])
    })
  })

  describe('curatedPersonIds wins over extraction', () => {
    const people = [person('promoted'), person('still-extracted')]
    const documents = [doc('promoted', 'still-extracted')]

    it('returns a promoted person to the roster although they stay extracted', () => {
      const { roster, fromDocuments } = partitionFieldRoster(
        people,
        documents,
        ['promoted']
      )
      expect(roster.map((p) => p.id)).toEqual(['promoted'])
      expect(fromDocuments.map((p) => p.id)).toEqual(['still-extracted'])
      // Promotion is additive — provenance is untouched, so the person is
      // still reported as extracted by the other function.
      expect(extractedPersonIds(documents).has('promoted')).toBe(true)
    })

    it('is harmless when a curated id matches nobody attached', () => {
      const { roster, fromDocuments } = partitionFieldRoster(
        people,
        documents,
        ['ghost-id', 'promoted']
      )
      expect(roster.map((p) => p.id)).toEqual(['promoted'])
      expect(fromDocuments.map((p) => p.id)).toEqual(['still-extracted'])
    })

    it('is harmless when a curated id matches nobody at all', () => {
      const { roster, fromDocuments } = partitionFieldRoster(
        people,
        documents,
        ['ghost-id']
      )
      expect(roster).toEqual([])
      expect(fromDocuments.map((p) => p.id)).toEqual([
        'promoted',
        'still-extracted',
      ])
    })

    it.each([
      ['undefined', undefined],
      ['null', null],
      ['an empty array', []],
    ])('hides every extracted person when curated is %s', (_l, curated) => {
      const { roster, fromDocuments } = partitionFieldRoster(
        people,
        documents,
        curated
      )
      expect(roster).toEqual([])
      expect(fromDocuments).toHaveLength(2)
    })

    it('leaves a hand-added person on the roster whether or not they are curated', () => {
      const attached = [person('hand-added')]
      const documents = [doc('someone-else')]
      expect(partitionFieldRoster(attached, documents, [])).toEqual(
        partitionFieldRoster(attached, documents, ['hand-added'])
      )
    })
  })

  describe('generic parameter and immutability', () => {
    it('carries extra fields on the person objects into both arrays', () => {
      const attached: TestPerson[] = [
        { id: 'member', name: 'Ada', isMember: true },
        { id: 'named', name: 'Grace', isMember: false },
      ]
      const { roster, fromDocuments } = partitionFieldRoster(
        attached,
        [doc('named')],
        []
      )
      expect(roster).toEqual([{ id: 'member', name: 'Ada', isMember: true }])
      expect(fromDocuments).toEqual([
        { id: 'named', name: 'Grace', isMember: false },
      ])
      // Same object identity — this is a partition, not a projection.
      expect(roster[0]).toBe(attached[0])
      expect(fromDocuments[0]).toBe(attached[1])
      // The generic survives compilation: these are TestPerson, not RosterPerson.
      expect(roster[0].name).toBe('Ada')
      expect(fromDocuments[0].name).toBe('Grace')
    })

    it('does not mutate any input array', () => {
      const attached = [person('a'), person('b')]
      const documents = [doc('b')]
      const curated = ['c']
      const before = JSON.stringify({ attached, documents, curated })

      partitionFieldRoster(attached, documents, curated)

      expect(JSON.stringify({ attached, documents, curated })).toBe(before)
      expect(attached).toHaveLength(2)
      expect(documents).toHaveLength(1)
      expect(curated).toEqual(['c'])
    })

    it('returns fresh arrays the caller can safely mutate', () => {
      const attached = [person('a'), person('b')]
      const { roster, fromDocuments } = partitionFieldRoster(
        attached,
        [doc('b')],
        []
      )
      roster.push(person('x'))
      fromDocuments.push(person('y'))
      expect(attached.map((p) => p.id)).toEqual(['a', 'b'])
    })
  })
})
