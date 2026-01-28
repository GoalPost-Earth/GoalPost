import { Context } from '@/config/types'
import { generateId } from '@/utils/id-generator'
import {
  canManageMembers,
  memberExistsInSpace,
  isSpaceOwner,
  SpaceRole,
} from '@/lib/permissions/space-permissions'

interface AddSpaceMemberInput {
  spaceId: string
  memberId: string
  role: SpaceRole
}

interface UpdateSpaceMemberRoleInput {
  spaceId: string
  memberId: string
  role: SpaceRole
}

interface RemoveSpaceMemberInput {
  spaceId: string
  memberId: string
}

interface MutationResponse {
  success: boolean
  message: string
}

interface SpaceMemberObject {
  __typename: 'Person' | 'Community'
  id: string
  name: string
  email?: string
}

interface MembershipObject {
  id: string
  role: SpaceRole
  addedAt: string
  member: SpaceMemberObject[]
}

interface AddSpaceMemberResponse extends MutationResponse {
  membership?: MembershipObject
}

interface UpdateSpaceMemberRoleResponse extends MutationResponse {
  membership?: MembershipObject
}

type RemoveSpaceMemberResponse = MutationResponse

export const spaceMembershipResolvers = {
  /**
   * Add a new member to a space with a specific role.
   * Only space owners and members with ADMIN role can add members.
   */
  addSpaceMember: async (
    _parent: never,
    args: AddSpaceMemberInput,
    context: Context
  ): Promise<AddSpaceMemberResponse> => {
    const currentUserId = context.jwt?.user.id
    const { spaceId, memberId, role } = args

    // Validate authentication
    if (!currentUserId) {
      return {
        success: false,
        message: 'Authentication required. Please log in.',
      }
    }

    const session = context.executionContext.session()

    try {
      // Check if current user has permission to manage members
      const hasPermission = await canManageMembers(
        session,
        currentUserId,
        spaceId
      )
      if (!hasPermission) {
        return {
          success: false,
          message:
            'Only space owners and ADMIN members can add new members to this space.',
        }
      }

      // Check if member already exists in space
      const alreadyExists = await memberExistsInSpace(
        session,
        memberId,
        spaceId
      )
      if (alreadyExists) {
        return {
          success: false,
          message: 'This member is already part of the space.',
        }
      }

      // Create the SpaceMembership node
      const membershipId = generateId()
      const addedAt = new Date().toISOString()

      const result = await session.executeWrite((tx) =>
        tx.run(
          `
          MATCH (space:Space {id: $spaceId}), (member:LifeSensor {id: $memberId})
          CREATE (sm:SpaceMembership {
            id: $membershipId,
            role: $role,
            addedAt: datetime($addedAt)
          })
          CREATE (space)-[:HAS_MEMBER]->(sm)-[:IS_MEMBER]->(member)
          RETURN 
            sm.id as id, 
            sm.role as role, 
            sm.addedAt as addedAt,
            member.id as memberId,
            member.name as memberName,
            member.email as memberEmail,
            labels(member) as memberLabels
          `,
          {
            spaceId,
            memberId,
            membershipId,
            role,
            addedAt,
          }
        )
      )

      if (result.records.length === 0) {
        return {
          success: false,
          message:
            'Failed to create space membership. Space or member not found.',
        }
      }

      const record = result.records[0]
      const memberLabels = record.get('memberLabels')
      const isPersonType = memberLabels.includes('Person')

      return {
        success: true,
        message: `Successfully added member with ${role} role to space.`,
        membership: {
          id: record.get('id'),
          role: record.get('role'),
          addedAt: record.get('addedAt').toString(),
          member: [
            {
              __typename: isPersonType ? 'Person' : 'Community',
              id: record.get('memberId'),
              name: record.get('memberName'),
              email: record.get('memberEmail'),
            },
          ],
        },
      }
    } catch (error) {
      console.error('❌ Error adding space member:', error)
      return {
        success: false,
        message: 'An error occurred while adding the member to the space.',
      }
    } finally {
      await session.close()
    }
  },

  /**
   * Update a space member's role.
   * Only space owners and members with ADMIN role can change roles.
   */
  updateSpaceMemberRole: async (
    _parent: never,
    args: UpdateSpaceMemberRoleInput,
    context: Context
  ): Promise<UpdateSpaceMemberRoleResponse> => {
    const currentUserId = context.jwt?.user.id
    const { spaceId, memberId, role } = args

    // Validate authentication
    if (!currentUserId) {
      return {
        success: false,
        message: 'Authentication required. Please log in.',
      }
    }

    const session = context.executionContext.session()

    try {
      // Check if current user has permission to manage members
      const hasPermission = await canManageMembers(
        session,
        currentUserId,
        spaceId
      )
      if (!hasPermission) {
        return {
          success: false,
          message:
            'Only space owners and ADMIN members can change member roles.',
        }
      }

      // Check if member exists in space
      const exists = await memberExistsInSpace(session, memberId, spaceId)
      if (!exists) {
        return {
          success: false,
          message: 'This member is not part of the space.',
        }
      }

      // Prevent changing owner's role (if they're trying to change owner via SpaceMembership, which shouldn't exist)
      const isOwner = await isSpaceOwner(session, memberId, spaceId)
      if (isOwner) {
        return {
          success: false,
          message: 'Cannot change the role of the space owner.',
        }
      }

      // Update the role
      const result = await session.executeWrite((tx) =>
        tx.run(
          `
          MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member:LifeSensor {id: $memberId})
          SET sm.role = $role
          RETURN 
            sm.id as id, 
            sm.role as role, 
            sm.addedAt as addedAt,
            member.id as memberId,
            member.name as memberName,
            member.email as memberEmail,
            labels(member) as memberLabels
          `,
          { spaceId, memberId, role }
        )
      )

      if (result.records.length === 0) {
        return {
          success: false,
          message: 'Failed to update member role.',
        }
      }

      const record = result.records[0]
      const memberLabels = record.get('memberLabels')
      const isPersonType = memberLabels.includes('Person')

      return {
        success: true,
        message: `Successfully updated member role to ${role}.`,
        membership: {
          id: record.get('id'),
          role: record.get('role'),
          addedAt: record.get('addedAt').toString(),
          member: [
            {
              __typename: isPersonType ? 'Person' : 'Community',
              id: record.get('memberId'),
              name: record.get('memberName'),
              email: record.get('memberEmail'),
            },
          ],
        },
      }
    } catch (error) {
      console.error('❌ Error updating space member role:', error)
      return {
        success: false,
        message: 'An error occurred while updating the member role.',
      }
    } finally {
      await session.close()
    }
  },

  /**
   * Remove a member from a space.
   * Only space owners and members with ADMIN role can remove members.
   * Cannot remove the space owner.
   */
  removeSpaceMember: async (
    _parent: never,
    args: RemoveSpaceMemberInput,
    context: Context
  ): Promise<RemoveSpaceMemberResponse> => {
    const currentUserId = context.jwt?.user.id
    const { spaceId, memberId } = args

    // Validate authentication
    if (!currentUserId) {
      return {
        success: false,
        message: 'Authentication required. Please log in.',
      }
    }

    const session = context.executionContext.session()

    try {
      // Check if current user has permission to manage members
      const hasPermission = await canManageMembers(
        session,
        currentUserId,
        spaceId
      )
      if (!hasPermission) {
        return {
          success: false,
          message:
            'Only space owners and ADMIN members can remove members from this space.',
        }
      }

      // Prevent removing the space owner
      const isOwner = await isSpaceOwner(session, memberId, spaceId)
      if (isOwner) {
        return {
          success: false,
          message: 'Cannot remove the space owner from the space.',
        }
      }

      // Check if member exists in space
      const exists = await memberExistsInSpace(session, memberId, spaceId)
      if (!exists) {
        return {
          success: false,
          message: 'This member is not part of the space.',
        }
      }

      // Delete the SpaceMembership node and relationships
      const result = await session.executeWrite((tx) =>
        tx.run(
          `
          MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member:LifeSensor {id: $memberId})
          DETACH DELETE sm
          RETURN COUNT(*) as deleted
          `,
          { spaceId, memberId }
        )
      )

      if (
        result.records.length === 0 ||
        result.records[0].get('deleted') === 0
      ) {
        return {
          success: false,
          message: 'Failed to remove member from space.',
        }
      }

      return {
        success: true,
        message: 'Successfully removed member from space.',
      }
    } catch (error) {
      console.error('❌ Error removing space member:', error)
      return {
        success: false,
        message: 'An error occurred while removing the member from the space.',
      }
    } finally {
      await session.close()
    }
  },
}
