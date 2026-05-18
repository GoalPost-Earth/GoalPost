import { randomUUID } from 'node:crypto'
import {
  buildPendingApprovalResult,
  type PendingApprovalResult,
  type WriteToolName,
} from '@/lib/chat/hitl'

/**
 * Doc ingestion synthesizes assistant ConversationTurns whose `parts` JSON
 * must hydrate into the HITL Dialog identically to what the live chat route
 * persists from streamText's onFinish. The shape contract is pinned in
 * synthesized-turn-appender.test.ts and hitl.test.ts; never bypass these
 * helpers when writing new doc-ingestion code.
 */

export interface SynthesizedToolCall {
  tool: WriteToolName
  args: Record<string, unknown>
}

/** AI SDK v5 tool UIMessagePart with state 'output-available'. */
export interface PendingToolCallPart {
  type: `tool-${WriteToolName}`
  toolCallId: string
  state: 'output-available'
  input: Record<string, unknown>
  output: PendingApprovalResult
}

export interface TextPart {
  type: 'text'
  text: string
}

export type SynthesizedAssistantPart = PendingToolCallPart | TextPart

export function buildPendingToolCallPart(
  tool: WriteToolName,
  args: Record<string, unknown>
): PendingToolCallPart {
  return {
    type: `tool-${tool}` as `tool-${WriteToolName}`,
    toolCallId: `synth_${randomUUID()}`,
    state: 'output-available',
    input: args,
    output: buildPendingApprovalResult(tool, args),
  }
}

export interface SynthesizedAssistantTurnInput {
  toolCalls: SynthesizedToolCall[]
  assistantText: string
}

export function buildSynthesizedAssistantTurnParts(
  input: SynthesizedAssistantTurnInput
): SynthesizedAssistantPart[] {
  const parts: SynthesizedAssistantPart[] = input.toolCalls.map((call) =>
    buildPendingToolCallPart(call.tool, call.args)
  )
  if (input.assistantText.length > 0) {
    parts.push({ type: 'text', text: input.assistantText })
  }
  return parts
}
