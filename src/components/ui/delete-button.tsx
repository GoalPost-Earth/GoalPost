'use client'
import { Text } from '@chakra-ui/react'
import { DeleteIcon } from '../icons'
import { Button } from './button'

export function DeleteButton({ handleDelete }: { handleDelete: () => void }) {
  return (
    <Button
      paddingX={2}
      paddingY={0}
      height="fit-content"
      gap={2}
      alignItems="center"
      bg="brand.50"
      color="#6F7175"
      cursor="pointer"
      onClick={handleDelete}
    >
      <DeleteIcon m={1} />
      <Text fontSize={'sm'} display={{ lg: 'none', xl: 'block' }}>
        Edit
      </Text>
    </Button>
  )
}
