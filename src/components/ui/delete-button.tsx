'use client'

import { Text, useDisclosure } from '@chakra-ui/react'
import { DeleteIcon } from '../icons'
import { Button } from './button'
import { DeleteDialog } from './delete-dialog'
import { EntityType } from '@/types'

export function DeleteButton({
  onDeleteEntity,
}: {
  onDeleteEntity: EntityType
}) {
  const { open, onOpen, onClose } = useDisclosure()

  function handleConfirmDelete() {
    //TODO: Init delete mutations and conditionally delete based on entity type
    if (onDeleteEntity === 'Resource') {
      console.log('Deleting resource')
    }
    onClose()
  }

  return (
    <>
      <Button
        paddingX={2}
        height="fit-content"
        variant="ghost"
        onClick={onOpen}
      >
        <DeleteIcon m={1} />
        <Text fontSize={'sm'} display={{ lg: 'none', xl: 'block' }}>
          Delete
        </Text>
      </Button>
      <DeleteDialog
        isOpen={open}
        onClose={onClose}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
