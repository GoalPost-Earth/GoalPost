# Frontend Resonance Suggestion System - Implementation Guide

## Overview

Frontend integration complete for the resonance suggestion system. Users can trigger resonance discovery from field pages, review suggestions in a modal with a sequential review workflow, and accept/decline suggestions individually.

---

## Implemented Components

### 1. **ResonanceSuggestionItem** (`src/components/ui/resonance-suggestion-item.tsx`)

Single suggestion card showing:

- ✨ Pattern label + confidence score (color-coded: green 80%+, orange 50-80%, yellow <50%)
- 📝 Pattern description
- 🧠 Two pulse excerpts showing what resonates
- 💡 Evidence section explaining why they connect
- ✓ Accept / ✗ Decline buttons

**Props:**

```ts
interface ResonanceSuggestionItemProps {
  id: string
  label: string
  description: string
  confidence: number
  evidence: string
  sourcePulseId: string
  sourcePulseContent: string
  targetPulseId: string
  targetPulseContent: string
  contextTitle: string
  onAccept: (id: string) => Promise<void>
  onDecline: (id: string) => Promise<void>
  isLoading?: boolean
}
```

---

### 2. **ResonanceSuggestionsModal** (`src/components/ui/resonance-suggestions-modal.tsx`)

Main modal for viewing and managing suggestions with:

- 📊 Three tabs: Pending | Accepted | Declined (with counts)
- 📋 Suggestion list view (grid of cards)
- 🔄 Sequential review mode:
  - "Review All Suggestions" button enters sequential mode
  - One suggestion at a time with prev/next navigation
  - Progress bar showing review progress
  - Auto-advance to next suggestion after accept/decline
- 🔍 Loading states + empty state messaging
- ⌨️ Keyboard-friendly navigation

**Props:**

```ts
interface ResonanceSuggestionsModalProps {
  isOpen: boolean
  onClose: () => void
  spaceId: string
  suggestions?: Suggestion[]
  loading?: boolean
  onAccept?: (id: string) => Promise<void>
  onDecline?: (id: string) => Promise<void>
  onRefresh?: () => Promise<void>
}
```

---

### 3. **useResonanceDiscovery** (`src/hooks/useResonanceDiscovery.ts`)

Custom hook to trigger resonance discovery with built-in UI feedback:

```ts
const { triggerDiscovery, isLoading, error } = useResonanceDiscovery({
  spaceId: 'space_123',
  onSuccess: () => console.log('Discovery complete'),
  onError: (err) => console.error(err),
})

// Usage
await triggerDiscovery()
```

**Behavior:**

- Shows loading toast: "🔍 Discovering resonances..."
- Calls `POST /api/resonance/discover` with `spaceId`
- On success:
  - Dismisses loading toast
  - Shows success toast: "✨ Discovered X resonances!"
  - Calls `onSuccess()` callback (opens modal)
- On error:
  - Shows error toast with error message
  - Calls `onError()` callback

---

### 4. **useResonanceSuggestions** (`src/hooks/useResonanceSuggestions.ts`)

Custom hook to fetch and manage suggestions:

```ts
const {
  suggestions,
  loading,
  error,
  refetch,
  acceptSuggestion,
  declineSuggestion,
} = useResonanceSuggestions({
  spaceId: 'space_123',
  filter: 'all', // 'pending' | 'accepted' | 'declined' | 'all'
  enabled: false, // Don't auto-fetch until modal opened
})

// Accept and refetch
await acceptSuggestion(suggestionId)

// Decline and refetch
await declineSuggestion(suggestionId)

// Manual refetch
await refetch()
```

**Behavior:**

- Fetches from `GET /api/resonance/suggestions?spaceId=X&status=Y`
- Auto-refetches on filter/spaceId change (unless disabled)
- Accept/decline mutations automatically refetch updated list
- Shows success/error toasts via sonner

---

## Integration Points

### Field Page (`src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx`)

**Added:**

1. Import hooks and components:

   ```ts
   import { useResonanceDiscovery } from '@/hooks/useResonanceDiscovery'
   import { useResonanceSuggestions } from '@/hooks/useResonanceSuggestions'
   import { ResonanceSuggestionsModal } from '@/components/ui/resonance-suggestions-modal'
   ```

2. Extract space ID from params:

   ```ts
   const spaceId = params?.id as string
   ```

3. Initialize hooks:

   ```ts
   const { triggerDiscovery, isLoading: isDiscoveringResonances } =
     useResonanceDiscovery({
       spaceId,
       onSuccess: () => {
         setIsDiscoverSuggestionsModalOpen(true)
         refetchSuggestions()
       },
     })

   const {
     suggestions,
     loading: suggestionsLoading,
     refetch: refetchSuggestions,
     acceptSuggestion,
     declineSuggestion,
   } = useResonanceSuggestions({
     spaceId,
     filter: 'all',
     enabled: false, // Manual control
   })
   ```

4. Added discover button to action button group:

   ```tsx
   <button
     onClick={() => triggerDiscovery()}
     disabled={isDiscoveringResonances}
     title="Discover Resonances"
     className="..."
   >
     <span className="material-symbols-outlined">auto_awesome</span>
   </button>
   ```

5. Added modal to page:
   ```tsx
   <ResonanceSuggestionsModal
     isOpen={isDiscoverSuggestionsModalOpen}
     onClose={() => setIsDiscoverSuggestionsModalOpen(false)}
     spaceId={spaceId}
     suggestions={suggestions}
     loading={suggestionsLoading}
     onAccept={acceptSuggestion}
     onDecline={declineSuggestion}
     onRefresh={refetchSuggestions}
   />
   ```

---

## User Workflow

### 1. **Trigger Discovery**

- User clicks ✨ "auto_awesome" button in field canvas
- Button shows disabled state while discovering
- Toast appears: "🔍 Discovering resonances..."

### 2. **Discovery Running**

- Backend discovers resonances for the space (all fields)
- Creates `ResonanceSuggestion` nodes in database
- Returns count of suggestions created

### 3. **Discovery Complete**

- Toast updates: "✨ Discovered 8 resonances! Review them now."
- Modal automatically opens with suggestions

### 4. **Review Suggestions**

- User sees "Pending (8)" tab showing all pending suggestions
- Options:
  - **Review one at a time**: Click "Review All Suggestions" button
    - Enter sequential mode
    - View one suggestion with prev/next navigation
    - Progress bar shows position (1/8, 2/8, etc.)
    - Accept/decline auto-advances to next
  - **Review grid**: Browse all suggestions as cards
    - Accept/decline individually
    - View other tabs (Accepted/Declined) to see history

### 5. **Accept Suggestion**

- Click "Accept" button
- Suggestion converts to `ResonanceLink` in database
- Refetches list
- Tab counts update (Pending -1, Accepted +1)
- Toast: "✨ Suggestion accepted and created!"

### 6. **Decline Suggestion**

- Click "Decline" button
- Suggestion marked as "declined" (stays in database for audit)
- Refetches list
- Tab counts update (Pending -1, Declined +1)
- Toast: "Suggestion declined."

---

## Testing

### Manual Testing Checklist

**Setup:**

- [ ] Field has multiple pulses (at least 10 for good resonances)
- [ ] Pulses have diverse content to enable pattern detection

**Trigger Discovery:**

- [ ] Button is visible in field canvas
- [ ] Loading state works (button disabled, spinner animates)
- [ ] Toast notifications appear (start + completion)
- [ ] Modal opens after discovery completes

**Tab Navigation:**

- [ ] Pending tab shows correct count
- [ ] Accepted tab shows accepted suggestions
- [ ] Declined tab shows declined suggestions
- [ ] Tab counts update after accept/decline

**Sequential Review:**

- [ ] "Review All Suggestions" button visible when pending > 0
- [ ] Clicking enters review mode
- [ ] One suggestion shown at a time
- [ ] Progress bar animates correctly
- [ ] Prev/next buttons work and disable at boundaries
- [ ] "Back to List" button returns to grid view
- [ ] Accept/decline auto-advances to next suggestion
- [ ] Last suggestion returns to grid view

**Grid View:**

- [ ] Confidence colors correct:
  - Green for >= 80%
  - Orange for 50-80%
  - Yellow for < 50%
- [ ] Pulse excerpts truncated to 2 lines
- [ ] Evidence section visible and readable

**Accept/Decline:**

- [ ] Loading spinners show during action
- [ ] Buttons disabled during action
- [ ] Toast notifications show success
- [ ] Tab counts auto-update
- [ ] List updates after action

---

## API Endpoints Used

1. **Trigger Discovery**

   ```
   POST /api/resonance/discover
   Body: { spaceId: string }
   Response: { success: true, suggestionsCreated: number, suggestions: [...] }
   ```

2. **List Suggestions**

   ```
   GET /api/resonance/suggestions?spaceId=X&status=pending|accepted|declined
   Response: { success: true, suggestions: [...], count: number }
   ```

3. **Accept Suggestion**

   ```
   POST /api/resonance/suggestions/[id]/accept
   Response: { success: true, linkId: string, suggestionId: string }
   ```

4. **Decline Suggestion**
   ```
   POST /api/resonance/suggestions/[id]/decline
   Response: { success: true, suggestionId: string }
   ```

---

## Future Enhancements

1. **Space-Level Discovery**: Add "Discover" button to space view toolbar to discover across all fields at once
2. **Batch Operations**: Select multiple suggestions and accept/decline in bulk
3. **Notification Badges**: Show pending suggestion count in space/field headers
4. **Auto-Refresh**: Poll for new suggestions periodically
5. **Filtering**: Filter suggestions by confidence score, pattern type, etc.
6. **Export**: Export accepted resonances as list or graph
7. **Undo**: Allow undoing accept/decline actions within session
8. **Keyboard Shortcuts**: Prev/Next with arrow keys in review mode
9. **AI Explanation**: "Why did AI create this suggestion?" with more detailed evidence
10. **User Feedback**: Rate suggestion quality to improve future discovery

---

## Troubleshooting

| Issue                        | Solution                                                         |
| ---------------------------- | ---------------------------------------------------------------- |
| Modal doesn't open           | Check console for errors, verify spaceId is passed correctly     |
| Suggestions not loading      | Check API endpoint is working, verify spaceId has suggestions    |
| Accept/decline not working   | Check browser network tab for failed requests, verify auth token |
| Toasts not showing           | Verify Sonner provider is in layout, check notification settings |
| Button disabled indefinitely | Check isDiscoveringResonances state, may indicate hook error     |

---

## Files Created/Modified

**Created:**

- `src/components/ui/resonance-suggestion-item.tsx` - Suggestion card component
- `src/components/ui/resonance-suggestions-modal.tsx` - Main modal component
- `src/hooks/useResonanceDiscovery.ts` - Discovery trigger hook
- `src/hooks/useResonanceSuggestions.ts` - Suggestions management hook

**Modified:**

- `src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx` - Added button + modal integration

**API Endpoints (Backend):**

- `src/app/api/cron/discover-resonances.ts` - Scheduled discovery (already created)
- `src/app/api/resonance/discover/route.ts` - Manual discovery endpoint (updated)
- `src/app/api/resonance/suggestions/route.ts` - List suggestions endpoint (created)
- `src/app/api/resonance/suggestions/[id]/accept/route.ts` - Accept suggestion (created)
- `src/app/api/resonance/suggestions/[id]/decline/route.ts` - Decline suggestion (created)
