'use client'
import React, { useState } from 'react'
import { useApp } from '@/contexts'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function LoginPage() {
  const { setUser } = useApp()
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    register,
  } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const router = useRouter()
  const [error, setError] = useState('')

  const onSubmit = async (values: { email: string; password: string }) => {
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
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors"
      style={{
        backgroundImage: `
        radial-gradient(at 20% 20%, color-mix(in srgb, var(--gp-primary) 10%, transparent) 0, transparent 55%),
        radial-gradient(at 80% 15%, color-mix(in srgb, var(--gp-accent-glow) 12%, transparent) 0, transparent 55%),
        radial-gradient(at 85% 85%, color-mix(in srgb, var(--gp-goal) 10%, transparent) 0, transparent 55%),
        radial-gradient(at 15% 85%, color-mix(in srgb, var(--gp-resource) 12%, transparent) 0, transparent 55%)
      `,
      }}
    >
      <div
        className="absolute inset-0 opacity-70 dark:opacity-90"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--gp-primary) 14%, transparent), transparent 75%)`,
        }}
      />

      {/* Main Content Container */}
      <div className="relative w-full max-w-4xl flex flex-col items-center justify-center px-4">
        {/* Floating Gradient Blobs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gp-primary/12 dark:bg-gp-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gp-accent-glow/12 dark:bg-gp-accent-glow/10 rounded-full blur-[100px]" />

        {/* Organic Cloud Container */}
        <div
          className="w-full max-w-[500px] min-h-[500px] flex flex-col items-center justify-center p-12 relative z-10 transition-all duration-300 bg-gp-glass-bg backdrop-blur-[40px] border border-gp-glass-border shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.5)]"
          style={{
            borderRadius: '60% 40% 70% 30% / 40% 50% 60% 50%',
          }}
        >
          <div className="flex flex-col items-center w-full max-w-xs space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="size-12 bg-white/60 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/70 dark:border-white/15 shadow-sm dark:shadow-lg">
                <span className="material-symbols-outlined text-gp-primary text-2xl">
                  hub
                </span>
              </div>
              <h1 className="text-3xl font-light text-gp-ink-strong dark:text-gp-ink-strong tracking-tight">
                Return to Resonance
              </h1>
              <p className="text-gp-ink-muted dark:text-gp-ink-soft text-xs uppercase tracking-[0.2em] font-medium">
                GoalPost Identity
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              {/* Email Input */}
              <div className="relative">
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl px-5 py-3.5 text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft/70 dark:placeholder-gp-ink-soft/70 focus:outline-none text-sm font-light transition-all duration-300 bg-white/65 backdrop-blur-[10px] border border-gp-glass-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.05] dark:border-white/[0.08] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] focus:bg-white/90 focus:border-[color-mix(in_srgb,var(--gp-primary)_75%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_25%,transparent)] dark:focus:bg-white/10 dark:focus:border-[color-mix(in_srgb,var(--gp-primary)_80%,transparent)] dark:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_30%,transparent)]"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl px-5 py-3.5 text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft/70 dark:placeholder-gp-ink-soft/70 focus:outline-none text-sm font-light transition-all duration-300 bg-white/65 backdrop-blur-[10px] border border-gp-glass-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] dark:bg-white/[0.05] dark:border-white/[0.08] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] focus:bg-white/90 focus:border-[color-mix(in_srgb,var(--gp-primary)_75%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_25%,transparent)] dark:focus:bg-white/10 dark:focus:border-[color-mix(in_srgb,var(--gp-primary)_80%,transparent)] dark:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_30%,transparent)]"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm text-center font-medium">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer w-full text-white rounded-2xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:translate-y-0"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 95%, white 5%), color-mix(in srgb, var(--gp-primary) 80%, black 20%))',
                  boxShadow:
                    '0 10px 30px color-mix(in srgb, var(--gp-primary) 45%, transparent)',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow =
                      '0 14px 38px color-mix(in srgb, var(--gp-primary) 55%, transparent)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow =
                    '0 10px 30px color-mix(in srgb, var(--gp-primary) 45%, transparent)'
                }}
              >
                {isSubmitting ? 'Entering...' : 'Enter Space'}
              </button>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-[10px] text-slate-400 dark:text-white/40 hover:text-gp-primary dark:hover:text-gp-primary transition-colors uppercase tracking-widest font-semibold"
              >
                Forgot Access?
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
              New to the community?
            </span>
            <span className="text-gp-primary dark:text-gp-primary font-medium text-sm mt-1 border-b border-gp-primary/20 group-hover:border-gp-primary transition-all">
              Create an account
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
