'use client'

import { useState, type FC } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import { ArrowRight, Waves } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GET_RESONANCE_LINK_DETAILS } from '@/app/graphql/queries/RESONANCE_QUERIES'
import {
  UPDATE_RESONANCE_LINK_MUTATION,
  DELETE_RESONANCE_LINK_MUTATION,
} from '@/app/graphql/mutations'
import { LOG_RESONANCE_ACTIVITY } from '@/app/graphql/mutations/ACTIVITY_LOG_MUTATIONS'
import { formatResonanceLabel } from '@/utils/graph-utils'
import {
  getIconForType,
  getConfigForType,
  type NodeType,
} from '@/lib/pulse-type-config'
import {
  BodySkeleton,
  EditCta,
  EditFooter,
  EditTextInput,
  EditTextarea,
  ErrorBody,
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data, loading, error, refetch } = useQuery(
    GET_RESONANCE_LINK_DETAILS,
    {
      variables: { resonanceId },
      fetchPolicy: 'cache-and-network',
    }
  )

  const [updateResonance] = useMutation(UPDATE_RESONANCE_LINK_MUTATION)
  const [deleteResonance] = useMutation(DELETE_RESONANCE_LINK_MUTATION)
  const [logResonanceActivity] = useMutation(LOG_RESONANCE_ACTIVITY)

  if (loading && !data) return <BodySkeleton />

  const resonance = data?.resonanceLinks?.[0]
  if (!resonance) {
    if (error) return <ErrorBody detail={error.message} onRetry={() => refetch()} />
    return <NotFoundBody />
  }

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
  const contextId = resonance.context?.[0]?.id

  const handleEditStart = () => {
    setEditLabel(resonance.label || '')
    setEditDescription(resonance.description || '')
    setIsEditMode(true)
  }

  const handleEditCancel = () => {
    setIsEditMode(false)
    setEditLabel('')
    setEditDescription('')
  }

  const handleEditSave = async () => {
    const trimmedLabel = editLabel.trim()
    if (!trimmedLabel) {
      toast.error('Label is required.')
      return
    }
    try {
      setIsEditLoading(true)
      // confidence is AI-generated from resonance discovery; leave it alone here
      // so user edits don't pollute the ranking signal.
      const updateInput: Record<string, string | null> = {
        label_SET: trimmedLabel,
        description_SET: editDescription.trim() || null,
      }
      await updateResonance({
        variables: { where: { id_EQ: resonanceId }, update: updateInput },
        refetchQueries: ['GetResonanceLinkDetails'],
      })
      if (contextId && source?.id && target?.id) {
        logResonanceActivity({
          variables: {
            input: {
              action: 'updated',
              resonanceId,
              sourceId: source.id,
              sourceName: source.title || 'Pulse',
              targetId: target.id,
              targetName: target.title || 'Pulse',
              label: trimmedLabel,
              contextId,
            },
          },
        }).catch((err) =>
          console.warn('Failed to log resonance update:', err)
        )
      }
      toast.success('Resonance updated.')
      setIsEditMode(false)
    } catch (err) {
      console.error('Failed to update resonance:', err)
      toast.error(
        err instanceof Error
          ? err.message
          : 'Could not update resonance. Please try again.'
      )
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleteLoading(true)
      await deleteResonance({ variables: { id: resonanceId } })
      if (contextId && source?.id && target?.id) {
        logResonanceActivity({
          variables: {
            input: {
              action: 'deleted',
              resonanceId,
              sourceId: source.id,
              sourceName: source.title || 'Pulse',
              targetId: target.id,
              targetName: target.title || 'Pulse',
              label: resonance.label || 'resonance',
              contextId,
            },
          },
        }).catch((err) =>
          console.warn('Failed to log resonance deletion:', err)
        )
      }
      toast.success('Resonance deleted.')
      dispatchCloseInfoDrawer()
    } catch (err) {
      console.error('Failed to delete resonance:', err)
      toast.error(
        err instanceof Error
          ? err.message
          : 'Could not delete resonance. Please try again.'
      )
    } finally {
      setIsDeleteLoading(false)
      setShowDeleteConfirm(false)
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
            {isEditMode ? (
              <EditTextInput
                id="resonance-edit-label"
                label="Label"
                value={editLabel}
                onChange={setEditLabel}
                placeholder="e.g. APPLIED_TO, REINFORCES"
                autoFocus
                disabled={isEditLoading}
              />
            ) : (
              <h2 className="text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words leading-tight">
                {formatResonanceLabel(resonance.label ?? null)}
              </h2>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border bg-gp-primary/20 border-gp-primary/40 text-gp-primary">
              Resonance
            </span>
          </div>
        </div>
      </section>

      {isEditMode ? (
        <section className="px-6 py-5 border-b border-gp-glass-border">
          <EditTextarea
            id="resonance-edit-description"
            label="Insight"
            value={editDescription}
            onChange={setEditDescription}
            placeholder="What pattern does this resonance surface?"
            rows={4}
            disabled={isEditLoading}
          />
        </section>
      ) : (
        resonance.description && (
          <section className="px-6 py-5 border-b border-gp-glass-border">
            <SectionHeader>Insight</SectionHeader>
            <p className="mt-2 text-sm text-gp-ink-muted dark:text-white/65 italic leading-relaxed">
              &quot;{resonance.description}&quot;
            </p>
          </section>
        )
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
        {isEditMode ? (
          <EditFooter
            onCancel={handleEditCancel}
            onSave={handleEditSave}
            saving={isEditLoading}
          />
        ) : showDeleteConfirm ? (
          <div className="space-y-2">
            <p className="text-xs text-red-600 dark:text-red-300">
              Delete this resonance? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <SecondaryCta
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleteLoading}
                className="flex-1"
              >
                Cancel
              </SecondaryCta>
              <SecondaryCta
                onClick={handleDelete}
                disabled={isDeleteLoading}
                variant="danger"
                className="flex-1"
              >
                {isDeleteLoading ? 'Deleting…' : 'Confirm delete'}
              </SecondaryCta>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <PrimaryCta onClick={handleEditStart} className="flex-1">
              <EditIcon /> Edit
            </PrimaryCta>
            <SecondaryCta
              onClick={() => setShowDeleteConfirm(true)}
              variant="danger"
              className="flex-1"
            >
              Delete
            </SecondaryCta>
          </div>
        )}
      </footer>
    </div>
  )
}

const EditIcon: FC = () => (
  <span className="material-symbols-outlined text-[18px]">edit</span>
)

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
