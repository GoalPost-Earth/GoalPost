'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * In-app confirmation before deleting a person from the graph (never a browser
 * `confirm()`). Says up front when they will only be removed, because the
 * member cannot see that from here: the server keeps anyone with an account or
 * Space membership, another user's contact, and anyone another Space relies on.
 */
export function DeletePersonDialog({
  open,
  personName,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  open: boolean
  /**
   * The person's name. The parent keeps it set after closing, so the title
   * doesn't flash "Delete ?" during the closing animation.
   */
  personName: string
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isDeleting) onCancel()
      }}
    >
      <DialogContent className="bg-gp-surface dark:bg-gp-surface-dark border-gp-glass-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gp-ink-strong dark:text-white">
            Delete {personName}?
          </DialogTitle>
          <DialogDescription className="text-gp-ink-muted dark:text-gp-ink-soft">
            This deletes the person, their contact details and their links to
            pulses, promise weaves and organizations. The pulses and weaves
            themselves are kept. If they
            have a GoalPost account, were added by someone else, or a Space you
            are not in also uses them, they stay and are only removed from your
            fields. This can&apos;t be undone.
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
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-auto px-5 py-2 rounded-lg text-base font-medium cursor-pointer"
          >
            {isDeleting && (
              <span className="material-symbols-outlined text-base animate-spin">
                hourglass_bottom
              </span>
            )}
            {isDeleting ? 'Deleting…' : 'Delete person'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
