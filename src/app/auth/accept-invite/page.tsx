'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'

/**
 * Landing page for the email-invite flow. The recipient arrives with a
 * single-use token query param (set by addSpaceMember → sendSpaceInviteEmail),
 * picks a password, and the API both provisions their :User credentials and
 * issues an authenticated session — so they land logged in on the inviting
 * Space.
 *
 * Visual language deliberately mirrors /auth/reset-password since the user
 * journey ("set a password via an emailed token") is structurally identical.
 */
function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (values: {
    password: string
    confirmPassword: string
  }) => {
    setErrorMsg('')
    setSuccess('')
    if (!token) {
      setErrorMsg('Missing invite token.')
      return
    }
    if (values.password !== values.confirmPassword) {
      setErrorMsg('Passwords do not match')
      setFormError('confirmPassword', { message: 'Passwords do not match' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: values.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not accept invite')
        if (data.error)
          setFormError('password', { message: data.error })
      } else {
        setSuccess('Welcome to GoalPost. Taking you in…')
        // The API set httpOnly cookies for us; the redirect lands the user
        // on the space they were invited into (or the dashboard fallback).
        const redirectTo: string =
          typeof data.redirectTo === 'string'
            ? data.redirectTo
            : '/protected/dashboard'
        setTimeout(() => router.push(redirectTo), 600)
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

      <div className="relative w-full max-w-4xl flex flex-col items-center justify-center px-4">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gp-primary/12 dark:bg-gp-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gp-accent-glow/12 dark:bg-gp-accent-glow/10 rounded-full blur-[100px]" />

        <div
          className="w-full max-w-[500px] min-h-[500px] flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 transition-all duration-300 bg-gp-glass-bg backdrop-blur-[40px] border border-gp-glass-border shadow-[0_24px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
          style={{ borderRadius: '60% 40% 70% 30% / 40% 50% 60% 50%' }}
        >
          <div className="flex flex-col items-center w-full max-w-xs space-y-8">
            <div className="text-center space-y-2">
              <div className="size-12 bg-white/50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/80 dark:border-white/10 shadow-sm dark:shadow-lg">
                <span className="material-symbols-outlined text-gp-primary text-2xl">
                  person_add
                </span>
              </div>
              <h1 className="text-3xl font-light text-gp-ink-strong dark:text-gp-ink-strong tracking-tight">
                Join GoalPost
              </h1>
              <p className="text-gp-ink-muted dark:text-gp-ink-soft text-xs uppercase tracking-[0.2em] font-medium">
                Set a password to accept your invite
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  type="password"
                  placeholder="Choose a password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-2xl px-5 py-3.5 text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft/70 dark:placeholder-gp-ink-soft/70 focus:outline-none text-sm font-light transition-all duration-300 bg-white/55 backdrop-blur-[10px] border border-gp-glass-border dark:bg-white/[0.04] dark:border-white/10 focus:bg-white/85 focus:border-[color-mix(in_srgb,var(--gp-primary)_75%,transparent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_25%,transparent)] dark:focus:bg-white/10 dark:focus:border-[color-mix(in_srgb,var(--gp-primary)_80%,transparent)] dark:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gp-primary)_30%,transparent)]"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                  })}
                  type="password"
                  placeholder="Confirm password"
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

              {errorMsg && (
                <p className="text-red-500 text-sm text-center font-medium">
                  {errorMsg}
                </p>
              )}

              {success && (
                <p className="text-green-600 dark:text-green-400 text-sm text-center font-medium">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="cursor-pointer w-full text-white rounded-2xl py-3.5 text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:translate-y-0 dark:hover:brightness-110"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 95%, white 5%), color-mix(in srgb, var(--gp-primary) 78%, black 22%))',
                  boxShadow:
                    '0 12px 32px color-mix(in srgb, var(--gp-primary) 48%, transparent)',
                }}
              >
                {loading ? 'Setting up…' : 'Set password & join'}
              </button>
            </form>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-[10px] text-slate-400 dark:text-white/40 hover:text-gp-primary dark:hover:text-gp-primary transition-colors uppercase tracking-widest font-semibold"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AcceptInvitePage
