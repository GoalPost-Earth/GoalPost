'use client'

import { useState, type FC } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowRight,
  Activity,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GET_PULSE_DETAILS_WITH_CONTEXT } from '@/app/graphql/queries/PULSE_DETAILS_QUERIES'
import {
  UPDATE_GOAL_PULSE_MUTATION,
  UPDATE_RESOURCE_PULSE_MUTATION,
  UPDATE_STORY_PULSE_MUTATION,
  LOG_PULSE_ACTIVITY,
} from '@/app/graphql/mutations'
import { LinkifiedText } from '@/components/ui/linkified-text'
import {
  PULSE_TYPE_CONFIG,
  type NodeType,
} from '@/lib/pulse-type-config'
import {
  SharePulseModal,
  type PulseDetails,
  type PulseKind,
} from '@/components/ui/pulse-panel'
import { usePulseSharing } from '@/hooks/usePulseSharing'
import {
  BodySkeleton,
  EditCta,
  EditFooter,
  EditTextInput,
  EditTextarea,
  ErrorBody,
  NotFoundBody,
  SectionHeader,
  StatCell,
} from './shared'
import { dispatchOpenInfoDrawer } from './types'

export const PulseDetailsBody: FC<{ pulseId: string }> = ({ pulseId }) => {
  const [showShareModal, setShowShareModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editWhy, setEditWhy] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const {
    sharePulseWithContext,
    removePulseFromContext,
    loading: sharingLoading,
  } = usePulseSharing()
  const { data, loading, error, refetch } = useQuery(
    GET_PULSE_DETAILS_WITH_CONTEXT,
    {
      variables: { pulseId },
      fetchPolicy: 'cache-and-network',
    }
  )
  const [updateGoalPulse] = useMutation(UPDATE_GOAL_PULSE_MUTATION)
  const [updateResourcePulse] = useMutation(UPDATE_RESOURCE_PULSE_MUTATION)
  const [updateStoryPulse] = useMutation(UPDATE_STORY_PULSE_MUTATION)
  const [logPulseActivity] = useMutation(LOG_PULSE_ACTIVITY)

  if (loading && !data) return <BodySkeleton />

  const pulse =
    data?.goalPulses?.[0] ||
    data?.resourcePulses?.[0] ||
    data?.storyPulses?.[0]

  if (!pulse) {
    if (error) return <ErrorBody detail={error.message} onRetry={() => refetch()} />
    return <NotFoundBody />
  }

  const nodeType = typenameToNodeType(pulse.__typename)
  const config = PULSE_TYPE_CONFIG[nodeType]
  const context = pulse.context?.[0]
  const space = context?.space?.[0]
  const isMe = space?.__typename === 'MeSpace'

  const created = pulse.createdAt ? new Date(pulse.createdAt) : null
  const createdLabel =
    created && !Number.isNaN(created.getTime())
      ? formatDistanceToNow(created, { addSuffix: true })
      : '—'

  const goal = pulse.__typename === 'GoalPulse' ? pulse : null
  const resource = pulse.__typename === 'ResourcePulse' ? pulse : null
  const story = pulse.__typename === 'StoryPulse' ? pulse : null

  const intensityPct =
    typeof pulse.intensity === 'number'
      ? Math.round(Math.max(0, Math.min(1, pulse.intensity)) * 100)
      : null

  const openContext = () => {
    if (!context?.id) return
    dispatchOpenInfoDrawer({
      type: 'FieldContext',
      id: context.id,
      label: context.title ?? undefined,
    })
  }

  const handleEditStart = () => {
    setEditTitle(pulse.title ?? '')
    setEditContent(pulse.content ?? '')
    setEditWhy((pulse.why as string | null | undefined) ?? '')
    setIsEditMode(true)
  }

  const handleEditCancel = () => {
    setIsEditMode(false)
    setEditTitle('')
    setEditContent('')
    setEditWhy('')
  }

  const handleEditSave = async () => {
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) {
      toast.error('Title is required.')
      return
    }
    try {
      setIsSaving(true)
      const update: Record<string, string | null> = {
        title_SET: trimmedTitle,
        content_SET: editContent,
        why_SET: editWhy.trim() || null,
      }
      const variables = { where: { id_EQ: pulseId }, update }
      const typename = pulse.__typename
      if (typename === 'GoalPulse') {
        await updateGoalPulse({ variables })
      } else if (typename === 'ResourcePulse') {
        await updateResourcePulse({ variables })
      } else if (typename === 'StoryPulse') {
        await updateStoryPulse({ variables })
      } else {
        throw new Error(`Editing ${String(typename)} is not supported here yet.`)
      }
      logPulseActivity({
        variables: {
          input: {
            action: 'updated',
            pulseId,
            pulseType: typename ?? 'Pulse',
            pulseName: trimmedTitle,
            contextId: context?.id,
          },
        },
      }).catch((err) => console.warn('Failed to log pulse update:', err))
      await refetch()
      toast.success('Pulse updated.')
      setIsEditMode(false)
    } catch (err) {
      console.error('Failed to update pulse:', err)
      toast.error(
        err instanceof Error
          ? err.message
          : 'Could not update pulse. Please try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col">
      <section
        className="relative px-6 pt-7 pb-7 border-b border-gp-glass-border"
        style={{
          backgroundImage: `linear-gradient(135deg, ${config.shadowColor}, transparent 70%)`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'shrink-0 size-14 rounded-2xl border flex items-center justify-center shadow-md',
              'bg-black/[0.04] dark:bg-white/5 border-black/10 dark:border-white/15',
              config.color
            )}
          >
            <span className="material-symbols-outlined text-3xl">
              {config.icon}
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            {isEditMode ? (
              <EditTextInput
                id="pulse-edit-title"
                label="Title"
                value={editTitle}
                onChange={setEditTitle}
                placeholder="Pulse title"
                autoFocus
                disabled={isSaving}
              />
            ) : (
              <h2 className="text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words leading-tight">
                {pulse.title || 'Untitled pulse'}
              </h2>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border',
                  'bg-black/[0.04] dark:bg-white/5 border-black/10 dark:border-white/15',
                  config.color
                )}
              >
                {config.label}
              </span>
              {space?.name && (
                <button
                  type="button"
                  onClick={openContext}
                  className="text-[11px] uppercase tracking-[0.16em] text-gp-ink-muted dark:text-white/50 hover:text-gp-ink-strong dark:hover:text-white/80 transition-colors cursor-pointer"
                  title={`Open ${context?.title || 'field'}`}
                  disabled={isEditMode}
                >
                  {isMe ? 'Me Space' : 'We Space'} · {space.name}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-5 grid grid-cols-2 gap-3">
        {goal && (
          <>
            <StatCell
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Status"
              value={String(goal.status || '—')}
              valueClassName="uppercase tracking-wider text-[11px]"
            />
            <StatCell
              icon={<Target className="w-3.5 h-3.5" />}
              label="Horizon"
              value={String(goal.horizon || '—')}
              valueClassName="uppercase tracking-wider text-[11px]"
            />
          </>
        )}
        {resource && (
          <>
            <StatCell
              icon={<Layers className="w-3.5 h-3.5" />}
              label="Resource type"
              value={String(resource.resourceType || '—')}
              valueClassName="text-[12px]"
            />
            <StatCell
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Availability"
              value={
                typeof resource.availability === 'number'
                  ? `${Math.round(resource.availability * 100)}%`
                  : '—'
              }
            />
          </>
        )}
        {story && (
          <>
            <StatCell
              icon={<Sparkles className="w-3.5 h-3.5" />}
              label="Level fulfilled"
              value={String(story.levelFulfilled || '—')}
              valueClassName="text-[12px]"
            />
            <StatCell
              icon={<Calendar className="w-3.5 h-3.5" />}
              label="Fulfillment"
              value={String(story.fulfillmentDate || '—')}
              valueClassName="text-[12px]"
            />
          </>
        )}
        <StatCell
          icon={<Sparkles className="w-3.5 h-3.5" />}
          label="Intensity"
          value={intensityPct !== null ? `${intensityPct}%` : '—'}
        />
        <StatCell
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Created"
          value={createdLabel}
          valueClassName="text-[12px]"
        />
      </section>

      {isEditMode ? (
        <section className="px-6 pb-5 space-y-4">
          <EditTextarea
            id="pulse-edit-why"
            label="Why"
            value={editWhy}
            onChange={setEditWhy}
            placeholder="Why does this pulse matter?"
            rows={3}
            disabled={isSaving}
          />
          <EditTextarea
            id="pulse-edit-content"
            label="Description"
            value={editContent}
            onChange={setEditContent}
            placeholder="Add detail, links, or context."
            rows={6}
            disabled={isSaving}
          />
        </section>
      ) : (
        <>
          {pulse.why && (
            <section className="px-6 pb-5">
              <SectionHeader>Why</SectionHeader>
              <p className="mt-2 text-sm italic text-gp-ink-muted dark:text-white/65 leading-relaxed">
                &quot;{pulse.why}&quot;
              </p>
            </section>
          )}

          {pulse.content && (
            <section className="px-6 pb-5">
              <SectionHeader>Description</SectionHeader>
              <div className="mt-2 text-sm text-gp-ink-strong dark:text-white/85 leading-relaxed whitespace-pre-wrap break-words">
                <LinkifiedText text={pulse.content} />
              </div>
            </section>
          )}
        </>
      )}

      {(pulse.location || pulse.time) && (
        <section className="px-6 pb-5 space-y-2">
          {pulse.location && (
            <div className="flex items-start gap-2 text-xs text-gp-ink-muted dark:text-white/55">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="break-words">{pulse.location}</span>
            </div>
          )}
          {pulse.time && (
            <div className="flex items-start gap-2 text-xs text-gp-ink-muted dark:text-white/55">
              <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="break-words">{pulse.time}</span>
            </div>
          )}
        </section>
      )}

      {goal && (goal.successMeasures || goal.activities) && (
        <section className="px-6 pb-5 space-y-4">
          {goal.successMeasures && (
            <div>
              <SectionHeader>Success measures</SectionHeader>
              <p className="mt-2 text-sm text-gp-ink-strong dark:text-white/85 leading-relaxed whitespace-pre-wrap break-words">
                {goal.successMeasures}
              </p>
            </div>
          )}
          {goal.activities && (
            <div>
              <SectionHeader>Activities</SectionHeader>
              <p className="mt-2 text-sm text-gp-ink-strong dark:text-white/85 leading-relaxed whitespace-pre-wrap break-words">
                {goal.activities}
              </p>
            </div>
          )}
        </section>
      )}

      {context && (
        <section className="px-6 pb-5">
          <SectionHeader>Field context</SectionHeader>
          <button
            type="button"
            onClick={openContext}
            className={cn(
              'group mt-2 w-full text-left rounded-xl border border-gp-glass-border',
              'bg-black/[0.03] dark:bg-white/[0.03]',
              'hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:border-black/15 dark:hover:border-white/20',
              'px-4 py-3 transition-all cursor-pointer flex items-center gap-3'
            )}
          >
            <div className="size-8 shrink-0 rounded-lg bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-gp-ink-muted dark:text-white/60" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gp-ink-strong dark:text-white/90 truncate">
                {context.title || context.emergentName || 'Untitled field'}
              </p>
              {space?.name && (
                <p className="text-[11px] text-gp-ink-muted dark:text-white/45 truncate">
                  in {space.name}
                </p>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-white/30 group-hover:text-slate-600 dark:group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
          </button>
        </section>
      )}

      <footer className="mt-auto px-6 py-5 border-t border-gp-glass-border bg-white/[0.02] dark:bg-white/[0.02] space-y-3">
        {isEditMode ? (
          <EditFooter
            onCancel={handleEditCancel}
            onSave={handleEditSave}
            saving={isSaving}
          />
        ) : (
          <div className="flex items-center gap-2">
            <EditCta onClick={handleEditStart} className="flex-1" />
            {(goal || resource || story) && (
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                title="Share or move this pulse to another field context"
                className={cn(
                  'flex items-center justify-center gap-2 px-4 h-11 rounded-xl',
                  'border border-gp-glass-border bg-white/40 hover:bg-white/60',
                  'dark:bg-white/5 dark:hover:bg-white/10',
                  'text-gp-ink-strong dark:text-white/85 text-sm font-medium',
                  'transition-all cursor-pointer'
                )}
              >
                <span className="material-symbols-outlined text-[18px]">
                  share
                </span>
              </button>
            )}
          </div>
        )}
        <p className="text-center text-[11px] text-gp-ink-muted dark:text-white/45">
          Created {createdLabel}
        </p>
      </footer>

      {showShareModal && (
        <SharePulseModal
          pulse={buildSharablePulse(pulse, nodeType)}
          currentContextId={context?.id}
          onShare={sharePulseWithContext}
          onRemove={removePulseFromContext}
          onMoveSuccess={async () => {
            await refetch()
          }}
          onClose={() => setShowShareModal(false)}
          isLoading={sharingLoading}
        />
      )}
    </div>
  )
}

function buildSharablePulse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pulse: any,
  nodeType: NodeType
): PulseDetails {
  const kind: PulseKind =
    nodeType === 'resource'
      ? 'resource'
      : nodeType === 'story'
        ? 'story'
        : 'goal'
  const ctx = pulse.context?.[0]
  return {
    id: pulse.id,
    type: kind,
    title: pulse.title ?? null,
    content: pulse.content ?? '',
    createdAt: pulse.createdAt ?? null,
    intensity: pulse.intensity ?? null,
    status: pulse.status ?? null,
    horizon: pulse.horizon ?? null,
    resourceType: pulse.resourceType ?? null,
    createdBy: [],
    contexts: ctx ? [{ id: ctx.id, title: ctx.title ?? null }] : [],
  }
}

function typenameToNodeType(typename?: string | null): NodeType {
  switch (typename) {
    case 'GoalPulse':
      return 'goal'
    case 'ResourcePulse':
      return 'resource'
    case 'StoryPulse':
      return 'story'
    case 'CarePulse':
      return 'care'
    case 'CoreValuePulse':
      return 'coreValue'
    default:
      return 'goal'
  }
}
