import { Container } from '@chakra-ui/react'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'AI Chatbot',
  description: 'Discover the power of the AI chatbot',
}

export default function ChatbotLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <Container>{children}</Container>
}
