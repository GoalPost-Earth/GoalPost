/**
 * Single source of truth for the app's public base URL.
 *
 * Resolves from server configuration ONLY — request headers (Host /
 * X-Forwarded-Host / -Proto) are deliberately NEVER consulted: they are
 * attacker-controllable and trusting them enables host-header poisoning (an
 * attacker could get a victim a link, or an emailed token, pointing at an
 * attacker-controlled domain).
 *
 * Precedence:
 *   1. An explicit, non-localhost NEXT_PUBLIC_BASE_URL.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel-injected, server-side, and not
 *      client-controllable — resolved to https://<host>.
 *   3. The raw NEXT_PUBLIC_BASE_URL (or localhost) so local dev still works.
 *
 * Callers that build outbound/stored links (password-reset emails, the durable
 * document-download link persisted into ResourcePulse.location, etc.) should use
 * this rather than re-deriving the base URL, so the "never trust headers" rule
 * lives in exactly one place.
 */

function isLocalhostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '[::1]'
    )
  } catch {
    // Not a parseable absolute URL — treat as "not usable", callers fall
    // through to the next precedence tier.
    return true
  }
}

export function resolveAppBaseUrl(): string {
  const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  if (envBaseUrl && !isLocalhostUrl(envBaseUrl)) {
    return envBaseUrl.replace(/\/+$/, '')
  }

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelHost) {
    const host = vercelHost.replace(/^https?:\/\//, '').replace(/\/+$/, '')
    return `https://${host}`
  }

  return (envBaseUrl || 'http://localhost:3000').replace(/\/+$/, '')
}
