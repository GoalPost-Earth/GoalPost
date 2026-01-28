# Space Membership Mutations Implementation - Complete

## Overview

Fully implemented space membership management with three-tier permission system: **ADMIN**, **MEMBER**, and **GUEST**. All mutations include permission validation and error handling.

---

## Three-Tier Permission System

### ADMIN Role

- **Permissions**: Full administrative access
- **Capabilities**:
  - Add/remove members from space
  - Change member roles
  - Create and modify pulses/contexts
  - View all content
- **Who gets it**: Space owner (implicit) or explicitly assigned members

### MEMBER Role

- **Permissions**: Content creation and modification
- **Capabilities**:
  - Create new pulses and contexts
  - Modify existing pulses and contexts
  - Delete own pulses and contexts
  - View all content
  - Cannot manage members
- **Who gets it**: Members invited with MEMBER role

### GUEST Role

- **Permissions**: Read-only access
- **Capabilities**:
  - View all pulses and contexts
  - View space details
  - Cannot create or modify anything
  - Cannot manage members
- **Who gets it**: Members invited with GUEST role

---

## GraphQL Schema Updates

### Updated SpaceRole Enum

```graphql
enum SpaceRole {
  ADMIN # Can manage members and edit content
  MEMBER # Can create and edit content
  GUEST # Read-only access
}
```

### New Response Types

```graphql
type AddSpaceMemberResponse {
  success: Boolean!
  message: String!
  membership: SpaceMembership
}

type UpdateSpaceMemberRoleResponse {
  success: Boolean!
  message: String!
  membership: SpaceMembership
}

type RemoveSpaceMemberResponse {
  success: Boolean!
  message: String!
}
```

### New Mutations

```graphql
type Mutation {
  """
  Add a member to a space with a specific role.
  Only the space owner or members with ADMIN role can add new members.
  """
  addSpaceMember(
    spaceId: ID!
    memberId: ID!
    role: SpaceRole!
  ): AddSpaceMemberResponse!

  """
  Update a space member's role.
  Only the space owner or members with ADMIN role can change roles.
  """
  updateSpaceMemberRole(
    spaceId: ID!
    memberId: ID!
    role: SpaceRole!
  ): UpdateSpaceMemberRoleResponse!

  """
  Remove a member from a space.
  Only the space owner or members with ADMIN role can remove members.
  Cannot remove the space owner.
  """
  removeSpaceMember(spaceId: ID!, memberId: ID!): RemoveSpaceMemberResponse!
}
```

---

## Implementation Files

### 1. Permission Validation Utility

**File**: `src/lib/permissions/space-permissions.ts`

Provides reusable permission checking functions:

```typescript
// Check if user can manage members (add/remove/change roles)
canManageMembers(session, userId, spaceId) → boolean

// Check if user can edit content (create/modify/delete)
canEditContent(session, userId, spaceId) → boolean

// Check if user can view content
canViewContent(session, userId, spaceId) → boolean

// Get user's role in space
getUserSpaceRole(session, userId, spaceId) → 'OWNER' | SpaceRole | null

// Utility checks
memberExistsInSpace(session, memberId, spaceId) → boolean
isSpaceOwner(session, userId, spaceId) → boolean
```

**Key Features**:

- Uses Neo4j existential checks (`EXISTS { ... }`) for efficiency
- Distinguishes between OWNER (implicit) and MEMBER (explicit) roles
- Validates permissions before any mutation

### 2. Space Membership Resolver

**File**: `src/lib/graphql/resolvers/space-membership-resolver.ts`

Implements three mutations:

#### `addSpaceMember(spaceId, memberId, role)`

```typescript
// 1. Verify caller has permission (owner or ADMIN member)
// 2. Check member doesn't already exist in space
// 3. Create SpaceMembership node with role
// 4. Return success/failure with membership details
```

**Validations**:

- Caller must be owner or have ADMIN role
- Member cannot already be in space
- Space and member must exist

**Response**:

```json
{
  "success": true,
  "message": "Successfully added member with ADMIN role to space.",
  "membership": {
    "id": "sm_abc123",
    "role": "ADMIN",
    "addedAt": "2026-01-27T10:30:00Z"
  }
}
```

#### `updateSpaceMemberRole(spaceId, memberId, role)`

```typescript
// 1. Verify caller has permission (owner or ADMIN member)
// 2. Check member exists in space
// 3. Prevent changing owner's role
// 4. Update SpaceMembership.role
// 5. Return updated membership
```

**Validations**:

- Caller must be owner or have ADMIN role
- Member must already be in space
- Cannot change owner's role (safety check)

#### `removeSpaceMember(spaceId, memberId)`

```typescript
// 1. Verify caller has permission (owner or ADMIN member)
// 2. Prevent removing owner
// 3. Check member exists in space
// 4. Delete SpaceMembership node and relationships
// 5. Return success/failure
```

**Validations**:

- Caller must be owner or have ADMIN role
- Cannot remove space owner
- Member must be in space

### 3. Resolver Integration

**File**: `src/lib/graphql/resolvers/index.ts`

Updated to include new mutations:

```typescript
Mutation: {
  ...chatbotResolvers,
  ...inviteMutations,
  ...spaceMembershipResolvers,  // ← Added
}
```

### 4. ID Generator Utility

**File**: `src/utils/id-generator.ts`

Provides consistent ID generation:

```typescript
generateId() → string
generatePrefixedId(prefix) → string
```

Uses Node's built-in `crypto.randomUUID()`

---

## Permission Validation Flow

```
User calls mutation
    ↓
Extract currentUserId from context.auth.jwt.sub
    ↓
Call canManageMembers(userId, spaceId)
    ├─ Check: Is user the space owner?
    │   → EXISTS { (user)-[:OWNS]->(space) }
    │
    └─ Check: Does user have ADMIN role?
        → EXISTS { (space)-[:HAS_MEMBER]->(sm:SpaceMembership {role: 'ADMIN'})-[:IS_MEMBER]->(user) }
    ↓
If either true → Proceed
If false → Return error response
    ↓
Execute mutation (add/update/remove)
    ↓
Return success/failure with details
```

---

## Cypher Queries Used

### Check Management Permission

```cypher
MATCH (user:LifeSensor {id: $userId}), (space:Space {id: $spaceId})
RETURN
  EXISTS {
    MATCH (user)-[:OWNS]->(space)
  } as isOwner,
  EXISTS {
    MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership {role: 'ADMIN'})-[:IS_MEMBER]->(user)
  } as isAdmin
```

### Add Member

```cypher
MATCH (space:Space {id: $spaceId}), (member:LifeSensor {id: $memberId})
CREATE (sm:SpaceMembership {
  id: $membershipId,
  role: $role,
  addedAt: datetime($addedAt)
})
CREATE (space)-[:HAS_MEMBER]->(sm)-[:IS_MEMBER]->(member)
RETURN sm.id, sm.role, sm.addedAt
```

### Update Role

```cypher
MATCH (space:Space {id: $spaceId})
  -[:HAS_MEMBER]->(sm:SpaceMembership)
  -[:IS_MEMBER]->(member:LifeSensor {id: $memberId})
SET sm.role = $role
RETURN sm.id, sm.role, sm.addedAt
```

### Remove Member

```cypher
MATCH (space:Space {id: $spaceId})
  -[:HAS_MEMBER]->(sm:SpaceMembership)
  -[:IS_MEMBER]->(member:LifeSensor {id: $memberId})
DETACH DELETE sm
RETURN COUNT(*) as deleted
```

---

## Usage Examples

### GraphQL Mutation: Add Admin Member

```graphql
mutation {
  addSpaceMember(spaceId: "space_123", memberId: "person_456", role: ADMIN) {
    success
    message
    membership {
      id
      role
      addedAt
    }
  }
}
```

**Response**:

```json
{
  "success": true,
  "message": "Successfully added member with ADMIN role to space.",
  "membership": {
    "id": "sm_xyz789",
    "role": "ADMIN",
    "addedAt": "2026-01-27T10:30:00Z"
  }
}
```

### GraphQL Mutation: Demote to Guest

```graphql
mutation {
  updateSpaceMemberRole(
    spaceId: "space_123"
    memberId: "person_456"
    role: GUEST
  ) {
    success
    message
    membership {
      id
      role
      addedAt
    }
  }
}
```

### GraphQL Mutation: Remove Member

```graphql
mutation {
  removeSpaceMember(spaceId: "space_123", memberId: "person_456") {
    success
    message
  }
}
```

---

## Error Handling

All mutations return structured error responses:

```json
{
  "success": false,
  "message": "Only space owners and ADMIN members can add new members to this space."
}
```

### Possible Error Messages

| Error                                                           | Cause                           |
| --------------------------------------------------------------- | ------------------------------- |
| "Only space owners and ADMIN members can add new members"       | Caller lacks permission         |
| "This member is already part of the space."                     | Member already exists           |
| "Failed to create space membership. Space or member not found." | Space or member doesn't exist   |
| "Only space owners and ADMIN members can change member roles."  | Caller lacks permission         |
| "This member is not part of the space."                         | Member not found in space       |
| "Cannot change the role of the space owner."                    | Attempting to modify owner role |
| "Cannot remove the space owner from the space."                 | Attempting to remove owner      |
| "An error occurred while adding the member to the space."       | Database error                  |

---

## Database Considerations

### Transaction Handling

- Each mutation runs in a separate Neo4j transaction
- Sessions are properly closed in finally blocks
- Uses `executeWrite` for mutations, `executeRead` for permission checks

### Performance

- Permission checks use existential Cypher (`EXISTS {...}`) for efficiency
- No unnecessary data transfers
- Minimal query overhead

### Data Integrity

- Cannot remove space owner
- Cannot modify owner role
- Prevents duplicate memberships
- Atomic operations (create/update/delete)

---

## Testing Checklist

- [ ] Add member with ADMIN role
- [ ] Add member with MEMBER role
- [ ] Add member with GUEST role
- [ ] Prevent adding duplicate members
- [ ] Prevent non-owners from adding members
- [ ] Update member role (ADMIN → MEMBER)
- [ ] Update member role (MEMBER → GUEST)
- [ ] Prevent non-admins from changing roles
- [ ] Remove member successfully
- [ ] Prevent removing space owner
- [ ] Prevent non-admins from removing members
- [ ] Error messages are clear and specific
- [ ] GraphQL schema validates input

---

## Phase 2 Complete ✅

**What's Done**:

- ✅ Space membership mutations (add/update/remove)
- ✅ Three-tier permission system (ADMIN/MEMBER/GUEST)
- ✅ Permission validation utility
- ✅ Comprehensive error handling
- ✅ GraphQL schema with response types
- ✅ Type-safe TypeScript implementation

**Next**: Phase 3 - Enforce permissions on pulse/context operations

---

## Files Created/Modified

### Created

- `src/lib/permissions/space-permissions.ts` - Permission validation utilities
- `src/lib/graphql/resolvers/space-membership-resolver.ts` - Mutation resolvers
- `src/utils/id-generator.ts` - ID generation utility

### Modified

- `src/lib/graphql/schema/schema.gql` - Schema with mutations
- `src/lib/graphql/resolvers/index.ts` - Integrated space membership resolvers

---

## Next Steps (Phase 3)

1. **Enforce permissions on pulse operations**:
   - Create pulse: Only ADMIN/MEMBER can create
   - Update pulse: Only ADMIN/MEMBER or creator
   - Delete pulse: Only ADMIN/MEMBER or creator

2. **Enforce permissions on context operations**:
   - Create context: Only ADMIN/MEMBER
   - Update context: Only ADMIN/MEMBER
   - Delete context: Only ADMIN/MEMBER

3. **Filter queries by role**:
   - GUEST sees pulses/contexts but cannot edit
   - MEMBER/ADMIN see and can edit

4. **Add UI for member management**:
   - Display members list with roles
   - Add member dialog
   - Change role dialog
   - Remove member confirmation

See [PERMISSIONS_NEXT_STEPS.md](./docs/PERMISSIONS_NEXT_STEPS.md) for detailed roadmap.
