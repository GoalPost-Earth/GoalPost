/**
 * Post-login `returnTo` sanitizer (GOAL-316).
 *
 * The durable document-download route (and any session-expiry bounce from
 * `AppContext`) sends a signed-out visitor to `/auth/login?returnTo=<path>`.
 * The login page forwards that value to `POST /api/auth/login` and navigates
 * to it after a successful sign-in — which makes `returnTo` an open-redirect
 * vector unless it is pinned to a same-origin path on BOTH sides.
 *
 * Accepts only an absolute-path reference per the WHATWG URL spec: a single
 * leading `/` followed by a non-`/` character. Everything else — absolute
 * URLs (`https://evil.example`), scheme-relative URLs (`//evil.example`),
 * backslash variants (`/\evil.example`, browsers normalise `\` to `/`),
 * `javascript:` and friends — is rejected to `null` so callers fall back to
 * the app root.
 */
export function sanitizeReturnTo(
  raw: string | null | undefined
): string | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  // Same-origin absolute path only: exactly one leading slash.
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  // Browsers treat `\` as `/` in URLs, so `/\evil.example` would escape the
  // origin. No legitimate app path contains a backslash — reject outright.
  if (trimmed.includes('\\')) return null
  // Control characters (encoded CR/LF arrive decoded from searchParams.get)
  // have no place in a path and are classic header/URL-splitting material.
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i)
    if (code < 0x20 || code === 0x7f) return null
  }
  // A post-login destination inside /auth is a self-referential bounce — e.g.
  // returnTo=/auth/login would land the freshly signed-in member back on the
  // login page. No legitimate flow returns into the auth pages.
  if (/^\/auth([/?#]|$)/.test(trimmed)) return null
  return trimmed
}
