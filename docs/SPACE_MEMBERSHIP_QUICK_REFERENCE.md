# Space Membership - Permission Matrix & Quick Reference

## Permission Matrix

```
┌─────────────────────┬──────────┬────────┬───────┐
│ Action              │ OWNER    │ ADMIN  │ MEMBER│ GUEST│
├─────────────────────┼──────────┼────────┼───────┼──────┤
│ Manage Members      │ ✅ Yes   │ ✅ Yes │ ❌ No │ ❌ No│
│  - Add              │ ✅ Yes   │ ✅ Yes │ ❌ No │ ❌ No│
│  - Remove           │ ✅ Yes   │ ✅ Yes │ ❌ No │ ❌ No│
│  - Change Role      │ ✅ Yes   │ ✅ Yes │ ❌ No │ ❌ No│
├─────────────────────┼──────────┼────────┼───────┼──────┤
│ Content Operations  │          │        │       │      │
│  - Create Pulse     │ ✅ Yes   │ ✅ Yes │ ✅ Yes│ ❌ No│
│  - Edit Pulse       │ ✅ Yes   │ ✅ Yes │ ✅ Yes│ ❌ No│
│  - Delete Pulse     │ ✅ Yes   │ ✅ Yes │ ✅ Yes│ ❌ No│
│  - Create Context   │ ✅ Yes   │ ✅ Yes │ ✅ Yes│ ❌ No│
│  - Edit Context     │ ✅ Yes   │ ✅ Yes │ ✅ Yes│ ❌ No│
│  - Delete Context   │ ✅ Yes   │ ✅ Yes │ ✅ Yes│ ❌ No│
├─────────────────────┼──────────┼────────┼───────┼──────┤
│ View Pulse          │ ✅ Yes   │ ✅ Yes │ ✅ Yes│ ✅ Yes│
│ View Context        │ ✅ Yes   │ ✅ Yes │ ✅ Yes│ ✅ Yes│
│ View Members        │ ✅ Yes   │ ✅ Yes │ ✅ Yes│ ✅ Yes│
│ Change Space Settings│ ✅ Yes  │ ❌ No  │ ❌ No │ ❌ No│
│ Delete Space        │ ✅ Yes   │ ❌ No  │ ❌ No │ ❌ No│
└─────────────────────┴──────────┴────────┴───────┴──────┘
```

## GraphQL Mutations

### Add Member

```graphql
mutation AddMember($spaceId: ID!, $memberId: ID!, $role: SpaceRole!) {
  addSpaceMember(spaceId: $spaceId, memberId: $memberId, role: $role) {
    success
    message
    membership {
      id
      role
      addedAt
    }
  }
}

# Variables
{
  "spaceId": "space_123",
  "memberId": "person_456",
  "role": "ADMIN"
}
```

### Update Role

```graphql
mutation UpdateRole($spaceId: ID!, $memberId: ID!, $role: SpaceRole!) {
  updateSpaceMemberRole(spaceId: $spaceId, memberId: $memberId, role: $role) {
    success
    message
    membership {
      id
      role
      addedAt
    }
  }
}

# Variables
{
  "spaceId": "space_123",
  "memberId": "person_456",
  "role": "MEMBER"
}
```

### Remove Member

```graphql
mutation RemoveMember($spaceId: ID!, $memberId: ID!) {
  removeSpaceMember(spaceId: $spaceId, memberId: $memberId) {
    success
    message
  }
}

# Variables
{
  "spaceId": "space_123",
  "memberId": "person_456"
}
```

---

## Role Decision Tree

```
User wants to manage members?
├─ Is user the space OWNER?
│  └─ YES ✅ → Can manage
└─ Is user a member?
   ├─ Has ADMIN role?
   │  └─ YES ✅ → Can manage
   └─ Has MEMBER role?
      └─ NO ❌ → Cannot manage
   └─ Has GUEST role?
      └─ NO ❌ → Cannot manage

User wants to edit content?
├─ Is user the space OWNER?
│  └─ YES ✅ → Can edit
└─ Is user a member?
   ├─ Has ADMIN role?
   │  └─ YES ✅ → Can edit
   └─ Has MEMBER role?
      └─ YES ✅ → Can edit
   └─ Has GUEST role?
      └─ NO ❌ → Cannot edit

User wants to view content?
├─ Is user the space OWNER?
│  └─ YES ✅ → Can view
└─ Is user a member?
   ├─ Has any role (ADMIN, MEMBER, GUEST)?
      └─ YES ✅ → Can view
   └─ NO role?
      └─ NO ❌ → Cannot view
```

---

## Cypher Patterns

### Check if user can manage members

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

### Check if user can edit content

```cypher
MATCH (user:LifeSensor {id: $userId}), (space:Space {id: $spaceId})
RETURN
  EXISTS {
    MATCH (user)-[:OWNS]->(space)
  } as isOwner,
  EXISTS {
    MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership {role: 'ADMIN'})-[:IS_MEMBER]->(user)
  } as isAdmin,
  EXISTS {
    MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership {role: 'MEMBER'})-[:IS_MEMBER]->(user)
  } as isMember
```

### Add member with role

```cypher
MATCH (space:Space {id: $spaceId}), (member:LifeSensor {id: $memberId})
CREATE (sm:SpaceMembership {
  id: randomUUID(),
  role: $role,           # 'ADMIN' | 'MEMBER' | 'GUEST'
  addedAt: datetime()
})
CREATE (space)-[:HAS_MEMBER]->(sm)-[:IS_MEMBER]->(member)
RETURN sm
```

### List members with roles

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

### Update member role

```cypher
MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member {id: $memberId})
SET sm.role = $role
RETURN sm
```

### Remove member

```cypher
MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member {id: $memberId})
DETACH DELETE sm
RETURN COUNT(*) as removed
```

---

## TypeScript Usage

### Import Permission Functions

```typescript
import {
  canManageMembers,
  canEditContent,
  canViewContent,
  getUserSpaceRole,
  memberExistsInSpace,
  isSpaceOwner,
} from '@/lib/permissions/space-permissions'
```

### Check Permissions

```typescript
const session = context.executionContext.session()

// Can user manage members?
const canManage = await canManageMembers(session, userId, spaceId)

// Can user edit content?
const canEdit = await canEditContent(session, userId, spaceId)

// Can user view content?
const canView = await canViewContent(session, userId, spaceId)

// What's the user's role?
const role = await getUserSpaceRole(session, userId, spaceId)
// Returns: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' | null
```

### Call Mutations

```typescript
import { spaceMembershipResolvers } from '@/lib/graphql/resolvers/space-membership-resolver'

const result = await spaceMembershipResolvers.addSpaceMember(
  null,
  {
    spaceId: 'space_123',
    memberId: 'person_456',
    role: 'ADMIN',
  },
  context
)

// result.success: boolean
// result.message: string
// result.membership?: { id, role, addedAt }
```

---

## Error Scenarios

| Scenario                       | Error Message                                                   |
| ------------------------------ | --------------------------------------------------------------- |
| Non-owner tries to add member  | "Only space owners and ADMIN members can add new members"       |
| Member already in space        | "This member is already part of the space."                     |
| Space/member doesn't exist     | "Failed to create space membership. Space or member not found." |
| Non-admin tries to change role | "Only space owners and ADMIN members can change member roles."  |
| Member not in space            | "This member is not part of the space."                         |
| Try to change owner's role     | "Cannot change the role of the space owner."                    |
| Try to remove owner            | "Cannot remove the space owner from the space."                 |

---

## Database Relationships

### Before Adding Member

```
(Space)
├── [:OWNS] → Owner (implicit admin)
└── (no members)
```

### After Adding Member as ADMIN

```
(Space)
├── [:OWNS] → Owner
└── [:HAS_MEMBER] → SpaceMembership {role: 'ADMIN', addedAt: ...}
                      ↓ [:IS_MEMBER]
                      Member
```

### Multiple Members

```
(Space)
├── [:OWNS] → Owner
├── [:HAS_MEMBER] → SpaceMembership {role: 'ADMIN'} → Person A
├── [:HAS_MEMBER] → SpaceMembership {role: 'MEMBER'} → Person B
└── [:HAS_MEMBER] → SpaceMembership {role: 'GUEST'} → Person C
```

---

## Implementation Files

| File                                                     | Purpose                   |
| -------------------------------------------------------- | ------------------------- |
| `src/lib/graphql/schema/schema.gql`                      | GraphQL types & mutations |
| `src/lib/graphql/resolvers/space-membership-resolver.ts` | Mutation logic            |
| `src/lib/permissions/space-permissions.ts`               | Permission validation     |
| `src/utils/id-generator.ts`                              | Unique ID generation      |
| `src/lib/graphql/resolvers/index.ts`                     | Resolver registration     |

---

## Phase Status

✅ **Phase 1**: Foundation (search filtering) - COMPLETE
✅ **Phase 2**: Member management mutations - COMPLETE ← You are here
⏳ **Phase 3**: Permission enforcement - NEXT

---

## Quick Links

- [Full Implementation Details](./SPACE_MEMBERSHIP_MUTATIONS_COMPLETE.md)
- [Permission System Overview](./docs/PERMISSIONS_SYSTEM.md)
- [Next Steps (Phase 3)](./docs/PERMISSIONS_NEXT_STEPS.md)
