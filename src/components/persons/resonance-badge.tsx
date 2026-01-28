'use client'

type ResonanceBadgeProps = {
  label: string
  variant?: 'primary' | 'secondary'
  icon?: string
}

export function ResonanceBadge({
  label,
  variant = 'secondary',
  icon,
}: ResonanceBadgeProps) {
  const isPrimary = variant === 'primary'

  return (
    <div
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
        transition-all duration-300 border
        ${
          isPrimary
            ? 'bg-gp-primary/10 text-gp-primary border-gp-primary/20 dark:bg-gp-primary/20 dark:border-gp-primary/30'
            : 'bg-gp-ink-muted/10 text-gp-ink-muted border-gp-ink-muted/20 dark:bg-gp-ink-soft/10 dark:text-gp-ink-soft dark:border-gp-ink-soft/20'
        }`}
    >
      {icon && (
        <span className="material-symbols-outlined text-sm mr-1">{icon}</span>
      )}
      {label}
    </div>
  )
}
