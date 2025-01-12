import { Container, Flex, Text } from '@chakra-ui/react'
import React from 'react'

export const UserInfo = ({
  data,
}: {
  data?: {
    key: string
    value?: string | number | null
  }[]
}) => {
  return (
    <Container bg="gray.contrast" borderRadius={2} paddingX={0}>
      {data?.map((info) => (
        <Flex
          key={info.key}
          padding={2}
          flexDirection={'column'}
          _notLast={{
            borderBottom: '1px solid',
            borderColor: 'gray.200',
          }}
        >
          <Text fontSize={'sm'} fontWeight={300}>
            {info.key}
          </Text>
          <Text
            fontWeight={'medium'}
            fontSize="sm"
            color={info.value ? 'fg' : 'bg'}
          >
            {info.value ?? 'No data'}
          </Text>
        </Flex>
      ))}
    </Container>
  )
}
