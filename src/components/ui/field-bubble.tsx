'use client'

import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'

export interface FieldBubbleProps {
  icon: string
  title: string
  description?: string
  badge?: {
    text: string
    variant?: 'primary' | 'accent' | 'default'
  }
  members?: Array<{ initials: string; color?: string }>
  position?:
    | 'center'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'right-center'
    | 'left-center'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'organic-1' | 'organic-2' | 'organic-3'
  animationType?: 'float' | 'float-delayed' | 'float-slow' | 'none'
  decorators?: Array<{
    icon: string
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    opacity?:
      | 'opacity-10'
      | 'opacity-20'
      | 'opacity-30'
      | 'opacity-40'
      | 'opacity-50'
    animate?: 'bounce' | 'pulse' | 'float' | 'none'
  }>
  onClick?: () => void
  className?: string
  children?: ReactNode
}

const sizeClasses: Record<string, string> = {
  sm: 'w-[180px] h-[180px]',
  md: 'w-[220px] h-[220px]',
  lg: 'w-[280px] h-[280px]',
  xl: 'w-[440px] h-[440px]',
}

const shapeClasses: Record<string, string> = {
  circle: 'rounded-full',
  'organic-1': 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]',
  'organic-2': 'rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%]',
  'organic-3': 'rounded-[50%_50%_40%_60%_/_50%_60%_50%_40%]',
}

const positionClasses: Record<string, string> = {
  center: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20',
  'top-left': 'absolute top-[12%] left-[12%] z-10',
  'top-right': 'absolute top-[18%] right-[22%] z-10',
  'bottom-left': 'absolute bottom-[18%] left-[22%] z-0',
  'bottom-right': 'absolute bottom-[8%] right-[12%] z-10',
  'top-center': 'absolute top-[15%] left-1/2 -translate-x-1/2 z-10',
  'right-center': 'absolute right-[8%] top-1/2 -translate-y-1/2 z-10',
  'left-center': 'absolute left-[8%] top-1/2 -translate-y-1/2 z-10',
}

export function FieldBubble({
  icon,
  title,
  description,
  badge,
  members,
  position = 'center',
  size = 'md',
  shape = 'circle',
  animationType = 'float',
  decorators = [],
  onClick,
  className,
  children,
}: FieldBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!bubbleRef.current) return

    // Entrance animation
    gsap.from(bubbleRef.current, {
      opacity: 0,
      scale: 0.8,
      y: 20,
      duration: 1.2,
      ease: 'back.out',
    })

    // Floating animation
    if (animationType !== 'none') {
      const duration =
        animationType === 'float-slow'
          ? 6
          : animationType === 'float-delayed'
            ? 5
            : 4
      const delay = animationType === 'float-delayed' ? 0.5 : 0

      gsap.to(bubbleRef.current, {
        y: '-=15',
        duration,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay,
      })
    }

    // Rotating border rings
    if (ringRef.current?.children[0]) {
      gsap.to(ringRef.current.children[0], {
        rotation: 360,
        duration: 80,
        repeat: -1,
        ease: 'none',
      })
    }
    if (ringRef.current?.children[1]) {
      gsap.to(ringRef.current.children[1], {
        rotation: -360,
        duration: 60,
        repeat: -1,
        ease: 'none',
      })
    }
  })

  const animationClass = {
    float: 'animate-float',
    'float-delayed': 'animate-float-delayed',
    'float-slow': 'animate-float-slow',
    none: '',
  }[animationType]

  const badgeVariantClasses = {
    primary:
      'bg-gp-primary/20 border-gp-primary/30 text-gp-primary shadow-[0_0_10px_rgba(19,127,236,0.2)]',
    accent:
      'bg-gp-accent-glow/20 border-gp-accent-glow/30 text-gp-accent-glow shadow-[0_0_10px_rgba(79,255,203,0.2)]',
    default: 'bg-white/10 border-white/20 text-white/80',
  }

  return (
    <div
      className={cn(
        positionClasses[position],
        sizeClasses[size],
        'group cursor-pointer transition-all duration-500',
        className
      )}
      onClick={onClick}
    >
      <div
        ref={bubbleRef}
        className={cn(
          'relative w-full h-full flex items-center justify-center',
          shapeClasses[shape],
          'bg-gp-glass dark:bg-gp-glass backdrop-blur-md transition-all duration-500',
          'border border-white/5 dark:border-white/10 hover:border-white/20 dark:hover:border-white/20',
          'group-hover:shadow-[0_0_40px_rgba(19,127,236,0.15)] group-hover:dark:shadow-[0_0_40px_rgba(19,127,236,0.25)] transition-all'
        )}
      >
        {/* Rotating border rings */}
        <div ref={ringRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-4 rounded-full border border-dashed border-white/5 group-hover:border-white/10" />
          <div className="absolute inset-8 rounded-full border border-dotted border-white/5 group-hover:border-white/10" />
        </div>

        {/* Main content */}
        <div className="text-center relative z-10 px-4 py-6 flex flex-col items-center">
          {/* Icon */}
          <div className="size-10 rounded-full bg-white/5 dark:bg-white/10 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-white/10 dark:group-hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors">
              {icon}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-base md:text-lg font-medium text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors">
            {title}
          </h4>

          {/* Description */}
          {description && (
            <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft mt-1 max-w-30 leading-tight">
              {description}
            </p>
          )}

          {/* Badge */}
          {badge && (
            <span
              className={cn(
                'inline-block mt-2 px-2 py-0.5 rounded-full border text-[10px] font-bold',
                badgeVariantClasses[badge.variant || 'default']
              )}
            >
              {badge.text}
            </span>
          )}

          {/* Members */}
          {members && members.length > 0 && (
            <div className="flex -space-x-2 justify-center mt-3 overflow-hidden">
              {members.map((member, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-6 h-6 rounded-full border border-gp-surface-dark dark:border-gp-surface-strong flex items-center justify-center text-[10px] font-semibold',
                    member.color ||
                      'bg-white/10 dark:bg-white/20 text-gp-ink-strong dark:text-gp-ink-soft'
                  )}
                >
                  {member.initials}
                </div>
              ))}
            </div>
          )}

          {children}
        </div>

        {/* Decorators */}
        {decorators.map((decorator, idx) => (
          <div
            key={idx}
            className={cn(
              'absolute group-hover:opacity-80 transition-opacity',
              decorator.position === 'top-left' && 'top-[20%] left-[25%]',
              decorator.position === 'top-right' && 'top-[20%] right-[25%]',
              decorator.position === 'bottom-left' && 'bottom-[25%] left-[20%]',
              decorator.position === 'bottom-right' &&
                'bottom-[25%] right-[20%]',
              decorator.opacity || 'opacity-30',
              {
                'animate-bounce animation-duration-[3s]':
                  decorator.animate === 'bounce',
                'animate-pulse': decorator.animate === 'pulse',
                'animate-float': decorator.animate === 'float',
              }
            )}
          >
            <span className="material-symbols-outlined text-sm text-gp-ink-soft dark:text-white/40">
              {decorator.icon}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
