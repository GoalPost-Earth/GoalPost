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
import { useQuery } from '@apollo/client'
import ApolloWrapper from '@/components/ApolloWrapper'
import { getRandomPosition } from '@/app/utils'
import { GET_ALL_PEOPLE } from '@/app/graphql'

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]
const GraphVisualization = () => {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)
  const { data: people } = useQuery(GET_ALL_PEOPLE)
  const { data: coreValues } = useQuery(GET_ALL_COREVALUES)
  const { data: goals } = useQuery(GET_ALL_GOALS)
  const { data: resources } = useQuery(GET_ALL_RESOURCES)
  const { data: members } = useQuery(GET_MEMBERS)

  const nodeTypes = {
    customNode: GraphNodes,
  }

  const NodeTriggers = ['Person', 'Member', 'CoreValue', 'Goal', 'Resource']

  const peopleNodes =
    people?.people.map((person) => ({
      id: person.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: { label: person.name, nodeName: person.__typename },
    })) ?? []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  type Params = Connection | Edge

  const onConnect = useCallback(
    // @ts-expect-error getEdgeParams is not defined
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  useEffect(() => {
    if (people && coreValues && goals && resources && members) {
      const newNodes = [...selectedNodes]
      setNodes(newNodes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodes])

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <Flex gap={2} mt={2}>
          {NodeTriggers.map((trigger) => {
            const nextNodes = graphNodes.filter(
              (node) => node.data.nodeName === trigger
            )
            return (
              <Button
                key={trigger}
                onClick={() => {
                  if (
                    selectedNodes.some(
                      (selectedNode) => selectedNode.data.nodeName === trigger
                    )
                  ) {
                    setSelectedNodes(
                      selectedNodes.filter(
                        (selectedNode) => selectedNode.data.nodeName !== trigger
                      )
                    )
                  } else {
                    setSelectedNodes([...selectedNodes, ...nextNodes])
                  }
                }}
              >
                {trigger}
              </Button>
            )
          })}
        </Flex>
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
