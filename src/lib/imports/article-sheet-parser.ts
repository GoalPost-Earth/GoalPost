import * as XLSX from 'xlsx'
import { workbookToNormalizedRows } from './csv-import-utils'

/**
 * The one piece of the article-import stack that needs the `xlsx` parser.
 *
 * Split out of `article-import.ts` (GOAL-326) because that module is now
 * imported by two *server* surfaces — the cron worker and the job-status
 * route — purely for a status enum and a couple of pure helpers. Leaving the
 * parser there bundled ~1MB of spreadsheet code into both serverless functions,
 * paid on every cold start, for code neither of them can reach. Only the
 * browser parses sheets.
 */

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
