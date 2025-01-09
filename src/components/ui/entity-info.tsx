import { Box, Flex, Text } from '@chakra-ui/react'

export function EntityInfo({ entity }: { entity: any }) {
  if (typeof entity === 'object' && entity !== null) {
    return Object.entries(entity).map(([key, value]) => (
      <Flex
        key={key}
        justifyContent="space-between"
        width="100%"
        flexDirection={{ base: 'column', md: 'row' }}
        gap={2}
      >
        <Text fontWeight="bold" fontSize="xs">
          {key.toUpperCase()}:
        </Text>{' '}
        <Text fontSize="sm" textAlign="start">
          {value?.toString()}
        </Text>
      </Flex>
    ))
  } else return
}
