'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import type { Node } from '@neo4j-nvl/base'
import type { BubbleSize } from '@/components/ui/entity-bubble'
import { EntityBubble } from '@/components/ui/entity-bubble'
import { useAnimations, useApp, usePageContext } from '@/contexts'
import { CreateSpaceModal } from '@/components/canvas/create-space-modal'
import { NvlCanvas } from '@/components/canvas/nvl-canvas'
import { createNvlNode, renderReactComponentToContainer } from '@/lib/nvl-utils'
import { GET_USER_WE_SPACES_QUERY } from '@/app/graphql/queries'
import { LOG_SPACE_ACTIVITY } from '@/app/graphql/mutations/ACTIVITY_LOG_MUTATIONS'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

export default function WeSpacePage() {
  const router = useRouter()
  const { user } = useApp()
  const { setPageTitle } = usePageContext()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { animationsEnabled } = useAnimations()
  const [weSpaces, setWeSpaces] = useState<
    Array<{
      id: string
      size: (typeof sizeVariations)[number]
      shape: (typeof shapeVariations)[number]
      icon: string
      title: string
      subtitle: string
      badge?: { text: string; variant: 'primary' | 'accent' | 'default' }
    }>
  >([])

  const [logSpaceActivity] = useMutation(LOG_SPACE_ACTIVITY)

  // Fetch WeSpaces using GraphQL
  const {
    data: weSpacesData,
    loading: weSpacesLoading,
    refetch: refetchWeSpaces,
  } = useQuery(GET_USER_WE_SPACES_QUERY)

  // Convert weSpaces to NVL nodes with transparent hitboxes for drag
  const nvlSpaceNodes: Node[] = useMemo(() => {
    return weSpaces.map((space) => {
      const hitboxSize = sizeToHitboxMap[space.size as BubbleSize] || 140
      return createNvlNode(
        {
          ...space,
        },
        hitboxSize
      )
    })
  }, [weSpaces])

  const fetchWeSpaces = useCallback(async () => {
    if (!weSpacesData?.weSpaces) {
      return
    }

    const transformedSpaces = weSpacesData.weSpaces.map(
      (
        space: {
          id: string
          name: string
          members?: Array<{ id: string }>
          contexts?: Array<{ id: string }>
        },
        idx: number
      ) => {
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
      }
    )
    setWeSpaces(transformedSpaces)
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weSpacesData])

  useEffect(() => {
    fetchWeSpaces()
  }, [fetchWeSpaces])

  useEffect(() => {
    setPageTitle(
      `We Space - ${weSpaces.length} Space${weSpaces.length !== 1 ? 's' : ''}`
    )
  }, [setPageTitle, weSpaces.length])

  const handleSpaceClick = useCallback(
    (spaceId: string) => {
      const space = weSpaces.find((s) => s.id === spaceId)
      if (space) {
        setPageTitle(space.title)
        // Persist space name in localStorage to avoid API call on page reload
        localStorage.setItem(`space_${spaceId}`, space.title)
        // Store weSpaceId for onboarding navigation
        localStorage.setItem('weSpaceId', spaceId)
      }
      router.push(`/protected/spaces/we-space/${spaceId}`)
    },
    [weSpaces, setPageTitle, router]
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
    weSpaces.forEach((space, idx) => {
      const container = document.getElementById(`node-${space.id}`)
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
  }, [weSpaces, handleSpaceClick, handleEditSpace])

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
      // Refresh the spaces list after creating a new one
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
    <main className="flex flex-col h-screen w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">
            Error: {error}
          </p>
        </div>
      )}

      {weSpacesLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'text-gp-primary dark:text-gp-primary',
                animationsEnabled && 'animate-spin'
              )}
            >
              <span className="material-symbols-outlined text-5xl md:text-6xl">
                hourglass_bottom
              </span>
            </div>
            <p className="text-gp-ink-muted dark:text-gp-ink-soft">
              Loading spaces...
            </p>
          </div>
        </div>
      ) : nvlSpaceNodes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-light text-gp-ink-strong dark:text-gp-ink-strong mb-2">
              No spaces yet
            </h2>
            <p className="text-gp-ink-muted dark:text-gp-ink-soft">
              Create your first WeSpace to collaborate with your community
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all duration-300 group"
          >
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
              add_circle
            </span>
            <span className="text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
              Create WeSpace
            </span>
          </button>
        </div>
      ) : (
        <NvlCanvas
          nodes={nvlSpaceNodes}
          relationships={[]}
          layout="forceDirected"
          enableZoomControls={true}
          showBackgroundDecor={true}
          isLoading={false}
          onNodeClick={(node) => handleSpaceClick(node.id)}
          actionButton={
            <button
              onClick={() => setShowCreateModal(true)}
              data-tour="create-wespace-button"
              className="cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all duration-300 group"
            >
              <div className="absolute inset-0 rounded-full bg-linear-to-r from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
                add_circle
              </span>
              <span className="hidden md:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
                Create WeSpace
              </span>
            </button>
          }
        />
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
            const editingSpace = weSpaces.find((s) => s.id === editingSpaceId)
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
            await refetchWeSpaces()
          }}
          isEditing={true}
          spaceId={editingSpaceId}
          isWeSpace={true}
          initialName={
            weSpaces.find((s) => s.id === editingSpaceId)?.title || ''
          }
        />
      )}
    </main>
  )
}
