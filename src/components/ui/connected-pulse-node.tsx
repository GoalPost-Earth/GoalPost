'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'

export type ConnectedPulseType = 'goal' | 'resource' | 'story'

export interface ConnectedPulseNodeProps {
  id: string
  icon: string
  label: string
  type: ConnectedPulseType
  position: {
    top: string
    left: string
  }
  isVisible: boolean
  delay?: number
  onClick?: () => void
}

const typeConfig = {
  goal: {
    color:
      'text-slate-400 dark:text-white/50 group-hover:text-gp-primary dark:group-hover:text-white',
    icon: 'flag',
    label: 'Goal',
    bgLight: 'bg-white/60 group-hover:bg-white',
    bgDark: 'bg-black/40 group-hover:bg-zinc-800',
    borderLight: 'border-white/60 group-hover:border-white',
    borderDark: 'border-white/10 group-hover:border-white/30',
    badgeIcon: 'track_changes',
  },
  resource: {
    color:
      'text-slate-400 dark:text-white/50 group-hover:text-gp-primary dark:group-hover:text-white',
    icon: 'diamond',
    label: 'Resource',
    bgLight: 'bg-white/60 group-hover:bg-white',
    bgDark: 'bg-black/40 group-hover:bg-zinc-800',
    borderLight: 'border-white/60 group-hover:border-white',
    borderDark: 'border-white/10 group-hover:border-white/30',
    badgeIcon: 'diamond',
  },
  story: {
    color:
      'text-slate-400 dark:text-white/50 group-hover:text-gp-primary dark:group-hover:text-white',
    icon: 'auto_stories',
    label: 'Story',
    bgLight: 'bg-white/60 group-hover:bg-white',
    bgDark: 'bg-black/40 group-hover:bg-zinc-800',
    borderLight: 'border-white/60 group-hover:border-white',
    borderDark: 'border-white/10 group-hover:border-white/30',
    badgeIcon: 'auto_stories',
  },
}

export function ConnectedPulseNode({
  id,
  icon,
  label,
  type,
  position,
  isVisible,
  delay = 0,
  onClick,
}: ConnectedPulseNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const config = typeConfig[type]

  useEffect(() => {
    if (nodeRef.current) {
      if (isVisible) {
        gsap.fromTo(
          nodeRef.current,
          {
            opacity: 0,
            scale: 0,
          },
          {
            opacity: 0.8,
            scale: 1,
            duration: 0.6,
            delay: delay,
            ease: 'back.out(1.7)',
          }
        )
      } else {
        gsap.to(nodeRef.current, {
          opacity: 0,
          scale: 0,
          duration: 0.3,
          ease: 'power2.in',
        })
      }
    }
  }, [isVisible, delay])

  return (
    <div
      ref={nodeRef}
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 scale-0',
        'hover:opacity-100 transition-opacity duration-300'
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div
        className="flex flex-col items-center gap-3 group cursor-pointer"
        onClick={onClick}
      >
        {/* Pulse Node */}
        <div className="relative">
          <div
            className={cn(
              'flex items-center justify-center size-14 rounded-full shadow-sm backdrop-blur-md transition-all duration-300',
              'group-hover:scale-110 group-hover:shadow-lg',
              // Light mode styles
              'dark:hidden',
              config.bgLight,
              config.borderLight,
              'border'
            )}
          >
            <span
              className={cn('material-symbols-outlined text-2xl', config.color)}
            >
              {icon}
            </span>
          </div>

          {/* Dark mode node */}
          <div
            className={cn(
              'hidden dark:flex items-center justify-center size-14 rounded-full shadow-sm backdrop-blur-md transition-all duration-300',
              'group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]',
              config.bgDark,
              config.borderDark,
              'border'
            )}
          >
            <span
              className={cn('material-symbols-outlined text-2xl', config.color)}
            >
              {icon}
            </span>
          </div>

          {/* Type Badge */}
          <div className="absolute -top-1 -right-1 size-6 rounded-full bg-white dark:bg-neutral-800 border border-slate-200 dark:border-white/20 flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[14px] text-slate-500 dark:text-white/60">
              {config.badgeIcon}
            </span>
          </div>
        </div>

        {/* Label */}
        <div className="flex flex-col items-center text-center transition-transform duration-300 group-hover:translate-y-1">
          <span className="text-xs font-medium text-slate-700 dark:text-white/90 tracking-wide drop-shadow-sm">
            {label}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mt-0.5">
            {config.label}
          </span>
        </div>
      </div>
    </div>
  )
}
