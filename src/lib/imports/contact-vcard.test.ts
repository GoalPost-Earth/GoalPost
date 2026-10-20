import { parseVCardContacts } from './contact-vcard'

/**
 * GOAL-382 — unit tests for the vCard reader (2.1 / 3.0 / 4.0). Fixtures are
 * shaped after real exports: Apple Contacts / iCloud (3.0, group prefixes,
 * X-ABShowAs), Google (3.0), Android / older Outlook (2.1, QUOTED-PRINTABLE)
 * and RFC 6350 (4.0, KIND, PREF=1).
 */

/** vCard requires CRLF line endings; build fixtures the way exporters write them. */
function crlf(lines: string[]): string {
  return lines.join('\r\n') + '\r\n'
}

const APPLE_3_0 = crlf([
  'BEGIN:VCARD',
  'VERSION:3.0',
  'PRODID:-//Apple Inc.//macOS 15.0//EN',
  'N:Mensah;Ama;Akosua;;',
  'FN:Ama Akosua Mensah',
  'ORG:Artisan Cooperative;Weaving',
  'TITLE:Coordinator',
  'item1.EMAIL;type=INTERNET;type=pref:ama@artisan.example',
  'item1.X-ABLabel:_$!<Work>!$_',
  'EMAIL;type=INTERNET;type=HOME:ama.home@example.org',
  'TEL;type=CELL;type=VOICE;type=pref:+233 20 000 0000',
  'item2.ADR;type=WORK;type=pref:;;12 Oxford St;Accra;Greater Accra;GA-123;Ghana',
  'NOTE:Met at the spring gathering\\, Accra.\\nFollow up re: dye workshop.',
  'PHOTO;ENCODING=b;TYPE=JPEG:/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIx',
  ' wcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy',
  'BDAY:1990-04-12',
  'END:VCARD',
])

describe('parseVCardContacts', () => {
  describe('vCard 3.0 (Apple Contacts)', () => {
    const [contact] = parseVCardContacts(APPLE_3_0)

    it('maps the structured N name onto first/last name', () => {
      expect(contact.kind).toBe('person')
      expect(contact.firstName).toBe('Ama')
      expect(contact.lastName).toBe('Mensah')
      expect(contact.name).toBe('Ama Akosua Mensah')
    })

    it('takes the first ORG component as the organization', () => {
      expect(contact.organization).toBe('Artisan Cooperative')
      expect(contact.jobTitle).toBe('Coordinator')
    })

    it('reads group-prefixed properties (item1.EMAIL) and picks the pref email', () => {
      expect(contact.email).toBe('ama@artisan.example')
    })

    it('picks the pref phone', () => {
      expect(contact.phone).toBe('+233 20 000 0000')
    })

    it('builds location from ADR locality, region and country', () => {
      expect(contact.location).toBe('Accra, Greater Accra, Ghana')
    })

    it('unescapes \\, and \\n in text values', () => {
      expect(contact.description).toBe(
        'Met at the spring gathering, Accra.\nFollow up re: dye workshop.'
      )
    })

    it('numbers the card as row 1', () => {
      expect(contact.row).toBe(1)
    })
  })

  it('reads every card in a multi-card file, numbering rows by card', () => {
    const text = crlf([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Mensah;Ama;;;',
      'FN:Ama Mensah',
      'END:VCARD',
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Owusu;Esi;;;',
      'FN:Esi Owusu',
      'EMAIL;TYPE=INTERNET:esi@example.org',
      'END:VCARD',
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Boateng;Yaw;;;',
      'FN:Yaw Boateng',
      'END:VCARD',
    ])
    const contacts = parseVCardContacts(text)
    expect(contacts.map((c) => [c.row, c.firstName, c.lastName])).toEqual([
      [1, 'Ama', 'Mensah'],
      [2, 'Esi', 'Owusu'],
      [3, 'Yaw', 'Boateng'],
    ])
    expect(contacts[1].email).toBe('esi@example.org')
  })

  it('accepts LF-only line endings and lowercase BEGIN/END', () => {
    const text = 'begin:vcard\nversion:3.0\nfn:Kofi Annan\nend:vcard\n'
    const [contact] = parseVCardContacts(text)
    expect(contact.name).toBe('Kofi Annan')
  })

  it('ignores text outside BEGIN/END and unterminated cards', () => {
    const text = crlf([
      'garbage before',
      'BEGIN:VCARD',
      'FN:Ama Mensah',
      'END:VCARD',
      'BEGIN:VCARD',
      'FN:Never Finished',
    ])
    const contacts = parseVCardContacts(text)
    expect(contacts).toHaveLength(1)
    expect(contacts[0].name).toBe('Ama Mensah')
  })

  it('returns no contacts for empty or non-vCard text', () => {
    expect(parseVCardContacts('')).toEqual([])
    expect(parseVCardContacts('name,email\nAma,ama@example.org')).toEqual([])
  })

  describe('line folding', () => {
    it('joins continuation lines that start with a space or tab', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Ama Mensah',
        'NOTE:This note is long enough that the exporter folded it ac',
        ' ross three lines\\, with a space-led and a',
        '\t tab-led continuation.',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.description).toBe(
        'This note is long enough that the exporter folded it across three lines, with a space-led and a tab-led continuation.'
      )
    })

    it('joins a folded property name and value', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:4.0',
        'FN:Ama Mensah',
        'EMA',
        ' IL:ama@exam',
        ' ple.org',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].email).toBe('ama@example.org')
    })
  })

  describe('vCard 2.1 (Android / older Outlook)', () => {
    it('decodes QUOTED-PRINTABLE UTF-8 values', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:2.1',
        'N;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:M=C3=BCller;J=C3=BCrgen;;;',
        'FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:J=C3=BCrgen M=C3=BCller',
        'TEL;CELL;PREF:+49 151 0000000',
        'TEL;HOME:+49 30 0000000',
        'EMAIL;INTERNET:juergen@example.de',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.firstName).toBe('Jürgen')
      expect(contact.lastName).toBe('Müller')
      expect(contact.name).toBe('Jürgen Müller')
      expect(contact.email).toBe('juergen@example.de')
    })

    it('reads bare parameters (TEL;CELL;PREF) as TYPE and honours PREF', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:2.1',
        'FN:Esi Owusu',
        'TEL;HOME:+233 30 111 1111',
        'TEL;CELL;PREF:+233 24 222 2222',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].phone).toBe('+233 24 222 2222')
    })

    it('joins QUOTED-PRINTABLE soft line breaks (trailing =) across lines', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:2.1',
        'FN:Esi Owusu',
        'NOTE;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:Caf=C3=A9 owner on the high st=',
        'reet. Bakes for the food bank=0D=0A=',
        'every Friday.',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.description).toBe(
        'Café owner on the high street. Bakes for the food bank\r\nevery Friday.'
      )
    })

    it('decodes the bare QUOTED-PRINTABLE parameter form', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:2.1',
        'N;CHARSET=UTF-8;QUOTED-PRINTABLE:Ad=C3=A9;Ren=C3=A9e;;;',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.firstName).toBe('Renée')
      expect(contact.lastName).toBe('Adé')
    })

    it('keeps a literal = that is not a hex escape', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:2.1',
        'FN:Esi Owusu',
        'NOTE;ENCODING=QUOTED-PRINTABLE:2+2=4 =ZZ',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].description).toBe('2+2=4 =ZZ')
    })
  })

  describe('vCard 4.0', () => {
    it('honours PREF=1 over the first email', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:4.0',
        'FN:Ama Mensah',
        'N:Mensah;Ama;;;',
        'EMAIL;TYPE=home:ama.home@example.org',
        'EMAIL;TYPE=work;PREF=1:ama@artisan.example',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].email).toBe('ama@artisan.example')
    })

    it('handles quoted parameter values containing : and ,', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:4.0',
        'FN:Ama Mensah',
        'EMAIL;TYPE="work,pref";LABEL="Desk: 3rd floor":ama@artisan.example',
        'EMAIL:ama.home@example.org',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].email).toBe('ama@artisan.example')
    })

    it('falls back to the first email when none is preferred', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:4.0',
        'FN:Ama Mensah',
        'EMAIL;TYPE=home:ama.home@example.org',
        'EMAIL;TYPE=work:ama@artisan.example',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].email).toBe('ama.home@example.org')
    })

    it('reads KIND:org as an organization with its website', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:4.0',
        'KIND:org',
        'FN:Riverbank Food Bank',
        'ORG:Riverbank Food Bank',
        'EMAIL:hello@riverbank.example',
        'URL:https://riverbank.example',
        'ADR;TYPE=work:;;4 Mill Lane;Leeds;;LS1 4AP;United Kingdom',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0]).toEqual({
        row: 1,
        kind: 'organization',
        name: 'Riverbank Food Bank',
        email: 'hello@riverbank.example',
        phone: undefined,
        location: 'Leeds, United Kingdom',
        description: undefined,
        website: 'https://riverbank.example',
      })
    })

    it('uses FN for an organization with no ORG', () => {
      const text = crlf(['BEGIN:VCARD', 'VERSION:4.0', 'KIND:organization', 'FN:Seed Library', 'END:VCARD'])
      const [contact] = parseVCardContacts(text)
      expect(contact.kind).toBe('organization')
      expect(contact.name).toBe('Seed Library')
    })
  })

  describe('organization inferred from ORG with no personal name', () => {
    it('reads ORG with no N and no FN as an organization', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'ORG:Riverbank Food Bank;Distribution',
        'URL:https://riverbank.example',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.kind).toBe('organization')
      expect(contact.name).toBe('Riverbank Food Bank')
      expect(contact.website).toBe('https://riverbank.example')
    })

    it('reads ORG with an empty N and an FN equal to the ORG as an organization', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:;;;;',
        'FN:Riverbank Food Bank',
        'ORG:Riverbank Food Bank;',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.kind).toBe('organization')
      expect(contact.name).toBe('Riverbank Food Bank')
    })

    it('reads ORG with no N and FN equal to ORG (escaped comma) as an organization', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:4.0',
        'FN:Darko\\, Darko & Partners',
        'ORG:Darko\\, Darko & Partners',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.kind).toBe('organization')
      expect(contact.name).toBe('Darko, Darko & Partners')
    })

    it('keeps a card with ORG and a real personal N as a person', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Asante;Abena;;;',
        'FN:Abena Asante',
        'ORG:Riverbank Food Bank',
        'TITLE:Volunteer Lead',
        'URL:https://abena.example',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.kind).toBe('person')
      expect(contact.firstName).toBe('Abena')
      expect(contact.lastName).toBe('Asante')
      expect(contact.organization).toBe('Riverbank Food Bank')
      expect(contact).not.toHaveProperty('website')
    })

    it('keeps a card with ORG and a lone given name in N as a person', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:;Abena;;;',
        'FN:Riverbank Food Bank',
        'ORG:Riverbank Food Bank',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].kind).toBe('person')
    })

    it('keeps a card with ORG, no N and a different FN as a person', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Abena Asante',
        'ORG:Riverbank Food Bank',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.kind).toBe('person')
      expect(contact.name).toBe('Abena Asante')
      expect(contact.organization).toBe('Riverbank Food Bank')
    })
  })

  describe('vCard 4 TEL URIs', () => {
    it('strips the tel: scheme from TEL;VALUE=uri', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:4.0',
        'FN:Ama Mensah',
        'TEL;VALUE=uri:tel:+1-555-0100',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].phone).toBe('+1-555-0100')
    })

    it('strips tel: from the preferred TEL URI among several', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:4.0',
        'FN:Ama Mensah',
        'TEL;VALUE=uri;TYPE=home:tel:+1-555-0199',
        'TEL;VALUE=uri;TYPE="cell,voice";PREF=1:TEL:+1-555-0100',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].phone).toBe('+1-555-0100')
    })

    it('leaves a plain-text TEL untouched', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Ama Mensah',
        'TEL;TYPE=CELL:+233 20 000 0000',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].phone).toBe('+233 20 000 0000')
    })
  })

  describe('structured values', () => {
    it('keeps escaped ; and , inside ORG and N components', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Smith\\, Jr.;John;;;',
        'FN:John Smith Jr.',
        'ORG:Acme\\, Inc.\\; Holdings;Research',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.lastName).toBe('Smith, Jr.')
      expect(contact.firstName).toBe('John')
      expect(contact.organization).toBe('Acme, Inc.; Holdings')
    })

    it('omits location when ADR has no locality, region or country', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Ama Mensah',
        'ADR;TYPE=HOME:;;12 Oxford St;;;;',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].location).toBeUndefined()
    })
  })

  describe('Apple X-ABShowAs:COMPANY', () => {
    it('reads the card as an organization named by ORG', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:;;;;',
        'FN:Artisan Cooperative',
        'ORG:Artisan Cooperative;',
        'item1.URL;type=pref:https://artisan.example',
        'item1.X-ABLabel:_$!<HomePage>!$_',
        'X-ABShowAs:COMPANY',
        'END:VCARD',
      ])
      const [contact] = parseVCardContacts(text)
      expect(contact.kind).toBe('organization')
      expect(contact.name).toBe('Artisan Cooperative')
      expect(contact.website).toBe('https://artisan.example')
    })
  })

  describe('PREF detection with repeated TYPE parameters', () => {
    it('finds pref when it is the last TYPE parameter', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Ama Mensah',
        'EMAIL;type=INTERNET;type=HOME:ama.home@example.org',
        'EMAIL;type=INTERNET;type=WORK;type=pref:ama@artisan.example',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].email).toBe('ama@artisan.example')
    })

    it('finds pref when it is NOT the last TYPE parameter', () => {
      const text = crlf([
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Ama Mensah',
        'EMAIL;type=INTERNET;type=HOME:ama.home@example.org',
        'EMAIL;type=pref;type=INTERNET;type=WORK:ama@artisan.example',
        'END:VCARD',
      ])
      expect(parseVCardContacts(text)[0].email).toBe('ama@artisan.example')
    })
  })
})
