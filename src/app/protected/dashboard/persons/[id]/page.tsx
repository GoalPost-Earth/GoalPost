'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { PrivateProfileNotice } from '@/components/persons/private-profile-notice'
import {
  ProfileAttributes,
  ProfileConnections,
  ProfileHeader,
} from '@/components/persons/profile-sections'
import { ProfileSummaryGrid } from '@/components/persons/profile-summary-grid'
import {
  AddConnectionModal,
  DeleteConnectionModal,
  EditConnectionModal,
} from '@/components/persons/connection-modals'
import { usePersonConnections } from '@/components/persons/use-person-connections'
import {
  GET_PERSON_PROFILE,
  GET_PERSON_RELATED_PULSES,
} from '@/app/graphql/queries/PERSON_QUERIES'
import { buildRelatedPulseRows } from '@/lib/person-related-pulses'
import {
  ProfileErrorState,
  ProfileLoadingState,
  ProfileUnavailableState,
} from '@/components/persons/profile-states'
// Import from the lightweight `types` module, NOT the drawer barrel — the barrel
// (index.tsx) statically pulls in all nine drawer body components + gsap, which
// would bloat this route's client bundle (and can crash the dev compile worker
// on this already-large route). person-details-body.tsx imports it the same way.
import { dispatchOpenInfoDrawer } from '@/components/dashboard/entity-info-drawer/types'
import { useFocalEntity, usePageContext } from '@/contexts'
import { saveFocusEntities } from '@/lib/simulation/focus-entities-storage'
import type { PivotEntityType } from '@/lib/simulation/entity-collector'
import {
  EntityProvenance,
  type ProvenanceDocument,
} from '@/components/fields/entity-provenance'
import { GET_PERSON_PROVENANCE } from '@/app/graphql/queries/PROVENANCE_QUERIES'

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PersonProfilePage() {
  const params = useParams()
  const personId = params?.id as string
  const router = useRouter()
  const { setPageTitle } = usePageContext()
  const { setFocalLabel } = useFocalEntity()

  useEffect(() => {
    setPageTitle('Dashboard')
  }, [setPageTitle])

  // `cache-and-network` mirrors the person drawer (person-details-body.tsx): a
  // cached profile paints immediately instead of blocking, and the entity is
  // revalidated on every visit rather than being served from cache forever.
  // `errorPolicy` is deliberately left to the client default ('all', set in
  // apollo-wrapper.tsx) — same as the drawer.
  const { data, loading, error, refetch } = useQuery(GET_PERSON_PROFILE, {
    variables: { personId },
    skip: !personId,
    fetchPolicy: 'cache-and-network',
  })

  // Pulses this person authored (INITIATED_BY) or is mentioned in (MENTIONED_IN).
  // Separate query (fails in isolation) and the only surface for an
  // upload-created PersonPulse's pulses — they own no WeSpace (GOAL-314).
  const { data: relatedPulsesData } = useQuery(GET_PERSON_RELATED_PULSES, {
    variables: { personId },
    skip: !personId,
  })

  // Slice 7 (GOAL-242) — provenance query is split off so adding the
  // `extractedFrom` selection doesn't invalidate the codegen'd typing of
  // GET_PERSON_PROFILE. Unauthorized viewers get an empty list via the
  // Document type's @authorization directive.
  const { data: provenanceData } = useQuery<{
    people?: { id: string; extractedFrom?: ProvenanceDocument[] }[]
  }>(GET_PERSON_PROVENANCE, {
    variables: { personId },
    skip: !personId,
  })
  const provenanceDocuments = provenanceData?.people?.[0]?.extractedFrom ?? null

  const person = data?.people?.[0]
  // GOAL-275: the PII scalars and the connection graph arrive behind the single
  // type-level gate on PersonPrivateProfile. Null means "this person exists,
  // but their private profile is not visible to you" — the page still renders
  // the directory identity rather than a not-found.
  const pii = person?.privateProfile

  const connections = usePersonConnections({
    personId: person?.id,
    connections: pii?.connections,
    refetch,
  })

  // Refine the provisional PersonPulse focal entity to User when the loaded
  // record carries the User label, and supply a human label for the assistant.
  useEffect(() => {
    if (!person?.id || !person?.name) return
    // GraphQL codegen narrows __typename to the supertype "Person"; at runtime
    // the concrete label comes through, so widen via unknown for the check.
    const typename = (person as { __typename?: string }).__typename
    const refined =
      typename === 'User'
        ? ('User' as const)
        : typename === 'PersonPulse'
          ? ('PersonPulse' as const)
          : undefined
    setFocalLabel(person.id, person.name, refined)
  }, [person?.id, person?.name, person?.__typename, setFocalLabel])

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
    router.push(`/protected/dashboard?focus=${focus}`)
  }

  // Every pulse across every context of every owned WeSpace, flattened with the
  // space + context labels the Pulses card renders.
  const ownedPulses: any[] = []
  ;(person?.ownsSpaces ?? []).forEach((space: any) => {
    const spaceType = space.__typename || 'Space'
    if (spaceType !== 'WeSpace') return
    ;(space.contexts ?? []).forEach((context: any) => {
      ;(context.pulses ?? []).forEach((pulse: any) => {
        ownedPulses.push({
          ...pulse,
          spaceType,
          spaceName: space.name,
          contextName: context.title,
        })
      })
    })
  })

  // Authored + mentioned pulses, minus any already listed via an owned WeSpace
  // above, so a User's own pulse never double-lists.
  const relatedRows = buildRelatedPulseRows(
    relatedPulsesData?.people?.[0]
  ).filter((row) => !ownedPulses.some((p) => p.id === row.id))

  // Only block on the very first load. Once a profile is in hand, a background
  // refetch must never replace the page with a spinner.
  if (loading && !person) {
    return <ProfileLoadingState />
  }

  // Only when there is nothing cached to render.
  if (error && !person) {
    return (
      <ProfileErrorState
        onRetry={() => {
          refetch().catch(() => {})
        }}
      />
    )
  }

  if (!person) {
    return <ProfileUnavailableState />
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20">
      <ProfileBackground />

      <main className="relative">
        <ProfileLayout>
          <ProfileHeader
            name={person.name}
            photo={person.photo}
            email={pii?.email}
            onOpenInDashboard={handleOpenPersonNode}
          />

          <EntityProvenance documents={provenanceDocuments} />

          {/* GOAL-275: the person is real and findable, but their private
              profile is not shared with this caller. Say so once, rather than
              rendering a page of silently empty sections. Mirrors the drawer's
              LimitedPersonBody copy so the two surfaces agree. */}
          {!pii && <PrivateProfileNotice className="mb-12" />}

          <ProfileAttributes pii={pii} />

          {/* The connection graph lives inside the GOAL-275 gate, so when `pii`
              is null this must not render at all: the empty state would report
              "no connections yet" where the truth is "not shared with you", and
              the Add Connection CTA would offer to edit a stranger's graph. The
              drawer's LimitedPersonBody stops after the lock notice likewise. */}
          {pii && (
            <ProfileConnections
              connections={pii.connections ?? []}
              connectionEdges={pii.connectionEdges}
              onOpenPerson={(id) =>
                router.push(`/protected/dashboard/persons/${id}`)
              }
              onAdd={() => connections.setIsAddingConnection(true)}
              onEdit={connections.handleEditConnection}
              onDelete={connections.handleConfirmDelete}
              updating={connections.updatingConnection}
              deleting={connections.deletingConnection}
            />
          )}

          <ProfileSummaryGrid
            ownsSpaces={person.ownsSpaces}
            memberOf={person.memberOf}
            ownedPulses={ownedPulses}
            relatedRows={relatedRows}
            totalPulseCount={ownedPulses.length + relatedRows.length}
            onOpenPulse={(id, title) =>
              dispatchOpenInfoDrawer({ type: 'Pulse', id, label: title })
            }
          />
        </ProfileLayout>
      </main>

      {connections.isAddingConnection && (
        <AddConnectionModal
          onClose={() => connections.setIsAddingConnection(false)}
          selectedPersonOption={connections.selectedPersonOption}
          personOptions={connections.personOptions}
          searchInput={connections.searchInput}
          onSearchInput={connections.handleSearchInput}
          onSelect={(option) => {
            connections.setSelectedPersonOption(option)
            connections.setSelectedPersonId(option?.value || '')
          }}
          onClearSelection={() => {
            connections.setSelectedPersonId('')
            connections.setSelectedPersonOption(null)
            connections.setSearchInput('')
          }}
          why={connections.connectionWhy}
          onWhyChange={connections.setConnectionWhy}
          interests={connections.connectionInterests}
          onInterestsChange={connections.setConnectionInterests}
          creating={connections.creatingConnection}
          canSubmit={!!connections.selectedPersonId}
          onSubmit={connections.handleCreateConnection}
        />
      )}

      {connections.isEditingConnection && (
        <EditConnectionModal
          onClose={() => connections.setIsEditingConnection(false)}
          why={connections.editingConnectionWhy}
          onWhyChange={connections.setEditingConnectionWhy}
          interests={connections.editingConnectionInterests}
          onInterestsChange={connections.setEditingConnectionInterests}
          updating={connections.updatingConnection}
          onSubmit={connections.handleUpdateConnection}
        />
      )}

      {connections.isConfirmingDelete && (
        <DeleteConnectionModal
          deleting={connections.deletingConnection}
          onCancel={connections.handleCancelDelete}
          onConfirm={connections.handleDeleteConnection}
        />
      )}
    </div>
  )
}
