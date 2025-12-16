# GoalPost ReAct Agent Implementation

This document outlines the implementation of a ReAct (Reasoning + Acting) agent architecture for GoalPost with guardrails, person search capabilities, and UI integration.

## Architecture Overview

```
User Query
    ↓
Guardrails Validation (LLM-based filtering)
    ↓
AI SDK Tools (search_person, search_community)
    ↓
Neo4j Database Queries
    ↓
Response Processing
    ↓
UI Rendering (PersonCard for profiles, MarkdownText for general responses)
```

## Components

### 1. Guardrails Chain (`src/lib/simulation/guardrails.ts`)

**Purpose**: Constrains AI responses to GoalPost-related topics only.

**Features**:
- LLM-based content validation using positive/negative examples
- Allows: Community, people, goals, resources, core values, meta-relationality topics
- Rejects: Weather, general knowledge, entertainment, unrelated queries
- Returns polite rejection messages for off-topic queries

**Example Usage**:
```typescript
const validation = await validateQuery(
  "What's the weather?",
  llm
)
// { isAllowed: false, rejectionMessage: "I'm here to help you with..." }
```

### 2. Person Search Tool (`src/modules/agent/tools/person-search.tool.ts`)

**Purpose**: Search for people in the Neo4j database with smart disambiguation.

**Features**:
- Flexible name search (first name, last name, or full name)
- Returns detailed profile information when found
- Handles three cases:
  1. **No match**: Clear "not found" message
  2. **Multiple matches**: Lists all matches and asks for clarification
  3. **Single match**: Returns full profile data with `PERSON_PROFILE_FOUND` marker

**Cypher Query**:
```cypher
MATCH (p:Person)
WHERE toLower(p.firstName) CONTAINS toLower($name)
  OR toLower(p.lastName) CONTAINS toLower($name)
  OR toLower(p.firstName + ' ' + p.lastName) CONTAINS toLower($name)
OPTIONAL MATCH (p)-[:BELONGS_TO]->(c:Community)
OPTIONAL MATCH (p)-[:CONNECTED_TO]-(conn:Person)
WITH p, 
     collect(DISTINCT c.name) as communities,
     count(DISTINCT conn) as connectionCount
RETURN ...
```

### 3. ReAct Agent (`src/modules/agent/react-agent.ts`)

**Purpose**: Orchestrates reasoning and tool execution.

**Features**:
- Uses OpenAI Functions Agent pattern
- Integrates existing Neo4j tools (Cypher, Vector retrieval)
- Adds person search tool
- Validates queries against guardrails before processing
- Maintains conversation history via BufferMemory

**Tools Available**:
1. `search_person_by_name` - Find people by name
2. `graph-cypher-retrieval-chain` - Complex database queries
3. `graph-vector-retrieval-chain` - Similarity-based searches
4. `search_community` - Find communities

### 4. Chat API Integration (`src/app/api/chat/route.ts`)

**Purpose**: Exposes tools via AI SDK's streaming interface.

**Key Changes**:
- Replaced mock `get_current_weather` tool
- Added `search_person` tool with Neo4j integration
- Added `search_community` tool
- Returns structured metadata for UI rendering

**Tool Response Format**:
```typescript
{
  found: boolean,
  count: number,
  people?: PersonProfileData[],
  message: string,
  needsDisambiguation: boolean,
  _metadata: {
    type: 'person_search',
    renderUI: boolean
  }
}
```

### 5. PersonCard UI Component (`src/components/assistant-ui/person-card.tsx`)

**Purpose**: Beautiful profile card for displaying person information.

**Features**:
- Avatar with fallback initials
- Displays: Name, pronouns, location, email
- Categorized tags for:
  - Communities (primary color)
  - Passions (red)
  - Interests (blue)
  - Traits (purple)
  - Fields of Care (green)
  - Favorites (amber)
- Connection count indicator
- Responsive design with Tailwind CSS

**Example**:
```tsx
<PersonCard person={{
  id: "1",
  firstName: "Sarah",
  lastName: "Johnson",
  name: "Sarah Johnson",
  pronouns: "she/her",
  location: "San Francisco, CA",
  email: "sarah@example.com",
  passions: "Social Justice, Education",
  interests: "Community Organizing, Poetry",
  communities: ["Education Reform", "Local Artists"]
}} />
```

### 6. Enhanced Message Renderer (`src/components/assistant-ui/enhanced-message-text.tsx`)

**Purpose**: Detects person profile data in messages and renders PersonCard inline.

**Features**:
- Parses messages for `PERSON_PROFILE_FOUND:` markers
- Extracts JSON profile data
- Renders PersonCard for profiles
- Falls back to MarkdownText for regular content
- Supports mixed content (text + profile cards)

**Parsing Logic**:
```typescript
const personMarkerRegex = /PERSON_PROFILE_FOUND:\s*(\{[\s\S]*?\}(?=\s*(?:PERSON_PROFILE_FOUND:|$)))/g
```

### 7. Thread Integration (`src/components/assistant-ui/thread.tsx`)

**Purpose**: Main chat interface with PersonCard support.

**Changes**:
- Replaced `MarkdownText` with `EnhancedMessageText` in AssistantMessage
- Maintains all existing functionality (editing, branching, actions)
- Seamlessly renders profile cards alongside text

## User Experience Flows

### Flow 1: Finding a Person (Single Match)

```
User: "Tell me about Sarah Johnson"
    ↓
Guardrails: ✓ Allowed (person-related query)
    ↓
search_person tool: Query Neo4j
    ↓
Result: 1 match found
    ↓
Response: "Here's Sarah's profile: PERSON_PROFILE_FOUND: {...}"
    ↓
UI: Renders PersonCard with full profile details
```

### Flow 2: Disambiguation (Multiple Matches)

```
User: "Who is John?"
    ↓
Guardrails: ✓ Allowed
    ↓
search_person tool: Query Neo4j
    ↓
Result: 3 matches found
    ↓
Response: "I found 3 people matching 'John':
1. John Smith - from Seattle (member of Tech Community)
2. John Doe - he/him (member of Arts Collective)
3. John Williams - from NYC

Could you please clarify which person you're interested in?"
```

### Flow 3: Person Not Found

```
User: "Tell me about Alice Cooper"
    ↓
Guardrails: ✓ Allowed
    ↓
search_person tool: Query Neo4j
    ↓
Result: 0 matches
    ↓
Response: "I searched the GoalPost database but could not find any person matching 'Alice Cooper'. There is no information about such a person in our community database."
```

### Flow 4: Off-Topic Query Blocked

```
User: "What's the weather today?"
    ↓
Guardrails: ✗ Rejected
    ↓
Response: "I'm here to help you with questions about the GoalPost community, including finding people, exploring communities, discovering resources, and understanding connections. Your question seems to be outside of my area of focus. Could you ask me something about our community members, goals, or how GoalPost works?"
```

## Testing the Implementation

### 1. Test Guardrails

```typescript
// Should be allowed
await validateQuery("Who is John Smith?", llm)
await validateQuery("What communities exist?", llm)
await validateQuery("How does GoalPost work?", llm)

// Should be rejected
await validateQuery("What's the weather?", llm)
await validateQuery("Tell me a joke", llm)
```

### 2. Test Person Search

```typescript
// Single match
const tool = createPersonSearchTool(graph)
await tool.invoke({ name: "Sarah Johnson" })

// Multiple matches
await tool.invoke({ name: "John" })

// No match
await tool.invoke({ name: "Nonexistent Person" })
```

### 3. Test UI Rendering

In the chat interface:
1. Ask: "Tell me about [actual person name in your database]"
2. Verify PersonCard renders with all fields
3. Ask: "Who is John?" (if multiple Johns exist)
4. Verify disambiguation list appears
5. Ask: "Tell me about xyz123" (non-existent)
6. Verify clear "not found" message

## Configuration

### Environment Variables Required

```env
# Neo4j Connection
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password

# OpenAI (for guardrails and agent)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Ollama (for main chat)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_BEARER_TOKEN=optional
```

### Dependencies

Already included in `package.json`:
- `@langchain/openai` - OpenAI integration
- `@langchain/core` - LangChain core
- `@langchain/community` - Neo4j tools
- `langchain` - Agent framework
- `@assistant-ui/react` - Chat UI
- `ai` - AI SDK for streaming
- `neo4j-driver` - Neo4j connection

## File Structure

```
src/
├── lib/
│   └── simulation/
│       └── guardrails.ts          # Content validation
├── modules/
│   └── agent/
│       ├── react-agent.ts         # Main agent logic
│       └── tools/
│           ├── index.ts           # Existing Neo4j tools
│           └── person-search.tool.ts  # Person search
├── app/
│   └── api/
│       └── chat/
│           └── route.ts           # API endpoint with tools
└── components/
    └── assistant-ui/
        ├── person-card.tsx        # Profile UI component
        ├── enhanced-message-text.tsx  # Message renderer
        └── thread.tsx             # Chat interface
```

## Extending the Implementation

### Adding a New Tool

1. Create tool file in `src/modules/agent/tools/`:
```typescript
export function createMyTool(graph: Neo4jGraph): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'my_tool',
    description: 'What this tool does',
    schema: z.object({ ... }),
    func: async (input) => {
      // Tool logic
    }
  })
}
```

2. Add to ReAct agent in `react-agent.ts`:
```typescript
import { createMyTool } from './tools/my-tool'
const myTool = createMyTool(graph)
const tools = [...baseTools, personSearchTool, myTool]
```

3. Expose via API in `route.ts`:
```typescript
my_tool: tool({
  description: '...',
  inputSchema: z.object({ ... }),
  execute: async ({ params }) => {
    // Call the LangChain tool or implement directly
  }
})
```

### Adding a New UI Component for Tool Results

1. Create component in `src/components/assistant-ui/`:
```tsx
export function CommunityCard({ community }: { community: CommunityData }) {
  return <Card>...</Card>
}
```

2. Update `enhanced-message-text.tsx`:
```typescript
// Add marker detection
const communityMarkerRegex = /COMMUNITY_FOUND:\s*(\{...)/g

// Add to rendering logic
if (element.type === 'community') {
  return <CommunityCard community={element.content} />
}
```

## Best Practices

1. **Guardrails First**: Always validate user input before processing
2. **Clear Responses**: Provide specific, actionable messages for each case (found/not found/disambiguation)
3. **Structured Data**: Use markers like `PERSON_PROFILE_FOUND:` for UI components
4. **Error Handling**: Gracefully handle Neo4j errors and return user-friendly messages
5. **Type Safety**: Use TypeScript interfaces for all data structures
6. **Performance**: Limit Neo4j queries (LIMIT 10) and use efficient Cypher
7. **User Feedback**: Show loading states, handle long-running queries

## Known Limitations

1. **Neo4j Connection**: Requires active Neo4j instance; fails gracefully if unavailable
2. **LLM Dependency**: Guardrails require OpenAI API; consider fallback for offline mode
3. **Name Ambiguity**: Doesn't use fuzzy matching; requires exact substring matches
4. **Scalability**: BufferMemory stores entire conversation; consider using persistent storage for production
5. **Rate Limiting**: Not implemented; consider adding for production

## Future Enhancements

1. **Fuzzy Name Matching**: Use Levenshtein distance for typo tolerance
2. **Context-Aware Disambiguation**: Use conversation history to infer which person is meant
3. **Caching**: Cache frequent queries to reduce Neo4j load
4. **Analytics**: Track which queries are blocked by guardrails
5. **Multi-Modal**: Add image generation for profile pictures
6. **Batch Operations**: Support bulk person searches
7. **Export**: Allow exporting profile data as PDF/vCard

## Troubleshooting

### "Cannot find person" when person exists

- Check Neo4j connection
- Verify person has `firstName` and `lastName` properties
- Test Cypher query directly in Neo4j Browser
- Check case sensitivity in search

### PersonCard not rendering

- Verify `PERSON_PROFILE_FOUND:` marker in response
- Check browser console for parsing errors
- Ensure JSON is valid in the marker
- Verify `EnhancedMessageText` is used in thread

### Guardrails blocking valid queries

- Review positive/negative examples in `guardrails.ts`
- Test with different LLM temperature
- Add more specific examples to the prompt
- Consider adjusting strictness

### Tool not being called

- Check tool description clarity
- Verify schema matches expected input
- Test tool invocation directly
- Check AI SDK logs for tool selection

## Support

For questions or issues:
1. Check Neo4j connection and sample data
2. Review browser console and server logs
3. Test tools individually before integration
4. Verify environment variables are set

## Credits

Built with:
- LangChain for agent orchestration
- OpenAI for LLM and embeddings
- Neo4j for graph database
- AI SDK for streaming
- assistant-ui for chat interface
- shadcn/ui for components
