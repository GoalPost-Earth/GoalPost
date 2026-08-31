'use client'

import { type FC } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { saveFocusEntities } from '@/lib/simulation/focus-entities-storage'
import { PrivateProfileNotice } from '@/components/persons/private-profile-notice'
import { SecondaryCta } from './shared'

/**
 * Graceful body for a Person the caller can see in a directory sense (name /
 * photo are ungated, so people stay findable by name) but whose
 * `privateProfile` came back null from the GOAL-275 gate. Rendering this
 * instead of the {@link NotFoundBody} "no longer available / you lost access"
 * copy keeps the affordance honest: the person is real, their private details
 * just aren't shared with this caller. They can still pivot to the graph to
 * explore the connection structurally.
 *
 * Purely presentational — the parent drawer body owns the query and passes the
 * resolved row down, so this component issues no fetch of its own.
 */
export const LimitedPersonBody: FC<{
  person: { id: string; name: string; photo?: string | null }
  onClose: () => void
}> = ({ person, onClose }) => {
  const router = useRouter()

  const handleViewInDashboard = () => {
    if (!person.id || !person.name) return
    const focus = saveFocusEntities([
      { type: 'Person', id: person.id, name: person.name },
    ])
    onClose()
    router.push(`/protected/dashboard?focus=${focus}`)
  }

  return (
    <div className="flex min-h-full flex-col">
      <section className="relative px-6 pt-7 pb-6 border-b border-gp-glass-border bg-gradient-to-br from-gp-primary/20 via-gp-accent-glow/10 to-transparent">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="size-20 rounded-full bg-linear-to-br from-gp-primary/20 to-gp-accent-glow/20 flex items-center justify-center border-4 border-white/50 dark:border-white/10 shadow-lg">
            {person.photo ? (
              <Image
                src={person.photo}
                alt={person.name}
                width={80}
                height={80}
                className="size-20 rounded-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-gp-primary text-4xl">
                person
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words">
              {person.name}
            </h2>
            <p className="text-[11px] text-gp-ink-muted dark:text-white/50 mt-0.5">
              Profile not shared
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-5">
        <PrivateProfileNotice />
      </section>

      <footer className="mt-auto px-6 py-5 border-t border-gp-glass-border bg-black/[0.02] dark:bg-white/[0.02]">
        <SecondaryCta onClick={handleViewInDashboard} className="w-full">
          <span className="material-symbols-outlined text-[18px]">
            dashboard
          </span>
          View in dashboard
        </SecondaryCta>
      </footer>
    </div>
  )
}
