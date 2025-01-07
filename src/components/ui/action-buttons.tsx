'use client'
import { HStack } from '@chakra-ui/react'
import { EditButton } from './edit-button'
import { DeleteButton } from './delete-button'

export function ActionButtons() {
  return (
    <HStack>
      <EditButton />
      <DeleteButton />
    </HStack>
  )
}
