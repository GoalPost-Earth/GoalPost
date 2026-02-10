'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { OfferingModal } from '@/components/ui/offering-modal'
import { cn } from '@/lib/utils'
import {
  UPDATE_ME_SPACE_MUTATION,
  UPDATE_WE_SPACE_MUTATION,
  DELETE_ME_SPACE_MUTATION,
  DELETE_WE_SPACE_MUTATION,
} from '@/app/graphql/mutations/SPACE_MUTATIONS'

export interface CreateSpaceModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate?: (payload: { name: string }) => void | Promise<void>
  isLoading?: boolean
  title?: string
  subtitle?: string
  initialName?: string
  isEditing?: boolean
  spaceId?: string
  isWeSpace?: boolean
}

export function CreateSpaceModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
  title = 'Create New Space',
  subtitle = 'Name your space',
  initialName = '',
  isEditing = false,
  spaceId,
  isWeSpace,
}: CreateSpaceModalProps) {
  const [name, setName] = useState(initialName)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [updateMeSpace] = useMutation(UPDATE_ME_SPACE_MUTATION)
  const [updateWeSpace] = useMutation(UPDATE_WE_SPACE_MUTATION)
  const [deleteMeSpace] = useMutation(DELETE_ME_SPACE_MUTATION)
  const [deleteWeSpace] = useMutation(DELETE_WE_SPACE_MUTATION)

  const [isMutationLoading, setIsMutationLoading] = useState(false)

  const canSubmit = name.trim().length > 0 && !isLoading && !isMutationLoading

  const handleDelete = async () => {
    setIsMutationLoading(true)
    try {
      const mutation = isWeSpace ? deleteWeSpace : deleteMeSpace
      await mutation({
        variables: {
          where: { id_EQ: spaceId },
        },
      })
      onClose()
    } catch (error) {
      console.error('Error deleting space:', error)
      alert('Failed to delete space')
    } finally {
      setIsMutationLoading(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!canSubmit) return

    if (isEditing && spaceId) {
      // Edit mode: update the space
      setIsMutationLoading(true)
      try {
        const mutation = isWeSpace ? updateWeSpace : updateMeSpace
        await mutation({
          variables: {
            where: { id_EQ: spaceId },
            update: {
              name_SET: name.trim(),
            },
          },
        })
        onClose()
      } catch (error) {
        console.error('Error updating space:', error)
        alert('Failed to update space')
      } finally {
        setIsMutationLoading(false)
      }
    } else {
      // Create mode: use the provided onCreate handler
      await onCreate?.({
        name: name.trim(),
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <>
      <OfferingModal isOpen={isOpen} onClose={onClose} position="center">
        <div className="relative z-10 w-full">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-16 right-4 md:-right-8 p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-gp-ink-muted dark:text-white/50 hover:text-gp-ink-strong dark:hover:text-white group"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          {/* Modal Content */}
          <div className="glass-panel rounded-3xl p-8 md:p-12 border border-gp-glass-border dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gp-primary/20 dark:bg-gp-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gp-accent-glow/20 dark:bg-gp-accent-glow/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
              {/* Icon */}
              <div className="mb-8 relative group cursor-pointer">
                <div className="absolute inset-0 bg-gp-primary/30 rounded-full blur-xl group-hover:bg-gp-primary/50" />
                <div className="size-16 rounded-full bg-linear-to-br from-white to-gp-surface-soft dark:from-white/10 dark:to-white/5 border border-white dark:border-white/20 flex items-center justify-center backdrop-blur-xl shadow-md dark:shadow-inner">
                  <span className="material-symbols-outlined text-3xl text-gp-accent-glow drop-shadow-[0_0_10px_rgba(79,255,203,0.5)]">
                    {isEditing ? 'edit' : 'hub'}
                  </span>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-light dark:font-extralight text-gp-ink-strong dark:text-white mb-2 tracking-tight leading-tight">
                {isEditing ? 'Edit Space' : title}
              </h2>
              <p className="text-sm text-gp-ink-muted dark:text-white/50 mb-4">
                {isEditing
                  ? 'Update your space details or delete it.'
                  : subtitle}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                {/* Name */}
                <div className="w-full relative group">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-gp-primary/30 to-gp-accent-glow/30 dark:from-gp-primary/50 dark:to-gp-accent-glow/50 rounded-2xl blur opacity-30 dark:opacity-20 group-hover:opacity-60 dark:group-hover:opacity-40" />
                  <div className="relative flex items-center">
                    <input
                      autoFocus
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Name your space..."
                      className={cn(
                        'w-full rounded-2xl px-6 py-4 text-lg font-light',
                        'bg-white/90 dark:bg-black/40',
                        'border border-gp-glass-border dark:border-white/10',
                        'text-gp-ink-strong dark:text-white',
                        'placeholder-gp-ink-soft dark:placeholder-white/20',
                        'focus:outline-none focus:border-gp-primary/50 focus:bg-white dark:focus:bg-black/60',
                        'focus:shadow-[0_0_0_4px_rgba(14,165,233,0.1)]'
                      )}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing ? (
                  <div className="w-full flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isMutationLoading}
                      className="flex-1 px-6 py-3 rounded-xl bg-red-600/20 dark:bg-red-600/30 text-red-600 dark:text-red-400 hover:bg-red-600/30 dark:hover:bg-red-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isMutationLoading}
                      className="flex-1 px-6 py-3 rounded-xl bg-gp-surface-soft dark:bg-gp-surface-strong text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={cn(
                        'flex-1 px-6 py-3 rounded-xl font-medium transition-colors',
                        !canSubmit
                          ? 'bg-gp-primary/40 text-white/60 cursor-not-allowed'
                          : 'bg-gp-primary text-white hover:bg-gp-primary/90'
                      )}
                    >
                      {isMutationLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isLoading || isMutationLoading}
                      className="flex-1 px-6 py-3 rounded-xl bg-gp-surface-soft dark:bg-gp-surface-strong text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={cn(
                        'flex-1 px-6 py-3 rounded-xl font-medium transition-colors',
                        !canSubmit
                          ? 'bg-gp-primary/40 text-white/60 cursor-not-allowed'
                          : 'bg-gp-primary text-white hover:bg-gp-primary/90'
                      )}
                    >
                      {isLoading || isMutationLoading
                        ? 'Creating...'
                        : 'Create'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Footer Hint */}
          <p className="text-center mt-6 text-gp-ink-strong dark:text-white/30 text-xs font-mono">
            Press &apos;Enter&apos; to {isEditing ? 'save' : 'create'}, or
            &apos;Esc&apos; to cancel
          </p>
        </div>
      </OfferingModal>

      {/* Delete Confirmation Modal (for edit mode) */}
      {isEditing && (
        <OfferingModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
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
                      delete
                    </span>
                  </div>
                </div>

                {/* Heading */}
                <h2 className="text-3xl md:text-4xl font-light dark:font-extralight text-gp-ink-strong dark:text-white mb-2 tracking-tight leading-tight">
                  Delete Space
                </h2>
                <p className="text-sm text-red-700 dark:text-red-400 mb-8">
                  Are you sure? This action cannot be undone. All fields and
                  data within this space will be permanently deleted.
                </p>

                {/* Buttons */}
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isMutationLoading}
                    className="flex-1 px-6 py-3 rounded-xl bg-gp-surface-soft dark:bg-gp-surface-strong text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isMutationLoading}
                    className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isMutationLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </OfferingModal>
      )}
    </>
  )
}
