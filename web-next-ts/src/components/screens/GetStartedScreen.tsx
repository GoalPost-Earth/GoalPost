import { Box } from '@chakra-ui/react'
import { Button } from '@/components/ui'

const GetStartedScreen = () => {
  return (
    <Box
      height="100vh"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      backgroundImage="url(/assets/images/onboarding-bg.png)"
    >
      <Box
        height="100vh"
        bgGradient="to-t"
        gradientFrom="rgba(0, 0, 0, 0.7)"
        gradientTo="rgba(0, 0, 0, 0)"
      />
      <Box
        position="absolute"
        bottom={0}
        width="100%"
        height="50%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgGradient="linear(to-t, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))"
      >
        <a href="/api/auth/login?returnTo=/">
          <Button size="lg" paddingY={6}>
            Get Started
          </Button>
        </a>
      </Box>
    </Box>
  )
}

export default GetStartedScreen
