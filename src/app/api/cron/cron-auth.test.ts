/**
 * GOAL-347 — every scheduled route is fail-CLOSED on CRON_SECRET.
 *
 * These routes are public, unauthenticated `GET`s with no middleware in front
 * of them. They write graph entities on behalf of arbitrary users, drive model
 * spend, and one of them permanently cascade-deletes across every Space. An
 * earlier `if (cronSecret && ...)` form meant an environment with no secret
 * disabled the check entirely rather than refusing the request — so this suite
 * locks in the invariant across ALL of them, not just the one that was fixed
 * first. A new cron route should be added here.
 */

jest.mock('@/modules/graph', () => ({
  initGraph: async () => ({ query: jest.fn().mockResolvedValue([]) }),
}))
jest.mock('@/lib/neo4j/driver', () => ({
  driver: { session: () => ({ run: jest.fn(), close: jest.fn() }) },
}))

import { GET as discoverResonances } from './discover-resonances/route'
import { GET as purgeDeletedContexts } from './purge-deleted-contexts/route'
import { GET as classifyAiFeedback } from './classify-ai-feedback/route'
import { GET as processDocumentIngestion } from './process-document-ingestion/route'
import { GET as processArticleImports } from './process-article-imports/route'

type Handler = (request: never) => Promise<Response>

const ROUTES: Array<[string, Handler]> = [
  ['discover-resonances', discoverResonances as Handler],
  ['purge-deleted-contexts', purgeDeletedContexts as Handler],
  ['classify-ai-feedback', classifyAiFeedback as Handler],
  ['process-document-ingestion', processDocumentIngestion as Handler],
  ['process-article-imports', processArticleImports as Handler],
]

const request = (headers: Record<string, string> = {}) =>
  new Request('https://demo.goalpost.earth/api/cron/x', { headers }) as never

const originalSecret = process.env.CRON_SECRET
afterEach(() => {
  if (originalSecret === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = originalSecret
})

describe.each(ROUTES)('/api/cron/%s', (_name, handler) => {
  it('401s when CRON_SECRET is unset — an absent secret must not disable the gate', async () => {
    delete process.env.CRON_SECRET
    // A caller can present any token they like; with no secret configured
    // there is nothing to match, and the answer must still be no.
    expect((await handler(request({ authorization: 'Bearer anything' }))).status).toBe(401)
  })

  it('401s on a mismatched token', async () => {
    process.env.CRON_SECRET = 'right'
    expect((await handler(request({ authorization: 'Bearer wrong' }))).status).toBe(401)
  })

  it('401s with no authorization header', async () => {
    process.env.CRON_SECRET = 'right'
    expect((await handler(request())).status).toBe(401)
  })
})
