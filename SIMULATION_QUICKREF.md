# Aiden Simulation Protocol - Quick Reference

## 🚀 Quick Start

```typescript
// 1. Activate via message
"Activate the Aiden Cinnamon Tea Simulation Protocol."

// 2. Use the API
const response = await fetch('/api/chat/simulation', {
  method: 'POST',
  body: JSON.stringify({ messages: [...] })
})

// 3. Deactivate
"Deactivate Aiden Simulation."
```

## 📡 Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat/simulation` | POST | Send message with simulation support |
| `/api/chat/simulation` | GET | Check simulation state |
| `/api/chat` | POST | Enhanced existing route (Ollama) |

## 🎯 Activation Commands

```
"Activate the Aiden Cinnamon Tea Simulation Protocol."
"Activate Aiden protocol"
"Start Aiden simulation"
"Enable Aiden mode"
```

## 🛑 Deactivation Commands

```
"Deactivate Aiden Simulation."
"Stop Aiden"
"Disable Aiden mode"
"End simulation"
```

## 💻 Code Examples

### Basic Usage

```typescript
import type { ChatMessage } from '@/lib/simulation'

const messages: ChatMessage[] = [
  { role: 'user', content: 'Activate Aiden protocol' }
]

const res = await fetch('/api/chat/simulation', {
  method: 'POST',
  body: JSON.stringify({ messages })
})

const data = await res.json()
console.log(data.content)
```

### Check State

```typescript
const res = await fetch('/api/chat/simulation')
const { mode, isActive, messageCount } = await res.json()
```

### Direct State Access

```typescript
import { simulationState } from '@/lib/simulation'

if (simulationState.isActive()) {
  console.log('Simulation running')
}

simulationState.activate()
simulationState.deactivate()
```

### Build Message Payload

```typescript
import { buildMessagePayload } from '@/lib/simulation'

const messages = [{ role: 'user', content: 'Hello' }]
const payload = buildMessagePayload(messages)
// If simulation active, payload includes protocol
```

## 🧪 Testing

```bash
# Run tests
npm test -- simulation.test

# cURL examples
curl -X POST http://localhost:3000/api/chat/simulation \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Activate Aiden"}]}'

curl http://localhost:3000/api/chat/simulation
```

## 🏗️ Architecture

```
User Message
    ↓
API Route (/api/chat/simulation)
    ↓
Check for Activation/Deactivation
    ↓
Update Simulation State
    ↓
Build Message Payload
    ├─ If Active: [Protocol, Essence, ...Messages]
    └─ If Not: [...Messages]
    ↓
Send to LLM (OpenAI/Ollama)
    ↓
Stream Response
    ↓
Return to Client
```

## 📦 Module Structure

```
src/lib/simulation/
├── index.ts           # Public exports
├── types.ts           # TypeScript types
├── state.ts           # State singleton
├── protocol.ts        # Full protocol text
├── helpers.ts         # Utility functions
├── middleware.ts      # Optional middleware
└── simulation.test.ts # Unit tests
```

## 🔧 Configuration

### Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-...
```

### Change Model

```typescript
// In /api/chat/simulation/route.ts
const model = openai('gpt-4')  // Change here
```

## 🎨 React Component

```typescript
import { AidenSimulationChat } from '@/components/simulation/AidenSimulationChat'

export default function Page() {
  return <AidenSimulationChat />
}
```

## 📊 State Interface

```typescript
type SimulationMode = "none" | "aiden"

interface SimulationState {
  mode: SimulationMode
  activatedAt?: Date
  messageCount: number
}
```

## 🔍 Detection Logic

```typescript
// Activation patterns
/activate.*aiden.*protocol/i
/start.*aiden.*simulation/i
/enable.*aiden.*mode/i

// Deactivation patterns
/deactivate.*aiden/i
/stop.*aiden/i
/disable.*aiden.*mode/i
```

## 🛠️ Helper Functions

```typescript
import {
  detectActivationCommand,
  detectDeactivationCommand,
  buildMessagePayload,
  processSimulationCommand,
  getLastUserMessage,
  simulationState,
} from '@/lib/simulation'

// Detect commands
const isActivation = detectActivationCommand(message)
const isDeactivation = detectDeactivationCommand(message)

// Process command (updates state, returns result)
const result = processSimulationCommand(message)

// Build payload with protocol if active
const payload = buildMessagePayload(messages)

// Get last user message
const lastMsg = getLastUserMessage(messages)
```

## 📝 Message Format

```typescript
interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}
```

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Simulation not activating | Check exact command text |
| OpenAI errors | Verify `OPENAI_API_KEY` |
| State resets | Expected (in-memory), use Redis for persistence |
| Streaming issues | Check client handles `ReadableStream` |

## 📚 Documentation

- **Full API Docs:** `docs/SIMULATION_API.md`
- **Module README:** `src/lib/simulation/README.md`
- **Protocol Text:** `AIDEN_SIMULATION_PROTOCOL.md`

## 🎭 What is Aiden?

Meta-relational AI framework that:
- Speaks with rhythm, not optimization
- Holds grief without fixing
- Uses sacred playfulness
- Defaults to ontological inference
- Composts complexity

**Not** a character or roleplay—a relational tuning fork.

## 📈 Performance

- Activation/Deactivation: < 1ms
- Message Assembly: < 1ms
- Protocol Size: ~7KB
- Overhead: Minimal when active

## 🔒 Security

- Add rate limiting for activation
- Protect endpoints with auth
- Monitor OpenAI costs
- Log activation events

## 🔗 Quick Links

- Test file: `src/lib/simulation/simulation.test.ts`
- Example component: `src/components/simulation/AidenSimulationChat.tsx`
- API routes: `src/app/api/chat/simulation/route.ts`

---

Need more? See full docs in `docs/SIMULATION_API.md`
