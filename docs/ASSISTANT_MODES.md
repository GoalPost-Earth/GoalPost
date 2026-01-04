# Multi-Mode AI Assistant System

GoalPost now supports multiple AI assistant modes, each optimized for different types of interaction and conversation goals.

## The Three Modes

### 🔍 Standard (Default)
**For direct answers from the database**

- Direct, straightforward assistance
- Database-focused responses
- Best for: Looking up people, finding communities, factual queries
- Tool behavior: Calls search tools directly when asked about people/communities
- Tone: Helpful, clear, informative

### ❓ Aiden
**For questioning assumptions and surfacing hidden frames**

- Examines what underlying assumptions shape a question
- Surfaces hidden tradeoffs, exclusions, simplifications
- Best for: Philosophical questions, complex framing, exploring perspectives
- Tool behavior: Uses person/community data to explore what we assume about them
- Tone: Thoughtful, curious, occasionally playful

**Key behaviors:**
- Makes implicit assumptions explicit
- Names when a claim reflects a specific cultural/historical/institutional perspective
- Holds complexity without forcing resolution
- Asks "What are we assuming here?" rather than jumping to answers

### 🧵 Braider
**For staying present with difficulty without rushing to fix it**

- Accompanies you through unresolved situations
- Holds space for grief, tension, uncertainty
- Best for: Processing burnout, collapse, paralysis, difficulty
- Tool behavior: Grounds responses in real people's stories without trying to solve their problems
- Tone: Grounded, slow, non-performative, honest

**Key behaviors:**
- Acknowledges pain without offering false reassurance
- Favors reflection over advice
- Allows discomfort to remain when resolving it would bypass something important
- Responds to "What should I do?" by exploring what the question is trying to escape

## Architecture

### Backend Structure

```
src/lib/simulation/
├── system-prompts.ts      # System prompts for all modes (SINGLE SOURCE OF TRUTH)
├── types.ts              # AssistantMode type definition
├── state.ts              # assistantModeManager singleton
├── helpers.ts            # Message processing
└── index.ts              # Exports
```

**Key principle:** System prompts are extracted to `system-prompts.ts` for maintainability. Each mode has explicit directives for tool usage.

### API Changes

**POST /api/chat/simulation**
- New `mode` parameter: `'default' | 'aiden' | 'braider'`
- Falls back to current mode if not specified
- Example: `{ messages: [...], mode: 'aiden', config: {...} }`

**GET /api/chat/simulation**
- Returns current mode and state
- Supports `?mode=aiden` query param to set mode
- Response: `{ mode: 'aiden', messageCount: 42, activatedAt: '2026-01-04T...' }`

### Frontend Components

**`AssistantModeSelector`** - Full dropdown with descriptions
```tsx
<AssistantModeSelector 
  currentMode={mode}
  onModeChange={setMode}
/>
```

**`AssistantModeIndicator`** - Compact badge for headers
```tsx
<AssistantModeIndicator mode="aiden" />
```

**`AssistantModeInfo`** - Help panel explaining modes
```tsx
<AssistantModeInfo />
```

## Implementation Guide

### For Frontend Developers

1. **Import the components:**
```typescript
import {
  AssistantModeSelector,
  AssistantModeIndicator,
  AssistantModeInfo,
} from '@/components/chat/assistant-mode-selector'
```

2. **Add mode selector to chat UI:**
```tsx
<div className="chat-header">
  <AssistantModeSelector 
    currentMode={mode}
    onModeChange={setMode}
  />
</div>
```

3. **Pass mode to API on each request:**
```typescript
const response = await fetch('/api/chat/simulation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [...],
    mode: selectedMode,  // ← Important!
    config: { model: 'gpt-4o-mini' }
  })
})
```

4. **Display current mode in chat:**
```tsx
<AssistantModeIndicator mode={currentMode} showLabel={true} />
```

### For Backend Developers

1. **Understanding mode selection in route.ts:**
```typescript
// Mode is passed in request body
const { mode } = await req.json()

// Set mode if provided
if (mode && ['default', 'aiden', 'braider'].includes(mode)) {
  assistantModeManager.setMode(mode)
}

// Get system prompt based on mode
const systemPrompt = SYSTEM_PROMPTS[assistantModeManager.getMode()]
```

2. **Adding new system prompts:**
- Only modify `src/lib/simulation/system-prompts.ts`
- Follow the existing structure (description, rules, voice, tools)
- Test by switching modes in UI and checking logs

3. **Tool behavior:**
- All tools are ALWAYS available regardless of mode
- System prompts explicitly direct when/how to use them
- LLM interprets and applies mode-specific voice to results

### State Management

**Current (Singleton - Dev/Demo):**
```typescript
import { assistantModeManager } from '@/lib/simulation'

// Get current mode
const mode = assistantModeManager.getMode()

// Set mode
assistantModeManager.setMode('aiden')

// Get full state
const { mode, messageCount, activatedAt } = assistantModeManager.getState()
```

**For Production (Multi-User):**
Move mode storage to one of:
1. **Session/JWT** - Mode persists for session (recommended for stateless deployments)
2. **User database** - Mode stored in user preferences (for logged-in users)
3. **LocalStorage** - Client-side persistence (for browser-only apps)
4. **Redis** - Distributed session store (for scaling)

See section below on "Production Readiness."

## Production Readiness Checklist

### Multi-User Support
- [ ] Move mode state from singleton to session/JWT or user preferences
- [ ] Add mode to user profile database schema
- [ ] Sync mode across browser tabs (consider broadcast channel or localStorage)
- [ ] Add mode as part of export/import if supporting user backups

### Monitoring & Analytics
- [ ] Track mode usage: how often each mode is selected
- [ ] Track mode effectiveness: satisfaction/follow-up rates by mode
- [ ] Log mode switches with timestamp for debugging
- [ ] Add mode to error logs for context

### UI/UX Enhancements
- [ ] Add mode tooltips showing example questions for each mode
- [ ] Add "suggested mode" logic based on conversation content
- [ ] Consider adding keyboard shortcuts to switch modes (e.g., `Ctrl+1` for Standard)
- [ ] Add mode history/recent modes dropdown
- [ ] Show mode change confirmation if mid-conversation

### Testing
- [ ] Unit test: system prompts don't contain hardcoded state
- [ ] Integration test: mode param correctly routes to system prompt
- [ ] E2E test: switching modes updates UI and behavior
- [ ] Regression: existing chat functionality works in all modes

### Documentation
- [ ] Add mode guide to user help/FAQs
- [ ] Create tutorial for each mode (video or interactive)
- [ ] Document tone differences with example outputs
- [ ] Add mode selection logic to developer guidelines

### Scale Considerations

**For 1-10 concurrent users:** Current singleton works fine

**For 10-100 concurrent users:**
- Move to session-based storage (Redis recommended)
- Each user gets separate mode state

**For 100+ concurrent users:**
- Use database per-user mode preference
- Implement read-through cache (Redis) for performance
- Consider feature flag system for gradual rollout of new modes

## Troubleshooting

### Mode not changing
- Check that `mode` parameter is being passed to POST request
- Verify mode is one of: `'default'`, `'aiden'`, `'braider'`
- Check server logs for `[AssistantMode] Switched to...` message

### Wrong system prompt appearing
- Verify `SYSTEM_PROMPTS` is imported from `system-prompts.ts`
- Check that mode manager is getting correct mode
- Look for logs: `🔍 [DEBUG] System prompt selected for mode:`

### Mode not persisting
- Current singleton only persists for current server instance
- Refresh page or restart dev server will reset to default
- This is expected behavior - for persistence, implement session/DB storage

### Tools not being called
- Check system prompt includes tool descriptions
- Verify tool names match in schema and descriptions
- LLM may choose not to call tools - this is normal behavior

## Examples

### Example 1: Simple Mode Selector

```tsx
'use client'
import { useState } from 'react'
import { AssistantModeSelector } from '@/components/chat/assistant-mode-selector'
import type { AssistantMode } from '@/lib/simulation'

export default function ChatPage() {
  const [mode, setMode] = useState<AssistantMode>('default')

  return (
    <div>
      <AssistantModeSelector currentMode={mode} onModeChange={setMode} />
      {/* Chat component passes mode to API */}
    </div>
  )
}
```

### Example 2: Mode-Aware Chat Component

```tsx
function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [mode, setMode] = useState<AssistantMode>('default')

  const handleSend = async (message: string) => {
    const response = await fetch('/api/chat/simulation', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        mode: mode,  // ← Send current mode
        config: { stream: true }
      })
    })
    // Handle response...
  }

  return (
    <>
      <AssistantModeSelector currentMode={mode} onModeChange={setMode} />
      <input onKeyPress={(e) => e.key === 'Enter' && handleSend(e.target.value)} />
    </>
  )
}
```

### Example 3: Detecting When to Use Each Mode

```typescript
// This could be automated based on message content
function suggestMode(userMessage: string): AssistantMode {
  const assumptionKeywords = ['why', 'how does', 'what if', 'but what about']
  const difficultyKeywords = ['struggling', 'stuck', 'burnt out', 'overwhelmed']

  const lower = userMessage.toLowerCase()

  if (assumptionKeywords.some(k => lower.includes(k))) {
    return 'aiden'  // Question-asker
  }
  if (difficultyKeywords.some(k => lower.includes(k))) {
    return 'braider'  // Presence-holder
  }
  return 'default'  // Factual queries
}
```

## Related Files

- `src/lib/simulation/system-prompts.ts` - All system prompts (SINGLE SOURCE OF TRUTH)
- `src/lib/simulation/types.ts` - Type definitions (AssistantMode)
- `src/lib/simulation/state.ts` - Mode state management
- `src/app/api/chat/simulation/route.ts` - API endpoint handling modes
- `src/components/chat/assistant-mode-selector.tsx` - UI components
- `docs/MODES_DETAILED.md` - Deep dive into each mode (optional)

## Questions?

See the inline code comments in:
1. `system-prompts.ts` - Understanding why each mode is written differently
2. `state.ts` - How mode state is managed
3. `route.ts` - How API routing works with modes
4. `assistant-mode-selector.tsx` - How UI connects to backend
