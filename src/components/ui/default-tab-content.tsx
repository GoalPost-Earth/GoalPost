import { Flex, Text } from '@chakra-ui/react'
import HandIcon from '../icons/HandIcon'

function DefaultTabContent() {
  return (
    <Flex
      flexDirection={{ base: 'column', md: 'row' }}
      justifyContent={'center'}
      alignItems={'center'}
      gap={3}
      minHeight={{ base: '200px', md: '400px' }}
    >
      <HandIcon />
      <Text>Nothing to show yet!</Text>
    </Flex>
  )
}

export default DefaultTabContent
