# Resonance System Refactoring - Context-Scoped Implementation

## Overview

Refactored the resonance system to scope resonances **within FieldContext boundaries**. This means:

- Resonances only occur between pulses in the **same context**
- **Removed** the `FieldResonance` abstraction layer entirely
- `ResonanceLink` now directly represents semantic connections with the context it belongs to

## Changes Made

### 1. GraphQL Schema (`src/lib/graphql/schema/schema.gql`)

#### Removed

- ❌ `FieldResonance` type - no longer needed as a separate abstraction

#### Updated

- ✅ `ResonanceLink` type now includes:
  - `label: String!` - the semantic pattern label
  - `description: String` - description of the pattern
  - `confidence: Float!` - confidence score (0-1)
  - `evidence: String` - explanation of the connection
  - `context: [FieldContext!]!` relationship via `HAS_RESONANCE`

- ✅ `FieldContext` type now includes:
  - `resonances: [ResonanceLink!]!` relationship via `HAS_RESONANCE`

### 2. Pattern Detector (`src/lib/resonance/discovery/pattern-detector.ts`)

Complete rewrite to scope discovery to FieldContext:

#### Key Changes

- `findSimilarPulsesInContext(pulseId, contextId)` - finds similar pulses **only within the same context**
- `discoverResonancesForPulse(pulseId)` - automatically determines the context from the pulse
- `discoverGlobalResonances()` - processes each context independently
- `createResonanceLinksInDatabase()` - creates links scoped to specific contexts

#### Data Model

Changed from:

```
Pulse ←→ ResonanceLink ←→ Pulse
              ↓
         FieldResonance (pattern)
```

To:

```
FieldContext
      ↓
   HAS_RESONANCE
      ↓
ResonanceLink (contains label + pattern info)
    ↙     ↘
 SOURCE   TARGET
  (Pulse) (Pulse)
```

### 3. Database Migration (`scripts/migrate-resonance-to-context-scope.ts`)

Created migration script that:

1. ✅ Deletes all `RESONATES_AS` relationships
2. ✅ Deletes all `FieldResonance` nodes
3. ✅ Removes orphaned `ResonanceLink` nodes (those with source/target in different contexts)
4. ✅ Adds `HAS_RESONANCE` relationships from contexts to links
5. ✅ Updates link properties (label, description)

**To run migration when database is available:**

```bash
npx tsx scripts/migrate-resonance-to-context-scope.ts
```

## Architecture Benefits

### 1. **Privacy & Scope**

- Resonances are naturally scoped to their context
- No cross-context pattern leakage
- Aligned with space membership boundaries

### 2. **Simpler Model**

- No intermediate `FieldResonance` layer
- Direct pulse-to-pulse connections
- Easier to understand and debug

### 3. **Better Semantics**

- `ResonanceLink` clearly represents a connection within a context
- Label and description are integral to the link
- No need for separate "pattern" abstraction

### 4. **Performance**

- Vector search naturally filtered to context
- No global pattern deduplication overhead
- Smaller graph traversals

## Query Patterns

### Find all resonances in a context

```cypher
MATCH (context:FieldContext {id: $contextId})-[:HAS_RESONANCE]->(link:ResonanceLink)
MATCH (link)-[:SOURCE]->(source:FieldPulse)
MATCH (link)-[:TARGET]->(target:FieldPulse)
RETURN link, source, target
```

### Find resonances for a pulse

```cypher
MATCH (context:FieldContext)-[:HAS_PULSE]->(pulse:FieldPulse {id: $pulseId})
MATCH (context)-[:HAS_RESONANCE]->(link:ResonanceLink)
WHERE (link)-[:SOURCE]->(pulse) OR (link)-[:TARGET]->(pulse)
RETURN link
```

### Ensure context scope in discovery

```cypher
MATCH (context:FieldContext {id: $contextId})-[:HAS_PULSE]->(pulse)
WHERE embedding_similarity >= 0.7
RETURN pulse
```

## Next Steps

1. **Regenerate GraphQL types:**

   ```bash
   npm run codegen
   ```

2. **Run migration when database is available:**

   ```bash
   npx tsx scripts/migrate-resonance-to-context-scope.ts
   ```

3. **Test resonance discovery:**

   ```bash
   curl -X POST http://localhost:3000/api/resonance/discover \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

4. **Verify context scoping:**
   - Check that resonances only appear within their context
   - Confirm no cross-context links exist
   - Validate confidence scores and evidence are preserved

## Files Changed

- ✅ `src/lib/graphql/schema/schema.gql` - schema updates
- ✅ `src/lib/resonance/discovery/pattern-detector.ts` - complete rewrite
- ✅ `scripts/migrate-resonance-to-context-scope.ts` - new migration script
- 📝 `src/lib/resonance/discovery/pattern-detector-old.ts` - backup of old version

## Backward Compatibility Notes

⚠️ **Breaking Changes:**

- `FieldResonance` type removed from API
- `RESONATES_AS` relationships no longer exist
- Existing `FieldResonance` nodes will be deleted during migration
- ResonanceLink structure changed (added context relationship)

✅ **Safe Operations:**

- No changes to `FieldPulse`, `FieldContext`, or `Space` types
- No changes to `Person` or community models
- Existing pulses and conversations remain untouched
