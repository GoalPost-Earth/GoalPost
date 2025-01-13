import React from 'react'
import { Button, ButtonProps } from '../button'

export function CancelButton({
  children,
  ref,
  ...rest
}: {
  children?: React.ReactNode
  ref?: React.RefObject<HTMLButtonElement>
} & ButtonProps) {
  return (
    <Button variant="outline" colorPalette="black" {...rest}>
      {children ?? 'Cancel'}
    </Button>
  )
}
