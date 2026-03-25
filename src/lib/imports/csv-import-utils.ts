import * as XLSX from 'xlsx'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

export type CsvImportType = 'we-space' | 'field-context' | 'pulse'
export type SpaceScope = 'me-space' | 'we-space'
export type ImportSpaceVisibility = 'PRIVATE' | 'SHARED'
export type ImportGoalStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED'
export type ImportGoalHorizon = 'SHORT' | 'MID' | 'LONG'

export interface AuthenticatedImportUser {
  id: string
  displayName: string
  email?: string
}

export interface CsvImportRowError {
  row: number
  message: string
  data: Record<string, string>
}

export interface CsvImportSummary {
  createdWeSpaces: number
  reusedWeSpaces: number
  createdFieldContexts: number
  reusedFieldContexts: number
  createdPulses: number
}

export interface CsvImportResult {
  success: boolean
  message: string
  summary: CsvImportSummary
  importedRows: number
  failedRows: number
  errors: CsvImportRowError[]
  warnings: string[]
}

export interface ParsedSpreadsheetData {
  rows: Record<string, string>[]
  parseErrors: string[]
}

interface TemplateHeaderRule {
  label: string
  aliases: string[]
}

const CONFLICTING_TEMPLATE_HEADERS: Record<
  CsvImportType,
  TemplateHeaderRule[]
> = {
  'we-space': [
    {
      label: 'Space scope',
      aliases: ['space_scope', 'space_type', 'scope'],
    },
    {
      label: 'FieldContext target',
      aliases: ['field_context_name', 'context_name'],
    },
    {
      label: 'Pulse type',
      aliases: ['pulse_type'],
    },
  ],
  'field-context': [
    {
      label: 'Pulse type',
      aliases: ['pulse_type'],
    },
    {
      label: 'Pulse metadata',
      aliases: ['status', 'horizon', 'resource_type'],
    },
  ],
  pulse: [],
}

const REQUIRED_TEMPLATE_HEADERS: Record<CsvImportType, TemplateHeaderRule[]> = {
  'we-space': [
    {
      label: 'WeSpace name',
      aliases: ['name', 'we_space_name', 'space_name'],
    },
  ],
  'field-context': [
    {
      label: 'FieldContext name',
      aliases: ['name', 'title', 'field_context_name', 'context_name'],
    },
    {
      label: 'Space scope',
      aliases: ['space_scope', 'space_type', 'scope'],
    },
  ],
  pulse: [
    {
      label: 'Pulse title',
      aliases: ['title', 'name'],
    },
    {
      label: 'Pulse content',
      aliases: ['content', 'description', 'details'],
    },
    {
      label: 'FieldContext name',
      aliases: ['field_context_name', 'context_name'],
    },
    {
      label: 'Space scope',
      aliases: ['space_scope', 'space_type', 'scope'],
    },
  ],
}

export function createEmptySummary(): CsvImportSummary {
  return {
    createdWeSpaces: 0,
    reusedWeSpaces: 0,
    createdFieldContexts: 0,
    reusedFieldContexts: 0,
    createdPulses: 0,
  }
}

export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function normalizeNameForMatch(value: string): string {
  return value.trim().toLowerCase()
}

export function getRowValue(
  row: Record<string, string>,
  aliases: string[]
): string | undefined {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias)
    const value = row[normalizedAlias]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  return undefined
}

export function parseXlsxBase64(workbookBase64: string): ParsedSpreadsheetData {
  try {
    const workbookBuffer = Buffer.from(workbookBase64, 'base64')
    const workbook = XLSX.read(workbookBuffer, {
      type: 'buffer',
      cellDates: false,
      raw: false,
    })

    const firstSheetName = workbook.SheetNames[0]

    if (!firstSheetName) {
      return {
        rows: [],
        parseErrors: [
          'The uploaded XLSX file does not contain any worksheets.',
        ],
      }
    }

    const worksheet = workbook.Sheets[firstSheetName]
    const sheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      {
        defval: '',
        raw: false,
      }
    )

    const rows = sheetRows.map((row) => {
      const normalizedRow: Record<string, string> = {}

      for (const [key, value] of Object.entries(row)) {
        if (!key) {
          continue
        }

        normalizedRow[normalizeHeader(key)] =
          value === null || value === undefined ? '' : String(value)
      }

      return normalizedRow
    })

    return { rows, parseErrors: [] }
  } catch {
    return {
      rows: [],
      parseErrors: [
        'The XLSX file could not be parsed. Ensure the file is a valid .xlsx workbook with a header row in the first sheet.',
      ],
    }
  }
}

export function validateUploadTemplateHeaders(
  uploadType: CsvImportType,
  rows: Record<string, string>[]
): string[] {
  const headerSet = new Set<string>()

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      const normalizedKey = normalizeHeader(key)
      if (normalizedKey) {
        headerSet.add(normalizedKey)
      }
    }
  }

  if (headerSet.size === 0) {
    return [
      `This file does not contain recognizable header columns for a ${uploadType} import template.`,
    ]
  }

  const missingRules = REQUIRED_TEMPLATE_HEADERS[uploadType].filter((rule) => {
    return !rule.aliases.some((alias) => headerSet.has(normalizeHeader(alias)))
  })

  const conflictingRules = CONFLICTING_TEMPLATE_HEADERS[uploadType].filter(
    (rule) => {
      return rule.aliases.some((alias) => headerSet.has(normalizeHeader(alias)))
    }
  )

  if (missingRules.length === 0 && conflictingRules.length === 0) {
    return []
  }

  const foundColumns = Array.from(headerSet).sort().join(', ')
  const missingColumns = missingRules.map((rule) => rule.label).join(', ')
  const conflictingColumns = conflictingRules
    .map((rule) => rule.label)
    .join(', ')

  const failureParts: string[] = []
  if (missingColumns) {
    failureParts.push(`Missing required column groups: ${missingColumns}.`)
  }
  if (conflictingColumns) {
    failureParts.push(
      `Conflicting column groups for ${uploadType}: ${conflictingColumns}.`
    )
  }

  return [
    `This file does not match the ${uploadType} template. ${failureParts.join(' ')} Found columns: ${foundColumns}.`,
  ]
}

export function formatRowData(
  row: Record<string, string>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(row)
      .filter(
        ([, value]) => typeof value === 'string' && value.trim().length > 0
      )
      .map(([key, value]) => [key, value.trim()])
  )
}

export function resolveSpaceScope(rawValue?: string): SpaceScope {
  const normalizedValue = normalizeNameForMatch(rawValue ?? 'we-space')

  if (['me-space', 'mespace', 'me_space', 'me'].includes(normalizedValue)) {
    return 'me-space'
  }

  return 'we-space'
}

export function resolveSpaceVisibility(
  rawValue?: string
): ImportSpaceVisibility {
  const normalizedValue = normalizeNameForMatch(rawValue ?? '')

  if (!normalizedValue) {
    return 'SHARED'
  }

  if (['private', 'closed'].includes(normalizedValue)) {
    return 'PRIVATE'
  }

  if (['shared', 'public', 'open'].includes(normalizedValue)) {
    return 'SHARED'
  }

  throw new Error(
    'WeSpace rows only accept visibility values of private or shared.'
  )
}

export function resolveGoalStatus(rawValue?: string): ImportGoalStatus {
  const normalizedValue = normalizeNameForMatch(rawValue ?? '').replace(
    /[_\s-]+/g,
    ''
  )

  if (!normalizedValue) {
    return 'ACTIVE'
  }

  if (normalizedValue === 'active') {
    return 'ACTIVE'
  }

  if (normalizedValue === 'paused') {
    return 'PAUSED'
  }

  if (normalizedValue === 'completed' || normalizedValue === 'done') {
    return 'COMPLETED'
  }

  throw new Error(
    'Goal pulse rows only accept status values of active, paused, or completed.'
  )
}

export function resolveGoalHorizon(rawValue?: string): ImportGoalHorizon {
  const normalizedValue = normalizeNameForMatch(rawValue ?? '').replace(
    /[_\s-]+/g,
    ''
  )

  if (!normalizedValue) {
    return 'MID'
  }

  if (normalizedValue === 'short' || normalizedValue === 'shortterm') {
    return 'SHORT'
  }

  if (normalizedValue === 'mid' || normalizedValue === 'midterm') {
    return 'MID'
  }

  if (normalizedValue === 'long' || normalizedValue === 'longterm') {
    return 'LONG'
  }

  throw new Error(
    'Goal pulse rows only accept horizon values of short, mid, or long.'
  )
}

export function resolvePulseType(
  rawValue?: string
): 'goal' | 'resource' | 'story' {
  const normalizedValue = normalizeNameForMatch(rawValue ?? '').replace(
    /_/g,
    '-'
  )

  if (!normalizedValue) {
    return 'story'
  }

  if (['goal', 'goals'].includes(normalizedValue)) {
    return 'goal'
  }

  if (['resource', 'resources'].includes(normalizedValue)) {
    return 'resource'
  }

  if (['story', 'stories'].includes(normalizedValue)) {
    return 'story'
  }

  throw new Error(
    'Pulse rows only accept pulse_type values of goal, story, or resource.'
  )
}

function isJwtPayload(value: unknown): value is {
  user?: {
    id?: string
    name?: string
    firstName?: string
    lastName?: string
    email?: string
  }
} {
  return typeof value === 'object' && value !== null
}

export function getImportAccessToken(request: NextRequest): string | undefined {
  const authorizationHeader = request.headers.get('authorization')
  const bearerToken = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length).trim()
    : undefined
  const cookieToken = request.cookies.get('accessToken')?.value

  return bearerToken || cookieToken
}

export function requireAuthenticatedImportUser(
  request: NextRequest,
  requestedUserId?: string
): AuthenticatedImportUser {
  const accessToken = getImportAccessToken(request)

  if (!accessToken) {
    throw new Error('You must be logged in to import XLSX data.')
  }

  let decoded: unknown

  try {
    // Use jwtDecode (same as the GraphQL server in apollo.ts) — no signature
    // verification here. Authorization is enforced by Neo4j @authorization
    // directives when the Bearer token is forwarded to the GraphQL mutations.
    decoded = jwtDecode(accessToken)
  } catch {
    throw new Error(
      'Your session token could not be read. Sign out, sign in again, and retry.'
    )
  }

  if (!isJwtPayload(decoded) || !decoded.user?.id) {
    throw new Error(
      'Your session token is invalid. Please sign in again and retry the import.'
    )
  }

  if (requestedUserId && requestedUserId !== decoded.user.id) {
    throw new Error(
      'The authenticated user does not match the requested import user. Refresh the page and try again.'
    )
  }

  const firstName = decoded.user.firstName?.trim()
  const lastName = decoded.user.lastName?.trim()
  const fallbackName = [firstName, lastName].filter(Boolean).join(' ').trim()

  return {
    id: decoded.user.id,
    displayName:
      decoded.user.name?.trim() ||
      fallbackName ||
      decoded.user.email?.trim() ||
      'User',
    email: decoded.user.email?.trim(),
  }
}
