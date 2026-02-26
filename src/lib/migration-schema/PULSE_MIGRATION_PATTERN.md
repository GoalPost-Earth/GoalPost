# Pulse Migration Pattern

## Core Principle
**Pulses are ONLY accessed through FieldContexts within Spaces. There are no direct Person → Pulse relationships.**

## Migration Architecture

### For Individual Users (Person → MeSpace)

When a user has pulses (Goals, Resources, CarePoints, CoreValues):

1. **Create Auto-Generated MeSpace**
   ```
   Name: "{User's firstName} {User's lastName} MeSpace"
   Visibility: PRIVATE
   Owner: User
   ```

2. **Create FieldContext(s) in MeSpace**
   ```
   Suggested naming:
   - "{User's name} Goals"
   - "{User's name} Resources"
   - "{User's name} Stories"
   Or a single: "{User's name} Field"
   ```

3. **Transform Legacy Entities to Pulses**
   - `Goal` → `GoalPulse` (in FieldContext)
   - `Resource` → `ResourcePulse` (in FieldContext)
   - `CarePoint` → `StoryPulse` (with CarePoint properties: levelFulfilled, issuesIdentified, etc.)
   - `CoreValue` → `StoryPulse` (with CoreValue properties: alignmentChallenges, alignmentExamples)

4. **Convert Relationships to ResonanceLinks**
   - Old: `Goal -[:DEPENDS_ON]-> Resource`
   - New: `GoalPulse <-[:SOURCE]- ResonanceLink {label: "DEPENDS_ON"} -[:TARGET]-> ResourcePulse` (in same FieldContext)
   - **IMPORTANT**: ResonanceLink.label = legacy relationship type name
   - Common labels: MOTIVATED_BY, APPLIED_TO, ALIGNED_TO, ENABLES, CARES_FOR, DEPENDS_ON, EMBRACES, PROVIDES, HAS_ACCESS_TO, CONNECTED_TO

### For Communities (Community → WeSpace)

When a community has pulses:

1. **Transform Community to WeSpace**
   ```
   Name: "{Community's name}"
   Visibility: SHARED
   Description, why, location, etc. → merged into WeSpace properties
   ```

2. **Create FieldContext in WeSpace**
   ```
   Name: "{Community name} Field"
   ```

3. **Migrate Community Pulses**
   - Community Goals → GoalPulse (in FieldContext)
   - Community Resources → ResourcePulse (in FieldContext)
   - Community CoreValues → StoryPulse (with CoreValue properties)
   - Community relationships → ResonanceLinks with legacy relationship names as labels

4. **Migrate Memberships**
   - `Person -[:BELONGS_TO {totem, signupDate}]-> Community`
   - → `Person -[:IS_MEMBER]-> SpaceMembership {role, addedAt} -[:HAS_MEMBER]-> WeSpace`

## Access Pattern (Query Path)

### To Get a Person's Pulses:
```graphql
query GetPersonPulses($personId: ID!) {
  people(where: { id: $personId }) {
    # Step 1: Get owned spaces
    ownsSpaces {
      # Step 2: Get contexts in spaces
      contexts {
        title
        # Step 3: Get pulses in contexts
        pulses {
          ... on GoalPulse {
            title
            content
            status
          }
          ... on ResourcePulse {
            title
            content
            resourceType
          }
          ... on StoryPulse {
            title
            content
            # Optional CarePoint properties
            levelFulfilled
            issuesIdentified
            # Optional CoreValue properties
            alignmentChallenges
            alignmentExamples
          }
        }
        # Step 4: Get resonances (relationships) in context
        resonancesInContext {
          label
          description
          source { title }
          target { title }
        }
      }
    }
    
    # Also check spaces they're a member of
    memberOf {
      space {
        contexts {
          # ... same as above
        }
      }
    }
  }
}
```

## Migration Examples

### Example 1: Single User with Goals and Resources

**Legacy Structure:**
```
Person "Alice" (id: person_1)
  -[:MOTIVATED_BY]-> Goal "Launch App" (id: goal_1)
    -[:APPLIED_TO]-> Resource "Developer Time" (id: resource_1)
```

**Migrated Structure:**
```
Person "Alice" (id: person_1)
  -[:OWNS]-> MeSpace "Alice MeSpace" (id: space_1)
    -[:HAS_CONTEXT]-> FieldContext "Alice's Goals" (id: context_1)
      -[:HAS_PULSE]-> GoalPulse "Launch App" (id: pulse_1)
      -[:HAS_PULSE]-> ResourcePulse "Developer Time" (id: pulse_2)
      -[:HAS_RESONANCE]-> ResonanceLink (id: res_1)
        -[:SOURCE]-> pulse_1
        -[:TARGET]-> pulse_2
        label: "APPLIED_TO"  # Legacy relationship name
        description: "This goal requires this resource"
        confidence: null  # Explicit user-defined relationship (not AI-discovered)
```

### Example 2: Community with Shared Goals

**Legacy Structure:**
```
Community "Tech Team" (id: community_1)
  members: [Alice, Bob]
  -[:MOTIVATED_BY]-> Goal "Ship v2.0" (id: goal_2)
  -[:EMBRACES]-> CoreValue "User First" (id: value_1)
```

**Migrated Structure:**
```
WeSpace "Tech Team" (id: space_2)
  description: (from community)
  -[:OWNS]<- Person "Alice" (owner)
  -[:HAS_MEMBER]-> SpaceMembership (Bob, role: MEMBER)
  -[:HAS_CONTEXT]-> FieldContext "Tech Team Field" (id: context_2)
    -[:HAS_PULSE]-> GoalPulse "Ship v2.0" (id: pulse_3)
    -[:HAS_PULSE]-> StoryPulse "User First" (id: pulse_4)
    -[:HAS_RESONANCE]-> ResonanceLink
      -[:SOURCE]-> pulse_3
      -[:TARGET]-> pulse_4
      label: "ALIGNED_TO"  # Legacy relationship name from Goal -[:ALIGNED_TO]-> CoreValue
      description: "This goal aligns with this core value"
      confidence: null
```

### Example 3: Person-to-Person Connections

**Legacy Structure:**
```
Person "Alice" -[:CONNECTED_TO {why: "collaborators", interests: "AI"}]-> Person "Bob"
```

**Migration Approach:**

**Direct Preservation (Current Implementation)**

Person-to-Person CONNECTED_TO relationships are preserved as-is during migration:

```
Person "Alice" -[:CONNECTED_TO {why: "collaborators", interests: "AI"}]-> Person "Bob"
```

**Implementation Details:**
- CONNECTED_TO relationships are migrated in Phase 8 of the migration script
- Relationship properties (`why`, `interests`) are preserved
- Only connections between successfully migrated users are created
- Connections are bidirectional (queryDirection: UNDIRECTED in schema)

**Future Enhancement (Not Implemented)**
- Could potentially transform into ResonanceLink patterns between profile StoryPulses
- Would enable AI-discovered connections vs. explicit user connections
- Current direct relationship approach is simpler and maintains explicit social graph

## Legacy Relationship Mapping

When migrating, preserve the legacy relationship type as the ResonanceLink label:

| Legacy Relationship | Source | Target | ResonanceLink Label |
|---------------------|--------|--------|---------------------|
| MOTIVATED_BY | Person/Community | Goal | MOTIVATED_BY |
| APPLIED_TO | Resource | Goal | APPLIED_TO |
| ALIGNED_TO | Goal | CoreValue | ALIGNED_TO |
| ENABLES | Goal | CarePoint | ENABLES |
| CARES_FOR | CarePoint | Goal | CARES_FOR |
| DEPENDS_ON | CarePoint | Resource | DEPENDS_ON |
| EMBRACES | Person/Community | CoreValue | EMBRACES |
| PROVIDES | Person/Community | Resource | PROVIDES |
| HAS_ACCESS_TO | Community | Resource | HAS_ACCESS_TO |
| CONNECTED_TO | Person | Person | CONNECTED_TO |

**Note**: All migrated relationships should have `confidence: null` since they represent explicit user-defined connections, not AI-discovered patterns.

## Key Benefits of This Architecture

1. **Privacy Control**: Pulses inherit access control from their Space
2. **Context Preservation**: Pulses exist within meaningful containers
3. **Relationship Clarity**: ResonanceLinks are scoped to FieldContexts
4. **Migration Path**: Clear transformation from legacy direct relationships
5. **Semantic Preservation**: Legacy relationship names preserved as ResonanceLink labels
6. **AI Integration**: Future resonances discovered by AI use different labels/lower confidence

## Implementation Checklist

- [ ] Auto-create MeSpace for each Person during migration
- [ ] Create default FieldContext(s) in each MeSpace
- [ ] Transform legacy entities to appropriate Pulse types
- [ ] Create ResonanceLinks with legacy relationship names as labels (MOTIVATED_BY, APPLIED_TO, ALIGNED_TO, etc.)
- [ ] Set confidence: null for all migrated ResonanceLinks (explicit user relationships, not AI-discovered)
- [ ] Transform Community nodes to WeSpace nodes
- [ ] Migrate BELONGS_TO to SpaceMembership patterns
- [ ] Migrate Person-to-Person CONNECTED_TO relationships (preserving why and interests properties)
- [ ] Update all queries to use Space → Context → Pulse path
- [ ] Remove legacy direct pulse relationships after migration
