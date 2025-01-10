import {
  Badge,
  Box,
  Card,
  Container,
  Flex,
  HStack,
  Image,
  Text,
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { EllipseIcon } from '../../icons'
import { formatDate, getInitials } from '@/utils'
import { CalenderIcon } from '../../icons'
import { Goal } from '@/gql/graphql'

export const GoalCard = ({
  goal,
}: {
  goal: Pick<
    Goal,
    'id' | 'photo' | 'name' | 'status' | 'createdAt' | 'description'
  >
}) => {
  if (!goal) return null
  const { id, photo, name, status, createdAt, description } = goal

  const goalDate = formatDate(createdAt)

  return (
    <Link
      href={`/goal/${id}`}
      style={{ width: '100%', display: 'block', height: '100%' }}
    >
      <Card.Root
        flexDirection={{ base: 'column', lg: 'row' }}
        overflow="hidden"
        maxW="xl"
        borderRadius="lg"
        boxShadow="md"
        bg="brand.50"
        p={{ base: 4, lg: 0 }}
        gap={{ base: 4, lg: 0 }}
        height="100%"
      >
        {!!photo ? (
          <Image
            objectFit="cover"
            width={{ base: '50px', lg: '100%' }}
            height={{ base: '50px', lg: '100%' }}
            maxW="150px"
            src={photo ?? ''}
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
          <Card.Body p={{ base: 0, lg: 5 }} width="100%">
            <Card.Title lineClamp={1} fontSize="md" fontWeight="bolder">
              {name}
            </Card.Title>
            <HStack mt="2">
              {/* <Badge
                colorPalette="brand"
                borderRadius="full"
                p={2}
                fontSize="xs"
              >
                Offer
              </Badge> */}
              <Flex fontSize="xs" fontWeight="bold" alignItems="center" gap={1}>
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
              {description}
            </Card.Description>
          </Card.Body>
        </Box>
      </Card.Root>
    </Link>
  )
}
