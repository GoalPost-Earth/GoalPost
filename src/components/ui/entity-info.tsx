import { Box, Flex, Text } from '@chakra-ui/react'

export function EntityInfo({ entity }: { entity: any }) {
  if (typeof entity === 'object' && entity !== null) {
    return Object.entries(entity).map(([key, value]) => (
      <Flex
        key={key}
        width="100%"
        flexDirection={{ base: 'column', md: 'row' }}
        gap={1}
        justifyContent="flex-start"
      >
        <Text fontWeight="bold" fontSize="xs" width="40%">
          {key.toUpperCase()}:
        </Text>{' '}
        <Text fontSize="sm" textAlign="start" width="60%">
          {value?.toString()}
        </Text>
      </Flex>
    ))
  } else return
}
