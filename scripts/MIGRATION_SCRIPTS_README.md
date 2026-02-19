# Migration Scripts - Quick Reference

This directory contains scripts for migrating data from the production Neo4j instance (reference schema) to the dev instance (merged schema).

## Scripts Overview

### 1. `validate-migration-setup.ts`
**Purpose**: Pre-flight checks before running the migration

**What it does**:
- ✅ Tests connectivity to both databases
- ✅ Counts entities in production database
- ✅ Validates dev database schema exists
- ✅ Checks for existing data in dev (warns if found)
- ✅ Provides detailed validation report

**Usage**:
```bash
npx tsx scripts/validate-migration-setup.ts
```

**Output**: Validation report with pass/fail status

**When to run**: 
- ✅ Before running the main migration for the first time
- ✅ If you suspect database connectivity issues
- ✅ To estimate data migration volume

---

### 2. `migrate-reference-to-merged.ts`
**Purpose**: Main migration script that transforms all data

**What it does**:
1. Migrates People with auto-created MeSpaces and FieldContexts
2. Transforms Communities to WeSpaces
3. Creates GoalPulses from Goals
4. Creates ResourcePulses from Resources
5. Creates StoryPulses from CarePoints and CoreValues
6. Transforms all relationships to ResonanceLinks
7. Migrates Community memberships to SpaceMemberships
8. Generates detailed migration report

**Usage**:
```bash
# Run the full migration
npx tsx scripts/migrate-reference-to-merged.ts
```

**Output**: 
- Real-time progress logs for each entity type
- Final migration summary with statistics
- Error report if any issues occurred

**Execution time**: 
- Depends on data volume
- ~5-30 minutes for average datasets (100-10,000 entities)
- Estimated: 100ms per entity

**When to run**:
- ✅ After validation script passes
- ✅ When you're ready to migrate all data
- ✅ Only need to run once per database

---

## Migration Workflow

### Step 1: Validate Setup
```bash
npx tsx scripts/validate-migration-setup.ts
```

Expected output:
```
✅ VALIDATION PASSED: Safe to run migration
```

### Step 2: Run Migration
```bash
npx tsx scripts/migrate-reference-to-merged.ts
```

Expected output:
```
🚀 Starting migration from reference schema to merged schema...

📝 Migrating People...
  ✓ John Doe
  ✓ Jane Smith
  ... (continues for each entity type)

📊 MIGRATION SUMMARY
====================
✅ People Created:           25
✅ MeSpaces Created:          25
✅ FieldContexts Created:     50
✅ GoalPulses Created:        75
✅ ResourcePulses Created:    30
✅ StoryPulses Created:       45
✅ Communities Transformed:   5
✅ WeSpaces Created:          5
✅ ResonanceLinks Created:    120
✅ Memberships Migrated:      12

❌ Errors: 0
```

### Step 3: Verify Results
After migration completes, verify in the dev database:

```cypher
// Verify person count matches
MATCH (p:Person) RETURN count(p) as person_count

// Verify all MeSpaces were created
MATCH (m:MeSpace) RETURN count(m) as mespace_count

// Check pulse distribution
MATCH (p:FieldPulse) 
RETURN labels(p)[-1] as pulse_type, count(*) as count
GROUP BY labels(p)[-1]
ORDER BY count DESC

// Verify a complete structure (example)
MATCH (p:Person)-[:OWNS]->(space:MeSpace)-[:HAS_CONTEXT]->(ctx:FieldContext)-[:HAS_PULSE]->(pulse)
WHERE p.firstName = "John"
RETURN p.firstName as person, space.name as space, count(pulse) as pulse_count
```

---

## Key Migration Mappings

### Entity Transformations
```
Person.name → Person.firstName + Person.lastName
Goal.name → GoalPulse.title; Goal.description → GoalPulse.content
Resource.name → ResourcePulse.title
CarePoint.name → StoryPulse.title; CarePoint.description → StoryPulse.content
CoreValue.name → StoryPulse.title
Comedy ↔ WeSpace (all properties merged)
```

### Auto-Generated Names
```
MeSpace: "{firstName} {lastName} MeSpace"
FieldContext (user): "{firstName}'s Goals"
FieldContext (community): "{communityName} Field"
```

### Relationship Transformations
```
Legacy: Goal -[:MOTIVATED_BY]-> Person
New: Person -[:OWNS]-> MeSpace -[:HAS_CONTEXT]-> FieldContext -[:HAS_PULSE]-> GoalPulse
Plus: ResonanceLink { label: "MOTIVATED_BY", confidence: 1.0 }
```

---

## Troubleshooting

### Validation Script Fails
```
❌ Production database connection failed
```
- Check VPN/network connectivity
- Verify credentials in mcp.json
- Test with: `npx neo4j-cli query --uri <URI> --username <user>`

### Migration Script Slow
- Use: `NODE_OPTIONS=--max-old-space-size=4096 npx tsx scripts/migrate-reference-to-merged.ts`
- Run on machine with more RAM
- Check database load and network latency

### Missing Data After Migration
- Review the migration error report
- Check that contexts were found for all pulses
- Run validation script again to compare source counts
- Manually verify specific entities in source database

### Duplicate Entities (Ran Migration Twice)
1. Option A: Delete all migrated data and re-run:
   ```cypher
   MATCH (n) WHERE EXISTS(n.id) AND (n:Person OR n:Space OR n:FieldPulse OR n:ResonanceLink)
   DETACH DELETE n
   ```

2. Option B: Check for duplicates:
   ```cypher
   MATCH (p:Person) WITH p.id as id, count(*) as cnt WHERE cnt > 1
   RETURN id, cnt
   ```

---

## Performance Notes

### Database Configuration
- Scripts use connection pooling
- Each entity type processed sequentially to maintain clarity
- Relationships processed in batches of 1000
- Connections closed after each major step

### Resource Requirements
- Memory: 2GB minimum, 4GB+ recommended
- CPU: Single-threaded but I/O bound (network is bottleneck)
- Network: Must have consistent connection to both databases
- Time: ~100-300ms per entity (varies by network latency)

### Optimization Tips
1. **Run during low-traffic times**: Migration queries can impact database performance
2. **Check network latency**: `ping <database-host>`
3. **Verify database indexes**: Make sure ID indexes exist for fast lookups
4. **Monitor database logs**: Watch for lock contention
5. **Increase timeouts if needed**: Add `connectionAcquisitionTimeout` to driver config

---

## Post-Migration Tasks

After successful migration:

1. **Verify data integrity**: Run verification queries above
2. **Update application code**: 
   - Point to dev database
   - Update queries to use new Space → FieldContext → Pulse path
3. **Test access control**: Verify @authorization filters work correctly
4. **Update API endpoints**: If using custom Cypher queries
5. **Re-generate TypeScript types**: Run schema codegen if applicable
6. **Test embeddings**: If using vector indexes, regenerate embeddings
7. **Update backups**: Include migrated data in backup strategy
8. **Monitor performance**: Track query performance on new structure

---

## Getting Help

For detailed information, see:
- **[MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)** - Comprehensive migration guide
- **[PULSE_MIGRATION_PATTERN.md](../PULSE_MIGRATION_PATTERN.md)** - Architecture and patterns
- **[merged-schema.gql](../merged-schema.gql)** - Schema definitions
- **[reference-schema.gql](../reference-schema.gql)** - Source schema

---

## Common Questions

**Q: Can I run the migration multiple times?**
A: No, data will be duplicated. Delete dev data first if re-running.

**Q: What if migration fails halfway?**
A: Check the error report, fix the issue, delete partial data, and re-run.

**Q: Can I migrate without downtime?**
A: Yes, migration reads from prod and writes to dev. Prod remains operational.

**Q: How do I rollback?**
A: Delete all migrated data in dev (see Troubleshooting section).

**Q: Can I migrate specific entities?**
A: Edit the migration script to comment out unwanted migration steps.

**Q: Where are the migrated relationship types logged?**
A: In the ResonanceLink `label` field (e.g., "MOTIVATED_BY", "APPLIED_TO")
