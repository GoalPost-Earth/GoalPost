'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ToolCallMessagePartComponent } from '@assistant-ui/react'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'
import { ToolStatusPart } from './tool-status-tool-ui'
import {
  isArticleImportInFlight,
  summarizeArticleOutcomes,
  type ArticleImportJobStatus,
} from '@/lib/imports/article-import'
import {
  describeArticleImportForChat,
  type ChatImportStatus,
} from '@/lib/imports/article-import-chat'

/**
 * GOAL-359 — the bulk-import progress visualizer, rendered inside the chat
 * thread the import opened.
 *
 * The client had no way to read an import from chat: the assistant knew nothing
 * about the job, and the only progress surface was a modal he had to keep
 * reopening. Queueing a sheet now opens a thread whose first assistant turn
 * carries a `get_import_status` tool part, and this renders it.
 *
 * Two shapes arrive here and both must render:
 *
 *   1. The turn the import route seeds, whose tool INPUT carries the job id.
 *      That id is what makes the card *live* — it polls the very same
 *      `GET /api/import/articles/<jobId>` the import status modal polls, so the
 *      two surfaces cannot drift apart. The tool's stored output paints the
 *      first frame so the card is never blank while the first poll is in the
 *      air, and supplies the field name, which the job endpoint does not carry.
 *   2. A call the model made itself, when the member asked about their imports
 *      from anywhere else. There is no id to follow, so those render as the
 *      snapshot the tool returned — accurate as of the answer, which is what
 *      was asked for.
 *
 * Everything member-facing is a name or a count (kb/07 Rule 1): the job id is
 * read from the part's input and used only as a URL, never rendered.
 *
 * Colors are `gp-*` / shadcn tokens so the card re-tints across light, dark and
 * every theme variant, and the state label beside the icon is ink rather than
 * the semantic color — tinted text on a 10%-alpha wash of the same token fails
 * WCAG AA (the same finding as `import-articles-progress.tsx`, whose meter this
 * deliberately mirrors so one import never reads two ways).
 *
 * `--gp-ink-strong` is used BARE, never paired with a `dark:text-white`. The
 * theme classes are declared after `.dark` in globals.css and are applied
 * independently of it, so `dark` + `theme-warm` resolves the ink token to a
 * near-black on near-white glass while the `dark:` variant still matches — a
 * `dark:text-white` there is white on white. The modal panel this mirrors gets
 * this right for the same reason.
 */

const POLL_INTERVAL_MS = 2_000

/** Consecutive poll failures tolerated before the card settles for good. */
const MAX_POLL_FAILURES = 5

interface ImportStatusToolResult {
  found?: boolean
  imports?: ChatImportStatus[]
  message?: string
}

function readJobId(args: unknown): string | null {
  if (!args || typeof args !== 'object') return null
  const value = (args as { jobId?: unknown }).jobId
  return typeof value === 'string' && value.length > 0 ? value : null
}

function readSnapshots(result: unknown): ChatImportStatus[] {
  if (!result || typeof result !== 'object') return []
  const imports = (result as ImportStatusToolResult).imports
  return Array.isArray(imports) ? imports : []
}

/**
 * Everything the card needs that the TOOL RESULT deliberately does not carry.
 * A Material Symbols glyph name in a payload the model reads is an internal
 * artifact (kb/07 Rule 1), so the glyph is derived here from `state` — which
 * the colours were already keyed off anyway. `schedule` / `autorenew` match
 * what `describeArticleImportProgress` picks for the import modal, so the two
 * surfaces still show one import the same way.
 */
const STATE_STYLES: Record<
  ChatImportStatus['state'],
  { glyph: string; tint: string; bar: string; spin: boolean }
> = {
  queued: {
    glyph: 'schedule',
    tint: 'text-gp-ink-muted',
    bar: 'bg-gp-primary',
    spin: false,
  },
  importing: {
    glyph: 'autorenew',
    tint: 'text-gp-primary',
    bar: 'bg-gp-primary',
    spin: true,
  },
  complete: {
    glyph: 'task_alt',
    tint: 'text-gp-resource',
    bar: 'bg-gp-resource',
    spin: false,
  },
  failed: {
    glyph: 'error',
    tint: 'text-destructive',
    bar: 'bg-destructive',
    spin: false,
  },
}

/**
 * One import's meter.
 *
 * Sized for the narrowest surface in the product, which is not the phone: the
 * docked assistant pane on a 1440 desktop leaves this card ~142px, about half
 * what it gets inside the floating panel at 390px. Three things follow, and all
 * three were measured against that 142px rather than guessed:
 *
 *  - Two full-width lines, not one three-column row. Sharing a single row
 *    between icon, state label, counter and percentage clipped all four at
 *    once ("Im… 40%" over "5 rows waiti…").
 *  - The field name is printed only when the card is one of several
 *    (`showField`). The card the import's own thread opens with sits directly
 *    under a title that already names the field, so repeating it there bought
 *    nothing and cost the row count its space. In the assistant's answer, where
 *    several imports list together, the name is the only thing telling them
 *    apart — so there it stays.
 *  - Padding, gap and icon are compact UNCONDITIONALLY — no `sm:` step-up.
 *    `sm:` keys off the VIEWPORT, and the viewport is exactly the wrong signal
 *    here: the 1440 desktop that switches those utilities on is the case where
 *    this card is at its narrowest. A `sm:p-4` measured out as 32px of padding
 *    inside a 142px card.
 */
function ImportProgressCard({
  status,
  showField,
}: {
  status: ChatImportStatus
  showField: boolean
}) {
  const style = STATE_STYLES[status.state]
  const isQueued = status.state === 'queued'
  const field = showField ? ` · ${status.fieldContext}` : ''

  return (
    <div className="rounded-xl border border-gp-glass-border bg-gp-glass-bg/40 p-2.5">
      {/* The live region covers the state LABEL only — queued → importing →
          finished, four announcements over the life of an import. The modal
          panel wraps its row counter too, and is right to: it is a short-lived
          surface the member opened on purpose. This card lives in a thread
          permanently, and a polite region around a counter that changes every
          2s re-announces "7 of 300 rows" for the whole import. The numbers stay
          reachable through the progressbar's aria-valuenow below. */}
      <div className="min-w-0">
        <div role="status" className="flex items-center gap-1.5 min-w-0">
          {/* Explicit width + overflow-hidden, not just a font size: a Material
              Symbols glyph carries its own ~24px advance whatever `text-*`
              says, so this icon was laying out 33px wide and eating the label's
              line ("Importi…"). The BOX is what has to be 16px. */}
          <span
            className={`material-symbols-outlined w-4 overflow-hidden text-base leading-none shrink-0 ${style.tint} ${
              style.spin ? 'animate-spin' : ''
            }`}
            aria-hidden="true"
          >
            {style.glyph}
          </span>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gp-ink-strong">
            {status.label}
          </p>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5 min-w-0">
          <p className="min-w-0 flex-1 truncate text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
            {isQueued
              ? `${status.totalRows} ${status.totalRows === 1 ? 'row' : 'rows'} waiting${field}`
              : `${status.processedRows} of ${status.totalRows} rows${field}`}
          </p>
          {!isQueued && (
            <span className="shrink-0 text-sm font-bold tabular-nums text-gp-ink-strong">
              {status.percent}%
            </span>
          )}
        </div>
      </div>

      <div
        className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gp-ink-soft/20"
        role="progressbar"
        // An indeterminate meter signals itself by OMITTING valuenow: the
        // queued track is painted full, and announcing "0" beside it would be
        // this ticket's own defect in another modality.
        aria-valuenow={isQueued ? undefined : status.processedRows}
        aria-valuemin={0}
        aria-valuemax={Math.max(status.totalRows, 1)}
        aria-label="Rows imported"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.bar} ${
            isQueued ? 'opacity-40' : ''
          }`}
          style={{ width: isQueued ? '100%' : `${status.percent}%` }}
        />
      </div>

      {status.state === 'failed' && status.statusMessage && (
        <p className="mt-2.5 text-[11px] text-destructive">
          {status.statusMessage}
        </p>
      )}
      {status.state === 'complete' && (
        <p className="mt-2.5 text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
          {status.message}
        </p>
      )}
    </div>
  )
}

export const ImportProgressToolPart: ToolCallMessagePartComponent = (
  toolPartProps
) => {
  const { args, result } = toolPartProps
  const jobId = useMemo(() => readJobId(args), [args])
  const snapshots = useMemo(() => readSnapshots(result), [result])
  const [live, setLive] = useState<ArticleImportJobStatus | null>(null)
  const [isGone, setIsGone] = useState(false)

  // The field name is only ever known from the seeded snapshot — the job
  // endpoint answers with counts, not with what they belong to.
  const seeded = snapshots[0] ?? null
  const fieldContextTitle = seeded?.fieldContext ?? null

  useEffect(() => {
    if (!jobId) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let failures = 0
    setIsGone(false)

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/import/articles/${encodeURIComponent(jobId)}`,
          { credentials: 'include', headers: await chatApiAuthHeaders() }
        )
        if (cancelled) return
        // 404 is an answer, not a failure to retry. The job was purged after
        // FINISHED_JOB_RETENTION_DAYS, or never belonged to this account.
        // Treating it as a throw retried five times and then froze the card on
        // its last frame — a thread showing "Queued · 12 rows waiting" forever
        // for an import that no longer exists. The modal's hook has always
        // branched on this; the two surfaces are not allowed to disagree.
        if (res.status === 404) {
          setIsGone(true)
          return
        }
        if (!res.ok) throw new Error(`status ${res.status}`)
        const body = (await res.json()) as ArticleImportJobStatus
        if (cancelled) return
        failures = 0
        setLive(body)
        // Terminal: stop polling. The card keeps showing the finished state,
        // which is exactly what a member scrolling back to this thread wants.
        if (!isArticleImportInFlight(body.status)) return
      } catch {
        if (cancelled) return
        failures += 1
        // A queued job survives a flaky connection perfectly well, so give up
        // quietly and leave the last good frame rather than claiming failure.
        if (failures >= MAX_POLL_FAILURES) return
      }
      if (!cancelled) timer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    void poll()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [jobId])

  const rows: ChatImportStatus[] = useMemo(() => {
    if (live) {
      return [
        describeArticleImportForChat({
          status: live.status,
          statusMessage: live.statusMessage,
          processedRows: live.processedRows,
          // Fall back to the seeded row count rather than zero: a payload
          // without a summary would otherwise divide the meter by a total of
          // 0 and read "0 of 0 rows" over a running import.
          summary:
            live.summary ??
            summarizeArticleOutcomes([], seeded?.totalRows ?? 0),
          fieldContextTitle,
        }),
      ]
    }
    return snapshots
  }, [live, snapshots, seeded, fieldContextTitle])

  // The job is gone for good — say so, rather than leaving the last frame
  // frozen mid-import in a thread the member will scroll back to.
  if (isGone) {
    return (
      <div
        role="status"
        className="mt-1 flex items-start gap-1.5 rounded-xl border border-gp-glass-border bg-gp-glass-bg/40 p-2.5"
      >
        <span
          className="material-symbols-outlined w-4 overflow-hidden text-base leading-none shrink-0 text-gp-ink-muted"
          aria-hidden="true"
        >
          history_toggle_off
        </span>
        <p className="min-w-0 text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
          This import is no longer available. Check the field for the pulses it
          landed, then upload any missing rows again.
        </p>
      </div>
    )
  }

  // Nothing to draw yet. A seeded card always has its snapshot, so this is the
  // model-initiated path: fall through to the shared read-tool chip so the
  // lookup reads as "Checking your imports…" rather than a blank gap, and so a
  // failed lookup says something instead of nothing.
  if (rows.length === 0) return <ToolStatusPart {...toolPartProps} />

  return (
    <div className="mt-1 space-y-2">
      {rows.map((status, index) => (
        <ImportProgressCard
          key={`${status.fieldContext}-${index}`}
          status={status}
          showField={rows.length > 1}
        />
      ))}
    </div>
  )
}
