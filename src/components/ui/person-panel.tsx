'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import {
  type ConnectedPerson,
  type PersonInPanel,
  roleColors,
} from './person-panel-shared'
import { PersonPulseBody } from './person-panel-pulse-body'
import { MemberBody } from './person-panel-member-body'

export type { PersonInPanel, ConnectedPerson } from './person-panel-shared'

export interface PersonPanelProps {
  isOpen: boolean
  onClose: () => void
  person: PersonInPanel | null
  connectedPersons?: ConnectedPerson[]
  onConnectionClick?: (connectedPersonId: string) => void
  onRemoveFromField?: (personId: string) => Promise<void>
  isRemovingFromField?: boolean
  /**
   * A PersonPulse's relational note — who they are. Read + inline-editable.
   * Only meaningful for the PERSON (person pulse) variant.
   */
  description?: string | null
  /**
   * The current user's relationship to this person (CONNECTED_TO.why). The
   * parent resolves it from the connection edge whose other end is the user.
   */
  relationshipWhy?: string | null
  /** Fired after a successful edit so the parent can refetch. */
  onPersonUpdated?: () => void
}

export function PersonPanel({
  isOpen,
  onClose,
  person,
  connectedPersons = [],
  onConnectionClick,
  onRemoveFromField,
  isRemovingFromField = false,
  description = null,
  relationshipWhy = null,
  onPersonUpdated,
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
  const isPersonPulse = role === 'PERSON'
  const displayName =
    person.name || `${person.firstName} ${person.lastName}`.trim()
  const initials =
    `${person.firstName?.[0] || ''}${person.lastName?.[0] || ''}`.toUpperCase()

  const handleViewProfile = () => {
    router.push(`/protected/dashboard/persons/${person.id}`)
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${displayName} details`}
      tabIndex={-1}
      className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gp-glass-bg border-l border-gp-glass-border backdrop-blur-2xl z-50 shadow-2xl focus:outline-none"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gp-glass-border">
          <h2 className="text-lg font-semibold text-gp-ink-strong dark:text-white">
            {isPersonPulse ? 'Person' : 'Member'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-gp-ink-muted dark:text-gp-ink-soft"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Identity card */}
          <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-black/[0.05] dark:bg-white/5 border border-gp-glass-border">
            <div
              className={cn(
                'relative size-20 rounded-full flex items-center justify-center border-4',
                colors.border,
                colors.bg
              )}
            >
              {person.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={person.photo}
                  alt={displayName || 'Person'}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <span className={cn('text-2xl font-bold', colors.text)}>
                  {initials}
                </span>
              )}
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-semibold text-gp-ink-strong dark:text-white">
                {displayName}
              </h3>
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                  colors.bg,
                  colors.text
                )}
              >
                <span className="material-symbols-outlined text-[14px] leading-none">
                  {isPersonPulse ? 'diversity_3' : 'badge'}
                </span>
                {isPersonPulse
                  ? 'Person'
                  : role.charAt(0) + role.slice(1).toLowerCase()}
              </div>
            </div>
          </div>

          {isPersonPulse ? (
            <PersonPulseBody
              person={person}
              description={description}
              relationshipWhy={relationshipWhy}
              onPersonUpdated={onPersonUpdated}
              onViewProfile={handleViewProfile}
              onRemoveFromField={onRemoveFromField}
              isRemovingFromField={isRemovingFromField}
            />
          ) : (
            <MemberBody
              person={person}
              connectedPersons={connectedPersons}
              onConnectionClick={onConnectionClick}
              onViewProfile={handleViewProfile}
            />
          )}
        </div>
      </div>
    </div>
  )
}
