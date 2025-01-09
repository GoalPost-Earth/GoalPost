import { Button, Flex, Heading, VStack } from '@chakra-ui/react'
import { CommunityIcon, GoalsIcon, PeopleIcon, SettingsIcon } from '../icons'
import { EntityInfo } from './entity-info'
import Link from 'next/link'
import { LuArrowRight } from 'react-icons/lu'

interface GraphNode extends Node {
  data: {
    nodeName: string
  }
}

const iconMapping: Record<string, JSX.Element> = {
  Resource: <SettingsIcon width="16px" height="16px" />,
  Person: <PeopleIcon width="16px" height="16px" />,
  Community: <CommunityIcon width="16px" height="16px" />,
  Goal: <GoalsIcon width="16px" height="16px" />,
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
  selectedNodeId: string
  selectedNodeName: any
  setNodes: any
  triggers: string[]
}) {
  return (
    <Flex
      flexDirection={'column'}
      width={'fit-content'}
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
      left={0}
      zIndex={1}
    >
      <Heading fontWeight="bolder">Entities</Heading>
      <Flex gap={2} mt={2} flexWrap={'wrap'} width={'fit-content'}>
        {triggers.map((trigger) => {
          const nextNodes = nodes.filter(
            (node: GraphNode) => node.data.nodeName === trigger
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
                      selectedNode.data.nodeName === trigger
                  )
                ) {
                  setNodes(
                    selectedNodes.filter(
                      (selectedNode: GraphNode) =>
                        selectedNode.data.nodeName !== trigger
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
                    selectedNode.data.nodeName === trigger
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
