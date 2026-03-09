# Activity Logging with GraphQL Mutations - Integration Guide

## Overview

Activity logging is now implemented using **GraphQL mutations** instead of HTTP POST endpoints. This provides better type safety, consistency with the rest of the application, and automatic authentication handling.

## Architecture

- **Schema**: Activity log mutations defined in `schema.gql`
- **Resolvers**: Implemented in `src/lib/graphql/resolvers/activity-log-resolver.ts`
- **Service**: Uses `createLog()` from `src/lib/activity-logs/create-log.ts`
- **Frontend**: Call mutations directly using your GraphQL client

## Available Mutations

All mutations accept an `input` parameter and return a `CreateLogResponse`:

```graphql
type CreateLogResponse {
  success: Boolean!
  message: String!
  log: Log
}
```

### 1. logPulseActivity

Log pulse CRUD operations (create, update, delete)

```graphql
mutation LogPulseActivity($input: LogPulseInput!) {
  logPulseActivity(input: $input) {
    success
    message
    log {
      id
      description
      createdAt
      createdBy {
        id
        name
      }
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "action": "created",
    "pulseId": "pulse_123",
    "pulseType": "GoalPulse",
    "pulseName": "Launch MVP",
    "contextId": "context_456",
    "metadata": "{\"chunkCount\": 3}"
  }
}
```

### 2. logSpaceActivity

Log space CRUD operations (create, update, delete)

```graphql
mutation LogSpaceActivity($input: LogSpaceInput!) {
  logSpaceActivity(input: $input) {
    success
    message
    log {
      id
      description
      createdAt
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "action": "created",
    "spaceId": "space_123",
    "spaceType": "WeSpace",
    "spaceName": "My Collaborative Space"
  }
}
```

### 3. logMemberActivity

Log member additions, removals, and role changes

```graphql
mutation LogMemberActivity($input: LogMemberInput!) {
  logMemberActivity(input: $input) {
    success
    message
  }
}
```

**Variables:**
```json
{
  "input": {
    "action": "added",
    "spaceId": "space_123",
    "spaceName": "My Space",
    "memberId": "user_789",
    "memberName": "John Doe",
    "role": "MEMBER"
  }
}
```

### 4. logFieldActivity

Log field context CRUD operations

```graphql
mutation LogFieldActivity($input: LogFieldInput!) {
  logFieldActivity(input: $input) {
    success
    message
  }
}
```

**Variables:**
```json
{
  "input": {
    "action": "created",
    "fieldId": "field_123",
    "fieldName": "Goals Q1 2024",
    "contextId": "context_456",
    "spaceName": "My Space"
  }
}
```

### 5. logResonanceActivity

Log resonance link operations

```graphql
mutation LogResonanceActivity($input: LogResonanceInput!) {
  logResonanceActivity(input: $input) {
    success
    message
  }
}
```

**Variables:**
```json
{
  "input": {
    "action": "created",
    "resonanceId": "resonance_123",
    "label": "APPLIED_TO",
    "sourceId": "pulse_456",
    "sourceName": "Launch App",
    "targetId": "pulse_789",
    "targetName": "Developer Time",
    "contextId": "context_123"
  }
}
```

## Frontend Integration Patterns

### Using Apollo Client (Recommended)

If you're using Apollo Client, call mutations directly:

```typescript
import { gql, useMutation } from '@apollo/client'

const LOG_PULSE_ACTIVITY = gql`
  mutation LogPulseActivity($input: LogPulseInput!) {
    logPulseActivity(input: $input) {
      success
      message
    }
  }
`

function MyComponent() {
  const [logPulseActivity] = useMutation(LOG_PULSE_ACTIVITY)

  const handleCreatePulse = async () => {
    // ... create pulse mutation ...

    // Log the activity (fire-and-forget)
    logPulseActivity({
      variables: {
        input: {
          action: 'created',
          pulseId: result.data.createPulse.id,
          pulseType: 'GoalPulse',
          pulseName: title,
          contextId,
        },
      },
    }).catch((err) => console.warn('Logging failed:', err))
  }
}
```

### Using Next.js Server Actions

For server-side operations, use `executeGraphQL`:

```typescript
'use server'

import { executeGraphQL } from '@/lib/graphql/apollo-server'

export async function createPulseAction(data: PulseInput) {
  // Create the pulse
  const pulseResult = await executeGraphQL({
    query: CREATE_PULSE_MUTATION,
    variables: { input: data },
  })

  // Log the activity
  await executeGraphQL({
    query: LOG_PULSE_ACTIVITY_MUTATION,
    variables: {
      input: {
        action: 'created',
        pulseId: pulseResult.data.createPulse.id,
        pulseType: data.pulseType,
        pulseName: data.title,
        contextId: data.contextId,
      },
    },
  }).catch((err) => console.warn('Logging failed:', err))

  return pulseResult
}
```

### Custom Hook Pattern

Create a reusable hook for consistent logging:

```typescript
// src/hooks/useActivityLogging.ts
import { gql, useMutation } from '@apollo/client'

const LOG_PULSE_ACTIVITY = gql`
  mutation LogPulseActivity($input: LogPulseInput!) {
    logPulseActivity(input: $input) {
      success
      message
    }
  }
`

const LOG_SPACE_ACTIVITY = gql`
  mutation LogSpaceActivity($input: LogSpaceInput!) {
    logSpaceActivity(input: $input) {
      success
      message
    }
  }
`

// ... define other mutation documents

export function useActivityLogging() {
  const [logPulseMutation] = useMutation(LOG_PULSE_ACTIVITY)
  const [logSpaceMutation] = useMutation(LOG_SPACE_ACTIVITY)
  // ... other mutations

  return {
    logPulseActivity: (input: LogPulseInput) => {
      return logPulseMutation({ variables: { input } }).catch((err) => {
        console.warn('Failed to log pulse activity:', err)
      })
    },
    logSpaceActivity: (input: LogSpaceInput) => {
      return logSpaceMutation({ variables: { input } }).catch((err) => {
        console.warn('Failed to log space activity:', err)
      })
    },
    // ... other methods
  }
}
```

## Integration Examples

### Example 1: Field Context Creation

```typescript
// In your field context creation component
import { useMutation } from '@apollo/client'
import { LOG_FIELD_ACTIVITY } from '@/lib/graphql/mutations'

function CreateFieldContext() {
  const [createFieldContext] = useMutation(CREATE_FIELD_CONTEXT)
  const [logFieldActivity] = useMutation(LOG_FIELD_ACTIVITY)

  const handleCreate = async (values: FieldInput) => {
    try {
      const result = await createFieldContext({
        variables: { input: values },
      })

      // Log the activity (non-blocking)
      logFieldActivity({
        variables: {
          input: {
            action: 'created',
            fieldId: result.data.createFieldContext.id,
            fieldName: values.title,
            contextId: result.data.createFieldContext.id,
            spaceName: currentSpace.name,
          },
        },
      }).catch((err) => console.warn('Logging failed:', err))

      toast.success('Field context created!')
    } catch (error) {
      toast.error('Failed to create field context')
    }
  }

  return (
    // ... form UI
  )
}
```

### Example 2: Space Member Addition

```typescript
// In your member management component
function AddMemberToSpace() {
  const [addSpaceMember] = useMutation(ADD_SPACE_MEMBER)
  const [logMemberActivity] = useMutation(LOG_MEMBER_ACTIVITY)

  const handleAddMember = async (memberId: string, role: SpaceRole) => {
    try {
      const result = await addSpaceMember({
        variables: {
          spaceId: currentSpace.id,
          memberId,
          role,
        },
      })

      // Log the activity
      logMemberActivity({
        variables: {
          input: {
            action: 'added',
            spaceId: currentSpace.id,
            spaceName: currentSpace.name,
            memberId,
            memberName: result.data.addSpaceMember.membership.member[0].name,
            role,
          },
        },
      }).catch((err) => console.warn('Logging failed:', err))

      toast.success('Member added!')
    } catch (error) {
      toast.error('Failed to add member')
    }
  }

  return (
    // ... UI
  )
}
```

### Example 3: Pulse Update with Logging

```typescript
// In your pulse edit component
function EditPulse() {
  const [updatePulse] = useMutation(UPDATE_PULSE)
  const [logPulseActivity] = useMutation(LOG_PULSE_ACTIVITY)

  const handleUpdate = async (pulseId: string, updates: PulseUpdate) => {
    try {
      const result = await updatePulse({
        variables: {
          pulseId,
          input: updates,
        },
      })

      // Log the update
      logPulseActivity({
        variables: {
          input: {
            action: 'updated',
            pulseId,
            pulseType: result.data.updatePulse.__typename,
            pulseName: updates.title || result.data.updatePulse.title,
            contextId: result.data.updatePulse.context[0].id,
          },
        },
      }).catch((err) => console.warn('Logging failed:', err))

      toast.success('Pulse updated!')
    } catch (error) {
      toast.error('Failed to update pulse')
    }
  }

  return (
    // ... form UI
  )
}
```

## Benefits of GraphQL Mutations Over HTTP Endpoints

1. **Type Safety**: GraphQL provides compile-time type checking with code generation
2. **Automatic Authentication**: JWT is automatically included in GraphQL context
3. **Consistency**: Uses the same pattern as other mutations in the app
4. **Single Source of Truth**: No need to maintain separate API routes
5. **Better Developer Experience**: GraphQL playground for testing
6. **Batching**: Apollo Client can batch multiple mutations automatically
7. **Caching**: Integration with Apollo Client cache system
8. **Error Handling**: Standardized GraphQL error format

## Testing

### Using GraphQL Playground

Visit your GraphQL endpoint (e.g., `/api/graphql`) and test mutations:

```graphql
mutation {
  logPulseActivity(
    input: {
      action: "created"
      pulseId: "test_pulse_123"
      pulseType: "GoalPulse"
      pulseName: "Test Pulse"
      contextId: "test_context_456"
    }
  ) {
    success
    message
    log {
      id
      description
      createdAt
    }
  }
}
```

### Using curl

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation LogPulseActivity($input: LogPulseInput!) { logPulseActivity(input: $input) { success message } }",
    "variables": {
      "input": {
        "action": "created",
        "pulseId": "pulse_123",
        "pulseType": "GoalPulse",
        "pulseName": "Test",
        "contextId": "context_456"
      }
    }
  }'
```

## Migration from HTTP Endpoints

If you were previously using the HTTP POST endpoints:

**Before (HTTP):**
```typescript
await fetch('/api/activity-logs/log-pulse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    action: 'created',
    pulseId,
    // ...
  }),
})
```

**After (GraphQL):**
```typescript
await logPulseActivity({
  variables: {
    input: {
      action: 'created',
      pulseId,
      // ... (userId is automatic from JWT)
    },
  },
})
```

## Best Practices

1. **Fire-and-Forget**: Always use `.catch()` on logging mutations to prevent blocking main operations
2. **Silent Failures**: Log errors to console but don't show to users
3. **Metadata**: Use the optional `metadata` field for additional context (JSON string)
4. **Descriptive Names**: Use clear pulse/space names in logs for better readability
5. **Action Consistency**: Use standard actions: "created", "updated", "deleted", "added", "removed", "role-changed"

## Troubleshooting

**Issue**: Mutation returns "User not authenticated"
- **Solution**: Ensure JWT token is included in GraphQL request headers

**Issue**: Logging mutation fails but main operation succeeds
- **Solution**: This is expected behavior (fire-and-forget pattern). Check console logs for details.

**Issue**: Type errors when calling mutations
- **Solution**: Run `npm run codegen` to regenerate TypeScript types from schema

**Issue**: "Cannot find module" error for mutation documents
- **Solution**: Define mutation documents locally or create a shared mutations file
