import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import jwt from 'jsonwebtoken'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { createYoga, type YogaServerInstance } from 'graphql-yoga'
import type { GraphQLSchema } from 'graphql'
import { driver } from '@/lib/neo4j/driver'

/**
 * Integration test for the CarePulse / CoreValuePulse `validate:` blocks in
 * schema.gql (previously these two pulse types had NO validate rules at all,
 * so ANY Space member — including GUEST — could delete them).
 *
 * Per kb/02-user-roles.md operation matrix:
 *   CREATE/UPDATE → owner, ADMIN, or MEMBER on the owning space
 *   DELETE        → creator (either author edge — createdBy OR initiatedBy),
 *                   owner, or ADMIN
 *
 * Technique (see memory: graphql-auth-verification-technique): mint an HS256
 * JWT with `{ user: { id } }` claims from JWT_SECRET in .env.local and POST to
 * /api/graphql with `Authorization: Bearer <token>`. Instead of a running
 * `next dev` server we build the same Neo4jGraphQL schema in-process (same
 * feature flags as src/lib/graphql/apollo-server.ts) and serve it through an
 * in-process graphql-yoga instance whose context mirrors apollo-server.ts:
 * verify the Bearer signature, fall through as unauthenticated on failure.
 * This exercises the full HTTP surface — header parsing, signature
 * verification, @authorization filter + validate evaluation — against the
 * real dev Neo4j.
 *
 * Building the schema in beforeAll also doubles as the regression guard that
 * schema.gql still constructs: @neo4j/graphql validates @authorization
 * annotations (including the new validate blocks) at getSchema() time.
 */

const JWT_SECRET = process.env.JWT_SECRET ?? ''

let ready = false
// Wide context generic; the concrete instance (whose context callback returns
// `{ jwt }`) is cast to this on assignment. Only `.fetch` is exercised, so the
// context type is irrelevant to the test.
let yoga: YogaServerInstance<Record<string, never>, Record<string, unknown>>

const testRunId = `it_${randomUUID().slice(0, 8)}`
const ids = {
  owner: `test_owner_${testRunId}`,
  admin: `test_admin_${testRunId}`,
  member: `test_member_${testRunId}`,
  guest: `test_guest_${testRunId}`,
  weSpace: `test_ws_${testRunId}`,
  smAdmin: `test_sm_admin_${testRunId}`,
  smMember: `test_sm_member_${testRunId}`,
  smGuest: `test_sm_guest_${testRunId}`,
  fieldContext: `test_ctx_${testRunId}`,
  carePulse: `test_care_${testRunId}`,
  coreValuePulse: `test_cv_${testRunId}`,
  memberCarePulse: `test_care_member_${testRunId}`,
  // Never seeded — a Person id outside the WeSpace for isolation checks.
  outsider: `test_outsider_${testRunId}`,
}

/** Mint the same HS256 token shape signJWT/login issues: `{ user: { id } }`. */
const mintToken = (personId: string) =>
  jwt.sign({ user: { id: personId } }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '30m',
  })

interface GraphQLResponse {
  data?: Record<string, unknown> | null
  errors?: Array<{ message: string }>
}

/** POST an operation to the in-process /api/graphql endpoint. */
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

/** Count nodes with the given id directly in Neo4j (bypasses authorization). */
async function countNodes(id: string): Promise<number> {
  const session = driver.session()
  try {
    const result = await session.run(
      'MATCH (n {id: $id}) RETURN count(n) AS c',
      { id }
    )
    return result.records[0].get('c').toNumber()
  } finally {
    await session.close()
  }
}

beforeAll(async () => {
  if (!JWT_SECRET) {
    console.warn('JWT_SECRET missing from env — skipping pulse auth suite')
    return
  }
  try {
    const s = driver.session()
    await s.run('RETURN 1')
    await s.close()
  } catch {
    console.warn('Neo4j unavailable — skipping pulse auth suite')
    return
  }

  // Same construction as src/lib/graphql/apollo-server.ts, with minimal stubs
  // for the three @customResolver fields (Person.name, User.name,
  // Document.downloadUrl) so we don't import the full resolver graph.
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
    // Surface loudly: the new validate blocks failed schema construction.
    throw new Error(
      `Neo4jGraphQL getSchema() failed — schema.gql does not build: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }

  yoga = createYoga({
    schema,
    graphqlEndpoint: '/api/graphql',
    // Mirrors apollo-server.ts: verify the Bearer signature (HS256 against
    // JWT_SECRET); on failure the request proceeds unauthenticated.
    context: async (req) => {
      const authHeader = req.request.headers.get('authorization')
      let decoded = null
      if (authHeader) {
        try {
          const jwtString = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader
          decoded = jwt.verify(jwtString, JWT_SECRET, {
            algorithms: ['HS256'],
          })
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
      CREATE (owner:Person:User {id: $ownerId, firstName: 'Test', lastName: 'Owner', createdAt: datetime()})
      CREATE (admin:Person:User {id: $adminId, firstName: 'Test', lastName: 'Admin', createdAt: datetime()})
      CREATE (member:Person:User {id: $memberId, firstName: 'Test', lastName: 'Member', createdAt: datetime()})
      CREATE (guest:Person:User {id: $guestId, firstName: 'Test', lastName: 'Guest', createdAt: datetime()})
      CREATE (ws:Space:WeSpace {id: $weSpaceId, name: 'Test WeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (owner)-[:OWNS]->(ws)
      CREATE (ws)-[:HAS_MEMBER]->(smA:SpaceMembership {id: $smAdminId, role: 'ADMIN', addedAt: datetime()})-[:IS_MEMBER]->(admin)
      CREATE (ws)-[:HAS_MEMBER]->(smM:SpaceMembership {id: $smMemberId, role: 'MEMBER', addedAt: datetime()})-[:IS_MEMBER]->(member)
      CREATE (ws)-[:HAS_MEMBER]->(smG:SpaceMembership {id: $smGuestId, role: 'GUEST', addedAt: datetime()})-[:IS_MEMBER]->(guest)
      CREATE (ctx:FieldContext {id: $ctxId, title: 'Test Field', createdAt: datetime()})
      CREATE (ws)-[:HAS_CONTEXT]->(ctx)
      // Owner-authored pulses via the assistant/doc-ingest author edge.
      CREATE (care:FieldPulse:CarePulse {id: $carePulseId, title: 'Test Care Pulse', content: 'Care content', createdAt: datetime()})
      CREATE (ctx)-[:HAS_PULSE]->(care)
      CREATE (care)-[:INITIATED_BY]->(owner)
      CREATE (cv:FieldPulse:CoreValuePulse {id: $coreValuePulseId, title: 'Test Core Value Pulse', content: 'Core value content', createdAt: datetime()})
      CREATE (ctx)-[:HAS_PULSE]->(cv)
      CREATE (cv)-[:INITIATED_BY]->(owner)
      // MEMBER-authored pulse carrying ONLY the dashboard/import author edge
      // (createdBy) — isolates the createdBy_SOME branch of the DELETE rule.
      CREATE (careM:FieldPulse:CarePulse {id: $memberCarePulseId, title: 'Member Care Pulse', content: 'Member care content', createdAt: datetime()})
      CREATE (ctx)-[:HAS_PULSE]->(careM)
      CREATE (careM)-[:CREATED_BY]->(member)
      `,
      {
        ownerId: ids.owner,
        adminId: ids.admin,
        memberId: ids.member,
        guestId: ids.guest,
        weSpaceId: ids.weSpace,
        smAdminId: ids.smAdmin,
        smMemberId: ids.smMember,
        smGuestId: ids.smGuest,
        ctxId: ids.fieldContext,
        carePulseId: ids.carePulse,
        coreValuePulseId: ids.coreValuePulse,
        memberCarePulseId: ids.memberCarePulse,
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
    // Pulses created during the suite (e.g. the MEMBER create test) hang off
    // the test FieldContext — sweep them before deleting the fixture nodes.
    await session.run(
      `MATCH (c:FieldContext {id: $ctxId})-[:HAS_PULSE]->(p:FieldPulse) DETACH DELETE p`,
      { ctxId: ids.fieldContext }
    )
    await session.run(
      `MATCH (n) WHERE n.id IN $allIds DETACH DELETE n`,
      { allIds: Object.values(ids) }
    )
  } finally {
    await session.close()
    await driver.close()
  }
}, 120_000)

const DELETE_CARE = `
  mutation DeleteCare($id: ID!) {
    deleteCarePulses(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`

const DELETE_CORE_VALUE = `
  mutation DeleteCoreValue($id: ID!) {
    deleteCoreValuePulses(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`

const READ_CARE = `
  query ReadCare($id: ID!) {
    carePulses(where: { id_EQ: $id }) {
      id
      title
    }
  }
`

const READ_CORE_VALUE = `
  query ReadCoreValue($id: ID!) {
    coreValuePulses(where: { id_EQ: $id }) {
      id
      title
    }
  }
`

describe('CarePulse / CoreValuePulse write authorization (schema.gql validate blocks)', () => {
  // ── Regression guard: the READ filter is unchanged ────────────────────────
  describe('when the user is a GUEST member (read path unchanged)', () => {
    it('GUEST can still READ the CarePulse', async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.guest), READ_CARE, {
        id: ids.carePulse,
      })
      expect(res.errors).toBeUndefined()
      expect(res.data?.carePulses).toEqual([
        { id: ids.carePulse, title: 'Test Care Pulse' },
      ])
    })

    it('GUEST can still READ the CoreValuePulse', async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.guest), READ_CORE_VALUE, {
        id: ids.coreValuePulse,
      })
      expect(res.errors).toBeUndefined()
      expect(res.data?.coreValuePulses).toEqual([
        { id: ids.coreValuePulse, title: 'Test Core Value Pulse' },
      ])
    })
  })

  describe('when the user is NOT in the Space (cross-Space isolation)', () => {
    it('an outsider gets zero rows for both pulse types (empty, not an error)', async () => {
      if (!ready) return
      const token = mintToken(ids.outsider)
      const care = await gql(token, READ_CARE, { id: ids.carePulse })
      const cv = await gql(token, READ_CORE_VALUE, { id: ids.coreValuePulse })
      expect(care.errors).toBeUndefined()
      expect(care.data?.carePulses).toEqual([])
      expect(cv.errors).toBeUndefined()
      expect(cv.data?.coreValuePulses).toEqual([])
    })
  })

  // ── The fix: GUEST can no longer delete ──────────────────────────────────
  describe('when a GUEST member attempts DELETE', () => {
    it('deleteCarePulses is rejected with Forbidden and the pulse survives', async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.guest), DELETE_CARE, {
        id: ids.carePulse,
      })
      expect(res.errors).toBeDefined()
      expect(res.errors?.[0].message).toMatch(/Forbidden/)
      expect(res.data?.deleteCarePulses ?? null).toBeNull()
      await expect(countNodes(ids.carePulse)).resolves.toBe(1)
    })

    it('deleteCoreValuePulses is rejected with Forbidden and the pulse survives', async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.guest), DELETE_CORE_VALUE, {
        id: ids.coreValuePulse,
      })
      expect(res.errors).toBeDefined()
      expect(res.errors?.[0].message).toMatch(/Forbidden/)
      expect(res.data?.deleteCoreValuePulses ?? null).toBeNull()
      await expect(countNodes(ids.coreValuePulse)).resolves.toBe(1)
    })
  })

  // ── GUEST cannot CREATE either (CREATE/UPDATE rule) ──────────────────────
  describe('when a GUEST member attempts CREATE', () => {
    it('createCarePulses is rejected with Forbidden', async () => {
      if (!ready) return
      const res = await gql(
        mintToken(ids.guest),
        `
        mutation CreateCare($input: [CarePulseCreateInput!]!) {
          createCarePulses(input: $input) {
            carePulses { id }
          }
        }
        `,
        {
          input: [
            {
              title: 'Guest attempt',
              content: 'Should be rejected',
              createdAt: new Date().toISOString(),
              context: {
                connect: [
                  { where: { node: { id_EQ: ids.fieldContext } } },
                ],
              },
            },
          ],
        }
      )
      expect(res.errors).toBeDefined()
      expect(res.errors?.[0].message).toMatch(/Forbidden/)
    })
  })

  describe('when a MEMBER creates content (CREATE/UPDATE rule allows MEMBER)', () => {
    it('createCoreValuePulses succeeds for a MEMBER', async () => {
      if (!ready) return
      const res = await gql(
        mintToken(ids.member),
        `
        mutation CreateCoreValue($input: [CoreValuePulseCreateInput!]!) {
          createCoreValuePulses(input: $input) {
            coreValuePulses { id title }
          }
        }
        `,
        {
          input: [
            {
              title: 'Member core value',
              content: 'Created by a MEMBER',
              createdAt: new Date().toISOString(),
              context: {
                connect: [
                  { where: { node: { id_EQ: ids.fieldContext } } },
                ],
              },
            },
          ],
        }
      )
      expect(res.errors).toBeUndefined()
      const created = res.data?.createCoreValuePulses as {
        coreValuePulses: Array<{ id: string; title: string }>
      }
      expect(created.coreValuePulses).toHaveLength(1)
      expect(created.coreValuePulses[0].title).toBe('Member core value')
    })
  })

  // ── Positive DELETE paths ─────────────────────────────────────────────────
  describe('when the creator or an ADMIN deletes', () => {
    it('the creator (space owner, via initiatedBy) CAN delete their own CarePulse', async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.owner), DELETE_CARE, {
        id: ids.carePulse,
      })
      expect(res.errors).toBeUndefined()
      expect(
        (res.data?.deleteCarePulses as { nodesDeleted: number }).nodesDeleted
      ).toBe(1)
      await expect(countNodes(ids.carePulse)).resolves.toBe(0)
    })

    it('a MEMBER creator (createdBy edge only, not owner/ADMIN) CAN delete their own CarePulse', async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.member), DELETE_CARE, {
        id: ids.memberCarePulse,
      })
      expect(res.errors).toBeUndefined()
      expect(
        (res.data?.deleteCarePulses as { nodesDeleted: number }).nodesDeleted
      ).toBe(1)
      await expect(countNodes(ids.memberCarePulse)).resolves.toBe(0)
    })

    it('an ADMIN (non-creator) CAN delete the CoreValuePulse', async () => {
      if (!ready) return
      const res = await gql(mintToken(ids.admin), DELETE_CORE_VALUE, {
        id: ids.coreValuePulse,
      })
      expect(res.errors).toBeUndefined()
      expect(
        (res.data?.deleteCoreValuePulses as { nodesDeleted: number })
          .nodesDeleted
      ).toBe(1)
      await expect(countNodes(ids.coreValuePulse)).resolves.toBe(0)
    })
  })
})
