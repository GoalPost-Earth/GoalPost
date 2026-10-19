/**
 * Tests for member-safe assistant error classification (kb/07 Rule 1).
 * Run with: npm test -- chat-errors.test.ts
 */

import {
  CHAT_ERROR_MESSAGES,
  classifyChatError,
  toMemberErrorCopy,
  type ChatErrorInfo,
} from './chat-errors'

/** Mimics the AI SDK `APICallError` shape: an Error with statusCode + JSON body. */
function apiCallError(
  statusCode: number,
  body: unknown,
  message = 'API call failed'
) {
  return Object.assign(new Error(message), {
    name: 'AI_APICallError',
    statusCode,
    responseBody: JSON.stringify(body),
  })
}

const FORBIDDEN_FRAGMENTS = ['openai', 'http', 'credit']

function expectMemberSafe(info: ChatErrorInfo) {
  const lower = info.message.toLowerCase()
  for (const fragment of FORBIDDEN_FRAGMENTS) {
    expect(lower).not.toContain(fragment)
  }
}

describe('classifyChatError', () => {
  describe('when the provider account cannot serve requests', () => {
    it('classifies a raw OpenAI Responses stream error event as unavailable', () => {
      const event = {
        type: 'error',
        sequence_number: 2,
        error: {
          type: 'insufficient_quota',
          code: 'credit_balance_exhausted',
          message:
            'You have no credits remaining. Visit https://platform.openai.com/billing',
        },
      }
      const info = classifyChatError(event)
      expect(info.kind).toBe('unavailable')
      expect(info.retryable).toBe(false)
      expect(info.httpStatus).toBe(503)
      expectMemberSafe(info)
    })

    it('classifies an APICallError 429 with insufficient_quota body as unavailable', () => {
      const err = apiCallError(429, { error: { code: 'insufficient_quota' } })
      const info = classifyChatError(err)
      expect(info.kind).toBe('unavailable')
      expect(info.retryable).toBe(false)
      expectMemberSafe(info)
    })

    it('looks through a RetryError wrapper to its lastError', () => {
      const lastError = apiCallError(429, {
        error: { code: 'insufficient_quota' },
      })
      const retryError = Object.assign(
        new Error('Failed after 3 attempts. Last error: API call failed'),
        {
          name: 'AI_RetryError',
          reason: 'maxRetriesExceeded',
          errors: [lastError],
          lastError,
        }
      )
      const info = classifyChatError(retryError)
      expect(info.kind).toBe('unavailable')
      expectMemberSafe(info)
    })

    it('looks through an LLMProviderError to its originalError', () => {
      const providerError = Object.assign(
        new Error('LLM provider request failed'),
        {
          name: 'LLMProviderError',
          originalError: { status: 429, code: 'credit_balance_exhausted' },
        }
      )
      const info = classifyChatError(providerError)
      expect(info.kind).toBe('unavailable')
      expectMemberSafe(info)
    })

    it('classifies a 401 (bad or revoked key) as unavailable', () => {
      const err = apiCallError(401, {
        error: { message: 'Incorrect API key provided' },
      })
      const info = classifyChatError(err)
      expect(info.kind).toBe('unavailable')
      expect(info.retryable).toBe(false)
      expectMemberSafe(info)
    })
  })

  describe('when the provider is rate limiting', () => {
    it('classifies a 429 rate_limit_exceeded as rate_limited and retryable', () => {
      const err = apiCallError(429, {
        error: {
          code: 'rate_limit_exceeded',
          message: 'Rate limit reached for requests',
        },
      })
      const info = classifyChatError(err)
      expect(info.kind).toBe('rate_limited')
      expect(info.retryable).toBe(true)
      expect(info.httpStatus).toBe(429)
      expectMemberSafe(info)
    })
  })

  describe('when the error is unrecognised', () => {
    it('classifies a plain Error as unknown', () => {
      const info = classifyChatError(new Error('socket hang up'))
      expect(info.kind).toBe('unknown')
      expect(info.retryable).toBe(true)
      expect(info.httpStatus).toBe(500)
      expectMemberSafe(info)
    })

    it('classifies a string as unknown', () => {
      const info = classifyChatError('boom')
      expect(info.kind).toBe('unknown')
      expectMemberSafe(info)
    })

    it('classifies null and undefined as unknown', () => {
      expect(classifyChatError(null).kind).toBe('unknown')
      expect(classifyChatError(undefined).kind).toBe('unknown')
    })

    it('handles a circular object without throwing', () => {
      const circular: Record<string, unknown> = { message: 'loop' }
      circular.cause = circular
      circular.error = { data: circular }
      let info: ChatErrorInfo | undefined
      expect(() => {
        info = classifyChatError(circular)
      }).not.toThrow()
      expect(info?.kind).toBe('unknown')
    })

    it('tolerates a non-JSON responseBody', () => {
      const err = Object.assign(new Error('Bad gateway'), {
        statusCode: 502,
        responseBody: '<html>502</html>',
      })
      expect(classifyChatError(err).kind).toBe('unknown')
    })
  })
})

describe('toMemberErrorCopy', () => {
  const { unavailable, unknown } = CHAT_ERROR_MESSAGES

  it('passes through member-safe copy from the stream error text', () => {
    expect(toMemberErrorCopy(unavailable.message)).toBe(unavailable.message)
  })

  it('unwraps member-safe copy from a JSON { error } body', () => {
    const body = JSON.stringify({
      error: unavailable.message,
      retryable: false,
    })
    expect(toMemberErrorCopy(body)).toBe(unavailable.message)
  })

  it.each([
    'An error occurred with your deployment\n\nFUNCTION_INVOCATION_TIMEOUT\n\niad1::abc123',
    'Failed to fetch',
    JSON.stringify({ error: 'Messages array is required' }),
    '[openai] 429 You have no credits remaining. https://platform.openai.com/',
    undefined,
    '',
  ])('falls back to generic copy for raw or unknown errors: %p', (raw) => {
    expect(toMemberErrorCopy(raw)).toBe(unknown.message)
  })
})
