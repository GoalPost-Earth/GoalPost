'use client'

import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { GET_SPACE_DETAILS } from '@/app/graphql/queries/SPACE_DETAILS_QUERIES'
import {
  UPDATE_ME_SPACE_MUTATION,
  UPDATE_WE_SPACE_MUTATION,
  DELETE_ME_SPACE_MUTATION,
  DELETE_WE_SPACE_MUTATION,
  UPDATE_SPACE_MEMBER_ROLE_MUTATION,
  REMOVE_SPACE_MEMBER_MUTATION,
  LOG_MEMBER_ACTIVITY,
  LOG_SPACE_ACTIVITY,
} from '@/app/graphql/mutations'
import { useApp } from '@/contexts'
import { SpaceDetailsHeader } from './space-details-header'
import { SpaceDetailsSections } from './space-details-sections'
import { SpaceDetailsActions } from './space-details-actions'
import { SpaceFieldModals } from './space-field-modals'

interface SpaceDetailsViewProps {
  spaceId: string
  /** Pre-fetched space data from parent — when provided, skips its own query */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spaceData?: any
  /** Refetch callback from the parent query */
  onRefetch?: () => Promise<unknown>
  /** Optional route builder for opening a field context from the details view */
  getContextHref?: (contextId: string) => string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPermissionMembers(members: any[]) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    members?.map((membership: any) => {
      const memberData = membership.member?.[0]
      return {
        id: membership.id,
        role: membership.role,
        member: {
          __typename: memberData?.__typename || 'Person',
          id: memberData?.id || '',
          name:
            memberData?.name ||
            `${memberData?.firstName || ''} ${memberData?.lastName || ''}`.trim(),
          email: memberData?.privateProfile?.email ?? null,
        },
      }
    }) || []
  )
}

export function SpaceDetailsView({
  spaceId,
  spaceData,
  onRefetch,
  getContextHref,
}: SpaceDetailsViewProps) {
  const router = useRouter()
  const { user } = useApp()

  const [isEditMode, setIsEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isMemberActionLoading, setIsMemberActionLoading] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showCreateFieldModal, setShowCreateFieldModal] = useState(false)
  const [showEditFieldModal, setShowEditFieldModal] = useState(false)
  const [showMemberDeleteConfirm, setShowMemberDeleteConfirm] = useState(false)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  // Only fetch if no spaceData was provided from parent
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch: queryRefetch,
  } = useQuery(GET_SPACE_DETAILS, {
    variables: { spaceId },
    skip: !spaceId || !!spaceData,
  })

  const loading = spaceData ? false : queryLoading
  const error = spaceData ? null : queryError
  const refetchFn = async () => {
    if (onRefetch) await onRefetch()
    else await queryRefetch()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const space = spaceData ?? (data?.spaces?.[0] as any)

  const [updateMeSpace] = useMutation(UPDATE_ME_SPACE_MUTATION)
  const [updateWeSpace] = useMutation(UPDATE_WE_SPACE_MUTATION)
  const [deleteMeSpace] = useMutation(DELETE_ME_SPACE_MUTATION)
  const [deleteWeSpace] = useMutation(DELETE_WE_SPACE_MUTATION)
  const [updateSpaceMemberRole] = useMutation(UPDATE_SPACE_MEMBER_ROLE_MUTATION)
  const [removeSpaceMember] = useMutation(REMOVE_SPACE_MEMBER_MUTATION)
  const [logMemberActivity] = useMutation(LOG_MEMBER_ACTIVITY)
  const [logSpaceActivity] = useMutation(LOG_SPACE_ACTIVITY)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const owner = space?.owner?.[0] as any
  const members = space?.members || []
  const contexts = space?.contexts || []
  const isOwner = owner?.id === user?.id
  const currentUserMembership = members.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (membership: any) => membership.member?.[0]?.id === user?.id
  )
  const isAdmin = currentUserMembership?.role === 'ADMIN'
  const canManageMembers = isOwner || isAdmin
  const permissionMembers = extractPermissionMembers(members)

  const totalPulses = contexts.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, ctx: any) => sum + (ctx.pulses?.length || 0),
    0
  )

  const handleEditStart = () => {
    setEditName(space?.name || '')
    setIsEditMode(true)
  }

  const handleEditCancel = () => {
    setIsEditMode(false)
    setEditName('')
  }

  const handleEditSave = async () => {
    try {
      setIsEditLoading(true)
      const updateInput: Record<string, string | undefined> = {}
      if (editName) updateInput.name_SET = editName
      const where = { id_EQ: spaceId }

      switch (space?.__typename) {
        case 'MeSpace':
          await updateMeSpace({
            variables: { where, update: updateInput },
            refetchQueries: ['GetSpaceDetails'],
          })
          break
        case 'WeSpace':
          await updateWeSpace({
            variables: { where, update: updateInput },
            refetchQueries: ['GetSpaceDetails'],
          })
          break
      }

      logSpaceActivity({
        variables: {
          input: {
            action: 'updated',
            spaceId,
            spaceType: space.__typename,
            spaceName: editName || space.name,
          },
        },
      }).catch((err) => console.warn('Failed to log space update:', err))

      setIsEditMode(false)
      setEditName('')
    } catch (err) {
      console.error('Failed to update space:', err)
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (!space) return
      if (contexts && contexts.length > 0) {
        toast.error(
          `Cannot delete a space with ${contexts.length} field context${contexts.length !== 1 ? 's' : ''}. Please delete all field contexts first.`
        )
        setShowDeleteConfirm(false)
        return
      }

      setIsDeleteLoading(true)
      const where = { id_EQ: spaceId }

      switch (space.__typename) {
        case 'MeSpace':
          await deleteMeSpace({ variables: { where } })
          break
        case 'WeSpace':
          await deleteWeSpace({ variables: { where } })
          break
      }

      logSpaceActivity({
        variables: {
          input: {
            action: 'deleted',
            spaceId,
            spaceType: space.__typename,
            spaceName: space.name,
          },
        },
      }).catch((err) => console.warn('Failed to log space deletion:', err))

      toast.success('Space deleted successfully')
      router.push('/protected')
    } catch (err) {
      console.error('Failed to delete space:', err)
      toast.error('Failed to delete space. Please try again.')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  const handleChangeMemberRole = async (
    memberId: string,
    newRole: 'ADMIN' | 'MEMBER' | 'GUEST'
  ) => {
    if (!canManageMembers) {
      toast.error('Only space owners and admins can edit member roles')
      return
    }
    setIsMemberActionLoading(true)
    try {
      await updateSpaceMemberRole({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variables: { spaceId, memberId, role: newRole as any },
      })
      const member = permissionMembers.find(
        (item: (typeof permissionMembers)[number]) =>
          item.member.id === memberId
      )
      logMemberActivity({
        variables: {
          input: {
            action: 'role_changed',
            spaceId,
            spaceName: space.name,
            memberId,
            memberName: member?.member.name || 'Unknown',
            role: newRole,
            previousRole: member?.role,
          },
        },
      }).catch((err) => console.warn('Failed to log role change:', err))
      toast.success('Member role updated')
      await refetchFn()
    } catch (err) {
      console.error('Failed to update member role:', err)
      toast.error('Failed to update member role')
    } finally {
      setIsMemberActionLoading(false)
    }
  }

  const handleRemoveMemberClick = (memberId: string, memberName: string) => {
    if (!canManageMembers) {
      toast.error('Only space owners and admins can remove members')
      return
    }
    setMemberToDelete({ id: memberId, name: memberName })
    setShowMemberDeleteConfirm(true)
  }

  const confirmRemoveMember = async () => {
    if (!memberToDelete) return
    setIsMemberActionLoading(true)
    try {
      await removeSpaceMember({
        variables: { spaceId, memberId: memberToDelete.id },
      })
      const member = permissionMembers.find(
        (item: (typeof permissionMembers)[number]) =>
          item.member.id === memberToDelete.id
      )
      logMemberActivity({
        variables: {
          input: {
            action: 'removed',
            spaceId,
            spaceName: space.name,
            memberId: memberToDelete.id,
            memberName: member?.member.name || memberToDelete.name,
            role: member?.role || 'GUEST',
          },
        },
      }).catch((err) => console.warn('Failed to log member removal:', err))
      toast.success('Member removed')
      setShowMemberDeleteConfirm(false)
      setMemberToDelete(null)
      await refetchFn()
    } catch (err) {
      console.error('Failed to remove member:', err)
      toast.error('Failed to remove member')
    } finally {
      setIsMemberActionLoading(false)
    }
  }

  const handleEditFieldClick = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation()
    setEditingFieldId(fieldId)
    setShowEditFieldModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span
            className="material-symbols-outlined text-5xl text-gp-primary motion-safe:animate-spin"
          >
            hourglass_bottom
          </span>
          <p className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (error || !space) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500">Error loading space</div>
      </div>
    )
  }

  return (
    <>
      <SpaceDetailsHeader space={space} />

      <SpaceDetailsSections
        space={space}
        owner={owner}
        members={members}
        contexts={contexts}
        totalPulses={totalPulses}
        canManageMembers={canManageMembers}
        isMemberActionLoading={isMemberActionLoading}
        permissionMembers={permissionMembers}
        onCreateField={() => setShowCreateFieldModal(true)}
        onEditField={handleEditFieldClick}
        onShowPermissions={() => setShowPermissionsModal(true)}
        onChangeMemberRole={handleChangeMemberRole}
        onRemoveMember={handleRemoveMemberClick}
        getContextHref={getContextHref}
      />

      <SpaceDetailsActions
        space={space}
        loading={loading}
        isEditMode={isEditMode}
        editName={editName}
        isEditLoading={isEditLoading}
        showDeleteConfirm={showDeleteConfirm}
        isDeleteLoading={isDeleteLoading}
        contexts={contexts}
        showMemberDeleteConfirm={showMemberDeleteConfirm}
        memberToDelete={memberToDelete}
        isMemberActionLoading={isMemberActionLoading}
        onEditStart={handleEditStart}
        onEditCancel={handleEditCancel}
        onEditSave={handleEditSave}
        onEditNameChange={setEditName}
        onDelete={handleDelete}
        onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
        onHideDeleteConfirm={() => setShowDeleteConfirm(false)}
        onHideMemberDeleteConfirm={() => {
          setShowMemberDeleteConfirm(false)
          setMemberToDelete(null)
        }}
        onConfirmRemoveMember={confirmRemoveMember}
      />

      <SpaceFieldModals
        spaceId={spaceId}
        space={space}
        contexts={contexts}
        canManageMembers={canManageMembers}
        permissionMembers={permissionMembers}
        showCreateFieldModal={showCreateFieldModal}
        showEditFieldModal={showEditFieldModal}
        editingFieldId={editingFieldId}
        showPermissionsModal={showPermissionsModal}
        onCloseCreate={() => setShowCreateFieldModal(false)}
        onCloseEdit={() => {
          setShowEditFieldModal(false)
          setEditingFieldId(null)
        }}
        onClosePermissions={() => setShowPermissionsModal(false)}
        onRefetch={refetchFn}
      />
    </>
  )
}
