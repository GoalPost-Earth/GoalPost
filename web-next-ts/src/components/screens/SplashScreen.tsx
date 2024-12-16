import { Center, Container, Image, Box } from '@chakra-ui/react'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'

const SplashScreen = () => {
  const message = 'Welcome to Goalpost!'

  return (
    <Container>
      <Center height="70vh" alignContent="center">
        <Box display="flex" flexDirection="column">
          <Image src="/goalpost-logo.png" alt="Goalpost Logo" />
          <TextGenerateEffect duration={3} filter={false} words={message} />
        </Box>
      </Center>
    </Container>
  )
}

export default SplashScreen
