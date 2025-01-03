import { Box, VStack } from '@chakra-ui/react'

const BKG_IMG_URL =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGhvbWUlMjBidWlsZGluZyUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800'

export function ProfileBackground() {
  return (
    <VStack display={{ base: 'none', lg: 'flex' }} mx={-8}>
      <Box
        width={'100%'}
        height={'210px'}
        backgroundImage={`url(${BKG_IMG_URL})`}
        backgroundSize={'cover'}
        backgroundRepeat={'no-repeat'}
        borderTopRadius={16}
      ></Box>
    </VStack>
  )
}
