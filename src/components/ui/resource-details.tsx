import { Container, Text, VStack } from '@chakra-ui/react'

export default function ResourceDetails({ resource }: { resource: any }) {
  return (
    <VStack
      p={4}
      bg={'gray.contrast'}
      borderRadius={'2xl'}
      boxShadow={'xs'}
      alignItems={'flex-start'}
    >
      <VStack width={{ base: '100%', lg: '80%' }} gap={4}>
        {resource.description && (
          <ResourceDetail title="Description" details={resource.description} />
        )}
        {resource.why && <ResourceDetail title="Why" details={resource.why} />}
        {resource.location && (
          <ResourceDetail title="Location" details={resource.location} />
        )}
        {resource.time && (
          <ResourceDetail title="Time" details={resource.time} />
        )}
        {resource.status && (
          <ResourceDetail title="Status" details={resource.status} />
        )}
      </VStack>
    </VStack>
  )
}

function ResourceDetail({
  title,
  details,
}: {
  title: string
  details: string
}) {
  return (
    <Container>
      <Text fontSize="sm" fontWeight="light">
        {title}
      </Text>
      <Text>{details}</Text>
    </Container>
  )
}
