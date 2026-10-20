import * as XLSX from 'xlsx'
import { parseTabularContacts, type ParsedContactFile } from './contact-sources'

/**
 * GOAL-382 — Excel (.xlsx / .xls) contact files.
 *
 * Kept apart from `contact-sources.ts` for the same reason as the article
 * import's sheet parser: the `xlsx` library is ~1MB and only the browser
 * parses files, so it must not ride along into anything server-side that
 * imports the profiles. The import modal is loaded on demand, so members who
 * never import never download it.
 *
 * Only the first worksheet is read. Cells come through as Excel DISPLAYS
 * them (`raw: false`) — a phone number Excel already turned into a number has
 * lost its `+` or leading zero, and that cannot be recovered here.
 */
export function parseContactWorkbook(
  data: ArrayBuffer,
  requestedProfileId?: string
): ParsedContactFile {
  let rows: string[][]
  try {
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return emptyFile('This workbook has no worksheets.')
    }
    const sheet = workbook.Sheets[sheetName]
    // SheetJS renders "General" integers wider than 11 characters the way a
    // narrow Excel column does — 233200000000 becomes "2.332E+11" — which
    // throws away a phone number's digits. Use the full integer instead.
    for (const address of Object.keys(sheet)) {
      if (address.startsWith('!')) continue
      const cell = sheet[address] as XLSX.CellObject
      if (
        cell.t === 'n' &&
        typeof cell.v === 'number' &&
        Number.isSafeInteger(cell.v) &&
        /e[+-]/i.test(cell.w ?? '')
      ) {
        cell.w = String(cell.v)
      }
    }
    rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      raw: false,
      defval: '',
      // Blank rows stay in place so each row's index is the row number Excel
      // shows — the same contract `parseTabularContacts` relies on for CSV.
      blankrows: true,
    })
    // The sheet's used range can start below row 1 (nothing in the first
    // rows); pad so indexes still line up with Excel's row numbers.
    const firstRow = sheet['!ref']
      ? XLSX.utils.decode_range(sheet['!ref']).s.r
      : 0
    rows = [...Array.from({ length: firstRow }, () => []), ...rows]
  } catch {
    return emptyFile('This spreadsheet could not be read.')
  }
  return parseTabularContacts(
    rows.map((cells) => cells.map((cell) => String(cell ?? ''))),
    requestedProfileId
  )
}

function emptyFile(fileError: string): ParsedContactFile {
  return { profile: null, records: [], errors: [], fileError }
}
