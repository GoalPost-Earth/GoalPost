'use client'
import {
  DialogRoot,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogBackdrop,
  DialogCloseTrigger,
  Button,
} from '@/components/ui'
import { useRef } from 'react'

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <DialogRoot
      motionPreset="slide-in-bottom"
      onOpenChange={onClose}
      open={isOpen}
    >
      <DialogBackdrop />

      <DialogContent>
        <DialogHeader>Delete</DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
          Are you sure you want to continue? Actions cannot be undone
        </DialogBody>
        <DialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            No
          </Button>
          <Button colorScheme="red" ml={3} onClick={onConfirm}>
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
