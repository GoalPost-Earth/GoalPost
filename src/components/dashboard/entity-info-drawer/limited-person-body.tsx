'use client'

import { type FC } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { saveFocusEntities } from '@/lib/simulation/focus-entities-storage'
import { SecondaryCta } from './shared'

/**
 * Graceful fallback for a Person the caller can SEE in a directory sense
 * (name / photo are ungated) but whose private profile is filtered out by the
 * GOAL-275 PII gate — i.e. a connection the caller neither created nor shares a
 * Space with (see PERSON_QUERIES → GET_PERSON_DIRECTORY). Rendering this instead
 * of the {@link NotFoundBody} "no longer available / you lost access" copy keeps
 * the affordance honest: the person is real and still in the caller's network,
 * their private details just aren't shared. The caller can still pivot to the
 * graph to explore the connection structurally.
 *
 * Purely presentational — the parent drawer body owns the directory query and
 * passes the resolved data down, so this component itself issues no fetch.
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
              In your network
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-5">
        <div className="flex items-start gap-3 rounded-xl border border-gp-glass-border bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3.5">
          <span className="material-symbols-outlined shrink-0 text-[20px] text-gp-ink-muted dark:text-white/50">
            lock
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gp-ink-strong dark:text-white/90">
              Private profile
            </p>
            <p className="mt-1 text-xs text-gp-ink-muted dark:text-white/55 leading-relaxed">
              This person is in your network, but their profile details are
              only shared with people they&apos;ve connected with in a Space.
            </p>
          </div>
        </div>
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
