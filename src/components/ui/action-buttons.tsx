'use client'
import { Button, HStack, Text } from '@chakra-ui/react'
import EditIcon from '../icons/EditIcon'
import DeleteIcon from '../icons/DeleteIcon'

export function ActionButtons() {
  return (
    <HStack>
      <Button
        paddingX={2}
        paddingY={0}
        height="fit-content"
        gap={2}
        alignItems="center"
        bg="brand.50"
        color="#6F7175"
      >
        <EditIcon m={1} />
        <Text fontSize={'sm'} display={{ lg: 'none', xl: 'block' }}>
          Edit
        </Text>
      </Button>
      <Button
        paddingX={2}
        paddingY={0}
        height="fit-content"
        gap={2}
        alignItems="center"
        bg="brand.50"
        color="#6F7175"
      >
        <DeleteIcon m={1} />
        <Text fontSize={'sm'} display={{ lg: 'none', xl: 'block' }}>
          Delete
        </Text>
      </Button>
    </HStack>
  )
}
