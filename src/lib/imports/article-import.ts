import * as XLSX from 'xlsx'
import {
  getRowValue,
  normalizeHeader,
  workbookToNormalizedRows,
} from './csv-import-utils'

/**
 * GOAL-317 — spreadsheet-driven bulk upload of articles as pulses.
 *
 * Shared (client + server) parsing, mapping, and validation for the article
 * import flow. Each spreadsheet row describes one intended pulse: title,
 * author, date, and URL to the article, with optional type / email /
 * description columns. The client uses these helpers to build the preview
 * step; the API route re-runs the same validation server-side so the two
 * can never drift.
 */

/** Hard cap per request — keeps the synchronous batch inside maxDuration. */
export const MAX_ARTICLE_IMPORT_ROWS = 300

/**
 * Per-field length caps, enforced in BOTH `parseArticleRows` (per-row error
 * in the preview) and the API route's zod schema (server backstop) — from
 * one constant so the two can never drift.
 */
export const ARTICLE_FIELD_LIMITS = {
  title: 500,
  author: 200,
  authorEmail: 254,
  date: 100,
  url: 2000,
  description: 5000,
} as const

export type ArticlePulseType = 'GoalPulse' | 'ResourcePulse' | 'StoryPulse'

export interface ArticleImportRowInput {
  /** 1-based spreadsheet row number (row 1 is the header). */
  row: number
  title: string
  author: string
  authorEmail?: string
  date?: string
  url: string
  pulseType: ArticlePulseType
  description?: string
}

export interface ArticleRowError {
  row: number
  message: string
  data: Record<string, string>
}

export interface ArticleRowOutcome {
  row: number
  title: string
  status: 'created' | 'skipped_existing' | 'failed'
  message: string
  authorName?: string | null
}

export interface ArticleImportSummary {
  totalRows: number
  created: number
  skippedExisting: number
  failed: number
  createdPeople: number
  matchedPeople: number
}

export interface ArticleImportResult {
  success: boolean
  message: string
  summary: ArticleImportSummary
  outcomes: ArticleRowOutcome[]
  warnings: string[]
}

type ArticleColumnKey =
  | 'title'
  | 'author'
  | 'date'
  | 'url'
  | 'authorEmail'
  | 'pulseType'
  | 'description'

interface ArticleHeaderRule {
  key: ArticleColumnKey
  label: string
  aliases: string[]
  required: boolean
}

export const ARTICLE_TEMPLATE_HEADERS: ArticleHeaderRule[] = [
  {
    key: 'title',
    label: 'Article title',
    aliases: ['title', 'pulse_title', 'article_title', 'headline'],
    required: true,
  },
  {
    key: 'author',
    label: 'Author',
    aliases: ['author', 'author_name', 'byline', 'writer'],
    required: true,
  },
  {
    key: 'date',
    label: 'Date',
    aliases: ['date', 'published', 'published_date', 'publication_date', 'pub_date'],
    required: true,
  },
  {
    key: 'url',
    label: 'URL',
    aliases: ['url', 'link', 'article_url', 'web_link'],
    required: true,
  },
  {
    key: 'authorEmail',
    label: 'Author email',
    aliases: ['author_email', 'email'],
    required: false,
  },
  {
    key: 'pulseType',
    label: 'Pulse type',
    aliases: ['pulse_type', 'type'],
    required: false,
  },
  {
    key: 'description',
    label: 'Description',
    aliases: ['description', 'content', 'summary', 'notes'],
    required: false,
  },
]

/** Single source for the alias lists `parseArticleRows` reads columns with. */
const COLUMN_ALIASES = Object.fromEntries(
  ARTICLE_TEMPLATE_HEADERS.map((rule) => [rule.key, rule.aliases])
) as Record<ArticleColumnKey, string[]>

/** Column order for the downloadable CSV template. */
export const ARTICLE_TEMPLATE_COLUMNS = [
  'title',
  'author',
  'date',
  'url',
  'author_email',
  'pulse_type',
  'description',
]

export const ARTICLE_TEMPLATE_SAMPLE_ROW = [
  'Mutual aid networks after the storm',
  'Amara Osei',
  '2026-05-14',
  'https://example.org/articles/mutual-aid-networks',
  '',
  'resource',
  'How neighbourhood mutual aid groups organised recovery support.',
]

const PULSE_TYPE_BY_KEYWORD: Record<string, ArticlePulseType> = {
  goal: 'GoalPulse',
  goals: 'GoalPulse',
  resource: 'ResourcePulse',
  resources: 'ResourcePulse',
  article: 'ResourcePulse',
  articles: 'ResourcePulse',
  story: 'StoryPulse',
  stories: 'StoryPulse',
}

/**
 * Parse the first worksheet of a CSV/XLSX file (browser ArrayBuffer) into
 * normalized-header string rows — the same row shape `parseXlsxBase64`
 * produces on the server for the legacy import path.
 */
export function parseSpreadsheetArrayBuffer(data: ArrayBuffer): {
  rows: Record<string, string>[]
  parseErrors: string[]
} {
  try {
    const workbook = XLSX.read(data, {
      type: 'array',
      cellDates: false,
      raw: false,
    })
    const rows = workbookToNormalizedRows(workbook)
    if (rows === null) {
      return {
        rows: [],
        parseErrors: ['The uploaded file does not contain any worksheets.'],
      }
    }

    return { rows, parseErrors: [] }
  } catch {
    return {
      rows: [],
      parseErrors: [
        'The file could not be parsed. Upload a .csv or .xlsx file with a header row in the first sheet.',
      ],
    }
  }
}

/**
 * Validate that the sheet carries the four required article columns
 * (title, author, date, url). Returns human-readable errors; empty = valid.
 */
export function validateArticleTemplateHeaders(
  rows: Record<string, string>[]
): string[] {
  const presentHeaders = new Set<string>()
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      presentHeaders.add(key)
    }
  }

  const errors: string[] = []
  for (const rule of ARTICLE_TEMPLATE_HEADERS) {
    if (!rule.required) continue
    const found = rule.aliases.some((alias) =>
      presentHeaders.has(normalizeHeader(alias))
    )
    if (!found) {
      errors.push(
        `Missing required column "${rule.label}" (accepted headers: ${rule.aliases.join(', ')}).`
      )
    }
  }
  return errors
}

/**
 * Normalize a URL cell: require http(s); tolerate a missing scheme on
 * domain-shaped values by prefixing https://. Returns null when the value
 * cannot be a usable article link.
 */
export function normalizeArticleUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  let candidate: string | null = null
  if (/^https?:\/\//i.test(trimmed)) {
    candidate = trimmed
  } else if (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(trimmed)) {
    candidate = `https://${trimmed}`
  }
  if (!candidate) return null

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return candidate
  } catch {
    return null
  }
}

const MONTH_NAME_TOKEN =
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i
const NUMERIC_SEPARATED_DATE = /^\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}$/

/**
 * V8's lenient Date parser swallows free text like "Spring 2026" or a bare
 * "2026" as January 1 of that year. Only hand a value to `new Date()` when
 * it actually looks like a calendar date; everything else stays verbatim.
 */
function looksLikeCalendarDate(value: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return true
  if (NUMERIC_SEPARATED_DATE.test(value)) return true
  return MONTH_NAME_TOKEN.test(value) && /\d/.test(value)
}

/**
 * Normalize a date cell to YYYY-MM-DD when parseable; otherwise keep the
 * member's original text (pulse `time` is a free string, so "Spring 2026"
 * survives as-is rather than failing the row).
 */
export function normalizeArticleDate(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed
  if (!looksLikeCalendarDate(trimmed)) return trimmed

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return trimmed

  // ISO strings parse as UTC — format in UTC so the date never shifts.
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return parsed.toISOString().slice(0, 10)
  }

  // Non-ISO formats ("May 14, 2026", "05/14/2026") parse as *local* time,
  // so format from local components to stay timezone-safe on the client.
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${parsed.getFullYear()}-${month}-${day}`
}

/**
 * Resolve the optional pulse type column. Empty defaults to ResourcePulse
 * (articles are resources); unknown values return null so the row can fail
 * with a clear message instead of silently mistyping the pulse.
 */
export function resolveArticlePulseType(raw?: string): ArticlePulseType | null {
  const normalized = (raw ?? '').trim().toLowerCase().replace(/[\s_-]*pulse$/, '')
  if (!normalized) return 'ResourcePulse'
  return PULSE_TYPE_BY_KEYWORD[normalized] ?? null
}

/** Shared client/server email shape — the zod schema reuses this exact
 *  regex so a value passing the preview can never 400 the whole batch. */
export const ARTICLE_EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_SHAPE = ARTICLE_EMAIL_SHAPE

function rowEchoData(row: Record<string, string>): Record<string, string> {
  const echo: Record<string, string> = {}
  for (const [key, value] of Object.entries(row)) {
    const trimmed = value.trim()
    if (trimmed) echo[key] = trimmed
  }
  return echo
}

/**
 * Map normalized sheet rows to typed article rows, validating each one.
 * Row numbers are 1-based spreadsheet rows (header = row 1). Fully-empty
 * rows are skipped silently — trailing blank rows are not errors.
 */
export function parseArticleRows(sheetRows: Record<string, string>[]): {
  rows: ArticleImportRowInput[]
  errors: ArticleRowError[]
} {
  const rows: ArticleImportRowInput[] = []
  const errors: ArticleRowError[] = []

  sheetRows.forEach((sheetRow, index) => {
    const rowNumber = index + 2
    const isEmpty = Object.values(sheetRow).every((value) => !value.trim())
    if (isEmpty) return

    const problems: string[] = []

    const title = getRowValue(sheetRow, COLUMN_ALIASES.title)
    if (!title) {
      problems.push('Article title is required.')
    } else if (title.length > ARTICLE_FIELD_LIMITS.title) {
      problems.push(
        `Title is longer than ${ARTICLE_FIELD_LIMITS.title} characters.`
      )
    }

    const author = getRowValue(sheetRow, COLUMN_ALIASES.author)
    if (!author) {
      problems.push('Author name is required.')
    } else if (author.length > ARTICLE_FIELD_LIMITS.author) {
      problems.push(
        `Author is longer than ${ARTICLE_FIELD_LIMITS.author} characters.`
      )
    }

    const rawDate = getRowValue(sheetRow, COLUMN_ALIASES.date)
    if (!rawDate) {
      problems.push('Date is required.')
    } else if (rawDate.length > ARTICLE_FIELD_LIMITS.date) {
      problems.push(
        `Date is longer than ${ARTICLE_FIELD_LIMITS.date} characters.`
      )
    }

    const rawUrl = getRowValue(sheetRow, COLUMN_ALIASES.url)
    const url = rawUrl ? normalizeArticleUrl(rawUrl) : null
    if (!rawUrl) {
      problems.push('URL is required.')
    } else if (!url) {
      problems.push(`"${rawUrl}" is not a valid http(s) URL.`)
    } else if (url.length > ARTICLE_FIELD_LIMITS.url) {
      problems.push(
        `URL is longer than ${ARTICLE_FIELD_LIMITS.url} characters.`
      )
    }

    const rawType = getRowValue(sheetRow, COLUMN_ALIASES.pulseType)
    const pulseType = resolveArticlePulseType(rawType)
    if (!pulseType) {
      problems.push(
        `"${rawType}" is not a supported pulse type — use goal, resource, or story (blank defaults to resource).`
      )
    }

    const rawEmail = getRowValue(sheetRow, COLUMN_ALIASES.authorEmail)
    if (
      rawEmail &&
      (!EMAIL_SHAPE.test(rawEmail) ||
        rawEmail.length > ARTICLE_FIELD_LIMITS.authorEmail)
    ) {
      problems.push(`"${rawEmail}" is not a valid author email.`)
    }

    const description = getRowValue(sheetRow, COLUMN_ALIASES.description)
    if (description && description.length > ARTICLE_FIELD_LIMITS.description) {
      problems.push(
        `Description is longer than ${ARTICLE_FIELD_LIMITS.description} characters.`
      )
    }

    if (problems.length > 0) {
      errors.push({
        row: rowNumber,
        message: problems.join(' '),
        data: rowEchoData(sheetRow),
      })
      return
    }

    rows.push({
      row: rowNumber,
      title: title as string,
      author: author as string,
      authorEmail: rawEmail?.toLowerCase(),
      date: normalizeArticleDate(rawDate as string),
      url: url as string,
      pulseType: pulseType as ArticlePulseType,
      description,
    })
  })

  return { rows, errors }
}

/**
 * Compose the pulse body for an article row. A member-supplied description
 * wins; otherwise seed a sentence from the metadata so the pulse embeds
 * meaningfully for resonance discovery instead of falling back to the bare
 * title.
 */
export function buildArticleRowContent(row: ArticleImportRowInput): string {
  if (row.description?.trim()) return row.description.trim()
  const datePart = row.date ? `, published ${row.date}` : ''
  return `Article by ${row.author}${datePart}: ${row.url}`
}
