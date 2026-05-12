import type { FocalEntityType } from '@/lib/focal-entity/types'

export interface SessionContextPromptInput {
  currentUserId: string | null
  spaceId: string | null
  fieldContextId: string | null
  /** Pre-resolved Space name (MeSpace/WeSpace.name). Null when not resolvable. */
  spaceName?: string | null
  /** Pre-resolved Space subtype. Null when the spaceId doesn't refer to a Space. */
  spaceType?: 'MeSpace' | 'WeSpace' | null
  /** Pre-resolved FieldContext title. Null when not resolvable. */
  fieldContextTitle?: string | null
  /**
   * Pre-resolved first name of the current user. Pairs with currentUserId so
   * the model can recognise the user by name (and avoid third-person framing
   * like "Wade's MeSpace" when Wade is the logged-in user).
   */
  currentUserName?: string | null
  /**
   * True when the active Space is owned by the current user. Drives the
   * "use 'your MeSpace', not 'Wade's MeSpace'" directive.
   */
  activeSpaceOwnedByCurrentUser?: boolean
  focalEntity: {
    type: FocalEntityType
    id: string
    label?: string
  } | null
  previousFocalEntity: {
    type: FocalEntityType
    id: string
    label?: string
  } | null
}

/**
 * Append a SESSION CONTEXT block to a mode's base system prompt.
 *
 * - currentUserId / activeSpaceId / activeFieldContextId are broad ambient
 *   scope.
 * - focalEntity is the narrowest current focus (a specific person, pulse,
 *   field, or space the user is viewing right now).
 * - previousFocalEntity, when present and different from focalEntity, drives
 *   a soft-transition acknowledgement so the assistant doesn't silently swap
 *   which person/pulse a pronoun refers to mid-conversation.
 *
 * The "NEVER ask which Space?" directive is unconditional. The focal-entity
 * pronoun-resolution and soft-transition directives only render when the
 * relevant fields are present, so older clients that don't send focal data
 * see the original prompt verbatim.
 */
export function buildSystemPromptWithSessionContext(
  basePrompt: string,
  ctx: SessionContextPromptInput
): string {
  const lines: string[] = ['## SESSION CONTEXT']
  lines.push(
    ctx.currentUserId
      ? `- currentUserId: ${ctx.currentUserId}`
      : '- currentUserId: (not authenticated)'
  )
  if (ctx.currentUserId && ctx.currentUserName) {
    lines.push(`- currentUser.name: ${ctx.currentUserName}`)
  }
  if (ctx.spaceId) {
    lines.push(`- activeSpaceId: ${ctx.spaceId}`)
    if (ctx.spaceName) {
      lines.push(`- activeSpace.name: ${ctx.spaceName}`)
    }
    if (ctx.spaceType) {
      lines.push(`- activeSpace.type: ${ctx.spaceType}`)
    }
    if (ctx.activeSpaceOwnedByCurrentUser) {
      lines.push('- activeSpace.ownedByCurrentUser: true')
    }
  } else {
    lines.push(
      '- activeSpaceId: (none — call get_my_spaces if Space scope is needed)'
    )
  }
  if (ctx.fieldContextId) {
    lines.push(`- activeFieldContextId: ${ctx.fieldContextId}`)
    if (ctx.fieldContextTitle) {
      lines.push(`- activeFieldContext.title: ${ctx.fieldContextTitle}`)
    }
  }

  if (ctx.focalEntity) {
    lines.push(`- focalEntity.type: ${ctx.focalEntity.type}`)
    lines.push(`- focalEntity.id: ${ctx.focalEntity.id}`)
    if (ctx.focalEntity.label) {
      lines.push(`- focalEntity.label: ${ctx.focalEntity.label}`)
    }
  }

  const focalShifted =
    ctx.previousFocalEntity &&
    ctx.focalEntity &&
    (ctx.previousFocalEntity.id !== ctx.focalEntity.id ||
      ctx.previousFocalEntity.type !== ctx.focalEntity.type)

  if (focalShifted && ctx.previousFocalEntity) {
    lines.push(`- previousFocalEntity.type: ${ctx.previousFocalEntity.type}`)
    lines.push(`- previousFocalEntity.id: ${ctx.previousFocalEntity.id}`)
    if (ctx.previousFocalEntity.label) {
      lines.push(
        `- previousFocalEntity.label: ${ctx.previousFocalEntity.label}`
      )
    }
  }

  lines.push('')
  lines.push(
    'IMPORTANT: Do NOT ask the user which Space to look in. Use activeSpaceId when present. ' +
      'If activeSpaceId is missing and the user asks about "my spaces" / "my pulses" / Space-scoped ' +
      'data, call get_my_spaces first and proceed with the resolved Space. Pass spaceId to any tool ' +
      'parameter that accepts it.'
  )

  if (ctx.currentUserId && ctx.currentUserName) {
    lines.push('')
    const ownedClause = ctx.activeSpaceOwnedByCurrentUser
      ? ` The active Space is owned by ${ctx.currentUserName} — refer to it as "your MeSpace" / "your space", NOT as "${ctx.currentUserName}'s MeSpace".`
      : ''
    lines.push(
      `USER IDENTITY: The current user's name is ${ctx.currentUserName} (currentUserId above). ` +
        `When addressing or referring to them, use "you" / "your" — do NOT speak about ${ctx.currentUserName} ` +
        `in the third person, even if their name appears inside another entity's label (e.g. a Space named ` +
        `"${ctx.currentUserName}'s MeSpace" still belongs to "you").${ownedClause}`
    )
  }

  lines.push('')
  lines.push(
    'NEVER expose raw IDs to the user in your replies. Raw IDs look like ' +
      '"me_a87c5bf1-6ab3-...", "ws_...", "ctx_...", "pulse_..." — they are ' +
      'internal artifacts and must never appear in chat text. When you need ' +
      'to refer to an entity, ALWAYS use its human-readable name. Names are ' +
      'available in SESSION CONTEXT next to ids (activeSpace.name, ' +
      'activeFieldContext.title, focalEntity.label). When you only have an id, ' +
      'call the appropriate tool first (e.g. get_my_spaces, search_space, ' +
      'search_field_context) to resolve the name BEFORE replying.'
  )

  if (ctx.focalEntity) {
    lines.push('')
    lines.push(
      'FOCAL ENTITY: The user is currently viewing the entity described by focalEntity.* above. ' +
        'When the user uses pronouns ("this", "they", "here", "this person", "this goal") or asks an open ' +
        'question ("tell me about this", "what should I do here", "summarize"), call get_focal_entity ' +
        'first and ground your answer in the returned record. Do NOT ask "which person/goal/space do ' +
        'you mean?" — the focal entity is the answer.'
    )
  }

  if (focalShifted && ctx.previousFocalEntity && ctx.focalEntity) {
    lines.push('')
    lines.push(
      'FOCAL SHIFT: The user has navigated from previousFocalEntity to focalEntity since the previous ' +
        'assistant turn. Before grounding pronoun references in the new focal entity, briefly acknowledge ' +
        'the shift in your reply, e.g. "I see you\'ve moved from ' +
        `${ctx.previousFocalEntity.label ?? ctx.previousFocalEntity.type} to ` +
        `${ctx.focalEntity.label ?? ctx.focalEntity.type} — were you asking about the one on screen, or ` +
        'the earlier one?" Then proceed once the user confirms (or treat silence as "the current one").'
    )
  }

  return `${basePrompt}\n\n${lines.join('\n')}`
}
