'use client'
import { Text, useDisclosure } from '@chakra-ui/react'
import { DeleteIcon } from '../icons'
import { Button } from './button'
import { DeleteDialog } from './delete-dialog'

export function DeleteButton() {
  const { open, onOpen, onClose } = useDisclosure()

  function handleConfirmDelete() {
    //TODO
    onClose()
  }

  return (
    <>
      <Button
        paddingX={2}
        paddingY={0}
        height="fit-content"
        gap={2}
        alignItems="center"
        bg="brand.50"
        color="#6F7175"
        cursor="pointer"
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
