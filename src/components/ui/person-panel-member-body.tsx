'use client'

import { cn } from '@/lib/utils'
import {
  type ConnectedPerson,
  type PersonInPanel,
  roleColors,
  sectionTitleClass,
} from './person-panel-shared'

/**
 * Member body — a real platform participant. They use GoalPost, joined the
 * space, and own their own pulses, so their profile is theirs to manage. This
 * view is read-only here: contact, connected people, and a link out.
 */
export function MemberBody({
  person,
  connectedPersons,
  onConnectionClick,
  onViewProfile,
}: {
  person: PersonInPanel
  connectedPersons: ConnectedPerson[]
  onConnectionClick?: (id: string) => void
  onViewProfile: () => void
}) {
  return (
    <div className="mt-5 space-y-5">
      <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
        A member of this space — they use GoalPost and contribute their own
        pulses. Their profile is theirs to manage.
      </p>

      {person.email && (
        <div className="space-y-2">
          <h4 className={sectionTitleClass}>Contact</h4>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-black/[0.05] dark:bg-white/5 border border-gp-glass-border">
            <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft text-xl">
              mail
            </span>
            <p className="text-sm font-medium text-gp-ink-strong dark:text-white truncate">
              {person.email}
            </p>
          </div>
        </div>
      )}

      {connectedPersons.length > 0 && (
        <div className="space-y-3">
          <h4 className={cn('flex items-center gap-2', sectionTitleClass)}>
            <span className="material-symbols-outlined text-lg">
              group_work
            </span>
            Connected People ({connectedPersons.length})
          </h4>
          <div className="flex flex-wrap gap-3">
            {connectedPersons.map((cp) => {
              const cpColors =
                roleColors[cp.role || 'PERSON'] || roleColors.PERSON
              const cpInitials =
                `${cp.firstName?.[0] || ''}${cp.lastName?.[0] || ''}`.toUpperCase()
              return (
                <button
                  key={cp.id}
                  onClick={() => onConnectionClick?.(cp.id)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all group w-20"
                  title={`View ${cp.name || cp.firstName}`}
                >
                  <div
                    className={cn(
                      'relative size-12 rounded-full flex items-center justify-center border-2 group-hover:border-gp-primary/60 transition-all',
                      cpColors.border,
                      cpColors.bg
                    )}
                  >
                    {cp.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cp.photo}
                        alt={cp.name ?? 'Person'}
                        className="size-full rounded-full object-cover"
                      />
                    ) : (
                      <span className={cn('text-xs font-bold', cpColors.text)}>
                        {cpInitials}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft truncate w-full text-center leading-tight">
                    {cp.firstName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button
        onClick={onViewProfile}
        className="w-full px-4 py-3 rounded-xl bg-gp-primary hover:shadow-[0_8px_25px_color-mix(in_srgb,var(--gp-primary)_40%,transparent)] hover:scale-[1.02] transition-all text-white font-medium flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-xl">open_in_new</span>
        View Full Profile
      </button>
    </div>
  )
}
