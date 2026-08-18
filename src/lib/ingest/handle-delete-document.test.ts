/**
 * GOAL-321 — deleteDocument clears dangling document-locator locations.
 *
 * Extraction stamps surviving pulses' `location` with the durable download
 * URL (GOAL-283/316); after the delete that locator dead-ends forever. The
 * orchestrator must null `location` ONLY on pulses whose stored value parses
 * (via `parseDocumentDownloadLocation`) to the deleted document's id —
 * genuine extracted or manually set locations are untouched — and must write
 * an attributed `:Log` for the clearing, all inside the delete transaction.
 * The clearing is compare-and-clear: the write matches on the {id, location}
 * pair read in the same transaction, so a concurrently re-edited location is
 * never destroyed, and the Log claims exactly the pulses that matched.
 * The driver is faked; this suite pins the orchestration (which statements
 * run, with which parameters), not the Cypher itself.
 */
import type { Driver } from 'neo4j-driver'
import { handleDeleteDocument } from './handle-delete-document'
import type { BlobStore } from './blob-store'

const DOC_ID = 'doc_1'

interface RunCall {
  query: string
  params: Record<string, unknown>
}

interface FakeGraph {
  candidates: Array<{ id: string; location: string | null }>
  deleteSucceeds: boolean
  blobKey: string | null
  filename: string
  /** Pair ids the compare-and-clear statement reports as actually cleared.
   *  Defaults to echoing every pair it was given. */
  clearedIds?: string[]
}

function makeFakeDriver(graph: FakeGraph) {
  const runCalls: RunCall[] = []
  const tx = {
    run: async (query: string, params: Record<string, unknown>) => {
      runCalls.push({ query, params })
      if (query.includes('AS candidates')) {
        return {
          records: [{ get: () => graph.candidates }],
        }
      }
      if (query.includes('DETACH DELETE')) {
        if (!graph.deleteSucceeds) return { records: [] }
        return {
          records: [
            {
              get: (key: string) =>
                key === 'blobKey' ? graph.blobKey : graph.filename,
            },
          ],
        }
      }
      if (query.includes('SET p.location = null')) {
        const echoed =
          graph.clearedIds ??
          (params.pairs as Array<{ id: string }>).map((p) => p.id)
        return { records: [{ get: () => echoed }] }
      }
      // clearing-Log statement
      return { records: [] }
    },
  }
  const driver = {
    session: () => ({
      executeWrite: async (work: (t: typeof tx) => Promise<unknown>) =>
        work(tx),
      close: async () => undefined,
    }),
  } as unknown as Driver
  return { driver, runCalls }
}

function makeBlobStore() {
  return { delete: jest.fn() } as unknown as BlobStore & {
    delete: jest.Mock
  }
}

function clearStatement(runCalls: RunCall[]): RunCall | undefined {
  return runCalls.find((c) => c.query.includes('SET p.location = null'))
}

function clearLogStatement(runCalls: RunCall[]): RunCall | undefined {
  return runCalls.find((c) => c.query.includes('CREATE (clearLog:Log'))
}

describe('handleDeleteDocument — dangling-locator clearing (GOAL-321)', () => {
  it('clears only locations that parse to the deleted document, absolute and relative forms alike', async () => {
    const absLocation = `https://app.goalpost.example/api/ingest/document/${DOC_ID}/download`
    const relLocation = `/api/ingest/document/${DOC_ID}/download`
    const { driver, runCalls } = makeFakeDriver({
      candidates: [
        // absolute form persisted by buildDocumentDownloadUrl → cleared
        { id: 'pulse_abs', location: absLocation },
        // bare relative form → cleared
        { id: 'pulse_rel', location: relLocation },
        // locator of a DIFFERENT document → untouched
        {
          id: 'pulse_other_doc',
          location: '/api/ingest/document/doc_other/download',
        },
        // manually set free text that merely mentions the path → untouched
        {
          id: 'pulse_free_text',
          location: 'see /api/ingest/document/ upload notes',
        },
        // extracted physical place → untouched
        { id: 'pulse_place', location: 'Accra Community Center' },
        // duplicate from the ∪ of context and EXTRACTED_FROM branches → once
        { id: 'pulse_abs', location: absLocation },
      ],
      deleteSucceeds: true,
      blobKey: 'ingest/space_1/doc_1.pdf',
      filename: 'harvest-notes.pdf',
    })
    const blobStore = makeBlobStore()

    const result = await handleDeleteDocument(
      { driver, blobStore },
      { currentUserId: 'user_1', documentId: DOC_ID }
    )

    expect(result).toEqual({
      ok: true,
      documentId: DOC_ID,
      clearedPulseIds: ['pulse_abs', 'pulse_rel'],
    })

    // Compare-and-clear receives the {id, location} pairs read in-transaction.
    const clear = clearStatement(runCalls)
    expect(clear).toBeDefined()
    expect(clear!.params.pairs).toEqual([
      { id: 'pulse_abs', location: absLocation },
      { id: 'pulse_rel', location: relLocation },
    ])

    // The clearing writes its own attributed activity Log for what cleared.
    const clearLog = clearLogStatement(runCalls)
    expect(clearLog).toBeDefined()
    expect(clearLog!.params.userId).toBe('user_1')
    expect(clearLog!.params.pulseIds).toEqual(['pulse_abs', 'pulse_rel'])
    expect(clearLog!.params.description).toBe(
      'Removed the link to deleted document "harvest-notes.pdf" from 2 pulses'
    )
    expect(JSON.parse(clearLog!.params.clearMetadata as string)).toEqual({
      documentId: DOC_ID,
      clearedPulseIds: ['pulse_abs', 'pulse_rel'],
    })
    expect(clearLog!.query).toContain('CREATED_BY')
    expect(clearLog!.query).toContain('LOGGED_FOR')

    // Delete still ran, and blob cleanup still fired.
    expect(runCalls.some((c) => c.query.includes('DETACH DELETE'))).toBe(true)
    expect(blobStore.delete).toHaveBeenCalledWith('ingest/space_1/doc_1.pdf')
  })

  it('skips the clearing statement entirely when no location matches', async () => {
    const { driver, runCalls } = makeFakeDriver({
      candidates: [
        { id: 'pulse_place', location: 'Tamale market' },
        {
          id: 'pulse_other_doc',
          location: '/api/ingest/document/doc_other/download',
        },
      ],
      deleteSucceeds: true,
      blobKey: 'ingest/space_1/doc_1.pdf',
      filename: 'harvest-notes.pdf',
    })

    const result = await handleDeleteDocument(
      { driver, blobStore: makeBlobStore() },
      { currentUserId: 'user_1', documentId: DOC_ID }
    )

    expect(result).toEqual({
      ok: true,
      documentId: DOC_ID,
      clearedPulseIds: [],
    })
    expect(clearStatement(runCalls)).toBeUndefined()
    expect(clearLogStatement(runCalls)).toBeUndefined()
  })

  it('never clears anything on a missing-or-forbidden delete', async () => {
    const { driver, runCalls } = makeFakeDriver({
      // Even with a would-match candidate (gate races are cheap to guard),
      // an empty delete verdict must leave every location untouched.
      candidates: [
        { id: 'pulse_abs', location: `/api/ingest/document/${DOC_ID}/download` },
      ],
      deleteSucceeds: false,
      blobKey: null,
      filename: '',
    })
    const blobStore = makeBlobStore()

    const result = await handleDeleteDocument(
      { driver, blobStore },
      { currentUserId: 'user_intruder', documentId: DOC_ID }
    )

    expect(result).toEqual({
      ok: false,
      reason: 'forbidden',
      error: 'You do not have permission to delete this document.',
    })
    expect(clearStatement(runCalls)).toBeUndefined()
    expect(clearLogStatement(runCalls)).toBeUndefined()
    expect(blobStore.delete).not.toHaveBeenCalled()
  })

  it('logs only the pulses the compare-and-clear actually matched', async () => {
    // A concurrent editor changed pulse_rel's location between the
    // in-transaction read and the write → the guard clears pulse_abs only,
    // and the Log must claim exactly that.
    const { driver, runCalls } = makeFakeDriver({
      candidates: [
        { id: 'pulse_abs', location: `/api/ingest/document/${DOC_ID}/download` },
        { id: 'pulse_rel', location: `/api/ingest/document/${DOC_ID}/download/` },
      ],
      deleteSucceeds: true,
      blobKey: null,
      filename: 'minutes.md',
      clearedIds: ['pulse_abs'],
    })
    const blobStore = makeBlobStore()

    const result = await handleDeleteDocument(
      { driver, blobStore },
      { currentUserId: 'user_1', documentId: DOC_ID }
    )

    expect(result).toEqual({
      ok: true,
      documentId: DOC_ID,
      clearedPulseIds: ['pulse_abs'],
    })
    const clearLog = clearLogStatement(runCalls)
    expect(clearLog!.params.pulseIds).toEqual(['pulse_abs'])
    expect(clearLog!.params.description).toBe(
      'Removed the link to deleted document "minutes.md" from 1 pulse'
    )
    // No blob key on the deleted document — clearing must still have run.
    expect(blobStore.delete).not.toHaveBeenCalled()
  })

  it('writes no clearing Log when the guard matched nothing', async () => {
    const { driver, runCalls } = makeFakeDriver({
      candidates: [
        { id: 'pulse_abs', location: `/api/ingest/document/${DOC_ID}/download` },
      ],
      deleteSucceeds: true,
      blobKey: null,
      filename: 'minutes.md',
      clearedIds: [],
    })

    const result = await handleDeleteDocument(
      { driver, blobStore: makeBlobStore() },
      { currentUserId: 'user_1', documentId: DOC_ID }
    )

    expect(result).toEqual({
      ok: true,
      documentId: DOC_ID,
      clearedPulseIds: [],
    })
    expect(clearStatement(runCalls)).toBeDefined()
    expect(clearLogStatement(runCalls)).toBeUndefined()
  })
})
