'use client'

import { cn } from '@/lib/utils'
import { useAnimations } from '@/contexts/animation-context'
import {
  PULSE_TYPE_CONFIG,
  type NodeType,
  getIconForType,
} from '@/lib/pulse-type-config'

export type { NodeType }

export interface PulseNodeProps {
  icon?: string
  label: string
  type: NodeType
  animation?: 'float' | 'float-delayed' | 'float-random' | 'pulse-slow' | 'none'
  onClick?: () => void
  onEditClick?: (e: React.MouseEvent) => void
  className?: string
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

export function PulseNode({
  icon,
  label,
  type,
  animation = 'float',
  onClick,
  onEditClick,
  className,
  isSelected = false,
  isHovered = false,
}: PulseNodeProps) {
  const { animationsEnabled } = useAnimations()
  const config = PULSE_TYPE_CONFIG[type]
  const resolvedIcon = icon ?? getIconForType(type)
  const animClass = animationClasses[animation]

  return (
    <div
      className={cn(
        'pulse-node group relative flex flex-col items-center gap-3 w-32',
        animationsEnabled && animClass,
        isSelected && 'ring-2 ring-gp-primary',
        className
      )}
    >
      {/* Edit Button - shown when hovered or selected */}
      {onEditClick && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEditClick(e)
          }}
          className={cn(
            'absolute -top-2 -right-2 p-1.5 rounded-full bg-gp-primary/20 hover:bg-gp-primary/40 text-gp-primary transition-all z-30 cursor-pointer',
            isHovered || isSelected ? 'opacity-100' : 'opacity-0'
          )}
          title="Edit pulse"
          style={{ pointerEvents: 'auto' }}
        >
          <span className="material-symbols-outlined text-sm">edit</span>
        </button>
      )}

      {/* Node Container */}
      <div
        className={cn(
          'relative flex items-center justify-center size-20 rounded-2xl',
          'glass-panel',
          animationsEnabled && 'transition-all duration-300',
          animationsEnabled &&
            'group-hover:scale-110 group-hover:-translate-y-2',
          config.bgClass,
          animationsEnabled &&
            'shadow-[0_0_20px_var(--shadow-color)] group-hover:shadow-[0_0_40px_var(--shadow-color)]',
          animationsEnabled &&
            `group-hover:border-${type}-tint/30 border border-transparent`,
          isSelected && 'ring-2 ring-gp-primary scale-110'
        )}
        style={
          {
            '--shadow-color': config.shadowColor,
          } as React.CSSProperties
        }
      >
        <span
          className={cn(
            'material-symbols-outlined text-4xl',
            animationsEnabled && 'drop-shadow-sm group-hover:drop-shadow-md',
            config.color
          )}
        >
          {resolvedIcon}
        </span>
      </div>

      {/* Label and Type */}
      <div className="flex flex-col items-center text-center">
        <span className="text-xs font-bold text-gp-ink-strong dark:text-white/90 leading-tight">
          {label}
        </span>
        <span
          className={cn(
            'text-[9px] uppercase tracking-widest font-bold mt-1',
            config.color
          )}
        >
          {config.label}
        </span>
      </div>
    </div>
  )
}
