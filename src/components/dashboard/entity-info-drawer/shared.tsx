'use client'

import { type FC, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Shared chrome bits used by every body. The drawer outer container,
 * close-on-Esc, focus trap, and slide-in animation live in `./index.tsx`
 * — these are the in-body building blocks.
 */

export const SectionHeader: FC<{ children: ReactNode }> = ({ children }) => (
  <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted dark:text-white/50">
    {children}
  </h3>
)

export const StatCell: FC<{
  icon: ReactNode
  label: string
  value: string
  valueClassName?: string
}> = ({ icon, label, value, valueClassName }) => (
  <div className="rounded-xl border border-gp-glass-border bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-3">
    <div className="flex items-center gap-1.5 text-gp-ink-muted dark:text-white/45">
      {icon}
      <span className="text-[10px] uppercase tracking-wider font-semibold">
        {label}
      </span>
    </div>
    <p
      className={cn(
        'mt-1.5 text-xl font-black text-gp-ink-strong dark:text-white tabular-nums',
        valueClassName
      )}
    >
      {value}
    </p>
  </div>
)

export const BodySkeleton: FC = () => (
  <div className="p-6 space-y-5">
    <div className="flex items-start gap-4">
      <div className="size-14 rounded-2xl bg-black/[0.05] dark:bg-white/5 animate-pulse" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-6 w-3/4 rounded-md bg-black/[0.05] dark:bg-white/5 animate-pulse" />
        <div className="h-3 w-1/3 rounded-md bg-black/[0.05] dark:bg-white/5 animate-pulse" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="h-20 rounded-xl bg-black/[0.05] dark:bg-white/5 animate-pulse" />
      <div className="h-20 rounded-xl bg-black/[0.05] dark:bg-white/5 animate-pulse" />
      <div className="h-20 rounded-xl bg-black/[0.05] dark:bg-white/5 animate-pulse" />
      <div className="h-20 rounded-xl bg-black/[0.05] dark:bg-white/5 animate-pulse" />
    </div>
    <div className="h-24 rounded-xl bg-black/[0.05] dark:bg-white/5 animate-pulse" />
  </div>
)

export const NotFoundBody: FC<{ message?: string }> = ({ message }) => (
  <div className="p-8 text-center">
    <p className="text-sm text-gp-ink-muted dark:text-white/55">
      {message ??
        'This entity is no longer available — it may have been deleted or you lost access.'}
    </p>
  </div>
)

export const PrimaryCta: FC<{
  onClick: () => void
  children: ReactNode
  disabled?: boolean
  className?: string
}> = ({ onClick, children, disabled, className }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'flex items-center justify-center gap-2 px-5 h-11 rounded-xl',
      'bg-gp-primary hover:bg-gp-primary/90 text-white font-semibold text-sm',
      'shadow-lg shadow-gp-primary/20 transition-all cursor-pointer',
      'ring-2 ring-transparent focus-visible:ring-white/40',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
  >
    {children}
  </button>
)

export const SecondaryCta: FC<{
  onClick: () => void
  children: ReactNode
  disabled?: boolean
  className?: string
  title?: string
  variant?: 'default' | 'danger'
}> = ({ onClick, children, disabled, className, title, variant = 'default' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'flex items-center justify-center gap-2 px-4 h-11 rounded-xl',
      'text-sm font-medium transition-all cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variant === 'default'
        ? 'border border-gp-glass-border bg-white/40 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10 text-gp-ink-strong dark:text-white/85'
        : 'border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10',
      className
    )}
  >
    {children}
  </button>
)
