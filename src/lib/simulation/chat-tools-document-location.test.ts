import { buildSimulationChatTools } from './chat-tools'
import {
  ATTACHED_DOCUMENT_LOCATION,
  buildDocumentDownloadUrl,
} from '@/lib/ingest/document-download-url'

/**
 * GOAL-322 regression — no assistant tool result may carry a durable
 * document-download locator.
 *
 * Since GOAL-283 (ResourcePulse) and GOAL-316 (GoalPulse/StoryPulse), a pulse
 * extracted from an uploaded document stores
 * `https://<host>/api/ingest/document/<document_id>/download` in `location`.
 * Handed to the model verbatim, that URL — and the raw document id inside it —
 * lands in chat prose, which kb/07 Rule 1 forbids. The dashboard already hides
 * it behind an opaque "Open document" action (GOAL-302); these tests pin the
 * chat-side equivalent.
 *
 * Both tool surfaces that project a pulse `location` are covered:
 *   - `get_focal_entity` — shaped in `getFocalRecord` (chat-tools.ts)
 *   - `search_pulse`     — shaped in `mapPulseRecord` (pulse.service.ts), the
 *                          funnel the person bridge and update results share
 *
 * Assertions run against the SERIALIZED result, not just the location field:
 * what matters is that nothing anywhere in the payload the model reads contains
 * the locator. Fully hermetic — no Neo4j, no OpenAI.
 */

const queryMock = jest.fn()
jest.mock('@/modules/graph', () => ({
  initGraph: jest.fn(async () => ({ query: queryMock })),
}))

jest.mock('@/lib/permissions/space-permissions', () => ({
  canViewContent: jest.fn(async () => true),
}))

// canViewPulse gates get_focal_entity; viewablePulsePredicate is the Cypher
// fragment searchPulses embeds. Both live in this module — permit and stub.
jest.mock('@/lib/permissions/pulse-visibility', () => ({
  canViewPulse: jest.fn(async () => true),
  canViewContext: jest.fn(async () => true),
  viewablePulsePredicate: jest.fn(() => 'true'),
}))

jest.mock('@/lib/neo4j/driver', () => ({
  driver: {
    session: jest.fn(() => ({ close: jest.fn(async () => undefined) })),
  },
}))

jest.mock('@/lib/llm/adapters/langchain-adapter', () => ({
  getLangChainEmbeddings: jest.fn(() => ({})),
}))

const USER_ID = 'person_goal322'
const DOCUMENT_ID = 'document_9f1c2d3e-4a5b-6c7d-8e9f-0a1b2c3d4e5f'
const PULSE_ID = 'pulse_goal322'

const DOWNLOAD_URL = buildDocumentDownloadUrl(DOCUMENT_ID)

/* eslint-disable @typescript-eslint/no-explicit-any */
async function runTool(tool: any, input: unknown) {
  return tool.execute(input, { toolCallId: 't', messages: [] })
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Nothing the model reads may contain the locator or the raw document id. */
function expectNoLocatorAnywhere(result: unknown) {
  const serialized = JSON.stringify(result)
  expect(serialized).not.toContain('/api/ingest/document/')
  expect(serialized).not.toContain('/download')
  expect(serialized).not.toContain(DOCUMENT_ID)
  expect(serialized).not.toContain('document_')
}

function focalToolsFor(type: 'GoalPulse' | 'ResourcePulse' | 'StoryPulse') {
  return buildSimulationChatTools({
    currentUserId: USER_ID,
    spaceId: 'ws_goal322',
    fieldContextId: null,
    focalEntity: { type, id: PULSE_ID, label: 'Community Garden Plan' },
    approvedActionHashes: new Set<string>(),
    spaceName: 'Growers',
    spaceType: 'WeSpace',
    fieldContextTitle: null,
    canvasView: null,
    canvasVisibleEntities: [],
  })
}

function searchToolsForSpace() {
  return buildSimulationChatTools({
    currentUserId: USER_ID,
    spaceId: 'ws_goal322',
    fieldContextId: null,
    focalEntity: null,
    approvedActionHashes: new Set<string>(),
    spaceName: 'Growers',
    spaceType: 'WeSpace',
    fieldContextTitle: null,
    canvasView: null,
    canvasVisibleEntities: [],
  })
}

function focalRecordRow(location: string | null) {
  return [
    {
      record: {
        id: PULSE_ID,
        title: 'Community Garden Plan',
        content: 'Plan for the shared plot.',
        status: 'active',
        horizon: null,
        intensity: 0.5,
        why: 'So neighbours can grow together',
        location,
        time: null,
        createdAt: '2026-07-01T00:00:00Z',
        context: { id: 'ctx_goal322', title: 'Neighbourhood Care' },
        space: { id: 'ws_goal322', name: 'Growers' },
      },
    },
  ]
}

function searchRow(location: string | null) {
  return [
    {
      id: PULSE_ID,
      title: 'Community Garden Plan',
      content: 'Plan for the shared plot.',
      type: 'ResourcePulse',
      status: 'active',
      intensity: 0.5,
      horizon: null,
      resourceType: 'document',
      availability: null,
      why: 'So neighbours can grow together',
      location,
      time: null,
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: null,
      contextTitles: ['Neighbourhood Care'],
      spaceNames: ['Growers'],
      createdByName: 'Ama',
    },
  ]
}

beforeEach(() => {
  queryMock.mockReset()
})

describe('GOAL-322 — get_focal_entity never echoes a document-download locator', () => {
  // The three pulse kinds GOAL-316 widened the auto-populated location to.
  it.each(['GoalPulse', 'ResourcePulse', 'StoryPulse'] as const)(
    'shapes the stored locator into an opaque phrase for a %s',
    async (type) => {
      queryMock.mockResolvedValue(focalRecordRow(DOWNLOAD_URL))

      const tools = await focalToolsFor(type)
      const result = await runTool(tools.get_focal_entity, {})

      const record = (result as { record: Record<string, unknown> }).record
      expect(record.location).toBe(ATTACHED_DOCUMENT_LOCATION)
      expectNoLocatorAnywhere(result)
    }
  )

  it('shapes a locator stored under an older deploy domain', async () => {
    // Detection is pathname-based, so a domain change never re-exposes the URL.
    queryMock.mockResolvedValue(
      focalRecordRow(
        `https://old-domain.example/api/ingest/document/${DOCUMENT_ID}/download`
      )
    )

    const tools = await focalToolsFor('ResourcePulse')
    const result = await runTool(tools.get_focal_entity, {})

    const record = (result as { record: Record<string, unknown> }).record
    expect(record.location).toBe(ATTACHED_DOCUMENT_LOCATION)
    expectNoLocatorAnywhere(result)
  })

  it('passes a genuine location through to the model unchanged', async () => {
    queryMock.mockResolvedValue(focalRecordRow('Osu Community Centre, Accra'))

    const tools = await focalToolsFor('GoalPulse')
    const result = await runTool(tools.get_focal_entity, {})

    const record = (result as { record: Record<string, unknown> }).record
    expect(record.location).toBe('Osu Community Centre, Accra')
  })

  it('passes an external source URL through to the model unchanged', async () => {
    // GOAL-285 locations are real, shareable links — not internal artifacts.
    queryMock.mockResolvedValue(
      focalRecordRow('https://example.com/community-garden')
    )

    const tools = await focalToolsFor('StoryPulse')
    const result = await runTool(tools.get_focal_entity, {})

    const record = (result as { record: Record<string, unknown> }).record
    expect(record.location).toBe('https://example.com/community-garden')
  })

  it('leaves the rest of the record intact', async () => {
    queryMock.mockResolvedValue(focalRecordRow(DOWNLOAD_URL))

    const tools = await focalToolsFor('ResourcePulse')
    const result = await runTool(tools.get_focal_entity, {})

    const record = (result as { record: Record<string, unknown> }).record
    expect(record.title).toBe('Community Garden Plan')
    expect(record.why).toBe('So neighbours can grow together')
    expect(record.context).toEqual({
      id: 'ctx_goal322',
      title: 'Neighbourhood Care',
    })
  })
})

describe('GOAL-322 — search_pulse never echoes a document-download locator', () => {
  it('shapes the stored locator into an opaque phrase', async () => {
    queryMock.mockResolvedValue(searchRow(DOWNLOAD_URL))

    const tools = await searchToolsForSpace()
    const result = await runTool(tools.search_pulse, { query: 'garden' })

    const { pulses } = result as { pulses: Array<{ location: string | null }> }
    expect(pulses).toHaveLength(1)
    expect(pulses[0].location).toBe(ATTACHED_DOCUMENT_LOCATION)
    expectNoLocatorAnywhere(result)
  })

  it('passes a genuine location through to the model unchanged', async () => {
    queryMock.mockResolvedValue(searchRow('Osu Community Centre, Accra'))

    const tools = await searchToolsForSpace()
    const result = await runTool(tools.search_pulse, { query: 'garden' })

    const { pulses } = result as { pulses: Array<{ location: string | null }> }
    expect(pulses[0].location).toBe('Osu Community Centre, Accra')
  })
})
