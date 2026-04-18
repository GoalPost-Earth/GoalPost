# Resonance Creation Flow - Comprehensive Analysis

## Overview
The resonance creation feature enables users to manually create semantic links (resonances) between pulses within a field context. It's implemented as a modal-based workflow with GraphQL mutations for persistence.

---

## 1. Entry Points & Modal Triggers

### Primary Trigger Location
**File**: [src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx](src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx)

**Action Button Location** (Lines ~1750-1760):
```typescript
<button
  onClick={(e) => {
    e.stopPropagation()
    setIsResonanceLinkModalOpen(true)
  }}
  disabled={pulseOptions.length < 2}
  title={
    pulseOptions.length < 2
      ? 'Need at least 2 pulses to create a resonance link'
      : 'Create Resonance Link'
  }
  className="cursor-pointer relative flex items-center justify-center size-16 rounded-full gp-glass..."
>
  <span className="material-symbols-outlined text-3xl">link</span>
</button>
```

**Key Constraints**:
- Disabled if fewer than 2 pulses exist (`pulseOptions.length < 2`)
- Button displays a "link" icon
- Located in the action button group with other tools (discover resonances, share, create pulse)

### State Management
```typescript
const [isResonanceLinkModalOpen, setIsResonanceLinkModalOpen] = useState(false)
const [editingResonance, setEditingResonance] = useState<{...} | null>(null)
```

---

## 2. Resonance Link Modal Component

**File**: [src/components/ui/resonance-link-modal.tsx](src/components/ui/resonance-link-modal.tsx)

### Props Interface
```typescript
interface ResonanceLinkModalProps {
  isOpen: boolean
  onClose: () => void
  pulses: PulseOption[]
  onSubmit: (data: {...}) => Promise<void>
  isLoading?: boolean
  onDelete?: () => Promise<void>
  editingResonance?: {...} | null
}
```

### Form Fields
1. **Source Pulse** (React-Select dropdown)
   - Filtered to exclude selected target
   - Disabled during edit mode
   - Displays pulse title or first 50 chars of content
   
2. **Target Pulse** (React-Select dropdown)
   - Filtered to exclude selected source
   - Disabled during edit mode
   - Same display logic as source

3. **Relationship Label** (Text input)
   - Default: "Complements"
   - Examples: "Conflicts", "Supports", "Complements"
   - Required field

4. **Confidence Slider** (Range 0-1)
   - Default: 0.75 (75%)
   - Step: 0.05
   - Displays as percentage (0-100%)

5. **Description** (Textarea)
   - Optional field
   - Placeholder: "Explain why these pulses resonate together..."
   - 3 rows, non-resizable

### Validation
```typescript
const isValid = sourceId && targetId && label.trim()
```
- Both pulses must be selected
- Label must be non-empty

### Modal Modes
- **Create Mode**: Creating new resonance link
- **Edit Mode**: Updating existing resonance link
  - Source and target dropdowns are disabled
  - Delete button appears
  - Submit button changes to "Update Link"

---

## 3. Pulse Selection Mechanism

### Data Source
**Hook**: `useQuery(GET_PULSES_BY_CONTEXT, { variables: { contextId: fieldId } })`

**From [src/app/graphql/queries/PULSE_QUERIES.ts](src/app/graphql/queries/PULSE_QUERIES.ts)**

### Pulse Processing (Lines ~280-320 in page.tsx)
```typescript
useEffect(() => {
  if (!pulsesByContextData) return
  
  const allPulses = [
    ...(data.goalPulses || []).map((p) => ({
      id: p.id,
      title: p.title || '',
      content: p.content || '',
      type: 'goal' as const,
    })),
    ...(data.resourcePulses || []).map((p) => ({...})),
    ...(data.storyPulses || []).map((p) => ({...})),
    ...(data.carePulses || []).map((p) => ({...})),
    ...(data.coreValuePulses || []).map((p) => ({...})),
  ]
  
  setPulseOptions(allPulses)  // Passed to ResonanceLinkModal
}, [pulsesByContextData, resonanceLinkageEnabled])
```

### PulseOption Interface
```typescript
interface PulseOption {
  id: string
  title: string
  content: string
  type: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
}
```

### Filtering in Modal
```typescript
// Filter out selected source from target options and vice versa
const targetOptions = useMemo(
  () => (sourceId ? pulses.filter((p) => p.id !== sourceId) : pulses),
  [pulses, sourceId]
)

const sourceOptions = useMemo(
  () => (targetId ? pulses.filter((p) => p.id !== targetId) : pulses),
  [pulses, targetId]
)
```

---

## 4. Form Styling (React-Select)

The modal uses **React-Select** with custom theme styling:

```typescript
const selectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    borderColor: isDark ? '#444444' : '#e0e0e0',
    minHeight: '40px',
    borderRadius: '8px',
    // ... focus states, hover effects
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3b82f6' : ...,
    color: state.isSelected ? '#ffffff' : ...,
  }),
  // ... input, placeholder, singleValue, indicators
}
```

**Dark Mode Detection**:
```typescript
useEffect(() => {
  setIsDark(document.documentElement.classList.contains('dark'))
  const observer = new MutationObserver(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  })
  observer.observe(document.documentElement, { attributes: true })
}, [])
```

---

## 5. GraphQL Mutations for Resonance Creation

**File**: [src/app/graphql/mutations/RESONANCE_MUTATIONS.ts](src/app/graphql/mutations/RESONANCE_MUTATIONS.ts)

### CREATE_RESONANCE_LINK_MUTATION
```graphql
mutation CreateResonanceLink($input: [ResonanceLinkCreateInput!]!) {
  createResonanceLinks(input: $input) {
    resonanceLinks {
      id
      label
      description
      confidence
      evidence
      createdAt
      source {
        ... on GoalPulse {
          id
          title
          content
          type: __typename
        }
        ... on ResourcePulse {...}
        ... on StoryPulse {...}
      }
      target {
        ... on GoalPulse {...}
        ... on ResourcePulse {...}
        ... on StoryPulse {...}
      }
      context {
        id
        title
      }
    }
    info {
      nodesCreated
      relationshipsCreated
    }
  }
}
```

**Usage in Component** (Lines ~996-1020 in page.tsx):
```typescript
const { data: response } = await createResonanceLink({
  variables: {
    input: [
      {
        label: data.label,
        confidence: data.confidence,
        description: data.description || undefined,
        createdAt: new Date().toISOString(),
        source: {
          connect: [{ where: { node: { id_EQ: data.sourceId } } }],
        },
        target: {
          connect: [{ where: { node: { id_EQ: data.targetId } } }],
        },
      },
    ],
  },
})
```

**Note**: `context` is NOT included in the mutation. Resonances are created context-independently, but the query filtering by context happens on fetch.

### UPDATE_RESONANCE_LINK_MUTATION
```graphql
mutation UpdateResonanceLink(
  $where: ResonanceLinkWhere!
  $update: ResonanceLinkUpdateInput!
) {
  updateResonanceLinks(where: $where, update: $update) {
    resonanceLinks {
      id
      label
      description
      confidence
      evidence
      createdAt
      source {...}
      target {...}
    }
    info {
      relationshipsCreated
      relationshipsDeleted
    }
  }
}
```

**Usage** (Lines ~1032-1043):
```typescript
await updateResonanceLink({
  variables: {
    where: { id_EQ: data.resonanceId },
    update: {
      label_SET: data.label,
      confidence_SET: data.confidence,
      description_SET: data.description || '',
    },
  },
})
```

### DELETE_RESONANCE_LINK_MUTATION
```graphql
mutation DeleteResonanceLink($id: ID!) {
  deleteResonanceLinks(where: { id_EQ: $id }) {
    nodesDeleted
    relationshipsDeleted
  }
}
```

**Usage** (Lines ~1122-1125):
```typescript
await deleteResonanceLink({
  variables: {
    id: editingResonance.id,
  },
})
```

---

## 6. Submission Handler

**File**: [src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx](src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx) (Lines ~994-1060)

### handleResonanceLinkSubmit Function
```typescript
const handleResonanceLinkSubmit = async (data: {
  label: string
  confidence: number
  description: string
  sourceId: string
  targetId: string
  sourceType: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
  targetType: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
  resonanceId?: string
}) => {
  const isEdit = !!data.resonanceId
  
  try {
    if (isEdit) {
      // Update path
      await updateResonanceLink({...})
    } else {
      // Create path
      await createResonanceLink({...})
      
      // Log activity
      const createdResonanceId = response?.createResonanceLinks?.resonanceLinks?.[0]?.id
      await logResonanceActivity({
        variables: {
          input: {
            action: 'created',
            resonanceId: createdResonanceId || '',
            label: data.label,
            sourceId: data.sourceId,
            targetId: data.targetId,
            contextId: fieldId,
            confidence: data.confidence,
          },
        },
      })
    }
    
    // Refetch with 1s delay (Neo4j indexing)
    setTimeout(() => {
      apolloClient.refetchQueries({
        include: ['GetPulsesByContext'],
      })
    }, 1000)
    
    setEditingResonance(null)
  } catch (error) {
    console.error('❌ Error creating resonance link:', error)
    throw error
  }
}
```

### Activity Logging
**Mutation**: `LOG_RESONANCE_ACTIVITY`

Logs:
- **action**: 'created' | 'updated' | 'deleted'
- **resonanceId**: ID of the resonance
- **label**: Resonance label
- **sourceId / targetId**: Pulse IDs
- **contextId**: Field context
- **confidence**: Confidence score

---

## 7. Edit Mode Activation

**File**: [src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx](src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx) (Lines ~1070-1100)

### handleResonanceEdit Function
```typescript
const handleResonanceEdit = (linkId: string) => {
  const resonance = resonanceLinks.find((link) => link.id === linkId)
  
  if (!resonance) return
  
  const sourceId = resonance.source?.[0]?.id
  const targetId = resonance.target?.[0]?.id
  const sourceType = resonance.source?.[0]?.__typename?.replace('Pulse', '').toLowerCase()
  const targetType = resonance.target?.[0]?.__typename?.replace('Pulse', '').toLowerCase()
  
  setEditingResonance({
    id: resonance.id,
    label: resonance.label || 'Complements',
    confidence: resonance.confidence ?? 0.75,
    description: resonance.description || '',
    sourceId,
    targetId,
    sourceType: sourceType as 'goal' | 'resource' | 'story',
    targetType: targetType as 'goal' | 'resource' | 'story',
  })
  
  setIsResonanceLinkModalOpen(true)
}
```

**Triggered from**: ResonancePanel (through parent page component)

---

## 8. Delete Confirmation & Execution

**File**: [src/components/ui/resonance-link-modal.tsx](src/components/ui/resonance-link-modal.tsx)

### Delete Confirmation Dialog
```typescript
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

const handleDelete = async () => {
  if (!onDelete) {
    setError('Delete function not available')
    return
  }
  
  try {
    setShowDeleteConfirm(false)
    await onDelete()
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Failed to delete resonance link'
    )
  }
}
```

**Modal Rendered via Portal**:
```typescript
{showDeleteConfirm &&
  typeof window !== 'undefined' &&
  createPortal(
    <div className="fixed inset-0 flex items-center justify-center pointer-events-auto" style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm">
        <h3>Delete Resonance Link?</h3>
        <p>This will permanently delete this resonance link. This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>,
    document.body
  )}
```

**Delete Button State**:
```typescript
{isEditMode && onDelete && (
  <button
    type="button"
    onClick={() => setShowDeleteConfirm(true)}
    disabled={isLoading}
    className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700..."
  >
    Delete
  </button>
)}
```

---

## 9. Resonance Display & Visualization

### ResonancePanel Component
**File**: [src/components/ui/resonance-panel.tsx](src/components/ui/resonance-panel.tsx)

**Props**:
```typescript
interface ResonancePanelProps {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
  resonance: {
    id?: string
    label: string
    description?: string | null
    pulseCount?: number
    strength?: number
  } | null
  links?: ResonanceLink[]
  pulses?: PulseInResonance[]
}
```

**Displays**:
- Resonance label (formatted)
- Description
- Active status with confidence indicator
- Pattern ID
- Connection count
- Links between pulses

### ResonanceNode Component
**File**: [src/components/ui/resonance-node.tsx](src/components/ui/resonance-node.tsx)

**Visual Indicators**:
- Glowing center node with "link" icon
- Scale effect when active (scale-125)
- Pulsing green badge with "Active" label
- Edit button (pencil icon) when active
- Ripple/blur effects on hover

**NVL Integration** (in page component):
```typescript
resonanceLinks.forEach((link: any) => {
  nodes.push(
    createNvlNode(
      {
        id: `resonance-${link.id}`,
        resonanceId: link.id,
        type: 'resonance',
        label: formatResonanceLabel(link.label) || 'Resonance',
        description: link.description || '',
        confidence: link.confidence || 0,
      },
      60 // Smaller hitbox for resonance nodes
    )
  )
  
  // Create relationships
  const sourceId = link.source?.[0]?.id
  const targetId = link.target?.[0]?.id
  
  relationships.push({
    id: `rel-${link.id}-source`,
    from: `pulse-${sourceId}`,
    to: `resonance-${link.id}`,
    type: 'RESONATES_WITH',
  })
  
  relationships.push({
    id: `rel-${link.id}-target`,
    from: `resonance-${link.id}`,
    to: `pulse-${targetId}`,
    type: 'RESONATES_WITH',
  })
})
```

---

## 10. Data Flow Diagram

```
User clicks "Create Resonance Link" button
         ↓
setIsResonanceLinkModalOpen(true)
         ↓
ResonanceLinkModal opens with pulseOptions
         ↓
User selects:
  - Source Pulse (dropdown)
  - Target Pulse (dropdown)
  - Label (text input)
  - Confidence (slider)
  - Description (textarea)
         ↓
Form validation: sourceId && targetId && label.trim()
         ↓
User clicks "Create Link"
         ↓
handleResonanceLinkSubmit({...})
         ↓
[CREATE] CREATE_RESONANCE_LINK_MUTATION
         or
[UPDATE] UPDATE_RESONANCE_LINK_MUTATION
         ↓
Log activity: LOG_RESONANCE_ACTIVITY
         ↓
Refetch GetPulsesByContext (1s delay)
         ↓
Update resonanceLinks state with new data
         ↓
NVL canvas updates with new resonance node
         ↓
Modal closes, success message shown

On edit:
  Click resonance node → ResonancePanel opens
  Panel provides edit action → handleResonanceEdit(linkId)
  Modal opens with editingResonance state
  Form fields populated with existing data
  Source/Target disabled
  Delete button appears
```

---

## 11. Key Features & Behaviors

### Pre-Submit Validation
- Minimum 2 pulses required to enable button
- Both source and target must be selected
- Label must be non-empty
- Provides user feedback (disabled state with tooltip)

### Post-Submit Behavior
- Success message displayed for 1.5 seconds
- Modal closes automatically
- Form fields reset
- NVL canvas updates with new resonance visualization
- Refetch triggers after 1s (allows Neo4j indexing)

### Edit Mode Specifics
- Source and target pulses cannot be changed
- Only label, confidence, and description are editable
- Delete option available
- Different button text ("Update Link" vs "Create Link")

### Delete Confirmation
- Separate modal dialog (portal-based)
- Z-index management (9999 for backdrop, 10000 for dialog)
- Event propagation prevention
- Loading state during deletion

### Activity Logging
- Created resonance logs via `LOG_RESONANCE_ACTIVITY`
- Captures: action, IDs, labels, confidence, contextId
- Asynchronous (doesn't block UI)

### Error Handling
- Try-catch in submission handler
- User-friendly error messages
- Errors displayed in modal
- Mutation loading states prevent double-submit

---

## 12. Supporting Hooks & Utilities

### useResonanceDiscovery
Used for AI-suggested resonances (separate feature)
```typescript
const { triggerDiscovery, isLoading: isDiscoveringResonances } =
  useResonanceDiscovery({
    spaceId: spaceId || '',
    onSuccess: () => {
      setIsDiscoverSuggestionsModalOpen(true)
      refetchSuggestions?.()
    },
  })
```

### formatResonanceLabel
**File**: [src/utils/graph-utils.ts](src/utils/graph-utils.ts)

Converts machine-readable labels to human-readable format
```typescript
formatResonanceLabel(resonance.label) // e.g., "supports" → "Supports"
```

### createNvlNode
**File**: [src/lib/nvl-utils.ts](src/lib/nvl-utils.ts)

Creates NVL nodes with HTML containers for React components

### renderReactComponentToContainer
Renders React components (PulseNode, ResonanceNode, PersonNode) into NVL node HTML

---

## 13. State Management Summary

| State | Type | Purpose |
|-------|------|---------|
| `isResonanceLinkModalOpen` | boolean | Control modal visibility |
| `editingResonance` | object \| null | Store resonance being edited |
| `pulseOptions` | PulseOption[] | All available pulses for selection |
| `resonanceLinks` | any[] | All resonances in context |
| `activeResonanceNodeId` | string \| null | Highlight active resonance node |
| `selectedResonance` | any \| null | Selected resonance for panel |
| `isCreatingResonanceLink` | boolean | Mutation loading state |
| `isUpdatingResonanceLink` | boolean | Mutation loading state |
| `isDeletingResonanceLink` | boolean | Mutation loading state |

---

## 14. Query Data Structure

### GET_PULSES_BY_CONTEXT Response
```typescript
{
  goalPulses: [{id, title, content, type, createdAt}, ...],
  resourcePulses: [...],
  storyPulses: [...],
  carePulses: [...],
  coreValuePulses: [...],
  fieldContexts: [{
    id,
    resonancesInContext: [{
      id,
      label,
      description,
      confidence,
      evidence,
      createdAt,
      source: [{id, __typename, title, content, createdAt}],
      target: [{id, __typename, title, content, createdAt}]
    }, ...]
  }]
}
```

---

## 15. Key UI/UX Patterns

### Modal Animation
```typescript
// From resonance-link-modal.tsx
animate-fade-in-up  // CSS animation class
```

### Form Styling
- Glass-morphism theme (gp-glass)
- Dark mode aware
- Consistent with app design system
- React-Select with custom theming

### Disabled States
- During mutations (isLoading)
- During edit mode (source/target fields)
- When insufficient pulses (button)

### Accessibility
- Semantic HTML (form, labels, input types)
- Disabled state management
- Title attributes for tooltips
- Keyboard navigation via React-Select

---

## 16. Known Patterns & Anti-Patterns

### Patterns
✅ Context-scoped resonances (queried by fieldContexts relationship)
✅ Activity logging for audit trail
✅ Mutation refetch with delay (Neo4j indexing consideration)
✅ Proper loading states during async operations
✅ Validation before submission
✅ Confirmation dialog for destructive actions

### Considerations
⚠️ Resonances created context-independently (connected via query)
⚠️ 1-second refetch delay (hardcoded, not configurable)
⚠️ Portal-based delete confirmation (event management complexity)
⚠️ No real-time subscriptions (polling via refetch)

---

## Summary

The resonance creation feature is a well-structured modal-based system that:
1. **Triggers** via action button (requires 2+ pulses)
2. **Captures** pulse selections, relationship label, confidence, and description
3. **Validates** form data before submission
4. **Executes** CREATE/UPDATE/DELETE mutations via GraphQL
5. **Logs** activity for audit trail
6. **Refetches** data to update visualization
7. **Displays** resonances as nodes in NVL canvas
8. **Supports** editing and deletion with confirmation

The implementation follows clean patterns with proper separation of concerns, state management, and error handling.
