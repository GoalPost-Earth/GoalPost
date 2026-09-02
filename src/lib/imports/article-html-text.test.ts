import { MAX_TEXT_CHARS } from '@/lib/ingest/document-text-extractor'
import {
  decodeHtmlEntities,
  extractArticleText,
  isReadableArticleText,
  MIN_READABLE_ARTICLE_CHARS,
} from './article-html-text'

/**
 * GOAL-344 — the HTML → article-text heuristic the bulk import feeds to the
 * document ingest extractor.
 */

const paragraph = (n: number) =>
  `<p>Paragraph ${n}: neighbourhood mutual aid groups organised recovery support after the storm, sharing tools and time.</p>`

describe('extractArticleText', () => {
  it('prefers the <article> body over page chrome', () => {
    const html = `<!doctype html><html><head><title>Seeing People as Living Systems</title></head>
      <body>
        <nav><a href="/">Home</a><a href="/jobs">Jobs</a></nav>
        <header><h1>Site header</h1></header>
        <article>${paragraph(1)}${paragraph(2)}</article>
        <aside>Related: ten things you missed</aside>
        <footer>© Example Corp · Privacy · Terms</footer>
      </body></html>`

    const result = extractArticleText(html)

    expect(result.title).toBe('Seeing People as Living Systems')
    expect(result.text).toContain('Paragraph 1')
    expect(result.text).toContain('Paragraph 2')
    expect(result.text).not.toContain('Jobs')
    expect(result.text).not.toContain('Site header')
    expect(result.text).not.toContain('ten things you missed')
    expect(result.text).not.toContain('Privacy')
  })

  it('falls back to <main>, then <body>, when there is no <article>', () => {
    const withMain = extractArticleText(
      `<html><body><nav>menu</nav><main>${paragraph(1)}</main><footer>foot</footer></body></html>`
    )
    expect(withMain.text).toContain('Paragraph 1')
    expect(withMain.text).not.toContain('menu')

    const bodyOnly = extractArticleText(
      `<html><body><div>${paragraph(2)}</div></body></html>`
    )
    expect(bodyOnly.text).toContain('Paragraph 2')
  })

  it('drops scripts, styles and comments wherever they appear', () => {
    const html = `<html><body><article>
      <script>window.dataLayer = ['tracking']</script>
      <style>.hidden { display: none }</style>
      <!-- editorial note -->
      ${paragraph(1)}
    </article></body></html>`

    const { text } = extractArticleText(html)
    expect(text).not.toContain('dataLayer')
    expect(text).not.toContain('display: none')
    expect(text).not.toContain('editorial note')
    expect(text).toContain('Paragraph 1')
  })

  it('flattens block structure to line breaks and decodes entities', () => {
    const html = `<html><body><article>
      <h2>Why &amp; how</h2>
      <p>First&nbsp;line&hellip;</p>
      <ul><li>one</li><li>two</li></ul>
      <p>Caf&eacute; &#8212; &#x2014;</p>
    </article></body></html>`

    const { text } = extractArticleText(html)
    expect(text).toContain('Why & how')
    expect(text).toContain('First line…')
    expect(text).toMatch(/- one\n- two/)
    expect(text).toContain('Café — —')
    // Never more than one blank line in a row.
    expect(text).not.toMatch(/\n{3,}/)
  })

  it('leads with the page metadata when the head carries it', () => {
    const html = `<html><head>
      <meta property="og:title" content="Bioregional Fractal Consciousness" />
      <meta name="author" content="Bill Baue" />
      <meta property="article:published_time" content="2025-06-11" />
      <meta name="description" content="Working synchronously at bioregional scales." />
      <title>Blog | Site</title>
    </head><body><article>${paragraph(1)}</article></body></html>`

    const result = extractArticleText(html)
    expect(result.title).toBe('Bioregional Fractal Consciousness')
    expect(result.text.startsWith('Title: Bioregional Fractal Consciousness\n')).toBe(true)
    expect(result.text).toContain('Author: Bill Baue')
    expect(result.text).toContain('Published: 2025-06-11')
    expect(result.text).toContain('Summary: Working synchronously at bioregional scales.')
  })

  it('caps the output at the ingest text ceiling with a marker', () => {
    const long = `<html><body><article><p>${'word '.repeat(MAX_TEXT_CHARS)}</p></article></body></html>`
    const result = extractArticleText(long)
    expect(result.truncated).toBe(true)
    expect(result.text.length).toBeLessThanOrEqual(MAX_TEXT_CHARS)
    expect(result.text.endsWith('[Article truncated]')).toBe(true)
  })
})

describe('extractArticleText on hostile input', () => {
  // The bytes come from a host a member pointed us at. A page built to make a
  // naive regex backtrack must cost milliseconds, not the worker's budget
  // (the pre-fix reducer took 155s on 256 KB of '<').
  const budgetMs = 1500

  it('handles a flood of unclosed angle brackets in linear time', () => {
    const flood = '<'.repeat(1024 * 1024)
    const started = Date.now()
    const result = extractArticleText(flood)
    expect(Date.now() - started).toBeLessThan(budgetMs)
    expect(result.text.length).toBeLessThanOrEqual(MAX_TEXT_CHARS)
  })

  it('handles thousands of unclosed script tags in linear time', () => {
    const flood = '<script>'.repeat(128 * 1024)
    const started = Date.now()
    extractArticleText(flood)
    expect(Date.now() - started).toBeLessThan(budgetMs)
  })

  it('handles thousands of unclosed article tags in linear time', () => {
    const flood = `${'<article>'.repeat(100_000)}${'x'.repeat(200)}`
    const started = Date.now()
    extractArticleText(flood)
    expect(Date.now() - started).toBeLessThan(budgetMs)
  })

  it.each([
    ['unclosed comment flood', '<!-- '.repeat(200_000)],
    ['meta tag that never closes', `<meta ${'property="og:title" '.repeat(50_000)}`],
    ['meta author tag that never closes', `<meta ${'name="author" '.repeat(70_000)}`],
    ['div role=main that never closes', `<div ${'role=main '.repeat(100_000)}`],
    ['many unclosed meta tags', '<meta property="og:title" content="x'.repeat(30_000)],
    ['meta tags stuffed with a bare attribute-name run', `<meta ${'a'.repeat(1020)} `.repeat(2000)],
    ['meta tags stuffed with punctuated name runs', `<meta ${'a:b.c-d_'.repeat(128)} `.repeat(2000)],
    ['div tags stuffed with a bare attribute-name run', `<div ${'a'.repeat(1020)} `.repeat(2000)],
    ['section tags stuffed with a bare attribute-name run', `<section ${'a'.repeat(1020)} `.repeat(2000)],
  ])('handles %s in linear time', (_label, flood) => {
    expect(flood.length).toBeGreaterThan(900_000)
    const started = Date.now()
    extractArticleText(flood)
    expect(Date.now() - started).toBeLessThan(budgetMs)
  })

  it('still reads metadata written with unusual attribute order or quoting', () => {
    const html = `<html><head>
      <meta content='Bioregional Fractal Consciousness' property=og:title>
      <meta content="Bill &amp; Co" name="AUTHOR" />
    </head><body><div role='main'><p>${'Body text here. '.repeat(20)}</p></div></body></html>`
    const result = extractArticleText(html)
    expect(result.title).toBe('Bioregional Fractal Consciousness')
    expect(result.text).toContain('Author: Bill & Co')
    expect(result.text).toContain('Body text here.')
  })

  it('still strips a same-name element nested inside another', () => {
    const html = `<html><body><article><p>${'Real content here. '.repeat(15)}</p><aside>outer<aside>inner</aside>tail</aside></article></body></html>`
    const { text } = extractArticleText(html)
    expect(text).toContain('Real content here.')
    expect(text).not.toContain('inner')
    expect(text).not.toContain('outer')
  })
})

describe('isReadableArticleText', () => {
  it('rejects a shell page whose only text is its metadata header', () => {
    const shell = `Title: Sign in\nAuthor: LinkedIn\n\nJoin now Sign in`
    expect(isReadableArticleText(shell)).toBe(false)
  })

  it('accepts a body at or above the readable threshold', () => {
    const body = 'x'.repeat(MIN_READABLE_ARTICLE_CHARS)
    expect(isReadableArticleText(`Title: T\n\n${body}`)).toBe(true)
  })
})

describe('decodeHtmlEntities', () => {
  it('leaves unknown named entities alone rather than eating them', () => {
    expect(decodeHtmlEntities('a &unknownthing; b')).toBe('a &unknownthing; b')
  })

  it('handles decimal and hex numeric references', () => {
    expect(decodeHtmlEntities('&#65;&#x42;')).toBe('AB')
  })
})
