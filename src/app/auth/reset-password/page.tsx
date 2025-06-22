'use client'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/react-hook-form'

function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || ''
  const email = searchParams?.get('email') || ''

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    reset,
  } = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (values: {
    newPassword: string
    confirmPassword: string
  }) => {
    setErrorMsg('')
    setSuccess('')
    if (!token) {
      setErrorMsg('Invalid or missing token.')
      return
    }
    if (values.newPassword !== values.confirmPassword) {
      setErrorMsg('Passwords do not match')
      setFormError('confirmPassword', { message: 'Passwords do not match' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword: values.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Request failed')
        if (data.error) setFormError('newPassword', { message: data.error })
      } else {
        setSuccess(
          'Your password has been reset successfully. You can now log in.'
        )
        reset()
        setTimeout(() => router.push('/auth/login'), 2000)
      }
    } catch {
      setErrorMsg('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg={'gray.50'}>
      <Box p={8} rounded="xl" boxShadow="lg" w="full" maxW="md">
        <Heading as="h1" size="lg" textAlign="center" color="brand.600" mb={2}>
          Reset your password
        </Heading>
        {email && (
          <Text textAlign="center" color="gray.600" mb={4}>
            for {email}
          </Text>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mb={6}>
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              control={control}
              errors={errors}
              required
              minLength={8}
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              control={control}
              errors={errors}
              required
            />
          </Box>
          {errorMsg && (
            <Text color="red.500" mb={4} textAlign="center">
              {errorMsg}
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
            Reset Password
          </Button>
        </form>
      </Box>
    </Flex>
  )
}

export default ResetPasswordPage
