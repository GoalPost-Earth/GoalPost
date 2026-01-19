'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import type { BubbleSize } from '@/components/ui/entity-bubble'
import { DraggableEntityBubble } from '@/components/canvas/draggable-entity-bubble'
import { useApp } from '@/app/contexts/AppContext'
import { CreateSpaceModal } from '@/components/canvas/create-space-modal'
import { GenericSpaceCanvas } from '@/components/canvas/generic-space-canvas'

interface SpacePosition {
  spaceId: string
  x: number
  y: number
  radius: number
  size: BubbleSize
}

export default function MeSpacePage() {
  const router = useRouter()
  const { user } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [spacePositions, setSpacePositions] = useState<SpacePosition[]>([])
  const [currentScale, setCurrentScale] = useState(1)
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

  const sizes: Array<'xl' | 'lg' | 'md' | 'sm'> = ['xl', 'lg', 'md', 'md', 'sm']
  const shapes: Array<'circle' | 'organic-1' | 'organic-2' | 'organic-3'> = [
    'circle',
    'organic-1',
    'organic-2',
    'organic-3',
    'circle',
  ]

  // Compute positions for space bubbles
  const computeSpacePositions = useCallback(() => {
    const radiusForSize: Record<BubbleSize, number> = {
      sm: 90,
      md: 110,
      lg: 140,
      xl: 220,
    }

    // 2x canvas size (GenericCanvas with canvasScale={2})
    const canvasWidth = (window.innerWidth || 1200) * 2
    const canvasHeight = (window.innerHeight || 1200) * 2
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radialDistance = Math.min(canvasWidth, canvasHeight) / 4

    const initialPositions: SpacePosition[] = userMeSpaces.map((space, idx) => {
      const angle = (idx / Math.max(userMeSpaces.length, 1)) * Math.PI * 2
      const size = space.size
      const radius = radiusForSize[size]

      return {
        spaceId: space.id,
        x: Math.cos(angle) * radialDistance + centerX,
        y: Math.sin(angle) * radialDistance + centerY,
        radius,
        size,
      }
    })
    return initialPositions
  }, [userMeSpaces])

  // Update positions when spaces change
  useEffect(() => {
    if (userMeSpaces.length > 0) {
      setSpacePositions(computeSpacePositions())
    }
  }, [userMeSpaces, computeSpacePositions])

  const fetchUserMeSpaces = useCallback(async () => {
    if (!user?.id) {
      setIsFetching(false)
      return
    }

    try {
      setIsFetching(true)
      const res = await fetch('/api/me-space/get-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Failed to fetch meSpaces:', data.error)
        setUserMeSpaces([])
        return
      }

      // Transform API response to component format
      const spaces = data.meSpaces.map(
        (
          space: { id: string; name: string; description?: string },
          idx: number
        ) => ({
          id: space.id,
          name: space.name,
          description: space.description || '',
          size: sizes[idx % sizes.length] as 'xl' | 'lg' | 'md' | 'sm',
          shape: shapes[idx % shapes.length] as
            | 'circle'
            | 'organic-1'
            | 'organic-2'
            | 'organic-3',
          icon: 'hub',
          subtitle: space.description || 'Personal space',
        })
      )

      setUserMeSpaces(spaces)
    } catch (err) {
      console.error('Error fetching meSpaces:', err)
      setUserMeSpaces([])
    } finally {
      setIsFetching(false)
    }

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    fetchUserMeSpaces()
  }, [fetchUserMeSpaces])

  const handleSpaceClick = (spaceId: string) => {
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
        setError(data.error || 'Failed to create space')
        return
      }

      setShowCreateModal(false)
      await fetchUserMeSpaces()
    } catch (err) {
      setError(
        'An error occurred while creating the space: ' + (err as Error).message
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
        isLoading={isFetching}
        isEmpty={spacePositions.length === 0}
        actionButton={
          <button
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 hover:shadow-[0_0_50px_rgba(19,127,236,0.2)] transition-all duration-300 group"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                setSpacePositions((prev) =>
                  prev.map((p) =>
                    p.spaceId === pos.spaceId ? { ...p, x, y } : p
                  )
                )
              }
              onClick={() => handleSpaceClick(space.id)}
            />
          )
        })}
      </GenericSpaceCanvas>
      {/* Create Space Modal (styled to match CreateFieldModal) */}
      {showCreateModal && (
        <CreateSpaceModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setError('')
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
