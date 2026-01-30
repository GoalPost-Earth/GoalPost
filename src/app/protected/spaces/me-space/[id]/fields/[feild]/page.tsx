'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLazyQuery } from '@apollo/client/react'
import { useParams } from 'next/navigation'
import type { NodeType } from '@/components/ui/pulse-node'
import { DraggablePulseNode } from '@/components/canvas/draggable-pulse-node'
import { GenericPulseCanvas } from '@/components/canvas/generic-pulse-canvas'
import { OfferingModal } from '@/components/ui/offering-modal'
import { OfferingInput } from '@/components/ui/offering-input'
import { PulsePanel, type PulseDetails } from '@/components/ui/pulse-panel'
import { GET_PULSE_DETAILS } from '@/app/graphql/queries'
import { useApp, usePageContext } from '@/contexts'

interface PulsePosition {
  pulseId: string
  x: number
  y: number
  icon: string
  label: string
  type: NodeType
  animation: 'float' | 'float-delayed' | 'float-random' | 'pulse-slow' | 'none'
}

// Icon mappings for pulse types
const pulseTypeIcons: Record<'goal' | 'resource' | 'story', string> = {
  goal: 'flag',
  resource: 'diamond',
  story: 'auto_stories',
}

const ANIMATION_ORDER: Array<
  'float' | 'float-delayed' | 'float-random' | 'pulse-slow'
> = ['float', 'float-delayed', 'float-random', 'pulse-slow']

const PULSE_NODE_RADIUS = 28 // Pixel radius for collision detection

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

// Helper: Clamp position within canvas bounds
function clampPosition(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number,
  nodeRadius: number = PULSE_NODE_RADIUS
): [number, number] {
  const minX = nodeRadius
  const maxX = canvasWidth - nodeRadius
  const minY = nodeRadius
  const maxY = canvasHeight - nodeRadius

  return [Math.max(minX, Math.min(maxX, x)), Math.max(minY, Math.min(maxY, y))]
}

// Helper: Resolve collisions between pulse nodes with iterative separation
function resolveCollisions(
  positions: PulsePosition[],
  canvasWidth: number = 6000,
  canvasHeight: number = 6000,
  iterations: number = 6
): PulsePosition[] {
  const result = JSON.parse(JSON.stringify(positions)) as PulsePosition[]
  const minDistance = PULSE_NODE_RADIUS * 2 // 56px separation
  let collisionsFound = false

  for (let iter = 0; iter < iterations; iter++) {
    collisionsFound = false
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dx = result[j].x - result[i].x
        const dy = result[j].y - result[i].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < minDistance && distance > 0.1) {
          collisionsFound = true
          const angle = Math.atan2(dy, dx)
          const overlap = minDistance - distance
          const pushDistance = overlap / 2 + 1 // Increased buffer for better separation

          result[i].x -= Math.cos(angle) * pushDistance
          result[i].y -= Math.sin(angle) * pushDistance
          result[j].x += Math.cos(angle) * pushDistance
          result[j].y += Math.sin(angle) * pushDistance
        }
      }
    }
    // If no collisions found, we can exit early
    if (!collisionsFound && iter > 0) break
  }

  // Clamp all positions to canvas bounds
  return result.map((pos) => {
    const [clampedX, clampedY] = clampPosition(
      pos.x,
      pos.y,
      canvasWidth,
      canvasHeight
    )
    return { ...pos, x: clampedX, y: clampedY }
  })
}

function FieldDetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [pulsePositions, setPulsePositions] = useState<PulsePosition[]>([])
  const [currentScale, setCurrentScale] = useState(1)
  const [isLoadingPulses, setIsLoadingPulses] = useState(true)
  const [isPulsePanelOpen, setIsPulsePanelOpen] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 6000, height: 6000 })

  const params = useParams()
  const fieldId = params?.feild as string // Note: folder name is [feild] (typo)
  const { user } = useApp()
  const { setPageTitle } = usePageContext()

  // Track canvas size (5x viewport to match GenericPulseCanvas canvasScale=5)
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

  const [
    fetchPulseDetails,
    { data: pulseDetailsData, loading: pulseDetailsLoading },
  ] = useLazyQuery(GET_PULSE_DETAILS)

  // Redirect if no field ID
  if (!fieldId) {
    console.error('❌ No field ID in URL')
  }

  // Compute positions for pulse nodes
  const computePulsePositions = useCallback(
    (
      pulseData: Array<{
        id: string
        content: string
        type: 'goal' | 'resource' | 'story'
      }>
    ) => {
      // Matches GenericPulseCanvas with canvasScale=5
      const centerX = canvasSize.width / 2
      const centerY = canvasSize.height / 2
      const maxRadius = Math.min(canvasSize.width, canvasSize.height) / 3

      const positions: PulsePosition[] = pulseData.map((pulse, idx) => {
        const randomBase = `${pulse.id}-${idx}`
        const angle = seededUnitValue(randomBase, 7) * Math.PI * 2
        const radius =
          Math.pow(seededUnitValue(randomBase, 13), 0.6) * maxRadius
        const jitterX =
          (seededUnitValue(randomBase, 23) - 0.5) * PULSE_NODE_RADIUS
        const jitterY =
          (seededUnitValue(randomBase, 29) - 0.5) * PULSE_NODE_RADIUS
        const animation = ANIMATION_ORDER[idx % ANIMATION_ORDER.length]

        return {
          pulseId: pulse.id,
          x: Math.cos(angle) * radius + centerX + jitterX,
          y: Math.sin(angle) * radius + centerY + jitterY,
          icon: pulseTypeIcons[pulse.type],
          label:
            pulse.content.substring(0, 50) +
            (pulse.content.length > 50 ? '...' : ''),
          type: pulse.type,
          animation,
        }
      })
      return positions
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvasSize]
  )

  const fetchPulses = useCallback(async () => {
    try {
      setIsLoadingPulses(true)
      const response = await fetch(
        `/api/pulse/get-by-context?contextId=${fieldId}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch pulses: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.pulses && data.pulses.length > 0) {
        const positions = computePulsePositions(data.pulses)
        setPulsePositions(
          resolveCollisions(positions, canvasSize.width, canvasSize.height)
        )
        console.log(`✓ Loaded ${positions.length} pulses for field ${fieldId}`)
      } else {
        setPulsePositions([])
        console.log(`ℹ️ No pulses found for field ${fieldId}`)
      }
    } catch (error) {
      console.error('Error fetching pulses:', error)
      setPulsePositions([])
    } finally {
      setIsLoadingPulses(false)
    }

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId, computePulsePositions])

  // Fetch field name
  useEffect(() => {
    if (!fieldId) return

    // Try to get field name from localStorage first (persisted from navigation)
    const cachedFieldName = localStorage.getItem(`field_${fieldId}`)
    if (cachedFieldName) {
      setPageTitle(cachedFieldName)
      return
    }

    const fetchFieldName = async () => {
      try {
        const meSpaceId = params?.id as string
        if (!meSpaceId) return

        const res = await fetch('/api/field/get-fields-by-space', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spaceId: meSpaceId }),
        })
        const data = await res.json()
        if (res.ok) {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const field = data.fields?.find((f: any) => f.id === fieldId)
          if (field) {
            setPageTitle(field.title)
            // Cache the field name for future reloads
            localStorage.setItem(`field_${fieldId}`, field.title)
          }
        }
      } catch (err) {
        console.error('Failed to fetch field name:', err)
      }
    }

    fetchFieldName()
  }, [fieldId, params?.id, setPageTitle])

  useEffect(() => {
    fetchPulses()
  }, [fetchPulses])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle position changes with collision detection
  const handlePulsePositionChange = useCallback(
    (pulseId: string, x: number, y: number) => {
      setPulsePositions((prev) => {
        const [clampedX, clampedY] = clampPosition(
          x,
          y,
          canvasSize.width,
          canvasSize.height
        )
        const updated = prev.map((p) =>
          p.pulseId === pulseId ? { ...p, x: clampedX, y: clampedY } : p
        )
        // Apply collision resolution
        return resolveCollisions(updated, canvasSize.width, canvasSize.height)
      })
    },
    [canvasSize]
  )

  const pulseDetails: PulseDetails | null = useMemo(() => {
    const goal = pulseDetailsData?.goalPulses?.[0]
    const resource = pulseDetailsData?.resourcePulses?.[0]
    const story = pulseDetailsData?.storyPulses?.[0]
    const entry = goal ?? resource ?? story

    if (!entry) return null

    const type = goal ? 'goal' : resource ? 'resource' : 'story'

    return {
      id: entry.id,
      type,
      content: entry.content ?? '',
      createdAt: entry.createdAt ?? null,
      intensity: entry.intensity ?? null,
      status: goal?.status ?? null,
      horizon: goal?.horizon ?? null,
      resourceType: resource?.resourceType ?? null,
      initiators:
        entry.initiatedBy?.map((initiator) => ({
          id: initiator.id ?? initiator.name ?? 'unknown',
          name: initiator.name ?? 'Unknown',
          email:
            'email' in initiator ? (initiator.email ?? undefined) : undefined,
          kind: initiator.__typename === 'Community' ? 'community' : 'person',
        })) ?? [],
      contexts:
        entry.context?.map((ctx) => ({
          id: ctx.id,
          title: ctx.title ?? 'Untitled Context',
        })) ?? [],
    }
  }, [pulseDetailsData])

  const handleOfferingSubmit = async (
    value: string,
    type: string,
    name: string
  ) => {
    console.log('🎯 handleOfferingSubmit called with:', { value, type, name })

    if (!user) {
      console.error('❌ No user authenticated')
      setSubmitError('User not authenticated')
      return
    }

    console.log('👤 User found:', user.id)
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      // Map pulse type from node type to API pulse type
      const pulseTypeMap: Record<string, string> = {
        goal: 'GoalPulse',
        resource: 'ResourcePulse',
        story: 'StoryPulse',
      }

      const pulseType = pulseTypeMap[type] || 'GoalPulse'

      const requestBody = {
        contextId: fieldId, // Use field ID as context ID
        personId: user.id,
        pulseType,
        content: value,
        conversation: [
          {
            role: 'user',
            content: value,
          },
        ],
      }

      console.log(
        '📤 Sending request to /api/pulse/create-from-conversation:',
        requestBody
      )

      const response = await fetch('/api/pulse/create-from-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📨 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API error response:', errorData)
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      console.log('✅ Pulse created successfully:', data)
      setSubmitSuccess(true)

      // Refresh pulses after successful creation
      await fetchPulses()

      // Close modal and reset after success
      setTimeout(() => {
        setIsModalOpen(false)
        setSubmitSuccess(false)
      }, 1500)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error submitting pulse:', error)
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <GenericPulseCanvas
        canvasScale={5}
        onScaleChange={setCurrentScale}
        isLoading={isLoadingPulses}
        isEmpty={pulsePositions.length === 0}
        actionButton={
          isMounted && (
            <div className="group flex flex-col items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer relative flex items-center justify-center size-16 rounded-full gp-glass dark:gp-glass shadow-lg hover:shadow-[0_0_35px_color-mix(in_srgb,var(--gp-accent-glow)_45%,transparent)] transition-all duration-500 ease-out border border-gp-glass-border hover:border-gp-accent-glow/40 backdrop-blur-md group-hover:-translate-y-1"
              >
                <span className="material-symbols-outlined text-3xl text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-accent-glow transition-colors duration-500">
                  spa
                </span>
                <div className="absolute inset-0 rounded-full border border-gp-glass-border opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>
          )
        }
      >
        {isMounted &&
          !isLoadingPulses &&
          pulsePositions.map((pos) => (
            <DraggablePulseNode
              key={pos.pulseId}
              icon={pos.icon}
              label={pos.label}
              type={pos.type}
              animation={pos.animation}
              canvasPosition={{ x: pos.x, y: pos.y }}
              scale={currentScale}
              onPositionChange={(x, y) =>
                handlePulsePositionChange(pos.pulseId, x, y)
              }
              onClick={() => {
                setIsPulsePanelOpen(true)
                fetchPulseDetails({ variables: { pulseId: pos.pulseId } })
              }}
            />
          ))}
      </GenericPulseCanvas>

      <PulsePanel
        isOpen={isPulsePanelOpen}
        isLoading={pulseDetailsLoading}
        pulse={pulseDetails}
        onClose={() => {
          setIsPulsePanelOpen(false)
        }}
      />

      {/* Offering Modal */}
      <OfferingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSubmitError(null)
          setSubmitSuccess(false)
        }}
        position="bottom"
      >
        <div className="w-full max-w-160">
          {submitError && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 text-sm">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
              Pulse created successfully!
            </div>
          )}
          <OfferingInput
            onSubmit={(value: string, type: string, name: string) => {
              handleOfferingSubmit(value, type, name)
            }}
            isLoading={isSubmitting}
          />
        </div>
      </OfferingModal>
    </div>
  )
}

export default FieldDetailPage
