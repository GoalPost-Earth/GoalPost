'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import type { Node } from '@neo4j-nvl/base'
import type { BubbleSize } from '@/components/ui/entity-bubble'
import { EntityBubble } from '@/components/ui/entity-bubble'
import { useApp, usePageContext } from '@/contexts'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { CreateSpaceModal } from '@/components/canvas/create-space-modal'
import { NvlCanvas } from '@/components/canvas/nvl-canvas'
import { SpaceViewToggle } from '@/components/spaces'
import type { SpaceViewMode } from '@/components/spaces'
import {
  createNvlNodeElement,
  renderReactComponentToContainer,
} from '@/lib/nvl-utils'
import { createClusteredFieldNodePositions } from '@/lib/field-cluster-layout' // Import the clustering function
import { GET_USER_WE_SPACES_QUERY } from '@/app/graphql/queries'
import { LOG_SPACE_ACTIVITY } from '@/app/graphql/mutations/ACTIVITY_LOG_MUTATIONS'
import { toast } from 'sonner'

// Size variations for visual interest
const sizeVariations = ['xl', 'lg', 'md', 'md', 'sm', 'lg', 'md', 'sm'] as const
const shapeVariations = [
  'circle',
  'organic-1',
  'organic-2',
  'organic-3',
  'circle',
  'organic-1',
  'organic-2',
  'circle',
] as const

// Map bubble sizes to transparent hitbox sizes for NVL drag interaction
const sizeToHitboxMap: Record<BubbleSize, number> = {
  sm: 110, // 180px bubble → 110px hitbox
  md: 140, // 220px bubble → 140px hitbox
  lg: 170, // 280px bubble → 170px hitbox
  xl: 250, // 440px bubble → 250px hitbox
}

// Transform space data to entity props
function transformSpacesToProps(
  spaces: Array<{
    id: string
    name: string
    members?: Array<{ id: string }>
    contexts?: Array<{ id: string }>
  }>
): Array<{
  id: string
  size: (typeof sizeVariations)[number]
  shape: (typeof shapeVariations)[number]
  icon: string
  title: string
  subtitle: string
  badge?: { text: string; variant: 'primary' | 'accent' | 'default' }
}> {
  return spaces.map((space, idx) => {
    const memberCount = space.members?.length ?? 0
    const contextCount = space.contexts?.length ?? 0

    return {
      id: space.id,
      size: sizeVariations[idx % sizeVariations.length],
      shape: shapeVariations[idx % shapeVariations.length],
      icon: 'groups',
      title: space.name,
      subtitle:
        memberCount > 0
          ? `${memberCount} member${memberCount !== 1 ? 's' : ''}`
          : 'Collaborative space',
      badge:
        contextCount > 0
          ? {
              text: `${contextCount} Field${contextCount !== 1 ? 's' : ''}`,
              variant: 'primary' as const,
            }
          : undefined,
    }
  })
}

export default function WeSpacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useApp()
  const { setPageTitle } = usePageContext()
  const viewParam = searchParams.get('view') as SpaceViewMode | null
  const [viewMode, setViewMode] = useState<SpaceViewMode>(
    viewParam === 'details' ? 'details' : 'graph'
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Add container cache similar to MeSpace page
  const nodeContainerCache = useRef<Map<string, HTMLElement>>(new Map())

  const [logSpaceActivity] = useMutation(LOG_SPACE_ACTIVITY)

  const withCurrentView = useCallback(
    (path: string) => {
      if (viewMode !== 'details') return path
      return `${path}?view=details`
    },
    [viewMode]
  )

  const handleViewChange = useCallback(
    (view: SpaceViewMode) => {
      setViewMode(view)
      const url = new URL(window.location.href)
      if (view === 'graph') {
        url.searchParams.delete('view')
      } else {
        url.searchParams.set('view', view)
      }
      router.replace(url.pathname + url.search, { scroll: false })
    },
    [router]
  )

  // Fetch WeSpaces using GraphQL
  const {
    data: weSpacesData,
    loading: weSpacesLoading,
    refetch: refetchWeSpaces,
  } = useQuery(GET_USER_WE_SPACES_QUERY)

  // Transform spaces to component props
  const transformedSpaces = useMemo(() => {
    if (!weSpacesData?.weSpaces) return []
    return transformSpacesToProps(weSpacesData.weSpaces)
  }, [weSpacesData])

  // Set page title
  useEffect(() => {
    setPageTitle(
      `We Space - ${transformedSpaces.length} Space${transformedSpaces.length !== 1 ? 's' : ''}`
    )
  }, [setPageTitle, transformedSpaces.length])

  // Create clustered positions and NVL nodes
  const nvlSpaceNodes: Node[] = useMemo(() => {
    const filtered = transformedSpaces.filter((space) => space.id)
    // Use the same clustering function with spacing value (adjust 150 as needed)
    const clusteredPositions = createClusteredFieldNodePositions(filtered, 250)
    const cache = nodeContainerCache.current

    // Purge stale containers for spaces that no longer exist
    const activeIds = new Set(filtered.map((s) => s.id!))
    for (const id of cache.keys()) {
      if (!activeIds.has(id)) cache.delete(id)
    }

    return clusteredPositions.map((position, index) => {
      const space = filtered[index]
      // Reuse the existing container element
      let container = cache.get(position.fieldId) // Note: fieldId from the clustering function
      if (!container) {
        container = createNvlNodeElement(`node-${position.fieldId}`)
        cache.set(position.fieldId, container)
      }

      const hitboxSize = sizeToHitboxMap[space.size as BubbleSize] || 140

      return {
        id: position.fieldId,
        x: position.x,
        y: position.y,
        html: container,
        size: hitboxSize,
        color: 'rgba(0, 0, 0, 0)',
        stroke: 'rgba(0, 0, 0, 0)',
        strokeWidth: 0,
        caption: '',
      } as Node
    })
  }, [transformedSpaces])

  const handleSpaceClick = useCallback(
    (spaceId: string) => {
      const space = transformedSpaces.find((s) => s.id === spaceId)
      if (space) {
        setPageTitle(space.title)
        localStorage.setItem(`space_${spaceId}`, space.title)
        localStorage.setItem('weSpaceId', spaceId)
      }
      router.push(withCurrentView(`/protected/spaces/we-space/${spaceId}`))
    },
    [transformedSpaces, setPageTitle, router, withCurrentView]
  )

  const handleEditSpace = useCallback(
    (e: React.MouseEvent, spaceId: string) => {
      e.stopPropagation()
      setEditingSpaceId(spaceId)
      setShowEditModal(true)
    },
    []
  )

  // Render EntityBubble components into NVL containers
  useEffect(() => {
    transformedSpaces.forEach((space, idx) => {
      if (!space.id) return
      const container = nodeContainerCache.current.get(space.id)
      if (container) {
        renderReactComponentToContainer(
          <EntityBubble
            size={space.size as BubbleSize}
            shape={space.shape}
            icon={space.icon}
            title={space.title}
            subtitle={space.subtitle}
            badge={space.badge}
            animationDelay={idx * 0.15}
            onClick={() => handleSpaceClick(space.id)}
            onEditClick={(e) => handleEditSpace(e, space.id)}
          />,
          container
        )
      }
    })
  }, [transformedSpaces, handleSpaceClick, handleEditSpace])

  const handleCreateSpace = async ({ name }: { name: string }) => {
    if (!name?.trim()) {
      setError('Space name is required')
      return
    }

    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/we-space/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          userId: user.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create space')
        return
      }

      // Log space creation activity
      if (data.weSpace?.id) {
        await logSpaceActivity({
          variables: {
            input: {
              action: 'created',
              spaceId: data.weSpace.id,
              spaceType: 'WeSpace',
              spaceName: name,
            },
          },
        })
          .then(() => toast.info('Space creation logged'))
          .catch((err) => {
            console.error('Error logging space creation:', err)
            toast.error('Failed to log space creation')
          })
      }

      setShowCreateModal(false)
      // Clear cache before refetching to ensure fresh containers
      nodeContainerCache.current.clear()
      await refetchWeSpaces()
    } catch (err) {
      setError(
        'An error occurred while creating the space' +
          (err instanceof Error ? `: ${err.message}` : '')
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {viewMode === 'details' ? (
        <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20">
          <ProfileBackground />
          <main className="relative">
            <ProfileLayout>
              <div className="flex justify-end mb-6">
                <SpaceViewToggle
                  activeView={viewMode}
                  onViewChange={handleViewChange}
                />
              </div>

              <div className="flex flex-col items-center text-center mb-12">
                <span className="text-[9px] uppercase font-semibold text-gp-primary mb-2">
                  WeSpace
                </span>
                <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
                  Collaborative Spaces
                </h1>
                <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                  {transformedSpaces.length} Space
                  {transformedSpaces.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {transformedSpaces.length > 0 ? (
                  transformedSpaces.map((space, idx) => (
                    <button
                      key={space.id}
                      onClick={() => handleSpaceClick(space.id)}
                      className={
                        idx > 0
                          ? 'border-t border-gp-glass-border pt-3 text-left cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                          : 'text-left cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                      }
                    >
                      <div className="flex justify-between items-start gap-3 p-4">
                        <div className="flex-1">
                          <span className="text-[9px] uppercase font-semibold text-gp-primary block mb-1">
                            WeSpace
                          </span>
                          <h3 className="text-base font-bold text-gp-ink-strong dark:text-white mb-1">
                            {space.title}
                          </h3>
                          <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                            {space.subtitle}
                          </p>
                          {space.badge && (
                            <p className="text-xs text-gp-primary mt-1">
                              {space.badge.text}
                            </p>
                          )}
                        </div>
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleEditSpace(e, space.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/50 text-gp-ink-strong transition-all hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-gp-ink-strong dark:hover:bg-white/10"
                            aria-label={`Edit ${space.title}`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              edit
                            </span>
                          </button>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="md:col-span-2 flex flex-col items-center gap-6 max-w-md px-6 text-center mx-auto">
                    <div className="size-20 md:size-24 rounded-full flex items-center justify-center bg-gp-primary/10 dark:bg-gp-primary/20">
                      <span className="material-symbols-outlined text-gp-primary dark:text-gp-primary text-5xl md:text-6xl">
                        groups
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl md:text-2xl font-bold text-gp-ink-strong dark:text-gp-ink-strong">
                        No WeSpaces Yet
                      </h3>
                      <p className="text-sm md:text-base text-gp-ink-muted dark:text-gp-ink-soft">
                        WeSpaces are collaborative containers for your
                        community. Create your first WeSpace to start building
                        together.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 w-full">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add_circle
                  </span>
                  Create WeSpace
                </button>
              </div>
            </ProfileLayout>
          </main>
        </div>
      ) : (
        <main className="flex flex-col h-full w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">
                Error: {error}
              </p>
            </div>
          )}

          <NvlCanvas
            nodes={nvlSpaceNodes}
            relationships={[]}
            layout="free"
            enableZoomControls={true}
            showBackgroundDecor={true}
            isLoading={weSpacesLoading}
            onNodeClick={(node) => handleSpaceClick(node.id)}
            emptyState={
              <div className="flex flex-col items-center gap-6 max-w-md px-6 text-center">
                <div className="size-20 md:size-24 rounded-full flex items-center justify-center bg-gp-primary/10 dark:bg-gp-primary/20">
                  <span className="material-symbols-outlined text-gp-primary dark:text-gp-primary text-5xl md:text-6xl">
                    groups
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-bold text-gp-ink-strong dark:text-gp-ink-strong">
                    No WeSpaces Yet
                  </h3>
                  <p className="text-sm md:text-base text-gp-ink-muted dark:text-gp-ink-soft">
                    WeSpaces are collaborative containers for your community.
                    Create your first WeSpace to start building together.
                  </p>
                </div>
              </div>
            }
            actionButton={
              <div className="flex items-center gap-2 md:gap-3">
                <SpaceViewToggle
                  activeView={viewMode}
                  onViewChange={handleViewChange}
                  className="relative z-20 pointer-events-auto"
                />
                <button
                  onClick={() => setShowCreateModal(true)}
                  data-tour="create-wespace-button"
                  className="relative z-10 overflow-hidden cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all duration-300 group"
                >
                  <div className="absolute inset-0 rounded-full bg-linear-to-r from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
                    add_circle
                  </span>
                  <span className="hidden md:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
                    Create WeSpace
                  </span>
                </button>
              </div>
            }
          />
        </main>
      )}

      {/* Create Space Modal */}
      {showCreateModal && (
        <CreateSpaceModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setError('')
          }}
          onCreate={handleCreateSpace}
          isLoading={isLoading}
          title="Create New WeSpace"
          subtitle="Start a collaborative space with your community"
        />
      )}
      {/* Edit Space Modal */}
      {showEditModal && editingSpaceId && (
        <CreateSpaceModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingSpaceId(null)
          }}
          onSuccessfulMutation={async () => {
            // Log space update activity
            const editingSpace = transformedSpaces.find(
              (s) => s.id === editingSpaceId
            )
            if (editingSpace?.title && editingSpaceId) {
              await logSpaceActivity({
                variables: {
                  input: {
                    action: 'updated',
                    spaceId: editingSpaceId,
                    spaceType: 'WeSpace',
                    spaceName: editingSpace.title,
                  },
                },
              })
                .then(() => toast.info('Space update logged'))
                .catch((err) => {
                  console.error('Error logging space update:', err)
                  toast.error('Failed to log space update')
                })
            }
            // Clear cache before refetching
            nodeContainerCache.current.clear()
            await refetchWeSpaces()
          }}
          isEditing={true}
          spaceId={editingSpaceId}
          isWeSpace={true}
          initialName={
            transformedSpaces.find((s) => s.id === editingSpaceId)?.title || ''
          }
        />
      )}
    </>
  )
}
