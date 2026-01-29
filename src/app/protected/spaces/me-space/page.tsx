'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/client/react'
import type { BubbleSize } from '@/components/ui/entity-bubble'
import { DraggableEntityBubble } from '@/components/canvas/draggable-entity-bubble'
import { useApp, usePageContext } from '@/contexts'
import { CreateSpaceModal } from '@/components/canvas/create-space-modal'
import { GenericSpaceCanvas } from '@/components/canvas/generic-space-canvas'
import { GET_USER_ME_SPACES_QUERY } from '@/app/graphql/queries'

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

export default function MeSpacePage() {
  const router = useRouter()
  const { user } = useApp()
  const { setPageTitle } = usePageContext()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [spacePositions, setSpacePositions] = useState<SpacePosition[]>([])
  const [currentScale, setCurrentScale] = useState(1)
  const [canvasSize, setCanvasSize] = useState({ width: 2400, height: 2400 })
  const [userMeSpaces, setUserMeSpaces] = useState<
    Array<{
      id: string
      name: string
      description?: string
      size: 'xl' | 'lg' | 'md' | 'sm'
      shape: 'circle' | 'organic-1' | 'organic-2' | 'organic-3'
      icon: string
      subtitle?: string
    }>
  >([])

  // Fetch MeSpaces using GraphQL
  const {
    data: meSpacesData,
    loading: meSpacesLoading,
    refetch: refetchMeSpaces,
  } = useQuery(GET_USER_ME_SPACES_QUERY)

  const sizes: Array<'xl' | 'lg' | 'md' | 'sm'> = ['xl', 'lg', 'md', 'md', 'sm']
  const shapes: Array<'circle' | 'organic-1' | 'organic-2' | 'organic-3'> = [
    'circle',
    'organic-1',
    'organic-2',
    'organic-3',
    'circle',
  ]

  // Track canvas size (matches GenericSpaceCanvas canvasScale=5)
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

    const initialPositions: SpacePosition[] = userMeSpaces.map((space, idx) => {
      const randomBase = `${space.id}-${idx}`
      const angle = seededUnitValue(randomBase, 7) * Math.PI * 2
      const radius =
        Math.pow(seededUnitValue(randomBase, 13), 0.6) * radialDistance
      const size = space.size
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
  }, [canvasSize.height, canvasSize.width, userMeSpaces])

  // Update positions when spaces change
  useEffect(() => {
    if (userMeSpaces.length > 0) {
      setSpacePositions(resolveCollisions(computeSpacePositions()))
    }
  }, [userMeSpaces, computeSpacePositions, resolveCollisions])

  const fetchUserMeSpaces = useCallback(async () => {
    if (!user?.id) {
      return
    }

    // Transform GraphQL response to component format
    const spaces = (meSpacesData?.meSpaces || []).map(
      (
        space: { id: string; name: string; contexts?: Array<{ id: string }> },
        idx: number
      ) => ({
        id: space.id,
        name: space.name,
        description: '',
        size: sizes[idx % sizes.length] as 'xl' | 'lg' | 'md' | 'sm',
        shape: shapes[idx % shapes.length] as
          | 'circle'
          | 'organic-1'
          | 'organic-2'
          | 'organic-3',
        icon: 'hub',
        subtitle: `${space.contexts?.length || 0} contexts`,
      })
    )

    setUserMeSpaces(spaces)
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meSpacesData, user?.id])

  useEffect(() => {
    fetchUserMeSpaces()
  }, [fetchUserMeSpaces])

  useEffect(() => {
    setPageTitle('Me Space')
  }, [setPageTitle])

  const handleSpaceClick = (spaceId: string) => {
    const space = userMeSpaces.find((s) => s.id === spaceId)
    if (space) {
      setPageTitle(space.name)
      // Persist space name in localStorage to avoid API call on page reload
      localStorage.setItem(`space_${spaceId}`, space.name)
    }
    router.push(`/protected/spaces/me-space/${spaceId}`)
  }

  const handleCreateSpace = async ({
    name,
    description,
  }: {
    name: string
    description?: string
  }) => {
    if (!name?.trim()) {
      console.error('Space name is required')
      return
    }

    if (!user?.id) {
      console.error('User not authenticated')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/me-space/create', {
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
        console.error(data.error || 'Failed to create space')
        return
      }

      setShowCreateModal(false)
      await refetchMeSpaces()
    } catch (err) {
      console.error(
        'An error occurred while creating the space: ' + (err as Error).message
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex flex-col h-screen w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      <GenericSpaceCanvas
        onScaleChange={setCurrentScale}
        isLoading={meSpacesLoading}
        isEmpty={spacePositions.length === 0}
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
              Create Space
            </span>
          </button>
        }
      >
        {spacePositions.map((pos, idx) => {
          const space = userMeSpaces[idx]
          if (!space) return null

          return (
            <DraggableEntityBubble
              key={pos.spaceId}
              size={pos.size}
              shape={space.shape}
              icon={space.icon}
              title={space.name}
              subtitle={space.subtitle}
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
      {showCreateModal && (
        <CreateSpaceModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
          }}
          onCreate={handleCreateSpace}
          isLoading={isLoading}
          title="Create New MeSpace"
          subtitle="Name your personal space and add a short description"
        />
      )}
    </main>
  )
}
