'use client'

import {
  forwardRef,
  type ChangeEvent,
  type FC,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
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

/**
 * First-open loading state. When the caller already knows the entity's
 * name (passed through `?entity=` navigations and every canvas drill via
 * `InfoEntity.label`), paint the title immediately so the *basic* form is
 * visible instantly instead of a full-page shimmer that blocks on the
 * heavy detail query. The lower sections still shimmer until data lands.
 * Falls back to a shimmer bar when no label is known (e.g. a deep-linked
 * refresh, where the URL carries only `Type:id`). See GOAL-279.
 *
 * `titleClassName` lets a body match its own loaded header exactly so the
 * title doesn't reflow (resize) when data lands — Person/Document render
 * their title at `text-xl`, the rest at `text-2xl`. Defaults to `text-2xl`.
 */
export const BodySkeleton: FC<{ label?: string; titleClassName?: string }> = ({
  label,
  titleClassName = 'text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words leading-tight',
}) => (
  <div className="p-6 space-y-5">
    <div className="flex items-start gap-4">
      <div className="size-14 rounded-2xl bg-black/[0.05] dark:bg-white/5 animate-pulse" />
      <div className="flex-1 space-y-2 pt-1">
        {label ? (
          <h2 className={titleClassName}>{label}</h2>
        ) : (
          <div className="h-6 w-3/4 rounded-md bg-black/[0.05] dark:bg-white/5 animate-pulse" />
        )}
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

/**
 * Shown when the underlying GraphQL query *errors* — distinct from
 * {@link NotFoundBody}, which means the query succeeded but returned nothing
 * (deleted / no access). Surfacing the real failure (instead of the misleading
 * "no longer available") is the difference between "I lost access" and "the
 * request blew up". The detail line is intentionally honest — it's the server
 * message — so testers can see what actually broke; a Retry refetches.
 */
export const ErrorBody: FC<{
  detail?: string
  onRetry?: () => void
}> = ({ detail, onRetry }) => (
  <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-3">
    <div className="size-12 shrink-0 rounded-2xl bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/15 flex items-center justify-center">
      <span className="material-symbols-outlined text-2xl text-gp-ink-muted dark:text-white/55">
        sync_problem
      </span>
    </div>
    <div className="space-y-1.5 min-w-0">
      <p className="text-sm font-semibold text-gp-ink-strong dark:text-white">
        Couldn&apos;t load this
      </p>
      <p className="text-xs text-gp-ink-muted dark:text-white/55 leading-relaxed">
        Something went wrong fetching this from the server.
      </p>
      {detail && (
        <p className="mt-2 text-[11px] font-mono text-gp-ink-muted/80 dark:text-white/45 leading-relaxed break-words whitespace-pre-wrap">
          {detail}
        </p>
      )}
    </div>
    {onRetry && (
      <SecondaryCta onClick={onRetry} className="mt-1">
        <span className="material-symbols-outlined text-[18px]">refresh</span>
        Try again
      </SecondaryCta>
    )}
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

/**
 * Shared text input used by drawer edit modes. Matches the glass surface
 * so an editable title doesn't jar against the read-mode chrome.
 */
export const EditTextInput: FC<{
  value: string
  onChange: (next: string) => void
  placeholder?: string
  label?: string
  autoFocus?: boolean
  disabled?: boolean
  className?: string
  id?: string
}> = ({
  value,
  onChange,
  placeholder,
  label,
  autoFocus,
  disabled,
  className,
  id,
}) => (
  <div className={cn('space-y-1.5', className)}>
    {label && (
      <label
        htmlFor={id}
        className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted dark:text-white/50"
      >
        {label}
      </label>
    )}
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl border',
        'border-gp-glass-border bg-white/60 dark:bg-white/[0.04]',
        'text-gp-ink-strong dark:text-white',
        'placeholder:text-gp-ink-muted/60 dark:placeholder:text-white/30',
        'focus:outline-none focus:ring-2 focus:ring-gp-primary/50 focus:border-gp-primary/40',
        'transition-all text-sm',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    />
  </div>
)

/**
 * Multi-line variant of {@link EditTextInput}. Defaults to 4 rows; pass
 * `rows` to override.
 */
export const EditTextarea = forwardRef<
  HTMLTextAreaElement,
  {
    value: string
    onChange: (next: string) => void
    placeholder?: string
    label?: string
    rows?: number
    disabled?: boolean
    className?: string
    id?: string
  } & Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'value' | 'onChange' | 'placeholder' | 'rows' | 'disabled' | 'className' | 'id'
  >
>(function EditTextarea(
  {
    value,
    onChange,
    placeholder,
    label,
    rows = 4,
    disabled,
    className,
    id,
    ...rest
  },
  ref
) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted dark:text-white/50"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl border',
          'border-gp-glass-border bg-white/60 dark:bg-white/[0.04]',
          'text-gp-ink-strong dark:text-white',
          'placeholder:text-gp-ink-muted/60 dark:placeholder:text-white/30',
          'focus:outline-none focus:ring-2 focus:ring-gp-primary/50 focus:border-gp-primary/40',
          'transition-all text-sm leading-relaxed resize-y'
        )}
        {...rest}
      />
    </div>
  )
})

/**
 * Footer presented in edit mode — Cancel + Save sit at the bottom of the
 * drawer body, mirroring the read-mode footer slot so the layout doesn't
 * jump when the user toggles into edit mode.
 */
export const EditFooter: FC<{
  onCancel: () => void
  onSave: () => void
  saving?: boolean
  saveLabel?: string
  disabled?: boolean
}> = ({ onCancel, onSave, saving, saveLabel = 'Save changes', disabled }) => (
  <div className="flex items-center gap-2">
    <SecondaryCta
      onClick={onCancel}
      disabled={saving}
      className="flex-1"
    >
      Cancel
    </SecondaryCta>
    <PrimaryCta
      onClick={onSave}
      disabled={saving || disabled}
      className="flex-1"
    >
      {saving ? 'Saving…' : saveLabel}
    </PrimaryCta>
  </div>
)

/**
 * "Edit" pill used in the drawer footer to enter edit mode. Visually
 * coordinated with PrimaryCta but secondary in weight so the "Open full
 * page" CTA remains the primary action.
 */
export const EditCta: FC<{
  onClick: () => void
  disabled?: boolean
  className?: string
  label?: string
}> = ({ onClick, disabled, className, label = 'Edit' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title="Edit"
    className={cn(
      'flex items-center justify-center gap-2 px-4 h-11 rounded-xl',
      'border border-gp-glass-border bg-white/40 hover:bg-white/60',
      'dark:bg-white/5 dark:hover:bg-white/10',
      'text-gp-ink-strong dark:text-white/85 text-sm font-medium',
      'transition-all cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
  >
    <span className="material-symbols-outlined text-[18px]">edit</span>
    {label && <span>{label}</span>}
  </button>
)
