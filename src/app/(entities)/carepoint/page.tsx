import { Container, Heading } from '@chakra-ui/react'

export default function AllCarePoints() {
  return (
    <Container p={4}>
      <Heading
        position="sticky"
        left={4}
        my={5}
        fontSize="3xl"
        fontWeight="extrabold"
      >
        Care Points
      </Heading>
    </Container>
  )
}
