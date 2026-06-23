'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  useLazyQuery,
  useMutation,
  useQuery,
  useApolloClient,
} from '@apollo/client/react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import type { Node, Relationship } from '@neo4j-nvl/base'
import type { NodeType } from '@/components/ui/pulse-node'
import { PulseNode } from '@/components/ui/pulse-node'
import { ResonanceNode } from '@/components/ui/resonance-node'
import { PersonNode } from '@/components/ui/person-node'
import { NvlCanvas } from '@/components/canvas/nvl-canvas'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { FieldContextSections } from '@/components/fields/field-context-sections'
import { createNvlNode, renderReactComponentToContainer } from '@/lib/nvl-utils'
import { formatResonanceLabel } from '@/utils/graph-utils'
import { OfferingModal } from '@/components/ui/offering-modal'
import { OfferingInput } from '@/components/ui/offering-input'
import { PulseEditModal } from '@/components/ui/pulse-edit-modal'
import { PulsePanel, type PulseDetails } from '@/components/ui/pulse-panel'
import { PersonPanel } from '@/components/ui/person-panel'
import { resolveRelationshipWhy } from '@/lib/people/resolve-relationship-why'
import {
  AddPersonToFieldModal,
  type CreateFieldPersonInput,
} from '@/components/ui/add-person-to-field-modal'
import {
  BulkPulseShareModal,
  type BulkPulseOperationDetails,
} from '@/components/ui/bulk-pulse-share-modal'
import { ResonancePanel } from '@/components/ui/resonance-panel'
import {
  ResonanceLinkModal,
  type PulseOption,
} from '@/components/ui/resonance-link-modal'
import { SpaceViewToggle } from '@/components/spaces'
import type { SpaceViewMode } from '@/components/spaces'
import {
  GET_PULSE_DETAILS,
  GET_PULSES_BY_CONTEXT,
  GET_FIELD_CONTEXT_PEOPLE,
} from '@/app/graphql/queries'
import {
  ADD_PERSON_TO_FIELD_CONTEXT_MUTATION,
  REMOVE_PERSON_FROM_FIELD_CONTEXT_MUTATION,
  CREATE_PEOPLE_MUTATION,
  CREATE_RESONANCE_LINK_MUTATION,
  UPDATE_RESONANCE_LINK_MUTATION,
  DELETE_RESONANCE_LINK_MUTATION,
  CREATE_GOAL_PULSE_MUTATION,
  CREATE_RESOURCE_PULSE_MUTATION,
  CREATE_STORY_PULSE_MUTATION,
  CREATE_CARE_PULSE_MUTATION,
  CREATE_CORE_VALUE_PULSE_MUTATION,
  UPDATE_GOAL_PULSE_MUTATION,
  UPDATE_RESOURCE_PULSE_MUTATION,
  UPDATE_STORY_PULSE_MUTATION,
  UPDATE_CARE_PULSE_MUTATION,
  UPDATE_CORE_VALUE_PULSE_MUTATION,
  DELETE_GOAL_PULSE_MUTATION,
  DELETE_RESOURCE_PULSE_MUTATION,
  DELETE_STORY_PULSE_MUTATION,
  DELETE_CARE_PULSE_MUTATION,
  DELETE_CORE_VALUE_PULSE_MUTATION,
  DELETE_RESONANCES_BY_PULSE_MUTATION,
  LOG_PULSE_ACTIVITY,
  LOG_RESONANCE_ACTIVITY,
} from '@/app/graphql/mutations'
import { useApp, useFocalEntity, usePageContext } from '@/contexts'
import { onOpenAddPulseModal } from '@/lib/simulation/pulse-creation-events'
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

type FieldContextPeopleResult = {
  fieldContexts?: Array<{
    id: string
    people?: Array<{
      id: string
      firstName?: string | null
      lastName?: string | null
      name?: string | null
      email?: string | null
      photo?: string | null
      description?: string | null
      connectionEdges?: Array<{
        connectedPersonId?: string | null
        why?: string | null
      }> | null
    }>
    meSpace?: Array<{
      owner?: Array<{ id: string }>
      members?: Array<{
        role?: 'ADMIN' | 'MEMBER' | 'GUEST' | null
        member?: Array<{ id: string }>
      }>
    }>
  }>
}

function FieldDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResonanceLinkModalOpen, setIsResonanceLinkModalOpen] =
    useState(false)
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPulseDeleteConfirm, setShowPulseDeleteConfirm] = useState(false)
  const [pulseToDelete, setPulseToDelete] = useState<{
    id: string
    type: NodeType
  } | null>(null)
  const [isAddingPersonToField, setIsAddingPersonToField] = useState(false)
  const [isRemovingPersonFromField, setIsRemovingPersonFromField] =
    useState(false)
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
  const [isPersonPanelOpen, setIsPersonPanelOpen] = useState(false)
  const [isBulkShareModalOpen, setIsBulkShareModalOpen] = useState(false)
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
  const [personData, setPersonData] = useState<
    Array<{
      personId: string
      firstName: string
      lastName: string
      name: string | null
      email: string | null
      photo: string | null
      role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' | 'PERSON'
      description: string | null
      relationshipWhy: string | null
    }>
  >([])
  const [selectedPerson, setSelectedPerson] = useState<{
    id: string
    firstName: string
    lastName: string
    name: string | null
    email: string | null
    photo: string | null
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' | 'PERSON'
    description: string | null
    relationshipWhy: string | null
  } | null>(null)
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
  const meSpaceId = params?.id as string
  const { user } = useApp()
  const { setPageTitle } = usePageContext()
  const { setFocalLabel, setFocalParents } = useFocalEntity()
  const { resonanceLinkageEnabled } = usePreferences()
  const apolloClient = useApolloClient()
  const viewParam = searchParams.get('view') as SpaceViewMode | null
  const [viewMode, setViewMode] = useState<SpaceViewMode>(
    viewParam === 'details' ? 'details' : 'graph'
  )

  const handleViewChange = useCallback(
    (view: SpaceViewMode) => {
      setViewMode(view)
      const url = new URL(window.location.href)
      if (view === 'graph') {
        url.searchParams.delete('view')
      } else {
        url.searchParams.set('view', view)
      }
      router.replace(url.pathname + url.search, { scroll: false })
    },
    [router]
  )

  // Studio-shell action bar fires this when the user clicks "Add pulse"
  // from outside this page subtree. Guard against stale listeners by
  // matching the event's fieldContextId against this page's fieldId.
  useEffect(() => {
    if (!fieldId) return
    return onOpenAddPulseModal((detail) => {
      if (detail.fieldContextId !== fieldId) return
      setIsModalOpen(true)
    })
  }, [fieldId])

  const [
    fetchPulseDetails,
    { data: pulseDetailsData, loading: pulseDetailsLoading },
  ] = useLazyQuery(GET_PULSE_DETAILS)

  const {
    data: pulsesByContextData,
    loading: isPulsesLoading,
    refetch: refetchPulsesByContext,
  } = useQuery(GET_PULSES_BY_CONTEXT, {
    variables: { contextId: fieldId },
    skip: !fieldId,
  })

  const { data: fieldPeopleData, refetch: refetchFieldPeople } =
    useQuery<FieldContextPeopleResult>(GET_FIELD_CONTEXT_PEOPLE, {
      variables: { contextId: fieldId },
      skip: !fieldId,
    })

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
  const [createCarePulse] = useMutation(CREATE_CARE_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [createCoreValuePulse] = useMutation(CREATE_CORE_VALUE_PULSE_MUTATION, {
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
  const [updateCarePulse] = useMutation(UPDATE_CARE_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
  })
  const [updateCoreValuePulse] = useMutation(UPDATE_CORE_VALUE_PULSE_MUTATION, {
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
  const [deleteCarePulse] = useMutation(DELETE_CARE_PULSE_MUTATION, {
    refetchQueries: ['GetPulsesByContext'],
    awaitRefetchQueries: true,
  })
  const [deleteCoreValuePulse] = useMutation(DELETE_CORE_VALUE_PULSE_MUTATION, {
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
  const [addPersonToFieldContext] = useMutation(
    ADD_PERSON_TO_FIELD_CONTEXT_MUTATION
  )
  const [removePersonFromFieldContext] = useMutation(
    REMOVE_PERSON_FROM_FIELD_CONTEXT_MUTATION
  )
  const [createPerson] = useMutation(CREATE_PEOPLE_MUTATION)

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

  useEffect(() => {
    const context = fieldPeopleData?.fieldContexts?.[0]
    if (!context) return

    const fieldPeople = (context.people || []) as Array<{
      id: string
      firstName?: string | null
      lastName?: string | null
      name?: string | null
      email?: string | null
      photo?: string | null
      description?: string | null
      connectionEdges?: Array<{
        connectedPersonId?: string | null
        why?: string | null
      }> | null
    }>

    type FieldMembership = {
      role?: 'ADMIN' | 'MEMBER' | 'GUEST' | null
      member?: Array<{ id: string }>
    }

    const meSpace = context.meSpace?.[0]
    const ownerId = meSpace?.owner?.[0]?.id
    const roleById = new Map<
      string,
      'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' | 'PERSON'
    >()

    if (ownerId) {
      roleById.set(ownerId, 'OWNER')
    }

    ;(meSpace?.members as FieldMembership[] | undefined)?.forEach(
      (membership) => {
        const member = membership.member?.[0]
        if (member?.id) {
          const role = (membership.role || 'MEMBER') as
            | 'ADMIN'
            | 'MEMBER'
            | 'GUEST'
          roleById.set(member.id, role)
        }
      }
    )

    const normalizedPeople = fieldPeople.map((person) => ({
      personId: person.id,
      firstName: person.firstName || '',
      lastName: person.lastName || '',
      name: person.name || null,
      email: person.email || null,
      photo: person.photo || null,
      role: roleById.get(person.id) || ('PERSON' as const),
      description: person.description || null,
      relationshipWhy: resolveRelationshipWhy(
        person.connectionEdges,
        user?.id
      ),
    }))

    setPersonData(normalizedPeople)
  }, [fieldPeopleData, user?.id])

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

    // Create person nodes
    personData.forEach((person) => {
      nodes.push(
        createNvlNode(
          {
            id: `person-${person.personId}`,
            personId: person.personId,
            type: 'person',
            firstName: person.firstName,
            lastName: person.lastName,
            name: person.name,
            email: person.email,
            photo: person.photo,
            role: person.role,
          },
          80
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
  }, [pulseData, resonanceLinks, personData])

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
      } else if (nodeType === 'person') {
        const person = personData.find(
          (p) => p.personId === (node as any).personId
        )
        if (person) {
          renderReactComponentToContainer(
            <PersonNode
              id={person.personId}
              firstName={person.firstName}
              lastName={person.lastName}
              name={person.name}
              email={person.email}
              photo={person.photo}
              role={person.role}
              animation="none"
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
    personData,
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
        setIsPersonPanelOpen(false)
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
          setIsPersonPanelOpen(false)
        }
      } else if (nodeType === 'person') {
        const personId = (node as any).personId
        const person = personData.find((p) => p.personId === personId)

        if (person) {
          setSelectedNodeId(node.id)
          setSelectedPerson({
            id: person.personId,
            firstName: person.firstName,
            lastName: person.lastName,
            name: person.name,
            email: person.email,
            photo: person.photo,
            role: person.role,
            description: person.description,
            relationshipWhy: person.relationshipWhy,
          })
          setIsPersonPanelOpen(true)
          setIsPulsePanelOpen(false)
          setIsResonancePanelOpen(false)
        }
      }
    },
    [personData, resonanceLinks, fetchPulseDetails]
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
    setIsPersonPanelOpen(false)
    setActiveResonanceNodeId(null)
    setSelectedResonance(null)
    setSelectedPerson(null)
  }, [])

  const handleAddPersonToField = useCallback(
    async (input: CreateFieldPersonInput) => {
      setIsAddingPersonToField(true)
      try {
        const personInput = {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          pronouns: input.pronouns,
          location: input.location,
          photo: input.photo,
          avatar: input.avatar,
          status: input.status,
          gender: input.gender,
          careManual: input.careManual,
          favorites: input.favorites,
          passions: input.passions,
          traits: input.traits,
          fieldsOfCare: input.fieldsOfCare,
          interests: input.interests,
        }

        const { data } = await createPerson({
          variables: {
            input: [
              {
                ...personInput,
                createdBy: user?.id
                  ? {
                      connect: [{ where: { node: { id_EQ: user.id } } }],
                    }
                  : undefined,
              },
            ],
          },
        })

        const personId = data?.createPeople?.people?.[0]?.id
        if (!personId) {
          throw new Error('Person creation failed')
        }

        await addPersonToFieldContext({
          variables: {
            contextId: fieldId,
            personId,
          },
        })
        await refetchFieldPeople()
        setIsAddPersonModalOpen(false)
      } finally {
        setIsAddingPersonToField(false)
      }
    },
    [
      addPersonToFieldContext,
      createPerson,
      fieldId,
      refetchFieldPeople,
      user?.id,
    ]
  )

  const handleRemovePersonFromField = useCallback(
    async (personId: string) => {
      if (!fieldId) return

      setIsRemovingPersonFromField(true)
      try {
        await removePersonFromFieldContext({
          variables: {
            contextId: fieldId,
            personId,
          },
        })

        setIsPersonPanelOpen(false)
        setSelectedPerson(null)

        await refetchFieldPeople()
      } finally {
        setIsRemovingPersonFromField(false)
      }
    },
    [fieldId, removePersonFromFieldContext, refetchFieldPeople]
  )

  const pulseDetails: PulseDetails | null = useMemo(() => {
    const goal = pulseDetailsData?.goalPulses?.[0]
    const resource = pulseDetailsData?.resourcePulses?.[0]
    const story = pulseDetailsData?.storyPulses?.[0]
    const care = pulseDetailsData?.carePulses?.[0]
    const coreValue = pulseDetailsData?.coreValuePulses?.[0]
    const entry = goal ?? resource ?? story ?? care ?? coreValue

    if (!entry) return null

    const type = goal
      ? 'goal'
      : resource
        ? 'resource'
        : story
          ? 'story'
          : care
            ? 'care'
            : 'coreValue'

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
      // Prefer the canonical `initiatedBy` edge; fall back to the legacy
      // `createdBy` alias for any pulse that only carries the older edge.
      createdBy: (
        (entry.initiatedBy?.length ? entry.initiatedBy : entry.createdBy) ?? []
      ).map((initiator) => ({
        id: initiator.id ?? initiator.name ?? 'unknown',
        name: initiator.name ?? 'Unknown',
        email:
          'email' in initiator ? (initiator.email ?? undefined) : undefined,
        kind: 'person' as const,
      })),
      contexts:
        entry.context?.map((ctx) => ({
          id: ctx.id,
          title: ctx.title ?? 'Untitled Context',
        })) ?? [],
    }
  }, [pulseDetailsData])

  const fieldContext = useMemo(
    () =>
      pulsesByContextData?.fieldContexts?.[0] as
        | {
            title?: string | null
            emergentName?: string | null
            createdAt?: string | null
            space?: Array<{
              __typename?: string | null
              name?: string | null
              visibility?: string | null
            }> | null
          }
        | undefined,
    [pulsesByContextData]
  )

  const createdDate = fieldContext?.createdAt
    ? new Date(fieldContext.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown'

  // Supply the FieldContext label + parent MeSpace to the breadcrumb /
  // assistant primitives.
  const fieldContextTitle = fieldContext?.title ?? null
  const fieldContextSpaceName = fieldContext?.space?.[0]?.name ?? null
  useEffect(() => {
    if (!fieldId) return
    if (fieldContextTitle) {
      setFocalLabel(fieldId, fieldContextTitle, 'FieldContext')
    }
    if (meSpaceId && fieldContextSpaceName) {
      setFocalParents(fieldId, [
        { type: 'MeSpace', id: meSpaceId, label: fieldContextSpaceName },
      ])
    }
  }, [
    fieldId,
    fieldContextTitle,
    meSpaceId,
    fieldContextSpaceName,
    setFocalLabel,
    setFocalParents,
  ])

  const handlePulseDetailsOpen = useCallback(
    (pulseId: string) => {
      setSelectedNodeId(`pulse-${pulseId}`)
      setIsPulsePanelOpen(true)
      setIsResonancePanelOpen(false)
      fetchPulseDetails({ variables: { pulseId } })
    },
    [fetchPulseDetails]
  )

  const handleResonanceDetailsOpen = useCallback(
    (resonanceId: string) => {
      const resonance = resonanceLinks.find(
        (link: any) => link.id === resonanceId
      )
      if (!resonance) return

      setSelectedNodeId(`resonance-${resonanceId}`)
      setActiveResonanceNodeId(resonanceId)
      setSelectedResonance(resonance)
      setIsResonancePanelOpen(true)
      setIsPulsePanelOpen(false)
    },
    [resonanceLinks]
  )

  const getPulseSnapshot = useCallback(
    async (pulseId: string) => {
      try {
        const result = await fetchPulseDetails({ variables: { pulseId } })
        const data = result.data as typeof pulseDetailsData
        const goal = data?.goalPulses?.[0]
        const resource = data?.resourcePulses?.[0]
        const story = data?.storyPulses?.[0]
        const care = data?.carePulses?.[0]
        const coreValue = data?.coreValuePulses?.[0]
        const entry = goal ?? resource ?? story ?? care ?? coreValue

        if (!entry) return null

        const type = goal
          ? 'goal'
          : resource
            ? 'resource'
            : story
              ? 'story'
              : care
                ? 'care'
                : ('coreValue' as const)

        return {
          id: entry.id,
          type,
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
          care: 'care',
          coreValue: 'coreValue',
        } as const

        const pulseType =
          pulseTypeMap[type as keyof typeof pulseTypeMap] || 'goal'

        // Call appropriate update mutation based on type
        const editUpdate = {
          where: { id_EQ: editingPulseId },
          update: {
            title_SET: name,
            content_SET: value,
          },
        }
        if (pulseType === 'goal') {
          await updateGoalPulse({ variables: editUpdate })
        } else if (pulseType === 'resource') {
          await updateResourcePulse({ variables: editUpdate })
        } else if (pulseType === 'care') {
          await updateCarePulse({ variables: editUpdate })
        } else if (pulseType === 'coreValue') {
          await updateCoreValuePulse({ variables: editUpdate })
        } else {
          await updateStoryPulse({ variables: editUpdate })
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
          care: 'care',
          coreValue: 'coreValue',
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
        } else if (pulseType === 'care') {
          const { data: response } = await createCarePulse({
            variables: {
              input: [baseInput],
            },
          })
          createdPulseId = response?.createCarePulses?.carePulses?.[0]?.id
        } else if (pulseType === 'coreValue') {
          const { data: response } = await createCoreValuePulse({
            variables: {
              input: [baseInput],
            },
          })
          createdPulseId =
            response?.createCoreValuePulses?.coreValuePulses?.[0]?.id
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
    type: NodeType,
    skipConfirm = false
  ) => {
    e.stopPropagation()

    // Gate destructive deletes behind a confirmation modal (GOAL-253). The
    // edit composer confirms internally and calls with skipConfirm=true.
    if (!skipConfirm) {
      setPulseToDelete({ id: pulseId, type })
      setShowPulseDeleteConfirm(true)
      return
    }

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
      } else if (type === 'care') {
        await deleteCarePulse({
          variables: {
            where: { id_EQ: pulseId },
          },
        })
      } else if (type === 'coreValue') {
        await deleteCoreValuePulse({
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

      setShowPulseDeleteConfirm(false)
      setPulseToDelete(null)
    } catch (error) {
      console.error('❌ Error deleting pulse:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to delete pulse'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDeletePulse = async () => {
    if (!pulseToDelete) return
    await handleDeletePulse(
      new MouseEvent('click') as unknown as React.MouseEvent,
      pulseToDelete.id,
      pulseToDelete.type,
      true
    )
  }

  return (
    <>
      {viewMode === 'details' ? (
        <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20">
          <ProfileBackground />
          <main className="relative">
            <ProfileLayout>
              <div className="flex justify-end mb-6">
                <SpaceViewToggle
                  activeView={viewMode}
                  onViewChange={handleViewChange}
                />
              </div>

              <div className="flex flex-col items-center text-center mb-12">
                <span className="text-[9px] uppercase font-semibold text-gp-primary mb-2">
                  {fieldContext?.space?.[0]?.__typename || 'Space'} •{' '}
                  {fieldContext?.space?.[0]?.name || 'Unknown space'}
                </span>
                <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
                  {fieldContext?.title || 'Field Context'}
                </h1>
                {fieldContext?.emergentName && (
                  <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft italic mb-2">
                    &quot;{fieldContext.emergentName}&quot;
                  </p>
                )}
                <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                  Created {createdDate}
                </p>
              </div>

              <FieldContextSections
                createdDate={createdDate}
                pulses={[
                  ...(pulsesByContextData?.goalPulses || []),
                  ...(pulsesByContextData?.resourcePulses || []),
                  ...(pulsesByContextData?.storyPulses || []),
                  ...(pulsesByContextData?.carePulses || []),
                  ...(pulsesByContextData?.coreValuePulses || []),
                ].sort(
                  (left, right) =>
                    new Date(right.createdAt).getTime() -
                    new Date(left.createdAt).getTime()
                )}
                resonances={resonanceLinks}
                space={fieldContext?.space?.[0]}
                people={personData.map((person) => ({
                  id: person.personId,
                  firstName: person.firstName,
                  lastName: person.lastName,
                  name: person.name,
                  email: person.email,
                  photo: person.photo,
                  role: person.role,
                }))}
                onAddPulse={() => setIsModalOpen(true)}
                onAddPerson={() => setIsAddPersonModalOpen(true)}
                onAddResonance={() => setIsResonanceLinkModalOpen(true)}
                onEditPulse={(e, pulseId, type, title, content) => {
                  handleEditPulse(e, pulseId, type, title, title, content)
                }}
                onDeletePulse={handleDeletePulse}
                onPersonClick={(personId) => {
                  const person = personData.find(
                    (entry) => entry.personId === personId
                  )
                  if (!person) return

                  setSelectedPerson({
                    id: person.personId,
                    firstName: person.firstName,
                    lastName: person.lastName,
                    name: person.name,
                    email: person.email,
                    photo: person.photo,
                    role: person.role,
                    description: person.description,
                    relationshipWhy: person.relationshipWhy,
                  })
                  setIsPersonPanelOpen(true)
                }}
                onPulseClick={(pulseId) => {
                  setSelectedNodeId(`pulse-${pulseId}`)
                  setIsPulsePanelOpen(true)
                  setIsResonancePanelOpen(false)
                  fetchPulseDetails({ variables: { pulseId } })
                }}
                onResonanceClick={(resonanceId) => {
                  const resonance = resonanceLinks.find(
                    (link: any) => link.id === resonanceId
                  )
                  if (!resonance) return

                  setSelectedNodeId(`resonance-${resonanceId}`)
                  setSelectedResonance(resonance)
                  setIsResonancePanelOpen(true)
                  setIsPulsePanelOpen(false)
                }}
              />

              <div className="flex items-center justify-center gap-6 w-full flex-wrap">
                <button
                  onClick={() => setIsAddPersonModalOpen(true)}
                  className="px-8 py-3 rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-500/50 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-500/30 dark:hover:bg-emerald-500/20 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    person_add
                  </span>
                  Add Person
                </button>
                <button
                  onClick={() => setIsBulkShareModalOpen(true)}
                  disabled={pulseData.length === 0}
                  className="px-8 py-3 rounded-full bg-blue-500/20 dark:bg-blue-500/10 border border-blue-500/50 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-500/30 dark:hover:bg-blue-500/20 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    share
                  </span>
                  Share Pulses
                </button>
              </div>
            </ProfileLayout>
          </main>
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden">
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
                    Pulses represent your goals, resources, and stories. Create
                    your first pulse to begin discovering resonances.
                  </p>
                </div>
              </div>
            }
            actionButton={
              isMounted && (
                <div className="group flex flex-row items-center gap-3 relative z-50 pointer-events-auto">
                  <SpaceViewToggle
                    activeView={viewMode}
                    onViewChange={handleViewChange}
                  />
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
                      setIsBulkShareModalOpen(true)
                    }}
                    disabled={pulseData.length === 0}
                    title={
                      pulseData.length === 0
                        ? 'No pulses available to share'
                        : 'Share Pulses'
                    }
                    className="cursor-pointer relative flex items-center justify-center size-16 rounded-full gp-glass dark:gp-glass shadow-lg hover:shadow-[0_0_35px_color-mix(in_srgb,var(--gp-accent-glow)_45%,transparent)] transition-all duration-500 ease-out border border-gp-glass-border hover:border-gp-accent-glow/40 backdrop-blur-md group-hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                  >
                    <span className="material-symbols-outlined text-3xl text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-accent-glow transition-colors duration-500">
                      share
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsAddPersonModalOpen(true)
                    }}
                    className="cursor-pointer relative flex items-center justify-center size-16 rounded-full gp-glass dark:gp-glass shadow-lg hover:shadow-[0_0_35px_color-mix(in_srgb,var(--gp-accent-glow)_45%,transparent)] transition-all duration-500 ease-out border border-gp-glass-border hover:border-gp-accent-glow/40 backdrop-blur-md group-hover:-translate-y-1"
                    title="Add Person To Field"
                  >
                    <span className="material-symbols-outlined text-3xl text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-accent-glow transition-colors duration-500">
                      person_add
                    </span>
                    <div className="absolute inset-0 rounded-full border border-gp-glass-border opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  </button>
                </div>
              )
            }
          />
        </div>
      )}

      <BulkPulseShareModal
        isOpen={isBulkShareModalOpen}
        onClose={() => setIsBulkShareModalOpen(false)}
        currentContextId={fieldId}
        pulses={pulseData}
        onOperationComplete={async ({ mode }: BulkPulseOperationDetails) => {
          await refetchPulsesByContext()
          if (mode === 'move') {
            setIsPulsePanelOpen(false)
            setSelectedNodeId(null)
          }
        }}
      />

      <PulsePanel
        isOpen={isPulsePanelOpen}
        isLoading={pulseDetailsLoading}
        pulse={pulseDetails}
        currentContextId={fieldId}
        onMoveSuccess={async () => {
          setIsPulsePanelOpen(false)
          setSelectedNodeId(null)
          await refetchPulsesByContext()
        }}
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

      <PersonPanel
        isOpen={isPersonPanelOpen}
        onClose={() => {
          setIsPersonPanelOpen(false)
          setSelectedPerson(null)
        }}
        person={selectedPerson}
        connectedPersons={[]}
        description={selectedPerson?.description ?? null}
        relationshipWhy={selectedPerson?.relationshipWhy ?? null}
        onRemoveFromField={handleRemovePersonFromField}
        isRemovingFromField={isRemovingPersonFromField}
        onPersonUpdated={() => {
          refetchFieldPeople()
        }}
      />

      {/* Offering Modal for creating new pulses */}
      <OfferingModal
        isOpen={isModalOpen && !editingPulseId}
        onClose={() => {
          setIsModalOpen(false)
          setSubmitError(null)
          setSubmitSuccess(false)
        }}
        position="center"
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
              editingPulseData.type,
              true
            )
            setIsModalOpen(false)
            setEditingPulseId(null)
            setEditingPulseData(null)
          }}
        />
      )}

      <OfferingModal
        isOpen={showPulseDeleteConfirm}
        onClose={() => {
          setShowPulseDeleteConfirm(false)
          setPulseToDelete(null)
        }}
        position="center"
        title="Delete pulse"
      >
        <div className="relative z-10 w-full">
          <div className="glass-panel rounded-3xl p-5 sm:p-8 md:p-12 border border-gp-glass-border dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl" />
                <div className="size-16 rounded-full bg-linear-to-br from-red-100 to-red-50 dark:from-red-500/20 dark:to-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center justify-center backdrop-blur-xl shadow-md dark:shadow-inner">
                  <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">
                    delete
                  </span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-light dark:font-extralight text-gp-ink-strong dark:text-white mb-2 tracking-tight leading-tight">
                Delete Pulse
              </h2>
              <p className="text-sm mb-8">
                <span className="text-red-700 dark:text-red-400">
                  Are you sure? This action cannot be undone. The pulse will be
                  permanently deleted.
                </span>
              </p>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => {
                    setShowPulseDeleteConfirm(false)
                    setPulseToDelete(null)
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-gp-surface-soft dark:bg-gp-surface-strong text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePulse}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </OfferingModal>

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

      <AddPersonToFieldModal
        isOpen={isAddPersonModalOpen}
        isSubmitting={isAddingPersonToField}
        onClose={() => setIsAddPersonModalOpen(false)}
        onCreatePerson={handleAddPersonToField}
      />
    </>
  )
}

export default FieldDetailPage
