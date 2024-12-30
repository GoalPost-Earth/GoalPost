import { Box, Center, Flex, Text } from '@chakra-ui/react'
import HandIcon from '../icons/HandIcon'

function DefaultTabContent() {
  return (
    <Center bgColor="white" borderRadius="50%" height={300} width={300}>
      <Flex
        flexDirection={{ base: 'column', md: 'row' }}
        justifyContent={'center'}
        alignItems={'center'}
        gap={3}
      >
        <HandIcon />
        <Text>Nothing to see yet!</Text>
      </Flex>
    </Center>
  )
}

export default DefaultTabContent
