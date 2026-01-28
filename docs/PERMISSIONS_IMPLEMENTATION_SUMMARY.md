# Space Permissions System Implementation - Summary

## Overview

Implemented a role-based access control (RBAC) system for GoalPost spaces with two distinct roles: **VIEW** and **EDIT**. Spaces are now filtered in search results to show only spaces where the current user is an owner or member.

---

## Changes Made

### 1. GraphQL Schema Updates (`src/lib/graphql/schema/schema.gql`)

#### Added SpaceRole Enum

```graphql
enum SpaceRole {
  VIEW # Read-only access to pulses and contexts
  EDIT # Full read/write access to pulses and contexts
}
```

#### Created SpaceMembership Type

```graphql
type SpaceMembership @node(labels: ["SpaceMembership"]) {
  id: ID! @id
  role: SpaceRole! # The permission level
  addedAt: DateTime! # When member was added
  member: [LifeSensor!]! # Person or Community
}
```

#### Updated Space Types

- **MeSpace**: Changed `members: [LifeSensor!]!` to `members: [SpaceMembership!]!`
- **WeSpace**: Changed `members: [LifeSensor!]!` to `members: [SpaceMembership!]!`

This creates a new relationship pattern:

```
Space -[:HAS_MEMBER]-> SpaceMembership -[:IS_MEMBER]-> LifeSensor
```

#### Updated Search Query Documentation

Added explanation of space filtering behavior in `searchAll()` query.

---

### 2. Search Resolver Updates (`src/lib/graphql/resolvers/search-resolver.ts`)

#### Added User Context

- Extracted `currentUserId` from `context.auth.jwt.sub`

#### Updated MeSpace Search Query

Modified to include permission check:

```cypher
MATCH (s:MeSpace)
WHERE toLower(s.name) CONTAINS $searchTerm
AND (
  EXISTS {
    MATCH (owner)-[r:OWNS]->(s)
    WHERE owner.id = $userId
  }
  OR
  EXISTS {
    MATCH (s)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
    WHERE member.id = $userId
  }
)
RETURN s LIMIT 10
```

#### Updated WeSpace Search Query

Applied identical permission check as MeSpace.

**Result:** Spaces are now filtered to only show those where:

- The current user is the **owner**, OR
- The current user is a **member** (with any role)

---

### 3. Documentation

#### Created PERMISSIONS_SYSTEM.md

Comprehensive documentation covering:

- **Core Concepts**: Space membership, role definitions
- **Role Descriptions**:
  - VIEW: Read-only access
  - EDIT: Full read/write access
  - Owner: Administrative access (implicit)
- **Search Results Filtering**: How spaces are filtered in search
- **Database Schema**: SpaceMembership structure
- **Future Implementation**: Context and Pulse access control
- **API Usage Examples**: GraphQL query/mutation patterns
- **Security Considerations**: Best practices
- **Implementation Checklist**: What's done and what's next

---

## Database Relationship Changes

### Before

```
Space -[:HAS_MEMBER]-> Person
Space -[:HAS_MEMBER]-> Community
```

### After

```
Space -[:HAS_MEMBER]-> SpaceMembership {role: "VIEW" | "EDIT"}
SpaceMembership -[:IS_MEMBER]-> Person
SpaceMembership -[:IS_MEMBER]-> Community
```

---

## Breaking Changes

### Cypher Queries

Any existing Cypher queries that traverse `(space)-[:HAS_MEMBER]-(person)` need updating:

**Before:**

```cypher
MATCH (space:Space)-[:HAS_MEMBER]-(person:Person) RETURN space, person
```

**After:**

```cypher
MATCH (space:Space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(person:Person)
RETURN space, person, sm.role
```

### Data Migration Needed

Existing spaces with direct member relationships must be migrated:

```cypher
# For each existing (Space)-[:HAS_MEMBER]-(member) relationship:
1. Create SpaceMembership node with role "EDIT" (default for existing members)
2. Create (Space)-[:HAS_MEMBER]->(SpaceMembership)-[:IS_MEMBER]->(member)
3. Delete old (Space)-[:HAS_MEMBER]-(member) relationship
```

---

## Next Steps

### Phase 1: Mutations (Required)

- [ ] `addSpaceMember(spaceId, memberId, role)` - Add member with role
- [ ] `updateSpaceMemberRole(spaceId, memberId, role)` - Change member's role
- [ ] `removeSpaceMember(spaceId, memberId)` - Remove member from space

### Phase 2: Enforcement (Required)

- [ ] Add permission checks to pulse creation mutations
- [ ] Add permission checks to context creation mutations
- [ ] Filter contexts/pulses based on member role
- [ ] Add permission validation middleware

### Phase 3: UI (Optional)

- [ ] Show role badges on space members
- [ ] Add member management interface
- [ ] Display permission level in space details
- [ ] Add role change UI for space owners

---

## Testing Checklist

- [ ] Search returns only owned/joined spaces
- [ ] Search excludes private spaces user doesn't own/join
- [ ] SpaceMembership nodes are correctly created
- [ ] Role enum values (VIEW/EDIT) are stored correctly
- [ ] Migration of existing members works correctly
- [ ] GraphQL schema compiles without errors
- [ ] Backward compatibility is maintained where applicable

---

## Files Modified

1. `src/lib/graphql/schema/schema.gql` - Schema updates
2. `src/lib/graphql/resolvers/search-resolver.ts` - Search filtering
3. `docs/PERMISSIONS_SYSTEM.md` - New documentation (created)

---

## Security Notes

1. ✅ Authentication required (uses `context.auth.jwt.sub`)
2. ✅ Server-side filtering (not client-side)
3. ⚠️ Pulse/Context access not yet enforced (needs Phase 2)
4. ⚠️ No audit logging yet (consider for compliance)
5. ⚠️ Owner cannot transfer ownership yet (future feature)
