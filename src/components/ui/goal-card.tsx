import { Badge, Box, Card, Flex, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import EllipseIcon from '../icons/EllipseIcon'
import { formatDate, getInitials } from '@/app/utils'
import { CalenderIcon } from '../icons'

const GoalCard = ({
  id,
  photo,
  name,
  createdAt,
  description,
}: {
  id: string
  photo: string | null | undefined
  name: string
  createdAt: string
  description: string | null | undefined
}) => {
  const goalDate = formatDate(createdAt)

  return (
    <Card.Root key={id} height="100%" borderRadius="lg" boxShadow="sm">
      <Link href={'/goal/' + id}>
        <Card.Body
          flexDirection="row"
          p={{ base: 2, lg: 4 }}
          gap={{ base: 4, lg: 0 }}
          height="100%"
          alignItems={{ base: 'center', lg: 'flex-start' }}
        >
          <Flex
            bg="#B7E0A3"
            width="30%"
            height="auto"
            alignSelf="stretch"
            margin={{ lg: '-16px' }}
            marginRight={{ lg: '16px' }}
            textAlign="center"
            alignItems="center"
            justifyContent="center"
            fontWeight="500"
            fontSize="clamp(0.75rem, 3.4vw + 0rem, 3rem)"
            borderRadius="md"
            borderTopRightRadius={{ lg: 'none' }}
            borderBottomRightRadius={{ lg: 'none' }}
          >
            {getInitials(name).toUpperCase()}
          </Flex>
          <Box width="100%">
            <Text fontWeight="bold">{name}</Text>
            <Flex gap={2} mt={1} fontSize="xs">
              <Badge colorPalette="brand" py={1} px={2} borderRadius="full">
                Offer
              </Badge>
              <Flex gap={1} alignItems="center">
                <CalenderIcon />
                {goalDate}
              </Flex>
              <Badge
                marginLeft="auto"
                color="#B7E0A3"
                bg="inherit"
                fontWeight="bold"
              >
                <EllipseIcon width="14px" height="14px" /> Active
              </Badge>
            </Flex>
            <Text
              display={{ base: 'none', lg: 'block' }}
              lineClamp={3}
              fontSize="sm"
              fontWeight={300}
              mt={2}
            >
              {description}
            </Text>
          </Box>
        </Card.Body>
      </Link>
    </Card.Root>
  )
}

export default GoalCard
