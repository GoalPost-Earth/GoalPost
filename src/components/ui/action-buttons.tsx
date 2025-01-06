'use client'
import { HStack } from '@chakra-ui/react'
import { EditButton } from './edit-button'
import { DeleteButton } from './delete-button'

export function ActionButtons({ id }: { id: string }) {
  return (
    <HStack>
      <EditButton handleEdit={() => {}} />
      <DeleteButton handleDelete={() => {}} />
    </HStack>
  )
}
