import { randomUUID } from 'crypto'
import { Context } from '@/config/types'

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
        MERGE (c)-[:HAS_PERSON]->(p)
        WITH u, c, p,
             coalesce(p.name, trim(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, ''))) AS personName
        CREATE (log:Log {
          id: $logId,
          description: 'Added ' + personName + ' to ' + coalesce(c.title, 'a field'),
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
}
