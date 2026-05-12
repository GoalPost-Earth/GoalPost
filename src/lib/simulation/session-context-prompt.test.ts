import { buildSystemPromptWithSessionContext } from './session-context-prompt'

const BASE = 'BASE PROMPT'

describe('buildSystemPromptWithSessionContext', () => {
  test('emits anonymous currentUserId line when not authenticated', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: null,
      spaceId: null,
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out).toContain('## SESSION CONTEXT')
    expect(out).toContain('- currentUserId: (not authenticated)')
    expect(out).toContain('- activeSpaceId: (none')
    expect(out).not.toContain('- focalEntity.type')
    expect(out).not.toContain('- previousFocalEntity')
    expect(out).not.toContain('FOCAL ENTITY:')
    expect(out).not.toContain('FOCAL SHIFT:')
  })

  test('emits currentUserId, activeSpaceId, and activeFieldContextId when provided', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: 'space-1',
      fieldContextId: 'ctx-1',
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out).toContain('- currentUserId: u-1')
    expect(out).toContain('- activeSpaceId: space-1')
    expect(out).toContain('- activeFieldContextId: ctx-1')
  })

  test('emits focalEntity block and FOCAL ENTITY directive when focal is set', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: 'space-1',
      fieldContextId: null,
      focalEntity: {
        type: 'PersonPulse',
        id: 'p-99',
        label: 'Sarah Chen',
      },
      previousFocalEntity: null,
    })
    expect(out).toContain('- focalEntity.type: PersonPulse')
    expect(out).toContain('- focalEntity.id: p-99')
    expect(out).toContain('- focalEntity.label: Sarah Chen')
    expect(out).toContain('FOCAL ENTITY:')
    expect(out).not.toContain('FOCAL SHIFT:')
    expect(out).not.toContain('- previousFocalEntity')
  })

  test('omits focalEntity.label line when label is undefined', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: null,
      fieldContextId: null,
      focalEntity: { type: 'GoalPulse', id: 'g-1' },
      previousFocalEntity: null,
    })
    expect(out).toContain('- focalEntity.type: GoalPulse')
    expect(out).toContain('- focalEntity.id: g-1')
    expect(out).not.toContain('- focalEntity.label')
  })

  test('emits FOCAL SHIFT block when previous differs from current', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: null,
      fieldContextId: null,
      focalEntity: { type: 'PersonPulse', id: 'b', label: 'Bob' },
      previousFocalEntity: { type: 'PersonPulse', id: 'a', label: 'Alice' },
    })
    expect(out).toContain('- previousFocalEntity.id: a')
    expect(out).toContain('- previousFocalEntity.label: Alice')
    expect(out).toContain('FOCAL SHIFT:')
    expect(out).toContain('Alice to Bob')
  })

  test('does NOT emit FOCAL SHIFT when previous matches current', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: null,
      fieldContextId: null,
      focalEntity: { type: 'PersonPulse', id: 'a' },
      previousFocalEntity: { type: 'PersonPulse', id: 'a' },
    })
    expect(out).not.toContain('FOCAL SHIFT:')
    expect(out).not.toContain('- previousFocalEntity')
  })

  test('does NOT emit FOCAL SHIFT when previous is set but current is null', () => {
    // Treat "no current focal" as "no shift to acknowledge" — the model has no
    // new entity to point at, so silence is the right behavior.
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: null,
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: { type: 'PersonPulse', id: 'a', label: 'Alice' },
    })
    expect(out).not.toContain('FOCAL SHIFT:')
    expect(out).not.toContain('- previousFocalEntity')
  })

  test('falls back to type when previous label is missing in the shift line', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: null,
      fieldContextId: null,
      focalEntity: { type: 'GoalPulse', id: 'g2' },
      previousFocalEntity: { type: 'GoalPulse', id: 'g1' },
    })
    expect(out).toContain('FOCAL SHIFT:')
    expect(out).toContain('GoalPulse to GoalPulse')
  })

  test('always emits the "NEVER ask which Space" directive', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: null,
      spaceId: null,
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out).toContain('Do NOT ask the user which Space')
  })

  test('always emits the "NEVER expose raw IDs" directive', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: null,
      spaceId: null,
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out).toContain('NEVER expose raw IDs')
  })

  test('emits activeSpace.name and .type when spaceName/spaceType provided', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: 'me_abc',
      fieldContextId: null,
      spaceName: 'My MeSpace',
      spaceType: 'MeSpace',
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out).toContain('- activeSpaceId: me_abc')
    expect(out).toContain('- activeSpace.name: My MeSpace')
    expect(out).toContain('- activeSpace.type: MeSpace')
  })

  test('omits activeSpace.name when spaceName is missing', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: 'me_abc',
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out).toContain('- activeSpaceId: me_abc')
    expect(out).not.toContain('- activeSpace.name')
    expect(out).not.toContain('- activeSpace.type')
  })

  test('emits activeFieldContext.title when fieldContextTitle is provided', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: null,
      fieldContextId: 'ctx_xyz',
      fieldContextTitle: 'Care Practices',
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out).toContain('- activeFieldContextId: ctx_xyz')
    expect(out).toContain('- activeFieldContext.title: Care Practices')
  })

  test('emits currentUser.name and USER IDENTITY directive when currentUserName is provided', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      currentUserName: 'Wade',
      spaceId: null,
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out).toContain('- currentUser.name: Wade')
    expect(out).toContain('USER IDENTITY:')
    expect(out).toContain("The current user's name is Wade")
    expect(out).toContain('use "you" / "your"')
  })

  test('emits the "your MeSpace" clause only when activeSpaceOwnedByCurrentUser is true', () => {
    const owned = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      currentUserName: 'Wade',
      spaceId: 'me_abc',
      spaceName: "Wade's MeSpace",
      spaceType: 'MeSpace',
      activeSpaceOwnedByCurrentUser: true,
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(owned).toContain('- activeSpace.ownedByCurrentUser: true')
    expect(owned).toContain('refer to it as "your MeSpace"')

    const notOwned = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      currentUserName: 'Wade',
      spaceId: 'ws_xyz',
      spaceName: 'Climbing Crew',
      spaceType: 'WeSpace',
      activeSpaceOwnedByCurrentUser: false,
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(notOwned).not.toContain('- activeSpace.ownedByCurrentUser')
    expect(notOwned).not.toContain('refer to it as "your MeSpace"')
  })

  test('omits currentUser.name and USER IDENTITY when name is missing', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: 'u-1',
      spaceId: null,
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out).not.toContain('- currentUser.name')
    expect(out).not.toContain('USER IDENTITY:')
  })

  test('omits USER IDENTITY when the user is not authenticated', () => {
    const out = buildSystemPromptWithSessionContext(BASE, {
      currentUserId: null,
      currentUserName: 'Wade',
      spaceId: null,
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out).not.toContain('- currentUser.name')
    expect(out).not.toContain('USER IDENTITY:')
  })

  test('preserves the base prompt verbatim ahead of the SESSION CONTEXT block', () => {
    const out = buildSystemPromptWithSessionContext('CUSTOM BASE', {
      currentUserId: null,
      spaceId: null,
      fieldContextId: null,
      focalEntity: null,
      previousFocalEntity: null,
    })
    expect(out.startsWith('CUSTOM BASE\n\n## SESSION CONTEXT')).toBe(true)
  })
})
