import type { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { searchPulses, updatePulse } from './pulse.service'
import {
  ATTACHED_DOCUMENT_LOCATION,
  buildDocumentDownloadUrl,
} from '@/lib/ingest/document-download-url'

/**
 * GOAL-322 — `mapPulseRecord` is the single model-facing funnel for pulse
 * `location`, so the shaping is pinned here rather than at each agent tool.
 *
 * Two directions matter:
 *   1. READ  — a durable document locator never reaches the model.
 *   2. WRITE — the opaque phrase the model was shown can never be written back
 *              over the real locator (`sanitizeNewLocation`). Without that
 *              guard, a model carrying the fields it read into an update would
 *              erase the link to the uploaded file.
 *
 * Hermetic: `graph.query` is a jest mock, so no Neo4j is involved.
 */

// searchPulses embeds this as a Cypher fragment; the query is mocked anyway.
jest.mock('@/lib/permissions/pulse-visibility', () => ({
  viewablePulsePredicate: jest.fn(() => 'true'),
}))

const queryMock = jest.fn()
const graph = { query: queryMock } as unknown as Neo4jGraph

const USER_ID = 'person_goal322'
const PULSE_ID = 'pulse_goal322'
const DOCUMENT_ID = 'document_9f1c2d3e-4a5b-6c7d-8e9f-0a1b2c3d4e5f'
const DOWNLOAD_URL = buildDocumentDownloadUrl(DOCUMENT_ID)

function row(location: string | null) {
  return {
    id: PULSE_ID,
    title: 'Community Garden Plan',
    content: 'Plan for the shared plot.',
    type: 'ResourcePulse',
    location,
    contextTitles: ['Neighbourhood Care'],
    spaceNames: ['Growers'],
  }
}

beforeEach(() => {
  queryMock.mockReset()
})

describe('searchPulses — location shaping (read path)', () => {
  it('replaces a document-download locator with the opaque phrase', async () => {
    queryMock.mockResolvedValue([row(DOWNLOAD_URL)])

    const result = await searchPulses(graph, {
      query: 'garden',
      userId: USER_ID,
    })

    expect(result.pulses[0].location).toBe(ATTACHED_DOCUMENT_LOCATION)
    expect(JSON.stringify(result)).not.toContain(DOCUMENT_ID)
  })

  it('passes a genuine location through untouched', async () => {
    queryMock.mockResolvedValue([row('Osu Community Centre, Accra')])

    const result = await searchPulses(graph, {
      query: 'garden',
      userId: USER_ID,
    })

    expect(result.pulses[0].location).toBe('Osu Community Centre, Accra')
  })
})

describe('updatePulse — the opaque phrase is never written back', () => {
  /** resolvePulseCandidates runs first, then the update itself. */
  function mockCandidateThenUpdate(storedLocation: string | null) {
    queryMock
      .mockResolvedValueOnce([row(storedLocation)]) // resolvePulseCandidates
      .mockResolvedValueOnce([row(storedLocation)]) // update + re-projection
  }

  it('drops a newLocation equal to the phrase, leaving the stored locator alone', async () => {
    mockCandidateThenUpdate(DOWNLOAD_URL)

    const result = await updatePulse(graph, {
      pulseId: PULSE_ID,
      newTitle: 'Community Garden Plan v2',
      // What a model that echoed back what it read would send.
      newLocation: ATTACHED_DOCUMENT_LOCATION,
    })

    expect(result.success).toBe(true)
    const updateParams = queryMock.mock.calls[1][1] as Record<string, unknown>
    // null means the FOREACH guard skips `SET pulse.location` entirely.
    expect(updateParams.newLocation).toBeNull()
    expect(updateParams.newTitle).toBe('Community Garden Plan v2')
  })

  it('still writes a real location the user actually asked for', async () => {
    mockCandidateThenUpdate('Osu Community Centre, Accra')

    await updatePulse(graph, {
      pulseId: PULSE_ID,
      newLocation: '  Kaneshie Market, Accra  ',
    })

    const updateParams = queryMock.mock.calls[1][1] as Record<string, unknown>
    expect(updateParams.newLocation).toBe('Kaneshie Market, Accra')
  })

  it('does not count the dropped phrase as a change on its own', async () => {
    // newLocation was the only field, so after sanitizing there is nothing to
    // update — refuse rather than issue a no-op write.
    const result = await updatePulse(graph, {
      pulseId: PULSE_ID,
      newLocation: ATTACHED_DOCUMENT_LOCATION,
    })

    expect(result.success).toBe(false)
    expect(queryMock).not.toHaveBeenCalled()
  })

  it('shapes the location on the record it hands back', async () => {
    mockCandidateThenUpdate(DOWNLOAD_URL)

    const result = await updatePulse(graph, {
      pulseId: PULSE_ID,
      newTitle: 'Community Garden Plan v2',
    })

    expect(result.pulse?.location).toBe(ATTACHED_DOCUMENT_LOCATION)
    expect(JSON.stringify(result)).not.toContain(DOCUMENT_ID)
  })
})
