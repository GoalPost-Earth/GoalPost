'use client'
import React, { useState } from 'react'
import { Box, Button, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { useApp } from '@/app/contexts'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/react-hook-form'

function LoginPage() {
  const { setUser } = useApp()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm({
    defaultValues: { email: '', password: '' },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (values: { email: string; password: string }) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login?returnTo=/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      if (data.token) {
        localStorage.setItem('token', data.token)
        // Set a cookie (expires in 7 days)
        document.cookie = `accessToken=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }
      if (!res.ok) {
        setError(data.error || 'Login failed')
        setFormError('email', { message: data.error || 'Login failed' })
      } else {
        window.location.href = data.returnTo || '/'
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mb={4}>
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              control={control}
              errors={errors}
              required
            />
          </Box>
          <Box mb={6}>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              control={control}
              errors={errors}
              required
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
            loading={loading || isSubmitting}
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
