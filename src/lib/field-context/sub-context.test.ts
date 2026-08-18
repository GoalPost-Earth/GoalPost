import { randomUUID } from 'node:crypto'
import type { Driver, QueryResult } from 'neo4j-driver'
import { driver } from '@/lib/neo4j/driver'
import {
  createSubFieldContext,
  moveFieldContext,
  MAX_SUBCONTEXT_DEPTH,
} from './sub-context'

/**
 * GOAL-295 — nested FieldContext orchestrator tests.
 *
 * Two layers:
 *
 * 1. Driver-free validation tests — always assert, no database. They pass a
 *    stub driver whose `session()` throws, PROVING the early returns fire
 *    before any session is opened.
 * 2. Integration tests against the real dev Neo4j (same convention as
 *    field-context-lifecycle.test.ts): env comes from
 *    `DOTENV_CONFIG_PATH=./.env.local` via `npm test`; when Neo4j is
 *    unreachable every DB-backed case degrades to a no-op pass.
 *
 * Every seeded node id starts with the run-unique `g295test_<runId>` prefix
 * so afterAll can sweep the whole fixture with one STARTS WITH match.
 * Children created by `createSubFieldContext` itself get server-generated
 * `context_<uuid>` ids OUTSIDE that prefix, so every success result's
 * contextId is collected into `createdContextIds` and swept explicitly.
 * Logs are swept via a metadata CONTAINS match: create-logs carry the
 * (prefixed) parentContextId, move-logs the (prefixed) contextId.
 */

const runId = `g295test_${randomUUID().slice(0, 8)}`

let neo4jAvailable = false

/** Ids of contexts created by createSubFieldContext (not run-prefixed). */
const createdContextIds: string[] = []

const ids = {
  meOwner: `${runId}_me_owner`,
  wsOwner: `${runId}_ws_owner`,
  member: `${runId}_member`,
  guest: `${runId}_guest`,
  outsider: `${runId}_outsider`,
  meSpace: `${runId}_me_space`,
  weSpace: `${runId}_we_space`,
  smMember: `${runId}_sm_member`,
  smGuest: `${runId}_sm_guest`,
}

/**
 * Stub driver for the validation-only tests: any attempt to open a session
 * fails the test, proving the typed failure was returned before the driver
 * was touched.
 */
const untouchableDriver = {
  session: () => {
    throw new Error(
      'driver must not be touched — validation must return before any session opens'
    )
  },
} as unknown as Driver

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

/** Seed a live root FieldContext (HAS_CONTEXT) in the given Space. */
async function seedContext(opts: {
  spaceId: string
  key: string
}): Promise<{ ctxId: string; title: string }> {
  const ctxId = `${runId}_ctx_${opts.key}`
  const title = `G295 Field ${opts.key}`
  await runCypher(
    `
    MATCH (s:Space {id: $spaceId})
    CREATE (c:FieldContext {id: $ctxId, title: $title, createdAt: datetime()})
    CREATE (s)-[:HAS_CONTEXT]->(c)
    `,
    { spaceId: opts.spaceId, ctxId, title }
  )
  return { ctxId, title }
}

/**
 * Seed a HAS_SUBCONTEXT chain of `hops + 1` contexts in the given Space
 * (index 0 is the root at depth 0; index `hops` is the deepest). Every
 * member keeps its own Space HAS_CONTEXT edge, per ADR-017.
 */
async function seedChain(
  spaceId: string,
  key: string,
  hops: number
): Promise<string[]> {
  const ctxIds = Array.from(
    { length: hops + 1 },
    (_, i) => `${runId}_ctx_${key}_${i}`
  )
  await runCypher(
    `
    MATCH (s:Space {id: $spaceId})
    UNWIND range(0, size($ctxIds) - 1) AS i
    CREATE (c:FieldContext {id: $ctxIds[i], title: 'G295 ' + $key + ' depth ' + toString(i), createdAt: datetime()})
    CREATE (s)-[:HAS_CONTEXT]->(c)
    `,
    { spaceId, ctxIds }
  )
  await runCypher(
    `
    UNWIND range(0, size($ctxIds) - 2) AS i
    MATCH (p:FieldContext {id: $ctxIds[i]})
    MATCH (c:FieldContext {id: $ctxIds[i + 1]})
    CREATE (p)-[:HAS_SUBCONTEXT]->(c)
    `,
    { ctxIds }
  )
  return ctxIds
}

/** Current HAS_SUBCONTEXT parent of a context, or null when top-level. */
async function parentOf(ctxId: string): Promise<string | null> {
  const res = await runCypher(
    `
    MATCH (c:FieldContext {id: $ctxId})
    OPTIONAL MATCH (p:FieldContext)-[:HAS_SUBCONTEXT]->(c)
    RETURN p.id AS parentId
    `,
    { ctxId }
  )
  expect(res.records).toHaveLength(1)
  return (res.records[0].get('parentId') as string | null) ?? null
}

/** Count HAS_SUBCONTEXT edges out of the given parent. */
async function subContextCount(parentId: string): Promise<number> {
  const res = await runCypher(
    `MATCH (:FieldContext {id: $parentId})-[r:HAS_SUBCONTEXT]->(:FieldContext) RETURN count(r) AS c`,
    { parentId }
  )
  return res.records[0].get('c').toNumber()
}

/** Count activity Logs whose metadata mentions the given id fragment. */
async function logCountMentioning(fragment: string): Promise<number> {
  const res = await runCypher(
    `MATCH (log:Log) WHERE log.metadata CONTAINS $fragment RETURN count(log) AS c`,
    { fragment }
  )
  return res.records[0].get('c').toNumber()
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
    console.warn(
      'Neo4j unavailable — GOAL-295 sub-context DB cases degrade to no-op'
    )
    return
  }

  await runCypher(
    `
    CREATE (mo:Person:User {id: $meOwnerId, firstName: 'Mia', lastName: 'MeOwner', name: 'Mia MeOwner', createdAt: datetime()})
    CREATE (wo:Person:User {id: $wsOwnerId, firstName: 'Wes', lastName: 'WsOwner', name: 'Wes WsOwner', createdAt: datetime()})
    CREATE (me:Person:User {id: $memberId, firstName: 'Mel', lastName: 'Member', name: 'Mel Member', createdAt: datetime()})
    CREATE (gu:Person:User {id: $guestId, firstName: 'Gus', lastName: 'Guest', name: 'Gus Guest', createdAt: datetime()})
    CREATE (ou:Person:User {id: $outsiderId, firstName: 'Olly', lastName: 'Outsider', name: 'Olly Outsider', createdAt: datetime()})
    CREATE (ms:Space:MeSpace {id: $meSpaceId, name: 'G295 Test MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
    CREATE (mo)-[:OWNS]->(ms)
    CREATE (ws:Space:WeSpace {id: $weSpaceId, name: 'G295 Test WeSpace', visibility: 'SHARED', createdAt: datetime()})
    CREATE (wo)-[:OWNS]->(ws)
    CREATE (ws)-[:HAS_MEMBER]->(:SpaceMembership {id: $smMemberId, role: 'MEMBER', addedAt: datetime()})-[:IS_MEMBER]->(me)
    CREATE (ws)-[:HAS_MEMBER]->(:SpaceMembership {id: $smGuestId, role: 'GUEST', addedAt: datetime()})-[:IS_MEMBER]->(gu)
    `,
    {
      meOwnerId: ids.meOwner,
      wsOwnerId: ids.wsOwner,
      memberId: ids.member,
      guestId: ids.guest,
      outsiderId: ids.outsider,
      meSpaceId: ids.meSpace,
      weSpaceId: ids.weSpace,
      smMemberId: ids.smMember,
      smGuestId: ids.smGuest,
    }
  )
}, 120_000)

afterAll(async () => {
  if (neo4jAvailable) {
    const session = driver.session()
    try {
      // Logs are not id-namespaced, but their metadata JSON always carries a
      // run-prefixed context id (parentContextId for creates, contextId for
      // moves).
      await session.run(
        `MATCH (log:Log) WHERE log.metadata CONTAINS $prefix DETACH DELETE log`,
        { prefix: runId }
      )
      // Children minted by createSubFieldContext carry server-generated
      // `context_<uuid>` ids outside the run prefix — sweep them by the
      // collected list.
      if (createdContextIds.length > 0) {
        await session.run(
          `MATCH (c:FieldContext) WHERE c.id IN $createdContextIds DETACH DELETE c`,
          { createdContextIds }
        )
      }
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

/** Narrow a result to failure and return it, failing the test on success. */
function expectFailure<T extends { ok: boolean }>(
  result: T
): Exclude<T, { ok: true }> {
  expect(result.ok).toBe(false)
  if (result.ok) throw new Error('unreachable')
  return result as Exclude<T, { ok: true }>
}

describe('createSubFieldContext — input validation (no database required)', () => {
  const validInput = {
    currentUserId: 'user_validation_only',
    parentContextId: 'context_validation_only',
    title: 'A valid title',
  }

  it('rejects an empty title with invalid_input before touching the driver', async () => {
    const result = await createSubFieldContext(
      { driver: untouchableDriver },
      { ...validInput, title: '' }
    )
    const failure = expectFailure(result)
    expect(failure.reason).toBe('invalid_input')
  })

  it('rejects a whitespace-only title with invalid_input before touching the driver', async () => {
    const result = await createSubFieldContext(
      { driver: untouchableDriver },
      { ...validInput, title: '   \t ' }
    )
    const failure = expectFailure(result)
    expect(failure.reason).toBe('invalid_input')
  })

  it('rejects an empty parentContextId with invalid_input before touching the driver', async () => {
    const result = await createSubFieldContext(
      { driver: untouchableDriver },
      { ...validInput, parentContextId: '' }
    )
    const failure = expectFailure(result)
    expect(failure.reason).toBe('invalid_input')
  })

  it('rejects a whitespace-only parentContextId with invalid_input before touching the driver', async () => {
    const result = await createSubFieldContext(
      { driver: untouchableDriver },
      { ...validInput, parentContextId: '  ' }
    )
    const failure = expectFailure(result)
    expect(failure.reason).toBe('invalid_input')
  })

  it('rejects an empty currentUserId as forbidden before touching the driver', async () => {
    const result = await createSubFieldContext(
      { driver: untouchableDriver },
      { ...validInput, currentUserId: '' }
    )
    const failure = expectFailure(result)
    expect(failure.reason).toBe('forbidden')
  })

  it('rejects a whitespace-only currentUserId as forbidden before touching the driver', async () => {
    const result = await createSubFieldContext(
      { driver: untouchableDriver },
      { ...validInput, currentUserId: ' \n ' }
    )
    const failure = expectFailure(result)
    expect(failure.reason).toBe('forbidden')
  })
})

describe('moveFieldContext — input validation (no database required)', () => {
  it('rejects moving a context under itself as a cycle before touching the driver', async () => {
    const result = await moveFieldContext(
      { driver: untouchableDriver },
      {
        currentUserId: 'user_validation_only',
        contextId: 'context_self_move',
        newParentContextId: 'context_self_move',
      }
    )
    const failure = expectFailure(result)
    expect(failure.reason).toBe('cycle')
  })

  it('rejects an empty contextId with invalid_input before touching the driver', async () => {
    const result = await moveFieldContext(
      { driver: untouchableDriver },
      {
        currentUserId: 'user_validation_only',
        contextId: '   ',
        newParentContextId: 'context_target',
      }
    )
    const failure = expectFailure(result)
    expect(failure.reason).toBe('invalid_input')
  })

  it('rejects an empty currentUserId as forbidden before touching the driver', async () => {
    const result = await moveFieldContext(
      { driver: untouchableDriver },
      {
        currentUserId: '',
        contextId: 'context_mover',
        newParentContextId: 'context_target',
      }
    )
    const failure = expectFailure(result)
    expect(failure.reason).toBe('forbidden')
  })
})

describe('createSubFieldContext (GOAL-295)', () => {
  describe('when the caller is the MeSpace owner', () => {
    it('creates the child with its own Space HAS_CONTEXT edge, the HAS_SUBCONTEXT overlay edge, CREATED_BY, and one Log', async () => {
      if (!neo4jAvailable) return
      const parent = await seedContext({
        spaceId: ids.meSpace,
        key: 'create_owner',
      })

      const result = await createSubFieldContext(
        { driver },
        {
          currentUserId: ids.meOwner,
          parentContextId: parent.ctxId,
          title: 'G295 Owner Child',
          emergentName: 'Emergent Owner Child',
        }
      )

      expect(result.ok).toBe(true)
      if (!result.ok) throw new Error('unreachable')
      createdContextIds.push(result.contextId)
      expect(result.title).toBe('G295 Owner Child')
      expect(result.parentContextId).toBe(parent.ctxId)
      expect(result.contextId).toMatch(/^context_/)

      // One query proving the whole shape: same-Space HAS_CONTEXT (the pure
      // overlay invariant from ADR-017), HAS_SUBCONTEXT from the parent, and
      // CREATED_BY the caller.
      const shape = await runCypher(
        `
        MATCH (s:Space {id: $spaceId})-[:HAS_CONTEXT]->(child:FieldContext {id: $childId})
        MATCH (:FieldContext {id: $parentId})-[:HAS_SUBCONTEXT]->(child)
        MATCH (child)-[:CREATED_BY]->(:Person {id: $userId})
        RETURN child.emergentName AS emergentName, child.deletedAt IS NULL AS live
        `,
        {
          spaceId: ids.meSpace,
          childId: result.contextId,
          parentId: parent.ctxId,
          userId: ids.meOwner,
        }
      )
      expect(shape.records).toHaveLength(1)
      expect(shape.records[0].get('emergentName')).toBe('Emergent Owner Child')
      expect(shape.records[0].get('live')).toBe(true)

      // Exactly one Log, CREATED_BY the caller, naming both fields.
      const logs = await runCypher(
        `
        MATCH (log:Log)-[:CREATED_BY]->(:Person {id: $userId})
        WHERE log.metadata CONTAINS $parentId
        RETURN log.description AS description
        `,
        { userId: ids.meOwner, parentId: parent.ctxId }
      )
      expect(logs.records).toHaveLength(1)
      const description = String(logs.records[0].get('description'))
      expect(description).toContain('G295 Owner Child')
      expect(description).toContain(parent.title)
    })
  })

  describe('when the caller is a WeSpace MEMBER (canEditContent)', () => {
    it('allows the create — same gate as owner and ADMIN', async () => {
      if (!neo4jAvailable) return
      const parent = await seedContext({
        spaceId: ids.weSpace,
        key: 'create_member',
      })

      const result = await createSubFieldContext(
        { driver },
        {
          currentUserId: ids.member,
          parentContextId: parent.ctxId,
          title: 'G295 Member Child',
        }
      )

      expect(result.ok).toBe(true)
      if (!result.ok) throw new Error('unreachable')
      createdContextIds.push(result.contextId)
      await expect(subContextCount(parent.ctxId)).resolves.toBe(1)
    })
  })

  describe('when the caller is a WeSpace GUEST (view-only)', () => {
    it('is forbidden and leaves the graph untouched', async () => {
      if (!neo4jAvailable) return
      const parent = await seedContext({
        spaceId: ids.weSpace,
        key: 'create_guest',
      })

      const result = await createSubFieldContext(
        { driver },
        {
          currentUserId: ids.guest,
          parentContextId: parent.ctxId,
          title: 'G295 Guest Child',
        }
      )

      const failure = expectFailure(result)
      expect(failure.reason).toBe('forbidden')
      await expect(subContextCount(parent.ctxId)).resolves.toBe(0)
      await expect(logCountMentioning(parent.ctxId)).resolves.toBe(0)
    })
  })

  describe('when the caller has no relationship to the Space', () => {
    it('is forbidden and leaves the graph untouched', async () => {
      if (!neo4jAvailable) return
      const parent = await seedContext({
        spaceId: ids.meSpace,
        key: 'create_outsider',
      })

      const result = await createSubFieldContext(
        { driver },
        {
          currentUserId: ids.outsider,
          parentContextId: parent.ctxId,
          title: 'G295 Outsider Child',
        }
      )

      const failure = expectFailure(result)
      expect(failure.reason).toBe('forbidden')
      await expect(subContextCount(parent.ctxId)).resolves.toBe(0)
      await expect(logCountMentioning(parent.ctxId)).resolves.toBe(0)
    })
  })

  describe('depth cap (MAX_SUBCONTEXT_DEPTH)', () => {
    it('rejects a create under a context already at the maximum depth, but allows one at the boundary', async () => {
      if (!neo4jAvailable) return
      // Chain of MAX + 1 contexts: index 0 is the root (depth 0), the last
      // sits at depth MAX_SUBCONTEXT_DEPTH — a child there would overflow.
      const chain = await seedChain(
        ids.meSpace,
        'create_depth',
        MAX_SUBCONTEXT_DEPTH
      )
      const deepest = chain[chain.length - 1]
      const atBoundary = chain[chain.length - 2]

      const overflow = await createSubFieldContext(
        { driver },
        {
          currentUserId: ids.meOwner,
          parentContextId: deepest,
          title: 'G295 Too Deep',
        }
      )
      const failure = expectFailure(overflow)
      expect(failure.reason).toBe('depth_exceeded')
      await expect(subContextCount(deepest)).resolves.toBe(0)

      // Boundary: a child of the depth-(MAX-1) context lands exactly at MAX.
      const boundary = await createSubFieldContext(
        { driver },
        {
          currentUserId: ids.meOwner,
          parentContextId: atBoundary,
          title: 'G295 At The Cap',
        }
      )
      expect(boundary.ok).toBe(true)
      if (!boundary.ok) throw new Error('unreachable')
      createdContextIds.push(boundary.contextId)
      // The boundary parent now holds the pre-seeded chain child + the new one.
      await expect(subContextCount(atBoundary)).resolves.toBe(2)
    })
  })

  describe('when the parent does not exist', () => {
    it('collapses into forbidden — existence is not leaked', async () => {
      if (!neo4jAvailable) return
      const result = await createSubFieldContext(
        { driver },
        {
          currentUserId: ids.meOwner,
          parentContextId: `${runId}_ctx_never_seeded`,
          title: 'G295 Orphan Child',
        }
      )
      const failure = expectFailure(result)
      expect(failure.reason).toBe('forbidden')
    })
  })
})

describe('moveFieldContext (GOAL-295)', () => {
  it('moves a root context under a sibling — creates the overlay edge and writes one Log', async () => {
    if (!neo4jAvailable) return
    const target = await seedContext({
      spaceId: ids.meSpace,
      key: 'move_target',
    })
    const mover = await seedContext({ spaceId: ids.meSpace, key: 'move_mover' })

    const result = await moveFieldContext(
      { driver },
      {
        currentUserId: ids.meOwner,
        contextId: mover.ctxId,
        newParentContextId: target.ctxId,
      }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.moved).toBe(true)
    expect(result.newParentContextId).toBe(target.ctxId)
    await expect(parentOf(mover.ctxId)).resolves.toBe(target.ctxId)

    const logs = await runCypher(
      `
      MATCH (log:Log)-[:CREATED_BY]->(:Person {id: $userId})
      WHERE log.metadata CONTAINS $ctxId
      RETURN log.description AS description
      `,
      { userId: ids.meOwner, ctxId: mover.ctxId }
    )
    expect(logs.records).toHaveLength(1)
    const description = String(logs.records[0].get('description'))
    expect(description).toContain(mover.title)
    expect(description).toContain(target.title)
  })

  it('moves a nested context to the top level (null parent) — removes the overlay edge', async () => {
    if (!neo4jAvailable) return
    const chain = await seedChain(ids.meSpace, 'move_to_top', 1)
    const [parentId, childId] = chain

    const result = await moveFieldContext(
      { driver },
      {
        currentUserId: ids.meOwner,
        contextId: childId,
        newParentContextId: null,
      }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.moved).toBe(true)
    expect(result.newParentContextId).toBeNull()
    await expect(parentOf(childId)).resolves.toBeNull()
    await expect(subContextCount(parentId)).resolves.toBe(0)

    const logs = await runCypher(
      `
      MATCH (log:Log) WHERE log.metadata CONTAINS $ctxId
      RETURN log.description AS description
      `,
      { ctxId: childId }
    )
    expect(logs.records).toHaveLength(1)
    expect(String(logs.records[0].get('description'))).toContain('top level')
  })

  it('rejects moving a context under its own descendant as a cycle', async () => {
    if (!neo4jAvailable) return
    const chain = await seedChain(ids.meSpace, 'move_cycle', 2)
    const [rootId, , grandchildId] = chain

    const result = await moveFieldContext(
      { driver },
      {
        currentUserId: ids.meOwner,
        contextId: rootId,
        newParentContextId: grandchildId,
      }
    )

    const failure = expectFailure(result)
    expect(failure.reason).toBe('cycle')
    // The hierarchy is untouched: the root still has no parent.
    await expect(parentOf(rootId)).resolves.toBeNull()
    await expect(logCountMentioning(rootId)).resolves.toBe(0)
  })

  it('rejects a target parent in a different Space as invalid_target', async () => {
    if (!neo4jAvailable) return
    const mover = await seedContext({
      spaceId: ids.weSpace,
      key: 'move_xspace',
    })
    const foreignTarget = await seedContext({
      spaceId: ids.meSpace,
      key: 'move_xspace_target',
    })

    const result = await moveFieldContext(
      { driver },
      {
        currentUserId: ids.wsOwner,
        contextId: mover.ctxId,
        newParentContextId: foreignTarget.ctxId,
      }
    )

    const failure = expectFailure(result)
    expect(failure.reason).toBe('invalid_target')
    await expect(parentOf(mover.ctxId)).resolves.toBeNull()
    await expect(logCountMentioning(mover.ctxId)).resolves.toBe(0)
  })

  it('treats a same-parent move as a no-op — ok with moved:false and NO new Log', async () => {
    if (!neo4jAvailable) return
    const chain = await seedChain(ids.meSpace, 'move_noop', 1)
    const [parentId, childId] = chain

    const nested = await moveFieldContext(
      { driver },
      {
        currentUserId: ids.meOwner,
        contextId: childId,
        newParentContextId: parentId,
      }
    )
    expect(nested.ok).toBe(true)
    if (!nested.ok) throw new Error('unreachable')
    expect(nested.moved).toBe(false)
    await expect(parentOf(childId)).resolves.toBe(parentId)
    await expect(logCountMentioning(childId)).resolves.toBe(0)

    // Top-level flavor of the same no-op: a root "moved" to null.
    const root = await moveFieldContext(
      { driver },
      {
        currentUserId: ids.meOwner,
        contextId: parentId,
        newParentContextId: null,
      }
    )
    expect(root.ok).toBe(true)
    if (!root.ok) throw new Error('unreachable')
    expect(root.moved).toBe(false)
    await expect(logCountMentioning(parentId)).resolves.toBe(0)
  })

  it('rejects a move whose subtree height would overflow the depth cap, but allows the boundary move', async () => {
    if (!neo4jAvailable) return
    // Anchor chain: depths 0..3. Mover subtree: root + 2 levels (height 2).
    const anchor = await seedChain(ids.meSpace, 'move_depth_anchor', 3)
    const mover = await seedChain(ids.meSpace, 'move_depth_mover', 2)
    const moverRoot = mover[0]
    const deepAnchor = anchor[3]
    const boundaryAnchor = anchor[2]

    // Under depth-3: 3 + 1 + height 2 = 6 > MAX (5) → rejected.
    const overflow = await moveFieldContext(
      { driver },
      {
        currentUserId: ids.meOwner,
        contextId: moverRoot,
        newParentContextId: deepAnchor,
      }
    )
    const failure = expectFailure(overflow)
    expect(failure.reason).toBe('depth_exceeded')
    await expect(parentOf(moverRoot)).resolves.toBeNull()

    // Under depth-2: 2 + 1 + height 2 = 5 = MAX → allowed.
    const boundary = await moveFieldContext(
      { driver },
      {
        currentUserId: ids.meOwner,
        contextId: moverRoot,
        newParentContextId: boundaryAnchor,
      }
    )
    expect(boundary.ok).toBe(true)
    if (!boundary.ok) throw new Error('unreachable')
    expect(boundary.moved).toBe(true)
    await expect(parentOf(moverRoot)).resolves.toBe(boundaryAnchor)
  })
})
