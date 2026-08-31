import { Session } from 'neo4j-driver'
import { Context } from '@/config/types'
import { generateId } from '@/utils/id-generator'
import { normalizeEmail } from '@/lib/auth/normalize-email'
import {
  canManageMembers,
  memberExistsInSpace,
  isSpaceOwner,
  SpaceRole,
} from '@/lib/permissions/space-permissions'
import {
  sendAddedToSpaceEmail,
  sendSpaceInviteEmail,
} from '@/app/api/auth/utils'
import { createLog } from '@/lib/activity-logs/create-log'
import { createNotification } from '@/lib/notifications/create-notification'
import { hashAuthToken } from '@/lib/auth/token-hash'
import { rateLimit } from '@/lib/auth/rate-limit'
import { GraphQLError } from 'graphql'
import { INVITE_RESENT_MESSAGE } from '@/constants'

interface AddSpaceMemberInput {
  spaceId: string
  memberId: string
  role: SpaceRole
}

interface UpdateSpaceMemberRoleInput {
  spaceId: string
  memberId: string
  role: SpaceRole
}

interface RemoveSpaceMemberInput {
  spaceId: string
  memberId: string
}

interface MutationResponse {
  success: boolean
  message: string
}

interface SpaceMemberObject {
  __typename: 'Person' | 'Community'
  id: string
  name: string
  email?: string
}

interface MembershipObject {
  id: string
  role: SpaceRole
  addedAt: string
  member: SpaceMemberObject[]
}

interface AddSpaceMemberResponse extends MutationResponse {
  membership?: MembershipObject
}

interface UpdateSpaceMemberRoleResponse extends MutationResponse {
  membership?: MembershipObject
}

type RemoveSpaceMemberResponse = MutationResponse

/**
 * Conservative email shape check for invite-by-email. Not RFC-complete — the
 * single source of truth for "is this a real inbox" is the deliverability of
 * the invite mail. This just rejects obvious garbage so we don't create a junk
 * Person node (e.g. a bare name the admin fat-fingered into the field).
 * Normalization (trim + lowercase) is the shared `normalizeEmail` from
 * @/lib/auth/normalize-email so stored values match login/signup lookups.
 */
function isValidEmail(email: string): boolean {
  // Mirrors the permissiveness of zod's .email() closely enough for a guard:
  // one @, non-empty local + domain, a dot in the domain, no whitespace.
  // The 254-char ceiling is the RFC 5321 maximum and stops a giant string
  // matching the pattern from being MERGEd onto a node property.
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Invite-blast rate limit (GOAL-249). Three cheap keys, ALL must allow:
 * per-client-IP, per-target-space, and per-inviting-user. IP-keying is the
 * primary control; per-space is supplementary and survives IP rotation (an
 * attacker can rotate proxies but not the space they're targeting); per-user
 * caps a single (possibly compromised) admin from blasting invites across the
 * many spaces they own/administer, which the per-space key alone can't bound.
 * Fail-CLOSED on Redis outage. Throws a GraphQLError BEFORE the caller opens a
 * session / writes anything, so a rejected mutation doesn't create a Person, a
 * SpaceMembership, mint a token, or log activity.
 */
async function enforceInviteBlastLimit(
  clientIp: string | undefined,
  spaceId: string,
  userId: string
): Promise<void> {
  const ipKey = clientIp || 'unknown'
  const [ipBlast, spaceBlast, userBlast] = await Promise.all([
    rateLimit({ policy: 'invite-blast', key: `invite-blast:ip:${ipKey}` }),
    rateLimit({
      policy: 'invite-blast',
      key: `invite-blast:space:${spaceId}`,
    }),
    rateLimit({ policy: 'invite-blast', key: `invite-blast:user:${userId}` }),
  ])
  // Any key denying blocks the request; surface the first denial's retryAfter.
  const blast = [ipBlast, spaceBlast, userBlast].find((b) => !b.allowed)
  if (blast) {
    const minutes = Math.ceil(blast.retryAfter / 60)
    throw new GraphQLError(
      `Invite limit reached — try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      { extensions: { code: 'RATE_LIMITED', retryAfter: blast.retryAfter } }
    )
  }
}

// Invite links stay valid for 7 days (GOAL-329). The original 48h window
// proved shorter than real-world invite latency (invitees often open the
// email days later), and an expired link used to be a dead end because
// re-inviting short-circuited on "already part of the space". Keep this in
// sync with the "expires in 7 days" copy in sendSpaceInviteEmail.
const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Mint a fresh single-use invite token for a not-yet-registered Person,
 * stamp its hash + expiry on the node, and email the accept link.
 *
 * Token format is `${spaceId}.${uuid}`: the spaceId prefix is what the
 * accept handler uses to redirect the user to the right space, so two
 * pending invites to the same Person for different spaces don't silently
 * land on whichever was minted last. The Person node only ever carries one
 * pending invite hash at a time (latest write wins) — each emailed link
 * self-describes the space it's for via the prefix.
 *
 * Storage shape: we persist sha256(rawToken) as inviteTokenHash, never the
 * raw token. The raw token only lives in the outgoing email URL; on accept
 * we re-hash the URL-bound token and look up by the indexed hash field.
 * This defends against database-read compromise (leaked backup,
 * misconfigured Browser, log channel) since the stored value alone can't
 * be redeemed.
 *
 * Shared by the first-invite path and the re-invite path (GOAL-329) so the
 * two stay in lockstep.
 */
async function mintAndSendInvite(
  session: Session,
  args: {
    memberId: string
    memberEmail: string
    spaceId: string
    spaceName: string
    inviterName: string
  }
): Promise<{ minted: boolean; emailOk: boolean }> {
  const inviteToken = `${args.spaceId}.${crypto.randomUUID()}`
  const inviteTokenHash = hashAuthToken(inviteToken)
  const inviteExpires = new Date(
    Date.now() + INVITE_TOKEN_TTL_MS
  ).toISOString()

  // `NOT p:User` mirrors the accept route's redemption guard: if the
  // Person registered between the caller's preflight read and this write
  // (e.g. they just redeemed a still-valid older link), don't stamp a
  // dormant token onto a live account or email a link that could never
  // be redeemed.
  const write = await session.executeWrite((tx) =>
    tx.run(
      `
      MATCH (p:Person {id: $memberId})
      WHERE NOT p:User
      SET p.inviteTokenHash = $inviteTokenHash,
          p.inviteTokenExpires = datetime($inviteExpires)
      RETURN p.id AS id
      `,
      { memberId: args.memberId, inviteTokenHash, inviteExpires }
    )
  )
  if (write.records.length === 0) {
    return { minted: false, emailOk: false }
  }

  const result = await sendSpaceInviteEmail({
    to: args.memberEmail,
    inviteToken,
    spaceName: args.spaceName,
    inviterName: args.inviterName,
  })
  return { minted: true, emailOk: result.ok }
}

/**
 * Shared core for adding an already-resolved Person to a space. The caller is
 * responsible for (a) authenticating, (b) the invite-blast rate limit, (c)
 * opening AND closing the session, and (d) the canManageMembers permission
 * gate. Given those preconditions, this creates the SpaceMembership, converts
 * a MeSpace to a WeSpace on first non-owner add, and fires the appropriate
 * email: a no-token "you've been added" notice for an existing :User, or a
 * single-use 7-day invite token for a Person that hasn't registered yet.
 * Re-adding a Person whose invite is still pending re-mints and re-sends the
 * invite link instead of failing (GOAL-329).
 */
async function addPersonToSpace(
  session: Session,
  currentUserId: string,
  spaceId: string,
  memberId: string,
  role: SpaceRole
): Promise<AddSpaceMemberResponse> {
  // Pre-flight: fetch the Person's email + :User label status + space
  // name + inviter name in one read so we can (a) block adds for people
  // with no email on file (the UI promises an email invite goes out),
  // and (b) have everything we need for the post-create email without
  // a second round trip. Runs before the already-a-member check so the
  // re-invite branch below has everything it needs.
  const preflight = await session.executeRead((tx) =>
    tx.run(
      `
      MATCH (member:Person {id: $memberId})
      MATCH (space:Space {id: $spaceId})
      OPTIONAL MATCH (inviter:Person {id: $currentUserId})
      RETURN
        member.email AS memberEmail,
        'User' IN labels(member) AS isExistingUser,
        coalesce(nullif(member.name, ''), nullif(member.firstName, ''),
          'a new member') AS memberName,
        space.name AS spaceName,
        coalesce(inviter.name, inviter.firstName, 'A GoalPost member')
          AS inviterName
      `,
      { memberId, spaceId, currentUserId }
    )
  )

  if (preflight.records.length === 0) {
    return {
      success: false,
      message: 'Member or space not found.',
    }
  }

  const memberEmail = preflight.records[0].get('memberEmail') as string | null
  const isExistingUser = preflight.records[0].get('isExistingUser') as
    | boolean
    | null
  const memberName =
    (preflight.records[0].get('memberName') as string | null) || 'a new member'
  const spaceName =
    (preflight.records[0].get('spaceName') as string | null) ?? 'this space'
  const inviterName =
    (preflight.records[0].get('inviterName') as string | null) ??
    'A GoalPost member'

  if (!memberEmail) {
    return {
      success: false,
      message:
        'Cannot add this person without an email on file. Update their profile first.',
    }
  }

  // Check if member already exists in space
  const alreadyExists = await memberExistsInSpace(session, memberId, spaceId)
  if (alreadyExists) {
    if (isExistingUser) {
      return {
        success: false,
        message: 'This member is already part of the space.',
      }
    }

    // GOAL-329: the membership exists but the Person never registered —
    // their invite is pending. The previously emailed link may be expired
    // (TTL), overwritten by a later invite to another space, or destroyed
    // by a failed accept attempt. Without this branch "already part of the
    // space" was a dead end with no way to ever get them a working link
    // again. Re-mint + re-send instead of failing. The caller's
    // invite-blast rate limit and canManageMembers gate both cover this
    // path, so a fresh token can't be blasted or minted by a non-admin.
    // Fetch the existing membership: the response surfaces it so
    // consumers (e.g. the permissions modal's activity logger) see the
    // real member instead of synthesizing an id, and the audit log below
    // records the role the membership actually holds — a
    // differently-requested `role` argument is NOT applied on re-invite.
    const existingMembership = await session.executeRead((tx) =>
      tx.run(
        `
        MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->
              (sm:SpaceMembership)-[:IS_MEMBER]->
              (person:Person {id: $memberId})
        RETURN
          sm.id as id,
          sm.role as role,
          sm.addedAt as addedAt,
          person.id as personId,
          person.name as name,
          person.email as email,
          labels(person) as personLabels
        LIMIT 1
        `,
        { spaceId, memberId }
      )
    )
    const membershipRecord = existingMembership.records[0]

    const { minted, emailOk } = await mintAndSendInvite(session, {
      memberId,
      memberEmail,
      spaceId,
      spaceName,
      inviterName,
    })

    // The token rotation is a state mutation in its own right — it
    // invalidates whatever link was emailed before — so it must be logged
    // even when the follow-up email fails.
    if (minted) {
      createLog({
        userId: currentUserId,
        description: `Re-sent the invite to ${memberName} for "${spaceName}"`,
        spaceId,
        metadata: {
          event: 'space_invite_resent',
          memberId,
          emailOk,
          ...(membershipRecord
            ? { role: membershipRecord.get('role') as string }
            : {}),
        },
      }).catch((err) => console.warn('Failed to log invite resend:', err))
    }

    if (!minted || !emailOk) {
      return {
        success: false,
        message:
          'This person has a pending invite, but a new invite email could not be sent. Please try again.',
      }
    }

    return {
      success: true,
      message: INVITE_RESENT_MESSAGE,
      ...(membershipRecord
        ? {
            membership: {
              id: membershipRecord.get('id'),
              role: membershipRecord.get('role'),
              addedAt: membershipRecord.get('addedAt')?.toString() ?? '',
              member: [
                {
                  __typename: (
                    membershipRecord.get('personLabels') as string[]
                  ).includes('Person')
                    ? ('Person' as const)
                    : ('Community' as const),
                  id: membershipRecord.get('personId'),
                  name: membershipRecord.get('name'),
                  email: membershipRecord.get('email'),
                },
              ],
            },
          }
        : {}),
    }
  }

  // Create the SpaceMembership node
  const membershipId = generateId()
  const addedAt = new Date().toISOString()

  // Check if this is a MeSpace and if we need to convert it to WeSpace
  const conversionResult = await session.executeWrite((tx) =>
    tx.run(
      `
      MATCH (space:MeSpace {id: $spaceId})
      RETURN space.id as id
      LIMIT 1
      `,
      { spaceId }
    )
  )

  const isMeSpace = conversionResult.records.length > 0

  // If it's a MeSpace, convert it to WeSpace by removing MeSpace label and adding WeSpace label
  if (isMeSpace) {
    await session.executeWrite((tx) =>
      tx.run(
        `
        MATCH (space:MeSpace {id: $spaceId})
        REMOVE space:MeSpace
        SET space:WeSpace
        `,
        { spaceId }
      )
    )
  }

  // Create the SpaceMembership and relationships
  const createResult = await session.executeWrite((tx) =>
    tx.run(
      `
      MATCH (space:Space {id: $spaceId}), (member:Person {id: $memberId})
      CREATE (sm:SpaceMembership {
        id: $membershipId,
        role: $role,
        addedAt: datetime($addedAt)
      })
      CREATE (space)-[:HAS_MEMBER]->(sm)-[:IS_MEMBER]->(member)
      RETURN sm.id as id
      `,
      {
        spaceId,
        memberId,
        membershipId,
        role,
        addedAt,
      }
    )
  )

  if (createResult.records.length === 0) {
    return {
      success: false,
      message: 'Failed to create space membership. Space or member not found.',
    }
  }

  // Now query the database to get the created SpaceMembership with member data
  const queryResult = await session.executeRead((tx) =>
    tx.run(
      `
      MATCH (sm:SpaceMembership {id: $membershipId})
      MATCH (sm)-[:IS_MEMBER]->(person:Person)
      RETURN
        sm.id as id,
        sm.role as role,
        sm.addedAt as addedAt,
        person.id as personId,
        person.firstName as firstName,
        person.lastName as lastName,
        person.name as name,
        person.email as email,
        labels(person) as personLabels
      `,
      { membershipId }
    )
  )

  if (queryResult.records.length === 0) {
    return {
      success: false,
      message: 'Failed to retrieve created space membership.',
    }
  }

  const record = queryResult.records[0]
  const personLabels = record.get('personLabels')
  const isPersonType = personLabels.includes('Person')

  // Best-effort: fire the appropriate email. If sending fails we still
  // return success for the membership itself (the user can resend later
  // by re-adding) but include a hint in the message so the UI can
  // surface it. Token storage happens in the same try so a half-
  // committed state doesn't strand a Person with a token and no email.
  let emailMessageSuffix = ''
  try {
    if (isExistingUser) {
      const result = await sendAddedToSpaceEmail({
        to: memberEmail,
        spaceId,
        spaceName,
        inviterName,
      })
      if (!result.ok) {
        emailMessageSuffix =
          ' Member added, but the notification email failed to send.'
      }
    } else {
      // Mint + email a single-use invite token (7-day TTL). Token format,
      // hash-only storage, and the latest-write-wins overwrite rule are
      // documented on mintAndSendInvite.
      const { emailOk } = await mintAndSendInvite(session, {
        memberId,
        memberEmail,
        spaceId,
        spaceName,
        inviterName,
      })
      if (!emailOk) {
        emailMessageSuffix =
          ' Member added, but the invite email failed to send.'
      }

      // Server-side audit log for the invite, attributed to the
      // inviter. The frontend already logs an 'added' event via
      // logMemberActivity, but it doesn't distinguish "added an
      // existing user" from "invited a new user" — this log
      // captures the invite-specific signal for moderation/audit.
      // memberEmail intentionally omitted from metadata since Logs
      // are readable by every space member and would otherwise leak
      // invitee emails to guests before the invitee accepts.
      createLog({
        userId: currentUserId,
        description: `Invited ${record.get('name') || 'a new member'} to "${spaceName}" via email`,
        spaceId,
        metadata: {
          event: 'space_invite_sent',
          memberId,
          role,
        },
      }).catch((err) => console.warn('Failed to log invite send:', err))
    }
  } catch (mailErr) {
    console.error('❌ Error sending member email:', mailErr)
    emailMessageSuffix =
      ' Member added, but the notification email could not be sent.'
  }

  // Recipient-addressed notification for the bell (distinct from the audit
  // Log above). Best-effort and self-notify-guarded inside createNotification.
  // Existing users get a MEMBERSHIP "added" ping; not-yet-registered invitees
  // get an INVITE — the node persists so it surfaces once they accept and can
  // log in. Raw ids stay in metadata, never in the message (KB Rule 1).
  const recipientName = (record.get('name') as string | null) || 'you'
  createNotification({
    recipientId: memberId,
    actorId: currentUserId,
    type: isExistingUser ? 'MEMBERSHIP' : 'INVITE',
    title: isExistingUser ? `Added to "${spaceName}"` : `Invited to "${spaceName}"`,
    message: isExistingUser
      ? `${inviterName} added ${recipientName} to "${spaceName}" as ${role}`
      : `${inviterName} invited you to join "${spaceName}"`,
    link: `/protected/dashboard/space/${spaceId}`,
    metadata: {
      spaceId,
      role,
      event: isExistingUser ? 'member_added' : 'space_invite_sent',
    },
  }).catch((err) => console.warn('Failed to create membership notification:', err))

  const conversionNote = isMeSpace
    ? ' Space converted from MeSpace to WeSpace.'
    : ''
  const audience = isExistingUser ? 'existing user' : 'new invitee'

  return {
    success: true,
    message:
      `Successfully added ${audience} as ${role} to space.` +
      conversionNote +
      emailMessageSuffix,
    membership: {
      id: record.get('id'),
      role: record.get('role'),
      addedAt: record.get('addedAt').toString(),
      member: [
        {
          __typename: isPersonType ? 'Person' : 'Community',
          id: record.get('personId'),
          name: record.get('name'),
          email: record.get('email'),
        },
      ],
    },
  }
}

export const spaceMembershipResolvers = {
  /**
   * Add a new member to a space with a specific role.
   * Only space owners and members with ADMIN role can add members.
   */
  addSpaceMember: async (
    _parent: never,
    args: AddSpaceMemberInput,
    context: Context
  ): Promise<AddSpaceMemberResponse> => {
    const currentUserId = context.jwt?.user.id
    const { spaceId, memberId, role } = args

    // Validate authentication
    if (!currentUserId) {
      return {
        success: false,
        message: 'Authentication required. Please log in.',
      }
    }

    // Rate-limit before opening a session so a flood can't cost the DB pool
    // a connection or write any side effects. Throws on denial.
    await enforceInviteBlastLimit(context.clientIp, spaceId, currentUserId)

    const session = context.executionContext.session()

    try {
      // Check if current user has permission to manage members
      const hasPermission = await canManageMembers(
        session,
        currentUserId,
        spaceId
      )
      if (!hasPermission) {
        return {
          success: false,
          message:
            'Only space owners and ADMIN members can add new members to this space.',
        }
      }

      return await addPersonToSpace(
        session,
        currentUserId,
        spaceId,
        memberId,
        role
      )
    } catch (error) {
      console.error('❌ Error adding space member:', error)
      return {
        success: false,
        message: 'An error occurred while adding the member to the space.',
      }
    } finally {
      await session.close()
    }
  },

  /**
   * Invite someone to a space by email, even if they are not yet a GoalPost
   * member. Resolves the email to an existing Person, or creates a placeholder
   * Person carrying just the email, then runs the same membership + invite
   * flow as addSpaceMember. The placeholder is promoted to a full :User when
   * the invitee accepts and sets a password (see accept-invite route).
   * Only space owners and members with ADMIN role can invite.
   */
  inviteToSpaceByEmail: async (
    _parent: never,
    args: { spaceId: string; email: string; role: SpaceRole },
    context: Context
  ): Promise<AddSpaceMemberResponse> => {
    const currentUserId = context.jwt?.user.id
    const { spaceId, role } = args

    // Validate authentication (outermost gate, before the rate limit).
    if (!currentUserId) {
      return {
        success: false,
        message: 'Authentication required. Please log in.',
      }
    }

    // Validate the email shape before doing anything else so a fat-fingered
    // value never reaches the rate limiter or the database.
    const email = normalizeEmail(args.email ?? '')
    if (!isValidEmail(email)) {
      return {
        success: false,
        message: 'Please enter a valid email address.',
      }
    }

    // Same invite-blast gate as addSpaceMember. Crucially this runs BEFORE the
    // Person create below, so a blasted invite never creates a placeholder.
    await enforceInviteBlastLimit(context.clientIp, spaceId, currentUserId)

    const session = context.executionContext.session()

    try {
      // Permission gate runs before the MERGE so a non-admin can't spray
      // placeholder Person nodes into the graph.
      const hasPermission = await canManageMembers(
        session,
        currentUserId,
        spaceId
      )
      if (!hasPermission) {
        return {
          success: false,
          message:
            'Only space owners and ADMIN members can invite new members to this space.',
        }
      }

      // Resolve the email to a Person, creating a placeholder only if none
      // exists. The email is already normalized (trim + lowercase) and stored
      // emails are normalized too (login/signup write lowercase + the
      // Person.email uniqueness constraint), so an exact match is correct and
      // resolves via the constraint's backing index. The CREATE below is
      // guarded by the uniqueness constraint, so a create-create race between
      // two concurrent invites for the same new email surfaces as a clean
      // constraint error on the loser rather than a silent duplicate Person.
      const existing = await session.executeRead((tx) =>
        tx.run(
          `
          MATCH (p:Person { email: $email })
          RETURN p.id AS id
          ORDER BY p.createdAt ASC
          LIMIT 1
          `,
          { email }
        )
      )

      let resolvedMemberId = existing.records[0]?.get('id') as string | undefined

      if (!resolvedMemberId) {
        const created = await session.executeWrite((tx) =>
          tx.run(
            `
            CREATE (p:Person {
              id: $memberId,
              email: $email,
              firstName: '',
              lastName: '',
              createdAt: datetime(),
              updatedAt: datetime()
            })
            RETURN p.id AS id
            `,
            { email, memberId: generateId() }
          )
        )
        resolvedMemberId = created.records[0]?.get('id') as string | undefined
      }

      if (!resolvedMemberId) {
        return {
          success: false,
          message: 'Failed to resolve the invited person.',
        }
      }

      return await addPersonToSpace(
        session,
        currentUserId,
        spaceId,
        resolvedMemberId,
        role
      )
    } catch (error) {
      console.error('❌ Error inviting member by email:', error)
      return {
        success: false,
        message: 'An error occurred while inviting the member to the space.',
      }
    } finally {
      await session.close()
    }
  },

  /**
   * Update a space member's role.
   * Only space owners and members with ADMIN role can change roles.
   */
  updateSpaceMemberRole: async (
    _parent: never,
    args: UpdateSpaceMemberRoleInput,
    context: Context
  ): Promise<UpdateSpaceMemberRoleResponse> => {
    const currentUserId = context.jwt?.user.id
    const { spaceId, memberId, role } = args

    // Validate authentication
    if (!currentUserId) {
      return {
        success: false,
        message: 'Authentication required. Please log in.',
      }
    }

    const session = context.executionContext.session()

    try {
      // Check if current user has permission to manage members
      const hasPermission = await canManageMembers(
        session,
        currentUserId,
        spaceId
      )
      if (!hasPermission) {
        return {
          success: false,
          message:
            'Only space owners and ADMIN members can change member roles.',
        }
      }

      // Check if member exists in space
      const exists = await memberExistsInSpace(session, memberId, spaceId)
      if (!exists) {
        return {
          success: false,
          message: 'This member is not part of the space.',
        }
      }

      // Prevent changing owner's role (if they're trying to change owner via SpaceMembership, which shouldn't exist)
      const isOwner = await isSpaceOwner(session, memberId, spaceId)
      if (isOwner) {
        return {
          success: false,
          message: 'Cannot change the role of the space owner.',
        }
      }

      // Update the role
      const result = await session.executeWrite((tx) =>
        tx.run(
          `
          MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member:Person {id: $memberId})
          SET sm.role = $role
          RETURN
            sm.id as id,
            sm.role as role,
            sm.addedAt as addedAt,
            member.id as memberId,
            member.name as memberName,
            member.email as memberEmail,
            labels(member) as memberLabels,
            space.name as spaceName
          `,
          { spaceId, memberId, role }
        )
      )

      if (result.records.length === 0) {
        return {
          success: false,
          message: 'Failed to update member role.',
        }
      }

      const record = result.records[0]
      const memberLabels = record.get('memberLabels')
      const isPersonType = memberLabels.includes('Person')
      const roleSpaceName =
        (record.get('spaceName') as string | null) || 'a space'

      // Notify the affected member that their role changed (best-effort,
      // self-notify-guarded). Raw ids stay in metadata, never the message.
      createNotification({
        recipientId: memberId,
        actorId: currentUserId,
        type: 'ROLE_CHANGE',
        title: `Your role changed in "${roleSpaceName}"`,
        message: `Your role in "${roleSpaceName}" was changed to ${role}`,
        link: `/protected/dashboard/space/${spaceId}`,
        metadata: { spaceId, role },
      }).catch((err) =>
        console.warn('Failed to create role-change notification:', err)
      )

      return {
        success: true,
        message: `Successfully updated member role to ${role}.`,
        membership: {
          id: record.get('id'),
          role: record.get('role'),
          addedAt: record.get('addedAt').toString(),
          member: [
            {
              __typename: isPersonType ? 'Person' : 'Community',
              id: record.get('memberId'),
              name: record.get('memberName'),
              email: record.get('memberEmail'),
            },
          ],
        },
      }
    } catch (error) {
      console.error('❌ Error updating space member role:', error)
      return {
        success: false,
        message: 'An error occurred while updating the member role.',
      }
    } finally {
      await session.close()
    }
  },

  /**
   * Remove a member from a space.
   * Only space owners and members with ADMIN role can remove members.
   * Cannot remove the space owner.
   */
  removeSpaceMember: async (
    _parent: never,
    args: RemoveSpaceMemberInput,
    context: Context
  ): Promise<RemoveSpaceMemberResponse> => {
    const currentUserId = context.jwt?.user.id
    const { spaceId, memberId } = args

    // Validate authentication
    if (!currentUserId) {
      return {
        success: false,
        message: 'Authentication required. Please log in.',
      }
    }

    const session = context.executionContext.session()

    try {
      // Check if current user has permission to manage members
      const hasPermission = await canManageMembers(
        session,
        currentUserId,
        spaceId
      )
      if (!hasPermission) {
        return {
          success: false,
          message:
            'Only space owners and ADMIN members can remove members from this space.',
        }
      }

      // Prevent removing the space owner
      const isOwner = await isSpaceOwner(session, memberId, spaceId)
      if (isOwner) {
        return {
          success: false,
          message: 'Cannot remove the space owner from the space.',
        }
      }

      // Check if member exists in space
      const exists = await memberExistsInSpace(session, memberId, spaceId)
      if (!exists) {
        return {
          success: false,
          message: 'This member is not part of the space.',
        }
      }

      // Delete the SpaceMembership node and relationships
      const result = await session.executeWrite((tx) =>
        tx.run(
          `
          MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member:Person {id: $memberId})
          DETACH DELETE sm
          RETURN COUNT(*) as deleted
          `,
          { spaceId, memberId }
        )
      )

      if (
        result.records.length === 0 ||
        result.records[0].get('deleted') === 0
      ) {
        return {
          success: false,
          message: 'Failed to remove member from space.',
        }
      }

      return {
        success: true,
        message: 'Successfully removed member from space.',
      }
    } catch (error) {
      console.error('❌ Error removing space member:', error)
      return {
        success: false,
        message: 'An error occurred while removing the member from the space.',
      }
    } finally {
      await session.close()
    }
  },
}
