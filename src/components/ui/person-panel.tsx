'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export interface PersonInPanel {
  id: string
  firstName: string
  lastName: string
  name: string | null
  email?: string | null
  photo?: string | null
  role?: 'ADMIN' | 'MEMBER' | 'GUEST' | 'OWNER' | 'PERSON'
}

export interface ConnectedPerson {
  id: string
  firstName: string
  lastName: string
  name: string | null
  photo?: string | null
  role?: 'ADMIN' | 'MEMBER' | 'GUEST' | 'OWNER' | 'PERSON'
}

export interface PersonPanelProps {
  isOpen: boolean
  onClose: () => void
  person: PersonInPanel | null
  connectedPersons?: ConnectedPerson[]
  onConnectionClick?: (connectedPersonId: string) => void
  onRemoveFromField?: (personId: string) => Promise<void>
  isRemovingFromField?: boolean
}

const roleColors: Record<string, { bg: string; text: string; border: string }> =
  {
    OWNER: {
      bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/40',
    },
    ADMIN: {
      bg: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/40',
    },
    MEMBER: {
      bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/40',
    },
    PERSON: {
      bg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/40',
    },
    GUEST: {
      bg: 'bg-gradient-to-br from-slate-500/20 to-gray-500/10',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-500/40',
    },
  }

export function PersonPanel({
  isOpen,
  onClose,
  person,
  connectedPersons = [],
  onConnectionClick,
  onRemoveFromField,
  isRemovingFromField = false,
}: PersonPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useFocusTrap(panelRef, isOpen && !!person)

  // Esc closes — WAI-ARIA modal dialog pattern; parity with EntityInfoDrawer.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

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

  if (!isOpen || !person) return null

  const role = person.role || 'PERSON'
  const colors = roleColors[role] || roleColors.PERSON
  const roleLabel = role === 'PERSON' ? 'Person' : role
  const initials =
    `${person.firstName?.[0] || ''}${person.lastName?.[0] || ''}`.toUpperCase()

  const handleViewProfile = () => {
    router.push(`/protected/dashboard/persons/${person.id}`)
  }

  const canRemoveFromField = role === 'PERSON' && !!onRemoveFromField

  return (
    <>
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${person.name ?? `${person.firstName} ${person.lastName}`.trim()} details`}
        tabIndex={-1}
        className="fixed right-0 top-0 h-full w-96 bg-gp-glass-bg border-l border-gp-glass-border backdrop-blur-2xl z-50 shadow-2xl focus:outline-none"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gp-glass-border">
            <h2 className="text-lg font-semibold text-gp-ink-strong dark:text-white">
              Person Details
            </h2>
            <button
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-gp-ink-muted dark:text-gp-ink-soft"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Person Card */}
              <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white/5 dark:bg-white/5 border border-gp-glass-border">
                <div
                  className={cn(
                    'relative size-24 rounded-full flex items-center justify-center',
                    'border-4',
                    colors.border,
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
                    <span className={cn('text-2xl font-bold', colors.text)}>
                      {initials}
                    </span>
                  )}
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-xl font-semibold text-gp-ink-strong dark:text-white">
                    {person.name ||
                      `${person.firstName} ${person.lastName}`.trim()}
                  </h3>
                  {person.email && (
                    <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft">
                      {person.email}
                    </p>
                  )}
                  {person.role && (
                    <div
                      className={cn(
                        'inline-block px-3 py-1 rounded-full text-xs font-medium',
                        colors.bg,
                        colors.text
                      )}
                    >
                      {roleLabel}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wide">
                  Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 dark:bg-white/5 border border-gp-glass-border">
                    <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft text-xl">
                      person
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                        Name
                      </p>
                      <p className="text-sm font-medium text-gp-ink-strong dark:text-white truncate">
                        {person.firstName} {person.lastName}
                      </p>
                    </div>
                  </div>

                  {person.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 dark:bg-white/5 border border-gp-glass-border">
                      <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft text-xl">
                        mail
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                          Email
                        </p>
                        <p className="text-sm font-medium text-gp-ink-strong dark:text-white truncate">
                          {person.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connected Persons Section */}
              {connectedPersons.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wide flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      group_work
                    </span>
                    Connected People ({connectedPersons.length})
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {connectedPersons.map((connectedPerson) => {
                      const connectedRole = connectedPerson.role || 'PERSON'
                      const connectedColors =
                        roleColors[connectedRole] || roleColors.PERSON
                      const connectedInitials =
                        `${connectedPerson.firstName?.[0] || ''}${connectedPerson.lastName?.[0] || ''}`.toUpperCase()

                      return (
                        <button
                          key={connectedPerson.id}
                          onClick={() =>
                            onConnectionClick?.(connectedPerson.id)
                          }
                          className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all group w-20"
                          title={`View connection with ${connectedPerson.name || `${connectedPerson.firstName} ${connectedPerson.lastName}`}`}
                        >
                          <div
                            className={cn(
                              'relative size-12 rounded-full flex items-center justify-center',
                              'border-2 group-hover:border-gp-primary/60 transition-all',
                              connectedColors.border,
                              connectedColors.bg
                            )}
                          >
                            {connectedPerson.photo ? (
                              <img
                                src={connectedPerson.photo}
                                alt={connectedPerson.name ?? 'Person'}
                                className="size-full rounded-full object-cover"
                              />
                            ) : (
                              <span
                                className={cn(
                                  'text-xs font-bold',
                                  connectedColors.text
                                )}
                              >
                                {connectedInitials}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft truncate w-full text-center leading-tight">
                            {connectedPerson.firstName}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* View Profile Button */}
              <button
                onClick={handleViewProfile}
                className="w-full px-4 py-3 rounded-xl bg-gp-primary hover:shadow-[0_8px_25px_rgba(var(--gp-primary-rgb),0.4)] hover:scale-[1.02] transition-all text-white font-medium flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">
                  open_in_new
                </span>
                View Full Profile
              </button>

              {canRemoveFromField && (
                <button
                  onClick={() => onRemoveFromField?.(person.id)}
                  disabled={isRemovingFromField}
                  className="w-full px-4 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">
                    person_remove
                  </span>
                  {isRemovingFromField ? 'Removing...' : 'Remove From Field'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
