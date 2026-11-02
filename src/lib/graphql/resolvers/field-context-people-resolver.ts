import { randomUUID } from 'crypto'
import type { ManagedTransaction } from 'neo4j-driver'
import { Context } from '@/config/types'
import { CALLER_CAN_EDIT } from './organization-resolver'

type PersonDeletionResult = {
  success: boolean
  message: string
  deleted: boolean
}

const DELETE_NOT_ALLOWED = 'You can only delete people in fields you can edit.'

/**
 * Delete the person outright only when nothing outside the caller's reach
 * relies on them; otherwise detach them from the fields the caller can edit.
 *
 * Non-user contacts can be attached to a field by any editor who has their id
 * (rule 2 below), so being in a field the caller edits proves nothing about
 * whose contact this is. Hence the checks beyond "every holder is editable":
 * without them, attaching someone else's contact to your own field would let you
 * destroy it. A soft-deleted field fails the edit gate, so it counts as a field
 * the caller cannot edit, so it keeps the person.
 *
 * Refused callers, a missing field and a person not in that field all answer the
 * same way, so the response cannot be used to probe other Spaces. This Log leaves
 * the person's name out because Logs outlive the node. (Earlier "Added <name>"
 * Logs from attaching them do survive.)
 */
async function deletePersonFromFields(
  tx: ManagedTransaction,
  params: { userId: string; contextId: string; personId: string }
): Promise<PersonDeletionResult> {
  const refused = { success: false, message: DELETE_NOT_ALLOWED, deleted: false }
  const plan = await tx.run(
    `
    MATCH (c:FieldContext {id: $contextId})-[:HAS_PERSON]->(p:Person {id: $personId})
    WHERE ${CALLER_CAN_EDIT('c')}
    // Write-lock the person before reading who relies on them, so a concurrent
    // attach (addPersonToFieldContext MERGEs HAS_PERSON) waits for this
    // transaction and the decision below cannot go stale before the write.
    SET p._lock = true
    REMOVE p._lock
    WITH c, p
    MATCH (h:FieldContext)-[:HAS_PERSON]->(p)
    WITH c, p, collect(DISTINCT h) AS holders
    RETURN
      coalesce(p.name, trim(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, ''))) AS personName,
      coalesce(c.title, 'a field') AS fieldTitle,
      [h IN holders WHERE ${CALLER_CAN_EDIT('h')} | h.id] AS editableIds,
      (
        p:User
        OR EXISTS { MATCH (p)-[:OWNS]->(:Space) }
        OR EXISTS { MATCH (:SpaceMembership)-[:IS_MEMBER]->(p) }
        OR size([h IN holders WHERE NOT ${CALLER_CAN_EDIT('h')}]) > 0
        // Another user's contact. Shared Space membership can't excuse this:
        // addSpaceMember takes effect with no acceptance step, so an attacker
        // could add the victim to their own Space to pass that test.
        OR EXISTS {
          MATCH (p)-[:CREATED_BY|CONNECTED_TO]-(other:User)
          WHERE other.id <> $userId
        }
        // Linked by ANY edge to a pulse, weave, document or organization in a
        // field the caller cannot edit. Deliberately not a list of edge types,
        // so a new one fails closed.
        OR EXISTS {
          MATCH (p)--(linked)<-[:HAS_PULSE|HAS_DOCUMENT|HAS_WEAVE|HAS_ORGANIZATION]-(f:FieldContext)
          WHERE NOT ${CALLER_CAN_EDIT('f')}
        }
        OR EXISTS {
          MATCH (p)-[:CONNECTED_TO]-(:Person)<-[:HAS_PERSON]-(f:FieldContext)
          WHERE NOT ${CALLER_CAN_EDIT('f')}
        }
      ) AS mustKeep
    `,
    params
  )
  const record = plan.records[0]
  if (!record) return refused

  const personName: string = record.get('personName') || 'This person'
  const fieldTitle: string = record.get('fieldTitle')
  const editableIds: string[] = record.get('editableIds')
  const mustKeep: boolean = record.get('mustKeep')
  const logParams = {
    ...params,
    logId: `log_${Date.now()}_${randomUUID().slice(0, 8)}`,
    metadata: JSON.stringify({
      event: mustKeep ? 'person_removed_from_fields' : 'person_deleted',
      fieldContextId: params.contextId,
      personId: params.personId,
    }),
  }

  if (!mustKeep) {
    const deleted = await tx.run(
      `
      MATCH (u:Person {id: $userId})
      MATCH (p:Person {id: $personId})
      CREATE (log:Log {
        id: $logId,
        description: 'Deleted a contact from ' + $fieldTitle,
        metadata: $metadata,
        createdAt: datetime()
      })
      CREATE (log)-[:CREATED_BY]->(u)
      DETACH DELETE p
      RETURN count(*) AS n
      `,
      { ...logParams, fieldTitle }
    )
    if (Number(deleted.records[0]?.get('n') ?? 0) === 0) return refused
    return { success: true, deleted: true, message: `Deleted ${personName}.` }
  }

  const detached = await tx.run(
    `
    MATCH (u:Person {id: $userId})
    MATCH (h:FieldContext)-[r:HAS_PERSON]->(:Person {id: $personId})
    WHERE h.id IN $editableIds
    DELETE r
    WITH u, count(r) AS n
    WHERE n > 0
    CREATE (log:Log {
      id: $logId,
      description: 'Removed a contact from ' + toString(n) + ' field(s); they are still used elsewhere, so they were not deleted',
      metadata: $metadata,
      createdAt: datetime()
    })
    CREATE (log)-[:CREATED_BY]->(u)
    RETURN n
    `,
    { ...logParams, editableIds }
  )
  if (detached.records.length === 0) return refused
  return {
    success: true,
    deleted: false,
    message: `Removed ${personName} from your fields. They have an account or are used elsewhere, so they were not deleted.`,
  }
}

/**
 * Custom mutation for attaching a person to a FieldContext (HAS_PERSON).
 *
 * This replaces the auto-generated `updateFieldContexts` nested CONNECT, which
 * let any context editor attach an ARBITRARY registered User by id — silently
 * unlocking that account's gated PII to the space's members through the Person
 * `contexts_SOME` READ branch (see the GOAL-275 comment block in schema.gql).
 * The nested CONNECT is disabled on both relationship fields
 * (`FieldContext.people`, `Person.contexts`); this resolver is the only
 * GraphQL write path for HAS_PERSON.
 *
 * Rules enforced here:
 *   1. Caller must be able to edit the context — owner, ADMIN, or MEMBER of
 *      its parent Space (GUESTs are view-only, kb/02-user-roles.md).
 *   2. A `:User` target may only be attached when they are the caller
 *      themselves, or already own / are a member of that parent Space —
 *      presence in the Space is the consent boundary for exposing a real
 *      account's PII to its members. Non-user people (PersonPulse, bare
 *      imported contacts) are space content and attachable by any editor.
 *   3. Every successful attach writes an activity Log (mandatory on
 *      mutations); MERGE keeps re-attaches idempotent.
 */
export const fieldContextPeopleMutations = {
  addPersonToFieldContext: async (
    _parent: never,
    args: { contextId: string; personId: string },
    context: Context
  ) => {
    const currentUserId = context.jwt?.user?.id?.trim() || ''
    if (!currentUserId) {
      return {
        success: false,
        message: 'You must be signed in to add a person.',
        person: null,
      }
    }

    const contextId = args.contextId?.trim() || ''
    const personId = args.personId?.trim() || ''
    if (!contextId || !personId) {
      return {
        success: false,
        message: 'A field context and a person are required.',
        person: null,
      }
    }

    const session = context.executionContext.session()
    try {
      const result = await session.run(
        `
        MATCH (u:Person {id: $currentUserId})
        MATCH (c:FieldContext {id: $contextId})
        // Edit gate: owner, ADMIN, or MEMBER of the parent Space (GUESTs are
        // view-only) — mirrors canEditContent in space-permissions.ts. Wrapped
        // in EXISTS so an anomalous context with two HAS_CONTEXT parents can't
        // fan out into per-space rows (which would duplicate the Log below).
        WHERE EXISTS {
          MATCH (space:Space)-[:HAS_CONTEXT]->(c)
          WHERE (u)-[:OWNS]->(space)
             OR EXISTS {
               MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(u)
               WHERE sm.role IN ['ADMIN', 'MEMBER']
             }
        }
        MATCH (p:Person {id: $personId})
        // Target gate: attaching unlocks the person's gated PII to EVERY Space
        // that can reach this context (Person contexts_SOME READ branch), so a
        // registered User may only be attached when they are the caller or
        // already belong to ALL exposing Spaces — checked with ALL(...) rather
        // than per-row, so a second parent can never expose them to a Space
        // they never joined.
        WHERE (NOT p:User)
           OR p.id = $currentUserId
           OR ALL(space IN [(s:Space)-[:HAS_CONTEXT]->(c) | s] WHERE
                (p)-[:OWNS]->(space)
                OR EXISTS {
                  MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(p)
                })
        // Captured BEFORE the MERGE so the Log below can tell an attach from
        // a promotion. Writing "Added X" for a promotion asserts something
        // that did not happen — the edge was already there — and the sibling
        // attach in article-import-service.ts already guards its Log the
        // same way.
        OPTIONAL MATCH (c)-[existingHp:HAS_PERSON]->(p)
        WITH u, c, p, existingHp IS NOT NULL AS alreadyAttached
        MERGE (c)-[hp:HAS_PERSON]->(p)
        // GOAL-346: this mutation is only ever reached by a deliberate human
        // act — the field's Add Person flow, or promoting someone the
        // extractor surfaced under a Document — so the edge is marked
        // curated and the person shows on the roster. Document ingestion
        // attaches through its own writes and leaves the flag unset.
        //
        // Plain SET, NOT an ON CREATE SET: promoting an extracted person acts
        // on an edge that ALREADY exists (ingestion attached it), so an
        // on-create-only write would silently never fire for the exact case
        // this field was added to serve.
        SET hp.curated = true
        WITH u, c, p, alreadyAttached,
             coalesce(p.name, trim(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, ''))) AS personName
        CREATE (log:Log {
          id: $logId,
          description: CASE WHEN alreadyAttached
            THEN personName + ' added to the People list for ' + coalesce(c.title, 'a field')
            ELSE 'Added ' + personName + ' to ' + coalesce(c.title, 'a field')
          END,
          createdAt: datetime()
        })
        CREATE (log)-[:CREATED_BY]->(u)
        // Projection MUST stay limited to open directory fields (id / names).
        // This POJO is returned outside the field-auth translation, so a gated
        // field (email, description, …) added here would bypass GOAL-275.
        RETURN p { .id, .firstName, .lastName, .name } AS person
        `,
        {
          currentUserId,
          contextId,
          personId,
          logId: `log_${Date.now()}_${randomUUID().slice(0, 8)}`,
        }
      )

      if (result.records.length === 0) {
        // Context missing, caller lacks edit rights, person missing, or the
        // target is a User outside this Space. Kept deliberately generic so
        // the resolver does not leak which case it was.
        return {
          success: false,
          message:
            'You can only add people to field contexts in spaces you belong to.',
          person: null,
        }
      }

      return {
        success: true,
        message: 'Person added to field context.',
        person: result.records[0].get('person'),
      }
    } catch (error) {
      // Log the real error server-side, but return a generic message — a raw
      // driver error can carry Cypher/label/property fragments we don't want
      // to surface to the client.
      console.error('Error adding person to field context:', error)
      return {
        success: false,
        message: 'Failed to add person to field context.',
        person: null,
      }
    } finally {
      await session.close()
    }
  },

  deletePersonFromFieldContext: async (
    _parent: never,
    args: { contextId: string; personId: string },
    context: Context
  ): Promise<PersonDeletionResult> => {
    const userId = context.jwt?.user?.id?.trim() || ''
    const contextId = args.contextId?.trim() || ''
    const personId = args.personId?.trim() || ''
    if (!userId || !contextId || !personId) {
      return { success: false, message: DELETE_NOT_ALLOWED, deleted: false }
    }
    const session = context.executionContext.session()
    try {
      return await session.executeWrite((tx) =>
        deletePersonFromFields(tx, { userId, contextId, personId })
      )
    } catch (error) {
      // Real error server-side only: a raw driver message can carry Cypher
      // fragments that should not reach the client.
      console.error('Error deleting person from field context:', error)
      return {
        success: false,
        message: 'Failed to delete this person.',
        deleted: false,
      }
    } finally {
      await session.close()
    }
  },
}
