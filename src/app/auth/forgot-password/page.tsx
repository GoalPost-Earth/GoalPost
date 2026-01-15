'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import Input from '@/components/react-hook-form/Input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-blue-600">
            Forgot your password?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
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
            </div>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            {success && (
              <p className="text-green-500 mb-4 text-center">{success}</p>
            )}
            <Button
              type="submit"
              className="w-full mb-4"
              disabled={loading || isSubmitting}
            >
              Send Reset Link
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500">
            Remembered your password?{' '}
            <Link href="/auth/login" className="text-blue-500 font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
