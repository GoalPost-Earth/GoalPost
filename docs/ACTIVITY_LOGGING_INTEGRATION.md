/**
 * ACTIVITY LOGGING IMPLEMENTATION GUIDE
 * 
 * This guide shows how to integrate activity logging into frontend components
 * for all CRUD operations.
 */

// ============================================================================
// QUICK START: Using useActivityLogging Hook
// ============================================================================

import { useActivityLogging } from '@/hooks/useActivityLogging'

export function MyComponent() {
  const { logPulseActivity, logSpaceActivity, logMemberActivity, logFieldActivity, logResonanceActivity } = useActivityLogging()
  
  // After a successful mutation, call the appropriate logging function
  // These are fire-and-forget - they won't block your operation
}

// ============================================================================
// 1. PULSE ACTIVITIES - Where to Add Logging
// ============================================================================

/**
 * File: src/app/protected/spaces/me-space/[id]/fields/[field]/page.tsx
 * File: src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx
 * 
 * In the handleCreateField function, add logging after successful mutation:
 */

const handleCreatePulse = async (pulseData: any) => {
  try {
    const result = await createGoalPulse({
      variables: { input: pulseData },
    })
    
    // After successful mutation:
    await logPulseActivity({
      action: 'created',
      pulseId: result.data.createGoalPulse.id,
      pulseType: 'GoalPulse',
      pulseName: pulseData.title,
      contextId: fieldId, // The field context ID
      metadata: {
        status: pulseData.status,
        horizon: pulseData.horizon,
      },
    })
  } catch (error) {
    console.error('Error creating pulse:', error)
  }
}

/**
 * Update Pulse - After successful update mutation:
 */

const handleUpdatePulse = async (pulseId: string, updates: any) => {
  try {
    const result = await updateGoalPulse({
      variables: { input: updates },
    })
    
    await logPulseActivity({
      action: 'updated',
      pulseId,
      pulseType: 'GoalPulse',
      pulseName: updates.title,
      contextId: fieldId,
    })
  } catch (error) {
    console.error('Error updating pulse:', error)
  }
}

/**
 * Delete Pulse - After successful delete mutation:
 */

const handleDeletePulse = async (pulseId: string, pulseName: string) => {
  try {
    await deleteGoalPulse({
      variables: { id: pulseId },
    })
    
    await logPulseActivity({
      action: 'deleted',
      pulseId,
      pulseType: 'GoalPulse',
      pulseName,
      contextId: fieldId,
    })
  } catch (error) {
    console.error('Error deleting pulse:', error)
  }
}

// ============================================================================
// 2. SPACE ACTIVITIES - Where to Add Logging
// ============================================================================

/**
 * File: src/app/protected/spaces/we-space/page.tsx
 * File: src/app/protected/spaces/me-space/page.tsx
 * 
 * In the handleCreateSpace function, add logging after successful mutation:
 */

const handleCreateSpace = async (spaceName: string) => {
  try {
    const result = await createWeSpace({
      variables: { input: { name: spaceName } },
    })
    
    await logSpaceActivity({
      action: 'created',
      spaceId: result.data.createWeSpace.id,
      spaceType: 'WeSpace',
      spaceName,
      metadata: {
        visibility: result.data.createWeSpace.visibility,
      },
    })
  } catch (error) {
    console.error('Error creating space:', error)
  }
}

/**
 * Update Space - After successful update:
 */

const handleUpdateSpace = async (spaceId: string, updates: any) => {
  try {
    await updateWeSpace({
      variables: { where: { id_EQ: spaceId }, update: updates },
    })
    
    await logSpaceActivity({
      action: 'updated',
      spaceId,
      spaceType: 'WeSpace',
      spaceName: updates.name || space.name,
    })
  } catch (error) {
    console.error('Error updating space:', error)
  }
}

/**
 * Delete Space - After successful delete:
 */

const handleDeleteSpace = async (spaceId: string, spaceName: string) => {
  try {
    await deleteWeSpace({
      variables: { id: spaceId },
    })
    
    await logSpaceActivity({
      action: 'deleted',
      spaceId,
      spaceType: 'WeSpace',
      spaceName,
    })
  } catch (error) {
    console.error('Error deleting space:', error)
  }
}

// ============================================================================
// 3. SPACE MEMBER ACTIVITIES - Where to Add Logging
// ============================================================================

/**
 * File: src/app/protected/dashboard/space/[id]/page.tsx
 * 
 * For space membership mutations:
 */

const handleAddMember = async (memberId: string, memberName: string, role: string) => {
  try {
    await addSpaceMember({
      variables: {
        spaceId,
        memberId,
        role,
      },
    })
    
    await logMemberActivity({
      action: 'added',
      spaceId,
      spaceName: space.name,
      memberId,
      memberName,
      role: role as any,
    })
  } catch (error) {
    console.error('Error adding member:', error)
  }
}

const handleRemoveMember = async (memberId: string, memberName: string) => {
  try {
    await removeSpaceMember({
      variables: { spaceId, memberId },
    })
    
    await logMemberActivity({
      action: 'removed',
      spaceId,
      spaceName: space.name,
      memberId,
      memberName,
    })
  } catch (error) {
    console.error('Error removing member:', error)
  }
}

const handleChangeRole = async (
  memberId: string,
  memberName: string,
  oldRole: string,
  newRole: string
) => {
  try {
    await updateSpaceMemberRole({
      variables: { spaceId, memberId, role: newRole },
    })
    
    await logMemberActivity({
      action: 'role-changed',
      spaceId,
      spaceName: space.name,
      memberId,
      memberName,
      previousRole: oldRole as any,
      role: newRole as any,
    })
  } catch (error) {
    console.error('Error changing role:', error)
  }
}

// ============================================================================
// 4. FIELD CONTEXT ACTIVITIES - Where to Add Logging
// ============================================================================

/**
 * File: src/app/protected/spaces/me-space/[id]/page.tsx
 * File: src/app/protected/spaces/we-space/[id]/page.tsx
 * 
 * For field context mutations:
 */

const handleCreateField = async (fieldName: string) => {
  try {
    const result = await createFieldContext({
      variables: { input: { title: fieldName, spaceId } },
    })
    
    await logFieldActivity({
      action: 'created',
      fieldId: result.data.createFieldContext.id,
      fieldName,
      contextId: result.data.createFieldContext.id,
      spaceId,
      spaceName: space.name,
    })
  } catch (error) {
    console.error('Error creating field:', error)
  }
}

const handleUpdateField = async (fieldId: string, fieldName: string, updates: any) => {
  try {
    await updateFieldContext({
      variables: {
        where: { id_EQ: fieldId },
        update: updates,
      },
    })
    
    await logFieldActivity({
      action: 'updated',
      fieldId,
      fieldName,
      contextId: fieldId,
      spaceId,
      spaceName: space.name,
    })
  } catch (error) {
    console.error('Error updating field:', error)
  }
}

const handleDeleteField = async (fieldId: string, fieldName: string) => {
  try {
    await deleteFieldContext({
      variables: { id: fieldId },
    })
    
    await logFieldActivity({
      action: 'deleted',
      fieldId,
      fieldName,
      contextId: fieldId,
      spaceId,
      spaceName: space.name,
    })
  } catch (error) {
    console.error('Error deleting field:', error)
  }
}

// ============================================================================
// 5. RESONANCE LINK ACTIVITIES - Where to Add Logging
// ============================================================================

/**
 * File: src/app/protected/spaces/me-space/[id]/fields/[field]/page.tsx
 * File: src/app/protected/spaces/we-space/[id]/fields/[field]/page.tsx
 * 
 * For resonance mutation handlers:
 */

const handleCreateResonance = async (
  label: string,
  sourceId: string,
  sourceName: string,
  targetId: string,
  targetName: string,
  confidence?: number
) => {
  try {
    const result = await createResonanceLink({
      variables: {
        input: {
          label,
          sourceId,
          targetId,
          contextId: fieldId,
        },
      },
    })
    
    await logResonanceActivity({
      action: 'created',
      resonanceId: result.data.createResonanceLink.id,
      label,
      sourceId,
      sourceName,
      targetId,
      targetName,
      contextId: fieldId,
      confidence,
    })
  } catch (error) {
    console.error('Error creating resonance:', error)
  }
}

const handleUpdateResonance = async (
  resonanceId: string,
  label: string,
  sourceId: string,
  sourceName: string,
  targetId: string,
  targetName: string
) => {
  try {
    await updateResonanceLink({
      variables: {
        where: { id_EQ: resonanceId },
        update: { label },
      },
    })
    
    await logResonanceActivity({
      action: 'updated',
      resonanceId,
      label,
      sourceId,
      sourceName,
      targetId,
      targetName,
      contextId: fieldId,
    })
  } catch (error) {
    console.error('Error updating resonance:', error)
  }
}

const handleDeleteResonance = async (
  resonanceId: string,
  label: string,
  sourceId: string,
  sourceName: string,
  targetId: string,
  targetName: string
) => {
  try {
    await deleteResonanceLink({
      variables: { id: resonanceId },
    })
    
    await logResonanceActivity({
      action: 'deleted',
      resonanceId,
      label,
      sourceId,
      sourceName,
      targetId,
      targetName,
      contextId: fieldId,
    })
  } catch (error) {
    console.error('Error deleting resonance:', error)
  }
}

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * 1. ASYNC WITHOUT BLOCKING
 * All logging calls are async but don't return promises to the user.
 * They fire-and-forget so they never block mutations.
 */

/**
 * 2. ERROR HANDLING
 * Logging failures are caught and logged to console but never shown to user.
 * This ensures logging never interferes with the main operation.
 */

/**
 * 3. REQUIRED FIELDS
 * - userId: Automatically from useApp() hook
 * - action: 'created', 'updated', or 'deleted'
 * - Entity IDs and names: Always include for clarity
 * - context/spaceId: Include relationship info
 */

/**
 * 4. OPTIONAL METADATA
 * Use metadata for additional context that's not in the main fields:
 * - status changes, role changes, intensity values, etc.
 */

/**
 * 5. TIMING
 * Call logging AFTER successful mutation, inside try block.
 * Don't await the logging call - it's fire-and-forget.
 */

// ============================================================================
// API ENDPOINTS REFERENCE
// ============================================================================

/**
 * POST /api/activity-logs/log-pulse
 * POST /api/activity-logs/log-space
 * POST /api/activity-logs/log-member
 * POST /api/activity-logs/log-field
 * POST /api/activity-logs/log-resonance
 * GET /api/activity-logs/get-user-logs?userId={id}&limit=30
 * 
 * All endpoints are non-blocking and handle errors gracefully.
 */
