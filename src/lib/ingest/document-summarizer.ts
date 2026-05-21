import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

/**
 * Document summarizer — produces a 1-paragraph synopsis + up to ~5 concept
 * phrases at ingest time. Runs concurrently with the entity extractor so
 * it adds no latency on the critical path beyond a single round-trip.
 *
 * Failure is non-fatal: callers swallow exceptions via `summarizeDocument`
 * and proceed with empty values, so a flaky summarizer never blocks an
 * upload. The Document node still lands; the summary card just renders
 * empty until the next re-extract refreshes it.
 *
 * Independent factory entry — separate from `OPENAI_INGEST_EXTRACTION_MODEL`
 * so the summary model can be tuned independently (smaller/cheaper model
 * for v1 since the output is a paragraph plus a short list).
 */

export interface DocumentSummaryInput {
  /** Plain-text body. Empty when routing through the Gemini PDF path. */
  documentText: string
  /** Presigned file URL for multimodal (Gemini) summarization. */
  documentUrl?: string
  /** MIME type of `documentUrl`. */
  documentMimeType?: string
  filename: string
  hint: string | null
  fieldContextTitle: string
}

export interface DocumentSummaryResult {
  summary: string
  concepts: string[]
}

export type DocumentSummarizerClient = (
  input: DocumentSummaryInput
) => Promise<DocumentSummaryResult>

const SummarySchema = z.object({
  summary: z
    .string()
    .describe(
      'One paragraph (3-5 sentences) that captures what this document is about and why a reader would care. Plain prose — no headings, no bullets.'
    ),
  concepts: z
    .array(z.string())
    .max(7)
    .describe(
      'Up to 5 short concept phrases (2-5 words each) that name the high-level themes of the document. Used as filter chips on the Document card. Lowercase, no trailing punctuation.'
    ),
})

function getSummaryModelId(): string {
  return (
    process.env.OPENAI_INGEST_SUMMARY_MODEL?.trim() ||
    process.env.OPENAI_INGEST_EXTRACTION_MODEL?.trim() ||
    'gpt-5.4'
  )
}

function getGeminiSummaryModelId(): string {
  return (
    process.env.GEMINI_INGEST_SUMMARY_MODEL?.trim() ||
    process.env.GEMINI_INGEST_EXTRACTION_MODEL?.trim() ||
    'gemini-2.5-pro'
  )
}

function buildSystemPrompt(input: DocumentSummaryInput): string {
  const hintLine = input.hint ? `User hint: ${input.hint}` : ''
  return [
    `You are summarizing a document the user uploaded into the field context "${input.fieldContextTitle}".`,
    `Source filename: ${input.filename}`,
    hintLine,
    '',
    'Produce:',
    '- A 3-5 sentence paragraph that names what the document is about, who it concerns, and why a reader would care. Plain prose — no headings, bullets, or markdown.',
    '- Up to 5 short concept phrases (2-5 words each) that name the high-level themes. Lowercase, no trailing punctuation, no quotes.',
    '',
    'Rules:',
    '- Never expose internal identifiers (ids that look like ctx_… / doc_… / pulse_…). Use only human-readable names, titles, and the filename.',
    '- Do not invent facts. If the document is too thin to summarize, return a short honest sentence saying so and an empty concepts array.',
  ]
    .filter(Boolean)
    .join('\n')
}

export function createOpenAIDocumentSummarizer(): DocumentSummarizerClient {
  return async (input) => {
    const modelId = getSummaryModelId()
    const result = await generateObject({
      model: openai(modelId),
      schema: SummarySchema,
      system: buildSystemPrompt(input),
      prompt: input.documentText,
    })
    return {
      summary: result.object.summary.trim(),
      concepts: (result.object.concepts ?? [])
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
        .slice(0, 5),
    }
  }
}

/**
 * Gemini multimodal summarizer — used for PDFs ingested via the
 * direct-to-S3 + Gemini pipeline. Reads the document by reference (presigned
 * URL → Gemini `file_data.fileUri`) so the bytes never re-traverse this
 * process.
 */
export function createGeminiDocumentSummarizer(): DocumentSummarizerClient {
  return async (input) => {
    if (!input.documentUrl) {
      throw new Error(
        'createGeminiDocumentSummarizer: documentUrl is required.'
      )
    }
    const modelId = getGeminiSummaryModelId()
    const result = await generateObject({
      model: google(modelId),
      schema: SummarySchema,
      system: buildSystemPrompt(input),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Summarize the attached document "${input.filename}".`,
            },
            {
              type: 'file',
              data: new URL(input.documentUrl),
              mediaType: input.documentMimeType ?? 'application/pdf',
            },
          ],
        },
      ],
    })
    return {
      summary: result.object.summary.trim(),
      concepts: (result.object.concepts ?? [])
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
        .slice(0, 5),
    }
  }
}

/**
 * Wraps a summarizer call with the non-fatal error contract. Returns
 * `{ summary: '', concepts: [] }` on any failure so the orchestrator can
 * always call `setDocumentSummary` without branching.
 */
export async function summarizeDocument(
  client: DocumentSummarizerClient | null,
  input: DocumentSummaryInput
): Promise<DocumentSummaryResult> {
  if (!client) return { summary: '', concepts: [] }
  try {
    return await client(input)
  } catch (err) {
    console.warn(
      `[document-summarizer] failed for ${input.filename}:`,
      err instanceof Error ? err.message : String(err)
    )
    return { summary: '', concepts: [] }
  }
}
