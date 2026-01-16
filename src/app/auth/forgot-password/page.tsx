'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'

function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
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
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#f3f4f6',
        backgroundImage: `
        radial-gradient(at 0% 0%, hsla(199,100%,93%,1) 0, transparent 50%), 
        radial-gradient(at 100% 0%, hsla(187,100%,92%,1) 0, transparent 50%), 
        radial-gradient(at 100% 100%, hsla(210,100%,95%,1) 0, transparent 50%), 
        radial-gradient(at 0% 100%, hsla(190,100%,94%,1) 0, transparent 50%)
      `,
      }}
      data-light-bg={true}
      data-dark-bg="true"
    >
      {/* Dark mode gradient overlay */}
      <div
        className="hidden dark:block absolute inset-0"
        style={{
          backgroundColor: '#05070a',
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
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-100/30 dark:bg-indigo-900/10 rounded-full blur-[100px]" />

        {/* Organic Cloud Container */}
        <div
          className="w-full max-w-[500px] min-h-[500px] flex flex-col items-center justify-center p-12 relative z-10 transition-all duration-300 bg-white/45 backdrop-blur-[40px] border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.04),inset_0_0_40px_rgba(255,255,255,0.4)] dark:bg-[rgba(15,18,25,0.7)] dark:border-white/10 dark:shadow-[0_25px_80px_rgba(0,0,0,0.5),inset_0_0_40px_rgba(255,255,255,0.02),inset_0_1px_1px_rgba(255,255,255,0.1)]"
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
              <h1 className="text-3xl font-light text-slate-800 dark:text-slate-100 tracking-tight">
                Reset Access
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-[0.2em] font-medium">
                Recover Your Account
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
                  disabled={loading}
                  className="w-full rounded-2xl px-5 py-3.5 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-light transition-all duration-300 bg-white/60 backdrop-blur-[10px] border border-white/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-white/[0.05] dark:border-white/[0.08] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] focus:bg-white/90 focus:border-cyan-500 focus:shadow-[0_0_0_4px_rgba(14,165,233,0.1)] dark:focus:bg-white/10 dark:focus:border-blue-500 dark:focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm text-center font-medium">
                  {error}
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
                {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage
