import { cookies } from 'next/headers'
import { ACCESS_TOKEN_BOOT_SCRIPT } from '@/lib/auth/access-token-boot'

/**
 * Starts `GET /api/auth/access-token` during HTML parse, so the bearer hop
 * overlaps the shell JS download + hydration instead of queueing behind it
 * (GOAL-375). Rendered from the root layout's `<head>`; the result is parked
 * on `window.__gpAccessTokenBoot` and consumed once by
 * `src/lib/auth/access-token-client.ts`. See `access-token-boot.ts` for the
 * contract and the before/after numbers.
 *
 * A Server Component so it can read the HttpOnly auth cookies — the script is
 * emitted ONLY when an `accessToken` cookie is present. A logged-out visitor
 * therefore sends no extra request at all.
 *
 * Gated on `accessToken` ALONE, deliberately not `|| refreshToken`. This is a
 * root layout, so it renders on public and `/auth/*` pages too, and a member
 * bounced to login by the session-expiry flow still carries a stale refresh
 * cookie. Firing on that would push the route down its expensive path
 * (bcrypt compare + rotation, ~980 ms) on page loads that previously cost
 * nothing, taking a slot from the shared `auth-burst` bucket GOAL-249 keys by
 * IP — painful behind NAT — and could bounce a reader off a public page. When
 * only the refresh cookie is live, the client's normal hydration-time fetch
 * still refreshes exactly as it does today; we simply decline to parallelise
 * that once-per-30-minutes case.
 *
 * Cookie *presence* is not a trust decision: the route re-verifies the JWT
 * signature (and, if it must refresh, the bcrypt-hashed refresh token) exactly
 * as before. The worst a forged cookie buys is one 401.
 *
 * `nonce` must be the value `middleware.ts` stamped on the request —
 * `script-src 'strict-dynamic'` blocks an un-nonced inline script outright.
 */
export async function AccessTokenBootstrap({ nonce }: { nonce?: string }) {
  const cookieStore = await cookies()
  if (!cookieStore.get('accessToken')?.value) return null

  return (
    <script
      id="gp-access-token-boot"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: ACCESS_TOKEN_BOOT_SCRIPT }}
    />
  )
}
