'use client'

import { useParams, useRouter } from 'next/navigation'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import {
  GET_PERSON_PROFILE,
  GET_PERSON_RELATED_PULSES,
} from '@/app/graphql/queries/PERSON_QUERIES'
import { SEARCH_PEOPLE_QUERY } from '@/app/graphql/queries/DASHBOARD_QUERIES'
import { buildRelatedPulseRows } from '@/lib/person-related-pulses'
import { RelatedPulsesList } from '@/components/persons/related-pulses-list'
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
import {
  CREATE_PERSON_CONNECTION_MUTATION,
  UPDATE_PERSON_CONNECTION_MUTATION,
  DELETE_PERSON_CONNECTION_MUTATION,
} from '@/app/graphql/mutations/PERSON_MUTATIONS'
import { cn } from '@/lib/utils'
import { useFocalEntity, usePageContext } from '@/contexts'
import { saveFocusEntities } from '@/lib/simulation/focus-entities-storage'
import type { PivotEntityType } from '@/lib/simulation/entity-collector'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { LinkifiedText } from '@/components/ui/linkified-text'
import ReactSelect from 'react-select'
import {
  EntityProvenance,
  type ProvenanceDocument,
} from '@/components/fields/entity-provenance'
import { GET_PERSON_PROVENANCE } from '@/app/graphql/queries/PROVENANCE_QUERIES'

interface PersonSelectOption {
  value: string
  label: string
  // GOAL-275: directory search is name-only; connection targets are chosen by
  // name, never email.
  email?: string
}

export default function PersonProfilePage() {
  const params = useParams()
  const personId = params?.id as string
  const router = useRouter()
  const { setPageTitle } = usePageContext()
  const { setFocalLabel } = useFocalEntity()

  // Set page title
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
  const provenanceDocuments =
    provenanceData?.people?.[0]?.extractedFrom ?? null

  // Connection creation state
  const [isAddingConnection, setIsAddingConnection] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [selectedPersonOption, setSelectedPersonOption] =
    useState<PersonSelectOption | null>(null)
  const [connectionWhy, setConnectionWhy] = useState('')
  const [connectionInterests, setConnectionInterests] = useState('')
  const [searchInput, setSearchInput] = useState('')
  // Search people query
  const [searchPeople, { data: searchData }] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useLazyQuery<any>(SEARCH_PEOPLE_QUERY)

  // Create connection mutation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createConnection, { loading: creatingConnection }] = useMutation<any>(
    CREATE_PERSON_CONNECTION_MUTATION,
    {
      onCompleted: () => {
        setIsAddingConnection(false)
        setSelectedPersonId('')
        setSelectedPersonOption(null)
        setConnectionWhy('')
        setConnectionInterests('')
        setSearchInput('')
      },
    }
  )

  // Edit connection state
  const [isEditingConnection, setIsEditingConnection] = useState(false)
  const [editingConnectionId, setEditingConnectionId] = useState<string>('')
  const [editingConnectionWhy, setEditingConnectionWhy] = useState('')
  const [editingConnectionInterests, setEditingConnectionInterests] =
    useState('')

  // Update connection mutation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [updateConnection, { loading: updatingConnection }] = useMutation<any>(
    UPDATE_PERSON_CONNECTION_MUTATION,
    {
      onCompleted: () => {
        setIsEditingConnection(false)
        setEditingConnectionId('')
        setEditingConnectionWhy('')
        setEditingConnectionInterests('')
      },
    }
  )

  // Delete connection state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [connectionToDeleteId, setConnectionToDeleteId] = useState<string>('')

  // Delete connection mutation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deleteConnection, { loading: deletingConnection }] = useMutation<any>(
    DELETE_PERSON_CONNECTION_MUTATION,
    {
      onCompleted: () => {
        setIsConfirmingDelete(false)
        setConnectionToDeleteId('')
      },
    }
  )

  const person = data?.people?.[0]

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

  // Derive search results directly — avoids setState-in-effect lint error.
  // Clearing searchInput also clears results since the condition gates on input length.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchResults: any[] =
    searchInput.trim().length >= 2 ? searchData?.people || [] : []

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (value.trim().length >= 2) {
      searchPeople({ variables: { nameContains: value } })
    }
  }

  const personOptions: PersonSelectOption[] = searchResults
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((candidate: any) => candidate.id !== person?.id)
    .filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (candidate: any) =>
        !person?.connections?.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (connection: any) => connection.id === candidate.id
        )
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((candidate: any) => ({
      value: candidate.id,
      label: candidate.name,
    }))

  const handleCreateConnection = async () => {
    if (!person?.id || !selectedPersonId || !connectionWhy) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const result = await createConnection({
        variables: {
          fromPersonId: person.id,
          toPersonId: selectedPersonId,
          why: connectionWhy,
          interests: connectionInterests,
        },
      })

      if (result.data?.createPersonConnection?.success) {
        await refetch()
      }
    } catch (err) {
      console.error('Error creating connection:', err)
    }
  }

  const handleConfirmDelete = (connectionId: string) => {
    setConnectionToDeleteId(connectionId)
    setIsConfirmingDelete(true)
  }

  const handleEditConnection = (
    connectionId: string,
    why: string,
    interests: string
  ) => {
    setEditingConnectionId(connectionId)
    setEditingConnectionWhy(why)
    setEditingConnectionInterests(interests)
    setIsEditingConnection(true)
  }

  const handleUpdateConnection = async () => {
    if (!person?.id || !editingConnectionId) return

    try {
      const result = await updateConnection({
        variables: {
          fromPersonId: person.id,
          toPersonId: editingConnectionId,
          why: editingConnectionWhy,
          interests: editingConnectionInterests,
        },
      })

      if (result.data?.updatePersonConnection?.success) {
        await refetch()
      }
    } catch (err) {
      console.error('Error updating connection:', err)
    }
  }

  const handleDeleteConnection = async () => {
    if (!person?.id || !connectionToDeleteId) return

    try {
      const result = await deleteConnection({
        variables: {
          fromPersonId: person.id,
          toPersonId: connectionToDeleteId,
        },
      })

      if (result.data?.deletePersonConnection?.success) {
        await refetch()
      }
    } catch (err) {
      console.error('Error deleting connection:', err)
    }
  }

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false)
    setConnectionToDeleteId('')
  }

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

  // Extract all pulses from all contexts across all spaces with metadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allPulses: any[] = []
  if (person?.ownsSpaces) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    person.ownsSpaces.forEach((space: any) => {
      const spaceType = space.__typename || 'Space'
      if (spaceType !== 'WeSpace') return

      if (space.contexts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        space.contexts.forEach((context: any) => {
          if (context.pulses) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            context.pulses.forEach((pulse: any) => {
              allPulses.push({
                ...pulse,
                spaceType,
                spaceName: space.name,
                contextName: context.title,
              })
            })
          }
        })
      }
    })
  }

  // Authored + mentioned pulses, minus any already listed via an owned WeSpace
  // above, so a User's own pulse never double-lists.
  const relatedRows = buildRelatedPulseRows(
    relatedPulsesData?.people?.[0]
  ).filter((row) => !allPulses.some((p) => p.id === row.id))
  const totalPulseCount = allPulses.length + relatedRows.length

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

      {/* Scrollable content */}
      <main className="relative">
        <ProfileLayout>
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-12">
            {/* Profile Image */}
            <div className="size-24 rounded-full bg-linear-to-br from-gp-primary/20 to-gp-accent-glow/20 flex items-center justify-center mb-6 border-4 border-white/50 dark:border-white/10 shadow-lg">
              {person.photo ? (
                <Image
                  src={person.photo}
                  alt={person.name}
                  width={96}
                  height={96}
                  className="size-24 rounded-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-gp-primary text-5xl">
                  person
                </span>
              )}
            </div>

            <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
              {person.name}
            </h1>
            {person.email && (
              <p className="text-gp-ink-muted dark:text-gp-ink-soft text-xs">
                {person.email}
              </p>
            )}

            <button
              onClick={handleOpenPersonNode}
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-gp-primary/30 text-gp-primary hover:bg-gp-primary/5 transition-all dark:border-gp-primary/40 dark:hover:bg-gp-primary/10 cursor-pointer"
              aria-label={`View ${person.name} in the dashboard`}
            >
              <span className="material-symbols-outlined text-[16px]">
                dashboard
              </span>
              View in dashboard
            </button>
          </div>

          <EntityProvenance documents={provenanceDocuments} />

          {/* Description — a short relational note about who this person is.
              Edited inline from the Person panel; shown here read-only. */}
          {person.description && (
            <div className="mb-12 flex flex-col gap-4">
              <SectionHeader icon="notes" title="Description" />
              <ProfileCard>
                <LinkifiedText
                  text={person.description}
                  className="text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed"
                />
              </ProfileCard>
            </div>
          )}

          {/* Profile Attributes Section */}
          {(person.traits ||
            person.passions ||
            person.fieldsOfCare ||
            person.interests ||
            person.careManual ||
            person.favorites) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {person.fieldsOfCare && (
                <div className="flex flex-col gap-4 h-full">
                  <SectionHeader
                    icon="volunteer_activism"
                    title="Fields of Care"
                  />
                  <ProfileCard className="flex-1">
                    <LinkifiedText
                      text={person.fieldsOfCare}
                      className="text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed"
                    />
                  </ProfileCard>
                </div>
              )}
              {person.passions && (
                <div className="flex flex-col gap-4 h-full">
                  <SectionHeader icon="favorite" title="Passions" />
                  <ProfileCard className="flex-1">
                    <LinkifiedText
                      text={person.passions}
                      className="text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed"
                    />
                  </ProfileCard>
                </div>
              )}

              {person.traits && (
                <div className="flex flex-col gap-4 h-full">
                  <SectionHeader icon="psychology" title="Traits" />
                  <ProfileCard className="flex-1">
                    <LinkifiedText
                      text={person.traits}
                      className="text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed"
                    />
                  </ProfileCard>
                </div>
              )}

              {person.interests && (
                <div className="flex flex-col gap-4 h-full">
                  <SectionHeader icon="interests" title="Interests" />
                  <ProfileCard className="flex-1">
                    <LinkifiedText
                      text={person.interests}
                      className="text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed"
                    />
                  </ProfileCard>
                </div>
              )}

              {person.careManual && (
                <div className="flex flex-col gap-4 h-full">
                  <SectionHeader icon="menu_book" title="Care Manual" />
                  <ProfileCard className="flex-1">
                    <LinkifiedText
                      text={person.careManual}
                      className="text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed"
                    />
                  </ProfileCard>
                </div>
              )}

              {person.favorites && (
                <div className="flex flex-col gap-4 h-full">
                  <SectionHeader icon="star" title="Favorites" />
                  <ProfileCard className="flex-1">
                    <LinkifiedText
                      text={person.favorites}
                      className="text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed"
                    />
                  </ProfileCard>
                </div>
              )}
            </div>
          )}

          {/* Connections Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between gap-3 mb-4">
              <SectionHeader icon="group_work" title="Connections" />
              <button
                onClick={() => setIsAddingConnection(true)}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gp-primary/30 text-gp-primary hover:bg-gp-primary/5 transition-all dark:border-gp-primary/40 dark:hover:bg-gp-primary/10 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                Add Connection
              </button>
            </div>

            {person.connections && person.connections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {person.connections.map((connection: any, idx: number) => {
                  const edge = person.connectionEdges?.find(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (e: any) => e.connectedPersonId === connection.id
                  )
                  return (
                    <ProfileCard
                      key={idx}
                      onClick={() =>
                        connection.id &&
                        router.push(
                          `/protected/dashboard/persons/${connection.id}`
                        )
                      }
                    >
                      <div className="flex flex-col gap-3 cursor-pointer">
                        <div className="flex items-center gap-3 hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2">
                          <div className="size-10 rounded-full bg-linear-to-br from-gp-primary/20 to-gp-primary/10 flex items-center justify-center">
                            {connection.photo ? (
                              <Image
                                src={connection.photo}
                                alt={connection.name}
                                width={40}
                                height={40}
                                className="size-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-gp-primary text-xl">
                                person
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gp-ink-strong dark:text-white truncate">
                              {connection.name}
                            </h4>
                          </div>
                          <button
                            className="cursor-pointer text-[8px] text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditConnection(
                                connection.id,
                                edge?.why || '',
                                edge?.interests || ''
                              )
                            }}
                            disabled={updatingConnection}
                            aria-label="Edit connection"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              edit
                            </span>
                          </button>
                          <button
                            className="cursor-pointer text-[8px] text-red-400 hover:text-red-800 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleConfirmDelete(connection.id)
                            }}
                            disabled={deletingConnection}
                            aria-label="Delete connection"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              delete
                            </span>
                          </button>
                        </div>
                        {edge && (
                          <div className="space-y-2 border-t border-gp-glass-border pt-3">
                            {edge.why && (
                              <div>
                                <p className="text-[10px] font-semibold text-gp-ink mb-1 uppercase">
                                  Why
                                </p>
                                <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
                                  {edge.why}
                                </p>
                              </div>
                            )}
                            {edge.interests && (
                              <div>
                                <p className="text-[10px] font-semibold text-gp-ink mb-1 uppercase">
                                  Interests
                                </p>
                                <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
                                  {edge.interests}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </ProfileCard>
                  )
                })}
              </div>
            ) : (
              <ProfileCard>
                <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                  No connections yet. Use Add Connection to create one.
                </p>
              </ProfileCard>
            )}
          </div>

          {/* Grid Layout - Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Owned Spaces Section */}
            <div className="flex flex-col gap-4 h-full">
              <SectionHeader icon="auto_awesome" title="Owned Spaces" />
              <div className="flex-1 h-full">
                <ProfileCard>
                  <div className="space-y-4">
                    {person.ownsSpaces && person.ownsSpaces.length > 0 ? (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      person.ownsSpaces.map((space: any, idx: number) => (
                        <div
                          key={idx}
                          className={
                            idx > 0
                              ? 'border-t border-gp-glass-border pt-3'
                              : ''
                          }
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="text-[9px] uppercase font-semibold text-gp-primary mb-0.5 block">
                                {space.__typename || 'Space'}
                              </span>
                              <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                                {space.name}
                              </h4>
                            </div>
                            <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                              {space.contexts?.length || 0} contexts
                            </span>
                          </div>
                          <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
                            {space.visibility}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                        No spaces owned yet
                      </p>
                    )}
                  </div>
                </ProfileCard>
              </div>
            </div>

            {/* Member Spaces Section */}
            <div className="flex flex-col gap-4 h-full">
              <SectionHeader icon="group" title="Member Spaces" />
              <div className="flex-1 h-full">
                <ProfileCard>
                  <div className="space-y-4">
                    {person.memberOf && person.memberOf.length > 0 ? (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      person.memberOf.map((membership: any, idx: number) => {
                        const space = membership.space[0] // space is an array
                        if (!space) return null

                        return (
                          <div
                            key={idx}
                            className={
                              idx > 0
                                ? 'border-t border-gp-glass-border pt-3'
                                : ''
                            }
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <span className="text-[9px] uppercase font-semibold text-gp-primary mb-0.5 block">
                                  {space.__typename || 'Space'} •{' '}
                                  {membership.role}
                                </span>
                                <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                                  {space.name}
                                </h4>
                              </div>
                              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                                {space.visibility}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                        Not a member of any spaces yet
                      </p>
                    )}
                  </div>
                </ProfileCard>
              </div>
            </div>

            {/* Pulses Section */}
            <div className="flex flex-col gap-4 h-full">
              <SectionHeader icon="waves" title="Pulses" />
              <div className="flex-1 h-full">
                <ProfileCard>
                  <div className="space-y-3">
                    {allPulses.length === 0 && relatedRows.length === 0 && (
                      <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                        No pulses yet
                      </p>
                    )}
                    {allPulses.slice(0, 5).map((pulse, idx) => (
                      <div
                        key={pulse.id}
                        className={
                          idx > 0 ? 'border-t border-gp-glass-border pt-3' : ''
                        }
                      >
                        <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white mb-1">
                          {pulse.title}
                        </h4>
                        <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                          {pulse.spaceType} • {pulse.spaceName} •{' '}
                          {pulse.contextName}
                        </p>
                      </div>
                    ))}
                    {relatedRows.length > 0 && (
                      <div
                        className={
                          allPulses.length > 0
                            ? 'border-t border-gp-glass-border pt-3'
                            : ''
                        }
                      >
                        <RelatedPulsesList
                          rows={relatedRows}
                          onOpen={(id, title) =>
                            dispatchOpenInfoDrawer({
                              type: 'Pulse',
                              id,
                              label: title,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                </ProfileCard>
              </div>
            </div>

            {/* Activity Summary Section */}
            <div className="flex flex-col gap-4 h-full">
              <SectionHeader icon="flare" title="Activity" />
              <div className="flex-1 h-full">
                <ProfileCard>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                        Total Pulses
                      </span>
                      <span className="text-lg font-bold text-gp-primary">
                        {totalPulseCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                        Active Spaces
                      </span>
                      <span className="text-lg font-bold text-gp-primary">
                        {person.ownsSpaces?.length || 0}
                      </span>
                    </div>
                  </div>
                </ProfileCard>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex items-center justify-center gap-6 w-full">
            <button className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm">
              View Profile
            </button>
            <button className="px-10 py-3 rounded-full bg-gp-primary text-white font-semibold hover:shadow-[0_8px_25px_rgba(var(--gp-primary-rgb),0.4)] hover:scale-[1.02] transition-all text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                bolt
              </span>
              Pulse {person.name.split(' ')[0]}
            </button>
          </div> */}
        </ProfileLayout>
      </main>

      {/* Bottom Action Bar */}
      {/* <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-gp-glass-bg border border-gp-glass-border backdrop-blur-2xl shadow-xl dark:shadow-2xl">
          <button className="size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors hover:bg-gp-primary/10 dark:hover:bg-gp-primary/20">
            <span className="material-symbols-outlined">message</span>
          </button>
          <div className="w-px h-4 bg-gp-glass-border" />
          <button className="size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors hover:bg-gp-primary/10 dark:hover:bg-gp-primary/20">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </div> */}

      {/* Add Connection Modal */}
      {isAddingConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/80 dark:bg-black/80 rounded-2xl p-5 sm:p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setIsAddingConnection(false)}
              className="absolute top-4 right-4 text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-bold text-gp-ink-strong dark:text-white mb-6">
              Create New Connection
            </h2>

            <div className="mb-6">
              <label className="text-sm font-semibold text-gp-ink-muted dark:text-white/60 block mb-2">
                Search for person
              </label>
              <ReactSelect<PersonSelectOption, false>
                value={selectedPersonOption}
                options={personOptions}
                isSearchable
                isClearable
                isDisabled={creatingConnection}
                placeholder="Search by name..."
                noOptionsMessage={() =>
                  searchInput.trim().length < 2
                    ? 'Type at least 2 characters'
                    : 'No matching people found'
                }
                getOptionLabel={(option) => option.label}
                onInputChange={(value, actionMeta) => {
                  if (actionMeta.action === 'input-change') {
                    handleSearchInput(value)
                  }
                }}
                onChange={(option) => {
                  setSelectedPersonOption(option)
                  setSelectedPersonId(option?.value || '')
                }}
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(148, 163, 184, 0.4)',
                    borderRadius: '0.5rem',
                    minHeight: '42px',
                    boxShadow: 'none',
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: 'var(--gp-surface)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    zIndex: 60,
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'transparent',
                    color: 'var(--gp-ink-strong)',
                    cursor: 'pointer',
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: 'var(--gp-ink-strong)',
                  }),
                  input: (base) => ({
                    ...base,
                    color: 'var(--gp-ink-strong)',
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: 'var(--gp-ink-muted)',
                  }),
                }}
              />
            </div>

            {selectedPersonOption && (
              <div className="mb-6 p-4 rounded-lg bg-gp-primary/10 border border-gp-primary/20">
                <div>
                  <div className="font-semibold text-gp-ink-strong dark:text-white">
                    {selectedPersonOption.label}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPersonId('')
                      setSelectedPersonOption(null)
                      setSearchInput('')
                    }}
                    className="mt-2 text-xs text-gp-primary hover:text-gp-primary-dark font-semibold transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="text-sm font-semibold text-gp-ink-muted dark:text-white/60 block mb-2">
                Why are you connecting?
              </label>
              <textarea
                value={connectionWhy}
                onChange={(e) => setConnectionWhy(e.target.value)}
                placeholder="Describe how you know this person or why you want to connect..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gp-primary/50 resize-none"
                rows={3}
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold text-gp-ink-muted dark:text-white/60 block mb-2">
                Interests or shared areas{' '}
                <span className="text-xs font-normal">(optional)</span>
              </label>
              <textarea
                value={connectionInterests}
                onChange={(e) => setConnectionInterests(e.target.value)}
                placeholder="What interests or areas do you share?"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gp-primary/50 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsAddingConnection(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-gp-ink-strong dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConnection}
                disabled={creatingConnection || !selectedPersonId}
                className="flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 95%, white 5%), color-mix(in srgb, var(--gp-primary) 75%, black 25%))',
                  boxShadow:
                    '0 10px 28px color-mix(in srgb, var(--gp-primary) 40%, transparent)',
                }}
              >
                {creatingConnection ? 'Creating...' : 'Create Connection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Connection Modal */}
      {isEditingConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="chat-card rounded-2xl p-5 sm:p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setIsEditingConnection(false)}
              className="absolute top-4 right-4 text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-bold text-gp-ink-strong dark:text-white mb-6">
              Edit Connection
            </h2>

            <div className="mb-6">
              <label className="text-sm font-semibold text-gp-ink-muted dark:text-white/60 block mb-2">
                Why are you connecting?
              </label>
              <textarea
                value={editingConnectionWhy}
                onChange={(e) => setEditingConnectionWhy(e.target.value)}
                placeholder="Tell us why you're connecting with this person..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gp-primary/50 resize-none"
                rows={3}
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold text-gp-ink-muted dark:text-white/60 block mb-2">
                Shared Interests
              </label>
              <textarea
                value={editingConnectionInterests}
                onChange={(e) => setEditingConnectionInterests(e.target.value)}
                placeholder="What interests do you share?"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gp-primary/50 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditingConnection(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-gp-ink-strong dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateConnection}
                disabled={updatingConnection}
                className="flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 95%, white 5%), color-mix(in srgb, var(--gp-primary) 75%, black 25%))',
                  boxShadow:
                    '0 10px 28px color-mix(in srgb, var(--gp-primary) 40%, transparent)',
                }}
              >
                {updatingConnection ? 'Updating...' : 'Update Connection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Connection Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-md w-full mx-4 p-5 sm:p-8 border border-gp-glass-border">
            <h2 className="text-2xl font-semibold text-gp-ink-strong dark:text-white mb-3">
              Delete Connection?
            </h2>

            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft mb-6">
              Are you sure you want to delete this connection? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deletingConnection}
                className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConnection}
                disabled={deletingConnection}
                className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingConnection && (
                  <span
                    className={cn(
                      'material-symbols-outlined text-base',
                      'motion-safe:animate-spin'
                    )}
                  >
                    hourglass_bottom
                  </span>
                )}
                {deletingConnection ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
