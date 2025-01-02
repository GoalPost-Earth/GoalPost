import { Box, Card, Flex, Text } from '@chakra-ui/react'
import { Avatar } from '.'
import React from 'react'

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
      width={'100%'}
      border={{ lg: '2px solid #E19E48' }}
      borderRadius={{ lg: '24px' }}
      minHeight={{ lg: '512px' }}
    >
      <Card.Body
        padding={4}
        height={{ base: 'fit-content', lg: '100%' }}
        flexGrow="1"
        gap={2}
        flexDirection={{ base: 'row', lg: 'column' }}
        alignItems={{ lg: 'center' }}
        justifyContent={{ lg: 'center' }}
        columnGap={8}
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
          <Text my={2}>{email}</Text>
          <Text>This resource is provided by</Text>
          <Text>{name}</Text>
        </Box>
      </Card.Body>
    </Card.Root>
  )
}
