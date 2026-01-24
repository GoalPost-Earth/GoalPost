'use client'

import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'
import { useAnimations } from '@/app/contexts/animation-context'

export type BubbleSize = 'sm' | 'md' | 'lg' | 'xl'
export type BubbleShape = 'circle' | 'organic-1' | 'organic-2' | 'organic-3'

export interface BubbleDecoratorProps {
  icon?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
  animate?: 'pulse' | 'bounce' | 'float' | 'none'
}

export interface EntityBubbleProps {
  size?: BubbleSize
  shape?: BubbleShape
  icon?: string
  title: string
  subtitle?: string
  badge?: {
    text: string
    variant?: 'primary' | 'accent' | 'default'
  }
  decorators?: BubbleDecoratorProps[]
  animationDelay?: number
  className?: string
  onClick?: () => void
  children?: ReactNode
}

const sizeClasses: Record<BubbleSize, string> = {
  sm: 'w-[180px] h-[180px]',
  md: 'w-[220px] h-[220px]',
  lg: 'w-[280px] h-[280px]',
  xl: 'w-[440px] h-[440px]',
}

const shapeClasses: Record<BubbleShape, string> = {
  circle: 'rounded-full',
  'organic-1': 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]',
  'organic-2': 'rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%]',
  'organic-3': 'rounded-[50%_50%_40%_60%_/_50%_60%_50%_40%]',
}

const decoratorPositions: Record<
  NonNullable<BubbleDecoratorProps['position']>,
  string
> = {
  'top-left': 'top-[20%] left-[20%]',
  'top-right': 'top-[20%] right-[20%]',
  'bottom-left': 'bottom-[20%] left-[20%]',
  'bottom-right': 'bottom-[25%] right-[20%]',
}

const decoratorAnimations: Record<
  NonNullable<BubbleDecoratorProps['animate']>,
  string
> = {
  pulse: 'animate-pulse',
  bounce: 'animate-bounce [animation-duration:3s]',
  float: 'animate-float',
  none: '',
}

export function EntityBubble({
  size = 'md',
  shape = 'circle',
  icon,
  title,
  subtitle,
  badge,
  decorators = [],
  animationDelay = 0,
  className,
  onClick,
  children,
}: EntityBubbleProps) {
  const { animationsEnabled } = useAnimations()
  const bubbleRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const ringRef1 = useRef<HTMLDivElement>(null)
  const ringRef2 = useRef<HTMLDivElement>(null)

  // Generate unique random values for this bubble instance
  const randomSeedRef = useRef({
    duration: 12 + Math.random() * 12, // 12-20 seconds (very slow)
    offset: Math.random() * 5, // Random start offset 0-5 seconds
    intensity: 0.04 + Math.random() * 0.03, // 0.04-0.07 for intensity variation
  })

  useGSAP(
    () => {
      if (!bubbleRef.current) return

      if (animationsEnabled) {
        // Entrance animation with delay
        gsap.fromTo(
          bubbleRef.current,
          {
            opacity: 0,
            scale: 0.8,
            y: 50,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.2,
            delay: animationDelay,
            ease: 'power3.out',
            force3D: true,
          }
        )

        // Continuous floating animation
        gsap.to(bubbleRef.current, {
          y: '-=15',
          duration: 4 + animationDelay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      } else {
        // Instantly show without animation
        gsap.set(bubbleRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
        })
      }

      // Wavy edge animation using border-radius morphing with randomization
      if (shape === 'circle' && animationsEnabled) {
        const { duration, offset, intensity } = randomSeedRef.current

        // Initialize bubble to perfect circle before animation starts
        gsap.set(bubbleRef.current, {
          borderRadius: '50%',
        })

        // Generate unique wavy border states based on intensity
        // Keep values in 35-65% range to maintain circular appearance while creating organic waves
        const wavyBorderStates = [
          `${40 + intensity * 15}% ${60 - intensity * 15}% ${60 - intensity * 15}% ${40 + intensity * 15}% / ${60 - intensity * 15}% ${40 + intensity * 15}% ${40 + intensity * 15}% ${60 - intensity * 15}%`,
          `${35 + intensity * 20}% ${65 - intensity * 20}% ${55 - intensity * 20}% ${45 + intensity * 20}% / ${65 - intensity * 20}% ${35 + intensity * 20}% ${45 + intensity * 20}% ${55 - intensity * 20}%`,
          `${55 - intensity * 18}% ${45 + intensity * 18}% ${40 + intensity * 18}% ${60 - intensity * 18}% / ${45 + intensity * 18}% ${55 - intensity * 18}% ${60 - intensity * 18}% ${40 + intensity * 18}%`,
          `${60 - intensity * 20}% ${40 + intensity * 20}% ${45 + intensity * 20}% ${55 - intensity * 20}% / ${40 + intensity * 20}% ${60 - intensity * 20}% ${55 - intensity * 20}% ${45 + intensity * 20}%`,
          `${45 + intensity * 18}% ${55 - intensity * 18}% ${50 - intensity * 15}% ${50 + intensity * 15}% / ${55 - intensity * 18}% ${45 + intensity * 18}% ${50 + intensity * 15}% ${50 - intensity * 15}%`,
          `${50 - intensity * 12}% ${50 + intensity * 12}% ${55 - intensity * 18}% ${45 + intensity * 18}% / ${50 + intensity * 12}% ${50 - intensity * 12}% ${45 + intensity * 18}% ${55 - intensity * 18}%`,
        ]

        // Use yoyo for smooth reversal: forward through states, then back
        // This prevents snapping and creates continuous organic morphing
        const wavyTimeline = gsap.timeline({
          repeat: -1,
          yoyo: true,
        })

        wavyBorderStates.forEach((state) => {
          wavyTimeline.to(bubbleRef.current, {
            borderRadius: state,
            duration: duration / wavyBorderStates.length,
            ease: 'sine.inOut',
          })
        })
      }

      // Rotate decorative rings
      if (animationsEnabled) {
        if (ringRef1.current) {
          gsap.to(ringRef1.current, {
            rotation: 360,
            duration: 80,
            repeat: -1,
            ease: 'none',
          })
        }

        if (ringRef2.current) {
          gsap.to(ringRef2.current, {
            rotation: -360,
            duration: 60,
            repeat: -1,
            ease: 'none',
          })
        }
      }
    },
    {
      scope: bubbleRef,
      dependencies: [animationDelay, shape, animationsEnabled],
    }
  )

  // Hover animation
  const handleMouseEnter = () => {
    if (!bubbleRef.current || !contentRef.current || !animationsEnabled) return

    gsap.to(bubbleRef.current, {
      scale: 1.05,
      duration: 0.4,
      ease: 'power2.out',
    })

    gsap.to(contentRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    })

    if (ringRef1.current) {
      gsap.to(ringRef1.current, {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        duration: 0.3,
      })
    }

    if (ringRef2.current) {
      gsap.to(ringRef2.current, {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        duration: 0.3,
      })
    }
  }

  const handleMouseLeave = () => {
    if (!bubbleRef.current || !contentRef.current || !animationsEnabled) return

    gsap.to(bubbleRef.current, {
      scale: 1,
      duration: 0.4,
      ease: 'power2.out',
    })

    gsap.to(contentRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    })

    if (ringRef1.current) {
      gsap.to(ringRef1.current, {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        duration: 0.3,
      })
    }

    if (ringRef2.current) {
      gsap.to(ringRef2.current, {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        duration: 0.3,
      })
    }
  }

  return (
    <div
      ref={bubbleRef}
      className={cn(
        'relative flex items-center justify-center',
        sizeClasses[size],
        shapeClasses[shape],
        'gp-glass',
        animationsEnabled && 'transition-all duration-300',
        animationsEnabled &&
          'shadow-[0_0_26px_color-mix(in_srgb,var(--gp-primary)_24%,transparent)] hover:shadow-[0_0_34px_color-mix(in_srgb,var(--gp-primary)_36%,transparent)]',
        onClick && 'cursor-pointer',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ willChange: 'transform' }}
    >
      {/* Decorative rotating rings for xl size */}
      {size === 'xl' && (
        <>
          <div
            ref={ringRef1}
            className="absolute inset-4 rounded-full border border-dashed border-gp-glass-border pointer-events-none"
          />
          <div
            ref={ringRef2}
            className="absolute inset-8 rounded-full border border-dotted border-gp-glass-border pointer-events-none"
          />
        </>
      )}

      {/* Decorators */}
      {decorators.map((decorator, index) => (
        <div
          key={index}
          className={cn(
            'absolute z-10',
            decoratorPositions[decorator.position || 'top-left'],
            animationsEnabled &&
              decoratorAnimations[decorator.animate || 'none'],
            decorator.className
          )}
        >
          {decorator.icon && (
            <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft transition-colors">
              {decorator.icon}
            </span>
          )}
        </div>
      ))}

      {/* Main content */}
      <div
        ref={contentRef}
        className="relative z-20 text-center p-4"
        style={{ willChange: 'transform' }}
      >
        {children || (
          <>
            {icon && (
              <div className="mb-3">
                {icon.startsWith('http') ? (
                  <div
                    className="size-10 rounded-full mx-auto bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 flex items-center justify-center transition-colors"
                    style={{
                      backgroundImage: `url(${icon})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ) : (
                  <span
                    className={cn(
                      'material-symbols-outlined mx-auto block',
                      'text-gp-primary transition-colors',
                      size === 'xl'
                        ? 'text-5xl'
                        : size === 'lg'
                          ? 'text-4xl'
                          : size === 'md'
                            ? 'text-3xl'
                            : 'text-2xl'
                    )}
                  >
                    {icon}
                  </span>
                )}
              </div>
            )}

            <h3
              className={cn(
                'font-light tracking-wide text-gp-ink-strong dark:text-gp-ink-strong transition-colors',
                size === 'xl'
                  ? 'text-3xl'
                  : size === 'lg'
                    ? 'text-xl'
                    : size === 'md'
                      ? 'text-lg'
                      : 'text-base'
              )}
            >
              {title}
            </h3>

            {subtitle && (
              <p className="text-xs text-gp-ink-muted dark:text-gp-ink-muted mt-2 font-mono uppercase tracking-widest transition-colors">
                {subtitle}
              </p>
            )}

            {badge && (
              <span
                className={cn(
                  'inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold transition-colors',
                  badge.variant === 'primary' &&
                    'bg-gp-primary/20 border border-gp-primary/30 text-gp-primary',
                  badge.variant === 'accent' &&
                    'bg-gp-accent-glow/20 border border-gp-accent-glow/30 text-gp-accent-glow',
                  badge.variant === 'default' &&
                    'bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 border border-gp-glass-border text-gp-ink-strong dark:text-gp-ink-strong'
                )}
              >
                {badge.text}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Convenience wrapper for bubble groups
export interface BubbleGroupProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function BubbleGroup({
  children,
  className,
  staggerDelay = 0.2,
}: BubbleGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!groupRef.current) return

      const bubbles = groupRef.current.querySelectorAll('[data-bubble]')

      gsap.fromTo(
        bubbles,
        {
          opacity: 0,
          scale: 0.8,
          y: 50,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.2,
          stagger: staggerDelay,
          ease: 'power3.out',
          force3D: true,
        }
      )
    },
    { scope: groupRef }
  )

  return (
    <div ref={groupRef} className={cn('relative', className)}>
      {children}
    </div>
  )
}
