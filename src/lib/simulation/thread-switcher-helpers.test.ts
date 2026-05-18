import {
  containsRawEntityId,
  deriveDisplayTitle,
  formatRelative,
} from './thread-switcher-helpers'
import type { ThreadSummary } from './conversation-thread-client'

/**
 * Slice 5 (GOAL-240) — pure helpers behind the thread switcher.
 *
 * The most load-bearing invariant: `deriveDisplayTitle` must never return a
 * raw entity id. The switcher's trigger label and dropdown items both flow
 * through this function, so a regression here would silently break Rule 1
 * in kb/07-ai-assistant-ux.md.
 */

function summary(overrides: Partial<ThreadSummary> = {}): ThreadSummary {
  return {
    id: 'thread_abc123-deadbeef-1234',
    createdAt: '2026-05-18T00:00:00Z',
    lastTurnAt: '2026-05-18T00:00:00Z',
    turnCount: 1,
    snippet: '',
    title: null,
    mode: 'default',
    kind: 'reflective',
    ...overrides,
  }
}

describe('deriveDisplayTitle', () => {
  it('uses persisted title verbatim when present', () => {
    expect(deriveDisplayTitle(summary({ title: 'Ingest: meeting-notes.pdf' }))).toBe(
      'Ingest: meeting-notes.pdf'
    )
  })

  it('returns "Ingest" for ingest threads with no title', () => {
    expect(deriveDisplayTitle(summary({ kind: 'ingest', title: null }))).toBe('Ingest')
  })

  it('trims long snippets to 60 chars + ellipsis for reflective threads', () => {
    const longSnippet = 'a'.repeat(120)
    const out = deriveDisplayTitle(
      summary({ kind: 'reflective', title: null, snippet: longSnippet })
    )
    expect(out.length).toBeLessThanOrEqual(60)
    expect(out.endsWith('…')).toBe(true)
  })

  it('falls back to generic copy — never to the raw thread id', () => {
    const out = deriveDisplayTitle(
      summary({ id: 'thread_abc-deadbeef', title: null, kind: 'reflective', snippet: '' })
    )
    expect(out).toBe('Conversation')
    expect(containsRawEntityId(out)).toBe(false)
  })

  it('all derived titles for any sane input are free of raw entity ids', () => {
    const cases: ThreadSummary[] = [
      summary({ title: 'My reflective chat' }),
      summary({ kind: 'ingest', title: 'Ingest: q2-notes.pdf' }),
      summary({ kind: 'ingest', title: null }),
      summary({ kind: 'reflective', title: null, snippet: 'thinking about the team' }),
      summary({ kind: 'reflective', title: null, snippet: '' }),
    ]
    for (const c of cases) {
      const out = deriveDisplayTitle(c)
      expect(containsRawEntityId(out)).toBe(false)
    }
  })

  it('does not leak when a malicious title contains a raw id (caller is responsible, helper passes through)', () => {
    // The helper trusts persisted titles — the server-side write path is
    // responsible for ensuring titles like `Ingest: <filename>` are clean.
    // This test pins that behaviour so a future refactor that adds id
    // sanitisation in this helper is an intentional decision, not a silent
    // regression.
    const out = deriveDisplayTitle(
      summary({ title: 'thread_abc123-deadbeef-1234' })
    )
    expect(out).toBe('thread_abc123-deadbeef-1234')
  })
})

describe('formatRelative', () => {
  const now = Date.UTC(2026, 4, 18, 12, 0, 0) // 2026-05-18 12:00:00 UTC

  it('returns empty string for null or invalid input', () => {
    expect(formatRelative(null, now)).toBe('')
    expect(formatRelative('not-a-date', now)).toBe('')
  })

  it.each([
    ['2026-05-18T11:59:30Z', 'just now'],
    ['2026-05-18T11:55:00Z', '5m ago'],
    ['2026-05-18T09:00:00Z', '3h ago'],
    ['2026-05-15T12:00:00Z', '3d ago'],
    ['2026-05-04T12:00:00Z', '2w ago'],
    ['2026-02-01T12:00:00Z', '3mo ago'],
    ['2024-05-18T12:00:00Z', '2y ago'],
  ])('formats %s as %s relative to fixed now', (input, expected) => {
    expect(formatRelative(input, now)).toBe(expected)
  })
})

describe('containsRawEntityId', () => {
  it('detects common entity-id prefixes', () => {
    expect(containsRawEntityId('see thread_abc')).toBe(true)
    expect(containsRawEntityId('document_xyz123-foo')).toBe(true)
    expect(containsRawEntityId('pulse_abc')).toBe(true)
  })

  it('detects bare UUIDs', () => {
    expect(
      containsRawEntityId('user 550e8400-e29b-41d4-a716-446655440000 said hi')
    ).toBe(true)
  })

  it('passes through plain user copy', () => {
    expect(containsRawEntityId('Ingest: meeting-notes.pdf')).toBe(false)
    expect(containsRawEntityId('My reflective chat')).toBe(false)
    expect(containsRawEntityId('Conversation')).toBe(false)
  })
})
