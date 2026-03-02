'use client'

import { cn } from '@/lib/utils'
import { useAnimations } from '@/contexts/animation-context'

export interface PersonNodeProps {
  id: string
  firstName: string
  lastName: string
  name: string | null | undefined
  email?: string | null
  photo?: string | null
  role?: 'ADMIN' | 'MEMBER' | 'GUEST' | 'OWNER'
  animation?: 'float' | 'float-delayed' | 'float-random' | 'pulse-slow' | 'none'
  onClick?: () => void
  className?: string
  isActive?: boolean
  isSelected?: boolean
  isHovered?: boolean
}

const animationClasses: Record<string, string> = {
  float: 'animate-float',
  'float-delayed': 'animate-float-delayed',
  'float-random': 'animate-float-random',
  'pulse-slow': 'animate-pulse-slow',
  none: '',
}

const roleColors: Record<string, { bg: string; border: string; text: string }> =
  {
    OWNER: {
      bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10',
      border: 'border-amber-500/40',
      text: 'text-amber-600 dark:text-amber-400',
    },
    ADMIN: {
      bg: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/10',
      border: 'border-purple-500/40',
      text: 'text-purple-600 dark:text-purple-400',
    },
    MEMBER: {
      bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/40',
      text: 'text-blue-600 dark:text-blue-400',
    },
    GUEST: {
      bg: 'bg-gradient-to-br from-slate-500/20 to-gray-500/10',
      border: 'border-slate-500/40',
      text: 'text-slate-600 dark:text-slate-400',
    },
  }

export function PersonNode({
  firstName,
  lastName,
  name,
  photo,
  role = 'MEMBER',
  animation = 'float',
  onClick,
  className,
  isActive = false,
  isSelected = false,
  isHovered = false,
}: PersonNodeProps) {
  const { animationsEnabled } = useAnimations()
  const animClass = animationClasses[animation]
  const colors = roleColors[role] || roleColors.MEMBER

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()

  return (
    <div
      className={cn(
        'person-node group flex flex-col items-center gap-2 w-28',
        animationsEnabled && animClass,
        isSelected && 'ring-2 ring-gp-primary',
        className
      )}
      style={{ pointerEvents: 'none' }}
    >
      {/* Node Container */}
      <div
        className={cn(
          'relative size-16 rounded-full transition-all duration-300',
          'border-2',
          colors.border,
          colors.bg,
          'backdrop-blur-sm',
          'shadow-lg hover:shadow-xl',
          'flex items-center justify-center',
          isActive && 'ring-4 ring-gp-primary/50 scale-110'
        )}
      >
        {photo ? (
          <img
            src={photo}
            alt={name ?? 'Person'}
            className="size-full rounded-full object-cover"
          />
        ) : (
          <span className={cn('text-xl font-bold', colors.text)}>
            {initials}
          </span>
        )}

        {/* Role Badge */}
        <div
          className={cn(
            'absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase',
            'border shadow-sm',
            colors.bg,
            colors.border,
            colors.text
          )}
        >
          {role}
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p
          className={cn(
            'text-xs font-semibold truncate max-w-28',
            'text-gp-ink-strong dark:text-gp-ink-strong'
          )}
        >
          {name || `${firstName} ${lastName}`}
        </p>
      </div>
    </div>
  )
}
