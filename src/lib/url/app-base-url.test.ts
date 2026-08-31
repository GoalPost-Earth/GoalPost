/**
 * Unit tests for resolveAppBaseUrl — the single source of truth for the
 * app's public base URL (GOAL-329).
 *
 * Precedence contract (documented on the module):
 *   1. An explicit, NON-localhost NEXT_PUBLIC_BASE_URL.
 *   2. VERCEL_PROJECT_PRODUCTION_URL → https://<host>.
 *   3. The raw NEXT_PUBLIC_BASE_URL (or http://localhost:3000) so local
 *      dev still works.
 *
 * Request headers are never consulted (host-header poisoning), so the
 * whole surface is process.env — saved and restored around every test.
 */

import { resolveAppBaseUrl } from './app-base-url'

const ENV_KEYS = ['NEXT_PUBLIC_BASE_URL', 'VERCEL_PROJECT_PRODUCTION_URL'] as const

describe('resolveAppBaseUrl', () => {
  let savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>

  beforeEach(() => {
    savedEnv = {}
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key]
      delete process.env[key]
    }
  })

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key]
      else process.env[key] = savedEnv[key]
    }
  })

  it('prefers a non-localhost NEXT_PUBLIC_BASE_URL over the Vercel host', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://goalpost.earth'
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'goalpost.example.vercel.app'
    expect(resolveAppBaseUrl()).toBe('https://goalpost.earth')
  })

  it('strips trailing slashes from an explicit base URL', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://goalpost.earth///'
    expect(resolveAppBaseUrl()).toBe('https://goalpost.earth')
  })

  it('rejects a localhost NEXT_PUBLIC_BASE_URL in favour of the Vercel host', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'goalpost.example.vercel.app'
    expect(resolveAppBaseUrl()).toBe('https://goalpost.example.vercel.app')
  })

  it.each(['http://127.0.0.1:3000', 'http://0.0.0.0:3000', 'http://[::1]:3000'])(
    'treats %s as localhost and falls back to the Vercel host',
    (loopback) => {
      process.env.NEXT_PUBLIC_BASE_URL = loopback
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'goalpost.example.vercel.app'
      expect(resolveAppBaseUrl()).toBe('https://goalpost.example.vercel.app')
    }
  )

  it('normalises a Vercel value that already carries a scheme and trailing slash', () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL =
      'https://goalpost.example.vercel.app/'
    expect(resolveAppBaseUrl()).toBe('https://goalpost.example.vercel.app')
  })

  it('falls back to the Vercel host when NEXT_PUBLIC_BASE_URL is not a parseable URL', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'not a url at all'
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'goalpost.example.vercel.app'
    expect(resolveAppBaseUrl()).toBe('https://goalpost.example.vercel.app')
  })

  it('keeps the raw localhost value for local dev when no Vercel host exists', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000/'
    expect(resolveAppBaseUrl()).toBe('http://localhost:3000')
  })

  it('defaults to http://localhost:3000 when nothing is configured', () => {
    expect(resolveAppBaseUrl()).toBe('http://localhost:3000')
  })
})
