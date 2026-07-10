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
  harvestIntentEntityIds,
  isSelfReferential,
  formatNameList,
} from './index'

// The exact intent the chat model produced for the reported failure
// (feedback_e62eba1d). The user's real id is NOT person_d0c9c0e0 — the model
// embedded a phantom id for "you" — but Freedom/Ashong ids are real.
const CAPTURED_INTENT =
  'Show the connections among the canvas-visible entities John-Dag Addy ' +
  '[id=person_d0c9c0e0-32e2-437a-b910-06a5efb2809f], Freedom ' +
  '[id=pulse_18b4abf2-616c-41de-9634-b92c65f575ae], and Ashong ' +
  '[id=person_00090649-2fee-417b-b61a-5f38f339b30e], including any shortest ' +
  'paths and immediate relationships between them that the current user can see.'

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

describe('harvestIntentEntityIds', () => {
  it('harvests every prefixed GoalPost id embedded in the intent', () => {
    const ids = harvestIntentEntityIds(CAPTURED_INTENT).map((r) => r.id)
    expect(ids).toEqual([
      'person_d0c9c0e0-32e2-437a-b910-06a5efb2809f',
      'pulse_18b4abf2-616c-41de-9634-b92c65f575ae',
      'person_00090649-2fee-417b-b61a-5f38f339b30e',
    ])
  })

  it('leaves harvested refs type-blank so the id prefix drives the anchor label', () => {
    const refs = harvestIntentEntityIds('pull up [id=pulse_abc12345]')
    expect(refs).toEqual([{ id: 'pulse_abc12345', name: '', type: '' }])
    // The fallback derives the label from the prefix when type is blank.
    expect(anchorLabelForType(refs[0].type) ?? anchorLabelForId(refs[0].id)).toBe(
      'FieldPulse'
    )
  })

  it('dedupes repeated ids and ignores non-id prose', () => {
    const refs = harvestIntentEntityIds(
      'show pulse_freedom111 and again pulse_freedom111 and the weather'
    )
    expect(refs.map((r) => r.id)).toEqual(['pulse_freedom111'])
  })

  it('does not harvest bare UUIDs (no recognisable prefix)', () => {
    expect(
      harvestIntentEntityIds('node 752a42be-9a65-4a12-b385-18aa791a03cf')
    ).toHaveLength(0)
  })

  it('recovers the co-visualization anchors from an EMPTY canvas (the reported bug)', () => {
    // canvasVisibleEntities arrived empty/stale, so the canvas matcher finds
    // nothing — but the intent still carries the ids. Merging harvest results
    // gives the >=2 anchors the fallback needs to fire.
    const fromCanvas = referencedCanvasEntities(CAPTURED_INTENT, [])
    expect(fromCanvas).toHaveLength(0)
    const merged = [...fromCanvas]
    for (const ref of harvestIntentEntityIds(CAPTURED_INTENT)) {
      if (!merged.some((e) => e.id === ref.id)) merged.push(ref)
    }
    expect(merged.length).toBeGreaterThanOrEqual(2)
    expect(merged.map((r) => r.id)).toContain(
      'pulse_18b4abf2-616c-41de-9634-b92c65f575ae'
    )
    expect(merged.map((r) => r.id)).toContain(
      'person_00090649-2fee-417b-b61a-5f38f339b30e'
    )
  })
})

describe('isSelfReferential', () => {
  it('is true for first-person pronouns regardless of name', () => {
    expect(isSelfReferential('show my connection to X and Y', null)).toBe(true)
    expect(isSelfReferential('how am I connected to Freedom', null)).toBe(true)
    expect(isSelfReferential('connect me to Ashong', 'ignored')).toBe(true)
  })

  it('is true when a third-person rewrite names the user (the reported bug)', () => {
    // No I/me/my — the model rewrote it and named the user instead.
    expect(isSelfReferential(CAPTURED_INTENT, 'John-Dag')).toBe(true)
  })

  it('is false for a third-person intent that does not name the user', () => {
    expect(
      isSelfReferential(
        'show the connection between Freedom and Ashong that the current user can see',
        'John-Dag'
      )
    ).toBe(false)
  })

  it('ignores a missing or too-short user name (no distinctiveness)', () => {
    expect(isSelfReferential('connections among Ed and Freedom', 'Ed')).toBe(false)
    expect(isSelfReferential('connections among Freedom and Ashong', null)).toBe(
      false
    )
    expect(isSelfReferential('connections among Freedom and Ashong', '')).toBe(
      false
    )
  })

  it('matches the user name only as a whole word', () => {
    // "Grace" the user vs. "disgraceful" prose — must not match inside a word.
    expect(isSelfReferential('a disgraceful situation with Freedom', 'Grace')).toBe(
      false
    )
    expect(isSelfReferential('connections among Grace and Freedom', 'Grace')).toBe(
      true
    )
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
