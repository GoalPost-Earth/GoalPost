import { Box, BoxProps, Image } from '@chakra-ui/react'
import React from 'react'

export const AppLogo = (props: BoxProps) => {
  return (
    <Box {...props}>
      <Image src="/goalpost-logo.png" alt="Goalpost Logo" />
    </Box>
  )
}
