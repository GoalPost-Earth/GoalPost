import React from 'react'
import { ChatBotIcon } from '../icons'
import { Button } from './button'

const ChatBotButton = () => {
  return (
    <Button
      display={'flex'}
      width="45px"
      height="45px"
      position="fixed"
      padding={1}
      bottom={5}
      right={2}
      bg={'#E19E48'}
      borderRadius={'full'}
      justifyContent={'center'}
      alignItems={'center'}
      transform={'translate(-50%, -50%)'}
    >
      <ChatBotIcon color="white" />
    </Button>
  )
}

export default ChatBotButton
