import {
  Badge,
  Box,
  Card,
  CardRootProps,
  Container,
  Flex,
  HStack,
  Image,
  Link,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import { EllipseIcon } from '../../icons'
import { formatDate, getInitials } from '@/utils'
import { CalenderIcon } from '../../icons'
import { Goal } from '@/gql/graphql'
import { AutoLink } from '../autolink'

export const GoalCard = ({
  goal,
  ...rest
}: {
  goal: Pick<
    Goal,
    'id' | 'photo' | 'name' | 'status' | 'createdAt' | 'description'
  >
} & CardRootProps) => {
  if (!goal) return null
  const { id, photo, name, status, createdAt, description } = goal

  const goalDate = formatDate(createdAt)

  return (
    <Card.Root
      borderRadius="lg"
      boxShadow="md"
      bg="brand.50"
      p={{ base: 4, lg: 0 }}
      gap={{ base: 4, lg: 0 }}
      {...rest}
    >
      <Link
        href={`/goal/${id}`}
        style={{
          width: '100%',
          height: '100%',
          textDecoration: 'none',
          display: 'flex',
        }}
      >
        <Box
          display="flex"
          flexDirection={{ base: 'column', lg: 'row' }}
          overflow="hidden"
          alignItems={{ base: 'flex-start', lg: 'center' }}
          height="100%"
          width="100%"
        >
          {!!photo ? (
            <Image
              objectFit="cover"
              width={{ base: '50px', lg: '100%' }}
              height={{ base: '50px', lg: '100%' }}
              maxW="150px"
              borderRadius={{ base: 'sm', lg: 'lg' }}
              borderRightRadius={{ base: 'sm', lg: '0' }}
              src={photo ?? undefined}
              alt={name}
            />
          ) : (
            <Container
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              width={{ base: '50px', lg: '100%' }}
              height={{ base: '50px', lg: 'auto' }}
              alignSelf={{ base: 'flex-start', lg: 'stretch' }}
              minHeight={{ lg: 'full' }}
              bg="#B7E0A3"
              maxW="150px"
              margin={0}
              fontSize="clamp(0.75rem, 6.7vw - 3rem, 3rem)"
              borderRadius={{ base: 'lg', lg: '0' }}
              p={{ lg: 5 }}
            >
              {getInitials(name).toUpperCase()}
            </Container>
          )}
          <Box width="100%" height="100%">
            <Card.Body p={{ base: 0, lg: 5 }} width="100%" height="100%">
              <Card.Title lineClamp={1} fontSize="md" fontWeight="bolder">
                {name}
              </Card.Title>
              <HStack mt="2">
                <Flex
                  fontSize="xs"
                  fontWeight="bold"
                  alignItems="center"
                  gap={1}
                >
                  <CalenderIcon />
                  <Text mt={'2px'}>{goalDate}</Text>
                </Flex>
                <Badge
                  variant="subtle"
                  color="#B7E0A3"
                  borderRadius="full"
                  p={2}
                  bg="none"
                  fontSize="xs"
                  fontWeight="bold"
                  ml="auto"
                >
                  <EllipseIcon width="12px" height="12px" />
                  {status}
                </Badge>
              </HStack>
              <Card.Description lineClamp={2} maxWidth="250px" width="100%">
                <AutoLink text={description as string} />
              </Card.Description>
            </Card.Body>
          </Box>
        </Box>
      </Link>
    </Card.Root>
  )
}
