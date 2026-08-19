'use client'

import type { FC } from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LinkifiedText } from '@/components/ui/linkified-text'
import type { GetPersonProfileQuery } from '@/gql/graphql'
import { SectionHeader } from './shared'
import { ShowMoreToggle, useExpandableList } from './expandable-list'
import { dispatchOpenInfoDrawer } from './types'

/**
 * Truncated list sections of the Person drawer (GOAL-315). Split out of
 * `person-details-body.tsx` so each section owns its own expand/collapse
 * state instead of the body carrying a hook per list, and so the body stays
 * inside the 400-line component budget.
 */

type PersonProfile = GetPersonProfileQuery['people'][number]
export type PersonConnection = PersonProfile['connections'][number]
export type PersonConnectionEdge = PersonProfile['connectionEdges'][number]

/**
 * A pulse reached through a WeSpace the person owns, decorated in the body
 * with the space/context it came from.
 */
export type PersonOwnedPulseRow = {
  id: string
  title?: string | null
  spaceName?: string | null
  contextName?: string | null
}

const CONNECTION_LIMIT = 6
const PULSE_LIMIT = 5

export const PersonConnectionsSection: FC<{
  connections: PersonConnection[]
  connectionEdges?: PersonConnectionEdge[] | null
}> = ({ connections, connectionEdges }) => {
  const { visible, hiddenCount, expanded, toggle } = useExpandableList(
    connections,
    CONNECTION_LIMIT
  )
  // Map rather than a per-row `.find()`: once expanded this list is
  // unbounded, and the linear scan made rendering it O(n²).
  const edges = new Map(
    (connectionEdges ?? []).map((e) => [e.connectedPersonId, e])
  )
  if (connections.length === 0) return null

  return (
    <section className="px-6 pb-5">
      <SectionHeader>Connections ({connections.length})</SectionHeader>
      <ul className="mt-2 space-y-2">
        {visible.map((connection) => {
          const edge = edges.get(connection.id)
          return (
            <li key={connection.id}>
              <button
                type="button"
                onClick={() =>
                  dispatchOpenInfoDrawer({
                    type: 'Person',
                    id: connection.id,
                    label: connection.name ?? undefined,
                  })
                }
                className="group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03] hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20 px-4 py-3 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 shrink-0 rounded-full bg-linear-to-br from-gp-primary/20 to-gp-primary/10 flex items-center justify-center">
                    {connection.photo ? (
                      <Image
                        src={connection.photo}
                        alt={connection.name}
                        width={36}
                        height={36}
                        className="size-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-gp-primary text-lg">
                        person
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gp-ink-strong dark:text-white/90 truncate">
                      {connection.name}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                </div>
                {edge?.why && (
                  <p className="mt-2 text-[11px] text-gp-ink-muted dark:text-white/55 leading-relaxed line-clamp-2">
                    {edge.why}
                  </p>
                )}
                {edge?.interests && (
                  <p className="mt-1 text-[11px] text-gp-ink-muted dark:text-white/45 leading-relaxed line-clamp-1">
                    <span className="font-semibold">Interests:</span>{' '}
                    {edge.interests}
                  </p>
                )}
              </button>
            </li>
          )
        })}
        {hiddenCount > 0 && (
          <li className="pt-0.5">
            <ShowMoreToggle
              expanded={expanded}
              hiddenCount={hiddenCount}
              onToggle={toggle}
              itemLabel="connections"
            />
          </li>
        )}
      </ul>
    </section>
  )
}

/**
 * Recent pulses reached via the person's owned WeSpaces. Previously this
 * list was silently capped at five with no indicator at all — worse than
 * the "+ N more" label elsewhere, since nothing hinted more existed.
 */
export const PersonPulsesSection: FC<{ pulses: PersonOwnedPulseRow[] }> = ({
  pulses,
}) => {
  const { visible, hiddenCount, expanded, toggle } = useExpandableList(
    pulses,
    PULSE_LIMIT
  )
  if (pulses.length === 0) return null

  return (
    <section className="px-6 pb-5">
      <SectionHeader>Recent pulses ({pulses.length})</SectionHeader>
      <ul className="mt-2 space-y-1.5">
        {visible.map((pulse) => (
          <li key={pulse.id}>
            <button
              type="button"
              onClick={() =>
                dispatchOpenInfoDrawer({
                  type: 'Pulse',
                  id: pulse.id,
                  label: pulse.title ?? undefined,
                })
              }
              className="group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03] hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20 px-4 py-2.5 transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gp-ink-strong dark:text-white/90 truncate">
                  {pulse.title}
                </p>
                <p className="text-[10px] text-gp-ink-muted dark:text-white/45 truncate">
                  {pulse.spaceName} · {pulse.contextName}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
            </button>
          </li>
        ))}
        {hiddenCount > 0 && (
          <li className="pt-0.5">
            <ShowMoreToggle
              expanded={expanded}
              hiddenCount={hiddenCount}
              onToggle={toggle}
              itemLabel="pulses"
            />
          </li>
        )}
      </ul>
    </section>
  )
}

/**
 * Small presentational rows shared by the Person drawer body.
 */
export const AttrBlock: FC<{ label: string; text: string }> = ({ label, text }) => (
  <div>
    <SectionHeader>{label}</SectionHeader>
    <div className="mt-1.5 text-xs text-gp-ink-muted dark:text-white/65 leading-relaxed">
      <LinkifiedText text={text} />
    </div>
  </div>
)

export const SpaceRow: FC<{
  id: string
  name: string
  kind: 'MeSpace' | 'WeSpace'
  meta?: string
}> = ({ id, name, kind, meta }) => (
  <li>
    <button
      type="button"
      onClick={() =>
        dispatchOpenInfoDrawer({ type: kind, id, label: name })
      }
      className={cn(
        'group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03]',
        'hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20',
        'px-3 py-2.5 transition-all cursor-pointer flex items-center justify-between gap-2'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gp-ink-strong dark:text-white/90 truncate">
          {name}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-gp-ink-muted dark:text-white/45">
          {kind === 'MeSpace' ? 'Me Space' : 'We Space'}
          {meta ? ` · ${meta}` : ''}
        </p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
    </button>
  </li>
)
