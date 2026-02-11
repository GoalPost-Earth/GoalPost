/**
 * Space Validation Utilities
 *
 * Application-level validation for space constraints
 */

import { Session } from 'neo4j-driver'

/**
 * Validates that a person has at most one MeSpace
 *
 * This is an application-level constraint to ensure data integrity.
 * Each person should have exactly one personal MeSpace.
 *
 * @param session - Neo4j session
 * @param personId - The person's ID to check
 * @returns Object with isValid flag and optional existing MeSpace data
 */
export async function validateOneMeSpacePerPerson(
  session: Session,
  personId: string
): Promise<{
  isValid: boolean
  existingMeSpace?: { id: string; name: string }
  error?: string
}> {
  try {
    const result = await session.run(
      `MATCH (person:Person {id: $personId})-[:OWNS]->(ms:MeSpace)
       RETURN ms.id as id, ms.name as name
       LIMIT 2`,
      { personId }
    )

    if (result.records.length === 0) {
      // User has no MeSpace - valid to create one
      return { isValid: true }
    }

    if (result.records.length === 1) {
      // User already has one MeSpace - cannot create another
      const record = result.records[0]
      return {
        isValid: false,
        existingMeSpace: {
          id: record.get('id'),
          name: record.get('name'),
        },
        error: 'User already has a MeSpace',
      }
    }

    // User has multiple MeSpaces - data integrity issue
    return {
      isValid: false,
      error: 'Data integrity error: User has multiple MeSpaces',
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error}`,
    }
  }
}

/**
 * Audits all persons to ensure MeSpace constraint is satisfied
 *
 * @param session - Neo4j session
 * @returns Array of persons with MeSpace count violations
 */
export async function auditMeSpaceConstraint(session: Session): Promise<
  Array<{
    personId: string
    email: string
    meSpaceCount: number
  }>
> {
  try {
    const result = await session.run(
      `MATCH (p:Person)
       OPTIONAL MATCH (p)-[:OWNS]->(ms:MeSpace)
       WITH p, count(ms) as meSpaceCount
       WHERE meSpaceCount > 1
       RETURN p.id as personId, p.email as email, meSpaceCount
       ORDER BY meSpaceCount DESC`
    )

    return result.records.map((record) => ({
      personId: record.get('personId'),
      email: record.get('email'),
      meSpaceCount: record.get('meSpaceCount').toNumber(),
    }))
  } catch (error) {
    console.error('Error auditing MeSpace constraint:', error)
    return []
  }
}

/**
 * Gets or creates a MeSpace for a person (idempotent operation)
 *
 * @param session - Neo4j session
 * @param personId - The person's ID
 * @param name - Optional name for the MeSpace
 * @returns The MeSpace ID (existing or newly created)
 */
export async function getOrCreateMeSpace(
  session: Session,
  personId: string,
  name?: string
): Promise<{ meSpaceId: string; created: boolean }> {
  // Check if user already has a MeSpace
  const validation = await validateOneMeSpacePerPerson(session, personId)

  if (!validation.isValid && validation.existingMeSpace) {
    // Return existing MeSpace
    return {
      meSpaceId: validation.existingMeSpace.id,
      created: false,
    }
  }

  // Get person info for default name
  const personResult = await session.run(
    `MATCH (p:Person {id: $personId})
     RETURN p.name as name, p.email as email`,
    { personId }
  )

  if (personResult.records.length === 0) {
    throw new Error('Person not found')
  }

  const person = personResult.records[0]
  const personName = person.get('name') || person.get('email')
  const meSpaceName = name || `${personName}'s Space`

  // Create new MeSpace
  const result = await session.run(
    `MATCH (person:Person {id: $personId})
     CREATE (meSpace:Space:MeSpace {
       id: 'me_' + randomUUID(),
       name: $name,
       visibility: 'PRIVATE',
       createdAt: datetime(),
       modifiedAt: datetime()
     })
     CREATE (person)-[:OWNS]->(meSpace)
     RETURN meSpace.id as id`,
    { personId, name: meSpaceName }
  )

  return {
    meSpaceId: result.records[0].get('id'),
    created: true,
  }
}
