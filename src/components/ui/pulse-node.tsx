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
  position?:
    | 'center'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'right-center'
    | 'left-center'
    | { top: string; left: string }
  animation?: 'float' | 'float-delayed' | 'float-random' | 'pulse-slow' | 'none'
  onClick?: () => void
  onEditClick?: (e: React.MouseEvent) => void
  className?: string
}

const positionClasses: Record<string, string> = {
  center: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20',
  'top-left': 'absolute top-[28%] left-[68%] z-10',
  'top-right': 'absolute top-[35%] left-[32%] z-10',
  'bottom-left': 'absolute top-[62%] left-[22%] z-10',
  'bottom-right': 'absolute top-[75%] left-[72%] z-10',
  'top-center': 'absolute top-[20%] left-[25%] z-10',
  'right-center': 'absolute top-[45%] left-[82%] z-10',
  'left-center': 'absolute top-[20%] left-[10%] z-10',
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
  position = 'center',
  animation = 'float',
  onClick,
  onEditClick,
  className,
}: PulseNodeProps) {
  const { animationsEnabled } = useAnimations()
  const config = PULSE_TYPE_CONFIG[type]
  const resolvedIcon = icon ?? getIconForType(type)
  const posClass = typeof position === 'string' ? positionClasses[position] : ''
  const animClass = animationClasses[animation]
  const customPosition = typeof position === 'object' ? position : undefined

  return (
    <div
      className={cn(
        'pulse-node group cursor-pointer flex flex-col items-center gap-3 w-32',
        posClass,
        animationsEnabled && animClass,
        className
      )}
      onClick={onClick}
      style={
        customPosition
          ? {
              position: 'absolute',
              top: customPosition.top,
              left: customPosition.left,
            }
          : undefined
      }
    >
      {/* Edit Button */}
      {onEditClick && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEditClick(e)
          }}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-gp-primary/20 hover:bg-gp-primary/40 text-gp-primary transition-all opacity-0 group-hover:opacity-100 z-30"
          title="Edit pulse"
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
            `group-hover:border-${type}-tint/30 border border-transparent`
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
