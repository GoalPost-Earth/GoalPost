'use client'

import { useMemo, type FC } from 'react'
import Image from 'next/image'
import { ArrowRight, Hash, Layers, Sparkles, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LinkifiedText } from '@/components/ui/linkified-text'
import { SectionHeader, StatCell } from './shared'
import { ShowMoreToggle, useExpandableList } from './expandable-list'
import { dispatchOpenInfoDrawer } from './types'
import type { OwnedPulseRow } from './use-person-details'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Presentational sections of the person drawer, split out of
 * `person-details-body.tsx` to keep every file under the 400-line rule. These
 * are pure — all reads and derivations live in `usePersonDetails`.
 */

const CONNECTION_LIMIT = 6
const PULSE_LIMIT = 5

export const AttrBlock: FC<{ label: string; text: string }> = ({
  label,
  text,
}) => (
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
      onClick={() => dispatchOpenInfoDrawer({ type: kind, id, label: name })}
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

export const PersonHero: FC<{
  name: string
  photo?: string | null
  email?: string | null
}> = ({ name, photo, email }) => (
  <section className="relative px-6 pt-7 pb-6 border-b border-gp-glass-border bg-gradient-to-br from-gp-primary/20 via-gp-accent-glow/10 to-transparent">
    <div className="flex flex-col items-center text-center gap-3">
      <div className="size-20 rounded-full bg-linear-to-br from-gp-primary/20 to-gp-accent-glow/20 flex items-center justify-center border-4 border-white/50 dark:border-white/10 shadow-lg">
        {photo ? (
          <Image
            src={photo}
            alt={name}
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
          {name}
        </h2>
        {email && (
          <p className="text-[11px] text-gp-ink-muted dark:text-white/50 mt-0.5 break-all">
            {email}
          </p>
        )}
      </div>
    </div>
  </section>
)

export const PersonStatGrid: FC<{
  pulseCount: number
  /**
   * True when the owned-pulse query failed AND nothing came back from the
   * related-pulse query either. Only then is the count genuinely unknown — show
   * `—` rather than contradicting a populated Related section below.
   */
  pulseCountUnknown: boolean
  ownedSpaces: number
  connections: number
  memberOf: number
}> = ({
  pulseCount,
  pulseCountUnknown,
  ownedSpaces,
  connections,
  memberOf,
}) => (
  <section className="px-6 py-5 grid grid-cols-2 gap-3">
    <StatCell
      icon={<Sparkles className="w-3.5 h-3.5" />}
      label="Pulses"
      value={pulseCountUnknown ? '—' : String(pulseCount)}
    />
    <StatCell
      icon={<Layers className="w-3.5 h-3.5" />}
      label="Owned spaces"
      value={String(ownedSpaces)}
    />
    <StatCell
      icon={<Users className="w-3.5 h-3.5" />}
      label="Connections"
      value={String(connections)}
    />
    <StatCell
      icon={<Hash className="w-3.5 h-3.5" />}
      label="Member of"
      value={String(memberOf)}
    />
  </section>
)

/**
 * The free-text profile fields. `description` is often the only rich field an
 * upload-created PersonPulse carries (GOAL-314), so it renders even though the
 * drawer is read-mostly.
 */
export const PersonAttributes: FC<{ pii: any }> = ({ pii }) => {
  const rest =
    pii.fieldsOfCare ||
    pii.passions ||
    pii.traits ||
    pii.interests ||
    pii.careManual ||
    pii.favorites

  return (
    <>
      {pii.description && (
        <section className="px-6 pb-5">
          <AttrBlock label="Description" text={pii.description} />
        </section>
      )}

      {rest && (
        <section className="px-6 pb-5 space-y-4">
          {pii.fieldsOfCare && (
            <AttrBlock label="Fields of care" text={pii.fieldsOfCare} />
          )}
          {pii.passions && <AttrBlock label="Passions" text={pii.passions} />}
          {pii.traits && <AttrBlock label="Traits" text={pii.traits} />}
          {pii.interests && (
            <AttrBlock label="Interests" text={pii.interests} />
          )}
          {pii.careManual && (
            <AttrBlock label="Care manual" text={pii.careManual} />
          )}
          {pii.favorites && (
            <AttrBlock label="Favorites" text={pii.favorites} />
          )}
        </section>
      )}
    </>
  )
}

export const PersonConnections: FC<{
  connections: any[]
  connectionEdges?: any[] | null
}> = ({ connections, connectionEdges }) => {
  const { visible, hiddenCount, expanded, toggle } = useExpandableList(
    connections,
    CONNECTION_LIMIT
  )
  // Map rather than a per-row `.find()`: once expanded this list is
  // unbounded, and the linear scan made rendering it O(n²).
  //
  // `connectionEdges` is an undirected match, so a reciprocal pair yields two
  // rows for the same person carrying each side's own `why`. First one wins,
  // matching the `.find()` this replaced.
  const edges = useMemo(() => {
    const byPerson = new Map<string, any>()
    for (const edge of connectionEdges ?? []) {
      if (!byPerson.has(edge.connectedPersonId)) {
        byPerson.set(edge.connectedPersonId, edge)
      }
    }
    return byPerson
  }, [connectionEdges])

  if (connections.length === 0) return null

  return (
    <section className="px-6 pb-5">
      <SectionHeader>Connections ({connections.length})</SectionHeader>
      <ul className="mt-2 space-y-2">
        {visible.map((connection: any) => {
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

export const PersonSpaceLists: FC<{
  ownsSpaces?: any[] | null
  memberOf?: any[] | null
}> = ({ ownsSpaces, memberOf }) => (
  <>
    {ownsSpaces && ownsSpaces.length > 0 && (
      <section className="px-6 pb-5">
        <SectionHeader>Owned spaces</SectionHeader>
        <ul className="mt-2 space-y-1.5">
          {ownsSpaces.map((space: any) => (
            <SpaceRow
              key={space.id}
              id={space.id}
              name={space.name}
              kind={space.__typename === 'MeSpace' ? 'MeSpace' : 'WeSpace'}
              meta={`${space.contexts?.length || 0} contexts`}
            />
          ))}
        </ul>
      </section>
    )}

    {memberOf && memberOf.length > 0 && (
      <section className="px-6 pb-5">
        <SectionHeader>Member of</SectionHeader>
        <ul className="mt-2 space-y-1.5">
          {memberOf.map((membership: any) => {
            const space = membership.space?.[0]
            if (!space) return null
            return (
              <SpaceRow
                key={membership.id}
                id={space.id}
                name={space.name}
                kind={space.__typename === 'MeSpace' ? 'MeSpace' : 'WeSpace'}
                meta={membership.role}
              />
            )
          })}
        </ul>
      </section>
    )}
  </>
)

/**
 * Recent pulses reached via the person's owned WeSpaces. This list used to be
 * silently capped at five with no indicator at all — worse than the dead
 * "+ N more" label elsewhere, since nothing hinted more existed (GOAL-315).
 */
export const RecentPulsesSection: FC<{ pulses: OwnedPulseRow[] }> = ({
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
