import { createVercelBlobStore } from './vercel-blob-store'

jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
  del: jest.fn(),
  head: jest.fn(),
}))

import { put as sdkPut, del as sdkDel, head as sdkHead } from '@vercel/blob'

const putMock = sdkPut as jest.MockedFunction<typeof sdkPut>
const delMock = sdkDel as jest.MockedFunction<typeof sdkDel>
const headMock = sdkHead as jest.MockedFunction<typeof sdkHead>

describe('createVercelBlobStore() — Vercel Blob adapter for BlobStore interface', () => {
  const originalEnv = process.env.BLOB_READ_WRITE_TOKEN
  beforeEach(() => {
    putMock.mockReset()
    delMock.mockReset()
    headMock.mockReset()
    process.env.BLOB_READ_WRITE_TOKEN = 'test_token_xyz'
  })
  afterAll(() => {
    if (originalEnv === undefined) delete process.env.BLOB_READ_WRITE_TOKEN
    else process.env.BLOB_READ_WRITE_TOKEN = originalEnv
  })

  it('put: forwards pathname, buffer, contentType, access=public, allowOverwrite, and token to @vercel/blob; returns BlobRef', async () => {
    putMock.mockResolvedValueOnce({
      url: 'https://blob.vercel-storage.com/documents/doc_1/notes.txt',
      downloadUrl:
        'https://blob.vercel-storage.com/documents/doc_1/notes.txt?download=1',
      pathname: 'documents/doc_1/notes.txt',
      contentType: 'text/plain',
      contentDisposition: 'attachment',
      etag: 'abc',
    })

    const store = createVercelBlobStore()
    const buffer = Buffer.from('hello world', 'utf8')
    const ref = await store.put({
      key: 'documents/doc_1/notes.txt',
      contentType: 'text/plain',
      buffer,
    })

    expect(putMock).toHaveBeenCalledTimes(1)
    const [pathname, body, options] = putMock.mock.calls[0]
    expect(pathname).toBe('documents/doc_1/notes.txt')
    expect(body).toBe(buffer)
    expect(options).toMatchObject({
      access: 'public',
      contentType: 'text/plain',
      allowOverwrite: true,
      addRandomSuffix: false,
      token: 'test_token_xyz',
    })

    expect(ref).toEqual({
      key: 'documents/doc_1/notes.txt',
      url: 'https://blob.vercel-storage.com/documents/doc_1/notes.txt',
      contentType: 'text/plain',
      sizeBytes: buffer.length,
    })
  })

  it('delete: forwards key and token to @vercel/blob del; resolves silently if SDK throws "blob not found" (idempotent contract)', async () => {
    delMock.mockResolvedValueOnce(undefined)
    const store = createVercelBlobStore()

    await store.delete('documents/doc_1/notes.txt')

    expect(delMock).toHaveBeenCalledTimes(1)
    const [target, options] = delMock.mock.calls[0]
    expect(target).toBe('documents/doc_1/notes.txt')
    expect(options).toMatchObject({ token: 'test_token_xyz' })

    delMock.mockRejectedValueOnce(
      Object.assign(new Error('Blob not found'), { name: 'BlobNotFoundError' })
    )
    await expect(
      store.delete('documents/missing/x.txt')
    ).resolves.toBeUndefined()
  })

  it('get: looks up the blob, fetches its bytes, and returns { key, contentType, buffer }', async () => {
    headMock.mockResolvedValueOnce({
      url: 'https://blob.vercel-storage.com/documents/doc_1/notes.txt',
      downloadUrl:
        'https://blob.vercel-storage.com/documents/doc_1/notes.txt?download=1',
      pathname: 'documents/doc_1/notes.txt',
      size: 11,
      uploadedAt: new Date(),
      contentType: 'text/plain',
      contentDisposition: 'attachment',
      cacheControl: 'public',
    } as Awaited<ReturnType<typeof sdkHead>>)

    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(Buffer.from('hello world', 'utf8'), { status: 200 })
      )

    try {
      const store = createVercelBlobStore()
      const obj = await store.get('documents/doc_1/notes.txt')

      expect(headMock).toHaveBeenCalledWith('documents/doc_1/notes.txt', {
        token: 'test_token_xyz',
      })
      expect(fetchMock).toHaveBeenCalledWith(
        'https://blob.vercel-storage.com/documents/doc_1/notes.txt'
      )
      expect(obj).not.toBeNull()
      expect(obj!.key).toBe('documents/doc_1/notes.txt')
      expect(obj!.contentType).toBe('text/plain')
      expect(obj!.buffer.toString('utf8')).toBe('hello world')
    } finally {
      fetchMock.mockRestore()
    }
  })

  it('throws a clear error on put when BLOB_READ_WRITE_TOKEN is not configured (instead of opaque SDK 401)', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN

    const store = createVercelBlobStore()
    await expect(
      store.put({
        key: 'documents/x/file.txt',
        contentType: 'text/plain',
        buffer: Buffer.from('x'),
      })
    ).rejects.toThrow(/BLOB_READ_WRITE_TOKEN/)

    expect(putMock).not.toHaveBeenCalled()
  })

  it('get: returns null when @vercel/blob head reports the blob is missing', async () => {
    headMock.mockRejectedValueOnce(
      Object.assign(new Error('Blob not found'), { name: 'BlobNotFoundError' })
    )

    const store = createVercelBlobStore()
    const obj = await store.get('documents/missing/x.txt')
    expect(obj).toBeNull()
  })
})
