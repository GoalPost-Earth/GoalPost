# GoalPost ReAct Agent - Quick Start Guide

## What Was Implemented

A complete ReAct (Reasoning + Acting) agent architecture with:

✅ **Guardrails** - LLM-based content filtering that only allows GoalPost-related queries
✅ **Person Search Tool** - Smart database search with disambiguation  
✅ **Beautiful Profile UI** - PersonCard component for displaying user profiles
✅ **Seamless Integration** - Works with existing Aiden simulation protocol

## How to Use

### 1. Setup Environment Variables

Add to your `.env.local`:
```bash
# Already configured (verify these exist)
NEO4J_URI=your_neo4j_uri
NEO4J_USERNAME=your_username
NEO4J_PASSWORD=your_password
OPENAI_API_KEY=your_openai_key
```

### 2. Test the Implementation

Start your development server:
```bash
npm run dev
```

### 3. Try These Queries

In the chat interface, test different scenarios:

#### ✅ **Person Found (Single Match)**
```
"Tell me about Sarah Johnson"
"Who is John Smith?"
"Show me the profile of Alice"
```
→ Displays a beautiful PersonCard with full profile details

#### ✅ **Multiple Matches (Disambiguation)**
```
"Who is John?"
"Tell me about Sarah"
```
→ Lists all matching people and asks for clarification

#### ✅ **Person Not Found**
```
"Tell me about Nonexistent Person"
```
→ Clear message: "No information about such a person in the database"

#### ✅ **Community Search**
```
"What communities exist?"
"Find communities about education"
```
→ Returns list of communities with details

#### ❌ **Off-Topic (Blocked by Guardrails)**
```
"What's the weather?"
"Tell me a joke"
"How do I make lasagna?"
```
→ Polite rejection: "I'm here to help with GoalPost community questions..."

#### ✅ **Meta-Relationality (Allowed)**
```
"What is meta-relationality?"
"How does GoalPost work?"
"Activate the Aiden protocol"
```
→ Normal responses (simulation protocol works as before)

## What Each Component Does

### 🛡️ Guardrails (`src/lib/simulation/guardrails.ts`)
- Validates every query before processing
- Uses OpenAI to classify as ALLOWED or REJECTED
- Based on positive/negative examples
- Rejects off-topic queries with helpful messages

### 🔍 Person Search Tool (`src/modules/agent/tools/person-search.tool.ts`)
- Searches Neo4j for people by name
- Flexible matching: first name, last name, or full name
- Returns structured data for UI rendering
- Handles 3 cases: found, not found, disambiguation needed

### 🤖 ReAct Agent (`src/modules/agent/react-agent.ts`)
- Orchestrates tool execution
- Integrates with existing Neo4j tools
- Maintains conversation history
- Processes guardrail validation

### 🎨 PersonCard (`src/components/assistant-ui/person-card.tsx`)
- Beautiful profile display component
- Shows avatar, name, pronouns, location, email
- Categorized tags: communities, passions, interests, traits, etc.
- Responsive and accessible design

### 🔄 Enhanced Message Renderer (`src/components/assistant-ui/enhanced-message-text.tsx`)
- Detects `PERSON_PROFILE_FOUND:` markers in responses
- Parses JSON profile data
- Renders PersonCard inline with text
- Falls back to normal markdown for other content

### 💬 Chat API (`src/app/api/chat/route.ts`)
- Exposes `search_person` and `search_community` tools
- Connects to Neo4j on-demand
- Streams responses with tool execution
- Works with AI SDK and assistant-ui

## Customization

### Adjust Guardrail Strictness

Edit `/src/lib/simulation/guardrails.ts`:

```typescript
// Add more POSITIVE EXAMPLES (will be allowed):
- "Your new allowed query pattern"

// Add more NEGATIVE EXAMPLES (will be rejected):
- "Your blocked query pattern"
```

### Customize PersonCard Appearance

Edit `/src/components/assistant-ui/person-card.tsx`:

```typescript
// Change colors, layout, fields displayed, etc.
// Uses Tailwind CSS classes
```

### Add More Tools

1. Create new tool in `src/modules/agent/tools/your-tool.ts`
2. Add to chat route in `src/app/api/chat/route.ts`
3. Update guardrails if needed

## Architecture Flow

```
User: "Tell me about Sarah Johnson"
         ↓
[Guardrails] → Check if allowed
         ↓ (ALLOWED)
[search_person tool] → Query Neo4j
         ↓
[Database] → Find person
         ↓
[Response] → "PERSON_PROFILE_FOUND: {...}"
         ↓
[EnhancedMessageText] → Parse marker
         ↓
[PersonCard] → Render beautiful profile
         ↓
[User sees] → Profile card with all details
```

## Troubleshooting

### PersonCard Not Showing?

1. Check browser console for parsing errors
2. Verify Neo4j connection is active
3. Test query directly: `MATCH (p:Person) RETURN p LIMIT 1`
4. Check if person has required fields (firstName, lastName)

### Guardrails Too Strict?

Edit positive examples in `guardrails.ts` to include more patterns.

### Tool Not Being Called?

- Check tool description clarity in `route.ts`
- Verify schema matches input format
- Test tool directly in code before API integration

### "Cannot read properties of undefined"?

Ensure `.env.local` has all required variables:
- NEO4J_URI
- NEO4J_USERNAME  
- NEO4J_PASSWORD
- OPENAI_API_KEY

## Testing Checklist

- [ ] Person found (single match) → PersonCard displays
- [ ] Multiple people found → Disambiguation list appears
- [ ] Person not found → Clear "not found" message
- [ ] Off-topic query → Polite rejection message
- [ ] Community search → Returns communities
- [ ] Simulation protocol still works → "Activate Aiden"
- [ ] Message editing still works
- [ ] Branch picker still works

## Next Steps

1. **Add More Sample Data** - Populate Neo4j with test people/communities
2. **Extend Tools** - Add goal search, resource search, etc.
3. **Enhance UI** - Add click-to-expand, links to full profiles
4. **Add Analytics** - Track which queries are blocked
5. **Optimize Performance** - Cache frequent queries

## Support

See full documentation in `REACT_AGENT_IMPLEMENTATION.md` for:
- Detailed architecture explanation
- Adding new tools
- Extending UI components
- Advanced configurations

## Demo Script

Copy-paste these into chat to demo the system:

```
1. "Tell me about [real person name in your DB]"
   → Should show PersonCard

2. "Who is John?"
   → Should show disambiguation if multiple Johns

3. "Tell me about xyz123"
   → Should show "not found" message

4. "What's the weather today?"
   → Should be blocked by guardrails

5. "What communities exist in GoalPost?"
   → Should return community list

6. "Activate the Aiden Cinnamon Tea Simulation Protocol"
   → Should activate simulation (existing feature still works)
```

---

**Built with**: LangChain · OpenAI · Neo4j · AI SDK · assistant-ui · shadcn/ui
