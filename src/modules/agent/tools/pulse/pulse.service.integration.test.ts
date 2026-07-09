import { randomUUID } from 'node:crypto'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { driver } from '@/lib/neo4j/driver'
import { initGraph, close as closeGraph } from '@/modules/graph'
import { searchPulses } from './pulse.service'

/**
 * Integration test for the `searchPulses` enumeration + Space-scope + legacy
 * `:CoreValue` bridge added to fix the captured AI-quality failure
 * (feedback_d02d469f — "look for all value-like pulses in my Me Space"). The
 * bug had two roots: (1) a blank `query` was refused, so the model could not
 * LIST pulses by scope; (2) migrated values are `:FieldPulse:StoryPulse:CoreValue`
 * (kb/08), which a `pulseType='CoreValuePulse'` filter missed entirely.
 *
 * These branches all live in `searchPulses` and were previously covered only by
 * a fully-mocked forwarding test (chat-tools-scope.test.ts). This suite exercises
 * the real Cypher against dev Neo4j: seed a MeSpace with a migrated-shaped value,
 * a native value, and a non-value, then assert enumeration finds + types the
 * values correctly, refuses an unscoped blank query, and stays auth-gated.
 *
 * Technique mirrors pulse-write-auth.integration.test.ts: seed via the raw
 * driver, query via the LangChain graph, skip gracefully when Neo4j is absent.
 */

let ready = false
let graph: Neo4jGraph

const runId = `it_pulse_${randomUUID().slice(0, 8)}`
const ids = {
  owner: `${runId}_owner`,
  outsider: `${runId}_outsider`,
  meSpace: `${runId}_mespace`,
  ctx: `${runId}_ctx`,
  migratedValue: `${runId}_migval`,
  nativeValue: `${runId}_nativeval`,
  goal: `${runId}_goal`,
}
// Unique enough that a spaceName CONTAINS match can only hit this fixture.
const SPACE_NAME = `IT PulseSvc ${runId}`

beforeAll(async () => {
  try {
    const s = driver.session()
    await s.run('RETURN 1')
    await s.close()
  } catch {
    console.warn('Neo4j unavailable — skipping searchPulses enumeration suite')
    return
  }

  graph = await initGraph()

  const session = driver.session()
  try {
    await session.run(
      `
      CREATE (owner:Person:User {id: $ownerId, firstName: 'IT', lastName: 'Owner', createdAt: datetime()})
      CREATE (outsider:Person:User {id: $outsiderId, firstName: 'IT', lastName: 'Outsider', createdAt: datetime()})
      CREATE (me:Space:MeSpace {id: $meSpaceId, name: $spaceName, visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (owner)-[:OWNS]->(me)
      CREATE (ctx:FieldContext {id: $ctxId, title: 'IT Field', createdAt: datetime()})
      CREATE (me)-[:HAS_CONTEXT]->(ctx)
      // Migrated-shaped value: carries :StoryPulse + the legacy :CoreValue marker,
      // NO :CoreValuePulse label (the exact case the fix bridges).
      CREATE (mv:FieldPulse:StoryPulse:CoreValue {id: $migValueId, title: 'IT Migrated Value', content: 'a migrated value', createdAt: datetime()})
      CREATE (ctx)-[:HAS_PULSE]->(mv)
      // Native value: modern :CoreValuePulse label.
      CREATE (nv:FieldPulse:CoreValuePulse {id: $nativeValueId, title: 'IT Native Value', content: 'a native value', createdAt: datetime()})
      CREATE (ctx)-[:HAS_PULSE]->(nv)
      // Non-value control: must NOT appear in a CoreValuePulse enumeration.
      CREATE (g:FieldPulse:GoalPulse {id: $goalId, title: 'IT Goal', content: 'a goal', createdAt: datetime()})
      CREATE (ctx)-[:HAS_PULSE]->(g)
      `,
      {
        ownerId: ids.owner,
        outsiderId: ids.outsider,
        meSpaceId: ids.meSpace,
        spaceName: SPACE_NAME,
        ctxId: ids.ctx,
        migValueId: ids.migratedValue,
        nativeValueId: ids.nativeValue,
        goalId: ids.goal,
      }
    )
    ready = true
  } finally {
    await session.close()
  }
}, 120_000)

afterAll(async () => {
  // Only sweep fixtures we actually seeded — when the suite skipped (no Neo4j)
  // the driver never connected, so running cleanup Cypher would throw and fail
  // the suite even though every test no-op'd.
  if (ready) {
    const session = driver.session()
    try {
      await session.run(
        `MATCH (c:FieldContext {id: $ctxId})-[:HAS_PULSE]->(p:FieldPulse) DETACH DELETE p`,
        { ctxId: ids.ctx }
      )
      await session.run(`MATCH (n) WHERE n.id IN $allIds DETACH DELETE n`, {
        allIds: Object.values(ids),
      })
    } finally {
      await session.close()
    }
  }
  await closeGraph().catch(() => undefined)
  await driver.close().catch(() => undefined)
}, 120_000)

describe('searchPulses — enumeration, Space scope, legacy :CoreValue bridge', () => {
  it('lists both migrated (:CoreValue) and native (:CoreValuePulse) values on a blank query scoped by spaceId + pulseType, and types them as CoreValuePulse', async () => {
    if (!ready) return
    const result = await searchPulses(graph, {
      query: '',
      pulseType: 'CoreValuePulse',
      spaceId: ids.meSpace,
      userId: ids.owner,
      limit: 25,
    })

    expect(result.found).toBe(true)
    const returnedIds = result.pulses.map((p) => p.id).sort()
    expect(returnedIds).toEqual([ids.migratedValue, ids.nativeValue].sort())
    // The migrated value carries :StoryPulse, but the projection reports it as
    // a value — the projection reorder that pairs with the filter bridge.
    for (const p of result.pulses) {
      expect(p.type).toBe('CoreValuePulse')
    }
    // The non-value control is excluded by the type filter.
    expect(returnedIds).not.toContain(ids.goal)
  })

  it('lists the same values when scoped by spaceName instead of spaceId', async () => {
    if (!ready) return
    const result = await searchPulses(graph, {
      query: '',
      pulseType: 'CoreValuePulse',
      spaceName: SPACE_NAME,
      userId: ids.owner,
      limit: 25,
    })

    expect(result.found).toBe(true)
    expect(result.pulses.map((p) => p.id).sort()).toEqual(
      [ids.migratedValue, ids.nativeValue].sort()
    )
  })

  it('refuses a blank query with NO scope (fail-closed, no graph dump)', async () => {
    if (!ready) return
    const result = await searchPulses(graph, {
      query: '',
      userId: ids.owner,
    })

    expect(result.found).toBe(false)
    expect(result.count).toBe(0)
    expect(result.pulses).toHaveLength(0)
    expect(result.needsDisambiguation).toBe(false)
    // The refusal names the ways to scope; it must NOT be a keyword-only demand.
    expect(result.message).toMatch(/keyword|Space|field|pulse type/i)
  })

  it('stays auth-gated: a non-member enumerating the same Space gets nothing', async () => {
    if (!ready) return
    const result = await searchPulses(graph, {
      query: '',
      pulseType: 'CoreValuePulse',
      spaceId: ids.meSpace,
      userId: ids.outsider,
    })

    expect(result.found).toBe(false)
    expect(result.pulses).toHaveLength(0)
  })
})
