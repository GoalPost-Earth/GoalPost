'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  useLazyQuery,
  useMutation,
  useQuery,
  useApolloClient,
} from '@apollo/client/react'
import { useParams } from 'next/navigation'
import type { Node, Relationship } from '@neo4j-nvl/base'
import type { NodeType } from '@/components/ui/pulse-node'
import { PulseNode } from '@/components/ui/pulse-node'
import { ResonanceNode } from '@/components/ui/resonance-node'
import { NvlCanvas } from '@/components/canvas/nvl-canvas'
import { createNvlNode, renderReactComponentToContainer } from '@/lib/nvl-utils'
import { formatResonanceLabel } from '@/utils/graph-utils'
import { OfferingModal } from '@/components/ui/offering-modal'
import { OfferingInput } from '@/components/ui/offering-input'
import { PulseEditModal } from '@/components/ui/pulse-edit-modal'
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
  LOG_PULSE_ACTIVITY,
  LOG_RESONANCE_ACTIVITY,
} from '@/app/graphql/mutations'
import { useApp, usePageContext } from '@/contexts'
import { usePreferences } from '@/contexts/preferences-context'
import {
  type PulsePosition,
  PULSE_NODE_RADIUS,
  RESONANCE_NODE_RADIUS,
  seededUnitValue,
  clampPosition,
  resolveCollisions,
  resolveBidirectionalResonancePulseCollisions,
} from '@/lib/utils'
import { PULSE_TYPE_CONFIG } from '@/lib/pulse-type-config'

// Icon mappings for pulse types
const pulseTypeIcons: Record<
  'goal' | 'resource' | 'story' | 'care' | 'coreValue',
  string
> = {
  goal: PULSE_TYPE_CONFIG.goal.icon,
  resource: PULSE_TYPE_CONFIG.resource.icon,
  story: PULSE_TYPE_CONFIG.story.icon,
  care: PULSE_TYPE_CONFIG.care.icon,
  coreValue: PULSE_TYPE_CONFIG.coreValue.icon,
}

const ANIMATION_ORDER: Array<
  'float' | 'float-delayed' | 'float-random' | 'pulse-slow'
> = ['float', 'float-delayed', 'float-random', 'pulse-slow']

function FieldDetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResonanceLinkModalOpen, setIsResonanceLinkModalOpen] =
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
  const [pulseOptions, setPulseOptions] = useState<PulseOption[]>([])
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resonanceLinks, setResonanceLinks] = useState<any[]>([])
  const [activeResonanceNodeId, setActiveResonanceNodeId] = useState<
    string | null
  >(null)
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

  // NVL-specific state
  const [nvlNodes, setNvlNodes] = useState<Node[]>([])
  const [nvlRelationships, setNvlRelationships] = useState<Relationship[]>([])
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [pulseData, setPulseData] = useState<
    Array<{
      id: string
      title: string
      content: string
      type: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
    }>
  >([])

  const params = useParams()
  const fieldId = params?.field as string
  const { user } = useApp()
  const { setPageTitle } = usePageContext()
  const { resonanceLinkageEnabled } = usePreferences()
  const apolloClient = useApolloClient()

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
    awaitRefetchQueries: true,
  })
  const [deleteResourcePulse] = useMutation(DELETE_RESOURCE_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
    awaitRefetchQueries: true,
  })
  const [deleteStoryPulse] = useMutation(DELETE_STORY_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
    awaitRefetchQueries: true,
  })
  const [deleteResonancesByPulse] = useMutation(
    DELETE_RESONANCES_BY_PULSE_MUTATION,
    {
      refetchQueries: ['GetPulsesByContext'],
      awaitRefetchQueries: true,
    }
  )

  const [logPulseActivity] = useMutation(LOG_PULSE_ACTIVITY)
  const [logResonanceActivity] = useMutation(LOG_RESONANCE_ACTIVITY)

  // Redirect if no field ID
  if (!fieldId) {
    console.error('❌ No field ID in URL')
  }

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
        ? data.fieldContexts?.[0]?.resonancesInContext || []
        : []
      setResonanceLinks(resonances)

      // Store pulse data for NVL transformation
      setPulseData(allPulses)

      // Set pulse options for resonance link modal
      setPulseOptions(allPulses)
      console.log(`✓ Loaded ${allPulses.length} pulses for field ${fieldId}`)
      console.log(
        `🔗 Loaded ${resonances.length} resonance links (${resonanceLinkageEnabled ? 'enabled' : 'disabled'})`
      )
    } catch (error) {
      console.error('Error processing pulses:', error)
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulsesByContextData, resonanceLinkageEnabled])

  // Fetch field name with pulse count
  useEffect(() => {
    if (!fieldId) return

    // Try to get field name from localStorage first (persisted from navigation)
    const cachedFieldName = localStorage.getItem(`field_${fieldId}`)
    if (cachedFieldName) {
      const pulseCount = pulseOptions.length
      setPageTitle(
        `${cachedFieldName} - ${pulseCount} Pulse${pulseCount !== 1 ? 's' : ''}`
      )
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
            const pulseCount = pulseOptions.length
            setPageTitle(
              `${field.title} - ${pulseCount} Pulse${pulseCount !== 1 ? 's' : ''}`
            )
            // Cache the field name for future reloads
            localStorage.setItem(`field_${fieldId}`, field.title)
          }
        }
      } catch (err) {
        console.error('Failed to fetch field name:', err)
      }
    }

    fetchFieldName()
  }, [fieldId, params?.id, setPageTitle, pulseOptions.length])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Transform data into NVL nodes and relationships
  useEffect(() => {
    const nodes: Node[] = []
    const relationships: Relationship[] = []

    // Create pulse nodes
    pulseData.forEach((pulse) => {
      nodes.push(
        createNvlNode(
          {
            id: `pulse-${pulse.id}`,
            pulseId: pulse.id,
            type: 'pulse',
            pulseType: pulse.type,
            title: pulse.title,
            content: pulse.content,
          },
          80 // Node size for drag interaction
        )
      )
    })

    // Create resonance nodes
    resonanceLinks.forEach((link: any) => {
      nodes.push(
        createNvlNode(
          {
            id: `resonance-${link.id}`,
            resonanceId: link.id,
            type: 'resonance',
            label: formatResonanceLabel(link.label) || 'Resonance',
            description: link.description || '',
            confidence: link.confidence || 0,
          },
          60 // Smaller hitbox for resonance nodes
        )
      )
    })

    // Create relationships for resonance links
    resonanceLinks.forEach((link: any) => {
      const sourceId = link.source?.[0]?.id
      const targetId = link.target?.[0]?.id
      const resonanceNodeId = `resonance-${link.id}`

      if (sourceId && targetId) {
        // Source pulse → Resonance node
        relationships.push({
          id: `rel-${link.id}-source`,
          from: `pulse-${sourceId}`,
          to: resonanceNodeId,
          caption: '',
          type: 'RESONATES_WITH',
        })

        // Resonance node → Target pulse
        relationships.push({
          id: `rel-${link.id}-target`,
          from: resonanceNodeId,
          to: `pulse-${targetId}`,
          caption: '',
          type: 'RESONATES_WITH',
        })
      }
    })

    console.log(`🔮 NVL nodes created: ${nodes.length}`)
    console.log(`🔗 NVL relationships created: ${relationships.length}`)

    setNvlNodes(nodes)
    setNvlRelationships(relationships)
  }, [pulseData, resonanceLinks])

  // Render React components into NVL node HTML containers
  useEffect(() => {
    if (nvlNodes.length === 0) return

    nvlNodes.forEach((node) => {
      if (!node.html || !(node.html instanceof HTMLElement)) return

      const nodeType = (node as any).type

      if (nodeType === 'pulse') {
        const pulse = pulseData.find((p) => p.id === (node as any).pulseId)
        if (pulse) {
          renderReactComponentToContainer(
            <PulseNode
              icon={pulseTypeIcons[pulse.type]}
              label={pulse.title || 'Untitled Pulse'}
              type={pulse.type}
              animation="none"
              isSelected={selectedNodeId === node.id}
              isHovered={hoveredNodeId === node.id}
            />,
            node.html
          )
        }
      } else if (nodeType === 'resonance') {
        const resonance = resonanceLinks.find(
          (r: any) => r.id === (node as any).resonanceId
        )
        if (resonance) {
          renderReactComponentToContainer(
            <ResonanceNode
              id={resonance.id}
              icon="link"
              label={(node as any).label || 'Resonance'}
              description={resonance.description}
              isActive={activeResonanceNodeId === resonance.id}
              onClick={() => {}} // Handled by NVL canvas
              isSelected={selectedNodeId === node.id}
              isHovered={hoveredNodeId === node.id}
            />,
            node.html
          )
        }
      }
    })
  }, [
    nvlNodes,
    pulseData,
    resonanceLinks,
    selectedNodeId,
    hoveredNodeId,
    activeResonanceNodeId,
  ])

  // Handle node click
  const handleNodeClick = useCallback(
    (node: Node) => {
      const nodeType = (node as any).type

      if (nodeType === 'pulse') {
        const pulseId = (node as any).pulseId
        setSelectedNodeId(node.id)
        setIsPulsePanelOpen(true)
        setIsResonancePanelOpen(false)
        fetchPulseDetails({ variables: { pulseId } })
      } else if (nodeType === 'resonance') {
        const resonanceId = (node as any).resonanceId
        const resonance = resonanceLinks.find((r: any) => r.id === resonanceId)

        if (resonance) {
          setSelectedNodeId(node.id)
          setActiveResonanceNodeId(resonanceId)
          setSelectedResonance(resonance)
          setIsResonancePanelOpen(true)
          setIsPulsePanelOpen(false)
        }
      }
    },
    [resonanceLinks, fetchPulseDetails]
  )

  // Handle node hover
  const handleNodeHover = useCallback((node: Node | null) => {
    setHoveredNodeId(node?.id || null)
  }, [])

  // Handle background click
  const handleBackgroundClick = useCallback(() => {
    setSelectedNodeId(null)
    setHoveredNodeId(null)
    setIsPulsePanelOpen(false)
    setIsResonancePanelOpen(false)
    setActiveResonanceNodeId(null)
    setSelectedResonance(null)
  }, [])

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

  const getPulseSnapshot = useCallback(
    async (pulseId: string) => {
      try {
        const result = await fetchPulseDetails({ variables: { pulseId } })
        const data = result.data as typeof pulseDetailsData
        const goal = data?.goalPulses?.[0]
        const resource = data?.resourcePulses?.[0]
        const story = data?.storyPulses?.[0]
        const entry = goal ?? resource ?? story

        if (!entry) return null

        return {
          id: entry.id,
          type: goal ? 'goal' : resource ? 'resource' : ('story' as const),
          title: entry.title ?? null,
        }
      } catch (error) {
        console.warn('Failed to fetch pulse snapshot:', error)
        return null
      }
    },
    [fetchPulseDetails]
  )

  const handleResonanceLinkSubmit = async (data: {
    label: string
    confidence: number
    description: string
    sourceId: string
    targetId: string
    sourceType: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
    targetType: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
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

        // Log resonance update activity
        logResonanceActivity({
          variables: {
            input: {
              action: 'updated',
              resonanceId: data.resonanceId,
              label: data.label,
              sourceId: data.sourceId,
              sourceName: '', // Not available in update
              targetId: data.targetId,
              targetName: '', // Not available in update
              contextId: fieldId,
              confidence: data.confidence,
            },
          },
        }).catch((err) => console.warn('Failed to log resonance update:', err))
      } else {
        // Create new resonance link (context-independent)
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
              },
            ],
          },
        })

        console.log('✅ Resonance link created:', response)

        // Log resonance creation activity
        const createdResonanceId =
          response?.createResonanceLinks?.resonanceLinks?.[0]?.id
        logResonanceActivity({
          variables: {
            input: {
              action: 'created',
              resonanceId: createdResonanceId || '',
              label: data.label,
              sourceId: data.sourceId,
              sourceName: '', // Not available in create
              targetId: data.targetId,
              targetName: '', // Not available in create
              contextId: fieldId,
              confidence: data.confidence,
            },
          },
        }).catch((err) =>
          console.warn('Failed to log resonance creation:', err)
        )
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

      // Log resonance deletion activity
      logResonanceActivity({
        variables: {
          input: {
            action: 'deleted',
            resonanceId: editingResonance.id,
            label: editingResonance.label,
            sourceId: editingResonance.sourceId,
            sourceName: '', // Not available in delete
            targetId: editingResonance.targetId,
            targetName: '', // Not available in delete
            contextId: fieldId,
            confidence: editingResonance.confidence,
          },
        },
      }).catch((err) => console.warn('Failed to log resonance deletion:', err))

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

        const pulseSnapshot = await getPulseSnapshot(editingPulseId)
        const snapshotType = pulseSnapshot?.type ?? pulseType
        const snapshotName = pulseSnapshot?.title ?? name

        // Log pulse update activity
        logPulseActivity({
          variables: {
            input: {
              action: 'updated',
              pulseId: editingPulseId,
              pulseType:
                snapshotType.charAt(0).toUpperCase() +
                snapshotType.slice(1) +
                'Pulse',
              pulseName: snapshotName,
              contextId: fieldId,
            },
          },
        }).catch((err) => console.warn('Failed to log pulse update:', err))

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

        let createdPulseId: string | undefined

        // Call appropriate mutation based on type
        if (pulseType === 'goal') {
          const { data: response } = await createGoalPulse({
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
          createdPulseId = response?.createGoalPulses?.goalPulses?.[0]?.id
        } else if (pulseType === 'resource') {
          const { data: response } = await createResourcePulse({
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
          createdPulseId =
            response?.createResourcePulses?.resourcePulses?.[0]?.id
        } else {
          const { data: response } = await createStoryPulse({
            variables: {
              input: [baseInput],
            },
          })
          createdPulseId = response?.createStoryPulses?.storyPulses?.[0]?.id
        }

        console.log('✅ Pulse created successfully')
        setSubmitSuccess(true)

        // Log pulse creation activity
        if (createdPulseId) {
          logPulseActivity({
            variables: {
              input: {
                action: 'created',
                pulseId: createdPulseId,
                pulseType:
                  pulseType.charAt(0).toUpperCase() +
                  pulseType.slice(1) +
                  'Pulse',
                pulseName: name,
                contextId: fieldId,
              },
            },
          }).catch((err) => console.warn('Failed to log pulse creation:', err))
        } else {
          console.warn('Skipping pulse creation log: missing pulse ID')
        }

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
      const pulseSnapshot = await getPulseSnapshot(pulseId)

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

      const snapshotType = pulseSnapshot?.type ?? type
      const snapshotName = pulseSnapshot?.title ?? ''

      // Log pulse deletion activity
      logPulseActivity({
        variables: {
          input: {
            action: 'deleted',
            pulseId,
            pulseType:
              snapshotType.charAt(0).toUpperCase() +
              snapshotType.slice(1) +
              'Pulse',
            pulseName: snapshotName,
            contextId: fieldId,
          },
        },
      }).catch((err) => console.warn('Failed to log pulse deletion:', err))
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
      <NvlCanvas
        nodes={nvlNodes}
        relationships={nvlRelationships}
        isLoading={isPulsesLoading}
        layout="forceDirected"
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
        enableZoomControls={true}
        showBackgroundDecor={true}
        emptyState={
          <div className="flex flex-col items-center gap-6 max-w-md px-6 text-center">
            <div className="size-20 md:size-24 rounded-full flex items-center justify-center bg-gp-primary/10 dark:bg-gp-primary/20">
              <span className="material-symbols-outlined text-gp-primary dark:text-gp-primary text-5xl md:text-6xl">
                spa
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-gp-ink-strong dark:text-gp-ink-strong">
                No Pulses Yet
              </h3>
              <p className="text-sm md:text-base text-gp-ink-muted dark:text-gp-ink-soft">
                Pulses represent your goals, resources, and stories. Create your
                first pulse to begin discovering resonances.
              </p>
            </div>
          </div>
        }
        actionButton={
          isMounted && (
            <div className="group flex flex-row items-center gap-3 relative z-50 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsResonanceLinkModalOpen(true)
                }}
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
                onClick={(e) => {
                  e.stopPropagation()
                  setIsModalOpen(true)
                }}
                data-tour="create-pulse-button"
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
      />

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

      <div data-tour="resonance-panel">
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
      </div>

      {/* Offering Modal for creating new pulses */}
      <OfferingModal
        isOpen={isModalOpen && !editingPulseId}
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

      {/* Pulse Edit Modal for editing existing pulses */}
      {editingPulseId && editingPulseData && (
        <PulseEditModal
          isOpen={isModalOpen && !!editingPulseId}
          onClose={() => {
            setIsModalOpen(false)
            setSubmitError(null)
            setEditingPulseId(null)
            setEditingPulseData(null)
          }}
          onSubmit={(type: NodeType, name: string, content: string) => {
            handleOfferingSubmit(content, type, name)
          }}
          isLoading={isSubmitting}
          initialType={editingPulseData.type}
          initialName={editingPulseData.name}
          initialContent={editingPulseData.content}
          error={submitError}
          onDelete={async () => {
            await handleDeletePulse(
              new MouseEvent('click') as unknown as React.MouseEvent,
              editingPulseId,
              editingPulseData.type
            )
            setIsModalOpen(false)
            setEditingPulseId(null)
            setEditingPulseData(null)
          }}
        />
      )}

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
    </div>
  )
}

export default FieldDetailPage
