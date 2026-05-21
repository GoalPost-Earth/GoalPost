import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import type {
  ExtractionModelClient,
  ExtractionModelInput,
  ExtractionModelOutput,
} from './extraction-model-invoker'

/**
 * Gemini multimodal extraction client. Sends the PDF (or any supported file
 * type) to `gemini-2.5-pro` by reference — a presigned URL — so the bytes
 * never re-traverse our process. The provider maps a JS `URL` instance to
 * Gemini's `file_data.fileUri` part; pass a plain string and it would
 * base64-inline instead.
 *
 * Replaces the OpenAI text-only path for PDFs. The .txt/.md path still
 * routes through `openai-extraction-model-client.ts` since pure text
 * doesn't benefit from multimodal cost/latency.
 *
 * Shares the `ExtractionModelOutput` shape with the OpenAI client so the
 * orchestrator (handle-ingest-document) is provider-agnostic.
 */

const ExtractionSchema = z.object({
  persons: z
    .array(
      z.object({
        firstName: z.string().describe('Given name. Empty string if uncertain.'),
        lastName: z.string().describe('Family name. Empty string if uncertain.'),
        existingId: z
          .string()
          .optional()
          .describe(
            'Set ONLY when this mention matches an existing person from EXISTING PEOPLE — copy their id verbatim. Omit otherwise.'
          ),
      })
    )
    .describe(
      'Distinct human beings explicitly named in the document. Skip partial mentions where you cannot give both first AND last name confidently. Never repeat the same person twice — if they appear several times, emit a single entry.'
    ),
  pulses: z
    .array(
      z.object({
        kind: z
          .enum(['GoalPulse', 'ResourcePulse', 'StoryPulse'])
          .describe(
            'GoalPulse for stated objectives, ResourcePulse for offered/needed resources, StoryPulse for narrative or values-bearing passages. CarePulse and CoreValuePulse are out of scope for v1.'
          ),
        title: z
          .string()
          .describe('Short headline phrase. Required — leave empty to drop.'),
        content: z
          .string()
          .describe('Full text capturing the pulse. Required — leave empty to drop.'),
        existingId: z
          .string()
          .optional()
          .describe(
            'Set ONLY when this pulse matches an existing pulse from EXISTING PULSES — copy their id verbatim. Omit otherwise. Match strictly: the kind must agree.'
          ),
        status: z.string().optional().describe('GoalPulse only — ACTIVE / PAUSED / COMPLETED.'),
        intensity: z.number().optional().describe('Optional 0.0–1.0 intensity score.'),
        horizon: z.string().optional().describe('GoalPulse only — SHORT / MID / LONG.'),
        resourceType: z
          .string()
          .optional()
          .describe('ResourcePulse only — short type label, e.g. "budget", "time", "skill".'),
        availability: z.number().optional().describe('ResourcePulse only.'),
        why: z.string().optional().describe('Motivation / reason.'),
        location: z.string().optional(),
        time: z.string().optional(),
      })
    )
    .optional()
    .describe(
      'Distinct goal/resource/story entries explicit in the document. Each must have BOTH a title and content — drop anything you can\'t fully form. Never emit CarePulse or CoreValuePulse here. Never emit the same (kind, title) pair twice within one extraction.'
    ),
  assistantText: z
    .string()
    .describe(
      'A short, natural-language sentence the user will see in the assistant chat alongside the extracted entities. Use only the human-readable filename — never raw ids.'
    ),
})

function getExtractionModelId(): string {
  return (
    process.env.GEMINI_INGEST_EXTRACTION_MODEL?.trim() ||
    'gemini-2.5-pro'
  )
}

function buildSystemPrompt(input: ExtractionModelInput): string {
  const hintLine = input.hint ? `\nUSER HINT: ${input.hint}` : ''
  const rosterPersons =
    input.roster.persons.length === 0
      ? 'No persons in this field context yet.'
      : input.roster.persons
          .map((p) => `- id=${p.id}  name="${p.name}"`)
          .join('\n')
  const rosterPulses =
    input.roster.pulses.length === 0
      ? 'No pulses in this field context yet.'
      : input.roster.pulses
          .map((p) => `- id=${p.id}  kind=${p.pulseType}  title="${p.title}"`)
          .join('\n')
  return [
    `You are extracting entities from a document the user uploaded into the field context "${input.fieldContextTitle}".`,
    `Source filename: ${input.filename}`,
    hintLine,
    '',
    'EXISTING PEOPLE IN THIS FIELD CONTEXT:',
    rosterPersons,
    '',
    'EXISTING PULSES IN THIS FIELD CONTEXT:',
    rosterPulses,
    '',
    'Rules:',
    '- Read the attached document end-to-end before deciding what to extract.',
    '- Emit one person entry per fully-named human being mentioned in the document.',
    '- Skip partial mentions where you cannot give both first AND last name confidently. Mention skipped people in your assistantText.',
    '- If a person mention matches an existing entry above, set existingId to that entry\'s id so we update rather than duplicate. Do NOT invent ids; only copy from the list above.',
    '- Emit pulses ONLY for the three v1 kinds: GoalPulse (stated objectives), ResourcePulse (offered/needed resources), StoryPulse (narrative or values-bearing passages).',
    '- Never emit CarePulse or CoreValuePulse — those are out of scope for v1.',
    '- Each pulse must have BOTH a title and content. Drop anything you can\'t fully form.',
    '- If a pulse mention is semantically equivalent to an existing pulse above, set existingId to that pulse\'s id so we update rather than duplicate. The kind must match the existing pulse\'s kind — otherwise emit as new.',
    '- Never emit the same person or pulse twice. Collapse repeated mentions into a single entry.',
    '- Never expose internal identifiers in assistantText. Use only human-readable names, titles, and the filename.',
    '- Keep assistantText short and natural. One or two sentences.',
  ]
    .filter(Boolean)
    .join('\n')
}

export function createGeminiExtractionModelClient(): ExtractionModelClient {
  return async (input: ExtractionModelInput): Promise<ExtractionModelOutput> => {
    if (!input.documentUrl) {
      throw new Error(
        'createGeminiExtractionModelClient: documentUrl is required. The Gemini path expects a presigned file URL; for plain-text documents use the OpenAI client.'
      )
    }
    const modelId = getExtractionModelId()
    const result = await generateObject({
      model: google(modelId),
      schema: ExtractionSchema,
      system: buildSystemPrompt(input),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract persons and pulses from the attached document "${input.filename}".`,
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
      persons: result.object.persons.map((p) => ({
        firstName: p.firstName ?? '',
        lastName: p.lastName ?? '',
        existingId: p.existingId,
      })),
      pulses: (result.object.pulses ?? []).map((p) => ({
        kind: p.kind,
        title: p.title ?? '',
        content: p.content ?? '',
        existingId: p.existingId,
        status: p.status,
        intensity: p.intensity,
        horizon: p.horizon,
        resourceType: p.resourceType,
        availability: p.availability,
        why: p.why,
        location: p.location,
        time: p.time,
      })),
      assistantText: result.object.assistantText ?? '',
    }
  }
}
