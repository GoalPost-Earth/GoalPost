/**
 * ACTIVITY LOGS & NOTIFICATIONS - IMPLEMENTATION GUIDE
 * 
 * This document explains how to integrate activity logging throughout GoalPost
 * and show those logs as notifications in the navbar.
 */

// ============================================================================
// QUICK START: Log Creation
// ============================================================================

import { createLog } from '@/lib/activity-logs/create-log'

// After any important action (pulse creation, space changes, etc.):
await createLog({
  userId: currentUserId,
  description: 'Created a Goal: "Launch App"', // Human-readable action
  pulseIds: [pulseId], // Related pulses
  contextId: contextId, // Related context
  metadata: {
    // Optional: Track additional data
    pulseType: 'GoalPulse',
    chunkCount: 5,
    intensity: 0.85,
  },
})

// ============================================================================
// WHERE TO ADD LOGGING
// ============================================================================

/**
 * 1. PULSE CREATION
 * File: src/app/api/pulse/create-from-conversation/route.ts
 * 
 * After successfully creating pulse:
 */
try {
  const personResult = await graph.query<{ name: string }>(
    `MATCH (p:Person {id: $personId}) RETURN p.name as name`,
    { personId }
  )
  const personName = personResult[0]?.name || 'Unknown'

  await createLog({
    userId: personId,
    description: `Created a ${pulseType.replace('Pulse', '')} pulse: "${title}"`,
    pulseIds: [pulseId],
    contextId: contextId,
    metadata: { pulseType, chunkCount: chunkIds.length },
  })
} catch (logError) {
  console.warn('Failed to create activity log:', logError)
  // Don't fail the request if logging fails
}

/**
 * 2. SPACE MEMBERSHIP CHANGES
 * When adding member to space
 */
await createLog({
  userId: currentUserId,
  description: `Added ${memberName} as ${role} to ${spaceName}`,
  metadata: { action: 'addMember', role, spaceName },
})

/**
 * 3. SPACE CREATED
 */
await createLog({
  userId: ownerId,
  description: `Created ${spaceType}: "${spaceName}"`,
  metadata: { spaceType, visibility },
})

/**
 * 4. RESONANCE DISCOVERED
 */
await createLog({
  userId: adminUserId,
  description: `Discovered resonance: "${resonanceLabel}" between "${sourcePulseName}" and "${targetPulseName}"`,
  pulseIds: [sourceId, targetId],
  metadata: { label: resonanceLabel, confidence },
})

// ============================================================================
// QUERYING LOGS (FOR FRONTEND)
// ============================================================================

/**
 * Using the API endpoint (already implemented):
 */
const response = await fetch(
  `/api/activity-logs/get-user-logs?userId=${userId}&limit=30`,
  { method: 'GET' }
)
const data = await response.json()
// data.logs contains: id, description, createdAt, createdBy.{id, name, photo}

/**
 * Using GraphQL queries (in schema):
 */
const query = `
  query GetContextLogs($contextId: ID!, $limit: Int) {
    getContextLogs(contextId: $contextId, limit: $limit) {
      id
      description
      createdAt
      createdBy {
        id
        name
        photo
      }
    }
  }
`

// ============================================================================
// UI COMPONENTS
// ============================================================================

/**
 * NotificationPanel Component
 * Location: src/components/notifications/NotificationPanel.tsx
 * 
 * Already integrated in navbar.tsx
 * - Opens when clicking the bell icon
 * - Auto-refreshes every 30 seconds
 * - Shows creator info, emojis, and time
 */

/**
 * NotificationToast Component
 * Location: src/components/notifications/NotificationToast.tsx
 * 
 * For showing brief toast notifications (success, error, info, warning)
 * 
 * Usage:
 */
const [notifications, setNotifications] = useState<NotificationProps[]>([])

const addNotification = (
  type: NotificationType,
  title: string,
  message: string
) => {
  const id = `notif_${Date.now()}`
  setNotifications((prev) => [
    ...prev,
    { id, type, title, message, duration: 5000, onDismiss: removeNotification },
  ])
}

const removeNotification = (id: string) => {
  setNotifications((prev) => prev.filter((n) => n.id !== id))
}

// Then render:
<NotificationContainer notifications={notifications} onDismiss={removeNotification} />

// ============================================================================
// LOG STRUCTURE
// ============================================================================

/**
 * A Log entry in the database:
 * 
 * - id: Unique identifier
 * - description: Human-readable description (e.g., "Created a Goal: Launch App")
 * - createdAt: ISO timestamp
 * - createdBy: Person node who triggered the action
 * - goals: Related GoalPulse nodes
 * - resources: Related ResourcePulse nodes
 * - pulses: Related FieldPulse nodes
 * 
 * The Log nodes are connected to Pulses via LOGGED_FOR relationships,
 * allowing you to trace what actions created which pulses.
 */

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * 1. ALWAYS wrap log creation in try-catch:
 *    - Logging should never fail the main request
 *    - Log errors to console but don't throw
 */

/**
 * 2. Write human-readable descriptions:
 *    - Good: "Created a Goal pulse: Launch App"
 *    - Bad: "pulse_created"
 *    - Include the entity name when possible
 */

/**
 * 3. Use metadata for structured data:
 *    - Easy filtering and analytics
 *    - Don't repeat info in description
 */

/**
 * 4. Log at the right granularity:
 *    - Log completed actions, not intermediate steps
 *    - One log per user-initiated action
 */

/**
 * 5. Include related entities:
 *    - Set pulseIds for pulses involved
 *    - Set contextId for the context
 *    - Use metadata for other relationships
 */

// ============================================================================
// FUTURE ENHANCEMENTS
// ============================================================================

/**
 * 1. Real-time WebSocket updates:
 *    - Subscribe to logs for a space
 *    - Notify users instantly of new activities
 */

/**
 * 2. Activity filtering:
 *    - Filter by action type
 *    - Filter by time range
 *    - Filter by creator
 */

/**
 * 3. Audit trails:
 *    - Export logs for compliance
 *    - Detailed action history
 */

/**
 * 4. Notifications by type:
 *    - Only show certain actions
 *    - Customize notification preferences per user
 */

/**
 * 5. Notification badges:
 *    - Show unread count on bell icon
 *    - Mark logs as read
 */
