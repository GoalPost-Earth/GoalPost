import { Flex } from '@chakra-ui/react'
import React from 'react'

type Data = {
  data: {
    label: string
  }
}
function GraphNodes({ data }: Data) {
  return (
    <Flex
      borderRadius="full"
      p={2}
      width={'150px'}
      height={'150px'}
      bg={'gray.subtle'}
      color="gray.text"
      justifyContent={'center'}
      align={'center'}
      textAlign={'center'}
    >
      {data.label}
    </Flex>
  )
}

export default GraphNodes
