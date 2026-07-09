import { z } from 'zod'
import type { ExtractionModelOutput } from './extraction-model-invoker'

/**
 * Shared response schema for the entity-extraction model call, consumed by
 * BOTH ingest paths — the OpenAI text client (txt/md/csv + office docx/xlsx)
 * and the Gemini multimodal client (PDF + images). The two clients previously
 * each declared a byte-identical copy of this schema; keeping one definition
 * makes the drift that `extraction-input-preparer.ts` warns about impossible.
 *
 * Every "optional" field is declared `.nullable()` rather than `.optional()`.
 * OpenAI structured outputs run in strict mode (the AI SDK default for
 * `generateObject`), which requires every property to appear in its object's
 * `required` array. A `.optional()` field is dropped from `required`, and
 * OpenAI rejects the whole call before any entity is produced (GOAL-282):
 *
 *   Invalid schema for response_format 'response': In context=('properties',
 *   'persons', 'items'), 'required' is required to be supplied and to be an
 *   array including every key in properties. Missing 'existingId'.
 *
 * `.nullable()` keeps the field required while letting the model emit `null`
 * when it has nothing to say. `mapExtractionObject` normalises `null` back to
 * `undefined` so the rest of the pipeline keeps its plain-optional semantics.
 */
export const ExtractionSchema = z.object({
  persons: z
    .array(
      z.object({
        firstName: z.string().describe('Given name. Empty string if uncertain.'),
        lastName: z.string().describe('Family name. Empty string if uncertain.'),
        existingId: z
          .string()
          .nullable()
          .describe(
            'Set ONLY when this mention matches an existing person from EXISTING PEOPLE — copy their id verbatim. Use null otherwise.'
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
          .nullable()
          .describe(
            'Set ONLY when this pulse matches an existing pulse from EXISTING PULSES — copy their id verbatim. Use null otherwise. Match strictly: the kind must agree.'
          ),
        authorName: z
          .string()
          .nullable()
          .describe(
            'Full name of the person this pulse is attributed to — the document author or named speaker whose voice the pulse carries. Must exactly match a name you emitted in persons, or a name from EXISTING PEOPLE. Use null when authorship is unclear.'
          ),
        status: z
          .string()
          .nullable()
          .describe('GoalPulse only — ACTIVE / PAUSED / COMPLETED. Use null if not applicable.'),
        intensity: z
          .number()
          .nullable()
          .describe('Optional 0.0–1.0 intensity score. Use null if not applicable.'),
        horizon: z
          .string()
          .nullable()
          .describe('GoalPulse only — SHORT / MID / LONG. Use null if not applicable.'),
        resourceType: z
          .string()
          .nullable()
          .describe(
            'ResourcePulse only — short type label, e.g. "budget", "time", "skill". Use null if not applicable.'
          ),
        availability: z
          .number()
          .nullable()
          .describe('ResourcePulse only. Use null if not applicable.'),
        why: z.string().nullable().describe('Motivation / reason. Use null if not applicable.'),
        location: z.string().nullable().describe('Use null if not applicable.'),
        time: z.string().nullable().describe('Use null if not applicable.'),
      })
    )
    .nullable()
    .describe(
      'Distinct goal/resource/story entries explicit in the document. Each must have BOTH a title and content — drop anything you can\'t fully form. Never emit CarePulse or CoreValuePulse here. Never emit the same (kind, title) pair twice within one extraction. Use null if there are no pulses.'
    ),
  assistantText: z
    .string()
    .describe(
      'A short, natural-language sentence the user will see in the assistant chat alongside the extracted entities. Use only the human-readable filename — never raw ids.'
    ),
})

export type ExtractionSchemaObject = z.infer<typeof ExtractionSchema>

/**
 * Normalise a validated model object into `ExtractionModelOutput`. Collapses
 * the schema's `null` (required-but-empty) values back to `undefined` so the
 * invoker and tool builders keep their plain-optional contract, and guards
 * each string field against an absent value.
 */
export function mapExtractionObject(
  object: ExtractionSchemaObject
): ExtractionModelOutput {
  return {
    persons: object.persons.map((p) => ({
      firstName: p.firstName ?? '',
      lastName: p.lastName ?? '',
      existingId: p.existingId ?? undefined,
    })),
    pulses: (object.pulses ?? []).map((p) => ({
      kind: p.kind,
      title: p.title ?? '',
      content: p.content ?? '',
      existingId: p.existingId ?? undefined,
      authorName: p.authorName ?? undefined,
      status: p.status ?? undefined,
      intensity: p.intensity ?? undefined,
      horizon: p.horizon ?? undefined,
      resourceType: p.resourceType ?? undefined,
      availability: p.availability ?? undefined,
      why: p.why ?? undefined,
      location: p.location ?? undefined,
      time: p.time ?? undefined,
    })),
    assistantText: object.assistantText ?? '',
  }
}
