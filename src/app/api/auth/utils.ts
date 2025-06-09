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

export const signJWT = (payload: Record<string, unknown>) =>
  jwt.sign(payload, process.env.JWT_SECRET ?? '', { expiresIn: '30m' })

export const verifyJWT = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET ?? '')

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
