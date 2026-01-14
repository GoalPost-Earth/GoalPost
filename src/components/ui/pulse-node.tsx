'use client'

import { cn } from '@/lib/utils'

export type NodeType = 'goal' | 'resource' | 'story'

export interface PulseNodeProps {
  icon: string
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
  animation?: 'float' | 'float-delayed' | 'float-random' | 'pulse-slow' | 'none'
  onClick?: () => void
  className?: string
}

const typeConfig: Record<
  NodeType,
  { color: string; shadowColor: string; bgClass: string }
> = {
  goal: {
    color: 'text-gp-goal',
    shadowColor: 'rgba(56,189,248,0.3)',
    bgClass: 'bg-white/70 dark:bg-black/60',
  },
  resource: {
    color: 'text-gp-resource',
    shadowColor: 'rgba(74,222,128,0.3)',
    bgClass: 'bg-white/70 dark:bg-[#1a1a1a]/60',
  },
  story: {
    color: 'text-gp-story',
    shadowColor: 'rgba(192,132,252,0.3)',
    bgClass: 'bg-white/70 dark:bg-[#262626]/60',
  },
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

const typeLabels: Record<NodeType, string> = {
  goal: 'Goal',
  resource: 'Resource',
  story: 'Story',
}

export function PulseNode({
  icon,
  label,
  type,
  position = 'center',
  animation = 'float',
  onClick,
  className,
}: PulseNodeProps) {
  const config = typeConfig[type]
  const posClass = positionClasses[position]
  const animClass = animationClasses[animation]

  return (
    <div
      className={cn(
        'pulse-node group cursor-pointer flex flex-col items-center gap-3 w-32',
        posClass,
        animClass,
        className
      )}
      onClick={onClick}
    >
      {/* Node Container */}
      <div
        className={cn(
          'relative flex items-center justify-center size-20 rounded-2xl',
          'glass-panel transition-all duration-300',
          'group-hover:scale-110 group-hover:-translate-y-2',
          config.bgClass,
          'shadow-[0_0_20px_var(--shadow-color)] group-hover:shadow-[0_0_40px_var(--shadow-color)]',
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
            'material-symbols-outlined text-4xl drop-shadow-sm group-hover:drop-shadow-md',
            config.color
          )}
        >
          {icon}
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
          {typeLabels[type]}
        </span>
      </div>
    </div>
  )
}
