import { Box, Container, Flex, Text } from '@chakra-ui/react'
import React from 'react'

const UserInfo = ({
  data,
}: {
  data?: {
    title: string
    description?: string | number | null
    icon: JSX.Element
  }[]
}) => {
  return (
    <Container bg="gray.subtle" padding={0} borderRadius={'md'}>
      {data?.map((info) => (
        <Flex
          key={info.title}
          gap={6}
          alignItems="center"
          paddingY={2}
          paddingX={4}
          fontSize="sm"
          _first={{
            paddingTop: 3,
          }}
        >
          <Flex
            p={
              info.title === 'Community' ||
              info.title === 'Gender' ||
              info.title === 'Pronouns'
                ? 0
                : 2
            }
            borderRadius="full"
            bg="#9EBEC9"
            width="35px"
            height="35px"
            alignItems={'center'}
            justifyContent={'center'}
          >
            {info.icon}
          </Flex>
          <Box>
            <Text as="span" fontWeight="bold">
              {info.title}
            </Text>
            : {info.description}
          </Box>
        </Flex>
      ))}
    </Container>
  )
}

export default UserInfo
