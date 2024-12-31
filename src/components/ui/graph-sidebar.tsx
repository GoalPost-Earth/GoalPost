import { Flex } from '@chakra-ui/react'
import { Button } from './button'

interface GraphNode extends Node {
  data: {
    nodeName: string
  }
}
export default function GraphSideBar({
  nodes,
  selectedNodes,
  setNodes,
  triggers,
}: {
  nodes: any
  selectedNodes: any
  setNodes: any
  triggers: string[]
}) {
  return (
    <Flex
      flexDirection={'column'}
      width={'fit-content'}
      padding={2}
      background={'gray.subtle'}
    >
      <Flex gap={2} mt={2} flexWrap={'wrap'} width={'fit-content'}>
        {triggers.map((trigger) => {
          const nextNodes = nodes.filter(
            (node: GraphNode) => node.data.nodeName === trigger
          )
          return (
            <Button
              key={trigger}
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
                } else {
                  setNodes([...selectedNodes, ...nextNodes])
                }
              }}
              variant={
                selectedNodes.some(
                  (selectedNode: GraphNode) =>
                    selectedNode.data.nodeName === trigger
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
    </Flex>
  )
}
