# AI Assistant CRUD Tool Suite - Implementation Guide

**Status**: 🚧 In Progress  
**Current Phase**: Phase 1 - Space Management  
**Last Updated**: February 15, 2026

---

## Overview

The AI Assistant currently lacks the ability to find and edit user-owned entities (Spaces, FieldContexts, FieldPulses). This implementation adds a comprehensive CRUD tool suite that enables the assistant to manage all user-editable entities with proper permission checks.

### Key Features

- **JWT-based authentication**: Automatic user context extraction from chat API
- **Permission-aware tools**: Follows Neo4j authorization cascade (Space → Context → Pulse)
- **Disambiguation pattern**: Returns multiple matches for user clarification (like `search_person_by_name`)
- **Structured responses**: Consistent JSON format with status codes
- **Phased rollout**: Three phases for incremental testing and validation

### Architecture

```
Chat API → Extract JWT → Get User ID
    ↓
Initialize Tools (with userId)
    ↓
LangChain Agent → Tool Selection → Permission Check → Neo4j Query
    ↓
Structured JSON Response → LLM Formatting → User Message
```

---

## Permission Model Summary

**Space Roles:**

- `OWNER` - Full control (delete space, manage members, modify settings)
- `ADMIN` - Manage members + full content access
- `MEMBER` - Create/edit content (pulses, contexts)
- `GUEST` - Read-only access

**Permission Cascade:**

```
Space (Owner + Members with roles)
  ↓ inherits
FieldContext (Space permissions + Creator rights)
  ↓ inherits
FieldPulse (Context permissions + Creator rights)
  ↓ inherits
ConversationChunk (Pulse permissions)
```

**Operation Permissions Matrix:**
| Action | OWNER | ADMIN | MEMBER | GUEST |
|--------|-------|-------|--------|-------|
| Manage Members | ✅ | ✅ | ❌ | ❌ |
| Create Content | ✅ | ✅ | ✅ | ❌ |
| Edit Own Content | ✅ | ✅ | ✅ | ❌ |
| Edit Others' Content | ✅ | ✅ | ❌ | ❌ |
| Delete Own Content | ✅ | ✅ | ✅ | ❌ |
| Delete Others' Content | ✅ | ✅ | ❌ | ❌ |
| Delete Space | ✅ | ❌ | ❌ | ❌ |
| View All | ✅ | ✅ | ✅ | ✅ |

---

## Technical Patterns

### Tool Response Structure

All tools return consistent JSON format:

```typescript
{
  status: 'success' | 'error' | 'not_found' | 'permission_denied',
  message: string,
  data?: any,
  needsDisambiguation?: boolean  // For find operations
}
```

### Permission Query Patterns

**Owner Check:**

```cypher
MATCH (user:Person {id: $userId})-[:OWNS]->(space:Space {id: $spaceId})
```

**Owner or ADMIN Check (Member Management):**

```cypher
MATCH (user:Person {id: $userId})
MATCH (space:Space {id: $spaceId})
WHERE EXISTS {
  MATCH (user)-[:OWNS]->(space)
} OR EXISTS {
  MATCH (user)-[:IS_MEMBER]->(m:SpaceMembership {role: 'ADMIN'})-[:HAS_MEMBER]-(space)
}
```

**Any Member Check (View Access):**

```cypher
MATCH (user:Person {id: $userId})
MATCH (space:Space {id: $spaceId})
WHERE EXISTS {
  MATCH (user)-[:OWNS]->(space)
} OR EXISTS {
  MATCH (user)-[:IS_MEMBER]->(:SpaceMembership)-[:HAS_MEMBER]-(space)
}
```

### Tool Implementation Template

```typescript
import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { z } from 'zod'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

const ToolSchema = z.object({
  param: z.string().describe('Description for LLM'),
})

export function createYourTool(
  graph: Neo4jGraph,
  userId: string
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'entity_operation',
    description:
      'When to use: [specific scenarios]. Permissions: [required role].',
    schema: ToolSchema,
    func: async (input) => {
      try {
        // Permission check
        const authCheck = await graph.query(
          `MATCH (user:Person {id: $userId})... RETURN count(*) as authorized`,
          { userId, ...input }
        )

        if (!authCheck[0]?.authorized) {
          return JSON.stringify({
            status: 'permission_denied',
            message: 'Permission denied',
          })
        }

        // Execute operation
        const results = await graph.query(cypherQuery, input)

        if (!results || results.length === 0) {
          return JSON.stringify({
            status: 'not_found',
            message: 'Entity not found',
          })
        }

        return JSON.stringify({
          status: 'success',
          data: results,
          message: 'Operation completed',
        })
      } catch (error) {
        console.error('[tool_name]', error)
        return JSON.stringify({
          status: 'error',
          message: error.message,
        })
      }
    },
  })
}
```

---

## Phase 1: Space Management Tools

**Status**: ⬜ Not Started  
**Estimated Complexity**: Medium  
**Files to Create**: 13  
**Files to Modify**: 2

### 1.1 JWT Authentication Setup

**File**: `src/app/api/chat/simulation/route.ts`

- [ ] Import `getUserFromToken` from `src/app/api/auth/utils.ts`
- [ ] Extract user from JWT in POST handler
- [ ] Return 401 if authentication fails
- [ ] Pass `userId` to `initTools()` function

**Implementation:**

```typescript
// Add import
import { getUserFromToken } from '@/app/api/auth/utils'

// In POST handler, before tool initialization
const user = await getUserFromToken(request)
if (!user) {
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  )
}

// Pass userId to tools
const tools = await initTools(llm, embeddings, graph, user.id)
```

### 1.2 Tool Registry Update

**File**: `src/modules/agent/tools/index.ts`

- [ ] Add `userId: string` parameter to `initTools()` function
- [ ] Import space tools from `./space`
- [ ] Pass `userId` to each space tool factory
- [ ] Add all space tools to returned array

### 1.3 Space Tools Directory Structure

**Directory**: `src/modules/agent/tools/space/`

- [ ] Create directory
- [ ] Create `types.ts` with shared interfaces
- [ ] Create `index.ts` barrel export

**Types to Define** (`types.ts`):

```typescript
export interface SpaceSummary {
  id: string
  name: string
  type: 'MeSpace' | 'WeSpace'
  role: 'owner' | 'ADMIN' | 'MEMBER' | 'GUEST'
  visibility: 'PRIVATE' | 'SHARED'
  createdAt: string
  memberCount: number
  contextCount: number
}

export interface SpaceDetails extends SpaceSummary {
  members: Array<{
    id: string
    name: string
    role: 'ADMIN' | 'MEMBER' | 'GUEST'
    addedAt: string
  }>
  contexts: Array<{
    id: string
    title: string
    emergentName?: string
    pulseCount: number
  }>
}

export interface SpaceOperationResult {
  status: 'success' | 'error' | 'not_found' | 'permission_denied'
  message: string
  data?: any
  needsDisambiguation?: boolean
}
```

### 1.4 Tool: `space_find`

**File**: `src/modules/agent/tools/space/space-find.tool.ts`

- [ ] Create file with tool implementation
- [ ] Define Zod schema for inputs
- [ ] Implement query for owned + member spaces
- [ ] Handle name filtering (case-insensitive CONTAINS)
- [ ] Return disambiguation structure for multiple matches
- [ ] Export tool factory function

**Schema:**

```typescript
z.object({
  nameFilter: z
    .string()
    .optional()
    .describe('Space name to search for (partial match, case-insensitive)'),
  includeShared: z
    .boolean()
    .optional()
    .default(true)
    .describe('Include spaces where user is a member'),
})
```

**Returns:**

```typescript
{
  found: boolean
  count: number
  spaces: SpaceSummary[]
  needsDisambiguation: boolean
  message: string
}
```

**Cypher Query:**

```cypher
MATCH (user:Person {id: $userId})

// Get owned spaces
OPTIONAL MATCH (user)-[:OWNS]->(ownedSpace:Space)
WHERE $nameFilter IS NULL OR ownedSpace.name CONTAINS $nameFilter
OPTIONAL MATCH (ownedSpace)-[:HAS_MEMBER]->(om:SpaceMembership)
OPTIONAL MATCH (ownedSpace)-[:HAS_CONTEXT]->(oc:FieldContext)
WITH user, ownedSpace, 'owner' as ownedRole,
     count(DISTINCT om) as ownedMembers,
     count(DISTINCT oc) as ownedContexts

// Get member spaces (if includeShared=true)
OPTIONAL MATCH (user)-[:IS_MEMBER]->(membership:SpaceMembership)-[:HAS_MEMBER]-(memberSpace:Space)
WHERE ($includeShared = true) AND ($nameFilter IS NULL OR memberSpace.name CONTAINS $nameFilter)
OPTIONAL MATCH (memberSpace)-[:HAS_MEMBER]->(mm:SpaceMembership)
OPTIONAL MATCH (memberSpace)-[:HAS_CONTEXT]->(mc:FieldContext)

WITH collect(DISTINCT {
  id: ownedSpace.id,
  name: ownedSpace.name,
  type: CASE WHEN 'MeSpace' IN labels(ownedSpace) THEN 'MeSpace' ELSE 'WeSpace' END,
  role: ownedRole,
  visibility: ownedSpace.visibility,
  createdAt: ownedSpace.createdAt,
  memberCount: ownedMembers,
  contextCount: ownedContexts
}) + collect(DISTINCT {
  id: memberSpace.id,
  name: memberSpace.name,
  type: CASE WHEN 'MeSpace' IN labels(memberSpace) THEN 'MeSpace' ELSE 'WeSpace' END,
  role: membership.role,
  visibility: memberSpace.visibility,
  createdAt: memberSpace.createdAt,
  memberCount: count(DISTINCT mm),
  contextCount: count(DISTINCT mc)
}) as allSpaces

RETURN [space IN allSpaces WHERE space.id IS NOT NULL] as spaces
```

### 1.5 Tool: `space_get_details`

**File**: `src/modules/agent/tools/space/space-get-details.tool.ts`

- [ ] Create file with tool implementation
- [ ] Define schema: `{ spaceId: string }`
- [ ] Verify user has view permission (owner or member)
- [ ] Query space with members and contexts
- [ ] Return `SpaceDetails` structure

### 1.6 Tool: `space_create`

**File**: `src/modules/agent/tools/space/space-create.tool.ts`

- [ ] Create file with tool implementation
- [ ] Define schema: `{ name: string, spaceType: 'MeSpace' | 'WeSpace', visibility?: 'PRIVATE' | 'SHARED' }`
- [ ] Generate unique space ID: `space_${Date.now()}_${randomString(8)}`
- [ ] Create space node with appropriate labels
- [ ] Create OWNS relationship
- [ ] Return created space data

**Cypher:**

```cypher
CREATE (space:Space {
  id: $spaceId,
  name: $name,
  visibility: $visibility,
  createdAt: datetime()
})
SET space:${spaceType}

WITH space
MATCH (user:Person {id: $userId})
CREATE (user)-[:OWNS]->(space)

RETURN space
```

### 1.7 Tool: `space_update_name`

**File**: `src/modules/agent/tools/space/space-update-name.tool.ts`

- [ ] Create file with tool implementation
- [ ] Define schema: `{ spaceId: string, newName: string }`
- [ ] Verify ownership (owner only)
- [ ] Update name and modifiedAt properties
- [ ] Return updated space

### 1.8 Tool: `space_update_visibility`

**File**: `src/modules/agent/tools/space/space-update-visibility.tool.ts`

- [ ] Create file with tool implementation
- [ ] Define schema: `{ spaceId: string, visibility: 'PRIVATE' | 'SHARED' }`
- [ ] Verify ownership
- [ ] Update visibility property
- [ ] Return result

### 1.9 Tool: `space_delete`

**File**: `src/modules/agent/tools/space/space-delete.tool.ts`

- [ ] Create file with tool implementation
- [ ] Define schema: `{ spaceId: string, confirm: boolean }`
- [ ] Require `confirm: true` flag
- [ ] Verify ownership
- [ ] Delete space (cascades to contexts/pulses via relationships)
- [ ] Return deletion confirmation

**Important**: Use `DETACH DELETE` to remove relationships automatically:

```cypher
MATCH (user:Person {id: $userId})-[:OWNS]->(space:Space {id: $spaceId})
DETACH DELETE space
RETURN { deleted: true }
```

### 1.10 Tool: `space_add_member`

**File**: `src/modules/agent/tools/space/space-add-member.tool.ts`

- [ ] Create file with tool implementation
- [ ] Define schema: `{ spaceId: string, memberPersonId: string, role: 'ADMIN' | 'MEMBER' | 'GUEST' }`
- [ ] Verify permission (owner or ADMIN)
- [ ] Check if MeSpace → auto-convert to WeSpace
- [ ] Create SpaceMembership node
- [ ] Create relationships: `(Space)-[:HAS_MEMBER]->(Membership)-[:IS_MEMBER]->(Person)`
- [ ] Return membership data

**MeSpace → WeSpace conversion:**

```cypher
MATCH (space:MeSpace {id: $spaceId})
REMOVE space:MeSpace
SET space:WeSpace
```

### 1.11 Tool: `space_update_member_role`

**File**: `src/modules/agent/tools/space/space-update-member-role.tool.ts`

- [ ] Create file with tool implementation
- [ ] Define schema: `{ spaceId: string, memberPersonId: string, newRole: 'ADMIN' | 'MEMBER' | 'GUEST' }`
- [ ] Verify permission (owner or ADMIN)
- [ ] Prevent changing owner's role
- [ ] Update SpaceMembership role
- [ ] Return updated membership

### 1.12 Tool: `space_remove_member`

**File**: `src/modules/agent/tools/space/space-remove-member.tool.ts`

- [ ] Create file with tool implementation
- [ ] Define schema: `{ spaceId: string, memberPersonId: string }`
- [ ] Verify permission (owner or ADMIN)
- [ ] Prevent removing owner
- [ ] Delete SpaceMembership node
- [ ] Return confirmation

---

## Phase 1 Verification

### Setup Test Environment

**Create Test Data:**

```cypher
// Create test users
CREATE (user1:Person:User {
  id: 'test_user_1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com'
})
CREATE (user2:Person:User {
  id: 'test_user_2',
  firstName: 'Jane',
  lastName: 'Collaborator',
  email: 'jane@example.com'
})

// Create test spaces
CREATE (me1:Space:MeSpace {
  id: 'space_me_1',
  name: 'Personal Notes',
  visibility: 'PRIVATE',
  createdAt: datetime()
})
CREATE (we1:Space:WeSpace {
  id: 'space_we_1',
  name: 'Team Project',
  visibility: 'SHARED',
  createdAt: datetime()
})
CREATE (we2:Space:WeSpace {
  id: 'space_we_2',
  name: 'Alpha Research',
  visibility: 'PRIVATE',
  createdAt: datetime()
})

// Create relationships
CREATE (user1)-[:OWNS]->(me1)
CREATE (user1)-[:OWNS]->(we1)
CREATE (user1)-[:OWNS]->(we2)

// Add members to Team Project
CREATE (m1:SpaceMembership {
  id: 'member_1',
  role: 'ADMIN',
  addedAt: datetime()
})
CREATE (m2:SpaceMembership {
  id: 'member_2',
  role: 'MEMBER',
  addedAt: datetime()
})
CREATE (we1)-[:HAS_MEMBER]->(m1)-[:IS_MEMBER]->(user2)
```

### Test Cases

#### 1. Authentication Test

- [ ] **Test**: Request without Authorization header
- [ ] **Expected**: 401 error
- [ ] **Test**: Request with invalid JWT
- [ ] **Expected**: 401 error
- [ ] **Test**: Request with valid JWT
- [ ] **Expected**: Tools execute successfully

#### 2. Find Space Tests

- [ ] **Test**: "Show me all my spaces"
- [ ] **Expected**: Returns all 3 spaces (Personal Notes, Team Project, Alpha Research)
- [ ] **Verify**: Each space has correct type, role, visibility

- [ ] **Test**: "Find spaces with 'project'"
- [ ] **Expected**: Returns only "Team Project"
- [ ] **Verify**: Single match, no disambiguation

- [ ] **Test**: "Find spaces with 'alpha'"
- [ ] **Expected**: Returns "Alpha Research"

- [ ] **Test**: "Find space named 'Nonexistent'"
- [ ] **Expected**: Status: not_found, appropriate message

#### 3. Disambiguation Test

- [ ] **Setup**: Create "Alpha One" and "Alpha Two" spaces
- [ ] **Test**: "Find spaces with alpha"
- [ ] **Expected**: Returns 3 matches (Alpha Research, Alpha One, Alpha Two)
- [ ] **Verify**: needsDisambiguation=true
- [ ] **Verify**: LLM asks user to clarify which space they mean

#### 4. Space Details Test

- [ ] **Test**: "Show details for Team Project"
- [ ] **Expected**: Returns space + member list (Jane as ADMIN) + context count
- [ ] **Verify**: User role shows as 'owner'

- [ ] **Test**: Query space owned by different user (as user2)
- [ ] **Expected**: permission_denied (user2 not owner or member)

#### 5. Create Space Test

- [ ] **Test**: "Create a new MeSpace called 'Journal'"
- [ ] **Expected**: Success, returns space ID and data
- [ ] **Verify**: Space exists in Neo4j with correct labels `["Space", "MeSpace"]`
- [ ] **Verify**: OWNS relationship from user1 to space

- [ ] **Test**: "Create a WeSpace called 'Collaboration Hub'"
- [ ] **Expected**: Success with WeSpace labels
- [ ] **Verify**: Space created with correct type

#### 6. Rename Test

- [ ] **Test**: "Rename 'Personal Notes' to 'Daily Journal'"
- [ ] **Expected**: Success, returns updated space
- [ ] **Verify**: Name updated in Neo4j
- [ ] **Verify**: modifiedAt timestamp set

- [ ] **Test**: User2 attempts to rename "Daily Journal"
- [ ] **Expected**: permission_denied (not owner)

- [ ] **Test**: Member (non-owner) attempts rename
- [ ] **Expected**: permission_denied

#### 7. Visibility Test

- [ ] **Test**: "Make 'Daily Journal' shared"
- [ ] **Expected**: visibility changed to SHARED
- [ ] **Verify**: Property updated in Neo4j

- [ ] **Test**: "Make 'Team Project' private"
- [ ] **Expected**: visibility changed to PRIVATE
- [ ] **Verify**: Property updated

#### 8. Member Management Tests

**Add Member:**

- [ ] **Test**: "Add Jane (test_user_2) as MEMBER to 'Team Project'"
- [ ] **Expected**: Success (already a member, should update or confirm)
- [ ] **Verify**: SpaceMembership node exists

- [ ] **Test**: Create user3, "Add user3 as GUEST to Team Project"
- [ ] **Expected**: Success, SpaceMembership created with GUEST role
- [ ] **Verify**: Relationships: (Space)-[:HAS_MEMBER]->(Membership)-[:IS_MEMBER]->(Person)

**Update Role:**

- [ ] **Test**: "Make Jane an ADMIN in Team Project"
- [ ] **Expected**: Role updated from MEMBER to ADMIN
- [ ] **Verify**: SpaceMembership.role = 'ADMIN'

- [ ] **Test**: "Downgrade user3 to GUEST"
- [ ] **Expected**: Role updated

**Remove Member:**

- [ ] **Test**: "Remove user3 from Team Project"
- [ ] **Expected**: Success, membership deleted
- [ ] **Verify**: SpaceMembership node removed from Neo4j

- [ ] **Test**: "Remove myself (owner) from Team Project"
- [ ] **Expected**: permission_denied (cannot remove owner)

#### 9. MeSpace → WeSpace Conversion Test

- [ ] **Test**: Create MeSpace "Solo Work"
- [ ] **Test**: "Add Jane as MEMBER to Solo Work"
- [ ] **Expected**: Success
- [ ] **Verify**: Space labels changed from MeSpace to WeSpace
- [ ] **Verify**: SpaceMembership created for Jane

#### 10. Delete Test

- [ ] **Test**: "Delete 'Journal' space" (without confirm flag)
- [ ] **Expected**: Error or requires confirm=true

- [ ] **Test**: "Delete 'Journal' space" (with confirm=true via LLM understanding)
- [ ] **Expected**: Space deleted
- [ ] **Verify**: Space node no longer in Neo4j
- [ ] **Verify**: No orphaned contexts or pulses (cascade delete)

- [ ] **Test**: User2 attempts to delete "Team Project"
- [ ] **Expected**: permission_denied (not owner)

#### 11. Permission Matrix Test

**Setup**: Create space with user1 as owner, user2 as ADMIN, user3 as MEMBER, user4 as GUEST

**As Owner (user1):**

- [ ] View details ✅
- [ ] Add members ✅
- [ ] Update member roles ✅
- [ ] Rename space ✅
- [ ] Update visibility ✅
- [ ] Delete space ✅

**As ADMIN (user2):**

- [ ] View details ✅
- [ ] Add members ✅
- [ ] Update member roles ✅
- [ ] Rename space ❌ (permission_denied)
- [ ] Update visibility ❌
- [ ] Delete space ❌

**As MEMBER (user3):**

- [ ] View details ✅
- [ ] Add members ❌
- [ ] Rename space ❌
- [ ] Delete space ❌

**As GUEST (user4):**

- [ ] View details ✅
- [ ] All modifications ❌

#### 12. End-to-End Flow

- [ ] Create new WeSpace "Product Launch"
- [ ] Add 2 members (ADMIN, MEMBER)
- [ ] Get space details (verify members shown)
- [ ] Rename space to "Launch Campaign"
- [ ] Update visibility to SHARED
- [ ] Update member role (MEMBER → ADMIN)
- [ ] Remove one member
- [ ] Delete space
- [ ] **Verify**: No orphaned nodes in Neo4j

### Neo4j Verification Queries

**Check space ownership:**

```cypher
MATCH (user:Person {id: 'test_user_1'})-[:OWNS]->(space:Space)
RETURN space.id, space.name, labels(space)
```

**Check memberships:**

```cypher
MATCH (space:Space {id: 'space_we_1'})-[:HAS_MEMBER]->(m:SpaceMembership)-[:IS_MEMBER]->(person:Person)
RETURN m.role, person.name
```

**Check for orphaned nodes after deletion:**

```cypher
MATCH (n)
WHERE NOT (n)--()
RETURN labels(n), count(*)
```

---

## Phase 2: FieldContext (Field) Management Tools

**Status**: ⬜ Not Started  
**Dependencies**: Phase 1 complete  
**Estimated Complexity**: Medium  
**Files to Create**: 7  
**Files to Modify**: 1

### Overview

FieldContext tools allow users to manage fields/contexts within spaces. Permissions cascade from Space (must be owner, ADMIN, or MEMBER to create/edit).

### Tools to Implement

#### 2.1 Tool: `context_find`

- **File**: `src/modules/agent/tools/context/context-find.tool.ts`
- **Schema**: `{ spaceId: string, titleFilter?: string }`
- **Functionality**: Find contexts in a specific space
- **Returns**: List of contexts with pulse counts

#### 2.2 Tool: `context_get_details`

- **File**: `src/modules/agent/tools/context/context-get-details.tool.ts`
- **Schema**: `{ contextId: string }`
- **Functionality**: Get context with pulse list
- **Permissions**: Any space member can view

#### 2.3 Tool: `context_create`

- **File**: `src/modules/agent/tools/context/context-create.tool.ts`
- **Schema**: `{ spaceId: string, title: string, emergentName?: string }`
- **Functionality**: Create new context in space
- **Permissions**: Owner, ADMIN, or MEMBER

#### 2.4 Tool: `context_update`

- **File**: `src/modules/agent/tools/context/context-update.tool.ts`
- **Schema**: `{ contextId: string, title?: string, emergentName?: string }`
- **Functionality**: Update context properties
- **Permissions**: Owner, ADMIN, MEMBER, or creator

#### 2.5 Tool: `context_delete`

- **File**: `src/modules/agent/tools/context/context-delete.tool.ts`
- **Schema**: `{ contextId: string, confirm: boolean }`
- **Functionality**: Delete context and cascade to pulses
- **Permissions**: Owner, ADMIN, or creator

### Types to Define

```typescript
export interface ContextSummary {
  id: string
  title: string
  emergentName?: string
  createdAt: string
  creatorId: string
  creatorName: string
  pulseCount: number
  resonanceCount: number
}

export interface ContextDetails extends ContextSummary {
  space: {
    id: string
    name: string
  }
  pulses: Array<{
    id: string
    title: string
    type: 'GoalPulse' | 'ResourcePulse' | 'StoryPulse'
    createdAt: string
  }>
}
```

### Phase 2 Verification Plan

**Test Cases**:

1. Find contexts in space
2. Get context details
3. Create context as owner/ADMIN/MEMBER
4. Create context as GUEST (should fail)
5. Update context title and emergentName
6. Delete context (with cascade to pulses)
7. Permission checks for all roles
8. End-to-end: Create space → Create context → Add pulses → Delete context

---

## Phase 3: FieldPulse Management Tools

**Status**: ⬜ Not Started  
**Dependencies**: Phase 2 complete  
**Estimated Complexity**: High (3 pulse types)  
**Files to Create**: 13  
**Files to Modify**: 1

### Overview

FieldPulse tools manage the three types of pulses: GoalPulse, ResourcePulse, StoryPulse. Each type has unique properties but shares common operations.

### Tools to Implement

#### 3.1 Tool: `pulse_find`

- **File**: `src/modules/agent/tools/pulse/pulse-find.tool.ts`
- **Schema**: `{ contextId: string, pulseType?: 'goal' | 'resource' | 'story', titleFilter?: string, creatorId?: string }`
- **Functionality**: Find pulses in context with filters

#### 3.2 Tool: `pulse_get_details`

- **File**: `src/modules/agent/tools/pulse/pulse-get-details.tool.ts`
- **Schema**: `{ pulseId: string }`
- **Functionality**: Get pulse with conversation chunks and resonances

#### 3.3 Tool: `pulse_create_goal`

- **File**: `src/modules/agent/tools/pulse/pulse-create-goal.tool.ts`
- **Schema**: `{ contextId: string, title: string, content: string, status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED', horizon?: 'SHORT' | 'MID' | 'LONG', intensity?: number }`
- **Functionality**: Create GoalPulse with goal-specific properties

#### 3.4 Tool: `pulse_create_resource`

- **File**: `src/modules/agent/tools/pulse/pulse-create-resource.tool.ts`
- **Schema**: `{ contextId: string, title: string, content: string, resourceType?: string, availability?: number, intensity?: number }`
- **Functionality**: Create ResourcePulse

#### 3.5 Tool: `pulse_create_story`

- **File**: `src/modules/agent/tools/pulse/pulse-create-story.tool.ts`
- **Schema**: `{ contextId: string, title: string, content: string, intensity?: number }`
- **Functionality**: Create StoryPulse

#### 3.6 Tool: `pulse_update_goal`

- **File**: `src/modules/agent/tools/pulse/pulse-update-goal.tool.ts`
- **Schema**: `{ pulseId: string, title?: string, content?: string, status?: string, horizon?: string, intensity?: number }`
- **Permissions**: Creator, owner, or ADMIN

#### 3.7 Tool: `pulse_update_resource`

- **File**: `src/modules/agent/tools/pulse/pulse-update-resource.tool.ts`
- **Schema**: Similar to update_goal with resource-specific fields

#### 3.8 Tool: `pulse_update_story`

- **File**: `src/modules/agent/tools/pulse/pulse-update-story.tool.ts`
- **Schema**: Basic fields only

#### 3.9 Tool: `pulse_delete`

- **File**: `src/modules/agent/tools/pulse/pulse-delete.tool.ts`
- **Schema**: `{ pulseId: string, confirm: boolean }`
- **Functionality**: Delete pulse and conversation chunks
- **Permissions**: Creator, owner, or ADMIN

### Special Considerations

**Embeddings Integration:**

- Pulse creation should optionally trigger embedding generation
- Consider background job vs synchronous generation
- May need separate tool for regenerating embeddings

**Conversation Chunks:**

- ConversationChunk nodes are read-only (created with pulse)
- Include in `pulse_get_details` response
- Automatically deleted when pulse is deleted

**Resonance Links:**

- Related resonances should be surfaced in details
- Consider tool for manual resonance creation/deletion
- Respect context scope (resonances only within same FieldContext)

### Types to Define

```typescript
export interface PulseSummary {
  id: string
  title: string
  content: string
  type: 'GoalPulse' | 'ResourcePulse' | 'StoryPulse'
  createdAt: string
  creatorId: string
  creatorName: string
  intensity?: number
}

export interface GoalPulseSummary extends PulseSummary {
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  horizon: 'SHORT' | 'MID' | 'LONG'
}

export interface ResourcePulseSummary extends PulseSummary {
  resourceType?: string
  availability?: number
}

export interface PulseDetails extends PulseSummary {
  context: {
    id: string
    title: string
  }
  conversationChunks: Array<{
    id: string
    content: string
    order: number
    role: string
  }>
  resonances: Array<{
    id: string
    label: string
    targetPulseId: string
    targetPulseTitle: string
    confidence: number
  }>
}
```

### Phase 3 Verification Plan

**Test Cases**:

1. Find pulses in context (all types)
2. Filter pulses by type, creator, title
3. Create each pulse type with specific properties
4. Get pulse details with chunks and resonances
5. Update pulse properties (type-specific)
6. Delete pulse (verify chunks also deleted)
7. Permission checks (creator can delete, member cannot delete others' pulses)
8. End-to-end: Create goal → Update status → Mark completed → Delete
9. Resonance integration: Create pulses → Trigger resonance discovery → View resonances in details

---

## Bonus Phase: Person Profile & Advanced Tools

**Status**: ⬜ Not Started  
**Dependencies**: Phase 3 complete  
**Estimated Complexity**: Low-Medium

### Additional Tools (Optional)

#### Person Profile Management

- `person_update_profile` - Update own firstName, lastName, email
- `person_view_profile` - View own AI-enriched profile (passions, traits)
- `person_toggle_ai` - Enable/disable AI features

#### Advanced Search

- `search_across_spaces` - Semantic search across all user's spaces
- `search_by_resonance` - Find pulses with specific resonance patterns
- `search_by_person` - Find content created by specific person

#### Bulk Operations

- `pulse_bulk_delete` - Delete multiple pulses at once
- `context_bulk_delete` - Delete multiple contexts
- `space_export` - Export space data as JSON

#### Analytics

- `space_get_stats` - Get statistics (pulse count by type, recent activity)
- `person_get_activity` - Get user's recent contributions

---

## Implementation Checklist

### Phase 1: Spaces ⬜

- [ ] 1.1 JWT authentication setup
- [ ] 1.2 Tool registry update
- [ ] 1.3 Space tools directory + types
- [ ] 1.4 `space_find`
- [ ] 1.5 `space_get_details`
- [ ] 1.6 `space_create`
- [ ] 1.7 `space_update_name`
- [ ] 1.8 `space_update_visibility`
- [ ] 1.9 `space_delete`
- [ ] 1.10 `space_add_member`
- [ ] 1.11 `space_update_member_role`
- [ ] 1.12 `space_remove_member`
- [ ] Phase 1 verification complete

### Phase 2: Contexts ⬜

- [ ] 2.1 Context tools directory + types
- [ ] 2.2 `context_find`
- [ ] 2.3 `context_get_details`
- [ ] 2.4 `context_create`
- [ ] 2.5 `context_update`
- [ ] 2.6 `context_delete`
- [ ] Phase 2 verification complete

### Phase 3: Pulses ⬜

- [ ] 3.1 Pulse tools directory + types
- [ ] 3.2 `pulse_find`
- [ ] 3.3 `pulse_get_details`
- [ ] 3.4 `pulse_create_goal`
- [ ] 3.5 `pulse_create_resource`
- [ ] 3.6 `pulse_create_story`
- [ ] 3.7 `pulse_update_goal`
- [ ] 3.8 `pulse_update_resource`
- [ ] 3.9 `pulse_update_story`
- [ ] 3.10 `pulse_delete`
- [ ] Phase 3 verification complete

---

## Key Files Reference

### Core Implementation Files

- **Chat API**: `src/app/api/chat/simulation/route.ts`
- **Tool Registry**: `src/modules/agent/tools/index.ts`
- **Auth Utils**: `src/app/api/auth/utils.ts`
- **Graph Singleton**: `src/modules/graph.ts`

### Schema & Permissions

- **GraphQL Schema**: `src/lib/graphql/schema/schema.gql`
- **Space Mutations**: `src/app/graphql/mutations/SPACE_MUTATIONS.ts`
- **Space Permissions**: `src/lib/permissions/space-permissions.ts`
- **Authorization Docs**: `docs/CASCADE_AUTHORIZATION.md`

### Existing Tool Examples

- **Person Search**: `src/modules/agent/tools/person-search.tool.ts`
- **Cypher Chain**: `src/modules/agent/tools/cypher/cypher-retrieval.chain.ts`

---

## Notes & Decisions

### Design Decisions

1. **Entity-first naming**: `space_create` vs `create_space` for consistency with possible future tool categories
2. **Minimal error messages**: Return status codes, let LLM format human-friendly messages
3. **Phased rollout**: Incremental testing reduces risk and allows for adjustments
4. **JWT extraction in chat API**: Centralized authentication, all tools automatically have user context

### Technical Constraints

- **File size**: All tool files must stay under 400 lines (target: <200)
- **Error handling**: Never throw exceptions, always return JSON status
- **Permission checks**: Always verify before mutation operations
- **Cypher patterns**: Use parameterized queries to prevent injection

### Future Enhancements

- Consider caching for frequently accessed spaces/contexts
- Add rate limiting for bulk operations
- Implement audit logging for deletion operations
- Add undo/restore functionality for deleted entities
- Support for space templates and cloning

---

## Progress Log

### February 15, 2026

- 📝 Created comprehensive implementation guide
- 🎯 Defined three-phase approach
- 📋 Documented all tools and verification steps
- ⏳ Ready to begin Phase 1 implementation

---

**Next Action**: Begin Phase 1 - Implement JWT authentication in chat API
