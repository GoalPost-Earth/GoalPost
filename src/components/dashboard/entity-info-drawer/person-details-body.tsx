'use client'

import { useEffect, type FC } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import Image from 'next/image'
import { ArrowRight, Hash, Layers, Sparkles, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocalEntity } from '@/contexts'
import {
  GET_PERSON_DIRECTORY,
  GET_PERSON_OWNED_PULSES,
  GET_PERSON_PROFILE,
  GET_PERSON_RELATED_PULSES,
} from '@/app/graphql/queries/PERSON_QUERIES'
import { GET_PERSON_PROVENANCE } from '@/app/graphql/queries/PROVENANCE_QUERIES'
import { buildRelatedPulseRows } from '@/lib/person-related-pulses'
import { RelatedPulsesList } from '@/components/persons/related-pulses-list'
import {
  EntityProvenance,
  type ProvenanceDocument,
} from '@/components/fields/entity-provenance'
import { LinkifiedText } from '@/components/ui/linkified-text'
import { saveFocusEntities } from '@/lib/simulation/focus-entities-storage'
import type { PivotEntityType } from '@/lib/simulation/entity-collector'
import {
  BodySkeleton,
  ErrorBody,
  NotFoundBody,
  PrimaryCta,
  SecondaryCta,
  SectionHeader,
  StatCell,
} from './shared'
import { LimitedPersonBody } from './limited-person-body'
import { dispatchOpenInfoDrawer } from './types'

/**
 * Person/User/PersonPulse inspection. Heavy edit affordances (add /
 * edit / delete connection) lived only on the deleted route; in the
 * drawer this is read-mostly. Users who need to manage connections
 * still have the assistant tool for it.
 */
export const PersonDetailsBody: FC<{
  personId: string
  onClose: () => void
  label?: string
}> = ({ personId, onClose, label }) => {
  const router = useRouter()
  const { setFocalLabel } = useFocalEntity()

  const { data, loading, error, refetch } = useQuery(GET_PERSON_PROFILE, {
    variables: { personId },
    fetchPolicy: 'cache-and-network',
  })

  // Pulses live in a separate query so any data-integrity issue inside
  // them (a NULL title on a non-nullable schema field, etc.) crashes
  // only the pulses section, not the whole drawer. With the global
  // `errorPolicy: 'all'`, `data` is `null` on error here — the
  // pulses-derived UI below treats that as "no pulses to render."
  const { data: pulsesData, error: pulsesError } = useQuery(
    GET_PERSON_OWNED_PULSES,
    {
      variables: { personId },
      fetchPolicy: 'cache-and-network',
    }
  )
  const pulsesFailed = !!pulsesError

  // Directory-only fallback (open fields — never triggers the GOAL-275 PII
  // gate). Lets us tell "this person exists but their profile is private to
  // you" apart from "this person is truly gone", so the former renders a
  // graceful limited card instead of the "no longer available" not-found.
  const {
    data: directoryData,
    loading: directoryLoading,
    error: directoryError,
    refetch: refetchDirectory,
  } = useQuery(GET_PERSON_DIRECTORY, {
    variables: { personId },
    fetchPolicy: 'cache-and-network',
  })

  const { data: provenanceData } = useQuery<{
    people?: { id: string; extractedFrom?: ProvenanceDocument[] }[]
  }>(GET_PERSON_PROVENANCE, {
    variables: { personId },
  })
  const provenanceDocuments = provenanceData?.people?.[0]?.extractedFrom ?? null

  // Pulses this person authored (INITIATED_BY) or is mentioned in (MENTIONED_IN),
  // in their own query so a malformed pulse fails in isolation. This is the only
  // way an upload-created PersonPulse's contributions surface — they own no
  // WeSpace, so GET_PERSON_OWNED_PULSES misses them entirely (GOAL-314).
  const { data: relatedPulsesData } = useQuery(GET_PERSON_RELATED_PULSES, {
    variables: { personId },
    fetchPolicy: 'cache-and-network',
  })

  const person = data?.people?.[0]
  const pulsesPerson = pulsesData?.people?.[0]

  useEffect(() => {
    if (!person?.id || !person?.name) return
    const typename = (person as { __typename?: string }).__typename
    const refined =
      typename === 'User'
        ? ('User' as const)
        : typename === 'PersonPulse'
          ? ('PersonPulse' as const)
          : undefined
    setFocalLabel(person.id, person.name, refined)
  }, [person?.id, person?.name, person, setFocalLabel])

  if (loading && !data)
    return (
      <BodySkeleton
        label={label}
        titleClassName="text-xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words"
      />
    )
  if (!person) {
    // Log the underlying GraphQL error so a data-integrity cascade (a
    // NULL on a non-nullable scalar somewhere in the person tree) is
    // visible during dev instead of silently showing "not available."
    if (error) {
      console.warn(
        `[entity-info-drawer] Person ${personId} failed to load:`,
        error.message
      )
      return <ErrorBody detail={error.message} onRetry={() => refetch()} />
    }
    // No error but no person => the PII gate filtered the node out for this
    // caller. If the person still resolves via the open directory query, they
    // exist and are in the caller's network — show a graceful limited card
    // rather than the misleading "no longer available / you lost access".
    if (directoryLoading && !directoryData)
      return (
        <BodySkeleton
          label={label}
          titleClassName="text-xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words"
        />
      )
    const directoryPerson = directoryData?.people?.[0]
    if (directoryPerson)
      return <LimitedPersonBody person={directoryPerson} onClose={onClose} />
    // The directory query itself failing is distinct from "person is gone" —
    // surface the real error (with retry) rather than a misleading not-found.
    if (directoryError)
      return (
        <ErrorBody
          detail={directoryError.message}
          onRetry={() => refetchDirectory()}
        />
      )
    return <NotFoundBody />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allPulses: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(pulsesPerson?.ownsSpaces ?? []).forEach((space: any) => {
    if (space.__typename !== 'WeSpace') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(space.contexts ?? []).forEach((context: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(context.pulses ?? []).forEach((pulse: any) => {
        allPulses.push({
          ...pulse,
          spaceName: space.name,
          contextName: context.title,
        })
      })
    })
  })

  // Authored (INITIATED_BY) + mentioned (MENTIONED_IN) pulses, minus any already
  // shown via an owned WeSpace above, so a User's own pulse never double-lists.
  const relatedRows = buildRelatedPulseRows(
    relatedPulsesData?.people?.[0]
  ).filter((row) => !allPulses.some((p) => p.id === row.id))

  const handleOpenPersonNode = () => {
    if (!person?.id || !person?.name) return
    const typename = (person as { __typename?: string }).__typename
    const focusType: PivotEntityType =
      typename === 'User'
        ? 'User'
        : typename === 'PersonPulse'
          ? 'PersonPulse'
          : 'Person'
    const focus = saveFocusEntities([
      { type: focusType, id: person.id, name: person.name },
    ])
    onClose()
    router.push(`/protected/dashboard?focus=${focus}`)
  }

  const connectionEdge = (id: string) =>
    person.connectionEdges?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => e.connectedPersonId === id
    )

  return (
    <div className="flex flex-col">
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
            {person.email && (
              <p className="text-[11px] text-gp-ink-muted dark:text-white/50 mt-0.5 break-all">
                {person.email}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-5 grid grid-cols-2 gap-3">
        <StatCell
          icon={<Sparkles className="w-3.5 h-3.5" />}
          label="Pulses"
          // Only the owned-WeSpace pulse query can fail here; related pulses come
          // from a separate query. Show `—` only when the owned count is unknown
          // AND no related pulses resolved, so a populated Related section below
          // is never contradicted by a `—` header.
          value={
            pulsesFailed && relatedRows.length === 0
              ? '—'
              : String(allPulses.length + relatedRows.length)
          }
        />
        <StatCell
          icon={<Layers className="w-3.5 h-3.5" />}
          label="Owned spaces"
          value={String(person.ownsSpaces?.length ?? 0)}
        />
        <StatCell
          icon={<Users className="w-3.5 h-3.5" />}
          label="Connections"
          value={String(person.connections?.length ?? 0)}
        />
        <StatCell
          icon={<Hash className="w-3.5 h-3.5" />}
          label="Member of"
          value={String(person.memberOf?.length ?? 0)}
        />
      </section>

      {provenanceDocuments && provenanceDocuments.length > 0 && (
        <section className="px-6 pb-5">
          <EntityProvenance documents={provenanceDocuments} />
        </section>
      )}

      {/* A short relational note about who this person is. Often the only rich
          field an upload-created PersonPulse carries (GOAL-314), so render it
          even though the drawer is read-mostly. */}
      {person.description && (
        <section className="px-6 pb-5">
          <AttrBlock label="Description" text={person.description} />
        </section>
      )}

      {(person.fieldsOfCare ||
        person.passions ||
        person.traits ||
        person.interests ||
        person.careManual ||
        person.favorites) && (
        <section className="px-6 pb-5 space-y-4">
          {person.fieldsOfCare && (
            <AttrBlock label="Fields of care" text={person.fieldsOfCare} />
          )}
          {person.passions && (
            <AttrBlock label="Passions" text={person.passions} />
          )}
          {person.traits && <AttrBlock label="Traits" text={person.traits} />}
          {person.interests && (
            <AttrBlock label="Interests" text={person.interests} />
          )}
          {person.careManual && (
            <AttrBlock label="Care manual" text={person.careManual} />
          )}
          {person.favorites && (
            <AttrBlock label="Favorites" text={person.favorites} />
          )}
        </section>
      )}

      {person.connections && person.connections.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Connections ({person.connections.length})</SectionHeader>
          <ul className="mt-2 space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {person.connections.slice(0, 6).map((connection: any) => {
              const edge = connectionEdge(connection.id)
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
            {person.connections.length > 6 && (
              <li className="text-[11px] text-gp-ink-muted dark:text-white/45 px-3 pt-1">
                + {person.connections.length - 6} more
              </li>
            )}
          </ul>
        </section>
      )}

      {person.ownsSpaces && person.ownsSpaces.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Owned spaces</SectionHeader>
          <ul className="mt-2 space-y-1.5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {person.ownsSpaces.map((space: any) => (
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

      {person.memberOf && person.memberOf.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Member of</SectionHeader>
          <ul className="mt-2 space-y-1.5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {person.memberOf.map((membership: any) => {
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

      {allPulses.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Recent pulses</SectionHeader>
          <ul className="mt-2 space-y-1.5">
            {allPulses.slice(0, 5).map((pulse) => (
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
          </ul>
        </section>
      )}

      {relatedRows.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Related pulses ({relatedRows.length})</SectionHeader>
          <div className="mt-2">
            <RelatedPulsesList
              rows={relatedRows}
              onOpen={(id, title) =>
                dispatchOpenInfoDrawer({ type: 'Pulse', id, label: title })
              }
            />
          </div>
        </section>
      )}

      <footer className="mt-auto px-6 py-5 border-t border-gp-glass-border bg-white/[0.02] dark:bg-white/[0.02] space-y-2">
        <PrimaryCta
          onClick={() =>
            router.push(`/protected/dashboard/persons/${person.id}`)
          }
          className="w-full"
        >
          Open full profile
          <ArrowRight className="w-4 h-4" />
        </PrimaryCta>
        <SecondaryCta onClick={handleOpenPersonNode} className="w-full">
          <span className="material-symbols-outlined text-[18px]">
            dashboard
          </span>
          View in dashboard
        </SecondaryCta>
      </footer>
    </div>
  )
}

const AttrBlock: FC<{ label: string; text: string }> = ({ label, text }) => (
  <div>
    <SectionHeader>{label}</SectionHeader>
    <div className="mt-1.5 text-xs text-gp-ink-muted dark:text-white/65 leading-relaxed">
      <LinkifiedText text={text} />
    </div>
  </div>
)

const SpaceRow: FC<{
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
