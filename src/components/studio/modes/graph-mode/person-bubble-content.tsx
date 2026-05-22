'use client'

import { useRef, type FC, type MouseEvent } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'
import type { BubbleSize } from '@/components/ui/entity-bubble'
import { useAnimations } from '@/contexts/animation-context'

/**
 * PersonPulse / owner rendering for the Graph mode's spatial canvas.
 * Deliberately NOT wrapped in `EntityBubble`'s organic floating shell —
 * persons read as `PersonNode`-style avatars (photo or initials inside
 * a role-coloured ring with a small role pill and a name label) rather
 * than as another bubble, so they stand out against the field /
 * resource / story bubbles.
 *
 * Self-contained: handles its own click wrapper, drag suppression, and
 * entrance animation so the NVL container only has to mount one
 * React element per node (same contract as the `EntityBubble` render
 * path it replaced).
 *
 * Role palette mirrors `PersonNode` on the legacy field pages — owner
 * = amber, PersonPulse = emerald.
 */

export type PersonBubbleRole = 'OWNER' | 'PERSON'

export interface PersonBubblePerson {
  firstName: string
  lastName: string
  name: string
  photo: string | null
  role: PersonBubbleRole
}

const ROLE_COLORS: Record<
  PersonBubbleRole,
  { bg: string; border: string; text: string; glow: string }
> = {
  OWNER: {
    bg: 'bg-gradient-to-br from-amber-500/25 to-yellow-500/10',
    border: 'border-amber-500/50',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-[0_0_22px_rgba(245,158,11,0.32)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]',
  },
  PERSON: {
    bg: 'bg-gradient-to-br from-emerald-500/25 to-teal-500/10',
    border: 'border-emerald-500/50',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-[0_0_22px_rgba(16,185,129,0.32)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
  },
}

// Avatar diameters scale with the slot the NVL layout allocated, so a
// person occupying an `xl` slot reads as comparably prominent to a
// large field / pulse bubble next to it.
const AVATAR_SIZES: Record<BubbleSize, string> = {
  sm: 'size-20',
  md: 'size-24',
  lg: 'size-32',
  xl: 'size-40',
}

const INITIALS_TEXT: Record<BubbleSize, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
}

const NAME_TEXT: Record<BubbleSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
}

export const PersonBubbleContent: FC<{
  person: PersonBubblePerson
  size: BubbleSize
  animationDelay?: number
  onClick?: () => void
}> = ({ person, size, animationDelay = 0, onClick }) => {
  const { animationsEnabled } = useAnimations()
  const rootRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  const colors = ROLE_COLORS[person.role]
  const initials =
    `${person.firstName[0] ?? ''}${person.lastName[0] ?? ''}`.toUpperCase() ||
    person.name.slice(0, 2).toUpperCase()
  const roleLabel = person.role === 'OWNER' ? 'Owner' : 'Person'

  // Match EntityBubble's entrance + idle float so persons feel like
  // first-class spatial nodes rather than static badges dropped on top.
  useGSAP(
    () => {
      if (!rootRef.current) return
      if (!animationsEnabled) {
        gsap.set(rootRef.current, { opacity: 1, scale: 1, y: 0 })
        return
      }
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, scale: 0.85, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          delay: animationDelay,
          ease: 'power3.out',
          force3D: true,
        }
      )
      gsap.to(rootRef.current, {
        y: '-=12',
        duration: 4 + animationDelay,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    },
    { scope: rootRef, dependencies: [animationsEnabled, animationDelay] }
  )

  // Drag suppression — NVL's pan/drag also fires native mouseup as a
  // click on whichever DOM node was under the cursor. Mirror the
  // EntityBubble guard so dragging the canvas across a person doesn't
  // accidentally navigate.
  const handleMouseDown = (e: MouseEvent) => {
    isDraggingRef.current = false
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      isDraggingRef.current = true
    }
  }
  const handleMouseUp = () => {
    dragStartRef.current = null
  }
  const handleClick = (e: MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault()
      e.stopPropagation()
      isDraggingRef.current = false
      return
    }
    onClick?.()
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        'group flex flex-col items-center gap-3 select-none pointer-events-auto',
        onClick && 'cursor-pointer'
      )}
      style={{ willChange: 'transform' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center border-2 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105',
          AVATAR_SIZES[size],
          colors.bg,
          colors.border,
          colors.glow
        )}
      >
        {person.photo ? (
          // Matches PersonNode / PersonPanel — those live in
          // `src/components/ui/**` (eslint-ignored) and also use a raw
          // <img> for avatar URLs from arbitrary remotes; keeping the
          // same pattern here avoids configuring next/image domains
          // for every Google / Gravatar / S3 host a user might supply.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.photo}
            alt={person.name}
            className="size-full rounded-full object-cover"
          />
        ) : (
          <span className={cn('font-bold', INITIALS_TEXT[size], colors.text)}>
            {initials}
          </span>
        )}
        <span
          className={cn(
            'absolute -bottom-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm',
            colors.bg,
            colors.border,
            colors.text
          )}
        >
          {roleLabel}
        </span>
      </div>
      <h3
        className={cn(
          'font-light tracking-wide text-gp-ink-strong dark:text-gp-ink-strong text-center',
          NAME_TEXT[size]
        )}
      >
        {person.name}
      </h3>
    </div>
  )
}
