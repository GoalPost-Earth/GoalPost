'use client'

import { Text } from '@chakra-ui/react'
import { EditIcon } from '../../icons'
import { Button, ButtonProps } from '../button'

export function EditButton({
  text,
  iconOnly,
  ...props
}: { text?: string; iconOnly?: boolean } & ButtonProps) {
  return (
    <Button variant="surface" paddingX={2} height="fit-content" {...props}>
      <EditIcon m={1} color="" />
      {!iconOnly && <Text fontSize={'sm'}>{text ?? 'Edit'}</Text>}
    </Button>
  )
}
