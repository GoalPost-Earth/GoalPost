'use client'

import { cn } from '@/lib/utils'

export interface ResonanceNodeProps {
  id: string
  icon: string
  label: string
  description?: string
  isActive: boolean
  position?: { top: string; left: string }
  onClick: () => void
  className?: string
}

export function ResonanceNode({
  id,
  icon,
  label,
  description = 'Active Resonance',
  isActive,
  position,
  onClick,
  className,
}: ResonanceNodeProps) {
  return (
    <div
      className={cn(
        'absolute z-20 flex items-center justify-center transition-all duration-500 pointer-events-none group',
        position ? '' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        className
      )}
      style={
        position
          ? {
              top: position.top,
              left: position.left,
              transform: 'translate(-50%, -50%)',
            }
          : undefined
      }
    >
      <div className="relative pointer-events-auto">
        {/* Outer glow and ripple effects */}
        <div
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-500',
            'bg-gp-primary/20 blur-2xl opacity-40 group-hover:opacity-60',
            isActive && 'opacity-80 bg-gp-primary/30 blur-3xl'
          )}
        />

        {/* Central Node - all content inside */}
        <div
          onClick={onClick}
          className={cn(
            'group relative size-40 rounded-full cursor-pointer transition-all duration-500 ease-out',
            'gp-glass border flex flex-col items-center justify-center text-center p-4',
            'border-white/20 dark:border-white/20',
            isActive
              ? 'shadow-[0_0_50px_-10px_rgba(19,164,236,0.6)] dark:shadow-[0_0_50px_-10px_rgba(19,164,236,0.6)] border-gp-primary/50 dark:border-gp-primary/50 scale-110'
              : 'hover:scale-105'
          )}
        >
          {/* Icon */}
          <div
            className={cn(
              'mb-2 transition-colors duration-300',
              isActive
                ? 'text-slate-900 dark:text-white'
                : 'text-gp-primary/80 dark:text-gp-primary/80 group-hover:text-gp-primary dark:group-hover:text-gp-primary'
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined text-[48px] drop-shadow-[0_0_10px_rgba(19,164,236,0.5)] transition-all duration-300'
              )}
            >
              {icon}
            </span>
          </div>

          {/* Label */}
          <span
            className={cn(
              'text-xs font-bold uppercase tracking-widest transition-colors duration-300 leading-tight',
              isActive
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white'
            )}
          >
            {label}
          </span>

          {/* Active Badge */}
          {isActive && (
            <div className="absolute -bottom-2 flex items-center gap-1 bg-white/80 dark:bg-black/50 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
              <div className="size-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] font-medium text-slate-600 dark:text-white/60">
                Active
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
