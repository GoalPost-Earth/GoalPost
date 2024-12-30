'use client'

import { GET_ALL_RESOURCES } from '@/app/graphql'
import ApolloWrapper from '@/components/ApolloWrapper'
import { Avatar } from '@/components/ui'
import { useQuery } from '@apollo/client'
import { Card, Container, Heading, IconButton, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { LuPhone } from 'react-icons/lu'

export default function AllResources() {
  const { data, loading, error } = useQuery(GET_ALL_RESOURCES)

  const resources = data?.resources ?? []

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading>All Resources</Heading>
        {resources?.map((resource) => (
          <Link href={'/resource/' + resource.id} key={resource.id}>
            <Card.Root key={resource.id} my={1}>
              <Card.Header py={2} bgColor="gray.100">
                {resource?.name}
              </Card.Header>
              <Card.Body>
                <Card.Description>{resource?.description}</Card.Description>
              </Card.Body>
              <Card.Footer justifyContent="flex-end">
                <>
                  <Avatar src={resource?.providedByPerson[0]?.name} size="sm" />
                  <Text fontSize="small" fontWeight="bold">
                    {resource?.providedByPerson[0]?.name}
                  </Text>
                  <Link href={`tel:${resource?.providedByPerson[0]?.phone}`}>
                    <IconButton size="xs" variant="ghost" aria-label="phone">
                      {<LuPhone />}
                    </IconButton>
                  </Link>
                </>
              </Card.Footer>
            </Card.Root>
          </Link>
        ))}
      </Container>
    </ApolloWrapper>
  )
}
