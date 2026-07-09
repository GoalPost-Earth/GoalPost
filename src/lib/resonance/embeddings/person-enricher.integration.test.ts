import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'

/**
 * Integration test for the enrichPersonFromPulses pulse sweep.
 *
 * Regression under test: the sweep previously matched only
 * `[:INITIATED_BY]`, so a person whose pulses were authored through the
 * dashboard flow or imports (which write `[:CREATED_BY]`) never fed
 * enrichment — the function fell through to the "no recent pulses" branch.
 * The fixed Cypher matches `[:INITIATED_BY|CREATED_BY]` with
 * `WITH DISTINCT p, pulse` to dedupe legacy pulses carrying both edges.
 *
 * The LLM + embedding calls are stubbed by mocking @/lib/llm/factory with
 * MockLLMProvider instances (no OpenAI calls); the Cypher runs against the
 * real dev Neo4j.
 */

const MOCK_INSIGHTS = {
  themes: ['mutual aid'],
  passions: ['community gardening'],
  fieldsOfCare: ['food security'],
  traits: ['organizer'],
  summary: 'Cares deeply about local food systems',
}

jest.mock('@/lib/llm/factory', () => {
  const { MockLLMProvider } = jest.requireActual(
    '@/lib/llm/providers/mock.provider'
  )
  const provider = new MockLLMProvider({
    structuredOutput: {
      themes: ['mutual aid'],
      passions: ['community gardening'],
      fieldsOfCare: ['food security'],
      traits: ['organizer'],
      summary: 'Cares deeply about local food systems',
    },
    embeddings: [[0.1, 0.2, 0.3, 0.4]],
  })
  return {
    getAnalysisProvider: () => provider,
    getEmbeddingsProvider: () => provider,
    __mockProvider: provider,
  }
})

// The no-recent-pulses repair branch calls generatePersonEmbedding (real
// OpenAI). Our fixture HAS pulses so it must never fire — mock it so an
// accidental fall-through fails loudly instead of calling the API.
jest.mock('./person-embedder', () => ({
  generatePersonEmbedding: jest.fn(async () => {
    throw new Error(
      'generatePersonEmbedding called — the sweep found no pulses (regression!)'
    )
  }),
}))

import { enrichPersonFromPulses } from './person-enricher'
import { close as closeGraph } from '@/modules/graph'
import type { MockLLMProvider } from '@/lib/llm/providers/mock.provider'

const mockProvider = (
  jest.requireMock('@/lib/llm/factory') as { __mockProvider: MockLLMProvider }
).__mockProvider

let neo4jAvailable = false
const testRunId = `it_${randomUUID().slice(0, 8)}`
const ids = {
  person: `test_person_${testRunId}`,
  createdByPulse: `test_pulse_created_${testRunId}`,
  bothEdgesPulse: `test_pulse_both_${testRunId}`,
}

const CREATED_BY_CONTENT = `Organized the neighborhood tool library ${testRunId}`
const BOTH_EDGES_CONTENT = `Launched the seed-swap program ${testRunId}`

beforeAll(async () => {
  try {
    const s = driver.session()
    await s.run('RETURN 1')
    await s.close()
    neo4jAvailable = true
  } catch {
    neo4jAvailable = false
  }
  if (!neo4jAvailable) return

  const session = driver.session()
  try {
    await session.run(
      `
      CREATE (p:Person {id: $personId, firstName: 'Enrich', lastName: 'Target', name: 'Enrich Target', createdAt: datetime()})
      // The regression case: the person's pulse carries ONLY the
      // dashboard/import author edge (CREATED_BY) — no INITIATED_BY.
      CREATE (c:FieldPulse:CarePulse {id: $createdByPulseId, title: 'Tool library', content: $createdByContent, createdAt: datetime()})
      CREATE (c)-[:CREATED_BY]->(p)
      // DISTINCT guard: a legacy pulse carrying BOTH author edges must be
      // swept exactly once.
      CREATE (g:FieldPulse:GoalPulse {id: $bothEdgesPulseId, title: 'Seed swap', content: $bothEdgesContent, createdAt: datetime()})
      CREATE (g)-[:CREATED_BY]->(p)
      CREATE (g)-[:INITIATED_BY]->(p)
      `,
      {
        personId: ids.person,
        createdByPulseId: ids.createdByPulse,
        bothEdgesPulseId: ids.bothEdgesPulse,
        createdByContent: CREATED_BY_CONTENT,
        bothEdgesContent: BOTH_EDGES_CONTENT,
      }
    )
  } finally {
    await session.close()
  }
})

afterAll(async () => {
  if (neo4jAvailable) {
    const session = driver.session()
    try {
      await session.run(
        `MATCH (n) WHERE n.id IN $allIds DETACH DELETE n`,
        { allIds: Object.values(ids) }
      )
    } finally {
      await session.close()
    }
  }
  await closeGraph()
  await driver.close()
})

const occurrences = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1

describe('enrichPersonFromPulses — author-edge sweep ([:INITIATED_BY|CREATED_BY])', () => {
  it('includes a CREATED_BY-only pulse in the sweep and runs the full enrichment path', async () => {
    if (!neo4jAvailable) return

    const result = await enrichPersonFromPulses(ids.person)

    // The enrichment (LLM) branch ran — NOT the "no recent pulses" fallback.
    expect(result.insights.summary).toBe(MOCK_INSIGHTS.summary)
    expect(mockProvider.calls.structuredOutput).toHaveLength(1)

    // The analysis prompt was built from the swept pulses: the CREATED_BY-only
    // pulse (the regression case) must be present, with its concrete pulse
    // type extracted from the node labels.
    const userPrompt = mockProvider.calls.structuredOutput[0].messages.find(
      (m: { role: string }) => m.role === 'user'
    )?.content as string
    expect(userPrompt).toContain(CREATED_BY_CONTENT)
    expect(userPrompt).toContain(`[CarePulse] ${CREATED_BY_CONTENT}`)

    // DISTINCT guard: the pulse carrying BOTH author edges appears exactly
    // once — the alternation must not double-count it.
    expect(occurrences(userPrompt, BOTH_EDGES_CONTENT)).toBe(1)

    // Insights merged into updated properties.
    expect(result.updatedProperties.passions).toEqual(
      expect.arrayContaining(MOCK_INSIGHTS.passions)
    )
    expect(result.embedding).toEqual([0.1, 0.2, 0.3, 0.4])
  }, 60_000)

  it('persists enrichment side effects on the Person node (properties + embedding)', async () => {
    if (!neo4jAvailable) return

    const session = driver.session()
    try {
      const res = await session.run(
        `
        MATCH (p:Person {id: $personId})
        RETURN p.passions AS passions,
               p.fieldsOfCare AS fieldsOfCare,
               p.enrichedAt IS NOT NULL AS enriched,
               p.embedding IS NOT NULL AS hasEmbedding,
               size(p.embedding) AS embeddingSize
        `,
        { personId: ids.person }
      )
      const record = res.records[0]
      expect(record.get('passions')).toEqual(
        expect.arrayContaining(MOCK_INSIGHTS.passions)
      )
      expect(record.get('fieldsOfCare')).toEqual(
        expect.arrayContaining(MOCK_INSIGHTS.fieldsOfCare)
      )
      expect(record.get('enriched')).toBe(true)
      expect(record.get('hasEmbedding')).toBe(true)
      expect(record.get('embeddingSize').toNumber()).toBe(4)
    } finally {
      await session.close()
    }
  })

  it('the enrich-route roster query shape ([:INITIATED_BY|CREATED_BY]) selects a CREATED_BY-only author', async () => {
    if (!neo4jAvailable) return

    // Pins the "all people with pulses" roster query from
    // src/app/api/person/enrich/route.ts: with the old INITIATED_BY-only
    // match, this person was never selected for bulk enrichment.
    const session = driver.session()
    try {
      const res = await session.run(
        `
        MATCH (p:Person)<-[:INITIATED_BY|CREATED_BY]-(pulse:FieldPulse)
        RETURN DISTINCT p.id as id
        `
      )
      const rosterIds = res.records.map((r) => r.get('id'))
      expect(rosterIds).toContain(ids.person)
      // DISTINCT: the both-edges pulse must not duplicate the person row.
      expect(rosterIds.filter((id) => id === ids.person)).toHaveLength(1)
    } finally {
      await session.close()
    }
  })
})
