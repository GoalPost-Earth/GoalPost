'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Input from '@/components/react-hook-form/Input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-blue-600 mb-2">
            Reset your password
          </CardTitle>
          {email && (
            <p className="text-center text-gray-600 mb-4">for {email}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
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
            </div>
            {errorMsg && (
              <p className="text-red-500 mb-4 text-center">{errorMsg}</p>
            )}
            {success && (
              <p className="text-green-500 mb-4 text-center">{success}</p>
            )}
            <Button
              type="submit"
              className="w-full mb-4"
              disabled={loading || isSubmitting}
            >
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPasswordPage
