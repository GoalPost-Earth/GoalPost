import { Center, Container, Spinner } from '@chakra-ui/react'
import React from 'react'

const LoadingPage = () => {
  return (
    <Container>
      <Center height="100vh" alignContent="center">
        <Spinner animationDuration="0.8s" size="xl" color="blue.600" />
      </Center>
    </Container>
  )
}

export default LoadingPage
