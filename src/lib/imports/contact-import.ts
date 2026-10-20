import { ARTICLE_EMAIL_SHAPE } from './article-import'

/**
 * GOAL-382 — bulk contact import (people + organizations) into a FieldContext.
 *
 * Shared, dependency-free pieces used by both the browser (parse + preview)
 * and the server (validate + write): the canonical contact shape every source
 * format is mapped onto, its limits, and the row validation that decides what
 * the preview calls "ready" — so a row that passes the preview cannot 400 the
 * whole batch on the server.
 *
 * The file formats themselves are the industry-standard contact exports
 * (vCard, Outlook / Google / LinkedIn CSV) plus a plain JSON array — see
 * `contact-sources.ts` for the per-source field mappings.
 */

export const CONTACT_KINDS = ['person', 'organization'] as const
export type ContactKind = (typeof CONTACT_KINDS)[number]

/** One contact, after a source's fields have been mapped onto ours. */
export interface ContactRecord {
  /** 1-based position in the file (spreadsheet row or vCard index). */
  row: number
  kind: ContactKind
  /** Person only. */
  firstName?: string
  lastName?: string
  /** Organization name, or a person's full name when the source has no split. */
  name?: string
  email?: string
  phone?: string
  location?: string
  description?: string
  website?: string
  /** Person only — the organization they belong to (vCard ORG, Outlook Company). */
  organization?: string
  /** Person only — their role there (vCard TITLE, Outlook Job Title). */
  jobTitle?: string
}

export type ContactTextField = Exclude<keyof ContactRecord, 'row' | 'kind'>

export const CONTACT_FIELD_LIMITS: Record<ContactTextField, number> = {
  firstName: 100,
  lastName: 100,
  name: 200,
  email: 254,
  phone: 64,
  location: 300,
  description: 4000,
  website: 2048,
  organization: 200,
  jobTitle: 200,
}

/**
 * Contacts per file. The import runs inline (no queue) — graph writes only,
 * no LLM or embedding spend — sent in batches of CONTACT_IMPORT_BATCH_SIZE.
 * Larger address books split into files.
 */
export const MAX_CONTACT_IMPORT_ROWS = 500

/**
 * Contacts per request. The browser sends a file in batches of this size, so
 * every request finishes well inside the route's duration budget even on a
 * slow database link (each contact is several round trips).
 */
export const CONTACT_IMPORT_BATCH_SIZE = 25

/** Client-side sanity cap on the uploaded file itself. */
export const MAX_CONTACT_FILE_BYTES = 5 * 1024 * 1024

export const CONTACT_EMAIL_SHAPE = ARTICLE_EMAIL_SHAPE

export interface ContactRowError {
  row: number
  message: string
}

export type ContactImportStatus = 'created' | 'updated' | 'linked' | 'skipped'

export interface ContactImportOutcome {
  row: number
  kind: ContactKind
  name: string
  status: ContactImportStatus
  message?: string
}

export interface ContactImportSummary {
  created: number
  updated: number
  linked: number
  skipped: number
}

export interface ContactImportResult {
  summary: ContactImportSummary
  outcomes: ContactImportOutcome[]
  /** The database became unreachable part-way; `outcomes` is what landed. */
  interrupted?: boolean
}

/**
 * The optional extra link every imported contact gets (requirement 8): one
 * existing pulse (→ MENTIONED_IN) or person (→ CONNECTED_TO) in the same
 * FieldContext.
 */
export interface ContactLinkTarget {
  kind: 'pulse' | 'person'
  id: string
}

export function contactDisplayName(record: ContactRecord): string {
  if (record.kind === 'organization') return record.name ?? ''
  const split = [record.firstName, record.lastName].filter(Boolean).join(' ')
  return split || record.name || ''
}

/**
 * Trim every text field, drop blanks, and fill a person's first/last name from
 * a single full-name field. Returns the cleaned record, or a row error when the
 * contact is unusable (no name, malformed email, over-long value).
 */
export function finalizeContactRecord(
  record: ContactRecord
): { record: ContactRecord } | { error: ContactRowError } {
  const cleaned: ContactRecord = { row: record.row, kind: record.kind }
  for (const field of Object.keys(CONTACT_FIELD_LIMITS) as ContactTextField[]) {
    const value = record[field]?.replace(/\s+/g, ' ').trim()
    // Notes keep their line breaks — they are prose, not a single-line value.
    const kept = field === 'description' ? record.description?.trim() : value
    if (kept) cleaned[field] = kept
  }

  if (cleaned.kind === 'person') {
    if (!cleaned.firstName && !cleaned.lastName && cleaned.name) {
      const parts = cleaned.name.split(' ')
      cleaned.firstName = parts[0]
      if (parts.length > 1) cleaned.lastName = parts.slice(1).join(' ')
    }
    if (!cleaned.firstName && cleaned.lastName) {
      cleaned.firstName = cleaned.lastName
      delete cleaned.lastName
    }
    delete cleaned.name
    // Organization-only fields never reach a person.
    delete cleaned.website
    if (!cleaned.firstName) {
      return {
        error: { row: record.row, message: 'This contact has no name.' },
      }
    }
  } else {
    cleaned.name = cleaned.name || cleaned.organization
    delete cleaned.firstName
    delete cleaned.lastName
    delete cleaned.organization
    delete cleaned.jobTitle
    if (!cleaned.name) {
      return {
        error: { row: record.row, message: 'This organization has no name.' },
      }
    }
  }

  if (cleaned.website) {
    // Exports often omit the scheme ("www.example.org"). Anything that is not
    // http(s) — a `javascript:` URL above all — is refused, since a website is
    // the one value a surface would render as a link.
    // A scheme-less host with a port ("www.example.org:8080/about") also
    // matches the scheme shape, so `host:digits` is read as scheme-less.
    const hasScheme =
      /^[a-z][a-z0-9+.-]*:/i.test(cleaned.website) &&
      !/^[^:/?#]+:\d+(?:[/?#]|$)/.test(cleaned.website)
    if (!hasScheme) {
      cleaned.website = `https://${cleaned.website}`
    }
    if (!/^https?:\/\//i.test(cleaned.website)) {
      return {
        error: {
          row: record.row,
          message: 'The website must be an http or https address.',
        },
      }
    }
  }

  if (cleaned.email && !CONTACT_EMAIL_SHAPE.test(cleaned.email)) {
    return {
      error: {
        row: record.row,
        message: `"${cleaned.email}" is not a valid email address.`,
      },
    }
  }

  for (const field of Object.keys(CONTACT_FIELD_LIMITS) as ContactTextField[]) {
    const value = cleaned[field]
    if (value && value.length > CONTACT_FIELD_LIMITS[field]) {
      return {
        error: {
          row: record.row,
          message: `The ${field} value is longer than ${CONTACT_FIELD_LIMITS[field]} characters.`,
        },
      }
    }
  }

  return { record: cleaned }
}

export function summarizeContactOutcomes(
  outcomes: ContactImportOutcome[]
): ContactImportSummary {
  const summary: ContactImportSummary = {
    created: 0,
    updated: 0,
    linked: 0,
    skipped: 0,
  }
  for (const outcome of outcomes) summary[outcome.status] += 1
  return summary
}
