import React, { ReactNode } from 'react'
import { Button, ButtonProps } from '../button'

export function ConfirmButton({
  children,
  ...rest
}: { children?: ReactNode } & ButtonProps) {
  return (
    <Button colorPalette="green" variant="surface" type="submit" {...rest}>
      {children ?? 'Confirm'}
    </Button>
  )
}
