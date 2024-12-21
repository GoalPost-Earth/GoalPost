'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from './color-mode'
import { customTheme } from './theme'

export function Provider(props: React.PropsWithChildren) {
  return (
    <ChakraProvider value={customTheme}>
      <ColorModeProvider>{props.children}</ColorModeProvider>
    </ChakraProvider>
  )
}
