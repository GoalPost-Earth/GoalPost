'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { Node } from '@neo4j-nvl/base'
import {
  useLazyQuery,
  useMutation,
  useQuery,
  useApolloClient,
} from '@apollo/client/react'
import { useParams } from 'next/navigation'
import type { NodeType } from '@/components/ui/pulse-node'
import { NvlCanvas } from '@/components/canvas/nvl-canvas'
import { PulseNode } from '@/components/ui/pulse-node'
import { PersonNode } from '@/components/ui/person-node'
import { ResonanceNode } from '@/components/ui/resonance-node'
import {
  createNvlNodes,
  createNvlRelationships,
  renderReactComponentToContainer,
} from '@/lib/nvl-utils'
import { ResonanceLinksVisualization } from '@/components/canvas/resonance-links-visualization'
import { PersonConnectionLines } from '@/components/canvas/person-connection-lines'
import { OfferingModal } from '@/components/ui/offering-modal'
import { OfferingInput } from '@/components/ui/offering-input'
import { PulseEditModal } from '@/components/ui/pulse-edit-modal'
import { PulsePanel, type PulseDetails } from '@/components/ui/pulse-panel'
import { ResonancePanel } from '@/components/ui/resonance-panel'
import { ConnectionPanel } from '@/components/ui/connection-panel'
import { PersonPanel } from '@/components/ui/person-panel'
import {
  ResonanceLinkModal,
  type PulseOption,
} from '@/components/ui/resonance-link-modal'
import { GET_PULSE_DETAILS, GET_PULSES_BY_CONTEXT } from '@/app/graphql/queries'
import {
  GET_WE_SPACE_MEMBERS_WITH_CONNECTIONS_QUERY,
  GET_PERSON_CONNECTIONS,
} from '@/app/graphql/queries/SPACE_QUERIES'
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
  const [pulseOptions, setPulseOptions] = useState<PulseOption[]>([])
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resonanceLinks, setResonanceLinks] = useState<any[]>([])
  const [activeResonanceNodeId, setActiveResonanceNodeId] = useState<
    string | null
  >(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
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
  const [isConnectionPanelOpen, setIsConnectionPanelOpen] = useState(false)
  const [isPersonPanelOpen, setIsPersonPanelOpen] = useState(false)
  const [activePersonIds, setActivePersonIds] = useState<Set<string>>(new Set())
  const [selectedPerson, setSelectedPerson] = useState<{
    id: string
    firstName: string
    lastName: string
    name: string | null
    email: string | null
    photo: string | null
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
  } | null>(null)
  const [selectedConnection, setSelectedConnection] = useState<{
    person1: {
      id: string
      firstName: string
      lastName: string
      name: string | null
      email: string | null
      photo: string | null
      role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
    }
    person2: {
      id: string
      firstName: string
      lastName: string
      name: string | null
      email: string | null
      photo: string | null
      role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
    }
    why?: string | null
    interests?: string | null
  } | null>(null)

  const params = useParams()
  const fieldId = (params?.field as string) || undefined
  const spaceId = (params?.id as string) || undefined
  const { user } = useApp()
  const { setPageTitle } = usePageContext()
  const { resonanceLinkageEnabled } = usePreferences()
  const apolloClient = useApolloClient()

  // Resonance discovery hooks - provide empty string as fallback for SSR safety
  const { triggerDiscovery, isLoading: isDiscoveringResonances } =
    useResonanceDiscovery({
      spaceId: spaceId || '',
      onSuccess: () => {
        setIsDiscoverSuggestionsModalOpen(true)
        refetchSuggestions?.()
      },
    })

  const {
    suggestions,
    loading: suggestionsLoading,
    refetch: refetchSuggestions,
    acceptSuggestion,
    declineSuggestion,
  } = useResonanceSuggestions({
    spaceId: spaceId || '',
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
      variables: { contextId: fieldId || '' },
      skip: !fieldId,
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: membersData, loading: isMembersLoading } = useQuery(
    GET_WE_SPACE_MEMBERS_WITH_CONNECTIONS_QUERY,
    {
      variables: { spaceId: spaceId || '' },
      skip: !spaceId,
    }
  )

  // Lazy query to fetch person connections separately
  const [fetchPersonConnections, { data: connectionsData }] = useLazyQuery(
    GET_PERSON_CONNECTIONS
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

  // Compute person connections for visualization
  const personConnections = useMemo(() => {
    if (!membersData || !connectionsData) {
      console.log(
        '⏳ Waiting for data - membersData:',
        !!membersData,
        'connectionsData:',
        !!connectionsData
      )
      return []
    }

    const space = membersData.weSpaces?.[0]
    if (!space) return []

    // Create a map of person ID to their connections
    const connectionsMap = new Map<string, string[]>()
    connectionsData.people?.forEach(
      (person: { id: string; connections?: Array<{ id: string }> }) => {
        if (person.connections) {
          connectionsMap.set(
            person.id,
            person.connections.map((c) => c.id)
          )
        }
      }
    )

    const connections: Array<{
      personId: string
      connectedPersonIds: string[]
    }> = []

    // GraphQL returns owner as array, take first element
    const owner = space.owner?.[0]
    if (owner) {
      connections.push({
        personId: owner.id,
        connectedPersonIds: connectionsMap.get(owner.id) || [],
      })
    }

    // For members
    if (space.members) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      space.members.forEach((membership: any) => {
        if (membership.member) {
          connections.push({
            personId: membership.member.id,
            connectedPersonIds: connectionsMap.get(membership.member.id) || [],
          })
        }
      })
    }

    console.log(
      '🔗 Person connections computed:',
      connections.length,
      'connections'
    )
    connections.forEach((c) => {
      if (c.connectedPersonIds.length > 0) {
        console.log(`  ${c.personId} -> [${c.connectedPersonIds.join(', ')}]`)
      }
    })

    return connections
  }, [membersData, connectionsData])

  // Process members data when it changes
  useEffect(() => {
    if (!membersData) return

    try {
      const space = membersData.weSpaces?.[0]
      if (!space) {
        console.log('🔍 No space found in membersData')
        return
      }
      console.log(
        '👥 Processing space members:',
        space.id,
        'Owner:',
        space.owner,
        'Members:',
        space.members?.length
      )

      // Collect all persons (owner + members)
      const allPersons: Array<{
        id: string
        firstName: string
        lastName: string
        name: string | null
        email: string | null
        photo: string | null
        role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
      }> = []

      // Add owner (GraphQL returns array, take first element)
      const owner = space.owner?.[0]
      const ownerId = owner?.id
      if (owner) {
        allPersons.push({
          id: owner.id,
          firstName: owner.firstName,
          lastName: owner.lastName,
          name: owner.name,
          email: owner.email ?? null,
          photo: owner.photo ?? null,
          role: 'OWNER' as const,
        })
      }

      // Add members (skip if they're also the owner)
      if (space.members) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        space.members.forEach((membership: any) => {
          const memberData = membership.member?.[0] // Extract first element from array
          if (memberData && memberData.id !== ownerId) {
            allPersons.push({
              id: memberData.id,
              firstName: memberData.firstName,
              lastName: memberData.lastName,
              name: memberData.name,
              email: memberData.email ?? null,
              photo: memberData.photo ?? null,
              role: membership.role || 'MEMBER',
            })
          }
        })
      }

      console.log(
        '✅ Total persons collected:',
        allPersons.length,
        allPersons.map((p) => `${p.firstName} ${p.lastName} (${p.role})`)
      )
    } catch (error) {
      console.error('Error processing members data:', error)
    }
  }, [membersData])

  // Fetch person connections when members data is available
  useEffect(() => {
    if (!membersData) return

    const space = membersData.weSpaces?.[0]
    if (!space) return

    // Collect all person IDs from owner and members
    const personIds: string[] = []

    const owner = space.owner?.[0]
    if (owner) {
      personIds.push(owner.id)
    }

    if (space.members) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      space.members.forEach((membership: any) => {
        const memberData = membership.member?.[0] // Extract first element from array
        if (memberData?.id) {
          personIds.push(memberData.id)
        }
      })
    }

    // Only fetch if we have person IDs
    if (personIds.length > 0) {
      fetchPersonConnections({
        variables: { personIds },
      })
    }
  }, [membersData, fetchPersonConnections])

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

  // Handle node click - use callback from NVL
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      // Check if it's a resonance node (resonance links have their own IDs)
      const resonance = resonanceLinks.find((link) => link.id === nodeId)
      if (resonance) {
        // Close all other panels
        setIsPulsePanelOpen(false)
        setIsPersonPanelOpen(false)
        setIsConnectionPanelOpen(false)

        setActiveResonanceNodeId(nodeId)
        setSelectedResonance(resonance)
        setIsResonancePanelOpen(true)
        return
      }

      // Check if it's a pulse node
      const pulse = pulseOptions.find((p) => p.id === nodeId)
      if (pulse) {
        // Close all other panels
        setIsResonancePanelOpen(false)
        setIsPersonPanelOpen(false)
        setIsConnectionPanelOpen(false)

        setIsPulsePanelOpen(true)
        fetchPulseDetails({ variables: { pulseId: nodeId } })
        return
      }

      // Check if it's a person node (starts with 'person_' or is in personPositions)
      const isPerson = pulseOptions.every((p) => p.id !== nodeId)
      if (isPerson) {
        // Close all other panels
        setIsPulsePanelOpen(false)
        setIsResonancePanelOpen(false)
        setIsConnectionPanelOpen(false)

        // Update person panel (will be populated from membersData)
        setActivePersonIds(new Set([nodeId]))
        setIsPersonPanelOpen(true)
      }
    },
    [pulseOptions, resonanceLinks, fetchPulseDetails]
  )

  // Handle node hover - receives full Node object from NVL
  const handleNodeHover = useCallback((node: any) => {
    // Extract node ID from the Node object if it exists
    if (node && typeof node === 'object' && 'id' in node) {
      setHoveredNodeId(node.id as string)
    } else if (node === null) {
      setHoveredNodeId(null)
    }
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

  // Handle connection midpoint click - toggle panel open/close
  const handleConnectionClick = useCallback(
    (person1Id: string, person2Id: string) => {
      // If a connection panel is already open
      if (isConnectionPanelOpen && selectedConnection) {
        // Check if it's the same connection being clicked
        if (
          (selectedConnection.person1.id === person1Id &&
            selectedConnection.person2.id === person2Id) ||
          (selectedConnection.person1.id === person2Id &&
            selectedConnection.person2.id === person1Id)
        ) {
          // Same connection clicked again - close panel and hide lines
          setIsConnectionPanelOpen(false)
          setSelectedConnection(null)
          setActivePersonIds((prev) => {
            const newIds = new Set(prev)
            newIds.delete(person1Id)
            newIds.delete(person2Id)
            return newIds
          })
          return
        }
      }

      // Find their connection info from personConnections (check both directions)
      const connectionExists =
        personConnections.some(
          (pc) =>
            pc.personId === person1Id &&
            pc.connectedPersonIds.includes(person2Id)
        ) ||
        personConnections.some(
          (pc) =>
            pc.personId === person2Id &&
            pc.connectedPersonIds.includes(person1Id)
        )

      if (!connectionExists) return

      // Get space data to find person details
      const space = membersData?.weSpaces?.[0]
      if (!space) return

      // Helper function to find person data from membersData
      const findPersonById = (id: string) => {
        const owner = space.owner?.[0]
        if (owner?.id === id) {
          return {
            id: owner.id,
            firstName: owner.firstName,
            lastName: owner.lastName,
            name: owner.name,
            email: owner.email ?? null,
            photo: owner.photo ?? null,
            role: 'OWNER' as const,
          }
        }

        if (space.members) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const membership of space.members) {
            const member = membership.member?.[0]
            if (member?.id === id) {
              return {
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                name: member.name,
                email: member.email ?? null,
                photo: member.photo ?? null,
                role: membership.role || 'MEMBER',
              }
            }
          }
        }
        return null
      }

      const person1 = findPersonById(person1Id)
      const person2 = findPersonById(person2Id)

      if (!person1 || !person2) return

      // Close all other panels
      setIsPulsePanelOpen(false)
      setIsResonancePanelOpen(false)
      if (isPersonPanelOpen) {
        setIsPersonPanelOpen(false)
      }

      setSelectedConnection({
        person1,
        person2,
      })
      setIsConnectionPanelOpen(true)

      // Ensure both persons are in active set to show their connections
      setActivePersonIds((prev) => new Set([...prev, person1Id, person2Id]))
    },
    [
      personConnections,
      membersData,
      isConnectionPanelOpen,
      selectedConnection,
      isPersonPanelOpen,
    ]
  )

  // Handle viewing a specific connection from the person panel
  const handleViewConnectionFromPanel = useCallback(
    (connectedPersonId: string) => {
      if (!selectedPerson) return

      // Close person panel
      setIsPersonPanelOpen(false)

      // Open connection panel between selected person and the clicked connection
      handleConnectionClick(selectedPerson.id, connectedPersonId)
    },
    [selectedPerson, handleConnectionClick]
  )

  // Convert pulse options to NVL nodes with React components
  const nvlPulseNodes: Node[] = useMemo(() => {
    return createNvlNodes(
      pulseOptions.map((p) => ({
        id: p.id,
        title: p.title || 'Untitled',
        type: p.type,
      }))
    )
  }, [pulseOptions])

  // Convert relationships to NVL format
  const nvlRelationships = useMemo(() => {
    const rels = resonanceLinks.map((link) => {
      const sourceId = link.source?.[0]?.id
      const targetId = link.target?.[0]?.id
      return {
        id: link.id,
        from: sourceId,
        to: targetId,
        label: link.label || 'Resonates',
      }
    })
    return createNvlRelationships(rels.filter((r) => r.from && r.to))
  }, [resonanceLinks])

  // Render PulseNode components into their containers
  useEffect(() => {
    pulseOptions.forEach((pulse) => {
      const container = document.getElementById(`node-${pulse.id}`)
      if (container) {
        renderReactComponentToContainer(
          <PulseNode
            label={pulse.title || 'Untitled Pulse'}
            type={pulse.type as NodeType}
            animation="float"
            isSelected={pulse.id === activeResonanceNodeId}
            isHovered={pulse.id === hoveredNodeId}
            onClick={() => handleNodeClick(pulse.id)}
            onEditClick={(e) => {
              handleEditPulse(
                e,
                pulse.id,
                pulse.type as NodeType,
                pulse.title || '',
                pulse.title || '',
                pulse.content || ''
              )
            }}
          />,
          container
        )
      }
    })
  }, [
    pulseOptions,
    activeResonanceNodeId,
    hoveredNodeId,
    handleNodeClick,
    handleEditPulse,
  ])

  return (
    <div className="relative overflow-hidden">
      <NvlCanvas
        nodes={nvlPulseNodes}
        relationships={nvlRelationships}
        layout="forceDirected"
        minZoom={0.1}
        maxZoom={3}
        onNodeClick={(node) => handleNodeClick(node.id)}
        onNodeHover={(node) => handleNodeHover(node)}
        onBackgroundClick={() => {
          setIsPulsePanelOpen(false)
          setIsResonancePanelOpen(false)
          setIsPersonPanelOpen(false)
          setIsConnectionPanelOpen(false)
          setActiveResonanceNodeId(null)
          setSelectedPerson(null)
          setSelectedConnection(null)
          setActivePersonIds(new Set())
        }}
        actionButton={
          isMounted && (
            <div className="group flex flex-row items-center gap-3 relative z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  triggerDiscovery()
                }}
                disabled={isDiscoveringResonances || !spaceId}
                title={!spaceId ? 'Space ID required' : 'Discover Resonances'}
                className="cursor-pointer relative flex items-center justify-center size-16 rounded-full gp-glass dark:gp-glass shadow-lg hover:shadow-[0_0_35px_color-mix(in_srgb,var(--gp-accent-glow)_45%,transparent)] transition-all duration-500 ease-out border border-gp-glass-border hover:border-gp-accent-glow/40 backdrop-blur-md group-hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-3xl text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-accent-glow transition-colors duration-500">
                  auto_awesome
                </span>
                <div className="absolute inset-0 rounded-full border border-gp-glass-border opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
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

      <ConnectionPanel
        isOpen={isConnectionPanelOpen}
        onClose={() => {
          // Remove both persons from active set to hide their connections
          if (selectedConnection) {
            setActivePersonIds((prev) => {
              const newIds = new Set(prev)
              newIds.delete(selectedConnection.person1.id)
              newIds.delete(selectedConnection.person2.id)
              return newIds
            })
          }
          setIsConnectionPanelOpen(false)
          setSelectedConnection(null)
        }}
        connection={selectedConnection}
      />

      <PersonPanel
        isOpen={isPersonPanelOpen}
        onClose={() => {
          setIsPersonPanelOpen(false)
          setSelectedPerson((prev) => {
            if (prev) {
              setActivePersonIds((ids) => {
                const newIds = new Set(ids)
                newIds.delete(prev.id)
                return newIds
              })
            }
            return null
          })
        }}
        person={selectedPerson}
        connectedPersons={
          selectedPerson && membersData
            ? (() => {
                const space = membersData.weSpaces?.[0]
                if (!space) return []

                // Helper to find person by ID in membersData
                const findPersonById = (id: string) => {
                  const owner = space.owner?.[0]
                  if (owner?.id === id) {
                    return {
                      id: owner.id,
                      firstName: owner.firstName,
                      lastName: owner.lastName,
                      name: owner.name,
                      photo: owner.photo,
                      role: 'OWNER' as const,
                    }
                  }

                  if (space.members) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    for (const membership of space.members) {
                      const member = membership.member?.[0]
                      if (member?.id === id) {
                        return {
                          id: member.id,
                          firstName: member.firstName,
                          lastName: member.lastName,
                          name: member.name,
                          photo: member.photo,
                          role: membership.role || 'MEMBER',
                        }
                      }
                    }
                  }
                  return null
                }

                const connectedIds = new Set<string>()

                // Find direct connections (where selectedPerson is the source)
                const directConnection = personConnections.find(
                  (pc) => pc.personId === selectedPerson.id
                )
                if (directConnection) {
                  directConnection.connectedPersonIds.forEach((id) =>
                    connectedIds.add(id)
                  )
                }

                // Find reverse connections (where selectedPerson is the target)
                personConnections.forEach((pc) => {
                  if (pc.connectedPersonIds.includes(selectedPerson.id)) {
                    connectedIds.add(pc.personId)
                  }
                })

                // Map to full person objects
                return Array.from(connectedIds)
                  .map((connectedId) => findPersonById(connectedId))
                  .filter((p): p is NonNullable<typeof p> => p !== null)
              })()
            : []
        }
        onConnectionClick={handleViewConnectionFromPanel}
      />

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

      {isMounted && spaceId && (
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
      )}
    </div>
  )
}

export default FieldDetailPage
