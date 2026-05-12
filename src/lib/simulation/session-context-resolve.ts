import { driver } from '@/lib/neo4j/driver'

export interface ResolvedSessionContextNames {
  activeSpaceName: string | null
  activeSpaceType: 'MeSpace' | 'WeSpace' | null
  activeFieldContextTitle: string | null
  /**
   * The current user's first name, resolved from the Person node matching
   * `userId`. Used to pair `currentUserId` with a human label in SESSION
   * CONTEXT so the model can recognise itself addressing the user (vs.
   * referring to them in third person via a space name like "Wade's MeSpace").
   */
  currentUserName: string | null
  /**
   * True when the current user owns the active Space (i.e. the active Space
   * is *their* MeSpace, or a WeSpace they own). Drives the "use 'your
   * MeSpace' not 'Wade's MeSpace'" directive in the prompt.
   */
  activeSpaceOwnedByCurrentUser: boolean
}

/**
 * Pre-resolve human-readable names for the ambient session ids so the
 * assistant's SESSION CONTEXT block carries `activeSpace.name`, the current
 * user's display name, etc. alongside the bare ids.
 *
 * This eliminates a class of UX bug where the model surfaces a raw UUID to the
 * user (e.g. "You're in space me_a87c5bf1-...") or refers to the current user
 * in third person ("Wade's MeSpace") because it had no name to use.
 *
 * Authorization model:
 *   - `spaceId` / `fieldContextId`: the route-level auth already authorized
 *     the user for these. The resolver does NOT re-check; it only returns
 *     non-sensitive labels (Space.name, FieldContext.title, Space subtype).
 *   - `userId`: self-read on the user's own Person node is always authorized.
 *     The ownership boolean is a derived flag about a Space the user is
 *     already authorized for, so it leaks nothing additional.
 *
 * Do NOT extend the RETURN with descriptions, pulse counts, related-people
 * fields, member lists, or anything else without re-establishing the
 * appropriate auth check — additions here are how cross-tenant reads slip in.
 */
export async function resolveSessionContextNames(
  spaceId: string | null,
  fieldContextId: string | null,
  userId: string | null
): Promise<ResolvedSessionContextNames> {
  const empty: ResolvedSessionContextNames = {
    activeSpaceName: null,
    activeSpaceType: null,
    activeFieldContextTitle: null,
    currentUserName: null,
    activeSpaceOwnedByCurrentUser: false,
  }

  if (!spaceId && !fieldContextId && !userId) {
    return empty
  }

  const session = driver.session()
  try {
    const result = await session.run(
      `
      WITH $spaceId AS spaceId, $fieldContextId AS fieldContextId, $userId AS userId
      OPTIONAL MATCH (s:Space {id: spaceId})
      OPTIONAL MATCH (c:FieldContext {id: fieldContextId})
      OPTIONAL MATCH (u:Person {id: userId})
      RETURN
        s.name AS spaceName,
        head([l IN labels(s) WHERE l IN ['MeSpace','WeSpace']]) AS spaceType,
        c.title AS fieldContextTitle,
        u.firstName AS userFirstName,
        CASE
          WHEN u IS NULL OR s IS NULL THEN false
          ELSE exists((u)-[:OWNS]->(s))
        END AS ownsActiveSpace
      `,
      {
        spaceId: spaceId ?? null,
        fieldContextId: fieldContextId ?? null,
        userId: userId ?? null,
      }
    )

    const record = result.records[0]
    if (!record) {
      return empty
    }

    const spaceType = record.get('spaceType') as string | null
    return {
      activeSpaceName: (record.get('spaceName') as string | null) ?? null,
      activeSpaceType:
        spaceType === 'MeSpace' || spaceType === 'WeSpace' ? spaceType : null,
      activeFieldContextTitle:
        (record.get('fieldContextTitle') as string | null) ?? null,
      currentUserName: (record.get('userFirstName') as string | null) ?? null,
      activeSpaceOwnedByCurrentUser: Boolean(record.get('ownsActiveSpace')),
    }
  } catch (error) {
    // Name resolution is best-effort — if Neo4j is unhappy we still want the
    // assistant request to proceed with ids only.
    console.warn(
      '[session-context-resolve] Failed to resolve names:',
      error instanceof Error ? error.message : error
    )
    return empty
  } finally {
    await session.close()
  }
}
