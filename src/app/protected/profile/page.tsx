'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GET_LOGGED_IN_USER } from '@/app/graphql/queries/DASHBOARD_QUERIES'
import { useApp, usePageContext, useAnimations } from '@/contexts'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useLazyQuery } from '@apollo/client/react'
import ReactSelect from 'react-select'
import { SEARCH_PEOPLE_QUERY } from '@/app/graphql/queries/DASHBOARD_QUERIES'
import {
  CREATE_PERSON_CONNECTION_MUTATION,
  UPDATE_PERSON_CONNECTION_MUTATION,
  DELETE_PERSON_CONNECTION_MUTATION,
} from '@/app/graphql/mutations/PERSON_MUTATIONS'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PersonSelectOption {
  value: string
  label: string
  email: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useApp()
  const { setPageTitle } = usePageContext()
  const { isCompleted, resumeTour, restartTour } = useOnboarding()
  const { animationsEnabled } = useAnimations()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error, refetch } = useQuery<any>(
    GET_LOGGED_IN_USER as any,
    {
      variables: { email: user?.email ?? '' },
      skip: !user?.email,
      fetchPolicy: 'cache-and-network',
    }
  )

  // Connection creation state
  const [isAddingConnection, setIsAddingConnection] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [selectedPersonOption, setSelectedPersonOption] =
    useState<PersonSelectOption | null>(null)
  const [connectionWhy, setConnectionWhy] = useState('')
  const [connectionInterests, setConnectionInterests] = useState('')
  const [searchInput, setSearchInput] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Search people query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchPeople, { data: searchData }] =
    useLazyQuery<any>(SEARCH_PEOPLE_QUERY)

  // Create connection mutation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createConnection, { loading: creatingConnection }] = useMutation<any>(
    CREATE_PERSON_CONNECTION_MUTATION,
    {
      onCompleted: () => {
        // Reset form
        setIsAddingConnection(false)
        setSelectedPersonId('')
        setSelectedPersonOption(null)
        setConnectionWhy('')
        setConnectionInterests('')
        setSearchInput('')
        setSearchResults([])
        // Refetch user data to update connections list
        data && router.refresh()
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
        refetch()
      },
    }
  )

  // Delete connection mutation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deleteConnection, { loading: deletingConnection }] = useMutation<any>(
    DELETE_PERSON_CONNECTION_MUTATION,
    {
      onCompleted: () => {
        setIsConfirmingDelete(false)
        setConnectionToDeleteId('')
        refetch()
      },
    }
  )

  // Delete confirmation state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [connectionToDeleteId, setConnectionToDeleteId] = useState<string>('')

  useEffect(() => {
    setPageTitle('My Profile')
  }, [setPageTitle])

  useEffect(() => {
    setSearchResults(searchData?.people || [])
  }, [searchData])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8 pt-28">
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-pulse">
          {/* Header skeleton */}
          <div className="chat-card rounded-2xl p-8">
            <div className="flex items-center gap-6">
              <div className="size-24 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 bg-slate-200 rounded dark:bg-slate-700"></div>
                <div className="h-4 w-64 bg-slate-200 rounded dark:bg-slate-700"></div>
              </div>
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="chat-card rounded-2xl p-6">
                <div className="h-4 w-20 bg-slate-200 rounded dark:bg-slate-700 mb-3"></div>
                <div className="h-8 w-16 bg-slate-200 rounded dark:bg-slate-700"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300">
            Error loading profile: {error.message}
          </div>
        </div>
      </div>
    )
  }

  const personData = data?.people?.[0]

  if (!personData) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="p-6 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-300">
            Profile data not found. Please try logging in again.
          </div>
        </div>
      </div>
    )
  }

  // Combine owned spaces and spaces where user is a member
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownedSpaces: any[] = personData.ownsSpaces || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memberSpaces: any[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    personData.memberOf?.map((membership: any) => membership.space[0]).filter(Boolean) || []

  // Merge and deduplicate spaces
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spaceMap = new Map<string, any>()

  // Add member spaces first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  memberSpaces.forEach((space: any) => {
    spaceMap.set(space.id, { ...space, isOwner: false })
  })

  // Then add/override with owned spaces (owned takes priority)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ownedSpaces.forEach((space: any) => {
    spaceMap.set(space.id, { ...space, isOwner: true })
  })

  const allSpaces = Array.from(spaceMap.values())

  const spaceCount = allSpaces.length
  const meSpaces = allSpaces.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (space: any) => space.__typename === 'MeSpace'
  )
  const weSpaces = allSpaces.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (space: any) => space.__typename === 'WeSpace'
  )

  const initials = personData.name
    ? personData.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (value.trim().length >= 2) {
      searchPeople({ variables: { nameContains: value } })
      return
    }
    setSearchResults([])
  }

  const personOptions: PersonSelectOption[] = searchResults
    .filter((person: any) => person.id !== personData.id)
    .filter(
      (person: any) =>
        !personData.connections?.some(
          (connection: any) => connection.id === person.id
        )
    )
    .map((person: any) => ({
      value: person.id,
      label: person.name,
      email: person.email,
    }))

  const handleCreateConnection = async () => {
    if (!selectedPersonId || !connectionWhy) {
      alert('Please fill in all fields')
      return
    }

    try {
      const result = await createConnection({
        variables: {
          fromPersonId: personData.id,
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
    if (!editingConnectionId) return

    try {
      const result = await updateConnection({
        variables: {
          fromPersonId: personData.id,
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

  const handleConfirmDelete = (connectionId: string) => {
    setConnectionToDeleteId(connectionId)
    setIsConfirmingDelete(true)
  }

  const handleDeleteConnection = async () => {
    if (!connectionToDeleteId) return

    try {
      const result = await deleteConnection({
        variables: {
          fromPersonId: personData.id,
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

  return (
    <div className="flex flex-col h-full w-full overflow-auto bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8 pt-28">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Profile Header Card */}
        <div className="chat-card rounded-2xl p-8 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-gp-primary/5 to-gp-accent-glow/5 dark:from-gp-primary/10 dark:to-gp-accent-glow/10"></div>

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="size-24 rounded-full border-4 border-gp-primary/20 flex items-center justify-center shrink-0 shadow-lg bg-linear-to-br from-gp-primary/20 to-gp-accent-glow/20 text-gp-primary font-bold text-3xl dark:from-gp-primary/10 dark:to-gp-accent-glow/10">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gp-ink-strong dark:text-white mb-2">
                {personData.name}
              </h1>
              <p className="text-base text-gp-ink-muted dark:text-white/60 mb-3">
                {personData.email}
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100/50 border border-green-200 dark:bg-green-500/20 dark:border-green-500/30">
                  <span className="size-2 rounded-full bg-green-600 dark:bg-green-400"></span>
                  <span className="text-xs text-green-700 font-semibold dark:text-green-300">
                    Active
                  </span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/protected/profile/edit')}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-lg cursor-pointer"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 95%, white 5%), color-mix(in srgb, var(--gp-primary) 75%, black 25%))',
                  boxShadow:
                    '0 10px 28px color-mix(in srgb, var(--gp-primary) 40%, transparent)',
                }}
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Spaces */}
          <div className="chat-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gp-ink-muted dark:text-white/60 font-semibold uppercase tracking-wider">
                Total Spaces
              </span>
              <span className="material-symbols-outlined text-gp-primary group-hover:scale-110 transition-transform">
                workspaces
              </span>
            </div>
            <div className="text-3xl font-bold text-gp-ink-strong dark:text-white">
              {spaceCount}
            </div>
          </div>

          {/* MeSpaces */}
          <div className="chat-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gp-ink-muted dark:text-white/60 font-semibold uppercase tracking-wider">
                MeSpaces
              </span>
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                person
              </span>
            </div>
            <div className="text-3xl font-bold text-gp-ink-strong dark:text-white">
              {meSpaces.length}
            </div>
          </div>

          {/* WeSpaces */}
          <div className="chat-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gp-ink-muted dark:text-white/60 font-semibold uppercase tracking-wider">
                WeSpaces
              </span>
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                groups
              </span>
            </div>
            <div className="text-3xl font-bold text-gp-ink-strong dark:text-white">
              {weSpaces.length}
            </div>
          </div>
        </div>

        {/* Spaces List */}
        {spaceCount > 0 && (
          <div className="chat-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gp-ink-strong dark:text-white">
                My Spaces
              </h2>
              <button
                onClick={() => router.push('/protected/dashboard?tab=spaces')}
                className="text-xs text-gp-primary hover:text-gp-primary-dark font-semibold transition-colors cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any
               */}
              {allSpaces.slice(0, 5).map((space: any) => {
                const isMeSpace = space.__typename === 'MeSpace'
                const icon = isMeSpace ? 'person' : 'groups'
                const iconBg = isMeSpace
                  ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300'
                  : 'bg-teal-50 border-teal-100 text-teal-600 dark:bg-teal-500/20 dark:border-teal-500/30 dark:text-teal-300'

                const timeAgo = space.createdAt
                  ? formatDistanceToNow(new Date(space.createdAt), {
                      addSuffix: true,
                    })
                  : 'Unknown'

                return (
                  <div
                    key={space.id}
                    onClick={() => {
                      const spaceType = isMeSpace ? 'me-space' : 'we-space'
                      router.push(`/protected/spaces/${spaceType}/${space.id}`)
                    }}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-gp-primary/20"
                  >
                    <div
                      className={`size-10 rounded-xl border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${iconBg}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gp-ink-strong dark:text-white group-hover:text-gp-primary transition-colors truncate">
                        {space.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-semibold dark:bg-white/10 dark:border-white/10 dark:text-white/60">
                          {isMeSpace ? 'MeSpace' : 'WeSpace'}
                        </span>
                        {!space.isOwner && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-[10px] text-amber-700 font-semibold dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-300">
                            Member
                          </span>
                        )}
                        <span className="text-[10px] text-gp-ink-muted dark:text-white/40">
                          {timeAgo}
                        </span>
                      </div>
                    </div>

                    <span className="material-symbols-outlined text-gp-ink-muted dark:text-white/40 group-hover:text-gp-primary transition-colors">
                      arrow_forward
                    </span>
                  </div>
                )
              })}
              {/* eslint-enable @typescript-eslint/no-explicit-any */}
            </div>
          </div>
        )}

        {/* Onboarding Controls */}
        <div className="chat-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gp-ink-strong dark:text-white mb-4">
            Onboarding & Tour
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/10">
              <div>
                <span className="text-sm text-gp-ink-muted dark:text-white/60 font-medium block mb-1">
                  Tour Status
                </span>
                <span className="text-xs text-gp-ink-soft dark:text-white/40">
                  {isCompleted
                    ? "You've completed the guided tour"
                    : 'Tour in progress'}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                  isCompleted
                    ? 'bg-green-100/50 border-green-200 text-green-700 dark:bg-green-500/20 dark:border-green-500/30 dark:text-green-300'
                    : 'bg-blue-100/50 border-blue-200 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-300'
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isCompleted
                      ? 'bg-green-600 dark:bg-green-400'
                      : 'bg-blue-600 dark:bg-blue-400'
                  }`}
                ></span>
                {isCompleted ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <div className="flex items-center gap-3 pt-3">
              {isCompleted && (
                <button
                  onClick={restartTour}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gp-primary/30 text-gp-primary hover:bg-gp-primary/5 transition-all dark:text-gp-primary dark:border-gp-primary/40 dark:hover:bg-gp-primary/10 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    refresh
                  </span>
                  Restart Tour
                </button>
              )}
              {!isCompleted && (
                <button
                  onClick={resumeTour}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
                  style={{
                    background:
                      'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 85%, white 15%), color-mix(in srgb, var(--gp-primary) 65%, black 35%))',
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    play_arrow
                  </span>
                  Continue Tour
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Connections */}
        {personData.connections && personData.connections.length > 0 && (
          <div className="chat-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gp-ink-strong dark:text-white">
                My Connections
              </h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {personData.connections.map((connection: any) => {
                // Find the corresponding edge metadata
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const edgeData = personData.connectionEdges?.find(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (edge: any) => edge.connectedPersonId === connection.id
                )

                return (
                  <div
                    key={connection.id}
                    className="p-4 rounded-lg bg-gp-glass-bg dark:bg-white/5 border border-gp-glass-border dark:border-white/10 hover:shadow-md transition-all"
                  >
                    <div
                      className="flex flex-col gap-3 cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/protected/dashboard/persons/${connection.id}`
                        )
                      }
                    >
                      <div className="flex items-center gap-3  rounded px-2 -mx-2">
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
                          <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft truncate">
                            {connection.email}
                          </p>
                        </div>
                        <button
                          className="cursor-pointer text-[8px] text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditConnection(
                              connection.id,
                              edgeData.why || '',
                              edgeData.interests || ''
                            )
                          }}
                        >
                          <span className="material-symbols-outlined text-[8px]">
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
                        >
                          <span className="material-symbols-outlined text-[8px]">
                            delete
                          </span>
                        </button>
                      </div>
                      {edgeData && (
                        <div className="space-y-2 border-t border-gp-glass-border pt-3">
                          {edgeData.why && (
                            <div>
                              <p className="text-[10px] font-semibold text-gp-ink mb-1 uppercase">
                                Why
                              </p>
                              <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
                                {edgeData.why}
                              </p>
                            </div>
                          )}
                          {edgeData.interests && (
                            <div>
                              <p className="text-[10px] font-semibold text-gp-ink mb-1 uppercase">
                                Interests
                              </p>
                              <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
                                {edgeData.interests}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* No Connections - Create First */}
        {(!personData.connections || personData.connections.length === 0) && (
          <div className="chat-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gp-ink-strong dark:text-white mb-4">
              Connections
            </h2>
            <div className="text-center py-8">
              <div className="text-5xl mb-4 text-gp-primary/40">
                <span className="material-symbols-outlined text-7xl">
                  group
                </span>
              </div>
              <p className="text-gp-ink-muted dark:text-white/60 mb-6">
                You haven't created any connections yet. Start building your
                network!
              </p>
              <button
                onClick={() => setIsAddingConnection(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer mx-auto"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 95%, white 5%), color-mix(in srgb, var(--gp-primary) 75%, black 25%))',
                  boxShadow:
                    '0 10px 28px color-mix(in srgb, var(--gp-primary) 40%, transparent)',
                }}
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Create First Connection
              </button>
            </div>
          </div>
        )}

        {/* Add Connection Modal */}
        {isAddingConnection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="chat-card rounded-2xl p-8 max-w-md w-full mx-4 relative">
              {/* Close Button */}
              <button
                onClick={() => setIsAddingConnection(false)}
                className="absolute top-4 right-4 text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <h2 className="text-2xl font-bold text-gp-ink-strong dark:text-white mb-6">
                Create New Connection
              </h2>

              {/* Search for person */}
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
                  placeholder="Search by name or email..."
                  noOptionsMessage={() =>
                    searchInput.trim().length < 2
                      ? 'Type at least 2 characters'
                      : 'No matching people found'
                  }
                  getOptionLabel={(option) =>
                    `${option.label} (${option.email})`
                  }
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

              {/* Selected person display */}
              {selectedPersonOption && (
                <div className="mb-6 p-4 rounded-lg bg-gp-primary/10 border border-gp-primary/20">
                  <div>
                    <div className="font-semibold text-gp-ink-strong dark:text-white">
                      {selectedPersonOption.label}
                    </div>
                    <div className="text-xs text-gp-ink-muted dark:text-white/60">
                      {selectedPersonOption.email}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPersonId('')
                        setSelectedPersonOption(null)
                        setSearchInput('')
                        setSearchResults([])
                      }}
                      className="mt-2 text-xs text-gp-primary hover:text-gp-primary-dark font-semibold transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {/* Why field */}
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

              {/* Interests field */}
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

              {/* Action buttons */}
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
            <div className="chat-card rounded-2xl p-8 max-w-md w-full mx-4 relative">
              <button
                onClick={() => setIsEditingConnection(false)}
                className="absolute top-4 right-4 text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <h2 className="text-2xl font-bold text-gp-ink-strong dark:text-white mb-6">
                Edit Connection
              </h2>

              {/* Why field */}
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

              {/* Interests field */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gp-ink-muted dark:text-white/60 block mb-2">
                  Shared Interests
                </label>
                <textarea
                  value={editingConnectionInterests}
                  onChange={(e) =>
                    setEditingConnectionInterests(e.target.value)
                  }
                  placeholder="What interests do you share?"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gp-primary/50 resize-none"
                  rows={3}
                />
              </div>

              {/* Action buttons */}
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
            <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border border-gp-glass-border">
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
                        animationsEnabled && 'animate-spin'
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
    </div>
  )
}
