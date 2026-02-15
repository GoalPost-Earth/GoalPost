'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  useLazyQuery,
  useMutation,
  useQuery,
  useApolloClient,
} from '@apollo/client/react'
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
  UPDATE_RESONANCE_LINK_MUTATION,
  DELETE_RESONANCE_LINK_MUTATION,
  CREATE_GOAL_PULSE_MUTATION,
  CREATE_RESOURCE_PULSE_MUTATION,
  CREATE_STORY_PULSE_MUTATION,
  UPDATE_GOAL_PULSE_MUTATION,
  UPDATE_RESOURCE_PULSE_MUTATION,
  UPDATE_STORY_PULSE_MUTATION,
  DELETE_GOAL_PULSE_MUTATION,
  DELETE_RESOURCE_PULSE_MUTATION,
  DELETE_STORY_PULSE_MUTATION,
  DELETE_RESONANCES_BY_PULSE_MUTATION,
} from '@/app/graphql/mutations'
import { useApp, usePageContext } from '@/contexts'
import { usePreferences } from '@/contexts/preferences-context'
import { useResonanceDiscovery } from '@/hooks/useResonanceDiscovery'
import { useResonanceSuggestions } from '@/hooks/useResonanceSuggestions'
import { ResonanceSuggestionsModal } from '@/components/ui/resonance-suggestions-modal'
import {
  type PulsePosition,
  PULSE_NODE_RADIUS,
  RESONANCE_NODE_RADIUS,
  seededUnitValue,
  clampPosition,
  resolveCollisions,
  resolveResonanceCollisions,
  resolveBidirectionalResonancePulseCollisions,
} from '@/lib/utils'

// Icon mappings for pulse types
const pulseTypeIcons: Record<'goal' | 'resource' | 'story', string> = {
  goal: 'flag',
  resource: 'diamond',
  story: 'auto_stories',
}

const ANIMATION_ORDER: Array<
  'float' | 'float-delayed' | 'float-random' | 'pulse-slow'
> = ['float', 'float-delayed', 'float-random', 'pulse-slow']

function FieldDetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResonanceLinkModalOpen, setIsResonanceLinkModalOpen] =
    useState(false)
  const [isDiscoverSuggestionsModalOpen, setIsDiscoverSuggestionsModalOpen] =
    useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [editingPulseId, setEditingPulseId] = useState<string | null>(null)
  const [editingPulseData, setEditingPulseData] = useState<{
    type: NodeType
    name: string
    content: string
  } | null>(null)
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
  const [editingResonance, setEditingResonance] = useState<{
    id: string
    label: string
    confidence: number
    description: string
    sourceId: string
    targetId: string
    sourceType: 'goal' | 'resource' | 'story'
    targetType: 'goal' | 'resource' | 'story'
  } | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 6000, height: 6000 })

  // Refs to track current state for synchronous access
  const pulsePositionsRef = useRef<PulsePosition[]>([])
  const resonanceNodePositionsRef = useRef<
    Map<string, { x: number; y: number }>
  >(new Map())

  const params = useParams()
  const fieldId = params?.field as string
  const spaceId = params?.id as string
  const { user } = useApp()
  const { setPageTitle } = usePageContext()
  const { resonanceLinkageEnabled } = usePreferences()
  const apolloClient = useApolloClient()

  // Resonance discovery hooks
  const { triggerDiscovery, isLoading: isDiscoveringResonances } =
    useResonanceDiscovery({
      spaceId,
      onSuccess: () => {
        setIsDiscoverSuggestionsModalOpen(true)
        refetchSuggestions()
      },
    })

  const {
    suggestions,
    loading: suggestionsLoading,
    refetch: refetchSuggestions,
    acceptSuggestion,
    declineSuggestion,
  } = useResonanceSuggestions({
    spaceId,
    filter: 'all',
    enabled: false, // Don't auto-fetch until modal is opened
  })

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
    useMutation(CREATE_RESONANCE_LINK_MUTATION)

  const [updateResonanceLink, { loading: isUpdatingResonanceLink }] =
    useMutation(UPDATE_RESONANCE_LINK_MUTATION)

  const [deleteResonanceLink, { loading: isDeletingResonanceLink }] =
    useMutation(DELETE_RESONANCE_LINK_MUTATION)

  const [createGoalPulse] = useMutation(CREATE_GOAL_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [createResourcePulse] = useMutation(CREATE_RESOURCE_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [createStoryPulse] = useMutation(CREATE_STORY_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })

  const [updateGoalPulse] = useMutation(UPDATE_GOAL_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [updateResourcePulse] = useMutation(UPDATE_RESOURCE_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [updateStoryPulse] = useMutation(UPDATE_STORY_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })

  const [deleteGoalPulse] = useMutation(DELETE_GOAL_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [deleteResourcePulse] = useMutation(DELETE_RESOURCE_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [deleteStoryPulse] = useMutation(DELETE_STORY_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [deleteResonancesByPulse] = useMutation(
    DELETE_RESONANCES_BY_PULSE_MUTATION
  )

  // Redirect if no field ID
  if (!fieldId) {
    console.error('❌ No field ID in URL')
  }

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

  // Compute positions for pulse nodes
  const computePulsePositions = useCallback(
    (
      pulseData: Array<{
        id: string
        title: string
        content: string
        type: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
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
          title: pulse.title || '',
          label: pulse.title || 'Untitled Pulse',
          content: pulse.content || '',
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
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data.carePulses || []).map((p: any) => ({
          id: p.id,
          title: p.title || '',
          content: p.content || '',
          type: 'care' as const,
        })),
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data.coreValuePulses || []).map((p: any) => ({
          id: p.id,
          title: p.title || '',
          content: p.content || '',
          type: 'coreValue' as const,
        })),
      ]

      // Extract resonance links only if enabled
      const resonances = resonanceLinkageEnabled
        ? data.resonanceLinks || []
        : []
      setResonanceLinks(resonances)

      if (allPulses.length > 0) {
        const positions = computePulsePositions(allPulses)
        const resolvedPositions = resolveCollisions(
          positions,
          canvasSize.width,
          canvasSize.height
        )
        setPulsePositions(resolvedPositions)

        // Initialize positions for ALL resonance nodes on load
        // This prevents them from moving when pulses are dragged
        if (resonances.length > 0) {
          const newResonancePositions = new Map<
            string,
            { x: number; y: number }
          >()
          const positionMap = new Map(
            resolvedPositions.map((p) => [p.pulseId, { x: p.x, y: p.y }])
          )

          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          resonances.forEach((link: any) => {
            const sourceId = link.source?.id
            const targetId = link.target?.id
            if (sourceId && targetId) {
              const sourcePos = positionMap.get(sourceId)
              const targetPos = positionMap.get(targetId)
              if (sourcePos && targetPos) {
                // Calculate midpoint with seeded offset to prevent overlaps
                const baseMidX = (sourcePos.x + targetPos.x) / 2
                const baseMidY = (sourcePos.y + targetPos.y) / 2

                // Add deterministic offset based on link ID to spread out overlapping nodes
                const offsetX = (seededUnitValue(link.id, 17) - 0.5) * 120
                const offsetY = (seededUnitValue(link.id, 31) - 0.5) * 120

                newResonancePositions.set(link.id, {
                  x: baseMidX + offsetX,
                  y: baseMidY + offsetY,
                })
              }
            }
          })

          // Apply collision detection to resonance nodes
          const resolvedResonancePositions = resolveResonanceCollisions(
            newResonancePositions,
            resolvedPositions,
            canvasSize.width,
            canvasSize.height
          )

          setResonanceNodePositions(resolvedResonancePositions)
          resonanceNodePositionsRef.current = resolvedResonancePositions
        } else {
          setResonanceNodePositions(new Map())
        }

        // Set pulse options for resonance link modal
        setPulseOptions(allPulses)
        console.log(`✓ Loaded ${allPulses.length} pulses for field ${fieldId}`)
        console.log(
          `🔗 Loaded ${resonances.length} resonance links (${resonanceLinkageEnabled ? 'enabled' : 'disabled'})`
        )
      } else {
        setPulsePositions([])
        console.log(`ℹ️ No pulses found for field ${fieldId}`)
      }
    } catch (error) {
      console.error('Error processing pulses:', error)
      setPulsePositions([])
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulsesByContextData, computePulsePositions, resonanceLinkageEnabled])

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
        const weSpaceId = params?.id as string
        if (!weSpaceId) return

        const res = await fetch('/api/field/get-fields-by-space', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spaceId: weSpaceId }),
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
        // Apply collision resolution between pulses
        const resolved = resolveCollisions(
          updated,
          canvasSize.width,
          canvasSize.height
        )
        pulsePositionsRef.current = resolved

        // Also resolve collisions between pulses and resonance nodes
        if (resonanceNodePositionsRef.current.size > 0) {
          const resolvedResonancePositions = resolveResonanceCollisions(
            resonanceNodePositionsRef.current,
            resolved,
            canvasSize.width,
            canvasSize.height
          )
          resonanceNodePositionsRef.current = resolvedResonancePositions
          setResonanceNodePositions(resolvedResonancePositions)
        }

        return resolved
      })
    },
    [canvasSize]
  )

  // Handle resonance node click - manage active state and panel
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

      // Position should already be initialized from useEffect
      // If somehow missing, calculate with offset
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
              const baseMidX = (sourcePulse.x + targetPulse.x) / 2
              const baseMidY = (sourcePulse.y + targetPulse.y) / 2

              // Add deterministic offset to prevent overlaps
              const offsetX = (seededUnitValue(linkId, 17) - 0.5) * 120
              const offsetY = (seededUnitValue(linkId, 31) - 0.5) * 120

              const newPosition = {
                x: baseMidX + offsetX,
                y: baseMidY + offsetY,
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

  // Handle resonance node drag - both resonance and pulse nodes move when colliding
  const handleResonanceNodeDrag = useCallback(
    (linkId: string, newX: number, newY: number) => {
      // Clamp position to canvas bounds
      const [clampedX, clampedY] = clampPosition(
        newX,
        newY,
        canvasSize.width,
        canvasSize.height,
        RESONANCE_NODE_RADIUS
      )

      // Update this resonance node's position
      const updatedResonancePositions = new Map(
        resonanceNodePositionsRef.current
      )
      updatedResonancePositions.set(linkId, { x: clampedX, y: clampedY })

      // Apply bidirectional collision detection with pulses
      // Both resonance and pulse nodes move apart when they collide
      const {
        pulsePositions: resolvedPulses,
        resonancePositions: resolvedResonances,
      } = resolveBidirectionalResonancePulseCollisions(
        updatedResonancePositions,
        pulsePositionsRef.current,
        canvasSize.width,
        canvasSize.height,
        5 // More iterations for responsive drag collision detection
      )

      // Update refs immediately (synchronous)
      pulsePositionsRef.current = resolvedPulses
      resonanceNodePositionsRef.current = resolvedResonances

      // Update state (asynchronous for both pulse and resonance positions)
      setPulsePositions(resolvedPulses)
      setResonanceNodePositions(resolvedResonances)
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
      title: entry.title ?? null,
      content: entry.content ?? '',
      createdAt: entry.createdAt ?? null,
      intensity: entry.intensity ?? null,
      status: goal?.status ?? null,
      horizon: goal?.horizon ?? null,
      resourceType: resource?.resourceType ?? null,
      createdBy:
        entry.createdBy?.map((creator) => ({
          id: creator.id ?? creator.name ?? 'unknown',
          name: creator.name ?? 'Unknown',
          email: 'email' in creator ? (creator.email ?? undefined) : undefined,
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
    sourceType: 'goal' | 'resource' | 'story'
    targetType: 'goal' | 'resource' | 'story'
    resonanceId?: string
  }) => {
    const isEdit = !!data.resonanceId

    console.log(
      isEdit ? '🔧 Updating resonance link:' : '🔗 Creating resonance link:',
      data
    )

    try {
      if (isEdit) {
        // Update existing resonance link
        const { data: response } = await updateResonanceLink({
          variables: {
            where: { id_EQ: data.resonanceId },
            update: {
              label_SET: data.label,
              confidence_SET: data.confidence,
              description_SET: data.description || '',
            },
          },
        })

        console.log('✅ Resonance link updated:', response)
      } else {
        // Create new resonance link
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
      }

      // Wait for Neo4j to index relationships, then refetch with error handling
      setTimeout(() => {
        apolloClient
          .refetchQueries({
            include: ['GetPulsesByContext'],
          })
          .catch((err) => {
            console.error(
              `Failed to refetch GetPulsesByContext after resonance ${isEdit ? 'update' : 'creation'}:`,
              err
            )
            // Don't throw - the resonance was created/updated successfully
          })
      }, 1000)

      // Clear editing state
      setEditingResonance(null)

      return
    } catch (error) {
      console.error('❌ Error creating resonance link:', error)
      throw error instanceof Error
        ? error
        : new Error('Failed to create resonance link')
    }
  }

  const handleResonanceEdit = (linkId: string) => {
    console.log('✏️ Edit resonance clicked:', linkId)

    // Find the resonance link from the state
    const resonance = resonanceLinks.find((link) => link.id === linkId)

    if (!resonance) {
      console.error('Resonance link not found:', linkId)
      return
    }

    // Extract source and target IDs
    const sourceId = resonance.source?.[0]?.id
    const targetId = resonance.target?.[0]?.id
    const sourceType = resonance.source?.[0]?.__typename
      ?.replace('Pulse', '')
      .toLowerCase()
    const targetType = resonance.target?.[0]?.__typename
      ?.replace('Pulse', '')
      .toLowerCase()

    if (!sourceId || !targetId || !sourceType || !targetType) {
      console.error('Invalid resonance data:', resonance)
      return
    }

    // Set editing state
    setEditingResonance({
      id: resonance.id,
      label: resonance.label || 'Complements',
      confidence: resonance.confidence ?? 0.75,
      description: resonance.description || '',
      sourceId,
      targetId,
      sourceType: sourceType as 'goal' | 'resource' | 'story',
      targetType: targetType as 'goal' | 'resource' | 'story',
    })

    // Open the modal
    setIsResonanceLinkModalOpen(true)
  }

  const handleResonanceLinkDelete = async () => {
    if (!editingResonance) {
      return
    }

    try {
      await deleteResonanceLink({
        variables: {
          id: editingResonance.id,
        },
      })

      // Clear editing state
      setEditingResonance(null)
      setIsResonanceLinkModalOpen(false)

      // Refetch data
      setTimeout(() => {
        apolloClient
          .refetchQueries({
            include: ['GetPulsesByContext'],
          })
          .catch((err) => {
            console.error(
              'Failed to refetch GetPulsesByContext after resonance deletion:',
              err
            )
          })
      }, 1000)
    } catch (error) {
      console.error('Error deleting resonance link:', error)
      throw error instanceof Error
        ? error
        : new Error('Failed to delete resonance link')
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
      // Check if we're editing an existing pulse
      if (editingPulseId) {
        console.log('✏️ Updating pulse:', editingPulseId)

        // Map pulse type to mutation
        const pulseTypeMap = {
          goal: 'goal',
          resource: 'resource',
          story: 'story',
        } as const

        const pulseType =
          pulseTypeMap[type as keyof typeof pulseTypeMap] || 'goal'

        // Call appropriate update mutation based on type
        if (pulseType === 'goal') {
          await updateGoalPulse({
            variables: {
              where: { id_EQ: editingPulseId },
              update: {
                title_SET: name,
                content_SET: value,
              },
            },
          })
        } else if (pulseType === 'resource') {
          await updateResourcePulse({
            variables: {
              where: { id_EQ: editingPulseId },
              update: {
                title_SET: name,
                content_SET: value,
              },
            },
          })
        } else {
          await updateStoryPulse({
            variables: {
              where: { id_EQ: editingPulseId },
              update: {
                title_SET: name,
                content_SET: value,
              },
            },
          })
        }

        console.log('✅ Pulse updated successfully')
        setSubmitSuccess(true)

        // Close modal and reset after success
        setTimeout(() => {
          setIsModalOpen(false)
          setSubmitSuccess(false)
          setEditingPulseId(null)
          setEditingPulseData(null)
        }, 1500)
      } else {
        // Creating new pulse
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
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error submitting pulse:', error)
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditPulse = (
    e: React.MouseEvent,
    pulseId: string,
    type: NodeType,
    label: string,
    title: string,
    content: string
  ) => {
    e.stopPropagation()
    console.log('✏️ Edit pulse clicked:', {
      pulseId,
      type,
      label,
      title,
      content,
    })

    setEditingPulseId(pulseId)
    setEditingPulseData({
      type,
      name: title || label,
      content: content,
    })
    setIsModalOpen(true)
  }

  const handleDeletePulse = async (
    e: React.MouseEvent,
    pulseId: string,
    type: NodeType
  ) => {
    e.stopPropagation()
    console.log('🗑️ Delete pulse clicked:', { pulseId, type })

    if (!user) {
      console.error('❌ No user authenticated')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // First, delete any resonances attached to this pulse
      await deleteResonancesByPulse({ variables: { pulseId } })

      // Call appropriate delete mutation based on type
      if (type === 'goal') {
        await deleteGoalPulse({
          variables: {
            where: { id_EQ: pulseId },
          },
        })
      } else if (type === 'resource') {
        await deleteResourcePulse({
          variables: {
            where: { id_EQ: pulseId },
          },
        })
      } else {
        await deleteStoryPulse({
          variables: {
            where: { id_EQ: pulseId },
          },
        })
      }

      console.log('✅ Pulse deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting pulse:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to delete pulse'
      )
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
                onClick={() => triggerDiscovery()}
                disabled={isDiscoveringResonances}
                title="Discover Resonances"
                className="cursor-pointer relative flex items-center justify-center size-16 rounded-full gp-glass dark:gp-glass shadow-lg hover:shadow-[0_0_35px_color-mix(in_srgb,var(--gp-accent-glow)_45%,transparent)] transition-all duration-500 ease-out border border-gp-glass-border hover:border-gp-accent-glow/40 backdrop-blur-md group-hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-3xl text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-accent-glow transition-colors duration-500">
                  auto_awesome
                </span>
                <div className="absolute inset-0 rounded-full border border-gp-glass-border opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
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
              scale={currentScale}
              onResonanceNodeClick={handleResonanceNodeClick}
              onResonanceNodeDrag={handleResonanceNodeDrag}
              onResonanceNodeEdit={handleResonanceEdit}
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
                onEditClick={(e) =>
                  handleEditPulse(
                    e,
                    pos.pulseId,
                    pos.type,
                    pos.label,
                    pos.title,
                    pos.content
                  )
                }
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
        onEdit={() => {
          if (pulseDetails) {
            handleEditPulse(
              new MouseEvent('click') as unknown as React.MouseEvent,
              pulseDetails.id,
              pulseDetails.type,
              pulseDetails.title || '',
              pulseDetails.title || '',
              pulseDetails.content
            )
          }
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

      {
        /* Offering Modal */
        <OfferingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSubmitError(null)
            setSubmitSuccess(false)
            setEditingPulseId(null)
            setEditingPulseData(null)
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
              isEditing={!!editingPulseId}
              initialType={editingPulseData?.type}
              initialName={editingPulseData?.name}
              initialContent={editingPulseData?.content}
              onDelete={
                editingPulseId
                  ? async () => {
                      if (editingPulseData) {
                        await handleDeletePulse(
                          new MouseEvent(
                            'click'
                          ) as unknown as React.MouseEvent,
                          editingPulseId,
                          editingPulseData.type
                        )
                        setIsModalOpen(false)
                        setEditingPulseId(null)
                        setEditingPulseData(null)
                      }
                    }
                  : undefined
              }
            />
          </div>
        </OfferingModal>
      }

      <ResonanceLinkModal
        isOpen={isResonanceLinkModalOpen}
        onClose={() => {
          setIsResonanceLinkModalOpen(false)
          // Don't clear editingResonance immediately - let the delete handler do it
          // This prevents race conditions where editingResonance becomes null
          // before the delete mutation executes
          setTimeout(() => {
            setEditingResonance(null)
          }, 100)
        }}
        pulses={pulseOptions}
        onSubmit={handleResonanceLinkSubmit}
        onDelete={editingResonance ? handleResonanceLinkDelete : undefined}
        isLoading={
          isCreatingResonanceLink ||
          isUpdatingResonanceLink ||
          isDeletingResonanceLink
        }
        editingResonance={editingResonance}
      />

      <ResonanceSuggestionsModal
        isOpen={isDiscoverSuggestionsModalOpen}
        onClose={() => {
          setIsDiscoverSuggestionsModalOpen(false)
        }}
        spaceId={spaceId}
        suggestions={suggestions}
        loading={suggestionsLoading}
        onAccept={acceptSuggestion}
        onDecline={declineSuggestion}
        onRefresh={refetchSuggestions}
      />
    </div>
  )
}

export default FieldDetailPage
