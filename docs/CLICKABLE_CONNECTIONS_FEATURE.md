# Clickable Connections Feature

## What Was Implemented

You now have **clickable UI elements for displaying person connections** in the chat interface. When the AI identifies a connection between people (like "Robert and Jennifer Damashek"), the UI now shows interactive connection cards that open profiles in the dashboard.

---

## Files Created/Modified

### 1. **New Component: `ConnectionLink`**

**File:** [src/components/assistant-ui/connection-link.tsx](src/components/assistant-ui/connection-link.tsx)

A reusable component that renders a clickable connection with:

- Person name (clickable link)
- Email address (if available)
- Relationship context (e.g., "Marriage")
- Shared interests
- Shared communities
- Visual feedback on hover
- Navigation to `/protected/dashboard/persons/{id}`

**Two Variants:**

- `compact` - Inline name link with chevron arrow
- `detailed` - Full card with all information (default)

### 2. **Updated: `PersonCard`**

**File:** [src/components/assistant-ui/person-card.tsx](src/components/assistant-ui/person-card.tsx)

Modified the "Connected People" section to:

- Use the new `ConnectionLink` component instead of static text
- Display connections as interactive cards
- Automatically handle navigation to connected person profiles

---

## How It Works

### Data Flow

```
AI Response
↓
EnhancedMessageText parses PERSON_PROFILE_FOUND markers
↓
PersonCard renders with connectedPeople array
↓
ConnectionLink component makes each connection clickable
↓
Clicking opens /protected/dashboard/persons/{id}
```

### Example Response Format

When the AI mentions a connection, it sends data like this:

```json
{
  "PERSON_PROFILE_FOUND": {
    "id": "person_jennifer",
    "name": "Jennifer Damashek",
    "connectedPeople": [
      {
        "id": "person_robert",
        "name": "Robert Damashek",
        "email": "robert@example.com",
        "why": "Marriage",
        "interests": "Family, Education, Permaculture",
        "sharedCommunities": ["GoalPost Community"]
      }
    ]
  }
}
```

---

## UI Features

### Connection Card Styling

Each connection displays as an interactive card with:

**Normal State:**

- Subtle background color (`bg-muted/30`)
- Border with low opacity
- Clear typography hierarchy

**Hover State:**

- Brightened background (`bg-muted/60`)
- Primary color accent (animated)
- Raised shadow effect
- Right chevron arrow highlights
- Cursor changes to pointer

### Components Used

- `Link` from Next.js (for proper client-side navigation)
- `Lucide React` icons (ChevronRight, Users)
- Tailwind CSS for responsive styling
- Shadcn color system (`gp-primary`, `muted`, etc.)

---

## Example Usage in Chat

When you ask: **"What about a connection between robert and jennifer?"**

The AI responds with Jennifer's profile card, which includes:

```
┌─────────────────────────────────────────┐
│ Jennifer Damashek [Avatar]              │
│ jennifer@example.com                     │
├─────────────────────────────────────────┤
│ Connected People                         │
│                                          │
│ ┌──── [CLICKABLE] ────────────────────┐ │
│ │ Robert Damashek                  →  │ │
│ │ robert@example.com                  │ │
│ │ Connection: Marriage                │ │
│ │ Shared interests: Family, Education │ │
│ │ ─ Click to view full profile ─      │ │
│ └────────────────────────────────────┘ │
│                                          │
│ [More sections...]                       │
└─────────────────────────────────────────┘
```

Clicking on "Robert Damashek" navigates to his full profile.

---

## Customization Options

### To use the compact variant (inline):

Update [person-card.tsx](src/components/assistant-ui/person-card.tsx):

```tsx
<ConnectionLink
  connection={connection}
  variant="compact" // Shows only name + arrow
/>
```

### To customize colors:

Edit [connection-link.tsx](src/components/assistant-ui/connection-link.tsx):

- Hover color: Change `hover:text-gp-primary`
- Background: Change `hover:bg-muted/60`
- Border: Change `hover:border-gp-primary/30`

### To add more details:

Extend the `ConnectionData` interface in [connection-link.tsx](src/components/assistant-ui/connection-link.tsx) to include additional fields from the AI response.

---

## Technical Notes

- **No new dependencies** - Uses existing shadcn/Lucide/Next.js
- **Fully type-safe** - TypeScript interfaces for all data
- **Accessible** - Proper semantic HTML with Link component
- **Performance** - No extra rendering passes, uses memoization where needed
- **Mobile-friendly** - Touch targets are adequate size

---

## Testing

To test the feature:

1. Start the chat at `/protected/chat`
2. Ask: "What about a connection between [person1] and [person2]?"
3. The AI should return a profile card with clickable connections
4. Hover over a connection name - should see hover effects
5. Click → should navigate to that person's profile page

---

## Integration Points

### Related Files

- **Chat Interface:** [src/components/assistant-ui/thread.tsx](src/components/assistant-ui/thread.tsx)
- **Message Renderer:** [src/components/assistant-ui/enhanced-message-text.tsx](src/components/assistant-ui/enhanced-message-text.tsx)
- **Profile Page:** `/protected/dashboard/persons/[id]`
- **Search Tool:** `search_person_by_name` (in chat tools)

### Data Sources

- Connections fetched via `search_person_by_name` tool
- `CONNECTED_TO` relationships stored in Neo4j
- Relationship context in `why` property
- Shared interests in `interests` property

---

## Future Enhancements

Possible additions:

- [ ] Modal preview on hover instead of full navigation
- [ ] Relationship type badges (Marriage, Collaboration, etc.)
- [ ] Quick message button to contact person
- [ ] Shared field contexts indicator
- [ ] Mutual connections count
- [ ] Add/remove connection UI in chat
