'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/app/contexts'
import { useForm } from 'react-hook-form'
import Input from '@/components/react-hook-form/Input'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

  const router = useRouter()
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
        router.push(data.returnTo || '/')
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
            Sign in to GoalPost
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
            <div className="mb-6">
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
            </div>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <Button
              type="submit"
              className="w-full mb-4"
              disabled={loading || isSubmitting}
            >
              Sign In
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500">
            Forgot your password?{' '}
            <Link
              href="/auth/forgot-password"
              className="text-blue-500 font-medium"
            >
              Reset it
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
