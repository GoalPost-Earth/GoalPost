'use client'

import React, { useCallback, useEffect, useMemo } from 'react'
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
import { Stack } from '@chakra-ui/react'
import {
  GET_ALL_PEOPLE,
  GET_ALL_COREVALUES,
  GET_ALL_GOALS,
  GET_ALL_RESOURCES,
} from '@/app/graphql'
import GraphSideBar from '@/components/ui/graph-sidebar'

const initialEdges: Edge[] = []
const GraphVisualization = () => {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)
  const { data: people } = useQuery(GET_ALL_PEOPLE)
  const { data: coreValues } = useQuery(GET_ALL_COREVALUES)
  const { data: goals } = useQuery(GET_ALL_GOALS)
  const { data: resources } = useQuery(GET_ALL_RESOURCES)
  const members = people

  const nodeTypes = {
    customNode: GraphNodes,
  }

  const NodeTriggers = ['Resource', 'Person', 'CoreValue', 'Goal']

  const peopleNodes = useMemo(() => {
    return (
      people?.people.map((person) => ({
        id: `${person.__typename}${person.id}`,
        position: getRandomPosition(),
        type: 'customNode',
        data: {
          label: person.name,
          nodeName: person.__typename,
          id: person.id,
        },
      })) ?? []
    )
  }, [people])

  const coreValuesNodes = useMemo(() => {
    return (
      coreValues?.coreValues.map((coreValue) => ({
        id: `${coreValue.__typename}${coreValue.id}`,
        position: getRandomPosition(),
        type: 'customNode',
        data: {
          label: coreValue.name,
          nodeName: coreValue.__typename,
          id: coreValue.id,
        },
      })) ?? []
    )
  }, [coreValues])

  const goalNodes = useMemo(() => {
    return (
      goals?.goals.map((goal) => ({
        id: `${goal.__typename}${goal.id}`,
        position: getRandomPosition(),
        type: 'customNode',
        data: { label: goal.name, nodeName: goal.__typename, id: goal.id },
      })) ?? []
    )
  }, [goals])

  const resourceNodes = useMemo(() => {
    return (
      resources?.resources.map((resource) => ({
        id: `${resource.__typename}${resource.id}`,
        position: getRandomPosition(),
        type: 'customNode',
        data: {
          label: resource.name,
          nodeName: resource.__typename,
          id: resource.id,
        },
      })) ?? []
    )
  }, [resources])

  const memberNodes = useMemo(() => {
    return (
      members?.people.map((member) => ({
        id: `${member.__typename}${member.id}`,
        position: getRandomPosition(),
        type: 'customNode',
        data: {
          label: `${member.firstName} ${member.lastName}`,
          nodeName: member.__typename,
          id: member.id,
        },
      })) ?? []
    )
  }, [members])

  const graphNodes = useMemo(() => {
    return calculateNodePositionsAsRings([
      resourceNodes,
      memberNodes,
      peopleNodes,
      coreValuesNodes,
      goalNodes,
    ])
  }, [resourceNodes, memberNodes, peopleNodes, coreValuesNodes, goalNodes])

  const [selectedNodes, setSelectedNodes] = React.useState<Node[]>(
    peopleNodes ?? []
  )

  console.log('Members: ', members)
  const initNodes: Node[] = []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  type Params = Connection | Edge

  const onConnect = useCallback(
    (params: Params) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  )

  useEffect(() => {
    if (people && coreValues && goals && resources && members) {
      const newNodes = [...selectedNodes]
      setNodes(newNodes)
    }
  }, [selectedNodes, setNodes, people, coreValues, goals, resources, members])

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Stack direction={'row'} height={'100%'}>
        <GraphSideBar
          nodes={graphNodes}
          selectedNodes={selectedNodes}
          setNodes={setSelectedNodes}
          triggers={NodeTriggers}
        />

        <div style={{ width: '100%', height: '90vh' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </Stack>
    </ApolloWrapper>
  )
}

export default GraphVisualization
