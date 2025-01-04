import {
  Box,
  Card,
  CardHeaderProps,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react'
import { Avatar } from './avatar'
import Link from 'next/link'
import { Community } from '@/gql/graphql'

export function CommunityCard({
  community,
  ...rest
}: {
  community: Pick<Community, 'id' | 'name' | 'description' | 'members'>
} & CardHeaderProps) {
  const { id, name, description, members } = community
  const displayedMembers = members.slice(0, 2)
  return (
    <Card.Root
      width="100%"
      p={3}
      border="none"
      boxShadow="lg"
      borderRadius="md"
    >
      <Link href={`/community/${id}`}>
        <Card.Header p={2}>
          <Heading size="md" {...rest}>
            {name}
          </Heading>
        </Card.Header>
        <Card.Body p={2}>
          <Text fontWeight={300} lineClamp={{ base: 2, lg: 3 }}>
            {description}
          </Text>
        </Card.Body>
        <Card.Footer
          justifyContent="flex-end"
          position="relative"
          mt={{ lg: 2 }}
        >
          {displayedMembers.map((member, index) => (
            <Box
              key={`${member.__typename}-${index}`}
              position="absolute"
              bottom={0}
              left={index * 20 + 'px'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              overflow="hidden"
            >
              <Avatar
                src={member.photo ?? undefined}
                width={{ base: '25px', lg: '30px' }}
                height={{ base: '25px', lg: '30px' }}
              />
            </Box>
          ))}
          <Flex
            position="absolute"
            bottom={0}
            left="35px"
            width={{ base: '25px', lg: '30px' }}
            height={{ base: '25px', lg: '30px' }}
            borderRadius="full"
            bg="brand.200"
            color="brand.600"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontSize={{ base: 'xs', lg: 'sm' }}
              textAlign={'center'}
              fontWeight="bold"
            >
              +{members.length > 2 && members.length - 2}
            </Text>
          </Flex>
        </Card.Footer>
      </Link>
    </Card.Root>
  )
}
