'use client'
import React, { useState } from 'react'
import { Box, Button, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/react-hook-form'

function SignupPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm({
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (values: {
    email: string
    password: string
    confirmPassword: string
  }) => {
    setLoading(true)
    setError('')
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match')
      setFormError('confirmPassword', { message: 'Passwords do not match' })
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Sign up failed')
        setFormError('email', { message: data.error || 'Sign up failed' })
      } else {
        window.location.href = '/auth/login'
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
          Create your GoalPost account
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
          <Box mb={4}>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              control={control}
              errors={errors}
              required
            />
          </Box>
          <Box mb={6}>
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
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
            Sign Up
          </Button>
        </form>
        <Text textAlign="center" fontSize="sm" color="gray.500">
          Already have an account?{' '}
          <Link href="/auth/login" color="brand.500" fontWeight="medium">
            Sign in
          </Link>
        </Text>
      </Box>
    </Flex>
  )
}

export default SignupPage
