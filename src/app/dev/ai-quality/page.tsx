import { notFound } from 'next/navigation'
import {
  listAssistantFeedback,
  type AssistantFeedbackRow,
  type AssistantFeedbackSource,
  type AssistantFeedbackRating,
} from '@/lib/feedback/assistant-feedback.service'
import { buildFixPrompt } from '@/lib/feedback/build-fix-prompt'
import { FixPromptCopy } from '@/components/feedback/fix-prompt-copy'

interface PageProps {
  searchParams: Promise<{
    source?: string
    classification?: string
    rating?: string
    goldenSet?: string
  }>
}

const SOURCE_LABEL: Record<AssistantFeedbackSource, string> = {
  user_thumb: 'User thumb',
  auto_tool_error: 'Tool error',
  auto_empty_text: 'Empty response',
  auto_rule_violation: 'Rule-1 leak',
}

const SOURCE_BADGE_CLASS: Record<AssistantFeedbackSource, string> = {
  user_thumb:
    'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  auto_tool_error:
    'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
  auto_empty_text:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  auto_rule_violation:
    'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
}

function isSource(value: unknown): value is AssistantFeedbackSource {
  return (
    value === 'user_thumb' ||
    value === 'auto_tool_error' ||
    value === 'auto_empty_text' ||
    value === 'auto_rule_violation'
  )
}

function isRating(value: unknown): value is AssistantFeedbackRating {
  return value === 'positive' || value === 'negative'
}

export default async function AiQualityDashboard({ searchParams }: PageProps) {
  // Belt-and-braces with the layout: defense in depth. A direct route
  // hit must not bypass the env check if a future layout refactor drops
  // the guard. Cheap to repeat, expensive to forget.
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.ENABLE_DEV_DASHBOARDS !== 'true'
  ) {
    notFound()
  }

  const params = await searchParams
  const filters = {
    source: isSource(params.source) ? params.source : undefined,
    classification:
      typeof params.classification === 'string' && params.classification.length
        ? params.classification
        : undefined,
    rating: isRating(params.rating) ? params.rating : undefined,
    goldenSet:
      params.goldenSet === 'true'
        ? true
        : params.goldenSet === 'false'
          ? false
          : undefined,
    limit: 200,
  }

  const rows = await listAssistantFeedback(filters)

  const counts = aggregateCounts(rows)

  return (
    <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">AI Quality — Feedback Triage</h1>
        <p className="text-sm text-gp-ink-muted dark:text-white/60">
          Newest first. {rows.length} row{rows.length === 1 ? '' : 's'} shown
          (limit 200). Filters apply via URL query — see toolbar below.
        </p>
      </header>

      <FilterBar current={filters} counts={counts} />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-white/10 px-6 py-12 text-center text-sm text-gp-ink-muted dark:text-white/60">
          No feedback rows match these filters. Try removing a filter or chat
          with the assistant to generate some signal.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <FeedbackRow key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  )
}

function aggregateCounts(rows: AssistantFeedbackRow[]) {
  const bySource: Record<string, number> = {}
  const byClassification: Record<string, number> = {}
  for (const row of rows) {
    bySource[row.source] = (bySource[row.source] ?? 0) + 1
    if (row.classification) {
      byClassification[row.classification] =
        (byClassification[row.classification] ?? 0) + 1
    }
  }
  return { bySource, byClassification }
}

function FilterBar({
  current,
  counts,
}: {
  current: {
    source?: AssistantFeedbackSource
    classification?: string
    rating?: AssistantFeedbackRating
    goldenSet?: boolean
  }
  counts: { bySource: Record<string, number>; byClassification: Record<string, number> }
}) {
  const sourceOptions: { value: AssistantFeedbackSource | ''; label: string }[] = [
    { value: '', label: 'all sources' },
    { value: 'user_thumb', label: 'user_thumb' },
    { value: 'auto_tool_error', label: 'auto_tool_error' },
    { value: 'auto_empty_text', label: 'auto_empty_text' },
    { value: 'auto_rule_violation', label: 'auto_rule_violation' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-gp-ink-muted dark:text-white/50">Source:</span>
      {sourceOptions.map((opt) => {
        const isActive = (current.source ?? '') === opt.value
        const params = new URLSearchParams()
        if (opt.value) params.set('source', opt.value)
        if (current.classification) params.set('classification', current.classification)
        if (current.rating) params.set('rating', current.rating)
        if (typeof current.goldenSet === 'boolean')
          params.set('goldenSet', String(current.goldenSet))
        const href = `?${params.toString()}`
        const count = opt.value ? counts.bySource[opt.value] : undefined
        return (
          <a
            key={opt.value || 'all'}
            href={href}
            className={
              'px-2 py-1 rounded-md border transition-colors ' +
              (isActive
                ? 'bg-gp-primary/15 border-gp-primary/40 text-gp-primary'
                : 'border-slate-200 dark:border-white/10 text-gp-ink-muted dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5')
            }
          >
            {opt.label}
            {typeof count === 'number' && (
              <span className="ml-1 opacity-60">({count})</span>
            )}
          </a>
        )
      })}
    </div>
  )
}

function FeedbackRow({ row }: { row: AssistantFeedbackRow }) {
  const detail =
    row.userComment ??
    row.ruleViolated ??
    row.autoSignal ??
    row.classificationReason ??
    ''
  return (
    <li className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
      <details className="group">
        <summary className="cursor-pointer list-none px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg">
          <span
            className={
              'shrink-0 mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded uppercase tracking-wide ' +
              SOURCE_BADGE_CLASS[row.source]
            }
          >
            {SOURCE_LABEL[row.source]}
          </span>
          <span className="shrink-0 mt-0.5 inline-block text-[10px] uppercase tracking-wide text-gp-ink-soft dark:text-white/40">
            {row.rating}
          </span>
          {row.classification && (
            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 text-[10px] rounded bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300">
              {row.classification}
            </span>
          )}
          {row.goldenSet && (
            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 text-[10px] rounded bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-100">
              golden
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {row.question ?? <em className="opacity-50">(no prior user turn)</em>}
            </div>
            {detail && (
              <div className="text-xs text-gp-ink-muted dark:text-white/50 truncate mt-0.5">
                {detail}
              </div>
            )}
          </div>
          <div className="shrink-0 text-[10px] text-gp-ink-soft dark:text-white/40 mt-0.5">
            {formatDate(row.createdAt)}
          </div>
        </summary>
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100 dark:border-white/10">
          <Section title="Question">
            <Pre>{row.question ?? '(none)'}</Pre>
          </Section>
          <Section title="Assistant response">
            <Pre>{row.response ?? '(empty)'}</Pre>
          </Section>
          {row.responseParts && (
            <Section title="Response parts (tool calls + results)">
              <Pre>{JSON.stringify(row.responseParts, null, 2)}</Pre>
            </Section>
          )}
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs">
            <Field label="Source" value={row.source} />
            <Field label="Rating" value={row.rating} />
            <Field label="Mode" value={row.mode} />
            <Field label="Cluster" value={row.cluster ?? '—'} />
            <Field label="Rule violated" value={row.ruleViolated ?? '—'} />
            <Field label="Auto signal" value={row.autoSignal ?? '—'} />
            <Field label="Classification" value={row.classification ?? '—'} />
            <Field label="Golden set" value={String(row.goldenSet)} />
            <Field label="Turn id" value={row.turnId} mono />
            <Field label="Thread id" value={row.threadId ?? '—'} mono />
            <Field label="Feedback id" value={row.id} mono />
            <Field label="Created" value={formatDate(row.createdAt)} />
          </dl>
          {row.userComment && (
            <Section title="User comment">
              <Pre>{row.userComment}</Pre>
            </Section>
          )}
          {row.classificationReason && (
            <Section title="Classifier reason">
              <Pre>{row.classificationReason}</Pre>
            </Section>
          )}
          <Section title="Fix this in Claude Code">
            <FixPromptCopy prompt={buildFixPrompt(row)} />
          </Section>
        </div>
      </details>
    </li>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wide text-gp-ink-soft dark:text-white/40 font-semibold">
        {title}
      </div>
      {children}
    </div>
  )
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="whitespace-pre-wrap break-words text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-3 py-2 max-h-[400px] overflow-auto font-mono">
      {children}
    </pre>
  )
}

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-gp-ink-soft dark:text-white/40">
        {label}
      </dt>
      <dd className={mono ? 'font-mono text-[11px] break-all' : 'text-xs'}>
        {value}
      </dd>
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

// Server components are dynamic; never cache this — feedback rows
// change every chat turn and the dashboard's whole point is freshness.
export const dynamic = 'force-dynamic'
