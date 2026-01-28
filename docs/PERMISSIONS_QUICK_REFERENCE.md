# Space Permissions Quick Reference

## Schema Changes

### New Types

```graphql
# Role options for space members
enum SpaceRole {
  VIEW # Read-only
  EDIT # Read/Write
}

# Represents membership with a role
type SpaceMembership @node(labels: ["SpaceMembership"]) {
  id: ID!
  role: SpaceRole!
  addedAt: DateTime!
  member: [LifeSensor!]! # Person or Community
}
```

### Updated Space Types

Both `MeSpace` and `WeSpace` now use:

```graphql
members: [SpaceMembership!]! @relationship(type: "HAS_MEMBER", direction: OUT)
```

Previously was:

```graphql
members: [LifeSensor!]! @relationship(type: "HAS_MEMBER", direction: OUT)
```

---

## Role Definitions

### VIEW Role

Read-only access to pulses and contexts.

```cypher
# Grant a person VIEW access
MATCH (space), (person)
CREATE (sm:SpaceMembership {id: randomUUID(), role: 'VIEW', addedAt: datetime()})
CREATE (space)-[:HAS_MEMBER]->(sm)-[:IS_MEMBER]->(person)
```

### EDIT Role

Full read/write access.

```cypher
# Grant a person EDIT access
MATCH (space), (person)
CREATE (sm:SpaceMembership {id: randomUUID(), role: 'EDIT', addedAt: datetime()})
CREATE (space)-[:HAS_MEMBER]->(sm)-[:IS_MEMBER]->(person)
```

### Owner (No Role Needed)

Owner relationships are determined by `(owner)-[:OWNS]->(space)`.

---

## Updated Cypher Patterns

### Getting Space Members with Roles

**Old (broken now):**

```cypher
MATCH (space:Space)-[:HAS_MEMBER]-(member)
RETURN space, member
```

**New (correct):**

```cypher
MATCH (space:Space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
RETURN space, member, sm.role
```

### Finding All Spaces a User Can Access

```cypher
MATCH (user:Person {id: $userId})
CALL {
  # Spaces user owns
  MATCH (user)-[:OWNS]->(owned_space:Space)
  RETURN owned_space as space, 'OWNER' as access_level
  UNION
  # Spaces user is member of
  MATCH (user)-[:IS_MEMBER]-(sm:SpaceMembership {role: 'VIEW'})-[:HAS_MEMBER]-(space:Space)
  RETURN space, 'VIEW' as access_level
  UNION
  MATCH (user)-[:IS_MEMBER]-(sm:SpaceMembership {role: 'EDIT'})-[:HAS_MEMBER]-(space:Space)
  RETURN space, 'EDIT' as access_level
}
RETURN space, access_level
```

### Checking if User Can Edit in Space

```cypher
MATCH (user:Person {id: $userId}), (space:Space {id: $spaceId})
RETURN
  EXISTS {
    MATCH (user)-[:OWNS]->(space)
  } OR EXISTS {
    MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership {role: 'EDIT'})-[:IS_MEMBER]->(user)
  } as canEdit
```

---

## Search Query Filtering

The `searchAll()` query automatically filters spaces:

```graphql
query SearchAll($query: String!) {
  searchAll(query: $query) {
    meSpaces {
      id
      name
      visibility
    }
    weSpaces {
      id
      name
      visibility
    }
  }
}
```

**Returns:** Only spaces where the current authenticated user is owner OR member (any role)

---

## Data Migration

If you have existing spaces with direct member relationships, migrate with:

```cypher
# 1. Create SpaceMembership nodes for existing members
MATCH (space:Space)-[old_rel:HAS_MEMBER]-(member)
WHERE member:Person OR member:Community
CREATE (sm:SpaceMembership {
  id: randomUUID(),
  role: 'EDIT',  # Default to EDIT for backward compatibility
  addedAt: datetime()
})
CREATE (space)-[:HAS_MEMBER]->(sm)-[:IS_MEMBER]->(member)
SET old_rel.migrated = true
RETURN count(sm) as created

# 2. Delete old relationships (after verifying step 1)
MATCH (space:Space)-[old_rel:HAS_MEMBER {migrated: true}]-(member)
DELETE old_rel
RETURN count(*) as deleted
```

---

## Common Queries

### List members of a space with their roles

```cypher
MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
RETURN
  member.firstName as firstName,
  member.lastName as lastName,
  member.email as email,
  sm.role as role,
  sm.addedAt as addedAt
ORDER BY sm.addedAt DESC
```

### Find all VIEW-only members

```cypher
MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(sm:SpaceMembership {role: 'VIEW'})-[:IS_MEMBER]->(member)
RETURN member
```

### Change a member's role

```cypher
MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member {id: $memberId})
SET sm.role = $newRole
RETURN sm
```

### Remove a member from space

```cypher
MATCH (space:Space {id: $spaceId})-[hm:HAS_MEMBER]->(sm:SpaceMembership)-[im:IS_MEMBER]->(member {id: $memberId})
DETACH DELETE sm
RETURN space
```

---

## Implementation Status

✅ **Done:**

- Schema with SpaceRole and SpaceMembership types
- Search filtering for MeSpace and WeSpace
- Database relationship structure

⏳ **To Do:**

- Mutations: `addSpaceMember`, `updateSpaceMemberRole`, `removeSpaceMember`
- Permission enforcement on pulse/context operations
- UI for managing space members
- Data migration script for existing spaces

---

## References

- Full documentation: [PERMISSIONS_SYSTEM.md](./PERMISSIONS_SYSTEM.md)
- Implementation summary: [PERMISSIONS_IMPLEMENTATION_SUMMARY.md](./PERMISSIONS_IMPLEMENTATION_SUMMARY.md)
- Schema file: `src/lib/graphql/schema/schema.gql`
- Search resolver: `src/lib/graphql/resolvers/search-resolver.ts`
