# Resonance Suggestion System - Implementation Summary

## Overview

Resonance discovery has been converted from direct mutations to a **suggestion-based system** where:

1. **Discovery creates proposals** - Instead of directly creating `ResonanceLink` nodes, the system creates `ResonanceSuggestion` nodes marked as "pending"
2. **User approval required** - Space members can review and accept/decline each suggestion
3. **Space-scoped** - Discovery runs independently for each space, ensuring data isolation

---

## Architecture Changes

### New Node Type: `ResonanceSuggestion`

```
Node: ResonanceSuggestion
├── id: string (rs_*)
├── label: string              // Pattern name (e.g., "grief", "momentum")
├── description: string        // What the pattern represents
├── confidence: number (0-1)   // AI confidence score
├── evidence: string           // Why these pulses resonate
├── status: "pending" | "accepted" | "declined"
├── createdAt: datetime
├── acceptedAt?: datetime      // When approved (if accepted)
└── declinedAt?: datetime      // When rejected (if declined)

Relationships:
├── WeSpace -[:HAS_SUGGESTION]-> ResonanceSuggestion
├── FieldContext -[:HAS_SUGGESTION]-> ResonanceSuggestion
├── ResonanceSuggestion -[:SOURCE]-> FieldPulse
└── ResonanceSuggestion -[:TARGET]-> FieldPulse
```

### Discovery Functions

**`discoverResonancesForPulse(pulseId, spaceId?)`**

- Discovers resonances for a single pulse
- Optional `spaceId` parameter enforces space-scoping
- Returns array of created suggestions (not links)

**`discoverResonancesForSpace(spaceId, lastRunTimestamp?)`**

- Scoped discovery: only processes contexts within the specified space
- Returns all suggestions created in that space
- Replaces global context-by-context approach

**`discoverGlobalResonances(lastRunTimestamp?)`**

- Discovers across all spaces
- Internally calls `discoverResonancesForSpace()` for each space
- Maintains space isolation

---

## New API Endpoints

### 1. List Pending Suggestions

```http
GET /api/resonance/suggestions?spaceId=<SPACE_ID>&status=pending
```

**Response:**

```json
{
  "success": true,
  "spaceId": "space_123",
  "status": "pending",
  "count": 5,
  "suggestions": [
    {
      "id": "rs_abc123",
      "label": "grief",
      "description": "Shared experiences of loss...",
      "confidence": 0.92,
      "evidence": "Both pulses discuss similar emotions",
      "status": "pending",
      "createdAt": "2025-02-15T10:00:00Z",
      "sourcePulseId": "pulse_1",
      "sourcePulseContent": "...",
      "targetPulseId": "pulse_2",
      "targetPulseContent": "...",
      "contextId": "context_1",
      "contextTitle": "Field Context Name"
    }
  ]
}
```

### 2. Accept Suggestion → Create ResonanceLink

```http
POST /api/resonance/suggestions/[id]/accept
```

**Effect:**

- Marks suggestion status as "accepted"
- Creates actual `ResonanceLink` node from the suggestion data
- Links keeps reference to source suggestion ID

**Response:**

```json
{
  "success": true,
  "suggestionId": "rs_abc123",
  "linkId": "rl_xyz789",
  "message": "Suggestion accepted and promoted to ResonanceLink"
}
```

### 3. Decline Suggestion

```http
POST /api/resonance/suggestions/[id]/decline
```

**Effect:**

- Marks suggestion status as "declined"
- Suggestion remains in database for audit trail
- No ResonanceLink created

**Response:**

```json
{
  "success": true,
  "suggestionId": "rs_abc123",
  "message": "Suggestion declined"
}
```

### 4. Manual Discovery (Updated)

```http
POST /api/resonance/discover
```

**Request (Space-scoped):**

```json
{
  "spaceId": "space_123",
  "lastRunTimestamp": "2025-02-14T00:00:00Z"
}
```

**Request (Global):**

```json
{
  "lastRunTimestamp": "2025-02-14T00:00:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "scope": "space_123",
  "suggestionsCreated": 8,
  "suggestions": [...]
}
```

---

## Scheduled Cron Job

**File:** `/src/app/api/cron/discover-resonances.ts`
**Schedule:** Daily at midnight UTC (`0 0 * * *`)
**Configuration:** `vercel.json`

**Workflow:**

1. Generate embeddings for pulses missing them (up to 100/run)
2. Discover resonances across all spaces
3. Create `ResonanceSuggestion` nodes (not direct links)
4. Log results with detailed metrics

---

## Data Flow

### Before (Direct Mutations)

```
Discovery Process
    ↓
[ResonanceLink Created] ← Direct database mutation
```

### After (Suggestion System)

```
Discovery Process
    ↓
[ResonanceSuggestion Created] → pending
    ↓                            ↓
User Reviews              (Audit Trail)
    ↓
[Accept] → [ResonanceLink Created]
    ↓
[Decline] → [Status: declined]
```

---

## Space Scoping Enforcement

Resonance discovery now respects space boundaries:

```cypher
// Before: Global contexts
MATCH (context:FieldContext)
RETURN context.id

// After: Space-scoped contexts
MATCH (space:WeSpace {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)
RETURN context.id
```

**Benefits:**

- ✓ Data isolation per space
- ✓ Multi-tenant safety
- ✓ Efficient targeting
- ✓ Clearer audit trails

---

## Migration Notes

### Existing ResonanceLink Nodes

- Not affected by these changes
- Continue to work as before
- New links created through suggestion acceptance only

### Backwards Compatibility

- `DiscoveredResonance` interface still uses `linkId` field
- Suggestions use `id` field mapped to `linkId` for consistency
- Existing discovery endpoints remain compatible

---

## Testing the System

### Manual Discovery (Space-scoped)

```bash
curl -X POST http://localhost:3000/api/resonance/discover \
  -H "Content-Type: application/json" \
  -d '{"spaceId": "space_123"}'
```

### List Suggestions

```bash
curl "http://localhost:3000/api/resonance/suggestions?spaceId=space_123&status=pending"
```

### Accept Suggestion

```bash
curl -X POST http://localhost:3000/api/resonance/suggestions/rs_abc123/accept
```

### Decline Suggestion

```bash
curl -X POST http://localhost:3000/api/resonance/suggestions/rs_abc123/decline
```

---

## Files Modified

- `src/lib/resonance/discovery/pattern-detector.ts` - Core discovery logic (space-scoped, creates suggestions)
- `src/app/api/resonance/discover/route.ts` - Manual discovery endpoint (supports spaceId parameter)
- `src/app/api/cron/discover-resonances.ts` - Cron job (updated logging)
- `vercel.json` - Cron configuration added
- **NEW:** `src/app/api/resonance/suggestions/route.ts` - List suggestions
- **NEW:** `src/app/api/resonance/suggestions/[id]/accept/route.ts` - Accept suggestion
- **NEW:** `src/app/api/resonance/suggestions/[id]/decline/route.ts` - Decline suggestion

---

## Next Steps

1. **UI Integration** - Build space-member interface to review/approve suggestions
2. **Notification System** - Alert space members when new suggestions arrive
3. **Batch Operations** - Accept/decline multiple suggestions at once
4. **Audit Logging** - Track who approved/declined and when
5. **Analytics** - Monitor suggestion acceptance rates per pattern
