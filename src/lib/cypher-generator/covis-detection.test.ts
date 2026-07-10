/**
 * Unit coverage for the co-visualization fallback's pure detection logic
 * (GOAL — feedback_e62eba1d "show my connection to freedom and ashong").
 * DB-free: locks in entity-reference detection, id/type→label mapping, and
 * summary name formatting against future generator-prompt changes.
 */
import {
  anchorLabelForType,
  anchorLabelForId,
  referencedCanvasEntities,
  formatNameList,
} from './index'

describe('anchorLabelForType', () => {
  it('collapses subtypes to their id-indexed base label', () => {
    expect(anchorLabelForType('MeSpace')).toBe('Space')
    expect(anchorLabelForType('WeSpace')).toBe('Space')
    expect(anchorLabelForType('CoreValuePulse')).toBe('FieldPulse')
    expect(anchorLabelForType('GoalPulse')).toBe('FieldPulse')
    expect(anchorLabelForType('User')).toBe('Person')
    expect(anchorLabelForType('PersonPulse')).toBe('Person')
    expect(anchorLabelForType('FieldContext')).toBe('FieldContext')
  })

  it('returns null for surface-only / unknown kinds', () => {
    expect(anchorLabelForType('OverlayNode')).toBeNull()
    expect(anchorLabelForType('whatever')).toBeNull()
  })
})

describe('anchorLabelForId', () => {
  it('derives a base label from the id prefix', () => {
    expect(anchorLabelForId('pulse_18b4abf2')).toBe('FieldPulse')
    expect(anchorLabelForId('person_00090649')).toBe('Person')
    expect(anchorLabelForId('mespace_752a42be')).toBe('Space')
    expect(anchorLabelForId('context_abc')).toBe('FieldContext')
  })

  it('returns null for a bare UUID (no prefix)', () => {
    expect(anchorLabelForId('752a42be-9a65-4a12-b385-18aa791a03cf')).toBeNull()
  })
})

describe('referencedCanvasEntities', () => {
  const canvas = [
    { id: '752a42be-9a65', name: 'John-Dag Addy', type: 'User', source: 'bloom' },
    { id: 'pulse_freedom', name: 'Freedom', type: 'CoreValuePulse', source: 'bloom' },
    { id: 'person_ashong', name: 'Ashong', type: 'PersonPulse', source: 'bloom' },
  ]

  it('matches by exact id substring embedded in the intent', () => {
    const intent = 'connections among X [id=pulse_freedom] and Y [id=person_ashong]'
    const refs = referencedCanvasEntities(intent, canvas)
    expect(refs.map((r) => r.id).sort()).toEqual(['person_ashong', 'pulse_freedom'])
  })

  it('matches by whole-word name (case-insensitive)', () => {
    const refs = referencedCanvasEntities(
      'show my connection to freedom and ashong',
      canvas
    )
    expect(refs.map((r) => r.id).sort()).toEqual(['person_ashong', 'pulse_freedom'])
  })

  it('does NOT match a name that only appears inside a larger word', () => {
    // Ids are long/unique so only the NAME match is exercised here.
    const canvasShort = [
      { id: 'person_ash_1', name: 'Ash', type: 'PersonPulse', source: 'bloom' },
      { id: 'person_ed_2', name: 'Ed', type: 'User', source: 'bloom' },
    ]
    // "Ashong" contains "Ash"; "edited" contains "Ed" — neither should match.
    const refs = referencedCanvasEntities('ashong edited the doc', canvasShort)
    expect(refs).toHaveLength(0)
  })

  it('dedupes and skips blank ids', () => {
    const dupCanvas = [
      { id: 'pulse_freedom', name: 'Freedom', type: 'CoreValuePulse', source: 'bloom' },
      { id: 'pulse_freedom', name: 'Freedom', type: 'CoreValuePulse', source: 'dashboard' },
      { id: '', name: 'Nameless', type: 'User', source: 'bloom' },
    ]
    const refs = referencedCanvasEntities('pull up Freedom', dupCanvas)
    expect(refs).toHaveLength(1)
    expect(refs[0].id).toBe('pulse_freedom')
  })

  it('returns nothing when the intent references no canvas entity', () => {
    expect(referencedCanvasEntities('what is the weather', canvas)).toHaveLength(0)
  })
})

describe('formatNameList', () => {
  it('formats 0/1/2/3 names', () => {
    expect(formatNameList([])).toBe('the entities you named')
    expect(formatNameList(['Freedom'])).toBe('Freedom')
    expect(formatNameList(['Freedom', 'Ashong'])).toBe('Freedom and Ashong')
    expect(formatNameList(['You', 'Freedom', 'Ashong'])).toBe(
      'You, Freedom and Ashong'
    )
  })

  it('drops blank captions', () => {
    expect(formatNameList(['Freedom', '', '  '])).toBe('Freedom')
  })
})
