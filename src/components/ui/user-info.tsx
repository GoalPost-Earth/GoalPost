import { parsePhoneNumber } from '@/utils'
import {
  Container,
  Flex,
  HStack,
  IconButton,
  Link,
  Spacer,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import { LuPhone } from 'react-icons/lu'

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
          {info.key === 'Phone Number' ? (
            <Link href={`tel:${parsePhoneNumber(info.value)}`}>
              <HStack width="100%">
                <Text
                  fontWeight={'medium'}
                  fontSize="sm"
                  color={info.value ? 'fg' : 'bg'}
                >
                  {info.value ?? ' '}
                </Text>
                <Spacer />
                <IconButton size="xs" aria-label="Call support" rounded="full">
                  <LuPhone />
                </IconButton>
              </HStack>
            </Link>
          ) : (
            <Text
              fontWeight={'medium'}
              fontSize="sm"
              color={info.value ? 'fg' : 'bg'}
            >
              {info.value ?? ' '}
            </Text>
          )}
        </Flex>
      ))}
    </Container>
  )
}
