import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import type {
  ExtractionModelClient,
  ExtractionModelInput,
  ExtractionModelOutput,
} from './extraction-model-invoker'
import { ExtractionSchema, mapExtractionObject } from './extraction-schema'

/**
 * Production extraction-model client. Wraps `generateObject` against the
 * extraction model id resolved from env.
 *
 * Slice 4 (GOAL-239) — the prompt now inlines the FieldContext roster
 * (persons + v1 pulses) along with their server-side ids. The model is
 * instructed to set `existingId` on any candidate it recognises as a
 * roster member so the synthesized turn carries `update_*` rather than
 * duplicating with `create_*`. Ids are echoed back from the prompt only;
 * the model never invents them, and the runtime invoker validates each
 * echoed id against the original roster before trusting it.
 *
 * Extraction model lives in its own env var (separate from
 * DEFAULT_ASSISTANT_MODEL). Free to be a reasoning model — ADR-0001
 * documents why Rule 6's non-reasoning chat constraint does not apply here.
 *
 * The response schema is shared with the Gemini client in
 * `extraction-schema.ts`. OpenAI strict structured outputs require every
 * property to be required, so the shared schema uses `.nullable()` (not
 * `.optional()`) and `mapExtractionObject` normalises the nulls away.
 */

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
    '- Emit one person entry per fully-named human being mentioned in the document.',
    '- Skip partial mentions where you cannot give both first AND last name confidently. Mention skipped people in your assistantText.',
    '- If a person mention matches an existing entry above, set existingId to that entry\'s id so we update rather than duplicate. Do NOT invent ids; only copy from the list above.',
    '- Emit pulses ONLY for the three v1 kinds: GoalPulse (stated objectives), ResourcePulse (offered/needed resources), StoryPulse (narrative or values-bearing passages).',
    '- Never emit CarePulse or CoreValuePulse — those are out of scope for v1.',
    '- Each pulse must have BOTH a title and content. Drop anything you can\'t fully form.',
    '- If a pulse mention is semantically equivalent to an existing pulse above, set existingId to that pulse\'s id so we update rather than duplicate. The kind must match the existing pulse\'s kind — otherwise emit as new.',
    '- When the document makes clear whose voice or authorship a pulse carries (a byline, the user hint, a named speaker), set that pulse\'s authorName to the person\'s full name — exactly as you emitted it in persons, or as listed in EXISTING PEOPLE. Use null when authorship is unclear.',
    '- Never emit the same person or pulse twice. Collapse repeated mentions into a single entry.',
    '- Never expose internal identifiers in assistantText. Use only human-readable names, titles, and the filename.',
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
    return mapExtractionObject(result.object)
  }
}
