'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react'
import { useParams } from 'next/navigation'
import type { NodeType } from '@/components/ui/pulse-node'
import { DraggablePulseNode } from '@/components/canvas/draggable-pulse-node'
import { GenericPulseCanvas } from '@/components/canvas/generic-pulse-canvas'
import { ResonanceLinksVisualization } from '@/components/canvas/resonance-links-visualization'
import { OfferingModal } from '@/components/ui/offering-modal'
import { OfferingInput } from '@/components/ui/offering-input'
import { PulsePanel, type PulseDetails } from '@/components/ui/pulse-panel'
import { ResonancePanel } from '@/components/ui/resonance-panel'
import {
  ResonanceLinkModal,
  type PulseOption,
} from '@/components/ui/resonance-link-modal'
import { GET_PULSE_DETAILS, GET_PULSES_BY_CONTEXT } from '@/app/graphql/queries'
import {
  CREATE_RESONANCE_LINK_MUTATION,
  CREATE_GOAL_PULSE_MUTATION,
  CREATE_RESOURCE_PULSE_MUTATION,
  CREATE_STORY_PULSE_MUTATION,
} from '@/app/graphql/mutations'
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
  const [isResonanceLinkModalOpen, setIsResonanceLinkModalOpen] =
    useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [pulsePositions, setPulsePositions] = useState<PulsePosition[]>([])
  const [pulseOptions, setPulseOptions] = useState<PulseOption[]>([])
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resonanceLinks, setResonanceLinks] = useState<any[]>([])
  const [resonanceNodePositions, setResonanceNodePositions] = useState<
    Map<string, { x: number; y: number }>
  >(new Map())
  const [expandedResonanceLinks, setExpandedResonanceLinks] = useState<
    Set<string>
  >(new Set())
  const [activeResonanceNodeId, setActiveResonanceNodeId] = useState<
    string | null
  >(null)
  const [currentScale, setCurrentScale] = useState(1)
  const [isPulsePanelOpen, setIsPulsePanelOpen] = useState(false)
  const [isResonancePanelOpen, setIsResonancePanelOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedResonance, setSelectedResonance] = useState<any | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 6000, height: 6000 })

  // Refs to track current state for synchronous access
  const pulsePositionsRef = useRef<PulsePosition[]>([])
  const resonanceNodePositionsRef = useRef<
    Map<string, { x: number; y: number }>
  >(new Map())

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

  const { data: pulsesByContextData, loading: isPulsesLoading } = useQuery(
    GET_PULSES_BY_CONTEXT,
    {
      variables: { contextId: fieldId },
      skip: !fieldId,
    }
  )

  const [createResonanceLink, { loading: isCreatingResonanceLink }] =
    useMutation(CREATE_RESONANCE_LINK_MUTATION, {
      refetchQueries: ['GetPulsesByContext'],
    })

  const [createGoalPulse] = useMutation(CREATE_GOAL_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [createResourcePulse] = useMutation(CREATE_RESOURCE_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [createStoryPulse] = useMutation(CREATE_STORY_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })

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

  // Process pulses data when it changes
  useEffect(() => {
    if (!pulsesByContextData) return

    try {
      const data = pulsesByContextData
      // Combine all pulse types
      const allPulses = [
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data.goalPulses || []).map((p: any) => ({
          id: p.id,
          title: p.title || '',
          content: p.content || '',
          type: 'goal' as const,
        })),
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data.resourcePulses || []).map((p: any) => ({
          id: p.id,
          title: p.title || '',
          content: p.content || '',
          type: 'resource' as const,
        })),
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data.storyPulses || []).map((p: any) => ({
          id: p.id,
          title: p.title || '',
          content: p.content || '',
          type: 'story' as const,
        })),
      ]

      // Extract resonance links from context
      const contextData = data.fieldContexts?.[0]
      const resonances = contextData?.resonances || []
      setResonanceLinks(resonances)

      if (allPulses.length > 0) {
        const positions = computePulsePositions(allPulses)
        const resolvedPositions = resolveCollisions(
          positions,
          canvasSize.width,
          canvasSize.height
        )
        setPulsePositions(resolvedPositions)

        // Don't initialize resonance positions here - they will be calculated on click
        setResonanceNodePositions(new Map())

        // Set pulse options for resonance link modal
        setPulseOptions(allPulses)
        console.log(`✓ Loaded ${allPulses.length} pulses for field ${fieldId}`)
        console.log(`🔗 Loaded ${resonances.length} resonance links`)
      } else {
        setPulsePositions([])
        console.log(`ℹ️ No pulses found for field ${fieldId}`)
      }
    } catch (error) {
      console.error('Error processing pulses:', error)
      setPulsePositions([])
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulsesByContextData, computePulsePositions])

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
    setIsMounted(true)
  }, [])

  // Sync state with refs
  useEffect(() => {
    pulsePositionsRef.current = pulsePositions
  }, [pulsePositions])

  useEffect(() => {
    resonanceNodePositionsRef.current = resonanceNodePositions
  }, [resonanceNodePositions])

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
        const resolved = resolveCollisions(
          updated,
          canvasSize.width,
          canvasSize.height
        )
        pulsePositionsRef.current = resolved
        return resolved
      })
    },
    [canvasSize]
  )

  // Handle resonance node click - manage active state and panel separately
  const handleResonanceNodeClick = useCallback(
    (linkId: string) => {
      // Check if clicking the already active node (toggle off)
      if (activeResonanceNodeId === linkId) {
        setActiveResonanceNodeId(null)
        setIsResonancePanelOpen(false)
        setSelectedResonance(null)
        // Also clear the expanded connection lines
        setExpandedResonanceLinks((prev) => {
          const next = new Set(prev)
          next.delete(linkId)
          return next
        })
        return
      }

      // Clicking a different node - make it active and open panel
      const resonance = resonanceLinks.find((link) => link.id === linkId)
      if (resonance) {
        setActiveResonanceNodeId(linkId)
        setSelectedResonance(resonance)
        setIsResonancePanelOpen(true)
      }

      // Always expand the node's connection lines when clicked
      setExpandedResonanceLinks((prev) => {
        const next = new Set(prev)
        next.add(linkId)
        return next
      })

      // Initialize position if not already set
      const currentResonancePositions = resonanceNodePositionsRef.current
      if (!currentResonancePositions.has(linkId)) {
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const link = resonanceLinks.find((l: any) => l.id === linkId)
        if (link) {
          const sourceId = link.source?.[0]?.id
          const targetId = link.target?.[0]?.id

          if (sourceId && targetId) {
            const currentPulsePositions = pulsePositionsRef.current
            const sourcePulse = currentPulsePositions.find(
              (p) => p.pulseId === sourceId
            )
            const targetPulse = currentPulsePositions.find(
              (p) => p.pulseId === targetId
            )

            if (sourcePulse && targetPulse) {
              const newPosition = {
                x: (sourcePulse.x + targetPulse.x) / 2,
                y: (sourcePulse.y + targetPulse.y) / 2,
              }

              resonanceNodePositionsRef.current = new Map(
                currentResonancePositions
              )
              resonanceNodePositionsRef.current.set(linkId, newPosition)

              setResonanceNodePositions((prevPositions) => {
                const newPositions = new Map(prevPositions)
                newPositions.set(linkId, newPosition)
                return newPositions
              })
            }
          }
        }
      }
    },
    [activeResonanceNodeId, resonanceLinks]
  )

  // Handle resonance node drag - resonance node moves independently
  const handleResonanceNodeDrag = useCallback(
    (linkId: string, newX: number, newY: number) => {
      // Update the resonance node's position
      // Pulses are never moved - they stay in place
      // Connection lines update in real-time as resonance node moves
      const newPosition = { x: newX, y: newY }

      // Update ref immediately (synchronous)
      resonanceNodePositionsRef.current = new Map(
        resonanceNodePositionsRef.current
      )
      resonanceNodePositionsRef.current.set(linkId, newPosition)

      // Update state (asynchronous)
      setResonanceNodePositions((prev) => {
        const newPositions = new Map(prev)
        newPositions.set(linkId, newPosition)
        return newPositions
      })
    },
    []
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
      createdBy:
        entry.createdBy?.map((initiator) => ({
          id: initiator.id ?? initiator.name ?? 'unknown',
          name: initiator.name ?? 'Unknown',
          email:
            'email' in initiator ? (initiator.email ?? undefined) : undefined,
          kind: 'person' as const,
        })) ?? [],
      contexts:
        entry.context?.map((ctx) => ({
          id: ctx.id,
          title: ctx.title ?? 'Untitled Context',
        })) ?? [],
    }
  }, [pulseDetailsData])

  const handleResonanceLinkSubmit = async (data: {
    label: string
    confidence: number
    description: string
    sourceId: string
    targetId: string
  }) => {
    console.log('🔗 Creating resonance link:', data)

    try {
      const { data: response } = await createResonanceLink({
        variables: {
          input: [
            {
              label: data.label,
              confidence: data.confidence,
              description: data.description || undefined,
              createdAt: new Date().toISOString(),
              source: {
                connect: [{ where: { node: { id_EQ: data.sourceId } } }],
              },
              target: {
                connect: [{ where: { node: { id_EQ: data.targetId } } }],
              },
              context: {
                connect: [{ where: { node: { id_EQ: fieldId } } }],
              },
            },
          ],
        },
      })

      console.log('✅ Resonance link created:', response)
      return
    } catch (error) {
      console.error('❌ Error creating resonance link:', error)
      throw error instanceof Error
        ? error
        : new Error('Failed to create resonance link')
    }
  }

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
      // Map pulse type to mutation
      const pulseTypeMap = {
        goal: 'goal',
        resource: 'resource',
        story: 'story',
      } as const

      const pulseType =
        pulseTypeMap[type as keyof typeof pulseTypeMap] || 'goal'

      // Build input based on pulse type
      const baseInput = {
        title: name,
        content: value,
        intensity: 1.0,
        createdAt: new Date().toISOString(),
        context: {
          connect: [{ where: { node: { id_EQ: fieldId } } }],
        },
        createdBy: {
          connect: [{ where: { node: { id_EQ: user.id } } }],
        },
      }

      console.log('📤 Creating pulse with GraphQL mutation:', {
        pulseType,
        baseInput,
      })

      // Call appropriate mutation based on type
      if (pulseType === 'goal') {
        await createGoalPulse({
          variables: {
            input: [
              {
                ...baseInput,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: 'ACTIVE' as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                horizon: 'MID' as any,
              },
            ],
          },
        })
      } else if (pulseType === 'resource') {
        await createResourcePulse({
          variables: {
            input: [
              {
                ...baseInput,
                resourceType: 'general',
                availability: 1.0,
              },
            ],
          },
        })
      } else {
        await createStoryPulse({
          variables: {
            input: [baseInput],
          },
        })
      }

      console.log('✅ Pulse created successfully')
      setSubmitSuccess(true)

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
    <div className="relative overflow-hidden">
      <GenericPulseCanvas
        canvasScale={5}
        onScaleChange={setCurrentScale}
        isLoading={isPulsesLoading}
        isEmpty={
          !isPulsesLoading &&
          pulsePositions.length === 0 &&
          pulseOptions.length > 0
        }
        actionButton={
          isMounted && (
            <div className="group flex flex-row items-center gap-3">
              <button
                onClick={() => setIsResonanceLinkModalOpen(true)}
                disabled={pulseOptions.length < 2}
                title={
                  pulseOptions.length < 2
                    ? 'Need at least 2 pulses to create a resonance link'
                    : 'Create Resonance Link'
                }
                className="cursor-pointer relative flex items-center justify-center size-16 rounded-full gp-glass dark:gp-glass shadow-lg hover:shadow-[0_0_35px_color-mix(in_srgb,var(--gp-accent-glow)_45%,transparent)] transition-all duration-500 ease-out border border-gp-glass-border hover:border-gp-accent-glow/40 backdrop-blur-md group-hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-3xl text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-accent-glow transition-colors duration-500">
                  link
                </span>
                <div className="absolute inset-0 rounded-full border border-gp-glass-border opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
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
        {isMounted && !isPulsesLoading && (
          <>
            <ResonanceLinksVisualization
              pulsePositions={pulsePositions}
              resonanceLinks={resonanceLinks}
              resonanceNodePositions={resonanceNodePositions}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
              expandedLinks={expandedResonanceLinks}
              onResonanceNodeClick={handleResonanceNodeClick}
              onResonanceNodeDrag={handleResonanceNodeDrag}
            />
            {pulsePositions.map((pos) => (
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
          </>
        )}
      </GenericPulseCanvas>

      <PulsePanel
        isOpen={isPulsePanelOpen}
        isLoading={pulseDetailsLoading}
        pulse={pulseDetails}
        onClose={() => {
          setIsPulsePanelOpen(false)
        }}
      />

      <ResonancePanel
        isOpen={isResonancePanelOpen}
        onClose={() => {
          setIsResonancePanelOpen(false)
          // Keep the resonance node expanded even when closing panel
          // Don't reset the active state or selected resonance unless clicking another node
        }}
        resonance={
          selectedResonance
            ? {
                id: selectedResonance.id,
                label: selectedResonance.label,
                description: selectedResonance.description,
                strength: selectedResonance.confidence * 100,
              }
            : null
        }
        links={selectedResonance ? [selectedResonance] : []}
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

      <ResonanceLinkModal
        isOpen={isResonanceLinkModalOpen}
        onClose={() => setIsResonanceLinkModalOpen(false)}
        pulses={pulseOptions}
        onSubmit={handleResonanceLinkSubmit}
        isLoading={isCreatingResonanceLink}
      />
    </div>
  )
}

export default FieldDetailPage
