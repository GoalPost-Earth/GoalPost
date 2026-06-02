/**
 * Canonical email normalization for identity / auth paths.
 *
 * Trim + lowercase so the same inbox can never become two distinct accounts
 * through casing or stray whitespace, and so the `Person.email` uniqueness
 * constraint (see scripts/init-db.js) is actually meaningful — Neo4j
 * uniqueness constraints are case-SENSITIVE, so `Alice@x.com` and
 * `alice@x.com` would otherwise both be allowed.
 *
 * Apply this at EVERY write boundary (signup, accept-invite-derived creates,
 * invite-by-email) AND every auth-match boundary (login, request-reset,
 * findUserByEmail) so stored values and lookup keys agree. The one-time
 * backfill for pre-existing rows lives in scripts/normalize-person-emails.ts.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
