import { Context } from '@/config/types'

interface PersonRecord {
  id: string
  firstName: string
  lastName: string
  email: string
  traits?: string
  passions?: string
  fieldsOfCare?: string
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
          
          RETURN person, ownsSpaces
          ORDER BY person.firstName, person.lastName
          `,
          { userId: currentUserId }
        )
      )

      // Extract properties from Neo4j records and include ownsSpaces
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result.records.map((record: any) => {
        const person = record.get('person').properties as PersonRecord
        const ownsSpaces = record.get('ownsSpaces') || []
        return {
          ...person,
          ownsSpaces,
        }
      })
    } catch (error) {
      console.error('Error fetching related people:', error)
      throw new Error('Failed to fetch related people')
    } finally {
      await session.close()
    }
  },
}
