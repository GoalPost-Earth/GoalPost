'use client'

import { Text } from '@chakra-ui/react'
import { EditIcon } from '../../icons'
import { Button, ButtonProps } from '../button'

export function EditButton({
  text,
  ...props
}: { text?: string } & ButtonProps) {
  return (
    <Button variant="surface" paddingX={2} height="fit-content" {...props}>
      <EditIcon m={1} color="" />
      <Text fontSize={'sm'} display={{ base: 'none', lg: 'block' }}>
        {text ?? 'Edit'}
      </Text>
    </Button>
  )
}
