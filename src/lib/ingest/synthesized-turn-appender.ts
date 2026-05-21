import { randomUUID } from 'node:crypto'
import {
  buildPendingApprovalResult,
  type PendingApprovalResult,
  type WriteToolName,
} from '@/lib/chat/hitl'

/**
 * Doc ingestion synthesizes assistant ConversationTurns whose `parts` JSON
 * must hydrate into the chat thread identically to what the live chat route
 * persists from streamText's onFinish. Two shapes are supported:
 *
 *   - Pending  (PendingToolCallPart)  — output carries `approvalRequired`;
 *     the HITL Dialog opens. Kept for any future flows that still want HITL.
 *   - Executed (ExecutedToolCallPart) — output carries the actual
 *     `ToolExecutionResult`; the chat thread renders the call as completed.
 *     Used by the auto-approve ingest path so uploads land entities in the
 *     graph immediately without a manual approval step.
 *
 * The Pending shape is pinned by synthesized-turn-appender.test.ts and
 * hitl.test.ts — never bypass these helpers when writing new ingest code.
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

/**
 * Tool result shape produced by `executeAuthorizedWriteTool`. The orchestrator
 * stamps this directly onto the synthesized assistant turn so the UI never
 * sees an "approval pending" state for auto-executed calls.
 */
export interface ExecutedToolResult {
  success?: boolean
  message?: string
  [key: string]: unknown
}

export interface ExecutedToolCallPart {
  type: `tool-${WriteToolName}`
  toolCallId: string
  state: 'output-available'
  input: Record<string, unknown>
  output: ExecutedToolResult
}

export interface TextPart {
  type: 'text'
  text: string
}

export type SynthesizedAssistantPart =
  | PendingToolCallPart
  | ExecutedToolCallPart
  | TextPart

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

export function buildExecutedToolCallPart(
  tool: WriteToolName,
  args: Record<string, unknown>,
  result: ExecutedToolResult
): ExecutedToolCallPart {
  return {
    type: `tool-${tool}` as `tool-${WriteToolName}`,
    toolCallId: `synth_${randomUUID()}`,
    state: 'output-available',
    input: args,
    output: result,
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

export interface ExecutedToolCallRecord {
  tool: WriteToolName
  args: Record<string, unknown>
  result: ExecutedToolResult
}

export interface ExecutedAssistantTurnInput {
  toolCalls: ExecutedToolCallRecord[]
  assistantText: string
}

/**
 * Build the assistant-turn parts for the auto-execute path. Each tool call
 * becomes a completed UIMessagePart carrying the actual execution result,
 * so the chat thread renders the run as already-done — no HITL dialog.
 */
export function buildExecutedAssistantTurnParts(
  input: ExecutedAssistantTurnInput
): SynthesizedAssistantPart[] {
  const parts: SynthesizedAssistantPart[] = input.toolCalls.map((call) =>
    buildExecutedToolCallPart(call.tool, call.args, call.result)
  )
  if (input.assistantText.length > 0) {
    parts.push({ type: 'text', text: input.assistantText })
  }
  return parts
}
