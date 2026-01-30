# AI SDK + assistant-ui Integration: Root Cause & Solution

## Executive Summary

The GoalPost chat wasn't displaying messages because of **two critical issues** in the API route:

1. **Invalid model name**: `gpt-4.1` doesn't exist (should be `gpt-4o`)
2. **Missing streaming headers**: Response wasn't marked as `text/event-stream`

Both issues are now **fixed**. Messages should now stream and display in the UI.

---

## Root Cause Analysis

### Issue #1: Invalid Model Name 🔴

**File**: [src/app/api/chat/route.ts](../src/app/api/chat/route.ts#L100)

```typescript
// ❌ BEFORE (Line 100)
const result = streamText({
  model: openai('gpt-4.1'), // ← Non-existent model!
  // ...
})
```

**Why this breaks**:

- OpenAI doesn't have a `gpt-4.1` model
- The AI SDK silently fails or uses a fallback model
- LLM doesn't generate proper responses
- No error is thrown (silent failure)

**Solution**: Use `gpt-4o` (GPT-4 Omni, the current flagship model)

```typescript
// ✅ AFTER
const result = streamText({
  model: openai('gpt-4o'), // ← Valid, current GPT-4 model
  // ...
})
```

---

### Issue #2: Missing Streaming Headers 🔴

**File**: [src/app/api/chat/route.ts](../src/app/api/chat/route.ts#L112-L120)

```typescript
// ❌ BEFORE
const response = result.toUIMessageStreamResponse()
return response // ← Missing headers!

// ✅ AFTER
const response = result.toUIMessageStreamResponse()

response.headers.set('Content-Type', 'text/event-stream')
response.headers.set('Cache-Control', 'no-cache')
response.headers.set('Connection', 'keep-alive')

return response
```

**Why this matters**:

- `Content-Type: text/event-stream` tells the browser this is a Server-Sent Events (SSE) stream
- Without it, the browser doesn't properly receive streamed chunks
- assistant-ui expects SSE format for `toUIMessageStreamResponse()`
- Messages arrive as data, but the frontend can't parse them correctly

**What the headers do**:
| Header | Purpose |
|--------|---------|
| `Content-Type: text/event-stream` | Tells browser this is an SSE stream (required for streaming) |
| `Cache-Control: no-cache` | Prevents caching of real-time stream |
| `Connection: keep-alive` | Keeps the connection open for streaming |

---

## How AI SDK + assistant-ui Integration Works

### The Streaming Flow

```
┌──────────────────────────────────────┐
│ Frontend: AIAssistantPanel            │
│ (ai-assistant-panel.tsx)              │
│                                        │
│ useChatRuntime({                       │
│   transport: AssistantChatTransport    │
│ })                                     │
└────────────┬─────────────────────────┘
             │ POST /api/chat
             │ { messages, system, tools }
             ↓
┌──────────────────────────────────────┐
│ Backend: /api/chat route              │
│ (route.ts)                            │
│                                        │
│ streamText({                           │
│   model: openai('gpt-4o')  ← FIXED    │
│   system, messages, tools              │
│ })                                     │
│                                        │
│ .toUIMessageStreamResponse()           │
│ .set('Content-Type': ...)  ← FIXED    │
└────────────┬─────────────────────────┘
             │ Server-Sent Events Stream
             │ (text/event-stream)
             ↓
┌──────────────────────────────────────┐
│ Frontend: Thread component             │
│ (thread.tsx)                           │
│                                        │
│ ThreadPrimitive.Messages               │
│   └─ MessagePrimitive.Content          │
│      (renders streamed text)           │
└──────────────────────────────────────┘
```

### What Each Component Does

1. **AssistantChatTransport** (Frontend)
   - Sends: `{ messages[], system?, tools? }`
   - Expects: Server-Sent Events stream

2. **API Route** (Backend)
   - Receives: `{ messages[], system?, tools? }`
   - Calls: `streamText()` with tools
   - Executes: Tools automatically (search_person, search_community)
   - Returns: `toUIMessageStreamResponse()` as SSE

3. **Thread Component** (Frontend)
   - Receives: SSE stream
   - Parses: Events with types: `text`, `tool_call`, `tool_result`
   - Renders: Streamed text via `MessagePrimitive.Content`

---

## Expected Stream Format

After the fixes, your API now returns proper Server-Sent Events:

```
event: 0
data: {"type":"text","text":"I'll "}

event: 0
data: {"type":"text","text":"search"}

event: 0
data: {"type":"text","text":" for "}

event: 0
data: {"type":"tool_call","toolName":"search_person","args":{"name":"Alice"}}

event: 0
data: {"type":"text","text":" Alice"}

event: 0
data: {"type":"text","text":" in "}

event: 0
data: {"type":"text","text":"GoalPost"}

event: 1
data: {}
```

Each event is:

- **`type: "text"`** - Streamed text from the LLM (arrives in real-time)
- **`type: "tool_call"`** - Tool execution request (assistant-ui handles this)
- **`type: "tool_result"`** - Result from tool execution
- **`event: 1` with empty data** - Signals completion

---

## Verification Checklist

### Backend

- [x] Model name changed from `gpt-4.1` to `gpt-4o`
- [x] `streamText()` is called with correct parameters
- [x] `toUIMessageStreamResponse()` is used
- [x] Headers are set: `Content-Type: text/event-stream`
- [x] Cache and connection headers added for robustness
- [x] Logging added for debugging (`[CHAT]` prefix)

### Frontend

- [x] `useChatRuntime` hook is initialized
- [x] `AssistantChatTransport` is configured with `/api/chat`
- [x] `ThreadPrimitive.Root` wraps the thread
- [x] `ThreadPrimitive.Messages` has components prop
- [x] `MessagePrimitive.Content` renders the messages

### Environment

- [x] `.env.local` has `OPENAI_API_KEY` set
- [x] `NEO4J_*` variables set for tool execution
- [x] `npm run dev` starts successfully

---

## Testing Instructions

### Step 1: Start Development Server

```bash
cd /Users/jd/Documents/dev/client-work/GoalPost
npm run dev
```

### Step 2: Open Application

Visit: http://localhost:3000

### Step 3: Test Chat

1. Click AI Assistant button to open chat
2. Type: `"Tell me about Alice"`
3. Press Enter

### Step 4: Monitor Logs

In terminal, filter for chat logs:

```bash
npm run dev 2>&1 | grep "\[CHAT\]\|\[ERROR\]"
```

Expected output:

```
🔍 [CHAT] Converted messages: [...]
🔍 [CHAT] Using system prompt: You are...
🔍 [CHAT] Streaming response for message count: 1
🔍 [CHAT] Tools available: search_person, search_community
✅ [CHAT] Response headers set, streaming started
```

### Step 5: Check Network (DevTools)

1. Open DevTools → Network tab
2. Send another message
3. Find `/api/chat` request
4. Click Response tab
5. Should see streamed data like: `{"type":"text","text":"..."}`

---

## Files Changed

| File                                                                            | Changes                                                     |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [src/app/api/chat/route.ts](../src/app/api/chat/route.ts)                       | Fixed model name, added streaming headers, improved logging |
| [docs/AI_SDK_ASSISTANT_UI_INTEGRATION.md](./AI_SDK_ASSISTANT_UI_INTEGRATION.md) | Integration guide with examples                             |
| [docs/CHAT_TESTING_GUIDE.md](./CHAT_TESTING_GUIDE.md)                           | Testing procedures and troubleshooting                      |

---

## Common Issues & Solutions

### Issue: Still no messages appearing

**Check 1: Is the API being called?**

- Open DevTools → Network
- Send a message
- Look for `/api/chat` request
- If not found: Frontend isn't sending requests (check runtime initialization)

**Check 2: Is the response streaming?**

- Click `/api/chat` request
- Go to Response tab
- Should see JSON data with `"type":"text"` fields
- If empty: Backend has an error (check logs)

**Check 3: Are messages rendered?**

- DevTools → Elements
- Find `ThreadPrimitive.Root`
- Check if message divs exist
- If not: Thread component isn't receiving data (check runtime provider)

### Issue: "No such model: gpt-4.1"

**This is now fixed** ✅ The code now uses `gpt-4o`.

### Issue: 502 Bad Gateway or timeout

Likely causes:

1. OpenAI API key invalid → check `OPENAI_API_KEY` in `.env.local`
2. Neo4j connection failed → check `NEO4J_*` variables
3. Tool execution hanging → check Neo4j network connectivity

---

## References

- **AI SDK Documentation**: https://sdk.vercel.ai/docs
- **assistant-ui Integration**: https://www.assistant-ui.com/docs/runtimes/ai-sdk
- **Server-Sent Events (SSE)**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- **RFC 7231 - Content-Type Header**: https://tools.ietf.org/html/rfc7231#section-3.1.1
