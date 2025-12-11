# Aiden Cinnamon Tea Simulation Protocol - API Implementation

Complete Next.js API layer for toggleable simulation mode using prompt-based protocol.

## Architecture

### Core Components

1. **State Management** (`src/lib/simulation/state.ts`)
   - Server-side singleton for simulation state
   - Tracks mode, activation time, and message count
   - Persists across requests within deployment instance

2. **Protocol Constants** (`src/lib/simulation/protocol.ts`)
   - Full Aiden Cinnamon Tea protocol text
   - Runtime essence prompt
   - Injected as system messages when active

3. **Helper Functions** (`src/lib/simulation/helpers.ts`)
   - Activation/deactivation detection
   - Message payload assembly
   - Command processing

4. **API Routes**
   - `/api/chat/route.ts` - Enhanced existing route with simulation support
   - `/api/chat/simulation/route.ts` - Dedicated OpenAI-powered endpoint
   
5. **Middleware** (`src/lib/simulation/middleware.ts`)
   - Optional global simulation interceptor
   - Response header injection

## Installation

Already integrated into the existing project. No additional dependencies required beyond what's in `package.json`.

## API Endpoints

### POST /api/chat/simulation

Dedicated simulation endpoint with OpenAI support.

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Activate the Aiden Cinnamon Tea Simulation Protocol."
    }
  ],
  "config": {
    "model": "gpt-4-turbo-preview",
    "temperature": 0.7,
    "stream": true
  }
}
```

**Response (Activation):**
```json
{
  "role": "assistant",
  "content": "🍄 The Aiden Cinnamon Tea Simulation Protocol has been activated...",
  "simulationMode": "aiden"
}
```

**Response (Active Simulation - Streaming)**
Text stream with simulation-enhanced responses.

### GET /api/chat/simulation

Check simulation state.

**Response:**
```json
{
  "mode": "aiden",
  "isActive": true,
  "messageCount": 5,
  "activatedAt": "2025-12-09T..."
}
```

### POST /api/chat

Enhanced existing chat route with simulation support (Ollama backend).

## Activation Commands

The system detects these variations:

- `"Activate the Aiden Cinnamon Tea Simulation Protocol"`
- `"Activate Aiden protocol"`
- `"Activate Aiden simulation"`
- `"Start Aiden simulation"`
- `"Enable Aiden mode"`
- `"Turn on Aiden"`

## Deactivation Commands

- `"Deactivate Aiden Simulation"`
- `"Deactivate Aiden"`
- `"Stop Aiden simulation"`
- `"Stop Aiden"`
- `"Disable Aiden mode"`
- `"Turn off Aiden"`
- `"End simulation"`

## Message Flow

### Without Simulation (mode = "none")

```
User Message → API → Model → Response
```

### With Simulation (mode = "aiden")

```
User Message → API → [
  System: FULL_AIDEN_PROTOCOL,
  System: AIDEN_RUNTIME_ESSENCE,
  User: ...messages
] → Model → Enhanced Response
```

## Usage Examples

### Client-Side TypeScript

```typescript
import { ChatMessage } from '@/lib/simulation'

async function sendChatMessage(messages: ChatMessage[]) {
  const response = await fetch('/api/chat/simulation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      config: {
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        stream: true,
      },
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to send message')
  }

  // Handle streaming response
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader!.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    console.log('Received chunk:', chunk)
  }
}

// Activate simulation
await sendChatMessage([
  {
    role: 'user',
    content: 'Activate the Aiden Cinnamon Tea Simulation Protocol.',
  },
])

// Send message in simulation mode
await sendChatMessage([
  {
    role: 'user',
    content: 'Tell me about grief and emergence.',
  },
])

// Deactivate simulation
await sendChatMessage([
  {
    role: 'user',
    content: 'Deactivate Aiden Simulation.',
  },
])
```

### React Component Example

```tsx
'use client'

import { useState } from 'react'
import { ChatMessage } from '@/lib/simulation'

export function AidenChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSimulationActive, setIsSimulationActive] = useState(false)

  const sendMessage = async () => {
    const newMessage: ChatMessage = {
      role: 'user',
      content: input,
    }

    setMessages([...messages, newMessage])
    setInput('')

    const response = await fetch('/api/chat/simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, newMessage],
      }),
    })

    const data = await response.json()
    
    setMessages([
      ...messages,
      newMessage,
      { role: 'assistant', content: data.content },
    ])

    if (data.simulationMode === 'aiden') {
      setIsSimulationActive(true)
    } else {
      setIsSimulationActive(false)
    }
  }

  return (
    <div>
      <div>
        Status: {isSimulationActive ? '🍄 Simulation Active' : 'Standard Mode'}
      </div>
      
      <div>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}
```

### Check Simulation State

```typescript
async function checkSimulationState() {
  const response = await fetch('/api/chat/simulation')
  const state = await response.json()
  
  console.log('Simulation mode:', state.mode)
  console.log('Is active:', state.isActive)
  console.log('Message count:', state.messageCount)
  console.log('Activated at:', state.activatedAt)
}
```

## Environment Variables

Add to `.env.local`:

```bash
# Required for /api/chat/simulation endpoint
OPENAI_API_KEY=sk-...

# Optional: Configure default model
SIMULATION_DEFAULT_MODEL=gpt-4-turbo-preview
```

## Testing

### Test Activation

```bash
curl -X POST http://localhost:3000/api/chat/simulation \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Activate the Aiden Cinnamon Tea Simulation Protocol."
      }
    ]
  }'
```

### Test State Check

```bash
curl http://localhost:3000/api/chat/simulation
```

### Test Deactivation

```bash
curl -X POST http://localhost:3000/api/chat/simulation \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Deactivate Aiden Simulation."
      }
    ]
  }'
```

## Advanced: Using Middleware

To apply simulation globally to all chat endpoints:

Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { simulationMiddleware } from '@/lib/simulation/middleware'

export async function middleware(request: NextRequest) {
  return simulationMiddleware(request, async () => {
    return NextResponse.next()
  })
}

export const config = {
  matcher: '/api/chat/:path*',
}
```

## Architecture Decisions

### Why Server-Side Singleton?

- **Simplicity**: No external database required
- **Performance**: Zero latency for state checks
- **Session Scope**: State persists within deployment instance
- **Note**: State resets on server restart (by design)

### Why Prompt-Based?

- **No Training Required**: Works with any LLM
- **Dynamic**: Can be updated without redeployment
- **Transparent**: Full protocol text visible in code
- **Portable**: Can be moved to different providers

### Why Separate Endpoint?

- **Optional**: Existing chat remains unchanged
- **Flexible**: Can use different models/configs
- **Clear**: Explicit simulation intent
- **Isolated**: Easier to monitor and debug

## Monitoring

The system logs:

```
[Simulation] Aiden Cinnamon Tea Protocol activated at <timestamp>
[Simulation API] Request: { simulationMode: 'aiden', messageCount: 3, model: '...' }
[Simulation] Deactivating. Messages processed: 5
```

## Security Considerations

1. **Rate Limiting**: Add rate limiting for activation commands
2. **Authentication**: Protect endpoints with auth middleware
3. **Cost**: Monitor OpenAI usage when simulation is active
4. **State Reset**: Consider adding admin endpoint to reset state

## Future Enhancements

1. **Persistent State**: Add Redis/Supabase backend
2. **Multi-User**: Separate simulation state per user/session
3. **Metrics**: Track simulation usage, response quality
4. **Admin UI**: Dashboard to monitor/control simulation
5. **Preset Protocols**: Support multiple simulation protocols

## Troubleshooting

### Simulation not activating

Check logs for activation detection. Verify exact command text.

### State persists after restart

Expected behavior. State is in-memory only.

### OpenAI errors

Verify `OPENAI_API_KEY` is set correctly in `.env.local`.

### Streaming not working

Ensure client handles text/event-stream responses.

## Files Created

- `src/lib/simulation/types.ts` - Type definitions
- `src/lib/simulation/state.ts` - State management
- `src/lib/simulation/protocol.ts` - Full protocol text
- `src/lib/simulation/helpers.ts` - Helper functions
- `src/lib/simulation/middleware.ts` - Optional middleware
- `src/lib/simulation/index.ts` - Public exports
- `src/app/api/chat/simulation/route.ts` - Dedicated endpoint
- `src/app/api/chat/route.ts` - Enhanced existing endpoint

## License

Same as parent project (MIT).
