'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client/react'
import ReactSelect from 'react-select'
import {
  ADD_SPACE_MEMBER_MUTATION,
  UPDATE_SPACE_MEMBER_ROLE_MUTATION,
  REMOVE_SPACE_MEMBER_MUTATION,
  LOG_MEMBER_ACTIVITY,
} from '@/app/graphql/mutations'
import { SEARCH_PEOPLE_QUERY } from '@/app/graphql/queries/DASHBOARD_QUERIES'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OfferingModal } from '@/components/ui/offering-modal'
import { cn } from '@/lib/utils'

interface PersonSelectOption {
  value: string
  label: string
  email: string
}

interface SpaceMember {
  id: string
  role: 'ADMIN' | 'MEMBER' | 'GUEST'
  addedAt?: string | Date
  member: {
    __typename: string
    id: string
    name: string
    email?: string
  }
}

interface SpacePermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  spaceId: string
  spaceName: string
  members: SpaceMember[]
  onMembersUpdated?: () => void
  onRefetch?: () => Promise<void>
}

export function SpacePermissionsModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  members,
  onMembersUpdated,
  onRefetch,
}: SpacePermissionsModalProps) {
  const [selectedPeopleOptions, setSelectedPeopleOptions] = useState<
    PersonSelectOption[]
  >([])
  const [searchInput, setSearchInput] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<
    'ADMIN' | 'MEMBER' | 'GUEST'
  >('GUEST')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const [searchPeople, { data: searchData }] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useLazyQuery<any>(SEARCH_PEOPLE_QUERY)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addSpaceMember] = useMutation<any>(ADD_SPACE_MEMBER_MUTATION)

  const [updateSpaceMemberRole] = useMutation(
    UPDATE_SPACE_MEMBER_ROLE_MUTATION,
    {
      onCompleted: async (data) => {
        if (data?.updateSpaceMemberRole?.success) {
          onMembersUpdated?.()
          await onRefetch?.()
        } else {
          setError(
            data?.updateSpaceMemberRole?.message || 'Failed to update role'
          )
        }
        setLoading(false)
      },
      onError: (err) => {
        setError(err.message)
        setLoading(false)
      },
    }
  )

  const [removeSpaceMember] = useMutation(REMOVE_SPACE_MEMBER_MUTATION, {
    onCompleted: async (data) => {
      if (data?.removeSpaceMember?.success) {
        onMembersUpdated?.()
        await onRefetch?.()
      } else {
        setError(data?.removeSpaceMember?.message || 'Failed to remove member')
      }
      setLoading(false)
    },
    onError: (err) => {
      setError(err.message)
      setLoading(false)
    },
  })

  const [logMemberActivity] = useMutation(LOG_MEMBER_ACTIVITY)

  useEffect(() => {
    setSearchResults(searchData?.people || [])
  }, [searchData])

  const existingMemberIds = useMemo(
    () => new Set(members.map((member) => member.member.id)),
    [members]
  )

  const personOptions: PersonSelectOption[] = useMemo(
    () =>
      searchResults
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((person: any) => !existingMemberIds.has(person.id))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((person: any) => ({
          value: person.id,
          label: person.name,
          email: person.email,
        })),
    [searchResults, existingMemberIds]
  )

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (value.trim().length >= 2) {
      searchPeople({ variables: { nameContains: value } })
      return
    }
    setSearchResults([])
  }

  const handleAddMember = async () => {
    if (selectedPeopleOptions.length === 0) {
      setError('Please search and select at least one member')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const failedAdds: string[] = []
      let addedCount = 0

      for (const person of selectedPeopleOptions) {
        const result = await addSpaceMember({
          variables: {
            spaceId,
            memberId: person.value,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            role: selectedRole as any,
          },
        })

        if (result.data?.addSpaceMember?.success) {
          addedCount += 1

          logMemberActivity({
            variables: {
              input: {
                action: 'added',
                spaceId,
                spaceName,
                memberId: person.value,
                memberName: person.label || person.email || 'Unknown',
                role: selectedRole,
              },
            },
          }).catch((err) => console.warn('Failed to log member addition:', err))
        } else {
          failedAdds.push(
            `${person.label}: ${result.data?.addSpaceMember?.message || 'Failed to add member'}`
          )
        }
      }

      if (addedCount > 0) {
        setSelectedPeopleOptions([])
        setSearchInput('')
        setSearchResults([])
        setSelectedRole('GUEST')
        onMembersUpdated?.()
        await onRefetch?.()
      }

      if (failedAdds.length > 0) {
        const successPrefix =
          addedCount > 0 ? `Added ${addedCount} member(s). ` : ''
        setError(`${successPrefix}${failedAdds.join(' | ')}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async (
    memberId: string,
    newRole: 'ADMIN' | 'MEMBER' | 'GUEST'
  ) => {
    setLoading(true)
    setError(null)

    try {
      await updateSpaceMemberRole({
        variables: {
          spaceId,
          memberId,
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: newRole as any,
        },
      })

      // Find member name from members list
      const member = members.find((m) => m.member.id === memberId)
      const previousRole = member?.role

      // Log role change activity
      logMemberActivity({
        variables: {
          input: {
            action: 'role_changed',
            spaceId,
            spaceName,
            memberId,
            memberName: member?.member.name || 'Unknown',
            role: newRole,
            previousRole,
          },
        },
      }).catch((err) => console.warn('Failed to log role change:', err))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
      setLoading(false)
    }
  }

  const handleRemoveMember = (memberId: string) => {
    const member = members.find((m) => m.member.id === memberId)
    if (!member) return

    setMemberToDelete({
      id: member.member.id,
      name: member.member.name,
    })
    setShowDeleteConfirm(true)
  }

  const confirmRemoveMember = async () => {
    if (!memberToDelete) return

    setLoading(true)
    setError(null)

    try {
      await removeSpaceMember({
        variables: {
          spaceId,
          memberId: memberToDelete.id,
        },
      })

      // Find member details from members list
      const member = members.find((m) => m.member.id === memberToDelete.id)

      // Log member removal activity
      logMemberActivity({
        variables: {
          input: {
            action: 'removed',
            spaceId,
            spaceName,
            memberId: memberToDelete.id,
            memberName: member?.member.name || 'Unknown',
            role: member?.role || 'GUEST',
          },
        },
      }).catch((err) => console.warn('Failed to log member removal:', err))

      // Close modal and reset state
      setShowDeleteConfirm(false)
      setMemberToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-center">
              Add a member to{' '}
              <span className="text-gp-accent-glow">{spaceName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Add Member Section */}
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-gp-glass-bg border border-gp-glass-border">
              <h3 className="font-semibold text-xs sm:text-sm text-gp-ink-strong dark:text-white">
                Add New Member
              </h3>
              <div className="space-y-2">
                <ReactSelect<PersonSelectOption, true>
                  value={selectedPeopleOptions}
                  options={personOptions}
                  isMulti
                  isSearchable
                  isDisabled={loading}
                  placeholder="Search by name or email to add members..."
                  noOptionsMessage={() =>
                    searchInput.trim().length < 2
                      ? 'Type at least 2 characters'
                      : 'No matching people found'
                  }
                  getOptionLabel={(option) =>
                    `${option.label} (${option.email})`
                  }
                  onInputChange={(value, actionMeta) => {
                    if (actionMeta.action === 'input-change') {
                      handleSearchInput(value)
                    }
                  }}
                  onChange={(options) => {
                    setSelectedPeopleOptions(options ? [...options] : [])
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(148, 163, 184, 0.4)',
                      borderRadius: '0.5rem',
                      minHeight: '42px',
                      boxShadow: 'none',
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'var(--gp-surface)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      zIndex: 60,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'transparent',
                      color: 'var(--gp-ink-strong)',
                      cursor: 'pointer',
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: 'var(--gp-ink-strong)',
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'var(--gp-ink-strong)',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'var(--gp-ink-muted)',
                    }),
                  }}
                />
                {selectedPeopleOptions.length > 0 && (
                  <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                    {selectedPeopleOptions.length} member(s) selected
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={selectedRole}
                  onValueChange={(value) =>
                    setSelectedRole(value as 'ADMIN' | 'MEMBER' | 'GUEST')
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-100">
                    <SelectItem value="GUEST">Guest</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  onClick={handleAddMember}
                  disabled={loading}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-gp-primary text-white text-xs sm:text-sm font-medium hover:shadow-lg disabled:opacity-50 transition-all whitespace-nowrap"
                >
                  {loading
                    ? 'Adding...'
                    : `Add ${selectedPeopleOptions.length > 0 ? `(${selectedPeopleOptions.length})` : ''}`}
                </button>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-xs sm:text-sm text-gp-ink-strong dark:text-white">
                Current Members ({members.length})
              </h3>
              {members.length === 0 ? (
                <p className="text-xs sm:text-sm text-gp-ink-muted dark:text-gp-ink-soft py-4 text-center">
                  No members added yet
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gp-glass-bg border border-gp-glass-border hover:border-gp-glass-border/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gp-ink-strong dark:text-white truncate">
                          {member.member.name}
                        </p>
                        {member.member.email && (
                          <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft truncate">
                            {member.member.email}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            handleChangeRole(
                              member.member.id,
                              value as 'ADMIN' | 'MEMBER' | 'GUEST'
                            )
                          }
                          disabled={loading}
                        >
                          <SelectTrigger
                            className={cn(
                              'w-full sm:w-40 text-xs sm:text-sm',
                              member.role === 'ADMIN'
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                                : member.role === 'MEMBER'
                                  ? 'bg-gp-goal/10 border-gp-goal text-gp-goal'
                                  : 'bg-gp-primary/10 border-gp-primary text-gp-primary'
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-100">
                            <SelectItem value="GUEST">Guest (View)</SelectItem>
                            <SelectItem value="MEMBER">
                              Member (Edit)
                            </SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <button
                          onClick={() => handleRemoveMember(member.member.id)}
                          disabled={loading}
                          className="px-2 sm:px-3 py-1 sm:py-2 rounded text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-3 sm:px-4 py-2 rounded-lg bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border text-gp-ink-strong dark:text-white text-xs sm:text-sm font-medium hover:border-gp-glass-border/50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <OfferingModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setMemberToDelete(null)
        }}
        position="center"
      >
        <div className="relative z-10 w-full">
          {/* Modal Content */}
          <div className="glass-panel rounded-3xl p-8 md:p-12 border border-gp-glass-border dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
              {/* Icon */}
              <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl" />
                <div className="size-16 rounded-full bg-linear-to-br from-red-100 to-red-50 dark:from-red-500/20 dark:to-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center justify-center backdrop-blur-xl shadow-md dark:shadow-inner">
                  <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">
                    person_remove
                  </span>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-light dark:font-extralight text-gp-ink-strong dark:text-white mb-2 tracking-tight leading-tight">
                Remove Member
              </h2>
              <p className="text-base text-gp-ink-muted dark:text-gp-ink-soft mb-8 max-w-md">
                Are you sure you want to remove{' '}
                <span className="font-medium text-gp-ink-strong dark:text-white">
                  {memberToDelete?.name}
                </span>{' '}
                from <span className="font-medium">{spaceName}</span>? This
                action cannot be undone.
              </p>

              {/* Buttons */}
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setMemberToDelete(null)
                  }}
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-gp-glass-border dark:border-white/10 text-gp-ink-strong dark:text-white text-sm font-medium hover:bg-white dark:hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveMember}
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-2xl bg-red-600 dark:bg-red-500 text-white text-sm font-medium hover:bg-red-700 dark:hover:bg-red-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Removing...' : 'Remove Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </OfferingModal>
    </>
  )
}
