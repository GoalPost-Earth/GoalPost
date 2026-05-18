import type { FieldContextRoster } from './field-context-roster'
import type { SynthesizedToolCall } from './synthesized-turn-appender'

/**
 * Wraps the extraction LLM call. The actual model invocation is
 * dependency-injected so tests can mock it and the production wiring can
 * keep the model id, retry policy, and structured-output parsing in one
 * place. v1 emits PersonPulse only — slice 2 extends `ExtractionModelOutput`
 * to include pulses (GoalPulse/ResourcePulse/StoryPulse).
 */

export interface ExtractedPersonCandidate {
  firstName: string
  lastName: string
}

export interface ExtractionModelOutput {
  persons: ExtractedPersonCandidate[]
  /** Free-text prose the model wrote alongside the structured output. */
  assistantText: string
}

export type ExtractionModelClient = (
  input: ExtractionModelInput
) => Promise<ExtractionModelOutput>

export interface ExtractionModelInput {
  documentText: string
  filename: string
  hint: string | null
  roster: FieldContextRoster
  fieldContextId: string
  fieldContextTitle: string
  documentId: string
}

export type ExtractionResult =
  | {
      kind: 'ok'
      toolCalls: SynthesizedToolCall[]
      assistantText: string
    }
  | {
      kind: 'failure'
      reason: string
      assistantText: string
    }

function isFullyNamed(p: ExtractedPersonCandidate): boolean {
  return p.firstName.trim().length > 0 && p.lastName.trim().length > 0
}

function describeSkipped(skipped: ExtractedPersonCandidate[]): string {
  if (skipped.length === 0) return ''
  const names = skipped
    .map((p) => `${p.firstName} ${p.lastName}`.trim())
    .filter((n) => n.length > 0)
  if (names.length === 0) return ''
  return ` I also saw ${names.length === 1 ? 'a partial mention' : 'partial mentions'} I skipped because the names were incomplete: ${names.join(', ')}.`
}

export async function extractEntities(
  input: ExtractionModelInput,
  modelClient: ExtractionModelClient
): Promise<ExtractionResult> {
  let raw: ExtractionModelOutput
  try {
    raw = await modelClient(input)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return {
      kind: 'failure',
      reason: message,
      assistantText: `Extraction failed while reading ${input.filename}: ${message}.`,
    }
  }

  const fullyNamed = raw.persons.filter(isFullyNamed)
  const skipped = raw.persons.filter((p) => !isFullyNamed(p))

  if (fullyNamed.length === 0) {
    return {
      kind: 'ok',
      toolCalls: [],
      assistantText:
        `I read ${input.filename} but didn't find anything to extract.` +
        describeSkipped(skipped),
    }
  }

  const toolCalls: SynthesizedToolCall[] = fullyNamed.map((person) => ({
    tool: 'create_person',
    args: {
      firstName: person.firstName.trim(),
      lastName: person.lastName.trim(),
      contextId: input.fieldContextId,
      contextTitle: input.fieldContextTitle,
      documentId: input.documentId,
    },
  }))

  const namesList = fullyNamed
    .map((p) => `${p.firstName.trim()} ${p.lastName.trim()}`)
    .join(', ')
  const headline = `Reading ${input.filename}, I found ${fullyNamed.length === 1 ? 'one person' : `${fullyNamed.length} people`}: ${namesList}.`
  const assistantText = `${headline}${describeSkipped(skipped)}`

  return { kind: 'ok', toolCalls, assistantText }
}
