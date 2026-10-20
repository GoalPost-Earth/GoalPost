import Papa from 'papaparse'
import {
  CONTACT_KINDS,
  finalizeContactRecord,
  type ContactKind,
  type ContactRecord,
  type ContactRowError,
  type ContactTextField,
} from './contact-import'
import { parseVCardContacts } from './contact-vcard'

/**
 * GOAL-382 — the configurable part of contact import.
 *
 * Every supported source is a PROFILE in `CONTACT_SOURCE_PROFILES`: a file
 * format plus, for tabular formats, which source columns feed which contact
 * field. The import modal, the preview and the server write path are shared by
 * all of them, so supporting another address book's export is a new entry in
 * this list — not a new screen.
 *
 * Column names are matched after `normalizeColumn` (lowercase, punctuation
 * collapsed to single spaces), so "E-mail Address", "e_mail address" and
 * "E-mail  Address" are the same column.
 */

export type ContactSourceFormat = 'vcard' | 'csv' | 'json'

export interface ContactSourceProfile {
  id: string
  label: string
  format: ContactSourceFormat
  /**
   * Tabular formats only: source column names per contact field, in priority
   * order — the first non-empty one wins (Outlook has three email columns).
   */
  columns?: Partial<Record<ContactTextField, string[]>>
  /**
   * Tabular formats only: address columns joined into `location`, one list per
   * address (business, then home…). The first address with any value wins.
   */
  locationColumns?: string[][]
  /**
   * Tabular formats only: a column whose value says whether the row is a
   * person or an organization. Without one (or when it is blank), a row with
   * no person name but an organization name is read as an organization.
   */
  kindColumn?: string
  /**
   * Tabular formats only: columns this export always has but the import does
   * not read. They count toward detection so the export is recognised over
   * the generic template that shares its other column names.
   */
  signatureColumns?: string[]
}

/** Our own column vocabulary — the generic CSV template and the JSON keys. */
const GENERIC_COLUMNS: ContactSourceProfile['columns'] = {
  firstName: ['first name', 'firstname', 'given name'],
  lastName: ['last name', 'lastname', 'family name', 'surname'],
  name: ['name', 'full name', 'display name'],
  email: ['email', 'email address', 'e mail'],
  phone: ['phone', 'phone number', 'mobile', 'telephone'],
  location: ['location', 'address', 'city'],
  description: ['description', 'notes', 'note'],
  website: ['website', 'url', 'web page'],
  organization: ['organization', 'organisation', 'company'],
  jobTitle: ['job title', 'jobtitle', 'title', 'role', 'position'],
}

export const CONTACT_SOURCE_PROFILES: ContactSourceProfile[] = [
  { id: 'vcard', label: 'vCard (.vcf)', format: 'vcard' },
  {
    id: 'outlook-csv',
    label: 'Outlook CSV',
    format: 'csv',
    columns: {
      firstName: ['first name'],
      lastName: ['last name'],
      email: ['e mail address', 'e mail 2 address', 'e mail 3 address'],
      phone: [
        'mobile phone',
        'primary phone',
        'business phone',
        'home phone',
        'other phone',
      ],
      description: ['notes'],
      website: ['web page'],
      organization: ['company'],
      jobTitle: ['job title'],
    },
    locationColumns: [
      ['business city', 'business state', 'business country region'],
      ['home city', 'home state', 'home country region'],
      ['other city', 'other state', 'other country region'],
    ],
  },
  {
    id: 'google-csv',
    label: 'Google Contacts CSV',
    format: 'csv',
    columns: {
      firstName: ['first name', 'given name'],
      lastName: ['last name', 'family name'],
      name: ['name'],
      email: ['e mail 1 value', 'e mail 2 value'],
      phone: ['phone 1 value', 'phone 2 value'],
      description: ['notes'],
      website: ['website 1 value'],
      organization: ['organization name', 'organization 1 name'],
      jobTitle: ['organization title', 'organization 1 title'],
    },
    locationColumns: [
      ['address 1 city', 'address 1 region', 'address 1 country'],
      ['address 1 formatted'],
    ],
  },
  {
    id: 'linkedin-csv',
    label: 'LinkedIn connections CSV',
    format: 'csv',
    columns: {
      firstName: ['first name'],
      lastName: ['last name'],
      email: ['email address'],
      organization: ['company'],
      jobTitle: ['position'],
    },
    signatureColumns: ['url', 'connected on'],
  },
  {
    id: 'generic-csv',
    label: 'GoalPost CSV template',
    format: 'csv',
    columns: GENERIC_COLUMNS,
    kindColumn: 'type',
  },
  {
    id: 'json',
    label: 'JSON',
    format: 'json',
    columns: GENERIC_COLUMNS,
    kindColumn: 'type',
  },
]

export const DEFAULT_CSV_PROFILE_ID = 'generic-csv'

/** The columns of the downloadable GoalPost CSV template, with one sample row. */
export const CONTACT_TEMPLATE_COLUMNS = [
  'type',
  'first_name',
  'last_name',
  'name',
  'email',
  'phone',
  'organization',
  'job_title',
  'location',
  'website',
  'notes',
]
export const CONTACT_TEMPLATE_SAMPLE_ROWS = [
  ['person', 'Ama', 'Mensah', '', 'ama@example.org', '+233 20 000 0000', 'Artisan Cooperative', 'Coordinator', 'Accra, Ghana', '', 'Met at the spring gathering'],
  ['organization', '', '', 'Artisan Cooperative', 'hello@artisan.example', '', '', '', 'Accra, Ghana', 'https://artisan.example', 'Weaving and dye collective'],
]

export function normalizeColumn(column: string): string {
  return column
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function getContactSourceProfile(
  id: string
): ContactSourceProfile | undefined {
  return CONTACT_SOURCE_PROFILES.find((profile) => profile.id === id)
}

function profileColumns(profile: ContactSourceProfile): string[] {
  return [
    ...Object.values(profile.columns ?? {}).flat(),
    ...(profile.locationColumns ?? []).flat(),
    ...(profile.kindColumn ? [profile.kindColumn] : []),
    ...(profile.signatureColumns ?? []),
  ]
}

/** How many of a profile's columns a header row carries. */
function headerScore(profile: ContactSourceProfile, headers: Set<string>): number {
  return profileColumns(profile).filter((column) => headers.has(column)).length
}

/**
 * Find the header row — LinkedIn's export opens with a few lines of notes
 * before it — and the CSV profile it fits best. The header row is the opening
 * row that names the most columns a CSV profile knows (the earliest on a tie):
 * "first row naming any known column" is not enough, because LinkedIn's
 * preamble starts with a lone `Notes:` line, and "notes" is a known column.
 */
function detectCsvLayout(
  rows: string[][],
  requestedProfileId?: string
): { headerIndex: number; profile: ContactSourceProfile } | null {
  const csvProfiles = CONTACT_SOURCE_PROFILES.filter((p) => p.format === 'csv')
  const requested = csvProfiles.find((p) => p.id === requestedProfileId)
  let best: { headerIndex: number; profile: ContactSourceProfile; score: number } | null =
    null
  for (let index = 0; index < Math.min(rows.length, 10); index += 1) {
    const headers = new Set(rows[index].map(normalizeColumn))
    const ranked = (requested ? [requested] : csvProfiles)
      .map((profile) => ({ profile, score: headerScore(profile, headers) }))
      .filter((candidate) => candidate.score > 0)
      // Stable on ties, so the more specific named exports (listed first) win
      // over the generic template that shares their column names.
      .sort((a, b) => b.score - a.score)
    if (ranked.length > 0 && (!best || ranked[0].score > best.score)) {
      best = { headerIndex: index, ...ranked[0] }
    }
  }
  return best && { headerIndex: best.headerIndex, profile: best.profile }
}

function readField(
  row: Map<string, string>,
  columns: string[] | undefined
): string | undefined {
  for (const column of columns ?? []) {
    const value = row.get(column)?.trim()
    if (value) return value
  }
  return undefined
}

function readKind(value: string | undefined): ContactKind | undefined {
  const normalized = normalizeColumn(value ?? '')
  if (normalized.startsWith('org') || normalized === 'company') {
    return 'organization'
  }
  return CONTACT_KINDS.find((kind) => kind === normalized)
}

/** Map one tabular row (normalized column → value) through a profile. */
function mapTabularRow(
  profile: ContactSourceProfile,
  row: Map<string, string>,
  position: number
): ContactRecord {
  const record: ContactRecord = { row: position, kind: 'person' }
  for (const [field, columns] of Object.entries(profile.columns ?? {})) {
    const value = readField(row, columns)
    if (value) record[field as ContactTextField] = value
  }
  if (!record.location) {
    for (const parts of profile.locationColumns ?? []) {
      const joined = parts
        .map((column) => row.get(column)?.trim())
        .filter(Boolean)
        .join(', ')
      if (joined) {
        record.location = joined
        break
      }
    }
  }
  const explicitKind = profile.kindColumn
    ? readKind(row.get(profile.kindColumn))
    : undefined
  const hasPersonName = Boolean(record.firstName || record.lastName)
  record.kind =
    explicitKind ??
    (!hasPersonName && !record.name && record.organization
      ? 'organization'
      : 'person')
  return record
}

export interface ParsedContactFile {
  profile: ContactSourceProfile | null
  records: ContactRecord[]
  errors: ContactRowError[]
  /** A whole-file problem (unreadable, unknown layout) — nothing to preview. */
  fileError?: string
}

function finalizeAll(
  profile: ContactSourceProfile,
  raw: ContactRecord[]
): ParsedContactFile {
  const records: ContactRecord[] = []
  const errors: ContactRowError[] = []
  for (const candidate of raw) {
    const result = finalizeContactRecord(candidate)
    if ('error' in result) errors.push(result.error)
    else records.push(result.record)
  }
  return { profile, records, errors }
}

function parseCsv(text: string, requestedProfileId?: string): ParsedContactFile {
  // Blank records are kept through parsing and dropped below, so a record's
  // index is still the row number a spreadsheet app shows (a quoted multi-line
  // note stays one row there too, which is why this counts records, not lines).
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: false })
  const isBlank = (cells: string[]) => cells.every((cell) => !cell.trim())
  const layout = detectCsvLayout(
    parsed.data.map((cells) => (isBlank(cells) ? [] : cells)),
    requestedProfileId
  )
  if (!layout) {
    return {
      profile: null,
      records: [],
      errors: [],
      fileError:
        'We could not find contact columns in this file. Use an Outlook, Google or LinkedIn export, or the GoalPost CSV template.',
    }
  }
  const headers = parsed.data[layout.headerIndex].map(normalizeColumn)
  const raw: ContactRecord[] = []
  parsed.data.forEach((cells, index) => {
    if (index <= layout.headerIndex || isBlank(cells)) return
    const row = new Map<string, string>()
    headers.forEach((header, column) => {
      // Keep the first column of a duplicated header rather than the last.
      if (!row.has(header)) row.set(header, cells[column] ?? '')
    })
    // 1-based spreadsheet row number.
    raw.push(mapTabularRow(layout.profile, row, index + 1))
  })
  return finalizeAll(layout.profile, raw)
}

function parseJson(text: string): ParsedContactFile {
  const profile = getContactSourceProfile('json')!
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { profile, records: [], errors: [], fileError: 'This file is not valid JSON.' }
  }
  const list = Array.isArray(data)
    ? data
    : (data as { contacts?: unknown })?.contacts
  if (!Array.isArray(list)) {
    return {
      profile,
      records: [],
      errors: [],
      fileError: 'Expected a JSON array of contacts, or an object with a "contacts" array.',
    }
  }
  const raw = list.map((entry, index) => {
    const row = new Map<string, string>()
    if (entry && typeof entry === 'object') {
      for (const [key, value] of Object.entries(entry)) {
        if (typeof value === 'string' || typeof value === 'number') {
          row.set(normalizeColumn(key), String(value))
        }
      }
    }
    return mapTabularRow(profile, row, index + 1)
  })
  return finalizeAll(profile, raw)
}

/**
 * Parse an uploaded contact file. The format comes from the extension; for a
 * CSV the source profile is detected from its header row unless the member
 * picked one explicitly.
 */
export function parseContactFile(
  fileName: string,
  text: string,
  requestedProfileId?: string
): ParsedContactFile {
  const extension = fileName.toLowerCase().split('.').pop()
  if (extension === 'vcf' || extension === 'vcard') {
    const profile = getContactSourceProfile('vcard')!
    const raw = parseVCardContacts(text)
    if (raw.length === 0) {
      return { profile, records: [], errors: [], fileError: 'This file has no vCard entries.' }
    }
    return finalizeAll(profile, raw)
  }
  if (extension === 'json') return parseJson(text)
  if (extension === 'csv') return parseCsv(text, requestedProfileId)
  return {
    profile: null,
    records: [],
    errors: [],
    fileError: 'Upload a .vcf, .csv or .json file.',
  }
}
