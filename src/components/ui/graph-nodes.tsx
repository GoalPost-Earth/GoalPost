import { Flex } from '@chakra-ui/react'
import React from 'react'

type Data = {
  data: {
    label: string
    nodeName: string
  }
}

const NodeBgColor = {
  Person: 'red.fg',
  Member: 'blue.fg',
  CoreValue: 'yellow.fg',
  Goal: 'green.fg',
  Resource: 'purple.fg',
}

function GraphNodes({ data }: Data) {
  console.log(`NodeName: ${data.nodeName}`)
  return (
    <Flex
      borderRadius="full"
      p={2}
      width={'200px'}
      height={'200px'}
      bg={NodeBgColor[data.nodeName as keyof typeof NodeBgColor]}
      color="gray.contrast"
      justifyContent={'center'}
      align={'center'}
      textAlign={'center'}
    >
      {data.label}
    </Flex>
  )
}

export default GraphNodes
