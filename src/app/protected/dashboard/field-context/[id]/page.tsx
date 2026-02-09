'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { GET_FIELD_CONTEXT_DETAILS } from '@/app/graphql/queries/FIELD_CONTEXT_DETAILS_QUERIES'
import {
  UPDATE_FIELD_CONTEXT_MUTATION,
  DELETE_FIELD_CONTEXT_MUTATION,
} from '@/app/graphql/mutations'
import { cn } from '@/lib/utils'
import { useAnimations } from '@/contexts'

export default function FieldContextDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const contextId = params?.id as string
  const { animationsEnabled } = useAnimations()
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editEmergentName, setEditEmergentName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data, loading, error } = useQuery(GET_FIELD_CONTEXT_DETAILS, {
    variables: { contextId },
    skip: !contextId,
  })

  // Setup mutations
  const [updateFieldContext] = useMutation(UPDATE_FIELD_CONTEXT_MUTATION)
  const [deleteFieldContext] = useMutation(DELETE_FIELD_CONTEXT_MUTATION)

  const context = data?.fieldContexts?.[0]
  const space = context?.space?.[0]
  const pulses = context?.pulses || []

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
      const updateInput: Record<string, string | undefined> = {}
      if (editTitle) updateInput.title_SET = editTitle
      if (editEmergentName) updateInput.emergentName_SET = editEmergentName

      const where = { id_EQ: contextId }

      await updateFieldContext({
        variables: { where, update: updateInput },
        refetchQueries: ['GetFieldContextDetails'],
      })

      setIsEditMode(false)
      setEditTitle('')
      setEditEmergentName('')
    } catch (err) {
      console.error('Failed to update context:', err)
    }
  }

  const handleDelete = async () => {
    try {
      if (!context) return

      await deleteFieldContext({
        variables: { id: contextId },
      })

      router.push('/protected/dashboard')
    } catch (err) {
      console.error('Failed to delete context:', err)
      setShowDeleteConfirm(false)
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
                  className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-6 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  Save Changes
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

            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft mb-6">
              Are you sure you want to delete this context and all its pulses?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete
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

          {/* Grid Layout - Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Space Info Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="location_on" title="Space" />
              <ProfileCard>
                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-gp-primary block mb-1">
                      {space?.__typename || 'Space'}
                    </span>
                    <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white mb-1">
                      {space?.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                    {space?.visibility}
                  </p>
                </div>
              </ProfileCard>
            </div>

            {/* Metadata Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="info" title="Metadata" />
              <ProfileCard>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Created
                    </span>
                    <p className="text-xs font-semibold text-gp-ink-strong dark:text-white">
                      {createdDate}
                    </p>
                  </div>
                </div>
              </ProfileCard>
            </div>

            {/* Pulses Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <SectionHeader icon="waves" title="Pulses" />
              <ProfileCard>
                <div className="space-y-3">
                  {pulses.length > 0 ? (
                    pulses.map((pulse, idx) => (
                      <div
                        key={pulse.id}
                        className={
                          idx > 0 ? 'border-t border-gp-glass-border pt-3' : ''
                        }
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <span className="text-[9px] uppercase font-semibold text-gp-accent-glow block mb-0.5">
                              {pulse.__typename}
                            </span>
                            <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                              {pulse.title}
                            </h4>
                          </div>
                        </div>
                        {pulse.content && (
                          <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed mt-1">
                            {pulse.content.substring(0, 150)}
                            {pulse.content.length > 150 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                      No pulses yet
                    </p>
                  )}
                </div>
              </ProfileCard>
            </div>

            {/* Summary Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <SectionHeader icon="summarize" title="Summary" />
              <ProfileCard>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                      Total Pulses
                    </span>
                    <span className="text-lg font-bold text-gp-primary">
                      {pulses.length}
                    </span>
                  </div>
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
              Edit Context
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-8 py-3 rounded-full bg-red-500/20 dark:bg-red-500/10 border border-red-500/50 dark:border-red-500/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-500/30 dark:hover:bg-red-500/20 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              Delete Context
            </button>
          </div>
        </ProfileLayout>
      </main>
    </div>
  )
}
