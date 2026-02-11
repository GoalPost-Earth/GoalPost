# Production to Development Database Migration

## Overview

This document outlines the migration process from the production Neo4j database to the development database, transforming the old data model (CarePoint, Resource, Goal, CoreValue) to the new Field/Pulse architecture.

## What Gets Migrated

### Users (4 users)

- Robert Damashek (robert.damashek@gmail.com)
- Jennifer Damashek (jenniferdamashek@protonmail.com)
- Antonela (antonela.ambiente@gmail.com)
- Mastress (mastress@wrc.life)

**Password hashes are preserved** - users can log in with their existing credentials.

### Data Transformations

| Old Model | New Model       | Count |
| --------- | --------------- | ----- |
| CarePoint | CarePulse       | ~8    |
| Resource  | ResourcePulse   | ~84   |
| Goal      | GoalPulse       | ~49   |
| CoreValue | CoreValuePulse  | ~23   |
| Log       | Log (preserved) | ~76   |

**Total: ~164 FieldPulses + 76 Logs**

### Preserved Data

- JD (jd@thecodefoundry.dev) - all data preserved
- Jesse (jesse@thecodefoundry.dev) - all data preserved

## Migration Phases

### Phase 1: Cleanup Dev DB

- Remove old demo users (person_robert, person_jennifer, etc.)
- Delete their spaces, pulses, and related data
- **Preserve ALL data for JD and Jesse**

### Phase 2: Create Seed COC WeSpace

- Create "Seed Community of Care" WeSpace (id: `space_seed_coc`)
- All migrated content will be placed in this space

### Phase 3: Migrate Users

- Create Person nodes with **preserved UUIDs** from production
- Copy **exact password hashes** (bcrypt)
- Add proper labels: Person, User, Member, LifeSensor, RelationalEntity

### Phase 4: Create MeSpaces & Memberships

- Create **one MeSpace per person** (enforced by application validation)
- Add SpaceMembership to Seed COC with ADMIN role

### Phase 5: Transform & Migrate Data

- Transform CarePoint → CarePulse (FieldPulse)
- Transform Resource → ResourcePulse (FieldPulse)
- Transform Goal → GoalPulse (FieldPulse)
- Transform CoreValue → CoreValuePulse (FieldPulse) **NEW TYPE**
- Link all pulses to Seed COC WeSpace
- Preserve creator relationships

### Phase 6: Migrate Logs

- Copy all Log nodes for audit trail
- Maintain LOGGED_FOR relationships

### Phase 7: Migrate Relationships

Preserve these relationship types between pulses:

- MOTIVATED_BY
- DEPENDS_ON
- ENABLES
- PROVIDES
- CONNECTED_TO
- GUIDED_BY

### Phase 8: Validation

- Verify user authentication works
- Verify MeSpace constraint (1 per person)
- Verify all users are in Seed COC
- Verify pulse counts match
- Verify JD & Jesse's data intact

## Application-Level Validation

### MeSpace Constraint

Created `src/lib/validation/space-validation.ts` with:

- `validateOneMeSpacePerPerson()` - Check before creating MeSpace
- `auditMeSpaceConstraint()` - Find constraint violations
- `getOrCreateMeSpace()` - Idempotent MeSpace creation

Updated `src/app/api/me-space/create/route.ts` to enforce constraint.

## Environment Setup

Add to `.env.local`:

```bash
# Production Database (source)
NEO4J_PROD_URI=neo4j+s://xxx.databases.neo4j.io
NEO4J_PROD_USERNAME=neo4j
NEO4J_PROD_PASSWORD=xxx

# Development Database (target)
NEO4J_URI=neo4j+s://yyy.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=yyy
```

## Running the Migration

```bash
npm run migrate:prod-to-dev
```

Or manually:

```bash
tsx scripts/migrate-prod-to-dev.ts
```

## Post-Migration Verification

1. **Test Authentication**

   ```bash
   # Users should be able to log in with old passwords
   # robert.damashek@gmail.com
   # jenniferdamashek@protonmail.com
   # antonela.ambiente@gmail.com
   # mastress@wrc.life
   ```

2. **Check MeSpace Constraint**

   ```cypher
   MATCH (p:Person)-[:OWNS]->(ms:MeSpace)
   WITH p, count(ms) as meSpaceCount
   WHERE meSpaceCount > 1
   RETURN p.email, meSpaceCount
   ```

   Should return 0 rows.

3. **Verify Seed COC Membership**

   ```cypher
   MATCH (p:Person)-[:HAS_MEMBERSHIP]->(:SpaceMembership)-[:IN_SPACE]->(ws:WeSpace {id: 'space_seed_coc'})
   RETURN p.email, p.name
   ```

   Should return 4 users.

4. **Check Pulse Count**

   ```cypher
   MATCH (pulse:FieldPulse)-[:IN_SPACE]->(ws:WeSpace {id: 'space_seed_coc'})
   RETURN count(pulse) as totalPulses
   ```

   Should return ~164.

5. **Verify JD & Jesse Data Intact**
   ```cypher
   MATCH (p:Person)-[:CREATED]->(pulse:FieldPulse)
   WHERE p.id IN ['person_jd', 'person_jesse']
   RETURN p.email, count(pulse) as pulseCount
   ```

## Rollback Plan

If migration fails or needs to be rerun:

1. No changes are made to production database (read-only)
2. Development database can be cleared and re-seeded
3. Migration script is idempotent for most operations
4. JD & Jesse's data is preserved even if migration fails

## Notes

- **Response nodes (138)** are NOT migrated (old session data)
- **Session nodes (47)** are NOT migrated (temporary data)
- **Log nodes preserve audit trail** - maintained for compliance
- **CoreValuePulse is a new FieldPulse type** created for this migration
- **All UUIDs are preserved** from production for data integrity
- **Password hashes are copied exactly** - no re-hashing
