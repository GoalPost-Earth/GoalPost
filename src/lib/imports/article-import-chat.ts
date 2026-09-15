import {
  ARTICLE_IMPORT_STATUS,
  buildArticleImportMessage,
  describeArticleImportProgress,
  type ArticleImportStatus,
  type ArticleImportSummary,
} from './article-import'

/**
 * GOAL-359 — the bulk article import, described for the chat assistant.
 *
 * Robert could watch an import in exactly one place: the import status modal,
 * which he had to keep reopening. The assistant had no idea an import existed
 * at all, so asking it "how far along is that?" got nowhere. Queueing a sheet
 * now opens a dedicated chat thread carrying a live progress visualizer, and
 * the assistant gets a read tool so the same question can be *asked* rather
 * than only watched.
 *
 * Both of those surfaces read the job through this module, and this module
 * derives everything it can from `describeArticleImportProgress` — the helper
 * GOAL-357 introduced precisely so one job can never describe itself two ways.
 * The chat card and the modal therefore agree on "queued vs importing" and on
 * the percentage by construction, not by two copies of the same rule.
 *
 * kb/07-ai-assistant-ux.md Rule 1 and Rule 3 shape the payload: every entity is
 * named (`fieldContext`, never a context id), and nothing internal — job ids,
 * Neo4j labels, raw `PENDING`/`PROCESSING` spellings, row cursors — appears in
 * anything the model reads back out. The job id the live card needs to poll
 * rides in the tool-call *input*, the same place the ingest flow keeps its
 * entity ids, never in the result copy.
 *
 * That is also why this shape carries no icon. It was briefly the card's
 * view-model as well as the tool result, which handed the model
 * `icon: 'autorenew'` — a Material Symbols glyph name is squarely an internal
 * artifact, and a low-effort reasoning model will paraphrase one into copy.
 * The renderer derives its own icon from `state`, which it already keys its
 * colours off.
 */

/**
 * The assistant tool the chat thread's progress card is rendered from. Named
 * once here because three places have to agree on it: the tool registration in
 * `chat-tools.ts`, the synthesized turn the import route seeds the thread with,
 * and the `by_name` renderer in `thread.tsx`. A typo in any one of them shows
 * the member an empty bubble.
 */
export const IMPORT_STATUS_TOOL_NAME = 'get_import_status'

/** How many recent imports the assistant will talk about in one answer. */
export const MAX_CHAT_IMPORT_REPORTS = 5

/**
 * Member-facing state of one import. Four states rather than the job's own
 * four: `PENDING` splits into genuinely-queued and already-underway (GOAL-357),
 * and `PROCESSING` is always underway.
 */
export type ChatImportState = 'queued' | 'importing' | 'complete' | 'failed'

/** One import, as the assistant and the chat card describe it. */
export interface ChatImportStatus {
  /** The field the rows land in, by NAME — never an id (kb/07 Rule 1 + 3). */
  fieldContext: string
  state: ChatImportState
  /** Member-facing state label, shared with the import modal while in flight. */
  label: string
  processedRows: number
  totalRows: number
  /** Rows done as a whole percent, clamped 0–100. */
  percent: number
  created: number
  skippedExisting: number
  failedRows: number
  /** New people minted from the sheet's authors. */
  createdPeople: number
  /** Member-safe copy when the import failed outright; null otherwise. */
  statusMessage: string | null
  /** The same one-line receipt the import modal shows. */
  message: string
}

export interface ChatImportInput {
  status: ArticleImportStatus
  statusMessage: string | null
  /** Rows the worker has landed an outcome for. */
  processedRows: number
  summary: ArticleImportSummary
  /** Resolved title of the enclosing field. Empty when it could not be read. */
  fieldContextTitle?: string | null
}

/**
 * Fallback name for the field an import belongs to. Reached when the title
 * could not be read at all — the assistant has to say *something*, and it
 * cannot be an id.
 */
const UNNAMED_FIELD = 'a field'

/**
 * Cap a field name before it reaches the model or the card. Five imports x an
 * unbounded member-authored title is unbounded prompt context, and the card
 * truncates visually anyway.
 */
const MAX_FIELD_NAME_CHARS = 60

export function trimFieldName(title: string | null | undefined): string {
  const trimmed = (title ?? '').trim()
  if (trimmed.length <= MAX_FIELD_NAME_CHARS) return trimmed
  return `${trimmed.slice(0, MAX_FIELD_NAME_CHARS - 1)}\u2026`
}

export function describeArticleImportForChat(
  input: ChatImportInput
): ChatImportStatus {
  const progress = describeArticleImportProgress({
    status: input.status,
    processedRows: input.processedRows,
    summary: input.summary,
  })
  const fieldContext = trimFieldName(input.fieldContextTitle) || UNNAMED_FIELD

  if (input.status === ARTICLE_IMPORT_STATUS.failed) {
    return {
      fieldContext,
      state: 'failed',
      label: 'Import stopped',
      processedRows: progress.processedRows,
      totalRows: progress.totalRows,
      percent: progress.percent,
      created: input.summary.created,
      skippedExisting: input.summary.skippedExisting,
      failedRows: input.summary.failed,
      createdPeople: input.summary.createdPeople,
      statusMessage: input.statusMessage,
      message: buildArticleImportMessage(input.summary),
    }
  }

  if (input.status === ARTICLE_IMPORT_STATUS.complete) {
    return {
      fieldContext,
      state: 'complete',
      label: 'Import finished',
      // A finished job has landed every row it is going to land, so the meter
      // reads full even when some rows failed — the counts below say which.
      processedRows: progress.processedRows,
      totalRows: progress.totalRows,
      percent: 100,
      created: input.summary.created,
      skippedExisting: input.summary.skippedExisting,
      failedRows: input.summary.failed,
      createdPeople: input.summary.createdPeople,
      statusMessage: null,
      message: buildArticleImportMessage(input.summary),
    }
  }

  return {
    fieldContext,
    state: progress.isQueued ? 'queued' : 'importing',
    label: progress.label,
    processedRows: progress.processedRows,
    totalRows: progress.totalRows,
    percent: progress.percent,
    created: input.summary.created,
    skippedExisting: input.summary.skippedExisting,
    failedRows: input.summary.failed,
    createdPeople: input.summary.createdPeople,
    statusMessage: null,
    message: buildArticleImportMessage(input.summary),
  }
}

/**
 * One sentence per import for the model to paraphrase. Written as prose rather
 * than left to the model to assemble from the numbers, because "how many rows
 * are done" is the exact question this ticket exists to answer and a model
 * counting fields itself is a chance to get it wrong.
 */
export function summarizeChatImports(imports: ChatImportStatus[]): string {
  if (imports.length === 0) {
    return 'No article imports have been started recently.'
  }
  return imports
    .map((entry) => {
      switch (entry.state) {
        case 'queued':
          return `The import of ${entry.totalRows} ${entry.totalRows === 1 ? 'article' : 'articles'} into ${entry.fieldContext} is queued and has not started yet.`
        case 'importing':
          return `The import into ${entry.fieldContext} is underway — ${entry.processedRows} of ${entry.totalRows} rows done (${entry.percent}%).`
        case 'failed':
          return `The import into ${entry.fieldContext} stopped after ${entry.processedRows} of ${entry.totalRows} rows. ${entry.statusMessage ?? ''}`.trim()
        default:
          return `The import into ${entry.fieldContext} finished: ${entry.message}`
      }
    })
    .join(' ')
}

/**
 * Thread title for a queued import. Never carries an id (kb/07 Rule 1).
 *
 * Truncation happens HERE rather than at the caller, because the cap exists for
 * the switcher row. Trimming upstream fed the ellipsised name into the seeded
 * turn as well, so the assistant's own copy read "\u2026into Community Care
 * Practices and Mutual Aid Coordi\u2026" — a cosmetic cap leaking into prose.
 */
export function buildImportThreadTitle(
  totalRows: number,
  fieldContextTitle?: string | null
): string {
  const rows = `${totalRows} ${totalRows === 1 ? 'article' : 'articles'}`
  const field = trimFieldName(fieldContextTitle)
  return field ? `Import: ${rows} into ${field}` : `Import: ${rows}`
}
