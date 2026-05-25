'use client'

import { useState, type FC } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, Layers, Lock, Sparkles, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts'
import { GET_SPACE_DETAILS } from '@/app/graphql/queries/SPACE_DETAILS_QUERIES'
import {
  UPDATE_ME_SPACE_MUTATION,
  UPDATE_WE_SPACE_MUTATION,
} from '@/app/graphql/mutations'
import { LOG_SPACE_ACTIVITY } from '@/app/graphql/mutations/ACTIVITY_LOG_MUTATIONS'
import { SpaceVisibility } from '@/gql/graphql'
import {
  BodySkeleton,
  EditCta,
  EditFooter,
  EditTextInput,
  NotFoundBody,
  PrimaryCta,
  SectionHeader,
  StatCell,
} from './shared'
import { dispatchOpenInfoDrawer } from './types'

export const SpaceDetailsBody: FC<{ spaceId: string }> = ({ spaceId }) => {
  const router = useRouter()
  const { user } = useApp()
  const [isEditMode, setIsEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [editVisibility, setEditVisibility] = useState<SpaceVisibility>(
    SpaceVisibility.Private
  )
  const [isSaving, setIsSaving] = useState(false)

  const { data, loading } = useQuery(GET_SPACE_DETAILS, {
    variables: { spaceId },
    fetchPolicy: 'cache-and-network',
  })
  const [updateMeSpace] = useMutation(UPDATE_ME_SPACE_MUTATION)
  const [updateWeSpace] = useMutation(UPDATE_WE_SPACE_MUTATION)
  const [logSpaceActivity] = useMutation(LOG_SPACE_ACTIVITY)

  if (loading && !data) return <BodySkeleton />

  type SpaceData = NonNullable<typeof data>['spaces'][number]
  const space = data?.spaces?.[0] as SpaceData | undefined
  if (!space) return <NotFoundBody />

  const isMe = space.__typename === 'MeSpace'
  const accent = isMe
    ? {
        gradient: 'from-amber-500/30 via-rose-500/20 to-transparent',
        chipBg: 'bg-amber-500/20 border-amber-400/40 text-amber-100',
        iconBg: 'bg-amber-500/20 border-amber-300/40 text-amber-200',
        iconName: 'self_improvement',
        subtitle: 'Inner Sanctuary',
      }
    : {
        gradient: 'from-teal-500/30 via-emerald-500/20 to-transparent',
        chipBg: 'bg-teal-500/20 border-teal-400/40 text-teal-100',
        iconBg: 'bg-teal-500/20 border-teal-300/40 text-teal-200',
        iconName: 'groups',
        subtitle: 'Collective Field',
      }

  const ownerArr = ('owner' in space ? space.owner : undefined) ?? []
  const owner = ownerArr[0]
  const ownerName =
    owner && (owner.firstName || owner.lastName)
      ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim()
      : owner?.name ?? 'Unknown'
  const isOwner = !!user?.id && owner?.id === user.id

  const members = ('members' in space ? space.members : undefined) ?? []
  const contexts = ('contexts' in space ? space.contexts : undefined) ?? []
  const totalPulses = contexts.reduce(
    (acc, ctx) => acc + (ctx?.pulses?.length ?? 0),
    0
  )

  const created = space.createdAt ? new Date(space.createdAt) : null
  const createdLabel =
    created && !Number.isNaN(created.getTime())
      ? formatDistanceToNow(created, { addSuffix: true })
      : '—'

  const handleEditStart = () => {
    setEditName(space.name ?? '')
    setEditVisibility(
      space.visibility === 'SHARED'
        ? SpaceVisibility.Shared
        : SpaceVisibility.Private
    )
    setIsEditMode(true)
  }

  const handleEditCancel = () => {
    setIsEditMode(false)
    setEditName('')
    setEditVisibility(SpaceVisibility.Private)
  }

  const handleEditSave = async () => {
    const trimmedName = editName.trim()
    if (!trimmedName) {
      toast.error('Name is required.')
      return
    }
    try {
      setIsSaving(true)
      const variables = {
        where: { id_EQ: spaceId },
        update: {
          name_SET: trimmedName,
          visibility_SET: editVisibility,
        },
      }
      if (isMe) {
        await updateMeSpace({ variables })
      } else {
        await updateWeSpace({ variables })
      }
      logSpaceActivity({
        variables: {
          input: {
            action: 'updated',
            spaceId,
            spaceName: trimmedName,
            spaceType: isMe ? 'MeSpace' : 'WeSpace',
          },
        },
      }).catch((err) => console.warn('Failed to log space update:', err))
      toast.success('Space updated.')
      setIsEditMode(false)
    } catch (err) {
      console.error('Failed to update space:', err)
      toast.error(
        err instanceof Error
          ? err.message
          : 'Could not update space. Please try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col">
      <section
        className={cn(
          'relative px-6 pt-7 pb-8 border-b border-gp-glass-border',
          'bg-gradient-to-br',
          accent.gradient
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'shrink-0 size-14 rounded-2xl border flex items-center justify-center shadow-md',
              accent.iconBg
            )}
          >
            <span className="material-symbols-outlined text-3xl">
              {accent.iconName}
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            {isEditMode ? (
              <div className="space-y-3">
                <EditTextInput
                  id="space-edit-name"
                  label="Name"
                  value={editName}
                  onChange={setEditName}
                  placeholder="Space name"
                  autoFocus
                  disabled={isSaving}
                />
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted dark:text-white/50">
                    Visibility
                  </label>
                  <div className="flex gap-2">
                    <VisibilityChoice
                      label="Private"
                      hint="Only you and members"
                      active={editVisibility === SpaceVisibility.Private}
                      onClick={() =>
                        setEditVisibility(SpaceVisibility.Private)
                      }
                      disabled={isSaving}
                    />
                    <VisibilityChoice
                      label="Shared"
                      hint="Discoverable"
                      active={editVisibility === SpaceVisibility.Shared}
                      onClick={() =>
                        setEditVisibility(SpaceVisibility.Shared)
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <h2 className="text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words leading-tight">
                {space.name || 'Untitled space'}
              </h2>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border',
                  accent.chipBg
                )}
              >
                {isMe ? 'Me Space' : 'We Space'}
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-gp-ink-muted dark:text-white/50">
                {accent.subtitle}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-5 grid grid-cols-2 gap-3">
        <StatCell
          icon={<Layers className="w-3.5 h-3.5" />}
          label="Field contexts"
          value={String(contexts.length)}
        />
        <StatCell
          icon={<Sparkles className="w-3.5 h-3.5" />}
          label="Total pulses"
          value={String(totalPulses)}
        />
        <StatCell
          icon={<Users className="w-3.5 h-3.5" />}
          label="Members"
          value={isMe ? '—' : String(members.length)}
        />
        <StatCell
          icon={<Lock className="w-3.5 h-3.5" />}
          label="Visibility"
          value={String(space.visibility || 'PRIVATE')}
          valueClassName="uppercase tracking-wider text-[11px]"
        />
      </section>

      <section className="px-6 pb-5">
        <SectionHeader>Owner</SectionHeader>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03] px-4 py-3">
          <div className="shrink-0 size-9 rounded-full border flex items-center justify-center bg-white/10 border-white/15 text-gp-ink-strong dark:text-white/85">
            <span className="text-xs font-bold">
              {(ownerName || '?').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gp-ink-strong dark:text-white/90 truncate">
              {ownerName}
              {isOwner && (
                <span className="ml-2 text-[10px] uppercase tracking-wider text-gp-primary">
                  You
                </span>
              )}
            </p>
            {owner?.email && (
              <p className="text-xs text-gp-ink-muted dark:text-white/50 truncate">
                {owner.email}
              </p>
            )}
            {owner?.id && (
              <button
                type="button"
                onClick={() =>
                  dispatchOpenInfoDrawer({
                    type: 'Person',
                    id: owner.id,
                    label: ownerName,
                  })
                }
                className="mt-1 text-[11px] text-gp-primary hover:underline cursor-pointer"
              >
                View profile →
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 pb-5">
        <SectionHeader>Field contexts</SectionHeader>
        {contexts.length === 0 ? (
          <div className="mt-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center">
            <Layers className="w-6 h-6 mx-auto mb-2 text-white/25" />
            <p className="text-sm text-gp-ink-muted dark:text-white/55">
              {isOwner
                ? 'No field contexts yet. Use the canvas to create one.'
                : 'No field contexts yet.'}
            </p>
          </div>
        ) : (
          <ul className="mt-2 space-y-2">
            {contexts.map((ctx) => (
              <li key={ctx.id}>
                <button
                  type="button"
                  onClick={() =>
                    dispatchOpenInfoDrawer({
                      type: 'FieldContext',
                      id: ctx.id,
                      label: ctx.title || ctx.emergentName || undefined,
                    })
                  }
                  className={cn(
                    'group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03]',
                    'hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20',
                    'px-4 py-3 transition-all cursor-pointer flex items-center gap-3'
                  )}
                >
                  <div className="size-8 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-gp-ink-muted dark:text-white/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gp-ink-strong dark:text-white/90 truncate">
                      {ctx.title || ctx.emergentName || 'Untitled field'}
                    </p>
                    <p className="text-[11px] text-gp-ink-muted dark:text-white/45">
                      {(ctx.pulses?.length ?? 0)} pulse
                      {(ctx.pulses?.length ?? 0) === 1 ? '' : 's'}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!isMe && members.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Members ({members.length})</SectionHeader>
          <ul className="mt-2 space-y-1.5">
            {members.slice(0, 6).map((m) => {
              const mp = m.member?.[0]
              const name = mp
                ? mp.name ||
                  `${mp.firstName ?? ''} ${mp.lastName ?? ''}`.trim() ||
                  'Member'
                : 'Member'
              const role = m.role || 'MEMBER'
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
                >
                  <button
                    type="button"
                    onClick={() =>
                      mp?.id &&
                      dispatchOpenInfoDrawer({
                        type: 'Person',
                        id: mp.id,
                        label: typeof name === 'string' ? name : undefined,
                      })
                    }
                    disabled={!mp?.id}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer disabled:cursor-default flex-1"
                  >
                    <div className="size-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/80">
                      {String(name).slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gp-ink-strong dark:text-white/85 truncate text-left">
                      {String(name)}
                    </span>
                  </button>
                  <span className="text-[10px] uppercase tracking-wider text-gp-ink-muted dark:text-white/45">
                    {role}
                  </span>
                </li>
              )
            })}
            {members.length > 6 && (
              <li className="text-[11px] text-gp-ink-muted dark:text-white/45 px-3 pt-1">
                + {members.length - 6} more
              </li>
            )}
          </ul>
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
            <PrimaryCta
              onClick={() =>
                router.push(`/protected/dashboard/space/${space.id}`)
              }
              className="flex-1"
            >
              Open full page
              <ArrowRight className="w-4 h-4" />
            </PrimaryCta>
            {isOwner && <EditCta onClick={handleEditStart} />}
          </div>
        )}
        <p className="text-center text-[11px] text-gp-ink-muted dark:text-white/45">
          Created {createdLabel}
        </p>
      </footer>
    </div>
  )
}

const VisibilityChoice: FC<{
  label: string
  hint: string
  active: boolean
  onClick: () => void
  disabled?: boolean
}> = ({ label, hint, active, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'flex-1 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      active
        ? 'border-gp-primary/60 bg-gp-primary/10 ring-1 ring-gp-primary/40'
        : 'border-gp-glass-border bg-white/40 hover:bg-white/60 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]'
    )}
  >
    <p className="text-xs font-semibold text-gp-ink-strong dark:text-white">
      {label}
    </p>
    <p className="text-[10px] text-gp-ink-muted dark:text-white/50 mt-0.5">
      {hint}
    </p>
  </button>
)
