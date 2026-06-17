/**
 * Mention notification plumbing.
 *
 * ⚠️ NO MENTION SURFACE EXISTS YET. As of this change there is no @mention
 * parser or person-tagging UI anywhere in the codebase, so this function has
 * NO production caller. It is the designated plug-in point: when a mention
 * surface lands (the assistant chat composer and pulse text are the candidate
 * hosts), parse the mentioned person ids and call notifyMention here. Until
 * then, MENTION notifications are never created.
 */

import { createNotification } from './create-notification'

export interface NotifyMentionParams {
  actorId: string
  mentionedPersonIds: string[]
  /** Human label of where the mention happened, e.g. 'a comment' or 'a pulse'. */
  sourceLabel: string
  /** Optional in-app route the recipient can click through to. */
  link?: string
  metadata?: Record<string, unknown>
}

/**
 * Notify each mentioned person that the actor referenced them. Self-mentions
 * are dropped automatically by createNotification.
 */
export async function notifyMention(params: NotifyMentionParams): Promise<void> {
  await Promise.all(
    params.mentionedPersonIds.map((recipientId) =>
      createNotification({
        recipientId,
        actorId: params.actorId,
        type: 'MENTION',
        title: 'You were mentioned',
        message: `mentioned you in ${params.sourceLabel}`,
        link: params.link,
        metadata: params.metadata,
      }).catch(() => null)
    )
  )
}
