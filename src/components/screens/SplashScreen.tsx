import { Center, Container, Box } from '@chakra-ui/react'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { AppLogo } from '@/components/ui'

const SplashScreen = () => {
  const message = 'Welcome to Goalpost!'

  return (
    <Container>
      <Center height="70vh" alignContent="center">
        <Box display="flex" flexDirection="column">
          <Center>
            <AppLogo />
          </Center>
          <TextGenerateEffect duration={3} filter={false} words={message} />
        </Box>
      </Center>
    </Container>
  )
}

export default SplashScreen
