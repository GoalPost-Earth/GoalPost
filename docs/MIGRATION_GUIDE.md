# Migration Guide: Reference Schema → Merged Schema

This guide explains how to run the migration script that transforms data from the production Neo4j instance (using the reference schema) to the dev instance (using the merged schema).

## Prerequisites

1. **Neo4j Driver**: Already installed as part of the project dependencies
2. **Access**: Ensure you have access to both:
   - Production database: `neo4j://54.225.112.191:7687`
   - Dev database: `neo4j+s://cfc3e862.databases.neo4j.io`
3. **TypeScript/tsx**: Ensure `tsx` is installed globally or available via npx

## What Gets Migrated

### 1. **People** → People + MeSpaces + FieldContexts
- Creates Person node in dev with all merged properties
- Auto-generates MeSpace named `"{FirstName} {LastName} MeSpace"`
- Creates default FieldContext for the user's pulses
- Establishes OWNS relationship

**Migration Pattern:**
```
Person (all 16 properties merged)
  ↓
Person + MeSpace + FieldContext (nested in MeSpace)
```

### 2. **Communities** → WeSpaces + FieldContexts
- Transforms Community nodes to WeSpace nodes
- Merges all Community properties (description, why, location, time, activities, resultsAchieved, status)
- Creates associated FieldContext named `"{CommunityName} Field"`
- Sets visibility to SHARED

**Migration Pattern:**
```
Community (with description, why, location, etc.)
  ↓
WeSpace (with merged properties) + FieldContext
```

### 3. **Goals** → GoalPulses (in FieldContexts)
- Creates GoalPulse nodes within the appropriate FieldContext
- Maps: `Goal.name` → `GoalPulse.title`, `Goal.description` → `GoalPulse.content`
- Preserves: successMeasures, photo, activities, status, why, location, time

### 4. **Resources** → ResourcePulses (in FieldContexts)
- Creates ResourcePulse nodes in the appropriate FieldContext
- Maps: `Resource.name` → `ResourcePulse.title`
- Preserves: status, why, location, time, description

### 5. **CarePoints** → StoryPulses (in FieldContexts)
- Creates StoryPulse with CarePoint-specific properties
- Preserves: status, why, location, time, levelFulfilled, fulfillmentDate, successMeasures, issuesIdentified, issuesResolved
- These properties remain optional; null values are preserved

### 6. **CoreValues** → StoryPulses (in FieldContexts)
- Creates StoryPulse with CoreValue-specific properties
- Preserves: alignmentChallenges, alignmentExamples, why
- These properties remain optional; null values are preserved

### 7. **Relationships** → ResonanceLinks
All legacy relationship types are preserved as ResonanceLink labels:

| Legacy Relationship | Mapped To | Confidence |
|-------------------|-----------|-----------|
| MOTIVATED_BY | ResonanceLink.label = "MOTIVATED_BY" | 1.0 |
| APPLIED_TO | ResonanceLink.label = "APPLIED_TO" | 1.0 |
| ALIGNED_TO | ResonanceLink.label = "ALIGNED_TO" | 1.0 |
| ENABLES | ResonanceLink.label = "ENABLES" | 1.0 |
| CARES_FOR | ResonanceLink.label = "CARES_FOR" | 1.0 |
| DEPENDS_ON | ResonanceLink.label = "DEPENDS_ON" | 1.0 |
| EMBRACES | ResonanceLink.label = "EMBRACES" | 1.0 |
| PROVIDES | ResonanceLink.label = "PROVIDES" | 1.0 |
| HAS_ACCESS_TO | ResonanceLink.label = "HAS_ACCESS_TO" | 1.0 |
| CONNECTED_TO | ResonanceLink.label = "CONNECTED_TO" | 1.0 |

All migrated relationships have `confidence: 1.0` because they represent explicit user-defined connections, not AI-discovered patterns.

### 8. **Community Memberships** → SpaceMemberships
- Transforms: `Person -[:BELONGS_TO]-> Community`
- To: `Person -[:IS_MEMBER]-> SpaceMembership -[:HAS_MEMBER]-> WeSpace`
- All members get role: "MEMBER"

## Running the Migration

### Step 1: Verify Database Connectivity
```bash
# Test connection to production database
npx tsx scripts/test-neo4j-connection.ts --env=prod

# Test connection to dev database
npx tsx scripts/test-neo4j-connection.ts --env=dev
```

### Step 2: (Optional) Run a Dry-Run First
The current script performs actual writes. For a dry-run, comment out the `devSession.run()` calls or create a separate dry-run version.

### Step 3: Run the Migration
```bash
# Run the full migration
npx tsx scripts/migrate-reference-to-merged.ts
```

The script will:
1. Connect to both databases
2. Read all data from production
3. Transform and write to dev
4. Log progress for each entity type
5. Print a summary with migration statistics
6. Report any errors encountered

### Step 4: Verify the Migration
After migration completes, verify the data was migrated correctly:

```cypher
// Check people count
MATCH (p:Person) RETURN count(p) as people_count

// Check MeSpaces
MATCH (m:MeSpace) RETURN count(m) as mespaces_count

// Check WeSpaces
MATCH (w:WeSpace) RETURN count(w) as wespaces_count

// Check pulses
MATCH (p:FieldPulse) RETURN labels(p) as pulse_type, count(*) as count
GROUP BY labels(p)

// Check ResonanceLinks
MATCH (r:ResonanceLink) 
RETURN r.label as relationship_type, count(*) as count
GROUP BY r.label

// Verify a complete transformation (Alice example)
MATCH (p:Person { firstName: "Alice" })-[:OWNS]->(space:MeSpace)-[:HAS_CONTEXT]->(context:FieldContext)-[:HAS_PULSE]->(pulse:FieldPulse)
RETURN p.firstName + " " + p.lastName as person, space.name as space, context.title as context, pulse.title as pulse
```

## Important Notes

### Data Preservation
- All timestamps are reset to `datetime()` during migration (current migration time)
- If you need to preserve original createdAt/updatedAt, modify the script to copy these values
- Person.createdAt and updatedAt are currently NOT copied; update if needed

### Pulse Relationships to Contexts
The script determines which FieldContext owns each pulse by:
1. For Goals: Finding the owning Person (via MOTIVATED_BY) or Community
2. For Resources: Finding the provider (Person or Community via PROVIDES)
3. For CarePoints: Following ENABLED_BY/CARES_FOR to find owning context
4. For CoreValues: Following EMBRACES relationship to find owner

If a pulse cannot find a valid context, it's logged as an error and skipped.

### Orphaned Entities
If any entities cannot be assigned to a FieldContext during migration:
- They're logged in the `errors` array
- They're skipped (not created in dev)
- Review the migration report to identify and handle these manually

### Two-Phase Migration Approach
For safety, consider a two-phase approach:

**Phase 1: Schema Preparation** (Already done)
- Schema exists in dev database
- Indexes and constraints are set up

**Phase 2: Data Migration** (This script)
- Runs this Cypher transformation
- Validates data integrity
- Allows rollback if needed

## Rollback

If you need to rollback the migration:

```bash
# Delete all newly created nodes in dev database
MATCH (n) WHERE EXISTS(n.id) AND (n:Person OR n:Space OR n:FieldPulse OR n:ResonanceLink) DETACH DELETE n
```

**Warning**: Only run this if you're certain you want to rollback. This will delete all migrated data.

## Performance Considerations

- For large datasets (>10,000 entities), the migration may take several minutes
- Each entity type is migrated sequentially to maintain clarity and error tracking
- The script limits relationship queries to 1000 at a time to avoid memory issues

## Troubleshooting

### Connection Issues
```
Error: Could not find neo4j://ip:port
```
- Verify VPN/network access to production database
- Confirm credentials in mcp.json are correct
- Test with `neo4j-cli` or browser

### Memory Issues
```
Error: JavaScript heap out of memory
```
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npx tsx scripts/migrate-reference-to-merged.ts`
- Run on a machine with more RAM
- Process data in smaller batches

### Duplicate Entries
If you run the migration twice, you may get duplicate entities. To prevent this:
1. Check `MATCH (p:Person { id: $id }) RETURN count(*) > 0` before creating
2. Or delete all migrated data first (see Rollback section)

### Missing Relationships
Some relationships may not migrate if:
- Source or target entity doesn't map to a pulse
- FieldContext cannot be determined
- The relationship type isn't in the standard mapping

These are logged in the error report for manual review.

## Next Steps After Migration

1. **Validate data integrity** using the verification queries above
2. **Update application queries** to use Space → FieldContext → Pulse path
3. **Test access control** by querying through the authorization layer
4. **Verify ResonanceLinks** are correctly scoped to FieldContexts
5. **Update legacy queries** to use new pulse types
6. **Migrate embeddings** (if using vector indexes) for the new pulses
7. **Update Person enrichment** to pull from pulses in FieldContexts

## Support

For questions or issues running the migration:
1. Check the error log in the migration summary
2. Review specific failing entities
3. Consult PULSE_MIGRATION_PATTERN.md for the migration architecture
4. Check merged-schema.gql for type definitions
