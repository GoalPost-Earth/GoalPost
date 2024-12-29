'use client'

import React, { useCallback, useEffect } from 'react'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  MiniMap,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useQuery } from '@apollo/client'
import ApolloWrapper from '@/components/ApolloWrapper'
import { calculateNodePositionsAsRings, getRandomPosition } from '@/utils'
import GraphNodes from '@/components/ui/graph-nodes'
import { Flex } from '@chakra-ui/react'
import { Button } from '@/components/ui'
import {
  GET_ALL_PEOPLE,
  GET_ALL_COREVALUES,
  GET_ALL_GOALS,
  GET_ALL_RESOURCES,
  GET_MEMBERS,
} from '@/app/graphql'

const initialEdges: Edge[] = []
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

  const NodeTriggers = ['Resource', 'Person', 'Member', 'CoreValue', 'Goal']

  const peopleNodes = [
    ...(people?.people.map((person) => ({
      id: `${person.__typename}` + person.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: { label: person.name, nodeName: person.__typename, id: person.id },
      guidedBy: person.guidedBy,
    })) ?? []),
  ]

  const coreValuesNodes =
    coreValues?.coreValues.map((coreValue) => ({
      id: `${coreValue.__typename}` + coreValue.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: {
        label: coreValue.name,
        nodeName: coreValue.__typename,
        id: coreValue.id,
      },
    })) ?? []

  const goalNodes =
    goals?.goals.map((goal) => ({
      id: `${goal.__typename}` + goal.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: { label: goal.name, nodeName: goal.__typename, id: goal.id },
    })) ?? []

  const resourceNodes =
    resources?.resources.map((resource) => ({
      id: `${resource.__typename}` + resource.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: {
        label: resource.name,
        nodeName: resource.__typename,
        id: resource.id,
      },
    })) ?? []

  const memberNodes =
    members?.members.map((member) => ({
      id: `${member.__typename}` + member.id,
      position: getRandomPosition(),
      type: 'customNode',
      data: {
        label: `${member.firstName} ${member.lastName}`,
        nodeName: member.__typename,
        id: member.id,
      },
    })) ?? []

  const graphNodes = React.useMemo(() => {
    return calculateNodePositionsAsRings([
      resourceNodes,
      memberNodes,
      peopleNodes,
      coreValuesNodes,
      goalNodes,
    ])
  }, [resourceNodes, memberNodes, peopleNodes, coreValuesNodes, goalNodes])

  coreValuesNodes.forEach((coreValueNode) => {
    console.log('Core Value Node Id', coreValueNode.id)
  })

  const [selectedNodes, setSelectedNodes] = React.useState<Node[]>(
    peopleNodes ?? []
  )

  const initNodes: Node[] = []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  type Params = Connection | Edge

  const onConnect = useCallback(
    (params: Params) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  )

  const linkedEdges: Edge[] = []

  useEffect(() => {
    if (people && coreValues && goals && resources && members) {
      const newNodes = [...selectedNodes]
      setNodes(newNodes)

      peopleNodes.forEach((personNode) => {
        personNode.guidedBy?.forEach((value) => {
          if (value === null) return
          linkedEdges.push({
            id: `edge-${personNode.id}-${value.id}`,
            source: personNode.id,
            target: `${value.__typename}` + value.id,
          })
        })
      })
    }
    console.log('Linked Edges', linkedEdges)
    console.log('Person Nodes', peopleNodes)

    setEdges(linkedEdges)
  }, [selectedNodes, people, coreValues, goals, resources, members])

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <div>
        <Flex gap={2} mt={2} flexWrap={'wrap'} width={'fit-content'}>
          {NodeTriggers.map((trigger) => {
            const nextNodes = graphNodes.filter(
              (node: Node) => node.data.nodeName === trigger
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
                variant={
                  selectedNodes.some(
                    (selectedNode) => selectedNode.data.nodeName === trigger
                  )
                    ? 'solid'
                    : 'outline'
                }
              >
                {trigger}
              </Button>
            )
          })}
        </Flex>
        <div style={{ width: '100%', height: '80vh' }}>
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
      </div>
    </ApolloWrapper>
  )
}

export default GraphVisualization
