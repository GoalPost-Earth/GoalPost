import { Box, Card, Flex } from '@chakra-ui/react'
import { Avatar } from './avatar'

export function ActionCard({
  name,
  photo,
  actionInfo,
  createdAt,
  actionName,
  icon,
  content,
}: {
  name: string
  photo: string
  actionInfo: string | undefined
  createdAt: string
  actionName: string | undefined
  icon: React.ReactElement
  content: React.ReactNode
}) {
  const createdData = new Date(createdAt).toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })

  const time =
    Date.now() - new Date(createdAt).getTime() < 86400000
      ? createdData
      : new Date(createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

  const cardColors = {
    Goal: '#FFF0F0',
    CoreValue: '#E4FCD8',
    Community: '#D8F2FC',
  }

  return (
    <Card.Root
      p={{ base: 2, lg: 4 }}
      width="100%"
      bgColor={cardColors[actionName as keyof typeof cardColors]}
      position="relative"
      borderRadius="lg"
      boxShadow="sm"
    >
      <Box
        position="absolute"
        top={1.5}
        right={1.5}
        padding={1.5}
        bg="white"
        borderRadius="full"
      >
        {icon}
      </Box>
      <Card.Header p={{ base: 1, lg: 4 }}>
        <Flex gap={2} alignItems="center">
          <Avatar src={photo} />
          <Box>
            <span style={{ fontWeight: 'bold' }}>{name}</span> {actionInfo} •{' '}
            {time}
          </Box>
        </Flex>
      </Card.Header>
      <Card.Body p={{ base: 2, lg: 4 }}>{content}</Card.Body>
    </Card.Root>
  )
}
