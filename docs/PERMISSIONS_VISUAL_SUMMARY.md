# Space Permissions - Visual Summary

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GoalPost Permission System                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ GraphQL API  │
│ searchAll()  │
└────────┬─────┘
         │
         ▼
┌────────────────────────────────┐
│ Search Resolver               │
│ - Check user ownership        │
│ - Check user membership       │
│ - Filter spaces by role       │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│  Neo4j Database                            │
│                                            │
│  Space (MeSpace/WeSpace)                   │
│    ├── OWNS ──→ Person (owner)            │
│    └── HAS_MEMBER ──→ SpaceMembership     │
│        ├── role: VIEW | EDIT              │
│        └── IS_MEMBER ──→ Person/Community │
└────────────────────────────────────────────┘
```

---

## Role Permissions Matrix

```
┌─────────────┬─────────────────┬──────────────────┬─────────────────┐
│ Permission  │ VIEW Role       │ EDIT Role        │ Owner           │
├─────────────┼─────────────────┼──────────────────┼─────────────────┤
│ Read        │ ✅ Yes          │ ✅ Yes           │ ✅ Yes          │
│ Create      │ ❌ No           │ ✅ Yes           │ ✅ Yes          │
│ Modify      │ ❌ No           │ ✅ Yes           │ ✅ Yes          │
│ Delete      │ ❌ No           │ ✅ Yes           │ ✅ Yes          │
│ Manage      │ ❌ No           │ ❌ No            │ ✅ Yes          │
│ Members     │                 │                  │                 │
├─────────────┼─────────────────┼──────────────────┼─────────────────┤
│ Visibility  │ Implicit EDIT   │ Implicit EDIT    │ Changeable      │
│ Ownership   │ N/A             │ N/A              │ Owned by member │
└─────────────┴─────────────────┴──────────────────┴─────────────────┘
```

---

## Search Results Filtering Logic

```
User searches: searchAll("my project")
         │
         ▼
   Is user authenticated?
   ├─ NO  → Return error
   └─ YES → Continue
         │
         ▼
   For each space found:
   ├─ Is user the OWNER?
   │  └─ YES → Include in results ✅
   │
   └─ Is user a MEMBER?
      ├─ YES (any role) → Include in results ✅
      └─ NO → Exclude from results ❌
```

---

## Data Model Before & After

### BEFORE

```graphql
type MeSpace {
  id: ID!
  name: String!
  owner: [LifeSensor!]!
  members: [LifeSensor!]! # Just a list, no role
}
```

Database:

```
(MeSpace)-[:HAS_MEMBER]→(Person)  # No role information
```

### AFTER

```graphql
type MeSpace {
  id: ID!
  name: String!
  owner: [LifeSensor!]!
  members: [SpaceMembership!]! # Now has role info
}

type SpaceMembership {
  id: ID!
  role: SpaceRole! # VIEW or EDIT
  addedAt: DateTime!
  member: [LifeSensor!]!
}

enum SpaceRole {
  VIEW # Read-only
  EDIT # Read/Write
}
```

Database:

```
(MeSpace)-[:HAS_MEMBER]→(SpaceMembership {role: "EDIT"})
                            ↓
                    [:IS_MEMBER]→(Person)
```

---

## Implementation Phases

```
Phase 1: FOUNDATION ✅ (COMPLETE)
├── Schema: SpaceRole & SpaceMembership
├── Search: Filter spaces by membership
└── Documentation: 4 comprehensive guides

         ⏬

Phase 2: MUTATIONS ⏳ (NEXT)
├── addSpaceMember(spaceId, memberId, role)
├── updateSpaceMemberRole(spaceId, memberId, role)
├── removeSpaceMember(spaceId, memberId)
└── Member management UI

         ⏬

Phase 3: ENFORCEMENT ⏳ (FUTURE)
├── Permission checks on pulse operations
├── Permission checks on context operations
├── Filter pulses/contexts by role
└── Audit logging
```

---

## Key Relationships

### Ownership (Full Access)

```
Person ---OWNS---> Space

No role needed - owner has implicit EDIT permission
```

### Membership with Role

```
Person ---IS_MEMBER---> SpaceMembership {role: "VIEW"|"EDIT"}
                              ↓
                        [:HAS_MEMBER]---
                                      └---> Space
```

---

## Search Query Cypher Pattern

```cypher
MATCH (s:MeSpace)
WHERE toLower(s.name) CONTAINS $searchTerm

# Owner check
AND (
  EXISTS {
    MATCH (owner)-[:OWNS]->(s)
    WHERE owner.id = $userId
  }

  # OR member check
  OR
  EXISTS {
    MATCH (s)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
    WHERE member.id = $userId
  }
)

RETURN s LIMIT 10
```

---

## Files Changed

### Core Changes (2 files)

```
✏️  src/lib/graphql/schema/schema.gql
    ├── + SpaceRole enum (VIEW, EDIT)
    ├── + SpaceMembership type
    └── ✏️  Updated MeSpace/WeSpace members relationship

✏️  src/lib/graphql/resolvers/search-resolver.ts
    ├── + Extract currentUserId from context.auth.jwt.sub
    ├── ✏️  MeSpace search with permission filter
    └── ✏️  WeSpace search with permission filter
```

### Documentation (4 files)

```
📄 docs/PERMISSIONS_SYSTEM.md
   └── Complete system documentation

📄 docs/PERMISSIONS_QUICK_REFERENCE.md
   └── Developer quick reference with examples

📄 docs/PERMISSIONS_IMPLEMENTATION_SUMMARY.md
   └── Summary of all changes made

📄 docs/PERMISSIONS_NEXT_STEPS.md
   └── Roadmap for Phase 2 and beyond

📄 PERMISSIONS_IMPLEMENTATION_COMPLETE.md
   └── Top-level completion summary
```

---

## Current Capabilities

```
✅ IMPLEMENTED (Phase 1)
├── Role-based membership system
├── SpaceMembership nodes with role storage
├── Search filtering by user membership
└── Comprehensive documentation

⏳ IN PROGRESS (Phase 2)
├── Member management mutations
├── Member list UI
└── Role update UI

⏳ PLANNED (Phase 3)
├── Permission enforcement on mutations
├── Access control for pulses/contexts
└── Audit logging
```

---

## Quick Reference: What Works Now

### Query spaces user can access

```graphql
query {
  searchAll(query: "project") {
    meSpaces {
      id
      name
    }
    weSpaces {
      id
      name
    }
  }
}
```

✅ Returns only owned or joined spaces

### View space members

```cypher
MATCH (space:MeSpace {id: $spaceId})
-[:HAS_MEMBER]->(sm:SpaceMembership)
-[:IS_MEMBER]->(member)
RETURN member.firstName, sm.role
```

✅ Shows member name and role

---

## Next Developer: Start Here

1. **Read:** [PERMISSIONS_QUICK_REFERENCE.md](./docs/PERMISSIONS_QUICK_REFERENCE.md)
2. **Understand:** [PERMISSIONS_SYSTEM.md](./docs/PERMISSIONS_SYSTEM.md)
3. **Plan:** [PERMISSIONS_NEXT_STEPS.md](./docs/PERMISSIONS_NEXT_STEPS.md)
4. **Implement:** Phase 2 mutations

---

## Git Changes

```
Modified:
  src/lib/graphql/schema/schema.gql
  src/lib/graphql/resolvers/search-resolver.ts

Created:
  docs/PERMISSIONS_SYSTEM.md
  docs/PERMISSIONS_QUICK_REFERENCE.md
  docs/PERMISSIONS_IMPLEMENTATION_SUMMARY.md
  docs/PERMISSIONS_NEXT_STEPS.md
  PERMISSIONS_IMPLEMENTATION_COMPLETE.md
```

Ready for Phase 2! 🚀
