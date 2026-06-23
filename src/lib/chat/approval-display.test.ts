import {
  entityKindLabel,
  getEditableFields,
  applyFieldEdits,
} from './approval-display'

/**
 * Pure helpers used by the batch HITL Dialog (slice 2, GOAL-237). Every
 * label and field rendering must be Rule-1 compliant — no `__typename`,
 * no raw ids, never `pulseType: 'GoalPulse'` (it renders as "goal" instead).
 */
describe('approval-display — entityKindLabel', () => {
  it('returns "person" for create_person', () => {
    expect(
      entityKindLabel('create_person', { firstName: 'Sarah', lastName: 'Chen' })
    ).toBe('person')
  })

  it('returns "goal" for create_pulse with pulseType GoalPulse', () => {
    expect(
      entityKindLabel('create_pulse', { pulseType: 'GoalPulse', title: 'x' })
    ).toBe('goal')
  })

  it('returns "resource" for create_pulse with pulseType ResourcePulse', () => {
    expect(
      entityKindLabel('create_pulse', { pulseType: 'ResourcePulse', title: 'x' })
    ).toBe('resource')
  })

  it('returns "story" for create_pulse with pulseType StoryPulse', () => {
    expect(
      entityKindLabel('create_pulse', { pulseType: 'StoryPulse', title: 'x' })
    ).toBe('story')
  })

  it('returns "pulse" as the safe default for create_pulse without a known pulseType', () => {
    expect(entityKindLabel('create_pulse', { title: 'x' })).toBe('pulse')
    expect(
      entityKindLabel('create_pulse', { pulseType: 'CarePulse', title: 'x' })
    ).toBe('care note')
  })

  it('returns "person" for create_person even with empty args', () => {
    expect(entityKindLabel('create_person', {})).toBe('person')
  })

  it('returns "connection" for create_connection', () => {
    expect(entityKindLabel('create_connection', {})).toBe('connection')
  })

  it('falls back to "action" for unknown tool names so the dialog can still render', () => {
    expect(entityKindLabel('some_future_tool', {})).toBe('action')
  })
})

/**
 * Relationship feature (assistant relationships): the user's relationship to a
 * person is captured at create time. On create_person it lives on the
 * `relationshipWhy` field; on create_connection it lives on `why`. Both are
 * `alwaysShow`, so the dialog renders an (empty, fillable) row even when the
 * model emitted no value — we always ASK, the user may skip.
 */
describe('approval-display — relationship fields (alwaysShow)', () => {
  it('create_person: relationshipWhy renders with its captured value', () => {
    const fields = getEditableFields('create_person', {
      firstName: 'Ada',
      relationshipWhy: 'an old mentor',
    })
    const rel = fields.find((f) => f.fieldName === 'relationshipWhy')
    expect(rel).toBeDefined()
    expect(rel?.label).toBe('Your relationship')
    expect(rel?.value).toBe('an old mentor')
    expect(rel?.multiline).toBe(true)
  })

  it('create_person: relationshipWhy is present even when the arg is absent, with an empty value (alwaysShow prompt)', () => {
    const fields = getEditableFields('create_person', { firstName: 'Ada' })
    const rel = fields.find((f) => f.fieldName === 'relationshipWhy')
    expect(rel).toBeDefined()
    expect(rel?.label).toBe('Your relationship')
    expect(rel?.value).toBe('')
  })

  it('create_connection: why renders with its captured value and the "Your relationship" label', () => {
    const fields = getEditableFields('create_connection', { why: 'a mentor' })
    const why = fields.find((f) => f.fieldName === 'why')
    expect(why).toBeDefined()
    expect(why?.label).toBe('Your relationship')
    expect(why?.value).toBe('a mentor')
    expect(why?.multiline).toBe(true)
  })

  it('create_connection: why is present even when absent (alwaysShow prompt), with an empty value', () => {
    const fields = getEditableFields('create_connection', {})
    const why = fields.find((f) => f.fieldName === 'why')
    expect(why).toBeDefined()
    expect(why?.label).toBe('Your relationship')
    expect(why?.value).toBe('')
  })

  it('create_connection: omits absent optional non-alwaysShow fields (interests)', () => {
    const fields = getEditableFields('create_connection', { why: 'a mentor' })
    expect(fields.map((f) => f.fieldName)).not.toContain('interests')
    // interests appears once it carries a value.
    const withInterests = getEditableFields('create_connection', {
      why: 'a mentor',
      interests: 'climbing',
    })
    const interests = withInterests.find((f) => f.fieldName === 'interests')
    expect(interests?.label).toBe('Shared interests')
    expect(interests?.value).toBe('climbing')
  })
})

describe('approval-display — getEditableFields', () => {
  it('returns first/last name + always-shown relationship fields for create_person, in the displayed order, with human-readable labels', () => {
    const fields = getEditableFields('create_person', {
      firstName: 'Sarah',
      lastName: 'Chen',
      contextId: 'ctx_a87c5bf1-6ab3-42f6-bb61-14d5e884fda4',
      contextTitle: 'Care Practices',
      documentId: 'doc_123',
    })
    const names = fields.map((f) => f.fieldName)
    // description + relationshipWhy are alwaysShow: they render even though the
    // arg is absent, so the user is prompted to describe this person and capture
    // how they know them.
    expect(names).toEqual([
      'firstName',
      'lastName',
      'description',
      'relationshipWhy',
    ])

    const labels = fields.map((f) => f.label)
    // Rule 1: no raw field names, no __typename, no ids.
    expect(labels).toEqual([
      'First name',
      'Last name',
      'Description',
      'Your relationship',
    ])
    expect(fields[0].value).toBe('Sarah')
    expect(fields[1].value).toBe('Chen')
    // alwaysShow fields with no arg present render as an empty (fillable) value.
    expect(fields[2].value).toBe('')
    expect(fields[3].value).toBe('')
    expect(fields[3].multiline).toBe(true)

    // Internal-only fields are not editable in the UI even when present in args.
    const allFieldsString = JSON.stringify(fields)
    expect(allFieldsString).not.toContain('contextId')
    expect(allFieldsString).not.toContain('contextTitle')
    expect(allFieldsString).not.toContain('documentId')
    expect(allFieldsString).not.toContain('ctx_')
    expect(allFieldsString).not.toContain('doc_')
  })

  it('returns title (single-line) + content (multiline) for create_pulse, plus any kind-specific fields', () => {
    const fields = getEditableFields('create_pulse', {
      pulseType: 'GoalPulse',
      title: 'Ship migration',
      content: 'Cut over before EOQ.',
      horizon: 'SHORT',
      contextId: 'ctx_1',
      contextTitle: 'Care Practices',
      documentId: 'doc_1',
    })
    const names = fields.map((f) => f.fieldName)
    // title + content first, then GoalPulse-specific horizon.
    expect(names).toEqual(['title', 'content', 'horizon'])
    expect(fields[0]).toMatchObject({
      fieldName: 'title',
      label: 'Title',
      value: 'Ship migration',
      multiline: false,
    })
    expect(fields[1]).toMatchObject({
      fieldName: 'content',
      label: 'Content',
      value: 'Cut over before EOQ.',
      multiline: true,
    })
    expect(fields[2]).toMatchObject({
      fieldName: 'horizon',
      label: 'Horizon',
      value: 'SHORT',
    })
  })

  it('surfaces ResourcePulse-specific fields (resourceType, availability)', () => {
    const fields = getEditableFields('create_pulse', {
      pulseType: 'ResourcePulse',
      title: 'Shared budget',
      content: 'Pool of credits.',
      resourceType: 'budget',
      availability: 0.5,
    })
    const names = fields.map((f) => f.fieldName)
    expect(names).toEqual(['title', 'content', 'resourceType', 'availability'])
    expect(fields.find((f) => f.fieldName === 'resourceType')?.label).toBe(
      'Resource type'
    )
    expect(fields.find((f) => f.fieldName === 'availability')?.value).toBe('0.5')
  })

  it('omits absent optional fields entirely (no empty rows)', () => {
    const fields = getEditableFields('create_pulse', {
      pulseType: 'GoalPulse',
      title: 'Plain goal',
      content: 'Has no horizon.',
    })
    expect(fields.map((f) => f.fieldName)).toEqual(['title', 'content'])
  })

  it('returns empty array for an unknown tool so the dialog can fall back to a read-only summary', () => {
    expect(getEditableFields('some_future_tool', { x: 1 })).toEqual([])
  })
})

describe('approval-display — applyFieldEdits', () => {
  it('merges edited values back into args, preserving internal fields (contextId, documentId, pulseType)', () => {
    const original = {
      pulseType: 'GoalPulse',
      title: 'Ship migration',
      content: 'Cut over.',
      contextId: 'ctx_1',
      contextTitle: 'Care Practices',
      documentId: 'doc_1',
    }
    const merged = applyFieldEdits(original, {
      title: 'Ship the Q3 migration',
      content: 'Cut over before EOQ.',
    })
    expect(merged).toEqual({
      pulseType: 'GoalPulse',
      title: 'Ship the Q3 migration',
      content: 'Cut over before EOQ.',
      contextId: 'ctx_1',
      contextTitle: 'Care Practices',
      documentId: 'doc_1',
    })
    // Original is not mutated.
    expect(original.title).toBe('Ship migration')
  })

  it('coerces numeric-string edits for known numeric fields (intensity, availability)', () => {
    const merged = applyFieldEdits(
      { pulseType: 'ResourcePulse', title: 'x', content: 'y', availability: 0.5 },
      { availability: '0.75' }
    )
    expect(merged.availability).toBe(0.75)
  })

  it('drops invalid numeric edits silently (UI can re-show the original)', () => {
    const merged = applyFieldEdits(
      { pulseType: 'ResourcePulse', title: 'x', content: 'y', availability: 0.5 },
      { availability: 'not a number' }
    )
    expect(merged.availability).toBe(0.5)
  })

  it('merges an edited relationshipWhy back onto create_person args while preserving internal fields', () => {
    const original = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      contextId: 'ctx_1',
      contextTitle: 'People',
      documentId: 'doc_1',
    }
    const merged = applyFieldEdits(original, {
      relationshipWhy: 'a close collaborator',
    })
    expect(merged).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      relationshipWhy: 'a close collaborator',
      contextId: 'ctx_1',
      contextTitle: 'People',
      documentId: 'doc_1',
    })
    // Internal routing fields survive the merge so the executor still resolves
    // the context, and the original is not mutated.
    expect(merged.contextId).toBe('ctx_1')
    expect('relationshipWhy' in original).toBe(false)
  })

  it('merges an edited why back onto create_connection args while preserving internal endpoint fields', () => {
    const original = {
      toPersonId: 'person_2',
      toPersonName: 'Ashong',
      contextId: 'ctx_1',
    }
    const merged = applyFieldEdits(original, { why: 'a wise friend' })
    expect(merged).toEqual({
      toPersonId: 'person_2',
      toPersonName: 'Ashong',
      contextId: 'ctx_1',
      why: 'a wise friend',
    })
    // The resolved endpoint id (internal, never an editable field) is preserved
    // so createConnectionAuthorized can anchor the write on it.
    expect(merged.toPersonId).toBe('person_2')
    expect(merged.contextId).toBe('ctx_1')
  })
})
