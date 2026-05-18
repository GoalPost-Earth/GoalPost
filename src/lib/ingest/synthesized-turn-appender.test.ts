import {
  buildPendingApprovalResult,
  createApprovalHash,
  describeWriteAction,
} from '@/lib/chat/hitl'
import {
  buildPendingToolCallPart,
  buildSynthesizedAssistantTurnParts,
} from './synthesized-turn-appender'

/**
 * Load-bearing contract test. The doc-ingestion route synthesizes assistant
 * turns whose `parts` payload is persisted to ConversationTurn.parts in the
 * same JSON shape the live chat route persists via streamText's onFinish.
 * The HITL Dialog must not be able to tell the difference between a
 * synthesized pending tool call and one produced by runtime runWriteTool —
 * if any field drifts, approval silently breaks.
 */
describe('SynthesizedTurnAppender — buildPendingToolCallPart', () => {
  const args = {
    firstName: 'Sarah',
    lastName: 'Chen',
    contextId: 'ctx_1',
    contextTitle: 'Care Practices',
    documentId: 'doc_123',
  }

  it('returns an AI SDK v5 tool UIMessagePart with type "tool-<name>" and state "output-available"', () => {
    const part = buildPendingToolCallPart('create_person', args)
    expect(part.type).toBe('tool-create_person')
    expect(part.state).toBe('output-available')
    expect(typeof part.toolCallId).toBe('string')
    expect(part.toolCallId.length).toBeGreaterThan(0)
  })

  it('carries the args as the part input, matching what the model would have emitted', () => {
    const part = buildPendingToolCallPart('create_person', args)
    expect(part.input).toEqual(args)
  })

  it('carries the unapproved HITL result as the part output, byte-identical to buildPendingApprovalResult', () => {
    const part = buildPendingToolCallPart('create_person', args)
    expect(part.output).toEqual(buildPendingApprovalResult('create_person', args))
  })

  it('embeds the same approvalHash the runtime would compute for the same (tool, args)', () => {
    const part = buildPendingToolCallPart('create_person', args)
    const output = part.output as unknown as Record<string, unknown>
    expect(output.approvalHash).toBe(createApprovalHash('create_person', args))
  })

  it('embeds the same summary describeWriteAction would render', () => {
    const part = buildPendingToolCallPart('create_person', args)
    const output = part.output as unknown as Record<string, unknown>
    expect(output.summary).toBe(describeWriteAction('create_person', args))
  })

  it('generates a fresh toolCallId per call so two synthesized parts in one turn never collide', () => {
    const a = buildPendingToolCallPart('create_person', args)
    const b = buildPendingToolCallPart('create_person', args)
    expect(a.toolCallId).not.toBe(b.toolCallId)
    // but both still produce the same approvalHash — hash is keyed on (tool, args)
    const aOut = a.output as unknown as Record<string, unknown>
    const bOut = b.output as unknown as Record<string, unknown>
    expect(aOut.approvalHash).toBe(bOut.approvalHash)
  })
})

describe('SynthesizedTurnAppender — buildSynthesizedAssistantTurnParts', () => {
  it('returns [toolCallPart, textPart] when extraction produced one tool call and assistant text', () => {
    const parts = buildSynthesizedAssistantTurnParts({
      toolCalls: [
        {
          tool: 'create_person',
          args: { firstName: 'Sarah', lastName: 'Chen' },
        },
      ],
      assistantText: 'I found one person in this document.',
    })
    expect(parts).toHaveLength(2)
    expect(parts[0].type).toBe('tool-create_person')
    expect(parts[1]).toEqual({
      type: 'text',
      text: 'I found one person in this document.',
    })
  })

  it('emits only the text part when extraction returned zero tool calls (empty/failure path)', () => {
    const parts = buildSynthesizedAssistantTurnParts({
      toolCalls: [],
      assistantText: "I read this document but didn't find anything to extract.",
    })
    expect(parts).toHaveLength(1)
    expect(parts[0]).toEqual({
      type: 'text',
      text: "I read this document but didn't find anything to extract.",
    })
  })

  it('appends the text part LAST so the assistant message reads like real chat (tool calls first, then prose)', () => {
    // Mirrors the order AI SDK streamText emits during real tool use.
    const parts = buildSynthesizedAssistantTurnParts({
      toolCalls: [
        { tool: 'create_person', args: { firstName: 'A', lastName: 'B' } },
        { tool: 'create_person', args: { firstName: 'C', lastName: 'D' } },
      ],
      assistantText: 'Two people found.',
    })
    expect(parts).toHaveLength(3)
    expect(parts[0].type).toBe('tool-create_person')
    expect(parts[1].type).toBe('tool-create_person')
    expect(parts[2]).toEqual({ type: 'text', text: 'Two people found.' })
  })

  it('omits the text part when assistantText is empty string', () => {
    // Empty text would render as a blank assistant bubble — Rule 6 anti-pattern.
    const parts = buildSynthesizedAssistantTurnParts({
      toolCalls: [
        { tool: 'create_person', args: { firstName: 'A', lastName: 'B' } },
      ],
      assistantText: '',
    })
    expect(parts).toHaveLength(1)
    expect(parts[0].type).toBe('tool-create_person')
  })
})
