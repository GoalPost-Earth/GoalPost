'use client'

import { useState } from 'react'
import { useMutation, useApolloClient } from '@apollo/client/react'
import {
  ADD_SPACE_MEMBER_MUTATION,
  UPDATE_SPACE_MEMBER_ROLE_MUTATION,
  REMOVE_SPACE_MEMBER_MUTATION,
  RESOLVE_PERSON_BY_EMAIL_QUERY,
} from '@/app/graphql/mutations'
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
import { cn } from '@/lib/utils'

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
  const [addMemberEmail, setAddMemberEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<
    'ADMIN' | 'MEMBER' | 'GUEST'
  >('GUEST')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const client = useApolloClient()

  const [addSpaceMember] = useMutation(ADD_SPACE_MEMBER_MUTATION, {
    onCompleted: async (data) => {
      if (data?.addSpaceMember?.success) {
        setAddMemberEmail('')
        setSelectedRole('GUEST')
        onMembersUpdated?.()
        await onRefetch?.()
      } else {
        setError(data?.addSpaceMember?.message || 'Failed to add member')
      }
      setLoading(false)
    },
    onError: (err) => {
      setError(err.message)
      setLoading(false)
    },
  })

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

  const handleAddMember = async () => {
    if (!addMemberEmail.trim()) {
      setError('Please enter a member email')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First, resolve the email to a person ID
      const result = await client.query({
        query: RESOLVE_PERSON_BY_EMAIL_QUERY,
        variables: { email: addMemberEmail },
      })

      const person = result.data?.people[0]
      if (!person) {
        setError(`No user found with email: ${addMemberEmail}`)
        setLoading(false)
        return
      }

      // Now add the member using the resolved person ID
      await addSpaceMember({
        variables: {
          spaceId,
          memberId: person.id,
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: selectedRole as any,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    setLoading(true)
    setError(null)

    try {
      await removeSpaceMember({
        variables: {
          spaceId,
          memberId,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-center">
            Manage{' '}
            <span className="text-gp-accent-glow"> {spaceName}&apos;s</span>{' '}
            Permissions
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
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter member email"
                value={addMemberEmail}
                onChange={(e) => setAddMemberEmail(e.target.value)}
                className="flex-1 px-2 sm:px-3 py-2 rounded-lg bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border text-xs sm:text-sm text-gp-ink-strong dark:text-white placeholder-gp-ink-muted"
                disabled={loading}
              />
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
                <SelectContent>
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
                {loading ? 'Adding...' : 'Add'}
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
                        <SelectContent>
                          <SelectItem value="GUEST">Guest (View)</SelectItem>
                          <SelectItem value="MEMBER">Member (Edit)</SelectItem>
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
  )
}
