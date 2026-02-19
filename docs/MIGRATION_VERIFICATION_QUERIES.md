# Migration Verification Queries

Use these Cypher queries to verify the migration was successful and data integrity is maintained.

## Summary Statistics

### Overall Migration Counts
```cypher
// Total entities by type
WITH {
  people: (MATCH (p:Person) RETURN count(p) as count),
  meSpaces: (MATCH (m:MeSpace) RETURN count(m) as count),
  weSpaces: (MATCH (w:WeSpace) RETURN count(w) as count),
  fieldContexts: (MATCH (f:FieldContext) RETURN count(f) as count),
  goalPulses: (MATCH (g:GoalPulse) RETURN count(g) as count),
  resourcePulses: (MATCH (r:ResourcePulse) RETURN count(r) as count),
  storyPulses: (MATCH (s:StoryPulse) RETURN count(s) as count),
  resonanceLinks: (MATCH (rl:ResonanceLink) RETURN count(rl) as count)
} as counts
RETURN counts
```

---

## Data Integrity Checks

### 1. People Migration

**Check all people were created with base properties:**
```cypher
MATCH (p:Person)
WHERE p.firstName IS NULL OR p.lastName IS NULL
RETURN count(p) as missing_names
```

Expected: 0 (all people should have names)

**Check MeSpaces created for each person:**
```cypher
MATCH (p:Person)
WHERE NOT EXISTS((p)-[:OWNS]->(:MeSpace))
RETURN p.firstName + ' ' + p.lastName as person_without_space
```

Expected: 0 (each person should own an MeSpace)

**Check FieldContexts created for each MeSpace:**
```cypher
MATCH (m:MeSpace)
WHERE NOT EXISTS((m)-[:HAS_CONTEXT]->())
RETURN m.name as space_without_context
```

Expected: 0 (each MeSpace should have at least one context)

---

### 2. Community to WeSpace Transformation

**Verify all communities transformed:**
```cypher
MATCH (w:WeSpace)
RETURN {
  name: w.name,
  visibility: w.visibility,
  hasDescription: EXISTS(w.description),
  hasContext: EXISTS((w)-[:HAS_CONTEXT]->())
} as weSpace
LIMIT 10
```

Expected: All WeSpaces should have visibility="SHARED" and at least one context

**Check community properties preserved:**
```cypher
MATCH (w:WeSpace)
WHERE w.description IS NULL AND w.why IS NULL AND w.location IS NULL
RETURN count(w) as spaces_with_missing_properties
```

Expected: Depends on source data (0 if all communities had properties)

---

### 3. Pulse Creation and Distribution

**Distribution of pulses by type:**
```cypher
MATCH (p:FieldPulse)
RETURN {
  type: labels(p)[-1],  // Get the most specific label
  count: count(p)
} as pulse_summary
GROUP BY labels(p)[-1]
ORDER BY count DESC
```

**Check all pulses are in contexts:**
```cypher
MATCH (p:FieldPulse)
WHERE NOT EXISTS((p)<-[:HAS_PULSE]-())
RETURN p.title as orphaned_pulse
```

Expected: 0 (all pulses must be in a context)

**Check all contexts belong to spaces:**
```cypher
MATCH (c:FieldContext)
WHERE NOT EXISTS((c)<-[:HAS_CONTEXT]-(:Space))
RETURN c.title as orphaned_context
```

Expected: 0 (all contexts must belong to a space)

---

### 4. GoalPulse Verification

**Check all GoalPulses have required properties:**
```cypher
MATCH (g:GoalPulse)
WHERE g.title IS NULL OR g.content IS NULL
RETURN count(g) as incomplete_goals
```

Expected: 0

**Check GoalPulse property preservation:**
```cypher
MATCH (g:GoalPulse)
RETURN {
  withStatus: COUNT(CASE WHEN g.status IS NOT NULL THEN 1 END),
  withPhoto: COUNT(CASE WHEN g.photo IS NOT NULL THEN 1 END),
  withActivities: COUNT(CASE WHEN g.activities IS NOT NULL THEN 1 END),
  withSuccessMeasures: COUNT(CASE WHEN g.successMeasures IS NOT NULL THEN 1 END)
} as property_counts
```

---

### 5. ResourcePulse Verification

**Check all ResourcePulses have required properties:**
```cypher
MATCH (r:ResourcePulse)
WHERE r.title IS NULL OR r.content IS NULL
RETURN count(r) as incomplete_resources
```

Expected: 0

**Check ResourcePulse properties preserved:**
```cypher
MATCH (r:ResourcePulse)
RETURN {
  total: count(r),
  withStatus: COUNT(CASE WHEN r.status IS NOT NULL THEN 1 END),
  withWhy: COUNT(CASE WHEN r.why IS NOT NULL THEN 1 END),
  withLocation: COUNT(CASE WHEN r.location IS NOT NULL THEN 1 END)
} as resource_summary
```

---

### 6. StoryPulse Verification

**Check StoryPulses with CarePoint properties:**
```cypher
MATCH (s:StoryPulse)
WHERE s.levelFulfilled IS NOT NULL OR s.issuesIdentified IS NOT NULL
RETURN count(s) as carepoint_stories
```

**Check StoryPulses with CoreValue properties:**
```cypher
MATCH (s:StoryPulse)
WHERE s.alignmentChallenges IS NOT NULL OR s.alignmentExamples IS NOT NULL
RETURN count(s) as corevalue_stories
```

**Check mixed properties (should be rare):**
```cypher
MATCH (s:StoryPulse)
WHERE (s.levelFulfilled IS NOT NULL OR s.issuesIdentified IS NOT NULL)
  AND (s.alignmentChallenges IS NOT NULL OR s.alignmentExamples IS NOT NULL)
RETURN count(s) as mixed_properties
```

Expected: 0 (stories should be either CarePoint or CoreValue, not both)

---

### 7. ResonanceLink Verification

**Check all ResonanceLinks have required properties:**
```cypher
MATCH (r:ResonanceLink)
WHERE r.label IS NULL OR NOT EXISTS((r)-[:SOURCE]->()) OR NOT EXISTS((r)-[:TARGET]->())
RETURN count(r) as incomplete_links
```

Expected: 0

**Distribution of ResonanceLink types:**
```cypher
MATCH (r:ResonanceLink)
RETURN {
  label: r.label,
  count: count(r),
  avgConfidence: AVG(r.confidence)
} as resonance_summary
GROUP BY r.label
ORDER BY count DESC
```

Expected: All migrated links should have confidence = 1.0

**Check all links point to valid pulses:**
```cypher
MATCH (r:ResonanceLink)
WHERE NOT EXISTS((r)-[:SOURCE]->(:FieldPulse))
RETURN count(r) as orphaned_sources
```

Expected: 0

---

### 8. SpaceMembership Verification

**Check all memberships are valid:**
```cypher
MATCH (m:SpaceMembership)
WHERE NOT EXISTS((m)<-[:IS_MEMBER]-(:Person))
   OR NOT EXISTS((m)-[:HAS_MEMBER]->(:Space))
RETURN count(m) as invalid_memberships
```

Expected: 0

**Check community members are in WeSpaces:**
```cypher
MATCH (p:Person)-[:IS_MEMBER]->(m:SpaceMembership)-[:HAS_MEMBER]->(w:WeSpace)
RETURN {
  personCount: COUNT(DISTINCT p),
  spaceCount: COUNT(DISTINCT w),
  membershipCount: COUNT(m)
} as membership_summary
```

---

## Access Pattern Verification

### Verify Pulse Access Path

**Complete path for a person's pulses:**
```cypher
MATCH (p:Person {firstName: "Alice"})
      -[:OWNS]->(space:Space)
      -[:HAS_CONTEXT]->(context:FieldContext)
      -[:HAS_PULSE]->(pulse:FieldPulse)
RETURN p.firstName as person, space.name as space, context.title as context, count(pulse) as pulse_count
```

**Complete path for a community's pulses:**
```cypher
MATCH (w:WeSpace {name: "Tech Team"})
      -[:HAS_CONTEXT]->(context:FieldContext)
      -[:HAS_PULSE]->(pulse:FieldPulse)
RETURN w.name as space, context.title as context, count(pulse) as pulse_count
GROUP BY w.name, context.title
```

---

## Relationship Verification

### Check Migrated Relationship Preservation

**MOTIVATED_BY relationships:**
```cypher
WITH "MOTIVATED_BY" as relType
MATCH (pulse1:FieldPulse)
    <-[:SOURCE]-(r:ResonanceLink {label: relType})
    -[:TARGET]->(pulse2:FieldPulse)
RETURN COUNT(r) as motivated_by_count
```

**APPLIED_TO relationships:**
```cypher
WITH "APPLIED_TO" as relType
MATCH (g:GoalPulse)
    <-[:SOURCE]-(r:ResonanceLink {label: relType})
    -[:TARGET]->(res:ResourcePulse)
RETURN COUNT(r) as applied_to_count
```

**All relationship types present:**
```cypher
MATCH (r:ResonanceLink)
WITH DISTINCT r.label as rel_type
RETURN collect(rel_type) as all_relationship_types
```

Expected: Should include MOTIVATED_BY, APPLIED_TO, ALIGNED_TO, ENABLES, CARES_FOR, DEPENDS_ON, EMBRACES, PROVIDES, HAS_ACCESS_TO, CONNECTED_TO

---

## Comparison Queries (Source vs Target)

### Count Comparison
```cypher
// Run this in PROD database
CYPHER
RETURN {
  prodDBPeople: (MATCH (p:Person) RETURN count(p)),
  prodDBCommunities: (MATCH (c:Community) RETURN count(c)),
  prodDBGoals: (MATCH (g:Goal) RETURN count(g)),
  prodDBResources: (MATCH (r:Resource) RETURN count(r)),
  prodDBCarePoints: (MATCH (cp:CarePoint) RETURN count(cp)),
  prodDBCoreValues: (MATCH (cv:CoreValue) RETURN count(cv))
} as source_counts
```

Then compare with DEV database:
```cypher
// Run this in DEV database
RETURN {
  devDBPeople: (MATCH (p:Person) RETURN count(p)),
  devDBMeSpaces: (MATCH (m:MeSpace) RETURN count(m)),
  devDBWeSpaces: (MATCH (w:WeSpace) RETURN count(w)),
  devDBGoalPulses: (MATCH (g:GoalPulse) RETURN count(g)),
  devDBResourcePulses: (MATCH (r:ResourcePulse) RETURN count(r)),
  devDBStoryPulses: (MATCH (s:StoryPulse) RETURN count(s))
} as target_counts
```

Expected relationships:
- `prodDBPeople` ≈ `devDBPeople + devDBMeSpaces` (each person + MeSpace)
- `prodDBGoals` ≈ `devDBGoalPulses`
- `prodDBResources` ≈ `devDBResourcePulses`
- `prodDBCarePoints + prodDBCoreValues` ≈ `devDBStoryPulses`

---

## Data Quality Checks

### Find Potentially Problematic Data

**Pulses with empty titles:**
```cypher
MATCH (p:FieldPulse)
WHERE p.title IS NULL OR trim(p.title) = ""
RETURN labels(p) as pulse_type, count(p) as empty_count
GROUP BY labels(p)
```

**Pulses with empty content:**
```cypher
MATCH (p:FieldPulse)
WHERE p.content IS NULL OR trim(p.content) = ""
RETURN labels(p) as pulse_type, count(p) as empty_content
GROUP BY labels(p)
```

**Contexts with no pulses:**
```cypher
MATCH (c:FieldContext)
WHERE NOT EXISTS((c)-[:HAS_PULSE]->())
RETURN c.title as empty_context
```

**ResonanceLinks with no source or target:**
```cypher
MATCH (r:ResonanceLink)
WHERE NOT EXISTS((r)-[:SOURCE]->()) OR NOT EXISTS((r)-[:TARGET]->())
RETURN r.label as orphaned_label, count(r) as count
GROUP BY r.label
```

---

## Performance Verification

### Index and Query Performance

**Check that important indexes exist:**
```cypher
CALL db.indexes()
YIELD name, type, entityType, properties
RETURN name, type, entityType, properties
```

Expected: Should have indexes on id, label, position, etc.

**Sample query performance - Finding a person's goals:**
```cypher
EXPLAIN MATCH (p:Person {firstName: "Alice"})
        -[:OWNS]->(:MeSpace)
        -[:HAS_CONTEXT]->(:FieldContext)
        -[:HAS_PULSE]->(g:GoalPulse)
RETURN g.title
```

**Sample query performance - Finding related pulses:**
```cypher
EXPLAIN MATCH (p:GoalPulse {id: "pulse_123"})
    <-[:SOURCE]-(r:ResonanceLink)
    -[:TARGET]->(related:FieldPulse)
RETURN related
```

---

## Troubleshooting Queries

### Find All Errors

**Find nodes without IDs (potential issue):**
```cypher
MATCH (n:Person|Space|FieldPulse|ResonanceLink|FieldContext)
WHERE NOT EXISTS(n.id)
RETURN labels(n) as label, count(n) as count
GROUP BY labels(n)
```

Expected: 0

**Find duplicate IDs:**
```cypher
MATCH (n)
WHERE EXISTS(n.id)
WITH n.id as id, count(n) as cnt
WHERE cnt > 1
RETURN id, cnt
ORDER BY cnt DESC
```

Expected: 0

**Find orphaned nodes:**
```cypher
MATCH (p:Person)
WHERE NOT EXISTS((p)-[:OWNS]->())
RETURN p.firstName + ' ' + p.lastName as person_without_space
```

Expected: 0 (should have been created during migration)

---

## Export Results

### Export People with Their Spaces
```cypher
MATCH (p:Person)-[:OWNS]->(space:Space)
RETURN {
  personId: p.id,
  firstName: p.firstName,
  lastName: p.lastName,
  email: p.email,
  spaceId: space.id,
  spaceName: space.name,
  spaceType: labels(space)[labels(space)[-1]]
} as result
```

### Export Complete Pulse Structure
```cypher
MATCH path = (space:Space)-[:HAS_CONTEXT]->(context:FieldContext)-[:HAS_PULSE]->(pulse:FieldPulse)
RETURN {
  spaceId: space.id,
  spaceName: space.name,
  contextId: context.id,
  contextTitle: context.title,
  pulseId: pulse.id,
  pulseTitle: pulse.title,
  pulseType: labels(pulse)[-1]
} as structure
LIMIT 100
```
