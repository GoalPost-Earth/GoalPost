import { randomUUID } from 'node:crypto'
import neo4j from 'neo4j-driver'
import type { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { driver } from '@/lib/neo4j/driver'
import { createPersonSearchTool, type PersonSearchResult } from './person-search.tool'

/**
 * `search_person_by_name` — Person PII gate over the raw-Cypher path.
 *
 * `@authorization` governs the GraphQL read path only; this tool reads
 * `:Person` properties directly, so it restates the GOAL-275 policy in its own
 * Cypher. That hand-written copy is exactly the kind of thing that drifts, so
 * this suite pins the same branch table
 * `person-pii-read-auth.integration.test.ts` pins for the SDL:
 *
 *   1. the person themselves
 *   2. the creator of the person node        (CREATED_BY)
 *   3. a co-member of a Space the person OWNS
 *   4. the owner of a Space the person is a MEMBER of
 *   5. anyone who can view a FieldContext holding them (HAS_PERSON)
 *
 * plus the boundaries: an unrelated caller, a CONNECTED_TO edge (never a
 * consent signal), a soft-deleted context (GOAL-319), and a null caller.
 *
 * Directory identity (name / photo) is deliberately NOT gated — people stay
 * findable by name across Spaces, per kb/02-user-roles.md — so the negative
 * cases assert "found but private", not "not found".
 */

const testRunId = randomUUID().slice(0, 8)
/** Shared surname so one search returns the whole fixture and nothing else. */
const SURNAME = `Pgate${testRunId}`
/**
 * Maya needs a first name unique in the DB for the single-match cases: any
 * two-token query ending in `SURNAME` matches the whole fixture, because the
 * tool's "casual multi-token name" rule accepts a last-token surname hit.
 */
const MAYA = `Maya${testRunId}`
const id = (suffix: string) => `test_ps_${suffix}_${testRunId}`

const ids = {
  uploader: id('uploader'),
  outsider: id('outsider'),
  meSpace: id('me'),
  fieldContext: id('ctx'),
  maya: id('maya'),
  deletedContext: id('delctx'),
  dana: id('dana'),
  creator: id('creator'),
  contact: id('contact'),
  weSpace: id('ws'),
  membership: id('sm'),
  wsOwner: id('wsowner'),
  wsMember: id('wsmember'),
}

let ready = false

/**
 * Minimal stand-in for `Neo4jGraph` — the tool only ever calls `.query()`.
 * Avoids `Neo4jGraph.initialize()`, which does a full schema refresh on every
 * construction and is far slower than the queries under test.
 */
const graph = {
  query: async (cypher: string, params: Record<string, unknown>) => {
    const session = driver.session()
    try {
      const res = await session.run(cypher, params)
      return res.records.map((r) => {
        const obj = r.toObject() as Record<string, unknown>
        for (const [k, v] of Object.entries(obj)) {
          if (neo4j.isInt(v)) obj[k] = v.toNumber()
        }
        return obj
      })
    } finally {
      await session.close()
    }
  },
} as unknown as Neo4jGraph

type FoundPerson = NonNullable<PersonSearchResult['people']>[number]

/** Run the tool as `callerId` and index the results by first name. */
async function searchAs(
  callerId: string | null
): Promise<{ result: PersonSearchResult; byName: Map<string, FoundPerson> }> {
  const tool = createPersonSearchTool(graph, callerId)
  const raw = await tool.invoke({ name: SURNAME })
  const result = JSON.parse(raw) as PersonSearchResult
  const byName = new Map(
    (result.people ?? []).map((p) => [p.firstName, p])
  )
  return { result, byName }
}

beforeAll(async () => {
  try {
    const s = driver.session()
    await s.run('RETURN 1')
    await s.close()
  } catch {
    console.warn('Neo4j unavailable — skipping person-search PII suite')
    return
  }

  const session = driver.session()
  try {
    await session.run(
      `
      // ── Branch 5: person attached to a FieldContext in the uploader's MeSpace
      CREATE (u:Person:User {id: $uploaderId, firstName: 'Uma', lastName: $surname, name: 'Uma ' + $surname, email: 'uma@example.com', location: 'Accra', createdAt: datetime()})
      CREATE (x:Person:User {id: $outsiderId, firstName: 'Ollie', lastName: $surname, name: 'Ollie ' + $surname, email: 'ollie@example.com', location: 'Lisbon', createdAt: datetime()})
      CREATE (me:Space:MeSpace {id: $meSpaceId, name: 'Uma MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (u)-[:OWNS]->(me)
      CREATE (c:FieldContext {id: $ctxId, title: 'Uploaded Field', createdAt: datetime()})
      CREATE (me)-[:HAS_CONTEXT]->(c)
      CREATE (p:Person:PersonPulse {
        id: $mayaId, firstName: $mayaFirst, lastName: $surname, name: $mayaFirst + ' ' + $surname,
        email: 'maya@example.com', pronouns: 'she/her', location: 'Oakland',
        traits: 'curious, thorough', interests: 'basket weaving',
        createdAt: datetime()
      })
      CREATE (c)-[:HAS_PERSON]->(p)

      // A CONNECTED_TO edge from the OUTSIDER — never a consent signal.
      CREATE (x)-[:CONNECTED_TO {why: 'we met once', interests: 'weaving'}]->(p)

      // ── Branch 5 boundary: soft-deleted context (GOAL-319) withdraws reach
      CREATE (del:FieldContext {id: $delCtxId, title: 'Deleted Field', deletedAt: datetime(), createdAt: datetime()})
      CREATE (me)-[:HAS_DELETED_CONTEXT]->(del)
      CREATE (dp:Person:PersonPulse {
        id: $danaId, firstName: 'Dana', lastName: $surname, name: 'Dana ' + $surname,
        email: 'dana@example.com', location: 'Berlin', createdAt: datetime()
      })
      CREATE (del)-[:HAS_PERSON]->(dp)

      // ── Branch 2: createdBy ───────────────────────────────────────────────
      CREATE (cr:Person:User {id: $creatorId, firstName: 'Cora', lastName: $surname, name: 'Cora ' + $surname, createdAt: datetime()})
      CREATE (ct:Person:PersonPulse {
        id: $contactId, firstName: 'Kai', lastName: $surname, name: 'Kai ' + $surname,
        email: 'kai@example.com', location: 'Nairobi', createdAt: datetime()
      })
      CREATE (ct)-[:CREATED_BY]->(cr)

      // ── Branches 3 + 4: a WeSpace owner and one member ────────────────────
      CREATE (wo:Person:User {id: $wsOwnerId, firstName: 'Wanda', lastName: $surname, name: 'Wanda ' + $surname, email: 'wanda@example.com', location: 'Dublin', createdAt: datetime()})
      CREATE (wm:Person:User {id: $wsMemberId, firstName: 'Milo', lastName: $surname, name: 'Milo ' + $surname, email: 'milo@example.com', location: 'Porto', createdAt: datetime()})
      CREATE (ws:Space:WeSpace {id: $weSpaceId, name: 'Shared Field', visibility: 'SHARED', createdAt: datetime()})
      CREATE (wo)-[:OWNS]->(ws)
      CREATE (sm:SpaceMembership {id: $membershipId, role: 'MEMBER', addedAt: datetime(), createdAt: datetime()})
      CREATE (ws)-[:HAS_MEMBER]->(sm)
      CREATE (sm)-[:IS_MEMBER]->(wm)
      `,
      {
        surname: SURNAME,
        mayaFirst: MAYA,
        uploaderId: ids.uploader,
        outsiderId: ids.outsider,
        meSpaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        mayaId: ids.maya,
        delCtxId: ids.deletedContext,
        danaId: ids.dana,
        creatorId: ids.creator,
        contactId: ids.contact,
        weSpaceId: ids.weSpace,
        membershipId: ids.membership,
        wsOwnerId: ids.wsOwner,
        wsMemberId: ids.wsMember,
      }
    )
    ready = true
  } finally {
    await session.close()
  }
}, 120_000)

afterAll(async () => {
  const session = driver.session()
  try {
    await session.run(`MATCH (n) WHERE n.id IN $allIds DETACH DELETE n`, {
      allIds: Object.values(ids),
    })
  } finally {
    await session.close()
    // Route-handler/driver singleton: without this the suite hangs on exit.
    await driver.close()
  }
}, 120_000)

const maybe = (name: string, fn: () => Promise<void>) =>
  it(name, async () => {
    if (!ready) return
    await fn()
  })

describe('search_person_by_name — GOAL-275 PII gate', () => {
  maybe('refuses outright when there is no caller identity', async () => {
    const { result } = await searchAs(null)
    expect(result.found).toBe(false)
    expect(result.count).toBe(0)
    expect(result.people).toBeUndefined()
    expect(result.message).toMatch(/sign in/i)
  })

  maybe(
    'an unrelated caller gets directory identity but no PII',
    async () => {
      const { result, byName } = await searchAs(ids.outsider)

      // Still findable — the negative case is "private", not "not found".
      expect(result.found).toBe(true)
      const maya = byName.get(MAYA)
      expect(maya).toBeDefined()
      expect(maya!.name).toContain(SURNAME)

      expect(maya!.privateProfileVisible).toBe(false)
      expect(maya!.email).toBeNull()
      expect(maya!.pronouns).toBeNull()
      expect(maya!.location).toBeNull()
      expect(maya!.traits).toBeNull()
      expect(maya!.interests).toBeNull()

      // A CONNECTED_TO edge the outsider authored must not unlock anything.
      expect(maya!.connectedPeople).toEqual([])
      expect(maya!.connectionCount).toBe(0)

      // …and the same for an unrelated :User.
      const wanda = byName.get('Wanda')
      expect(wanda!.privateProfileVisible).toBe(false)
      expect(wanda!.email).toBeNull()
    }
  )

  maybe('branch 1 — the caller reads their own profile', async () => {
    const { byName } = await searchAs(ids.outsider)
    const self = byName.get('Ollie')
    expect(self!.privateProfileVisible).toBe(true)
    expect(self!.email).toBe('ollie@example.com')
    expect(self!.location).toBe('Lisbon')
  })

  maybe('branch 2 — the creator reads their imported contact', async () => {
    const { byName } = await searchAs(ids.creator)
    const kai = byName.get('Kai')
    expect(kai!.privateProfileVisible).toBe(true)
    expect(kai!.email).toBe('kai@example.com')
  })

  maybe(
    'branch 3 — a member reads the owner of a Space that owner owns',
    async () => {
      const { byName } = await searchAs(ids.wsMember)
      const wanda = byName.get('Wanda')
      expect(wanda!.privateProfileVisible).toBe(true)
      expect(wanda!.email).toBe('wanda@example.com')
    }
  )

  maybe(
    'branch 4 — the owner reads a member of their WeSpace',
    async () => {
      const { byName } = await searchAs(ids.wsOwner)
      const milo = byName.get('Milo')
      expect(milo!.privateProfileVisible).toBe(true)
      expect(milo!.email).toBe('milo@example.com')
    }
  )

  maybe(
    'branch 5 — a context viewer reads an attached person',
    async () => {
      const { byName } = await searchAs(ids.uploader)
      const maya = byName.get(MAYA)
      expect(maya!.privateProfileVisible).toBe(true)
      expect(maya!.email).toBe('maya@example.com')
      expect(maya!.location).toBe('Oakland')
    }
  )

  maybe(
    'branch 5 boundary — a soft-deleted context withdraws reach',
    async () => {
      const { byName } = await searchAs(ids.uploader)
      const dana = byName.get('Dana')
      expect(dana).toBeDefined()
      expect(dana!.privateProfileVisible).toBe(false)
      expect(dana!.email).toBeNull()
      expect(dana!.location).toBeNull()
    }
  )

  maybe(
    'a private single match tells the model the profile is private',
    async () => {
      const tool = createPersonSearchTool(graph, ids.outsider)
      const result = JSON.parse(
        await tool.invoke({ name: MAYA })
      ) as PersonSearchResult

      expect(result.count).toBe(1)
      expect(result.message).toContain('PERSON_PROFILE_PRIVATE')
      expect(result.message).not.toContain('PERSON_PROFILE_FOUND')
      expect(result.message).not.toContain('maya@example.com')
    }
  )

  maybe('an authorized single match still emits the render marker', async () => {
    const tool = createPersonSearchTool(graph, ids.uploader)
    const result = JSON.parse(
      await tool.invoke({ name: MAYA })
    ) as PersonSearchResult

    expect(result.count).toBe(1)
    expect(result.message).toContain('PERSON_PROFILE_FOUND')
    expect(result.message).toContain('maya@example.com')
  })
})
