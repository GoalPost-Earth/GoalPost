import { randomUUID } from 'crypto'
import { Context } from '@/config/types'

/**
 * Person-to-person connection mutations (`CONNECTED_TO`).
 *
 * GOAL-320 — these three mutations previously ran `MATCH (:Person {id: $x})` on
 * client-supplied ids with NO authorization, so any authenticated caller could
 * MERGE a `CONNECTED_TO` edge between any two Persons. Combined with the open
 * Person directory (`people(where: { email_EQ })` resolves any account's id from
 * an email, kb/02-user-roles.md), that let an attacker forge an edge onto a real
 * User — and because `relatedPeople` matches `CONNECTED_TO` *undirected*
 * (related-people-resolver.ts), the forged edge also injected the attacker into
 * the victim's dashboard people list. `CONNECTED_TO` therefore could not be
 * trusted as a relationship signal anywhere downstream (GOAL-317 had to work
 * around exactly this).
 *
 * ## Consent policy (the decision GOAL-320 asked for)
 *
 * An endpoint is **writable** by the caller when it is either:
 *   1. the caller themselves, or
 *   2. a `:PersonPulse` — a relational-world person, never another registered
 *      `:User` — attached via `HAS_PERSON` to a `FieldContext` inside a Space
 *      the caller owns or is a member of.
 *
 * A non-self `:User` endpoint is **never** writable. Edges onto real accounts
 * require that account's own action; there is no invite/pending state, so no
 * `kb/04-state-machines.md` change. This is the same *reach* rule the assistant
 * enforces in `resolveEditablePerson` (`src/lib/chat/hitl.ts`), so the GraphQL
 * and assistant surfaces agree on who may be connected — the point of the fix
 * being that `CONNECTED_TO` is non-forgeable on every write path.
 *
 * Two deliberate differences from that assistant copy, both making THIS path the
 * stricter one; they are not drift, and neither should be "aligned" by loosening
 * this file:
 *   - the `NOT :User` label guard below, which `resolveEditablePerson` lacks;
 *   - the GUEST exclusion below (`kb/02-user-roles.md`: GUEST is view-only),
 *     which neither `resolveEditablePerson` nor `person-pulse-resolver.ts`
 *     applies. Those two are worth a follow-up pass of their own.
 *
 * The agreement is about AUTHORIZATION only: the assistant deliberately
 * `coalesce`s `why`/`interests` so a re-connect never wipes existing edge
 * metadata, whereas this mutation SETs them outright (its callers always send
 * both fields).
 *
 * Per operation:
 *   - **create** — BOTH endpoints must be writable.
 *   - **update / delete** — both endpoints writable, OR the caller is one of the
 *     two endpoints. The endpoint clause is what lets someone sever or amend an
 *     edge asserted about them, including a pre-fix forged one (backfilling or
 *     auditing existing edges is out of scope for GOAL-320).
 *
 * `fromPersonId` is kept in the SDL rather than derived from the JWT, because
 * it is legitimately NOT always the caller: the person-detail UI connects from
 * the person whose page is open, and the assistant's `create_connection` exposes
 * `fromPersonName` to connect two other people the user knows. It is authorized
 * here instead of trusted.
 *
 * Every successful write records an activity `Log` attributed to the caller.
 * Failures return a fixed member-safe message and never echo driver/Cypher text
 * (kb/07-ai-assistant-ux.md Rule 1).
 */

/**
 * Cypher predicate: is `<alias>` an endpoint the caller may write?
 *
 * Written as a fragment so create/update/delete cannot drift apart. The Space
 * reach is spelled inline with `{id: $currentUserId}` (rather than reusing an
 * outer `actor` binding) to match the shape already proven in hitl.ts, and it
 * traverses `HAS_CONTEXT` only — soft-deleted contexts hang off
 * `HAS_DELETED_CONTEXT` and are correctly invisible here (GOAL-319).
 *
 * `NOT <alias>:User` is belt-and-braces: no Person carries both `:User` and
 * `:PersonPulse` today, but this codebase dual-labels during migrations (GOAL-287
 * made migrated values `:CoreValuePulse:CoreValue`), and a future migration that
 * added `:PersonPulse` to accounts would silently make every real account
 * writable. The exclusion makes "never a real account" structural rather than a
 * property of the current data.
 */
const writableEndpoint = (alias: string) => `(
    ${alias}.id = $currentUserId
    OR (${alias}:PersonPulse AND NOT ${alias}:User AND EXISTS {
         MATCH (${alias})<-[:HAS_PERSON]-(:FieldContext)<-[:HAS_CONTEXT]-(space:Space)
         WHERE (space)<-[:OWNS]-(:Person {id: $currentUserId})
            OR EXISTS {
                 MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(:Person {id: $currentUserId})
                 WHERE sm.role IN ['ADMIN', 'MEMBER']
               }
       })
  )`

/** Caller is one of the two endpoints — the self-service clause for update/delete. */
const CALLER_IS_ENDPOINT = `(from.id = $currentUserId OR to.id = $currentUserId)`

/**
 * Display name for activity-log copy. Account nodes can carry a null `name`, and
 * a migrated node can have no usable name part at all — without the fallback the
 * log would read "Connected  with Ama". Mirrors the `coalesce(c.title, 'a field')`
 * guard in field-context-people-resolver.ts.
 */
const displayName = (alias: string) => {
  const raw = `trim(coalesce(${alias}.name, trim(coalesce(${alias}.firstName, '') + ' ' + coalesce(${alias}.lastName, ''))))`
  return `CASE WHEN ${raw} = '' THEN 'someone' ELSE ${raw} END`
}

const newLogId = () => `log_${Date.now()}_${randomUUID().slice(0, 8)}`

export const connectionMutations = {
  createPersonConnection: async (
    _parent: never,
    args: {
      fromPersonId: string
      toPersonId: string
      why?: string | null
      interests?: string | null
    },
    context: Context
  ) => {
    const currentUserId = context.jwt?.user?.id?.trim() || ''
    if (!currentUserId) {
      return {
        success: false,
        message: 'You must be signed in to manage connections.',
        connection: null,
      }
    }

    const fromPersonId = args.fromPersonId?.trim() || ''
    const toPersonId = args.toPersonId?.trim() || ''
    const { why, interests } = args

    if (!fromPersonId || !toPersonId) {
      return {
        success: false,
        message: 'Two people are required to create a connection.',
        connection: null,
      }
    }

    if (fromPersonId === toPersonId) {
      return {
        success: false,
        message: 'You cannot connect a person to themselves',
        connection: null,
      }
    }

    const session = context.executionContext.session()

    try {
      const result = await session.run(
        `
        MATCH (actor:Person {id: $currentUserId})
        MATCH (from:Person {id: $fromPersonId})
        MATCH (to:Person {id: $toPersonId})
        // Both endpoints must be writable by the caller — self, or a
        // PersonPulse in a Space they belong to. A non-self :User endpoint
        // fails here, which is what makes the edge non-forgeable.
        WHERE ${writableEndpoint('from')} AND ${writableEndpoint('to')}
        MERGE (from)-[r:CONNECTED_TO]-(to)
        SET r.why = $why,
            r.interests = $interests
        CREATE (log:Log {
          id: $logId,
          description: 'Connected ' + ${displayName('from')} + ' with ' + ${displayName('to')},
          createdAt: datetime()
        })
        CREATE (log)-[:CREATED_BY]->(actor)
        RETURN {
          connectedPersonId: to.id,
          why: r.why,
          interests: r.interests
        } AS connection
        `,
        {
          currentUserId,
          fromPersonId,
          toPersonId,
          why: why ?? null,
          interests: interests ?? null,
          logId: newLogId(),
        }
      )

      if (result.records.length === 0) {
        // Either endpoint is missing, is a registered User the caller may not
        // write, or sits outside the caller's Spaces. Kept deliberately generic
        // so the resolver does not leak which case it was.
        return {
          success: false,
          message:
            'You can only connect yourself, or people you have added to a space you belong to.',
          connection: null,
        }
      }

      const connection = result.records[0].get('connection')

      return {
        success: true,
        message: 'Connection created successfully',
        connection,
      }
    } catch (error) {
      // Log the real error server-side, but return a fixed message — a raw
      // driver error can carry Cypher/label/property fragments we don't want to
      // surface to the client.
      console.error('Error creating person connection:', error)
      return {
        success: false,
        message: 'Failed to create connection.',
        connection: null,
      }
    } finally {
      await session.close()
    }
  },

  updatePersonConnection: async (
    _parent: never,
    args: {
      fromPersonId: string
      toPersonId: string
      why?: string | null
      interests?: string | null
    },
    context: Context
  ) => {
    const currentUserId = context.jwt?.user?.id?.trim() || ''
    if (!currentUserId) {
      return {
        success: false,
        message: 'You must be signed in to manage connections.',
        connection: null,
      }
    }

    const fromPersonId = args.fromPersonId?.trim() || ''
    const toPersonId = args.toPersonId?.trim() || ''
    const { why, interests } = args

    if (!fromPersonId || !toPersonId) {
      return {
        success: false,
        message: 'Two people are required to update a connection.',
        connection: null,
      }
    }

    const session = context.executionContext.session()

    try {
      const result = await session.run(
        `
        MATCH (actor:Person {id: $currentUserId})
        MATCH (from:Person {id: $fromPersonId})-[r:CONNECTED_TO]-(to:Person {id: $toPersonId})
        // Same endpoint gate as create, plus: you may always amend an edge you
        // are an endpoint of — including one asserted about you before this
        // gate existed.
        WHERE (${writableEndpoint('from')} AND ${writableEndpoint('to')})
           OR ${CALLER_IS_ENDPOINT}
        SET r.why = $why,
            r.interests = $interests
        // Collapse to one row per pair so an anomalous duplicate edge cannot
        // fan out into two activity Logs.
        WITH actor, to, ${displayName('from')} AS fromName, ${displayName('to')} AS toName,
             collect(r)[0] AS rel
        CREATE (log:Log {
          id: $logId,
          description: 'Updated connection between ' + fromName + ' and ' + toName,
          createdAt: datetime()
        })
        CREATE (log)-[:CREATED_BY]->(actor)
        RETURN {
          connectedPersonId: to.id,
          why: rel.why,
          interests: rel.interests
        } AS connection
        `,
        {
          currentUserId,
          fromPersonId,
          toPersonId,
          why: why ?? null,
          interests: interests ?? null,
          logId: newLogId(),
        }
      )

      if (result.records.length === 0) {
        // No such edge, or the caller may not write it. Generic on purpose.
        return {
          success: false,
          message:
            'You can only edit connections you are part of, or between people in a space you belong to.',
          connection: null,
        }
      }

      const connection = result.records[0].get('connection')

      return {
        success: true,
        message: 'Connection updated successfully',
        connection,
      }
    } catch (error) {
      console.error('Error updating person connection:', error)
      return {
        success: false,
        message: 'Failed to update connection.',
        connection: null,
      }
    } finally {
      await session.close()
    }
  },

  deletePersonConnection: async (
    _parent: never,
    args: {
      fromPersonId: string
      toPersonId: string
    },
    context: Context
  ) => {
    const currentUserId = context.jwt?.user?.id?.trim() || ''
    if (!currentUserId) {
      return {
        success: false,
        message: 'You must be signed in to manage connections.',
      }
    }

    const fromPersonId = args.fromPersonId?.trim() || ''
    const toPersonId = args.toPersonId?.trim() || ''

    if (!fromPersonId || !toPersonId) {
      return {
        success: false,
        message: 'Two people are required to remove a connection.',
      }
    }

    const session = context.executionContext.session()

    try {
      const result = await session.run(
        `
        MATCH (actor:Person {id: $currentUserId})
        MATCH (from:Person {id: $fromPersonId})-[r:CONNECTED_TO]-(to:Person {id: $toPersonId})
        // Same gate as update. The endpoint clause is what lets the subject of a
        // forged edge remove it themselves.
        WHERE (${writableEndpoint('from')} AND ${writableEndpoint('to')})
           OR ${CALLER_IS_ENDPOINT}
        // Aggregate first: delete every matched edge but write exactly one Log,
        // and read the names off the nodes (which survive the delete).
        WITH actor, ${displayName('from')} AS fromName, ${displayName('to')} AS toName,
             collect(r) AS rels
        FOREACH (rel IN rels | DELETE rel)
        CREATE (log:Log {
          id: $logId,
          description: 'Removed connection between ' + fromName + ' and ' + toName,
          createdAt: datetime()
        })
        CREATE (log)-[:CREATED_BY]->(actor)
        RETURN size(rels) AS deletedCount
        `,
        {
          currentUserId,
          fromPersonId,
          toPersonId,
          logId: newLogId(),
        }
      )

      const deletedCount = Number(result.records[0]?.get('deletedCount') ?? 0)

      if (deletedCount === 0) {
        // Zero rows means no such edge OR the caller may not write it — the two
        // are intentionally indistinguishable to the client.
        return {
          success: false,
          message:
            'You can only remove connections you are part of, or between people in a space you belong to.',
        }
      }

      return {
        success: true,
        message: 'Connection deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting person connection:', error)
      return {
        success: false,
        message: 'Failed to delete connection.',
      }
    } finally {
      await session.close()
    }
  },
}
