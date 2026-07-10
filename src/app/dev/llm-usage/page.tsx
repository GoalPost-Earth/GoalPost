import { notFound } from 'next/navigation'
import {
  getLlmUsageReport,
  type UsageByModelRow,
  type UsageByActorRow,
  type UsageRecentRow,
  type LlmUsagePrincipal,
} from '@/lib/llm/usage/llm-usage.service'

/**
 * /dev/llm-usage — per-user, per-model LLM token & cost report (GOAL-297).
 *
 * Dev-gated internal tooling: env-checked here (belt-and-braces with the
 * /dev layout) so a direct route hit can never bypass the gate. NOT
 * user-scoped — shows spend across every user + the system principal.
 * Shows resolved names only, never raw entity ids (kb/07 Rule 1).
 */

interface PageProps {
  searchParams: Promise<{ since?: string }>
}

const SINCE_OPTIONS: { value: string; label: string; hours: number | null }[] = [
  { value: 'all', label: 'All time', hours: null },
  { value: '24h', label: 'Last 24h', hours: 24 },
  { value: '7d', label: 'Last 7 days', hours: 24 * 7 },
  { value: '30d', label: 'Last 30 days', hours: 24 * 30 },
]

function resolveSince(param: string | undefined): {
  key: string
  iso: string | null
} {
  const opt = SINCE_OPTIONS.find((o) => o.value === param) ?? SINCE_OPTIONS[0]
  if (opt.hours == null) return { key: opt.value, iso: null }
  const iso = new Date(Date.now() - opt.hours * 3600_000).toISOString()
  return { key: opt.value, iso }
}

const usd = (n: number) =>
  n >= 0.01 || n === 0
    ? `$${n.toFixed(2)}`
    : `$${n.toFixed(n < 0.0001 ? 6 : 4)}`
const compact = (n: number) => new Intl.NumberFormat('en-US').format(n)

export default async function LlmUsageDashboard({ searchParams }: PageProps) {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.ENABLE_DEV_DASHBOARDS !== 'true'
  ) {
    notFound()
  }

  const params = await searchParams
  const since = resolveSince(params.since)
  const report = await getLlmUsageReport({ sinceIso: since.iso })
  const { totals, byModel, byActor, recent } = report

  return (
    <div className="px-4 py-6 sm:px-6 space-y-6 max-w-7xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold">
          LLM Usage &amp; Cost
        </h1>
        <p className="text-sm text-gp-ink-muted dark:text-white/60">
          Token spend per user and per model, including system (background)
          work. {since.iso ? 'Filtered by time window.' : 'All time.'}
        </p>
      </header>

      <SinceBar current={since.key} />

      {/* Headline totals — compact horizontal tiles. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon="paid" label="Total cost" value={usd(totals.costUsd)} />
        <Stat icon="token" label="Total tokens" value={compact(totals.totalTokens)} />
        <Stat icon="call_split" label="Calls" value={compact(totals.calls)} />
        <Stat
          icon="groups"
          label="Actors"
          value={compact(byActor.length)}
        />
      </div>

      <Section title="Spend by user &amp; system">
        {byActor.length === 0 ? (
          <Empty>No usage recorded yet in this window.</Empty>
        ) : (
          <ScrollTable>
            <thead>
              <Tr head>
                <Th>Actor</Th>
                <Th>Type</Th>
                <Th right>Calls</Th>
                <Th right>Tokens</Th>
                <Th right>Cost</Th>
              </Tr>
            </thead>
            <tbody>
              {byActor.map((row) => (
                <ActorRow key={row.actorId} row={row} />
              ))}
            </tbody>
          </ScrollTable>
        )}
      </Section>

      <Section title="Spend by model">
        {byModel.length === 0 ? (
          <Empty>No usage recorded yet in this window.</Empty>
        ) : (
          <ScrollTable>
            <thead>
              <Tr head>
                <Th>Model</Th>
                <Th>Provider</Th>
                <Th right>Calls</Th>
                <Th right>Prompt</Th>
                <Th right>Completion</Th>
                <Th right>Cost</Th>
              </Tr>
            </thead>
            <tbody>
              {byModel.map((row) => (
                <ModelRow key={`${row.provider}:${row.model}`} row={row} />
              ))}
            </tbody>
          </ScrollTable>
        )}
      </Section>

      <Section title="Recent calls">
        {recent.length === 0 ? (
          <Empty>Nothing here yet — send a chat turn or run a job.</Empty>
        ) : (
          <ul className="space-y-2">
            {recent.map((row) => (
              <RecentRow key={row.id} row={row} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function SinceBar({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-gp-ink-muted dark:text-white/50">Window:</span>
      {SINCE_OPTIONS.map((opt) => {
        const active = current === opt.value
        const href = opt.value === 'all' ? '?' : `?since=${opt.value}`
        return (
          <a
            key={opt.value}
            href={href}
            className={
              'px-2 py-1 rounded-md border transition-colors ' +
              (active
                ? 'bg-gp-primary/15 border-gp-primary/40 text-gp-primary'
                : 'border-slate-200 dark:border-white/10 text-gp-ink-muted dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5')
            }
          >
            {opt.label}
          </a>
        )
      })}
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5">
      <span
        aria-hidden
        className="material-symbols-outlined shrink-0 text-gp-primary text-[20px]"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-base sm:text-lg font-semibold leading-tight truncate">
          {value}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-gp-ink-soft dark:text-white/40 truncate">
          {label}
        </div>
      </div>
    </div>
  )
}

function PrincipalBadge({ principal }: { principal: LlmUsagePrincipal }) {
  const isSystem = principal === 'system'
  return (
    <span
      className={
        'inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded uppercase tracking-wide ' +
        (isSystem
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300')
      }
    >
      {isSystem ? 'system' : 'user'}
    </span>
  )
}

function ActorRow({ row }: { row: UsageByActorRow }) {
  return (
    <Tr>
      <Td>
        <span className="font-medium truncate block max-w-[24ch]">
          {row.name}
        </span>
      </Td>
      <Td>
        <PrincipalBadge principal={row.principal} />
      </Td>
      <Td right>{compact(row.calls)}</Td>
      <Td right>{compact(row.totalTokens)}</Td>
      <Td right className="font-semibold tabular-nums">
        {usd(row.costUsd)}
      </Td>
    </Tr>
  )
}

function ModelRow({ row }: { row: UsageByModelRow }) {
  return (
    <Tr>
      <Td>
        <span className="font-mono text-[11px] sm:text-xs truncate block max-w-[22ch]">
          {row.model}
        </span>
      </Td>
      <Td>
        <span className="text-[10px] uppercase tracking-wide text-gp-ink-soft dark:text-white/40">
          {row.provider}
        </span>
      </Td>
      <Td right>{compact(row.calls)}</Td>
      <Td right>{compact(row.promptTokens)}</Td>
      <Td right>{compact(row.completionTokens)}</Td>
      <Td right className="font-semibold tabular-nums">
        {usd(row.costUsd)}
      </Td>
    </Tr>
  )
}

function RecentRow({ row }: { row: UsageRecentRow }) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs">
      <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-gp-ink-muted dark:text-white/70 text-[10px] uppercase tracking-wide">
        {row.source}
      </span>
      <PrincipalBadge principal={row.principal} />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{row.actorName}</div>
        <div className="font-mono text-[10px] text-gp-ink-soft dark:text-white/40 truncate">
          {row.model}
          {!row.priced && ' · est.'}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-semibold tabular-nums">{usd(row.costUsd)}</div>
        <div className="text-[10px] text-gp-ink-soft dark:text-white/40">
          {compact(row.totalTokens)} tok
        </div>
      </div>
      <div className="shrink-0 hidden sm:block text-[10px] text-gp-ink-soft dark:text-white/40 w-28 text-right">
        {formatDate(row.createdAt)}
      </div>
    </li>
  )
}

/* ---- small presentational primitives (match /dev/ai-quality) ---- */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-[10px] uppercase tracking-wide text-gp-ink-soft dark:text-white/40 font-semibold">
        {title}
      </h2>
      {children}
    </section>
  )
}

function ScrollTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
      <table className="w-full min-w-[32rem] text-sm">{children}</table>
    </div>
  )
}

function Tr({
  children,
  head,
}: {
  children: React.ReactNode
  head?: boolean
}) {
  return (
    <tr
      className={
        head
          ? 'border-b border-slate-200 dark:border-white/10'
          : 'border-b border-slate-100 dark:border-white/5 last:border-0'
      }
    >
      {children}
    </tr>
  )
}

function Th({
  children,
  right,
}: {
  children: React.ReactNode
  right?: boolean
}) {
  return (
    <th
      className={
        'px-3 py-2 text-[10px] uppercase tracking-wide text-gp-ink-soft dark:text-white/40 font-semibold ' +
        (right ? 'text-right' : 'text-left')
      }
    >
      {children}
    </th>
  )
}

function Td({
  children,
  right,
  className,
}: {
  children: React.ReactNode
  right?: boolean
  className?: string
}) {
  return (
    <td
      className={
        'px-3 py-2 align-middle ' +
        (right ? 'text-right tabular-nums ' : '') +
        (className ?? '')
      }
    >
      {children}
    </td>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 px-4 py-8 text-center text-sm text-gp-ink-muted dark:text-white/60">
      {children}
    </div>
  )
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.valueOf())) return iso
    return d.toLocaleString()
  } catch {
    return iso
  }
}

// Usage changes on every chat turn / job — never cache.
export const dynamic = 'force-dynamic'
