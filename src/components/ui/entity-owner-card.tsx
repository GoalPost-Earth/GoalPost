import { Box, Card, Flex, Text } from '@chakra-ui/react'
import { Avatar } from '.'
import React from 'react'
import Link from 'next/link'
import { Community, Person } from '@/gql/graphql'

export function EntityOwnerCard({
  person,
  community,
}: {
  person: Pick<Person, '__typename' | 'id' | 'name' | 'email' | 'photo'>
  community?: Pick<Community, '__typename' | 'id' | 'name'>
}) {
  if (!person && !community) {
    return <></>
  }

  const owner = person || community

  return (
    <Card.Root
      my={0}
      width={{ base: '100%', lg: '320px' }}
      border={{ lg: '2px solid #E19E48' }}
      borderRadius={{ base: '16px', lg: '24px' }}
      minHeight={{ lg: '45vh' }}
    >
      <Link href={`/${owner.__typename?.toLowerCase()}/${owner.id}`}>
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
            src={owner.photo ?? undefined}
            size="2xl"
            name={owner.name}
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
              {owner.name}
            </Text>
          </Flex>
          <Box
            textAlign={'center'}
            fontSize="sm"
            fontWeight="light"
            display={{ base: 'none', lg: 'block' }}
          >
            <Link href={`mailto:${owner.email}`}>
              <Text my={2}>{owner.email}</Text>
            </Link>
            <Text>Created by</Text>
            <Text>{owner.name}</Text>
          </Box>
        </Card.Body>
      </Link>
    </Card.Root>
  )
}
