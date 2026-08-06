import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import jwt from 'jsonwebtoken'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { createYoga, type YogaServerInstance } from 'graphql-yoga'
import type { GraphQLSchema } from 'graphql'
import { driver } from '@/lib/neo4j/driver'

/**
 * GOAL-314 regression: a Person created via the document-upload ingest flow
 * (:Person:PersonPulse, attached to a FieldContext via HAS_PERSON, EXTRACTED_FROM
 * the Document, and — critically — WITHOUT any (person)-[:CREATED_BY]->(uploader)
 * edge) must still return ALL its authorized PII fields to the uploader when read
 * through the field-level GOAL-275 @authorization gate. The reporter saw "only the
 * name" for these persons; the drawer shows its directory-only fallback exactly
 * when GET_PERSON_PROFILE returns an empty row, so this asserts the row (with its
 * gated scalars) survives the filter for the creator, and stays hidden from an
 * unrelated caller.
 *
 * Harness mirrors pulse-write-auth.integration.test.ts (see memory
 * graphql-auth-verification-technique): build the real schema.gql in-process with
 * the same feature flags as apollo-server.ts and drive it through graphql-yoga
 * with a minted HS256 Bearer token, against the real dev Neo4j.
 */

const JWT_SECRET = process.env.JWT_SECRET ?? ''

let ready = false
let yoga: YogaServerInstance<Record<string, never>, Record<string, unknown>>

const testRunId = `it_${randomUUID().slice(0, 8)}`
const ids = {
  uploader: `test_uploader_${testRunId}`,
  meSpace: `test_me_${testRunId}`,
  fieldContext: `test_ctx_${testRunId}`,
  document: `test_doc_${testRunId}`,
  person: `test_person_${testRunId}`,
  pulse: `test_pulse_${testRunId}`,
  // Never related to the person — the cross-caller isolation check.
  outsider: `test_outsider_${testRunId}`,
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
    console.warn('JWT_SECRET missing from env — skipping person PII read suite')
    return
  }
  try {
    const s = driver.session()
    await s.run('RETURN 1')
    await s.close()
  } catch {
    console.warn('Neo4j unavailable — skipping person PII read suite')
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
    // Seed the EXACT shape the ingest create_person path writes: a
    // :Person:PersonPulse attached to the uploader's MeSpace FieldContext via
    // HAS_PERSON and EXTRACTED_FROM the Document, with NO CREATED_BY edge to the
    // uploader. Gated scalars (email/description/traits) are populated so we can
    // assert whether the field-auth gate returns them.
    await session.run(
      `
      CREATE (u:Person:User {id: $uploaderId, firstName: 'Uma', lastName: 'Uploader', name: 'Uma Uploader', createdAt: datetime()})
      CREATE (x:Person:User {id: $outsiderId, firstName: 'Ollie', lastName: 'Outsider', name: 'Ollie Outsider', createdAt: datetime()})
      CREATE (me:Space:MeSpace {id: $meSpaceId, name: 'Uma MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (u)-[:OWNS]->(me)
      CREATE (c:FieldContext {id: $ctxId, title: 'Uploaded Field', createdAt: datetime()})
      CREATE (me)-[:HAS_CONTEXT]->(c)
      CREATE (d:Document {id: $docId, filename: 'roster.txt', createdAt: datetime()})
      CREATE (c)-[:HAS_DOCUMENT]->(d)
      CREATE (d)-[:UPLOADED_BY]->(u)
      CREATE (p:Person:PersonPulse {
        id: $personId,
        firstName: 'Maya',
        lastName: 'Reyes',
        name: 'Maya Reyes',
        email: 'maya@example.com',
        description: 'A collaborator named in the uploaded roster.',
        traits: 'curious, thorough',
        createdAt: datetime()
      })
      CREATE (c)-[:HAS_PERSON]->(p)
      CREATE (p)-[:EXTRACTED_FROM]->(d)
      // A pulse this person authored (INITIATED_BY) in the uploader's context —
      // the only way an upload-created PersonPulse's contributions surface.
      CREATE (gp:FieldPulse:GoalPulse {
        id: $pulseId,
        title: 'Weave 200 baskets for the winter market',
        content: 'A stated goal captured from the roster.',
        status: 'ACTIVE',
        createdAt: datetime()
      })
      CREATE (c)-[:HAS_PULSE]->(gp)
      CREATE (gp)-[:INITIATED_BY]->(p)
      `,
      {
        uploaderId: ids.uploader,
        outsiderId: ids.outsider,
        meSpaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        docId: ids.document,
        personId: ids.person,
        pulseId: ids.pulse,
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
    await driver.close()
  }
}, 120_000)

// Minimal gated selection — isolates "does the field-auth filter return the row
// for the creator" from any custom-resolver / union complications.
const READ_PERSON_MINIMAL = `
  query ReadPersonMinimal($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      name
      email
      description
      traits
    }
  }
`

// The exact query the entity-info drawer + profile page run (GET_PERSON_PROFILE).
const READ_PERSON_PROFILE = `
  query getPersonProfile($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      firstName
      lastName
      name
      email
      photo
      description
      traits
      passions
      fieldsOfCare
      interests
      careManual
      favorites
      connections { id name }
      connectionEdges { connectedPersonId why interests }
      ownsSpaces {
        ... on MeSpace { id name }
        ... on WeSpace { id name }
      }
      memberOf { id role }
    }
  }
`

// Related pulses — authored (INITIATED_BY) + mentioned (MENTIONED_IN).
const READ_PERSON_RELATED_PULSES = `
  query getPersonRelatedPulses($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      initiatedPulses {
        __typename
        id
        title
      }
      mentionedIn {
        id
        title
      }
    }
  }
`

// Open directory fields — never trigger the PII gate.
const READ_PERSON_DIRECTORY = `
  query getPersonDirectory($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      firstName
      lastName
      name
      photo
    }
  }
`

describe('GOAL-314 — upload-created Person PII visibility to its uploader', () => {
  it('uploader reads the full gated profile (minimal selection)', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.uploader), READ_PERSON_MINIMAL, {
      personId: ids.person,
    })
    expect(res.errors).toBeUndefined()
    expect(res.data?.people).toEqual([
      {
        id: ids.person,
        name: 'Maya Reyes',
        email: 'maya@example.com',
        description: 'A collaborator named in the uploaded roster.',
        traits: 'curious, thorough',
      },
    ])
  })

  it('uploader reads the full drawer/profile query (GET_PERSON_PROFILE)', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.uploader), READ_PERSON_PROFILE, {
      personId: ids.person,
    })
    expect(res.errors).toBeUndefined()
    const people = res.data?.people as Array<Record<string, unknown>> | undefined
    expect(people).toHaveLength(1)
    expect(people?.[0]?.email).toBe('maya@example.com')
    expect(people?.[0]?.description).toBe(
      'A collaborator named in the uploaded roster.'
    )
    expect(people?.[0]?.traits).toBe('curious, thorough')
  })

  it('an unrelated caller is filtered out (gated fields empty)', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.outsider), READ_PERSON_MINIMAL, {
      personId: ids.person,
    })
    expect(res.errors).toBeUndefined()
    expect(res.data?.people).toEqual([])
  })

  it('uploader sees the person\'s authored pulses via initiatedPulses (GOAL-314)', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.uploader), READ_PERSON_RELATED_PULSES, {
      personId: ids.person,
    })
    expect(res.errors).toBeUndefined()
    const people = res.data?.people as
      | Array<{
          initiatedPulses: Array<{ id: string; title: string; __typename: string }>
          mentionedIn: Array<unknown>
        }>
      | undefined
    expect(people).toHaveLength(1)
    expect(people?.[0]?.initiatedPulses).toEqual([
      {
        __typename: 'GoalPulse',
        id: ids.pulse,
        title: 'Weave 200 baskets for the winter market',
      },
    ])
    expect(people?.[0]?.mentionedIn).toEqual([])
  })

  it('an unrelated caller gets no authored pulses (FieldPulse auth-filtered)', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.outsider), READ_PERSON_RELATED_PULSES, {
      personId: ids.person,
    })
    expect(res.errors).toBeUndefined()
    // The person row still resolves (only open fields selected), but each
    // FieldPulse is filtered out by its own @authorization for a non-member.
    const people = res.data?.people as
      | Array<{ initiatedPulses: unknown[] }>
      | undefined
    expect(people?.[0]?.initiatedPulses).toEqual([])
  })

  it('an unrelated caller still sees the open directory fields', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.outsider), READ_PERSON_DIRECTORY, {
      personId: ids.person,
    })
    expect(res.errors).toBeUndefined()
    expect(res.data?.people).toEqual([
      {
        id: ids.person,
        firstName: 'Maya',
        lastName: 'Reyes',
        name: 'Maya Reyes',
        photo: null,
      },
    ])
  })
})
