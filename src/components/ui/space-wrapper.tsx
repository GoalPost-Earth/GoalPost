'use client'

import { cn } from '@/lib/utils'

interface SpaceWrapperProps {
  icon: string
  title: string
  subtitle: string
  description: string
  variant?: 'mespace' | 'wespace'
  onClick?: () => void
  className?: string
}

export function SpaceWrapper({
  icon,
  title,
  subtitle,
  description,
  variant = 'mespace',
  onClick,
  className,
}: SpaceWrapperProps) {
  const hoverGlowColor =
    variant === 'mespace'
      ? 'bg-blue-200/5 dark:bg-blue-200/10'
      : 'bg-emerald-200/5 dark:bg-emerald-200/10'

  return (
    <div
      className={cn('relative group cursor-pointer animate-float', className)}
      onClick={onClick}
    >
      {/* Main container */}
      <div className="gp-glass w-[320px] h-[320px] lg:w-[440px] lg:h-[440px] rounded-full flex flex-col items-center justify-center transition-all duration-700 hover:scale-105 active:scale-95 group-hover:rotate-2">
        {/* Content */}
        <div className="flex flex-col items-center gap-6 p-8 text-center relative z-10">
          {/* Icon */}
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-3xl bg-white/40 dark:bg-white/10 flex items-center justify-center shadow-lg border border-white/60 dark:border-white/20 mb-2">
            <span className="material-symbols-outlined text-3xl lg:text-4xl text-gp-ink-strong dark:text-gp-ink-strong font-light transition-colors">
              {icon}
            </span>
          </div>

          {/* Title and subtitle */}
          <div>
            <h3 className="text-3xl lg:text-4xl font-light text-gp-ink-strong dark:text-gp-ink-strong tracking-wide transition-colors">
              {title}
            </h3>
            <p className="mt-2 text-xs lg:text-sm text-gp-ink-muted dark:text-gp-ink-muted font-mono uppercase tracking-[0.2em] opacity-70 transition-colors">
              {subtitle}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-gp-ink-soft dark:text-gp-ink-soft max-w-[200px] leading-relaxed hidden lg:block font-light transition-colors">
            {description}
          </p>
        </div>

        {/* Hover glow effect */}
        <div
          className={cn(
            'absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700',
            hoverGlowColor
          )}
        />

        {/* Rotating border ring */}
        <div className="absolute -inset-4 border border-dashed border-gp-glass-border rounded-full animate-[spin_60s_linear_infinite] opacity-40" />
      </div>

      {/* Hover button */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
        <span className="px-6 py-2 rounded-full bg-gp-ink-strong dark:bg-gp-ink-strong text-white dark:text-gp-surface text-xs font-medium tracking-wider transition-colors">
          {variant === 'mespace' ? 'ENTER FIELD' : 'ENTER COMMONS'}
        </span>
      </div>
    </div>
  )
}
