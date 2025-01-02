import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react'
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
    <HStack display={{ base: 'none', lg: 'flex' }} height={'100dvh'}>
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
        gap={12}
        padding={'60px'}
        height={'100%'}
        justifyContent="center"
      >
        <HStack alignSelf="start">
          <AppLogo width={100} height={100} alignSelf="flex-start" />
          <Heading>GoalPost</Heading>
        </HStack>
        <Text as="h1" fontSize="70px" fontWeight="bold" lineHeight={1}>
          Sense of Community
        </Text>
        <Text fontSize="20px">
          Stay connected to our favourite communities anytime, anywhere
        </Text>
        <Button as="a" href="/api/auth/login?returnTo=/" size="lg" paddingY={6}>
          Next
        </Button>
      </VStack>
    </HStack>
  )
}

export default GetStartedScreen
