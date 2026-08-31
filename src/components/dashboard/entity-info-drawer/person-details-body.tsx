'use client'

import type { FC } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { RelatedPulsesList } from '@/components/persons/related-pulses-list'
import { EntityProvenance } from '@/components/fields/entity-provenance'
import { saveFocusEntities } from '@/lib/simulation/focus-entities-storage'
import type { PivotEntityType } from '@/lib/simulation/entity-collector'
import {
  BodySkeleton,
  ErrorBody,
  NotFoundBody,
  PrimaryCta,
  SecondaryCta,
  SectionHeader,
} from './shared'
import { LimitedPersonBody } from './limited-person-body'
import { dispatchOpenInfoDrawer } from './types'
import { usePersonDetails } from './use-person-details'
import {
  PersonAttributes,
  PersonConnections,
  PersonHero,
  PersonSpaceLists,
  PersonStatGrid,
  RecentPulsesSection,
} from './person-details-sections'

/**
 * Person/User/PersonPulse inspection. Heavy edit affordances (add /
 * edit / delete connection) lived only on the deleted route; in the
 * drawer this is read-mostly. Users who need to manage connections
 * still have the assistant tool for it.
 *
 * Composition only: the reads live in `usePersonDetails`, the sections in
 * `person-details-sections.tsx`.
 */
export const PersonDetailsBody: FC<{
  personId: string
  onClose: () => void
  label?: string
}> = ({ personId, onClose, label }) => {
  const router = useRouter()
  const {
    data,
    person,
    pii,
    loading,
    error,
    refetch,
    ownedPulses,
    relatedRows,
    pulsesFailed,
    provenanceDocuments,
  } = usePersonDetails(personId)

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
    // GOAL-275: the gate no longer removes the row — an unauthorized caller
    // still gets the Person back with a null `privateProfile` (handled just
    // below). So reaching here really does mean the person is gone, and the
    // extra directory round-trip this branch used to make is no longer needed.
    return <NotFoundBody />
  }

  // The person exists and is findable, but their private profile is not shared
  // with this caller. Say exactly that instead of rendering a hollow profile
  // with every section empty.
  if (!pii) return <LimitedPersonBody person={person} onClose={onClose} />

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

  return (
    <div className="flex flex-col">
      <PersonHero
        name={person.name}
        photo={person.photo}
        email={pii.email}
      />

      <PersonStatGrid
        pulseCount={ownedPulses.length + relatedRows.length}
        pulseCountUnknown={pulsesFailed && relatedRows.length === 0}
        ownedSpaces={person.ownsSpaces?.length ?? 0}
        connections={pii.connections?.length ?? 0}
        memberOf={person.memberOf?.length ?? 0}
      />

      {provenanceDocuments && provenanceDocuments.length > 0 && (
        <section className="px-6 pb-5">
          <EntityProvenance documents={provenanceDocuments} />
        </section>
      )}

      <PersonAttributes pii={pii} />

      <PersonConnections
        connections={pii.connections ?? []}
        connectionEdges={pii.connectionEdges}
      />

      <PersonSpaceLists
        ownsSpaces={person.ownsSpaces}
        memberOf={person.memberOf}
      />

      <RecentPulsesSection pulses={ownedPulses} />

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
