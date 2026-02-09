'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { GET_SPACE_DETAILS } from '@/app/graphql/queries/SPACE_DETAILS_QUERIES'
import {
  UPDATE_ME_SPACE_MUTATION,
  UPDATE_WE_SPACE_MUTATION,
  DELETE_ME_SPACE_MUTATION,
  DELETE_WE_SPACE_MUTATION,
} from '@/app/graphql/mutations'
import { cn } from '@/lib/utils'
import { useAnimations } from '@/contexts'

export default function SpaceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const spaceId = params?.id as string
  const { animationsEnabled } = useAnimations()
  const [isEditMode, setIsEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data, loading, error } = useQuery(GET_SPACE_DETAILS, {
    variables: { spaceId },
    skip: !spaceId,
  })

  // Setup mutations for different space types
  const [updateMeSpace] = useMutation(UPDATE_ME_SPACE_MUTATION)
  const [updateWeSpace] = useMutation(UPDATE_WE_SPACE_MUTATION)
  const [deleteMeSpace] = useMutation(DELETE_ME_SPACE_MUTATION)
  const [deleteWeSpace] = useMutation(DELETE_WE_SPACE_MUTATION)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const space = data?.spaces?.[0] as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const owner = space?.owner?.[0] as any
  const members = space?.members || []
  const contexts = space?.contexts || []

  const handleEditStart = () => {
    setEditName(space?.name || '')
    setIsEditMode(true)
  }

  const handleEditCancel = () => {
    setIsEditMode(false)
    setEditName('')
  }

  const handleEditSave = async () => {
    try {
      const updateInput: Record<string, string | undefined> = {}
      if (editName) updateInput.name_SET = editName

      const where = { id_EQ: spaceId }

      switch (space?.__typename) {
        case 'MeSpace':
          await updateMeSpace({
            variables: { where, update: updateInput },
            refetchQueries: ['GetSpaceDetails'],
          })
          break
        case 'WeSpace':
          await updateWeSpace({
            variables: { where, update: updateInput },
            refetchQueries: ['GetSpaceDetails'],
          })
          break
      }

      setIsEditMode(false)
      setEditName('')
    } catch (err) {
      console.error('Failed to update space:', err)
    }
  }

  const handleDelete = async () => {
    try {
      if (!space) return

      const where = { id_EQ: spaceId }

      switch (space.__typename) {
        case 'MeSpace':
          await deleteMeSpace({ variables: { where } })
          break
        case 'WeSpace':
          await deleteWeSpace({ variables: { where } })
          break
      }

      router.push('/protected/dashboard')
    } catch (err) {
      console.error('Failed to delete space:', err)
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

  if (error || !space) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors flex items-center justify-center">
        <div className="text-red-500">Error loading space</div>
      </div>
    )
  }

  const createdDate = new Date(space.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const totalPulses = contexts.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, ctx: any) => sum + (ctx.pulses?.length || 0),
    0
  )

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
              Edit {space.__typename}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-2">
                  Space Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gp-glass-border bg-gp-glass-bg dark:bg-gp-glass-bg/50 text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary"
                  placeholder="Space name"
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
              Delete {space.__typename}?
            </h2>

            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft mb-6">
              Are you sure you want to delete this space and all its contexts
              and pulses? This action cannot be undone.
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
              {space.__typename}
            </span>
            <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
              {space.name}
            </h1>
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
              Created {createdDate}
            </p>
          </div>

          {/* Grid Layout - Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Space Info Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="info" title="Space Info" />
              <ProfileCard>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Type
                    </span>
                    <p className="text-xs font-semibold text-gp-ink-strong dark:text-white">
                      {space.__typename}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Visibility
                    </span>
                    <p className="text-xs text-gp-ink-strong dark:text-white capitalize">
                      {space.visibility}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Created
                    </span>
                    <p className="text-xs text-gp-ink-strong dark:text-white">
                      {createdDate}
                    </p>
                  </div>
                </div>
              </ProfileCard>
            </div>

            {/* Owner Info Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader icon="person" title="Owner" />
              <ProfileCard>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Type
                    </span>
                    <p className="text-xs text-gp-ink-strong dark:text-white">
                      {owner?.__typename}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                      Name
                    </span>
                    <p className="text-xs font-semibold text-gp-ink-strong dark:text-white">
                      {owner?.name}
                    </p>
                  </div>
                  {owner?.__typename === 'Person' && owner?.email && (
                    <div>
                      <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                        Email
                      </span>
                      <p className="text-xs text-gp-ink-soft dark:text-gp-ink-soft truncate">
                        {owner.email}
                      </p>
                    </div>
                  )}
                </div>
              </ProfileCard>
            </div>

            {/* Members Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <SectionHeader icon="group" title="Members" />
              <ProfileCard>
                <div className="space-y-3">
                  {members.length > 0 ? (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    members.map((membership: any, idx: number) => {
                      const memberData = membership.member
                      return (
                        <div
                          key={membership.id}
                          className={
                            idx > 0
                              ? 'border-t border-gp-glass-border pt-3'
                              : ''
                          }
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] uppercase font-semibold text-gp-accent-glow">
                                  {memberData.__typename}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-semibold dark:bg-white/10 dark:border-white/10 dark:text-white/60">
                                  {membership.role}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                                {memberData.name}
                              </h4>
                            </div>
                          </div>
                          {memberData.__typename === 'Person' &&
                            memberData.email && (
                              <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                                {memberData.email}
                              </p>
                            )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                      No members yet
                    </p>
                  )}
                </div>
              </ProfileCard>
            </div>

            {/* Contexts Section */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <SectionHeader icon="category" title="Field Contexts" />
              <ProfileCard>
                <div className="space-y-3">
                  {contexts.length > 0 ? (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    contexts.map((context: any, idx: number) => (
                      <div
                        key={context.id}
                        className={
                          idx > 0 ? 'border-t border-gp-glass-border pt-3' : ''
                        }
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                              {context.title}
                            </h4>
                            {context.emergentName && (
                              <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft italic">
                                &quot;{context.emergentName}&quot;
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                            {context.pulses?.length || 0} pulses
                          </span>
                        </div>
                        {context.pulses && context.pulses.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {context.pulses.map((pulse: any) => (
                              <span
                                key={pulse.id}
                                className="px-2 py-0.5 rounded text-[9px] bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60"
                              >
                                {pulse.__typename}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                      No contexts yet
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
                      Total Contexts
                    </span>
                    <span className="text-lg font-bold text-gp-primary">
                      {contexts.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                      Total Pulses
                    </span>
                    <span className="text-lg font-bold text-gp-primary">
                      {totalPulses}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                      Members
                    </span>
                    <span className="text-lg font-bold text-gp-primary">
                      {members.length}
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
              Edit Space
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-8 py-3 rounded-full bg-red-500/20 dark:bg-red-500/10 border border-red-500/50 dark:border-red-500/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-500/30 dark:hover:bg-red-500/20 transition-all text-sm shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              Delete Space
            </button>
          </div>
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
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </div> */}
    </div>
  )
}
