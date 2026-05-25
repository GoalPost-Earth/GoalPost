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
  /**
   * Which canvas surface the user is looking at right now. Lets the
   * assistant say "the FieldContext on your Bloom canvas" instead of
   * generic "the FieldContext."
   */
  canvasView?: 'dashboard' | 'graph' | 'bloom' | null
  /**
   * Everything currently rendered on the canvas (Bloom cluster,
   * Graph nodes, Dashboard cards). The model should resolve user
   * mentions against this list BEFORE issuing a fresh graph search
   * — if "JD's Tech Lab" is already on screen, there's no need to
   * call query_for_bloom or search_space.
   */
  canvasVisibleEntities?: Array<{
    id: string
    name: string
    type: string
    source: 'dashboard' | 'graph' | 'bloom'
  }>
  /**
   * Temporal trail of entities the user has focused this session, oldest
   * first. The last entry is the current focal entity (also present as
   * focalEntity above) — kept here so the model can see the sequence.
   *
   * Per Rule 2 (kb/07-ai-assistant-ux.md), every entry passed in MUST
   * have a label resolved client-side. The caller is responsible for
   * filtering out entries without labels before invoking this builder.
   */
  navigationHistory?: Array<{
    type: FocalEntityType
    id: string
    label?: string
    visitedAt: string
  }>
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

  // Canvas snapshot — what the user can actually see right now.
  // Rendered as a compact block of `- name (type, source) [id]` lines so
  // the model can scan it cheaply. Capped at 40 entries to keep the
  // prompt small; if the user has a larger graph open, the assistant
  // can still call query_for_bloom for entities not in the snapshot.
  const visible = (ctx.canvasVisibleEntities ?? []).slice(0, 40)
  if (ctx.canvasView || visible.length > 0) {
    lines.push('')
    lines.push('## CANVAS CONTEXT')
    if (ctx.canvasView) {
      lines.push(`- canvasView: ${ctx.canvasView}`)
    }
    if (visible.length === 0) {
      lines.push('- canvasVisibleEntities: (nothing rendered on the canvas)')
    } else {
      lines.push(`- canvasVisibleEntities (${visible.length}):`)
      for (const entity of visible) {
        lines.push(
          `  - ${entity.name} (${entity.type}, source=${entity.source}) [id=${entity.id}]`
        )
      }
    }
    if (
      (ctx.canvasVisibleEntities?.length ?? 0) > visible.length
    ) {
      lines.push(
        `  - …${(ctx.canvasVisibleEntities?.length ?? 0) - visible.length} more entities visible on the canvas, not listed`
      )
    }
    lines.push('')
    lines.push(
      'CANVAS-FIRST RESOLUTION: When the user names or describes something, FIRST check ' +
        'canvasVisibleEntities above. If a match exists (case-insensitive name match, or a ' +
        'clear paraphrase), the entity is ALREADY on screen — use its id directly. Do not ' +
        'call search_* or query_for_bloom to re-discover it. Only fall back to a graph search ' +
        'when no canvas-visible entity matches.'
    )
    lines.push('')
    lines.push(
      'BUT: an EXPANSION request rooted on a canvas-visible entity is NOT a duplicate. ' +
        'When the user says "dive into X", "explore X", "X\'s relationships", "X\'s connections", ' +
        '"what is X connected to", "expand X", or any phrasing that asks for MORE around an ' +
        'entity already on screen — call query_for_bloom with an intent that names the focal ' +
        'entity AND its id, and asks for an expansive sweep. Read the Cypher generator\'s Intent ' +
        'Glossary for what "X\'s relationships" should mean (NOT just ResonanceLink nodes — ' +
        'everything reachable in 1-2 hops the current user can see).'
    )
    lines.push('')
    lines.push(
      'PATH-FINDING between two named entities ("how is X connected to Y?", "what\'s the path ' +
        'between X and Y?", "how is X related to Y?") is ALSO query_for_bloom, not graph_rag_search. ' +
        'Pass an intent like "shortest path between <X name> and <Y name>". The generator emits a ' +
        '`shortestPath` query that ALWAYS returns both endpoint nodes — even when no path exists ' +
        'in the user\'s visible graph — so the canvas shows X and Y side-by-side regardless. When ' +
        'no path is found, narrate "I can see both X and Y, but I can\'t see a connection between ' +
        'them in your graph"; do NOT claim a tool failure.'
    )
  }

  // Navigation history — the temporal trail of focal entities the user has
  // visited this session. Surfaces sequence ("you were just on X before
  // this") so the model can answer "what was I just looking at?" or
  // "compare this to the last pulse I clicked" without an extra round
  // trip. Capped at 8 entries to keep the prompt small; the breadcrumb
  // UI persists more.
  const history = (ctx.navigationHistory ?? []).slice(-8)
  if (history.length > 1) {
    lines.push('')
    lines.push('## NAVIGATION HISTORY')
    lines.push(
      `- The user has visited ${history.length} focal entities this session, oldest first:`
    )
    history.forEach((entry, idx) => {
      const marker = idx === history.length - 1 ? ' (current)' : ''
      lines.push(
        `  ${idx + 1}. ${entry.label} — ${entry.type} [id=${entry.id}]${marker}`
      )
    })
    lines.push('')
    lines.push(
      'NAVIGATION-HISTORY USE: When the user asks about a prior view ("what was I just on", ' +
        '"the last pulse I clicked", "go back to that field", "the one before this"), resolve ' +
        'against the trail above before asking for clarification. Refer to entries by their ' +
        'human label (never the id). If the user asks for an action on a prior entity, you ' +
        'still need the appropriate write tool — the trail is recall only, not a navigation tool.'
    )
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

  lines.push('')
  lines.push(
    'FORMAT REPLIES AS MARKDOWN. The chat renders GitHub-flavored markdown, ' +
      'so use it to make replies scannable: ' +
      '(a) use `- ` bullet lists when you enumerate 2+ items (resources, ' +
      'people, spaces, options, next steps); ' +
      '(b) use `1.` numbered lists when order matters or you offer choices; ' +
      '(c) use `**bold**` for entity names and key phrases the user will scan for; ' +
      '(d) separate paragraphs with a blank line, never a single newline — single ' +
      'newlines collapse to spaces; ' +
      '(e) keep paragraphs short (1–3 sentences). ' +
      'Do NOT narrate failed tool calls or retries as part of the reply — surface ' +
      'them only if the user-visible answer depends on the failure.'
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
