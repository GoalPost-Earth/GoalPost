import { createMemoryBlobStore } from './blob-store'

describe('MemoryBlobStore (test double for BlobStore interface)', () => {
  it('round-trips a buffer through put → get', async () => {
    const store = createMemoryBlobStore()
    const ref = await store.put({
      key: 'documents/doc_1/notes.txt',
      contentType: 'text/plain',
      buffer: Buffer.from('hello world', 'utf8'),
    })
    expect(ref.key).toBe('documents/doc_1/notes.txt')
    expect(typeof ref.url).toBe('string')

    const fetched = await store.get(ref.key)
    expect(fetched).not.toBeNull()
    expect(fetched!.contentType).toBe('text/plain')
    expect(fetched!.buffer.toString('utf8')).toBe('hello world')
  })

  it('returns null from get for a key that was never put', async () => {
    const store = createMemoryBlobStore()
    const fetched = await store.get('documents/missing/x.txt')
    expect(fetched).toBeNull()
  })

  it('delete removes the blob; subsequent get returns null', async () => {
    const store = createMemoryBlobStore()
    const ref = await store.put({
      key: 'documents/doc_2/notes.txt',
      contentType: 'text/plain',
      buffer: Buffer.from('to be removed'),
    })
    await store.delete(ref.key)
    const fetched = await store.get(ref.key)
    expect(fetched).toBeNull()
  })

  it('delete on a missing key resolves without throwing (idempotent)', async () => {
    const store = createMemoryBlobStore()
    await expect(store.delete('documents/missing/x.txt')).resolves.toBeUndefined()
  })

  it('put with the same key overwrites the previous blob', async () => {
    const store = createMemoryBlobStore()
    const key = 'documents/doc_3/notes.txt'
    await store.put({ key, contentType: 'text/plain', buffer: Buffer.from('v1') })
    await store.put({ key, contentType: 'text/plain', buffer: Buffer.from('v2') })
    const fetched = await store.get(key)
    expect(fetched!.buffer.toString('utf8')).toBe('v2')
  })
})
