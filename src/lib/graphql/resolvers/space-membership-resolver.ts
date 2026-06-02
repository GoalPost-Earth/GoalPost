import { Session } from 'neo4j-driver'
import { Context } from '@/config/types'
import { generateId } from '@/utils/id-generator'
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
import { hashAuthToken } from '@/lib/auth/token-hash'
import { rateLimit } from '@/lib/auth/rate-limit'
import { GraphQLError } from 'graphql'

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
 * the invite mail. This just rejects obvious garbage so we don't MERGE a junk
 * Person node (e.g. a bare name the admin fat-fingered into the field).
 */
function normalizeEmail(raw: string): string {
  return raw.trim()
}

function isValidEmail(email: string): boolean {
  // Mirrors the permissiveness of zod's .email() closely enough for a guard:
  // one @, non-empty local + domain, a dot in the domain, no whitespace.
  // The 254-char ceiling is the RFC 5321 maximum and stops a giant string
  // matching the pattern from being MERGEd onto a node property.
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Invite-blast rate limit (GOAL-249). Two cheap keys, both must allow:
 * per-client-IP and per-target-space. IP-keying is the primary control;
 * per-space is supplementary and survives IP rotation, since an attacker can
 * rotate proxies but not the space they're targeting. Fail-CLOSED on Redis
 * outage. Throws a GraphQLError BEFORE the caller opens a session / writes
 * anything, so a rejected mutation doesn't create a Person, a SpaceMembership,
 * mint a token, or log activity.
 */
async function enforceInviteBlastLimit(
  clientIp: string | undefined,
  spaceId: string
): Promise<void> {
  const ipKey = clientIp || 'unknown'
  const [ipBlast, spaceBlast] = await Promise.all([
    rateLimit({ policy: 'invite-blast', key: `invite-blast:ip:${ipKey}` }),
    rateLimit({
      policy: 'invite-blast',
      key: `invite-blast:space:${spaceId}`,
    }),
  ])
  const blast = ipBlast.allowed ? spaceBlast : ipBlast
  if (!blast.allowed) {
    const minutes = Math.ceil(blast.retryAfter / 60)
    throw new GraphQLError(
      `Invite limit reached — try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      { extensions: { code: 'RATE_LIMITED', retryAfter: blast.retryAfter } }
    )
  }
}

/**
 * Shared core for adding an already-resolved Person to a space. The caller is
 * responsible for (a) authenticating, (b) the invite-blast rate limit, (c)
 * opening AND closing the session, and (d) the canManageMembers permission
 * gate. Given those preconditions, this creates the SpaceMembership, converts
 * a MeSpace to a WeSpace on first non-owner add, and fires the appropriate
 * email: a no-token "you've been added" notice for an existing :User, or a
 * single-use 48h invite token for a Person that hasn't registered yet.
 */
async function addPersonToSpace(
  session: Session,
  currentUserId: string,
  spaceId: string,
  memberId: string,
  role: SpaceRole
): Promise<AddSpaceMemberResponse> {
  // Check if member already exists in space
  const alreadyExists = await memberExistsInSpace(session, memberId, spaceId)
  if (alreadyExists) {
    return {
      success: false,
      message: 'This member is already part of the space.',
    }
  }

  // Pre-flight: fetch the Person's email + :User label status + space
  // name + inviter name in one read so we can (a) block adds for people
  // with no email on file (the UI promises an email invite goes out),
  // and (b) have everything we need for the post-create email without
  // a second round trip.
  const preflight = await session.executeRead((tx) =>
    tx.run(
      `
      MATCH (member:Person {id: $memberId})
      MATCH (space:Space {id: $spaceId})
      OPTIONAL MATCH (inviter:Person {id: $currentUserId})
      RETURN
        member.email AS memberEmail,
        'User' IN labels(member) AS isExistingUser,
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
      // Mint a single-use invite token. Format is `${spaceId}.${uuid}`:
      // the spaceId prefix is what the accept handler uses to redirect
      // the user to the right space, so two pending invites to the same
      // Person for different spaces don't silently land on whichever
      // was minted last. The Person node only ever carries one pending
      // invite hash at a time (latest write wins) — each emailed link
      // self-describes the space it's for via the prefix. 48h expiry.
      //
      // Storage shape: we persist sha256(rawToken) as inviteTokenHash,
      // never the raw token. The raw token only lives in the outgoing
      // email URL; on accept we re-hash the URL-bound token and look up
      // by the indexed hash field. This defends against database-read
      // compromise (leaked backup, misconfigured Browser, log channel)
      // since the stored value alone can't be redeemed.
      const inviteToken = `${spaceId}.${crypto.randomUUID()}`
      const inviteTokenHash = hashAuthToken(inviteToken)
      const inviteExpires = new Date(
        Date.now() + 48 * 60 * 60 * 1000
      ).toISOString()

      await session.executeWrite((tx) =>
        tx.run(
          `
          MATCH (p:Person {id: $memberId})
          SET p.inviteTokenHash = $inviteTokenHash,
              p.inviteTokenExpires = datetime($inviteExpires)
          `,
          { memberId, inviteTokenHash, inviteExpires }
        )
      )

      const result = await sendSpaceInviteEmail({
        to: memberEmail,
        inviteToken,
        spaceName,
        inviterName,
      })
      if (!result.ok) {
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
    await enforceInviteBlastLimit(context.clientIp, spaceId)

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
    // MERGE below, so a blasted invite never creates a placeholder Person.
    await enforceInviteBlastLimit(context.clientIp, spaceId)

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
      // exists. We deliberately do NOT use `MERGE (p:Person {email})`: there
      // is no uniqueness constraint on Person.email, so MERGE on a duplicated
      // email (which the model permits — imports, as-entered casing) would
      // bind multiple nodes and return a non-deterministic row. Instead we
      // look up case-insensitively first so we never fork a duplicate of a
      // person already in the graph regardless of stored casing, then CREATE
      // a placeholder carrying just the email. firstName/lastName fill in when
      // the invitee accepts and completes onboarding. (A constraint on
      // Person.email is the real fix for the residual create-create race —
      // tracked as a follow-up since signup/login store emails as entered and
      // would need a coordinated dedupe migration first.)
      const existing = await session.executeRead((tx) =>
        tx.run(
          `
          MATCH (p:Person)
          WHERE toLower(p.email) = toLower($email)
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
            labels(member) as memberLabels
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
