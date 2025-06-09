'use client'
import React, { useState } from 'react'
import { Box, Button, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/react-hook-form'

function ForgotPasswordPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm({
    defaultValues: { email: '' },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (values: { email: string }) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Request failed')
        setFormError('email', { message: data.error || 'Request failed' })
      } else {
        setSuccess(
          'If an account with that email exists, you will receive password reset instructions.'
        )
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
          Forgot your password?
        </Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mb={6}>
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
          {error && (
            <Text color="red.500" mb={4} textAlign="center">
              {error}
            </Text>
          )}
          {success && (
            <Text color="green.500" mb={4} textAlign="center">
              {success}
            </Text>
          )}
          <Button
            colorScheme="brand"
            type="submit"
            w="full"
            mb={4}
            loading={loading || isSubmitting}
          >
            Send Reset Link
          </Button>
        </form>
        <Text textAlign="center" fontSize="sm" color="gray.500">
          Remembered your password?{' '}
          <Link href="/auth/login" color="brand.500" fontWeight="medium">
            Sign in
          </Link>
        </Text>
      </Box>
    </Flex>
  )
}

export default ForgotPasswordPage
