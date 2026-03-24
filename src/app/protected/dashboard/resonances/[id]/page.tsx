'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { ProfileBackground } from '@/components/persons/profile-background'
import { GET_RESONANCE_LINK_DETAILS } from '@/app/graphql/queries/RESONANCE_QUERIES'
import {
  UPDATE_RESONANCE_LINK_MUTATION,
  DELETE_RESONANCE_LINK_MUTATION,
} from '@/app/graphql/mutations'
import { cn } from '@/lib/utils'
import { useAnimations } from '@/contexts'
import { formatResonanceLabel } from '@/utils/graph-utils'
import {
  getIconForType,
  getConfigForType,
  type NodeType,
} from '@/lib/pulse-type-config'

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

export default function ResonanceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const resonanceId = params?.id as string
  const { animationsEnabled } = useAnimations()

  const [isEditMode, setIsEditMode] = useState(false)
  const [editLabel, setEditLabel] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const { data, loading, error } = useQuery(GET_RESONANCE_LINK_DETAILS, {
    variables: { resonanceId },
    skip: !resonanceId,
  })

  const [updateResonance] = useMutation(UPDATE_RESONANCE_LINK_MUTATION)
  const [deleteResonance] = useMutation(DELETE_RESONANCE_LINK_MUTATION)

  const resonance = data?.resonanceLinks?.[0]
  const sourceArray = resonance?.source || []
  const targetArray = resonance?.target || []

  // Filter out invalid pulse types (CarePulse, CoreValuePulse) that don't have required fields
  const source = sourceArray.find(
    (pulse) =>
      pulse?.__typename &&
      ['GoalPulse', 'ResourcePulse', 'StoryPulse'].includes(pulse.__typename)
  ) as any
  const target = targetArray.find(
    (pulse) =>
      pulse?.__typename &&
      ['GoalPulse', 'ResourcePulse', 'StoryPulse'].includes(pulse.__typename)
  ) as any

  const handleEditStart = () => {
    setEditLabel(resonance?.label || '')
    setEditDescription(resonance?.description || '')
    setIsEditMode(true)
  }

  const handleEditCancel = () => {
    setIsEditMode(false)
  }

  const handleEditSave = async () => {
    try {
      setIsEditLoading(true)
      const updateInput: Record<string, string | null> = {}

      if (editLabel !== undefined) updateInput.label_SET = editLabel
      if (editDescription !== undefined)
        updateInput.description_SET = editDescription || null

      const where = { id_EQ: resonanceId }

      await updateResonance({
        variables: { where, update: updateInput },
        refetchQueries: ['GetResonanceLinkDetails'],
      })

      handleEditCancel()
    } catch (err) {
      console.error('Failed to update resonance:', err)
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleteLoading(true)
      await deleteResonance({ variables: { id: resonanceId } })
      router.push('/protected/dashboard')
    } catch (err) {
      console.error('Failed to delete resonance:', err)
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

  if (error || !resonance) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors flex items-center justify-center">
        <div className="text-red-500">Error loading resonance</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20">
      <ProfileBackground />

      {/* Decorative Blobs */}
      <div className="absolute top-40 -left-20 w-96 h-96 bg-gp-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-gp-accent-glow/10 rounded-full blur-[120px] pointer-events-none"></div>

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
              Edit Resonance
            </h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Label */}
              <div>
                <label className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-surface-light dark:bg-gp-surface-dark-light text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gp-ink-strong dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-surface-light dark:bg-gp-surface-dark-light text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gp-glass-border">
              <button
                onClick={handleEditCancel}
                disabled={isEditLoading}
                className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-surface-light dark:hover:bg-gp-surface-dark-light disabled:opacity-50 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={isEditLoading}
                className="px-6 py-2 rounded-lg bg-gp-primary text-white hover:bg-gp-primary/90 disabled:opacity-50 transition-colors font-medium cursor-pointer"
              >
                {isEditLoading ? 'Saving...' : 'Save'}
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
              Delete Resonance?
            </h2>

            <p className="text-gp-ink-muted dark:text-gp-ink-soft mb-6">
              This action cannot be undone. The resonance link between these
              pulses will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleteLoading}
                className="flex-1 px-4 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-surface-light dark:hover:bg-gp-surface-dark-light disabled:opacity-50 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleteLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors font-medium cursor-pointer"
              >
                {isDeleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative w-full max-w-6xl mx-auto px-6 pb-20 pt-12">
        {/* Liquid Cloud Container */}
        <div className="relative overflow-hidden backdrop-blur-[50px] bg-gp-glass-bg dark:bg-gp-glass-bg border border-gp-glass-border rounded-[5rem] p-8 md:p-12 lg:p-20 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)]">
          {/* Decorative Circles */}
          <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-gp-primary/5 border border-gp-primary/10 backdrop-blur-sm pointer-events-none"></div>
          <div className="absolute bottom-20 left-10 w-16 h-16 rounded-full bg-gp-accent-glow/5 border border-gp-accent-glow/10 backdrop-blur-sm pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-white mb-4">
                Resonance Alignment
              </h1>
              <p className="text-gp-ink-muted dark:text-gp-ink-soft text-xs uppercase tracking-[0.3em] font-medium">
                Sensing Harmony Between Pulses
              </p>
            </div>

            {/* Pulse Connection Grid */}
            <div className="flex flex-col items-center gap-8 mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-6 w-full">
                {/* Source Pulse Card */}
                {source && (
                  <div className="relative group bg-white/30 dark:bg-white/5 backdrop-blur-[20px] border border-white/50 dark:border-white/10 rounded-[2.5rem] p-8 transition-all duration-500 hover:scale-[1.02]">
                    <div className="flex items-center gap-3 mb-6">
                      <span
                        className={cn(
                          'material-symbols-outlined text-[20px]',
                          getConfigForType(
                            typenameToNodeType(source.__typename ?? '')
                          ).color
                        )}
                      >
                        {getIconForType(
                          typenameToNodeType(source.__typename ?? '')
                        )}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold tracking-widest uppercase',
                          getConfigForType(
                            typenameToNodeType(source.__typename ?? '')
                          ).color
                        )}
                      >
                        {source.__typename?.replace('Pulse', '')}Pulse
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-gp-ink-strong dark:text-white leading-tight mb-4">
                      {source.title || 'Untitled Pulse'}
                    </h3>
                    <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft mb-4 line-clamp-2">
                      {source.content || 'No description'}
                    </p>
                    {source.location && (
                      <div className="flex items-center gap-1.5 mb-4 text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span>{source.location}</span>
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className={cn(
                          'px-3 py-1 text-[10px] font-semibold rounded-full bg-white/20 dark:bg-black/20',
                          getConfigForType(
                            typenameToNodeType(source.__typename ?? '')
                          ).color
                        )}
                      >
                        SOURCE
                      </span>
                      {source.intensity && (
                        <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800/50 text-[10px] font-semibold text-slate-600 dark:text-slate-400 rounded-full">
                          {source.intensity}/5
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        router.push(`/protected/dashboard/pulses/${source.id}`)
                      }
                      className="mt-6 w-full px-4 py-2 rounded-full bg-gp-primary/10 dark:bg-gp-primary/20 text-gp-primary text-sm font-medium hover:bg-gp-primary/20 dark:hover:bg-gp-primary/30 transition-all cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                )}

                {/* Resonance Connection */}
                <div className="relative h-40 lg:h-full flex items-center justify-center min-w-30 lg:min-w-50">
                  {/* Wave Animation */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-30 overflow-hidden pointer-events-none">
                    <svg
                      className="opacity-40 w-full h-full"
                      preserveAspectRatio="none"
                      viewBox="0 0 200 100"
                    >
                      <path
                        d="M0,50 C50,20 150,80 200,50"
                        fill="transparent"
                        stroke="currentColor"
                        className="text-gp-primary"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M0,50 C50,80 150,20 200,50"
                        fill="transparent"
                        stroke="currentColor"
                        className="text-gp-primary"
                        strokeDasharray="4 4"
                        strokeWidth="0.5"
                      />
                    </svg>
                  </div>

                  {/* Connection Icon */}
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-lg flex items-center justify-center text-gp-primary border border-gp-primary/20">
                      <span className="material-symbols-outlined text-[24px]">
                        sync_alt
                      </span>
                    </div>
                    <div className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] bg-white/80 dark:bg-white/10 backdrop-blur-[10px] border border-gp-primary/20 text-gp-primary shadow-sm">
                      {formatResonanceLabel(resonance.label)}
                    </div>
                  </div>
                </div>

                {/* Target Pulse Card */}
                {target && (
                  <div className="relative group bg-white/30 dark:bg-white/5 backdrop-blur-[20px] border border-white/50 dark:border-white/10 rounded-[2.5rem] p-8 transition-all duration-500 hover:scale-[1.02]">
                    <div className="flex items-center gap-3 mb-6">
                      <span
                        className={cn(
                          'material-symbols-outlined text-[20px]',
                          getConfigForType(
                            typenameToNodeType(target.__typename ?? '')
                          ).color
                        )}
                      >
                        {getIconForType(
                          typenameToNodeType(target.__typename ?? '')
                        )}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold tracking-widest uppercase',
                          getConfigForType(
                            typenameToNodeType(target.__typename ?? '')
                          ).color
                        )}
                      >
                        {target.__typename?.replace('Pulse', '')}Pulse
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-gp-ink-strong dark:text-white leading-tight mb-4">
                      {target.title || 'Untitled Pulse'}
                    </h3>
                    <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft mb-4 line-clamp-2">
                      {target.content || 'No description'}
                    </p>
                    {target.location && (
                      <div className="flex items-center gap-1.5 mb-4 text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span>{target.location}</span>
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className={cn(
                          'px-3 py-1 text-[10px] font-semibold rounded-full bg-white/20 dark:bg-black/20',
                          getConfigForType(
                            typenameToNodeType(target.__typename ?? '')
                          ).color
                        )}
                      >
                        TARGET
                      </span>
                      {target.intensity && (
                        <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800/50 text-[10px] font-semibold text-slate-600 dark:text-slate-400 rounded-full">
                          {target.intensity}/5
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        router.push(`/protected/dashboard/pulses/${target.id}`)
                      }
                      className="mt-6 w-full px-4 py-2 rounded-full bg-gp-accent-glow/10 dark:bg-gp-accent-glow/20 text-gp-accent-glow text-sm font-medium hover:bg-gp-accent-glow/20 dark:hover:bg-gp-accent-glow/30 transition-all cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>

              {/* Insight Card */}
              {resonance.description && (
                <div className="max-w-2xl w-full">
                  <div className="bg-white/20 dark:bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/40 dark:border-white/10 text-center shadow-sm">
                    <span className="material-symbols-outlined text-gp-primary mb-4 text-[32px] inline-block">
                      temp_preferences_custom
                    </span>
                    <p className="text-gp-ink-muted dark:text-gp-ink-soft text-lg font-light leading-relaxed">
                      {resonance.description}
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <div className="h-px w-8 bg-gp-ink-muted/30"></div>
                      <span className="text-[10px] font-bold text-gp-ink-muted dark:text-gp-ink-soft tracking-[0.2em] uppercase">
                        Insight Core
                      </span>
                      <div className="h-px w-8 bg-gp-ink-muted/30"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => router.back()}
                className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/20 text-gp-ink-strong dark:text-white font-medium hover:bg-white/80 dark:hover:bg-white/20 transition-all text-sm shadow-sm cursor-pointer w-full sm:w-auto"
              >
                Back
              </button>
              <button
                onClick={handleEditStart}
                className="px-8 py-3 rounded-full bg-gp-primary text-white font-semibold hover:shadow-[0_8px_25px_rgba(var(--gp-primary),0.4)] hover:scale-[1.02] transition-all text-sm cursor-pointer w-full sm:w-auto"
              >
                Edit Resonance
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-8 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 hover:scale-[1.02] transition-all text-sm cursor-pointer w-full sm:w-auto"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
