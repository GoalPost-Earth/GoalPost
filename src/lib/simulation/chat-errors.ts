/**
 * Member-safe classification of assistant (LLM) failures.
 *
 * kb/07 Rule 1: raw provider errors must never reach the member — they carry
 * internal strings (provider names, billing URLs, request ids). This maps any
 * failure the chat route can see to plain copy the UI can show verbatim.
 *
 * The error arrives in several shapes depending on where it surfaced:
 *  - a thrown AI SDK `APICallError` (`statusCode`, JSON `responseBody`),
 *    possibly wrapped in a `RetryError` (`lastError`) after retries;
 *  - our own `LLMProviderError` (`originalError`, OpenAI SDK `status`/`code`);
 *  - a raw OpenAI Responses stream event delivered to `onError` as a plain
 *    object: `{ type: 'error', error: { type: 'insufficient_quota', code } }`.
 * So we walk the nested error chain and look at every layer.
 */

export type ChatErrorKind = 'unavailable' | 'rate_limited' | 'unknown'

export interface ChatErrorInfo {
  kind: ChatErrorKind
  /** Member-facing copy — safe to render as-is. */
  message: string
  /** Whether retrying in a few seconds is likely to succeed. */
  retryable: boolean
  /** HTTP status to use when the error is returned as a plain response. */
  httpStatus: number
}

export const CHAT_ERROR_MESSAGES: Record<
  ChatErrorKind,
  Omit<ChatErrorInfo, 'kind'>
> = {
  // Credits exhausted / account disabled / bad key: no amount of retrying
  // helps until someone fixes the account, so don't tell the member to retry
  // in a few seconds or to rephrase.
  unavailable: {
    message:
      "The assistant is unavailable right now, so I can't answer. Please try again later.",
    retryable: false,
    httpStatus: 503,
  },
  rate_limited: {
    message:
      "I'm getting a lot of requests right now and need a moment. Please try again in a few seconds.",
    retryable: true,
    httpStatus: 429,
  },
  unknown: {
    message:
      'Something went wrong on our end while answering. Please try again in a moment.',
    retryable: true,
    httpStatus: 500,
  },
}

// Provider error codes/types meaning "the account can't serve requests".
const UNAVAILABLE_CODES = new Set([
  'insufficient_quota',
  'credit_balance_exhausted',
  'billing_hard_limit_reached',
  'invalid_api_key',
  'account_deactivated',
])

const NESTED_KEYS = ['cause', 'lastError', 'originalError', 'error', 'data']

function collectLayers(error: unknown): Record<string, unknown>[] {
  const layers: Record<string, unknown>[] = []
  const seen = new Set<unknown>()
  const visit = (value: unknown, depth: number) => {
    if (depth > 6 || value === null || typeof value !== 'object') return
    if (seen.has(value)) return
    seen.add(value)
    const layer = value as Record<string, unknown>
    layers.push(layer)
    for (const key of NESTED_KEYS) visit(layer[key], depth + 1)
    if (typeof layer.responseBody === 'string') {
      try {
        visit(JSON.parse(layer.responseBody), depth + 1)
      } catch {
        // Not JSON — the message regex below still sees it via `message`.
      }
    }
  }
  visit(error, 0)
  return layers
}

export function classifyChatError(error: unknown): ChatErrorInfo {
  const layers = collectLayers(error)
  const statuses = new Set<number>()
  const codes = new Set<string>()
  const texts: string[] = typeof error === 'string' ? [error] : []

  for (const layer of layers) {
    for (const key of ['statusCode', 'status']) {
      if (typeof layer[key] === 'number') statuses.add(layer[key] as number)
    }
    for (const key of ['code', 'type']) {
      if (typeof layer[key] === 'string') codes.add(layer[key] as string)
    }
    if (typeof layer.message === 'string') texts.push(layer.message)
  }

  const kind: ChatErrorKind =
    [...codes].some((c) => UNAVAILABLE_CODES.has(c)) ||
    statuses.has(401) ||
    texts.some((t) => /insufficient_quota|no credits remaining/i.test(t))
      ? 'unavailable'
      : statuses.has(429) ||
          texts.some((t) => /rate.?limit|too many requests/i.test(t))
        ? 'rate_limited'
        : 'unknown'

  return { kind, ...CHAT_ERROR_MESSAGES[kind] }
}

const MEMBER_SAFE_COPY = new Set(
  Object.values(CHAT_ERROR_MESSAGES).map((m) => m.message)
)

/**
 * Client side: turn whatever error string the chat transport attached to a
 * message into copy safe to show. Only copy this module produced is passed
 * through — either as the stream's error text or inside a JSON `{ error }`
 * body. Anything else (a Vercel timeout page, "Failed to fetch", a 400 body)
 * falls back to the generic message rather than leaking raw text.
 */
export function toMemberErrorCopy(error: unknown): string {
  let candidate = error
  if (typeof error === 'string') {
    try {
      candidate = (JSON.parse(error) as { error?: unknown } | null)?.error
    } catch {
      // Not JSON — check the raw string itself.
    }
  }
  return typeof candidate === 'string' && MEMBER_SAFE_COPY.has(candidate)
    ? candidate
    : CHAT_ERROR_MESSAGES.unknown.message
}
