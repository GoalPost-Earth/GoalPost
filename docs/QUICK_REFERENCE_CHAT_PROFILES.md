# Chat & Profile Components - Quick Reference

## Component Dependency Map

```
┌─────────────────────────────────────────────────────────────┐
│                      Chat Interface                         │
│                   (thread.tsx)                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ThreadPrimitive.Viewport (messages area)             │  │
│  │ ┌────────────────────────────────────────────────┐   │  │
│  │ │ AssistantMessage                               │   │  │
│  │ │ └─ MessagePrimitive.Content                    │   │  │
│  │ │    └─ EnhancedMessageText or MarkdownText      │   │  │
│  │ │       └─ PersonCard (if profile detected)      │   │  │
│  │ │          ├─ Avatar                             │   │  │
│  │ │          ├─ Name + Pronouns                    │   │  │
│  │ │          ├─ Contact (email, location)          │   │  │
│  │ │          ├─ Tags (passions, interests, etc)    │   │  │
│  │ │          └─ Connected People List              │   │  │
│  │ └────────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │ ┌────────────────────────────────────────────────┐   │  │
│  │ │ UserMessage                                    │   │  │
│  │ │ └─ User's text input                           │   │  │
│  │ └────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ComposerPrimitive (input + send button)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Chat to Profile

```
User Input
    │
    └─→ Chat API (/api/chat)
         │
         ├─→ LLM decides if person search needed
         │
         └─→ search_person_by_name Tool
              │
              ├─→ Neo4j Query
              │   └─→ Person node + relationships
              │
              └─→ Return PersonSearchResult
                  {
                    found: true,
                    people: [{
                      id, name, email, photo,
                      passions, traits, interests,
                      communities, connectionCount,
                      connectedPeople
                    }],
                    message: "I found X. PERSON_PROFILE_FOUND: {...}"
                  }
    │
    └─→ Stream Response
         │
         └─→ EnhancedMessageText
              │
              ├─→ Detect PERSON_PROFILE_FOUND marker
              │
              ├─→ Parse JSON data
              │
              └─→ Render PersonCard
                  │
                  └─→ Display Profile
                      ├─ Avatar
                      ├─ Name + Pronouns + Location
                      ├─ Communities (tags)
                      ├─ Passions (tags)
                      ├─ Interests (tags)
                      ├─ Traits (tags)
                      ├─ Fields of Care (tags)
                      ├─ Other Details
                      └─ Connected People
```

---

## Neo4j Person Node Structure

```
Person Node
├─ Core Identity
│  ├─ id: "person_123"
│  ├─ firstName: "Sarah"
│  ├─ lastName: "Johnson"
│  └─ name: "Sarah Johnson" (computed)
│
├─ Contact Info
│  ├─ email: "sarah@example.com"
│  ├─ phone: "+1-555-0123"
│  ├─ pronouns: "she/her"
│  └─ location: "Seattle, WA"
│
├─ Profile Image
│  └─ photo: "https://..."
│
├─ Rich Profile Content
│  ├─ passions: "AI,Teaching,Coffee"
│  ├─ traits: "Creative,Thoughtful,Curious"
│  ├─ interests: "ML,Philosophy,Community"
│  ├─ fieldsOfCare: "Tech,Education,Wellbeing"
│  ├─ favorites: "Books,Coffee,Hiking"
│  └─ careManual: "I work best in collaborative..."
│
├─ Status & Metadata
│  ├─ status: "online"
│  ├─ avatar: "https://..."
│  └─ embedding: [0.123, 0.456, ...] (1536 dims)
│
├─ Timestamps
│  ├─ createdAt: DateTime
│  ├─ updatedAt: DateTime
│  └─ signupDate: DateTime
│
└─ Relationships
   ├─ CONNECTED_TO → Person [why, interests]
   ├─ OWNS → Space (MeSpace/WeSpace)
   ├─ IS_MEMBER → Space (via SpaceMembership)
   ├─ BELONGS_TO → Community
   └─ CREATED_BY → Person[] (who created them)
```

---

## Profile Display Pages

### Chat Context (Real-time)

```
┌─ Inline PersonCard (Assistant Message) ──────┐
│                                               │
│  Avatar     Sarah Johnson (she/her)            │
│             📍 Seattle, WA                    │
│             ✉️ sarah@example.com              │
│                                               │
│  Communities                                  │
│  [Tech Community] [Education]                 │
│                                               │
│  Connections                                  │
│  5 connections                                │
│                                               │
│  ❤️ Passions                                  │
│  [AI] [Teaching] [Coffee]                     │
│                                               │
│  ✨ Interests                                 │
│  [ML] [Philosophy] [Community]                │
│                                               │
│  Connected People                             │
│  John Smith (collaborator)                    │
│  Alice Brown (shared interest: AI)            │
│                                               │
└──────────────────────────────────────────────┘
```

### Dashboard Widget

```
┌─ People List ─────────────────┐
│ [Avatar] Sarah Johnson        │
│          2 spaces owned       │
│          [Connected friend]   │
│                               │
│ [Avatar] John Smith           │
│          1 space owned        │
│          [Team member]        │
└───────────────────────────────┘
```

### Full Profile Page

```
┌─ Person Profile ───────────────────────────────┐
│                                                 │
│  [HEADER]                                       │
│  [Avatar - 96x96]  Sarah Johnson (she/her)     │
│                    Seattle, WA                 │
│                    5 connections               │
│                                                 │
│  [SECTIONS - Scrollable Grid]                  │
│  ┌─ About ─────────────────────────┐          │
│  │ I'm passionate about education... │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌─ Passions ───────────────────────┐          │
│  │ [AI] [Teaching] [Coffee]          │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌─ Interests ──────────────────────┐          │
│  │ [ML] [Philosophy] [Community]     │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌─ Traits ─────────────────────────┐          │
│  │ [Creative] [Thoughtful] [Curious] │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌─ Connected People ───────────────┐          │
│  │ John Smith                        │          │
│  │ Why: collaborators                │          │
│  │ Shared: Tech Community            │          │
│  │                                   │          │
│  │ Alice Brown                       │          │
│  │ Why: mentorship                   │          │
│  │ Shared: Community                 │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  [PULSES SECTION]                              │
│  My Pulses (organized by context)              │
│  ...                                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Person Search Query Logic

```
Input: "John"

Matching Rules (in order of priority):
1. ✓ First name = "John"              → Exact match (highest priority)
2. ✓ Last name = "John"                → Exact match
3. ✓ First name STARTS WITH "Jo"      → Prefix match
4. ✓ Last name STARTS WITH "Jo"       → Prefix match
5. ✓ Full name CONTAINS "John"        → Substring match
6. ✗ Person not found                 → No match

Results: Ordered by priority, then by firstName
```

---

## File Size & Complexity Reference

```
File                                    Lines    Complexity
─────────────────────────────────────────────────────────────
thread.tsx                              ~100     Low
enhanced-message-text.tsx               ~100     Medium
person-card.tsx                         ~250     Medium
person-search.tool.ts                   ~150     High (Cypher)
PERSON_QUERIES.ts                       ~80      Medium
persons/[id]/page.tsx                   ~300+    High
people-list.tsx                         ~100     Low
api/chat/route.ts                       ~300+    High
schema.gql                              ~2000    Medium
─────────────────────────────────────────────────────────────
```

---

## Styling Quick Reference

### Glass-Morphism Cards

```tsx
className="rounded-3xl p-5 bg-gp-glass-bg border-gp-glass-border
           backdrop-blur-2xl shadow-lg dark:shadow-xl
           hover:bg-opacity-85 hover:-translate-y-0.5"
```

### Tag Colors

```tsx
communities: 'primary blue' // bg-primary/10 text-primary
passions: 'red' // bg-red-50 text-red-700
interests: 'blue' // bg-blue-50 text-blue-700
traits: 'purple' // bg-purple-50 text-purple-700
fieldsOfCare: 'green' // bg-green-50 text-green-700
favorites: 'amber' // bg-amber-50 text-amber-700
```

### Avatar Styles

```tsx
// Inline (chat)
avatar = 'h-16 w-16' // 64x64px

// Profile page
avatar = 'size-24 rounded-full border-4 border-white/50' // 96x96px
```

---

## Connection Types in System

```
Person-to-Person Relationships:

1. CONNECTED_TO (Direct)
   └─ Neo4j: (person1)-[rel:CONNECTED_TO]->(person2)
   └─ Properties: why, interests
   └─ Directionality: Undirected (bidirectional query)
   └─ Display: Shown in PersonCard + Connection Panel

2. BELONGS_TO (Community)
   └─ Neo4j: (person)-[:BELONGS_TO]->(community)
   └─ Display: Community tags in PersonCard

3. IS_MEMBER (Space Membership)
   └─ Neo4j: (person)-[mem:IS_MEMBER]->(space)
   └─ Properties: role (OWNER, ADMIN, MEMBER, GUEST)
   └─ Display: Shown in space member lists

4. CREATED_BY (Content ownership)
   └─ Neo4j: (pulse)-[:CREATED_BY]->(person)
   └─ Display: Shows pulses created by person
```

---

## Query Examples

### Get Person with Connections

```graphql
query {
  people(where: { id_EQ: "person_123" }) {
    id
    name
    email
    photo
    pronouns
    location
    passions
    traits
    interests
    fieldsOfCare
    favorites

    # Connections
    connections {
      id
      name
      email
      photo
    }

    # Communities
    communities {
      name
      id
    }

    # Spaces
    ownsSpaces {
      id
      name
    }
    memberOf {
      role
      space {
        id
        name
      }
    }
  }
}
```

### Search Person by Name

```
Tool Call: search_person_by_name
Input: { name: "Sarah" }

Neo4j Query:
  MATCH (p:Person)
  WHERE toLower(p.firstName) CONTAINS "sarah"
     OR toLower(p.lastName) CONTAINS "sarah"
     OR toLower(p.firstName + ' ' + p.lastName) CONTAINS "sarah"
  RETURN p, communities, connectedPeople ...
  ORDER BY (priority ordering)
  LIMIT 10
```

---

## Navigation Shortcuts

### From Chat

```
Chat: "Tell me about X"
  ↓ [PersonCard displayed]
  ↓ [Future: Add onClick handler]
  → /protected/dashboard/persons/{id}
```

### From Dashboard

```
Dashboard → People List
  ↓ [Click person card]
  → /protected/dashboard/persons/{id}
```

### From Spaces

```
Space Details → Members
  ↓ [Click member]
  → /protected/dashboard/persons/{id}
```

---

## System Constraints

| Constraint                | Value                         | Impact                     |
| ------------------------- | ----------------------------- | -------------------------- |
| Person search limit       | 10 results                    | Shows top 10 matches       |
| Connected people shown    | 10 max                        | Limits display in card     |
| Shared communities shown  | 3 max                         | Space in connection info   |
| Passions/Interests format | CSV string                    | Must parse with split(',') |
| Name matching             | Case-insensitive              | "john" matches "John"      |
| CONNECTED_TO direction    | Undirected                    | Bidirectional queries      |
| Avatar dimensions         | 64x64 (chat), 96x96 (profile) | Responsive sizing          |

---

## Common Patterns

### Parse CSV Fields

```tsx
const parseField = (field?: string) => {
  if (!field) return []
  return field
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

// Usage:
const passions = parseField(person.passions)
const traits = parseField(person.traits)
```

### Extract Initials

```tsx
const initials = `${person.firstName[0]}${person.lastName[0]}`.toUpperCase()
// "Sarah Johnson" → "SJ"
```

### Navigate to Profile

```tsx
router.push(`/protected/dashboard/persons/${person.id}`)
```

### Detect Profile in Message

```tsx
const regex =
  /PERSON_PROFILE_FOUND:\s*(\{[\s\S]*?\}(?=\s*(?:PERSON_PROFILE_FOUND:|$)))/g
const match = textContent.match(regex)
if (match) {
  const personData = JSON.parse(match[1])
  // Render PersonCard
}
```

---

## Troubleshooting

| Issue                                 | Solution                                          |
| ------------------------------------- | ------------------------------------------------- |
| PersonCard not rendering              | Check for PERSON_PROFILE_FOUND marker in response |
| Profile data shows as [object Object] | Ensure JSON is properly parsed before rendering   |
| Connections not showing               | Verify CONNECTED_TO relationships exist in Neo4j  |
| Avatar not loading                    | Check photo URL validity and CORS headers         |
| Tags appear empty                     | Check CSV fields aren't split/formatted correctly |
| Search returns no results             | Try different name format (first/last/full)       |

---

## Future Enhancement Ideas

1. **Click-to-navigate from Chat**
   - Add onClick handler to PersonCard
   - Navigate to `/protected/dashboard/persons/{id}`

2. **Connection Management from Chat**
   - Button to create connections
   - Edit connection metadata (why, interests)

3. **Real-time Presence Indicators**
   - Show online/offline status
   - Last activity timestamp

4. **AI Connection Suggestions**
   - Recommend connections based on resonances
   - ML-powered compatibility matching

5. **Profile Editing in Chat**
   - Inline editing of person properties
   - Quick updates without leaving chat

6. **Batch Profile View**
   - Compare multiple people side-by-side
   - View shared connections/interests
