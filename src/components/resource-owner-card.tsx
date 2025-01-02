import { Box, Card, Flex, Text } from '@chakra-ui/react'
import { Avatar } from './ui'
import React from 'react'
import Link from 'next/link'

export default function ResourceOwnerCard({
  image,
  name,
  email,
}: {
  image: string
  name: string
  email: string
}) {
  return (
    <Card.Root
      my={{ base: 10, lg: 0 }}
      maxWidth={'320px'}
      width="100%"
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
          src={image}
          size="2xl"
          name={name}
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
            {name}
          </Text>
        </Flex>
        <Box
          textAlign={'center'}
          fontSize="sm"
          fontWeight="light"
          display={{ base: 'none', lg: 'block' }}
        >
          <Link href={`mailto:${email}`}>
            <Text my={2}>{email}</Text>
          </Link>
          <Text>This resource is provided by</Text>
          <Text>{name}</Text>
        </Box>
      </Card.Body>
    </Card.Root>
  )
}
