import { EntityType } from '@/types'
import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react'

export function EntityPageHeader({ entity }: { entity: EntityType }) {
  return (
    <VStack display={{ base: 'none', lg: 'flex' }} mx={-8}>
      <Flex
        width={'100%'}
        height={'210px'}
        bgColor={`${entity.toLowerCase()}.subtle`}
        borderTopRadius={16}
        justifyContent="flex-end"
        alignItems="center"
        px={8}
      >
        <Heading
          fontSize="100px"
          fontWeight="black"
          color={`${entity.toLowerCase()}.emphasized`}
        >
          {entity.toLowerCase()}
        </Heading>
      </Flex>
    </VStack>
  )
}
