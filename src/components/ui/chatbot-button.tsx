'use client'
import React from 'react'
import { ChatBotIcon } from '../icons'
import { Button } from './button'
import { usePathname, useRouter } from 'next/navigation'

const ChatBotButton = () => {
  const pathname = usePathname()
  const router = useRouter()
  const isSearchPage = pathname === '/search'

  if (isSearchPage) {
    return <></>
  }

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
      zIndex={1000}
      onClick={() => {
        router.push('/chatbot')
      }}
    >
      <ChatBotIcon color="white" />
    </Button>
  )
}

export default ChatBotButton
