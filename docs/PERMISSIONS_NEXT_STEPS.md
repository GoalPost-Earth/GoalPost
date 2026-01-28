# Space Permissions - Next Steps for Development

## Phase Overview

The space permissions system has been implemented in three phases, with Phase 1 complete. Here's what's been done and what's next.

---

## ✅ Phase 1: Foundation (COMPLETE)

### What Was Done

1. **Schema Update**
   - Added `SpaceRole` enum (VIEW, EDIT)
   - Created `SpaceMembership` node type
   - Updated `MeSpace` and `WeSpace` to use `SpaceMembership` for members

2. **Search Filtering**
   - Updated `searchAll()` resolver to filter spaces by user membership/ownership
   - Only returns spaces where user is owner OR member
   - Prevents access to private spaces user doesn't belong to

3. **Documentation**
   - `PERMISSIONS_SYSTEM.md` - Comprehensive system documentation
   - `PERMISSIONS_QUICK_REFERENCE.md` - Developer quick reference
   - `PERMISSIONS_IMPLEMENTATION_SUMMARY.md` - What changed

### Files Modified

- `src/lib/graphql/schema/schema.gql`
- `src/lib/graphql/resolvers/search-resolver.ts`
- `docs/` - 3 new documentation files

---

## ⏳ Phase 2: Mutations (NEXT)

### Required Mutations

#### 1. Add Member to Space

```graphql
mutation AddSpaceMember($spaceId: ID!, $memberId: ID!, $role: SpaceRole!) {
  addSpaceMember(spaceId: $spaceId, memberId: $memberId, role: $role) {
    id
    name
    members {
      id
      role
      member {
        ... # on Person or Community
      }
    }
  }
}
```

**Implementation Checklist:**

- [ ] Create resolver in `src/lib/graphql/resolvers/`
- [ ] Validate that caller owns/has EDIT in space
- [ ] Create SpaceMembership node with provided role
- [ ] Create IS_MEMBER relationship
- [ ] Handle duplicate membership (error or update)
- [ ] Add tests

#### 2. Update Member Role

```graphql
mutation UpdateSpaceMemberRole(
  $spaceId: ID!
  $memberId: ID!
  $role: SpaceRole!
) {
  updateSpaceMemberRole(spaceId: $spaceId, memberId: $memberId, role: $role) {
    id
    role
  }
}
```

**Implementation Checklist:**

- [ ] Create resolver
- [ ] Validate that caller owns space
- [ ] Update SpaceMembership.role
- [ ] Audit log the change
- [ ] Add tests

#### 3. Remove Member from Space

```graphql
mutation RemoveSpaceMember($spaceId: ID!, $memberId: ID!) {
  removeSpaceMember(spaceId: $spaceId, memberId: $memberId) {
    id
    name
  }
}
```

**Implementation Checklist:**

- [ ] Create resolver
- [ ] Validate that caller owns space
- [ ] Delete SpaceMembership node
- [ ] Delete IS_MEMBER relationship
- [ ] Prevent removing owner (add safety check)
- [ ] Add tests

---

## ⏳ Phase 3: Permission Enforcement (FUTURE)

### Context & Pulse Access Control

#### 3.1 Filter Contexts by Role

When querying contexts in a space, filter based on member role:

```cypher
# For authenticated user, only return contexts in spaces they can access
MATCH (context:FieldContext)-[:HAS_CONTEXT]->(space:Space)
WHERE (
  # User owns the space
  EXISTS {
    MATCH (owner)-[:OWNS]->(space)
    WHERE owner.id = $userId
  }
  OR
  # User is a member (any role)
  EXISTS {
    MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(user)
    WHERE user.id = $userId
  }
)
RETURN context
```

**Implementation Checklist:**

- [ ] Add permission middleware for context queries
- [ ] Update FieldContext resolver to include permission check
- [ ] Add tests for permission denial

#### 3.2 Filter Pulses by Role

Pulses inherit permissions from their parent context:

```cypher
# For EDIT role users, return all pulses
# For VIEW role users, return only non-sensitive pulses (TBD)
MATCH (pulse:FieldPulse)-[:HAS_PULSE]->(context:FieldContext)-[:HAS_CONTEXT]->(space:Space)
WHERE (
  EXISTS {
    MATCH (owner)-[:OWNS]->(space)
    WHERE owner.id = $userId
  }
  OR
  EXISTS {
    MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(user)
    WHERE user.id = $userId
  }
)
RETURN pulse, context.title
```

**Implementation Checklist:**

- [ ] Add permission middleware for pulse queries
- [ ] Update pulse resolvers (create, update, delete)
- [ ] Enforce role on mutation operations
- [ ] Add tests

#### 3.3 Mutation Permission Checks

Before allowing pulse/context modifications:

```typescript
// In resolvers/pulse-resolver.ts or similar
async function checkPulseEditPermission(userId: string, pulseId: string) {
  const canEdit = await checkUserRoleInPulseSpace(userId, pulseId, 'EDIT')
  if (!canEdit) {
    throw new Error('Insufficient permissions to edit pulse')
  }
}
```

**Implementation Checklist:**

- [ ] Create permission check utility function
- [ ] Add to all mutation resolvers (create, update, delete)
- [ ] Return proper error messages
- [ ] Add tests

---

## 🔄 Data Migration

Before deploying Phase 2+, existing spaces need migration:

### Migration Script

Create `scripts/migrate-space-members.js`:

```typescript
// Pseudocode
export async function migrateSpaceMembers() {
  const graph = await initGraph()

  // Find all (Space)-[:HAS_MEMBER]-(member) relationships
  const result = await graph.query(`
    MATCH (space:Space)-[old:HAS_MEMBER]-(member)
    WHERE member:Person OR member:Community
    RETURN space.id, member.id, collect(old) as rels
  `)

  // For each relationship, create SpaceMembership
  for (const record of result) {
    const sm = {
      id: generateId(),
      role: 'EDIT', // Default for backward compatibility
      addedAt: new Date(),
    }

    await graph.query(
      `
      MATCH (s {id: $spaceId}), (m {id: $memberId})
      CREATE (sm:SpaceMembership $membership)
      CREATE (s)-[:HAS_MEMBER]->(sm)-[:IS_MEMBER]->(m)
      RETURN sm
    `,
      { spaceId: record.space_id, memberId: record.member_id, membership: sm }
    )
  }

  // Delete old relationships
  await graph.query(`
    MATCH (space:Space)-[old:HAS_MEMBER]-(member)
    WHERE (member:Person OR member:Community)
    DELETE old
  `)
}
```

**Checklist:**

- [ ] Create migration script in `scripts/`
- [ ] Test on staging environment
- [ ] Backup production database before running
- [ ] Add rollback procedure
- [ ] Document in CHANGELOG

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// test/permissions/space-membership.test.ts
describe('Space Permissions', () => {
  describe('addSpaceMember', () => {
    it('should add member with VIEW role', async () => {})
    it('should add member with EDIT role', async () => {})
    it('should fail if caller not owner', async () => {})
    it('should fail if member already exists', async () => {})
  })

  describe('updateSpaceMemberRole', () => {
    it('should update role to VIEW', async () => {})
    it('should update role to EDIT', async () => {})
    it('should fail if caller not owner', async () => {})
  })

  describe('removeSpaceMember', () => {
    it('should remove member from space', async () => {})
    it('should fail if caller not owner', async () => {})
    it('should fail if removing owner', async () => {})
  })
})
```

### Integration Tests

```typescript
// test/integration/space-permissions.integration.test.ts
describe('Space Permissions Integration', () => {
  it('should filter search results by membership', async () => {})
  it('should allow EDIT role to modify pulses', async () => {})
  it('should prevent VIEW role from modifying pulses', async () => {})
  it('should allow VIEW role to read pulses', async () => {})
})
```

---

## 🚀 Deployment Strategy

1. **Deploy Phase 1** (Already done)
   - Schema changes (backward compatible)
   - Search filtering
   - No data changes required yet

2. **Pre-Phase 2**: Migration
   - Run migration script on staging
   - Verify data integrity
   - Backup production
   - Run migration script on production

3. **Deploy Phase 2**
   - Add mutations
   - Update UI to manage members
   - Add member list views

4. **Deploy Phase 3**
   - Add permission enforcement
   - Update mutation resolvers
   - Add role-based filtering

---

## 📋 Checklist for Next Developer

Starting Phase 2? Here's what to do:

- [ ] Read [PERMISSIONS_QUICK_REFERENCE.md](./PERMISSIONS_QUICK_REFERENCE.md)
- [ ] Review [PERMISSIONS_SYSTEM.md](./PERMISSIONS_SYSTEM.md) fully
- [ ] Review this file completely
- [ ] Create `src/lib/graphql/resolvers/space-membership-resolver.ts`
- [ ] Add mutations to schema (addSpaceMember, updateSpaceMemberRole, removeSpaceMember)
- [ ] Implement permission checking utility in `src/lib/permissions/`
- [ ] Write tests in `tests/permissions/`
- [ ] Create migration script in `scripts/`
- [ ] Update CHANGELOG with changes
- [ ] Create PR with Phase 2 implementation

---

## 🔗 Related Documentation

- [GraphQL Schema](../src/lib/graphql/schema/schema.gql)
- [Search Resolver](../src/lib/graphql/resolvers/search-resolver.ts)
- [Permissions System](./PERMISSIONS_SYSTEM.md)
- [Permissions Quick Reference](./PERMISSIONS_QUICK_REFERENCE.md)
- [Permissions Implementation Summary](./PERMISSIONS_IMPLEMENTATION_SUMMARY.md)

---

## Questions?

When implementing the next phase:

1. Check the documentation files above
2. Review existing resolvers in `src/lib/graphql/resolvers/`
3. Look at test examples in `tests/`
4. Ask team members about decision on role semantics vs implementation
