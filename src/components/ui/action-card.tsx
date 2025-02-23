import { Box, Card, Center, Flex } from '@chakra-ui/react'
import { Avatar } from './avatar'
import Link from 'next/link'

export function ActionCard({
  id,
  name,
  photo,
  actionInfo,
  personId,
  createdAt,
  actionName,
  icon,
  content,
}: {
  id: string
  name: string
  photo: string | undefined
  personId: string
  actionInfo: string | undefined
  createdAt: string
  actionName: string | undefined
  icon: React.ReactElement
  content: React.ReactNode
}) {
  const createdDate = new Date(createdAt).toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })

  const time =
    Date.now() - new Date(createdAt).getTime() < 86400000
      ? createdDate
      : new Date(createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

  const cardColors = {
    Goal: '#FFF0F0',
    CoreValue: '#E4FCD8',
    Community: '#D8F2FC',
    Resource: '#FEEBCB',
    CarePoint: '#FED7D7',
    Log: '#F5F5F5',
  }

  return (
    <Card.Root
      p={{ base: 2, lg: 4 }}
      width="100%"
      maxWidth={{ base: '100%', md: '520px' }}
      bgColor={cardColors[actionName as keyof typeof cardColors]}
      position="relative"
      borderRadius="lg"
      boxShadow="sm"
    >
      <Center
        position="absolute"
        top={1.5}
        right={1.5}
        padding={1}
        width="30px"
        height="30px"
        bg="white"
        borderRadius="full"
      >
        {icon}
      </Center>
      <Card.Header px={0} py={2}>
        <Flex gap={2} alignItems="center">
          <Link href={`/person/${personId}`}>
            <Avatar src={photo} />
          </Link>
          <Box fontSize="14px" maxWidth="70%">
            <Link
              href={`/person/${personId}`}
              style={{ fontWeight: 'bold', fontSize: '16px' }}
            >
              {name}
            </Link>{' '}
            {actionInfo} • {time}
          </Box>
        </Flex>
      </Card.Header>
      <Card.Body mt={{ base: 2, lg: 0 }} p={0} pl={{ base: 0, xl: 10 }}>
        {content}
      </Card.Body>
      {actionName !== 'Log' && (
        <Card.Footer
          alignSelf="flex-end"
          width="fit-content"
          position="relative"
          mt={2}
          fontSize="sm"
          textDecoration={'underline'}
          color="GrayText"
          _hover={{
            color: 'brand.500',
            textDecorationThickness: '2px',
            cursor: 'pointer',
          }}
          p={0}
        >
          <Link href={`/${actionName?.toLowerCase()}/${id}`}>See more</Link>
        </Card.Footer>
      )}
    </Card.Root>
  )
}
