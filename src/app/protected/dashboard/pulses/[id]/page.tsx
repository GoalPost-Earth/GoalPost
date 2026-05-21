'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { useEffect, useState } from 'react'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { GET_PULSE_DETAILS_WITH_CONTEXT } from '@/app/graphql/queries/PULSE_DETAILS_QUERIES'
import { GET_PULSES_BY_CONTEXT } from '@/app/graphql/queries/PULSE_QUERIES'
import {
  UPDATE_GOAL_PULSE_MUTATION,
  UPDATE_RESOURCE_PULSE_MUTATION,
  UPDATE_STORY_PULSE_MUTATION,
  DELETE_GOAL_PULSE_MUTATION,
  DELETE_RESOURCE_PULSE_MUTATION,
  DELETE_STORY_PULSE_MUTATION,
  DELETE_RESONANCES_BY_PULSE_MUTATION,
  LOG_PULSE_ACTIVITY,
} from '@/app/graphql/mutations'
import { cn } from '@/lib/utils'
import { useAnimations, useFocalEntity, usePageContext } from '@/contexts'
import type {
  FocalEntityParent,
  FocalEntityType,
} from '@/lib/focal-entity/types'
import { getConfigForType, type NodeType } from '@/lib/pulse-type-config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LinkifiedText } from '@/components/ui/linkified-text'
import { usePulseSharing } from '@/hooks/usePulseSharing'
import { SharePulseModal, type PulseDetails } from '@/components/ui/pulse-panel'
import {
  EntityProvenance,
  type ProvenanceDocument,
} from '@/components/fields/entity-provenance'
import {
  GET_GOAL_PULSE_PROVENANCE,
  GET_RESOURCE_PULSE_PROVENANCE,
  GET_STORY_PULSE_PROVENANCE,
} from '@/app/graphql/queries/PROVENANCE_QUERIES'

function typenameToNodeType(typename: string): NodeType {
  const map: Record<string, NodeType> = {
    GoalPulse: 'goal',
    ResourcePulse: 'resource',
    StoryPulse: 'story',
    CarePulse: 'care',
    CoreValuePulse: 'coreValue',
  }
  return map[typename] ?? 'goal'
}

export default function PulseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { setPageTitle } = usePageContext()
  const { setFocalLabel, setFocalParents } = useFocalEntity()
  const pulseId = params?.id as string
  const { animationsEnabled } = useAnimations()
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editWhy, setEditWhy] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editTime, setEditTime] = useState('')

  // GoalPulse specific
  const [editStatus, setEditStatus] = useState('')
  const [editHorizon, setEditHorizon] = useState('')
  const [editSuccessMeasures, setEditSuccessMeasures] = useState('')
  const [editActivities, setEditActivities] = useState('')
  const [editType, setEditType] = useState('')

  // ResourcePulse specific
  const [editResourceType, setEditResourceType] = useState('')

  // StoryPulse specific
  const [editLevelFulfilled, setEditLevelFulfilled] = useState('')
  const [editFulfillmentDate, setEditFulfillmentDate] = useState('')
  const [editIssuesIdentified, setEditIssuesIdentified] = useState('')
  const [editIssuesResolved, setEditIssuesResolved] = useState('')
  const [editAlignmentChallenges, setEditAlignmentChallenges] = useState('')
  const [editAlignmentExamples, setEditAlignmentExamples] = useState('')
  const [editWhoSupports, setEditWhoSupports] = useState('')

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>(
    {}
  )

  // Set page title
  useEffect(() => {
    setPageTitle('Dashboard')
  }, [setPageTitle])

  const toggleExpanded = (fieldName: string) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }))
  }

  const { data, loading, error, refetch } = useQuery(
    GET_PULSE_DETAILS_WITH_CONTEXT,
    {
      variables: { pulseId },
      skip: !pulseId,
    }
  )

  // Slice 7 (GOAL-242) — separate raw-gql provenance fetches per pulse type
  // (codegen'd query strings are pinned, so editing them would churn the
  // generated types). We fire all three; Apollo dedupes and the unmatched
  // queries return empty arrays. Unauthorized viewers get empty lists via
  // Document's @authorization directive.
  type PulseProvenanceResult = {
    id: string
    extractedFrom?: ProvenanceDocument[]
  }
  const { data: goalProv } = useQuery<{ goalPulses?: PulseProvenanceResult[] }>(
    GET_GOAL_PULSE_PROVENANCE,
    { variables: { pulseId }, skip: !pulseId }
  )
  const { data: resourceProv } = useQuery<{
    resourcePulses?: PulseProvenanceResult[]
  }>(GET_RESOURCE_PULSE_PROVENANCE, {
    variables: { pulseId },
    skip: !pulseId,
  })
  const { data: storyProv } = useQuery<{
    storyPulses?: PulseProvenanceResult[]
  }>(GET_STORY_PULSE_PROVENANCE, {
    variables: { pulseId },
    skip: !pulseId,
  })
  const provenanceDocuments =
    goalProv?.goalPulses?.[0]?.extractedFrom ??
    resourceProv?.resourcePulses?.[0]?.extractedFrom ??
    storyProv?.storyPulses?.[0]?.extractedFrom ??
    null

  // Setup mutations for different pulse types
  const [updateGoalPulse] = useMutation(UPDATE_GOAL_PULSE_MUTATION)
  const [updateResourcePulse] = useMutation(UPDATE_RESOURCE_PULSE_MUTATION)
  const [updateStoryPulse] = useMutation(UPDATE_STORY_PULSE_MUTATION)
  const [deleteGoalPulse] = useMutation(DELETE_GOAL_PULSE_MUTATION)
  const [deleteResourcePulse] = useMutation(DELETE_RESOURCE_PULSE_MUTATION)
  const [deleteStoryPulse] = useMutation(DELETE_STORY_PULSE_MUTATION)
  const [deleteResonancesByPulse] = useMutation(
    DELETE_RESONANCES_BY_PULSE_MUTATION
  )
  const [logPulseActivity] = useMutation(LOG_PULSE_ACTIVITY)
  const {
    sharePulseWithContext,
    removePulseFromContext,
    loading: isSharingPulse,
  } = usePulseSharing()

  // Get the pulse from whichever concrete type array returns data
  const pulse =
    data?.goalPulses?.[0] || data?.resourcePulses?.[0] || data?.storyPulses?.[0]
  const context = pulse?.context?.[0]
  const space = context?.space?.[0]

  // Refine the provisional GoalPulse focal entity to the actual pulse subtype
  // once the query resolves, and supply a label for the assistant.
  useEffect(() => {
    if (!pulse?.id || !pulse?.title) return
    const typename = pulse.__typename
    const refined: FocalEntityType | undefined =
      typename === 'GoalPulse' ||
      typename === 'ResourcePulse' ||
      typename === 'StoryPulse' ||
      typename === 'CarePulse' ||
      typename === 'CoreValuePulse'
        ? typename
        : undefined
    setFocalLabel(pulse.id, pulse.title, refined)
  }, [pulse?.id, pulse?.title, pulse?.__typename, setFocalLabel])

  // Declare the pulse's structural parents (Space > FieldContext) so the
  // breadcrumb can render Dashboard > Space > Field > Pulse.
  useEffect(() => {
    if (!pulse?.id) return
    const parents: FocalEntityParent[] = []
    if (space?.id && space?.name) {
      const spaceType: FocalEntityType =
        space.__typename === 'MeSpace' ? 'MeSpace' : 'WeSpace'
      parents.push({ type: spaceType, id: space.id, label: space.name })
    }
    if (context?.id && context?.title) {
      parents.push({
        type: 'FieldContext',
        id: context.id,
        label: context.title,
      })
    }
    setFocalParents(pulse.id, parents)
  }, [
    pulse?.id,
    space?.id,
    space?.name,
    space?.__typename,
    context?.id,
    context?.title,
    setFocalParents,
  ])

  const { data: contextPulseData } = useQuery(GET_PULSES_BY_CONTEXT, {
    variables: { contextId: context?.id || '' },
    skip: !context?.id,
  })

  const formatResonanceLabel = (label?: string) =>
    label ? label.replace(/_/g, ' ') : 'resonance'

  // Build a reliable id→typename map from the explicitly-typed root arrays.
  // The union-type inline fragments in resonance source/target can be misresolved
  // by Apollo's cache, so we use the unambiguous top-level pulse arrays instead.
  const pulseTypeMap = new Map<string, string>()
  ;(contextPulseData?.goalPulses ?? []).forEach((p) =>
    pulseTypeMap.set(p.id, p.__typename)
  )
  ;(contextPulseData?.resourcePulses ?? []).forEach((p) =>
    pulseTypeMap.set(p.id, p.__typename)
  )
  ;(contextPulseData?.storyPulses ?? []).forEach((p) =>
    pulseTypeMap.set(p.id, p.__typename)
  )
  ;(contextPulseData?.carePulses ?? []).forEach((p) =>
    pulseTypeMap.set(p.id, p.__typename)
  )
  ;(contextPulseData?.coreValuePulses ?? []).forEach((p) =>
    pulseTypeMap.set(p.id, p.__typename)
  )

  const relatedPulsesMap = new Map<
    string,
    {
      id: string
      __typename: string
      title: string
      content?: string | null
      resonances: Array<{ id: string; label: string }>
    }
  >()
  const resonances =
    contextPulseData?.fieldContexts?.[0]?.resonancesInContext || []

  const addRelatedPulse = (
    relatedPulse: {
      id: string
      __typename: string
      title: string
      content?: string | null
    },
    resonance: { id: string; label: string }
  ) => {
    const existing = relatedPulsesMap.get(relatedPulse.id)
    const resonanceEntry = {
      id: resonance.id,
      label: formatResonanceLabel(resonance.label),
    }

    if (!existing) {
      relatedPulsesMap.set(relatedPulse.id, {
        ...relatedPulse,
        resonances: [resonanceEntry],
      })
      return
    }

    if (!existing.resonances.some((entry) => entry.id === resonance.id)) {
      existing.resonances.push(resonanceEntry)
    }
  }

  resonances.forEach((resonance) => {
    const sourcePulse = resonance.source?.[0]
    const targetPulse = resonance.target?.[0]

    if (!sourcePulse?.id || !targetPulse?.id) return

    if (sourcePulse.id === pulseId && targetPulse.id !== pulseId) {
      addRelatedPulse(
        {
          id: targetPulse.id,
          __typename:
            pulseTypeMap.get(targetPulse.id) ?? targetPulse.__typename,
          title: targetPulse.title,
          content: targetPulse.content,
        },
        {
          id: resonance.id,
          label: resonance.label,
        }
      )
    }

    if (targetPulse.id === pulseId && sourcePulse.id !== pulseId) {
      addRelatedPulse(
        {
          id: sourcePulse.id,
          __typename:
            pulseTypeMap.get(sourcePulse.id) ?? sourcePulse.__typename,
          title: sourcePulse.title,
          content: sourcePulse.content,
        },
        {
          id: resonance.id,
          label: resonance.label,
        }
      )
    }
  })

  const relatedPulses = Array.from(relatedPulsesMap.values())

  const handleEditStart = () => {
    setEditTitle(pulse?.title || '')
    setEditContent(pulse?.content || '')
    setEditWhy(pulse?.why || '')
    setEditLocation(pulse?.location || '')
    setEditTime(pulse?.time || '')
    setEditStatus(pulse?.status || '')

    // GoalPulse specific
    if (pulse?.__typename === 'GoalPulse') {
      setEditHorizon(pulse?.horizon || '')
      setEditSuccessMeasures(pulse?.successMeasures || '')
      setEditActivities(pulse?.activities || '')
      setEditType(pulse?.type || '')
    }

    // ResourcePulse specific
    if (pulse?.__typename === 'ResourcePulse') {
      setEditResourceType(pulse?.resourceType || '')
    }

    // StoryPulse specific
    if (pulse?.__typename === 'StoryPulse') {
      setEditSuccessMeasures(pulse?.successMeasures || '')
      setEditLevelFulfilled(pulse?.levelFulfilled || '')
      setEditFulfillmentDate(pulse?.fulfillmentDate || '')
      setEditIssuesIdentified(pulse?.issuesIdentified || '')
      setEditIssuesResolved(pulse?.issuesResolved || '')
      setEditAlignmentChallenges(pulse?.alignmentChallenges || '')
      setEditAlignmentExamples(pulse?.alignmentExamples || '')
      setEditWhoSupports(pulse?.whoSupports || '')
    }

    setIsEditMode(true)
  }

  const handleEditCancel = () => {
    setIsEditMode(false)
    setEditTitle('')
    setEditContent('')
    setEditWhy('')
    setEditLocation('')
    setEditTime('')
    setEditStatus('')
    setEditHorizon('')
    setEditSuccessMeasures('')
    setEditActivities('')
    setEditType('')
    setEditResourceType('')
    setEditLevelFulfilled('')
    setEditFulfillmentDate('')
    setEditIssuesIdentified('')
    setEditIssuesResolved('')
    setEditAlignmentChallenges('')
    setEditAlignmentExamples('')
    setEditWhoSupports('')
  }

  const handleEditSave = async () => {
    try {
      setIsEditLoading(true)
      const updateInput: Record<string, string | number | undefined> = {}

      // Common fields - allow empty strings for text fields, but skip enum fields if empty
      if (editTitle !== undefined) updateInput.title_SET = editTitle
      if (editContent !== undefined) updateInput.content_SET = editContent
      if (editWhy !== undefined) updateInput.why_SET = editWhy
      if (editLocation !== undefined) updateInput.location_SET = editLocation
      if (editTime !== undefined) updateInput.time_SET = editTime
      // Status is an enum - only include if it has a value
      if (editStatus) updateInput.status_SET = editStatus

      const where = { id_EQ: pulseId }

      switch (pulse?.__typename) {
        case 'GoalPulse':
          // Enums can't be empty - only include if they have a value
          if (editHorizon) updateInput.horizon_SET = editHorizon
          if (editSuccessMeasures !== undefined)
            updateInput.successMeasures_SET = editSuccessMeasures
          if (editActivities !== undefined)
            updateInput.activities_SET = editActivities
          if (editType !== undefined) updateInput.type_SET = editType

          await updateGoalPulse({
            variables: { where, update: updateInput },
            refetchQueries: ['GetPulseDetailsWithContext'],
          })
          break

        case 'ResourcePulse':
          // Status is a string field in ResourcePulse, so allow empty strings
          if (editResourceType !== undefined)
            updateInput.resourceType_SET = editResourceType

          await updateResourcePulse({
            variables: { where, update: updateInput },
            refetchQueries: ['GetPulseDetailsWithContext'],
          })
          break

        case 'StoryPulse':
          if (editSuccessMeasures !== undefined)
            updateInput.successMeasures_SET = editSuccessMeasures
          if (editLevelFulfilled !== undefined)
            updateInput.levelFulfilled_SET = editLevelFulfilled
          if (editFulfillmentDate !== undefined)
            updateInput.fulfillmentDate_SET = editFulfillmentDate
          if (editIssuesIdentified !== undefined)
            updateInput.issuesIdentified_SET = editIssuesIdentified
          if (editIssuesResolved !== undefined)
            updateInput.issuesResolved_SET = editIssuesResolved
          if (editAlignmentChallenges !== undefined)
            updateInput.alignmentChallenges_SET = editAlignmentChallenges
          if (editAlignmentExamples !== undefined)
            updateInput.alignmentExamples_SET = editAlignmentExamples
          if (editWhoSupports !== undefined)
            updateInput.whoSupports_SET = editWhoSupports

          await updateStoryPulse({
            variables: { where, update: updateInput },
            refetchQueries: ['GetPulseDetailsWithContext'],
          })
          break
      }

      // Log pulse update activity
      logPulseActivity({
        variables: {
          input: {
            action: 'updated',
            pulseId,
            pulseType: pulse?.__typename || 'Unknown',
            pulseName: editTitle || pulse?.title || 'Untitled',
            contextId: context?.id,
          },
        },
      }).catch((err) => console.warn('Failed to log pulse update:', err))

      handleEditCancel()
    } catch (err) {
      console.error('Failed to update pulse:', err)
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (!pulse) return
      setIsDeleteLoading(true)

      // First, delete any resonances attached to this pulse
      await deleteResonancesByPulse({ variables: { pulseId } })

      const where = { id_EQ: pulseId }

      switch (pulse.__typename) {
        case 'GoalPulse':
          await deleteGoalPulse({
            variables: { where },
            refetchQueries: ['GetAllPulses', 'GetPulsesByContext'],
            awaitRefetchQueries: true,
          })
          break
        case 'ResourcePulse':
          await deleteResourcePulse({
            variables: { where },
            refetchQueries: ['GetAllPulses', 'GetPulsesByContext'],
            awaitRefetchQueries: true,
          })
          break
        case 'StoryPulse':
          await deleteStoryPulse({
            variables: { where },
            refetchQueries: ['GetAllPulses', 'GetPulsesByContext'],
            awaitRefetchQueries: true,
          })
          break
      }

      // Log pulse deletion activity
      logPulseActivity({
        variables: {
          input: {
            action: 'deleted',
            pulseId,
            pulseType: pulse.__typename,
            pulseName: pulse.title || 'Untitled',
            contextId: context?.id,
          },
        },
      }).catch((err) => console.warn('Failed to log pulse deletion:', err))

      router.push('/protected/dashboard')
    } catch (err) {
      console.error('Failed to delete pulse:', err)
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50 bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <span
            className={cn(
              'material-symbols-outlined text-5xl text-gp-primary',
              animationsEnabled && 'animate-spin'
            )}
          >
            hourglass_bottom
          </span>
          <p className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (error || !pulse) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors flex items-center justify-center">
        <div className="text-red-500">Error loading pulse</div>
      </div>
    )
  }

  const createdDate = new Date(pulse.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const contextCreatedDate = context
    ? new Date(context.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

  const pulseForSharing: PulseDetails = {
    id: pulse.id,
    type:
      pulse.__typename === 'ResourcePulse'
        ? 'resource'
        : pulse.__typename === 'StoryPulse'
          ? 'story'
          : 'goal',
    title: pulse.title,
    content: pulse.content || '',
    createdAt: pulse.createdAt,
    status: 'status' in pulse ? pulse.status : null,
    horizon:
      pulse.__typename === 'GoalPulse' && 'horizon' in pulse
        ? pulse.horizon
        : null,
    resourceType:
      pulse.__typename === 'ResourcePulse' && 'resourceType' in pulse
        ? pulse.resourceType
        : null,
    createdBy: [],
    contexts:
      pulse.context?.map((ctx: { id: string; title?: string | null }) => ({
        id: ctx.id,
        title: ctx.title,
      })) || [],
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20">
      <ProfileBackground />

      {/* Edit Modal */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 border border-gp-glass-border">
            <button
              onClick={handleEditCancel}
              className="absolute top-4 right-4 text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-semibold text-gp-ink-strong dark:text-white mb-6">
              Edit {pulse.__typename}
            </h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                  placeholder="Pulse title"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                  Content
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary min-h-32 resize-none"
                  placeholder="Pulse content"
                />
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                    placeholder="Location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                  Time
                </label>
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                  placeholder="Time"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                  Why
                </label>
                <textarea
                  value={editWhy}
                  onChange={(e) => setEditWhy(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary min-h-20 resize-none"
                  placeholder="Why is this important?"
                />
              </div>

              {/* GoalPulse Specific Fields */}
              {pulse?.__typename === 'GoalPulse' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                        Status
                      </label>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="PAUSED">Paused</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                        Horizon
                      </label>
                      <select
                        value={editHorizon}
                        onChange={(e) => setEditHorizon(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                      >
                        <option value="">Select Horizon</option>
                        <option value="SHORT">Short</option>
                        <option value="MID">Mid</option>
                        <option value="LONG">Long</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Type
                    </label>
                    <input
                      type="text"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                      placeholder="Goal type"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Success Measures
                    </label>
                    <textarea
                      value={editSuccessMeasures}
                      onChange={(e) => setEditSuccessMeasures(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary min-h-20 resize-none"
                      placeholder="How will you measure success?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Activities
                    </label>
                    <textarea
                      value={editActivities}
                      onChange={(e) => setEditActivities(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary min-h-20 resize-none"
                      placeholder="Activities to achieve this goal"
                    />
                  </div>
                </>
              )}

              {/* ResourcePulse Specific Fields */}
              {pulse?.__typename === 'ResourcePulse' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Resource Type
                    </label>
                    <input
                      type="text"
                      value={editResourceType}
                      onChange={(e) => setEditResourceType(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                      placeholder="Type of resource"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Status
                    </label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* StoryPulse Specific Fields */}
              {pulse?.__typename === 'StoryPulse' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Status
                    </label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                        Level Fulfilled
                      </label>
                      <input
                        type="text"
                        value={editLevelFulfilled}
                        onChange={(e) => setEditLevelFulfilled(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                        placeholder="Fulfillment level"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                        Fulfillment Date
                      </label>
                      <input
                        type="text"
                        value={editFulfillmentDate}
                        onChange={(e) => setEditFulfillmentDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                        placeholder="Date fulfilled"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Success Measures
                    </label>
                    <textarea
                      value={editSuccessMeasures}
                      onChange={(e) => setEditSuccessMeasures(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary min-h-20 resize-none"
                      placeholder="How will you measure success?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Issues Identified
                    </label>
                    <textarea
                      value={editIssuesIdentified}
                      onChange={(e) => setEditIssuesIdentified(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary min-h-20 resize-none"
                      placeholder="Issues identified"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Issues Resolved
                    </label>
                    <textarea
                      value={editIssuesResolved}
                      onChange={(e) => setEditIssuesResolved(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary min-h-20 resize-none"
                      placeholder="Issues resolved"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Alignment Challenges
                    </label>
                    <textarea
                      value={editAlignmentChallenges}
                      onChange={(e) =>
                        setEditAlignmentChallenges(e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary min-h-20 resize-none"
                      placeholder="Challenges in alignment"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Alignment Examples
                    </label>
                    <textarea
                      value={editAlignmentExamples}
                      onChange={(e) => setEditAlignmentExamples(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary min-h-20 resize-none"
                      placeholder="Examples of alignment"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                      Who Supports
                    </label>
                    <textarea
                      value={editWhoSupports}
                      onChange={(e) => setEditWhoSupports(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary min-h-20 resize-none"
                      placeholder="Who supports this?"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gp-glass-border">
              <button
                onClick={handleEditCancel}
                disabled={isEditLoading}
                className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={isEditLoading}
                className="px-6 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isEditLoading && (
                  <span
                    className={cn(
                      'material-symbols-outlined text-base',
                      animationsEnabled && 'animate-spin'
                    )}
                  >
                    hourglass_bottom
                  </span>
                )}
                {isEditLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border border-gp-glass-border">
            <h2 className="text-2xl font-semibold text-gp-ink-strong dark:text-white mb-3">
              Delete {pulse.__typename}?
            </h2>

            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft mb-6">
              Are you sure you want to delete this pulse? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleteLoading}
                className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleteLoading}
                className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleteLoading && (
                  <span
                    className={cn(
                      'material-symbols-outlined text-base',
                      animationsEnabled && 'animate-spin'
                    )}
                  >
                    hourglass_bottom
                  </span>
                )}
                {isDeleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <main className="relative">
        <ProfileLayout>
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-12">
            <span
              className={cn(
                'text-[9px] uppercase font-semibold mb-2',
                getConfigForType(typenameToNodeType(pulse.__typename)).color
              )}
            >
              {pulse.__typename} • {context?.title}
            </span>
            <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
              {pulse.title}
            </h1>
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
              Created {createdDate}
            </p>
          </div>

          <EntityProvenance documents={provenanceDocuments} />

          {/* Content Section */}
          {pulse.content && (
            <div className="mb-12">
              <div className="flex flex-col gap-4">
                <SectionHeader icon="description" title="Content" />
                <ProfileCard>
                  <p className="text-sm text-gp-ink-strong dark:text-gp-ink-strong leading-relaxed">
                    <LinkifiedText text={pulse.content} />
                  </p>
                </ProfileCard>
              </div>
            </div>
          )}

          {/* Grid Layout - Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Context Info Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="category" title="Context" />
              <ProfileCard>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Title
                    </span>
                    <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                      {context?.title}
                    </h4>
                  </div>
                  {context?.emergentName && (
                    <div>
                      <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                        Emergent Name
                      </span>
                      <p className="text-xs text-gp-ink-strong dark:text-white italic">
                        &quot;{context.emergentName}&quot;
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Created
                    </span>
                    <p className="text-xs text-gp-ink-strong dark:text-white">
                      {contextCreatedDate}
                    </p>
                  </div>
                </div>
              </ProfileCard>
            </div>

            {/* Space Info Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="location_on" title="Space" />
              <ProfileCard>
                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-gp-primary block mb-1">
                      {space?.__typename || 'Space'}
                    </span>
                    <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                      {space?.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                    {space?.visibility}
                  </p>
                </div>
              </ProfileCard>
            </div>

            {/* Related Pulses Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <SectionHeader icon="waves" title="Related Pulses" />
              <ProfileCard>
                <div className="space-y-3">
                  {relatedPulses.length > 0 ? (
                    relatedPulses.map((relatedPulse, idx) => (
                      <div
                        key={relatedPulse.id}
                        onClick={() =>
                          relatedPulse.id &&
                          router.push(
                            `/protected/dashboard/pulses/${relatedPulse.id}`
                          )
                        }
                        className={
                          idx > 0
                            ? 'border-t border-gp-glass-border pt-3 cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                            : 'cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                        }
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <span
                              className={cn(
                                'text-[9px] uppercase font-semibold block mb-0.5',
                                getConfigForType(
                                  typenameToNodeType(relatedPulse.__typename)
                                ).color
                              )}
                            >
                              {relatedPulse.__typename}
                            </span>
                            <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                              {relatedPulse.title}
                            </h4>
                          </div>
                        </div>
                        {relatedPulse.content && (
                          <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed mt-1">
                            {relatedPulse.content.substring(0, 100)}
                            {relatedPulse.content.length > 100 ? '...' : ''}
                          </p>
                        )}
                        {relatedPulse.resonances.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {relatedPulse.resonances.map((resonance) => (
                              <button
                                key={resonance.id}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  router.push(
                                    `/protected/dashboard/resonances/${resonance.id}`
                                  )
                                }}
                                className="inline-flex items-center gap-1 rounded-full border border-gp-primary/30 bg-gp-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gp-primary hover:bg-gp-primary/20 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[12px]">
                                  hub
                                </span>
                                {resonance.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                      No resonance-connected pulses
                    </p>
                  )}
                </div>
              </ProfileCard>
            </div>

            {/* Metadata Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <SectionHeader icon="info" title="Metadata" />
              <ProfileCard>
                <div className="space-y-4">
                  {/* Common Fields */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] uppercase font-semibold text-gp-primary">
                      Common
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                          Type
                        </span>
                        <p className="text-xs text-gp-ink-strong dark:text-white">
                          {pulse.__typename}
                        </p>
                      </div>
                      {pulse?.why && (
                        <div>
                          <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                            Why
                          </span>
                          <div className="mt-1">
                            <p className="text-xs text-gp-ink-strong dark:text-white">
                              {expandedFields['common-why']
                                ? pulse.why
                                : pulse.why.substring(0, 100)}
                              {pulse.why.length > 100 &&
                                !expandedFields['common-why'] &&
                                '...'}
                            </p>
                            {pulse.why.length > 100 && (
                              <button
                                onClick={() => toggleExpanded('common-why')}
                                className="text-[10px] text-gp-primary hover:text-gp-primary/80 transition-colors mt-1 font-medium"
                              >
                                {expandedFields['common-why']
                                  ? 'Read less'
                                  : 'Read more'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      {pulse?.location && (
                        <div>
                          <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                            Location
                          </span>
                          <p className="text-xs text-gp-ink-strong dark:text-white">
                            <LinkifiedText text={pulse.location} />
                          </p>
                        </div>
                      )}
                      {pulse?.time && (
                        <div>
                          <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                            Time
                          </span>
                          <p className="text-xs text-gp-ink-strong dark:text-white">
                            {pulse.time}
                          </p>
                        </div>
                      )}
                      {pulse?.status && (
                        <div>
                          <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                            Status
                          </span>
                          <p className="text-xs text-gp-ink-strong dark:text-white">
                            {pulse.status}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GoalPulse Specific */}
                  {pulse.__typename === 'GoalPulse' &&
                    (pulse?.horizon ||
                      pulse?.type ||
                      pulse?.successMeasures ||
                      pulse?.activities) && (
                      <div className="space-y-2 border-t border-gp-glass-border pt-4">
                        <h5 className="text-[11px] uppercase font-semibold text-gp-primary">
                          Goal Details
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          {pulse?.horizon && (
                            <div>
                              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                                Horizon
                              </span>
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {pulse.horizon}
                              </p>
                            </div>
                          )}
                          {pulse?.type && (
                            <div>
                              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                                Type
                              </span>
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {pulse.type}
                              </p>
                            </div>
                          )}
                        </div>
                        {pulse?.successMeasures && (
                          <div>
                            <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                              Success Measures
                            </span>
                            <div className="mt-1">
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {expandedFields['goal-success-measures']
                                  ? pulse.successMeasures
                                  : pulse.successMeasures.substring(0, 100)}
                                {pulse.successMeasures.length > 100 &&
                                  !expandedFields['goal-success-measures'] &&
                                  '...'}
                              </p>
                              {pulse.successMeasures.length > 100 && (
                                <button
                                  onClick={() =>
                                    toggleExpanded('goal-success-measures')
                                  }
                                  className="text-[10px] text-gp-primary hover:text-gp-primary/80 transition-colors mt-1 font-medium"
                                >
                                  {expandedFields['goal-success-measures']
                                    ? 'Read less'
                                    : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        {pulse?.activities && (
                          <div>
                            <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                              Activities
                            </span>
                            <div className="mt-1">
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {expandedFields['goal-activities']
                                  ? pulse.activities
                                  : pulse.activities.substring(0, 100)}
                                {pulse.activities.length > 100 &&
                                  !expandedFields['goal-activities'] &&
                                  '...'}
                              </p>
                              {pulse.activities.length > 100 && (
                                <button
                                  onClick={() =>
                                    toggleExpanded('goal-activities')
                                  }
                                  className="text-[10px] text-gp-primary hover:text-gp-primary/80 transition-colors mt-1 font-medium"
                                >
                                  {expandedFields['goal-activities']
                                    ? 'Read less'
                                    : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* StoryPulse Specific */}
                  {pulse.__typename === 'StoryPulse' &&
                    (pulse?.levelFulfilled ||
                      pulse?.fulfillmentDate ||
                      pulse?.successMeasures ||
                      pulse?.issuesIdentified ||
                      pulse?.issuesResolved ||
                      pulse?.alignmentChallenges ||
                      pulse?.alignmentExamples ||
                      pulse?.whoSupports) && (
                      <div className="space-y-2 border-t border-gp-glass-border pt-4">
                        <h5 className="text-[11px] uppercase font-semibold text-gp-primary">
                          Story Details
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          {pulse?.levelFulfilled && (
                            <div>
                              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                                Level Fulfilled
                              </span>
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {pulse.levelFulfilled}
                              </p>
                            </div>
                          )}
                          {pulse?.fulfillmentDate && (
                            <div>
                              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                                Fulfillment Date
                              </span>
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {pulse.fulfillmentDate}
                              </p>
                            </div>
                          )}
                        </div>
                        {pulse?.successMeasures && (
                          <div>
                            <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                              Success Measures
                            </span>
                            <div className="mt-1">
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {expandedFields['story-success-measures']
                                  ? pulse.successMeasures
                                  : pulse.successMeasures.substring(0, 100)}
                                {pulse.successMeasures.length > 100 &&
                                  !expandedFields['story-success-measures'] &&
                                  '...'}
                              </p>
                              {pulse.successMeasures.length > 100 && (
                                <button
                                  onClick={() =>
                                    toggleExpanded('story-success-measures')
                                  }
                                  className="text-[10px] text-gp-primary hover:text-gp-primary/80 transition-colors mt-1 font-medium"
                                >
                                  {expandedFields['story-success-measures']
                                    ? 'Read less'
                                    : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        {pulse?.issuesIdentified && (
                          <div>
                            <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                              Issues Identified
                            </span>
                            <div className="mt-1">
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {expandedFields['story-issues-identified']
                                  ? pulse.issuesIdentified
                                  : pulse.issuesIdentified.substring(0, 100)}
                                {pulse.issuesIdentified.length > 100 &&
                                  !expandedFields['story-issues-identified'] &&
                                  '...'}
                              </p>
                              {pulse.issuesIdentified.length > 100 && (
                                <button
                                  onClick={() =>
                                    toggleExpanded('story-issues-identified')
                                  }
                                  className="text-[10px] text-gp-primary hover:text-gp-primary/80 transition-colors mt-1 font-medium"
                                >
                                  {expandedFields['story-issues-identified']
                                    ? 'Read less'
                                    : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        {pulse?.issuesResolved && (
                          <div>
                            <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                              Issues Resolved
                            </span>
                            <div className="mt-1">
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {expandedFields['story-issues-resolved']
                                  ? pulse.issuesResolved
                                  : pulse.issuesResolved.substring(0, 100)}
                                {pulse.issuesResolved.length > 100 &&
                                  !expandedFields['story-issues-resolved'] &&
                                  '...'}
                              </p>
                              {pulse.issuesResolved.length > 100 && (
                                <button
                                  onClick={() =>
                                    toggleExpanded('story-issues-resolved')
                                  }
                                  className="text-[10px] text-gp-primary hover:text-gp-primary/80 transition-colors mt-1 font-medium"
                                >
                                  {expandedFields['story-issues-resolved']
                                    ? 'Read less'
                                    : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        {pulse?.alignmentChallenges && (
                          <div>
                            <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                              Alignment Challenges
                            </span>
                            <div className="mt-1">
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {expandedFields['story-alignment-challenges']
                                  ? pulse.alignmentChallenges
                                  : pulse.alignmentChallenges.substring(0, 100)}
                                {pulse.alignmentChallenges.length > 100 &&
                                  !expandedFields[
                                    'story-alignment-challenges'
                                  ] &&
                                  '...'}
                              </p>
                              {pulse.alignmentChallenges.length > 100 && (
                                <button
                                  onClick={() =>
                                    toggleExpanded('story-alignment-challenges')
                                  }
                                  className="text-[10px] text-gp-primary hover:text-gp-primary/80 transition-colors mt-1 font-medium"
                                >
                                  {expandedFields['story-alignment-challenges']
                                    ? 'Read less'
                                    : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        {pulse?.alignmentExamples && (
                          <div>
                            <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                              Alignment Examples
                            </span>
                            <div className="mt-1">
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {expandedFields['story-alignment-examples']
                                  ? pulse.alignmentExamples
                                  : pulse.alignmentExamples.substring(0, 100)}
                                {pulse.alignmentExamples.length > 100 &&
                                  !expandedFields['story-alignment-examples'] &&
                                  '...'}
                              </p>
                              {pulse.alignmentExamples.length > 100 && (
                                <button
                                  onClick={() =>
                                    toggleExpanded('story-alignment-examples')
                                  }
                                  className="text-[10px] text-gp-primary hover:text-gp-primary/80 transition-colors mt-1 font-medium"
                                >
                                  {expandedFields['story-alignment-examples']
                                    ? 'Read less'
                                    : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        {pulse?.whoSupports && (
                          <div>
                            <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                              Who Supports
                            </span>
                            <div className="mt-1">
                              <p className="text-xs text-gp-ink-strong dark:text-white">
                                {expandedFields['story-who-supports']
                                  ? pulse.whoSupports
                                  : pulse.whoSupports.substring(0, 100)}
                                {pulse.whoSupports.length > 100 &&
                                  !expandedFields['story-who-supports'] &&
                                  '...'}
                              </p>
                              {pulse.whoSupports.length > 100 && (
                                <button
                                  onClick={() =>
                                    toggleExpanded('story-who-supports')
                                  }
                                  className="text-[10px] text-gp-primary hover:text-gp-primary/80 transition-colors mt-1 font-medium"
                                >
                                  {expandedFields['story-who-supports']
                                    ? 'Read less'
                                    : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </ProfileCard>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 w-full">
            <button
              onClick={handleEditStart}
              className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                edit
              </span>
              Edit Pulse
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-8 py-3 rounded-full bg-blue-500/20 dark:bg-blue-500/10 border border-blue-500/50 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-500/30 dark:hover:bg-blue-500/20 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                share
              </span>
              Share Pulse
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-8 py-3 rounded-full bg-red-500/20 dark:bg-red-500/10 border border-red-500/50 dark:border-red-500/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-500/30 dark:hover:bg-red-500/20 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              Delete Pulse
            </button>
          </div>
        </ProfileLayout>
      </main>

      {showShareModal && (
        <SharePulseModal
          pulse={pulseForSharing}
          currentContextId={context?.id}
          onMoveSuccess={async () => {
            await refetch()
          }}
          onClose={() => setShowShareModal(false)}
          onShare={sharePulseWithContext}
          onRemove={removePulseFromContext}
          isLoading={isSharingPulse}
        />
      )}
    </div>
  )
}
