'use client'

import React, { useCallback } from 'react'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery } from '@apollo/client'
import ApolloWrapper from '@/components/ApolloWrapper'
import { getRandomPosition } from '@/app/utils'
import { GET_ALL_PEOPLE } from '@/app/graphql'

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]
const GraphVisualization = () => {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)

  const initNodes: Node[] =
    data?.people.map((person) => ({
      id: person.id,
      position: getRandomPosition(),
      data: { label: person.name },
    })) ?? []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    // @ts-expect-error getEdgeParams is not defined
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </ApolloWrapper>
  )
}

export default GraphVisualization
