'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { EntityBubble } from '@/components/ui/entity-bubble'
import { cn } from '@/lib/utils'
import { useApp } from '@/app/contexts/AppContext'
import { CreateSpaceModal } from '@/components/canvas/create-space-modal'

const positions = [
  'top-[10%] left-[50%] -translate-x-1/2',
  'top-[25%] left-[15%]',
  'top-[20%] right-[18%]',
  'top-[50%] left-[8%]',
  'top-[45%] right-[12%]',
  'bottom-[25%] left-[20%]',
  'bottom-[20%] right-[25%]',
  'bottom-[35%] left-[50%] -translate-x-1/2',
]

export default function MeSpacePage() {
  const router = useRouter()
  const { user } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
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

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => setError('')}
          className="mt-4 px-4 py-2 bg-gp-primary text-white rounded-lg"
        >
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <main className="relative flex-1 w-full h-full min-h-screen overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.15),transparent_70%)]" />
      {/* Animated background blobs */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-gp-primary/10 dark:bg-gp-primary/5 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-gp-accent-glow/10 dark:bg-gp-accent-glow/5 rounded-full blur-[80px] animate-blob [animation-delay:2s]" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gp-goal/5 dark:bg-gp-goal/3 rounded-full blur-[80px] animate-blob [animation-delay:4s]" />
      {/* Dot grid pattern */}
      <div className="absolute inset-0 gp-dot-grid opacity-30 dark:opacity-20" />
      {/* Me-Space Bubbles Container */}
      <div className="absolute inset-0 overflow-hidden pt-24 pb-24">
        {isFetching ? (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-5xl text-gp-primary animate-spin">
                hourglass_bottom
              </span>
              <p className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft">
                Loading your spaces...
              </p>
            </div>
          </div>
        ) : userMeSpaces.length > 0 ? (
          userMeSpaces.map((space, idx) => (
            <div
              key={space.id}
              className={cn('absolute', positions[idx % positions.length])}
            >
              <EntityBubble
                size={space.size}
                shape={space.shape}
                icon={space.icon}
                title={space.name}
                subtitle={space.subtitle}
                animationDelay={idx * 0.15}
                onClick={() => handleSpaceClick(space.id)}
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gp-ink-muted dark:text-gp-ink-soft mb-6">
                No spaces yet. Create your first one!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-lg bg-gp-primary hover:bg-gp-primary/90 text-white font-medium transition-colors"
              >
                Create Your First Space
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        {/* View Controls */}
        <div className="flex items-center gap-2 p-1.5 rounded-full gp-glass dark:gp-glass shadow-xl">
          <button
            className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <div className="w-px h-4 bg-gp-ink-soft/20 dark:bg-white/10" />
          <button
            className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
            title="Zoom In"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <div className="w-px h-4 bg-gp-ink-soft/20 dark:bg-white/10" />
          <button
            className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
            title="Filter Spaces"
          >
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        {/* Create New Space Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-12 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 hover:shadow-[0_0_50px_rgba(19,127,236,0.2)] transition-all duration-300 group"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
            add_circle
          </span>
          <span className="hidden md:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
            Create Space
          </span>
        </button>
      </div>
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
