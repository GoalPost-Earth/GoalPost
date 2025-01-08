import { Box, Card, Flex, Text } from '@chakra-ui/react'
import { Avatar } from '.'
import React from 'react'
import Link from 'next/link'
import { Person } from '@/gql/graphql'

export function EntityOwnerCard({
  person,
}: {
  person: Pick<Person, 'name' | 'email' | 'photo'>
}) {
  if (!person) {
    return <></>
  }

  return (
    <Card.Root
      my={0}
      width={{ base: '100%', lg: '320px' }}
      border={{ lg: '2px solid #E19E48' }}
      borderRadius={{ base: '16px', lg: '24px' }}
      minHeight={{ lg: '45vh' }}
    >
      <Card.Body
        padding={4}
        height={{ base: 'fit-content', lg: '100%' }}
        flexGrow="1"
        gap={2}
        flexDirection={{ base: 'row', lg: 'column' }}
        alignItems={{ lg: 'center' }}
        justifyContent={{ lg: 'center' }}
      >
        <Avatar
          src={person.photo ?? undefined}
          size="2xl"
          name={person.name}
          width={{ lg: '200px' }}
          height={{ lg: '200px' }}
        />
        <Flex flexDirection={'column'}>
          <Text display={{ base: 'block', lg: 'none' }} fontWeight={'light'}>
            Resource Owner
          </Text>
          <Text
            fontWeight={'bold'}
            fontSize={'clamp(1.125rem, 1vw + 0.7rem, 1.313rem)'}
          >
            {person.name}
          </Text>
        </Flex>
        <Box
          textAlign={'center'}
          fontSize="sm"
          fontWeight="light"
          display={{ base: 'none', lg: 'block' }}
        >
          <Link href={`mailto:${person.email}`}>
            <Text my={2}>{person.email}</Text>
          </Link>
          <Text>Created by</Text>
          <Text>{person.name}</Text>
        </Box>
      </Card.Body>
    </Card.Root>
  )
}
