import { Box } from '@chakra-ui/react'
import React, { ReactNode } from 'react'

interface GraphControlsProps {
  children?: ReactNode
}

const GraphControls = React.forwardRef<HTMLDivElement, GraphControlsProps>(
  ({ children }, ref) => {
    return (
      <Box
        position="absolute"
        zIndex={1}
        bottom={0}
        right={0}
        ref={ref}
        width="200px"
        height="140px"
        bg="gray.contrast"
      >
        {children}
      </Box>
    )
  }
)

export default GraphControls
