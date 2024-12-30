import { Container, Flex, Text } from '@chakra-ui/react'
import React from 'react'

const UserInfo = ({
  data,
}: {
  data?: {
    key: string
    value?: string | number | null
  }[]
}) => {
  return (
    <Container padding={0}>
      {data?.map((info) => (
        <Flex
          key={info.key}
          padding={2}
          flexDirection={'column'}
          _notLast={{
            borderBottom: '1.5px solid',
            borderColor: 'gray.subtle',
          }}
        >
          <Text fontSize={'sm'} fontWeight={300}>
            {info.key}
          </Text>
          <Text fontWeight={'medium'}>{info.value}</Text>
        </Flex>
      ))}
    </Container>
  )
}

export default UserInfo
