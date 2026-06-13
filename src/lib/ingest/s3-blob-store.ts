import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { BlobStore } from './blob-store'

/**
 * Production BlobStore backed by AWS S3.
 *
 * Two presign methods support the ingest split:
 *  - presignPut: browser uploads PDF directly to S3 (~5 min TTL by default
 *    at call site)
 *  - presignGet: Gemini fetches via `file_data.file_uri` during extraction
 *    (~15 min TTL by default — Gemini downloads synchronously inside the
 *    generateContent call so a short window is sufficient)
 *
 * The server-side `put` is kept for tests and any legacy path; the primary
 * upload flow does not stream bytes through this process.
 *
 * Credentials are read from env at call time so dev/prod can rotate without
 * a rebuild. The AWS SDK also auto-discovers IAM role credentials when
 * deployed to AWS infra — explicit values take precedence.
 */
function readEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) {
    throw new Error(
      `createS3BlobStore: ${name} is not set. Set it in the environment or use INGEST_BLOB_BACKEND=memory for local dev.`
    )
  }
  return v
}

function buildClient(): { client: S3Client; bucket: string } {
  const region = readEnv('AWS_REGION')
  const bucket = readEnv('S3_BUCKET')
  // Explicit credentials are optional — if absent, fall back to the SDK's
  // default provider chain (IAM roles, ~/.aws/credentials, etc.).
  // STS temporary credentials (ACCESS_KEY_ID starting with `ASIA`) also need
  // AWS_SESSION_TOKEN — passing it through when present.
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim()
  const sessionToken = process.env.AWS_SESSION_TOKEN?.trim()
  const client = new S3Client({
    region,
    // AWS SDK v3 (≥3.729) defaults to injecting a CRC32 integrity checksum
    // (`x-amz-sdk-checksum-algorithm` + `x-amz-checksum-crc32`) into the SIGNED
    // query string of presigned PUT URLs. A plain browser `fetch(url, {method:
    // 'PUT', body: file})` can't reproduce that checksum header, so S3 rejects
    // the upload with 400. `WHEN_REQUIRED` adds checksums only for operations
    // that mandate them — keeping presigned PUTs signable by a bare browser
    // PUT. (Our presigned PUTs already pin Content-Type; integrity is covered
    // by TLS + the short-lived signature.)
    requestChecksumCalculation: 'WHEN_REQUIRED',
    ...(accessKeyId && secretAccessKey
      ? {
          credentials: {
            accessKeyId,
            secretAccessKey,
            ...(sessionToken ? { sessionToken } : {}),
          },
        }
      : {}),
  })
  return { client, bucket }
}

function isNotFound(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as { name?: string; $metadata?: { httpStatusCode?: number } }
  return e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  // The AWS SDK's Body is a Node Readable in Node runtimes.
  const chunks: Buffer[] = []
  for await (const chunk of body as AsyncIterable<Buffer | Uint8Array>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export function createS3BlobStore(): BlobStore {
  return {
    async put(input) {
      const { client, bucket } = buildClient()
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: input.key,
          Body: input.buffer,
          ContentType: input.contentType,
        })
      )
      return {
        key: input.key,
        url: `s3://${bucket}/${input.key}`,
        contentType: input.contentType,
        sizeBytes: input.buffer.length,
      }
    },
    async get(key) {
      const { client, bucket } = buildClient()
      try {
        const res = await client.send(
          new GetObjectCommand({ Bucket: bucket, Key: key })
        )
        if (!res.Body) return null
        const buffer = await streamToBuffer(res.Body)
        return {
          key,
          contentType: res.ContentType ?? 'application/octet-stream',
          buffer,
        }
      } catch (err) {
        if (isNotFound(err)) return null
        throw err
      }
    },
    async delete(key) {
      const { client, bucket } = buildClient()
      try {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
      } catch (err) {
        if (isNotFound(err)) return
        throw err
      }
    },
    async presignPut(input) {
      const { client, bucket } = buildClient()
      return getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: bucket,
          Key: input.key,
          ContentType: input.contentType,
        }),
        { expiresIn: input.ttlSeconds }
      )
    },
    async presignGet(input) {
      const { client, bucket } = buildClient()
      return getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: bucket, Key: input.key }),
        { expiresIn: input.ttlSeconds }
      )
    },
  }
}
