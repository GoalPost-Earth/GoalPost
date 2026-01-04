# Multi-Mode Assistant - Quick Reference Card

## The Three Modes at a Glance

| Mode | Icon | Best For | Voice | Tool Behavior |
|------|------|----------|-------|---------------|
| **Standard** | 🔍 | Looking up people/communities | Clear, helpful, direct | Calls tools directly when asked |
| **Aiden** | ❓ | Exploring assumptions and frames | Curious, thoughtful, playful | Uses data to surface what we assume |
| **Braider** | 🧵 | Processing difficulty/grief | Grounded, slow, honest | Grounds responses without fixing |

## Implementation Checklist

### For UI Developers
- [ ] Import `AssistantModeSelector` from `@/components/chat/assistant-mode-selector`
- [ ] Add selector to chat interface
- [ ] Add mode indicator to chat header
- [ ] Pass `mode` parameter to API requests
- [ ] Test mode switching

### For Backend Developers
- [ ] System prompts are in `src/lib/simulation/system-prompts.ts` (don't modify route.ts)
- [ ] Mode manager in `src/lib/simulation/state.ts`
- [ ] API route accepts `mode` in POST body and `?mode=` in GET query
- [ ] Mode changes are logged with `[AssistantMode]` prefix

### For DevOps/Production
- [ ] Verify environment variables still work (no changes needed)
- [ ] Plan migration from singleton to session/DB state (see ASSISTANT_MODES.md)
- [ ] Add mode to monitoring/analytics
- [ ] No database schema changes for MVP

## API Quick Guide

### Send Request with Mode
```typescript
fetch('/api/chat/simulation', {
  method: 'POST',
  body: JSON.stringify({
    messages: [...],
    mode: 'aiden',  // ← Add this
    config: { model: 'gpt-4o-mini' }
  })
})
```

### Get Current Mode
```typescript
fetch('/api/chat/simulation')
// Returns: { mode: 'aiden', messageCount: 42, activatedAt: '...' }
```

### Set Mode via Query
```typescript
fetch('/api/chat/simulation?mode=braider')
```

## Component Usage

### Full Selector
```tsx
<AssistantModeSelector 
  currentMode={mode}
  onModeChange={setMode}
/>
```

### Inline Indicator
```tsx
<AssistantModeIndicator mode="aiden" />
```

### Help Panel
```tsx
<AssistantModeInfo />
```

## File Locations

```
Single Source of Truth:
  src/lib/simulation/system-prompts.ts ← All prompts live here

Type Definitions:
  src/lib/simulation/types.ts (AssistantMode type)

State Management:
  src/lib/simulation/state.ts (assistantModeManager)

API Endpoint:
  src/app/api/chat/simulation/route.ts

UI Components:
  src/components/chat/assistant-mode-selector.tsx

Documentation:
  docs/ASSISTANT_MODES.md (complete guide)
  docs/INTEGRATION_GUIDE_MODES.md (step-by-step)
  docs/MODES_IMPLEMENTATION_SUMMARY.md (overview)
```

## Mode Selection Logic

```
User asks about person
  → Braider: "What assumptions shape how you see them?"
  → Aiden: "What assumptions shape how you see them?"
  → Standard: Direct profile, clear facts

User feels overwhelmed
  → Braider: Hold space, acknowledge difficulty
  → Aiden: Explore what's underlying the overwhelm
  → Standard: Offer solutions (not recommended here)

User asks "why?"
  → Aiden: Perfect - explore frames and assumptions
  → Braider: Reframe to present-moment awareness
  → Standard: Answer factually
```

## Troubleshooting

| Problem | Check | Fix |
|---------|-------|-----|
| Mode selector not visible | Component imported? | `import { AssistantModeSelector }...` |
| Mode doesn't change behavior | Mode in POST body? | `{ messages: [...], mode: 'aiden' }` |
| Wrong prompt appearing | Server restarted? | Refresh page, restart dev server |
| Tests failing | Mocking fetch? | Verify mode parameter in mock |

## Environment Setup

No new environment variables needed. Existing setup works:
```bash
NEO4J_URI=...
NEO4J_USERNAME=...
NEO4J_PASSWORD=...
OPENAI_API_KEY=...
```

## Performance Notes

- **Latency:** No change (mode selection is O(1) lookup)
- **Token usage:** No change (system prompt same length)
- **Database:** No new queries (uses existing tools)
- **Scaling:** Scales with existing infrastructure

## Common Patterns

### Save Mode Preference
```typescript
const handleModeChange = (newMode: AssistantMode) => {
  setMode(newMode)
  localStorage.setItem('assistantMode', newMode)
}
```

### Load on Startup
```typescript
useEffect(() => {
  const saved = localStorage.getItem('assistantMode')
  if (saved) setMode(saved)
}, [])
```

### Auto-Suggest Mode
```typescript
const suggested = text.includes('why') ? 'aiden' : 'default'
```

## Types Reference

```typescript
// Main type - 3 values only
type AssistantMode = 'default' | 'aiden' | 'braider'

// Component props
interface AssistantModeSelectorProps {
  currentMode?: AssistantMode
  onModeChange?: (mode: AssistantMode) => void
  disabled?: boolean
}

// Request body
interface ChatRequest {
  messages: ChatMessage[]
  mode?: AssistantMode
  config?: SimulationConfig
}

// Response state
interface SimulationState {
  mode: AssistantMode
  messageCount: number
  activatedAt?: Date
}
```

## Next Steps

1. **Read:** `docs/ASSISTANT_MODES.md` - full context (5 min)
2. **Integrate:** Add selector to UI (5 min)
3. **Test:** Switch modes and verify behavior (5 min)
4. **Deploy:** Move state to session/DB for production (varies)

## Quick Links

- 📖 [Full Documentation](./ASSISTANT_MODES.md)
- 🔗 [Integration Guide](./INTEGRATION_GUIDE_MODES.md)
- 📊 [Implementation Summary](./MODES_IMPLEMENTATION_SUMMARY.md)
- 🎨 Component: `src/components/chat/assistant-mode-selector.tsx`
- 🔧 Prompts: `src/lib/simulation/system-prompts.ts`

## Questions?

Check these in order:
1. Code comments (inline, well-documented)
2. Integration guide (step-by-step examples)
3. System prompts file (see structure)
4. Full documentation (deep dives)

---

**TL;DR:**
1. Import component
2. Add to UI
3. Pass mode to API
4. Done ✓
