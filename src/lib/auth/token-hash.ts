import { createHash } from 'node:crypto'

/**
 * Single source of truth for hashing single-use auth tokens (invite +
 * reset). Persist the hash, email/URL-bind the raw value, hash again on
 * redemption and look up by the hash.
 *
 * SHA-256 hex is the right primitive here — the raw tokens are already
 * high-entropy (UUID-derived), so a slow KDF like bcrypt buys nothing
 * and would just add latency to every accept/reset round-trip. We're
 * defending against database-read compromise, not against cracking
 * low-entropy passwords.
 *
 * Standardised on lowercase hex so call sites can't accidentally diverge
 * (mixed-case would fail the equality lookup against the indexed value).
 */
export function hashAuthToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}
