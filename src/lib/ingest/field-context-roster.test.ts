import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { loadFieldContextRoster } from './field-context-roster'

/**
 * Integration test for the Neo4j-backed FieldContextRoster (GOAL-239).
 * Verifies the projection returns the persons + v1 pulses already attached
 * to the FieldContext so the extraction model can emit `update_*` calls.
 */

let neo4jAvailable = false
const testRunId = `it_${randomUUID().slice(0, 8)}`
const ids = {
  user: `test_user_${testRunId}`,
  meSpace: `test_me_${testRunId}`,
  fieldContext: `test_ctx_${testRunId}`,
  fieldContextEmpty: `test_ctx_empty_${testRunId}`,
  personA: `test_p_a_${testRunId}`,
  personB: `test_p_b_${testRunId}`,
  goalPulse: `test_goal_${testRunId}`,
  resourcePulse: `test_res_${testRunId}`,
  storyPulse: `test_story_${testRunId}`,
  carePulse: `test_care_${testRunId}`,
}

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
      CREATE (u:Person:User {id: $userId, name: 'Test Owner', createdAt: datetime()})
      CREATE (s:Space:MeSpace {id: $spaceId, name: 'Test MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (c:FieldContext {id: $ctxId, title: 'Roster Test Context', createdAt: datetime()})
      CREATE (cEmpty:FieldContext {id: $ctxEmptyId, title: 'Empty Context', createdAt: datetime()})
      CREATE (u)-[:OWNS]->(s)
      CREATE (s)-[:HAS_CONTEXT]->(c)
      CREATE (s)-[:HAS_CONTEXT]->(cEmpty)

      CREATE (pA:Person:PersonPulse {id: $pAId, firstName: 'Sarah', lastName: 'Chen', name: 'Sarah Chen', createdAt: datetime()})
      CREATE (pB:Person:PersonPulse {id: $pBId, firstName: 'Robert', lastName: 'Patel', name: 'Robert Patel', createdAt: datetime()})
      CREATE (c)-[:HAS_PERSON]->(pA)
      CREATE (c)-[:HAS_PERSON]->(pB)

      CREATE (goal:FieldPulse:GoalPulse {id: $goalId, title: 'Grow event attendance', content: 'Goal body.', createdAt: datetime()})
      CREATE (res:FieldPulse:ResourcePulse {id: $resId, title: 'Shared infra budget', content: 'Resource body.', createdAt: datetime()})
      CREATE (story:FieldPulse:StoryPulse {id: $storyId, title: 'Why we started this', content: 'Story body.', createdAt: datetime()})
      CREATE (care:FieldPulse:CarePulse {id: $careId, title: 'Bring soup', content: 'Care body.', createdAt: datetime()})
      CREATE (c)-[:HAS_PULSE]->(goal)
      CREATE (c)-[:HAS_PULSE]->(res)
      CREATE (c)-[:HAS_PULSE]->(story)
      CREATE (c)-[:HAS_PULSE]->(care)
      `,
      {
        userId: ids.user,
        spaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        ctxEmptyId: ids.fieldContextEmpty,
        pAId: ids.personA,
        pBId: ids.personB,
        goalId: ids.goalPulse,
        resId: ids.resourcePulse,
        storyId: ids.storyPulse,
        careId: ids.carePulse,
      }
    )
  } finally {
    await session.close()
  }
})

afterAll(async () => {
  if (!neo4jAvailable) return
  const session = driver.session()
  try {
    await session.run(
      `
      MATCH (n)
      WHERE n.id IN [
        $userId, $spaceId, $ctxId, $ctxEmptyId,
        $pAId, $pBId,
        $goalId, $resId, $storyId, $careId
      ]
      DETACH DELETE n
      `,
      {
        userId: ids.user,
        spaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        ctxEmptyId: ids.fieldContextEmpty,
        pAId: ids.personA,
        pBId: ids.personB,
        goalId: ids.goalPulse,
        resId: ids.resourcePulse,
        storyId: ids.storyPulse,
        careId: ids.carePulse,
      }
    )
  } finally {
    await session.close()
    await driver.close()
  }
})

const itIf = (cond: boolean) => (cond ? it : it.skip)

describe('FieldContextRoster (Neo4j-backed, GOAL-239)', () => {
  itIf(true)(
    'returns empty arrays when the FieldContext has no persons or pulses',
    async () => {
      if (!neo4jAvailable) return
      const roster = await loadFieldContextRoster({
        driver,
        fieldContextId: ids.fieldContextEmpty,
      })
      expect(roster.persons).toEqual([])
      expect(roster.pulses).toEqual([])
    }
  )

  itIf(true)(
    'projects HAS_PERSON members with id + name',
    async () => {
      if (!neo4jAvailable) return
      const roster = await loadFieldContextRoster({
        driver,
        fieldContextId: ids.fieldContext,
      })

      expect(roster.persons).toHaveLength(2)
      const byName = new Map(roster.persons.map((p) => [p.name, p]))
      expect(byName.get('Sarah Chen')?.id).toBe(ids.personA)
      expect(byName.get('Robert Patel')?.id).toBe(ids.personB)
    }
  )

  itIf(true)(
    'projects only the v1 pulse types (GoalPulse/ResourcePulse/StoryPulse) and excludes CarePulse',
    async () => {
      if (!neo4jAvailable) return
      const roster = await loadFieldContextRoster({
        driver,
        fieldContextId: ids.fieldContext,
      })

      const titles = new Set(roster.pulses.map((p) => p.title))
      expect(titles.has('Grow event attendance')).toBe(true)
      expect(titles.has('Shared infra budget')).toBe(true)
      expect(titles.has('Why we started this')).toBe(true)
      expect(titles.has('Bring soup')).toBe(false)

      const types = new Set(roster.pulses.map((p) => p.pulseType))
      expect(types.has('GoalPulse')).toBe(true)
      expect(types.has('ResourcePulse')).toBe(true)
      expect(types.has('StoryPulse')).toBe(true)
    }
  )

  itIf(true)(
    'returns empty arrays for an unknown fieldContextId (no throw)',
    async () => {
      if (!neo4jAvailable) return
      const roster = await loadFieldContextRoster({
        driver,
        fieldContextId: `nonexistent_${testRunId}`,
      })
      expect(roster.persons).toEqual([])
      expect(roster.pulses).toEqual([])
    }
  )
})
