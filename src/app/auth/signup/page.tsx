'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import Input from '@/components/react-hook-form/Input'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function SignupPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm({
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })
  const router = useRouter()
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
        router.push('/')
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
            Create your GoalPost account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
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
            <div className="mb-4">
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
            </div>
            <div className="mb-6">
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
            </div>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <Button
              type="submit"
              className="w-full mb-4"
              disabled={loading || isSubmitting}
            >
              Sign Up
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-500 font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignupPage
