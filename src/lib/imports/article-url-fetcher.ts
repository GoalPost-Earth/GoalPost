import { promises as dns } from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import { isIP } from 'node:net'
import zlib from 'node:zlib'

/**
 * GOAL-344 — server-side fetch of a member-supplied article URL for the bulk
 * article import.
 *
 * This is a server making outbound requests to addresses a member typed into a
 * spreadsheet, so it is hardened against SSRF before anything else:
 *
 *   - http(s) only; no userinfo credentials in the URL.
 *   - Every connection goes through a validating DNS lookup (`lookup` option on
 *     the request agent), so the address actually connected to is the one that
 *     was checked — a plain "resolve, check, then fetch by name" leaves a
 *     rebinding window between the check and the connect.
 *   - Loopback, private, link-local (cloud metadata), CGNAT, multicast,
 *     reserved and the IPv6 equivalents (incl. v4-mapped / NAT64 forms) are
 *     refused. A name that resolves to ANY blocked address is refused.
 *   - Redirects are followed manually, capped, and every hop is re-validated.
 *   - Hard per-hop timeout and an overall deadline; the body is read with a
 *     byte cap and aborted on overflow rather than buffered first.
 *   - Only text/html, text/plain and application/pdf (sniffed by magic bytes)
 *     are accepted. Anything else is reported, never handed to an extractor.
 *   - No GoalPost credential ever leaves the process: the only cookies sent are
 *     the ones the remote chain itself set during this fetch (kept in a jar
 *     that lives for exactly one call — OneDrive's download redirect needs
 *     the session cookie its first hop hands out).
 *
 * The result is a buffer + a coarse kind; turning HTML into readable text is
 * `article-html-text.ts`'s job, and everything after that is the ordinary
 * document ingest pipeline.
 */

/**
 * Per-hop idle timeout. A host that trickles a byte every few seconds keeps
 * the idle timer from firing, which is what the whole-chain deadline is for.
 */
export const ARTICLE_FETCH_HOP_TIMEOUT_MS = 10_000
/**
 * Whole-chain deadline, redirects included. A page that has not finished in
 * this long is not an article, and every row of a 300-row sheet pays it in
 * the worst case, so it is deliberately short.
 */
export const ARTICLE_FETCH_TOTAL_TIMEOUT_MS = 20_000
/** Byte ceiling for a PDF (compressed and decompressed alike). */
export const MAX_ARTICLE_FETCH_BYTES = 15 * 1024 * 1024
/**
 * Tighter ceiling for HTML / plain text: the reducer holds the whole page as
 * a string and a real article page is well under this, so anything larger is
 * refused rather than decoded and scanned.
 */
export const MAX_ARTICLE_PAGE_BYTES = 2 * 1024 * 1024
export const MAX_ARTICLE_REDIRECTS = 6
export const ARTICLE_FETCH_USER_AGENT =
  'GoalPostArticleImport/1.0 (+https://goalpost.earth)'

export type ArticleSourceKind = 'html' | 'text' | 'pdf'

export type ArticleFetchFailureReason =
  | 'invalid_url'
  | 'blocked_address'
  | 'unreachable'
  | 'timeout'
  | 'too_large'
  | 'too_many_redirects'
  | 'login_required'
  | 'http_error'
  | 'unsupported_content'

export interface ArticleFetchSuccess {
  ok: true
  kind: ArticleSourceKind
  buffer: Buffer
  /** Bare lower-case mime the response declared (or the sniffed one). */
  contentType: string
  /** Charset from the Content-Type, when the server declared one. */
  charset: string | null
  /** Where the chain ended, after redirects. */
  finalUrl: string
}

export interface ArticleFetchFailure {
  ok: false
  reason: ArticleFetchFailureReason
  /** Member-safe copy (kb/07 Rule 1) — never the raw error text. */
  message: string
}

export type ArticleFetchResult = ArticleFetchSuccess | ArticleFetchFailure

export interface FetchArticleSourceOptions {
  /**
   * TEST-ONLY. Lets a jest suite point the fetcher at a server on 127.0.0.1.
   * Production callers must never set this — it disables the address policy
   * that is the whole point of this module.
   */
  unsafeAllowPrivateAddressesForTests?: boolean
}

/** Member-safe copy per failure reason. */
const FAILURE_MESSAGES: Record<ArticleFetchFailureReason, string> = {
  invalid_url: 'The link is not a usable web address.',
  blocked_address:
    'The link points somewhere this service is not allowed to reach.',
  unreachable: 'The site could not be reached.',
  timeout: 'The site took too long to respond.',
  too_large: 'The page or file is too large to read.',
  too_many_redirects: 'The link redirected too many times.',
  login_required:
    'The site asked for a login or refused the request, so the article could not be read.',
  http_error: 'The site did not return the article.',
  unsupported_content:
    'The link did not lead to an article page, plain text, or a PDF.',
}

function failure(reason: ArticleFetchFailureReason): ArticleFetchFailure {
  return { ok: false, reason, message: FAILURE_MESSAGES[reason] }
}

// ---------------------------------------------------------------------------
// Address policy
// ---------------------------------------------------------------------------

function parseIpv4(address: string): number[] | null {
  const parts = address.split('.')
  if (parts.length !== 4) return null
  const octets = parts.map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN))
  return octets.every((o) => Number.isInteger(o) && o >= 0 && o <= 255)
    ? octets
    : null
}

/**
 * True when an IPv4 address is one a server-side fetch must never connect to.
 * Covers RFC1918, loopback, link-local (incl. the 169.254.169.254 metadata
 * endpoint), CGNAT, the documentation/benchmark nets, multicast and reserved.
 */
export function isBlockedIpv4(address: string): boolean {
  const o = parseIpv4(address)
  if (!o) return true
  const [a, b] = o
  if (a === 0) return true // 0.0.0.0/8 — "this" network
  if (a === 10) return true // 10/8
  if (a === 127) return true // loopback
  if (a === 169 && b === 254) return true // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16/12
  if (a === 192 && b === 168) return true // 192.168/16
  if (a === 100 && b >= 64 && b <= 127) return true // 100.64/10 CGNAT
  if (a === 192 && b === 0 && o[2] === 0) return true // 192.0.0.0/24
  if (a === 192 && b === 0 && o[2] === 2) return true // TEST-NET-1
  if (a === 198 && (b === 18 || b === 19)) return true // benchmark
  if (a === 198 && b === 51 && o[2] === 100) return true // TEST-NET-2
  if (a === 203 && b === 0 && o[2] === 113) return true // TEST-NET-3
  if (a >= 224) return true // multicast + reserved + broadcast
  return false
}

/** Expand an IPv6 address to its eight 16-bit groups; null when unparseable. */
function parseIpv6(address: string): number[] | null {
  let text = address.trim()
  if (text.startsWith('[') && text.endsWith(']')) text = text.slice(1, -1)
  const zone = text.indexOf('%')
  if (zone !== -1) text = text.slice(0, zone)
  // Embedded IPv4 tail (::ffff:1.2.3.4) → two hex groups.
  const lastColon = text.lastIndexOf(':')
  const tail = text.slice(lastColon + 1)
  if (tail.includes('.')) {
    const v4 = parseIpv4(tail)
    if (!v4) return null
    const hi = ((v4[0] << 8) | v4[1]).toString(16)
    const lo = ((v4[2] << 8) | v4[3]).toString(16)
    text = `${text.slice(0, lastColon + 1)}${hi}:${lo}`
  }
  const halves = text.split('::')
  if (halves.length > 2) return null
  const toGroups = (s: string): number[] | null => {
    if (!s) return []
    const groups = s.split(':')
    const parsed = groups.map((g) =>
      /^[0-9a-f]{1,4}$/i.test(g) ? parseInt(g, 16) : NaN
    )
    return parsed.some((g) => Number.isNaN(g)) ? null : parsed
  }
  const head = toGroups(halves[0])
  const rest = halves.length === 2 ? toGroups(halves[1]) : []
  if (!head || !rest) return null
  if (halves.length === 1) return head.length === 8 ? head : null
  const missing = 8 - head.length - rest.length
  if (missing < 0) return null
  return [...head, ...new Array(missing).fill(0), ...rest]
}

/**
 * True when an IPv6 address is one a server-side fetch must never connect to:
 * unspecified, loopback, unique-local, link-local, multicast, documentation,
 * and any form that embeds a blocked IPv4 (v4-mapped, v4-compatible, NAT64).
 */
export function isBlockedIpv6(address: string): boolean {
  const g = parseIpv6(address)
  if (!g) return true
  const embeddedV4 = `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`
  const isZeroPrefix = (upto: number) => g.slice(0, upto).every((x) => x === 0)
  if (isZeroPrefix(8)) return true // ::
  if (isZeroPrefix(7) && g[7] === 1) return true // ::1
  if (isZeroPrefix(5) && g[5] === 0xffff) return isBlockedIpv4(embeddedV4) // ::ffff:a.b.c.d
  if (isZeroPrefix(6)) return true // ::a.b.c.d (deprecated v4-compatible) — refuse outright
  if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)) {
    return isBlockedIpv4(embeddedV4) // 64:ff9b::/96 NAT64
  }
  if ((g[0] & 0xfe00) === 0xfc00) return true // fc00::/7 unique-local
  if ((g[0] & 0xffc0) === 0xfe80) return true // fe80::/10 link-local
  if ((g[0] & 0xff00) === 0xff00) return true // ff00::/8 multicast
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true // 2001:db8::/32 documentation
  if (g[0] === 0x2001 && g[1] === 0x0000) return true // 2001::/32 Teredo (tunnels a v4 host)
  if (g[0] === 0x2002) {
    // 2002::/16 6to4 — the IPv4 address sits in groups 1-2.
    const v4 = `${g[1] >> 8}.${g[1] & 0xff}.${g[2] >> 8}.${g[2] & 0xff}`
    return isBlockedIpv4(v4)
  }
  return false
}

/** Address policy for any resolved or literal IP. Unknown shapes are blocked. */
export function isBlockedAddress(address: string): boolean {
  const version = isIP(address)
  if (version === 4) return isBlockedIpv4(address)
  if (version === 6) return isBlockedIpv6(address)
  return true
}

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain'])

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  if (BLOCKED_HOSTNAMES.has(host)) return true
  return (
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.home.arpa')
  )
}

/**
 * Parse and policy-check a URL string. Returns the URL or the failure to
 * report. Hostname checks here are the cheap pre-filter; the connect-time
 * lookup below is the real gate.
 */
export function validateArticleFetchUrl(
  raw: string,
  options: FetchArticleSourceOptions = {}
): { ok: true; url: URL } | ArticleFetchFailure {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return failure('invalid_url')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return failure('invalid_url')
  }
  if (url.username || url.password) return failure('invalid_url')
  if (!url.hostname) return failure('invalid_url')
  // The hostname blocklist applies even under the test override — it is what
  // lets a test prove a redirect hop is re-validated without a second server.
  if (isBlockedHostname(url.hostname)) return failure('blocked_address')
  if (options.unsafeAllowPrivateAddressesForTests) return { ok: true, url }
  const literal = url.hostname.startsWith('[')
    ? url.hostname.slice(1, -1)
    : url.hostname
  if (isIP(literal) && isBlockedAddress(literal)) return failure('blocked_address')
  return { ok: true, url }
}

class BlockedAddressError extends Error {
  constructor() {
    super('Resolved to a blocked address')
    this.name = 'BlockedAddressError'
  }
}

/**
 * `lookup` for the request agent: resolve, then refuse the connection if ANY
 * returned address is blocked. Validating at connect time (not before the
 * request) is what closes the DNS-rebinding window.
 */
function buildValidatingLookup(
  options: FetchArticleSourceOptions
): http.RequestOptions['lookup'] {
  return (hostname, lookupOptions, callback) => {
    void dns
      .lookup(hostname, { ...lookupOptions, all: true })
      .then((entries) => {
        const list = Array.isArray(entries) ? entries : [entries]
        if (list.length === 0) {
          callback(new Error(`No address for ${hostname}`), [])
          return
        }
        if (
          !options.unsafeAllowPrivateAddressesForTests &&
          list.some((entry) => isBlockedAddress(entry.address))
        ) {
          callback(new BlockedAddressError(), [])
          return
        }
        if (lookupOptions.all) {
          callback(null, list)
        } else {
          callback(null, list[0].address, list[0].family)
        }
      })
      .catch((err: Error) => callback(err, []))
  }
}

// ---------------------------------------------------------------------------
// Known share hosts
// ---------------------------------------------------------------------------

/**
 * OneDrive share links (`1drv.ms`, `onedrive.live.com/:b:/...`) serve an HTML
 * viewer shell. Asking the same URL with `download=1` — and echoing back the
 * session cookie the first hop sets — makes the chain end in the file itself
 * (verified against the client's own links, 2026-09-02). Other hosts are left
 * alone; a generic shortener is simply followed.
 */
export function rewriteKnownShareUrl(url: URL): URL {
  const host = url.hostname.toLowerCase()
  if (host === '1drv.ms' || host === 'onedrive.live.com') {
    if (!url.searchParams.has('download')) {
      const next = new URL(url.toString())
      next.searchParams.set('download', '1')
      return next
    }
  }
  return url
}

// ---------------------------------------------------------------------------
// Cookie jar — one per fetch chain, only what the chain itself set
// ---------------------------------------------------------------------------

interface JarCookie {
  name: string
  value: string
  domain: string
  /** No `Domain` attribute: only the exact setting host gets it back. */
  hostOnly: boolean
  secure: boolean
}

class ChainCookieJar {
  private readonly cookies: JarCookie[] = []

  absorb(setCookieHeaders: string[] | undefined, from: URL): void {
    for (const header of setCookieHeaders ?? []) {
      const [pair, ...attrs] = header.split(';')
      const eq = pair.indexOf('=')
      if (eq <= 0) continue
      const name = pair.slice(0, eq).trim()
      const value = pair.slice(eq + 1).trim()
      let domain = from.hostname.toLowerCase()
      let hostOnly = true
      let secure = false
      for (const attr of attrs) {
        const [k, v = ''] = attr.split('=')
        const key = k.trim().toLowerCase()
        if (key === 'domain' && v.trim()) {
          const candidate = v.trim().toLowerCase().replace(/^\./, '')
          // A cookie may only widen to the setting host or a parent domain of
          // it — a suffix match alone would let example.com claim ample.com —
          // and never to a bare top-level label like `com`.
          const host = from.hostname.toLowerCase()
          if (
            candidate.includes('.') &&
            (host === candidate || host.endsWith(`.${candidate}`))
          ) {
            domain = candidate
            hostOnly = false
          }
        } else if (key === 'secure') {
          secure = true
        }
      }
      const idx = this.cookies.findIndex(
        (c) => c.name === name && c.domain === domain
      )
      const cookie = { name, value, domain, hostOnly, secure }
      if (idx === -1) this.cookies.push(cookie)
      else this.cookies[idx] = cookie
    }
  }

  headerFor(target: URL): string | null {
    const host = target.hostname.toLowerCase()
    const https = target.protocol === 'https:'
    const applicable = this.cookies.filter(
      (c) =>
        (c.hostOnly
          ? host === c.domain
          : host === c.domain || host.endsWith(`.${c.domain}`)) &&
        (!c.secure || https)
    )
    if (applicable.length === 0) return null
    return applicable.map((c) => `${c.name}=${c.value}`).join('; ')
  }
}

// ---------------------------------------------------------------------------
// One hop
// ---------------------------------------------------------------------------

interface HopResult {
  statusCode: number
  headers: http.IncomingHttpHeaders
  body: Buffer
}

class TooLargeError extends Error {
  constructor() {
    super('Body exceeded the byte ceiling')
    this.name = 'TooLargeError'
  }
}

function requestHop(
  url: URL,
  jar: ChainCookieJar,
  options: FetchArticleSourceOptions,
  signal: AbortSignal
): Promise<HopResult> {
  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http
    const headers: Record<string, string> = {
      'User-Agent': ARTICLE_FETCH_USER_AGENT,
      Accept:
        'text/html,application/xhtml+xml,application/pdf,text/plain;q=0.9,*/*;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en',
    }
    const cookie = jar.headerFor(url)
    if (cookie) headers.Cookie = cookie

    const req = client.request(
      url,
      {
        method: 'GET',
        headers,
        lookup: buildValidatingLookup(options),
        timeout: ARTICLE_FETCH_HOP_TIMEOUT_MS,
        signal,
      },
      (res) => {
        const status = res.statusCode ?? 0
        // Belt and braces over the validating lookup: an IP-literal host
        // skips `lookup` entirely, and this is the address we actually
        // reached whatever resolved it.
        const remote = res.socket?.remoteAddress
        if (
          remote &&
          !options.unsafeAllowPrivateAddressesForTests &&
          isBlockedAddress(remote)
        ) {
          req.destroy(new BlockedAddressError())
          return
        }
        // A declared size over the ceiling is refused before a byte is read.
        const declared = Number(res.headers['content-length'] ?? 0)
        if (Number.isFinite(declared) && declared > MAX_ARTICLE_FETCH_BYTES) {
          req.destroy(new TooLargeError())
          return
        }
        jar.absorb(res.headers['set-cookie'], url)
        // Redirects carry no body worth reading; drain and move on.
        if (status >= 300 && status < 400) {
          res.resume()
          resolve({ statusCode: status, headers: res.headers, body: Buffer.alloc(0) })
          return
        }
        const chunks: Buffer[] = []
        let total = 0
        res.on('data', (chunk: Buffer) => {
          total += chunk.length
          if (total > MAX_ARTICLE_FETCH_BYTES) {
            req.destroy(new TooLargeError())
            return
          }
          chunks.push(chunk)
        })
        res.on('end', () => {
          resolve({
            statusCode: status,
            headers: res.headers,
            body: Buffer.concat(chunks),
          })
        })
        res.on('error', reject)
      }
    )
    req.on('timeout', () => req.destroy(new Error('ETIMEDOUT')))
    req.on('error', reject)
    req.end()
  })
}

function decompressBody(body: Buffer, encoding: string | undefined): Buffer {
  const enc = (encoding ?? '').trim().toLowerCase()
  const opts = { maxOutputLength: MAX_ARTICLE_FETCH_BYTES }
  if (!enc || enc === 'identity') return body
  if (enc === 'gzip' || enc === 'x-gzip') return zlib.gunzipSync(body, opts)
  if (enc === 'deflate') {
    try {
      return zlib.inflateSync(body, opts)
    } catch {
      return zlib.inflateRawSync(body, opts)
    }
  }
  if (enc === 'br') return zlib.brotliDecompressSync(body, opts)
  throw new Error(`Unsupported content-encoding: ${enc}`)
}

function parseContentType(header: string | undefined): {
  mime: string
  charset: string | null
} {
  const raw = (header ?? '').trim()
  const [mimePart, ...params] = raw.split(';')
  const mime = mimePart.trim().toLowerCase()
  let charset: string | null = null
  for (const p of params) {
    const [k, v = ''] = p.split('=')
    if (k.trim().toLowerCase() === 'charset') {
      charset = v.trim().replace(/^"|"$/g, '').toLowerCase() || null
    }
  }
  return { mime, charset }
}

function looksLikePdf(buffer: Buffer): boolean {
  // Some servers prepend whitespace/BOM before the header; sniff a short window.
  return buffer.subarray(0, 1024).toString('latin1').includes('%PDF-')
}

function looksLikeHtml(buffer: Buffer): boolean {
  const head = buffer.subarray(0, 2048).toString('latin1')
  return /<!doctype\s+html|<html[\s>]|<head[\s>]|<body[\s>]/i.test(head)
}

function classify(
  buffer: Buffer,
  contentType: string | undefined
): { kind: ArticleSourceKind; mime: string; charset: string | null } | null {
  const { mime, charset } = parseContentType(contentType)
  if (mime === 'application/pdf' || looksLikePdf(buffer)) {
    return looksLikePdf(buffer)
      ? { kind: 'pdf', mime: 'application/pdf', charset: null }
      : null
  }
  if (mime === 'text/html' || mime === 'application/xhtml+xml') {
    return { kind: 'html', mime: 'text/html', charset }
  }
  if (mime === 'text/plain') return { kind: 'text', mime, charset }
  // Unlabelled or mislabelled (e.g. application/octet-stream) — sniff HTML.
  if ((!mime || mime === 'application/octet-stream') && looksLikeHtml(buffer)) {
    return { kind: 'html', mime: 'text/html', charset }
  }
  return null
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Fetch a member-supplied article URL under the policy described in the
 * module header. Never throws — every failure is a member-safe result.
 */
export async function fetchArticleSource(
  rawUrl: string,
  options: FetchArticleSourceOptions = {}
): Promise<ArticleFetchResult> {
  const validated = validateArticleFetchUrl(rawUrl, options)
  if (!validated.ok) return validated

  const jar = new ChainCookieJar()
  const controller = new AbortController()
  const deadline = setTimeout(
    () => controller.abort(),
    ARTICLE_FETCH_TOTAL_TIMEOUT_MS
  )

  try {
    let current = rewriteKnownShareUrl(validated.url)
    for (let hop = 0; hop <= MAX_ARTICLE_REDIRECTS; hop += 1) {
      let result: HopResult
      try {
        result = await requestHop(current, jar, options, controller.signal)
      } catch (err) {
        if (err instanceof BlockedAddressError) return failure('blocked_address')
        if (err instanceof TooLargeError) return failure('too_large')
        if (controller.signal.aborted) return failure('timeout')
        const code = (err as NodeJS.ErrnoException | undefined)?.code
        const message = err instanceof Error ? err.message : ''
        if (code === 'ETIMEDOUT' || message === 'ETIMEDOUT') {
          return failure('timeout')
        }
        return failure('unreachable')
      }

      const { statusCode, headers } = result
      if (statusCode >= 300 && statusCode < 400) {
        const location = headers.location
        if (!location) return failure('http_error')
        let next: URL
        try {
          next = new URL(location, current)
        } catch {
          return failure('invalid_url')
        }
        const check = validateArticleFetchUrl(next.toString(), options)
        if (!check.ok) return check
        current = rewriteKnownShareUrl(check.url)
        continue
      }

      if (statusCode === 401 || statusCode === 403 || statusCode === 407) {
        return failure('login_required')
      }
      if (statusCode < 200 || statusCode >= 300) return failure('http_error')

      let body: Buffer
      try {
        body = decompressBody(result.body, headers['content-encoding'])
      } catch (err) {
        const code = (err as NodeJS.ErrnoException | undefined)?.code
        return failure(code === 'ERR_BUFFER_TOO_LARGE' ? 'too_large' : 'unsupported_content')
      }
      if (body.length > MAX_ARTICLE_FETCH_BYTES) return failure('too_large')

      const classified = classify(body, headers['content-type'])
      if (!classified) return failure('unsupported_content')
      if (classified.kind !== 'pdf' && body.length > MAX_ARTICLE_PAGE_BYTES) {
        return failure('too_large')
      }
      return {
        ok: true,
        kind: classified.kind,
        buffer: body,
        contentType: classified.mime,
        charset: classified.charset,
        finalUrl: current.toString(),
      }
    }
    return failure('too_many_redirects')
  } finally {
    clearTimeout(deadline)
  }
}
