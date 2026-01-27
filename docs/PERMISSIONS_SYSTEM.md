# GoalPost Permissions System

## Overview

The GoalPost permissions system controls access to Spaces and their contained entities (FieldContexts and FieldPulses). The system uses a **role-based access control (RBAC)** model with two distinct roles: **VIEW** and **EDIT**.

---

## Core Concepts

### Space Membership

Every member of a space (other than the owner) is represented as a `SpaceMembership` node with a specific role. The owner always has implicit full access to their spaces.

**Graph Structure:**

```
Space (MeSpace or WeSpace)
  ├── OWNS (Person or Community) → Owner (implicit EDIT rights)
  └── HAS_MEMBER → SpaceMembership
      ├── role: SpaceRole (VIEW | EDIT)
      └── IS_MEMBER → LifeSensor (Person or Community)
```

### Roles

#### VIEW Role

- **Permission**: Read-only access to all pulses and contexts within the space
- **Actions Allowed**:
  - Read FieldContexts and FieldPulses in the space
  - Search and filter pulses/contexts
  - View resonances and connections
- **Actions Denied**:
  - Create new pulses or contexts
  - Modify existing pulses or contexts
  - Delete pulses or contexts
  - Change space settings

#### EDIT Role

- **Permission**: Full read/write access to pulses and contexts within the space
- **Actions Allowed**:
  - All VIEW permissions
  - Create new FieldPulses and FieldContexts
  - Modify existing pulses and contexts
  - Delete pulses and contexts
  - Potentially manage space members (TBD with owner)
- **Actions Denied**:
  - Change space visibility (owner-only)
  - Delete the space (owner-only)
  - Transfer ownership (owner-only)

#### Owner (Implicit)

- **Permission**: Full administrative access to the space
- **Actions Allowed**:
  - All EDIT permissions
  - Add/remove members and manage their roles
  - Delete the space
  - Change space visibility
  - Transfer ownership (future)

---

## Search Results Filtering

### Space Search Results

When using the `searchAll()` query, spaces are filtered based on the current user's relationship to them:

**Returned Spaces:**

- Spaces where the user is the **owner** (any role)
- Spaces where the user is a **member** with any role (VIEW or EDIT)

**Excluded Spaces:**

- Private spaces where the user is neither owner nor member
- Spaces owned by others (unless user is a member)

### Cypher Query Pattern

```cypher
MATCH (s:MeSpace|WeSpace)
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

---

## Context and Pulse Access Control

### Future Implementation

When querying FieldContexts or FieldPulses within a space, permission checks will enforce role-based visibility:

```cypher
# For users with VIEW role
MATCH (context:FieldContext)
  -[:HAS_CONTEXT]->(space:Space)
  -[:HAS_MEMBER]->(sm:SpaceMembership {role: 'VIEW'})
WHERE sm.member.id = $userId

# For users with EDIT role (sees all created pulses)
MATCH (pulse:FieldPulse)
  -[:HAS_PULSE]->(context:FieldContext)
  -[:HAS_CONTEXT]->(space:Space)
WHERE EXISTS {
  MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership {role: 'EDIT'})
  WHERE sm.member.id = $userId
}
OR EXISTS {
  MATCH (owner)-[:OWNS]->(space)
  WHERE owner.id = $userId
}
```

---

## Database Schema

### SpaceMembership Node

```graphql
type SpaceMembership @node(labels: ["SpaceMembership"]) {
  id: ID! @id
  role: SpaceRole! # VIEW or EDIT
  addedAt: DateTime! # When member was added
  member: [LifeSensor!]! # Person or Community
}

enum SpaceRole {
  VIEW
  EDIT
}
```

### Relationships

- `(Space)-[:HAS_MEMBER]->(SpaceMembership)` - Space has members
- `(SpaceMembership)-[:IS_MEMBER]->(LifeSensor)` - Membership references the member

---

## Implementation Checklist

- [x] Add `SpaceRole` enum to schema (VIEW, EDIT)
- [x] Create `SpaceMembership` node type in schema
- [x] Update `MeSpace` and `WeSpace` to relate to `SpaceMembership` instead of direct member
- [x] Modify search resolver to filter spaces by user membership/ownership
- [ ] Add mutation to add member to space with role assignment
- [ ] Add mutation to update member role in space
- [ ] Add mutation to remove member from space
- [ ] Add resolver to validate permissions before creating/modifying pulses
- [ ] Add resolver to validate permissions before querying contexts/pulses
- [ ] Update UI to show role badges on space members
- [ ] Add UI for managing space membership

---

## API Usage Examples

### Query: Search for Accessible Spaces

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

**Response:** Only spaces where the current user is owner or member.

### Mutation: Add Member to Space (Future)

```graphql
mutation AddSpaceMember($spaceId: ID!, $memberId: ID!, $role: SpaceRole!) {
  addSpaceMember(spaceId: $spaceId, memberId: $memberId, role: $role) {
    id
    members {
      id
      role
    }
  }
}
```

---

## Security Considerations

1. **Always validate user permissions server-side**, never trust client-side claims
2. **Use authenticated context** (`context.auth.jwt.sub`) to determine current user
3. **Filter all queries** that access spaces to respect membership boundaries
4. **Audit role changes** for compliance and debugging
5. **Prevent privilege escalation** by validating ownership before allowing role updates

---

## Related Files

- [GraphQL Schema](./src/lib/graphql/schema/schema.gql)
- [Search Resolver](./src/lib/graphql/resolvers/search-resolver.ts)
- [Ontology Documentation](./ONTOLOGY_README.md)
