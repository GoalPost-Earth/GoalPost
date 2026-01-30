# Cascading Authorization System - Complete Implementation

## Overview

The GoalPost GraphQL schema now implements a complete cascading authorization system where access to data is determined by a user's role in the parent Space. This document outlines the authorization chain and how it protects data at each level.

---

## Authorization Chain

```
Space (MeSpace | WeSpace)
  ├── AUTHORIZATION: Owner-only (MeSpace) | Owner + Members (WeSpace)
  │
  ├── HAS_MEMBER → SpaceMembership (role: ADMIN, MEMBER, GUEST)
  │
  └── HAS_CONTEXT → FieldContext
      ├── AUTHORIZATION: Delegates to parent Space role
      │   - READ/AGGREGATE: Available to space members
      │   - CREATE/UPDATE: ADMIN or MEMBER role required
      │   - DELETE: Space owner or ADMIN role required
      │
      ├── createdBy: [LifeSensor!]! (CREATED_BY relationship)
      │
      └── HAS_PULSE → FieldPulse (GoalPulse | ResourcePulse | StoryPulse)
          ├── AUTHORIZATION: Cascades through FieldContext to Space
          │   - READ/AGGREGATE: Visible only to space members
          │   - CREATE/UPDATE: ADMIN or MEMBER role required
          │   - DELETE: Creator, ADMIN, or space owner can delete
          │
          └── createdBy: [LifeSensor!]! (CREATED_BY relationship)
```

---

## Space-Level Authorization

### MeSpace (Personal Space)

**Type Definition:**

```graphql
type MeSpace implements Space
  @node(labels: ["Space", "MeSpace"])
  @authorization(
    filter: [
      {
        operations: [READ, AGGREGATE]
        where: { node: { owner: { some: { id: { eq: "$jwt.user.id" } } } } }
      }
    ]
    validate: [
      {
        operations: [CREATE, UPDATE, DELETE]
        where: { node: { owner: { some: { id: { eq: "$jwt.user.id" } } } } }
      }
    ]
  )
```

**Behavior:**

- Only the owner can READ or AGGREGATE a MeSpace
- Only the owner can CREATE, UPDATE, or DELETE a MeSpace
- Non-owners cannot see the MeSpace in search results (filtered out)
- Non-owners attempting mutations receive validation errors

**Automatic Conversion:**

- When the first member is added to a MeSpace, it automatically converts to a WeSpace
- The conversion happens in the `addSpaceMember` resolver at runtime
- This is done by:
  1. Checking if the space has the `MeSpace` label
  2. Removing the `MeSpace` label
  3. Adding the `WeSpace` label
- The space retains all existing data (contexts, pulses, owner relationship)

### WeSpace (Collaborative Space)

**Type Definition:**

```graphql
type WeSpace implements Space
  @node(labels: ["Space", "WeSpace"])
  @authorization(
    filter: [
      {
        operations: [READ, AGGREGATE]
        where: {
          OR: [
            { node: { owner: { some: { id: { eq: "$jwt.user.id" } } } } }
            {
              node: {
                members: {
                  some: { member: { some: { id: { eq: "$jwt.user.id" } } } }
                }
              }
            }
          ]
        }
      }
    ]
    validate: [
      {
        operations: [UPDATE, DELETE]
        where: { node: { owner: { some: { id: { eq: "$jwt.user.id" } } } } }
      }
    ]
  )
```

**Behavior:**

- Space owner can READ/AGGREGATE the space
- Space members (any role) can READ/AGGREGATE the space
- Non-members cannot see the space (filtered out)
- Only the space owner can UPDATE or DELETE the space
- Members cannot modify the space itself (READ-only on space metadata)
- Members can create and modify content (contexts, pulses) within the space based on their role

---

## FieldContext Authorization

**Type Definition:**

```graphql
type FieldContext
  @node(labels: ["FieldContext"])
  @authorization(
    filter: [
      {
        operations: [READ, AGGREGATE]
        where: {
          node: {
            space: {
              some: {
                OR: [
                  { owner: { some: { id: { eq: "$jwt.user.id" } } } }
                  {
                    members: {
                      some: { member: { some: { id: { eq: "$jwt.user.id" } } } }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]
    validate: [
      {
        operations: [CREATE, UPDATE]
        where: {
          node: {
            space: {
              some: {
                members: {
                  some: {
                    AND: [
                      { member: { some: { id: { eq: "$jwt.user.id" } } } }
                      { role: { in: [ADMIN, MEMBER] } }
                    ]
                  }
                }
              }
            }
          }
        }
      }
      {
        operations: [CREATE, UPDATE]
        where: {
          node: {
            space: { some: { owner: { some: { id: { eq: "$jwt.user.id" } } } } }
          }
        }
      }
    ]
    validate: [
      {
        operations: [DELETE]
        where: {
          node: {
            space: { some: { owner: { some: { id: { eq: "$jwt.user.id" } } } } }
          }
        }
      }
      {
        operations: [DELETE]
        where: {
          node: {
            space: {
              some: {
                members: {
                  some: {
                    AND: [
                      { member: { some: { id: { eq: "$jwt.user.id" } } } }
                      { role: { eq: ADMIN } }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    ]
  )
```

**Authorization Rules:**

| Operation | Who Can?                   | Condition                                        |
| --------- | -------------------------- | ------------------------------------------------ |
| READ      | Space owner, any member    | User is owner or member                          |
| AGGREGATE | Space owner, any member    | User is owner or member                          |
| CREATE    | Space owner, ADMIN, MEMBER | User is owner OR (member with ADMIN/MEMBER role) |
| UPDATE    | Space owner, ADMIN, MEMBER | User is owner OR (member with ADMIN/MEMBER role) |
| DELETE    | Space owner, ADMIN         | User is owner OR (member with ADMIN role)        |

**Key Fields:**

- `createdBy: [LifeSensor!]!` - Tracks who created the context
- Uses `CREATED_BY` relationship to link context to creator

---

## FieldPulse Authorization (GoalPulse, ResourcePulse, StoryPulse)

**Base Authorization Rules:**

All pulse types implement the same authorization pattern:

```graphql
@authorization(
  filter: [
    {
      operations: [READ, AGGREGATE]
      where: {
        node: {
          context: {
            some: {
              space: {
                some: {
                  OR: [
                    { owner: { some: { id: { eq: "$jwt.user.id" } } } }
                    {
                      members: {
                        some: { member: { some: { id: { eq: "$jwt.user.id" } } } }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  ]
  validate: [
    # CREATE/UPDATE: ADMIN or MEMBER in space, or space owner
    # UPDATE/DELETE: Creator, ADMIN member, or space owner
  ]
)
```

**Authorization Rules:**

| Operation | Who Can?                            | Condition                                            |
| --------- | ----------------------------------- | ---------------------------------------------------- |
| READ      | Space owner, any member             | User has access to parent context's space            |
| AGGREGATE | Space owner, any member             | User has access to parent context's space            |
| CREATE    | Space owner, ADMIN, MEMBER          | User is owner OR (member with ADMIN/MEMBER role)     |
| UPDATE    | Space owner, ADMIN, MEMBER, Creator | User is creator OR owner OR (member with ADMIN role) |
| DELETE    | Space owner, ADMIN, Creator         | User is creator OR owner OR (member with ADMIN role) |

**Key Fields:**

- `createdBy: [LifeSensor!]!` - Tracks who created the pulse
- Uses `CREATED_BY` relationship to link pulse to creator
- Enables creator-based deletion permissions even for MEMBER role users

---

## SpaceRole Definitions

```graphql
enum SpaceRole {
  ADMIN # Full administrative access
  MEMBER # Content creation and modification
  GUEST # Read-only access
}
```

### ADMIN Role

- **Can:** Manage members, modify/delete content, view all
- **Cannot:** Reserved for space owner or explicitly assigned admins

### MEMBER Role

- **Can:** Create/modify own pulses and contexts, view all
- **Cannot:** Manage members, modify space itself

### GUEST Role

- **Can:** View pulses and contexts
- **Cannot:** Create/modify anything

---

## MeSpace-to-WeSpace Conversion

### When Does It Happen?

Conversion occurs automatically when the first non-owner member is added to a MeSpace via the `addSpaceMember` mutation.

### How It Works

1. **Detection**: The resolver checks if the space has the `MeSpace` label
2. **Conversion**: If MeSpace, remove the `MeSpace` label and add `WeSpace` label
3. **Preservation**: All data is preserved:
   - Owner relationship unchanged
   - All contexts and pulses remain
   - All resonances and connections remain
4. **Authorization Update**: The space now uses WeSpace authorization rules:
   - Members can now READ/AGGREGATE the space
   - Owner still has full control

### Code Example

From `space-membership-resolver.ts`:

```typescript
// Check if this is a MeSpace and if we need to convert it to WeSpace
const conversionResult = await session.executeWrite((tx) =>
  tx.run(
    `
    MATCH (space:MeSpace {id: $spaceId})
    RETURN space.id as id
    LIMIT 1
    `,
    { spaceId }
  )
)

const isMeSpace = conversionResult.records.length > 0

// If it's a MeSpace, convert it to WeSpace
if (isMeSpace) {
  await session.executeWrite((tx) =>
    tx.run(
      `
      MATCH (space:MeSpace {id: $spaceId})
      REMOVE space:MeSpace
      SET space:WeSpace
      `,
      { spaceId }
    )
  )
}
```

---

## Authorization Flow Examples

### Example 1: User Queries a Pulse

```
User (person_alice) queries GoalPulse(id: "pulse_123")
  ↓
GraphQL checks: Can Alice READ this pulse?
  ↓
Authorization validates:
  1. Find pulse's parent FieldContext
  2. Find context's parent Space
  3. Check if Alice is owner or member of space
  4. If YES: Return pulse data
  5. If NO: Filter out (silently exclude from results)
```

### Example 2: User Creates a Context in WeSpace

```
User (person_bob) with MEMBER role tries to CREATE FieldContext in WeSpace
  ↓
GraphQL checks: Can Bob CREATE this context?
  ↓
Authorization validates:
  1. Check if Bob is a member of the space
  2. Check if Bob's role is ADMIN or MEMBER
  3. If YES: Allow creation
  4. If NO: Return validation error
```

### Example 3: User Deletes a Pulse They Created

```
User (person_charlie) with GUEST role tries to DELETE GoalPulse(createdBy: charlie)
  ↓
GraphQL checks: Can Charlie DELETE this pulse?
  ↓
Authorization validates:
  1. Check if Charlie created the pulse
  2. If YES: Allow deletion (creator exception)
  3. If NO: Check if Charlie is ADMIN
  4. If NO ADMIN: Check if Charlie is space owner
  5. If YES to any: Allow deletion
  6. If NO to all: Return validation error
```

### Example 4: MeSpace Conversion

```
User (person_dave) owns MeSpace "My Project"
  ↓
User invites person_eve to MeSpace with MEMBER role
  ↓
addSpaceMember resolver executes:
  1. Check current space labels
  2. Space has "MeSpace" label
  3. Remove "MeSpace" label
  4. Add "WeSpace" label
  5. Create SpaceMembership node (eve, MEMBER)
  ↓
Authorization rules change:
  - Before: Only dave could READ/AGGREGATE
  - After: Dave (owner) AND eve (member) can READ/AGGREGATE
  - Response: "Space converted from MeSpace to WeSpace"
```

---

## Authorization Without Authentication

The current implementation **requires authentication** for all authorization checks. This is because all rules evaluate `$jwt.user.id` against node properties.

**Future Enhancement:** To allow unauthenticated reads of public spaces, add:

```graphql
requireAuthentication: false
```

to filter rules for spaces with a `public: Boolean` property.

---

## Testing Authorization

### Test Case 1: MeSpace Owner-Only Access

- [ ] Owner can READ MeSpace
- [ ] Owner can UPDATE MeSpace name
- [ ] Owner can DELETE MeSpace
- [ ] Non-owner cannot READ MeSpace
- [ ] Non-owner cannot UPDATE MeSpace
- [ ] Non-owner cannot DELETE MeSpace

### Test Case 2: WeSpace Member Access

- [ ] Owner can READ WeSpace
- [ ] ADMIN member can READ WeSpace
- [ ] MEMBER role can READ WeSpace
- [ ] GUEST role can READ WeSpace
- [ ] Non-member cannot READ WeSpace
- [ ] Only owner can UPDATE/DELETE WeSpace

### Test Case 3: FieldContext Cascading

- [ ] Space owner can CREATE context
- [ ] MEMBER role can CREATE context
- [ ] GUEST role CANNOT CREATE context
- [ ] Non-member cannot READ context
- [ ] Only owner or ADMIN can DELETE context

### Test Case 4: Pulse Cascading

- [ ] Only space members can READ pulses
- [ ] MEMBER role can CREATE pulses
- [ ] GUEST role CANNOT CREATE pulses
- [ ] Creator can DELETE own pulse (even with GUEST role)
- [ ] ADMIN can DELETE any pulse
- [ ] Space owner can DELETE any pulse

### Test Case 5: MeSpace Conversion

- [ ] Adding first member converts MeSpace to WeSpace
- [ ] Conversion preserves all data
- [ ] New member can now READ space content
- [ ] Response message indicates conversion

---

## Schema Changes Summary

### New Fields

- `FieldContext.createdBy: [LifeSensor!]!` - Who created this context
- `GoalPulse.createdBy: [LifeSensor!]!` - Who created this pulse
- `ResourcePulse.createdBy: [LifeSensor!]!` - Who created this pulse
- `StoryPulse.createdBy: [LifeSensor!]!` - Who created this pulse

### New Relationships

- `CREATED_BY` - Links contexts and pulses to their creators

### Changed Fields

- `GoalPulse.initiatedBy` → `GoalPulse.createdBy` (renamed for consistency)
- `ResourcePulse.initiatedBy` → `ResourcePulse.createdBy`
- `StoryPulse.initiatedBy` → `StoryPulse.createdBy`

### Removed Directives

- Field-level `@authorization` directives (replaced with type-level authorization)

---

## Best Practices & Design Decisions

1. **Type-Level Over Field-Level**: Authorization directives are applied to the entire type, not individual fields, for clarity and maintainability.

2. **Filter + Validate Strategy**:
   - Filter for READ operations (silent exclusion, better UX)
   - Validate for mutations (explicit errors, better debugging)

3. **Creator Exception**: Users can delete/update their own content even with GUEST role, encouraging participation.

4. **Role Hierarchy**: ADMIN > MEMBER > GUEST (checked with `in` operator for flexibility)

5. **Cascading Design**: Each level (Pulse → Context → Space) delegates authorization checks upward, creating a single source of truth for access control.

---

## Future Enhancements

1. **Audit Logging**: Track who created/updated/deleted entities
2. **Time-Based Access**: Allow temporary access to spaces
3. **Public Spaces**: Allow unauthenticated reads of public content
4. **Fine-Grained Permissions**: Per-field read restrictions
5. **Comment Threading**: Add comments to pulses with their own authorization
6. **Batch Operations**: Bulk create/update contexts and pulses
7. **Activity Feeds**: Show recent changes filtered by user permissions

---

## Related Files

- [src/lib/graphql/schema/schema.gql](../src/lib/graphql/schema/schema.gql) - Complete schema with authorization directives
- [src/lib/graphql/resolvers/space-membership-resolver.ts](../src/lib/graphql/resolvers/space-membership-resolver.ts) - MeSpace-to-WeSpace conversion logic
- [src/lib/permissions/space-permissions.ts](../src/lib/permissions/space-permissions.ts) - Permission validation utilities
- [docs/PERMISSIONS_SYSTEM.md](./PERMISSIONS_SYSTEM.md) - Original permissions documentation
