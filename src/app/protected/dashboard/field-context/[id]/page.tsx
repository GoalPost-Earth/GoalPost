'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { OfferingModal } from '@/components/ui/offering-modal'
import { OfferingInput } from '@/components/ui/offering-input'
import { PulseEditModal } from '@/components/ui/pulse-edit-modal'
import { ResonanceLinkModal } from '@/components/ui/resonance-link-modal'
import { BulkPulseShareModal } from '@/components/ui/bulk-pulse-share-modal'
import type { NodeType } from '@/components/ui/pulse-node'
import { GET_FIELD_CONTEXT_DETAILS } from '@/app/graphql/queries/FIELD_CONTEXT_DETAILS_QUERIES'
import {
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
  UPDATE_FIELD_CONTEXT_MUTATION,
  DELETE_FIELD_CONTEXT_MUTATION,
  LOG_FIELD_ACTIVITY,
  LOG_PULSE_ACTIVITY,
  CREATE_RESONANCE_LINK_MUTATION,
  UPDATE_RESONANCE_LINK_MUTATION,
  DELETE_RESONANCE_LINK_MUTATION,
  SHARE_PULSE_WITH_CONTEXT_MUTATION,
  REMOVE_PULSE_FROM_CONTEXT_MUTATION,
} from '@/app/graphql/mutations'
import { LOG_RESONANCE_ACTIVITY } from '@/app/graphql/mutations/ACTIVITY_LOG_MUTATIONS'
import { cn } from '@/lib/utils'
import { useAnimations, useApp, usePageContext } from '@/contexts'
import { usePulseSharing } from '@/hooks/usePulseSharing'
import { FieldContextSections } from '@/components/fields/field-context-sections'
import { SpaceViewToggle } from '@/components/spaces'
import type { SpaceViewMode } from '@/components/spaces'

export default function FieldContextDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { setPageTitle } = usePageContext()
  const { user } = useApp()
  const contextId = params?.id as string
  const { animationsEnabled } = useAnimations()
  const [isCreatePulseModalOpen, setIsCreatePulseModalOpen] = useState(false)
  const [editingPulseId, setEditingPulseId] = useState<string | null>(null)
  const [editingPulseData, setEditingPulseData] = useState<{
    type: NodeType
    name: string
    content: string
  } | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editEmergentName, setEditEmergentName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isPulseSubmitting, setIsPulseSubmitting] = useState(false)
  const [pulseSubmitError, setPulseSubmitError] = useState<string | null>(null)
  const [pulseSubmitSuccess, setPulseSubmitSuccess] = useState(false)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [showPulseDeleteConfirm, setShowPulseDeleteConfirm] = useState(false)
  const [pulseToDelete, setPulseToDelete] = useState<{
    id: string
    type: NodeType
    title: string
  } | null>(null)
  const [isResonanceLinkModalOpen, setIsResonanceLinkModalOpen] =
    useState(false)
  const [editingResonance, setEditingResonance] = useState<{
    id: string
    label: string
    confidence: number
    description: string
    sourceId: string
    targetId: string
    sourceType: NodeType
    targetType: NodeType
  } | null>(null)
  const [isResonanceSubmitting, setIsResonanceSubmitting] = useState(false)
  const [resonanceSubmitError, setResonanceSubmitError] = useState<
    string | null
  >(null)
  const [isBulkShareModalOpen, setIsBulkShareModalOpen] = useState(false)

  // Set page title
  useEffect(() => {
    setPageTitle('Dashboard')
  }, [setPageTitle])

  const { data, loading, error, refetch } = useQuery(
    GET_FIELD_CONTEXT_DETAILS,
    {
      variables: { contextId },
      skip: !contextId,
    }
  )

  // Setup mutations
  const [createGoalPulse] = useMutation(CREATE_GOAL_PULSE_MUTATION)
  const [createResourcePulse] = useMutation(CREATE_RESOURCE_PULSE_MUTATION)
  const [createStoryPulse] = useMutation(CREATE_STORY_PULSE_MUTATION)
  const [updateGoalPulse] = useMutation(UPDATE_GOAL_PULSE_MUTATION)
  const [updateResourcePulse] = useMutation(UPDATE_RESOURCE_PULSE_MUTATION)
  const [updateStoryPulse] = useMutation(UPDATE_STORY_PULSE_MUTATION)
  const [deleteGoalPulse] = useMutation(DELETE_GOAL_PULSE_MUTATION)
  const [deleteResourcePulse] = useMutation(DELETE_RESOURCE_PULSE_MUTATION)
  const [deleteStoryPulse] = useMutation(DELETE_STORY_PULSE_MUTATION)
  const [deleteResonancesByPulse] = useMutation(
    DELETE_RESONANCES_BY_PULSE_MUTATION
  )
  const [updateFieldContext] = useMutation(UPDATE_FIELD_CONTEXT_MUTATION)
  const [deleteFieldContext] = useMutation(DELETE_FIELD_CONTEXT_MUTATION)
  const [logFieldActivity] = useMutation(LOG_FIELD_ACTIVITY)
  const [logPulseActivity] = useMutation(LOG_PULSE_ACTIVITY)
  const [createResonanceLink] = useMutation(CREATE_RESONANCE_LINK_MUTATION)
  const [updateResonanceLink] = useMutation(UPDATE_RESONANCE_LINK_MUTATION)
  const [deleteResonanceLink] = useMutation(DELETE_RESONANCE_LINK_MUTATION)
  const [logResonanceActivity] = useMutation(LOG_RESONANCE_ACTIVITY)
  const [sharePulseWithContext] = useMutation(SHARE_PULSE_WITH_CONTEXT_MUTATION)
  const [removePulseFromContext] = useMutation(
    REMOVE_PULSE_FROM_CONTEXT_MUTATION
  )

  const context = data?.fieldContexts?.[0]
  const space = context?.space?.[0]
  const pulses = [
    ...(data?.goalPulses || []),
    ...(data?.resourcePulses || []),
    ...(data?.storyPulses || []),
    ...(data?.carePulses || []),
    ...(data?.coreValuePulses || []),
  ].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
  const resonances = context?.resonancesInContext || []

  const handleViewChange = useCallback(
    (view: SpaceViewMode) => {
      if (
        view !== 'graph' ||
        !space?.id ||
        !space?.__typename ||
        !context?.id
      ) {
        return
      }

      const spaceType = space.__typename === 'WeSpace' ? 'we-space' : 'me-space'

      router.push(
        `/protected/spaces/${spaceType}/${space.id}/fields/${context.id}`
      )
    },
    [router, space?.__typename, space?.id, context?.id]
  )

  const handleEditStart = () => {
    setEditTitle(context?.title || '')
    setEditEmergentName(context?.emergentName || '')
    setIsEditMode(true)
  }

  const handleEditCancel = () => {
    setIsEditMode(false)
    setEditTitle('')
    setEditEmergentName('')
  }

  const handleEditSave = async () => {
    try {
      setIsEditLoading(true)
      const updateInput: Record<string, string | undefined> = {}
      if (editTitle) updateInput.title_SET = editTitle
      if (editEmergentName) updateInput.emergentName_SET = editEmergentName

      const where = { id_EQ: contextId }

      await updateFieldContext({
        variables: { where, update: updateInput },
        refetchQueries: [
          {
            query: GET_FIELD_CONTEXT_DETAILS,
            variables: { contextId },
          },
        ],
      })

      // Log field context update activity
      logFieldActivity({
        variables: {
          input: {
            action: 'updated',
            fieldId: contextId,
            fieldName: editTitle || context?.title,
            contextId,
            spaceName: space?.name,
          },
        },
      }).catch((err) => console.warn('Failed to log field update:', err))

      setIsEditMode(false)
      setEditTitle('')
      setEditEmergentName('')
    } catch (err) {
      console.error('Failed to update context:', err)
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (!context) return

      // Check if field context has any pulses
      if (pulses && pulses.length > 0) {
        toast.error(
          `Cannot delete a field with ${pulses.length} pulse${pulses.length !== 1 ? 's' : ''}. Please delete all pulses first.`
        )
        setShowDeleteConfirm(false)
        return
      }

      setIsDeleteLoading(true)

      await deleteFieldContext({
        variables: { id: contextId },
      })

      // Log field context deletion activity
      logFieldActivity({
        variables: {
          input: {
            action: 'deleted',
            fieldId: contextId,
            fieldName: context.title,
            contextId,
            spaceName: space?.name,
          },
        },
      }).catch((err) => console.warn('Failed to log field deletion:', err))

      toast.success('Field context deleted successfully')
      router.push('/protected/dashboard')
    } catch (err) {
      console.error('Failed to delete context:', err)
      toast.error('Failed to delete field context. Please try again.')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  const handleCreatePulse = async (
    value: string,
    type: string,
    name: string
  ) => {
    if (!user) {
      setPulseSubmitError('User not authenticated')
      return
    }

    setIsPulseSubmitting(true)
    setPulseSubmitError(null)
    setPulseSubmitSuccess(false)

    try {
      const pulseTypeMap = {
        goal: 'goal',
        resource: 'resource',
        story: 'story',
      } as const

      const pulseType =
        pulseTypeMap[type as keyof typeof pulseTypeMap] || 'goal'

      if (editingPulseId) {
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

        const currentPulse = pulses.find((pulse) => pulse.id === editingPulseId)
        const snapshotName = currentPulse?.title ?? name

        logPulseActivity({
          variables: {
            input: {
              action: 'updated',
              pulseId: editingPulseId,
              pulseType:
                pulseType.charAt(0).toUpperCase() +
                pulseType.slice(1) +
                'Pulse',
              pulseName: snapshotName,
              contextId,
            },
          },
        }).catch((err) => console.warn('Failed to log pulse update:', err))
      } else {
        const baseInput = {
          title: name,
          content: value,
          intensity: 1.0,
          createdAt: new Date().toISOString(),
          context: {
            connect: [{ where: { node: { id_EQ: contextId } } }],
          },
          createdBy: {
            connect: [{ where: { node: { id_EQ: user.id } } }],
          },
        }

        let createdPulseId: string | undefined

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
                contextId,
              },
            },
          }).catch((err) => console.warn('Failed to log pulse creation:', err))
        }
      }

      setPulseSubmitSuccess(true)

      await refetch()

      setTimeout(() => {
        setIsCreatePulseModalOpen(false)
        setPulseSubmitSuccess(false)
        setPulseSubmitError(null)
        setEditingPulseId(null)
        setEditingPulseData(null)
      }, 1500)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create pulse'
      console.error('Error creating pulse:', error)
      setPulseSubmitError(errorMessage)
    } finally {
      setIsPulseSubmitting(false)
    }
  }

  const handleEditPulse = (
    e: React.MouseEvent,
    pulseId: string,
    type: NodeType,
    title: string,
    content: string
  ) => {
    e.stopPropagation()
    setEditingPulseId(pulseId)
    setEditingPulseData({
      type,
      name: title,
      content,
    })
    setIsCreatePulseModalOpen(true)
  }

  const handleDeletePulse = async (
    e: React.MouseEvent,
    pulseId: string,
    type: NodeType,
    skipConfirm = false
  ) => {
    e.stopPropagation()

    const currentPulse = pulses.find((pulse) => pulse.id === pulseId)

    if (!skipConfirm) {
      setPulseToDelete({
        id: pulseId,
        type,
        title: currentPulse?.title ?? '',
      })
      setShowPulseDeleteConfirm(true)
      return
    }

    if (!user) {
      setPulseSubmitError('User not authenticated')
      return
    }

    setIsPulseSubmitting(true)
    setPulseSubmitError(null)

    try {
      await deleteResonancesByPulse({ variables: { pulseId } })

      if (type === 'goal') {
        await deleteGoalPulse({ variables: { where: { id_EQ: pulseId } } })
      } else if (type === 'resource') {
        await deleteResourcePulse({ variables: { where: { id_EQ: pulseId } } })
      } else {
        await deleteStoryPulse({ variables: { where: { id_EQ: pulseId } } })
      }

      logPulseActivity({
        variables: {
          input: {
            action: 'deleted',
            pulseId,
            pulseType: type.charAt(0).toUpperCase() + type.slice(1) + 'Pulse',
            pulseName: currentPulse?.title ?? '',
            contextId,
          },
        },
      }).catch((err) => console.warn('Failed to log pulse deletion:', err))

      toast.success('Pulse deleted successfully')
      setShowPulseDeleteConfirm(false)
      setPulseToDelete(null)
      await refetch()
    } catch (error) {
      console.error('Error deleting pulse:', error)
      setPulseSubmitError(
        error instanceof Error ? error.message : 'Failed to delete pulse'
      )
      toast.error('Failed to delete pulse')
    } finally {
      setIsPulseSubmitting(false)
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

  const handleResonanceLinkSubmit = async (data: {
    label: string
    confidence: number
    description: string
    sourceId: string
    targetId: string
    sourceType: NodeType
    targetType: NodeType
    resonanceId?: string
  }) => {
    setIsResonanceSubmitting(true)
    setResonanceSubmitError(null)

    try {
      if (data.resonanceId && editingResonance) {
        // Update existing resonance
        await updateResonanceLink({
          variables: {
            where: { id_EQ: data.resonanceId },
            update: {
              label_SET: data.label,
              confidence_SET: data.confidence,
              description_SET: data.description,
            },
          },
        })

        logResonanceActivity({
          variables: {
            input: {
              action: 'updated',
              resonanceId: data.resonanceId,
              sourceId: data.sourceId,
              targetId: data.targetId,
              label: data.label,
              contextId,
            },
          },
        }).catch((err) => console.warn('Failed to log resonance update:', err))

        toast.success('Resonance link updated successfully')
      } else {
        // Create new resonance
        const response = await createResonanceLink({
          variables: {
            input: [
              {
                label: data.label,
                confidence: data.confidence,
                description: data.description,
                createdAt: new Date().toISOString(),
                source: {
                  connect: [{ where: { node: { id_EQ: data.sourceId } } }],
                },
                target: {
                  connect: [{ where: { node: { id_EQ: data.targetId } } }],
                },
                context: {
                  connect: [{ where: { node: { id_EQ: contextId } } }],
                },
              },
            ],
          },
        })

        const createdResonanceId =
          response.data?.createResonanceLinks?.resonanceLinks?.[0]?.id

        if (createdResonanceId) {
          logResonanceActivity({
            variables: {
              input: {
                action: 'created',
                resonanceId: createdResonanceId,
                sourceId: data.sourceId,
                targetId: data.targetId,
                label: data.label,
                contextId,
              },
            },
          }).catch((err) =>
            console.warn('Failed to log resonance creation:', err)
          )
        }

        toast.success('Resonance link created successfully')
      }

      setIsResonanceLinkModalOpen(false)
      setEditingResonance(null)
      await refetch()
    } catch (error) {
      console.error('Error with resonance link:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to process resonance'
      setResonanceSubmitError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsResonanceSubmitting(false)
    }
  }

  const handleDeleteResonance = async () => {
    if (!editingResonance) return

    setIsResonanceSubmitting(true)
    setResonanceSubmitError(null)

    try {
      await deleteResonanceLink({
        variables: { id: editingResonance.id },
      })

      logResonanceActivity({
        variables: {
          input: {
            action: 'deleted',
            resonanceId: editingResonance.id,
            sourceId: editingResonance.sourceId,
            targetId: editingResonance.targetId,
            label: editingResonance.label,
            contextId,
          },
        },
      }).catch((err) => console.warn('Failed to log resonance deletion:', err))

      toast.success('Resonance link deleted successfully')
      setIsResonanceLinkModalOpen(false)
      setEditingResonance(null)
      await refetch()
    } catch (error) {
      console.error('Error deleting resonance:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete resonance'
      setResonanceSubmitError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsResonanceSubmitting(false)
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

  if (error || !context) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors flex items-center justify-center">
        <div className="text-red-500">Error loading field context</div>
      </div>
    )
  }

  const createdDate = new Date(context.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

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
              Edit Field Context
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                  placeholder="Context title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                  Emergent Name (Optional)
                </label>
                <input
                  type="text"
                  value={editEmergentName}
                  onChange={(e) => setEditEmergentName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                  placeholder="AI-generated emergent name"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border border-gp-glass-border">
            <h2 className="text-2xl font-semibold text-gp-ink-strong dark:text-white mb-3">
              Delete Field Context?
            </h2>

            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft mb-3">
              {pulses && pulses.length > 0 ? (
                <>
                  <span className="font-medium text-orange-500 dark:text-orange-400">
                    This field cannot be deleted
                  </span>
                  <span>
                    {' '}
                    because it has {pulses.length} pulse
                    {pulses.length !== 1 ? 's' : ''}.
                  </span>
                  <br />
                  <span className="text-xs mt-2 block">
                    Please delete all pulses within this field first.
                  </span>
                </>
              ) : (
                'Are you sure you want to delete this context? This action cannot be undone.'
              )}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleteLoading || loading}
                className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pulses && pulses.length > 0 ? 'Close' : 'Cancel'}
              </button>
              {(!pulses || pulses.length === 0) && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleteLoading || loading}
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <main className="relative">
        <ProfileLayout>
          <div className="flex justify-end mb-6">
            <SpaceViewToggle
              activeView="details"
              onViewChange={handleViewChange}
            />
          </div>

          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-[9px] uppercase font-semibold text-gp-primary mb-2">
              {space?.__typename || 'Space'} • {space?.name}
            </span>
            <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
              {context.title}
            </h1>
            {context.emergentName && (
              <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft italic mb-2">
                &quot;{context.emergentName}&quot;
              </p>
            )}
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
              Created {createdDate}
            </p>
          </div>

          <FieldContextSections
            createdDate={createdDate}
            pulses={pulses}
            resonances={resonances}
            space={space}
            onAddPulse={() => setIsCreatePulseModalOpen(true)}
            onAddResonance={() => setIsResonanceLinkModalOpen(true)}
            onEditPulse={handleEditPulse}
            onDeletePulse={handleDeletePulse}
            onPulseClick={(pulseId) =>
              router.push(`/protected/dashboard/pulses/${pulseId}`)
            }
            onResonanceClick={(resonanceId) =>
              router.push(`/protected/dashboard/resonances/${resonanceId}`)
            }
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 w-full">
            <button
              onClick={handleEditStart}
              className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                edit
              </span>
              Edit Context
            </button>
            <button
              onClick={() => setIsBulkShareModalOpen(true)}
              disabled={pulses.length === 0}
              className="px-8 py-3 rounded-full bg-blue-500/20 dark:bg-blue-500/10 border border-blue-500/50 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-500/30 dark:hover:bg-blue-500/20 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                share
              </span>
              Share Pulses
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="px-8 py-3 rounded-full bg-red-500/20 dark:bg-red-500/10 border border-red-500/50 dark:border-red-500/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-500/30 dark:hover:bg-red-500/20 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              {loading ? 'Checking...' : 'Delete Context'}
            </button>
          </div>
        </ProfileLayout>
      </main>

      <OfferingModal
        isOpen={isCreatePulseModalOpen && !editingPulseId}
        onClose={() => {
          setIsCreatePulseModalOpen(false)
          setPulseSubmitError(null)
          setPulseSubmitSuccess(false)
          setEditingPulseId(null)
          setEditingPulseData(null)
        }}
        position="bottom"
      >
        <div className="w-full max-w-160">
          {pulseSubmitError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:bg-red-500/20 dark:text-red-300">
              {pulseSubmitError}
            </div>
          )}
          {pulseSubmitSuccess && (
            <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700 dark:bg-green-500/20 dark:text-green-300">
              Pulse created successfully!
            </div>
          )}
          <OfferingInput
            onSubmit={(value: string, type: string, name: string) => {
              handleCreatePulse(value, type, name)
            }}
            isLoading={isPulseSubmitting}
          />
        </div>
      </OfferingModal>

      {editingPulseId && editingPulseData && (
        <PulseEditModal
          isOpen={isCreatePulseModalOpen && !!editingPulseId}
          onClose={() => {
            setIsCreatePulseModalOpen(false)
            setPulseSubmitError(null)
            setEditingPulseId(null)
            setEditingPulseData(null)
          }}
          onSubmit={(type: NodeType, name: string, content: string) => {
            handleCreatePulse(content, type, name)
          }}
          isLoading={isPulseSubmitting}
          initialType={editingPulseData.type}
          initialName={editingPulseData.name}
          initialContent={editingPulseData.content}
          error={pulseSubmitError}
          onDelete={async () => {
            await handleDeletePulse(
              new MouseEvent('click') as unknown as React.MouseEvent,
              editingPulseId,
              editingPulseData.type,
              true
            )
            setIsCreatePulseModalOpen(false)
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
      >
        <div className="relative z-10 w-full">
          <div className="glass-panel rounded-3xl p-8 md:p-12 border border-gp-glass-border dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
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
                  disabled={isPulseSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-gp-surface-soft dark:bg-gp-surface-strong text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePulse}
                  disabled={isPulseSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPulseSubmitting ? 'Deleting...' : 'Delete'}
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
          setEditingResonance(null)
          setResonanceSubmitError(null)
        }}
        pulses={pulses.map((pulse) => ({
          id: pulse.id,
          title: pulse.title,
          content: pulse.content,
          type:
            (pulse.__typename
              ?.replace('Pulse', '')
              .toLowerCase() as NodeType) || 'goal',
        }))}
        onSubmit={handleResonanceLinkSubmit}
        isLoading={isResonanceSubmitting}
        onDelete={handleDeleteResonance}
        editingResonance={editingResonance}
      />

      <BulkPulseShareModal
        isOpen={isBulkShareModalOpen}
        onClose={() => {
          setIsBulkShareModalOpen(false)
        }}
        currentContextId={contextId}
        pulses={pulses.map((pulse) => ({
          id: pulse.id,
          title: pulse.title || '',
          content: pulse.content || '',
          type:
            (pulse.__typename
              ?.replace('Pulse', '')
              .toLowerCase() as NodeType) || 'goal',
        }))}
        onOperationComplete={async () => {
          toast.success('Pulse shared/moved successfully')
          setIsBulkShareModalOpen(false)
          await refetch()
        }}
      />
    </div>
  )
}
