'use client'

import { cn } from '@/lib/utils'
import { OfferingModal } from '@/components/ui/offering-modal'

interface SpaceDetailsActionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  space: any
  loading: boolean
  isEditMode: boolean
  editName: string
  isEditLoading: boolean
  showDeleteConfirm: boolean
  isDeleteLoading: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contexts: any[]
  showMemberDeleteConfirm: boolean
  memberToDelete: { id: string; name: string } | null
  isMemberActionLoading: boolean
  onEditStart: () => void
  onEditCancel: () => void
  onEditSave: () => void
  onEditNameChange: (name: string) => void
  onDelete: () => void
  onShowDeleteConfirm: () => void
  onHideDeleteConfirm: () => void
  onHideMemberDeleteConfirm: () => void
  onConfirmRemoveMember: () => void
}

export function SpaceDetailsActions({
  space,
  loading,
  isEditMode,
  editName,
  isEditLoading,
  showDeleteConfirm,
  isDeleteLoading,
  contexts,
  showMemberDeleteConfirm,
  memberToDelete,
  isMemberActionLoading,
  onEditStart,
  onEditCancel,
  onEditSave,
  onEditNameChange,
  onDelete,
  onShowDeleteConfirm,
  onHideDeleteConfirm,
  onHideMemberDeleteConfirm,
  onConfirmRemoveMember,
}: SpaceDetailsActionsProps) {
  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 w-full">
        <button
          onClick={onEditStart}
          className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Edit Space
        </button>
        {space.__typename === 'WeSpace' && (
          <button
            onClick={onShowDeleteConfirm}
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

      {/* Edit Modal */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 border border-gp-glass-border">
            <button
              onClick={onEditCancel}
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
                  onChange={(e) => onEditNameChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                  placeholder="Space name"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onEditCancel}
                  disabled={isEditLoading}
                  className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onEditSave}
                  disabled={isEditLoading}
                  className="px-6 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isEditLoading && (
                    <span
                      className={cn(
                        'material-symbols-outlined text-base',
                        'motion-safe:animate-spin'
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
                onClick={onHideDeleteConfirm}
                disabled={isDeleteLoading || loading}
                className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contexts && contexts.length > 0 ? 'Close' : 'Cancel'}
              </button>
              {(!contexts || contexts.length === 0) && (
                <button
                  onClick={onDelete}
                  disabled={isDeleteLoading || loading}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleteLoading && (
                    <span
                      className={cn(
                        'material-symbols-outlined text-base',
                        'motion-safe:animate-spin'
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

      {/* Member Delete Confirmation */}
      <OfferingModal
        isOpen={showMemberDeleteConfirm}
        onClose={onHideMemberDeleteConfirm}
        position="center"
      >
        <div className="relative z-10 w-full">
          <div className="glass-panel rounded-3xl p-5 sm:p-8 md:p-12 border border-gp-glass-border dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
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
                  onClick={onHideMemberDeleteConfirm}
                  disabled={isMemberActionLoading}
                  className="flex-1 px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-gp-glass-border dark:border-white/10 text-gp-ink-strong dark:text-white text-sm font-medium hover:bg-white dark:hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmRemoveMember}
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
    </>
  )
}
