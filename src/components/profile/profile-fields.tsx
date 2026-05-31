'use client'

import { LinkifiedText } from '@/components/ui/linkified-text'

/**
 * A single short labelled field. Renders plain text in view mode and a
 * text input in edit mode. Used for the identity basics (name, location…).
 */
export function InfoField({
  label,
  value,
  editing,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  editing: boolean
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-gp-ink-muted dark:text-gp-ink-soft">
        {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gp-glass-border bg-gp-surface-strong/60 dark:bg-white/5 px-3 py-2 text-sm text-gp-ink-strong dark:text-white placeholder:text-gp-ink-soft focus:outline-none focus:border-gp-primary transition-colors"
        />
      ) : (
        <p className="text-sm text-gp-ink-strong dark:text-white/90 min-h-[1.25rem] break-words">
          {value ? (
            value
          ) : (
            <span className="text-gp-ink-soft italic">Not set</span>
          )}
        </p>
      )}
    </div>
  )
}

/**
 * A glass attribute card with an entity-flavoured icon header. In view mode it
 * shows linkified prose (or an empty hint); in edit mode it shows a textarea.
 * These are the multi-line "about you" fields (passions, traits, …).
 */
export function AttributeCard({
  icon,
  title,
  value,
  editing,
  onChange,
  placeholder,
}: {
  icon: string
  title: string
  value: string
  editing: boolean
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gp-glass-border bg-gp-glass-bg backdrop-blur-2xl p-4 sm:p-5 transition-all duration-300">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-gp-primary text-[20px]">
          {icon}
        </span>
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gp-ink-muted dark:text-gp-ink-soft">
          {title}
        </h3>
      </div>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full resize-none rounded-lg border border-gp-glass-border bg-gp-surface-strong/60 dark:bg-white/5 px-3 py-2 text-sm text-gp-ink-strong dark:text-white placeholder:text-gp-ink-soft focus:outline-none focus:border-gp-primary transition-colors"
        />
      ) : value ? (
        <LinkifiedText
          text={value}
          className="text-sm leading-relaxed text-gp-ink-muted dark:text-gp-ink-soft"
        />
      ) : (
        <p className="text-sm text-gp-ink-soft italic">Nothing here yet.</p>
      )}
    </div>
  )
}
