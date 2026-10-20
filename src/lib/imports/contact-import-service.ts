import { randomUUID } from 'node:crypto'
import type { Driver, ManagedTransaction } from 'neo4j-driver'
import type { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { normalizeEmail } from '@/lib/auth/normalize-email'
import {
  contactDisplayName,
  summarizeContactOutcomes,
  type ContactImportOutcome,
  type ContactImportResult,
  type ContactLinkTarget,
  type ContactRecord,
} from './contact-import'

/**
 * GOAL-382 — write an import's contacts into one FieldContext.
 *
 * People become `:Person:PersonPulse` (HAS_PERSON, curated onto the roster),
 * organizations become `:Organization` (HAS_ORGANIZATION). A person's company
 * is matched or created as an Organization in the same field and linked with
 * `AFFILIATED_WITH` (carrying their role). New contacts are `CREATED_BY` the
 * importing member, and every write leaves one activity Log.
 *
 * Duplicates are matched — and updated, never added twice:
 *  - people by EMAIL first: within this field, or among contacts the member
 *    created (an exact email is a strong enough identity to bring the
 *    member's own contact into this field);
 *  - then by NAME + ORGANIZATION, within this field only (a same-named
 *    contact with no organization yet also matches — the import gives it
 *    one — unless the two carry different emails);
 *  - organizations by name, within this field only.
 * On a match a value present in the file replaces the stored one; a blank
 * keeps it. The one exception is email: an import never changes an existing
 * contact's email, and fills an empty one only on a contact the member
 * created. Signup adopts whichever Person holds an address, so writing an
 * email onto someone else's contact would let its author take it over.
 *
 * Email is globally unique on `Person`, so an email that belongs to someone
 * out of reach can be neither created again nor overwritten:
 *  - a registered member (or pending invitee) is attached to the field with
 *    no profile change, when the article import's consent gate passes — they
 *    are the caller, or already belong to every Space that can see this field;
 *  - otherwise the row is skipped with one message for every case, so the
 *    result does not reveal whether the address is a member or someone else's
 *    private contact. (That the address exists somewhere is unavoidable while
 *    the constraint is global; the `bulk-import` rate limit bounds probing.)
 *
 * Being CONNECTED_TO the member is deliberately NOT reach: it is neither a
 * read nor a write grant anywhere else (kb/02), and treating it as one would
 * let a member edit and re-expose another Space's private contact.
 *
 * Each contact is written in its own transaction: a contact whose
 * organization or extra link fails is rolled back whole, so a row reported
 * as not saved really left nothing behind and a retry cannot duplicate it.
 *
 * The caller (the route) must already have checked `loadEditableContext`.
 */

/** The one method this module needs — met by a Neo4jGraph and by `txRunner`. */
export interface CypherRunner {
  query<T = Record<string, unknown>>(
    query: string,
    params?: Record<string, unknown>
  ): Promise<T[]>
}

/**
 * Plain objects from a transaction's records. Only ids, strings and booleans
 * are returned here, so no Neo4j Integer conversion is needed.
 */
function txRunner(tx: ManagedTransaction): CypherRunner {
  return {
    async query<T>(query: string, params?: Record<string, unknown>) {
      const result = await tx.run(query, params)
      return result.records.map((record) => record.toObject() as T)
    },
  }
}

const LOG_SOURCE = 'contact-import'
const OUT_OF_REACH_MESSAGE =
  'This email belongs to someone who can’t be added to this field.'
const SAVE_FAILED_MESSAGE = 'This contact could not be saved.'
const BROUGHT_IN_MESSAGE =
  'Your contact from another field — now shared in this one too.'
const EMAIL_NOT_SAVED_MESSAGE =
  'Updated — the email was not added, because only the person who added this contact can set it.'

/** Lowercased "first last" — the same key `createPersonAuthorized` matches on. */
const PERSON_NAME_KEY = `toLower(trim(coalesce(p.name, trim(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, '')))))`

/**
 * A person an import may never write to: a registered member, or a pending
 * invite placeholder (which signup adopts, membership and all).
 */
function protectedPerson(v: string): string {
  return `(${v}:User OR ${v}.inviteTokenHash IS NOT NULL OR EXISTS { (:SpaceMembership)-[:IS_MEMBER]->(${v}) })`
}

/** Appended to a write: one Log, attributed to the importing member. */
const WRITE_LOG = `
  CREATE (log:Log {
    id: $logId,
    description: $description,
    metadata: $metadata,
    createdAt: datetime()
  })
  CREATE (log)-[:CREATED_BY]->(me)
`

/** Same Log, written only when `isNew` — re-imports do not repeat it. */
const WRITE_LOG_IF_NEW = `
  FOREACH (_ IN CASE WHEN isNew THEN [1] ELSE [] END |
    CREATE (log:Log {
      id: $logId,
      description: $description,
      metadata: $metadata,
      createdAt: datetime()
    })
    CREATE (log)-[:CREATED_BY]->(me)
  )
`

interface ImportScope {
  graph: CypherRunner
  userId: string
  contextId: string
  contextTitle: string
  link: ContactLinkTarget | null
  linkLabel: string
  /** Organization ids resolved earlier in this batch, by lowercased name. */
  organizationCache: Map<string, string>
}

function logParams(scope: ImportScope, description: string) {
  return {
    logId: `log_${Date.now()}_${randomUUID().slice(0, 8)}`,
    description,
    metadata: JSON.stringify({
      source: LOG_SOURCE,
      fieldContextId: scope.contextId,
    }),
  }
}

function where(scope: ImportScope): string {
  return scope.contextTitle || 'this field'
}

function nameKey(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

/**
 * Run a write that must land. A write that matches nothing (the field was
 * deleted mid-import, the person became a member) throws, so the row is
 * reported as not saved instead of silently claiming success.
 */
async function writeOne<T extends Record<string, unknown>>(
  scope: ImportScope,
  query: string,
  params: Record<string, unknown>
): Promise<T> {
  const rows = await scope.graph.query<T>(query, params)
  if (!rows || rows.length === 0) throw new Error('write matched nothing')
  return rows[0]
}

/** Only the fields the file actually carries — a blank never overwrites. */
function pickProps(
  record: ContactRecord,
  fields: (keyof ContactRecord)[]
): Record<string, string> {
  const props: Record<string, string> = {}
  for (const field of fields) {
    const value = record[field]
    if (typeof value === 'string' && value) props[field] = value
  }
  if (props.email) props.email = normalizeEmail(props.email)
  return props
}

const PERSON_FIELDS: (keyof ContactRecord)[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'location',
  'description',
]
const ORGANIZATION_FIELDS: (keyof ContactRecord)[] = [
  'name',
  'email',
  'phone',
  'location',
  'description',
  'website',
]

// ── Organizations ──────────────────────────────────────────────────────────

async function findOrganization(
  scope: ImportScope,
  name: string
): Promise<string | null> {
  const rows = await scope.graph.query<{ id: string }>(
    `
    MATCH (:FieldContext {id: $contextId})-[:HAS_ORGANIZATION]->(o:Organization)
    WHERE toLower(trim(coalesce(o.name, ''))) = $nameKey
    RETURN o.id AS id
    ORDER BY o.createdAt
    LIMIT 1
    `,
    { contextId: scope.contextId, nameKey: nameKey(name) }
  )
  return rows?.[0]?.id ?? null
}

/**
 * Create or update an organization in this field. `props` is empty for a
 * company named on a person row — that only ensures the org exists here.
 */
async function upsertOrganization(
  scope: ImportScope,
  name: string,
  props: Record<string, string>
): Promise<{ id: string; created: boolean }> {
  const key = nameKey(name)
  const hasValues = Object.keys(props).length > 0
  // Resolved earlier in this batch — a company named on fifty person rows is
  // one organization, not fifty lookups.
  const existingId =
    scope.organizationCache.get(key) ?? (await findOrganization(scope, name))

  if (existingId && !hasValues) {
    scope.organizationCache.set(key, existingId)
    return { id: existingId, created: false }
  }

  if (existingId) {
    await writeOne(
      scope,
      `
      MATCH (me:Person {id: $userId})
      MATCH (o:Organization {id: $organizationId})
      SET o += $props, o.updatedAt = datetime()
      ${WRITE_LOG}
      RETURN o.id AS id
      `,
      {
        userId: scope.userId,
        organizationId: existingId,
        props,
        ...logParams(scope, `Updated organization ${name} from a contact import into ${where(scope)}`),
      }
    )
    scope.organizationCache.set(key, existingId)
    return { id: existingId, created: false }
  }

  const organizationId = `organization_${randomUUID()}`
  await writeOne(
    scope,
    `
    MATCH (c:FieldContext {id: $contextId})
    MATCH (me:Person {id: $userId})
    CREATE (o:Organization:LifeSensor:RelationalEntity {
      id: $organizationId,
      name: $name,
      createdAt: datetime()
    })
    SET o += $props
    CREATE (o)-[:CREATED_BY]->(me)
    CREATE (c)-[:HAS_ORGANIZATION]->(o)
    ${WRITE_LOG}
    RETURN o.id AS id
    `,
    {
      contextId: scope.contextId,
      userId: scope.userId,
      organizationId,
      name,
      props,
      ...logParams(scope, `Imported organization ${name} into ${where(scope)}`),
    }
  )
  scope.organizationCache.set(key, organizationId)
  return { id: organizationId, created: true }
}

// ── People ─────────────────────────────────────────────────────────────────

interface EmailMatch {
  id: string
  isProtected: boolean
  isSelf: boolean
  inField: boolean
  inReach: boolean
}

async function findPersonByEmail(
  scope: ImportScope,
  email: string
): Promise<EmailMatch | null> {
  const rows = await scope.graph.query<EmailMatch>(
    `
    MATCH (p:Person {email: $email})
    WITH p LIMIT 1
    WITH p, p.id AS id,
      ${protectedPerson('p')} AS isProtected,
      p.id = $userId AS isSelf,
      EXISTS { (:FieldContext {id: $contextId})-[:HAS_PERSON]->(p) } AS inField
    RETURN id, isProtected, isSelf, inField,
      inField OR EXISTS { (p)-[:CREATED_BY]->(:Person {id: $userId}) } AS inReach
    `,
    { email, userId: scope.userId, contextId: scope.contextId }
  )
  return rows?.[0] ?? null
}

async function findPersonByNameAndOrganization(
  scope: ImportScope,
  record: ContactRecord,
  email: string | null
): Promise<string | null> {
  // A same-named contact with NO organization on file also matches — most
  // existing contacts (hand-added, extracted from documents) have none yet,
  // and the import is what gives them one. An exact organization match wins.
  // Two different emails mean two different people, whatever the name.
  const rows = await scope.graph.query<{ id: string }>(
    `
    MATCH (:FieldContext {id: $contextId})-[:HAS_PERSON]->(p:Person)
    WHERE NOT ${protectedPerson('p')}
      AND ${PERSON_NAME_KEY} = $nameKey
      AND ($email IS NULL OR p.email IS NULL)
    WITH p, [(p)-[:AFFILIATED_WITH]->(o:Organization) | toLower(trim(o.name))] AS organizations
    WHERE size(organizations) = 0 OR ($organizationKey <> '' AND $organizationKey IN organizations)
    RETURN p.id AS id
    ORDER BY $organizationKey IN organizations DESC, p.createdAt
    LIMIT 1
    `,
    {
      contextId: scope.contextId,
      nameKey: nameKey(contactDisplayName(record)),
      organizationKey: nameKey(record.organization ?? ''),
      email,
    }
  )
  return rows?.[0]?.id ?? null
}

/**
 * Attach a registered member (or pending invitee) to the field without
 * touching their profile. Same target gate as the article import's author
 * match: attaching exposes their gated PII to every Space that can see this
 * field, so they must be the caller or already belong to all of those Spaces.
 * Returns false when refused.
 */
async function attachMember(
  scope: ImportScope,
  personId: string,
  displayName: string
): Promise<boolean> {
  const rows = await scope.graph.query<{ id: string }>(
    `
    MATCH (c:FieldContext {id: $contextId})
    // ALL() over an empty list is TRUE — anchoring on a live parent Space
    // first keeps the gate below closed for a soft-deleted context.
    MATCH (:Space)-[:HAS_CONTEXT]->(c)
    WITH DISTINCT c
    MATCH (me:Person {id: $userId})
    MATCH (p:Person {id: $personId})
    WHERE p.id = $userId
       OR ALL(space IN [(s:Space)-[:HAS_CONTEXT]->(c) | s] WHERE
            (p)-[:OWNS]->(space)
            OR EXISTS { MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(p) })
    OPTIONAL MATCH (c)-[existing:HAS_PERSON]->(p)
    WITH c, me, p, existing IS NULL AS isNew
    MERGE (c)-[hp:HAS_PERSON]->(p)
    SET hp.curated = true
    ${WRITE_LOG_IF_NEW}
    RETURN p.id AS id
    `,
    {
      contextId: scope.contextId,
      userId: scope.userId,
      personId,
      ...logParams(scope, `Added ${displayName} to ${where(scope)} from a contact import`),
    }
  )
  return Boolean(rows?.[0]?.id)
}

async function createPerson(
  scope: ImportScope,
  record: ContactRecord,
  props: Record<string, string>
): Promise<string> {
  const personId = `person_${randomUUID()}`
  const displayName = contactDisplayName(record)
  await writeOne(
    scope,
    `
    MATCH (c:FieldContext {id: $contextId})
    MATCH (me:Person {id: $userId})
    // lastName is String! in the SDL — a one-word contact gets '' (as
    // createPersonAuthorized does), or every read of the roster fails.
    CREATE (p:Person:PersonPulse {
      id: $personId,
      name: $name,
      lastName: '',
      createdAt: datetime()
    })
    SET p += $props
    CREATE (p)-[:CREATED_BY]->(me)
    // Curated: the member chose to put these people in this field (GOAL-346).
    CREATE (c)-[:HAS_PERSON {curated: true}]->(p)
    ${WRITE_LOG}
    RETURN p.id AS id
    `,
    {
      contextId: scope.contextId,
      userId: scope.userId,
      personId,
      name: displayName,
      props,
      ...logParams(scope, `Imported ${displayName} into ${where(scope)}`),
    }
  )
  return personId
}

/** Returns whether a file email could not be saved (see the module note). */
async function updatePerson(
  scope: ImportScope,
  personId: string,
  record: ContactRecord,
  props: Record<string, string>
): Promise<{ emailDropped: boolean }> {
  const { email = null, ...rest } = props
  const row = await writeOne<{ emailDropped: boolean }>(
    scope,
    `
    MATCH (c:FieldContext {id: $contextId})
    MATCH (me:Person {id: $userId})
    MATCH (p:Person {id: $personId})
    WHERE NOT ${protectedPerson('p')}
    WITH c, me, p,
      $email IS NOT NULL AND p.email IS NULL
        AND EXISTS { (p)-[:CREATED_BY]->(me) } AS setEmail
    SET p += $props, p.updatedAt = datetime()
    SET p.name = trim(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, ''))
    FOREACH (_ IN CASE WHEN setEmail THEN [1] ELSE [] END | SET p.email = $email)
    // Stale once the profile changes — same as updatePersonPulse; the
    // enrichment job re-embeds it.
    SET p.embedding = null
    MERGE (c)-[hp:HAS_PERSON]->(p)
    SET hp.curated = true
    ${WRITE_LOG}
    RETURN $email IS NOT NULL AND coalesce(p.email, '') <> $email AS emailDropped
    `,
    {
      contextId: scope.contextId,
      userId: scope.userId,
      personId,
      props: rest,
      email,
      ...logParams(scope, `Updated ${contactDisplayName(record)} from a contact import into ${where(scope)}`),
    }
  )
  return { emailDropped: Boolean(row.emailDropped) }
}

async function affiliate(
  scope: ImportScope,
  personId: string,
  organizationId: string,
  organizationName: string,
  record: ContactRecord
): Promise<void> {
  await writeOne(
    scope,
    `
    MATCH (c:FieldContext {id: $contextId})
    MATCH (me:Person {id: $userId})
    MATCH (p:Person {id: $personId})
    MATCH (o:Organization {id: $organizationId})
    // The company is attached to this field alongside the person.
    MERGE (c)-[:HAS_ORGANIZATION]->(o)
    WITH me, p, o, NOT EXISTS { (p)-[:AFFILIATED_WITH]->(o) } AS isNew
    MERGE (p)-[a:AFFILIATED_WITH]->(o)
    SET a.role = coalesce($role, a.role)
    ${WRITE_LOG_IF_NEW}
    RETURN p.id AS id
    `,
    {
      contextId: scope.contextId,
      userId: scope.userId,
      personId,
      organizationId,
      role: record.jobTitle ?? null,
      ...logParams(
        scope,
        `Linked ${contactDisplayName(record)} to ${organizationName} from a contact import`
      ),
    }
  )
}

// ── The optional extra link (requirement 8) ────────────────────────────────

/**
 * The link target must be a pulse or person in THIS field, and a person must
 * not be another registered member or pending invitee — the import writes an edge onto the
 * target, and a member's own node is not the importer's to change. Returns its
 * display label, or null when it is not a valid target.
 */
export async function resolveLinkTarget(
  graph: Neo4jGraph,
  contextId: string,
  userId: string,
  link: ContactLinkTarget
): Promise<string | null> {
  const pattern =
    link.kind === 'pulse'
      ? '(c)-[:HAS_PULSE]->(t:FieldPulse {id: $targetId})'
      : `(c)-[:HAS_PERSON]->(t:Person {id: $targetId}) WHERE NOT ${protectedPerson('t')} OR t.id = $userId`
  const rows = await graph.query<{ label: string | null }>(
    `
    MATCH (c:FieldContext {id: $contextId})
    MATCH ${pattern}
    RETURN coalesce(t.title, t.name, '') AS label
    LIMIT 1
    `,
    { contextId, userId, targetId: link.id }
  )
  return rows && rows.length > 0 ? rows[0].label ?? '' : null
}

/**
 * Each runs after `MATCH (me)` and binds `isNew` before its MERGE, so the Log
 * is written once.
 */
const LINK_STATEMENTS = {
  // A pulse: the contact is named in / related to it (GOAL-298 semantics).
  'pulse:person': `
    MATCH (e:Person {id: $entityId}) MATCH (t:FieldPulse {id: $targetId})
    WITH me, e, t, NOT EXISTS { (e)-[:MENTIONED_IN]->(t) } AS isNew
    MERGE (e)-[:MENTIONED_IN]->(t)`,
  'pulse:organization': `
    MATCH (e:Organization {id: $entityId}) MATCH (t:FieldPulse {id: $targetId})
    WITH me, e, t, NOT EXISTS { (e)-[:MENTIONED_IN]->(t) } AS isNew
    MERGE (e)-[:MENTIONED_IN]->(t)`,
  // A person: people connect to them. Organizations are left alone — there
  // is no person→organization edge that means "related to" without also
  // claiming they work there (AFFILIATED_WITH).
  'person:person': `
    MATCH (e:Person {id: $entityId}) MATCH (t:Person {id: $targetId})
    WHERE e <> t
    WITH me, e, t, NOT EXISTS { (e)-[:CONNECTED_TO]-(t) } AS isNew
    MERGE (e)-[:CONNECTED_TO]->(t)`,
} as const satisfies Partial<Record<string, string>>

async function linkToTarget(
  scope: ImportScope,
  entityId: string,
  record: ContactRecord
): Promise<void> {
  if (!scope.link) return
  const key = `${scope.link.kind}:${record.kind}`
  if (!(key in LINK_STATEMENTS)) return
  await scope.graph.query(
    `
    MATCH (me:Person {id: $userId})
    ${LINK_STATEMENTS[key as keyof typeof LINK_STATEMENTS]}
    ${WRITE_LOG_IF_NEW}
    `,
    {
      userId: scope.userId,
      entityId,
      targetId: scope.link.id,
      ...logParams(
        scope,
        `Linked ${contactDisplayName(record)} to ${scope.linkLabel || 'an item'} in ${where(scope)} from a contact import`
      ),
    }
  )
}

// ── Per-row import ─────────────────────────────────────────────────────────

async function importPerson(
  scope: ImportScope,
  record: ContactRecord
): Promise<ContactImportOutcome> {
  const displayName = contactDisplayName(record)
  const base = { row: record.row, kind: record.kind, name: displayName }
  const props = pickProps(record, PERSON_FIELDS)
  const email = props.email ?? null

  let personId: string | null = null
  // The member's own contact from another field, brought here by its email —
  // said out loud, since it now shares that contact with this field's Space.
  let broughtIn = false

  if (email) {
    const match = await findPersonByEmail(scope, email)
    if (match?.isProtected) {
      const attached = await attachMember(scope, match.id, displayName)
      return attached
        ? {
            ...base,
            status: 'linked',
            message: match.isSelf
              ? 'That’s you — your profile was added to this field.'
              : 'Already a member — added to this field; their profile was not changed.',
          }
        : { ...base, status: 'skipped', message: OUT_OF_REACH_MESSAGE }
    }
    if (match && !match.inReach) {
      return { ...base, status: 'skipped', message: OUT_OF_REACH_MESSAGE }
    }
    personId = match?.id ?? null
    broughtIn = Boolean(match && !match.inField)
  }

  personId ??= await findPersonByNameAndOrganization(scope, record, email)

  let outcome: ContactImportOutcome
  if (personId) {
    const { emailDropped } = await updatePerson(scope, personId, record, props)
    const message = emailDropped
      ? EMAIL_NOT_SAVED_MESSAGE
      : broughtIn
        ? BROUGHT_IN_MESSAGE
        : undefined
    outcome = { ...base, status: 'updated', ...(message ? { message } : {}) }
  } else {
    personId = await createPerson(scope, record, props)
    outcome = { ...base, status: 'created' }
  }

  if (record.organization) {
    const organization = await upsertOrganization(scope, record.organization, {})
    await affiliate(scope, personId, organization.id, record.organization, record)
  }
  await linkToTarget(scope, personId, record)
  return outcome
}

async function importOrganization(
  scope: ImportScope,
  record: ContactRecord
): Promise<ContactImportOutcome> {
  const name = contactDisplayName(record)
  const props = pickProps(record, ORGANIZATION_FIELDS)
  const organization = await upsertOrganization(scope, name, props)
  await linkToTarget(scope, organization.id, record)
  return {
    row: record.row,
    kind: record.kind,
    name,
    status: organization.created ? 'created' : 'updated',
  }
}

export async function importContacts(params: {
  driver: Driver
  userId: string
  contextId: string
  contextTitle: string
  records: ContactRecord[]
  link: ContactLinkTarget | null
  linkLabel: string
}): Promise<ContactImportResult> {
  const organizationCache = new Map<string, string>()
  const base = {
    userId: params.userId,
    contextId: params.contextId,
    contextTitle: params.contextTitle,
    link: params.link,
    linkLabel: params.linkLabel,
    organizationCache,
  }

  // Sequential on purpose: a later row may match a contact an earlier row of
  // the same file just created (the same person listed twice).
  const outcomes: ContactImportOutcome[] = []
  const session = params.driver.session()
  try {
    for (const record of params.records) {
      // A rolled-back attempt may have cached an organization it created —
      // restored before every attempt (executeWrite retries) and after a
      // final failure.
      const cachedBefore = new Map(organizationCache)
      const restoreCache = () => {
        organizationCache.clear()
        cachedBefore.forEach((id, key) => organizationCache.set(key, id))
      }
      try {
        outcomes.push(
          await session.executeWrite((tx) => {
            restoreCache()
            const scope: ImportScope = { ...base, graph: txRunner(tx) }
            return record.kind === 'organization'
              ? importOrganization(scope, record)
              : importPerson(scope, record)
          })
        )
      } catch (error) {
        restoreCache()
        // The database itself is gone (the driver already retried): stop
        // rather than spend the request failing every remaining row, and
        // report what landed.
        if ((error as { retriable?: boolean })?.retriable) {
          return {
            summary: summarizeContactOutcomes(outcomes),
            outcomes,
            interrupted: true,
          }
        }
        // Code only — a constraint error's message carries the offending
        // value (an email), which does not belong in server logs.
        const code = (error as { code?: string })?.code ?? 'unknown'
        console.error(`[contact-import] row ${record.row} failed (${code})`)
        outcomes.push({
          row: record.row,
          kind: record.kind,
          name: contactDisplayName(record),
          status: 'skipped',
          message: SAVE_FAILED_MESSAGE,
        })
      }
    }
  } finally {
    await session.close()
  }

  return { summary: summarizeContactOutcomes(outcomes), outcomes }
}
