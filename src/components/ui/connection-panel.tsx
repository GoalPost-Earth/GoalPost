'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'

export interface PersonInConnection {
  id: string
  firstName: string
  lastName: string
  name: string | null
  email?: string | null
  photo?: string | null
  role?: 'ADMIN' | 'MEMBER' | 'GUEST' | 'OWNER'
}

export interface ConnectionPanelProps {
  isOpen: boolean
  onClose: () => void
  connection: {
    person1: PersonInConnection
    person2: PersonInConnection
    why?: string | null
    interests?: string | null
  } | null
}

const roleColors: Record<string, { bg: string; text: string }> = {
  OWNER: {
    bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10',
    text: 'text-amber-600 dark:text-amber-400',
  },
  ADMIN: {
    bg: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/10',
    text: 'text-purple-600 dark:text-purple-400',
  },
  MEMBER: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
    text: 'text-blue-600 dark:text-blue-400',
  },
  GUEST: {
    bg: 'bg-gradient-to-br from-slate-500/20 to-gray-500/10',
    text: 'text-slate-600 dark:text-slate-400',
  },
}

export function ConnectionPanel({
  isOpen,
  onClose,
  connection,
}: ConnectionPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (panelRef.current) {
      if (isOpen) {
        gsap.fromTo(
          panelRef.current,
          { x: '100%', opacity: 0 },
          { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
        )
      } else {
        gsap.to(panelRef.current, {
          x: '100%',
          opacity: 0,
          duration: 0.3,
          ease: 'power3.in',
        })
      }
    }
  }, [isOpen])

  if (!isOpen || !connection) return null

  const { person1, person2, why, interests } = connection

  const renderPerson = (person: PersonInConnection) => {
    const colors = roleColors[person.role || 'MEMBER'] || roleColors.MEMBER
    const initials =
      `${person.firstName?.[0] || ''}${person.lastName?.[0] || ''}`.toUpperCase()

    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 dark:bg-white/5 border border-gp-glass-border">
        <div
          className={cn(
            'relative size-12 rounded-full flex items-center justify-center',
            'border-2 border-gp-primary/40',
            colors.bg
          )}
        >
          {person.photo ? (
            <img
              src={person.photo}
              alt={person.name ?? 'Person'}
              className="size-full rounded-full object-cover"
            />
          ) : (
            <span className={cn('text-sm font-bold', colors.text)}>
              {initials}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gp-ink-strong dark:text-gp-ink-strong truncate">
            {person.name || `${person.firstName} ${person.lastName}`}
          </h4>
          {person.email && (
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft truncate">
              {person.email}
            </p>
          )}
          {person.role && (
            <span
              className={cn(
                'inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase',
                colors.text,
                colors.bg
              )}
            >
              {person.role}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={panelRef}
      className="absolute top-4 right-4 bottom-20 w-96 bg-gp-glass-bg/80 backdrop-blur-xl border border-gp-glass-border rounded-2xl flex flex-col shadow-2xl z-40 overflow-hidden"
      style={{
        transform: 'translateX(100%)',
        opacity: 0,
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gp-glass-border bg-white/5 dark:bg-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gp-primary text-xs font-bold uppercase tracking-wider">
            Connection
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <h2 className="text-xl font-bold text-gp-ink-strong dark:text-gp-ink-strong leading-tight">
          Connected People
        </h2>
        <div className="flex items-center gap-2 mt-3">
          <span className="flex h-2 w-2 rounded-full bg-gp-primary animate-pulse" />
          <span className="text-xs text-gp-primary">Active Connection</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Person 1 */}
        <div>
          <h3 className="text-xs font-semibold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wider mb-2">
            Person
          </h3>
          {renderPerson(person1)}
        </div>

        {/* Connection Icon */}
        <div className="flex justify-center">
          <div className="size-10 rounded-full bg-linear-to-br from-gp-primary/20 to-gp-primary/10 border border-gp-primary/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-gp-primary text-xl">
              group_work
            </span>
          </div>
        </div>

        {/* Why Connected */}
        {why && (
          <div className="bg-white/5 dark:bg-white/5 rounded-lg p-4 border border-gp-glass-border">
            <h3 className="text-xs font-semibold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wider mb-2">
              Why Connected
            </h3>
            <p className="text-sm text-gp-ink-strong dark:text-gp-ink-strong leading-relaxed">
              {why}
            </p>
          </div>
        )}

        {/* Person 2 */}
        <div>
          <h3 className="text-xs font-semibold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wider mb-2">
            Connected To
          </h3>
          {renderPerson(person2)}
        </div>

        {/* Shared Interests */}
        {interests && (
          <div className="pt-4 border-t border-gp-glass-border">
            <h3 className="text-xs font-semibold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wider mb-2">
              Shared Interests
            </h3>
            <p className="text-sm text-gp-ink-strong dark:text-gp-ink-strong leading-relaxed">
              {interests}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
