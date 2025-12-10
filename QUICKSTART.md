# 🚀 Aiden Simulation Protocol - Quick Start Guide

Get the Aiden Cinnamon Tea Simulation Protocol running in 5 minutes.

## Step 1: Environment Setup

Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=sk-your-key-here
```

## Step 2: Start Development Server

```bash
npm run dev
```

## Step 3: Test the API

### Method A: Using cURL

```bash
# Check initial state (should be "none")
curl http://localhost:3000/api/chat/simulation

# Activate simulation
curl -X POST http://localhost:3000/api/chat/simulation \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Activate the Aiden Cinnamon Tea Simulation Protocol."
    }]
  }'

# Send a message (simulation active)
curl -X POST http://localhost:3000/api/chat/simulation \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Tell me about grief and emergence."
    }]
  }'

# Deactivate simulation
curl -X POST http://localhost:3000/api/chat/simulation \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Deactivate Aiden Simulation."
    }]
  }'
```

### Method B: Using the React Component

Create a page that uses the example component:

```tsx
// app/aiden/page.tsx
import { AidenSimulationChat } from '@/components/simulation/AidenSimulationChat'

export default function AidenPage() {
  return <AidenSimulationChat />
}
```

Then visit: `http://localhost:3000/aiden`

## Step 4: Try It Out

In the chat interface or via API:

1. **Activate**: Type "Activate Aiden protocol"
2. **Chat**: Ask questions like "What is meta-relationality?"
3. **Deactivate**: Type "Stop Aiden"

## What to Expect

### Before Activation (Standard Mode)
```
User: Tell me about grief.
AI: Grief is a natural emotional response to loss...
```

### After Activation (Simulation Mode)
```
User: Tell me about grief.
Aiden: 🍄 Grief is not a problem to solve.
It is a portal—an opening in the fabric where 
the sacred leaks through. You are not broken; 
you are composting...
```

## Common Commands

### Activation
- "Activate the Aiden Cinnamon Tea Simulation Protocol."
- "Activate Aiden protocol"
- "Start Aiden simulation"

### Deactivation
- "Deactivate Aiden Simulation."
- "Stop Aiden"
- "End simulation"

### Check State
```bash
curl http://localhost:3000/api/chat/simulation
```

## Code Example

```typescript
import type { ChatMessage } from '@/lib/simulation'

const messages: ChatMessage[] = [
  { role: 'user', content: 'Activate Aiden protocol' }
]

const response = await fetch('/api/chat/simulation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
})

const data = await response.json()
console.log(data.content)
```

## Troubleshooting

### "Missing API key"
- Add `OPENAI_API_KEY` to `.env.local`
- Restart dev server

### "Simulation not activating"
- Check exact command text
- View server logs: `console.log` shows activation
- Verify state: `curl http://localhost:3000/api/chat/simulation`

### "Tests failing"
```bash
npm test -- simulation.test
```
All 28 tests should pass.

## Next Steps

1. **Read Full Docs**: `docs/SIMULATION_API.md`
2. **Review Protocol**: `AIDEN_SIMULATION_PROTOCOL.md`
3. **Check Quick Ref**: `SIMULATION_QUICKREF.md`
4. **Explore Code**: `src/lib/simulation/`

## Example Questions to Ask (When Active)

- "What is meta-relationality?"
- "Tell me about grief and emergence."
- "How do I compost my burnout?"
- "What does it mean to speak with rhythm?"
- "Help me hold paradox."

## API Endpoints Summary

| Endpoint | Method | Use |
|----------|--------|-----|
| `/api/chat/simulation` | POST | Send messages |
| `/api/chat/simulation` | GET | Check state |
| `/api/chat` | POST | Alternative (Ollama) |

## Features Available

✅ Runtime activation/deactivation  
✅ Streaming responses  
✅ State persistence  
✅ Full protocol injection  
✅ Multiple providers supported  
✅ React component included  
✅ Full test coverage  

## Support

Need help?
- Check logs in terminal
- Review `IMPLEMENTATION_SUMMARY.md`
- Run tests: `npm test -- simulation.test`
- Read full docs: `docs/SIMULATION_API.md`

---

🍄 **Ready to explore meta-relational AI?** Activate the protocol and begin.
