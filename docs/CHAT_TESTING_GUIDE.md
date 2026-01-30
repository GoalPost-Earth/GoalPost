# Chat Integration Testing Guide

## Changes Made

### 1. Fixed Model Name

- **Before**: `openai('gpt-4.1')` ❌ (non-existent model)
- **After**: `openai('gpt-4o')` ✅ (valid GPT-4 Omni model)

### 2. Added Streaming Headers

The API now explicitly sets Server-Sent Events (SSE) headers:

```typescript
response.headers.set('Content-Type', 'text/event-stream')
response.headers.set('Cache-Control', 'no-cache')
response.headers.set('Connection', 'keep-alive')
```

---

## How to Test

### Prerequisites

```bash
npm run dev  # Start development server
```

### Test the Chat Flow

1. **Open GoalPost** in browser (http://localhost:3000)

2. **Open the AI Assistant** (look for the chat/AI button)

3. **Send a test message**:

   ```
   "Tell me about Alice"
   ```

4. **Expected behavior**:
   - Message appears in chat thread
   - AI starts typing a response
   - Tool call executes: `search_person({ name: "Alice" })`
   - Tool results display
   - AI generates a follow-up response with the data

### Backend Logs to Watch

Run in terminal:

```bash
npm run dev 2>&1 | grep -E "\[CHAT\]"
```

Expected log output:

```
🔍 [CHAT] Converted messages: [{"role":"user","content":"Tell me about Alice"}]
🔍 [CHAT] Using system prompt: You are a helpful assistant...
🔍 [CHAT] Streaming response for message count: 1
🔍 [CHAT] Tools available: search_person, search_community
✅ [CHAT] Response headers set, streaming started
```

### Frontend Network Inspection

1. Open **DevTools** → **Network** tab
2. Send a chat message
3. Look for a request to `/api/chat`
4. Check the **Response** tab - you should see streamed data like:

   ```
   event: 0
   data: {"type":"text","text":"I'll "}

   event: 0
   data: {"type":"text","text":"search"}
   ```

### Common Issues & Fixes

| Issue                     | Cause                     | Fix                                                                    |
| ------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| "No messages appear"      | Model name wrong          | Check that `gpt-4o` is used, not `gpt-4.1`                             |
| "Chat hangs"              | Streaming headers missing | Verify `text/event-stream` header is set                               |
| "Tool doesn't execute"    | Tools not registered      | Check `search_person` is in `toolsConfig`                              |
| "API 500 error"           | Neo4j connection failed   | Verify `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` in `.env.local` |
| "Empty assistant message" | LLM not generating text   | Check OpenAI API key and model availability                            |

---

## Files Modified

- [`src/app/api/chat/route.ts`](../src/app/api/chat/route.ts) - Fixed model name, added headers, added logging
- [`docs/AI_SDK_ASSISTANT_UI_INTEGRATION.md`](./AI_SDK_ASSISTANT_UI_INTEGRATION.md) - Integration guide

---

## Architecture Summary

```
User Input
   ↓
[Frontend: ai-assistant-panel.tsx]
   ↓ (via AssistantChatTransport)
POST /api/chat
   ↓
[Backend: route.ts]
   ├─ Receive { messages, system, tools }
   ├─ Call streamText()
   ├─ Execute tools (search_person, search_community)
   └─ Return Server-Sent Events stream
   ↓
[Frontend: Thread component]
   ├─ Receive streamed chunks
   ├─ Render in MessagePrimitive.Content
   └─ Display tool results
```

---

## Next Steps

If chat still isn't displaying messages:

1. **Check browser console** for JavaScript errors
2. **Verify API route is being called** (check Network tab)
3. **Look for streaming data** in Network response
4. **Check Thread component** is properly wrapped in `AssistantRuntimeProvider`
5. **Verify MessagePrimitive.Content** is not over-styled (check CSS)
