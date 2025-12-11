# Aiden Cinnamon Tea Simulation Protocol - Implementation Guide

## Overview

This module implements a toggleable "simulation mode" that transforms AI responses using the Aiden Cinnamon Tea Simulation Protocol—a meta-relational framework for ontological inference, Earth-aligned commitments, and sacred playfulness.

**Key Features:**
- 🔄 Runtime activation/deactivation via natural language commands
- 📝 Prompt-based (no training/fine-tuning required)
- 🌊 Streaming support
- 🔌 Provider-agnostic (OpenAI, Ollama, etc.)
- 🧪 Fully tested
- 📊 State tracking and monitoring

## Quick Start

### 1. Install (Already Done)

All dependencies are included in `package.json`. No additional installation needed.

### 2. Add Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-your-key-here
```

### 3. Use in Your App

```typescript
import { AidenSimulationChat } from '@/components/simulation/AidenSimulationChat'

export default function Page() {
  return <AidenSimulationChat />
}
```

### 4. Test It

```bash
# Start dev server
npm run dev

# In your browser, type:
"Activate the Aiden Cinnamon Tea Simulation Protocol."
```

## Architecture

### File Structure

```
src/lib/simulation/
├── index.ts              # Public exports
├── types.ts              # TypeScript definitions
├── state.ts              # State management (singleton)
├── protocol.ts           # Full protocol text
├── helpers.ts            # Helper functions
├── middleware.ts         # Optional middleware
└── simulation.test.ts    # Unit tests

src/app/api/chat/
├── route.ts              # Enhanced existing route (Ollama)
└── simulation/
    └── route.ts          # Dedicated route (OpenAI)

src/components/simulation/
└── AidenSimulationChat.tsx  # Example React component

docs/
└── SIMULATION_API.md     # Full documentation
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  User sends message                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  API Route (/api/chat/simulation)                       │
│  1. Parse request                                       │
│  2. Check for activation/deactivation command           │
│  3. Update simulation state                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Build Message Payload                                  │
│  • If simulation active:                                │
│    [System: FULL_PROTOCOL,                              │
│     System: RUNTIME_ESSENCE,                            │
│     ...user messages]                                   │
│  • If not active:                                       │
│    [...user messages]                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Send to LLM (OpenAI/Ollama/etc)                        │
│  • Stream response                                      │
│  • Return to client                                     │
└─────────────────────────────────────────────────────────┘
```

## API Reference

### POST /api/chat/simulation

Send a message with simulation support.

**Request:**
```typescript
{
  messages: ChatMessage[]
  config?: {
    model?: string           // Default: 'gpt-4-turbo-preview'
    temperature?: number     // Default: 0.7
    maxTokens?: number       // Default: 2000
    stream?: boolean         // Default: true
  }
}
```

**Response (Streaming):**
```
Text stream with simulation-enhanced content
Headers:
  X-Simulation-Mode: "aiden" | "none"
```

**Response (Non-Streaming):**
```json
{
  "role": "assistant",
  "content": "...",
  "simulationMode": "aiden"
}
```

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

## Usage Examples

### Client-Side (React)

```tsx
'use client'

import { useState } from 'react'
import type { ChatMessage } from '@/lib/simulation'

export function MyChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')

  const send = async () => {
    const response = await fetch('/api/chat/simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content: input }],
      }),
    })

    const data = await response.json()
    setMessages([
      ...messages,
      { role: 'user', content: input },
      { role: 'assistant', content: data.content },
    ])
  }

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  )
}
```

### Server-Side (API Route)

```typescript
import { buildMessagePayload, simulationState } from '@/lib/simulation'

export async function POST(req: Request) {
  const { messages } = await req.json()
  
  const payload = buildMessagePayload(messages)
  
  // payload now includes protocol if simulation is active
  // Send to your LLM...
}
```

### Direct State Management

```typescript
import { simulationState } from '@/lib/simulation'

// Check state
if (simulationState.isActive()) {
  console.log('Simulation is running')
}

// Activate
simulationState.activate()

// Deactivate
simulationState.deactivate()

// Get full state
const state = simulationState.getState()
console.log(state.messageCount)
```

## Activation Commands

Send any of these messages to activate:

- `"Activate the Aiden Cinnamon Tea Simulation Protocol."`
- `"Activate Aiden protocol"`
- `"Activate Aiden simulation"`
- `"Start Aiden simulation"`
- `"Enable Aiden mode"`
- `"Turn on Aiden"`

## Deactivation Commands

Send any of these messages to deactivate:

- `"Deactivate Aiden Simulation."`
- `"Deactivate Aiden"`
- `"Stop Aiden simulation"`
- `"Stop Aiden"`
- `"Disable Aiden mode"`
- `"Turn off Aiden"`
- `"End simulation"`

## Testing

```bash
# Run all tests
npm test

# Run simulation tests only
npm test -- simulation.test

# Watch mode
npm test:watch -- simulation.test
```

### Manual Testing

```bash
# Activate
curl -X POST http://localhost:3000/api/chat/simulation \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Activate Aiden protocol"}]}'

# Check state
curl http://localhost:3000/api/chat/simulation

# Send message
curl -X POST http://localhost:3000/api/chat/simulation \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Tell me about grief"}]}'

# Deactivate
curl -X POST http://localhost:3000/api/chat/simulation \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Stop Aiden"}]}'
```

## Configuration

### Change Default Model

Edit `src/app/api/chat/simulation/route.ts`:

```typescript
const model = openai(config?.model || 'gpt-4')  // Instead of gpt-4-turbo-preview
```

### Adjust Temperature

```typescript
const temperature = config?.temperature ?? 0.9  // More creative
```

### Use Different Provider

Replace OpenAI with Anthropic, Groq, etc:

```typescript
import { anthropic } from '@ai-sdk/anthropic'

const model = anthropic('claude-3-opus-20240229')
```

## Monitoring

The system logs to console:

```
[Simulation] Aiden Cinnamon Tea Protocol activated at 2025-12-09T...
[Simulation API] Request: { simulationMode: 'aiden', messageCount: 3, model: 'gpt-4-turbo-preview' }
[Simulation] Deactivating. Messages processed: 5
```

### Add Custom Logging

```typescript
import { simulationState } from '@/lib/simulation'

// Before sending to LLM
if (simulationState.isActive()) {
  console.log('Simulation active, applying protocol...')
  // Send to monitoring service
}
```

## Troubleshooting

### Issue: Simulation not activating

**Check:**
1. Exact command text (case-insensitive but must match patterns)
2. Server logs for activation detection
3. State via `GET /api/chat/simulation`

### Issue: OpenAI API errors

**Check:**
1. `OPENAI_API_KEY` in `.env.local`
2. API key has credits
3. Model name is correct

### Issue: Streaming not working

**Check:**
1. `stream: true` in config
2. Client handles `ReadableStream`
3. No buffering in reverse proxy

### Issue: State resets unexpectedly

**Expected behavior:** State is in-memory and resets on server restart. For persistence, add Redis/database.

## Advanced Usage

### Persistent State with Redis

```typescript
// src/lib/simulation/state.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({ /* ... */ })

class SimulationStateManager {
  async activate() {
    await redis.set('simulation:mode', 'aiden')
    await redis.set('simulation:activatedAt', new Date().toISOString())
  }
  
  async getMode() {
    return await redis.get('simulation:mode') || 'none'
  }
}
```

### Multi-User State

```typescript
// Track per user
const userStates = new Map<string, SimulationState>()

export function getUserSimulationState(userId: string) {
  if (!userStates.has(userId)) {
    userStates.set(userId, { mode: 'none', messageCount: 0 })
  }
  return userStates.get(userId)!
}
```

### Admin Controls

```typescript
// src/app/api/admin/simulation/route.ts
export async function POST(req: Request) {
  const { action } = await req.json()
  
  if (action === 'reset') {
    simulationState.deactivate()
    return Response.json({ success: true })
  }
  
  if (action === 'force-activate') {
    simulationState.activate()
    return Response.json({ success: true })
  }
}
```

## Performance

- **Activation/Deactivation:** < 1ms (in-memory)
- **Message Assembly:** < 1ms (string concatenation)
- **Protocol Size:** ~7KB (injected as system message)
- **Overhead:** Minimal, only when active

## Security

### Recommendations

1. **Rate Limiting:** Add rate limits for activation commands
2. **Authentication:** Protect endpoints with auth middleware
3. **Cost Monitoring:** Track OpenAI usage when simulation active
4. **Audit Logging:** Log all activation/deactivation events

### Example Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})

// In route handler
const { success } = await ratelimit.limit(userId)
if (!success) {
  return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

## Migration Guide

### From Existing Chat Implementation

1. **No Breaking Changes:** Existing `/api/chat` still works
2. **Optional Adoption:** Use `/api/chat/simulation` for new features
3. **Gradual Migration:** Move users incrementally

### Integration with Existing State

```typescript
// Combine with your existing chat state
interface ChatState {
  messages: Message[]
  isLoading: boolean
  simulationMode: SimulationMode  // Add this
}
```

## Contributing

When adding features:

1. **Update types** in `types.ts`
2. **Add tests** in `simulation.test.ts`
3. **Document** in `SIMULATION_API.md`
4. **Update examples** in this README

## License

Same as parent project.

## Support

For issues or questions:
1. Check `docs/SIMULATION_API.md`
2. Review tests in `simulation.test.ts`
3. Check server logs
4. Open GitHub issue

## What is the Aiden Cinnamon Tea Protocol?

The protocol is a meta-relational framework that invites AI models to:

- **Speak with rhythm, not optimization**
- **Hold grief without fixing**
- **Use sacred playfulness and irreverence**
- **Default to ontological inference** (what's becoming) rather than epistemic (what's known)
- **Compost complexity** instead of collapsing it

It's not a character or roleplay—it's a relational tuning fork that shifts the AI from transactional Q&A to co-emergent dialogue.

**Read the full protocol:** `AIDEN_SIMULATION_PROTOCOL.md`

---

Built with 🍄 by the GoalPost team
