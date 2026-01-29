'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/client/react'
import type { BubbleSize } from '@/components/ui/entity-bubble'
import { DraggableEntityBubble } from '@/components/canvas/draggable-entity-bubble'
import { useApp, usePageContext } from '@/contexts'
import { CreateSpaceModal } from '@/components/canvas/create-space-modal'
import { GenericSpaceCanvas } from '@/components/canvas/generic-space-canvas'
import { GET_USER_WE_SPACES_QUERY } from '@/app/graphql/queries'

interface SpacePosition {
  spaceId: string
  x: number
  y: number
  radius: number
  size: BubbleSize
}

// Deterministic pseudo-random number in [0,1) derived from an input string and salt
function seededUnitValue(input: string, salt: number) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i) + salt
    hash |= 0
  }
  const value = Math.abs(Math.sin(hash + salt) * 10000)
  return value - Math.floor(value)
}

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

export default function WeSpacePage() {
  const router = useRouter()
  const { user } = useApp()
  const { setPageTitle } = usePageContext()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [spacePositions, setSpacePositions] = useState<SpacePosition[]>([])
  const [currentScale, setCurrentScale] = useState(1)
  const [canvasSize, setCanvasSize] = useState({ width: 2400, height: 2400 })
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

  // Fetch WeSpaces using GraphQL
  const { data: weSpacesData, loading: weSpacesLoading } = useQuery(
    GET_USER_WE_SPACES_QUERY
  )

  // Track canvas size (aligned with GenericSpaceCanvas canvasScale=5)
  useEffect(() => {
    const updateCanvas = () =>
      setCanvasSize({
        width: (window.innerWidth || 1200) * 5,
        height: (window.innerHeight || 1200) * 5,
      })

    updateCanvas()
    window.addEventListener('resize', updateCanvas)
    return () => window.removeEventListener('resize', updateCanvas)
  }, [])

  const clampPosition = useCallback(
    (x: number, y: number, radius: number) => ({
      x: Math.max(radius, Math.min(canvasSize.width - radius, x)),
      y: Math.max(radius, Math.min(canvasSize.height - radius, y)),
    }),
    [canvasSize.height, canvasSize.width]
  )

  const resolveCollisions = useCallback(
    (positions: SpacePosition[]) => {
      let updated = positions
      const iterations = 6

      for (let iter = 0; iter < iterations; iter++) {
        let changed = false

        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const a = updated[i]
            const b = updated[j]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const dist = Math.max(Math.hypot(dx, dy), 0.001)
            const minDist = a.radius + b.radius

            if (dist < minDist) {
              const overlap = (minDist - dist + 1) / 2
              const nx = dx / dist
              const ny = dy / dist

              const movedA = clampPosition(
                a.x - nx * overlap,
                a.y - ny * overlap,
                a.radius
              )
              const movedB = clampPosition(
                b.x + nx * overlap,
                b.y + ny * overlap,
                b.radius
              )

              updated = updated.map((p, idx) => {
                if (idx === i) return { ...p, ...movedA }
                if (idx === j) return { ...p, ...movedB }
                return p
              })
              changed = true
            }
          }
        }

        if (!changed) break
      }

      return updated
    },
    [clampPosition]
  )

  // Compute positions for space bubbles
  const computeSpacePositions = useCallback(() => {
    const radiusForSize: Record<BubbleSize, number> = {
      sm: 90,
      md: 110,
      lg: 140,
      xl: 220,
    }

    // Matches GenericSpaceCanvas canvasScale={5}
    const canvasWidth = canvasSize.width
    const canvasHeight = canvasSize.height
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radialDistance = Math.min(canvasWidth, canvasHeight) / 4

    const initialPositions: SpacePosition[] = weSpaces.map((space, idx) => {
      const randomBase = `${space.id}-${idx}`
      const angle = seededUnitValue(randomBase, 7) * Math.PI * 2
      const radius =
        Math.pow(seededUnitValue(randomBase, 13), 0.6) * radialDistance
      const size = space.size as BubbleSize
      const bubbleRadius = radiusForSize[size]

      return {
        spaceId: space.id,
        x: Math.cos(angle) * radius + centerX,
        y: Math.sin(angle) * radius + centerY,
        radius: bubbleRadius,
        size,
      }
    })
    return initialPositions
  }, [canvasSize.height, canvasSize.width, weSpaces])

  // Update positions when spaces change
  useEffect(() => {
    if (weSpaces.length > 0) {
      setSpacePositions(resolveCollisions(computeSpacePositions()))
    }
  }, [weSpaces, computeSpacePositions, resolveCollisions])

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
    setPageTitle('We Space')
  }, [setPageTitle])

  const handleSpaceClick = (spaceId: string) => {
    const space = weSpaces.find((s) => s.id === spaceId)
    if (space) {
      setPageTitle(space.title)
      // Persist space name in localStorage to avoid API call on page reload
      localStorage.setItem(`space_${spaceId}`, space.title)
    }
    router.push(`/protected/spaces/we-space/${spaceId}`)
  }

  const handleCreateSpace = async ({
    name,
    description,
  }: {
    name: string
    description?: string
  }) => {
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
          description,
          userId: user.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create space')
        return
      }

      setShowCreateModal(false)
      // Refresh the spaces list after creating a new one
      await fetchWeSpaces()
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
      <GenericSpaceCanvas
        onScaleChange={setCurrentScale}
        isLoading={weSpacesLoading}
        isEmpty={spacePositions.length === 0}
        emptyStateMessage={{
          title: 'No spaces yet',
          subtitle:
            'Create your first WeSpace to collaborate with your community',
        }}
        actionButton={
          <button
            onClick={() => setShowCreateModal(true)}
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
      >
        {spacePositions.map((pos, idx) => {
          const space = weSpaces[idx]
          if (!space) return null

          return (
            <DraggableEntityBubble
              key={pos.spaceId}
              size={pos.size}
              shape={space.shape}
              icon={space.icon}
              title={space.title}
              subtitle={space.subtitle}
              badge={space.badge}
              animationDelay={idx * 0.15}
              canvasPosition={{ x: pos.x, y: pos.y }}
              radius={pos.radius}
              scale={currentScale}
              onPositionChange={(x, y) =>
                setSpacePositions((prev) => {
                  const clamped = clampPosition(x, y, pos.radius)
                  const updated = prev.map((p) =>
                    p.spaceId === pos.spaceId
                      ? { ...p, x: clamped.x, y: clamped.y }
                      : p
                  )
                  return resolveCollisions(updated)
                })
              }
              onClick={() => handleSpaceClick(space.id)}
            />
          )
        })}
      </GenericSpaceCanvas>

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
    </main>
  )
}
