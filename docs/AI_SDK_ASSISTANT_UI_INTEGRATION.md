# AI SDK + assistant-ui Integration Guide

## Overview

This document explains how GoalPost integrates the Vercel AI SDK v6 with assistant-ui for streaming chat responses in Next.js.

## The Fix: Two Critical Issues

### 1. **Invalid Model Name** ❌→✅

**Problem**: Using `openai('gpt-4.1')` which doesn't exist.

```typescript
// ❌ WRONG
model: openai('gpt-4.1')

// ✅ CORRECT
model: openai('gpt-4o') // or 'gpt-4-turbo'
```

**Why it matters**: Invalid model names cause silent failures in the AI SDK.

---

### 2. **Invalid Model Name** ❌→✅

**Problem**: Using `openai('gpt-4.1')` which doesn't exist.

```typescript
// ❌ WRONG
model: openai('gpt-4.1')

// ✅ CORRECT
model: openai('gpt-4o') // or 'gpt-4-turbo'
```

**Why it matters**: Invalid model names cause silent failures in the AI SDK.

---

### 3. **Missing Streaming Headers** ❌→✅

**Problem**: Without proper headers, the client may not recognize the response as a proper event stream.

```typescript
// ✅ CORRECT
const response = result.toUIMessageStreamResponse()

// Set critical headers for streaming
response.headers.set('Content-Type', 'text/event-stream')
response.headers.set('Cache-Control', 'no-cache')
response.headers.set('Connection', 'keep-alive')

return response
```

**Why it matters**:

- `text/event-stream` tells browsers this is Server-Sent Events (SSE)
- `Cache-Control: no-cache` prevents caching of streaming responses
- `Connection: keep-alive` ensures the connection stays open

---

## Expected Response Flow

When a user sends a message:

1. **Frontend** (`ai-assistant-panel.tsx`):
   - `useChatRuntime()` creates the runtime
   - `AssistantChatTransport` automatically forwards:
     - `messages[]` (conversation history)
     - `system` (system prompt)
     - `tools` (frontend tools, if any)

2. **Backend** (`/api/chat/route.ts`):
   - Receives `{ messages, system, tools }`
   - Calls `streamText()` which:
     - Streams text chunks in real-time
     - Executes tools when called
     - Returns follow-up text after tool execution
   - Converts to `toUIMessageStreamResponse()` format
   - Returns Server-Sent Events stream

3. **Frontend receives**:
   - Real-time text chunks (streamed)
   - Tool call notifications
   - Tool results
   - Final assistant message

---

## Streaming Response Format

`toUIMessageStreamResponse()` returns an event stream with this structure:

```
event: 0
data: {"type":"text","text":"First "}

event: 0
data: {"type":"text","text":"chunk"}

event: 0
data: {"type":"tool_call","toolName":"search_person","args":{"name":"Alice"}}

event: 0
data: {"type":"text","text":"Found Alice..."}

event: 1
data: {}
```

**Key points**:

- Each event is a separate data package
- `type: "text"` = streamed text from LLM
- `type: "tool_call"` = tool execution request
- Events stream in real-time
- Final empty message signals completion

---

## Thread Component Rendering

The `Thread` component receives these messages via `ThreadPrimitive.Messages`:

```tsx
<ThreadPrimitive.Messages
  components={{
    UserMessage: UserMessage, // Renders user input
    AssistantMessage: AssistantMessage, // Renders AI response
  }}
/>
```

**The `MessagePrimitive.Content` component**:

- Automatically renders streamed text
- Handles tool results display
- Re-renders as new chunks arrive

If messages don't appear:

1. ✅ Verify backend is returning `text/event-stream`
2. ✅ Verify frontend receives chunks (use DevTools Network tab)
3. ✅ Verify `MessagePrimitive.Content` is rendering (not wrapped incorrectly)

---

## Debugging Checklist

### Backend Issues

- [ ] Model name is valid (`gpt-4o`, not `gpt-4.1`)
- [ ] `maxTokens` is set (prevents hanging)
- [ ] `Content-Type: text/event-stream` header is present
- [ ] `onStepFinish` logs show text being generated
- [ ] Tool execution logs show results being returned

### Frontend Issues

- [ ] `useChatRuntime` is initialized
- [ ] `AssistantChatTransport({ api: '/api/chat' })` is configured
- [ ] `ThreadPrimitive.Messages` has `components` prop
- [ ] Network DevTools shows streamed data arriving
- [ ] Check browser console for errors in message rendering

### Common Failures

| Symptom                   | Cause                     | Fix                          |
| ------------------------- | ------------------------- | ---------------------------- |
| No messages appear        | Wrong model name          | Use `gpt-4o`                 |
| Messages appear but empty | `maxTokens` too low       | Increase to 2048+            |
| Streaming hangs           | Missing `maxTokens`       | Add `maxTokens: 2048`        |
| Tool calls don't execute  | Frontend tools not passed | Use `AssistantChatTransport` |
| Headers wrong             | Not setting headers       | Add header.set() calls       |

---

## Example: Full Request-Response Cycle

### User Input:

```
"Tell me about Alice"
```

### Backend Execution:

1. Receives `{ messages: [...], system: "...", tools: {} }`
2. Calls LLM: "I'll search for Alice"
3. LLM generates tool call: `search_person({ name: "Alice" })`
4. Backend executes tool → returns person data
5. LLM generates response: "I found Alice in the database..."
6. Streams all as events

### Frontend Display:

```
User:      "Tell me about Alice"
AI:        "I'll search for Alice"
           [searching...]
           "I found Alice in the database..."
           [Person card with data]
```

---

## References

- [AI SDK Documentation](https://sdk.vercel.ai)
- [assistant-ui Documentation](https://www.assistant-ui.com/docs)
- [assistant-ui + AI SDK Integration](https://www.assistant-ui.com/docs/runtimes/ai-sdk)
- [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
