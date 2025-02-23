import { Button, Flex, Heading, VStack } from '@chakra-ui/react'
import {
  CarePointsIcon,
  CommunityIcon,
  GoalsIcon,
  PeopleIcon,
  SettingsIcon,
  CoreValuesIcon,
} from '../icons'
import { EntityInfo } from './entity-info'
import Link from 'next/link'
import { LuArrowRight } from 'react-icons/lu'
import { Node } from 'neo4j-driver'

interface GraphNode extends Node {
  properties: {
    nodeName: string
  }
}

const iconMapping: Record<string, JSX.Element> = {
  Resource: <SettingsIcon color="" width="16px" height="16px" />,
  Person: <PeopleIcon color="" width="16px" height="16px" />,
  Community: <CommunityIcon color="" width="16px" height="16px" />,
  CoreValue: <CoreValuesIcon color="" width="16px" height="16px" />,
  Goal: <GoalsIcon color="" width="16px" height="16px" />,
  CarePoint: <CarePointsIcon color="" width="16px" height="16px" />,
}

export default function GraphSideBar({
  nodes,
  selectedNodes,
  selectedNodeInfo,
  setSelectedNodeInfo,
  selectedNodeId,
  selectedNodeName,
  setNodes,
  triggers,
}: {
  nodes: any
  selectedNodes: any
  selectedNodeInfo: any
  setSelectedNodeInfo: any
  selectedNodeId: any
  selectedNodeName: any
  setNodes: any
  triggers: string[]
}) {
  return (
    <Flex
      flexDirection="column"
      width="fit-content"
      height="fit-content"
      padding={2}
      gap={10}
      p={4}
      bg="white"
      borderRadius="lg"
      boxShadow="xs"
      maxWidth="300px"
      maxHeight="100dvh"
      overflow="auto"
      scrollbarWidth="none"
      position="absolute"
      top={0}
      left={{ base: 0, lg: 'unset' }}
      zIndex={1}
    >
      <Heading fontWeight="bolder">Entities</Heading>
      <Flex gap={2} mt={2} flexWrap={'wrap'} width={'fit-content'}>
        {triggers.map((trigger) => {
          const nextNodes = nodes.filter(
            (node: GraphNode) => node.properties.nodeName === trigger
          )
          return (
            <Button
              colorPalette={`${trigger.toLowerCase()}`}
              key={trigger}
              p={2}
              borderRadius={'full'}
              onClick={() => {
                if (
                  selectedNodes.some(
                    (selectedNode: GraphNode) =>
                      selectedNode.properties.nodeName === trigger
                  )
                ) {
                  setNodes(
                    selectedNodes.filter(
                      (selectedNode: GraphNode) =>
                        selectedNode.properties.nodeName !== trigger
                    )
                  )
                  if (selectedNodeName === trigger && selectedNodeId) {
                    setSelectedNodeInfo([])
                  } else {
                  }
                } else {
                  setNodes([...selectedNodes, ...nextNodes])
                }
              }}
              variant={
                selectedNodes.some(
                  (selectedNode: GraphNode) =>
                    selectedNode.properties.nodeName === trigger
                )
                  ? 'subtle'
                  : 'outline'
              }
            >
              {iconMapping[trigger]}
              {trigger}
            </Button>
          )
        })}
      </Flex>
      {!!selectedNodeInfo && (
        <VStack alignItems="flex-start" gap={5}>
          <Heading mb={1}>Properties</Heading>
          <VStack gap={5} p={2} width="100%">
            <EntityInfo entity={selectedNodeInfo} />
          </VStack>
        </VStack>
      )}
      {!!selectedNodeName && (
        <Flex
          justifyContent="center"
          fontSize="sm"
          alignItems="center"
          textDecoration="underline"
          _hover={{ cursor: 'pointer', gap: 2, textUnderlineOffset: 4 }}
          alignSelf="center"
          transition="all 0.2s ease-in-out"
        >
          <Link href={`/${selectedNodeName?.toLowerCase()}/${selectedNodeId}`}>
            Learn more{' '}
          </Link>
          <LuArrowRight />
        </Flex>
      )}
    </Flex>
  )
}
