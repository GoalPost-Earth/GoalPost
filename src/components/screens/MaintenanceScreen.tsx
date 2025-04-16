// filepath: /Users/jd/Documents/dev/upwork/GoalPost/src/components/screens/MaintenanceScreen.tsx
'use client'

import { Box, Center, Container, Heading, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { SettingsIcon } from '@/components/icons'

const MaintenanceScreen = () => {
  return (
    <Container>
      <Center height="100vh" alignContent="center">
        <VStack gap={6}>
          <Box boxSize="100px" color="orange.500">
            <SettingsIcon width="100px" height="100px" />
          </Box>
          <Heading textAlign="center" size="xl" color="heading">
            Under Maintenance
          </Heading>
          <Text textAlign="center" fontSize="lg" color="text">
            We&apos;re currently performing some scheduled maintenance.
            <br />
            Please check back in a little while.
          </Text>
          <Text fontSize="md" color="gray.500">
            {new Date().toLocaleDateString()}
          </Text>
        </VStack>
      </Center>
    </Container>
  )
}

export default MaintenanceScreen
