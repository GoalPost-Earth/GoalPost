'use client'
import React, { useState } from 'react'
import { Box, Button, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { useApp } from '@/app/contexts'

function LoginPage() {
  const { user, setUser } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login?returnTo=/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      console.log('🚀 ~ page.tsx:24 ~ data:', data)
      setUser(data.user)
      console.log('🚀 ~ page.tsx:25 ~ user:', user)

      if (!res.ok) {
        setError(data.error || 'Login failed')
      } else {
        // window.location.href = data.returnTo || '/'
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg={'gray.50'}>
      <Box p={8} rounded="xl" boxShadow="lg" w="full" maxW="md">
        <Heading as="h1" size="lg" textAlign="center" color="brand.600" mb={6}>
          Sign in to GoalPost
        </Heading>
        <form onSubmit={handleSubmit}>
          <Box mb={4}>
            <Text fontWeight="medium" mb={1}>
              Email address
            </Text>
            <input
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: 'inherit',
                color: 'inherit',
              }}
            />
          </Box>
          <Box mb={6}>
            <Text fontWeight="medium" mb={1}>
              Password
            </Text>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: 'inherit',
                color: 'inherit',
              }}
            />
          </Box>
          {error && (
            <Text color="red.500" mb={4} textAlign="center">
              {error}
            </Text>
          )}
          <Button
            colorScheme="brand"
            type="submit"
            w="full"
            mb={4}
            loading={loading}
          >
            Sign In
          </Button>
        </form>
        <Text textAlign="center" fontSize="sm" color="gray.500">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" color="brand.500" fontWeight="medium">
            Sign up
          </Link>
        </Text>
      </Box>
    </Flex>
  )
}

export default LoginPage
