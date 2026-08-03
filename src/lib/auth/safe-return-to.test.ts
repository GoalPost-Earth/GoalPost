/**
 * GOAL-316 — `returnTo` sanitizer.
 *
 * The login page and the login API both funnel the post-login destination
 * through sanitizeReturnTo before navigating/echoing. These tests pin the
 * contract: same-origin absolute paths pass through verbatim; anything that
 * could leave the origin (absolute URLs, scheme-relative, backslash tricks,
 * javascript:, control characters) collapses to null.
 */
import { sanitizeReturnTo } from './safe-return-to'

describe('sanitizeReturnTo', () => {
  it('accepts a same-origin absolute path', () => {
    expect(sanitizeReturnTo('/protected/dashboard')).toBe(
      '/protected/dashboard'
    )
  })

  it('accepts the durable document-download path (the GOAL-316 flow)', () => {
    const path = '/api/ingest/document/doc_123/download'
    expect(sanitizeReturnTo(path)).toBe(path)
  })

  it('accepts a path with query string and fragment', () => {
    expect(sanitizeReturnTo('/protected/spaces?tab=members#top')).toBe(
      '/protected/spaces?tab=members#top'
    )
  })

  it('trims surrounding whitespace', () => {
    expect(sanitizeReturnTo('  /protected/profile  ')).toBe(
      '/protected/profile'
    )
  })

  it('rejects empty, null, and undefined', () => {
    expect(sanitizeReturnTo('')).toBeNull()
    expect(sanitizeReturnTo('   ')).toBeNull()
    expect(sanitizeReturnTo(null)).toBeNull()
    expect(sanitizeReturnTo(undefined)).toBeNull()
  })

  it('rejects absolute URLs to another origin', () => {
    expect(sanitizeReturnTo('https://evil.example/phish')).toBeNull()
    expect(sanitizeReturnTo('http://evil.example')).toBeNull()
  })

  it('rejects scheme-relative URLs', () => {
    expect(sanitizeReturnTo('//evil.example/phish')).toBeNull()
  })

  it('rejects backslash escapes (browsers normalise \\ to /)', () => {
    expect(sanitizeReturnTo('/\\evil.example')).toBeNull()
    expect(sanitizeReturnTo('\\\\evil.example')).toBeNull()
    expect(sanitizeReturnTo('/path\\..\\x')).toBeNull()
  })

  it('rejects javascript: and other schemes', () => {
    expect(sanitizeReturnTo('javascript:alert(1)')).toBeNull()
    expect(sanitizeReturnTo('data:text/html,x')).toBeNull()
  })

  it('rejects relative (non-rooted) paths', () => {
    expect(sanitizeReturnTo('protected/dashboard')).toBeNull()
    expect(sanitizeReturnTo('../up')).toBeNull()
  })

  it('rejects self-referential /auth destinations', () => {
    expect(sanitizeReturnTo('/auth')).toBeNull()
    expect(sanitizeReturnTo('/auth/login')).toBeNull()
    expect(sanitizeReturnTo('/auth/login?returnTo=%2F')).toBeNull()
    expect(sanitizeReturnTo('/auth?x=1')).toBeNull()
    expect(sanitizeReturnTo('/auth#top')).toBeNull()
  })

  it('accepts non-auth paths that merely start with the letters "auth"', () => {
    expect(sanitizeReturnTo('/authors')).toBe('/authors')
  })

  it('rejects paths containing control characters', () => {
    expect(sanitizeReturnTo('/pa\nth')).toBeNull()
    expect(sanitizeReturnTo('/pa\rth')).toBeNull()
    expect(sanitizeReturnTo('/pa' + String.fromCharCode(0) + 'th')).toBeNull()
    expect(sanitizeReturnTo('/pa' + String.fromCharCode(127) + 'th')).toBeNull()
  })
})
