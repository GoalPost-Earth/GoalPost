import { Box, Container, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { AppLogo, Button } from '@/components/ui'
import Image from 'next/image'

const GetStartedScreen = () => {
  return (
    <>
      <Box
        height="100vh"
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        backgroundImage="url(/assets/images/onboarding-bg.png)"
        display={{ base: 'block', lg: 'none' }}
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
          flexDirection="column"
          justifyContent="center"
          padding="25px"
          gap="50px"
          alignItems="center"
          bgGradient="linear(to-t, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))"
        >
          <VStack width="100%" textAlign="center" gap={5}>
            <AppLogo width={100} height={100} />
            <Text fontSize="2rem" fontWeight="bold" color="brand.100">
              Hello and Welcome!
            </Text>
            <Text fontSize="sm" color="brand.100" opacity={0.6}>
              Connect with and care for your community.
            </Text>
          </VStack>
          <Button
            as="a"
            href="/api/auth/login?returnTo=/"
            size="lg"
            paddingY={6}
          >
            Next
          </Button>
        </Box>
      </Box>
      <DesktopGetStartedScreen />
    </>
  )
}

function DesktopGetStartedScreen() {
  return (
    <HStack display={{ base: 'none', lg: 'flex' }} height={'100vh'}>
      <Box
        position="relative"
        flex={1}
        width="40%"
        height={'100%'}
        overflow="hidden"
      >
        <Image
          src="/assets/images/bottom-view-group-diverse-friends-posing.png"
          fill
          objectFit="cover"
          alt="get started"
        />
      </Box>
      <VStack
        flex={1}
        width="60%"
        gap={4}
        padding={'60px'}
        height={'100%'}
        justifyContent="center"
        alignSelf="start"
      >
        <HStack alignSelf="start">
          <AppLogo />
          <Heading>GoalPost</Heading>
        </HStack>
        <Container>
          <Heading fontWeight="bold" alignSelf="start">
            Welcome!
          </Heading>
          <Heading alignSelf="start" fontSize="4xl">
            Connect with and care for your community
          </Heading>
        </Container>
        <Button as="a" href="/api/auth/login?returnTo=/" size="lg" paddingY={6}>
          Next
        </Button>
      </VStack>
    </HStack>
  )
}

export default GetStartedScreen
