// import { Flex } from '@chakra-ui/react'
// import { Tooltip } from "@/components/ui/tooltip"
// import React from 'react'
// import { useUser } from '@auth0/nextjs-auth0/client'
// import { useReactFlow } from '@xyflow/react'

// type Data = {
//   data: {
//     label: string
//     nodeName: string
//   }
// }

// const NodeBgColor = {
//   Person: 'red.fg',
//   Member: 'blue.fg',
//   CoreValue: 'yellow.fg',
//   Goal: 'green.fg',
//   Resource: 'purple.fg',
// }

// function GraphNodes({ data }: Data) {

//   const { user } = useUser()

//   return (
//     <Tooltip showArrow content={data.label}>
//       <Flex
//         borderRadius="full"
//         p={2}
//         width={'100px'}
//         height={'100px'}
//         bg={NodeBgColor[data.nodeName as keyof typeof NodeBgColor]}
//         color="gray.contrast"
//         justifyContent={'center'}
//         align={'center'}
//         textAlign={'center'}
//         scale={1}
//         transition={'scale 0.2s ease-in-out'}
//         _hover={{
//           scale: 1.1,
//           zIndex: 100,
//         }}
//       >
//         {data.label.length > 16 ? `${data.label.slice(0, 16)}...` : data.label}
//       </Flex>
//     </Tooltip>
//   )
// }

// export default GraphNodes

import { Flex } from '@chakra-ui/react'
import { Tooltip } from '@/components/ui/tooltip'
import React, { useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useReactFlow } from '@xyflow/react'

type Data = {
  data: {
    label: string
    nodeName: string
    id: string
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
  return (
    <Tooltip showArrow content={data.label}>
      <Flex
        borderRadius="full"
        p={2}
        width={'100px'}
        height={'100px'}
        bg={NodeBgColor[data.nodeName as keyof typeof NodeBgColor]}
        color="gray.contrast"
        justifyContent={'center'}
        align={'center'}
        textAlign={'center'}
        scale={1}
        transition={'scale 0.2s ease-in-out'}
        _hover={{
          scale: 1.1,
          zIndex: 100,
        }}
      >
        {data.label.length > 16 ? `${data.label.slice(0, 16)}...` : data.label}
      </Flex>
    </Tooltip>
  )
}

export default GraphNodes
