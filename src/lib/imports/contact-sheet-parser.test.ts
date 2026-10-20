import * as XLSX from 'xlsx'
import { parseContactWorkbook } from './contact-sheet-parser'
import {
  CONTACT_TEMPLATE_COLUMNS,
  CONTACT_TEMPLATE_SAMPLE_ROWS,
  parseTabularContacts,
} from './contact-sources'

/**
 * GOAL-382 — unit tests for Excel (.xlsx) contact files. Workbooks are built
 * in memory with SheetJS, so this is pure parsing — nothing touches Neo4j.
 */

type Cell = string | number | null

interface SheetSpec {
  name?: string
  rows: Cell[][]
  origin?: string
}

function workbookBuffer(...sheets: SheetSpec[]): ArrayBuffer {
  const workbook = XLSX.utils.book_new()
  sheets.forEach((spec, index) => {
    const sheet = XLSX.utils.aoa_to_sheet(
      spec.rows,
      // `origin` is supported at runtime but missing from AOA2SheetOpts' typings.
      (spec.origin ? { origin: spec.origin } : {}) as XLSX.AOA2SheetOpts
    )
    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      spec.name ?? `Sheet${index + 1}`
    )
  })
  return XLSX.write(workbook, {
    type: 'array',
    bookType: 'xlsx',
  }) as ArrayBuffer
}

const OUTLOOK_HEADER = [
  'First Name',
  'Middle Name',
  'Last Name',
  'E-mail Address',
  'Mobile Phone',
  'Business Phone',
  'Job Title',
  'Company',
  'Business City',
  'Business State',
  'Business Country/Region',
  'Web Page',
  'Notes',
]

describe('parseContactWorkbook', () => {
  describe('when the GoalPost template is saved as .xlsx', () => {
    const result = parseContactWorkbook(
      workbookBuffer({
        rows: [CONTACT_TEMPLATE_COLUMNS, ...CONTACT_TEMPLATE_SAMPLE_ROWS],
      })
    )

    it('detects the GoalPost CSV template profile', () => {
      expect(result.fileError).toBeUndefined()
      expect(result.profile?.id).toBe('generic-csv')
      expect(result.errors).toEqual([])
    })

    it('round-trips the sample person and organization', () => {
      expect(result.records).toEqual([
        {
          row: 2,
          kind: 'person',
          firstName: 'Ama',
          lastName: 'Mensah',
          email: 'ama@example.org',
          phone: '+233 20 000 0000',
          location: 'Accra, Ghana',
          description: 'Met at the spring gathering',
          organization: 'Artisan Cooperative',
          jobTitle: 'Coordinator',
        },
        {
          row: 3,
          kind: 'organization',
          name: 'Artisan Cooperative',
          email: 'hello@artisan.example',
          location: 'Accra, Ghana',
          description: 'Weaving and dye collective',
          website: 'https://artisan.example',
        },
      ])
    })

    it('matches what the CSV path produces for the same rows', () => {
      expect(result).toEqual(
        parseTabularContacts([
          CONTACT_TEMPLATE_COLUMNS,
          ...CONTACT_TEMPLATE_SAMPLE_ROWS,
        ])
      )
    })
  })

  describe('when the sheet is an Outlook export', () => {
    const row = (values: Record<string, string>) =>
      OUTLOOK_HEADER.map((column) => values[column] ?? '')
    const result = parseContactWorkbook(
      workbookBuffer({
        rows: [
          OUTLOOK_HEADER,
          row({
            'First Name': 'Kofi',
            'Last Name': 'Boateng',
            'E-mail Address': 'kofi@example.org',
            'Mobile Phone': '+233 24 111 2222',
            Company: 'Riverbank Food Bank',
            'Job Title': 'Driver',
            'Business City': 'Kumasi',
            'Business Country/Region': 'Ghana',
          }),
        ],
      })
    )

    it('detects the Outlook profile', () => {
      expect(result.fileError).toBeUndefined()
      expect(result.profile?.id).toBe('outlook-csv')
    })

    it('maps the Outlook columns', () => {
      expect(result.records).toEqual([
        {
          row: 2,
          kind: 'person',
          firstName: 'Kofi',
          lastName: 'Boateng',
          email: 'kofi@example.org',
          phone: '+233 24 111 2222',
          organization: 'Riverbank Food Bank',
          jobTitle: 'Driver',
          location: 'Kumasi, Ghana',
        },
      ])
    })
  })

  describe('row numbers match the ones Excel shows', () => {
    it('keeps counting across a blank row between contacts', () => {
      const result = parseContactWorkbook(
        workbookBuffer({
          rows: [
            ['name', 'email'],
            ['Seed Library', 'seeds@example.org'],
            [],
            ['Esi Owusu', 'esi@example.org'],
            ['', ''],
            ['Mill Lane Makers', 'mill@example.org'],
          ],
        })
      )
      expect(result.fileError).toBeUndefined()
      expect(result.errors).toEqual([])
      expect(
        result.records.map((record) => [record.row, record.email])
      ).toEqual([
        [2, 'seeds@example.org'],
        [4, 'esi@example.org'],
        [6, 'mill@example.org'],
      ])
    })

    it('pads when the content starts at row 3', () => {
      const result = parseContactWorkbook(
        workbookBuffer({
          origin: 'A3',
          rows: [
            ['name', 'email'],
            ['Seed Library', 'seeds@example.org'],
            ['Esi Owusu', 'esi@example.org'],
          ],
        })
      )
      expect(result.fileError).toBeUndefined()
      expect(result.profile?.id).toBe('generic-csv')
      expect(
        result.records.map((record) => [record.row, record.email])
      ).toEqual([
        [4, 'seeds@example.org'],
        [5, 'esi@example.org'],
      ])
    })

    it('reports a row error on the Excel row number when content is offset', () => {
      const result = parseContactWorkbook(
        workbookBuffer({
          origin: 'A3',
          rows: [
            ['name', 'email'],
            ['Seed Library', 'not-an-email'],
          ],
        })
      )
      expect(result.records).toEqual([])
      expect(result.errors).toEqual([
        { row: 4, message: '"not-an-email" is not a valid email address.' },
      ])
    })

    it('keeps columns aligned when the content starts in column C', () => {
      const result = parseContactWorkbook(
        workbookBuffer({
          origin: 'C2',
          rows: [
            ['name', 'email'],
            ['Seed Library', 'seeds@example.org'],
          ],
        })
      )
      expect(result.records).toEqual([
        {
          row: 3,
          kind: 'person',
          firstName: 'Seed',
          lastName: 'Library',
          email: 'seeds@example.org',
        },
      ])
    })
  })

  it('reads only the first worksheet', () => {
    const result = parseContactWorkbook(
      workbookBuffer(
        {
          name: 'Contacts',
          rows: [
            ['name', 'email'],
            ['Esi Owusu', 'esi@example.org'],
          ],
        },
        {
          name: 'Archive',
          rows: [
            ['name', 'email'],
            ['Old Contact', 'old@example.org'],
            ['Another', 'another@example.org'],
          ],
        }
      )
    )
    expect(result.records.map((record) => record.email)).toEqual([
      'esi@example.org',
    ])
  })

  it('reads the first worksheet even when it is not named "Sheet1"', () => {
    const result = parseContactWorkbook(
      workbookBuffer(
        { name: 'Notes', rows: [['nothing useful here']] },
        { name: 'Sheet1', rows: [['name'], ['Seed Library']] }
      )
    )
    expect(result.records).toEqual([])
    expect(result.fileError).toMatch(/could not find contact columns/)
  })

  it('turns a phone stored as a number into a string', () => {
    const result = parseContactWorkbook(
      workbookBuffer({
        rows: [
          ['name', 'phone', 'notes'],
          ['Esi Owusu', 233200000000, 42],
        ],
      })
    )
    expect(result.errors).toEqual([])
    expect(result.records).toHaveLength(1)
    const [record] = result.records
    expect(typeof record.phone).toBe('string')
    expect(record.phone).toBe('233200000000')
    expect(record.description).toBe('42')
  })

  it('keeps a short numeric phone and leaves non-integer numbers as displayed', () => {
    const result = parseContactWorkbook(
      workbookBuffer({
        rows: [
          ['name', 'phone', 'notes'],
          ['Esi Owusu', 244111222, 0.5],
        ],
      })
    )
    expect(result.records[0].phone).toBe('244111222')
    expect(result.records[0].description).toBe('0.5')
  })

  describe('when the file cannot be imported', () => {
    it('gives a friendly fileError for a workbook with an empty sheet', () => {
      const result = parseContactWorkbook(workbookBuffer({ rows: [] }))
      expect(result.profile).toBeNull()
      expect(result.records).toEqual([])
      expect(result.errors).toEqual([])
      expect(result.fileError).toEqual(expect.any(String))
    })

    it('gives a friendly fileError for a workbook with headers it does not know', () => {
      const result = parseContactWorkbook(
        workbookBuffer({
          rows: [
            ['Fruit', 'Colour'],
            ['Apple', 'Red'],
          ],
        })
      )
      expect(result.profile).toBeNull()
      expect(result.fileError).toMatch(/could not find contact columns/)
    })

    it('does not throw on random bytes', () => {
      const bytes = new Uint8Array(512)
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = (i * 37 + 11) % 256
      let result: ReturnType<typeof parseContactWorkbook> | undefined
      expect(() => {
        result = parseContactWorkbook(bytes.buffer)
      }).not.toThrow()
      expect(result?.records).toEqual([])
      expect(result?.fileError).toEqual(expect.any(String))
    })

    it('does not throw on a corrupt .xlsx (zip signature, broken body)', () => {
      const bytes = new Uint8Array([
        0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4, 5, 6, 7, 8,
      ])
      let result: ReturnType<typeof parseContactWorkbook> | undefined
      expect(() => {
        result = parseContactWorkbook(bytes.buffer)
      }).not.toThrow()
      expect(result?.records).toEqual([])
      expect(result?.fileError).toEqual(expect.any(String))
    })

    it('does not throw on an empty ArrayBuffer', () => {
      let result: ReturnType<typeof parseContactWorkbook> | undefined
      expect(() => {
        result = parseContactWorkbook(new ArrayBuffer(0))
      }).not.toThrow()
      expect(result?.records).toEqual([])
      expect(result?.fileError).toEqual(expect.any(String))
    })
  })

  describe('when a profile is requested explicitly', () => {
    // A LinkedIn-shaped header would auto-detect as linkedin-csv.
    const rows = [
      [
        'First Name',
        'Last Name',
        'URL',
        'Email Address',
        'Company',
        'Position',
      ],
      [
        'Abena',
        'Asante',
        'https://www.linkedin.com/in/abena',
        'abena@example.org',
        'Riverbank Food Bank',
        'Volunteer Lead',
      ],
    ]

    it('auto-detects LinkedIn without a request', () => {
      expect(parseContactWorkbook(workbookBuffer({ rows })).profile?.id).toBe(
        'linkedin-csv'
      )
    })

    it('uses the requested profile instead', () => {
      const result = parseContactWorkbook(
        workbookBuffer({ rows }),
        'outlook-csv'
      )
      expect(result.profile?.id).toBe('outlook-csv')
      // Outlook has no "email address" / "position" columns.
      expect(result.records).toEqual([
        {
          row: 2,
          kind: 'person',
          firstName: 'Abena',
          lastName: 'Asante',
          organization: 'Riverbank Food Bank',
        },
      ])
    })

    it('gives a fileError when the requested profile fits none of the columns', () => {
      const result = parseContactWorkbook(
        workbookBuffer({
          rows: [
            ['Given Name', 'Family Name'],
            ['Abena', 'Asante'],
          ],
        }),
        'linkedin-csv'
      )
      expect(result.profile).toBeNull()
      expect(result.fileError).toMatch(/could not find contact columns/)
    })
  })
})
