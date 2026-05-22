'use server'

import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import {
  setAssistantFeedbackStatus,
  type AssistantFeedbackStatus,
} from '@/lib/feedback/assistant-feedback.service'

/**
 * Server action used by the row-level status picker on /dev/ai-quality.
 *
 * Re-runs the layout's env guard before touching Neo4j so a stray
 * non-dev caller (e.g. a leaked endpoint) can't write through this
 * action. The layout guards the page render; this guards the mutation.
 */
function assertDevAccess(): void {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.ENABLE_DEV_DASHBOARDS !== 'true'
  ) {
    notFound()
  }
}

function isStatus(value: string): value is AssistantFeedbackStatus {
  return value === 'open' || value === 'in_progress' || value === 'resolved'
}

export async function updateFeedbackStatusAction(
  formData: FormData
): Promise<void> {
  assertDevAccess()
  const feedbackId = formData.get('feedbackId')
  const status = formData.get('status')
  const statusNote = formData.get('statusNote')

  if (typeof feedbackId !== 'string' || feedbackId.length === 0) {
    throw new Error('updateFeedbackStatusAction: feedbackId is required')
  }
  if (typeof status !== 'string' || !isStatus(status)) {
    throw new Error(
      `updateFeedbackStatusAction: invalid status "${String(status)}"`
    )
  }

  const note =
    typeof statusNote === 'string' && statusNote.trim().length > 0
      ? statusNote.trim().slice(0, 500)
      : null

  await setAssistantFeedbackStatus(feedbackId, status, note)
  // Tell Next to drop the cached server-component render so the next
  // GET refetches with the updated row state.
  revalidatePath('/dev/ai-quality')
}
