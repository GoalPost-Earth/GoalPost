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
import {
  GET_ALL_PEOPLE,
  GET_ALL_COREVALUES,
  GET_ALL_GOALS,
  GET_ALL_RESOURCES,
  GET_MEMBERS,
} from '../graphql'
import { useQuery } from '@apollo/client'
import ApolloWrapper from '@/components/ApolloWrapper'
import { getRandomPosition } from '../utils'
import GraphNodes from '@/components/ui/graph-nodes'
import { Flex } from '@chakra-ui/react'
import { Button } from '@/components/ui'

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

  const coreValuesNodes =
    coreValues?.coreValues.map((coreValue) => ({
      id: coreValue.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: { label: coreValue.name, nodeName: coreValue.__typename },
    })) ?? []

  const goalNodes =
    goals?.goals.map((goal) => ({
      id: goal.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: { label: goal.name, nodeName: goal.__typename },
    })) ?? []

  const resourceNodes =
    resources?.resources.map((resource) => ({
      id: resource.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: { label: resource.name, nodeName: resource.__typename },
    })) ?? []

  const memberNodes =
    members?.members.map((member) => ({
      id: member.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: {
        label: `${member.firstName} ${member.lastName}`,
        nodeName: member.__typename,
      },
    })) ?? []

  const graphNodes = [
    ...peopleNodes,
    ...coreValuesNodes,
    ...goalNodes,
    ...resourceNodes,
    ...memberNodes,
  ]
  const [selectedNodes, setSelectedNodes] = React.useState<Node[]>(
    peopleNodes ?? []
  )

  const initNodes: Node[] = selectedNodes ?? []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  type Params = Connection | Edge

  const onConnect = useCallback(
    (params: Params) => setEdges((eds) => addEdge(params, eds)),
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

{
  /* <Flex gap={2} mt={2}>
  {
    NodeTriggers.map((trigger) => {
      const nextNodes = graphNodes.filter((node) => node.nodeName === trigger);
      
      const areNextNodesSelected = nextNodes.every((nextNode) => 
        selectedNodes.some((selectedNode) => selectedNode.nodeName === nextNode.nodeName)
      );

      return (
        <Button 
          key={trigger} 
          onClick={() => {
            setSelectedNodes((prevSelectedNodes) => {
              if (areNextNodesSelected) {
                // Remove nextNodes from selectedNodes
                return prevSelectedNodes.filter(
                  (node) => !nextNodes.some((nextNode) => nextNode.nodeName === node.nodeName)
                );
              } else {
                // Add nextNodes to selectedNodes
                return [...prevSelectedNodes, ...nextNodes.filter(
                  (nextNode) => !prevSelectedNodes.some((node) => node.nodeName === nextNode.nodeName)
                )];
              }
            });
          }}
        >
          {trigger}
        </Button>
      );
    })
  }
</Flex> */
}
