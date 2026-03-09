/**
 * EXAMPLE: Using Activity Logging GraphQL Mutations
 * 
 * This file demonstrates how to integrate activity logging into your components
 * using GraphQL mutations instead of HTTP endpoints.
 */

'use client'

import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'

// ============================================================================
// MUTATION DEFINITIONS
// ============================================================================

const LOG_PULSE_ACTIVITY = gql`
  mutation LogPulseActivity($input: LogPulseInput!) {
    logPulseActivity(input: $input) {
      success
      message
      log {
        id
        description
        createdAt
      }
    }
  }
`

const LOG_FIELD_ACTIVITY = gql`
  mutation LogFieldActivity($input: LogFieldInput!) {
    logFieldActivity(input: $input) {
      success
      message
    }
  }
`

const CREATE_GOAL_PULSE = gql`
  mutation CreateGoalPulse($input: CreateGoalPulseInput!) {
    createGoalPulse(input: $input) {
      id
      title
      content
      context {
        id
        title
      }
    }
  }
`

// ============================================================================
// EXAMPLE 1: Simple Pulse Creation with Logging
// ============================================================================

export function CreatePulseExample() {
  const [createGoalPulse] = useMutation(CREATE_GOAL_PULSE)
  const [logPulseActivity] = useMutation(LOG_PULSE_ACTIVITY)
  const [loading, setLoading] = useState(false)

  const handleCreatePulse = async (values: {
    title: string
    content: string
    contextId: string
  }) => {
    setLoading(true)

    try {
      // Step 1: Create the pulse
      const result = await createGoalPulse({
        variables: {
          input: {
            title: values.title,
            content: values.content,
            contextId: values.contextId,
            status: 'ACTIVE',
          },
        },
      })

      const pulse = (result.data as any)?.createGoalPulse

      if (!pulse) {
        throw new Error('Failed to create pulse')
      }

      // Step 2: Log the activity (fire-and-forget, non-blocking)
      logPulseActivity({
        variables: {
          input: {
            action: 'created',
            pulseId: pulse.id,
            pulseType: 'GoalPulse',
            pulseName: pulse.title,
            contextId: pulse.context[0].id,
            metadata: JSON.stringify({
              contextName: pulse.context[0].title,
            }),
          },
        },
      }).catch((err) => {
        // Logging failures don't affect the main operation
        console.warn('Failed to log pulse creation:', err)
      })

      // Step 3: Show success to user
      alert('Pulse created successfully!')
    } catch (error) {
      console.error('Failed to create pulse:', error)
      alert('Failed to create pulse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={() => handleCreatePulse({
      title: 'Example Goal',
      content: 'This is an example goal',
      contextId: 'context_123',
    })}>
      {loading ? 'Creating...' : 'Create Pulse'}
    </button>
  )
}

// ============================================================================
// EXAMPLE 2: Field Context Creation with Logging
// ============================================================================

const CREATE_FIELD_CONTEXT = gql`
  mutation CreateFieldContext($input: CreateFieldContextInput!) {
    createFieldContext(input: $input) {
      id
      title
      space {
        ... on MeSpace {
          id
          name
        }
        ... on WeSpace {
          id
          name
        }
      }
    }
  }
`

export function CreateFieldContextExample() {
  const [createFieldContext] = useMutation(CREATE_FIELD_CONTEXT)
  const [logFieldActivity] = useMutation(LOG_FIELD_ACTIVITY)

  const handleCreateField = async (title: string, spaceId: string) => {
    try {
      const result = await createFieldContext({
        variables: {
          input: {
            title,
            spaceId,
          },
        },
      })

      const field = (result.data as any)?.createFieldContext

      if (!field) {
        throw new Error('Failed to create field')
      }

      // Log the field creation
      logFieldActivity({
        variables: {
          input: {
            action: 'created',
            fieldId: field.id,
            fieldName: field.title,
            contextId: field.id,
            spaceName: field.space.name,
          },
        },
      }).catch((err) => console.warn('Logging failed:', err))

      alert('Field created!')
    } catch (error) {
      console.error('Failed to create field:', error)
      alert('Failed to create field')
    }
  }

  return (
    <button onClick={() => handleCreateField('Q1 2024 Goals', 'space_123')}>
      Create Field Context
    </button>
  )
}

// ============================================================================
// EXAMPLE 3: Using a Custom Hook for Cleaner Code
// ============================================================================

function useActivityLogger() {
  const [logPulseActivity] = useMutation(LOG_PULSE_ACTIVITY)
  const [logFieldActivity] = useMutation(LOG_FIELD_ACTIVITY)

  return {
    logPulse: (input: {
      action: string
      pulseId: string
      pulseType: string
      pulseName: string
      contextId: string
      metadata?: string
    }) => {
      return logPulseActivity({ variables: { input } }).catch((err) => {
        console.warn('Failed to log pulse activity:', err)
      })
    },

    logField: (input: {
      action: string
      fieldId: string
      fieldName: string
      contextId: string
      spaceName?: string
      metadata?: string
    }) => {
      return logFieldActivity({ variables: { input } }).catch((err) => {
        console.warn('Failed to log field activity:', err)
      })
    },
  }
}

export function CleanerComponentExample() {
  const [createGoalPulse] = useMutation(CREATE_GOAL_PULSE)
  const { logPulse } = useActivityLogger()

  const handleCreate = async () => {
    const result = await createGoalPulse({
      variables: {
        input: {
          title: 'Launch MVP',
          content: 'Build and ship the MVP by Q2',
          contextId: 'context_123',
          status: 'ACTIVE',
        },
      },
    })

    const pulse = (result.data as any)?.createGoalPulse

    if (!pulse) {
      throw new Error('Failed to create pulse')
      return
    }

    // Clean, one-liner logging
    await logPulse({
      action: 'created',
      pulseId: pulse.id,
      pulseType: 'GoalPulse',
      pulseName: pulse.title,
      contextId: pulse.context[0].id,
    })

    alert('Done!')
  }

  return <button onClick={handleCreate}>Create & Log</button>
}

// ============================================================================
// EXAMPLE 4: Batch Logging (Not Blocking Each Other)
// ============================================================================

export function BatchLoggingExample() {
  const [logPulseActivity] = useMutation(LOG_PULSE_ACTIVITY)

  const handleBatchOperation = async () => {
    const pulses = [
      { id: 'pulse_1', title: 'Goal 1', contextId: 'ctx_1' },
      { id: 'pulse_2', title: 'Goal 2', contextId: 'ctx_1' },
      { id: 'pulse_3', title: 'Goal 3', contextId: 'ctx_1' },
    ]

    // Log all activities in parallel (non-blocking)
    const loggingPromises = pulses.map((pulse) =>
      logPulseActivity({
        variables: {
          input: {
            action: 'created',
            pulseId: pulse.id,
            pulseType: 'GoalPulse',
            pulseName: pulse.title,
            contextId: pulse.contextId,
          },
        },
      }).catch((err) => console.warn(`Failed to log ${pulse.id}:`, err))
    )

    // Wait for all logs to complete (optional)
    await Promise.allSettled(loggingPromises)

    console.log('All logs submitted!')
  }

  return <button onClick={handleBatchOperation}>Batch Create & Log</button>
}

// ============================================================================
// EXAMPLE 5: Server-Side Logging (Next.js Server Actions)
// ============================================================================

/**
 * For server-side operations, use executeGraphQL directly:
 */

/*
'use server'

import { executeGraphQL } from '@/lib/graphql/apollo-server'

export async function createPulseAction(data: PulseInput) {
  // Create pulse
  const pulseResult = await executeGraphQL({
    query: CREATE_GOAL_PULSE,
    variables: { input: data },
  })

  // Log activity
  await executeGraphQL({
    query: LOG_PULSE_ACTIVITY,
    variables: {
      input: {
        action: 'created',
        pulseId: pulseResult.data.createGoalPulse.id,
        pulseType: 'GoalPulse',
        pulseName: data.title,
        contextId: data.contextId,
      },
    },
  }).catch((err) => console.warn('Logging failed:', err))

  return pulseResult.data.createGoalPulse
}
*/

// ============================================================================
// TESTING IN CONSOLE
// ============================================================================

/**
 * You can test mutations directly in the browser console:
 *
 * 1. Open DevTools
 * 2. Paste this code:
 *
 * ```javascript
 * fetch('/api/graphql', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     query: `
 *       mutation {
 *         logPulseActivity(input: {
 *           action: "created"
 *           pulseId: "test_pulse_123"
 *           pulseType: "GoalPulse"
 *           pulseName: "Console Test"
 *           contextId: "test_context"
 *         }) {
 *           success
 *           message
 *           log {
 *             id
 *             description
 *           }
 *         }
 *       }
 *     `
 *   })
 * }).then(r => r.json()).then(d => console.log(d))
 * ```
 */

// ============================================================================
// KEY TAKEAWAYS
// ============================================================================

/**
 * 1. Use GraphQL mutations instead of HTTP endpoints
 * 2. Always use fire-and-forget pattern with .catch()
 * 3. Logging never blocks main operations
 * 4. userId is automatically extracted from JWT - no need to pass it
 * 5. All mutations return { success, message, log }
 * 6. Use metadata field for additional structured context
 * 7. Create a custom hook for reusable logging logic
 * 8. Perfect for parallel batch operations
 */
