# Clickable Connections - User Workflow

## How to Use the Feature

### Step 1: Ask About a Connection in Chat

User opens the chat interface at `/protected/chat` and asks:

```
"What about a connection between robert and jennifer?"
```

### Step 2: AI Returns Profile with Connections

The AI searches for the people and responds with their profile card. The response includes:

- Person's name, email, location
- Passions, interests, traits, fields of care
- **Connected People section** (NEW) with clickable names

### Step 3: Click on a Connected Person

In the "Connected People" section, you see:

```
┌─────────────────────────────────┐
│ Robert Damashek              → │
│ robert@example.com              │
│ Connection: Marriage            │
│ Shared interests: Family, Care  │
│                                 │
│ ─ Click to view full profile ─  │
└─────────────────────────────────┘
```

**Interactive Elements:**

- Hover over the card → background brightens, arrow highlights
- Click anywhere on the card → navigates to Robert's full profile

### Step 4: View Full Profile

Browser navigates to:

```
/protected/dashboard/persons/{robert_id}
```

Full profile page loads showing:

- Complete profile information
- All pulses and contributions
- Related people and spaces
- Field contexts and communities

---

## Component Architecture

### ConnectionLink Component

```typescript
<ConnectionLink
  connection={{
    id: "person_123",
    name: "Robert Damashek",
    email: "robert@example.com",
    why: "Marriage",
    interests: "Family, Education",
    sharedCommunities: ["GoalPost"]
  }}
  variant="detailed"
/>
```

**Props:**

- `connection`: PersonConnectionData object with id, name, email, why, interests, sharedCommunities
- `variant`: 'detailed' (full card) or 'compact' (inline link)

**Support:**

- Browser back button returns to chat
- All standard Next.js Link behavior

---

## Key Features

✅ **Interactive Cards**

- Hover effects with visual feedback
- Clear call-to-action text
- Responsive design

✅ **Rich Information Display**

- Relationship context ("Marriage", "Collaboration", etc.)
- Shared interests
- Shared communities
- Email address

✅ **Seamless Navigation**

- Uses Next.js Link for client-side routing
- No page reload required
- Back button works naturally

✅ **No Breaking Changes**

- Existing chat interface unchanged
- PersonCard interface preserved
- All optional fields handled safely

---

## Technical Details

### Files Involved

1. `src/components/assistant-ui/connection-link.tsx` - New component
2. `src/components/assistant-ui/person-card.tsx` - Updated
3. `src/components/assistant-ui/enhanced-message-text.tsx` - Renders PersonCard
4. `src/modules/agent/tools/person-search.tool.ts` - Returns connectedPeople
5. `src/app/protected/dashboard/persons/[id]/page.tsx` - Target profile page

### Data Flow

```
User asks about connection
  ↓
search_person_by_name tool called
  ↓
Neo4j queries CONNECTED_TO relationships
  ↓
Returns person with connectedPeople array
  ↓
PERSON_PROFILE_FOUND marker sent to client
  ↓
enhanced-message-text parses and renders PersonCard
  ↓
PersonCard renders ConnectionLink components
  ↓
User clicks connection
  ↓
Next.js navigates to /protected/dashboard/persons/{id}
```

---

## Examples

### Example 1: Family Connection

User asks: "Tell me about Jennifer Damashek"

AI response includes:

```
Connected People:
- Robert Damashek
  Connection: Marriage
  Shared interests: Family, Education, Permaculture
  ─ Click to view full profile ─
```

### Example 2: Professional Connection

User asks: "Who works with Sarah?"

AI response includes:

```
Connected People:
- Michael Chen
  Connection: Co-founder
  Shared communities: Tech Initiative, Innovation Lab
  ─ Click to view full profile ─

- Lisa Park
  Connection: Collaborator
  Shared interests: Technology, Community Building
  ─ Click to view full profile ─
```

---

## Edge Cases Handled

✅ Connection without email → email field hidden
✅ Connection without interests → interests field hidden
✅ No shared communities → communities field hidden
✅ Multiple connections → all rendered as clickable cards
✅ No connections → "Connected People" section not shown
✅ Invalid person ID → person profile page handles gracefully

---

## Customization

### Change Hover Color

Edit `connection-link.tsx`:

```typescript
className = 'hover:bg-blue-100' // Change from hover:bg-muted/60
```

### Change Variant

In `person-card.tsx`:

```typescript
variant = 'compact' // Shows only name with arrow
```

### Add More Fields

Extend `ConnectionData` interface and update PersonCard mapping

---

## Production Checklist

✅ Component created with proper TypeScript
✅ Integrated into PersonCard
✅ No breaking changes to existing code
✅ No new dependencies
✅ All imports/exports correct
✅ Error handling in place
✅ Hover states working
✅ Navigation tested
✅ Documentation complete
✅ Ready for deployment
