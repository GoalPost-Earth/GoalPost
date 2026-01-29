'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const signupSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

function SignupPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    watch,
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const password = watch('password')

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setLoading(true)
    setError('')

    // Check if passwords match
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
          firstName: values.firstName || '',
          lastName: values.lastName || '',
          email: values.email,
          password: values.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Sign up failed')
        setFormError('email', { message: data.error || 'Sign up failed' })
      } else {
        // Redirect to login page after successful signup
        router.push('/auth/login')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-5 bg-gp-surface dark:bg-gp-surface-dark transition-colors"
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
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gp-primary/12 dark:bg-gp-primary/10 rounded-full blur-[100px] opacity-50" />
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-gp-accent-glow/12 dark:bg-gp-accent-glow/10 rounded-full blur-[100px] opacity-45" />
        <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-gp-goal/10 dark:bg-gp-goal/12 rounded-full blur-[100px] opacity-45" />
        <div className="hidden dark:block absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-gp-resource/12 rounded-full blur-[100px] opacity-35" />

        {/* Organic Cloud Container */}
        <div
          className="w-full max-w-xl min-h-[600px] flex flex-col items-center justify-center p-12 md:p-20 relative z-10 transition-all duration-300 bg-gp-glass-bg backdrop-blur-[40px] border border-gp-glass-border shadow-[0_24px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
          style={{
            borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%',
          }}
        >
          <div className="flex flex-col items-center w-full max-w-sm space-y-10">
            {/* Header Section */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white/65 dark:bg-white/10 shadow-sm dark:shadow-inner border border-white dark:border-white/10 mb-6">
                <span className="material-symbols-outlined text-gp-primary text-3xl">
                  hub
                </span>
              </div>
              <h1 className="text-4xl font-semibold text-gp-ink-strong dark:text-gp-ink-strong tracking-tight">
                Begin Your Journey
              </h1>
              <p className="text-gp-ink-muted dark:text-gp-ink-soft font-medium">
                Step into a living space of shared intentions.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-5"
            >
              {/* First Name Input */}
              <div className="space-y-1 dark:space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 dark:ml-2 dark:text-[10px] dark:font-bold dark:tracking-[0.2em]">
                  First Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">
                    person
                  </span>
                  <input
                    {...register('firstName')}
                    type="text"
                    placeholder="Alex"
                    autoComplete="given-name"
                    disabled={loading}
                    className="w-full rounded-2xl py-4 pl-12 pr-6 text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft/70 dark:placeholder-gp-ink-soft/70 focus:outline-none transition-all duration-300 bg-white/55 backdrop-blur-[10px] border border-gp-glass-border dark:bg-white/[0.04] dark:border-white/10 focus:bg-white/85 focus:border-[color-mix(in_srgb,var(--gp-primary)_75%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_25%,transparent)] dark:focus:bg-white/10 dark:focus:border-[color-mix(in_srgb,var(--gp-primary)_80%,transparent)] dark:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_30%,transparent)]"
                  />
                </div>
              </div>

              {/* Last Name Input */}
              <div className="space-y-1 dark:space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 dark:ml-2 dark:text-[10px] dark:font-bold dark:tracking-[0.2em]">
                  Last Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">
                    person
                  </span>
                  <input
                    {...register('lastName')}
                    type="text"
                    placeholder="Rivers"
                    autoComplete="family-name"
                    disabled={loading}
                    className="w-full rounded-2xl py-4 pl-12 pr-6 text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft/70 dark:placeholder-gp-ink-soft/70 focus:outline-none transition-all duration-300 bg-white/55 backdrop-blur-[10px] border border-gp-glass-border dark:bg-white/[0.04] dark:border-white/10 focus:bg-white/85 focus:border-[color-mix(in_srgb,var(--gp-primary)_75%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_25%,transparent)] dark:focus:bg-white/10 dark:focus:border-[color-mix(in_srgb,var(--gp-primary)_80%,transparent)] dark:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_30%,transparent)]"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1 dark:space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 dark:ml-2 dark:text-[10px] dark:font-bold dark:tracking-[0.2em]">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">
                    mail
                  </span>
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    placeholder="alex@goalpost.io"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-2xl py-4 pl-12 pr-6 text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft/70 dark:placeholder-gp-ink-soft/70 focus:outline-none transition-all duration-300 bg-white/55 backdrop-blur-[10px] border border-gp-glass-border dark:bg-white/[0.04] dark:border-white/10 focus:bg-white/85 focus:border-[color-mix(in_srgb,var(--gp-primary)_75%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_25%,transparent)] dark:focus:bg-white/10 dark:focus:border-[color-mix(in_srgb,var(--gp-primary)_80%,transparent)] dark:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_30%,transparent)]"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1 dark:space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 dark:ml-2 dark:text-[10px] dark:font-bold dark:tracking-[0.2em]">
                  Choose a Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">
                    lock
                  </span>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-2xl py-4 pl-12 pr-12 text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft/70 dark:placeholder-gp-ink-soft/70 focus:outline-none transition-all duration-300 bg-white/55 backdrop-blur-[10px] border border-gp-glass-border dark:bg-white/[0.04] dark:border-white/10 focus:bg-white/85 focus:border-[color-mix(in_srgb,var(--gp-primary)_75%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_25%,transparent)] dark:focus:bg-white/10 dark:focus:border-[color-mix(in_srgb,var(--gp-primary)_80%,transparent)] dark:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_30%,transparent)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1 dark:space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 dark:ml-2 dark:text-[10px] dark:font-bold dark:tracking-[0.2em]">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">
                    lock
                  </span>
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-2xl py-4 pl-12 pr-12 text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft/70 dark:placeholder-gp-ink-soft/70 focus:outline-none transition-all duration-300 bg-white/55 backdrop-blur-[10px] border border-gp-glass-border dark:bg-white/[0.04] dark:border-white/10 focus:bg-white/85 focus:border-[color-mix(in_srgb,var(--gp-primary)_75%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_25%,transparent)] dark:focus:bg-white/10 dark:focus:border-[color-mix(in_srgb,var(--gp-primary)_80%,transparent)] dark:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_30%,transparent)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 ml-2">
                    {errors.confirmPassword.message}
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
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full text-white rounded-2xl py-4 text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <span>{loading ? 'Creating...' : 'Create Sphere'}</span>
                  <span className="material-symbols-outlined text-xl">
                    auto_awesome
                  </span>
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-gp-ink-muted dark:text-gp-ink-soft text-sm">
                Already part of a field?{' '}
                <Link
                  href="/auth/login"
                  className="text-gp-primary font-semibold hover:underline underline-offset-4 ml-1 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500 z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                verified_user
              </span>
              <span className="text-xs uppercase tracking-widest font-medium dark:text-[10px] dark:font-bold">
                Secure Space
              </span>
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                language
              </span>
              <span className="text-xs uppercase tracking-widest font-medium dark:text-[10px] dark:font-bold">
                Distributed Intent
              </span>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60 dark:text-[9px] dark:tracking-[0.3em] dark:font-black dark:opacity-40">
            GoalPost © 2025
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
