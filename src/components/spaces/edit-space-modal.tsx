'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  UPDATE_ME_SPACE_MUTATION,
  UPDATE_WE_SPACE_MUTATION,
  DELETE_ME_SPACE_MUTATION,
  DELETE_WE_SPACE_MUTATION,
} from '@/app/graphql/mutations/SPACE_MUTATIONS'

interface EditSpaceModalProps {
  isOpen: boolean
  onClose: () => void
  spaceId: string
  spaceName: string
  isWeSpace: boolean
  onRefetch?: () => Promise<void>
}

export function EditSpaceModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  isWeSpace,
  onRefetch,
}: EditSpaceModalProps) {
  const router = useRouter()
  const [name, setName] = useState(spaceName)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [updateMeSpace] = useMutation(UPDATE_ME_SPACE_MUTATION)
  const [updateWeSpace] = useMutation(UPDATE_WE_SPACE_MUTATION)
  const [deleteMeSpace] = useMutation(DELETE_ME_SPACE_MUTATION)
  const [deleteWeSpace] = useMutation(DELETE_WE_SPACE_MUTATION)

  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Space name cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const mutation = isWeSpace ? updateWeSpace : updateMeSpace
      await mutation({
        variables: {
          where: { id_EQ: spaceId },
          update: { name_SET: name.trim() },
        },
      })
      await onRefetch?.()
      onClose()
    } catch (error) {
      console.error('Error updating space:', error)
      alert('Failed to update space')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const mutation = isWeSpace ? deleteWeSpace : deleteMeSpace
      await mutation({
        variables: {
          where: { id_EQ: spaceId },
        },
      })
      onClose()
      router.push('/protected/spaces')
    } catch (error) {
      console.error('Error deleting space:', error)
      alert('Failed to delete space')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gp-ink-strong dark:text-gp-ink-strong">
              <span className="material-symbols-outlined">edit</span>
              Edit Space
            </DialogTitle>
            <DialogDescription className="text-slate-800 dark:text-slate-50">
              Update your space details or delete it permanently.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gp-ink-strong dark:text-gp-ink-strong">
                Space Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter space name"
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gp-ink-strong dark:text-gp-ink-strong">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                delete
              </span>
              Delete Space
            </DialogTitle>
            <DialogDescription className="text-slate-800 dark:text-slate-50">
              Are you sure you want to delete &quot;{spaceName}&quot;? This
              action cannot be undone. All fields and data within this space
              will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Deleting...' : 'Delete Space'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
