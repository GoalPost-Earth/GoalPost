## Migration Script Updates - Detailed Explanation

### Overview
Updated the migration script to properly handle:
1. **Context determination** based on CREATED_BY and relationship chains
2. **Entity sharing** across multiple spaces/contexts based on all relationships
3. **Complete resonance link creation** for all semantic relationships

---

## Context Determination Logic

### For Each Entity Type (Goal, Resource, CarePoint, CoreValue)

#### Primary Context (Ownership)
The primary context is determined by the **creator** of the entity:
- If CREATED_BY → Person: Place in that person's **MeSpace context**
- If CREATED_BY → Community: Place in that community's **WeSpace context**
- If no CREATED_BY: Use the first related entity (MOTIVATED_BY, PROVIDES, CARES_FOR, or EMBRACES)

#### Secondary Contexts (Sharing)
After determining primary context, scan for **related entities** and add the pulse to their contexts:

**For Goals:**
- Find all MOTIVATED_BY relationships: Person/Community
- Add pulse to their contexts (excluding the creator)

**For Resources:**
- Find all PROVIDES relationships: Person/Community
- Find all DEPENDS_ON relationships: Other Resources (indirect sharing)
- Add pulse to their contexts (excluding the creator)

**For CarePoints:**
- Find all CARES_FOR relationships: Person/Community  
- Find all DEPENDS_ON relationships: Resources (indirect)
- Add pulse to their contexts (excluding the creator)

**For CoreValues:**
- Find all EMBRACES relationships: Person/Community
- Find all ALIGNED_TO relationships: Goals → Persons (indirect)
- Add pulse to their contexts (excluding the creator)

---

## Resonance Links (Semantic Relationships)

All semantic relationships between entities that become pulses are converted to ResonanceLinks:

### Captured Relationship Types

| Source | Target | Relationship | Prod Count | Migration |
|--------|--------|--------------|-----------|-----------|
| Goal | CarePoint | ENABLES | 3 | ✅ |
| Goal | CarePoint | ENABLED_BY | 2 | ✅ |
| Goal | CoreValue | ALIGNED_TO | 45 | ✅ |
| Goal | Resource | APPLIED_TO | 108 | ✅ |
| Resource | Resource | DEPENDS_ON | 14 | ✅ |
| Resource | CarePoint | APPLIED_IN | 1 | ✅ |
| CarePoint | Goal | CARES_FOR | 8 | ✅ |
| CarePoint | Resource | DEPENDS_ON | 10 | ✅ |

**Total Expected Resonance Links: ~201**

### ResonanceLink Creation Process

1. Find all semantic relationships between pulses in production
2. Map source/target entities to their pulse IDs (pulse_<originalId>)
3. Create ResonanceLink node with:
   - `label`: Original relationship type (ALIGNED_TO, APPLIES_TO, etc.)
   - `description`: Semantic description
   - `confidence`: null (explicit user-defined relationship)
   - `evidence`: "<RelType>"
4. Create SOURCE and TARGET relationships to pulses
5. Connect ResonanceLink to **all contexts** containing either source or target pulse
   - Ensures resonance is visible in multiple spaces when pulses are shared

---

## Key Changes from Previous Version

### What Changed
| Aspect | Before | After |
|--------|--------|-------|
| Context assignment | MOTIVATED_BY only | CREATED_BY primary + relationship chains |
| Fallback logic | Limited fallbacks | Creator-based fallback applied |
| Resonance scope | Same-context only | All contexts where either pulse exists |
| Relationship types | Limited set | All semantic relationships captured |
| Sharing logic | Hard to track | Clear cascade from creator + relationships |

### Example Migration Scenario

**Production Data:**
```
Person:alice -[CREATED_BY]-> Goal:goal1
Person:bob -[MOTIVATED_BY]-> Goal:goal1
Community:team1 -[MOTIVATED_BY]-> Goal:goal1
Goal:goal1 -[ALIGNED_TO]-> CoreValue:cv1
Person:alice -[EMBRACES]-> CoreValue:cv1
```

**Migration Result:**
```
goalPulse1:
  - Created in: context_alice_goals (CREATED_BY)
  - Shared with: context_bob_goals, context_team1_field (MOTIVATED_BY)

storyPulse_cv1:
  - Created in: context_alice_goals (CREATED_BY)
  - Shared with: (no additional shares from EMBRACES alone)

Resonance Link:
  - SOURCE: goal1 -> TARGET: cv1 (ALIGNED_TO)
  - Connected to: context_alice_goals, context_bob_goals, context_team1_field
```

---

## Expected Results After Migration

### Entity Counts
- **People**: 10 → 10 (no change)
- **GoalPulses**: 42 → 49 (7 recovered)
- **ResourcePulses**: 72 → 84 (12 recovered)
- **StoryPulses**: 22 → 31 (9 recovered from CarePoints + CoreValues)
- **MeSpaces**: 12 → 10 (matches people count)
- **WeSpaces**: 3 → 2 (matches communities count)
- **ResonanceLinks**: 52 → ~201 (all semantic relationships)

### Key Improvements
✅ All goals migrated (including those without MOTIVATED_BY)
✅ All resources migrated (including those without PROVIDES)
✅ All story pulses migrated (complete CarePoints + CoreValues)
✅ Complete resonance link network (201 total relationships)
✅ Proper sharing across multiple spaces
✅ All semantic relationships preserved

---

## Testing & Verification

Run the verification script after migration:
```bash
npx tsx scripts/verify-migration.ts
```

This will:
1. Count entities in production vs dev
2. Calculate discrepancies
3. Find orphaned entities (no relationships)
4. Report missing specific entities
5. Display comprehensive comparison report

**Expected output:** All counts should match (no red ❌ indicators)
