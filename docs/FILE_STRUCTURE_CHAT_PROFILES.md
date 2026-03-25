# File Structure: Chat Interface, Profiles & Connections

Complete map of all files involved in chat, person profiles, and connection display.

---

## CHAT INTERFACE FILES

### Main Chat Components

| File                                                    | Purpose                                        | Size       | Imports                                     |
| ------------------------------------------------------- | ---------------------------------------------- | ---------- | ------------------------------------------- |
| `src/components/assistant-ui/thread.tsx`                | Main chat UI using @assistant-ui/react         | ~100 lines | Button, ThreadPrimitive, SendHorizontalIcon |
| `src/components/assistant-ui/markdown-text.tsx`         | Default message renderer (markdown)            | ~50 lines  | Basic markdown rendering                    |
| `src/components/assistant-ui/enhanced-message-text.tsx` | Profile detection + parsing                    | ~100 lines | PersonCard, MarkdownText, useMemo           |
| `src/components/assistant-ui/person-card.tsx`           | Inline profile display                         | ~250 lines | Avatar, Card, Badge, lucide-react icons     |
| `src/components/assistant-ui/person-profile-card.tsx`   | Alternative profile card (makeAssistantToolUI) | ~200 lines | Card, Badge, Tool UI primitives             |
| `src/components/assistant-ui/tool-fallback.tsx`         | Fallback for unknown tools                     | ~50 lines  | Generic tool display                        |
| `src/components/assistant-ui/tooltip-icon-button.tsx`   | Icon button with tooltip                       | ~50 lines  | Button, Tooltip                             |

### Chat API & Backend

| File                                                             | Purpose                   | Size        | Key Functions                           |
| ---------------------------------------------------------------- | ------------------------- | ----------- | --------------------------------------- |
| `src/app/api/chat/route.ts`                                      | Chat streaming endpoint   | ~300+ lines | POST handler, tool execution, streaming |
| `src/app/api/chat/simulation/route.ts`                           | Simulation mode endpoint  | ~200+ lines | Aiden protocol support                  |
| `src/modules/agent/tools/person-search.tool.ts`                  | Person search tool        | ~150 lines  | createPersonSearchTool, Neo4j query     |
| `src/modules/agent/tools/space/space-search.tool.ts`             | Space search tool         | ~100 lines  | Space querying                          |
| `src/modules/agent/tools/space/space-rename.tool.ts`             | Space rename tool         | ~50 lines   | Update space name                       |
| `src/modules/agent/tools/field-context/field-context.service.ts` | Field context tools       | ~150 lines  | Search, update contexts                 |
| `src/modules/agent/tools/pulse/pulse.service.ts`                 | Pulse tools               | ~150 lines  | Search, update, link pulses             |
| `src/modules/agent/tools/rag/graph-rag.service.ts`               | Graph RAG search          | ~100 lines  | Semantic search                         |
| `src/modules/agent/react-agent.ts`                               | ReAct agent orchestration | ~200 lines  | Agent loop, tool execution              |
| `src/lib/simulation/guardrails.ts`                               | Safety guardrails         | ~100 lines  | Permission checking                     |
| `src/lib/simulation/system-prompts.ts`                           | Mode-specific prompts     | ~100 lines  | System instructions                     |

### Chat Pages

| File                                   | Purpose                           | Route                  |
| -------------------------------------- | --------------------------------- | ---------------------- |
| `src/app/page.tsx`                     | Root redirect (to auth or spaces) | `/`                    |
| `src/app/protected/assistant/page.tsx` | Assistant/chat page               | `/protected/assistant` |

---

## PERSON PROFILE FILES

### Profile Pages

| File                                                | Route                               | Purpose                    | Size        |
| --------------------------------------------------- | ----------------------------------- | -------------------------- | ----------- |
| `src/app/protected/dashboard/persons/[id]/page.tsx` | `/protected/dashboard/persons/[id]` | Full person profile detail | ~300+ lines |
| `src/app/protected/profile/page.tsx`                | `/protected/profile`                | Current user profile view  | ~150 lines  |
| `src/app/protected/profile/edit/page.tsx`           | `/protected/profile/edit`           | Edit current user profile  | ~200 lines  |

### Profile Components

| File                                            | Purpose               | Used By       | Size      |
| ----------------------------------------------- | --------------------- | ------------- | --------- |
| `src/components/persons/profile-background.tsx` | Decorative background | Profile pages | ~50 lines |
| `src/components/persons/profile-layout.tsx`     | Main layout wrapper   | Profile pages | ~50 lines |
| `src/components/persons/profile-card.tsx`       | Section container     | Profile pages | ~50 lines |
| `src/components/persons/section-header.tsx`     | Section title + icon  | Profile pages | ~50 lines |
| `src/components/persons/resonance-badge.tsx`    | Resonance indicator   | Various       | ~50 lines |

### Dashboard Components

| File                                         | Purpose              | Size       | Displays                      |
| -------------------------------------------- | -------------------- | ---------- | ----------------------------- |
| `src/components/dashboard/people-list.tsx`   | People widget        | ~100 lines | Related people (6 by default) |
| `src/components/dashboard/sidebar.tsx`       | Dashboard navigation | ~150 lines | Navigation menu               |
| `src/components/dashboard/active-pulses.tsx` | Active pulses widget | ~100 lines | Recent pulses                 |
| `src/components/dashboard/fields-list.tsx`   | Fields widget        | ~100 lines | Field contexts                |
| `src/components/dashboard/spaces-list.tsx`   | Spaces widget        | ~100 lines | User's spaces                 |
| `src/components/dashboard/activity-logs.tsx` | Activity widget      | ~100 lines | Recent activities             |

### Dashboard Pages

| File                                                      | Route                                     | Purpose                     |
| --------------------------------------------------------- | ----------------------------------------- | --------------------------- |
| `src/app/protected/dashboard/page.tsx`                    | `/protected/dashboard`                    | Main dashboard with widgets |
| `src/app/protected/dashboard/space/[id]/page.tsx`         | `/protected/dashboard/space/[id]`         | Space details.              |
| `src/app/protected/dashboard/pulses/[id]/page.tsx`        | `/protected/dashboard/pulses/[id]`        | Pulse details               |
| `src/app/protected/dashboard/field-context/[id]/page.tsx` | `/protected/dashboard/field-context/[id]` | Field context details       |

---

## GRAPHQL & DATA LAYER

### GraphQL Queries

| File                                           | Purpose                | Size       | Main Queries                               |
| ---------------------------------------------- | ---------------------- | ---------- | ------------------------------------------ |
| `src/app/graphql/queries/PERSON_QUERIES.ts`    | Person-related queries | ~80 lines  | GET_PERSON, GET_PERSON_PROFILE             |
| `src/app/graphql/queries/SPACE_QUERIES.ts`     | Space-related queries  | ~150 lines | GET_WE_SPACE_MEMBERS_WITH_CONNECTIONS, etc |
| `src/app/graphql/queries/DASHBOARD_QUERIES.ts` | Dashboard queries      | ~100 lines | GET_RELATED_PEOPLE, GET_ACTIVE_PULSES      |
| `src/app/graphql/queries/SEARCH_QUERIES.ts`    | Search queries         | ~80 lines  | General search queries                     |
| `src/app/graphql/queries/RESONANCE_QUERIES.ts` | Resonance queries      | ~100 lines | Resonance patterns                         |
| `src/app/graphql/queries/PULSE_QUERIES.ts`     | Pulse queries          | ~80 lines  | Pulse-related queries                      |

### GraphQL Mutations

| File                                                  | Purpose          | Size       | Main Mutations                |
| ----------------------------------------------------- | ---------------- | ---------- | ----------------------------- |
| `src/app/graphql/mutations/index.ts`                  | Mutation exports | ~50 lines  | Re-exports                    |
| `src/app/graphql/mutations/PERSON_MUTATIONS.ts`       | Person mutations | ~50 lines  | Create, update, delete person |
| `src/app/graphql/mutations/SPACE_MUTATIONS.ts`        | Space mutations  | ~100 lines | Space operations              |
| `src/app/graphql/mutations/ACTIVITY_LOG_MUTATIONS.ts` | Activity logging | ~50 lines  | Log user activities           |

### Schema & Types

| File                                | Purpose                  | Size         |
| ----------------------------------- | ------------------------ | ------------ |
| `src/lib/graphql/schema/schema.gql` | Neo4j GraphQL schema     | ~2000 lines  |
| `src/gql/graphql.ts`                | Generated GraphQL types  | ~15000 lines |
| `src/types/index.ts`                | TypeScript type exports  | ~100 lines   |
| `@types/graphql.d.ts`               | GraphQL type definitions | ~200 lines   |

---

## CANVAS & VISUALIZATION FILES

### Connection Visualization

| File                                                | Purpose                       | Used In                 |
| --------------------------------------------------- | ----------------------------- | ----------------------- |
| `src/components/canvas/person-connection-lines.tsx` | Draws person connection lines | Space field detail page |
| `src/components/canvas/nvl-canvas.tsx`              | NVL network visualization     | Space field detail page |
| `src/components/ui/person-node.tsx`                 | Person node component         | Canvas visualization    |
| `src/components/ui/pulse-node.tsx`                  | Pulse node component          | Canvas visualization    |
| `src/lib/nvl-utils.ts`                              | NVL helper utilities          | Canvas setup            |

### Field/Space Detail Pages with Connections

| File                                                             | Route                                            | Features                                                | Size         |
| ---------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------- | ------------ |
| `src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx` | `/protected/spaces/we-space/[id]/fields/[field]` | NVL canvas, person connections, resonance visualization | ~1700+ lines |
| `src/app/protected/spaces/me-space/[id]/fields/[field]/page.tsx` | `/protected/spaces/me-space/[id]/fields/[field]` | Similar to WeSpace field page                           | ~1000+ lines |

---

## LIBRARY & UTILITY FILES

### LLM & AI

| File                                        | Purpose                     |
| ------------------------------------------- | --------------------------- |
| `src/lib/llm/provider.ts`                   | LLM provider interface      |
| `src/lib/llm/providers/openai.provider.ts`  | OpenAI implementation       |
| `src/lib/llm/providers/mock.provider.ts`    | Mock provider for testing   |
| `src/lib/llm/adapters/langchain-adapter.ts` | LangChain adapter           |
| `src/lib/simulation/state.ts`               | Simulation state management |
| `src/lib/simulation/protocol.ts`            | Aiden protocol definition   |
| `src/lib/simulation/helpers.ts`             | Simulation utilities        |
| `src/lib/simulation/guards.ts`              | Safety guardrails           |

### Database & Graph

| File                                               | Purpose                      |
| -------------------------------------------------- | ---------------------------- |
| `src/modules/graph.ts`                             | Neo4j singleton & connection |
| `src/lib/graphql/resolvers/embedding-mutations.ts` | Embedding generation         |
| `src/lib/graphql/schema/schema.gql`                | GraphQL schema definition    |

### Utilities

| File                                   | Purpose               |
| -------------------------------------- | --------------------- |
| `src/utils/index.ts`                   | General utilities     |
| `src/lib/utils.ts`                     | Tailwind cn() utility |
| `src/components/ui/linkified-text.tsx` | Rich text with links  |
| `src/components/ui/avatar.tsx`         | Avatar component      |
| `src/components/ui/badge.tsx`          | Badge component       |
| `src/components/ui/card.tsx`           | Card component        |
| `src/components/ui/button.tsx`         | Button component      |

---

## CONFIGURATION FILES

| File                 | Purpose                                |
| -------------------- | -------------------------------------- |
| `.env.local`         | Environment variables (API keys, URLs) |
| `next.config.ts`     | Next.js configuration                  |
| `tsconfig.json`      | TypeScript configuration               |
| `tailwind.config.ts` | Tailwind CSS configuration             |
| `codegen.ts`         | GraphQL code generation                |

---

## CONTEXT & HOOKS

### Contexts

| File                         | Purpose            | Exports                    |
| ---------------------------- | ------------------ | -------------------------- |
| `src/contexts/index.ts`      | Context re-exports | All contexts               |
| `src/contexts/app.tsx`       | App context        | isAuthenticated, isLoading |
| `src/contexts/page.tsx`      | Page context       | setPageTitle, etc          |
| `src/contexts/animation.tsx` | Animation settings | animationsEnabled          |

### Hooks

| File                           | Purpose                  |
| ------------------------------ | ------------------------ |
| `src/hooks/useAuth.ts`         | Authentication state     |
| `src/hooks/usePersonSearch.ts` | Person search logic      |
| `src/hooks/useConnections.ts`  | Connection data fetching |

---

## DATA FILE RELATIONSHIPS

```
Person PROFILE Data Flow:

User Data (Neo4j Node)
    ├─ Core Properties
    │  └─ firstName, lastName, name, email, photo, etc.
    │
    ├─ Rich Content
    │  └─ passions, traits, interests, fieldsOfCare, favorites (CSV strings)
    │
    ├─ Relationships
    │  ├─ CONNECTED_TO → Person (with why, interests)
    │  ├─ OWNS → Space
    │  ├─ IS_MEMBER → Space
    │  └─ BELONGS_TO → Community
    │
    └─ GraphQL Interface
       └─ Person type (schema.gql)
          └─ Generated types (gql/graphql.ts)
             └─ Query resolution (PERSON_QUERIES.ts)
                └─ React component consumption (person-card.tsx)
                   └─ Rendering (HTML template)
```

---

## FILE IMPORTS SUMMARY

### Common Imports in Chat Files

```tsx
// Thread.tsx
import {
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
} from '@assistant-ui/react'
import { Button } from '@/components/ui/button'
import { SendHorizontalIcon } from 'lucide-react'

// EnhancedMessageText.tsx
import { useMessage } from '@assistant-ui/react'
import { PersonCard, PersonProfileData } from './person-card'
import { MarkdownText } from './markdown-text'
import { useMemo } from 'react'

// PersonCard.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, MapPin, Users, Heart, Sparkles, Target } from 'lucide-react'

// API Route
import { ChatOpenAI } from '@langchain/openai'
import { createPersonSearchTool } from '@/modules/agent/tools/person-search.tool'
import { initGraph } from '@/modules/graph'
```

### Common Imports in Profile Files

```tsx
// Profile Page
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GET_PERSON_PROFILE } from '@/app/graphql/queries/PERSON_QUERIES'
import {
  ProfileLayout,
  ProfileBackground,
  ProfileCard,
  SectionHeader,
} from '@/components/persons'

// People List
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GET_RELATED_PEOPLE } from '@/app/graphql/queries'
```

---

## FEATURE FLAGS & MODES

### Assistant Modes

| Mode      | File                        | System Prompt                   | Use Case          |
| --------- | --------------------------- | ------------------------------- | ----------------- |
| `default` | SYSTEM_PROMPTS[mode]        | Standard GoalPost assistant     | Normal operation  |
| `aiden`   | Aiden Cinnamon Tea Protocol | Creative metaphorical responses | Simulation active |

### Environment Variables Required

```bash
# Database
NEO4J_URI=neo4j+s://xxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=xxx

# AI
OPENAI_API_KEY=sk-xxx

# Auth
JWT_SECRET=xxx
PEPPER=xxx

# Email
RESEND_API_KEY=xxx
```

---

## KEY TRANSITIONS & NAVIGATION

```
Chat → Profile
  1. User: "Tell me about X"
  2. Tool: search_person_by_name executes
  3. Response: "I found X. PERSON_PROFILE_FOUND: {...}"
  4. Component: EnhancedMessageText detects marker
  5. UI: PersonCard renders inline
  6. [Future] Click card → /protected/dashboard/persons/{id}

Dashboard → Profile
  1. Dashboard: /protected/dashboard
  2. Component: PeopleList renders people
  3. User clicks person card
  4. Navigation: router.push(`/protected/dashboard/persons/{id}`)
  5. Page: persons/[id]/page.tsx loads
  6. Data: useQuery(GET_PERSON_PROFILE)
  7. Display: ProfileLayout with all sections

Space → People → Profile
  1. Space detail page loads members
  2. Click on member name
  3. Navigate to person profile
  4. Full profile page displays
```

---

## COMPONENT HIERARCHY (Simplified)

```
<Root App>
  ├─ Chat Interface
  │  └─ Thread
  │     └─ Messages
  │        └─ AssistantMessage
  │           └─ EnhancedMessageText
  │              └─ PersonCard (detected)
  │
  ├─ Dashboard
  │  ├─ PeopleList
  │  │  └─ Person Cards (clickable)
  │  │
  │  └─ PersonProfile Page
  │     └─ ProfileLayout
  │        ├─ ProfileBackground
  │        ├─ ProfileCard (repeated)
  │        └─ Connected People List
  │
  └─ Space Field Detail
     ├─ NVL Canvas
     │  ├─ Person Nodes
     │  └─ Connection Lines
     │
     └─ Panels
        ├─ Person Panel
        ├─ Connection Panel
        └─ Pulse/Resonance Panels
```

---

## TESTING FILES

| File                                                  | Purpose            |
| ----------------------------------------------------- | ------------------ |
| `src/modules/agent/agent.test.ts`                     | Agent unit tests   |
| `src/modules/agent/history.test.ts`                   | History tests      |
| `jest.config.js`                                      | Jest configuration |
| `src/lib/migration-schema/PULSE_MIGRATION_PATTERN.md` | Migration examples |

---

## DOCUMENTATION FILES CREATED

| File                                         | Purpose                               |
| -------------------------------------------- | ------------------------------------- |
| `docs/ANALYSIS_CHAT_PROFILES_CONNECTIONS.md` | Comprehensive analysis (this project) |
| `docs/QUICK_REFERENCE_CHAT_PROFILES.md`      | Quick reference guide                 |
| `docs/QUICKSTART_REACT_AGENT.md`             | ReAct agent setup                     |
| `docs/IMPLEMENTATION_COMPLETE.md`            | Implementation status                 |
| `docs/REACT_AGENT_IMPLEMENTATION.md`         | Agent details                         |
| `docs/CHAT_TESTING_GUIDE.md`                 | Chat testing                          |
| `docs/AI_SDK_ASSISTANT_UI_INTEGRATION.md`    | Integration guide                     |

---

## SUMMARY STATISTICS

| Category           | Count  | Lines       |
| ------------------ | ------ | ----------- |
| Chat Components    | 7      | ~700        |
| Profile Components | 5      | ~250        |
| Chat API/Backend   | 9      | ~1500+      |
| GraphQL Queries    | 6      | ~600        |
| Pages/Routes       | 12     | ~2000+      |
| Schema/Types       | 2      | ~17000      |
| **Total**          | **48** | **~22000+** |

---

## Finding Files by Feature

### I need to modify chat behavior

→ `src/app/api/chat/route.ts`
→ `src/lib/simulation/system-prompts.ts`

### I need to change message display

→ `src/components/assistant-ui/enhanced-message-text.tsx`
→ `src/components/assistant-ui/thread.tsx`

### I need to update profile card appearance

→ `src/components/assistant-ui/person-card.tsx`
→ `src/components/persons/profile-card.tsx`

### I need to modify person search

→ `src/modules/agent/tools/person-search.tool.ts`
→ `src/app/graphql/queries/PERSON_QUERIES.ts`

### I need to change dashboard people display

→ `src/components/dashboard/people-list.tsx`
→ `src/app/graphql/queries/DASHBOARD_QUERIES.ts`

### I need to modify person profile page

→ `src/app/protected/dashboard/persons/[id]/page.tsx`
→ `src/app/graphql/queries/PERSON_QUERIES.ts`

### I need to change connection visualization

→ `src/components/canvas/person-connection-lines.tsx`
→ `src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx`

### I need to add a new tool to chat

→ `src/modules/agent/tools/` (create new file)
→ `src/app/api/chat/route.ts` (register tool)
