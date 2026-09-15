import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import jwt from 'jsonwebtoken'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { createYoga, type YogaServerInstance } from 'graphql-yoga'
import type { GraphQLSchema } from 'graphql'
import { driver } from '@/lib/neo4j/driver'

/**
 * GOAL-373 — live negative controls for the space-visibility READ rule after
 * it was re-anchored on `SpaceAuthAnchor` (one `:Space` traversal) instead of
 * four `meSpace_SOME` / `weSpace_SOME` branches.
 *
 * The compaction is meant to be policy-neutral. That claim is only worth
 * anything if it is exercised end-to-end, so this suite mints real HS256 JWTs
 * and drives the full HTTP surface against the real dev Neo4j — same technique
 * as `pulse-write-auth.integration.test.ts`, which it deliberately mirrors.
 *
 * The policy (kb/02-user-roles.md, Access Model):
 *   - WeSpace       → owner or ANY member, GUEST included
 *   - MeSpace       → owner ONLY
 *   - FieldContext  → inherits from the parent Space
 *   - Pulses        → inherit from the parent FieldContext
 *   - SpaceMembership → owner or any member of the space it hangs off
 *
 * And the two edges that make the anchor subtle:
 *   - a soft-deleted context (GOAL-319) has its Space edge re-pointed to
 *     HAS_DELETED_CONTEXT, so it must be invisible — to the OWNER too;
 *   - a nested sub-context (GOAL-295) keeps its own HAS_CONTEXT edge, so it
 *     must stay visible to everyone who can see its parent Space.
 */

const JWT_SECRET = process.env.JWT_SECRET ?? ''

let ready = false
let yoga: YogaServerInstance<Record<string, never>, Record<string, unknown>>

const testRunId = `it_${randomUUID().slice(0, 8)}`
const ids = {
  owner: `sv_owner_${testRunId}`,
  guest: `sv_guest_${testRunId}`,
  outsider: `sv_outsider_${testRunId}`,
  stranger: `sv_stranger_${testRunId}`,
  meMember: `sv_memember_${testRunId}`,
  weSpace: `sv_ws_${testRunId}`,
  meSpace: `sv_ms_${testRunId}`,
  strangerMeSpace: `sv_ms_stranger_${testRunId}`,
  smGuest: `sv_sm_guest_${testRunId}`,
  smMeMember: `sv_sm_memember_${testRunId}`,
  context: `sv_ctx_${testRunId}`,
  subContext: `sv_subctx_${testRunId}`,
  deletedContext: `sv_delctx_${testRunId}`,
  meContext: `sv_mectx_${testRunId}`,
  goalPulse: `sv_goal_${testRunId}`,
  storyPulse: `sv_story_${testRunId}`,
  resourcePulse: `sv_resource_${testRunId}`,
  carePulse: `sv_care_${testRunId}`,
  coreValuePulse: `sv_corevalue_${testRunId}`,
  deletedPulse: `sv_delpulse_${testRunId}`,
}

const mintToken = (personId: string) =>
  jwt.sign({ user: { id: personId } }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '30m',
  })

interface GraphQLResponse {
  data?: Record<string, unknown> | null
  errors?: Array<{ message: string }>
}

async function gql(
  token: string | null,
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse> {
  const res = await yoga.fetch('http://test.local/api/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  return (await res.json()) as GraphQLResponse
}

beforeAll(async () => {
  if (!JWT_SECRET) {
    console.warn('JWT_SECRET missing from env — skipping space visibility suite')
    return
  }
  try {
    const s = driver.session()
    await s.run('RETURN 1')
    await s.close()
  } catch {
    console.warn('Neo4j unavailable — skipping space visibility suite')
    return
  }

  const typeDefs = readFileSync(
    path.join(process.cwd(), 'src/lib/graphql/schema/schema.gql'),
    'utf8'
  )
  const neoSchema = new Neo4jGraphQL({
    typeDefs,
    resolvers: {
      Person: {
        name: (s: { firstName: string; lastName: string }) =>
          `${s.firstName} ${s.lastName}`,
      },
      User: {
        name: (s: { firstName: string; lastName: string }) =>
          `${s.firstName} ${s.lastName}`,
      },
      Document: { downloadUrl: () => null },
    },
    driver,
    features: {
      authorization: { key: JWT_SECRET },
      excludeDeprecatedFields: {
        implicitEqualFilters: true,
        implicitSet: true,
        deprecatedOptionsArgument: true,
        directedArgument: true,
        connectOrCreate: true,
      },
    },
  })

  let schema: GraphQLSchema
  try {
    schema = await neoSchema.getSchema()
  } catch (error) {
    throw new Error(
      `Neo4jGraphQL getSchema() failed — schema.gql does not build: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }

  yoga = createYoga({
    schema,
    graphqlEndpoint: '/api/graphql',
    context: async (req) => {
      const authHeader = req.request.headers.get('authorization')
      let decoded = null
      if (authHeader) {
        try {
          const jwtString = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader
          decoded = jwt.verify(jwtString, JWT_SECRET, { algorithms: ['HS256'] })
        } catch {
          decoded = null
        }
      }
      return { jwt: decoded }
    },
  }) as typeof yoga

  const session = driver.session()
  try {
    await session.run(
      `
      CREATE (owner:Person:User {id: $owner, firstName: 'SV', lastName: 'Owner', createdAt: datetime()})
      CREATE (guest:Person:User {id: $guest, firstName: 'SV', lastName: 'Guest', createdAt: datetime()})
      CREATE (outsider:Person:User {id: $outsider, firstName: 'SV', lastName: 'Outsider', createdAt: datetime()})
      CREATE (stranger:Person:User {id: $stranger, firstName: 'SV', lastName: 'Stranger', createdAt: datetime()})
      CREATE (meMember:Person:User {id: $meMember, firstName: 'SV', lastName: 'MeMember', createdAt: datetime()})

      CREATE (ws:Space:WeSpace {id: $weSpace, name: 'SV WeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (owner)-[:OWNS]->(ws)
      CREATE (ws)-[:HAS_MEMBER]->(sm:SpaceMembership {id: $smGuest, role: 'GUEST', addedAt: datetime()})-[:IS_MEMBER]->(guest)

      // MeSpaces: owner-only reads on the SPACE, but owner-or-member on its
      // CONTENT. The anchor cannot tell the labels apart, so that asymmetry is
      // only preserved by MeSpace keeping its own owner-only filter — hence
      // the deliberate MeSpace membership below, which the four-branch form
      // spelled out as a meSpace_SOME + members_SOME branch and this shape
      // does not.
      // ownerId mirrors the denormalised property mespace_owner_unique uses.
      CREATE (ms:Space:MeSpace {id: $meSpace, name: 'SV MeSpace', visibility: 'PRIVATE', ownerId: $owner, createdAt: datetime()})
      CREATE (owner)-[:OWNS]->(ms)
      CREATE (ms)-[:HAS_MEMBER]->(smm:SpaceMembership {id: $smMeMember, role: 'MEMBER', addedAt: datetime()})-[:IS_MEMBER]->(meMember)
      CREATE (ms)-[:HAS_CONTEXT]->(mectx:FieldContext {id: $meContext, title: 'SV Me Field', createdAt: datetime()})
      CREATE (sms:Space:MeSpace {id: $strangerMeSpace, name: 'SV Stranger MeSpace', visibility: 'PRIVATE', ownerId: $stranger, createdAt: datetime()})
      CREATE (stranger)-[:OWNS]->(sms)

      // A live context, plus a sub-context that keeps its OWN HAS_CONTEXT edge
      // (GOAL-295) alongside the HAS_SUBCONTEXT hierarchy overlay.
      CREATE (ws)-[:HAS_CONTEXT]->(ctx:FieldContext {id: $context, title: 'SV Field', createdAt: datetime()})
      CREATE (ws)-[:HAS_CONTEXT]->(sub:FieldContext {id: $subContext, title: 'SV Sub Field', createdAt: datetime()})
      CREATE (ctx)-[:HAS_SUBCONTEXT]->(sub)

      // A soft-deleted context (GOAL-319): Space edge re-pointed, deletedAt set.
      CREATE (ws)-[:HAS_DELETED_CONTEXT]->(del:FieldContext {id: $deletedContext, title: 'SV Deleted Field', createdAt: datetime(), deletedAt: datetime()})

      // One of EVERY pulse type whose READ filter this change rewrote.
      CREATE (ctx)-[:HAS_PULSE]->(g:FieldPulse:GoalPulse {id: $goalPulse, title: 'SV Goal', content: 'goal content', status: 'ACTIVE', createdAt: datetime()})
      CREATE (g)-[:CREATED_BY]->(owner)
      CREATE (ctx)-[:HAS_PULSE]->(r:FieldPulse:ResourcePulse {id: $resourcePulse, title: 'SV Resource', content: 'resource content', createdAt: datetime()})
      CREATE (r)-[:CREATED_BY]->(owner)
      CREATE (ctx)-[:HAS_PULSE]->(cp:FieldPulse:CarePulse {id: $carePulse, title: 'SV Care', content: 'care content', createdAt: datetime()})
      CREATE (cp)-[:CREATED_BY]->(owner)
      CREATE (ctx)-[:HAS_PULSE]->(cv:FieldPulse:CoreValuePulse {id: $coreValuePulse, title: 'SV Core Value', content: 'core value content', createdAt: datetime()})
      CREATE (cv)-[:CREATED_BY]->(owner)
      CREATE (sub)-[:HAS_PULSE]->(s:FieldPulse:StoryPulse {id: $storyPulse, title: 'SV Story', content: 'story content', createdAt: datetime()})
      CREATE (s)-[:CREATED_BY]->(owner)
      CREATE (del)-[:HAS_PULSE]->(dp:FieldPulse:GoalPulse {id: $deletedPulse, title: 'SV Deleted Goal', content: 'deleted content', status: 'ACTIVE', createdAt: datetime(), deletedAt: datetime()})
      CREATE (dp)-[:CREATED_BY]->(owner)
      `,
      ids
    )
    ready = true
  } finally {
    await session.close()
  }
}, 180_000)

afterAll(async () => {
  const session = driver.session()
  try {
    await session.run(`MATCH (n) WHERE n.id IN $allIds DETACH DELETE n`, {
      allIds: Object.values(ids),
    })
  } finally {
    await session.close()
    await driver.close()
  }
}, 120_000)

const READ_WE_SPACE = `
  query ReadWeSpace($id: ID!) {
    weSpaces(where: { id_EQ: $id }) { id name }
  }
`
const READ_ME_SPACE = `
  query ReadMeSpace($id: ID!) {
    meSpaces(where: { id_EQ: $id }) { id name }
  }
`
const READ_CONTEXT = `
  query ReadContext($id: ID!) {
    fieldContexts(where: { id_EQ: $id }) { id title }
  }
`
const READ_GOAL_PULSE = `
  query ReadGoalPulse($id: ID!) {
    goalPulses(where: { id_EQ: $id }) { id title }
  }
`
const READ_STORY_PULSE = `
  query ReadStoryPulse($id: ID!) {
    storyPulses(where: { id_EQ: $id }) { id title }
  }
`
const READ_MEMBERSHIP = `
  query ReadMembership($id: ID!) {
    spaceMemberships(where: { id_EQ: $id }) { id role }
  }
`

/** Every read surface the rule gates, as (label, document, id) triples. */
const ALL_FOUR = [
  ['WeSpace', READ_WE_SPACE, 'weSpace', 'weSpaces'],
  ['FieldContext', READ_CONTEXT, 'context', 'fieldContexts'],
  ['GoalPulse', READ_GOAL_PULSE, 'goalPulse', 'goalPulses'],
  ['SpaceMembership', READ_MEMBERSHIP, 'smGuest', 'spaceMemberships'],
] as const

const readPulse = (root: string) => `
  query ReadPulse($id: ID!) { ${root}(where: { id_EQ: $id }) { id title } }
`

/** All five pulse types whose READ filter this change rewrote. */
const ALL_PULSES = [
  ['goalPulses', 'goalPulse'],
  ['resourcePulses', 'resourcePulse'],
  ['storyPulses', 'storyPulse'],
  ['carePulses', 'carePulse'],
  ['coreValuePulses', 'coreValuePulse'],
] as const

describe('GOAL-373 space-visibility READ rule — live negative controls', () => {
  it('actually ran against a live database', () => {
    // Without this the whole suite is 20-odd green ticks asserting nothing:
    // every test below opens `if (!ready) return`, and `ready` stays false when
    // JWT_SECRET is unset or Neo4j is unreachable. Fail loudly instead.
    expect(ready).toBe(true)
  })

  it('holds the :Space label invariant this whole shape depends on', async () => {
    // SpaceAuthAnchor matches the bare `:Space` label, so the compacted rule is
    // equivalent to the old four-branch form ONLY while every Space node also
    // carries exactly one of :MeSpace / :WeSpace. Neo4j cannot express that as
    // a constraint (no label implication), so assert it on the live DB. A bare
    // :Space node would be a container readable through `fieldContexts` and
    // every pulse root but invisible to `meSpaces` / `weSpaces`.
    if (!ready) return
    const session = driver.session()
    try {
      const res = await session.run(`
        MATCH (s:Space)
        WHERE NOT (s:MeSpace OR s:WeSpace)
        RETURN count(s) AS bare
        UNION ALL
        MATCH (s:Space) WHERE s:MeSpace AND s:WeSpace RETURN count(s) AS bare
        UNION ALL
        MATCH (n)-[:HAS_CONTEXT|HAS_MEMBER]->() WHERE NOT n:Space RETURN count(n) AS bare
      `)
      for (const record of res.records) {
        expect(record.get('bare').toNumber()).toBe(0)
      }
    } finally {
      await session.close()
    }
  }, 60_000)

  describe('an outsider (no OWNS, no membership)', () => {
    it.each(ALL_FOUR)('cannot read the %s', async (_label, doc, idKey, root) => {
      if (!ready) return
      const res = await gql(mintToken(ids.outsider), doc, {
        id: ids[idKey],
      })
      expect(res.errors).toBeUndefined()
      expect(res.data?.[root]).toEqual([])
    })

    it('cannot read the WeSpace through its contexts either', async () => {
      if (!ready) return
      const res = await gql(
        mintToken(ids.outsider),
        `query { weSpaces { id contexts { id title pulses { id } } } }`
      )
      expect(res.errors).toBeUndefined()
      const spaces = res.data?.weSpaces as Array<{ id: string }>
      expect(spaces.map((s) => s.id)).not.toContain(ids.weSpace)
    })

    it('sees an empty list, not an error, on an unscoped pulse read', async () => {
      // The filter must exclude rows, never fail the request — the dashboard
      // renders the whole list from one document.
      if (!ready) return
      const res = await gql(
        mintToken(ids.outsider),
        `query { goalPulses { id } storyPulses { id } }`
      )
      expect(res.errors).toBeUndefined()
      const goals = res.data?.goalPulses as Array<{ id: string }>
      expect(goals.map((g) => g.id)).not.toContain(ids.goalPulse)
    })

    it.each(ALL_PULSES)('cannot read the %s', async (root, idKey) => {
      // All five types were rewritten; GoalPulse alone would not catch a typo
      // in one of the other four.
      if (!ready) return
      const res = await gql(mintToken(ids.outsider), readPulse(root), {
        id: ids[idKey],
      })
      expect(res.errors).toBeUndefined()
      expect(res.data?.[root]).toEqual([])
    })

    it.each([
      ['spaces_NONE', `spaces_NONE: {}`],
      ['spaces_ALL', `spaces_ALL: {}`],
      ['spaces_SINGLE', `spaces_SINGLE: {}`],
    ])(
      'cannot widen its own reach with a caller-supplied %s predicate',
      async (_label, predicate) => {
        // `spaces_*` is newly reachable in FieldContextWhere. It is ANDed with
        // the @authorization filter, so it can only narrow — but a caller
        // controls it, so prove it.
        if (!ready) return
        const res = await gql(
          mintToken(ids.outsider),
          `query { fieldContexts(where: { ${predicate} }) { id title } }`
        )
        expect(res.errors).toBeUndefined()
        const rows = res.data?.fieldContexts as Array<{ id: string }>
        expect(rows.map((r) => r.id)).not.toContain(ids.context)
        expect(rows.map((r) => r.id)).not.toContain(ids.meContext)
      }
    )
  })

  describe('a GUEST member (view-only role)', () => {
    it.each(ALL_FOUR)('can read the %s', async (_label, doc, idKey, root) => {
      if (!ready) return
      const res = await gql(mintToken(ids.guest), doc, { id: ids[idKey] })
      expect(res.errors).toBeUndefined()
      expect(res.data?.[root]).toHaveLength(1)
    })

    it.each(ALL_PULSES)('can read the %s', async (root, idKey) => {
      if (!ready) return
      const res = await gql(mintToken(ids.guest), readPulse(root), {
        id: ids[idKey],
      })
      expect(res.errors).toBeUndefined()
      expect(res.data?.[root]).toHaveLength(1)
    })

    it('can read a nested sub-context and its pulses (GOAL-295)', async () => {
      // The sub-context is reached by its OWN HAS_CONTEXT edge, which is what
      // the anchor traverses — the HAS_SUBCONTEXT overlay is not part of the rule.
      if (!ready) return
      const ctx = await gql(mintToken(ids.guest), READ_CONTEXT, {
        id: ids.subContext,
      })
      expect(ctx.data?.fieldContexts).toHaveLength(1)
      const pulse = await gql(mintToken(ids.guest), READ_STORY_PULSE, {
        id: ids.storyPulse,
      })
      expect(pulse.data?.storyPulses).toHaveLength(1)
    })
  })

  describe('a MeSpace owner', () => {
    it('can read their own MeSpace and its context', async () => {
      if (!ready) return
      const space = await gql(mintToken(ids.owner), READ_ME_SPACE, {
        id: ids.meSpace,
      })
      expect(space.errors).toBeUndefined()
      expect(space.data?.meSpaces).toHaveLength(1)

      const ctx = await gql(mintToken(ids.owner), READ_CONTEXT, {
        id: ids.meContext,
      })
      expect(ctx.data?.fieldContexts).toHaveLength(1)
    })

    it("cannot read somebody else's MeSpace", async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.owner), READ_ME_SPACE, {
        id: ids.strangerMeSpace,
      })
      expect(res.errors).toBeUndefined()
      expect(res.data?.meSpaces).toEqual([])
    })

    it("cannot read another owner's MeSpace context", async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.stranger), READ_CONTEXT, {
        id: ids.meContext,
      })
      expect(res.errors).toBeUndefined()
      expect(res.data?.fieldContexts).toEqual([])
    })
  })

  describe('a MeSpace MEMBER — the asymmetry the anchor cannot see', () => {
    // The anchor matches the bare `:Space` label, so its rule is the WeSpace
    // one (owner or any member) for BOTH labels. What keeps a MeSpace
    // owner-only is `MeSpace`'s own filter, which was deliberately left alone.
    // These two tests are what catch it if that ever stops being true.
    it('CAN read the MeSpace FieldContext (content inherits owner-or-member)', async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.meMember), READ_CONTEXT, {
        id: ids.meContext,
      })
      expect(res.errors).toBeUndefined()
      expect(res.data?.fieldContexts).toHaveLength(1)
    })

    it('CANNOT read the MeSpace node itself (owner-only, unchanged)', async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.meMember), READ_ME_SPACE, {
        id: ids.meSpace,
      })
      expect(res.errors).toBeUndefined()
      expect(res.data?.meSpaces).toEqual([])
    })
  })

  describe('soft-deleted contexts (GOAL-319) stay invisible', () => {
    it.each([
      ['the owner', 'owner'],
      ['a GUEST member', 'guest'],
    ] as const)('to %s', async (_who, idKey) => {
      if (!ready) return
      const token = mintToken(ids[idKey])

      const ctx = await gql(token, READ_CONTEXT, { id: ids.deletedContext })
      expect(ctx.errors).toBeUndefined()
      expect(ctx.data?.fieldContexts).toEqual([])

      // And the pulses it still holds by HAS_PULSE.
      const pulse = await gql(token, READ_GOAL_PULSE, { id: ids.deletedPulse })
      expect(pulse.errors).toBeUndefined()
      expect(pulse.data?.goalPulses).toEqual([])
    })

    it('does not surface through the parent WeSpace contexts list', async () => {
      if (!ready) return
      const res = await gql(
        mintToken(ids.owner),
        `query Ctxs($id: ID!) { weSpaces(where: { id_EQ: $id }) { id contexts { id } } }`,
        { id: ids.weSpace }
      )
      expect(res.errors).toBeUndefined()
      const spaces = res.data?.weSpaces as Array<{
        contexts: Array<{ id: string }>
      }>
      const contextIds = spaces[0].contexts.map((c) => c.id)
      expect(contextIds).toContain(ids.context)
      expect(contextIds).toContain(ids.subContext)
      expect(contextIds).not.toContain(ids.deletedContext)
    })
  })

  describe('an unauthenticated caller', () => {
    it.each(ALL_FOUR)(
      'reads nothing through %s — refused, or empty, never populated',
      async (_label, doc, idKey, root) => {
        if (!ready) return
        const res = await gql(null, doc, { id: ids[idKey] })
        const rows = res.data?.[root]
        // `extend schema @authentication` refuses outright, or the filter
        // returns an empty list. Exactly one of those, asserted — the earlier
        // `if (rows != null)` form let a request that failed for an unrelated
        // reason pass silently.
        if (res.errors?.length) {
          expect(res.errors.map((e) => e.message).join(' ')).toMatch(
            /unauthenticated|forbidden/i
          )
        } else {
          expect(rows).toEqual([])
        }
      }
    )

    it('cannot read a pulse of any gated type', async () => {
      if (!ready) return
      for (const [root, idKey] of ALL_PULSES) {
        const res = await gql(null, readPulse(root), { id: ids[idKey] })
        if (!res.errors?.length) expect(res.data?.[root]).toEqual([])
      }
    })
  })
})
