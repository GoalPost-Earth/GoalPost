// import { Flex } from '@chakra-ui/react'
// import { Tooltip } from '@/components/ui/tooltip'
// import React from 'react'
// import { useRouter } from 'next/navigation'

// type Data = {
//   data: {
//     label: string
//     nodeName: string
//     id: string
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
//   const router = useRouter()
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
//         <button
//           style={{ border: 'none', padding: 0, cursor: 'inherit' }}
//           onClick={() => {
//             router.push(`/${data.nodeName.toLowerCase()}/${data.id}`)
//           }}
//         >
//           {data.label.length > 16
//             ? `${data.label.slice(0, 16)}...`
//             : data.label}
//         </button>
//       </Flex>
//     </Tooltip>
//   )
// }

// export default GraphNodes

import React, { useEffect } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react' // Import the hook
import { useRouter } from 'next/navigation'
import { Tooltip } from './tooltip'
import { Flex } from '@chakra-ui/react'

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
  const router = useRouter()

  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    updateNodeInternals(data.id)
  }, [data, updateNodeInternals])

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
        <Handle
          type="source"
          position={Position.Right}
          id={`${data.nodeName}` + data.id}
          style={{ top: '50%' }}
        />
        <button
          style={{ border: 'none', padding: 0, cursor: 'inherit' }}
          onClick={() => {
            router.push(`/${data.nodeName.toLowerCase()}/${data.id}`)
          }}
        >
          {data.label.length > 16
            ? `${data.label.slice(0, 16)}...`
            : data.label}
        </button>
        <Handle
          type="target"
          position={Position.Left}
          id={`${data.nodeName}` + data.id}
          style={{ top: '50%' }}
        />
      </Flex>
    </Tooltip>
  )
}

export default GraphNodes
