'use client'

import React, { useCallback, useEffect } from 'react'
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
import { Edge, Connection } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { GET_ALL_PEOPLE } from '../graphql'
import { useQuery } from '@apollo/client'
import ApolloWrapper from '@/components/ApolloWrapper'
import { getRandomPosition } from '../utils'
import GraphNodes from '@/components/ui/graph-nodes'

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]
const GraphVisualization = () => {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)

  console.log(data)

  const nodeTypes = {
    customNode: GraphNodes,
  }

  const initNodes: Node[] =
    data?.people.map((person) => ({
      id: person.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: { label: person.name },
    })) ?? []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  type Params = Connection | Edge

  const onConnect = useCallback(
    (params: Params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  useEffect(() => {
    if (data?.people) {
      const newNodes = data.people.map((person) => ({
        id: person.id,
        position: getRandomPosition(),
        type: 'customNode',
        data: { label: person.name },
      }))
      setNodes(newNodes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
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
