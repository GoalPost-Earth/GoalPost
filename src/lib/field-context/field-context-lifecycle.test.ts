import { randomUUID } from 'node:crypto'
import type { QueryResult } from 'neo4j-driver'
import { driver } from '@/lib/neo4j/driver'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'
import { softDeleteFieldContext } from './soft-delete-field-context'
import { purgeDeletedFieldContexts } from './purge-deleted-field-contexts'

/**
 * GOAL-319 — FieldContext soft-delete + purge lifecycle integration tests.
 *
 * Runs against the real dev Neo4j (same convention as
 * provenance-and-permissions.test.ts): env comes from
 * `DOTENV_CONFIG_PATH=./.env.local` via `npm test`; when Neo4j is
 * unreachable every case degrades to a no-op pass.
 *
 * Every seeded node id starts with the run-unique `g319test_<runId>` prefix
 * so afterAll can sweep the whole fixture with one STARTS WITH match. Logs
 * written by the soft delete carry the context id inside their metadata
 * JSON, so they are swept by a metadata CONTAINS match on the same prefix.
 *
 * SAFETY — why the purge tests never pass `retentionDays: 0`: the purge
 * matches EVERY FieldContext in the database whose `deletedAt` beats the
 * retention window, not just this suite's fixtures. On the shared dev
 * database a zero-day retention would hard-delete any recently soft-deleted
 * real context (e.g. GOAL-319 smoke-test leftovers). Instead the suite
 * backdates its own fixtures by 400 days and runs the purge with
 * `retentionDays: 365` — only artificially backdated test contexts can
 * qualify, because the `deletedAt` property has only existed since GOAL-319
 * landed. The retention semantics under test are identical.
 */

const runId = `g319test_${randomUUID().slice(0, 8)}`

let neo4jAvailable = false

const ids = {
  meOwner: `${runId}_me_owner`,
  wsOwner: `${runId}_ws_owner`,
  admin: `${runId}_admin`,
  member: `${runId}_member`,
  outsider: `${runId}_outsider`,
  meSpace: `${runId}_me_space`,
  weSpace: `${runId}_we_space`,
  smAdmin: `${runId}_sm_admin`,
  smMember: `${runId}_sm_member`,
}

async function runCypher(
  query: string,
  params: Record<string, unknown> = {}
): Promise<QueryResult> {
  const session = driver.session()
  try {
    return await session.run(query, params)
  } finally {
    await session.close()
  }
}

/** Count nodes carrying any of the given ids (bypasses all authorization). */
async function countByIds(nodeIds: string[]): Promise<number> {
  const res = await runCypher(
    'MATCH (n) WHERE n.id IN $nodeIds RETURN count(n) AS c',
    { nodeIds }
  )
  return res.records[0].get('c').toNumber()
}

/** HAS_CONTEXT / HAS_DELETED_CONTEXT edge counts into the given context. */
async function contextEdgeCounts(
  ctxId: string
): Promise<{ hasContext: number; hasDeleted: number }> {
  const res = await runCypher(
    `
    MATCH (c:FieldContext {id: $ctxId})
    OPTIONAL MATCH (:Space)-[hc:HAS_CONTEXT]->(c)
    OPTIONAL MATCH (:Space)-[hd:HAS_DELETED_CONTEXT]->(c)
    RETURN count(DISTINCT hc) AS hasContext, count(DISTINCT hd) AS hasDeleted
    `,
    { ctxId }
  )
  return {
    hasContext: res.records[0].get('hasContext').toNumber(),
    hasDeleted: res.records[0].get('hasDeleted').toNumber(),
  }
}

/** Seed a live FieldContext (HAS_CONTEXT) with n pulses in the given Space. */
async function seedContext(opts: {
  spaceId: string
  key: string
  pulseCount?: number
}): Promise<{ ctxId: string; pulseIds: string[]; title: string }> {
  const ctxId = `${runId}_ctx_${opts.key}`
  const title = `G319 Field ${opts.key}`
  const pulseIds = Array.from(
    { length: opts.pulseCount ?? 0 },
    (_, i) => `${runId}_pulse_${opts.key}_${i}`
  )
  await runCypher(
    `
    MATCH (s:Space {id: $spaceId})
    CREATE (c:FieldContext {id: $ctxId, title: $title, createdAt: datetime()})
    CREATE (s)-[:HAS_CONTEXT]->(c)
    WITH c
    UNWIND $pulseIds AS pid
    CREATE (p:FieldPulse:GoalPulse {id: pid, title: 'Pulse ' + pid, content: 'test pulse body', createdAt: datetime()})
    CREATE (c)-[:HAS_PULSE]->(p)
    `,
    { spaceId: opts.spaceId, ctxId, title, pulseIds }
  )
  return { ctxId, pulseIds, title }
}

beforeAll(async () => {
  try {
    const s = driver.session()
    await s.run('RETURN 1')
    await s.close()
    neo4jAvailable = true
  } catch {
    neo4jAvailable = false
  }
  if (!neo4jAvailable) {
    console.warn('Neo4j unavailable — skipping GOAL-319 lifecycle suite')
    return
  }

  await runCypher(
    `
    CREATE (mo:Person:User {id: $meOwnerId, firstName: 'Mia', lastName: 'MeOwner', name: 'Mia MeOwner', createdAt: datetime()})
    CREATE (wo:Person:User {id: $wsOwnerId, firstName: 'Wes', lastName: 'WsOwner', name: 'Wes WsOwner', createdAt: datetime()})
    CREATE (ad:Person:User {id: $adminId, firstName: 'Ada', lastName: 'Admin', name: 'Ada Admin', createdAt: datetime()})
    CREATE (me:Person:User {id: $memberId, firstName: 'Mel', lastName: 'Member', name: 'Mel Member', createdAt: datetime()})
    CREATE (ou:Person:User {id: $outsiderId, firstName: 'Olly', lastName: 'Outsider', name: 'Olly Outsider', createdAt: datetime()})
    CREATE (ms:Space:MeSpace {id: $meSpaceId, name: 'G319 Test MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
    CREATE (mo)-[:OWNS]->(ms)
    CREATE (ws:Space:WeSpace {id: $weSpaceId, name: 'G319 Test WeSpace', visibility: 'SHARED', createdAt: datetime()})
    CREATE (wo)-[:OWNS]->(ws)
    CREATE (ws)-[:HAS_MEMBER]->(:SpaceMembership {id: $smAdminId, role: 'ADMIN', addedAt: datetime()})-[:IS_MEMBER]->(ad)
    CREATE (ws)-[:HAS_MEMBER]->(:SpaceMembership {id: $smMemberId, role: 'MEMBER', addedAt: datetime()})-[:IS_MEMBER]->(me)
    `,
    {
      meOwnerId: ids.meOwner,
      wsOwnerId: ids.wsOwner,
      adminId: ids.admin,
      memberId: ids.member,
      outsiderId: ids.outsider,
      meSpaceId: ids.meSpace,
      weSpaceId: ids.weSpace,
      smAdminId: ids.smAdmin,
      smMemberId: ids.smMember,
    }
  )
}, 120_000)

afterAll(async () => {
  if (neo4jAvailable) {
    const session = driver.session()
    try {
      // Logs are not id-namespaced (`log_...`), but their metadata JSON
      // carries the context id, which starts with the run prefix.
      await session.run(
        `MATCH (log:Log) WHERE log.metadata CONTAINS $prefix DETACH DELETE log`,
        { prefix: runId }
      )
      await session.run(
        `MATCH (n) WHERE n.id STARTS WITH $prefix DETACH DELETE n`,
        { prefix: runId }
      )
    } finally {
      await session.close()
    }
  }
  await driver.close()
}, 120_000)

describe('softDeleteFieldContext (GOAL-319)', () => {
  describe('when the caller is the MeSpace owner', () => {
    it('soft-deletes the context and its pulses — stamps deletedAt, re-points the Space edge, writes one Log', async () => {
      if (!neo4jAvailable) return
      const { ctxId, title } = await seedContext({
        spaceId: ids.meSpace,
        key: 'owner_ok',
        pulseCount: 2,
      })

      const result = await softDeleteFieldContext(
        { driver },
        { currentUserId: ids.meOwner, contextId: ctxId }
      )

      expect(result.ok).toBe(true)
      if (!result.ok) throw new Error('unreachable')
      expect(result.contextId).toBe(ctxId)
      expect(result.title).toBe(title)
      expect(result.deletedPulseCount).toBe(2)

      // deletedAt stamped on the context and BOTH pulses.
      const stamps = await runCypher(
        `
        MATCH (c:FieldContext {id: $ctxId})
        OPTIONAL MATCH (c)-[:HAS_PULSE]->(p:FieldPulse)
        RETURN c.deletedAt IS NOT NULL AS ctxDeleted,
               [x IN collect(p) | x.deletedAt IS NOT NULL] AS pulseStamps
        `,
        { ctxId }
      )
      expect(stamps.records[0].get('ctxDeleted')).toBe(true)
      expect(stamps.records[0].get('pulseStamps')).toEqual([true, true])

      // Edge re-pointed: zero HAS_CONTEXT, exactly one HAS_DELETED_CONTEXT.
      await expect(contextEdgeCounts(ctxId)).resolves.toEqual({
        hasContext: 0,
        hasDeleted: 1,
      })

      // Exactly one Log, CREATED_BY the owner, human-readable description.
      const logs = await runCypher(
        `
        MATCH (log:Log)-[:CREATED_BY]->(u:Person {id: $userId})
        WHERE log.metadata CONTAINS $ctxId
        RETURN log.description AS description
        `,
        { userId: ids.meOwner, ctxId }
      )
      expect(logs.records).toHaveLength(1)
      const description = String(logs.records[0].get('description'))
      expect(description).toContain(title)
      expect(description).toContain('and 2 pulses')
    })

    it('hard-deletes a ResonanceSuggestion anchored on the space + context and touching the context pulses', async () => {
      if (!neo4jAvailable) return
      const { ctxId, pulseIds } = await seedContext({
        spaceId: ids.meSpace,
        key: 'sug_cleanup',
        pulseCount: 2,
      })
      const sugId = `${runId}_sug_cleanup`
      await runCypher(
        `
        MATCH (s:Space {id: $spaceId})-[:HAS_CONTEXT]->(c:FieldContext {id: $ctxId})
        MATCH (p1:FieldPulse {id: $p1}), (p2:FieldPulse {id: $p2})
        CREATE (sug:ResonanceSuggestion {id: $sugId, label: 'G319 suggestion', confidence: 0.9, status: 'pending', createdAt: datetime()})
        CREATE (s)-[:HAS_SUGGESTION]->(sug)
        CREATE (c)-[:HAS_SUGGESTION]->(sug)
        CREATE (sug)-[:SOURCE]->(p1)
        CREATE (sug)-[:TARGET]->(p2)
        `,
        {
          spaceId: ids.meSpace,
          ctxId,
          p1: pulseIds[0],
          p2: pulseIds[1],
          sugId,
        }
      )

      const result = await softDeleteFieldContext(
        { driver },
        { currentUserId: ids.meOwner, contextId: ctxId }
      )

      expect(result.ok).toBe(true)
      // The suggestion is regenerable AI output — hard-deleted, not parked.
      await expect(countByIds([sugId])).resolves.toBe(0)
    })
  })

  describe('when the caller is a WeSpace ADMIN member', () => {
    it('allows the delete — same gate as the Space owner', async () => {
      if (!neo4jAvailable) return
      const { ctxId } = await seedContext({
        spaceId: ids.weSpace,
        key: 'admin_ok',
        pulseCount: 1,
      })

      const result = await softDeleteFieldContext(
        { driver },
        { currentUserId: ids.admin, contextId: ctxId }
      )

      expect(result.ok).toBe(true)
      if (!result.ok) throw new Error('unreachable')
      expect(result.deletedPulseCount).toBe(1)
      await expect(contextEdgeCounts(ctxId)).resolves.toEqual({
        hasContext: 0,
        hasDeleted: 1,
      })
    })
  })

  describe('when the caller is a WeSpace MEMBER (can edit content, cannot drop fields)', () => {
    it('is forbidden and leaves the graph untouched', async () => {
      if (!neo4jAvailable) return
      const { ctxId, pulseIds } = await seedContext({
        spaceId: ids.weSpace,
        key: 'member_no',
        pulseCount: 1,
      })

      const result = await softDeleteFieldContext(
        { driver },
        { currentUserId: ids.member, contextId: ctxId }
      )

      expect(result.ok).toBe(false)
      if (result.ok) throw new Error('unreachable')
      expect(result.reason).toBe('forbidden')

      // Graph untouched: live edge intact, no deletedAt anywhere, no Log.
      await expect(contextEdgeCounts(ctxId)).resolves.toEqual({
        hasContext: 1,
        hasDeleted: 0,
      })
      const stamps = await runCypher(
        `
        MATCH (c:FieldContext {id: $ctxId})
        MATCH (p:FieldPulse {id: $pulseId})
        RETURN c.deletedAt IS NULL AS ctxLive, p.deletedAt IS NULL AS pulseLive
        `,
        { ctxId, pulseId: pulseIds[0] }
      )
      expect(stamps.records[0].get('ctxLive')).toBe(true)
      expect(stamps.records[0].get('pulseLive')).toBe(true)
      const logs = await runCypher(
        `MATCH (log:Log) WHERE log.metadata CONTAINS $ctxId RETURN log`,
        { ctxId }
      )
      expect(logs.records).toHaveLength(0)
    })
  })

  describe('when the caller or input is invalid', () => {
    it('rejects a user with no relationship to the Space as forbidden', async () => {
      if (!neo4jAvailable) return
      const { ctxId } = await seedContext({
        spaceId: ids.meSpace,
        key: 'outsider_no',
        pulseCount: 1,
      })

      const result = await softDeleteFieldContext(
        { driver },
        { currentUserId: ids.outsider, contextId: ctxId }
      )

      expect(result.ok).toBe(false)
      if (result.ok) throw new Error('unreachable')
      expect(result.reason).toBe('forbidden')
      await expect(contextEdgeCounts(ctxId)).resolves.toEqual({
        hasContext: 1,
        hasDeleted: 0,
      })
    })

    it('collapses a nonexistent contextId into forbidden — existence is not leaked', async () => {
      if (!neo4jAvailable) return
      const result = await softDeleteFieldContext(
        { driver },
        { currentUserId: ids.meOwner, contextId: `${runId}_ctx_never_seeded` }
      )
      expect(result.ok).toBe(false)
      if (result.ok) throw new Error('unreachable')
      expect(result.reason).toBe('forbidden')
    })

    it('rejects an empty contextId with invalid_input', async () => {
      if (!neo4jAvailable) return
      const result = await softDeleteFieldContext(
        { driver },
        { currentUserId: ids.meOwner, contextId: '   ' }
      )
      expect(result.ok).toBe(false)
      if (result.ok) throw new Error('unreachable')
      expect(result.reason).toBe('invalid_input')
    })
  })
})

describe('softDeleteFieldContext — HAS_SUBCONTEXT cascade (GOAL-295)', () => {
  // Soft delete cascades over the context's nested sub-context subtree: every
  // live descendant reached via HAS_SUBCONTEXT* is stamped and has its own
  // Space edge re-pointed in the same transaction (kb/04) — a parent can
  // never be hidden while its children stay visible. The shared-pulse
  // exclusive-holder guard treats the WHOLE deleted subtree as one holder
  // set.

  /** Overlay-link an already-seeded parent context to a child context. */
  async function linkSub(parentId: string, childId: string): Promise<void> {
    await runCypher(
      `
      MATCH (p:FieldContext {id: $parentId})
      MATCH (c:FieldContext {id: $childId})
      CREATE (p)-[:HAS_SUBCONTEXT]->(c)
      `,
      { parentId, childId }
    )
  }

  async function ctxStamped(ctxId: string): Promise<boolean> {
    const res = await runCypher(
      `MATCH (c:FieldContext {id: $ctxId}) RETURN c.deletedAt IS NOT NULL AS stamped`,
      { ctxId }
    )
    expect(res.records).toHaveLength(1)
    return res.records[0].get('stamped') as boolean
  }

  async function cascadePulseStamped(pulseId: string): Promise<boolean> {
    const res = await runCypher(
      `MATCH (p:FieldPulse {id: $pulseId}) RETURN p.deletedAt IS NOT NULL AS stamped`,
      { pulseId }
    )
    expect(res.records).toHaveLength(1)
    return res.records[0].get('stamped') as boolean
  }

  it('deleting the parent stamps parent, child, and grandchild, re-points all three Space edges, and reports deletedSubContextCount = 2', async () => {
    if (!neo4jAvailable) return
    const parent = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_parent',
      pulseCount: 1,
    })
    const child = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_child',
      pulseCount: 1,
    })
    const grandchild = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_grandchild',
    })
    await linkSub(parent.ctxId, child.ctxId)
    await linkSub(child.ctxId, grandchild.ctxId)

    const result = await softDeleteFieldContext(
      { driver },
      { currentUserId: ids.meOwner, contextId: parent.ctxId }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.contextId).toBe(parent.ctxId)
    expect(result.deletedSubContextCount).toBe(2)
    // The parent's own pulse AND the pulse held only by the child are both
    // stamped — the child's exclusive pulse joins the cascade.
    expect(result.deletedPulseCount).toBe(2)

    for (const ctxId of [parent.ctxId, child.ctxId, grandchild.ctxId]) {
      await expect(ctxStamped(ctxId)).resolves.toBe(true)
      await expect(contextEdgeCounts(ctxId)).resolves.toEqual({
        hasContext: 0,
        hasDeleted: 1,
      })
    }
    await expect(cascadePulseStamped(child.pulseIds[0])).resolves.toBe(true)

    // One Log for the whole cascade, counting the nested fields.
    const logs = await runCypher(
      `
      MATCH (log:Log)-[:CREATED_BY]->(:Person {id: $userId})
      WHERE log.metadata CONTAINS $ctxId
      RETURN log.description AS description
      `,
      { userId: ids.meOwner, ctxId: parent.ctxId }
    )
    expect(logs.records).toHaveLength(1)
    const description = String(logs.records[0].get('description'))
    expect(description).toContain('with 2 nested fields')
    expect(description).toContain('and 2 pulses')
  })

  it('treats the deleted subtree as ONE holder set — spares a pulse shared with a live outside context, stamps one shared parent↔child', async () => {
    if (!neo4jAvailable) return
    const parent = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_share_p',
    })
    const child = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_share_c',
      pulseCount: 1,
    })
    const outside = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_share_out',
    })
    await linkSub(parent.ctxId, child.ctxId)
    const sharedOutsideId = `${runId}_pulse_casc_share_out`
    const sharedInsideId = `${runId}_pulse_casc_share_in`
    await runCypher(
      `
      MATCH (p:FieldContext {id: $parentId})
      MATCH (c:FieldContext {id: $childId})
      MATCH (o:FieldContext {id: $outsideId})
      // Shared child ↔ live context OUTSIDE the subtree: must survive.
      CREATE (po:FieldPulse:GoalPulse {id: $sharedOutsideId, title: 'Shared outside', content: 'out', createdAt: datetime()})
      CREATE (c)-[:HAS_PULSE]->(po)
      CREATE (o)-[:HAS_PULSE]->(po)
      // Shared parent ↔ child, both INSIDE the subtree: must be stamped once.
      CREATE (pi:FieldPulse:StoryPulse {id: $sharedInsideId, title: 'Shared inside', content: 'in', createdAt: datetime()})
      CREATE (p)-[:HAS_PULSE]->(pi)
      CREATE (c)-[:HAS_PULSE]->(pi)
      `,
      {
        parentId: parent.ctxId,
        childId: child.ctxId,
        outsideId: outside.ctxId,
        sharedOutsideId,
        sharedInsideId,
      }
    )

    const result = await softDeleteFieldContext(
      { driver },
      { currentUserId: ids.meOwner, contextId: parent.ctxId }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.deletedSubContextCount).toBe(1)
    // Child's exclusive pulse + the parent↔child shared pulse (counted ONCE);
    // the pulse shared with the live outside context is excluded.
    expect(result.deletedPulseCount).toBe(2)

    await expect(cascadePulseStamped(sharedInsideId)).resolves.toBe(true)
    await expect(cascadePulseStamped(child.pulseIds[0])).resolves.toBe(true)
    await expect(cascadePulseStamped(sharedOutsideId)).resolves.toBe(false)
    // The spared pulse stays attached to its live holder.
    const attached = await runCypher(
      `MATCH (:FieldContext {id: $ctxId})-[r:HAS_PULSE]->(:FieldPulse {id: $pulseId}) RETURN count(r) AS c`,
      { ctxId: outside.ctxId, pulseId: sharedOutsideId }
    )
    expect(attached.records[0].get('c').toNumber()).toBe(1)
  })

  it('deleting only the child leaves its parent live — and the overlay edge survives until purge', async () => {
    if (!neo4jAvailable) return
    const parent = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_childonly_p',
      pulseCount: 1,
    })
    const child = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_childonly_c',
    })
    await linkSub(parent.ctxId, child.ctxId)

    const result = await softDeleteFieldContext(
      { driver },
      { currentUserId: ids.meOwner, contextId: child.ctxId }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.deletedSubContextCount).toBe(0)

    // Child is hidden…
    await expect(ctxStamped(child.ctxId)).resolves.toBe(true)
    await expect(contextEdgeCounts(child.ctxId)).resolves.toEqual({
      hasContext: 0,
      hasDeleted: 1,
    })
    // …the parent (and its pulse) stay fully live…
    await expect(ctxStamped(parent.ctxId)).resolves.toBe(false)
    await expect(contextEdgeCounts(parent.ctxId)).resolves.toEqual({
      hasContext: 1,
      hasDeleted: 0,
    })
    await expect(cascadePulseStamped(parent.pulseIds[0])).resolves.toBe(false)
    // …and the HAS_SUBCONTEXT overlay edge survives soft delete (kb/04 —
    // it drops only at purge via DETACH DELETE).
    const overlay = await runCypher(
      `MATCH (:FieldContext {id: $parentId})-[r:HAS_SUBCONTEXT]->(:FieldContext {id: $childId}) RETURN count(r) AS c`,
      { parentId: parent.ctxId, childId: child.ctxId }
    )
    expect(overlay.records[0].get('c').toNumber()).toBe(1)
  })

  it('skips descendants that are already soft-deleted — no double count', async () => {
    if (!neo4jAvailable) return
    const parent = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_skip_p',
    })
    const child = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_skip_c',
    })
    const grandchild = await seedContext({
      spaceId: ids.meSpace,
      key: 'casc_skip_g',
    })
    await linkSub(parent.ctxId, child.ctxId)
    await linkSub(child.ctxId, grandchild.ctxId)

    // First delete the child — its own cascade takes the grandchild with it.
    const first = await softDeleteFieldContext(
      { driver },
      { currentUserId: ids.meOwner, contextId: child.ctxId }
    )
    expect(first.ok).toBe(true)
    if (!first.ok) throw new Error('unreachable')
    expect(first.deletedSubContextCount).toBe(1)

    // Deleting the parent now finds no LIVE descendants: count 0, and the
    // already-deleted pair is not re-processed.
    const second = await softDeleteFieldContext(
      { driver },
      { currentUserId: ids.meOwner, contextId: parent.ctxId }
    )
    expect(second.ok).toBe(true)
    if (!second.ok) throw new Error('unreachable')
    expect(second.deletedSubContextCount).toBe(0)
    expect(second.deletedPulseCount).toBe(0)

    for (const ctxId of [parent.ctxId, child.ctxId, grandchild.ctxId]) {
      await expect(ctxStamped(ctxId)).resolves.toBe(true)
      // No duplicate HAS_DELETED_CONTEXT edges from re-processing.
      await expect(contextEdgeCounts(ctxId)).resolves.toEqual({
        hasContext: 0,
        hasDeleted: 1,
      })
    }
  })
})

describe('purgeDeletedFieldContexts (GOAL-319)', () => {
  it('purges the full cascade under an expired soft-deleted context — and deletes its Document blob', async () => {
    if (!neo4jAvailable) return
    const ctxId = `${runId}_ctx_cascade`
    const liveCtxId = `${runId}_ctx_cascade_live`
    const p1 = `${runId}_pulse_cascade_0`
    const p2 = `${runId}_pulse_cascade_1`
    const chunkId = `${runId}_chunk_cascade`
    const linkId = `${runId}_link_cascade`
    const sugId = `${runId}_sug_cascade`
    const weaveId = `${runId}_weave_cascade`
    const docId = `${runId}_doc_cascade`
    const orgSoloId = `${runId}_org_solo`
    const orgSharedId = `${runId}_org_shared`
    const blobKey = `${runId}_blob_cascade`

    const blobStore = createMemoryBlobStore()
    await blobStore.put({
      key: blobKey,
      contentType: 'text/plain',
      buffer: Buffer.from('cascade blob body'),
    })

    await runCypher(
      `
      MATCH (s:Space {id: $spaceId})
      CREATE (c:FieldContext {id: $ctxId, title: 'G319 Cascade Field', createdAt: datetime(), deletedAt: datetime() - duration({days: 400})})
      CREATE (s)-[:HAS_DELETED_CONTEXT]->(c)
      CREATE (live:FieldContext {id: $liveCtxId, title: 'G319 Cascade Neighbor', createdAt: datetime()})
      CREATE (s)-[:HAS_CONTEXT]->(live)
      CREATE (pa:FieldPulse:GoalPulse {id: $p1, title: 'Cascade pulse A', content: 'a', createdAt: datetime(), deletedAt: datetime() - duration({days: 400})})
      CREATE (c)-[:HAS_PULSE]->(pa)
      CREATE (pb:FieldPulse:StoryPulse {id: $p2, title: 'Cascade pulse B', content: 'b', createdAt: datetime(), deletedAt: datetime() - duration({days: 400})})
      CREATE (c)-[:HAS_PULSE]->(pb)
      CREATE (chunk:ConversationChunk {id: $chunkId, text: 'chunk body', createdAt: datetime()})
      CREATE (pa)-[:HAS_CHUNK]->(chunk)
      CREATE (link:ResonanceLink {id: $linkId, label: 'G319 link', status: 'confirmed', createdAt: datetime()})
      CREATE (c)-[:HAS_RESONANCE]->(link)
      CREATE (link)-[:SOURCE]->(pa)
      CREATE (link)-[:TARGET]->(pb)
      CREATE (sug:ResonanceSuggestion {id: $sugId, label: 'G319 sug', status: 'pending', createdAt: datetime()})
      CREATE (c)-[:HAS_SUGGESTION]->(sug)
      CREATE (s)-[:HAS_SUGGESTION]->(sug)
      CREATE (sug)-[:SOURCE]->(pa)
      CREATE (sug)-[:TARGET]->(pb)
      CREATE (weave:PromiseWeave {id: $weaveId, title: 'G319 weave', createdAt: datetime()})
      CREATE (c)-[:HAS_WEAVE]->(weave)
      CREATE (doc:Document {id: $docId, filename: 'cascade.txt', blobKey: $blobKey, createdAt: datetime()})
      CREATE (c)-[:HAS_DOCUMENT]->(doc)
      CREATE (orgSolo:Organization {id: $orgSoloId, name: 'G319 Solo Org', createdAt: datetime()})
      CREATE (c)-[:HAS_ORGANIZATION]->(orgSolo)
      CREATE (orgShared:Organization {id: $orgSharedId, name: 'G319 Shared Org', createdAt: datetime()})
      CREATE (c)-[:HAS_ORGANIZATION]->(orgShared)
      CREATE (live)-[:HAS_ORGANIZATION]->(orgShared)
      `,
      {
        spaceId: ids.meSpace,
        ctxId,
        liveCtxId,
        p1,
        p2,
        chunkId,
        linkId,
        sugId,
        weaveId,
        docId,
        orgSoloId,
        orgSharedId,
        blobKey,
      }
    )

    const result = await purgeDeletedFieldContexts(
      { driver, blobStore },
      { retentionDays: 365, maxContexts: 10 }
    )

    const entry = result.purgedContexts.find((p) => p.contextId === ctxId)
    expect(entry).toBeDefined()
    if (!entry) throw new Error('unreachable')
    expect(entry).toMatchObject({
      title: 'G319 Cascade Field',
      pulseCount: 2,
      chunkCount: 1,
      linkCount: 1,
      suggestionCount: 1,
      weaveCount: 1,
      documentCount: 1,
      organizationCount: 1,
    })
    expect(result.blobFailures).toBe(0)

    // Everything nested under the context is hard-deleted…
    await expect(
      countByIds([ctxId, p1, p2, chunkId, linkId, sugId, weaveId, docId, orgSoloId])
    ).resolves.toBe(0)
    // …the live neighbor context and the dual-context org survive…
    await expect(countByIds([liveCtxId, orgSharedId])).resolves.toBe(2)
    // …and the Document blob was removed from the store.
    await expect(blobStore.get(blobKey)).resolves.toBeNull()
  })

  it('respects the retention window — a recently soft-deleted context is NOT purged', async () => {
    if (!neo4jAvailable) return
    const recentCtxId = `${runId}_ctx_recent`
    await runCypher(
      `
      MATCH (s:Space {id: $spaceId})
      CREATE (c:FieldContext {id: $recentCtxId, title: 'G319 Recent Delete', createdAt: datetime(), deletedAt: datetime() - duration({days: 1})})
      CREATE (s)-[:HAS_DELETED_CONTEXT]->(c)
      `,
      { spaceId: ids.meSpace, recentCtxId }
    )

    const result = await purgeDeletedFieldContexts(
      { driver, blobStore: createMemoryBlobStore() },
      { retentionDays: 90, maxContexts: 10 }
    )

    expect(result.purgedContexts.map((p) => p.contextId)).not.toContain(
      recentCtxId
    )
    const rows = await runCypher(
      `MATCH (c:FieldContext {id: $recentCtxId}) RETURN c.deletedAt IS NOT NULL AS stillStamped`,
      { recentCtxId }
    )
    expect(rows.records).toHaveLength(1)
    expect(rows.records[0].get('stillStamped')).toBe(true)
  })

  it('never purges a live context (no deletedAt), even when the window catches everything soft-deleted', async () => {
    if (!neo4jAvailable) return
    const live = await seedContext({
      spaceId: ids.meSpace,
      key: 'live_survivor',
      pulseCount: 1,
    })
    // Bait context proves the purge actually ran and found expired work.
    const baitCtxId = `${runId}_ctx_bait`
    await runCypher(
      `
      MATCH (s:Space {id: $spaceId})
      CREATE (c:FieldContext {id: $baitCtxId, title: 'G319 Bait', createdAt: datetime(), deletedAt: datetime() - duration({days: 400})})
      CREATE (s)-[:HAS_DELETED_CONTEXT]->(c)
      `,
      { spaceId: ids.meSpace, baitCtxId }
    )

    const result = await purgeDeletedFieldContexts(
      { driver, blobStore: createMemoryBlobStore() },
      { retentionDays: 365, maxContexts: 10 }
    )

    const purgedIds = result.purgedContexts.map((p) => p.contextId)
    expect(purgedIds).toContain(baitCtxId)
    expect(purgedIds).not.toContain(live.ctxId)
    await expect(countByIds([live.ctxId, ...live.pulseIds])).resolves.toBe(2)
    await expect(countByIds([baitCtxId])).resolves.toBe(0)
  })

  it('deletes a cross-context ResonanceLink anchored only on a LIVE context when its SOURCE pulse is purged — the live pulse survives', async () => {
    if (!neo4jAvailable) return
    const deadCtxId = `${runId}_ctx_xlink_dead`
    const liveCtxId = `${runId}_ctx_xlink_live`
    const deadPulseId = `${runId}_pulse_xlink_dead`
    const livePulseId = `${runId}_pulse_xlink_live`
    const xlinkId = `${runId}_link_xlink`

    await runCypher(
      `
      MATCH (s:Space {id: $spaceId})
      CREATE (dead:FieldContext {id: $deadCtxId, title: 'G319 Xlink Dead', createdAt: datetime(), deletedAt: datetime() - duration({days: 400})})
      CREATE (s)-[:HAS_DELETED_CONTEXT]->(dead)
      CREATE (live:FieldContext {id: $liveCtxId, title: 'G319 Xlink Live', createdAt: datetime()})
      CREATE (s)-[:HAS_CONTEXT]->(live)
      CREATE (pa:FieldPulse:GoalPulse {id: $deadPulseId, title: 'Dead-side pulse', content: 'a', createdAt: datetime(), deletedAt: datetime() - duration({days: 400})})
      CREATE (dead)-[:HAS_PULSE]->(pa)
      CREATE (pb:FieldPulse:StoryPulse {id: $livePulseId, title: 'Live-side pulse', content: 'b', createdAt: datetime()})
      CREATE (live)-[:HAS_PULSE]->(pb)
      CREATE (x:ResonanceLink {id: $xlinkId, label: 'G319 cross link', status: 'confirmed', createdAt: datetime()})
      // Anchored on the LIVE context ONLY — must still be caught via SOURCE.
      CREATE (live)-[:HAS_RESONANCE]->(x)
      CREATE (x)-[:SOURCE]->(pa)
      CREATE (x)-[:TARGET]->(pb)
      `,
      { spaceId: ids.meSpace, deadCtxId, liveCtxId, deadPulseId, livePulseId, xlinkId }
    )

    const result = await purgeDeletedFieldContexts(
      { driver, blobStore: createMemoryBlobStore() },
      { retentionDays: 365, maxContexts: 10 }
    )

    const entry = result.purgedContexts.find((p) => p.contextId === deadCtxId)
    expect(entry).toBeDefined()
    if (!entry) throw new Error('unreachable')
    expect(entry.pulseCount).toBe(1)
    // The cross-context link is counted + deleted via the pulse-touching rule.
    expect(entry.linkCount).toBe(1)

    // No dangling SOURCE: link and dead-side content are gone…
    await expect(countByIds([deadCtxId, deadPulseId, xlinkId])).resolves.toBe(0)
    // …but the live context and its own pulse are untouched.
    await expect(countByIds([liveCtxId, livePulseId])).resolves.toBe(2)
  })
})

describe('shared-pulse exclusive-holder guards (GOAL-319 regression)', () => {
  // linkPulseToContext can MERGE a second HAS_PULSE edge, so a pulse may be
  // held by several contexts at once. Soft delete must only stamp a pulse
  // whose sole LIVE holder is the deleted context; purge must only hard-
  // delete a pulse with NO other holding context (live or soft-deleted) —
  // the pulse goes down with its LAST holder, same rule as Organizations.

  /** Count HAS_PULSE edges from the given context to the given pulse. */
  async function holdsPulse(ctxId: string, pulseId: string): Promise<number> {
    const res = await runCypher(
      `MATCH (:FieldContext {id: $ctxId})-[r:HAS_PULSE]->(:FieldPulse {id: $pulseId}) RETURN count(r) AS c`,
      { ctxId, pulseId }
    )
    return res.records[0].get('c').toNumber()
  }

  async function pulseStamped(pulseId: string): Promise<boolean> {
    const res = await runCypher(
      `MATCH (p:FieldPulse {id: $pulseId}) RETURN p.deletedAt IS NOT NULL AS stamped`,
      { pulseId }
    )
    expect(res.records).toHaveLength(1)
    return res.records[0].get('stamped') as boolean
  }

  it('soft delete leaves a pulse shared with a LIVE context unstamped, uncounted, and attached', async () => {
    if (!neo4jAvailable) return
    // C holds 2 exclusive pulses + 1 pulse shared with live context L.
    const c = await seedContext({
      spaceId: ids.meSpace,
      key: 'share_c',
      pulseCount: 2,
    })
    const l = await seedContext({ spaceId: ids.meSpace, key: 'share_l' })
    const sharedPulseId = `${runId}_pulse_share_cl`
    await runCypher(
      `
      MATCH (c:FieldContext {id: $cId}), (l:FieldContext {id: $lId})
      CREATE (p:FieldPulse:GoalPulse {id: $sharedPulseId, title: 'Shared pulse', content: 'shared', createdAt: datetime()})
      CREATE (c)-[:HAS_PULSE]->(p)
      CREATE (l)-[:HAS_PULSE]->(p)
      `,
      { cId: c.ctxId, lId: l.ctxId, sharedPulseId }
    )

    const result = await softDeleteFieldContext(
      { driver },
      { currentUserId: ids.meOwner, contextId: c.ctxId }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    // The shared pulse is excluded from the count — only the 2 exclusives.
    expect(result.deletedPulseCount).toBe(2)

    // Shared pulse: no deletedAt, still attached to the live context.
    await expect(pulseStamped(sharedPulseId)).resolves.toBe(false)
    await expect(holdsPulse(l.ctxId, sharedPulseId)).resolves.toBe(1)
    // Exclusive pulses are stamped exactly as before.
    for (const pulseId of c.pulseIds) {
      await expect(pulseStamped(pulseId)).resolves.toBe(true)
    }
  })

  it('purge spares a pulse (and its chunk) shared with a LIVE context — it stays attached and unstamped', async () => {
    if (!neo4jAvailable) return
    const aCtxId = `${runId}_ctx_purge_share_a`
    const lCtxId = `${runId}_ctx_purge_share_l`
    const exclusivePulseId = `${runId}_pulse_purge_share_excl`
    const sharedPulseId = `${runId}_pulse_purge_share_al`
    const sharedChunkId = `${runId}_chunk_purge_share`

    await runCypher(
      `
      MATCH (s:Space {id: $spaceId})
      CREATE (a:FieldContext {id: $aCtxId, title: 'G319 Share Purge A', createdAt: datetime(), deletedAt: datetime() - duration({days: 400})})
      CREATE (s)-[:HAS_DELETED_CONTEXT]->(a)
      CREATE (l:FieldContext {id: $lCtxId, title: 'G319 Share Purge L', createdAt: datetime()})
      CREATE (s)-[:HAS_CONTEXT]->(l)
      CREATE (excl:FieldPulse:GoalPulse {id: $exclusivePulseId, title: 'Exclusive pulse', content: 'a', createdAt: datetime(), deletedAt: datetime() - duration({days: 400})})
      CREATE (a)-[:HAS_PULSE]->(excl)
      // Shared pulse: unstamped (the guarded soft delete would have spared
      // it because L was live), held by both A and L, carrying a chunk.
      CREATE (shared:FieldPulse:StoryPulse {id: $sharedPulseId, title: 'Shared pulse', content: 'b', createdAt: datetime()})
      CREATE (a)-[:HAS_PULSE]->(shared)
      CREATE (l)-[:HAS_PULSE]->(shared)
      CREATE (chunk:ConversationChunk {id: $sharedChunkId, text: 'shared chunk', createdAt: datetime()})
      CREATE (shared)-[:HAS_CHUNK]->(chunk)
      `,
      { spaceId: ids.meSpace, aCtxId, lCtxId, exclusivePulseId, sharedPulseId, sharedChunkId }
    )

    const result = await purgeDeletedFieldContexts(
      { driver, blobStore: createMemoryBlobStore() },
      { retentionDays: 365, maxContexts: 10 }
    )

    const entry = result.purgedContexts.find((p) => p.contextId === aCtxId)
    expect(entry).toBeDefined()
    if (!entry) throw new Error('unreachable')
    // Only the exclusive pulse purges with A; the shared pulse (and its
    // chunk) are not counted.
    expect(entry.pulseCount).toBe(1)
    expect(entry.chunkCount).toBe(0)

    await expect(countByIds([aCtxId, exclusivePulseId])).resolves.toBe(0)
    await expect(countByIds([sharedPulseId, sharedChunkId])).resolves.toBe(2)
    await expect(holdsPulse(lCtxId, sharedPulseId)).resolves.toBe(1)
    await expect(pulseStamped(sharedPulseId)).resolves.toBe(false)
  })

  it('a pulse shared between two soft-deleted contexts purges only with its LAST holder', async () => {
    if (!neo4jAvailable) return
    const aCtxId = `${runId}_ctx_twodel_a`
    const bCtxId = `${runId}_ctx_twodel_b`
    const sharedPulseId = `${runId}_pulse_twodel_ab`

    await runCypher(
      `
      MATCH (s:Space {id: $spaceId})
      // A is expired (due now); B is soft-deleted but inside the window.
      CREATE (a:FieldContext {id: $aCtxId, title: 'G319 TwoDel A', createdAt: datetime(), deletedAt: datetime() - duration({days: 400})})
      CREATE (s)-[:HAS_DELETED_CONTEXT]->(a)
      CREATE (b:FieldContext {id: $bCtxId, title: 'G319 TwoDel B', createdAt: datetime(), deletedAt: datetime() - duration({days: 10})})
      CREATE (s)-[:HAS_DELETED_CONTEXT]->(b)
      // The pulse was stamped when its last live holder was soft-deleted.
      CREATE (p:FieldPulse:GoalPulse {id: $sharedPulseId, title: 'Twice-deleted pulse', content: 'x', createdAt: datetime(), deletedAt: datetime() - duration({days: 10})})
      CREATE (a)-[:HAS_PULSE]->(p)
      CREATE (b)-[:HAS_PULSE]->(p)
      `,
      { spaceId: ids.meSpace, aCtxId, bCtxId, sharedPulseId }
    )

    // First purge: A is due, B is not — the pulse must survive with B.
    const first = await purgeDeletedFieldContexts(
      { driver, blobStore: createMemoryBlobStore() },
      { retentionDays: 365, maxContexts: 10 }
    )
    const firstEntry = first.purgedContexts.find((p) => p.contextId === aCtxId)
    expect(firstEntry).toBeDefined()
    if (!firstEntry) throw new Error('unreachable')
    expect(firstEntry.pulseCount).toBe(0)
    expect(first.purgedContexts.map((p) => p.contextId)).not.toContain(bCtxId)

    await expect(countByIds([aCtxId])).resolves.toBe(0)
    await expect(countByIds([sharedPulseId])).resolves.toBe(1)
    await expect(holdsPulse(bCtxId, sharedPulseId)).resolves.toBe(1)
    // Still stamped — it is soft-deleted state, awaiting B's purge.
    await expect(pulseStamped(sharedPulseId)).resolves.toBe(true)

    // B ages past the window: now the pulse goes down with its last holder.
    await runCypher(
      `MATCH (b:FieldContext {id: $bCtxId}) SET b.deletedAt = datetime() - duration({days: 400})`,
      { bCtxId }
    )
    const second = await purgeDeletedFieldContexts(
      { driver, blobStore: createMemoryBlobStore() },
      { retentionDays: 365, maxContexts: 10 }
    )
    const secondEntry = second.purgedContexts.find(
      (p) => p.contextId === bCtxId
    )
    expect(secondEntry).toBeDefined()
    if (!secondEntry) throw new Error('unreachable')
    expect(secondEntry.pulseCount).toBe(1)
    await expect(countByIds([bCtxId, sharedPulseId])).resolves.toBe(0)
  })

  it('soft delete stamps a pulse whose only co-holder is itself already soft-deleted', async () => {
    if (!neo4jAvailable) return
    // C is live and being deleted; D already carries deletedAt. A soft-
    // deleted co-holder must NOT protect the pulse — it is hidden either
    // way and must join the purge queue.
    const c = await seedContext({ spaceId: ids.meSpace, key: 'codel_c' })
    const dCtxId = `${runId}_ctx_codel_d`
    const sharedPulseId = `${runId}_pulse_codel_cd`
    await runCypher(
      `
      MATCH (s:Space {id: $spaceId})
      MATCH (c:FieldContext {id: $cId})
      CREATE (d:FieldContext {id: $dCtxId, title: 'G319 CoDel D', createdAt: datetime(), deletedAt: datetime() - duration({days: 1})})
      CREATE (s)-[:HAS_DELETED_CONTEXT]->(d)
      // Unstamped: when D was soft-deleted, C was live and protected it.
      CREATE (p:FieldPulse:GoalPulse {id: $sharedPulseId, title: 'Co-deleted pulse', content: 'y', createdAt: datetime()})
      CREATE (c)-[:HAS_PULSE]->(p)
      CREATE (d)-[:HAS_PULSE]->(p)
      `,
      { spaceId: ids.meSpace, cId: c.ctxId, dCtxId, sharedPulseId }
    )

    const result = await softDeleteFieldContext(
      { driver },
      { currentUserId: ids.meOwner, contextId: c.ctxId }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.deletedPulseCount).toBe(1)
    await expect(pulseStamped(sharedPulseId)).resolves.toBe(true)
  })
})
