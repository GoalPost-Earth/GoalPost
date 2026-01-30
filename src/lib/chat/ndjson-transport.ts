interface StreamEvent {
  type:
    | 'tool_call'
    | 'tool_result'
    | 'tool_error'
    | 'message'
    | 'done'
    | 'error'
  tool?: string
  args?: unknown
  result?: unknown
  content?: string
  error?: string
}

let storedAiMode: string = 'default'

export function setAiMode(mode: string) {
  storedAiMode = mode
}

export async function* ndjsonChatTransport(
  messages: Array<{ role: string; content: string }>,
  endpoint: string
) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      aiMode: storedAiMode,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send message')
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue

        try {
          const event: StreamEvent = JSON.parse(line)
          console.log('[NDJSON Transport] Event:', event.type)

          switch (event.type) {
            case 'tool_call':
              yield {
                type: 'text',
                content: `🔧 Calling ${event.tool}...\n`,
              }
              break

            case 'tool_result':
              yield {
                type: 'text',
                content: `✓ ${event.tool} completed\n`,
              }
              break

            case 'tool_error':
              yield {
                type: 'text',
                content: `❌ ${event.tool} error: ${event.error}\n`,
              }
              break

            case 'message':
              if (event.content) {
                yield {
                  type: 'text',
                  content: event.content,
                }
              }
              break

            case 'error':
              console.error('[NDJSON Transport] Error:', event.error)
              throw new Error(event.error || 'Unknown error')
          }
        } catch (parseError) {
          console.warn('[NDJSON Transport] Parse error:', parseError)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
