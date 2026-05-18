import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import type {
  ExtractionModelClient,
  ExtractionModelInput,
  ExtractionModelOutput,
} from './extraction-model-invoker'

/**
 * Production extraction-model client. Wraps `generateObject` against the
 * extraction model id resolved from env. Slice 1 prompt: extract fully-named
 * persons only. Later slices extend the schema for goal/resource/story
 * pulses and update_* dedup tool calls.
 *
 * Extraction model lives in its own env var (separate from
 * DEFAULT_ASSISTANT_MODEL). Free to be a reasoning model — ADR-0001 documents
 * why Rule 6's non-reasoning chat constraint does not apply here.
 */

const ExtractionSchema = z.object({
  persons: z
    .array(
      z.object({
        firstName: z.string().describe('Given name. Empty string if uncertain.'),
        lastName: z.string().describe('Family name. Empty string if uncertain.'),
      })
    )
    .describe(
      'Distinct human beings explicitly named in the document. Skip partial mentions where you cannot give both first AND last name confidently.'
    ),
  assistantText: z
    .string()
    .describe(
      'A short, natural-language sentence the user will see in the assistant chat alongside the extracted entities. Use only the human-readable filename — never raw ids.'
    ),
})

function getExtractionModelId(): string {
  return (
    process.env.OPENAI_INGEST_EXTRACTION_MODEL?.trim() ||
    'gpt-5.4'
  )
}

function buildSystemPrompt(input: ExtractionModelInput): string {
  const hintLine = input.hint ? `\nUSER HINT: ${input.hint}` : ''
  const rosterPersons =
    input.roster.persons.length === 0
      ? 'No persons in this field context yet.'
      : input.roster.persons.map((p) => `- ${p.name}`).join('\n')
  return [
    `You are extracting entities from a document the user uploaded into the field context "${input.fieldContextTitle}".`,
    `Source filename: ${input.filename}`,
    hintLine,
    '',
    'EXISTING PEOPLE IN THIS FIELD CONTEXT:',
    rosterPersons,
    '',
    'Rules:',
    '- Emit one PersonPulse per fully-named human being mentioned in the document.',
    '- Skip partial mentions where you cannot give both first AND last name confidently. Mention skipped people in your assistantText.',
    '- Never expose internal identifiers. Never use entity ids in assistantText — only human-readable names and filenames.',
    '- Keep assistantText short and natural. One or two sentences.',
  ]
    .filter(Boolean)
    .join('\n')
}

export function createOpenAIExtractionModelClient(): ExtractionModelClient {
  return async (input: ExtractionModelInput): Promise<ExtractionModelOutput> => {
    const modelId = getExtractionModelId()
    const result = await generateObject({
      model: openai(modelId),
      schema: ExtractionSchema,
      system: buildSystemPrompt(input),
      prompt: input.documentText,
    })
    return {
      persons: result.object.persons.map((p) => ({
        firstName: p.firstName ?? '',
        lastName: p.lastName ?? '',
      })),
      assistantText: result.object.assistantText ?? '',
    }
  }
}
