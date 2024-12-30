import { Box, Container, Flex, Text } from '@chakra-ui/react'
import React from 'react'

const UserInfo = ({
  data,
}: {
  data?: {
    title: string
    description?: string | number | null
  }[]
}) => {
  return (
    <Container padding={0}>
      {data?.map((info) => (
        <Flex
          key={info.title}
          padding={2}
          flexDirection={'column'}
          _notLast={{
            borderBottom: '1.5px solid',
            borderColor: 'gray.subtle',
          }}
        >
          <Text fontSize={'sm'} fontWeight={300}>
            {info.title}
          </Text>
          <Text fontWeight={'medium'}>{info.description}</Text>
        </Flex>
      ))}
    </Container>
  )
}

export default UserInfo
