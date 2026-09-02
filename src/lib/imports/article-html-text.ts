/**
 * GOAL-344 — turn a fetched article page into the plain text the document
 * ingest extractor reads.
 *
 * Deliberately a heuristic, not a DOM: the ingest pipeline's text route already
 * accepts plain text, and a real readability library would pull `jsdom` into a
 * serverless function for a gain the extraction model does not need. The
 * approach is the one every "reader mode" starts from — find the main content
 * container, drop the chrome, flatten block structure to line breaks — and it
 * is enough for blog posts, LinkedIn Pulse articles, and grant pages.
 *
 * Every pass here is linear in the input. The bytes come from a host a member
 * pointed us at, so a page built to make a naive regex backtrack (a flood of
 * `<`, thousands of unclosed `<script>` tags, a `<meta` tag that never closes)
 * must cost milliseconds, not the worker's whole function budget. Element
 * removal, comment removal and container selection are index scans
 * (`indexOf`); start-tag attributes are read by a hand-rolled forward-only
 * scanner over a window capped at `MAX_START_TAG_CHARS`, parsed once per call;
 * and the only regexes left contain one bounded quantifier each, so none of
 * them can re-scan the input.
 *
 * The output is capped at the ingest text route's own character ceiling so an
 * article never fails extraction for being long; the tail is dropped with a
 * marker, which the extractor treats as ordinary text.
 */

import { MAX_TEXT_CHARS } from '@/lib/ingest/document-text-extractor'

/** Below this many characters the page is a shell (login wall, JS app, error). */
export const MIN_READABLE_ARTICLE_CHARS = 200

export interface ArticleTextResult {
  /** Readable body text, block structure flattened to newlines. */
  text: string
  /** Page title from <title> / og:title, when present. */
  title: string | null
  /** True when the body was cut at MAX_TEXT_CHARS. */
  truncated: boolean
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  copy: '©',
  reg: '®',
  trade: '™',
  middot: '·',
  bull: '•',
  laquo: '«',
  raquo: '»',
  eacute: 'é',
  egrave: 'è',
  agrave: 'à',
  ccedil: 'ç',
  uuml: 'ü',
  ouml: 'ö',
  auml: 'ä',
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const code = parseInt(hex, 16)
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : ''
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const code = parseInt(dec, 10)
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : ''
    })
    .replace(/&([a-z]+);/gi, (match, name: string) => {
      const decoded = NAMED_ENTITIES[name.toLowerCase()]
      return decoded ?? match
    })
}

/** True when the character after `<tag` ends the tag name (so `<a` ≠ `<article`). */
function isTagBoundary(char: string): boolean {
  return char === '' || char === '>' || char === '/' || /\s/.test(char)
}

/**
 * Find every `<tag …>…</tag>` element by index scanning: `{ start, innerStart,
 * innerEnd, end }` offsets into `html`. An unclosed element runs to the end of
 * the input. Non-recursive by design — a nested same-name element ends at the
 * first close tag — which is why callers strip chrome in a bounded number of
 * passes rather than one exact one.
 */
function scanElements(
  html: string,
  lower: string,
  tag: string
): Array<{ start: number; innerStart: number; innerEnd: number; end: number }> {
  const open = `<${tag}`
  const close = `</${tag}`
  const found: Array<{ start: number; innerStart: number; innerEnd: number; end: number }> = []
  let cursor = 0
  while (cursor < lower.length) {
    const start = lower.indexOf(open, cursor)
    if (start === -1) break
    if (!isTagBoundary(lower.charAt(start + open.length))) {
      cursor = start + open.length
      continue
    }
    const openEnd = lower.indexOf('>', start + open.length)
    const innerStart = openEnd === -1 ? lower.length : openEnd + 1
    const closeAt = lower.indexOf(close, innerStart)
    if (closeAt === -1) {
      found.push({ start, innerStart, innerEnd: lower.length, end: lower.length })
      break
    }
    const closeEnd = lower.indexOf('>', closeAt)
    const end = closeEnd === -1 ? lower.length : closeEnd + 1
    found.push({ start, innerStart, innerEnd: closeAt, end })
    cursor = end
  }
  return found
}

/** Remove every `<tag>…</tag>` element (contents included). Linear. */
function stripElementsOnce(html: string, tag: string): string {
  const lower = html.toLowerCase()
  const elements = scanElements(html, lower, tag)
  if (elements.length === 0) return html
  let out = ''
  let cursor = 0
  for (const el of elements) {
    out += `${html.slice(cursor, el.start)} `
    cursor = el.end
  }
  return out + html.slice(cursor)
}

/**
 * Strip an element type, re-running a bounded number of times so a same-name
 * element nested inside another (aside in aside) is removed too. Each pass is
 * linear, and the pass count is fixed, so the whole call stays linear.
 */
const MAX_STRIP_PASSES = 3
function stripElements(html: string, tag: string): string {
  let current = html
  for (let pass = 0; pass < MAX_STRIP_PASSES; pass += 1) {
    const next = stripElementsOnce(current, tag)
    if (next === current) break
    current = next
  }
  return current
}

/** Remove `<!-- … -->` comments by index scanning; an unclosed one runs to the end. */
function stripComments(html: string): string {
  let out = ''
  let cursor = 0
  for (;;) {
    const start = html.indexOf('<!--', cursor)
    if (start === -1) {
      out += html.slice(cursor)
      break
    }
    out += `${html.slice(cursor, start)} `
    const end = html.indexOf('-->', start + 4)
    if (end === -1) break
    cursor = end + 3
  }
  return out
}

/**
 * No real `<meta>` / `<div>` start tag is longer than this; a "tag" that runs
 * on further is a page built to make attribute parsing expensive, and gets
 * cut here.
 */
const MAX_START_TAG_CHARS = 1024

interface StartTag {
  /** Offset of the `<`. */
  start: number
  /** Offset just past the closing `>` (or where the window was cut). */
  end: number
  /** The tag text, `<tag` through `>` inclusive when present. */
  text: string
}

/** Every `<tag …>` start tag, each window cut at the next `>`/`<` or the cap. */
function scanStartTags(html: string, lower: string, tag: string): StartTag[] {
  const open = `<${tag}`
  const tags: StartTag[] = []
  let cursor = 0
  while (cursor < lower.length) {
    const start = lower.indexOf(open, cursor)
    if (start === -1) break
    const afterName = start + open.length
    if (!isTagBoundary(lower.charAt(afterName))) {
      cursor = afterName
      continue
    }
    const limit = Math.min(lower.length, afterName + MAX_START_TAG_CHARS)
    let stop = afterName
    while (stop < limit && lower[stop] !== '>' && lower[stop] !== '<') stop += 1
    const closed = lower[stop] === '>'
    const end = closed ? stop + 1 : stop
    tags.push({ start, end, text: html.slice(start, end) })
    cursor = Math.max(end, afterName)
  }
  return tags
}

const isSpace = (c: string): boolean =>
  c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\f'
const isNameStart = (c: string): boolean =>
  (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === ':'
const isNameChar = (c: string): boolean =>
  isNameStart(c) || (c >= '0' && c <= '9') || c === '-' || c === '.'

/**
 * Attributes of one start tag, lower-cased names, entity-decoded values.
 * Hand-rolled and forward-only: every character is visited once, a name run
 * that is not followed by `=` is skipped whole (never re-entered one position
 * later, which is what made a regex tokenizer quadratic), and a quoted value
 * is found with a single `indexOf`.
 */
function parseAttributes(tagText: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const n = tagText.length
  let i = 0
  // Skip the tag name itself (`<meta`, `<div`).
  while (i < n && !isSpace(tagText[i]) && tagText[i] !== '>' && tagText[i] !== '/') i += 1
  while (i < n) {
    const c = tagText[i]
    if (c === '>') break
    if (!isNameStart(c)) {
      i += 1
      continue
    }
    let j = i + 1
    while (j < n && isNameChar(tagText[j])) j += 1
    const name = tagText.slice(i, j).toLowerCase()
    let k = j
    while (k < n && isSpace(tagText[k])) k += 1
    if (tagText[k] !== '=') {
      // A bare attribute (or junk): the whole run is consumed, not retried.
      i = j
      continue
    }
    k += 1
    while (k < n && isSpace(tagText[k])) k += 1
    let value = ''
    const quote = tagText[k]
    if (quote === '"' || quote === "'") {
      const close = tagText.indexOf(quote, k + 1)
      value = tagText.slice(k + 1, close === -1 ? n : close)
      k = close === -1 ? n : close + 1
    } else {
      let m = k
      while (m < n && !isSpace(tagText[m]) && !'"\'<>'.includes(tagText[m])) m += 1
      value = tagText.slice(k, m)
      k = m
    }
    if (!(name in attrs)) attrs[name] = decodeHtmlEntities(value)
    i = k
  }
  return attrs
}

/** Every `<meta>` start tag's attributes, parsed once per document. */
function scanMetaTags(html: string, lower: string): Array<Record<string, string>> {
  return scanStartTags(html, lower, 'meta').map((tag) => parseAttributes(tag.text))
}

/** `content` of the first `<meta>` whose `name` or `property` equals `key`. */
function metaContent(
  metas: Array<Record<string, string>>,
  key: string
): string | null {
  for (const attrs of metas) {
    if (attrs.name?.toLowerCase() === key || attrs.property?.toLowerCase() === key) {
      const value = (attrs.content ?? '').replace(/\s+/g, ' ').trim()
      if (value) return value
    }
  }
  return null
}

/** Elements that never carry article prose, wherever they appear. */
const NOISE_ELEMENTS = [
  'script',
  'style',
  'noscript',
  'template',
  'svg',
  'canvas',
  'iframe',
  'object',
  'embed',
  'video',
  'audio',
  'select',
  'textarea',
]

/** Page chrome dropped from inside the chosen content root. */
const CHROME_ELEMENTS = ['nav', 'header', 'footer', 'aside', 'form', 'button', 'dialog']

/** Inner HTML of the first `<tag>` element, or null. */
function innerOfFirst(html: string, lower: string, tag: string): string | null {
  const [first] = scanElements(html, lower, tag)
  return first ? html.slice(first.innerStart, first.innerEnd) : null
}

/**
 * Pick the container most likely to hold the article: the longest <article>,
 * else <main>, else the element marked role="main", else <body>, else the
 * whole document.
 */
function pickContentRoot(html: string): string {
  const lower = html.toLowerCase()
  const articles = scanElements(html, lower, 'article')
    .map((el) => html.slice(el.innerStart, el.innerEnd))
    .sort((a, b) => b.length - a.length)
  if (articles[0] && articles[0].replace(/<[^<>]*>/g, '').trim().length > 0) {
    return articles[0]
  }
  const main = innerOfFirst(html, lower, 'main')
  if (main) return main
  // `role="main"` on a div/section: take from its start tag to the end of the
  // body. Over-inclusive, but linear, and the chrome strip below tidies it.
  for (const tagName of ['div', 'section']) {
    for (const tag of scanStartTags(html, lower, tagName)) {
      if (parseAttributes(tag.text).role?.toLowerCase() === 'main') {
        const bodyClose = lower.indexOf('</body', tag.end)
        return html.slice(tag.end, bodyClose === -1 ? html.length : bodyClose)
      }
    }
  }
  const body = innerOfFirst(html, lower, 'body')
  return body ?? html
}

function extractTitle(
  html: string,
  lower: string,
  metas: Array<Record<string, string>>
): string | null {
  const og = metaContent(metas, 'og:title')
  if (og) return og
  const titleTag = innerOfFirst(html, lower, 'title')
  if (!titleTag) return null
  const decoded = decodeHtmlEntities(titleTag.replace(/<[^<>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
  return decoded || null
}

/** Flatten block-level structure into newlines, then strip every other tag. */
function flattenToText(fragment: string): string {
  let text = fragment
  for (const tag of CHROME_ELEMENTS) text = stripElements(text, tag)
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|blockquote|pre|tr|table|ul|ol|dl|dd|dt|figure|figcaption|h[1-6])\s*>/gi, '\n\n')
    .replace(/<li\b[^<>]*>/gi, '\n- ')
    .replace(/<h[1-6]\b[^<>]*>/gi, '\n\n')
    .replace(/<[^<>]*>/g, ' ')
  text = decodeHtmlEntities(text)
  return text
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Extract readable article text from an HTML document. Pure, synchronous, and
 * linear in the input.
 */
export function extractArticleText(html: string): ArticleTextResult {
  let cleaned = stripComments(html)
  for (const tag of NOISE_ELEMENTS) cleaned = stripElements(cleaned, tag)

  const lower = cleaned.toLowerCase()
  const metas = scanMetaTags(cleaned, lower)
  const title = extractTitle(cleaned, lower, metas)
  const author = metaContent(metas, 'author')
  const published =
    metaContent(metas, 'article:published_time') ??
    metaContent(metas, 'datepublished')
  const description = metaContent(metas, 'description')

  const body = flattenToText(pickContentRoot(cleaned))

  const headerLines = [
    title ? `Title: ${title}` : null,
    author ? `Author: ${author}` : null,
    published ? `Published: ${published}` : null,
    description ? `Summary: ${description}` : null,
  ].filter((line): line is string => Boolean(line))

  let text = headerLines.length > 0 ? `${headerLines.join('\n')}\n\n${body}` : body
  let truncated = false
  if (text.length > MAX_TEXT_CHARS) {
    const marker = '\n\n[Article truncated]'
    text = `${text.slice(0, MAX_TEXT_CHARS - marker.length).trimEnd()}${marker}`
    truncated = true
  }
  return { text, title, truncated }
}

/**
 * True when the extracted text is too thin to be an article — the usual
 * signature of a login wall, a JavaScript-only page, or an error page that
 * answered 200.
 */
export function isReadableArticleText(text: string): boolean {
  // Header lines alone (title/author) must not count as an article.
  const bodyOnly = text.replace(/^(Title|Author|Published|Summary): .*$/gm, '')
  return bodyOnly.replace(/\s+/g, ' ').trim().length >= MIN_READABLE_ARTICLE_CHARS
}
