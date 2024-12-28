'use client'

import { GET_ALL_MEMBERS } from '@/app/graphql'
import ApolloWrapper from '@/components/ApolloWrapper'
import { Avatar } from '@/components/ui'
import { useQuery } from '@apollo/client'
import {
  Box,
  Card,
  Container,
  Heading,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { LuPhone } from 'react-icons/lu'

export default function AllMembers() {
  const { data, loading, error } = useQuery(GET_ALL_MEMBERS)

  const members = data?.members ?? []

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading>All Members</Heading>
        {members.map((member) => (
          <Link href={'/member/' + member.id} key={member.id}>
            <Card.Root my={1}>
              <Card.Header p={2} bgColor="gray.100">
                <HStack>
                  <Avatar src={member.photo ?? undefined} /> {member.name}
                </HStack>
              </Card.Header>
              <Card.Body p={2}>
                <Text>{member.email}</Text>
                {!!member.phone && (
                  <>
                    <Link href={`tel:${member.phone}`}>
                      <HStack>
                        <IconButton
                          colorPalette="brand"
                          aria-label="phone"
                          size="xs"
                          borderRadius={100}
                        >
                          <LuPhone />
                        </IconButton>
                        <Text>{member.phone}</Text>
                      </HStack>
                    </Link>

                    <Box my={2}>
                      <hr />
                    </Box>
                  </>
                )}

                {!!member.coreValues.length && (
                  <>
                    <Box>
                      <Heading size="sm">Core Values:</Heading>
                      {member.coreValues.map((coreValue, index) => (
                        <Text key={coreValue.name} as="span" fontSize="sm">
                          {coreValue.name}
                          {index < member.coreValues.length - 1 && (
                            <Text as="span">, </Text>
                          )}
                        </Text>
                      ))}
                    </Box>
                    <Box my={2}>
                      <hr />
                    </Box>
                  </>
                )}
              </Card.Body>
            </Card.Root>
          </Link>
        ))}
      </Container>
    </ApolloWrapper>
  )
}
