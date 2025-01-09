'use client'
import React, { useEffect } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
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
  Person: 'blue.fg',
  Member: 'person.fg',
  CoreValue: 'corevalue.fg',
  Goal: 'goal.fg',
  Resource: 'resource.fg',
  Community: 'community.fg',
  CarePoint: 'orange.fg',
}
function GraphNodes({ data }: Data) {
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
        <button style={{ border: 'none', padding: 0, cursor: 'inherit' }}>
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
