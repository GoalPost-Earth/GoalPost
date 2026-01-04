# Integration Guide: Multi-Mode Assistant System

This guide walks you through integrating the new multi-mode assistant system into your chat UI.

## Quick Start (5 minutes)

### 1. Add Mode Selector to Chat UI

In your chat page component:

```tsx
'use client'
import { AssistantModeSelector, AssistantModeIndicator } from '@/components/chat/assistant-mode-selector'
import type { AssistantMode } from '@/lib/simulation'
import { useState } from 'react'

export default function ChatPage() {
  const [mode, setMode] = useState<AssistantMode>('default')

  return (
    <div className="flex flex-col h-screen">
      {/* Header with mode indicator */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1>GoalPost Chat</h1>
        <AssistantModeIndicator mode={mode} />
      </div>

      {/* Mode selector */}
      <div className="p-4 border-b bg-gray-50">
        <AssistantModeSelector
          currentMode={mode}
          onModeChange={setMode}
        />
      </div>

      {/* Chat area - pass mode to message sending */}
      <ChatMessages mode={mode} />
    </div>
  )
}
```

### 2. Pass Mode to API Requests

In your chat message handler:

```tsx
async function sendMessage(text: string) {
  const response = await fetch('/api/chat/simulation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [...messages, { role: 'user', content: text }],
      mode: selectedMode,  // ← Add this
      config: {
        model: 'gpt-4o-mini',
        stream: true
      }
    })
  })

  // Handle streaming response...
}
```

### 3. Done!

The mode selector is now in your UI. Users can switch between modes and get different assistant behaviors.

## Integration Patterns

### Pattern 1: Persistent Mode (Recommended)

Store mode in localStorage so it persists across page reloads:

```tsx
'use client'
import { useState, useEffect } from 'react'
import type { AssistantMode } from '@/lib/simulation'
import { AssistantModeSelector } from '@/components/chat/assistant-mode-selector'

export default function ChatPage() {
  const [mode, setMode] = useState<AssistantMode>('default')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('assistantMode') as AssistantMode
    if (saved && ['default', 'aiden', 'braider'].includes(saved)) {
      setMode(saved)
    }
  }, [])

  // Save to localStorage on change
  const handleModeChange = (newMode: AssistantMode) => {
    setMode(newMode)
    localStorage.setItem('assistantMode', newMode)
  }

  return (
    <AssistantModeSelector
      currentMode={mode}
      onModeChange={handleModeChange}
    />
  )
}
```

### Pattern 2: Context-Aware Mode

Automatically suggest mode based on conversation content:

```tsx
import { AssistantModeSelector } from '@/components/chat/assistant-mode-selector'
import type { AssistantMode } from '@/lib/simulation'
import { useState } from 'react'

function suggestModeForMessage(text: string): AssistantMode {
  const lower = text.toLowerCase()

  // Philosophy/assumption questions → Aiden
  if (lower.match(/why|what if|assume|frame|perspective|what about/)) {
    return 'aiden'
  }

  // Difficulty/grief/burnout → Braider
  if (lower.match(/struggling|overwhelmed|stuck|burnt|painful|grief|loss|collapse/)) {
    return 'braider'
  }

  // Default to standard for lookups
  return 'default'
}

export function ChatWithAutoMode() {
  const [mode, setMode] = useState<AssistantMode>('default')
  const [userText, setUserText] = useState('')

  const handleInputChange = (text: string) => {
    setUserText(text)
    const suggested = suggestModeForMessage(text)
    if (suggested !== mode) {
      // Could auto-switch, or just show suggestion
      console.log(`Suggested mode: ${suggested}`)
    }
  }

  return (
    <>
      <AssistantModeSelector
        currentMode={mode}
        onModeChange={setMode}
      />
      <input
        value={userText}
        onChange={(e) => handleInputChange(e.target.value)}
      />
    </>
  )
}
```

### Pattern 3: Mode with Help Panel

Show help explaining modes right in chat:

```tsx
import { AssistantModeInfo, AssistantModeSelector } from '@/components/chat/assistant-mode-selector'
import type { AssistantMode } from '@/lib/simulation'
import { useState } from 'react'

export function ChatWithHelp() {
  const [mode, setMode] = useState<AssistantMode>('default')
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      <div className="flex justify-between">
        <AssistantModeSelector currentMode={mode} onModeChange={setMode} />
        <button onClick={() => setShowHelp(!showHelp)}>Help</button>
      </div>

      {showHelp && <AssistantModeInfo />}
    </>
  )
}
```

## Advanced: Custom Mode Detection

Automatically detect conversation type and suggest appropriate mode:

```typescript
/**
 * Analyze conversation and suggest best mode
 */
function analyzeConversation(messages: { role: string; content: string }[]): AssistantMode {
  if (messages.length === 0) return 'default'

  // Count keyword patterns
  const text = messages.map(m => m.content).join(' ').toLowerCase()
  
  const patterns = {
    aiden: /\b(why|how|what if|assume|frame|perspective|meaning|assumption|underlying|hidden|implicit)\b/gi,
    braider: /\b(struggling|stuck|overwhelmed|difficulty|grief|loss|burnt|exhausted|collapse|paralysis)\b/gi,
  }

  const aidenMatches = (text.match(patterns.aiden) || []).length
  const braiderMatches = (text.match(patterns.braider) || []).length

  // If conversation has significant difficulty language
  if (braiderMatches > 2) return 'braider'

  // If conversation is exploring assumptions
  if (aidenMatches > 2) return 'aiden'

  // Default to standard
  return 'default'
}

// Usage in component
const suggestedMode = analyzeConversation(messages)
if (suggestedMode !== currentMode) {
  console.log(`Suggested: ${suggestedMode}, Current: ${currentMode}`)
}
```

## Component Props Reference

### AssistantModeSelector

```typescript
interface AssistantModeSelectorProps {
  currentMode?: AssistantMode                // Current selected mode
  onModeChange?: (mode: AssistantMode) => void // Called when mode changes
  disabled?: boolean                        // Disable selector (e.g., during request)
}
```

### AssistantModeIndicator

```typescript
interface AssistantModeIndicatorProps {
  mode?: AssistantMode    // Mode to display (default: 'default')
  showLabel?: boolean     // Show text label (default: true)
}
```

## Styling

All components use shadcn/ui components for styling. They inherit your app's theme automatically.

### Custom Styling Example

```tsx
import { AssistantModeSelector } from '@/components/chat/assistant-mode-selector'

export function CustomStyledSelector() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
      <AssistantModeSelector 
        currentMode={'default'}
        onModeChange={() => {}}
      />
    </div>
  )
}
```

## Testing

### Test Mode Selection Works

```typescript
import { render, screen, userEvent } from '@testing-library/react'
import { AssistantModeSelector } from '@/components/chat/assistant-mode-selector'

test('changing mode calls onModeChange', async () => {
  const onChange = jest.fn()
  render(
    <AssistantModeSelector 
      currentMode="default"
      onModeChange={onChange}
    />
  )

  const select = screen.getByRole('combobox')
  await userEvent.click(select)
  
  const aidenOption = screen.getByText('Aiden')
  await userEvent.click(aidenOption)

  expect(onChange).toHaveBeenCalledWith('aiden')
})
```

### Test Mode is Sent to API

```typescript
test('POST request includes mode parameter', async () => {
  const sendMessage = jest.fn()
  
  // Your chat component with sendMessage logic
  const { getByRole } = render(<YourChatComponent />)

  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve(new Response('ok'))
  )

  // Change mode and send message
  await userEvent.selectOption(screen.getByRole('combobox'), 'aiden')
  await userEvent.click(getByRole('button', { name: /send/i }))

  // Verify mode was sent
  expect(global.fetch).toHaveBeenCalledWith(
    '/api/chat/simulation',
    expect.objectContaining({
      body: expect.stringContaining('"mode":"aiden"')
    })
  )
})
```

## Troubleshooting

### Mode selector doesn't appear
- Check that `select` component is imported from `shadcn/ui`
- Run `npx shadcn@latest add select` if not installed
- Check browser console for component errors

### Mode doesn't change responses
- Verify `mode` is being passed in POST body (not header)
- Check server logs: should see `[AssistantMode] Switched to...`
- Try refreshing page - mode resets to `default` on page load

### Wrong prompt appearing
- Verify you're on latest code with system prompts in separate file
- Check that mode is actually changing (look at AssistantModeIndicator)
- Clear browser cache - may be serving old API

### Styles look wrong
- Make sure shadcn components are installed: `npx shadcn@latest add select`
- Check that Tailwind CSS is configured
- Look for console errors from missing dependencies

## Next Steps

1. **Add to your chat UI** - Follow "Quick Start" above
2. **Test mode switching** - Verify all three modes respond differently
3. **Add to user preferences** - Store mode in user profile (see Production section in ASSISTANT_MODES.md)
4. **Monitor usage** - Track which modes users prefer
5. **Iterate prompts** - Refine system prompts based on user feedback

## API Reference

### Fetch Mode List

```typescript
const response = await fetch('/api/chat/simulation')
const state = await response.json()
// { mode: 'aiden', messageCount: 42, activatedAt: '2026...' }
```

### Set Mode via Query Parameter

```typescript
fetch('/api/chat/simulation?mode=braider')
```

### Full Chat Request with Mode

```typescript
const response = await fetch('/api/chat/simulation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Tell me about Alice' }
    ],
    mode: 'aiden',  // ← The mode
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      stream: true
    }
  })
})
```

## Related Docs

- [ASSISTANT_MODES.md](./ASSISTANT_MODES.md) - Complete mode documentation
- [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - System architecture
- `src/lib/simulation/system-prompts.ts` - System prompt source of truth
