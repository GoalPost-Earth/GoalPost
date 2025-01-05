import { Box, Flex } from '@chakra-ui/react'

export default function Thinking() {
  return (
    <Flex
      id="thinking"
      direction="row"
      justify="center"
      align="center"
      bg="emerald.100"
      rounded="md"
      w="16"
      textStyle="sm"
      mx="2"
      p="2"
      order="2"
    >
      <Box
        w="2"
        h="2"
        bg="emerald.800"
        rounded="full"
        m="1"
        animation="pulse 1s infinite"
      ></Box>
      <Box
        w="2"
        h="2"
        bg="emerald.800"
        rounded="full"
        animation="pulse 1s infinite 0.1s"
      ></Box>
      <Box
        w="2"
        h="2"
        bg="emerald.800"
        rounded="full"
        m="1"
        animation="pulse 1s infinite 0.2s"
      ></Box>
    </Flex>
  )
}
