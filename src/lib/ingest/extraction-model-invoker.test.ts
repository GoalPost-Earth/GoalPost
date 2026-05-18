import {
  extractEntities,
  type ExtractionModelClient,
  type ExtractionModelInput,
} from './extraction-model-invoker'

const baseInput: ExtractionModelInput = {
  documentText: 'Sarah Chen led the migration. Bob arrived late.',
  filename: 'meeting-notes.txt',
  hint: null,
  roster: { persons: [], pulses: [] },
  fieldContextId: 'ctx_1',
  fieldContextTitle: 'Care Practices',
  documentId: 'doc_1',
}

describe('ExtractionModelInvoker', () => {
  it('passes through one fully-named person as a create_person tool call', async () => {
    const modelClient: ExtractionModelClient = async () => ({
      persons: [{ firstName: 'Sarah', lastName: 'Chen' }],
      assistantText: 'I found one person.',
    })
    const result = await extractEntities(baseInput, modelClient)
    expect(result.kind).toBe('ok')
    if (result.kind !== 'ok') throw new Error('unreachable')
    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls[0].tool).toBe('create_person')
    expect(result.toolCalls[0].args).toMatchObject({
      firstName: 'Sarah',
      lastName: 'Chen',
      contextId: 'ctx_1',
      contextTitle: 'Care Practices',
      documentId: 'doc_1',
    })
    expect(result.assistantText).toContain('Sarah Chen')
  })

  it('filters out partial persons (missing lastName) and surfaces them in assistantText, never as tool calls', async () => {
    const modelClient: ExtractionModelClient = async () => ({
      persons: [
        { firstName: 'Sarah', lastName: 'Chen' },
        { firstName: 'Bob', lastName: '' },
        { firstName: '', lastName: 'Patel' },
      ],
      assistantText: 'Three mentions.',
    })
    const result = await extractEntities(baseInput, modelClient)
    expect(result.kind).toBe('ok')
    if (result.kind !== 'ok') throw new Error('unreachable')
    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls[0].args.firstName).toBe('Sarah')
    expect(result.assistantText.toLowerCase()).toMatch(/skip|partial|low-confidence|incomplete/)
  })

  it('returns the empty-result path with no tool calls and a clear assistant message when the model finds nothing', async () => {
    const modelClient: ExtractionModelClient = async () => ({
      persons: [],
      assistantText: '',
    })
    const result = await extractEntities(baseInput, modelClient)
    expect(result.kind).toBe('ok')
    if (result.kind !== 'ok') throw new Error('unreachable')
    expect(result.toolCalls).toEqual([])
    expect(result.assistantText.toLowerCase()).toContain("didn't find")
  })

  it('returns the failure path (not a thrown error) when the model client throws', async () => {
    // Acceptance criterion: "nothing in graph, nothing in UI" must never be possible.
    // On model error the route still synthesizes an assistant turn — failure
    // is surfaced as text, not propagated as an exception.
    const modelClient: ExtractionModelClient = async () => {
      throw new Error('upstream timeout')
    }
    const result = await extractEntities(baseInput, modelClient)
    expect(result.kind).toBe('failure')
    if (result.kind !== 'failure') throw new Error('unreachable')
    expect(result.assistantText.toLowerCase()).toContain('extraction failed')
    expect(result.assistantText).toContain('upstream timeout')
  })

  it('uses the human-readable filename (never raw documentId) in the assistant text', async () => {
    const modelClient: ExtractionModelClient = async () => ({
      persons: [{ firstName: 'Sarah', lastName: 'Chen' }],
      assistantText: '',
    })
    const result = await extractEntities(
      { ...baseInput, filename: 'q2-strategy.txt', documentId: 'doc_abc12345' },
      modelClient
    )
    expect(result.assistantText).toContain('q2-strategy.txt')
    expect(result.assistantText).not.toContain('doc_abc12345')
  })
})
