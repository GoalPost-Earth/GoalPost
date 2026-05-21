import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')
const PEPPER = process.env.PEPPER || ''

export const hashPassword = async (password: string) =>
  await bcrypt.hash(password + PEPPER, 12)
export const comparePassword = async (raw: string, hash: string) =>
  await bcrypt.compare(raw + PEPPER, hash)

// HMAC-SHA256 is the algorithm we use for all JWTs (the secret is a random
// string, not a key pair). Stating it explicitly on BOTH sides is required:
// jsonwebtoken v9+ refuses to verify a signature unless the caller passes an
// `algorithms` allowlist (prevents algorithm-confusion attacks). Mirror it
// on `sign` so the algorithm choice is documented in one place.
const JWT_ALGORITHM = 'HS256' as const

export const signJWT = (payload: Record<string, unknown>) =>
  jwt.sign(payload, process.env.JWT_SECRET ?? '', {
    expiresIn: '30m',
    algorithm: JWT_ALGORITHM,
  })

export const verifyJWT = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET ?? '', {
    algorithms: [JWT_ALGORITHM],
  })

/**
 * Resolve the authenticated user's id from a request. Tries both
 * transports the client uses today:
 *
 *   1. `Authorization: Bearer <jwt>` header — what the Apollo / GraphQL
 *      client sends and what `/api/graphql` itself reads.
 *   2. `accessToken=<jwt>` cookie — what older API routes expect.
 *
 * Returns null when neither produces a valid JWT. Verification failures
 * are swallowed so a stale token on one transport doesn't shadow a good
 * token on the other.
 *
 * Centralising this here prevents the "GraphQL works but the new route
 * 401s" class of bug — any route that needs the caller's id should
 * call this instead of grepping cookies itself.
 */
export function resolveAuthenticatedUserId(
  req: Request | NextRequest
): string | null {
  type DecodedJwt = { user?: { id?: unknown } } | string | undefined

  const authHeader = req.headers.get('authorization') || ''
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i)
  if (bearerMatch) {
    try {
      const decoded = verifyJWT(bearerMatch[1].trim()) as DecodedJwt
      if (typeof decoded === 'object' && typeof decoded?.user?.id === 'string') {
        return decoded.user.id
      }
    } catch {
      // fall through to cookie
    }
  }

  const cookieHeader = req.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/)
  if (tokenMatch) {
    try {
      const decoded = verifyJWT(decodeURIComponent(tokenMatch[1])) as DecodedJwt
      if (typeof decoded === 'object' && typeof decoded?.user?.id === 'string') {
        return decoded.user.id
      }
    } catch {
      // both transports failed → return null
    }
  }

  return null
}

/**
 * Parses the request body as JSON and checks for empty body.
 * Returns an object: { ok: true, body } or { ok: false, error, status }
 */
export async function parseRequestBody(req: NextRequest) {
  let body
  try {
    body = await req.json()
  } catch {
    return {
      ok: false,
      error: 'Request body is missing or invalid JSON',
      status: 400,
    }
  }
  if (!body || Object.keys(body).length === 0) {
    return {
      ok: false,
      error: 'Request body is required',
      status: 400,
    }
  }
  return { ok: true, body }
}

/**
 * Sends an email using Resend.
 * @param to Recipient email address
 * @param subject Email subject
 * @param html HTML content of the email
 * @param from Sender email address (optional, defaults to onboarding@resend.dev)
 */
export async function sendMail({
  to,
  subject,
  html,
  from = 'onboarding@resend.dev',
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })
    return { ok: true, response }
  } catch (error) {
    return { ok: false, error }
  }
}
