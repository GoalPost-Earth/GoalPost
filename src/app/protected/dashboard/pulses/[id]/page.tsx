'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { GET_PULSE_DETAILS_WITH_CONTEXT } from '@/app/graphql/queries/PULSE_DETAILS_QUERIES'
import { cn } from '@/lib/utils'
import { useAnimations } from '@/contexts'
import { useState } from 'react'

export default function PulseDetailsPage() {
  const params = useParams()
  const pulseId = params?.id as string
  const { animationsEnabled } = useAnimations()
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const { data, loading, error } = useQuery(GET_PULSE_DETAILS_WITH_CONTEXT, {
    variables: { pulseId },
    skip: !pulseId,
  })

  const pulse = data?.fieldPulses?.[0]
  const context = pulse?.context?.[0]
  const space = context?.space?.[0]
  const contextPulses = context?.pulses || []

  // const handleEditStart = () => {
  //   setEditTitle(pulse?.title || '')
  //   setEditContent(pulse?.content || '')
  //   setIsEditMode(true)
  // }

  const handleEditCancel = () => {
    setIsEditMode(false)
    setEditTitle('')
    setEditContent('')
  }

  const handleEditSave = async () => {
    try {
      setIsEditLoading(true)
      const updateInput: Record<string, string | undefined> = {}
      if (editTitle) updateInput.title_SET = editTitle
      if (editContent) updateInput.content_SET = editContent

      const where = { id_EQ: pulseId }

      switch (pulse?.__typename) {
        case 'GoalPulse':
          await updateGoalPulse({
            variables: { where, update: updateInput },
            refetchQueries: ['GetPulseDetailsWithContext'],
          })
          break
        case 'ResourcePulse':
          await updateResourcePulse({
            variables: { where, update: updateInput },
            refetchQueries: ['GetPulseDetailsWithContext'],
          })
          break
        case 'StoryPulse':
          await updateStoryPulse({
            variables: { where, update: updateInput },
            refetchQueries: ['GetPulseDetailsWithContext'],
          })
          break
      }

      setIsEditMode(false)
      setEditTitle('')
      setEditContent('')
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

      const where = { id_EQ: pulseId }

      switch (pulse.__typename) {
        case 'GoalPulse':
          await deleteGoalPulse({ variables: { where } })
          break
        case 'ResourcePulse':
          await deleteResourcePulse({ variables: { where } })
          break
        case 'StoryPulse':
          await deleteStoryPulse({ variables: { where } })
          break
      }

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
                  placeholder="Pulse title"
                />
              </div>

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
            <span className="text-[9px] uppercase font-semibold text-gp-accent-glow mb-2">
              {pulse.__typename} • {context?.title}
            </span>
            <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
              {pulse.title}
            </h1>
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
              Created {createdDate}
            </p>
          </div>

          {/* Content Section */}
          <div className="mb-12">
            <div className="flex flex-col gap-4">
              <SectionHeader icon="description" title="Content" />
              <ProfileCard>
                <p className="text-sm text-gp-ink-strong dark:text-gp-ink-strong leading-relaxed">
                  {pulse.content}
                </p>
              </ProfileCard>
            </div>
          </div>

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
              <SectionHeader icon="waves" title="Related Pulses in Context" />
              <ProfileCard>
                <div className="space-y-3">
                  {contextPulses.length > 0 ? (
                    contextPulses.map((relatedPulse, idx) => (
                      <div
                        key={relatedPulse.id}
                        className={
                          idx > 0 ? 'border-t border-gp-glass-border pt-3' : ''
                        }
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <span className="text-[9px] uppercase font-semibold text-gp-accent-glow block mb-0.5">
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
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                      No other pulses in this context
                    </p>
                  )}
                </div>
              </ProfileCard>
            </div>

            {/* Metadata Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <SectionHeader icon="info" title="Metadata" />
              <ProfileCard>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Type
                    </span>
                    <p className="text-xs text-gp-ink-strong dark:text-white">
                      {pulse.__typename}
                    </p>
                  </div>
                </div>
              </ProfileCard>
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex items-center justify-center gap-6 w-full">
            <button className="px-8 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong font-medium hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm">
              Edit Pulse
            </button>
            <button className="px-10 py-3 rounded-full bg-gp-primary text-white font-semibold hover:shadow-[0_8px_25px_rgba(var(--gp-primary-rgb),0.4)] hover:scale-[1.02] transition-all text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                share
              </span>
              Share
            </button>
          </div> */}
        </ProfileLayout>
      </main>

      {/* Bottom Action Bar */}
      {/* <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-gp-glass-bg border border-gp-glass-border backdrop-blur-2xl shadow-xl dark:shadow-2xl">
          <button className="size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors hover:bg-gp-primary/10 dark:hover:bg-gp-primary/20">
            <span className="material-symbols-outlined">message</span>
          </button>
          <div className="w-px h-4 bg-gp-glass-border" />
          <button className="size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors hover:bg-gp-primary/10 dark:hover:bg-gp-primary/20">
            <span className="material-symbols-outlined">bookmark</span>
          </button>
        </div>
      </div> */}
    </div>
  )
}
