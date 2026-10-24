'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * GOAL-387 — in-app confirmation before deleting an organization (never a
 * browser `confirm()`). Says up front what happens to an organization another
 * Space also uses, because the member cannot see that from here: the server
 * only deletes it outright when every field holding it is one they can edit.
 */
export function DeleteOrganizationDialog({
  open,
  organizationName,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  open: boolean
  /**
   * The organization's name. The parent keeps it set after closing, so the
   * title doesn't flash "Delete ?" during the closing animation.
   */
  organizationName: string
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel()
      }}
    >
      <DialogContent className="bg-gp-surface dark:bg-gp-surface-dark border-gp-glass-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gp-ink-strong dark:text-white">
            Delete {organizationName}?
          </DialogTitle>
          <DialogDescription className="text-gp-ink-muted dark:text-gp-ink-soft">
            This deletes the organization and its links to people and pulses
            from every field you can edit. If a Space you are not in also uses
            it, it stays there and is only removed from your fields. This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-5 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-lg bg-destructive text-white font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDeleting && (
              <span className="material-symbols-outlined text-base animate-spin">
                hourglass_bottom
              </span>
            )}
            {isDeleting ? 'Deleting…' : 'Delete organization'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
