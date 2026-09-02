import http from 'node:http'
import type { AddressInfo } from 'node:net'
import zlib from 'node:zlib'
import {
  fetchArticleSource,
  isBlockedAddress,
  isBlockedIpv4,
  isBlockedIpv6,
  MAX_ARTICLE_FETCH_BYTES,
  MAX_ARTICLE_REDIRECTS,
  rewriteKnownShareUrl,
  validateArticleFetchUrl,
} from './article-url-fetcher'

/**
 * GOAL-344 — the SSRF policy and the fetch chain behind the bulk article
 * import. The policy tests need no network. The chain tests run a throwaway
 * HTTP server on 127.0.0.1 and pass the TEST-ONLY private-address override;
 * the last test proves that without the override the same server is refused.
 */

describe('address policy', () => {
  it.each([
    ['127.0.0.1', 'loopback'],
    ['127.255.255.255', 'loopback range'],
    ['10.0.0.1', 'RFC1918 10/8'],
    ['172.16.0.1', 'RFC1918 172.16/12'],
    ['172.31.255.255', 'RFC1918 172.16/12 top'],
    ['192.168.1.1', 'RFC1918 192.168/16'],
    ['169.254.169.254', 'cloud metadata'],
    ['169.254.0.1', 'link-local'],
    ['100.64.0.1', 'CGNAT'],
    ['0.0.0.0', 'unspecified'],
    ['224.0.0.1', 'multicast'],
    ['255.255.255.255', 'broadcast'],
    ['192.0.2.1', 'TEST-NET-1'],
    ['198.18.0.1', 'benchmark'],
  ])('blocks IPv4 %s (%s)', (address) => {
    expect(isBlockedIpv4(address)).toBe(true)
  })

  it.each(['8.8.8.8', '1.1.1.1', '172.32.0.1', '172.15.0.1', '93.184.216.34'])(
    'allows public IPv4 %s',
    (address) => {
      expect(isBlockedIpv4(address)).toBe(false)
    }
  )

  it.each([
    ['::1', 'loopback'],
    ['::', 'unspecified'],
    ['fc00::1', 'unique-local'],
    ['fd12:3456::1', 'unique-local'],
    ['fe80::1', 'link-local'],
    ['ff02::1', 'multicast'],
    ['2001:db8::1', 'documentation'],
    ['::ffff:127.0.0.1', 'v4-mapped loopback'],
    ['::ffff:10.0.0.1', 'v4-mapped private'],
    ['::ffff:169.254.169.254', 'v4-mapped metadata'],
    ['64:ff9b::7f00:1', 'NAT64 loopback'],
    ['::10.0.0.1', 'v4-compatible'],
    ['2002:7f00:1::', '6to4 loopback'],
    ['2002:a9fe:a9fe::', '6to4 metadata'],
    ['2001:0:1::1', 'Teredo'],
  ])('blocks IPv6 %s (%s)', (address) => {
    expect(isBlockedIpv6(address)).toBe(true)
  })

  it.each(['2606:4700:4700::1111', '2001:4860:4860::8888', '::ffff:8.8.8.8'])(
    'allows public IPv6 %s',
    (address) => {
      expect(isBlockedIpv6(address)).toBe(false)
    }
  )

  it('blocks anything that is not an IP at all', () => {
    expect(isBlockedAddress('not-an-ip')).toBe(true)
    expect(isBlockedAddress('')).toBe(true)
  })
})

describe('validateArticleFetchUrl', () => {
  it.each([
    'ftp://example.org/file',
    'file:///etc/passwd',
    'javascript:alert(1)',
    'gopher://example.org',
    'not a url',
    'https://user:secret@example.org/',
  ])('rejects %s as an invalid url', (raw) => {
    expect(validateArticleFetchUrl(raw)).toMatchObject({
      ok: false,
      reason: 'invalid_url',
    })
  })

  it.each([
    'http://localhost/admin',
    'http://foo.localhost/',
    'http://printer.local/',
    'http://db.internal/',
    'http://127.0.0.1:3000/',
    'http://[::1]/',
    'http://169.254.169.254/latest/meta-data/',
    'http://10.1.2.3/',
    'http://[::ffff:10.1.2.3]/',
  ])('blocks %s by hostname or literal address', (raw) => {
    expect(validateArticleFetchUrl(raw)).toMatchObject({
      ok: false,
      reason: 'blocked_address',
    })
  })

  it('accepts an ordinary public https URL', () => {
    const result = validateArticleFetchUrl(
      'https://www.bioregionalearth.org/blog/fractal-consciousness'
    )
    expect(result.ok).toBe(true)
  })

  it('never returns raw error text in the member-safe message', () => {
    const result = validateArticleFetchUrl('http://169.254.169.254/')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).not.toMatch(/169\.254/)
    }
  })
})

describe('rewriteKnownShareUrl', () => {
  it('asks OneDrive share links for the file itself', () => {
    const short = rewriteKnownShareUrl(
      new URL('https://1drv.ms/b/c/abc/IQANryo56?e=iXCJOI')
    )
    expect(short.searchParams.get('download')).toBe('1')
    expect(short.searchParams.get('e')).toBe('iXCJOI')

    const long = rewriteKnownShareUrl(
      new URL('https://onedrive.live.com/:b:/g/personal/ABC/IQANryo56?resid=ABC!s1')
    )
    expect(long.searchParams.get('download')).toBe('1')
  })

  it('leaves every other host untouched', () => {
    const url = new URL('https://www.linkedin.com/pulse/some-article')
    expect(rewriteKnownShareUrl(url).toString()).toBe(url.toString())
  })

  it('does not duplicate an existing download parameter', () => {
    const url = new URL('https://1drv.ms/b/c/abc/xyz?download=1')
    expect(rewriteKnownShareUrl(url).toString()).toBe(url.toString())
  })
})

describe('fetchArticleSource against a local server', () => {
  type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => void
  let server: http.Server
  let baseUrl: string
  let handler: Handler

  beforeAll(async () => {
    server = http.createServer((req, res) => handler(req, res))
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  })

  const testOptions = { unsafeAllowPrivateAddressesForTests: true }
  const article = `<html><head><title>T</title></head><body><article><p>${'Mutual aid after the storm. '.repeat(20)}</p></article></body></html>`

  it('refuses the local server when the policy is on — the default', async () => {
    handler = (_req, res) => {
      res.writeHead(200, { 'content-type': 'text/html' })
      res.end(article)
    }
    const result = await fetchArticleSource(`${baseUrl}/article`)
    expect(result).toMatchObject({ ok: false, reason: 'blocked_address' })
  })

  it('returns an HTML page as html with its charset', async () => {
    handler = (req, res) => {
      expect(req.headers['user-agent']).toMatch(/GoalPostArticleImport/)
      expect(req.headers.cookie).toBeUndefined()
      expect(req.headers.authorization).toBeUndefined()
      res.writeHead(200, { 'content-type': 'text/html; charset=UTF-8' })
      res.end(article)
    }
    const result = await fetchArticleSource(`${baseUrl}/article`, testOptions)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.kind).toBe('html')
      expect(result.charset).toBe('utf-8')
      expect(result.buffer.toString('utf8')).toBe(article)
      expect(result.finalUrl).toBe(`${baseUrl}/article`)
    }
  })

  it('sniffs a PDF by its magic bytes even when mislabelled', async () => {
    handler = (_req, res) => {
      res.writeHead(200, { 'content-type': 'application/octet-stream' })
      res.end(Buffer.from('%PDF-1.7\n%âãÏÓ\n1 0 obj', 'latin1'))
    }
    const result = await fetchArticleSource(`${baseUrl}/file`, testOptions)
    expect(result).toMatchObject({ ok: true, kind: 'pdf', contentType: 'application/pdf' })
  })

  it('transparently decompresses a gzip body', async () => {
    handler = (_req, res) => {
      res.writeHead(200, {
        'content-type': 'text/html',
        'content-encoding': 'gzip',
      })
      res.end(zlib.gzipSync(Buffer.from(article)))
    }
    const result = await fetchArticleSource(`${baseUrl}/gz`, testOptions)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.buffer.toString('utf8')).toBe(article)
  })

  it('follows redirects, re-sending only the chain\'s own cookies, and reports the final url', async () => {
    const seen: string[] = []
    handler = (req, res) => {
      seen.push(`${req.url} cookie=${req.headers.cookie ?? ''}`)
      if (req.url === '/start') {
        res.writeHead(302, {
          location: '/next',
          'set-cookie': 'session=abc; Path=/; HttpOnly',
        })
        res.end()
        return
      }
      res.writeHead(200, { 'content-type': 'text/plain' })
      res.end('plain text body '.repeat(20))
    }
    const result = await fetchArticleSource(`${baseUrl}/start`, testOptions)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.kind).toBe('text')
      expect(result.finalUrl).toBe(`${baseUrl}/next`)
    }
    expect(seen).toEqual(['/start cookie=', '/next cookie=session=abc'])
  })

  it('stops after the redirect cap', async () => {
    handler = (req, res) => {
      const n = Number(new URL(req.url ?? '/', baseUrl).searchParams.get('n') ?? '0')
      res.writeHead(302, { location: `/loop?n=${n + 1}` })
      res.end()
    }
    const result = await fetchArticleSource(`${baseUrl}/loop?n=0`, testOptions)
    expect(result).toMatchObject({ ok: false, reason: 'too_many_redirects' })
    expect(MAX_ARTICLE_REDIRECTS).toBeGreaterThan(0)
  })

  it('re-validates every redirect hop, not just the first URL', async () => {
    // The override relaxes only the ADDRESS policy (so the 127.0.0.1 server
    // is reachable); the hostname blocklist still applies to every hop, so a
    // redirect into an internal name is refused after the first hop landed.
    const seen: string[] = []
    handler = (req, res) => {
      seen.push(req.url ?? '')
      res.writeHead(302, { location: 'http://metadata.internal/latest/meta-data/' })
      res.end()
    }
    const result = await fetchArticleSource(`${baseUrl}/bounce`, testOptions)
    expect(seen).toEqual(['/bounce'])
    expect(result).toMatchObject({ ok: false, reason: 'blocked_address' })
  })

  it.each([
    [401, 'login_required'],
    [403, 'login_required'],
    [404, 'http_error'],
    [500, 'http_error'],
  ])('maps status %s to %s', async (status, reason) => {
    handler = (_req, res) => {
      res.writeHead(status, { 'content-type': 'text/html' })
      res.end('<html><body>nope</body></html>')
    }
    const result = await fetchArticleSource(`${baseUrl}/status`, testOptions)
    expect(result).toMatchObject({ ok: false, reason })
  })

  it('refuses a page over the HTML/text ceiling even when a PDF that size would pass', async () => {
    handler = (_req, res) => {
      res.writeHead(200, { 'content-type': 'text/html' })
      res.end(Buffer.alloc(3 * 1024 * 1024, 'a'))
    }
    const result = await fetchArticleSource(`${baseUrl}/bigpage`, testOptions)
    expect(result).toMatchObject({ ok: false, reason: 'too_large' })
  })

  it('refuses a declared Content-Length over the ceiling before reading the body', async () => {
    let bodyWritten = false
    handler = (_req, res) => {
      res.writeHead(200, {
        'content-type': 'application/pdf',
        'content-length': String(MAX_ARTICLE_FETCH_BYTES + 1),
      })
      res.write('%PDF-1.7')
      bodyWritten = true
      // Never end: the client must have given up on the declared size alone.
      res.on('close', () => res.end())
    }
    const result = await fetchArticleSource(`${baseUrl}/declared`, testOptions)
    expect(result).toMatchObject({ ok: false, reason: 'too_large' })
    expect(bodyWritten).toBe(true)
  })

  it('sends a host-only cookie back to the exact host only, and ignores a bare-TLD Domain', async () => {
    const seen: string[] = []
    handler = (req, res) => {
      seen.push(`${req.url} cookie=${req.headers.cookie ?? ''}`)
      if (req.url === '/set') {
        res.writeHead(302, {
          location: '/next',
          'set-cookie': ['a=1; Path=/', 'b=2; Domain=com; Path=/'],
        })
        res.end()
        return
      }
      res.writeHead(200, { 'content-type': 'text/plain' })
      res.end('plain text body '.repeat(20))
    }
    await fetchArticleSource(`${baseUrl}/set`, testOptions)
    // Same host: the host-only cookie comes back; the Domain=com one was
    // stored host-only too (its Domain was refused) so it also comes back
    // here — and would never reach any other host.
    expect(seen[1]).toBe('/next cookie=a=1; b=2')
  })

  it('rejects content that is neither a page, text, nor a PDF', async () => {
    handler = (_req, res) => {
      res.writeHead(200, { 'content-type': 'image/png' })
      res.end(Buffer.from([0x89, 0x50, 0x4e, 0x47]))
    }
    const result = await fetchArticleSource(`${baseUrl}/image`, testOptions)
    expect(result).toMatchObject({ ok: false, reason: 'unsupported_content' })
  })

  it('aborts a body that exceeds the byte ceiling instead of buffering it', async () => {
    handler = (_req, res) => {
      res.writeHead(200, { 'content-type': 'text/plain' })
      const chunk = Buffer.alloc(1024 * 1024, 'a')
      let sent = 0
      const push = () => {
        while (sent <= MAX_ARTICLE_FETCH_BYTES + chunk.length) {
          sent += chunk.length
          if (!res.write(chunk)) {
            res.once('drain', push)
            return
          }
        }
        res.end()
      }
      res.on('error', () => undefined)
      push()
    }
    const result = await fetchArticleSource(`${baseUrl}/huge`, testOptions)
    expect(result).toMatchObject({ ok: false, reason: 'too_large' })
  })
})
