'use client'

import { Text } from '@chakra-ui/react'
import { EditIcon } from '../icons'
import { Button, ButtonProps } from './button'

export function EditButton({
  text,
  ...props
}: { text?: string } & ButtonProps) {
  return (
    <Button paddingX={2} height="fit-content" {...props}>
      <EditIcon m={1} />
      <Text fontSize={'sm'} display={{ lg: 'none', xl: 'block' }}>
        {text ?? 'Edit'}
      </Text>
    </Button>
  )
}
