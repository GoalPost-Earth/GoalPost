import {
  CONTACT_FIELD_LIMITS,
  contactDisplayName,
  finalizeContactRecord,
  summarizeContactOutcomes,
  type ContactImportOutcome,
  type ContactRecord,
} from './contact-import'

/**
 * GOAL-382 — unit tests for the shared contact-import shape: row
 * finalization (cleaning + validation), display names and outcome summaries.
 * Pure functions only; the Neo4j-backed service
 * (contact-import-service.ts) is intentionally out of scope here.
 */

function person(overrides: Partial<ContactRecord> = {}): ContactRecord {
  return {
    row: 2,
    kind: 'person',
    firstName: 'Ama',
    lastName: 'Mensah',
    email: 'ama@example.org',
    ...overrides,
  }
}

function organization(overrides: Partial<ContactRecord> = {}): ContactRecord {
  return {
    row: 3,
    kind: 'organization',
    name: 'Artisan Cooperative',
    ...overrides,
  }
}

function finalized(record: ContactRecord): ContactRecord {
  const result = finalizeContactRecord(record)
  if ('error' in result) {
    throw new Error(`expected a record, got error: ${result.error.message}`)
  }
  return result.record
}

function finalizeError(record: ContactRecord) {
  const result = finalizeContactRecord(record)
  if (!('error' in result)) {
    throw new Error('expected a row error, got a record')
  }
  return result.error
}

describe('finalizeContactRecord', () => {
  describe('cleaning text fields', () => {
    it('trims values and collapses inner whitespace on single-line fields', () => {
      const record = finalized(
        person({
          firstName: '  Ama ',
          lastName: 'Mensah\t',
          location: 'Accra,\n  Ghana',
          phone: ' +233  20 000 0000 ',
        })
      )
      expect(record.firstName).toBe('Ama')
      expect(record.lastName).toBe('Mensah')
      expect(record.location).toBe('Accra, Ghana')
      expect(record.phone).toBe('+233 20 000 0000')
    })

    it('keeps line breaks in the description (notes are prose)', () => {
      const record = finalized(
        person({
          description:
            '  Met at the spring gathering.\nFollow up re: dye workshop.  ',
        })
      )
      expect(record.description).toBe(
        'Met at the spring gathering.\nFollow up re: dye workshop.'
      )
    })

    it('drops blank and whitespace-only fields entirely', () => {
      const record = finalized(
        person({ phone: '   ', location: '', jobTitle: '\n' })
      )
      expect(record).not.toHaveProperty('phone')
      expect(record).not.toHaveProperty('location')
      expect(record).not.toHaveProperty('jobTitle')
    })

    it('preserves row and kind', () => {
      const record = finalized(person({ row: 17 }))
      expect(record.row).toBe(17)
      expect(record.kind).toBe('person')
    })
  })

  describe('when the contact is a person', () => {
    it('splits a single full name into first and last name', () => {
      const record = finalized(
        person({
          firstName: undefined,
          lastName: undefined,
          name: 'Kwame  Nkrumah Jr.',
        })
      )
      expect(record.firstName).toBe('Kwame')
      expect(record.lastName).toBe('Nkrumah Jr.')
      expect(record).not.toHaveProperty('name')
    })

    it('treats a one-word full name as the first name', () => {
      const record = finalized(
        person({ firstName: undefined, lastName: undefined, name: 'Madonna' })
      )
      expect(record.firstName).toBe('Madonna')
      expect(record).not.toHaveProperty('lastName')
    })

    it('prefers explicit first/last over the full name and drops the full name', () => {
      const record = finalized(person({ name: 'Ama A. Mensah' }))
      expect(record.firstName).toBe('Ama')
      expect(record.lastName).toBe('Mensah')
      expect(record).not.toHaveProperty('name')
    })

    it('promotes a lone last name to the first name', () => {
      const record = finalized(
        person({ firstName: undefined, lastName: 'Osei' })
      )
      expect(record.firstName).toBe('Osei')
      expect(record).not.toHaveProperty('lastName')
    })

    it('keeps organization and job title but drops website', () => {
      const record = finalized(
        person({
          organization: 'Artisan Cooperative',
          jobTitle: 'Coordinator',
          website: 'https://ama.example',
        })
      )
      expect(record.organization).toBe('Artisan Cooperative')
      expect(record.jobTitle).toBe('Coordinator')
      expect(record).not.toHaveProperty('website')
    })

    it('returns a row error when there is no name at all', () => {
      expect(
        finalizeError(
          person({
            row: 9,
            firstName: '  ',
            lastName: undefined,
            name: undefined,
          })
        )
      ).toEqual({ row: 9, message: 'This contact has no name.' })
    })
  })

  describe('when the contact is an organization', () => {
    it('keeps name and website and drops person-only fields', () => {
      const record = finalized(
        organization({
          website: 'https://artisan.example',
          firstName: 'Ama',
          lastName: 'Mensah',
          organization: 'Parent Org',
          jobTitle: 'Coordinator',
        })
      )
      expect(record).toEqual({
        row: 3,
        kind: 'organization',
        name: 'Artisan Cooperative',
        website: 'https://artisan.example',
      })
    })

    it('falls back to the organization field for its name', () => {
      const record = finalized(
        organization({ name: undefined, organization: 'Riverbank Food Bank' })
      )
      expect(record.name).toBe('Riverbank Food Bank')
      expect(record).not.toHaveProperty('organization')
    })

    it('returns a row error when it has no name', () => {
      expect(finalizeError(organization({ row: 4, name: ' ' }))).toEqual({
        row: 4,
        message: 'This organization has no name.',
      })
    })
  })

  describe('website handling (organizations)', () => {
    const WEBSITE_ERROR = 'The website must be an http or https address.'

    it('adds https:// to a scheme-less address', () => {
      expect(
        finalized(organization({ website: 'www.example.org' })).website
      ).toBe('https://www.example.org')
    })

    it('adds https:// to a bare domain with a path', () => {
      expect(
        finalized(organization({ website: 'example.org/about' })).website
      ).toBe('https://example.org/about')
    })

    it('adds https:// to a scheme-less host with a port', () => {
      expect(
        finalized(organization({ website: 'www.example.org:8080/about' }))
          .website
      ).toBe('https://www.example.org:8080/about')
    })

    it.each([
      'https://example.org',
      'http://example.org/path?q=1',
      'HTTPS://Ex.org',
    ])('keeps %p unchanged', (website) => {
      expect(finalized(organization({ website })).website).toBe(website)
    })

    it.each([
      'javascript:alert(1)',
      'JavaScript:alert(document.cookie)',
      'ftp://x',
      'data:text/html,<script>alert(1)</script>',
      'mailto:hello@example.org',
    ])('rejects %p as a row error', (website) => {
      expect(finalizeError(organization({ row: 7, website }))).toEqual({
        row: 7,
        message: WEBSITE_ERROR,
      })
    })

    it('trims before deciding on the scheme', () => {
      expect(
        finalized(organization({ website: '  www.example.org  ' })).website
      ).toBe('https://www.example.org')
    })

    it('never validates a person website (it is dropped first)', () => {
      expect(
        finalized(person({ website: 'javascript:alert(1)' }))
      ).not.toHaveProperty('website')
    })
  })

  describe('validation', () => {
    it('rejects a malformed email with a row error naming the value', () => {
      expect(
        finalizeError(person({ row: 5, email: 'ama at example.org' }))
      ).toEqual({
        row: 5,
        message: '"ama at example.org" is not a valid email address.',
      })
    })

    it.each(['ama@example', '@example.org', 'ama@@example.org'])(
      'rejects %p',
      (email) => {
        expect(finalizeError(person({ email })).message).toMatch(
          /not a valid email/
        )
      }
    )

    it('accepts a contact with no email', () => {
      expect(finalized(person({ email: undefined }))).not.toHaveProperty(
        'email'
      )
    })

    it('trims an email before validating it', () => {
      expect(finalized(person({ email: '  ama@example.org ' })).email).toBe(
        'ama@example.org'
      )
    })

    it('accepts a value exactly at its limit', () => {
      const name = 'A'.repeat(CONTACT_FIELD_LIMITS.firstName)
      expect(finalized(person({ firstName: name })).firstName).toBe(name)
    })

    it('rejects an over-long value with the field and limit in the message', () => {
      const error = finalizeError(
        person({
          row: 6,
          jobTitle: 'x'.repeat(CONTACT_FIELD_LIMITS.jobTitle + 1),
        })
      )
      expect(error).toEqual({
        row: 6,
        message: `The jobTitle value is longer than ${CONTACT_FIELD_LIMITS.jobTitle} characters.`,
      })
    })

    it('does not count trimmed whitespace toward the limit', () => {
      const name = 'B'.repeat(CONTACT_FIELD_LIMITS.lastName)
      expect(finalized(person({ lastName: `   ${name}   ` })).lastName).toBe(
        name
      )
    })
  })
})

describe('contactDisplayName', () => {
  it('joins first and last name for a person', () => {
    expect(contactDisplayName(person())).toBe('Ama Mensah')
  })

  it('uses whichever half of a person name exists', () => {
    expect(contactDisplayName(person({ lastName: undefined }))).toBe('Ama')
    expect(contactDisplayName(person({ firstName: undefined }))).toBe('Mensah')
  })

  it('falls back to the full name for an un-split person', () => {
    expect(
      contactDisplayName(
        person({
          firstName: undefined,
          lastName: undefined,
          name: 'Kofi Annan',
        })
      )
    ).toBe('Kofi Annan')
  })

  it('uses the name for an organization, ignoring person fields', () => {
    expect(contactDisplayName(organization({ firstName: 'Ama' }))).toBe(
      'Artisan Cooperative'
    )
  })

  it('returns an empty string when nothing is named', () => {
    expect(contactDisplayName({ row: 1, kind: 'person' })).toBe('')
    expect(contactDisplayName({ row: 1, kind: 'organization' })).toBe('')
  })
})

describe('summarizeContactOutcomes', () => {
  it('counts each status', () => {
    const outcomes: ContactImportOutcome[] = [
      { row: 2, kind: 'person', name: 'Ama Mensah', status: 'created' },
      { row: 3, kind: 'person', name: 'Kofi Annan', status: 'created' },
      {
        row: 4,
        kind: 'organization',
        name: 'Artisan Cooperative',
        status: 'updated',
      },
      { row: 5, kind: 'person', name: 'Esi Owusu', status: 'linked' },
      {
        row: 6,
        kind: 'person',
        name: 'Yaw Boateng',
        status: 'skipped',
        message: 'Already in this field',
      },
    ]
    expect(summarizeContactOutcomes(outcomes)).toEqual({
      created: 2,
      updated: 1,
      linked: 1,
      skipped: 1,
    })
  })

  it('returns all zeros for no outcomes', () => {
    expect(summarizeContactOutcomes([])).toEqual({
      created: 0,
      updated: 0,
      linked: 0,
      skipped: 0,
    })
  })
})
