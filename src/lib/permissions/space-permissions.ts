import { Session } from 'neo4j-driver'

export type SpaceRole = 'ADMIN' | 'MEMBER' | 'GUEST'

/**
 * Check if the current user has permission to manage members in a space.
 * Only the owner or members with ADMIN role can manage members.
 */
export async function canManageMembers(
  session: Session,
  userId: string,
  spaceId: string
): Promise<boolean> {
  const result = await session.executeRead((tx) =>
    tx.run(
      `
      MATCH (user:LifeSensor {id: $userId}), (space:Space {id: $spaceId})
      RETURN 
        EXISTS {
          MATCH (user)-[:OWNS]->(space)
        } as isOwner,
        EXISTS {
          MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership {role: 'ADMIN'})-[:IS_MEMBER]->(user)
        } as isAdmin
      `,
      { userId, spaceId }
    )
  )

  if (result.records.length === 0) {
    return false
  }

  const record = result.records[0]
  const isOwner = record.get('isOwner')
  const isAdmin = record.get('isAdmin')

  return isOwner || isAdmin
}

/**
 * Check if the current user can edit pulses and contexts in a space.
 * Owner, ADMIN, and MEMBER roles can edit. GUEST cannot.
 */
export async function canEditContent(
  session: Session,
  userId: string,
  spaceId: string
): Promise<boolean> {
  const result = await session.executeRead((tx) =>
    tx.run(
      `
      MATCH (user:LifeSensor {id: $userId}), (space:Space {id: $spaceId})
      RETURN 
        EXISTS {
          MATCH (user)-[:OWNS]->(space)
        } as isOwner,
        EXISTS {
          MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(user)
          WHERE sm.role IN ['ADMIN', 'MEMBER']
        } as canEdit
      `,
      { userId, spaceId }
    )
  )

  if (result.records.length === 0) {
    return false
  }

  const record = result.records[0]
  const isOwner = record.get('isOwner')
  const canEdit = record.get('canEdit')

  return isOwner || canEdit
}

/**
 * Check if the current user can view content in a space.
 * Owner and all roles (ADMIN, MEMBER, GUEST) can view.
 */
export async function canViewContent(
  session: Session,
  userId: string,
  spaceId: string
): Promise<boolean> {
  const result = await session.executeRead((tx) =>
    tx.run(
      `
      MATCH (user:LifeSensor {id: $userId}), (space:Space {id: $spaceId})
      RETURN 
        EXISTS {
          MATCH (user)-[:OWNS]->(space)
        } as isOwner,
        EXISTS {
          MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(user)
        } as isMember
      `,
      { userId, spaceId }
    )
  )

  if (result.records.length === 0) {
    return false
  }

  const record = result.records[0]
  const isOwner = record.get('isOwner')
  const isMember = record.get('isMember')

  return isOwner || isMember
}

/**
 * Get the current user's role in a space.
 * Returns 'OWNER' for space owners, or the role from SpaceMembership for members.
 * Returns null if user has no access.
 */
export async function getUserSpaceRole(
  session: Session,
  userId: string,
  spaceId: string
): Promise<'OWNER' | SpaceRole | null> {
  const result = await session.executeRead((tx) =>
    tx.run(
      `
      MATCH (user:LifeSensor {id: $userId}), (space:Space {id: $spaceId})
      RETURN 
        CASE 
          WHEN EXISTS {
            MATCH (user)-[:OWNS]->(space)
          } THEN 'OWNER'
          ELSE 
            (
              MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(user)
              RETURN sm.role
            )[0]
        END as role
      `,
      { userId, spaceId }
    )
  )

  if (result.records.length === 0) {
    return null
  }

  const role = result.records[0].get('role')
  return role || null
}

/**
 * Validate that a member already exists in the space
 */
export async function memberExistsInSpace(
  session: Session,
  memberId: string,
  spaceId: string
): Promise<boolean> {
  const result = await session.executeRead((tx) =>
    tx.run(
      `
      MATCH (member:LifeSensor {id: $memberId}), (space:Space {id: $spaceId})
      RETURN EXISTS {
        MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
      } as exists
      `,
      { memberId, spaceId }
    )
  )

  if (result.records.length === 0) {
    return false
  }

  return result.records[0].get('exists')
}

/**
 * Validate that a user is the owner of a space
 */
export async function isSpaceOwner(
  session: Session,
  userId: string,
  spaceId: string
): Promise<boolean> {
  const result = await session.executeRead((tx) =>
    tx.run(
      `
      MATCH (owner:LifeSensor {id: $userId}), (space:Space {id: $spaceId})
      RETURN EXISTS {
        MATCH (owner)-[:OWNS]->(space)
      } as isOwner
      `,
      { userId, spaceId }
    )
  )

  if (result.records.length === 0) {
    return false
  }

  return result.records[0].get('isOwner')
}
