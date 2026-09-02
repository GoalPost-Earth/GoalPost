import { randomUUID } from 'node:crypto'
import { driver, closeDriver } from '@/lib/neo4j/driver'
import { close as closeGraph } from '@/modules/graph'
import { signJWT } from '@/app/api/auth/utils'
import { ARTICLE_IMPORT_STATUS } from './article-import'

/**
 * GOAL-326 — end-to-end proof that bulk article import survives the queue
 * boundary: `POST /api/import/articles` enqueues and returns 202 without
 * writing anything, `/api/cron/process-article-imports` mints the pulses as the
 * persisted requester, and `GET /api/import/articles/<jobId>` reports the
 * per-row result the modal renders.
 *
 * Runs the real route handlers against the dev Aura instance, and self-skips
 * when Neo4j is unreachable (CI without NEO4J_*):
 *
 *     npm test -- src/lib/imports/article-import-flow.test.ts
 *
 * The resonance/embedding sweep is mocked: it is real OpenAI spend, and what
 * this suite needs to prove is that the *worker* runs it (durably, awaited)
 * rather than the request firing it at `after()`. Its own behavior is covered
 * by the discovery tests.
 *
 * SHARED-DATABASE DISCIPLINE: every fixture id carries a per-run prefix,
 * teardown deletes by that prefix (including the pulses and Logs the import
 * mints), and it asserts nothing is left behind.
 */

const runContextResonanceDiscovery = jest.fn().mockResolvedValue(undefined)
jest.mock('@/lib/resonance/discovery/on-upload-discovery', () => ({
  runContextResonanceDiscovery: (params: unknown) =>
    runContextResonanceDiscovery(params),
}))

// GOAL-344: the worker now fetches every row's link and runs the document
// ingest pipeline on it — real network + real model spend. Stub the ingestor
// so this suite keeps proving the queue mechanics; the ingestor has its own
// unit suite (article-content-ingest.test.ts).
const ingestArticle = jest.fn().mockResolvedValue({
  status: 'fetch_failed',
  message: 'The site could not be reached.',
  created: 0,
  updated: 0,
})
jest.mock('@/lib/imports/article-content-ingest', () => ({
  ...jest.requireActual('@/lib/imports/article-content-ingest'),
  createArticleContentIngestor: () => ingestArticle,
}))

// Imported after the mock is registered so the cron route picks it up.
import { POST as enqueueArticles } from '@/app/api/import/articles/route'
import { GET as readImportJob } from '@/app/api/import/articles/[jobId]/route'
import { GET as runImportCron } from '@/app/api/cron/process-article-imports/route'

let neo4jAvailable = false

const prefix = `test_aif_${randomUUID().slice(0, 8)}_`
const ids = {
  owner: `${prefix}owner`,
  outsider: `${prefix}outsider`,
  space: `${prefix}me`,
  context: `${prefix}ctx`,
}

const CRON_SECRET = process.env.CRON_SECRET ?? ''

function authHeadersFor(userId: string): Record<string, string> {
  const token = signJWT({ user: { id: userId } })
  return {
    'Content-Type': 'application/json',
    authorization: `Bearer ${token}`,
  }
}

function enqueueRequest(userId: string, body: unknown): Request {
  return new Request('http://localhost/api/import/articles', {
    method: 'POST',
    headers: authHeadersFor(userId),
    body: JSON.stringify(body),
  })
}

async function runCron() {
  const request = new Request(
    'http://localhost/api/cron/process-article-imports',
    { headers: { authorization: `Bearer ${CRON_SECRET}` } }
  )
  // The route is typed for NextRequest but only reads `headers`.
  return runImportCron(request as never)
}

async function readJob(userId: string, jobId: string) {
  const request = new Request(
    `http://localhost/api/import/articles/${jobId}`,
    { headers: authHeadersFor(userId) }
  )
  const response = await readImportJob(request, {
    params: Promise.resolve({ jobId }),
  })
  return { status: response.status, body: await response.json() }
}

/**
 * Run the cron until `jobId` leaves flight. The worker drains the two oldest
 * PENDING jobs database-wide, so on a shared dev instance one tick is not a
 * promise that *this* job ran.
 */
async function drainUntilFinished(jobId: string, maxTicks = 5) {
  for (let tick = 0; tick < maxTicks; tick++) {
    const cron = await runCron()
    expect(cron.status).toBe(200)
    expect((await cron.json()).success).toBe(true)
    const { body } = await readJob(ids.owner, jobId)
    if (body.status !== ARTICLE_IMPORT_STATUS.pending &&
        body.status !== ARTICLE_IMPORT_STATUS.processing) {
      return body.status
    }
  }
  throw new Error(`job ${jobId} never left flight after ${maxTicks} cron ticks`)
}

const rows = [
  {
    row: 2,
    title: `${prefix}Mutual aid after the storm`,
    author: 'Amara Osei',
    date: '2026-05-14',
    url: 'https://example.org/articles/mutual-aid',
    pulseType: 'ResourcePulse' as const,
    description: 'How neighbourhood mutual aid groups organised recovery.',
  },
  {
    row: 3,
    title: `${prefix}Rebuilding the commons`,
    author: 'Amara Osei',
    date: '2026-05-20',
    url: 'https://example.org/articles/commons',
    pulseType: 'StoryPulse' as const,
  },
]

async function countImportedPulses(): Promise<number> {
  const session = driver.session()
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `
        MATCH (c:FieldContext {id: $contextId})-[:HAS_PULSE]->(p:FieldPulse)
        RETURN count(p) AS total
        `,
        { contextId: ids.context }
      )
    )
    return Number(result.records[0]?.get('total') ?? 0)
  } finally {
    await session.close()
  }
}

/** Activity Logs attributed to the requester — the audit trail must survive the
 *  move onto the queue (the worker holds no request context). */
async function countRequesterLogs(): Promise<number> {
  const session = driver.session()
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `
        MATCH (:FieldContext {id: $contextId})-[:HAS_PULSE]->(p:FieldPulse)
        MATCH (log:Log)-[:LOGGED_FOR]->(p)
        MATCH (log)-[:CREATED_BY]->(:Person {id: $ownerId})
        RETURN count(DISTINCT log) AS total
        `,
        { ownerId: ids.owner, contextId: ids.context }
      )
    )
    return Number(result.records[0]?.get('total') ?? 0)
  } finally {
    await session.close()
  }
}

beforeAll(async () => {
  try {
    const session = driver.session()
    await session.run('RETURN 1')
    await session.close()
    neo4jAvailable = true
  } catch {
    neo4jAvailable = false
  }
  if (!neo4jAvailable) return

  const session = driver.session()
  try {
    await session.run(
      `
      CREATE (u:Person:User {id: $ownerId, firstName: 'Import', lastName: 'Owner', name: 'Import Owner', createdAt: datetime()})
      CREATE (o:Person:User {id: $outsiderId, firstName: 'Out', lastName: 'Sider', name: 'Out Sider', createdAt: datetime()})
      CREATE (s:Space:MeSpace {id: $spaceId, name: 'Import Flow MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (c:FieldContext {id: $contextId, title: 'Import Flow Field', createdAt: datetime()})
      CREATE (u)-[:OWNS]->(s)
      CREATE (s)-[:HAS_CONTEXT]->(c)
      `,
      {
        ownerId: ids.owner,
        outsiderId: ids.outsider,
        spaceId: ids.space,
        contextId: ids.context,
      }
    )
  } finally {
    await session.close()
  }
})

afterAll(async () => {
  if (!neo4jAvailable) {
    await closeGraph()
    await closeDriver()
    return
  }
  const session = driver.session()
  try {
    // Neutralise first: a leftover PENDING job would be picked up by the real
    // every-minute worker after this suite exits.
    await session.run(
      `
      MATCH (j:ArticleImportJob)
      WHERE j.id STARTS WITH 'import_'
        AND EXISTS { (:FieldContext {id: $contextId})-[:HAS_IMPORT_JOB]->(j) }
      DETACH DELETE j
      `,
      { contextId: ids.context }
    )
    // The import mints pulses, people and Logs with server-generated ids, so
    // sweep by their edges to this run's context as well as by id prefix.
    await session.run(
      `
      MATCH (:FieldContext {id: $contextId})-[:HAS_PULSE]->(p:FieldPulse)
      OPTIONAL MATCH (log:Log)-[:LOGGED_FOR]->(p)
      DETACH DELETE p, log
      `,
      { contextId: ids.context }
    )
    await session.run(
      `
      MATCH (:FieldContext {id: $contextId})-[:HAS_PERSON]->(person:Person)
      WHERE NOT person:User
      DETACH DELETE person
      `,
      { contextId: ids.context }
    )
    // Author-resolution Logs hang off the person, not a pulse.
    await session.run(
      `
      MATCH (log:Log)-[:CREATED_BY]->(:Person {id: $ownerId})
      DETACH DELETE log
      `,
      { ownerId: ids.owner }
    )
    await session.run(
      `
      MATCH (n)
      WHERE n.id STARTS WITH $prefix
      DETACH DELETE n
      `,
      { prefix }
    )

    const leftovers = await session.run(
      `
      MATCH (n)
      WHERE n.id STARTS WITH $prefix
      RETURN n.id AS id
      `,
      { prefix }
    )
    const leaked = leftovers.records.map((record) => record.get('id') as string)
    if (leaked.length > 0) {
      throw new Error(
        `article-import-flow.test leaked ${leaked.length} fixture node(s): ${leaked.join(', ')}`
      )
    }
  } finally {
    await session.close()
    // Route handlers open BOTH Neo4j clients — the shared driver singleton and
    // the LangChain Neo4jGraph behind `initGraph()`. Leave either open and the
    // suite hangs after the last assertion with no output at all.
    await closeGraph()
    await closeDriver()
  }
})

function neo4jReady(): boolean {
  if (!neo4jAvailable) {
    console.warn(
      '[article-import-flow.test] Skipping integration assertions — Neo4j unreachable'
    )
    return false
  }
  return true
}

describe('bulk article import across the queue boundary', () => {
  it('reports whether the integration assertions actually ran', () => {
    if (!neo4jReady()) return
    expect(neo4jAvailable).toBe(true)
    // Without CRON_SECRET the worker is fail-closed and this suite is
    // meaningless — surface that rather than reporting a false pass.
    expect(CRON_SECRET).not.toBe('')
  })

  it('refuses to enqueue against a field the caller cannot write to', async () => {
    if (!neo4jReady()) return
    const response = await enqueueArticles(
      enqueueRequest(ids.outsider, {
        fieldContextId: ids.context,
        rows,
      })
    )
    expect(response.status).toBe(403)
    await expect(countImportedPulses()).resolves.toBe(0)
  })

  it('enqueues, drains, and reports per-row results', async () => {
    if (!neo4jReady()) return

    // 1. The request returns immediately and writes NOTHING into the field.
    const enqueued = await enqueueArticles(
      enqueueRequest(ids.owner, { fieldContextId: ids.context, rows })
    )
    expect(enqueued.status).toBe(202)
    const { jobId, status, totalRows } = await enqueued.json()
    expect(status).toBe(ARTICLE_IMPORT_STATUS.pending)
    expect(totalRows).toBe(2)
    expect(typeof jobId).toBe('string')
    await expect(countImportedPulses()).resolves.toBe(0)

    // 2. The member sees a queued job while nothing has run yet.
    const queued = await readJob(ids.owner, jobId)
    expect(queued.status).toBe(200)
    expect(queued.body).toMatchObject({
      status: ARTICLE_IMPORT_STATUS.pending,
      processedRows: 0,
      summary: { totalRows: 2, created: 0 },
    })

    // 3. An unauthenticated cron hit is refused before any work happens.
    const unauthorized = await runImportCron(
      new Request(
        'http://localhost/api/cron/process-article-imports'
      ) as never
    )
    expect(unauthorized.status).toBe(401)

    // 4. The worker mints the pulses as the persisted requester.
    //
    // Drive the cron until THIS job reaches a terminal status rather than
    // asserting on the first run's report: the dev instance is shared and the
    // worker claims the two oldest PENDING jobs in the whole database, so
    // another suite's job can legitimately take this tick's slots.
    const finalStatus = await drainUntilFinished(jobId)
    expect(finalStatus).toBe(ARTICLE_IMPORT_STATUS.complete)

    await expect(countImportedPulses()).resolves.toBe(2)
    // Moving work to the queue must not drop the audit trail.
    expect(await countRequesterLogs()).toBeGreaterThanOrEqual(2)
    // The embedding/resonance sweep is the worker's job now, not a
    // fire-and-forget callback on a request that has already answered.
    expect(runContextResonanceDiscovery).toHaveBeenCalledWith({
      contextId: ids.context,
      actorUserId: ids.owner,
    })

    // 5. The status endpoint carries the result the modal renders.
    const finished = await readJob(ids.owner, jobId)
    expect(finished.body).toMatchObject({
      status: ARTICLE_IMPORT_STATUS.complete,
      success: true,
      processedRows: 2,
      summary: { totalRows: 2, created: 2, failed: 0 },
    })
    expect(finished.body.outcomes).toHaveLength(2)
    expect(finished.body.outcomes[0]).toMatchObject({ status: 'created' })
    // GOAL-344: the article read rides on the outcome the client renders.
    expect(finished.body.outcomes[0].extraction).toMatchObject({
      status: 'fetch_failed',
    })
    // `personEvent` is an internal aid for deriving the summary — it must not
    // reach the client.
    expect(finished.body.outcomes[0]).not.toHaveProperty('personEvent')

    // 6. Someone else polling that job id learns nothing.
    const stranger = await readJob(ids.outsider, jobId)
    expect(stranger.status).toBe(404)

    // 7. Re-running the same sheet enriches rather than duplicating.
    const second = await enqueueArticles(
      enqueueRequest(ids.owner, { fieldContextId: ids.context, rows })
    )
    expect(second.status).toBe(202)
    const { jobId: secondJobId } = await second.json()
    await drainUntilFinished(secondJobId)

    await expect(countImportedPulses()).resolves.toBe(2)
    const replay = await readJob(ids.owner, secondJobId)
    expect(replay.body).toMatchObject({
      status: ARTICLE_IMPORT_STATUS.complete,
      summary: { created: 0, skippedExisting: 2, failed: 0 },
    })
  })
})
