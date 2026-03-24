import Papa from 'papaparse'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/app/api/auth/utils'

export type CsvImportType = 'we-space' | 'field-context' | 'pulse'
export type SpaceScope = 'me-space' | 'we-space'

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

export interface ParsedCsvData {
  rows: Record<string, string>[]
  parseErrors: string[]
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

export function parseCsvText(csvText: string): ParsedCsvData {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalizeHeader,
  })

  const rows = parsed.data.map((row) => {
    const normalizedRow: Record<string, string> = {}

    for (const [key, value] of Object.entries(row)) {
      if (!key) {
        continue
      }

      normalizedRow[normalizeHeader(key)] =
        typeof value === 'string' ? value : ''
    }

    return normalizedRow
  })

  const parseErrors = parsed.errors.map((error) => {
    const rowPrefix =
      typeof error.row === 'number' ? `Row ${error.row + 2}: ` : ''
    return `${rowPrefix}${error.message}`
  })

  return { rows, parseErrors }
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

export function resolvePulseType(
  rawValue?: string
): 'goal' | 'resource' | 'story' | 'care' | 'core-value' {
  const normalizedValue = normalizeNameForMatch(rawValue ?? 'story').replace(
    /_/g,
    '-'
  )

  if (['goal', 'goals'].includes(normalizedValue)) {
    return 'goal'
  }

  if (['resource', 'resources'].includes(normalizedValue)) {
    return 'resource'
  }

  if (['care', 'care-pulse', 'carepulse'].includes(normalizedValue)) {
    return 'care'
  }

  if (
    ['core-value', 'corevalue', 'core-value-pulse'].includes(normalizedValue)
  ) {
    return 'core-value'
  }

  return 'story'
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

export function requireAuthenticatedImportUser(
  request: NextRequest,
  requestedUserId?: string
): AuthenticatedImportUser {
  const accessToken = request.cookies.get('accessToken')?.value

  if (!accessToken) {
    throw new Error('You must be logged in to import CSV data.')
  }

  const verifiedToken = verifyJWT(accessToken)

  if (!isJwtPayload(verifiedToken) || !verifiedToken.user?.id) {
    throw new Error(
      'Your session token is invalid. Please sign in again and retry the import.'
    )
  }

  if (requestedUserId && requestedUserId !== verifiedToken.user.id) {
    throw new Error(
      'The authenticated user does not match the requested import user. Refresh the page and try again.'
    )
  }

  const firstName = verifiedToken.user.firstName?.trim()
  const lastName = verifiedToken.user.lastName?.trim()
  const fallbackName = [firstName, lastName].filter(Boolean).join(' ').trim()

  return {
    id: verifiedToken.user.id,
    displayName:
      verifiedToken.user.name?.trim() ||
      fallbackName ||
      verifiedToken.user.email?.trim() ||
      'User',
    email: verifiedToken.user.email?.trim(),
  }
}
