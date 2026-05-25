'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

export interface FieldContextCardProps {
  context: {
    id: string
    title: string
    emergentName?: string | null
    createdAt: string
    pulses?: Array<{ id: string }> | null
  }
  /** Drives the accent palette so cards inherit their owning space's
   *  warm (Me) vs cool (We) treatment. */
  spaceKind: 'MeSpace' | 'WeSpace'
  onEdit?: (id: string) => void
}

/**
 * Single FieldContext tile inside `<SpaceDashboardView />`. Mirrors the
 * SpaceCard design language (`spaces-overview.tsx`) — top accent strip,
 * icon block, type chip, ghost hover edit button — but scoped to one
 * FieldContext inside a single space. Clicking opens the existing
 * `/protected/dashboard/field-context/[id]` route.
 */
export function FieldContextCard({
  context,
  spaceKind,
  onEdit,
}: FieldContextCardProps) {
  const router = useRouter()
  const isMe = spaceKind === 'MeSpace'
  const openPage = () =>
    router.push(`/protected/dashboard/field-context/${context.id}`)
  const pulseCount = context.pulses?.length ?? 0
  const timeAgo = (() => {
    const d = new Date(context.createdAt)
    return Number.isNaN(d.getTime())
      ? '—'
      : formatDistanceToNow(d, { addSuffix: true })
  })()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPage}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openPage()
        }
      }}
      className={cn(
        'group relative text-left rounded-2xl p-5 border overflow-hidden transition-all cursor-pointer',
        'hover:-translate-y-0.5 hover:shadow-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
        isMe
          ? 'border-amber-300/30 dark:border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent hover:from-amber-500/20 hover:via-rose-500/10'
          : 'border-teal-300/30 dark:border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent hover:from-teal-500/20 hover:via-emerald-500/10'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
          isMe ? 'from-amber-400 to-rose-400' : 'from-teal-400 to-emerald-400'
        )}
      />

      {onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(context.id)
          }}
          aria-label={`Edit ${context.title}`}
          title="Edit field"
          className={cn(
            'absolute top-3 right-3 z-10 flex items-center justify-center size-7 rounded-full',
            'bg-white/10 dark:bg-white/5 border border-white/15 backdrop-blur-md',
            'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
            'hover:bg-white/20 dark:hover:bg-white/15 transition-all cursor-pointer'
          )}
        >
          <span className="material-symbols-outlined text-[14px] text-white/80">
            edit
          </span>
        </button>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            'size-12 rounded-2xl border flex items-center justify-center shadow-md group-hover:scale-110 transition-transform',
            isMe
              ? 'bg-amber-500/20 border-amber-300/40 text-amber-200'
              : 'bg-teal-500/20 border-teal-300/40 text-teal-200'
          )}
        >
          <span className="material-symbols-outlined text-2xl">category</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
            {context.title || 'Untitled field'}
          </h3>
          {context.emergentName && (
            <p className="text-xs italic text-slate-500 dark:text-white/55 truncate mt-0.5">
              &quot;{context.emergentName}&quot;
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-white/65">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">
            graphic_eq
          </span>
          <span>
            {pulseCount} {pulseCount === 1 ? 'pulse' : 'pulses'}
          </span>
        </div>
        <div className="ml-auto text-[10px] text-slate-400 dark:text-white/40">
          {timeAgo}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-white/40">
          Field Context
        </span>
        <span
          className={cn(
            'material-symbols-outlined text-base transition-transform group-hover:translate-x-1',
            isMe ? 'text-amber-300/70' : 'text-teal-300/70'
          )}
        >
          arrow_forward
        </span>
      </div>
    </div>
  )
}
