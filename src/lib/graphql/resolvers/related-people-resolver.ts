import { Context } from '@/config/types'

// GOAL-275: directory-safe shape only. This resolver returns [Person!]! as
// plain objects rather than going through Cypher translation, so it must never
// carry PII itself — the related set includes CONNECTED_TO-only contacts the
// caller shares no Space with. Name + photo + owned spaces are the directory
// fields; `name` is resolved from firstName/lastName by the Person.name
// customResolver.
//
// Since the gate moved to `PersonPrivateProfile`, this fails closed on its own:
// PII is no longer selectable on `Person` at all, and `Person.privateProfile`
// is a @cypher field with no standalone resolver, so it resolves to null on a
// hand-built object. Keep the projection directory-only anyway — that is the
// invariant, not an accident of the current library behaviour.
interface PersonRecord {
  id: string
  firstName: string
  lastName: string
  photo?: string | null
  [key: string]: unknown
}

/**
 * Resolver for relatedPeople query.
 * Returns people related to the current user through spaces or direct connections.
 * Used in dashboard to show only relevant people.
 */
export const relatedPeopleResolvers = {
  relatedPeople: async (
    _parent: never,
    _args: Record<string, never>,
    context: Context
  ): Promise<PersonRecord[]> => {
    // Extract user ID from context
    const currentUserId = context.jwt?.user.id || null

    // Require authentication
    if (!currentUserId) {
      throw new Error(
        'Authentication required to view related people. Please log in.'
      )
    }

    const session = context.executionContext.session()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await session.executeRead((tx: any) =>
        tx.run(
          `
          MATCH (currentUser:Person {id: $userId})
          
          // Collect all related people
          WITH currentUser
          OPTIONAL MATCH (currentUser)-[:OWNS]->(ownSpace:Space)<-[:OWNS]-(spaceOwner:Person)
          WITH currentUser, COLLECT(DISTINCT spaceOwner) as spaceOwners
          
          OPTIONAL MATCH (currentUser)-[:OWNS]->(ownSpace:Space)-[:HAS_MEMBER]->(sm1:SpaceMembership)-[:IS_MEMBER]->(spaceMember:Person)
          WITH currentUser, spaceOwners, COLLECT(DISTINCT spaceMember) as spaceMembers
          
          OPTIONAL MATCH (currentUser)-[:IS_MEMBER]->(membership:SpaceMembership)<-[:HAS_MEMBER]-(memberSpace:Space)<-[:OWNS]-(memberSpaceOwner:Person)
          WITH currentUser, spaceOwners, spaceMembers, COLLECT(DISTINCT memberSpaceOwner) as memberSpaceOwners
          
          OPTIONAL MATCH (currentUser)-[:IS_MEMBER]->(membership2:SpaceMembership)<-[:HAS_MEMBER]-(sharedSpace:Space)-[:HAS_MEMBER]->(sm2:SpaceMembership)-[:IS_MEMBER]->(coMember:Person)
          WHERE coMember.id <> $userId
          WITH currentUser, spaceOwners, spaceMembers, memberSpaceOwners, COLLECT(DISTINCT coMember) as coMembers
          
          OPTIONAL MATCH (currentUser)-[:CONNECTED_TO]-(directConnection:Person)
          WITH currentUser, spaceOwners, spaceMembers, memberSpaceOwners, coMembers, COLLECT(DISTINCT directConnection) as directConnections
          
          // Combine all related people
          WITH [currentUser] + spaceOwners + spaceMembers + memberSpaceOwners + coMembers + directConnections as allPeople
          
          UNWIND allPeople as person
          WITH DISTINCT person
          WHERE person IS NOT NULL
          
          // Fetch owned spaces for each person
          OPTIONAL MATCH (person)-[:OWNS]->(space:Space)
          WITH person, space
          WITH person, COLLECT(DISTINCT {
            id: space.id,
            name: space.name,
            visibility: space.visibility,
            __typename: CASE 
              WHEN 'MeSpace' IN labels(space) THEN 'MeSpace'
              WHEN 'WeSpace' IN labels(space) THEN 'WeSpace'
              ELSE 'MeSpace'
            END
          }) as ownsSpaces
          
          // GOAL-275: project only directory-safe columns. Returning the whole
          // node (person.properties) leaked PII for CONNECTED_TO-only contacts,
          // since this custom resolver bypasses the Person field-level auth.
          RETURN person.id AS id,
                 person.firstName AS firstName,
                 person.lastName AS lastName,
                 person.photo AS photo,
                 ownsSpaces
          ORDER BY firstName, lastName
          `,
          { userId: currentUserId }
        )
      )

      // Map the directory-safe columns straight through (no `.properties`, no
      // PII). `name` is derived by the Person.name customResolver.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result.records.map((record: any) => ({
        id: record.get('id'),
        firstName: record.get('firstName'),
        lastName: record.get('lastName'),
        photo: record.get('photo'),
        ownsSpaces: record.get('ownsSpaces') || [],
      }))
    } catch (error) {
      console.error('Error fetching related people:', error)
      throw new Error('Failed to fetch related people')
    } finally {
      await session.close()
    }
  },
}
