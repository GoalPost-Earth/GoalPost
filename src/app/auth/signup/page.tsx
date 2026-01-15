'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/app/contexts'

const signupSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email('Please enter a valid email address'),
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
  const { isAuthenticated } = useAuth()
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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/protected/spaces')
    }
  }, [isAuthenticated, router])

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
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-5"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: `
        radial-gradient(at 0% 0%, hsla(199,100%,93%,1) 0, transparent 50%), 
        radial-gradient(at 100% 0%, hsla(187,100%,92%,1) 0, transparent 50%), 
        radial-gradient(at 100% 100%, hsla(210,100%,95%,1) 0, transparent 50%), 
        radial-gradient(at 0% 100%, hsla(190,100%,94%,1) 0, transparent 50%)
      `,
      }}
    >
      {/* Dark mode gradient overlay */}
      <div
        className="hidden dark:block absolute inset-0"
        style={{
          backgroundColor: '#0a0f1d',
          backgroundImage: `
          radial-gradient(at 0% 0%, hsla(220, 40%, 15%, 1) 0, transparent 60%), 
          radial-gradient(at 100% 0%, hsla(240, 30%, 10%, 1) 0, transparent 60%), 
          radial-gradient(at 100% 100%, hsla(210, 50%, 12%, 1) 0, transparent 60%), 
          radial-gradient(at 0% 100%, hsla(230, 40%, 14%, 1) 0, transparent 60%)
        `,
        }}
      />

      {/* Main Content Container */}
      <div className="relative w-full max-w-4xl flex flex-col items-center justify-center px-4">
        {/* Floating Gradient Blobs */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-cyan-500/20 dark:bg-cyan-500/15 rounded-full blur-[100px] opacity-40 dark:opacity-35" />
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-teal-500/20 dark:bg-teal-500/10 rounded-full blur-[100px] opacity-40 dark:opacity-35" />
        <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-purple-200/30 dark:bg-indigo-500/10 rounded-full blur-[100px] opacity-40 dark:opacity-35" />
        <div className="hidden dark:block absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px] opacity-35" />

        {/* Organic Cloud Container */}
        <div
          className="w-full max-w-xl min-h-[600px] flex flex-col items-center justify-center p-12 md:p-20 relative z-10 transition-all duration-300 bg-white/60 backdrop-blur-[40px] border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05),inset_0_0_40px_rgba(255,255,255,0.5)] dark:bg-[rgba(15,23,42,0.7)] dark:border-white/12 dark:shadow-[0_25px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.05)]"
          style={{
            borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%',
          }}
        >
          <div className="flex flex-col items-center w-full max-w-sm space-y-10">
            {/* Header Section */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white/60 dark:bg-white/5 shadow-sm dark:shadow-inner border border-white dark:border-white/10 mb-6">
                <span className="material-symbols-outlined text-gp-primary text-3xl">
                  hub
                </span>
              </div>
              <h1 className="text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Begin Your Journey
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
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
                    className="w-full rounded-2xl py-4 pl-12 pr-6 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all duration-300 bg-white/40 backdrop-blur-[10px] border border-white/60 dark:bg-white/[0.03] dark:border-white/10 focus:bg-white/80 focus:border-cyan-500/30 focus:shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:focus:bg-white/[0.07] dark:focus:border-[rgba(56,189,248,0.4)] dark:focus:shadow-[0_0_15px_rgba(56,189,248,0.1)]"
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
                    className="w-full rounded-2xl py-4 pl-12 pr-6 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all duration-300 bg-white/40 backdrop-blur-[10px] border border-white/60 dark:bg-white/3 dark:border-white/10 focus:bg-white/80 focus:border-cyan-500/30 focus:shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:focus:bg-white/[0.07] dark:focus:border-[rgba(56,189,248,0.4)] dark:focus:shadow-[0_0_15px_rgba(56,189,248,0.1)]"
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
                    className="w-full rounded-2xl py-4 pl-12 pr-6 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all duration-300 bg-white/40 backdrop-blur-[10px] border border-white/60 dark:bg-white/[0.03] dark:border-white/10 focus:bg-white/80 focus:border-cyan-500/30 focus:shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:focus:bg-white/[0.07] dark:focus:border-[rgba(56,189,248,0.4)] dark:focus:shadow-[0_0_15px_rgba(56,189,248,0.1)]"
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
                    className="w-full rounded-2xl py-4 pl-12 pr-12 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all duration-300 bg-white/40 backdrop-blur-[10px] border border-white/60 dark:bg-white/[0.03] dark:border-white/10 focus:bg-white/80 focus:border-cyan-500/30 focus:shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:focus:bg-white/[0.07] dark:focus:border-[rgba(56,189,248,0.4)] dark:focus:shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
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
                    className="w-full rounded-2xl py-4 pl-12 pr-12 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all duration-300 bg-white/40 backdrop-blur-[10px] border border-white/60 dark:bg-white/[0.03] dark:border-white/10 focus:bg-white/80 focus:border-cyan-500/30 focus:shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:focus:bg-white/[0.07] dark:focus:border-[rgba(56,189,248,0.4)] dark:focus:shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
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
                  className="w-full text-white rounded-2xl py-3.5 text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:translate-y-0 dark:hover:brightness-110 flex items-center justify-center gap-2"
                  style={{
                    background:
                      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      const isDark =
                        document.documentElement.classList.contains('dark')
                      if (isDark) {
                        e.currentTarget.style.boxShadow =
                          '0 8px 25px rgba(59, 130, 246, 0.5)'
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                      } else {
                        e.currentTarget.style.boxShadow =
                          '0 6px 20px rgba(59, 130, 246, 0.5)'
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow =
                      '0 4px 15px rgba(59, 130, 246, 0.4)'
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
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
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Already part of a field?{' '}
                <Link
                  href="/auth/login"
                  className="text-cyan-500 dark:text-cyan-400 font-semibold hover:underline underline-offset-4 ml-1 dark:hover:text-cyan-400/80 transition-colors"
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
