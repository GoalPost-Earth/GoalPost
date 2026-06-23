import { randomUUID } from 'crypto'
import { Context } from '@/config/types'

/**
 * Mutations for editing a PersonPulse (a non-user `:Person:PersonPulse`).
 *
 * A PersonPulse represents someone in the user's relational world who does NOT
 * have platform access and never owns pulses. Its profile fields therefore can
 * never be edited through the auto-generated `updatePeople` mutation, which is
 * deliberately self-gated (`@authorization` UPDATE where id_EQ $jwt.user.id) to
 * close an IDOR on real users. This resolver provides the missing, properly
 * authorized edit path: the caller must be able to reach the person through a
 * Space they own or belong to, and the target must NOT be a real User.
 */
export const personPulseMutations = {
  updatePersonPulse: async (
    _parent: never,
    args: {
      personId: string
      firstName?: string | null
      lastName?: string | null
      description?: string | null
      relationshipWhy?: string | null
    },
    context: Context
  ) => {
    const currentUserId = context.jwt?.user?.id?.trim() || ''
    if (!currentUserId) {
      return {
        success: false,
        message: 'You must be signed in to edit a person.',
        person: null,
      }
    }

    const { personId } = args
    if (!personId?.trim()) {
      return { success: false, message: 'A person is required.', person: null }
    }

    // Normalize: `undefined`/`null` => leave unchanged. Identity fields are not
    // clearable (a person always needs a name); the description and the
    // relationship why may be cleared with an empty string.
    const firstName =
      typeof args.firstName === 'string' && args.firstName.trim().length > 0
        ? args.firstName.trim()
        : null
    const lastName =
      typeof args.lastName === 'string' ? args.lastName.trim() : null
    const description =
      typeof args.description === 'string' ? args.description.trim() : null
    const relationshipWhy =
      typeof args.relationshipWhy === 'string'
        ? args.relationshipWhy.trim()
        : null

    const session = context.executionContext.session()
    try {
      const result = await session.run(
        `
        MATCH (u:Person {id: $currentUserId})
        MATCH (p:Person {id: $personId})
        // Never let this become a new IDOR on real users — those edit their own
        // node through the self-gated updatePeople mutation.
        WHERE NOT p:User
          // Reach gate: the caller must own or be a member of a Space that has a
          // FieldContext attached to this person (same reach as create_person).
          AND EXISTS {
            MATCH (space:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PERSON]->(p)
            WHERE (u)-[:OWNS]->(space)
               OR (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(u)
          }
        SET p.firstName = CASE WHEN $firstName IS NULL THEN p.firstName ELSE $firstName END,
            p.lastName  = CASE WHEN $lastName  IS NULL THEN p.lastName  ELSE $lastName  END,
            p.description = CASE WHEN $description IS NULL THEN p.description ELSE $description END,
            p.updatedAt = datetime()
        // Keep the denormalized name in sync (read paths outside GraphQL read it
        // directly), mirroring create_person.
        SET p.name = trim(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, ''))
        // Invalidate the embedding when the semantically meaningful fields change
        // (name / description) so the resonance cron — which only re-embeds nodes
        // WHERE embedding IS NULL — picks up the edit. A relationship-only edit
        // (CONNECTED_TO.why lives on the edge, not the node) leaves it untouched.
        SET p.embedding = CASE
          WHEN $firstName IS NULL AND $lastName IS NULL AND $description IS NULL
          THEN p.embedding
          ELSE null
        END
        // The caller's relationship to this person → CONNECTED_TO.why. Only when
        // the argument was supplied; an empty string clears the why but keeps the
        // edge.
        FOREACH (_ IN CASE WHEN $relationshipWhy IS NULL THEN [] ELSE [1] END |
          MERGE (u)-[rc:CONNECTED_TO]-(p)
          SET rc.why = CASE WHEN $relationshipWhy = '' THEN null ELSE $relationshipWhy END
        )
        CREATE (log:Log {
          id: $logId,
          description: 'Updated ' + p.name,
          createdAt: datetime()
        })
        CREATE (log)-[:CREATED_BY]->(u)
        RETURN p { .id, .firstName, .lastName, .name, .description } AS person
        `,
        {
          currentUserId,
          personId,
          firstName,
          lastName,
          description,
          relationshipWhy,
          logId: `log_${Date.now()}_${randomUUID().slice(0, 8)}`,
        }
      )

      if (result.records.length === 0) {
        // Either the person does not exist, is a real User, or the caller has no
        // editable Space containing them. Kept deliberately generic so the
        // resolver does not leak which case it was.
        return {
          success: false,
          message: 'You can only edit people in spaces you belong to.',
          person: null,
        }
      }

      return {
        success: true,
        message: 'Person updated successfully',
        person: result.records[0].get('person'),
      }
    } catch (error) {
      // Log the real error server-side, but return a generic message — a raw
      // driver error can carry Cypher/label/property fragments we don't want to
      // surface to the client.
      console.error('Error updating person pulse:', error)
      return {
        success: false,
        message: 'Failed to update person.',
        person: null,
      }
    } finally {
      await session.close()
    }
  },
}
