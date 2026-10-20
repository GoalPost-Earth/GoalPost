import Papa from 'papaparse'
import {
  CONTACT_SOURCE_PROFILES,
  CONTACT_TEMPLATE_COLUMNS,
  CONTACT_TEMPLATE_SAMPLE_ROWS,
  getContactSourceProfile,
  normalizeColumn,
  parseContactFile,
} from './contact-sources'

/**
 * GOAL-382 — unit tests for contact-file parsing and source-profile
 * detection (Outlook / Google / LinkedIn CSV, the GoalPost template, JSON,
 * vCard). Pure parsing only — nothing here touches Neo4j.
 */

/** The header row Outlook (classic / outlook.com) writes on "Export contacts". */
const OUTLOOK_HEADER = [
  'First Name',
  'Middle Name',
  'Last Name',
  'Title',
  'Suffix',
  'Nickname',
  'Given Yomi',
  'Surname Yomi',
  'E-mail Address',
  'E-mail 2 Address',
  'E-mail 3 Address',
  'Home Phone',
  'Home Phone 2',
  'Business Phone',
  'Business Phone 2',
  'Mobile Phone',
  'Car Phone',
  'Other Phone',
  'Primary Phone',
  'Pager',
  'Business Fax',
  'Home Fax',
  'Other Fax',
  'Company Main Telephone',
  'Callback',
  'Radio Phone',
  'Telex',
  'TTY/TDD Phone',
  'IMAddress',
  'Job Title',
  'Department',
  'Company',
  'Office Location',
  "Manager's Name",
  "Assistant's Name",
  "Assistant's Phone",
  'Company Yomi',
  'Business Street',
  'Business City',
  'Business State',
  'Business Postal Code',
  'Business Country/Region',
  'Home Street',
  'Home City',
  'Home State',
  'Home Postal Code',
  'Home Country/Region',
  'Other Street',
  'Other City',
  'Other State',
  'Other Postal Code',
  'Other Country/Region',
  'Personal Web Page',
  'Spouse',
  'Schools',
  'Hobby',
  'Location',
  'Web Page',
  'Birthday',
  'Anniversary',
  'Notes',
]

function outlookRow(values: Record<string, string>): string[] {
  return OUTLOOK_HEADER.map((column) => values[column] ?? '')
}

function toCsv(rows: string[][]): string {
  return Papa.unparse(rows, { newline: '\r\n' })
}

describe('normalizeColumn', () => {
  it.each([
    ['E-mail Address', 'e mail address'],
    ['e_mail  address', 'e mail address'],
    ['Business Country/Region', 'business country region'],
    ['  First Name ', 'first name'],
    ['E-mail 1 - Value', 'e mail 1 value'],
  ])('%p → %p', (input, expected) => {
    expect(normalizeColumn(input)).toBe(expected)
  })
})

describe('getContactSourceProfile', () => {
  it('finds every registered profile by id', () => {
    for (const profile of CONTACT_SOURCE_PROFILES) {
      expect(getContactSourceProfile(profile.id)).toBe(profile)
    }
  })

  it('returns undefined for an unknown id', () => {
    expect(getContactSourceProfile('thunderbird')).toBeUndefined()
  })
})

describe('parseContactFile', () => {
  describe('file format selection', () => {
    it('rejects an unknown extension with a file error', () => {
      const result = parseContactFile('contacts.xlsx', 'whatever')
      expect(result).toEqual({
        profile: null,
        records: [],
        errors: [],
        fileError: 'Upload a .vcf, .csv, Excel (.xlsx/.xls) or .json file.',
      })
    })

    it('rejects a file with no extension', () => {
      expect(parseContactFile('contacts', 'name\nAma').fileError).toBe(
        'Upload a .vcf, .csv, Excel (.xlsx/.xls) or .json file.'
      )
    })

    it('matches the extension case-insensitively', () => {
      const result = parseContactFile(
        'EXPORT.CSV',
        'name,email\nAma Mensah,ama@example.org'
      )
      expect(result.fileError).toBeUndefined()
      expect(result.records).toHaveLength(1)
    })
  })

  describe('vCard files', () => {
    it.each(['contacts.vcf', 'contacts.vcard'])('parses %s', (fileName) => {
      const text = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Mensah;Ama;;;',
        'FN:Ama Mensah',
        'EMAIL;TYPE=INTERNET:ama@example.org',
        'END:VCARD',
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Bad Email',
        'EMAIL:not-an-email',
        'END:VCARD',
      ].join('\r\n')
      const result = parseContactFile(fileName, text)
      expect(result.profile?.id).toBe('vcard')
      expect(result.records).toEqual([
        {
          row: 1,
          kind: 'person',
          firstName: 'Ama',
          lastName: 'Mensah',
          email: 'ama@example.org',
        },
      ])
      expect(result.errors).toEqual([
        { row: 2, message: '"not-an-email" is not a valid email address.' },
      ])
    })

    it('reports a file error when there are no cards', () => {
      const result = parseContactFile('empty.vcf', 'hello')
      expect(result.profile?.id).toBe('vcard')
      expect(result.fileError).toBe('This file has no vCard entries.')
    })
  })

  describe('Outlook CSV', () => {
    const text = toCsv([
      OUTLOOK_HEADER,
      outlookRow({
        'First Name': 'Ama',
        'Last Name': 'Mensah',
        Title: 'Ms.',
        'E-mail Address': 'ama@artisan.example',
        'E-mail 2 Address': 'ama.home@example.org',
        'Mobile Phone': '+233 20 000 0000',
        'Business Phone': '+233 30 000 0000',
        'Job Title': 'Coordinator',
        Company: 'Artisan Cooperative',
        'Business City': 'Accra',
        'Business Country/Region': 'Ghana',
        'Home City': 'Kumasi',
        'Web Page': 'https://ama.example',
        Notes:
          'Met at the spring gathering, Accra.\nFollow up re: dye workshop.',
      }),
      outlookRow({
        'First Name': 'Esi',
        'E-mail 2 Address': 'esi@example.org',
        'Home City': 'Cape Coast',
        'Home Country/Region': 'Ghana',
      }),
      outlookRow({ Company: 'Riverbank Food Bank', 'Business City': 'Leeds' }),
      outlookRow({
        'First Name': 'Yaw',
        'E-mail Address': 'yaw[at]example.org',
      }),
      outlookRow({ 'Job Title': 'Volunteer', 'Business City': 'Accra' }),
    ])
    const result = parseContactFile('contacts.csv', text)

    it('detects the Outlook profile from its header row', () => {
      expect(result.fileError).toBeUndefined()
      expect(result.profile?.id).toBe('outlook-csv')
    })

    it('maps a full person row (website dropped for people)', () => {
      expect(result.records[0]).toEqual({
        row: 2,
        kind: 'person',
        firstName: 'Ama',
        lastName: 'Mensah',
        email: 'ama@artisan.example',
        phone: '+233 20 000 0000',
        location: 'Accra, Ghana',
        description:
          'Met at the spring gathering, Accra.\nFollow up re: dye workshop.',
        organization: 'Artisan Cooperative',
        jobTitle: 'Coordinator',
      })
    })

    it('falls back to the next email column and the home address', () => {
      expect(result.records[1]).toEqual({
        row: 3,
        kind: 'person',
        firstName: 'Esi',
        email: 'esi@example.org',
        location: 'Cape Coast, Ghana',
      })
    })

    it('reads a Company-only row (no person name) as an organization', () => {
      expect(result.records[2]).toEqual({
        row: 4,
        kind: 'organization',
        name: 'Riverbank Food Bank',
        location: 'Leeds',
      })
    })

    it('reports an invalid email as a row error, numbered with the header as row 1', () => {
      expect(result.errors).toContainEqual({
        row: 5,
        message: '"yaw[at]example.org" is not a valid email address.',
      })
    })

    it('reports a row with no name and no company as a row error', () => {
      expect(result.errors).toContainEqual({
        row: 6,
        message: 'This contact has no name.',
      })
      expect(result.records).toHaveLength(3)
      expect(result.errors).toHaveLength(2)
    })
  })

  describe('Google Contacts CSV', () => {
    const header = [
      'First Name',
      'Middle Name',
      'Last Name',
      'Phonetic First Name',
      'Phonetic Middle Name',
      'Phonetic Last Name',
      'Name Prefix',
      'Name Suffix',
      'Nickname',
      'File As',
      'Organization Name',
      'Organization Title',
      'Organization Department',
      'Birthday',
      'Notes',
      'Photo',
      'Labels',
      'E-mail 1 - Label',
      'E-mail 1 - Value',
      'E-mail 2 - Label',
      'E-mail 2 - Value',
      'Phone 1 - Label',
      'Phone 1 - Value',
      'Address 1 - Label',
      'Address 1 - Formatted',
      'Address 1 - Street',
      'Address 1 - City',
      'Address 1 - PO Box',
      'Address 1 - Region',
      'Address 1 - Postal Code',
      'Address 1 - Country',
      'Address 1 - Extended Address',
      'Website 1 - Label',
      'Website 1 - Value',
    ]
    const row = (values: Record<string, string>) =>
      header.map((c) => values[c] ?? '')
    const text = toCsv([
      header,
      row({
        'First Name': 'Kofi',
        'Last Name': 'Boateng',
        'Organization Name': 'Seed Library',
        'Organization Title': 'Librarian',
        'E-mail 1 - Label': '* Work',
        'E-mail 1 - Value': 'kofi@seedlibrary.example',
        'Phone 1 - Label': 'Mobile',
        'Phone 1 - Value': '+233 24 555 5555',
        'Address 1 - City': 'Tamale',
        'Address 1 - Region': 'Northern',
        'Address 1 - Country': 'Ghana',
        Labels: '* myContacts',
      }),
      row({
        'Organization Name': 'Seed Library',
        'Website 1 - Value': 'https://seedlibrary.example',
      }),
    ])
    const result = parseContactFile('google.csv', text)

    it('detects the Google profile', () => {
      expect(result.profile?.id).toBe('google-csv')
    })

    it('maps the E-mail 1 - Value / Organization Name columns', () => {
      expect(result.records[0]).toEqual({
        row: 2,
        kind: 'person',
        firstName: 'Kofi',
        lastName: 'Boateng',
        email: 'kofi@seedlibrary.example',
        phone: '+233 24 555 5555',
        location: 'Tamale, Northern, Ghana',
        organization: 'Seed Library',
        jobTitle: 'Librarian',
      })
    })

    it('reads an Organization Name-only row as an organization with its website', () => {
      expect(result.records[1]).toEqual({
        row: 3,
        kind: 'organization',
        name: 'Seed Library',
        website: 'https://seedlibrary.example',
      })
    })
  })

  describe('LinkedIn connections CSV', () => {
    // LinkedIn's Connections.csv opens with a "Notes:" preamble before the header.
    const text = [
      'Notes:',
      '"When exporting your connection data, you may notice that some of the email addresses are missing. You will only see email addresses for connections who have allowed their connections to see or download their email address using this setting https://www.linkedin.com/psettings/privacy/email. You can learn more here https://www.linkedin.com/help/linkedin/answer/261"',
      '',
      'First Name,Last Name,URL,Email Address,Company,Position,Connected On',
      'Abena,Asante,https://www.linkedin.com/in/abena-asante,abena@example.org,Riverbank Food Bank,Volunteer Lead,14 Mar 2025',
      'Kwesi,Darko,https://www.linkedin.com/in/kwesi-darko,,"Darko, Darko & Partners",Partner,02 Jan 2024',
    ].join('\n')
    const result = parseContactFile('Connections.csv', text)

    it('skips the preamble and detects the LinkedIn profile', () => {
      expect(result.fileError).toBeUndefined()
      expect(result.profile?.id).toBe('linkedin-csv')
    })

    it('maps each connection (profile URL dropped for people)', () => {
      expect(result.errors).toEqual([])
      expect(
        result.records.map((record) => ({ ...record, row: undefined }))
      ).toEqual([
        {
          row: undefined,
          kind: 'person',
          firstName: 'Abena',
          lastName: 'Asante',
          email: 'abena@example.org',
          organization: 'Riverbank Food Bank',
          jobTitle: 'Volunteer Lead',
        },
        {
          row: undefined,
          kind: 'person',
          firstName: 'Kwesi',
          lastName: 'Darko',
          organization: 'Darko, Darko & Partners',
          jobTitle: 'Partner',
        },
      ])
    })

    it('detects LinkedIn from a header without "Connected On" (URL signature)', () => {
      const csv = [
        'First Name,Last Name,URL,Email Address,Company,Position',
        'Abena,Asante,https://www.linkedin.com/in/abena-asante,abena@example.org,Riverbank Food Bank,Volunteer Lead',
      ].join('\n')
      const parsed = parseContactFile('Connections.csv', csv)
      expect(parsed.profile?.id).toBe('linkedin-csv')
      expect(parsed.records).toEqual([
        {
          row: 2,
          kind: 'person',
          firstName: 'Abena',
          lastName: 'Asante',
          email: 'abena@example.org',
          organization: 'Riverbank Food Bank',
          jobTitle: 'Volunteer Lead',
        },
      ])
    })

    it('detects LinkedIn from a header with "Connected On" but no URL', () => {
      const csv = [
        'First Name,Last Name,Email Address,Company,Position,Connected On',
        'Abena,Asante,abena@example.org,Riverbank Food Bank,Volunteer Lead,14 Mar 2025',
      ].join('\n')
      expect(parseContactFile('Connections.csv', csv).profile?.id).toBe(
        'linkedin-csv'
      )
    })

    it('numbers rows consecutively after the header', () => {
      const [first, second] = result.records
      expect(second.row).toBe(first.row + 1)
    })
  })

  describe('GoalPost CSV template', () => {
    it('round-trips the downloadable template sample rows', () => {
      const text = toCsv([
        CONTACT_TEMPLATE_COLUMNS,
        ...CONTACT_TEMPLATE_SAMPLE_ROWS,
      ])
      const result = parseContactFile('goalpost-contacts-template.csv', text)
      expect(result.fileError).toBeUndefined()
      expect(result.profile?.id).toBe('generic-csv')
      expect(result.errors).toEqual([])
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

    it('has one sample cell per template column', () => {
      for (const row of CONTACT_TEMPLATE_SAMPLE_ROWS) {
        expect(row).toHaveLength(CONTACT_TEMPLATE_COLUMNS.length)
      }
    })

    it('lets the type column force a person or organization', () => {
      const text = toCsv([
        ['type', 'name', 'organization'],
        ['Organisation', 'Seed Library', ''],
        ['company', 'Mill Lane Makers', ''],
        ['person', '', 'Seed Library'],
        ['PERSON', 'Esi Owusu', ''],
      ])
      const result = parseContactFile('contacts.csv', text)
      expect(result.records).toEqual([
        { row: 2, kind: 'organization', name: 'Seed Library' },
        { row: 3, kind: 'organization', name: 'Mill Lane Makers' },
        { row: 5, kind: 'person', firstName: 'Esi', lastName: 'Owusu' },
      ])
      expect(result.errors).toEqual([
        { row: 4, message: 'This contact has no name.' },
      ])
    })

    it('infers the kind when the type column is blank or unrecognised', () => {
      const text = toCsv([
        ['type', 'first_name', 'organization'],
        ['', '', 'Seed Library'],
        ['friend', 'Yaw', 'Seed Library'],
      ])
      expect(parseContactFile('contacts.csv', text).records).toEqual([
        { row: 2, kind: 'organization', name: 'Seed Library' },
        {
          row: 3,
          kind: 'person',
          firstName: 'Yaw',
          organization: 'Seed Library',
        },
      ])
    })

    it('honours an explicitly requested profile', () => {
      const text = toCsv([
        ['First Name', 'Last Name', 'Company'],
        ['Ama', 'Mensah', 'Artisan Cooperative'],
      ])
      expect(parseContactFile('c.csv', text, 'generic-csv').profile?.id).toBe(
        'generic-csv'
      )
      expect(parseContactFile('c.csv', text, 'outlook-csv').profile?.id).toBe(
        'outlook-csv'
      )
    })

    it('skips blank lines without shifting row numbers, and keeps the first of duplicated headers', () => {
      const text =
        'name,email,email\r\n\r\nAma Mensah,ama@example.org,other@example.org\r\n'
      expect(parseContactFile('c.csv', text).records).toEqual([
        // Row 3: the blank line is row 2 in a spreadsheet app.
        {
          row: 3,
          kind: 'person',
          firstName: 'Ama',
          lastName: 'Mensah',
          email: 'ama@example.org',
        },
      ])
    })
  })

  describe('CSV with no recognisable columns', () => {
    it('returns a file error and no profile', () => {
      const text = toCsv([
        ['Foo', 'Bar', 'Baz'],
        ['1', '2', '3'],
      ])
      const result = parseContactFile('mystery.csv', text)
      expect(result.profile).toBeNull()
      expect(result.records).toEqual([])
      expect(result.fileError).toMatch(/could not find contact columns/)
    })

    it('returns a file error for an empty CSV', () => {
      expect(parseContactFile('empty.csv', '').fileError).toMatch(
        /could not find contact columns/
      )
    })
  })

  describe('JSON', () => {
    it('parses a bare array of contacts using our column vocabulary', () => {
      const text = JSON.stringify([
        {
          type: 'person',
          firstName: 'Ama',
          last_name: 'Mensah',
          email: 'ama@example.org',
          phone: 233200000000,
          organization: 'Artisan Cooperative',
          'Job Title': 'Coordinator',
        },
        {
          type: 'organization',
          name: 'Seed Library',
          website: 'https://seedlibrary.example',
        },
      ])
      const result = parseContactFile('contacts.json', text)
      expect(result.profile?.id).toBe('json')
      expect(result.errors).toEqual([])
      expect(result.records).toEqual([
        {
          row: 1,
          kind: 'person',
          firstName: 'Ama',
          lastName: 'Mensah',
          email: 'ama@example.org',
          phone: '233200000000',
          organization: 'Artisan Cooperative',
          jobTitle: 'Coordinator',
        },
        {
          row: 2,
          kind: 'organization',
          name: 'Seed Library',
          website: 'https://seedlibrary.example',
        },
      ])
    })

    it('accepts the canonical camelCase ContactRecord keys', () => {
      const text = JSON.stringify([
        {
          kind: 'person',
          firstName: 'Ama',
          lastName: 'Mensah',
          jobTitle: 'Coordinator',
          organization: 'Artisan Cooperative',
        },
      ])
      expect(parseContactFile('contacts.json', text).records).toEqual([
        {
          row: 1,
          kind: 'person',
          firstName: 'Ama',
          lastName: 'Mensah',
          organization: 'Artisan Cooperative',
          jobTitle: 'Coordinator',
        },
      ])
    })

    it('parses { contacts: [...] } and numbers rows from 1', () => {
      const text = JSON.stringify({
        contacts: [
          { name: 'Esi Owusu', email: 'esi@example.org' },
          { name: 'Yaw Boateng', email: 'not an email' },
          { email: 'nameless@example.org' },
          null,
          'just a string',
          { organization: 'Riverbank Food Bank', tags: ['food'], active: true },
        ],
      })
      const result = parseContactFile('export.json', text)
      expect(result.records).toEqual([
        {
          row: 1,
          kind: 'person',
          firstName: 'Esi',
          lastName: 'Owusu',
          email: 'esi@example.org',
        },
        { row: 6, kind: 'organization', name: 'Riverbank Food Bank' },
      ])
      expect(result.errors).toEqual([
        { row: 2, message: '"not an email" is not a valid email address.' },
        { row: 3, message: 'This contact has no name.' },
        { row: 4, message: 'This contact has no name.' },
        { row: 5, message: 'This contact has no name.' },
      ])
    })

    it('reports invalid JSON as a file error', () => {
      const result = parseContactFile('contacts.json', '[{"name": "Ama",}')
      expect(result.profile?.id).toBe('json')
      expect(result.records).toEqual([])
      expect(result.fileError).toBe('This file is not valid JSON.')
    })

    it.each([
      ['an object without contacts', '{"people": []}'],
      ['a string', '"Ama"'],
      ['null', 'null'],
    ])('reports %s as a file error', (_label, text) => {
      expect(parseContactFile('contacts.json', text).fileError).toBe(
        'Expected a JSON array of contacts, or an object with a "contacts" array.'
      )
    })
  })
})
