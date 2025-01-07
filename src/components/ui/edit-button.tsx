'use client'

import { Text } from '@chakra-ui/react'
import { EditIcon } from '../icons'
import { Button } from './button'

export function EditButton() {
  return (
    <Button paddingX={2} height="fit-content" variant="ghost">
      <EditIcon m={1} />
      <Text fontSize={'sm'} display={{ lg: 'none', xl: 'block' }}>
        Edit
      </Text>
    </Button>
  )
}
