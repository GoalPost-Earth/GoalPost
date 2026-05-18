import { randomUUID } from 'node:crypto'
import { createVercelBlobStore } from './vercel-blob-store'

/**
 * Live round-trip against Vercel Blob. Skip-gracefully when
 * BLOB_READ_WRITE_TOKEN is absent so CI without credentials stays green.
 *
 * Mirrors the document-storage Neo4j integration test pattern: detect
 * availability in beforeAll, gate every test with `if (!available) return`,
 * and clean up explicitly in afterAll so an interrupted run does not leave
 * orphan blobs in the bucket.
 */

let blobAvailable = false
const testRunId = `it_${randomUUID().slice(0, 8)}`
const blobKey = `documents/__integration__/${testRunId}.txt`

beforeAll(() => {
  blobAvailable = !!process.env.BLOB_READ_WRITE_TOKEN?.trim()
})

afterAll(async () => {
  if (!blobAvailable) return
  try {
    await createVercelBlobStore().delete(blobKey)
  } catch {
    // best-effort
  }
})

describe('createVercelBlobStore — live @vercel/blob round-trip (skip-gracefully)', () => {
  it('put → get → delete: bytes survive the round-trip and delete leaves nothing behind', async () => {
    if (!blobAvailable) return

    const store = createVercelBlobStore()
    const payload = Buffer.from(`integration-payload-${testRunId}`, 'utf8')

    const ref = await store.put({
      key: blobKey,
      contentType: 'text/plain',
      buffer: payload,
    })
    expect(ref.key).toBe(blobKey)
    expect(ref.url).toMatch(/^https:\/\//)
    expect(ref.sizeBytes).toBe(payload.length)

    const fetched = await store.get(blobKey)
    expect(fetched).not.toBeNull()
    expect(fetched!.buffer.toString('utf8')).toBe(payload.toString('utf8'))

    await store.delete(blobKey)

    const afterDelete = await store.get(blobKey)
    expect(afterDelete).toBeNull()
  })
})
