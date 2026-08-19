import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import jwt from 'jsonwebtoken'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { createYoga, type YogaServerInstance } from 'graphql-yoga'
import type { GraphQLSchema } from 'graphql'
import { driver } from '@/lib/neo4j/driver'

/**
 * GOAL-275 Person PII gate — behavioural contract.
 *
 * The gate used to be an identical field-level `@authorization` filter copied
 * onto 14 `Person` fields. It now lives in ONE place: a type-level filter on
 * `PersonPrivateProfile`, reached through `Person.privateProfile`. This suite
 * pins the policy branch-by-branch so the consolidation cannot quietly widen
 * or narrow who can read what:
 *
 *   1. the person themselves          (id_EQ $jwt.user.id)
 *   2. the creator of the person node (createdBy_SOME)
 *   3. a co-member of a Space the person OWNS      (ownsSpaces_SOME)
 *   4. the owner of a Space the person is a MEMBER of (memberOf_SOME)
 *   5. anyone who can view a FieldContext holding them (contexts_SOME)
 *
 * plus the negatives that define the boundary: an unrelated caller, a
 * CONNECTED_TO edge (never a consent signal), and a soft-deleted context.
 *
 * Harness mirrors pulse-write-auth.integration.test.ts (see memory
 * graphql-auth-verification-technique): build the real schema.gql in-process
 * with the same feature flags as apollo-server.ts and drive it through
 * graphql-yoga with a minted HS256 Bearer token, against the real dev Neo4j.
 */

const JWT_SECRET = process.env.JWT_SECRET ?? ''

let ready = false
let yoga: YogaServerInstance<Record<string, never>, Record<string, unknown>>

const testRunId = `it_${randomUUID().slice(0, 8)}`
const id = (suffix: string) => `test_${suffix}_${testRunId}`

const ids = {
  // Branch 5 — upload/ingest shape: a :Person:PersonPulse attached to a
  // FieldContext via HAS_PERSON with NO CREATED_BY edge (the GOAL-314 case).
  uploader: id('uploader'),
  meSpace: id('me'),
  fieldContext: id('ctx'),
  document: id('doc'),
  person: id('person'),
  pulse: id('pulse'),
  // Branch 5 via a GOAL-295 nested sub-context.
  subContext: id('subctx'),
  subPerson: id('subperson'),
  // Branch 5 boundary — a soft-deleted context (GOAL-319).
  deletedContext: id('delctx'),
  deletedPerson: id('delperson'),
  // Branch 2 — createdBy.
  creator: id('creator'),
  contact: id('contact'),
  // Branches 3 + 4 — a WeSpace owner and member seeing each other.
  wsOwner: id('wsowner'),
  wsMember: id('wsmember'),
  wsMember2: id('wsmember2'),
  weSpace: id('ws'),
  membership: id('sm'),
  membership2: id('sm2'),
  // Never related to anyone — the isolation check.
  outsider: id('outsider'),
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

let schema: GraphQLSchema

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
      // ── Branch 5: the ingest shape ────────────────────────────────────────
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
        id: $personId, firstName: 'Maya', lastName: 'Reyes', name: 'Maya Reyes',
        email: 'maya@example.com',
        description: 'A collaborator named in the uploaded roster.',
        traits: 'curious, thorough', phone: '555-0100', pronouns: 'she/her',
        createdAt: datetime()
      })
      CREATE (c)-[:HAS_PERSON]->(p)
      CREATE (p)-[:EXTRACTED_FROM]->(d)
      CREATE (gp:FieldPulse:GoalPulse {
        id: $pulseId, title: 'Weave 200 baskets for the winter market',
        content: 'A stated goal captured from the roster.', status: 'ACTIVE',
        createdAt: datetime()
      })
      CREATE (c)-[:HAS_PULSE]->(gp)
      CREATE (gp)-[:INITIATED_BY]->(p)

      // A CONNECTED_TO edge from the OUTSIDER — must never unlock PII.
      CREATE (x)-[:CONNECTED_TO {why: 'we met once'}]->(p)

      // ── Branch 5 via a GOAL-295 nested sub-context ────────────────────────
      // Every context, nested or not, also hangs off its Space by HAS_CONTEXT,
      // so this SHOULD unlock for the space owner.
      CREATE (sub:FieldContext {id: $subCtxId, title: 'Nested Field', createdAt: datetime()})
      CREATE (c)-[:HAS_SUBCONTEXT]->(sub)
      CREATE (me)-[:HAS_CONTEXT]->(sub)
      CREATE (sp:Person:PersonPulse {
        id: $subPersonId, firstName: 'Nils', lastName: 'Nested', name: 'Nils Nested',
        email: 'nils@example.com', description: 'Attached to a sub-field.',
        createdAt: datetime()
      })
      CREATE (sub)-[:HAS_PERSON]->(sp)

      // ── Branch 5 boundary: a soft-deleted context (GOAL-319) ──────────────
      // The Space edge is HAS_DELETED_CONTEXT, so reach is withdrawn.
      CREATE (del:FieldContext {id: $delCtxId, title: 'Deleted Field', deletedAt: datetime(), createdAt: datetime()})
      CREATE (me)-[:HAS_DELETED_CONTEXT]->(del)
      CREATE (dp:Person:PersonPulse {
        id: $delPersonId, firstName: 'Dana', lastName: 'Deleted', name: 'Dana Deleted',
        email: 'dana@example.com', description: 'Attached to a deleted field.',
        createdAt: datetime()
      })
      CREATE (del)-[:HAS_PERSON]->(dp)

      // ── Branch 2: createdBy ───────────────────────────────────────────────
      CREATE (cr:Person:User {id: $creatorId, firstName: 'Cora', lastName: 'Creator', name: 'Cora Creator', createdAt: datetime()})
      CREATE (ct:Person:PersonPulse {
        id: $contactId, firstName: 'Kai', lastName: 'Contact', name: 'Kai Contact',
        email: 'kai@example.com', description: 'An imported contact.',
        createdAt: datetime()
      })
      CREATE (ct)-[:CREATED_BY]->(cr)

      // ── Branches 3 + 4: a WeSpace owner and one member ────────────────────
      CREATE (wo:Person:User {id: $wsOwnerId, firstName: 'Wanda', lastName: 'Owner', name: 'Wanda Owner', email: 'wanda@example.com', description: 'Owns the WeSpace.', createdAt: datetime()})
      CREATE (wm:Person:User {id: $wsMemberId, firstName: 'Milo', lastName: 'Member', name: 'Milo Member', email: 'milo@example.com', description: 'Member of the WeSpace.', createdAt: datetime()})
      CREATE (ws:Space:WeSpace {id: $weSpaceId, name: 'Shared Field', visibility: 'SHARED', createdAt: datetime()})
      CREATE (wo)-[:OWNS]->(ws)
      CREATE (sm:SpaceMembership {id: $membershipId, role: 'MEMBER', addedAt: datetime(), createdAt: datetime()})
      CREATE (ws)-[:HAS_MEMBER]->(sm)
      CREATE (sm)-[:IS_MEMBER]->(wm)
      CREATE (wm2:Person:User {id: $wsMember2Id, firstName: 'Mira', lastName: 'Member', name: 'Mira Member', email: 'mira@example.com', description: 'Second member of the WeSpace.', createdAt: datetime()})
      CREATE (sm2:SpaceMembership {id: $membership2Id, role: 'MEMBER', addedAt: datetime(), createdAt: datetime()})
      CREATE (ws)-[:HAS_MEMBER]->(sm2)
      CREATE (sm2)-[:IS_MEMBER]->(wm2)
      `,
      {
        uploaderId: ids.uploader,
        outsiderId: ids.outsider,
        meSpaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        docId: ids.document,
        personId: ids.person,
        pulseId: ids.pulse,
        subCtxId: ids.subContext,
        subPersonId: ids.subPerson,
        delCtxId: ids.deletedContext,
        delPersonId: ids.deletedPerson,
        creatorId: ids.creator,
        contactId: ids.contact,
        wsOwnerId: ids.wsOwner,
        wsMemberId: ids.wsMember,
        weSpaceId: ids.weSpace,
        membershipId: ids.membership,
        wsMember2Id: ids.wsMember2,
        membership2Id: ids.membership2,
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

/** Minimal gated read — is `privateProfile` populated for this caller? */
const READ_PII = `
  query ReadPii($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      name
      privateProfile {
        id
        email
        description
      }
    }
  }
`

/** The exact selection the drawer + profile page run (GET_PERSON_PROFILE). */
const READ_PERSON_PROFILE = `
  query getPersonProfile($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      firstName
      lastName
      name
      photo
      privateProfile {
        id
        email
        description
        traits
        passions
        fieldsOfCare
        interests
        careManual
        favorites
        connections { id name }
        connectionEdges { connectedPersonId why interests }
      }
      ownsSpaces {
        ... on MeSpace { id name }
        ... on WeSpace { id name }
      }
      memberOf { id role }
    }
  }
`

const READ_PERSON_RELATED_PULSES = `
  query getPersonRelatedPulses($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      initiatedPulses { __typename id title }
      mentionedIn { id title }
    }
  }
`

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

type Row = {
  id: string
  name?: string
  privateProfile: Record<string, unknown> | null
} & Record<string, unknown>

async function readPii(callerId: string, targetId: string): Promise<Row[]> {
  const res = await gql(mintToken(callerId), READ_PII, { personId: targetId })
  expect(res.errors).toBeUndefined()
  return (res.data?.people ?? []) as Row[]
}

describe('GOAL-275 — who may read a Person’s private profile', () => {
  it('branch 1 — the person themselves', async () => {
    if (!ready) return
    const rows = await readPii(ids.wsOwner, ids.wsOwner)
    expect(rows).toHaveLength(1)
    expect(rows[0].privateProfile).toMatchObject({
      email: 'wanda@example.com',
      description: 'Owns the WeSpace.',
    })
  })

  it('branch 2 — the creator of an imported contact (createdBy)', async () => {
    if (!ready) return
    const rows = await readPii(ids.creator, ids.contact)
    expect(rows).toHaveLength(1)
    expect(rows[0].privateProfile).toMatchObject({ email: 'kai@example.com' })
  })

  it('branch 3 — a WeSpace member reads the owner (ownsSpaces)', async () => {
    if (!ready) return
    const rows = await readPii(ids.wsMember, ids.wsOwner)
    expect(rows).toHaveLength(1)
    expect(rows[0].privateProfile).toMatchObject({ email: 'wanda@example.com' })
  })

  it('branch 4 — a WeSpace owner reads a member (memberOf)', async () => {
    if (!ready) return
    const rows = await readPii(ids.wsOwner, ids.wsMember)
    expect(rows).toHaveLength(1)
    expect(rows[0].privateProfile).toMatchObject({ email: 'milo@example.com' })
  })

  it('branch 5 — the uploader reads a context-attached PersonPulse (GOAL-314)', async () => {
    if (!ready) return
    const rows = await readPii(ids.uploader, ids.person)
    expect(rows).toHaveLength(1)
    expect(rows[0].privateProfile).toMatchObject({
      email: 'maya@example.com',
      description: 'A collaborator named in the uploaded roster.',
    })
  })

  it('branch 5 — a GOAL-295 nested sub-context still unlocks (it carries its own HAS_CONTEXT)', async () => {
    if (!ready) return
    const rows = await readPii(ids.uploader, ids.subPerson)
    expect(rows).toHaveLength(1)
    expect(rows[0].privateProfile).toMatchObject({ email: 'nils@example.com' })
  })

  it('branch 4 — two ordinary MEMBERs of the same WeSpace read each other', async () => {
    if (!ready) return
    // The most frequent authorized read in the product, and the one arm the
    // owner/member cases above don't exercise: neither caller owns the Space.
    const forward = await readPii(ids.wsMember2, ids.wsMember)
    expect(forward[0].privateProfile).toMatchObject({
      email: 'milo@example.com',
    })
    const backward = await readPii(ids.wsMember, ids.wsMember2)
    expect(backward[0].privateProfile).toMatchObject({
      email: 'mira@example.com',
    })
  })
})

describe('GOAL-275 — the write and filter sides are untouched', () => {
  // The whole restructure rests on "still settable, still filterable". If
  // `@selectable(onRead: false)` ever regressed into `@filterable(byValue:
  // false)` or blocked `@settable`, login would break for everyone and no
  // read-path test would notice.
  it('people(where: { id_EQ }) resolves — the login bootstrap', async () => {
    if (!ready) return
    const res = await gql(
      mintToken(ids.wsOwner),
      `query ($id: ID!) { people(where: { id_EQ: $id }) { id name } }`,
      { id: ids.wsOwner }
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.people).toEqual([
      { id: ids.wsOwner, name: 'Wanda Owner' },
    ])
  })

  // `email` used to be the one PII scalar left filterable, for a bootstrap
  // lookup that has since moved to `id_EQ`. @neo4j/graphql v6 generates the
  // whole operator family or none, so leaving `email_EQ` in place also left
  // `email_STARTS_WITH` — an account-enumeration oracle for any authenticated
  // caller, and one that `peopleAggregate { count }` could read without
  // returning a single row. These assert the predicates are gone from the
  // BUILT schema, which is the only place that settles it — reasoning from the
  // directive list is exactly how this stayed open for so long.
  it.each([
    'email_EQ',
    'email_IN',
    'email_CONTAINS',
    'email_STARTS_WITH',
    'email_ENDS_WITH',
  ])('PersonWhere no longer offers %s', async (predicate) => {
    if (!ready) return
    const res = await gql(
      mintToken(ids.wsOwner),
      `query { people(where: { ${predicate}: "a" }) { id } }`
    )
    expect(res.errors?.[0]?.message).toMatch(
      new RegExp(`Field "${predicate}" is not defined by type`)
    )
  })

  it('peopleAggregate cannot filter on email either', async () => {
    if (!ready) return
    const res = await gql(
      mintToken(ids.wsOwner),
      `query { peopleAggregate(where: { email_STARTS_WITH: "a" }) { count } }`
    )
    expect(res.errors?.[0]?.message).toMatch(
      /Field "email_STARTS_WITH" is not defined by type/
    )
  })

  it('updatePeople still writes a gated scalar, and it round-trips via privateProfile', async () => {
    if (!ready) return
    const write = await gql(
      mintToken(ids.wsOwner),
      `mutation ($id: ID!, $v: String!) {
         updatePeople(where: { id_EQ: $id }, update: { traits_SET: $v }) {
           people { id privateProfile { id traits } }
         }
       }`,
      { id: ids.wsOwner, v: 'patient, exacting' }
    )
    expect(write.errors).toBeUndefined()
    const updated = (
      write.data?.updatePeople as { people: Row[] } | undefined
    )?.people
    expect(updated?.[0]?.privateProfile).toMatchObject({
      traits: 'patient, exacting',
    })

    // …and it is really persisted, not just echoed back.
    const read = await gql(
      mintToken(ids.wsOwner),
      `query ($id: ID!) { people(where: { id_EQ: $id }) { privateProfile { traits } } }`,
      { id: ids.wsOwner }
    )
    expect(
      (read.data?.people as Row[] | undefined)?.[0]?.privateProfile
    ).toMatchObject({ traits: 'patient, exacting' })
  })
})

describe('GOAL-275 — who may NOT', () => {
  it('an unrelated caller gets the row with privateProfile null', async () => {
    if (!ready) return
    const rows = await readPii(ids.outsider, ids.person)
    // The row still resolves — name/photo are open directory data — but every
    // PII field is withheld behind the null gate.
    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe(ids.person)
    expect(rows[0].name).toBe('Maya Reyes')
    expect(rows[0].privateProfile).toBeNull()
  })

  it('a CONNECTED_TO edge does not unlock PII', async () => {
    if (!ready) return
    // The outsider has (outsider)-[:CONNECTED_TO]->(person) seeded above.
    // CONNECTED_TO records a claim by its author, never the target's consent.
    const rows = await readPii(ids.outsider, ids.person)
    expect(rows[0].privateProfile).toBeNull()
  })

  it('a soft-deleted context (GOAL-319) withdraws PII reach', async () => {
    if (!ready) return
    const rows = await readPii(ids.uploader, ids.deletedPerson)
    expect(rows).toHaveLength(1)
    expect(rows[0].privateProfile).toBeNull()
  })

  it('a WeSpace member cannot read an unrelated person’s PII', async () => {
    if (!ready) return
    const rows = await readPii(ids.wsMember, ids.contact)
    expect(rows[0].privateProfile).toBeNull()
  })

  it('the creator of one contact cannot read another person’s PII', async () => {
    if (!ready) return
    const rows = await readPii(ids.creator, ids.person)
    expect(rows[0].privateProfile).toBeNull()
  })
})

describe('GOAL-275 — the surfaces the app actually queries', () => {
  it('uploader reads the full drawer/profile query (GET_PERSON_PROFILE)', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.uploader), READ_PERSON_PROFILE, {
      personId: ids.person,
    })
    expect(res.errors).toBeUndefined()
    const people = res.data?.people as Row[] | undefined
    expect(people).toHaveLength(1)
    expect(people?.[0]?.privateProfile).toMatchObject({
      email: 'maya@example.com',
      description: 'A collaborator named in the uploaded roster.',
      traits: 'curious, thorough',
    })
  })

  it('an unrelated caller running the SAME query gets identity but no PII', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.outsider), READ_PERSON_PROFILE, {
      personId: ids.person,
    })
    expect(res.errors).toBeUndefined()
    const people = res.data?.people as Row[] | undefined
    expect(people).toHaveLength(1)
    expect(people?.[0]?.name).toBe('Maya Reyes')
    expect(people?.[0]?.privateProfile).toBeNull()
  })

  it('uploader sees the person’s authored pulses via initiatedPulses (GOAL-314)', async () => {
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

describe('GOAL-275 — the gate holds through NESTED selections', () => {
  // `Person.privateProfile` is a @cypher field, so it has to resolve when the
  // Person is reached as a nested relationship target, not just from the
  // `people` root. These are the shapes GetFieldContextPeople and the space
  // detail queries actually send.
  const CONTEXT_PEOPLE = `
    query GetFieldContextPeople($contextId: ID!) {
      fieldContexts(where: { id_EQ: $contextId }) {
        id
        people { id name privateProfile { id email description } }
      }
    }
  `

  const SPACE_OWNER = `
    query GetMeSpaceOwner($spaceId: ID!) {
      meSpaces(where: { id_EQ: $spaceId }) {
        id
        owner { id name privateProfile { id email } }
      }
    }
  `

  it('resolves through FieldContext.people for an authorized caller', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.uploader), CONTEXT_PEOPLE, {
      contextId: ids.fieldContext,
    })
    expect(res.errors).toBeUndefined()
    const contexts = res.data?.fieldContexts as
      | Array<{ people: Row[] }>
      | undefined
    const maya = contexts?.[0]?.people?.find((p) => p.id === ids.person)
    expect(maya?.privateProfile).toMatchObject({ email: 'maya@example.com' })
  })

  it('resolves through Space.owner for the owner themselves', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.uploader), SPACE_OWNER, {
      spaceId: ids.meSpace,
    })
    expect(res.errors).toBeUndefined()
    const spaces = res.data?.meSpaces as Array<{ owner: Row[] }> | undefined
    expect(spaces?.[0]?.owner?.[0]?.privateProfile).toMatchObject({
      id: ids.uploader,
    })
  })

  it('an outsider cannot reach the context at all (FieldContext auth)', async () => {
    if (!ready) return
    const res = await gql(mintToken(ids.outsider), CONTEXT_PEOPLE, {
      contextId: ids.fieldContext,
    })
    expect(res.errors).toBeUndefined()
    // The context itself is filtered out before people are ever projected.
    expect(res.data?.fieldContexts).toEqual([])
  })
})

describe('GOAL-275 — the gate has no parallel read path', () => {
  const invalid = (query: string) =>
    gql(mintToken(ids.outsider), query).then((r) => {
      expect(r.errors).toBeDefined()
      return r.errors?.[0]?.message ?? ''
    })

  it('PII is not selectable directly on Person', async () => {
    if (!ready) return
    await expect(
      invalid(`query { people(where: { id_EQ: "x" }) { email } }`)
    ).resolves.toMatch(/Cannot query field "email" on type "Person"/)
  })

  it('there is no personPrivateProfiles root query', async () => {
    if (!ready) return
    await expect(
      invalid(`query { personPrivateProfiles { email } }`)
    ).resolves.toMatch(/Cannot query field "personPrivateProfiles"/)
  })

  it('PII cannot be exfiltrated through an aggregate', async () => {
    if (!ready) return
    await expect(
      invalid(`query { peopleAggregate { email { longest } } }`)
    ).resolves.toMatch(/Cannot query field "email"/)
  })

  it('PersonPrivateProfile exposes no mutations', async () => {
    if (!ready) return
    await expect(
      invalid(`mutation { deletePersonPrivateProfiles { nodesDeleted } }`)
    ).resolves.toMatch(/Cannot query field "deletePersonPrivateProfiles"/)
  })

  it('PersonPrivateProfile exposes exactly the intended fields', () => {
    if (!ready) return
    // The four relationship fields exist only so the @authorization filter can
    // reference `*_SOME`. `@selectable(onRead: false)` alone does NOT hide
    // them — it leaves `ownsSpacesConnection` / `ownsSpacesAggregate`
    // reachable; `aggregate: false` on the @relationship is what removes both.
    // Pin the resulting surface so a future edit can't quietly widen it.
    const type = schema.getType('PersonPrivateProfile')
    const fields = Object.keys(
      (type as unknown as { getFields: () => Record<string, unknown> }).getFields()
    ).sort()
    expect(fields).toEqual(
      [
        'id',
        'email',
        'phone',
        'pronouns',
        'location',
        'gender',
        'description',
        'careManual',
        'favorites',
        'passions',
        'traits',
        'fieldsOfCare',
        'interests',
        'connections',
        'connectionEdges',
      ].sort()
    )
  })

  it('PII is not FILTERABLE — the where-input is not a read oracle', async () => {
    if (!ready) return
    // An @authorization filter gates projections, NOT `where` predicates. If
    // these scalars are left filterable, `PersonWhere.privateProfile` answers
    // "does careManual start with 'a'?" for every Person in the database, and
    // the whole value falls out character by character — while the read gate
    // still dutifully returns null. peopleAggregate { count } leaks the same
    // signal without returning a row at all.
    const PII = [
      'email',
      'phone',
      'pronouns',
      'location',
      'gender',
      'description',
      'careManual',
      'favorites',
      'passions',
      'traits',
      'fieldsOfCare',
      'interests',
      'connections',
      'connectionEdges',
    ]
    const whereFields = Object.keys(
      (
        schema.getType('PersonPrivateProfileWhere') as unknown as {
          getFields: () => Record<string, unknown>
        }
      ).getFields()
    )
    const leaked = whereFields.filter((f) =>
      PII.some((p) => f === p || f.startsWith(`${p}_`))
    )
    expect(leaked).toEqual([])

    // …and the same probe over the wire, so this fails loudly if the input
    // type is ever regenerated with value filters.
    const res = await gql(
      mintToken(ids.outsider),
      `query { people(where: { privateProfile: { careManual_STARTS_WITH: "A" } }) { id } }`
    )
    expect(res.errors?.[0]?.message ?? '').toMatch(
      /careManual_STARTS_WITH.*not defined by type "PersonPrivateProfileWhere"/
    )
  })

  it('PII is not SORTABLE — ordering is a comparison oracle too', () => {
    if (!ready) return
    const sortFields = Object.keys(
      (
        schema.getType('PersonSort') as unknown as {
          getFields: () => Record<string, unknown>
        }
      ).getFields()
    )
    for (const gated of [
      'email',
      'phone',
      'pronouns',
      'location',
      'gender',
      'description',
      'careManual',
      'favorites',
      'passions',
      'traits',
      'fieldsOfCare',
      'interests',
    ]) {
      expect(sortFields).not.toContain(gated)
    }
  })

  it('the PII scalars are gone from Person’s output type', () => {
    if (!ready) return
    const type = schema.getType('Person')
    const fields = Object.keys(
      (type as unknown as { getFields: () => Record<string, unknown> }).getFields()
    )
    for (const gated of [
      'email',
      'phone',
      'pronouns',
      'location',
      'gender',
      'description',
      'careManual',
      'favorites',
      'passions',
      'traits',
      'fieldsOfCare',
      'interests',
      'connections',
      'connectionEdges',
    ]) {
      expect(fields).not.toContain(gated)
    }
    // …while the open directory identity stays readable by anyone.
    expect(fields).toEqual(
      expect.arrayContaining(['id', 'firstName', 'lastName', 'name', 'photo'])
    )
  })
})
