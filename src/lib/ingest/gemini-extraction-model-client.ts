import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import type {
  ExtractionModelClient,
  ExtractionModelInput,
  ExtractionModelOutput,
} from './extraction-model-invoker'
import { ExtractionSchema, mapExtractionObject } from './extraction-schema'
import { recordAiSdkUsage } from '@/lib/llm/usage/record-ai-sdk-usage'

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
 * Shares the `ExtractionModelOutput` shape AND the response schema
 * (`extraction-schema.ts`) with the OpenAI client so the orchestrator
 * (handle-ingest-document) is provider-agnostic and the two paths cannot
 * drift apart.
 */

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
  const rosterOrgs =
    input.roster.organizations.length === 0
      ? 'No organizations in this field context yet.'
      : input.roster.organizations
          .map((o) => `- id=${o.id}  name="${o.name}"`)
          .join('\n')
  return [
    `You are extracting entities from a document the user uploaded into the field context "${input.fieldContextTitle}".`,
    `Source filename: ${input.filename}`,
    hintLine,
    '',
    'EXISTING PEOPLE IN THIS FIELD CONTEXT:',
    rosterPersons,
    '',
    'EXISTING ORGANIZATIONS IN THIS FIELD CONTEXT:',
    rosterOrgs,
    '',
    'EXISTING PULSES IN THIS FIELD CONTEXT:',
    rosterPulses,
    '',
    'Rules:',
    '- Read the attached document end-to-end before deciding what to extract.',
    '- Emit one person entry per fully-named human being mentioned in the document.',
    '- Skip partial mentions where you cannot give both first AND last name confidently. Mention skipped people in your assistantText. IMPORTANT: a single-name mention that is actually an organization/group/company/cooperative is NOT a skipped person — put it in organizations.',
    '- If a person mention matches an existing entry above, set existingId to that entry\'s id so we update rather than duplicate. Do NOT invent ids; only copy from the list above.',
    '- Emit one organization entry per distinct organization, group, company, cooperative or institution named in the document (e.g. "Artisan Cooperative"). Give its description when the document states what it does. If it matches an EXISTING ORGANIZATION above, set existingId to that id.',
    '- Emit pulses ONLY for the three v1 kinds: GoalPulse (stated objectives), ResourcePulse (offered/needed resources), StoryPulse (narrative or values-bearing passages).',
    '- Never emit CarePulse or CoreValuePulse — those are out of scope for v1.',
    '- Each pulse must have BOTH a title and content. Drop anything you can\'t fully form.',
    '- If a pulse mention is semantically equivalent to an existing pulse above, set existingId to that pulse\'s id so we update rather than duplicate. The kind must match the existing pulse\'s kind — otherwise emit as new.',
    '- When the document makes clear whose voice or authorship a pulse carries (a byline, the user hint, a named speaker), set that pulse\'s authorName to the person\'s full name — exactly as you emitted it in persons, or as listed in EXISTING PEOPLE. Use null when authorship is unclear.',
    '- For every pulse, set relatedPersonNames to the people the document names as related to it but who are NOT its author (subjects, contributors, beneficiaries), and relatedOrganizationNames to the organizations related to it (e.g. the cooperative offering a resource). Names must match ones you emitted (or EXISTING PEOPLE / EXISTING ORGANIZATIONS). This is how named people and orgs stay connected to the resources and stories they belong to. Use null when none apply; never repeat authorName in relatedPersonNames.',
    '- Never emit the same person, organization or pulse twice. Collapse repeated mentions into a single entry.',
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
      abortSignal: input.abortSignal,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract persons, organizations, and pulses from the attached document "${input.filename}".`,
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
    // GOAL-297: meter Gemini doc-extraction spend against the uploader.
    void recordAiSdkUsage(result.usage, {
      source: 'doc-extract',
      model: modelId,
      provider: 'gemini',
      principal: 'user',
      userId: input.userId ?? null,
    })
    return mapExtractionObject(result.object)
  }
}
