import { HStack } from '@chakra-ui/react'
import React from 'react'
import { Avatar } from '../ui'

const AvatarCarousel = () => {
  return (
    <HStack gap="4">
      <Avatar
        name="Random"
        colorPalette="pink"
        src="https://randomuser.me/api/portraits/men/70.jpg"
      />
      <Avatar
        name="Random"
        colorPalette="green"
        src="https://randomuser.me/api/portraits/men/54.jpg"
      />
      <Avatar
        name="Random"
        colorPalette="blue"
        src="https://randomuser.me/api/portraits/men/42.jpg"
      />
    </HStack>
  )
}

export default AvatarCarousel
