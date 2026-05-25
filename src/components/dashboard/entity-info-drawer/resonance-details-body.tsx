'use client'

import { useState, type FC } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { ArrowRight, Waves } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GET_RESONANCE_LINK_DETAILS } from '@/app/graphql/queries/RESONANCE_QUERIES'
import {
  UPDATE_RESONANCE_LINK_MUTATION,
  DELETE_RESONANCE_LINK_MUTATION,
} from '@/app/graphql/mutations'
import { formatResonanceLabel } from '@/utils/graph-utils'
import {
  getIconForType,
  getConfigForType,
  type NodeType,
} from '@/lib/pulse-type-config'
import {
  BodySkeleton,
  NotFoundBody,
  PrimaryCta,
  SectionHeader,
  SecondaryCta,
} from './shared'
import { dispatchCloseInfoDrawer, dispatchOpenInfoDrawer } from './types'

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

export const ResonanceDetailsBody: FC<{ resonanceId: string }> = ({
  resonanceId,
}) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editLabel, setEditLabel] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const { data, loading } = useQuery(GET_RESONANCE_LINK_DETAILS, {
    variables: { resonanceId },
    fetchPolicy: 'cache-and-network',
  })

  const [updateResonance] = useMutation(UPDATE_RESONANCE_LINK_MUTATION)
  const [deleteResonance] = useMutation(DELETE_RESONANCE_LINK_MUTATION)

  if (loading && !data) return <BodySkeleton />

  const resonance = data?.resonanceLinks?.[0]
  if (!resonance) return <NotFoundBody />

  // Filter out CarePulse / CoreValuePulse — the query only resolves the
  // three pulse subtypes that carry the fields this view renders.
  const sourceArr = resonance.source || []
  const targetArr = resonance.target || []
  const source = sourceArr.find(
    (p) =>
      p?.__typename &&
      ['GoalPulse', 'ResourcePulse', 'StoryPulse'].includes(p.__typename)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any
  const target = targetArr.find(
    (p) =>
      p?.__typename &&
      ['GoalPulse', 'ResourcePulse', 'StoryPulse'].includes(p.__typename)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any

  const handleEditStart = () => {
    setEditLabel(resonance.label || '')
    setEditDescription(resonance.description || '')
    setIsEditMode(true)
  }

  const handleEditSave = async () => {
    try {
      setIsEditLoading(true)
      const updateInput: Record<string, string | null> = {}
      updateInput.label_SET = editLabel
      updateInput.description_SET = editDescription || null
      await updateResonance({
        variables: { where: { id_EQ: resonanceId }, update: updateInput },
        refetchQueries: ['GetResonanceLinkDetails'],
      })
      setIsEditMode(false)
    } catch (err) {
      console.error('Failed to update resonance:', err)
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDelete = async () => {
    const ok = window.confirm(
      'Delete this resonance? This action cannot be undone.'
    )
    if (!ok) return
    try {
      setIsDeleteLoading(true)
      await deleteResonance({ variables: { id: resonanceId } })
      dispatchCloseInfoDrawer()
    } catch (err) {
      console.error('Failed to delete resonance:', err)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <section className="relative px-6 pt-7 pb-7 border-b border-gp-glass-border bg-gradient-to-br from-gp-primary/20 via-gp-accent-glow/10 to-transparent">
        <div className="flex items-start gap-4">
          <div className="shrink-0 size-14 rounded-2xl border flex items-center justify-center shadow-md bg-gp-primary/20 border-gp-primary/40 text-gp-primary">
            <Waves className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words leading-tight">
              {formatResonanceLabel(resonance.label ?? null)}
            </h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border bg-gp-primary/20 border-gp-primary/40 text-gp-primary">
              Resonance
            </span>
          </div>
        </div>
      </section>

      {resonance.description && (
        <section className="px-6 py-5 border-b border-gp-glass-border">
          <SectionHeader>Insight</SectionHeader>
          <p className="mt-2 text-sm text-gp-ink-muted dark:text-white/65 italic leading-relaxed">
            &quot;{resonance.description}&quot;
          </p>
        </section>
      )}

      <section className="px-6 py-5 space-y-3">
        {source && (
          <ResonancePulseCard
            label="Source"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pulse={source as any}
          />
        )}
        <div className="flex items-center justify-center text-gp-primary">
          <span className="material-symbols-outlined">sync_alt</span>
        </div>
        {target && (
          <ResonancePulseCard
            label="Target"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pulse={target as any}
          />
        )}
      </section>

      <footer className="mt-auto px-6 py-5 border-t border-gp-glass-border bg-white/[0.02] dark:bg-white/[0.02] space-y-3">
        <div className="flex gap-2">
          <PrimaryCta onClick={handleEditStart} className="flex-1">
            Edit
          </PrimaryCta>
          <SecondaryCta
            onClick={handleDelete}
            disabled={isDeleteLoading}
            variant="danger"
            className="flex-1"
          >
            {isDeleteLoading ? 'Deleting…' : 'Delete'}
          </SecondaryCta>
        </div>
      </footer>

      {isEditMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gp-glass-border">
            <h3 className="text-lg font-semibold text-gp-ink-strong dark:text-white mb-4">
              Edit resonance
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gp-ink-strong dark:text-white mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gp-glass-border bg-gp-surface-light dark:bg-gp-surface-dark-light text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gp-ink-strong dark:text-white mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg border border-gp-glass-border bg-gp-surface-light dark:bg-gp-surface-dark-light text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary resize-none text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <SecondaryCta
                onClick={() => setIsEditMode(false)}
                disabled={isEditLoading}
              >
                Cancel
              </SecondaryCta>
              <PrimaryCta onClick={handleEditSave} disabled={isEditLoading}>
                {isEditLoading ? 'Saving…' : 'Save'}
              </PrimaryCta>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ResonancePulseCard: FC<{
  label: 'Source' | 'Target'
  pulse: {
    id: string
    __typename: string
    title: string | null
    content: string | null
    intensity: number | null
    location: string | null
  }
}> = ({ label, pulse }) => {
  const nodeType = typenameToNodeType(pulse.__typename)
  const config = getConfigForType(nodeType)
  return (
    <button
      type="button"
      onClick={() =>
        dispatchOpenInfoDrawer({
          type: 'Pulse',
          id: pulse.id,
          label: pulse.title ?? undefined,
        })
      }
      className="group w-full text-left rounded-2xl border border-gp-glass-border bg-white/30 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/[0.08] transition-all px-5 py-4 cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn('material-symbols-outlined text-[16px]', config.color)}
        >
          {getIconForType(nodeType)}
        </span>
        <span
          className={cn(
            'text-[10px] font-bold tracking-widest uppercase',
            config.color
          )}
        >
          {label} · {pulse.__typename.replace('Pulse', '')}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all ml-auto" />
      </div>
      <h3 className="text-sm font-semibold text-gp-ink-strong dark:text-white leading-tight mb-1">
        {pulse.title || 'Untitled Pulse'}
      </h3>
      {pulse.content && (
        <p className="text-xs text-gp-ink-muted dark:text-white/65 line-clamp-2">
          {pulse.content}
        </p>
      )}
    </button>
  )
}
