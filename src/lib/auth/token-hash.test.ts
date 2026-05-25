import { hashAuthToken } from './token-hash'

/**
 * Pure unit tests for the central token-hash helper. Cheap, deterministic,
 * no Neo4j dependency. These exist to keep call sites honest — every auth
 * flow that persists hashed tokens (invite + reset) reads through this
 * function, so a regression here is a regression everywhere.
 *
 * The properties we care about (per GOAL-248):
 *   1. Deterministic — same input → same hash, always.
 *   2. Idempotent across processes — no salt, no time component.
 *   3. Lowercase hex — the schema lookup compares the indexed value
 *      verbatim, so a mixed-case drift would silently fail every redeem.
 *   4. Single-bit tamper sensitivity — flipping one byte of the raw token
 *      must produce a hash that does not match (the whole point of the
 *      "tampered token → rejected" AC for accept-invite / reset-password).
 *   5. Empty string handled — the route layers reject empty raw tokens at
 *      the zod boundary, but the helper itself must not throw if called
 *      with one (defensive).
 */
describe('hashAuthToken', () => {
  it('produces the known sha256 hex for a fixed input', () => {
    // Independently verifiable: sha256("goalpost") in lowercase hex.
    // Hard-coding the expected digest catches any accidental encoding
    // change (utf-16, base64, uppercase) that would still look "hashy"
    // but break every lookup in production.
    expect(hashAuthToken('goalpost')).toBe(
      '71fd6a487eecd84680309ced0173645a82b1d10968ab80efe9feb2fb1a98cd04'
    )
  })

  it('is deterministic across repeated calls with the same input', () => {
    const a = hashAuthToken('space-123.deadbeef-cafe-1234-5678-abcdef012345')
    const b = hashAuthToken('space-123.deadbeef-cafe-1234-5678-abcdef012345')
    expect(a).toBe(b)
  })

  it('returns lowercase hex of length 64 (sha256)', () => {
    const hash = hashAuthToken('any-input-at-all')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    // No uppercase hex digits — schema lookups are case-sensitive on the
    // indexed value, so a mixed-case drift would silently miss every
    // redeem attempt without an obvious error.
    expect(hash).toBe(hash.toLowerCase())
  })

  it('produces a completely different hash when one byte of the input is flipped', () => {
    // This is the "tampered raw token → rejected" AC at the primitive
    // level — the redeem route hashes the submitted token and looks it
    // up by exact equality on the indexed field, so any change to the
    // input must produce a value that won't match.
    const original = 'ws_test.4d8e9b1a-1111-2222-3333-444455556666'
    const tampered = 'ws_test.4d8e9b1a-1111-2222-3333-444455556667' // last char 6→7
    const a = hashAuthToken(original)
    const b = hashAuthToken(tampered)
    expect(a).not.toBe(b)
    // Sanity: avalanche — at least a quarter of the hex chars should differ
    // for a single-bit flip. (sha256 in practice differs in ~half of bits.)
    let diff = 0
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) diff++
    }
    expect(diff).toBeGreaterThan(a.length / 4)
  })

  it('handles the empty string without throwing', () => {
    // Defensive — the route layers zod-reject empty tokens at the
    // boundary, but if a future caller forgets, the helper should not
    // crash. Expected value is the documented sha256 of the empty
    // string.
    expect(hashAuthToken('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    )
  })

  it('treats inputs that differ only in case as distinct', () => {
    // Raw tokens are UUID-derived (lowercase hex by RFC 4122), but if a
    // caller ever passed an uppercase variant by mistake we want the
    // lookup to miss (so the redeem fails) rather than silently match
    // some other Person.
    expect(hashAuthToken('ABC')).not.toBe(hashAuthToken('abc'))
  })
})
