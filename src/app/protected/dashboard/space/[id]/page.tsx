'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useCreateField } from '@/hooks'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { CreateFieldModal } from '@/components/canvas/create-field-modal'
import { SpacePermissionsModal, SpaceViewToggle } from '@/components/spaces'
import type { SpaceViewMode } from '@/components/spaces'
import { OfferingModal } from '@/components/ui/offering-modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GET_SPACE_DETAILS } from '@/app/graphql/queries/SPACE_DETAILS_QUERIES'
import {
  UPDATE_ME_SPACE_MUTATION,
  UPDATE_WE_SPACE_MUTATION,
  DELETE_ME_SPACE_MUTATION,
  DELETE_WE_SPACE_MUTATION,
  UPDATE_SPACE_MEMBER_ROLE_MUTATION,
  REMOVE_SPACE_MEMBER_MUTATION,
  LOG_FIELD_ACTIVITY,
  LOG_MEMBER_ACTIVITY,
  LOG_SPACE_ACTIVITY,
} from '@/app/graphql/mutations'
import { cn } from '@/lib/utils'
import { useAnimations, useApp, usePageContext } from '@/contexts'

export default function SpaceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const spaceId = params?.id as string
  const { animationsEnabled } = useAnimations()
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

  const { user } = useApp()
  const { setPageTitle } = usePageContext()
  const { createField, loading: isCreatingField } = useCreateField()

  // Set page title
  useEffect(() => {
    setPageTitle('Dashboard')
  }, [setPageTitle])

  const { data, loading, error, refetch } = useQuery(GET_SPACE_DETAILS, {
    variables: { spaceId },
    skip: !spaceId,
  })

  // Setup mutations for different space types
  const [updateMeSpace] = useMutation(UPDATE_ME_SPACE_MUTATION)
  const [updateWeSpace] = useMutation(UPDATE_WE_SPACE_MUTATION)
  const [deleteMeSpace] = useMutation(DELETE_ME_SPACE_MUTATION)
  const [deleteWeSpace] = useMutation(DELETE_WE_SPACE_MUTATION)
  const [updateSpaceMemberRole] = useMutation(UPDATE_SPACE_MEMBER_ROLE_MUTATION)
  const [removeSpaceMember] = useMutation(REMOVE_SPACE_MEMBER_MUTATION)
  const [logFieldActivity] = useMutation(LOG_FIELD_ACTIVITY)
  const [logMemberActivity] = useMutation(LOG_MEMBER_ACTIVITY)
  const [logSpaceActivity] = useMutation(LOG_SPACE_ACTIVITY)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const space = data?.spaces?.[0] as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const owner = space?.owner?.[0] as any
  const members = space?.members || []
  const contexts = space?.contexts || []

  // Navigate to graph view for this space
  const handleViewChange = useCallback(
    (view: SpaceViewMode) => {
      if (view === 'graph' && space) {
        const spaceType =
          space.__typename === 'WeSpace' ? 'we-space' : 'me-space'
        router.push(`/protected/spaces/${spaceType}/${spaceId}`)
      }
    },
    [router, spaceId, space]
  )
  const isOwner = owner?.id === user?.id
  const currentUserMembership = members.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (membership: any) => membership.member?.[0]?.id === user?.id
  )
  const isAdmin = currentUserMembership?.role === 'ADMIN'
  const canManageMembers = isOwner || isAdmin

  const permissionMembers =
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
          email: memberData?.email ?? null,
        },
      }
    }) || []

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

      // Log the space update activity
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

      // Check if space has any contexts (field contexts)
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

      // Log the space deletion activity
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
      router.push('/protected/dashboard')
    } catch (err) {
      console.error('Failed to delete space:', err)
      toast.error('Failed to delete space. Please try again.')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  const handleCreateField = async (description: string, name?: string) => {
    if (!spaceId || !space?.__typename) {
      console.error('Space information not available')
      return
    }

    const spaceType =
      space.__typename === 'MeSpace'
        ? 'meSpace'
        : space.__typename === 'WeSpace'
          ? 'weSpace'
          : null

    if (!spaceType) {
      console.error('Unsupported space type for field creation')
      return
    }

    try {
      const title = name || description
      const createdField = await createField(
        title,
        spaceId,
        spaceType,
        description
      )

      if (createdField?.id) {
        await logFieldActivity({
          variables: {
            input: {
              action: 'created',
              fieldId: createdField.id,
              fieldName: title,
              contextId: createdField.id,
              spaceName: space.name,
            },
          },
        })
          .then(() => toast.info('Field creation logged'))
          .catch((err) => {
            console.error('Failed to log field creation:', err)
            toast.error('Failed to log field creation')
          })
      }

      setShowCreateFieldModal(false)
      await refetch()
    } catch (err) {
      console.error('Error creating field:', err)
      toast.error('Failed to create field context')
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
        variables: {
          spaceId,
          memberId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: newRole as any,
        },
      })

      const member = permissionMembers.find(
        (item: (typeof permissionMembers)[number]) =>
          item.member.id === memberId
      )
      const previousRole = member?.role

      logMemberActivity({
        variables: {
          input: {
            action: 'role_changed',
            spaceId,
            spaceName: space.name,
            memberId,
            memberName: member?.member.name || 'Unknown',
            role: newRole,
            previousRole,
          },
        },
      }).catch((err) => console.warn('Failed to log role change:', err))

      toast.success('Member role updated')
      await refetch()
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
        variables: {
          spaceId,
          memberId: memberToDelete.id,
        },
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
      await refetch()
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
      <div className="absolute inset-0 flex items-center justify-center z-50 bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <span
            className={cn(
              'material-symbols-outlined text-5xl text-gp-primary',
              animationsEnabled && 'animate-spin'
            )}
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
      <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors flex items-center justify-center">
        <div className="text-red-500">Error loading space</div>
      </div>
    )
  }

  const createdDate = new Date(space.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const totalPulses = contexts.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, ctx: any) => sum + (ctx.pulses?.length || 0),
    0
  )

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20">
      <ProfileBackground />

      {/* Edit Modal */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 border border-gp-glass-border">
            <button
              onClick={handleEditCancel}
              className="absolute top-4 right-4 text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-semibold text-gp-ink-strong dark:text-white mb-6">
              Edit {space.__typename}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                  Space Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                  placeholder="Space name"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleEditCancel}
                  disabled={isEditLoading}
                  className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={isEditLoading}
                  className="px-6 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isEditLoading && (
                    <span
                      className={cn(
                        'material-symbols-outlined text-base',
                        animationsEnabled && 'animate-spin'
                      )}
                    >
                      hourglass_bottom
                    </span>
                  )}
                  {isEditLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border border-gp-glass-border">
            <h2 className="text-2xl font-semibold text-gp-ink-strong dark:text-white mb-3">
              Delete {space.__typename}?
            </h2>

            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft mb-3">
              {contexts && contexts.length > 0 ? (
                <>
                  <span className="font-medium text-orange-500 dark:text-orange-400">
                    This space cannot be deleted
                  </span>
                  <span>
                    {' '}
                    because it has {contexts.length} field context
                    {contexts.length !== 1 ? 's' : ''}.
                  </span>
                  <br />
                  <span className="text-xs mt-2 block">
                    Please delete all field contexts within this space first.
                  </span>
                </>
              ) : (
                'Are you sure you want to delete this space? This action cannot be undone.'
              )}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleteLoading || loading}
                className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contexts && contexts.length > 0 ? 'Close' : 'Cancel'}
              </button>
              {(!contexts || contexts.length === 0) && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleteLoading || loading}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleteLoading && (
                    <span
                      className={cn(
                        'material-symbols-outlined text-base',
                        animationsEnabled && 'animate-spin'
                      )}
                    >
                      hourglass_bottom
                    </span>
                  )}
                  {isDeleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <main className="relative">
        <ProfileLayout>
          {/* View Toggle */}
          <div className="flex justify-end mb-6">
            <SpaceViewToggle
              activeView="details"
              onViewChange={handleViewChange}
            />
          </div>

          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-[9px] uppercase font-semibold text-gp-primary mb-2">
              {space.__typename}
            </span>
            <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
              {space.name}
            </h1>
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
              Created {createdDate}
            </p>
          </div>

          {/* Grid Layout - Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Space Info Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="info" title="Space Info" />
              <ProfileCard>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Type
                    </span>
                    <p className="text-xs font-semibold text-gp-ink-strong dark:text-white">
                      {space.__typename}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Visibility
                    </span>
                    <p className="text-xs text-gp-ink-strong dark:text-white capitalize">
                      {space.visibility}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Created
                    </span>
                    <p className="text-xs text-gp-ink-strong dark:text-white">
                      {createdDate}
                    </p>
                  </div>
                </div>
              </ProfileCard>
            </div>

            {/* Owner Info Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="person" title="Owner" />
              <ProfileCard>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Type
                    </span>
                    <p className="text-xs text-gp-ink-strong dark:text-white">
                      {owner?.__typename}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Name
                    </span>
                    <p className="text-xs font-semibold text-gp-ink-strong dark:text-white">
                      {owner?.name}
                    </p>
                  </div>
                  {owner?.__typename === 'Person' && owner?.email && (
                    <div>
                      <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                        Email
                      </span>
                      <p className="text-xs text-gp-ink-soft dark:text-gp-ink-soft truncate">
                        {owner.email}
                      </p>
                    </div>
                  )}
                </div>
              </ProfileCard>
            </div>

            {/* Members Section - Only show for WeSpace */}
            {space.__typename === 'WeSpace' && (
              <div className="flex flex-col gap-4 md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <SectionHeader icon="group" title="Members" />
                  {canManageMembers && (
                    <button
                      onClick={() => setShowPermissionsModal(true)}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-white/80 dark:hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        person_add
                      </span>
                      Add Member
                    </button>
                  )}
                </div>
                <ProfileCard>
                  <div className="space-y-3">
                    {members.length > 0 ? (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      members.map((membership: any, idx: number) => {
                        const memberData = membership.member?.[0]
                        if (!memberData) return null
                        return (
                          <div
                            key={membership.id}
                            onClick={() =>
                              memberData.id &&
                              router.push(
                                `/protected/dashboard/persons/${memberData.id}`
                              )
                            }
                            className={
                              idx > 0
                                ? 'border-t border-gp-glass-border p-4 cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded-2xl px-2 -mx-2'
                                : 'cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded p-4 -mx-2'
                            }
                          >
                            <div className="flex justify-between items-start mb-1 gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[9px] uppercase font-semibold text-gp-accent-glow">
                                    {memberData.__typename}
                                  </span>
                                  {!canManageMembers && (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-semibold dark:bg-white/10 dark:border-white/10 dark:text-white/60">
                                      {membership.role}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                                  {memberData.name}
                                </h4>
                                {memberData.__typename === 'Person' &&
                                  memberData.email && (
                                    <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                                      {memberData.email}
                                    </p>
                                  )}
                              </div>
                              {canManageMembers && (
                                <div
                                  className="flex min-w-36 flex-col items-stretch gap-2 sm:items-end"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Select
                                    value={membership.role}
                                    onValueChange={(value) =>
                                      handleChangeMemberRole(
                                        memberData.id,
                                        value as 'ADMIN' | 'MEMBER' | 'GUEST'
                                      )
                                    }
                                    disabled={isMemberActionLoading}
                                  >
                                    <SelectTrigger
                                      className={cn(
                                        'w-full text-xs sm:text-sm',
                                        membership.role === 'ADMIN'
                                          ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                                          : membership.role === 'MEMBER'
                                            ? 'bg-gp-goal/10 border-gp-goal text-gp-goal'
                                            : 'bg-gp-primary/10 border-gp-primary text-gp-primary'
                                      )}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-100">
                                      <SelectItem value="GUEST">
                                        Guest (View)
                                      </SelectItem>
                                      <SelectItem value="MEMBER">
                                        Member (Edit)
                                      </SelectItem>
                                      <SelectItem value="ADMIN">
                                        Admin
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <button
                                    onClick={() =>
                                      handleRemoveMemberClick(
                                        memberData.id,
                                        memberData.name
                                      )
                                    }
                                    disabled={isMemberActionLoading}
                                    className="px-2 sm:px-3 py-1 sm:py-2 rounded text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                        No members yet
                      </p>
                    )}
                  </div>
                </ProfileCard>
              </div>
            )}

            {/* Contexts Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <SectionHeader icon="category" title="Field Contexts" />
                <button
                  onClick={() => setShowCreateFieldModal(true)}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-white/80 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    add
                  </span>
                  Add Field Context
                </button>
              </div>
              <ProfileCard>
                <div className="space-y-3">
                  {contexts.length > 0 ? (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    contexts.map((context: any, idx: number) => (
                      <div
                        key={context.id}
                        onClick={() =>
                          context.id &&
                          router.push(
                            `/protected/dashboard/field-context/${context.id}`
                          )
                        }
                        className={
                          idx > 0
                            ? 'border-t border-gp-glass-border pt-3 cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                            : 'cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                        }
                      >
                        <div className="flex justify-between items-start mb-1 p-4 rounded-2xl">
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                              {context.title}
                            </h4>
                            {context.emergentName && (
                              <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft italic">
                                &quot;{context.emergentName}&quot;
                              </p>
                            )}
                          </div>
                          <div
                            className="flex items-start gap-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="pt-2 text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                              {context.pulses?.length || 0} pulses
                            </span>
                            <button
                              onClick={(e) =>
                                handleEditFieldClick(e, context.id)
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/50 text-gp-ink-strong transition-all hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-gp-ink-strong dark:hover:bg-white/10"
                              aria-label={`Edit ${context.title}`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                edit
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                      No contexts yet
                    </p>
                  )}
                </div>
              </ProfileCard>
            </div>

            {/* Summary Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <SectionHeader icon="summarize" title="Summary" />
              <ProfileCard>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                      Total Contexts
                    </span>
                    <span className="text-lg font-bold text-gp-primary">
                      {contexts.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                      Total Pulses
                    </span>
                    <span className="text-lg font-bold text-gp-primary">
                      {totalPulses}
                    </span>
                  </div>
                  {space.__typename === 'WeSpace' && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                        Members
                      </span>
                      <span className="text-lg font-bold text-gp-primary">
                        {members.length}
                      </span>
                    </div>
                  )}
                </div>
              </ProfileCard>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 w-full">
            <button
              onClick={handleEditStart}
              className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                edit
              </span>
              Edit Space
            </button>
            {space.__typename === 'WeSpace' && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="px-8 py-3 rounded-full bg-red-500/20 dark:bg-red-500/10 border border-red-500/50 dark:border-red-500/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-500/30 dark:hover:bg-red-500/20 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">
                  delete
                </span>
                {loading ? 'Checking...' : 'Delete Space'}
              </button>
            )}
          </div>
        </ProfileLayout>
      </main>

      {showCreateFieldModal && (
        <CreateFieldModal
          isOpen={showCreateFieldModal}
          onClose={() => setShowCreateFieldModal(false)}
          onCreateField={handleCreateField}
          isLoading={isCreatingField}
        />
      )}

      {showEditFieldModal && editingFieldId && (
        <CreateFieldModal
          isOpen={showEditFieldModal}
          onClose={() => {
            setShowEditFieldModal(false)
            setEditingFieldId(null)
          }}
          isEditing={true}
          fieldId={editingFieldId}
          initialName={
            contexts.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (context: any) => context.id === editingFieldId
            )?.title || ''
          }
          initialDescription={
            contexts.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (context: any) => context.id === editingFieldId
            )?.emergentName || ''
          }
          onEditSuccess={async () => {
            const editingField = contexts.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (context: any) => context.id === editingFieldId
            )

            if (editingField?.title && editingFieldId) {
              await logFieldActivity({
                variables: {
                  input: {
                    action: 'updated',
                    fieldId: editingFieldId,
                    fieldName: editingField.title,
                    contextId: editingFieldId,
                    spaceName: space.name,
                  },
                },
              })
                .then(() => toast.info('Field update logged'))
                .catch((err) => {
                  console.error('Failed to log field update:', err)
                  toast.error('Failed to log field update')
                })
            }

            setShowEditFieldModal(false)
            setEditingFieldId(null)
            await refetch()
          }}
          onDeleteSuccess={async () => {
            const editingField = contexts.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (context: any) => context.id === editingFieldId
            )

            if (editingField?.title && editingFieldId) {
              await logFieldActivity({
                variables: {
                  input: {
                    action: 'deleted',
                    fieldId: editingFieldId,
                    fieldName: editingField.title,
                    contextId: editingFieldId,
                    spaceName: space.name,
                  },
                },
              })
                .then(() => toast.info('Field deletion logged'))
                .catch((err) => {
                  console.error('Failed to log field deletion:', err)
                  toast.error('Failed to log field deletion')
                })
            }

            setShowEditFieldModal(false)
            setEditingFieldId(null)
            await refetch()
          }}
        />
      )}

      {space.__typename === 'WeSpace' && canManageMembers && (
        <SpacePermissionsModal
          isOpen={showPermissionsModal}
          onClose={() => setShowPermissionsModal(false)}
          spaceId={spaceId}
          spaceName={space.name}
          members={permissionMembers}
          onRefetch={async () => {
            await refetch()
          }}
        />
      )}

      <OfferingModal
        isOpen={showMemberDeleteConfirm}
        onClose={() => {
          setShowMemberDeleteConfirm(false)
          setMemberToDelete(null)
        }}
        position="center"
      >
        <div className="relative z-10 w-full">
          <div className="glass-panel rounded-3xl p-8 md:p-12 border border-gp-glass-border dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl" />
                <div className="size-16 rounded-full bg-linear-to-br from-red-100 to-red-50 dark:from-red-500/20 dark:to-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center justify-center backdrop-blur-xl shadow-md dark:shadow-inner">
                  <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">
                    person_remove
                  </span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-light dark:font-extralight text-gp-ink-strong dark:text-white mb-2 tracking-tight leading-tight">
                Remove Member
              </h2>
              <p className="text-base text-gp-ink-muted dark:text-gp-ink-soft mb-8 max-w-md">
                Are you sure you want to remove{' '}
                <span className="font-medium text-gp-ink-strong dark:text-white">
                  {memberToDelete?.name}
                </span>{' '}
                from <span className="font-medium">{space.name}</span>? This
                action cannot be undone.
              </p>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => {
                    setShowMemberDeleteConfirm(false)
                    setMemberToDelete(null)
                  }}
                  disabled={isMemberActionLoading}
                  className="flex-1 px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-gp-glass-border dark:border-white/10 text-gp-ink-strong dark:text-white text-sm font-medium hover:bg-white dark:hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveMember}
                  disabled={isMemberActionLoading}
                  className="flex-1 px-6 py-3 rounded-2xl bg-red-600 dark:bg-red-500 text-white text-sm font-medium hover:bg-red-700 dark:hover:bg-red-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isMemberActionLoading ? 'Removing...' : 'Remove Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </OfferingModal>
    </div>
  )
}
