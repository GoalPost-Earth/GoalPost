'use client'

import { Text, useDisclosure } from '@chakra-ui/react'
import { DeleteIcon } from '../icons'
import { Button } from './button'
import { DeleteDialog } from './delete-dialog'

export function DeleteButton() {
  const { open, onOpen, onClose } = useDisclosure()

  function handleConfirmDelete() {
    //TODO: Accept a delete function as a prop
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
