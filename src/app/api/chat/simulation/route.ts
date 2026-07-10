/**
 * Multi-Mode Chat API Route
 * Supports: default (Standard), aiden (Inquiry), braider (Presence)
 *
 * OpenAI endpoint with LangChain best practices:
 * - Tools are ALWAYS available (never disabled)
 * - Clear, directive system prompts per mode
 * - Structured tool responses (JSON) for LLM to interpret
 * - Tools return data, LLM formats in appropriate voice
 * - OpenAI has native tool calling support
 *
 * Three modes:
 * 1. default: Get the facts from the database
 * 2. aiden: Question the frame before answering
 * 3. braider: Stay with this instead of fixing it
 *
 * Usage:
 * POST /api/chat/simulation
 * Body: { messages: ChatMessage[], mode?: 'default'|'aiden'|'braider', config?: SimulationConfig }
 */

import { openai } from '@ai-sdk/openai'
import { streamText, generateText, stepCountIs } from 'ai'
import {
  assistantModeManager,
  buildMessagePayload,
  SYSTEM_PROMPTS,
  getLastUserMessage,
} from '@/lib/simulation'
import type {
  ChatMessage,
  SimulationConfig,
  AssistantMode,
} from '@/lib/simulation'
import { buildSimulationChatTools } from '@/lib/simulation/chat-tools'
import {
  getAssistantModelId,
  getAssistantReasoningEffort,
} from '@/lib/llm/factory'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import {
  buildApprovedActionHashSet,
  executeAuthorizedWriteTool,
  isWriteToolName,
  type ApprovedAction,
  type WriteToolName,
} from '@/lib/chat/hitl'
import { initGraph } from '@/modules/graph'
import {
  isFocalEntityType,
  type FocalEntityType,
} from '@/lib/focal-entity/types'
import { buildSystemPromptWithSessionContext } from '@/lib/simulation/session-context-prompt'
import {
  resolveSessionContextNames,
  type ResolvedSessionContextNames,
} from '@/lib/simulation/session-context-resolve'
import {
  appendConversationTurn,
  setConversationThreadTitle,
} from '@/lib/simulation/conversation-thread.service'
import { randomUUID } from 'node:crypto'
import { detectAutoSignals } from '@/lib/feedback/auto-detect'
import { createAssistantFeedback } from '@/lib/feedback/assistant-feedback.service'
import { recordAiSdkUsage } from '@/lib/llm/usage/record-ai-sdk-usage'

// Allow streaming responses up to 60 seconds (different modes may be verbose)
export const maxDuration = 60

interface FocalEntityPayload {
  type: FocalEntityType
  id: string
  label?: string
}

interface MessagePart {
  type: string
  text?: string
}

interface IncomingMessage {
  role: string
  content?: string | MessagePart[]
  parts?: MessagePart[]
  id?: string
}

/**
 * Convert assistant-ui message format to AI SDK format
 * assistant-ui sends: { role, parts: [{ type, text }], id }
 * AI SDK expects: { role, content: string }
 */
function convertToAISDKMessages(messages: IncomingMessage[]): ChatMessage[] {
  return messages.map((msg) => {
    // If message already has content string, return as-is
    if (typeof msg.content === 'string') {
      return msg as ChatMessage
    }

    // If message has parts array, extract text content
    if (msg.parts && Array.isArray(msg.parts)) {
      const textContent = msg.parts
        .filter((part: MessagePart) => part.type === 'text')
        .map((part: MessagePart) => part.text || '')
        .join('')

      return {
        role: msg.role,
        content: textContent,
      } as ChatMessage
    }

    // If message has content array (assistant-ui format), extract text
    if (Array.isArray(msg.content)) {
      const textContent = msg.content
        .filter((part: MessagePart) => part.type === 'text')
        .map((part: MessagePart) => part.text || '')
        .join('')

      return {
        role: msg.role,
        content: textContent,
      } as ChatMessage
    }

    // Fallback: return empty content
    console.warn('[convertToAISDKMessages] Unknown message format:', msg)
    return {
      role: msg.role,
      content: '',
    } as ChatMessage
  })
}

/**
 * Run the pure auto-detectors against the persisted assistant turn and
 * write one `AssistantFeedback` row per fired signal. Best-effort — any
 * Neo4j hiccup is logged and swallowed; the chat UX must not block on
 * feedback persistence.
 */
async function emitAutoSignals(
  assistantTurnId: string,
  parts: unknown
): Promise<void> {
  const signals = detectAutoSignals(parts)
  if (signals.length === 0) return
  await Promise.all(
    signals.map((signal) =>
      createAssistantFeedback({
        turnId: assistantTurnId,
        rating: signal.rating,
        source: signal.source,
        autoSignal: signal.autoSignal,
        ruleViolated: signal.ruleViolated ?? null,
      }).catch((error) => {
        console.warn(
          '[Chat Simulation] auto-signal write failed:',
          signal.autoSignal,
          error instanceof Error ? error.message : error
        )
      })
    )
  )
}

export async function POST(req: Request) {
  // Phase 0 latency instrumentation. We want to know how much wall-clock the
  // request spends BEFORE the model starts streaming — that pre-LLM overhead
  // (session-context Neo4j resolve + tool-registry build) is the budget any
  // future latency work (parallelising/caching the resolve) can claw back. The
  // model's own time-to-first-token is logged separately via onChunk below.
  const requestStartedAt = performance.now()
  const sinceStart = () => Math.round(performance.now() - requestStartedAt)
  try {
    const body = (await req.json()) as {
      messages: IncomingMessage[]
      mode?: AssistantMode
      config?: Partial<SimulationConfig>
      currentUserId?: string
      spaceId?: string
      fieldContextId?: string
      /**
       * Phase 1a latency hints — names the client already knows for the ambient
       * ids above. When every present id carries its hint, the route skips the
       * server-side Neo4j name resolve entirely; otherwise it falls back to the
       * authoritative DB query. COSMETIC-ONLY (assistant phrasing), never used
       * for authorization — tool access stays gated by currentUserId +
       * canViewContent server-side. An older client that omits this just gets
       * the DB path, unchanged.
       */
      sessionNames?: {
        currentUserName?: string | null
        spaceName?: string | null
        spaceType?: 'MeSpace' | 'WeSpace' | null
        fieldContextTitle?: string | null
        spaceOwnedByCurrentUser?: boolean | null
      } | null
      focalEntity?: FocalEntityPayload | null
      previousFocalEntity?: FocalEntityPayload | null
      approvedActions?: ApprovedAction[]
      /**
       * One-shot deterministic HITL execution (GOAL-261). Sent ONLY on the
       * turn where the user clicks Approve on an inline approval card, carrying
       * the exact (tool, args) captured when the action was proposed. The route
       * executes it directly instead of relying on the model to re-emit a tool
       * call with byte-identical args (which it does not, producing an approval
       * loop). Never replayed — the client clears it after a single send.
       */
      executeAction?: { tool: string; args: Record<string, unknown> } | null
      /**
       * Batch variant of executeAction (GOAL-272 multi-select pulse accept).
       * Multiple approved (tool, args) executed together on ONE turn — firing a
       * separate turn per action races assistant-ui's MessageRepository
       * (duplicate message id → crash). A single approval arrives as a
       * one-element array. Legacy `executeAction` (single) is still accepted.
       */
      executeActions?: Array<{
        tool: string
        args: Record<string, unknown>
      }> | null
      threadId?: string
      /**
       * Which canvas surface the user is on right now (dashboard /
       * bloom). Surfaced into SESSION CONTEXT so the assistant can
       * describe actions in terms the user sees.
       */
      canvasView?: 'dashboard' | 'bloom' | null
      /**
       * Flat list of every entity currently rendered somewhere on
       * the canvas, published by the view components via
       * VisibleEntitiesProvider. Lets the assistant resolve user
       * mentions ("show me JD's Tech Lab") against entities already
       * on screen before falling back to a fresh graph search.
       */
      canvasVisibleEntities?: Array<{
        id: string
        name: string
        type: string
        source: 'dashboard' | 'bloom'
      }>
      /**
       * Temporal trail of focal entities the user has visited in this
       * session (oldest first). Drives the breadcrumb in the studio
       * chrome and lets the assistant answer questions like "what was
       * I just looking at?" or "go back to that pulse" without
       * forcing the user to restate the entity. Client filters out
       * entries without resolved labels (Rule 2 — no bare ids in
       * SESSION CONTEXT).
       */
      navigationHistory?: Array<{
        type: FocalEntityType
        id: string
        label?: string
        visitedAt: string
      }>
    }
    const {
      messages,
      mode,
      config,
      currentUserId: clientProvidedUserId,
      spaceId,
      fieldContextId,
      approvedActions,
      executeAction,
      executeActions,
      threadId,
      canvasView,
      canvasVisibleEntities,
      navigationHistory,
    } = body

    const focalEntity =
      body.focalEntity && isFocalEntityType(body.focalEntity.type)
        ? body.focalEntity
        : null
    const previousFocalEntity =
      body.previousFocalEntity &&
      isFocalEntityType(body.previousFocalEntity.type)
        ? body.previousFocalEntity
        : null

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Resolve current user ONLY from the verified Authorization header / cookie.
    // NEVER trust a client-supplied user id from the body: tool authorization
    // (and Space-scoped pulse/people reads) attach to this id, so honoring a
    // body value would let any caller act as — and read the private data of —
    // any user. The body's `currentUserId`, if present and mismatched, is a
    // spoofing signal we log and ignore.
    const currentUserId: string | null = resolveAuthenticatedUserId(req)
    if (
      clientProvidedUserId &&
      clientProvidedUserId !== currentUserId
    ) {
      console.warn(
        '[chat/simulation] Ignoring body currentUserId that does not match the authenticated user.'
      )
    }

    // Deterministic HITL execution (GOAL-261). When the user approves a pending
    // write, the client sends the exact approved (tool, args) — captured at
    // proposal time — as a one-shot `executeAction`. Execute it directly here
    // rather than nudging the model to re-emit a matching tool call: the model
    // varies its args between turns, so the hash gate never matches and the
    // assistant re-asks for approval forever (the reported loop). Running the
    // approved args verbatim is fully deterministic. The result is fed to the
    // model as a note so it narrates the outcome without calling any tools; the
    // HITL gate still blocks any accidental re-call (it would just re-prompt,
    // never double-write).
    // Normalize the single (legacy) and batch (GOAL-272) forms into one list of
    // approved writes to run this turn. Each is executed verbatim; results are
    // summarized into a single note the model narrates without calling tools.
    const pendingWrites = (
      executeActions && executeActions.length > 0
        ? executeActions
        : executeAction
          ? [executeAction]
          : []
    ).filter((a) => a && isWriteToolName(a.tool))

    let executedActionNote: string | null = null
    if (pendingWrites.length > 0) {
      // Rule 1: a few service messages embed raw entity ids (e.g. "Update pulse
      // pulse_…"). Scrub them before the text enters the model context — the
      // model must never see, and so never echo, an internal id.
      const stripIds = (text: string): string =>
        text.replace(
          /\b(?:pulse|context|ctx|me|ws|space|person|log|context_context)_[A-Za-z0-9-]+/g,
          'that item'
        )
      const successes: string[] = []
      const failures: string[] = []
      try {
        const graph = await initGraph()
        for (const action of pendingWrites) {
          try {
            const execResult = await executeAuthorizedWriteTool(
              graph,
              currentUserId,
              action.tool as WriteToolName,
              action.args || {}
            )
            const detail =
              typeof execResult?.message === 'string' &&
              execResult.message.trim()
                ? stripIds(execResult.message.trim())
                : execResult?.success === true
                  ? 'The change was saved.'
                  : 'The change could not be completed.'
            if (execResult?.success === true) successes.push(detail)
            else failures.push(detail)
          } catch (error) {
            console.warn(
              '[Chat Simulation] executeAction failed:',
              error instanceof Error ? error.message : error
            )
            failures.push('One change could not be completed due to an error.')
          }
        }
      } catch (error) {
        console.warn(
          '[Chat Simulation] executeAction batch failed:',
          error instanceof Error ? error.message : error
        )
        failures.push(
          'The changes could not be executed due to a system error.'
        )
      }

      // Build one note covering all writes so the model confirms in a single
      // short reply (whether 1 or N succeeded, and whether any failed).
      const parts: string[] = []
      if (successes.length > 0) {
        parts.push(
          `[ACTIONS COMPLETED] The user approved ${successes.length} ${
            successes.length === 1 ? 'change' : 'changes'
          } and ${successes.length === 1 ? 'it has' : 'they have'} just been executed successfully: ${successes.join(
            ' '
          )} Confirm this to the user in one short, warm sentence (you may list what was added by name). Do NOT call any tools — the actions are already done.`
        )
      }
      if (failures.length > 0) {
        parts.push(
          `[ACTIONS NOT COMPLETED] ${failures.length} ${
            failures.length === 1 ? 'change' : 'changes'
          } could not be completed: ${failures.join(
            ' '
          )} Briefly tell the user what happened and suggest a next step. Do NOT call a write tool again without a fresh confirmation.`
        )
      }
      executedActionNote = parts.join('\n\n') || null
    }

    // Set mode if provided, otherwise use current mode
    if (mode && ['default', 'aiden', 'braider'].includes(mode)) {
      assistantModeManager.setMode(mode)
    }

    // Convert assistant-ui format to AI SDK format
    const convertedMessages = convertToAISDKMessages(messages)

    // Resolve assistant model once. config.model wins (per-mode override),
    // otherwise OPENAI_ASSISTANT_MODEL env, otherwise the project default.
    const modelName = getAssistantModelId(config?.model)

    console.log('[Chat API] Request:', {
      mode: assistantModeManager.getMode(),
      messageCount: convertedMessages.length,
      model: modelName,
      hasUser: !!currentUserId,
      spaceId: spaceId || null,
      fieldContextId: fieldContextId || null,
      focalEntity,
      hasPreviousFocal: !!previousFocalEntity,
      approvedActionCount: approvedActions?.length ?? 0,
    })

    // Build message payload with mode context
    const messagesWithSimulation = buildMessagePayload(convertedMessages)

    // Increment message count
    assistantModeManager.incrementMessageCount()

    // Configure OpenAI model.
    // Note: `config.temperature` is intentionally ignored — gpt-5.x assistant
    // models are reasoning models routed through OpenAI's Responses API, which
    // rejects `temperature` (use `reasoning.effort` to tune output instead).
    const model = openai(modelName)
    const shouldStream = config?.stream !== false // Default to true

    // Get system prompt based on current mode, then append session context so
    // the model knows which Space/FieldContext to scope tool calls to.
    const currentMode = assistantModeManager.getMode()
    const basePrompt = SYSTEM_PROMPTS[currentMode]
    // Phase 1a: prefer the client-sent name hints and skip the Neo4j resolve
    // when every PRESENT id already carries its hint. The moment any present id
    // is missing its name, fall back to the authoritative DB query — so the
    // field-in-space case (space name not known client-side) and older clients
    // that send no hints are never degraded. Hints are cosmetic (phrasing), so
    // trusting them here cannot affect tool authorization.
    const sessionNames = body.sessionNames ?? null
    const hintSpaceType =
      sessionNames?.spaceType === 'MeSpace' ||
      sessionNames?.spaceType === 'WeSpace'
        ? sessionNames.spaceType
        : null
    // The DB resolve is only worth its round-trip when it can supply something
    // the client couldn't. A hint-capable client already sends currentUserName
    // from the same Person.firstName the DB would return, so a missing user
    // name does NOT justify a DB hit — only a missing Space/Field name (which
    // the client genuinely may not know, e.g. field-in-space via URL) does.
    // A client that sends no hints at all gets the old behavior: resolve
    // whenever any id is present.
    const needsDbResolve = sessionNames
      ? (!!spaceId && !sessionNames.spaceName) ||
        (!!fieldContextId && !sessionNames.fieldContextTitle)
      : !!currentUserId || !!spaceId || !!fieldContextId
    const resolveStartedAt = performance.now()
    const resolvedNames: ResolvedSessionContextNames = needsDbResolve
      ? await resolveSessionContextNames(
          spaceId || null,
          fieldContextId || null,
          currentUserId
        )
      : {
          activeSpaceName: sessionNames?.spaceName ?? null,
          activeSpaceType: hintSpaceType,
          activeFieldContextTitle: sessionNames?.fieldContextTitle ?? null,
          currentUserName: sessionNames?.currentUserName ?? null,
          activeSpaceOwnedByCurrentUser: Boolean(
            sessionNames?.spaceOwnedByCurrentUser
          ),
        }
    const resolveMs = Math.round(performance.now() - resolveStartedAt)
    const resolveSource = needsDbResolve ? 'db' : 'client-hints'
    const sessionSystemPrompt = buildSystemPromptWithSessionContext(
      basePrompt,
      {
        currentUserId,
        spaceId: spaceId || null,
        fieldContextId: fieldContextId || null,
        spaceName: resolvedNames.activeSpaceName,
        spaceType: resolvedNames.activeSpaceType,
        fieldContextTitle: resolvedNames.activeFieldContextTitle,
        currentUserName: resolvedNames.currentUserName,
        activeSpaceOwnedByCurrentUser:
          resolvedNames.activeSpaceOwnedByCurrentUser,
        focalEntity,
        previousFocalEntity,
        canvasView: canvasView ?? null,
        canvasVisibleEntities: canvasVisibleEntities ?? [],
        navigationHistory: (navigationHistory ?? []).filter(
          (entry) => isFocalEntityType(entry.type) && Boolean(entry.label)
        ),
      }
    )
    // Append the executed-action outcome (if any) so the model narrates the
    // result of a just-approved write instead of re-proposing it (GOAL-261).
    const systemPrompt = executedActionNote
      ? `${sessionSystemPrompt}\n\n${executedActionNote}`
      : sessionSystemPrompt

    const lastUserMessage = getLastUserMessage(convertedMessages)

    // True when the frontend sent exactly one user message — meaning this is
    // the first exchange in the thread and we should auto-generate a title once
    // the assistant responds. assistant-ui sends the full history every request,
    // so length === 1 reliably identifies the first turn.
    const isFirstExchange = convertedMessages.length === 1

    // Persist the user's turn as soon as we receive it. Fire-and-forget — a
    // Neo4j hiccup must NOT block the assistant response, but we log so
    // ops can catch sustained failures. The matching assistant turn is
    // saved from streamText's onFinish callback below.
    const incomingMessage = body.messages[body.messages.length - 1]
    if (currentUserId && lastUserMessage) {
      void appendConversationTurn(
        currentUserId,
        {
          role: 'user',
          content: lastUserMessage,
          parts: incomingMessage?.parts ?? incomingMessage?.content ?? null,
        },
        threadId
      ).catch((error) => {
        console.warn(
          '[Chat Simulation] Failed to persist user turn:',
          error instanceof Error ? error.message : error
        )
      })
    }

    const toolsStartedAt = performance.now()
    const tools = await buildSimulationChatTools({
      currentUserId,
      spaceId: spaceId || null,
      fieldContextId: fieldContextId || null,
      focalEntity,
      approvedActionHashes: buildApprovedActionHashSet(approvedActions),
      spaceName: resolvedNames.activeSpaceName,
      spaceType: resolvedNames.activeSpaceType,
      fieldContextTitle: resolvedNames.activeFieldContextTitle,
      currentUserName: resolvedNames.currentUserName,
      canvasView: canvasView ?? null,
      canvasVisibleEntities: canvasVisibleEntities ?? [],
    })
    const toolsMs = Math.round(performance.now() - toolsStartedAt)

    console.log('🔍 [DEBUG] Current mode:', currentMode)
    console.log('📝 [DEBUG] Last user message:', lastUserMessage)
    console.log('🔍 [DEBUG] System prompt selected for mode:', currentMode)

    // On an executeAction turn the approved write has ALREADY run
    // deterministically above. The model's only job now is to narrate the
    // outcome — so withhold the tool set entirely. This is the belt-and-
    // suspenders that closes GOAL-261: even when the deterministic execution
    // FAILS, the model cannot "rescue" it by re-emitting the write and
    // rendering a fresh approval card (which is what reopened the loop). With
    // no tools, stepCountIs(1) is the correct single-step narration budget.
    const turnTools = executedActionNote ? undefined : tools
    const turnStopWhen = executedActionNote ? stepCountIs(1) : stepCountIs(8)

    // gpt-5.x assistant models reason internally before answering, which adds
    // to time-to-first-token. Cap that deliberation low for chat (the tools do
    // the work, not the model's private reasoning). Tunable via env without a
    // code change — see getAssistantReasoningEffort.
    const assistantProviderOptions = {
      openai: { reasoningEffort: getAssistantReasoningEffort() },
    }

    // Pre-LLM overhead: everything between request arrival and handing off to
    // the model. This is the latency budget the resolve/tool-build steps cost
    // us on the critical path, before the model has done anything.
    console.log('[Chat API] Pre-LLM latency (ms):', {
      resolveMs,
      resolveSource,
      toolsMs,
      preLlmTotalMs: sinceStart(),
      reasoningEffort: assistantProviderOptions.openai.reasoningEffort,
    })

    // Handle streaming
    if (shouldStream) {
      let firstChunkLogged = false
      // AI SDK v5 defaults `stopWhen` to `stepCountIs(1)`, which means the
      // stream halts after the model emits a single tool call — the model
      // never gets a follow-up step to write the user-visible text response
      // grounded in the tool result. That manifests as a blank assistant
      // bubble. Raise the budget so the model loops: tool-call → tool-result
      // → text (with room for a few sequential tool calls if needed).
      const result = streamText({
        model,
        messages: messagesWithSimulation,
        system: systemPrompt,
        tools: turnTools,
        stopWhen: turnStopWhen,
        providerOptions: assistantProviderOptions,
        // Phase 0: stamp time-to-first-token once. Includes the pre-LLM
        // overhead logged above plus the model's own latency to its first
        // emitted part — the headline number latency work should move.
        onChunk: () => {
          if (firstChunkLogged) return
          firstChunkLogged = true
          console.log('[Chat API] Time-to-first-token (ms):', sinceStart())
        },
        // GOAL-297: meter this chat turn's token spend against the
        // authenticated user. `totalUsage` aggregates every step of the
        // multi-step loop (tool-call → tool-result → text). Fire-and-forget.
        onFinish: ({ totalUsage }) => {
          void recordAiSdkUsage(totalUsage, {
            source: 'chat',
            model: modelName,
            principal: 'user',
            userId: currentUserId,
            threadId,
          })
        },
      })

      // AI SDK v5 + assistant-ui: Use toUIMessageStreamResponse for proper streaming
      // This ensures tool calls, text, and all message parts stream correctly.
      // onFinish receives the full UIMessage list; we grab the last assistant
      // message and persist it as the matching turn for the user message saved
      // above. Failure is logged but never propagated — chat UX wins.
      return result.toUIMessageStreamResponse({
        headers: {
          'X-Simulation-Mode': assistantModeManager.getMode(),
        },
        // Force the response message to carry an explicit id. Without
        // `generateMessageId`, AI SDK omits the id on streamed assistant
        // messages, which breaks the feedback pipeline — the chat UI
        // uses the message.id (= ConversationTurn.id) to attach
        // thumbs-up/down to a specific row.
        generateMessageId: () => randomUUID(),
        onFinish: ({ messages: finalMessages }) => {
          if (!currentUserId) return
          const lastAssistant = [...finalMessages]
            .reverse()
            .find((m) => m.role === 'assistant')
          if (!lastAssistant) return
          // Use the AI SDK message id (set above via generateMessageId)
          // as the ConversationTurn id. The client sees the same id via
          // the `start` UIMessageChunk before content streams, so
          // feedback can attach to the right row with no roundtrip.
          // Guard against the (theoretically impossible) empty-id case.
          const assistantTurnId =
            (typeof lastAssistant.id === 'string' && lastAssistant.id) ||
            randomUUID()
          const parts = Array.isArray(lastAssistant.parts)
            ? lastAssistant.parts
            : []
          const textContent = parts
            .filter(
              (part): part is { type: 'text'; text: string } =>
                part?.type === 'text' && typeof part.text === 'string'
            )
            .map((part) => part.text)
            .join('')
          void appendConversationTurn(
            currentUserId,
            {
              role: 'assistant',
              content: textContent,
              parts,
            },
            threadId,
            assistantTurnId
          )
            .then(() => {
              // Run auto-detect AFTER the turn is persisted so the
              // feedback rows can FK to a real ConversationTurn node.
              // Fire-and-forget: a Neo4j hiccup here must NOT propagate
              // to the user; the chat UX has already returned.
              void emitAutoSignals(assistantTurnId, parts)
            })
            .catch((error) => {
              console.warn(
                '[Chat Simulation] Failed to persist assistant turn:',
                error instanceof Error ? error.message : error
              )
            })

          // After the first exchange, auto-generate a title so the sidebar
          // shows something meaningful. Use gpt-4o-mini — cheap and fast.
          if (isFirstExchange && lastUserMessage && textContent) {
            void generateText({
              model: openai('gpt-4o-mini'),
              messages: [
                {
                  role: 'user',
                  content: `Generate a concise title (4–7 words, no quotes, no punctuation, no trailing period) that captures what this conversation is about.

User said: ${lastUserMessage.slice(0, 300)}
Assistant replied: ${textContent.slice(0, 300)}

Title:`,
                },
              ],
            })
              .then(({ text, totalUsage }) => {
                // GOAL-297: meter the title-gen call (gpt-4o-mini).
                void recordAiSdkUsage(totalUsage, {
                  source: 'title-gen',
                  model: 'gpt-4o-mini',
                  principal: 'user',
                  userId: currentUserId,
                  threadId,
                })
                const title = text
                  .trim()
                  .replace(/^["'`]|["'`]$/g, '')
                  .slice(0, 80)
                if (title) {
                  return setConversationThreadTitle(
                    currentUserId!,
                    threadId,
                    title
                  )
                }
              })
              .catch((err) => {
                console.warn(
                  '[Chat Simulation] Title generation failed:',
                  err instanceof Error ? err.message : err
                )
              })
          }
        },
      })
    }

    // Handle non-streaming response — same multi-step budget as the
    // streaming path so a tool-call-only step doesn't leave us with no text.
    const result = await generateText({
      model,
      messages: messagesWithSimulation,
      system: systemPrompt,
      tools: turnTools,
      stopWhen: turnStopWhen,
      providerOptions: assistantProviderOptions,
    })

    // GOAL-297: meter the non-streaming chat turn.
    void recordAiSdkUsage(result.totalUsage, {
      source: 'chat',
      model: modelName,
      principal: 'user',
      userId: currentUserId,
      threadId,
    })

    return new Response(
      JSON.stringify({
        role: 'assistant',
        content: result.text,
        simulationMode: assistantModeManager.getMode(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('[Simulation API] Error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    return new Response(
      JSON.stringify({
        error: 'Failed to process simulation chat request',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * GET endpoint to check/set assistant mode
 *
 * GET: Returns current mode and state
 * POST with mode param: Sets new mode (see POST handler above)
 */
export async function GET(req: Request) {
  // Support mode query parameter for setting mode
  const url = new URL(req.url)
  const modeParam = url.searchParams.get('mode') as AssistantMode | null

  if (modeParam && ['default', 'aiden', 'braider'].includes(modeParam)) {
    assistantModeManager.setMode(modeParam)
  }

  const state = assistantModeManager.getState()

  return new Response(
    JSON.stringify({
      mode: state.mode,
      messageCount: state.messageCount,
      activatedAt: state.activatedAt,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
