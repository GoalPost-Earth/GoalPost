import * as XLSX from 'xlsx'
import {
  buildArticleRowContent,
  normalizeArticleDate,
  normalizeArticleUrl,
  parseArticleRows,
  parseSpreadsheetArrayBuffer,
  resolveArticlePulseType,
  validateArticleTemplateHeaders,
  type ArticleImportRowInput,
} from './article-import'

/**
 * GOAL-317 — unit tests for the shared article-import parsing/validation
 * helpers. Pure functions only; the Neo4j-backed service
 * (article-import-service.ts) is intentionally out of scope here.
 */

function makeRowInput(
  overrides: Partial<ArticleImportRowInput> = {}
): ArticleImportRowInput {
  return {
    row: 2,
    title: 'Mutual aid networks after the storm',
    author: 'Amara Osei',
    date: '2026-05-14',
    url: 'https://example.org/articles/mutual-aid',
    pulseType: 'ResourcePulse',
    ...overrides,
  }
}

function stringToArrayBuffer(value: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(value)
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

describe('normalizeArticleUrl', () => {
  it('passes https URLs through verbatim', () => {
    expect(normalizeArticleUrl('https://example.org/articles/1')).toBe(
      'https://example.org/articles/1'
    )
  })

  it('passes http URLs through (no forced upgrade)', () => {
    expect(normalizeArticleUrl('http://example.org/a')).toBe(
      'http://example.org/a'
    )
  })

  it('accepts a scheme in any case', () => {
    expect(normalizeArticleUrl('HTTP://Example.org/Path')).toBe(
      'HTTP://Example.org/Path'
    )
  })

  it('prefixes https:// on bare domains', () => {
    expect(normalizeArticleUrl('example.org')).toBe('https://example.org')
  })

  it('prefixes https:// on domains with path, query, and fragment', () => {
    expect(normalizeArticleUrl('news.example.co.uk/story?id=7#top')).toBe(
      'https://news.example.co.uk/story?id=7#top'
    )
  })

  it('trims surrounding whitespace before normalizing', () => {
    expect(normalizeArticleUrl('  example.org/report  ')).toBe(
      'https://example.org/report'
    )
  })

  it('returns null for free text that is not a URL', () => {
    expect(normalizeArticleUrl('not a url')).toBeNull()
    expect(normalizeArticleUrl('garbage!!')).toBeNull()
  })

  it('returns null for empty and whitespace-only values', () => {
    expect(normalizeArticleUrl('')).toBeNull()
    expect(normalizeArticleUrl('   ')).toBeNull()
  })

  it('returns null for a dotless single word', () => {
    expect(normalizeArticleUrl('localhost')).toBeNull()
  })

  it('returns null for a scheme with no host', () => {
    expect(normalizeArticleUrl('https://')).toBeNull()
  })

  it('rejects non-http(s) schemes', () => {
    expect(normalizeArticleUrl('ftp://files.example.org/doc')).toBeNull()
    expect(normalizeArticleUrl('mailto:amara@example.org')).toBeNull()
    expect(normalizeArticleUrl('javascript:alert(1)')).toBeNull()
  })
})

describe('normalizeArticleDate', () => {
  it('passes ISO YYYY-MM-DD dates through', () => {
    expect(normalizeArticleDate('2026-05-14')).toBe('2026-05-14')
  })

  it('reduces ISO datetimes to the date part', () => {
    expect(normalizeArticleDate('2026-05-14T18:45:00Z')).toBe('2026-05-14')
  })

  it('normalizes long-form month dates to YYYY-MM-DD', () => {
    expect(normalizeArticleDate('May 14, 2026')).toBe('2026-05-14')
    expect(normalizeArticleDate('14 March 2026')).toBe('2026-03-14')
  })

  it('normalizes slashed numeric dates to YYYY-MM-DD', () => {
    expect(normalizeArticleDate('05/14/2026')).toBe('2026-05-14')
  })

  it('trims whitespace around a parseable date', () => {
    expect(normalizeArticleDate('  2026-05-14  ')).toBe('2026-05-14')
  })

  it('keeps unparseable free text verbatim (pulse time is a free string)', () => {
    expect(normalizeArticleDate('Spring 2026')).toBe('Spring 2026')
    expect(normalizeArticleDate('Q2 2026')).toBe('Q2 2026')
    expect(normalizeArticleDate('mid-2026')).toBe('mid-2026')
    expect(normalizeArticleDate('Summer of 2025')).toBe('Summer of 2025')
  })

  it('keeps a bare year verbatim rather than inventing January 1', () => {
    expect(normalizeArticleDate('2026')).toBe('2026')
  })

  it('returns an empty string for empty or whitespace-only input', () => {
    expect(normalizeArticleDate('')).toBe('')
    expect(normalizeArticleDate('   ')).toBe('')
  })
})

describe('resolveArticlePulseType', () => {
  it('defaults blank values to ResourcePulse (articles are resources)', () => {
    expect(resolveArticlePulseType(undefined)).toBe('ResourcePulse')
    expect(resolveArticlePulseType('')).toBe('ResourcePulse')
    expect(resolveArticlePulseType('   ')).toBe('ResourcePulse')
  })

  it('resolves goal keywords to GoalPulse', () => {
    expect(resolveArticlePulseType('goal')).toBe('GoalPulse')
    expect(resolveArticlePulseType('Goals')).toBe('GoalPulse')
  })

  it('resolves resource and article keywords to ResourcePulse', () => {
    expect(resolveArticlePulseType('resource')).toBe('ResourcePulse')
    expect(resolveArticlePulseType('resources')).toBe('ResourcePulse')
    expect(resolveArticlePulseType('article')).toBe('ResourcePulse')
    expect(resolveArticlePulseType('Articles')).toBe('ResourcePulse')
  })

  it('resolves story keywords to StoryPulse', () => {
    expect(resolveArticlePulseType('story')).toBe('StoryPulse')
    expect(resolveArticlePulseType('Stories')).toBe('StoryPulse')
  })

  it('accepts Pulse-suffixed variants', () => {
    expect(resolveArticlePulseType('GoalPulse')).toBe('GoalPulse')
    expect(resolveArticlePulseType('resource_pulse')).toBe('ResourcePulse')
    expect(resolveArticlePulseType('story-pulse')).toBe('StoryPulse')
    expect(resolveArticlePulseType('Story Pulse')).toBe('StoryPulse')
  })

  it('returns null for unsupported types so the row fails loudly', () => {
    expect(resolveArticlePulseType('meeting')).toBeNull()
    expect(resolveArticlePulseType('care')).toBeNull()
  })
})

describe('validateArticleTemplateHeaders', () => {
  it('accepts the canonical template headers', () => {
    const rows = [
      { title: 'T', author: 'A', date: '2026-01-01', url: 'example.org' },
    ]
    expect(validateArticleTemplateHeaders(rows)).toEqual([])
  })

  it('accepts alias headers for every required column', () => {
    const rows = [
      {
        headline: 'T',
        byline: 'A',
        pub_date: '2026-01-01',
        web_link: 'example.org',
      },
    ]
    expect(validateArticleTemplateHeaders(rows)).toEqual([])
  })

  it('reports a missing required column by its label', () => {
    const rows = [{ title: 'T', author: 'A', date: '2026-01-01' }]
    const errors = validateArticleTemplateHeaders(rows)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('"URL"')
    expect(errors[0]).toContain('url, link, article_url, web_link')
  })

  it('reports all four required columns when the sheet is empty', () => {
    const errors = validateArticleTemplateHeaders([])
    expect(errors).toHaveLength(4)
    expect(errors.join(' ')).toContain('"Article title"')
    expect(errors.join(' ')).toContain('"Author"')
    expect(errors.join(' ')).toContain('"Date"')
    expect(errors.join(' ')).toContain('"URL"')
  })
})

describe('parseArticleRows', () => {
  it('maps a valid row, numbering from spreadsheet row 2', () => {
    const { rows, errors } = parseArticleRows([
      {
        title: 'Mutual aid networks after the storm',
        author: 'Amara Osei',
        author_email: 'Amara@Example.org',
        date: 'May 14, 2026',
        url: 'example.org/articles/mutual-aid',
        pulse_type: 'story',
        description: 'How neighbourhood groups organised recovery support.',
      },
    ])

    expect(errors).toEqual([])
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({
      row: 2,
      title: 'Mutual aid networks after the storm',
      author: 'Amara Osei',
      authorEmail: 'amara@example.org',
      date: '2026-05-14',
      url: 'https://example.org/articles/mutual-aid',
      pulseType: 'StoryPulse',
      description: 'How neighbourhood groups organised recovery support.',
    })
  })

  it('defaults the pulse type to ResourcePulse when the column is blank', () => {
    const { rows, errors } = parseArticleRows([
      {
        title: 'T',
        author: 'A',
        date: '2026-01-01',
        url: 'https://example.org/a',
        pulse_type: '',
      },
    ])
    expect(errors).toEqual([])
    expect(rows[0].pulseType).toBe('ResourcePulse')
  })

  it('reads the description through its aliases', () => {
    const { rows } = parseArticleRows([
      {
        title: 'T',
        author: 'A',
        date: '2026-01-01',
        url: 'https://example.org/a',
        summary: 'From the summary column.',
      },
    ])
    expect(rows[0].description).toBe('From the summary column.')
  })

  it('leaves description undefined when no description column has content', () => {
    const { rows } = parseArticleRows([
      {
        title: 'T',
        author: 'A',
        date: '2026-01-01',
        url: 'https://example.org/a',
        description: '   ',
      },
    ])
    expect(rows[0].description).toBeUndefined()
  })

  it('skips fully empty rows silently while keeping row numbers aligned', () => {
    const { rows, errors } = parseArticleRows([
      { title: '', author: '  ', date: '', url: '' },
      {
        title: 'T',
        author: 'A',
        date: '2026-01-01',
        url: 'https://example.org/a',
      },
      { title: 'Broken', author: '', date: '', url: '' },
    ])

    expect(rows).toHaveLength(1)
    expect(rows[0].row).toBe(3)
    expect(errors).toHaveLength(1)
    expect(errors[0].row).toBe(4)
  })

  it('aggregates every problem on a row into one message', () => {
    const { rows, errors } = parseArticleRows([
      {
        author: 'A',
        date: '2026-01-01',
        url: 'not a url',
        author_email: 'not-an-email',
      },
    ])

    expect(rows).toEqual([])
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toContain('Article title is required.')
    expect(errors[0].message).toContain('"not a url" is not a valid http(s) URL.')
    expect(errors[0].message).toContain(
      '"not-an-email" is not a valid author email.'
    )
  })

  it('distinguishes a missing URL from an invalid one', () => {
    const { errors } = parseArticleRows([
      { title: 'T', author: 'A', date: '2026-01-01', url: '' },
      { title: 'T2', author: 'A2', date: '2026-01-01', url: 'nope!!' },
    ])
    expect(errors).toHaveLength(2)
    expect(errors[0].message).toContain('URL is required.')
    expect(errors[1].message).toContain('"nope!!" is not a valid http(s) URL.')
  })

  it('rejects malformed author emails but accepts well-shaped ones', () => {
    const { rows, errors } = parseArticleRows([
      {
        title: 'T',
        author: 'A',
        date: '2026-01-01',
        url: 'https://example.org/a',
        author_email: 'jane@newsroom',
      },
      {
        title: 'T2',
        author: 'A2',
        date: '2026-01-01',
        url: 'https://example.org/b',
        email: 'Jane@Newsroom.org',
      },
    ])
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toContain(
      '"jane@newsroom" is not a valid author email.'
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].authorEmail).toBe('jane@newsroom.org')
  })

  it('fails rows with unsupported pulse types instead of mistyping them', () => {
    const { rows, errors } = parseArticleRows([
      {
        title: 'T',
        author: 'A',
        date: '2026-01-01',
        url: 'https://example.org/a',
        pulse_type: 'meeting',
      },
    ])
    expect(rows).toEqual([])
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toContain('"meeting" is not a supported pulse type')
  })

  it('echoes only trimmed, non-empty cells back in error data', () => {
    const { errors } = parseArticleRows([
      {
        title: '  Broken row  ',
        author: '',
        date: '',
        url: '',
        description: '   ',
      },
    ])
    expect(errors).toHaveLength(1)
    expect(errors[0].data).toEqual({ title: 'Broken row' })
  })
})

describe('buildArticleRowContent', () => {
  it('prefers the member-supplied description, trimmed', () => {
    const row = makeRowInput({ description: '  A hand-written summary.  ' })
    expect(buildArticleRowContent(row)).toBe('A hand-written summary.')
  })

  it('falls back to a metadata sentence including the date', () => {
    const row = makeRowInput({ description: undefined })
    expect(buildArticleRowContent(row)).toBe(
      'Article by Amara Osei, published 2026-05-14: https://example.org/articles/mutual-aid'
    )
  })

  it('omits the date clause when no date is present', () => {
    const row = makeRowInput({ date: undefined, description: '   ' })
    expect(buildArticleRowContent(row)).toBe(
      'Article by Amara Osei: https://example.org/articles/mutual-aid'
    )
  })
})

describe('parseSpreadsheetArrayBuffer', () => {
  it('parses a CSV buffer and normalizes headers', () => {
    const csv = [
      'Article Title,Author Name,Pub Date,Web Link,Author Email,Pulse Type,Description',
      'Storm recovery,Amara Osei,2026-05-14,https://example.org/a,amara@example.org,resource,Neighbourhood recovery support',
    ].join('\n')

    const { rows, parseErrors } = parseSpreadsheetArrayBuffer(
      stringToArrayBuffer(csv)
    )

    expect(parseErrors).toEqual([])
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({
      article_title: 'Storm recovery',
      author_name: 'Amara Osei',
      pub_date: '2026-05-14',
      web_link: 'https://example.org/a',
      author_email: 'amara@example.org',
      pulse_type: 'resource',
      description: 'Neighbourhood recovery support',
    })
  })

  it('feeds parseArticleRows via alias headers end-to-end', () => {
    const csv = ['Headline,Byline,Published,Link', 'T,A,2026-01-02,example.org/x'].join(
      '\n'
    )
    const parsed = parseSpreadsheetArrayBuffer(stringToArrayBuffer(csv))
    expect(parsed.parseErrors).toEqual([])
    expect(validateArticleTemplateHeaders(parsed.rows)).toEqual([])

    const { rows, errors } = parseArticleRows(parsed.rows)
    expect(errors).toEqual([])
    expect(rows[0]).toMatchObject({
      row: 2,
      title: 'T',
      author: 'A',
      date: '2026-01-02',
      url: 'https://example.org/x',
      pulseType: 'ResourcePulse',
    })
  })

  it('parses an XLSX workbook with the same normalized row shape', () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Title', 'Author', 'Date', 'URL'],
      ['Sheet story', 'Kofi Mensah', '2026-02-03', 'https://example.org/b'],
    ])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Articles')
    const buffer = XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx',
    }) as ArrayBuffer

    const { rows, parseErrors } = parseSpreadsheetArrayBuffer(buffer)
    expect(parseErrors).toEqual([])
    expect(rows).toEqual([
      {
        title: 'Sheet story',
        author: 'Kofi Mensah',
        date: '2026-02-03',
        url: 'https://example.org/b',
      },
    ])
  })
})
