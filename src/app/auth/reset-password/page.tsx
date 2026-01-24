'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'

function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || ''
  const email = searchParams?.get('email') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors"
      style={{
        backgroundImage: `
        radial-gradient(at 18% 18%, color-mix(in srgb, var(--gp-primary) 12%, transparent) 0, transparent 55%),
        radial-gradient(at 82% 16%, color-mix(in srgb, var(--gp-accent-glow) 12%, transparent) 0, transparent 55%),
        radial-gradient(at 80% 85%, color-mix(in srgb, var(--gp-goal) 10%, transparent) 0, transparent 55%),
        radial-gradient(at 16% 86%, color-mix(in srgb, var(--gp-resource) 12%, transparent) 0, transparent 55%)
      `,
      }}
    >
      <div
        className="absolute inset-0 opacity-70 dark:opacity-90 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--gp-primary) 14%, transparent), transparent 75%)',
        }}
      />

      {/* Main Content Container */}
      <div className="relative w-full max-w-4xl flex flex-col items-center justify-center px-4">
        {/* Floating Gradient Blobs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gp-primary/12 dark:bg-gp-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gp-accent-glow/12 dark:bg-gp-accent-glow/10 rounded-full blur-[100px]" />

        {/* Organic Cloud Container */}
        <div
          className="w-full max-w-[500px] min-h-[500px] flex flex-col items-center justify-center p-12 relative z-10 transition-all duration-300 bg-gp-glass-bg backdrop-blur-[40px] border border-gp-glass-border shadow-[0_24px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
          style={{
            borderRadius: '60% 40% 70% 30% / 40% 50% 60% 50%',
          }}
        >
          <div className="flex flex-col items-center w-full max-w-xs space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="size-12 bg-white/50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/80 dark:border-white/10 shadow-sm dark:shadow-lg">
                <span className="material-symbols-outlined text-gp-primary text-2xl">
                  lock_reset
                </span>
              </div>
              <h1 className="text-3xl font-light text-gp-ink-strong dark:text-gp-ink-strong tracking-tight">
                Create New Password
              </h1>
              <p className="text-gp-ink-muted dark:text-gp-ink-soft text-xs uppercase tracking-[0.2em] font-medium">
                {email || 'Secure Your Account'}
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              {/* New Password Input */}
              <div className="relative">
                <input
                  {...register('newPassword', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  type="password"
                  placeholder="New Password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-2xl px-5 py-3.5 text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft/70 dark:placeholder-gp-ink-soft/70 focus:outline-none text-sm font-light transition-all duration-300 bg-white/55 backdrop-blur-[10px] border border-gp-glass-border dark:bg-white/[0.04] dark:border-white/10 focus:bg-white/85 focus:border-[color-mix(in_srgb,var(--gp-primary)_75%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_25%,transparent)] dark:focus:bg-white/10 dark:focus:border-[color-mix(in_srgb,var(--gp-primary)_80%,transparent)] dark:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_30%,transparent)]"
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1 ml-2">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                  })}
                  type="password"
                  placeholder="Confirm New Password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-2xl px-5 py-3.5 text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft/70 dark:placeholder-gp-ink-soft/70 focus:outline-none text-sm font-light transition-all duration-300 bg-white/55 backdrop-blur-[10px] border border-gp-glass-border dark:bg-white/[0.04] dark:border-white/10 focus:bg-white/85 focus:border-[color-mix(in_srgb,var(--gp-primary)_75%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_25%,transparent)] dark:focus:bg-white/10 dark:focus:border-[color-mix(in_srgb,var(--gp-primary)_80%,transparent)] dark:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_30%,transparent)]"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 ml-2">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <p className="text-red-500 text-sm text-center font-medium">
                  {errorMsg}
                </p>
              )}

              {/* Success Message */}
              {success && (
                <p className="text-green-600 dark:text-green-400 text-sm text-center font-medium">
                  {success}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full text-white rounded-2xl py-3.5 text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:translate-y-0 dark:hover:brightness-110"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 95%, white 5%), color-mix(in srgb, var(--gp-primary) 78%, black 22%))',
                  boxShadow:
                    '0 12px 32px color-mix(in srgb, var(--gp-primary) 48%, transparent)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow =
                      '0 16px 42px color-mix(in srgb, var(--gp-primary) 55%, transparent)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow =
                    '0 12px 32px color-mix(in srgb, var(--gp-primary) 48%, transparent)'
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-[10px] text-slate-400 dark:text-white/40 hover:text-gp-primary dark:hover:text-gp-primary transition-colors uppercase tracking-widest font-semibold"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="mt-12 text-center z-20">
          <Link
            href="/auth/signup"
            className="group flex flex-col items-center"
          >
            <span className="text-slate-500 dark:text-white/60 text-sm font-light">
              Don&apos;t have an account?
            </span>
            <span className="text-gp-primary dark:text-gp-primary font-medium text-sm mt-1 border-b border-gp-primary/20 group-hover:border-gp-primary transition-all">
              Create one now
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
