'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  MarkerType,
  MiniMap,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useQuery } from '@apollo/client'
import { ApolloWrapper } from '@/components'
import { calculateNodePositionsAsRings, getRandomPosition } from '@/utils'
import GraphNodes from '@/components/ui/graph-nodes'
import { Stack } from '@chakra-ui/react'
import {
  GET_ALL_PEOPLE,
  GET_ALL_COREVALUES,
  GET_ALL_GOALS,
  GET_ALL_RESOURCES,
  GET_ALL_COMMUNITIES,
  GET_ALL_CAREPOINTS,
} from '@/app/graphql'
import GraphSideBar from '@/components/ui/graph-sidebar'

const initialEdges: Edge[] = []
const initialSelectedNodeInfo: Node[] = []

const NodeTriggers = [
  'Resource',
  'Person',
  'Community',
  'CoreValue',
  'Goal',
  'CarePoint',
]

const EdgeMarker = {
  type: MarkerType.ArrowClosed,
  width: 40,
  height: 40,
  color: 'black',
}

const GraphVisualization = () => {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)
  const { data: people } = useQuery(GET_ALL_PEOPLE)
  const { data: coreValues } = useQuery(GET_ALL_COREVALUES)
  const { data: goals } = useQuery(GET_ALL_GOALS)
  const { data: resources } = useQuery(GET_ALL_RESOURCES)
  const { data: communities } = useQuery(GET_ALL_COMMUNITIES)
  const { data: carePoints } = useQuery(GET_ALL_CAREPOINTS)
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(
    initialSelectedNodeInfo
  )

  const members = people

  const nodeTypes = {
    customNode: GraphNodes,
  }

  const peopleNodes = useMemo(() => {
    return (
      people?.people.map((person) => ({
        id: `${person.__typename}${person.id}`,
        position: getRandomPosition(),
        type: 'customNode',
        data: {
          nodeInfo: {
            Entity: 'Person',
            Name: person.name,
            'First Name': person.firstName,
            'Phone Number': person.phone,
            Pronouns: person.pronouns,
          },
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
          nodeInfo: {
            Entity: 'Core Value',
            Name: coreValue.name,
            'Who Supports': coreValue.whoSupports,
            Description: coreValue.description,
          },
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
        data: {
          nodeInfo: {
            Entity: 'Goal',
            Name: goal.name,
            Description: goal.description,
            Status: goal.status,
          },
          label: goal.name,
          nodeName: goal.__typename,
          id: goal.id,
        },
      })) ?? []
    )
  }, [goals])

  const carePointsNodes = useMemo(() => {
    return (
      carePoints?.carePoints.map((carePoint, index) => ({
        id: `${carePoint.__typename}${carePoint.id}`,
        position: getRandomPosition(),
        type: 'customNode',
        data: {
          nodeInfo: {
            Entity: 'Care Point',
            Description: carePoint.description,
            Status: carePoint.status,
          },
          label: `Care Point- ${index}`,
          nodeName: carePoint.__typename,
          id: carePoint.id,
        },
      })) ?? []
    )
  }, [carePoints])

  const resourceNodes = useMemo(() => {
    return (
      resources?.resources.map((resource) => ({
        id: `${resource.__typename}${resource.id}`,
        position: getRandomPosition(),
        type: 'customNode',
        data: {
          nodeInfo: {
            Entity: 'Resource',
            Name: resource.name,
            Description: resource.description,
            Status: resource.status,
          },
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
          nodeInfo: {
            Entity: 'Person',
            Name: member.name,
            'First Name': member.firstName,
            'Phone Number': member.phone,
            Pronouns: member.pronouns,
          },
          label: `${member.firstName} ${member.lastName}`,
          nodeName: member.__typename,
          id: member.id,
        },
      })) ?? []
    )
  }, [members])

  const communityNodes = useMemo(() => {
    return (
      communities?.communities.map((community) => ({
        id: `${community.__typename}${community.id}`,
        position: getRandomPosition(),
        type: 'customNode',
        data: {
          nodeInfo: {
            Entity: 'Community',
            Name: community.name,
            Description: community.description,
            Status: community.status,
          },
          label: community.name,
          nodeName: community.__typename,
          id: community.id,
        },
      })) ?? []
    )
  }, [communities])

  const graphNodes = useMemo(() => {
    return calculateNodePositionsAsRings([
      resourceNodes,
      memberNodes,
      peopleNodes,
      coreValuesNodes,
      goalNodes,
      communityNodes,
      carePointsNodes,
    ])
  }, [
    resourceNodes,
    memberNodes,
    peopleNodes,
    coreValuesNodes,
    goalNodes,
    communityNodes,
    carePointsNodes,
  ])

  const [selectedNodes, setSelectedNodes] = React.useState<Node[]>(
    peopleNodes ?? []
  )

  const personToPersonConnection = useMemo(() => {
    return (
      people?.people.flatMap((person) => {
        return person.connectedTo.map((connectedTo) => {
          return {
            id: `${person.__typename}${person.id}-${connectedTo.__typename}${connectedTo.id}`,
            source: `${person.__typename}${person.id}`,
            target: `${connectedTo.__typename}${connectedTo.id}`,
            label: 'Connected To',
            markerEnd: EdgeMarker,
          }
        })
      }) ?? []
    )
  }, [people])

  const personToCommunityConnection = useMemo(() => {
    return (
      people?.people.flatMap((person) => {
        return person.connectedTo.flatMap((connectedTo) => {
          return (
            connectedTo.communities &&
            connectedTo.communities.map((community) => {
              return {
                id: `${person.__typename}${person.id}-${community.__typename}${community.id}`,
                source: `${person.__typename}${person.id}`,
                target: `${community.__typename}${community.id}`,
                label: 'Belongs To',
                markerEnd: EdgeMarker,
              }
            })
          )
        })
      }) ?? []
    )
  }, [people])

  const personToGoalsConnection = useMemo(() => {
    return (
      people?.people.flatMap((person) => {
        return person.connectedTo.flatMap((connectedTo) => {
          return (
            connectedTo.goals &&
            connectedTo.goals.map((goal) => {
              return {
                id: `${person.__typename}${person.id}-${goal.__typename}${goal.id}`,
                source: `${person.__typename}${person.id}`,
                target: `${goal.__typename}${goal.id}`,
                label: 'Motivated By',
                markerEnd: EdgeMarker,
              }
            })
          )
        })
      }) ?? []
    )
  }, [people])

  const personToCoreValueConnection = useMemo(() => {
    return (
      people?.people.flatMap((person) => {
        return person.connectedTo.flatMap((connectedTo) => {
          return (
            connectedTo.coreValues &&
            connectedTo.coreValues.map((coreValue) => {
              return {
                id: `${person.__typename}${person.id}-${coreValue.__typename}${coreValue.id}`,
                source: `${person.__typename}${person.id}`,
                target: `${coreValue.__typename}${coreValue.id}`,
                label: 'Guided By',
                markerEnd: EdgeMarker,
              }
            })
          )
        })
      }) ?? []
    )
  }, [people])

  const personToResourceConnection = useMemo(() => {
    return (
      people?.people.flatMap((person) => {
        return person.connectedTo.flatMap((connectedTo) => {
          return (
            connectedTo.providesResources &&
            connectedTo.providesResources.map((resource) => {
              return {
                id: `${person.__typename}${person.id}-${resource.__typename}${resource.id}`,
                source: `${person.__typename}${person.id}`,
                target: `${resource.__typename}${resource.id}`,
                label: 'Provides',
                markerEnd: EdgeMarker,
              }
            })
          )
        })
      }) ?? []
    )
  }, [people])

  const goalToCoreValueConnection = useMemo(() => {
    return (
      coreValues?.coreValues.flatMap((coreValue) => {
        return coreValue.isEmbracedBy.flatMap((isEmbracedBy) => {
          return (
            isEmbracedBy.goals &&
            isEmbracedBy.goals.map((goal) => {
              return {
                id: `${goal.__typename}${goal.id}-${coreValue.__typename}${coreValue.id}`,
                source: `${goal.__typename}${goal.id}`,
                target: `${coreValue.__typename}${coreValue.id}`,
                label: 'Guided By',
                markerEnd: EdgeMarker,
              }
            })
          )
        })
      }) ?? []
    )
  }, [coreValues])

  const goalToCarePointConnection = useMemo(() => {
    return (
      carePoints?.carePoints.flatMap((carePoint) => {
        return (
          carePoint.enabledByGoals &&
          carePoint.enabledByGoals.map((goal) => {
            return {
              id: `${goal.__typename}${goal.id}-${carePoint.__typename}${carePoint.id}`,
              source: `${goal.__typename}${goal.id}`,
              target: `${carePoint.__typename}${carePoint.id}`,
              label: 'Enables Care',
              markerEnd: EdgeMarker,
            }
          })
        )
      }) ?? []
    )
  }, [carePoints])

  const communityToCommunityConnection = useMemo(() => {
    return (
      communities?.communities.flatMap((community) => {
        return (
          community.relatedCommunities &&
          community.relatedCommunities.flatMap((relatedCommunity) => {
            return {
              id: `${community.__typename}${community.id}-${relatedCommunity.__typename}${relatedCommunity.id}`,
              source: `${community.__typename}${community.id}`,
              target: `${relatedCommunity.__typename}${relatedCommunity.id}`,
              label: 'Relate To',
              markerEnd: EdgeMarker,
            }
          })
        )
      }) ?? []
    )
  }, [communities])

  const initNodes: Node[] = []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  type Params = Connection | Edge

  const onConnect = useCallback(
    (params: Params) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    if (selectedNodeInfo[0]?.id === node.id) {
      setSelectedNodeInfo([])
      return
    }
    setSelectedNodeInfo([node])
  }

  useEffect(() => {
    if (people && coreValues && goals && resources && members && communities) {
      const newNodes = [...selectedNodes]
      setNodes(newNodes)
      setEdges([
        ...personToPersonConnection,
        ...personToCommunityConnection,
        ...personToGoalsConnection,
        ...personToCoreValueConnection,
        ...personToResourceConnection,
        ...goalToCoreValueConnection,
        ...goalToCarePointConnection,
        ...communityToCommunityConnection,
      ])
    }
  }, [
    selectedNodes,
    setNodes,
    people,
    coreValues,
    goals,
    resources,
    members,
    communities,
  ])

  const nodeInfo = selectedNodeInfo[0]?.data.nodeInfo
  const nodeId = selectedNodeInfo[0]?.data.id
  const nodeName = selectedNodeInfo[0]?.data.nodeName

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Stack direction={'row'} height={'100%'} position="relative">
        <GraphSideBar
          selectedNodeInfo={nodeInfo}
          nodes={graphNodes}
          selectedNodes={selectedNodes}
          setSelectedNodeInfo={setSelectedNodeInfo}
          selectedNodeId={nodeId}
          selectedNodeName={nodeName}
          setNodes={setSelectedNodes}
          triggers={NodeTriggers}
        />

        <div style={{ width: '100%', height: '90vh' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
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
