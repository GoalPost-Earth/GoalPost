import {
  extractEntities,
  type ExtractionModelClient,
  type ExtractionModelInput,
} from './extraction-model-invoker'
import { buildDocumentDownloadUrl } from './document-download-url'

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

  it('drops CarePulse/CoreValuePulse server-side (v1 allowlist) and surfaces them in assistantText, never as tool calls', async () => {
    // v1 acceptance criterion: a model that emits CarePulse/CoreValuePulse
    // must have it filtered out before the synthesized turn is written. We
    // cast through `unknown` to force-feed an out-of-allowlist kind that the
    // Zod schema would normally reject — the test exists to confirm the
    // runtime filter catches it if the model ever leaks one anyway.
    const modelClient = (async () => ({
      persons: [],
      pulses: [
        {
          kind: 'CarePulse',
          title: 'Bring soup',
          content: 'Take soup to Mae after surgery.',
        },
        {
          kind: 'GoalPulse',
          title: 'Ship migration',
          content: 'Cut the data migration over before EOQ.',
        },
      ],
      assistantText: '',
    })) as unknown as ExtractionModelClient
    const result = await extractEntities(baseInput, modelClient)
    expect(result.kind).toBe('ok')
    if (result.kind !== 'ok') throw new Error('unreachable')
    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls[0].args.pulseType).toBe('GoalPulse')
    // The dropped pulse must NOT silently disappear — it surfaces in copy.
    expect(result.assistantText).toContain('Bring soup')
  })

  it('drops pulses missing title or content and surfaces them in assistantText, never as tool calls', async () => {
    const modelClient: ExtractionModelClient = async () => ({
      persons: [],
      pulses: [
        { kind: 'GoalPulse', title: 'Valid goal', content: 'Has both fields.' },
        { kind: 'ResourcePulse', title: '', content: 'No title.' },
        { kind: 'StoryPulse', title: 'No body', content: '   ' },
      ],
      assistantText: '',
    })
    const result = await extractEntities(baseInput, modelClient)
    expect(result.kind).toBe('ok')
    if (result.kind !== 'ok') throw new Error('unreachable')
    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls[0].args.title).toBe('Valid goal')
    // Dropped pulse with a title appears in copy; the body-only one cannot
    // be named since it had no title.
    expect(result.assistantText).toContain('No body')
  })

  it('emits a create_pulse tool call for each fully-formed Goal/Resource/Story pulse', async () => {
    // Slice 2 — batch extraction. The extractor now returns pulses alongside
    // persons. Each pulse becomes a create_pulse synthesized tool call with
    // the correct pulseType, contextId/title, and documentId for provenance.
    const modelClient: ExtractionModelClient = async () => ({
      persons: [{ firstName: 'Sarah', lastName: 'Chen' }],
      pulses: [
        {
          kind: 'GoalPulse',
          title: 'Ship migration',
          content: 'Cut the data migration over before EOQ.',
          horizon: 'SHORT',
        },
        {
          kind: 'ResourcePulse',
          title: 'Shared infra budget',
          content: 'Pool of credits available to the migration team.',
          resourceType: 'budget',
        },
        {
          kind: 'StoryPulse',
          title: 'Why we started this',
          content: 'The old system was paging the team weekly.',
        },
      ],
      assistantText: 'Found person and pulses.',
    })

    const result = await extractEntities(baseInput, modelClient)
    expect(result.kind).toBe('ok')
    if (result.kind !== 'ok') throw new Error('unreachable')

    // 1 person + 3 pulses = 4 tool calls
    expect(result.toolCalls).toHaveLength(4)

    const personCalls = result.toolCalls.filter((c) => c.tool === 'create_person')
    const pulseCalls = result.toolCalls.filter((c) => c.tool === 'create_pulse')
    expect(personCalls).toHaveLength(1)
    expect(pulseCalls).toHaveLength(3)

    const byType = new Map(
      pulseCalls.map((c) => [c.args.pulseType as string, c.args])
    )
    expect(byType.get('GoalPulse')).toMatchObject({
      title: 'Ship migration',
      content: 'Cut the data migration over before EOQ.',
      horizon: 'SHORT',
      contextId: 'ctx_1',
      contextTitle: 'Care Practices',
      documentId: 'doc_1',
    })
    expect(byType.get('ResourcePulse')).toMatchObject({
      title: 'Shared infra budget',
      resourceType: 'budget',
      contextId: 'ctx_1',
      documentId: 'doc_1',
    })
    expect(byType.get('StoryPulse')).toMatchObject({
      title: 'Why we started this',
      contextId: 'ctx_1',
      documentId: 'doc_1',
    })
  })

  // Slice 4 (GOAL-239) — in-extractor dedup + partial-person filter.
  describe('slice 4 — roster dedup', () => {
    const rosterInput: ExtractionModelInput = {
      ...baseInput,
      roster: {
        persons: [
          { id: 'person_sarah_existing', name: 'Sarah Chen' },
          { id: 'person_robert_existing', name: 'Robert Patel' },
        ],
        pulses: [
          {
            id: 'pulse_goal_existing',
            title: 'Grow event attendance',
            pulseType: 'GoalPulse',
          },
        ],
      },
    }

    it('emits update_person when the model echoes the roster id (existingId)', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [
          {
            firstName: 'Sarah',
            lastName: 'Chen',
            existingId: 'person_sarah_existing',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(rosterInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].tool).toBe('update_person')
      expect(result.toolCalls[0].args).toMatchObject({
        personId: 'person_sarah_existing',
        firstName: 'Sarah',
        lastName: 'Chen',
        contextId: 'ctx_1',
        contextTitle: 'Care Practices',
        documentId: 'doc_1',
      })
    })

    it('emits update_person on case-insensitive trimmed full-name match even without existingId', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [
          { firstName: '  sarah ', lastName: 'CHEN' },
        ],
        assistantText: '',
      })
      const result = await extractEntities(rosterInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].tool).toBe('update_person')
      expect(result.toolCalls[0].args.personId).toBe('person_sarah_existing')
    })

    it('emits create_person for a fully-named mention not in the roster', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [{ firstName: 'Mae', lastName: 'Liang' }],
        assistantText: '',
      })
      const result = await extractEntities(rosterInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].tool).toBe('create_person')
    })

    it('emits update_pulse when the model echoes a roster pulse id of matching kind', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [],
        pulses: [
          {
            kind: 'GoalPulse',
            title: 'Increase event attendance',
            content: 'Boost the next two events.',
            existingId: 'pulse_goal_existing',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(rosterInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].tool).toBe('update_pulse')
      expect(result.toolCalls[0].args).toMatchObject({
        pulseId: 'pulse_goal_existing',
        newTitle: 'Increase event attendance',
        newContent: 'Boost the next two events.',
        pulseType: 'GoalPulse',
        contextId: 'ctx_1',
        documentId: 'doc_1',
      })
    })

    it('falls back to create_pulse if existingId points at a pulse of a different kind', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [],
        pulses: [
          {
            kind: 'ResourcePulse',
            title: 'Should not become an update',
            content: 'Mismatched kind.',
            existingId: 'pulse_goal_existing',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(rosterInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].tool).toBe('create_pulse')
    })

    it('collapses duplicate person mentions in the same document to a single tool call', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [
          { firstName: 'Mae', lastName: 'Liang' },
          { firstName: ' MAE ', lastName: 'liang' },
          { firstName: 'Mae', lastName: 'Liang' },
        ],
        assistantText: '',
      })
      const result = await extractEntities(baseInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].args.firstName).toBe('Mae')
      expect(result.toolCalls[0].args.lastName).toBe('Liang')
    })

    it('collapses duplicate pulse mentions in the same document to a single tool call', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [],
        pulses: [
          {
            kind: 'GoalPulse',
            title: 'Ship migration',
            content: 'First mention.',
          },
          {
            kind: 'GoalPulse',
            title: '  ship migration  ',
            content: 'Second mention of the same goal.',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(baseInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].args.title).toBe('Ship migration')
    })

    it('surfaces the matched names in assistantText without leaking raw ids', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [
          {
            firstName: 'Sarah',
            lastName: 'Chen',
            existingId: 'person_sarah_existing',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(rosterInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.assistantText).toContain('Sarah Chen')
      expect(result.assistantText).not.toContain('person_sarah_existing')
      // copy describes the dedup outcome in human-readable form
      expect(result.assistantText.toLowerCase()).toMatch(
        /already track|update|match/
      )
    })
  })

  // GOAL-283 — a member-uploaded document IS the resource. When the extractor
  // reads no explicit location for a ResourcePulse, create_pulse.location is
  // auto-populated with the durable, Space-scoped download URL for the file so
  // the Resource is always openable/shareable. An extracted location is never
  // clobbered, and the fallback is ResourcePulse-only.
  describe('GOAL-283 — ResourcePulse location auto-populate', () => {
    // Pin the base url so the expected download URL is deterministic and the
    // suite never depends on the ambient environment.
    const ORIGINAL_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
    const ORIGINAL_VERCEL_HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL

    beforeEach(() => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://app.goalpost.test'
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL
    })

    afterEach(() => {
      if (ORIGINAL_BASE_URL === undefined)
        delete process.env.NEXT_PUBLIC_BASE_URL
      else process.env.NEXT_PUBLIC_BASE_URL = ORIGINAL_BASE_URL
      if (ORIGINAL_VERCEL_HOST === undefined)
        delete process.env.VERCEL_PROJECT_PRODUCTION_URL
      else process.env.VERCEL_PROJECT_PRODUCTION_URL = ORIGINAL_VERCEL_HOST
    })

    it('auto-populates location with the document download URL when the extractor supplies none', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [],
        pulses: [
          {
            kind: 'ResourcePulse',
            title: 'Community grant guide',
            content: 'A guide to applying for the neighbourhood grant.',
            // no location extracted from the text
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(baseInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].tool).toBe('create_pulse')
      expect(result.toolCalls[0].args.location).toBe(
        buildDocumentDownloadUrl(baseInput.documentId)
      )
      // Anchored on the durable download endpoint keyed to this document.
      expect(result.toolCalls[0].args.location).toBe(
        'https://app.goalpost.test/api/ingest/document/doc_1/download'
      )
      expect(result.toolCalls[0].args.location as string).toMatch(
        /\/api\/ingest\/document\/doc_1\/download$/
      )
    })

    it('does not clobber an extracted location on a ResourcePulse', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [],
        pulses: [
          {
            kind: 'ResourcePulse',
            title: 'Tool library',
            content: 'Borrowable tools for members.',
            location: 'Community Hall',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(baseInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].args.location).toBe('Community Hall')
      expect(result.toolCalls[0].args.location).not.toBe(
        buildDocumentDownloadUrl(baseInput.documentId)
      )
    })

    it('does NOT auto-populate location for a GoalPulse or StoryPulse with no location', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [],
        pulses: [
          {
            kind: 'GoalPulse',
            title: 'Ship the migration',
            content: 'Cut over before end of quarter.',
          },
          {
            kind: 'StoryPulse',
            title: 'Why we started',
            content: 'The old system paged the team weekly.',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(baseInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(2)
      const byType = new Map(
        result.toolCalls.map((c) => [c.args.pulseType as string, c.args])
      )
      expect(byType.get('GoalPulse')).toBeDefined()
      expect(byType.get('StoryPulse')).toBeDefined()
      expect(byType.get('GoalPulse')!.location).toBeUndefined()
      expect(byType.get('StoryPulse')!.location).toBeUndefined()
    })
  })

  // Attribution — a pulse's authorName resolves against the extracted person
  // candidates and the FieldContext roster (trimmed, case-insensitive full
  // name). A resolved name rides on create_pulse args as `attributedToName`
  // in canonical display casing so the orchestrator can map it to the
  // person's live id after the person calls execute. An unresolved name is
  // dropped — the hallucination guard means attribution can never invent a
  // person. update_pulse never carries attribution.
  describe('attribution — authorName → attributedToName on create_pulse', () => {
    it('carries attributedToName with canonical casing when authorName matches an extracted person', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [{ firstName: 'Gurindereet', lastName: 'Singh' }],
        pulses: [
          {
            kind: 'GoalPulse',
            title: 'Launch the seed library',
            content: 'Open a community seed library by spring.',
            // Raw model casing/whitespace — resolution is trim + case-insensitive.
            authorName: '  gurindereet SINGH ',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(baseInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      const pulseCall = result.toolCalls.find((c) => c.tool === 'create_pulse')
      expect(pulseCall).toBeDefined()
      // Canonical display name from the extracted candidate — never the
      // model's raw casing/whitespace.
      expect(pulseCall!.args.attributedToName).toBe('Gurindereet Singh')
    })

    it('carries the roster display name when authorName matches a roster person', async () => {
      const input: ExtractionModelInput = {
        ...baseInput,
        roster: {
          persons: [{ id: 'person_sarah_existing', name: 'Sarah Chen' }],
          pulses: [],
        },
      }
      const modelClient: ExtractionModelClient = async () => ({
        persons: [],
        pulses: [
          {
            kind: 'StoryPulse',
            title: 'How the migration felt',
            content: 'A first-person account of the cutover weekend.',
            authorName: 'sarah chen',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(input, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].tool).toBe('create_pulse')
      // Canonical name is the roster's display name.
      expect(result.toolCalls[0].args.attributedToName).toBe('Sarah Chen')
      // A roster author may get NO person call this run (the model doesn't
      // re-emit people it only saw in the hint), so the invoker stamps the
      // already-live roster id directly — attribution must not depend on the
      // orchestrator's name→id map learning them.
      expect(result.toolCalls[0].args.attributedToPersonId).toBe(
        'person_sarah_existing'
      )
    })

    it('drops an authorName matching neither extracted persons nor the roster (hallucination guard)', async () => {
      const modelClient: ExtractionModelClient = async () => ({
        persons: [{ firstName: 'Sarah', lastName: 'Chen' }],
        pulses: [
          {
            kind: 'GoalPulse',
            title: 'Ship migration',
            content: 'Cut the data migration over before EOQ.',
            authorName: 'Rumpel Stiltskin',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(baseInput, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      const pulseCall = result.toolCalls.find((c) => c.tool === 'create_pulse')
      expect(pulseCall).toBeDefined()
      expect(pulseCall!.args).not.toHaveProperty('attributedToName')
      expect(pulseCall!.args).not.toHaveProperty('attributedToPersonId')
    })

    it('never carries attribution on update_pulse (roster existingId match), even when authorName resolves', async () => {
      const input: ExtractionModelInput = {
        ...baseInput,
        roster: {
          persons: [{ id: 'person_sarah_existing', name: 'Sarah Chen' }],
          pulses: [
            {
              id: 'pulse_goal_existing',
              title: 'Grow event attendance',
              pulseType: 'GoalPulse',
            },
          ],
        },
      }
      const modelClient: ExtractionModelClient = async () => ({
        persons: [],
        pulses: [
          {
            kind: 'GoalPulse',
            title: 'Increase event attendance',
            content: 'Boost the next two events.',
            existingId: 'pulse_goal_existing',
            // Resolvable name — must still be ignored on the update path.
            authorName: 'Sarah Chen',
          },
        ],
        assistantText: '',
      })
      const result = await extractEntities(input, modelClient)
      expect(result.kind).toBe('ok')
      if (result.kind !== 'ok') throw new Error('unreachable')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].tool).toBe('update_pulse')
      expect(result.toolCalls[0].args).not.toHaveProperty('attributedToName')
      expect(result.toolCalls[0].args).not.toHaveProperty('attributedToPersonId')
    })
  })
})
