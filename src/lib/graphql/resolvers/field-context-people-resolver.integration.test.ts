import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import jwt from 'jsonwebtoken'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { createYoga, type YogaServerInstance } from 'graphql-yoga'
import { driver } from '@/lib/neo4j/driver'
import { EXCLUDE_DEPRECATED_FIELDS } from '@/lib/graphql/schema-features'
import { fieldContextPeopleMutations } from './field-context-people-resolver'

/**
 * deletePersonFromFieldContext: when a Person is destroyed, when they are only
 * detached from the caller's fields, and who is refused.
 *
 * Harness mirrors person-pii-read-auth.integration.test.ts: the real schema.gql
 * built in-process, driven through graphql-yoga with a minted HS256 token,
 * against dev Neo4j (.env.local via `npm test`).
 *
 * Each "kept" case gives the contact exactly ONE reason to survive and holds it
 * only in fields the caller can edit, so a case cannot pass on the strength of a
 * different clause in the resolver's mustKeep check. Fixture labels match what
 * dev holds: pulses are :FieldPulse:<type>, contacts :Person:PersonPulse,
 * accounts :Person:User, weaves :PromiseWeave.
 *
 * Everything this suite creates carries `prefix`, and the Logs the resolver
 * writes are found through their CREATED_BY edge to a prefixed caller.
 */

const JWT_SECRET = process.env.JWT_SECRET ?? ''

const prefix = `test_dpf_${randomUUID().slice(0, 8)}_`
const id = (suffix: string) => `${prefix}${suffix}`

let sequence = 0
const nextId = (kind: string) => id(`${kind}_${++sequence}`)

const FIRST_NAME = 'Zephyrine'
const LAST_NAME = 'Quillfeather'
const FULL_NAME = `${FIRST_NAME} ${LAST_NAME}`
const REFUSAL = {
  success: false,
  deleted: false,
  message: 'You can only delete people in fields you can edit.',
}

const users = {
  owner: id('owner'),
  admin: id('admin'),
  member: id('member'),
  guest: id('guest'),
  outsider: id('outsider'),
  otherOwner: id('other_owner'),
}
const spaces = {
  mine: id('space_mine'),
  other: id('space_other'),
  guestOnly: id('space_guest_only'),
}
const fields = {
  mine: id('field_mine'),
  mine2: id('field_mine2'),
  softDeleted: id('field_soft_deleted'),
  other: id('field_other'),
  guestOnly: id('field_guest_only'),
}

/** Fields `users.owner` cannot edit: another Space, and a Space they only guest in. */
const NOT_EDITABLE_BY_OWNER: Array<[string, string]> = [
  ['a field in another Space', fields.other],
  ['a field in a Space the caller only guests in', fields.guestOnly],
]

let ready = false
let yoga: YogaServerInstance<Record<string, never>, Record<string, unknown>>

const mintToken = (personId: string) =>
  jwt.sign({ user: { id: personId } }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '30m',
  })

type DeletionResult = { success: boolean; message: string; deleted: boolean }

async function deletePerson(
  callerId: string | null,
  contextId: string,
  personId: string
): Promise<DeletionResult> {
  const res = await yoga.fetch('http://test.local/api/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(callerId ? { authorization: `Bearer ${mintToken(callerId)}` } : {}),
    },
    body: JSON.stringify({
      query: `mutation ($contextId: ID!, $personId: ID!) {
        deletePersonFromFieldContext(contextId: $contextId, personId: $personId) {
          success
          message
          deleted
        }
      }`,
      variables: { contextId, personId },
    }),
  })
  const body = (await res.json()) as {
    data?: { deletePersonFromFieldContext: DeletionResult } | null
    errors?: Array<{ message: string }>
  }
  expect(body.errors).toBeUndefined()
  return body.data!.deletePersonFromFieldContext
}

async function cypher(query: string, params: Record<string, unknown> = {}) {
  const session = driver.session()
  try {
    return (await session.run(query, params)).records
  } finally {
    await session.close()
  }
}

// ── Fixtures ────────────────────────────────────────────────────────────────

async function seedContact(holders: string[] = [fields.mine], extraLabel = '') {
  const personId = nextId('contact')
  await cypher(
    `
    CREATE (p:Person:PersonPulse${extraLabel} {
      id: $personId, firstName: $first, lastName: $last, name: $full, createdAt: datetime()
    })
    WITH p
    UNWIND $holders AS holderId
    MATCH (h:FieldContext {id: holderId})
    CREATE (h)-[:HAS_PERSON {curated: true}]->(p)
    `,
    { personId, holders, first: FIRST_NAME, last: LAST_NAME, full: FULL_NAME }
  )
  return personId
}

/** `type` only ever comes from literals in this file. */
const link = (fromId: string, type: string, toId: string) =>
  cypher(
    `MATCH (a {id: $fromId}), (b {id: $toId}) CREATE (a)-[:${type}]->(b)`,
    { fromId, toId }
  )

async function seedPulse(fieldId: string) {
  const pulseId = nextId('pulse')
  await cypher(
    `
    MATCH (f:FieldContext {id: $fieldId})
    CREATE (pu:FieldPulse:GoalPulse {
      id: $pulseId, title: 'A fixture goal', status: 'ACTIVE', createdAt: datetime()
    })
    CREATE (f)-[:HAS_PULSE]->(pu)
    `,
    { fieldId, pulseId }
  )
  return pulseId
}

async function seedWeave(fieldId: string) {
  const weaveId = nextId('weave')
  await cypher(
    `
    MATCH (f:FieldContext {id: $fieldId})
    CREATE (w:PromiseWeave {id: $weaveId, promise: 'A fixture promise', createdAt: datetime()})
    CREATE (f)-[:HAS_WEAVE]->(w)
    `,
    { fieldId, weaveId }
  )
  return weaveId
}

type ReferringEdge =
  'INITIATED_BY' | 'CREATED_BY' | 'MENTIONED_IN' | 'WOVEN_FOR'

/** Attach a contact to a pulse or weave the way real data points those edges. */
async function referTo(personId: string, edge: ReferringEdge, fieldId: string) {
  if (edge === 'WOVEN_FOR') {
    const weaveId = await seedWeave(fieldId)
    await link(weaveId, 'WOVEN_FOR', personId)
    return weaveId
  }
  const pulseId = await seedPulse(fieldId)
  if (edge === 'MENTIONED_IN') await link(personId, 'MENTIONED_IN', pulseId)
  else await link(pulseId, edge, personId)
  return pulseId
}

// ── Graph assertions ────────────────────────────────────────────────────────

type Snapshot = { labels: string[]; edges: string[] } | null

/** The node's labels and every edge touching it, in a comparable form. */
async function snapshot(personId: string): Promise<Snapshot> {
  const records = await cypher(
    `
    MATCH (p:Person {id: $personId})
    OPTIONAL MATCH (p)-[r]-(o)
    WITH p, r, o
    RETURN labels(p) AS labels,
      collect(CASE WHEN r IS NULL THEN null
        WHEN startNode(r) = p THEN '->' + type(r) + ':' + o.id
        ELSE '<-' + type(r) + ':' + o.id END) AS edges
    `,
    { personId }
  )
  if (records.length === 0) return null
  return {
    labels: (records[0].get('labels') as string[]).slice().sort(),
    edges: (records[0].get('edges') as string[]).slice().sort(),
  }
}

async function holdersOf(personId: string) {
  const records = await cypher(
    `MATCH (h:FieldContext)-[:HAS_PERSON]->(:Person {id: $personId}) RETURN h.id AS id`,
    { personId }
  )
  return records.map((r) => r.get('id') as string).sort()
}

async function nodeExists(nodeId: string) {
  const records = await cypher(`MATCH (n {id: $nodeId}) RETURN n.id AS id`, {
    nodeId,
  })
  return records.length === 1
}

type LogRow = {
  author: string
  description: string
  metadata: Record<string, unknown>
  raw: string
}

async function logsAbout(personId: string): Promise<LogRow[]> {
  const records = await cypher(
    `
    MATCH (l:Log)-[:CREATED_BY]->(u:Person)
    WHERE u.id STARTS WITH $prefix AND l.metadata CONTAINS $personId
    RETURN u.id AS author, l.description AS description, l.metadata AS metadata,
           properties(l) AS props
    `,
    { prefix, personId }
  )
  return records
    .map((r) => ({
      author: r.get('author') as string,
      description: r.get('description') as string,
      metadata: JSON.parse(r.get('metadata') as string),
      raw: JSON.stringify(r.get('props')),
    }))
    .filter((log) => log.metadata.personId === personId)
}

function expectNameless(log: LogRow) {
  expect(log.raw).not.toContain(FIRST_NAME)
  expect(log.raw).not.toContain(LAST_NAME)
}

/** The Person is gone, the Log is written, and the Log does not name them. */
async function expectDeleted(
  callerId: string,
  contextId: string,
  personId: string,
  survivors: string[] = []
) {
  expect(await nodeExists(personId)).toBe(true)
  const result = await deletePerson(callerId, contextId, personId)

  expect(result).toEqual({
    success: true,
    deleted: true,
    message: `Deleted ${FULL_NAME}.`,
  })
  expect(await snapshot(personId)).toBeNull()
  for (const survivor of survivors) {
    expect(await nodeExists(survivor)).toBe(true)
  }

  const logs = await logsAbout(personId)
  expect(logs).toHaveLength(1)
  expect(logs[0].author).toBe(callerId)
  expect(logs[0].metadata).toMatchObject({
    event: 'person_deleted',
    fieldContextId: contextId,
  })
  expectNameless(logs[0])
}

/**
 * The node survives, exactly the `detachedFrom` HAS_PERSON edges are gone, and
 * every other edge and label is untouched.
 */
async function expectKept(
  callerId: string,
  contextId: string,
  personId: string,
  detachedFrom: string[]
) {
  const before = await snapshot(personId)
  expect(before).not.toBeNull()
  const result = await deletePerson(callerId, contextId, personId)

  expect(result.success).toBe(true)
  expect(result.deleted).toBe(false)

  const removed = detachedFrom.map((f) => `<-HAS_PERSON:${f}`)
  for (const edge of removed) expect(before!.edges).toContain(edge)
  expect(await snapshot(personId)).toEqual({
    labels: before!.labels,
    edges: before!.edges.filter((edge) => !removed.includes(edge)),
  })

  const logs = await logsAbout(personId)
  expect(logs).toHaveLength(1)
  expect(logs[0].author).toBe(callerId)
  expect(logs[0].metadata).toMatchObject({
    event: 'person_removed_from_fields',
    fieldContextId: contextId,
  })
  expectNameless(logs[0])
}

/** Refused with the shared message, nothing moved, nothing logged. */
async function expectRefused(
  callerId: string | null,
  contextId: string,
  personId: string
) {
  const before = await snapshot(personId)
  const result = await deletePerson(callerId, contextId, personId)

  expect(result).toEqual(REFUSAL)
  expect(await snapshot(personId)).toEqual(before)
  expect(await logsAbout(personId)).toEqual([])
}

// ── Setup and teardown ──────────────────────────────────────────────────────

beforeAll(async () => {
  if (!JWT_SECRET) {
    console.warn('JWT_SECRET missing from env — skipping person delete suite')
    return
  }
  try {
    await cypher('RETURN 1')
  } catch {
    console.warn('Neo4j unavailable — skipping person delete suite')
    return
  }

  const neoSchema = new Neo4jGraphQL({
    typeDefs: readFileSync(
      path.join(process.cwd(), 'src/lib/graphql/schema/schema.gql'),
      'utf8'
    ),
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
      Mutation: fieldContextPeopleMutations,
    } as never,
    driver,
    features: {
      authorization: { key: JWT_SECRET },
      excludeDeprecatedFields: EXCLUDE_DEPRECATED_FIELDS,
    },
  })

  yoga = createYoga({
    schema: await neoSchema.getSchema(),
    graphqlEndpoint: '/api/graphql',
    context: async (req) => {
      const authHeader = req.request.headers.get('authorization')
      let decoded = null
      if (authHeader?.startsWith('Bearer ')) {
        try {
          decoded = jwt.verify(authHeader.substring(7), JWT_SECRET, {
            algorithms: ['HS256'],
          })
        } catch {
          decoded = null
        }
      }
      return { jwt: decoded }
    },
  }) as typeof yoga

  await cypher(
    `
    UNWIND $userRows AS row
    CREATE (:Person:User {
      id: row.id, firstName: row.first, lastName: 'Fixture',
      name: row.first + ' Fixture', createdAt: datetime()
    })
    `,
    {
      userRows: Object.entries(users).map(([first, userId]) => ({
        id: userId,
        first,
      })),
    }
  )
  await cypher(
    `
    MATCH (owner:Person {id: $owner}), (admin:Person {id: $admin}),
          (member:Person {id: $member}), (guest:Person {id: $guest}),
          (otherOwner:Person {id: $otherOwner})

    // The caller's Space: owner, plus one membership per role.
    CREATE (mine:Space:WeSpace {id: $spaceMine, name: 'Mine', visibility: 'SHARED', createdAt: datetime()})
    CREATE (owner)-[:OWNS]->(mine)
    CREATE (mine)-[:HAS_MEMBER]->(:SpaceMembership {id: $smAdmin, role: 'ADMIN', createdAt: datetime()})-[:IS_MEMBER]->(admin)
    CREATE (mine)-[:HAS_MEMBER]->(:SpaceMembership {id: $smMember, role: 'MEMBER', createdAt: datetime()})-[:IS_MEMBER]->(member)
    CREATE (mine)-[:HAS_MEMBER]->(:SpaceMembership {id: $smGuest, role: 'GUEST', createdAt: datetime()})-[:IS_MEMBER]->(guest)
    CREATE (mine)-[:HAS_CONTEXT]->(:FieldContext {id: $fieldMine, title: 'My Field', createdAt: datetime()})
    CREATE (mine)-[:HAS_CONTEXT]->(:FieldContext {id: $fieldMine2, title: 'My Second Field', createdAt: datetime()})
    CREATE (mine)-[:HAS_DELETED_CONTEXT]->(:FieldContext {id: $fieldSoftDeleted, title: 'Trashed Field', deletedAt: datetime(), createdAt: datetime()})

    // A Space the caller has no tie to.
    CREATE (other:Space:WeSpace {id: $spaceOther, name: 'Other', visibility: 'SHARED', createdAt: datetime()})
    CREATE (otherOwner)-[:OWNS]->(other)
    CREATE (other)-[:HAS_CONTEXT]->(:FieldContext {id: $fieldOther, title: 'Other Field', createdAt: datetime()})

    // A Space the caller is only a GUEST of.
    CREATE (guestOnly:Space:WeSpace {id: $spaceGuestOnly, name: 'Guest Only', visibility: 'SHARED', createdAt: datetime()})
    CREATE (otherOwner)-[:OWNS]->(guestOnly)
    CREATE (guestOnly)-[:HAS_MEMBER]->(:SpaceMembership {id: $smOwnerAsGuest, role: 'GUEST', createdAt: datetime()})-[:IS_MEMBER]->(owner)
    CREATE (guestOnly)-[:HAS_CONTEXT]->(:FieldContext {id: $fieldGuestOnly, title: 'Guest Only Field', createdAt: datetime()})
    `,
    {
      owner: users.owner,
      admin: users.admin,
      member: users.member,
      guest: users.guest,
      otherOwner: users.otherOwner,
      spaceMine: spaces.mine,
      spaceOther: spaces.other,
      spaceGuestOnly: spaces.guestOnly,
      smAdmin: id('sm_admin'),
      smMember: id('sm_member'),
      smGuest: id('sm_guest'),
      smOwnerAsGuest: id('sm_owner_as_guest'),
      fieldMine: fields.mine,
      fieldMine2: fields.mine2,
      fieldSoftDeleted: fields.softDeleted,
      fieldOther: fields.other,
      fieldGuestOnly: fields.guestOnly,
    }
  )
  ready = true
}, 120_000)

afterAll(async () => {
  try {
    // Logs first: they are found through their edge to a prefixed caller.
    await cypher(
      `
      MATCH (l:Log)-[:CREATED_BY]->(u:Person)
      WHERE u.id STARTS WITH $prefix
      DETACH DELETE l
      `,
      { prefix }
    )
    await cypher(`MATCH (n) WHERE n.id STARTS WITH $prefix DETACH DELETE n`, {
      prefix,
    })
    const left = await cypher(
      `MATCH (n) WHERE n.id STARTS WITH $prefix RETURN count(n) AS c`,
      { prefix }
    )
    expect(Number(left[0].get('c'))).toBe(0)
  } finally {
    await driver.close()
  }
}, 120_000)

// ── Cases ───────────────────────────────────────────────────────────────────

describe('deletePersonFromFieldContext', () => {
  describe('when a contact is held only by fields the caller edits', () => {
    it.each([
      ['the Space owner', users.owner],
      ['an ADMIN', users.admin],
      ['a MEMBER', users.member],
    ])(
      '%s deletes the node and writes a nameless Log',
      async (_who, caller) => {
        if (!ready) return
        const personId = await seedContact()
        await expectDeleted(caller, fields.mine, personId)

        const [log] = await logsAbout(personId)
        expect(log.description).toBe('Deleted a contact from My Field')
      }
    )

    it('deletes a contact held by two of the caller’s fields', async () => {
      if (!ready) return
      const personId = await seedContact([fields.mine, fields.mine2])
      await expectDeleted(users.owner, fields.mine, personId)
    })
  })

  describe('when the caller may not delete from this field', () => {
    it('refuses a GUEST and changes nothing', async () => {
      if (!ready) return
      const personId = await seedContact()
      await expectRefused(users.guest, fields.mine, personId)
      expect(await holdersOf(personId)).toEqual([fields.mine])
    })

    it('refuses an outsider with the shared message', async () => {
      if (!ready) return
      const personId = await seedContact()
      await expectRefused(users.outsider, fields.mine, personId)
      expect(await holdersOf(personId)).toEqual([fields.mine])
    })

    it('refuses a signed-out caller with the shared message', async () => {
      if (!ready) return
      const personId = await seedContact()
      await expectRefused(null, fields.mine, personId)
      expect(await holdersOf(personId)).toEqual([fields.mine])
    })

    it('refuses a field that does not exist with the shared message', async () => {
      if (!ready) return
      const personId = await seedContact()
      await expectRefused(users.owner, id('no_such_field'), personId)
      expect(await holdersOf(personId)).toEqual([fields.mine])
    })

    it('refuses another Space’s field that holds the contact', async () => {
      if (!ready) return
      const held = [fields.mine, fields.other].sort()
      const personId = await seedContact(held)
      await expectRefused(users.owner, fields.other, personId)
      expect(await holdersOf(personId)).toEqual(held)
    })

    it('refuses another Space’s field that does not hold the contact', async () => {
      if (!ready) return
      const personId = await seedContact()
      await expectRefused(users.owner, fields.other, personId)
      expect(await holdersOf(personId)).toEqual([fields.mine])
    })

    it('refuses a field the caller edits when the person is not in it', async () => {
      if (!ready) return
      const personId = await seedContact([fields.mine])
      await expectRefused(users.owner, fields.mine2, personId)
      expect(await holdersOf(personId)).toEqual([fields.mine])
    })

    it('refuses a person who does not exist', async () => {
      if (!ready) return
      const missing = id('no_such_person')
      await expectRefused(users.owner, fields.mine, missing)
      expect(await snapshot(missing)).toBeNull()
    })

    it('refuses the soft-deleted field itself as the starting point', async () => {
      if (!ready) return
      const personId = await seedContact([fields.softDeleted])
      await expectRefused(users.owner, fields.softDeleted, personId)
      expect(await holdersOf(personId)).toEqual([fields.softDeleted])
    })
  })

  describe('when the target has an account or a Space role', () => {
    it('keeps a :User target and detaches them from every editable field', async () => {
      if (!ready) return
      const personId = await seedContact([fields.mine, fields.mine2], ':User')
      await expectKept(users.owner, fields.mine, personId, [
        fields.mine,
        fields.mine2,
      ])
      expect(await holdersOf(personId)).toEqual([])
    })

    it('leaves a :User target’s edge to a field the caller cannot edit', async () => {
      if (!ready) return
      const personId = await seedContact([fields.mine, fields.other], ':User')
      await expectKept(users.owner, fields.mine, personId, [fields.mine])
      expect(await holdersOf(personId)).toEqual([fields.other])
    })

    it('keeps a contact that OWNS a Space', async () => {
      if (!ready) return
      const personId = await seedContact([fields.mine, fields.mine2])
      const ownedSpace = nextId('owned_space')
      await cypher(
        `CREATE (:Space:WeSpace {id: $ownedSpace, name: 'Owned', visibility: 'SHARED', createdAt: datetime()})`,
        { ownedSpace }
      )
      await link(personId, 'OWNS', ownedSpace)

      await expectKept(users.owner, fields.mine, personId, [
        fields.mine,
        fields.mine2,
      ])
      expect((await snapshot(personId))!.edges).toEqual([
        `->OWNS:${ownedSpace}`,
      ])
    })

    it('keeps a contact with a SpaceMembership', async () => {
      if (!ready) return
      const personId = await seedContact([fields.mine, fields.mine2])
      const membership = nextId('membership')
      await cypher(
        `
        MATCH (s:Space {id: $spaceId})
        CREATE (s)-[:HAS_MEMBER]->(:SpaceMembership {id: $membership, role: 'GUEST', createdAt: datetime()})
        `,
        { spaceId: spaces.other, membership }
      )
      await link(membership, 'IS_MEMBER', personId)

      await expectKept(users.owner, fields.mine, personId, [
        fields.mine,
        fields.mine2,
      ])
      expect((await snapshot(personId))!.edges).toEqual([
        `<-IS_MEMBER:${membership}`,
      ])
    })
  })

  describe('when a field the caller cannot edit also holds the contact', () => {
    it.each(NOT_EDITABLE_BY_OWNER)(
      'keeps the node and that edge for %s, and removes the caller’s edge',
      async (_where, lockedField) => {
        if (!ready) return
        const personId = await seedContact([fields.mine, lockedField])
        await expectKept(users.owner, fields.mine, personId, [fields.mine])
        expect(await holdersOf(personId)).toEqual([lockedField])
      }
    )
  })

  describe('when another :User created or is connected to the contact', () => {
    // Being in the holding Space does not excuse it (kb/02-user-roles.md):
    // addSpaceMember has no acceptance step, so membership can be manufactured.
    it.each<[string, string, string, string, 'in' | 'out']>([
      ['an outsider', 'CREATED_BY', users.owner, users.outsider, 'out'],
      ['an outsider', 'CONNECTED_TO', users.owner, users.outsider, 'in'],
      ['an outsider', 'CONNECTED_TO', users.owner, users.outsider, 'out'],
      [
        'a MEMBER of the holding Space',
        'CREATED_BY',
        users.owner,
        users.member,
        'out',
      ],
      [
        'a MEMBER of the holding Space',
        'CONNECTED_TO',
        users.owner,
        users.member,
        'in',
      ],
      [
        'a GUEST of the holding Space',
        'CREATED_BY',
        users.owner,
        users.guest,
        'out',
      ],
      [
        'the owner of the holding Space',
        'CREATED_BY',
        users.member,
        users.owner,
        'out',
      ],
      [
        'the owner of the holding Space',
        'CONNECTED_TO',
        users.member,
        users.owner,
        'in',
      ],
    ])(
      'keeps the contact: %s holds a %s edge',
      async (_who, type, caller, related, direction) => {
        if (!ready) return
        const personId = await seedContact()
        if (direction === 'out') await link(personId, type, related)
        else await link(related, type, personId)

        await expectKept(caller, fields.mine, personId, [fields.mine])
        expect(await holdersOf(personId)).toEqual([])
      }
    )

    it.each<[string, 'in' | 'out']>([
      ['CREATED_BY', 'out'],
      ['CONNECTED_TO', 'in'],
    ])(
      'deletes the contact when only the caller holds a %s edge',
      async (type, direction) => {
        if (!ready) return
        const personId = await seedContact()
        if (direction === 'out') await link(personId, type, users.owner)
        else await link(users.owner, type, personId)

        await expectDeleted(users.owner, fields.mine, personId, [users.owner])
      }
    )
  })

  describe('when a pulse or weave refers to the contact', () => {
    const EDGES: ReferringEdge[] = [
      'INITIATED_BY',
      'CREATED_BY',
      'MENTIONED_IN',
      'WOVEN_FOR',
    ]
    const lockedCases = EDGES.flatMap((edge) =>
      NOT_EDITABLE_BY_OWNER.map(
        ([where, field]) => [edge, where, field] as const
      )
    )

    it.each(lockedCases)(
      'keeps the contact: %s in %s',
      async (edge, _where, lockedField) => {
        if (!ready) return
        const personId = await seedContact()
        const referrer = await referTo(personId, edge, lockedField)

        await expectKept(users.owner, fields.mine, personId, [fields.mine])
        expect(await holdersOf(personId)).toEqual([])
        expect(await nodeExists(referrer)).toBe(true)
      }
    )

    it.each(EDGES)(
      'deletes the contact when %s is in the caller’s own field, and the referrer survives',
      async (edge) => {
        if (!ready) return
        const personId = await seedContact()
        const referrer = await referTo(personId, edge, fields.mine)

        await expectDeleted(users.owner, fields.mine, personId, [referrer])

        const attached = await cypher(
          `
          MATCH (:FieldContext {id: $fieldId})-[:HAS_PULSE|HAS_WEAVE]->(n {id: $referrer})
          RETURN n.id AS id
          `,
          { fieldId: fields.mine, referrer }
        )
        expect(attached).toHaveLength(1)
      }
    )
  })

  describe('when any other edge ties the contact to a field', () => {
    async function seedOrganization(fieldId: string) {
      const organizationId = nextId('org')
      await cypher(
        `
        MATCH (f:FieldContext {id: $fieldId})
        CREATE (o:Organization {id: $organizationId, name: 'A fixture org', createdAt: datetime()})
        CREATE (f)-[:HAS_ORGANIZATION]->(o)
        `,
        { fieldId, organizationId }
      )
      return organizationId
    }

    async function seedDocument(fieldId: string) {
      const documentId = nextId('doc')
      await cypher(
        `
        MATCH (f:FieldContext {id: $fieldId})
        CREATE (d:Document {id: $documentId, filename: 'fixture.txt', createdAt: datetime()})
        CREATE (f)-[:HAS_DOCUMENT]->(d)
        `,
        { fieldId, documentId }
      )
      return documentId
    }

    const LINKS: Array<
      [string, (personId: string, fieldId: string) => Promise<string>]
    > = [
      [
        'AFFILIATED_WITH an organization',
        async (personId, fieldId) => {
          const org = await seedOrganization(fieldId)
          await link(personId, 'AFFILIATED_WITH', org)
          return org
        },
      ],
      [
        'EXTRACTED_FROM a document',
        async (personId, fieldId) => {
          const doc = await seedDocument(fieldId)
          await link(personId, 'EXTRACTED_FROM', doc)
          return doc
        },
      ],
      [
        'an edge type the resolver does not name, on a pulse',
        async (personId, fieldId) => {
          const pulse = await seedPulse(fieldId)
          await link(personId, 'SOME_FUTURE_EDGE', pulse)
          return pulse
        },
      ],
    ]

    it.each(LINKS)(
      'keeps the contact: %s in a locked field',
      async (_name, seed) => {
        if (!ready) return
        const personId = await seedContact()
        const linked = await seed(personId, fields.other)

        await expectKept(users.owner, fields.mine, personId, [fields.mine])
        expect(await nodeExists(linked)).toBe(true)
      }
    )

    it.each(LINKS)(
      'deletes the contact: %s in the caller’s own field',
      async (_name, seed) => {
        if (!ready) return
        const personId = await seedContact()
        const linked = await seed(personId, fields.mine)

        await expectDeleted(users.owner, fields.mine, personId, [linked])
      }
    )

    it('keeps a contact CONNECTED_TO a non-user Person held by a locked field', async () => {
      if (!ready) return
      const personId = await seedContact()
      const neighbour = await seedContact([fields.other])
      await link(personId, 'CONNECTED_TO', neighbour)

      await expectKept(users.owner, fields.mine, personId, [fields.mine])
      expect(await holdersOf(neighbour)).toEqual([fields.other])
    })

    it('deletes a contact CONNECTED_TO a non-user Person held only by the caller’s field', async () => {
      if (!ready) return
      const personId = await seedContact()
      const neighbour = await seedContact([fields.mine])
      await link(personId, 'CONNECTED_TO', neighbour)

      await expectDeleted(users.owner, fields.mine, personId, [neighbour])
    })
  })

  describe('when a soft-deleted field also holds the contact', () => {
    it('keeps the node for the deleted-field purge, and detaches the live edge', async () => {
      if (!ready) return
      const personId = await seedContact([fields.mine, fields.softDeleted])
      await expectKept(users.owner, fields.mine, personId, [fields.mine])
      expect(await holdersOf(personId)).toEqual([fields.softDeleted])
    })
  })
})
