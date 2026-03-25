# GoalPost Chat Interface & Person Profiles Analysis

**Date:** March 24, 2026  
**Scope:** Chat components, person profile display, data structures for connections/relationships

---

## 1. CHAT INTERFACE COMPONENT (AI Responses)

### 1.1 Main Chat Container: `src/components/assistant-ui/thread.tsx`

**Purpose:** Live chat interface using `@assistant-ui/react` components

**Structure:**

```tsx
<ThreadPrimitive.Root>
  ├── Viewport (scrollable messages area)
  │   ├── Empty State (welcome message with 🍄 icon)
  │   └── Messages (UserMessage + AssistantMessage)
  └── Composer (bottom input area)
```

**Key Components:**

| Component                | Role                 | Notes                                 |
| ------------------------ | -------------------- | ------------------------------------- |
| ThreadPrimitive.Empty    | Welcome screen       | Shows mushroom icon 🍄, intro text    |
| ThreadPrimitive.Messages | Message stream       | Renders user and assistant messages   |
| ThreadPrimitive.Viewport | Scrollable container | `flex-1 overflow-y-auto`              |
| AssistantMessage         | AI response display  | Max-width container with dark styling |
| UserMessage              | User input display   | Right-aligned with gp-primary color   |
| Composer                 | Input/send interface | textarea + send button                |

**Styling:**

- Dark mode support: `dark:bg-[#121b21]`, `dark:border-white/10`
- Responsive: Uses tailwind grid/flex utilities
- Visual hierarchy: Message bubbles with rounded corners and shadows

---

### 1.2 Enhanced Message Renderer: `src/components/assistant-ui/enhanced-message-text.tsx`

**Purpose:** Parse AI responses for person profile data and render inline cards

**Key Features:**

1. **Person Profile Detection**
   - Looks for `PERSON_PROFILE_FOUND:` marker in text
   - Extracts JSON data using regex: `/PERSON_PROFILE_FOUND:\s*(\{[\s\S]*?\}(?=\s*(?:PERSON_PROFILE_FOUND:|$)))/g`
   - Handles multiple profiles in single message

2. **Message Parsing Flow**

   ```
   Message content
     ↓
   Extract text parts from content array
     ↓
   Search for PERSON_PROFILE_FOUND markers
     ↓
   Parse JSON profile data
     ↓
   Split into text + person segments
     ↓
   Render with PersonCard for profiles
   ```

3. **Fallback Behavior**
   - If parsing fails: treats marker text as plain text
   - If no profiles found: renders as `MarkdownText`
   - If profiles found: renders mixed content with spacing

**Code Example:**

```tsx
const personMarkerRegex = /PERSON_PROFILE_FOUND:\s*(\{[\s\S]*?\}(?=\s*(?:PERSON_PROFILE_FOUND:|$)))/g

// Renders as:
<div className="space-y-4">
  {/* Text segments */}
  {/* PersonCard components */}
</div>
```

---

### 1.3 Person Card Component: `src/components/assistant-ui/person-card.tsx`

**Purpose:** Beautiful inline profile card displayed when person data detected

**Data Structure (PersonProfileData):**

```typescript
interface PersonProfileData {
  id: string
  firstName: string
  lastName: string
  name: string
  email?: string
  pronouns?: string
  location?: string
  photo?: string
  status: string // User status (online, offline, etc.)
  passions?: string // CSV format: "AI,Teaching,Coffee"
  traits?: string // CSV format
  interests?: string // CSV format
  fieldsOfCare?: string // CSV format
  favorites?: string // CSV format
  communities?: string[] // Array of community names
  connectionCount?: number // Total connections
  connectedPeople?: Array<{
    id: string
    firstName?: string
    lastName?: string
    name: string
    email?: string
    why?: string // Why connected (from CONNECTED_TO relationship)
    interests?: string // Shared interests
    sharedCommunities?: string[] // Communities both belong to
  }>
}
```

**Visual Layout:**

```
┌─ Person Card ─────────────────┐
│  ┌─ Header ──────────────────┐ │
│  │ Avatar  │ Name (pronouns)  │ │
│  │         │ Location        │ │
│  │         │ Email           │ │
│  └────────────────────────────┘ │
│                                 │
│  Communities: [tag] [tag]       │
│  Connections: 5 connections     │
│                                 │
│  ◆ Passions:                    │
│    [tag] [tag] [tag]            │
│                                 │
│  ✨ Interests:                  │
│    [tag] [tag] [tag]            │
│                                 │
│  # Traits:                      │
│    [tag] [tag] [tag]            │
│                                 │
│  🎯 Fields of Care:             │
│    [tag] [tag] [tag]            │
│                                 │
│  Connected People:              │
│  ├─ Person 1 (shared communities)
│  ├─ Person 2 (why connected)    │
│  └─ Person 3                    │
└─────────────────────────────────┘
```

**Tag Styling:**
| Category | Color | Icon |
|----------|-------|------|
| Communities | Blue (primary) | Users |
| Passions | Red | Heart |
| Interests | Blue | Sparkles |
| Traits | Purple | - |
| Fields of Care | Green | - |
| Favorites | Amber | - |

**Parsing Logic:**

```tsx
// Parse comma-separated strings into arrays
const parseField = (field?: string) => {
  if (!field) return []
  return field
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

// Applied to: passions, traits, interests, fieldsOfCare, favorites
```

---

### 1.4 Chat API Route: `src/app/api/chat/route.ts`

**Purpose:** Backend streaming endpoint for chat with tool integration

**Stream Events:**

```typescript
interface StreamEvent {
  type:
    | 'tool_call'
    | 'tool_result'
    | 'tool_error'
    | 'message'
    | 'done'
    | 'error'
  tool?: string
  args?: unknown
  result?: unknown
  content?: string
  error?: string
}
```

**Tools Available:**

1. **search_person_by_name** - Query people by name (primary tool)
2. **search_community** - Query communities
3. **space-search** - Query spaces
4. **space-rename** - Rename spaces
5. **field-context-search** - Query field contexts
6. **field-context-update** - Update field contexts
7. **pulse-search** - Query pulses
8. **pulse-update** - Update pulses
9. **graph-rag-search** - Semantic search on graph

**Person Search Tool Output Format:**
When a person is found, the tool returns:

```
I found {name} in the GoalPost community. PERSON_PROFILE_FOUND: {...JSON...}
```

This format triggers `EnhancedMessageText` to render the profile card inline.

---

## 2. PERSON PROFILES IN DASHBOARD

### 2.1 Person Profile Page: `src/app/protected/dashboard/persons/[id]/page.tsx`

**Route:** `/protected/dashboard/persons/[id]`

**Layout:**

```tsx
<ProfileBackground />
  ↓
<ProfileLayout>
  ├── Profile Header
  │   ├── Profile Image (96x96)
  │   ├── Name + Edit Button
  │   └── Quick Stats (spaces, connections)
  │
  ├── Main Sections (scrollable grid)
  │   ├── About (bio/description)
  │   ├── Passions
  │   ├── Interests
  │   ├── Traits
  │   ├── Fields of Care
  │   ├── Favorites
  │   ├── Care Manual
  │   └── Connected People (with details)
  │
  └── Pulses Section
      ├── All pulses organized by context/space
      └── Each pulse shows type, title, etc.
```

**Data Source: `GET_PERSON_PROFILE` GraphQL Query**

**Profile Sections:**

1. **Identity** - firstName, lastName, name, email, photo
2. **Status** - status field
3. **Pronouns & Location** - for display
4. **Rich Content** - passions, traits, interests, fieldsOfCare, favorites
5. **Care Manual** - long-form personal guide
6. **Connections** - related people with relationship details
7. **Spaces** - MeSpaces and WeSpaces owned/joined
8. **Pulses** - all pulses by context and space

**Key Components Used:**

- `ProfileCard` - Container for each section
- `ProfileLayout` - Main layout wrapper
- `ProfileBackground` - Decorative background
- `SectionHeader` - Titled section header with icon
- `LinkifiedText` - Text with markdown/link support

---

### 2.2 People List Component: `src/components/dashboard/people-list.tsx`

**Purpose:** Dashboard widget showing related people

**Display:**

```
┌─ People (View People) ────────┐
│ ┌─ Person Card ─────────────┐ │
│ │ Avatar │ Name             │ │
│ │        │ X Spaces owned   │ │
│ │        │ [Connection badge]│ │
│ └────────────────────────────┘ │
└───────────────────────────────┘
```

**Features:**

- Shows 6 people by default (or all if `showAll=true`)
- Grid layout: 1 column mobile, 2 columns desktop
- Click to navigate: `/protected/dashboard/persons/{id}`
- Loading skeleton with animate-pulse
- Empty state with helpful message
- Color accents: left border highlights with gp-primary

**Data Source:** `GET_RELATED_PEOPLE` query

---

### 2.3 Person Navigation Patterns

**From Chat:**

```
User: "Tell me about Sarah Johnson"
    ↓ [Person Search Tool executes]
    ↓ [Returns PERSON_PROFILE_FOUND: {...}]
    ↓ [EnhancedMessageText renders PersonCard]
    ↓ User clicks PersonCard (future enhancement)
    ↓ Navigate to /protected/dashboard/persons/{id}
```

**From Dashboard:**

```
Dashboard → People List
    ↓ Click person card
    ↓ Navigate to /protected/dashboard/persons/{id}
    ↓ Full profile page loads
```

**From Spaces:**

```
Space Details → Member list
    ↓ Click member
    ↓ Navigate to /protected/dashboard/persons/{id}
```

---

## 3. PERSON DATA STRUCTURES & RELATIONSHIPS

### 3.1 Neo4j Person Node Schema

**Labels:** `Person`, `User` (multi-label), `LifeSensor`, `RelationalEntity`

**Properties:**

```cypher
Person {
  // Core Identity (Required)
  id: String (UUID)
  firstName: String!
  lastName: String!
  name: String! (computed from firstName + lastName)

  // Contact
  email: String
  phone: String

  // Profile Display
  photo: String (image URL)
  avatar: String
  pronouns: String (e.g., "he/him")
  location: String (city/region)
  status: String (online/offline/etc.)

  // Rich Profile Content
  passions: String (CSV format)
  traits: String (CSV format)
  interests: String (CSV format)
  fieldsOfCare: String (CSV format)
  favorites: String (CSV format)
  careManual: String (long-form guide)

  // Auth (for users)
  authId: String (Firebase/Auth0 ID)
  password: String @private
  refreshToken: String @private

  // Metadata
  embedding: [Float!] (1536-dim vector)
  createdAt: DateTime
  updatedAt: DateTime
  signupDate: DateTime

  // Onboarding
  onboardingCurrentStepIndex: Int
  onboardingCompletedSteps: [String!]
  onboardingIsCompleted: Boolean
}
```

---

### 3.2 Person-to-Person Relationships

**Current Implementation: Direct CONNECTED_TO edges**

```cypher
(person1:Person)-[conn:CONNECTED_TO]->(person2:Person)
```

**Relationship Properties:**

```cypher
CONNECTED_TO {
  why: String          // Reason for connection (e.g., "collaborators")
  interests: String    // Shared interests
}
```

**Directionality:** Undirected (queryDirection: UNDIRECTED in schema)

**GraphQL Access:**

```graphql
type Person {
  connections: [Person!]!
    @cypher(
      statement: """
      MATCH (this)-[:CONNECTED_TO]-(other:Person)
      RETURN other
      """
    )
}
```

**Example Query:**

```graphql
query {
  people(where: { id_EQ: "person_123" }) {
    id
    name
    connections {
      id
      firstName
      lastName
      name
      email
      photo
    }
  }
}
```

---

### 3.3 Person Search Tool - Detailed Query

**Tool Name:** `search_person_by_name`  
**File:** `src/modules/agent/tools/person-search.tool.ts`

**Search Algorithm:**

```
Query matches if name parameter matches any of:
├─ Contained in firstName (case-insensitive)
├─ Contained in lastName (case-insensitive)
├─ Contained in full name (firstName + lastName)
├─ Starts with firstName
├─ Starts with lastName
└─ Exactly matches first/last name
```

**Example Matches:**
| Search | Matches |
|--------|---------|
| "Rob" | Robert Damaschke, Robert Smith |
| "John" | John Doe, John Smith |
| "Smith" | Jane Smith, John Smith |
| "Robert Damaschke" | Robert Damaschke |
| "robe" | Robert Damaschke |

**Results Return (up to 10):**

```typescript
{
  found: boolean
  count: number
  people: [
    {
      id: string
      firstName: string
      lastName: string
      name: string
      email?: string
      pronouns?: string
      location?: string
      photo?: string
      status: string
      passions?: string (CSV)
      traits?: string (CSV)
      interests?: string (CSV)
      fieldsOfCare?: string (CSV)
      favorites?: string (CSV)
      communities?: string[]
      connectionCount?: number
      connectedPeople?: [
        {
          id, firstName, lastName, name, email, photo
          why, interests, sharedCommunities
        }
      ]
    }
  ]
  message: string          // User-friendly response
  needsDisambiguation: boolean
}
```

**Ordering:**

1. Exact first name matches
2. Exact last name matches
3. First name starts with search term
4. Other matches
5. Alphabetical by firstName

---

### 3.4 Space-Person Relationships

**Via Space Membership:**

```cypher
(person:Person)-[mem:IS_MEMBER]->(space:Space)
(person:Person)-[owns:OWNS]->(space:Space)
```

**Membership Properties (SpaceMembership):**

```typescript
{
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
  addedAt: DateTime
  member: Person // The person
  space: Space // The space
}
```

**GraphQL Access:**

```graphql
type Person {
  ownsSpaces: [Space!]! # Owned spaces
  memberOf: [SpaceMembership!]! # Member relationships
}

type Space {
  owner: Person!
  members: [SpaceMembership!]!
}
```

---

### 3.5 Pulse Access Through Spaces

**Connection Pattern:**

```
Person
  └─ ownsSpaces → Space (MeSpace/WeSpace)
       └─ contexts → FieldContext
            └─ pulses → FieldPulse (Goal/Resource/Story)
                 └─ createdBy → Person
```

**Example Query:**

```graphql
query {
  people(where: { id_EQ: "person_123" }) {
    ownsSpaces {
      id
      name
      contexts {
        id
        title
        pulses {
          id
          title
          __typename # GoalPulse, ResourcePulse, StoryPulse
        }
      }
    }
  }
}
```

**Apollo Query Used in Profile Page:**

File: `src/app/graphql/queries/PERSON_QUERIES.ts`

```graphql
query getPersonProfile($personId: ID!) {
  people(where: { id_EQ: $personId }) {
    id, firstName, lastName, name
    email, photo, traits, passions
    fieldsOfCare, interests, careManual, favorites

    connections {
      id, firstName, lastName, name, email, photo
    }

    ownsSpaces {
      ... on MeSpace {
        id, name, visibility, createdAt
        contexts { id, title }
      }
      ... on WeSpace {
        id, name, visibility, createdAt
        contexts {
          id, title
          pulses(where: { createdBy_SOME: { id_EQ: $personId } }) {
            id, title, intensity
          }
        }
      }
    }

    memberOf {
      id, role
      space { ... }
    }
  }
}
```

---

## 4. EXISTING COMPONENTS FOR PERSON DISPLAY

### 4.1 Component Hierarchy

```
chat/thread.tsx (main chat interface)
  └─ ThreadPrimitive.Messages
     └─ AssistantMessage
        └─ EnhancedMessageText
           ├─ MarkdownText (fallback for text-only)
           └─ PersonCard (inline profile display)
              └─ Avatar + Tags + Connected People

dashboard/page.tsx
  └─ PeopleList
     └─ Person cards (clickable navigation)

dashboard/persons/[id]/page.tsx (detail page)
  └─ ProfileLayout
     ├─ ProfileBackground
     └─ ProfileCard (reusable container)
        ├─ SectionHeader (title + icon)
        ├─ Profile Header (avatar, name, bio)
        ├─ ListifiedText (for rich content)
        └─ Connected People List
```

### 4.2 Reusable Profile Components

| Component             | File                                                | Purpose                                               |
| --------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| `ProfileCard`         | `components/persons/profile-card.tsx`               | Generic section container with glass-morphism styling |
| `ProfileLayout`       | `components/persons/profile-layout.tsx`             | Page wrapper with responsive grid layout              |
| `ProfileBackground`   | `components/persons/profile-background.tsx`         | Decorative background element                         |
| `SectionHeader`       | `components/persons/section-header.tsx`             | Titled section header with icon                       |
| `PersonCard`          | `components/assistant-ui/person-card.tsx`           | Inline profile display (chat context)                 |
| `EnhancedMessageText` | `components/assistant-ui/enhanced-message-text.tsx` | Message renderer with profile detection               |
| `MarkdownText`        | `components/assistant-ui/markdown-text.tsx`         | Plain text/markdown rendering                         |

### 4.3 Styling System

**Glass-Morphism Profile Cards:**

```tsx
className={`
  h-full rounded-3xl p-5
  bg-gp-glass-bg border-gp-glass-border
  backdrop-blur-2xl
  shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)]
  dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]
  hover:bg-opacity-85 hover:shadow-lg hover:-translate-y-0.5
  ${className}
`}
```

**Color Variables:**

- Primary: `gp-primary` (for main accents)
- Text: `gp-ink-muted`, `gp-ink-soft`
- Background: `gp-surface`, `gp-surface-dark`
- Glass effect: `gp-glass-bg`, `gp-glass-border`

**Tag Colors:**

```tsx
communities: 'bg-primary/10 text-primary'
passions: 'bg-red-50 text-red-700 dark:bg-red-950'
interests: 'bg-blue-50 text-blue-700 dark:bg-blue-950'
traits: 'bg-purple-50 text-purple-700'
fieldsOfCare: 'bg-green-50 text-green-700'
favorites: 'bg-amber-50 text-amber-700'
```

---

## 5. CONNECTION DISPLAY IN FIELD DETAIL PAGE

### 5.1 Space-Specific Connections

**File:** `src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx`

**Visualization Context:**

- Shows person nodes on NVL canvas
- Displays connection lines between persons
- Panels for viewing connection details

**Person Data Structure (in this context):**

```typescript
type PersonData = {
  personId: string
  firstName: string
  lastName: string
  name: string | null
  email: string | null
  photo: string | null
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
}

type PersonConnection = {
  personId: string
  connectedPersonIds: string[]
}
```

**Connection Visualization:**

```tsx
// PersonConnectionLines component
(person1) ←→ (person2)
            ↑
         midpoint
      (clickable)
```

### 5.2 Connection Panel Component

**Features:**

- Displays full connection details
- Shows why people are connected (from CONNECTED_TO.why)
- Lists shared interests
- Shows shared communities
- Bidirectional view of connections

---

## 6. DATA FLOW DIAGRAM

```
┌─ User Query ─────────────────────────────┐
│ "Tell me about Sarah Johnson"             │
└──────────────────┬──────────────────────┘
                   ↓
        ┌─ Chat API Route ─┐
        │ /api/chat        │
        └────────┬─────────┘
                 ↓
    ┌─ Person Search Tool ─────┐
    │ Queries Neo4j database    │
    │ Matches: "Sarah Johnson"  │
    └──────────┬────────────────┘
               ↓
    ┌─ Returns PersonSearchResult ──────────────┐
    │ {                                         │
    │   found: true                             │
    │   count: 1                                │
    │   people: [{...full profile...}]          │
    │   PERSON_PROFILE_FOUND: {...}             │
    │ }                                         │
    └─────────────┬────────────────────────────┘
                  ↓
        ┌─ Stream to Frontend ──┐
        │ (SSE event stream)    │
        └────────┬──────────────┘
                 ↓
    ┌─ EnhancedMessageText Component ──────────┐
    │ Detects PERSON_PROFILE_FOUND marker      │
    │ Parses JSON profile data                 │
    └─────────────┬────────────────────────────┘
                  ↓
        ┌─ Renders PersonCard ──────┐
        │ Shows beautiful profile   │
        │ - Avatar + Name           │
        │ - Passions/Interests/etc  │
        │ - Connected People        │
        │ - Communities             │
        └──────────────────────────┘
```

---

## 7. FUTURE ENHANCEMENT OPPORTUNITIES

### 7.1 From Chat Profile to Dashboard

**Add Click Handler to PersonCard:**

```tsx
<PersonCard
  person={personData}
  onClick={() => {
    router.push(`/protected/dashboard/persons/${personData.id}`)
  }}
  className="cursor-pointer hover:shadow-lg"
/>
```

### 7.2 Connection Editing from Chat

Could add mutations to:

- Create new connections
- Update connection metadata (why, interests)
- Remove connections

### 7.3 Semantic Connection Suggestions

Could enhance display to show:

- AI-discovered resonances between people
- Shared fields of care
- Complementary passions/traits

### 7.4 Real-time Presence Indicators

Could add:

- Online/offline status badges
- Last activity timestamp
- Active workspace indicators

---

## 8. SUMMARY: KEY FILES

| File                                                    | Purpose                  | Size        |
| ------------------------------------------------------- | ------------------------ | ----------- |
| `src/components/assistant-ui/thread.tsx`                | Chat UI container        | ~100 lines  |
| `src/components/assistant-ui/enhanced-message-text.tsx` | Profile detection parser | ~100 lines  |
| `src/components/assistant-ui/person-card.tsx`           | Profile card display     | ~250 lines  |
| `src/app/api/chat/route.ts`                             | Chat backend + tools     | ~300+ lines |
| `src/modules/agent/tools/person-search.tool.ts`         | Neo4j person query       | ~150 lines  |
| `src/app/protected/dashboard/persons/[id]/page.tsx`     | Profile page             | ~300+ lines |
| `src/components/dashboard/people-list.tsx`              | People widget            | ~100 lines  |
| `src/app/graphql/queries/PERSON_QUERIES.ts`             | Person GraphQL queries   | ~80 lines   |
| `src/lib/graphql/schema/schema.gql`                     | Neo4j schema             | ~2000 lines |

---

## 9. NAVIGATION ARCHITECTURE

```
Home (/)
  ↓ [Authenticated]
  ├─ Spaces (/protected/spaces)
  │   └─ Space Details → People List
  │       └─ Click Person → Profile
  │
  ├─ Dashboard (/protected/dashboard)
  │   ├─ People List Widget
  │   │   └─ Click Person Card → Profile
  │   │
  │   └─ Person Profile (/protected/dashboard/persons/[id])
  │       └─ Full profile with all details
  │
  ├─ Chat (/protected/assistant or / with simulation)
  │   ├─ Query: "Tell me about X"
  │   ├─ PersonCard inline
  │   └─ [Future] Click to view profile
  │
  └─ Field Context Detail
      └─ Connection visualizations
          ├─ Person nodes on canvas
          ├─ Connection lines
          └─ Connection panel details
```

---

## 10. GLOSSARY

| Term                     | Definition                                               |
| ------------------------ | -------------------------------------------------------- |
| **PersonProfileData**    | Interface for person data displayed in UI                |
| **PERSON_PROFILE_FOUND** | Marker string used to signal AI found a person           |
| **EnhancedMessageText**  | Chat component that parses responses for profiles        |
| **PersonCard**           | React component displaying person profile inline         |
| **CONNECTED_TO**         | Neo4j relationship type for person-to-person connections |
| **SpaceMembership**      | Relationship linking people to spaces with role          |
| **FieldContext**         | Thematic container for pulses within a space             |
| **Pulse**                | User contribution (Goal, Resource, Story, Care)          |
| **Resonance**            | AI-discovered pattern between pulses                     |
| **Glass-morphism**       | UI design pattern with backdrop blur effect              |
