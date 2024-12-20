import { Box, Text, VStack } from '@chakra-ui/react'
import { Button } from '@/components/ui'
import Link from 'next/link'
import Image from 'next/image'

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
        flexDirection="column"
        justifyContent="center"
        padding="25px"
        gap="50px"
        alignItems="center"
        bgGradient="linear(to-t, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))"
      >
        <VStack width="100%" textAlign="center" gap={5}>
          <Image
            src="/goalpost-logo.png"
            alt="Goalpost Logo"
            width={100}
            height={100}
          />
          <Text fontSize="2rem" fontWeight="bold" color="brand.100">
            Hello and Welcome
          </Text>
          <Text fontSize="sm" color="brand.100" opacity={0.6}>
            Amplify your social circles,and engage, share and make your mark in
            the community.
          </Text>
        </VStack>
        <Link href="/api/auth/login?returnTo=/">
          <Button size="lg" paddingY={6}>
            Next
          </Button>
        </Link>
      </Box>
    </Box>
  )
}

export default GetStartedScreen
