# Pulse Title Feature

## Overview

Pulses now have a `title` field - a short one-sentence summary of the pulse content.

- If you provide a title when creating a pulse, it will be used
- If you don't provide a title, AI will automatically generate one using GPT-4o-mini

## Schema Changes

All pulse types now have a required `title` field:

```graphql
interface FieldPulse {
  id: ID!
  title: String! # ← NEW
  content: String!
  # ...
}

type GoalPulse implements FieldPulse {
  id: ID!
  title: String! # ← NEW
  content: String!
  # ...
}

# Same for ResourcePulse and StoryPulse
```

## API Usage

### Creating a Pulse with a Custom Title

```bash
POST /api/pulse/create-from-conversation
Content-Type: application/json

{
  "contextId": "context_123",
  "personId": "person_456",
  "pulseType": "GoalPulse",
  "title": "Launch new product feature by Q2",  # ← Optional
  "content": "We need to complete the development of the new dashboard feature and launch it by the end of Q2. This includes design, development, testing, and deployment.",
  "status": "ACTIVE",
  "horizon": "MID"
}
```

### Creating a Pulse with AI-Generated Title

```bash
POST /api/pulse/create-from-conversation
Content-Type: application/json

{
  "contextId": "context_123",
  "personId": "person_456",
  "pulseType": "StoryPulse",
  # No title provided - AI will generate one
  "content": "Today we had an incredible team meeting where everyone shared their progress. The energy was amazing and we made several breakthroughs on the authentication system. Sarah suggested a new approach that could save us weeks of development time."
}
```

AI will generate a title like: "Team meeting breakthrough on authentication system"

## Search Enhancement

Pulses can now be found by searching their titles OR content:

```graphql
query {
  searchAll(query: "authentication") {
    storyPulses {
      id
      title # ← Will match "authentication" in title
      content
    }
  }
}
```

## Implementation Details

### Title Generation Logic

1. **Short content (< 50 chars)**: Uses content directly as title
2. **AI generation**: Uses GPT-4o-mini with a specialized prompt to create a 10-word max summary
3. **Fallback**: If AI fails, extracts first sentence or truncates content to 60 chars

### Files Modified

- `src/lib/graphql/schema/schema.gql` - Added `title: String!` to pulse types
- `src/lib/resonance/utils/title-generator.ts` - NEW: AI title generation
- `src/app/api/pulse/create-from-conversation/route.ts` - Integrates title generation
- `src/lib/graphql/resolvers/search-resolver.ts` - Search by title AND content

## Examples

**Goal Pulse**

- Content: "Complete the migration to Neo4j 5.0 including updating all Cypher queries, testing vector indexes, and deploying to production"
- Generated Title: "Complete Neo4j 5.0 migration to production"

**Resource Pulse**

- Content: "I have 10 hours per week available to help with frontend development, particularly React and TypeScript work"
- Generated Title: "10 hours weekly for React TypeScript development"

**Story Pulse**

- Content: "The retrospective revealed that our sprint planning process needs improvement. Teams feel rushed during planning and don't have enough time to properly estimate stories."
- Generated Title: "Sprint planning process needs improvement"

## Benefits

1. **Better UX**: Users can quickly scan pulse lists using titles
2. **Improved Search**: Titles provide better semantic search targets
3. **Flexibility**: Users can override AI with custom titles
4. **Consistency**: All pulses have meaningful summaries
