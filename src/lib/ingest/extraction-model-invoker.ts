import type {
  FieldContextRoster,
  RosterPerson,
  RosterPulse,
} from './field-context-roster'
import type { SynthesizedToolCall } from './synthesized-turn-appender'
import { buildDocumentDownloadUrl } from './document-download-url'

/**
 * Wraps the extraction LLM call. The actual model invocation is
 * dependency-injected so tests can mock it and the production wiring can
 * keep the model id, retry policy, and structured-output parsing in one
 * place.
 *
 * Slice 4 (GOAL-239) responsibilities:
 *  - Inline the FieldContext roster in the prompt (handled by the prompt
 *    builder; this module receives the roster ready-projected).
 *  - Emit `update_person` / `update_pulse` for matches against the roster
 *    rather than duplicating with `create_*`.
 *  - Apply the partial-person filter (skip first-name-only mentions).
 *  - Intra-document dedup: the same person/pulse mentioned twice yields a
 *    single tool call, never two.
 *  - Enforce the v1 pulse-type allowlist (GoalPulse / ResourcePulse /
 *    StoryPulse) — drop CarePulse / CoreValuePulse server-side.
 */

export interface ExtractedPersonCandidate {
  firstName: string
  lastName: string
  /** Optional id of a roster person the model thinks this mention matches. */
  existingId?: string
}

/**
 * v1 (slice 2) extracted pulse kinds. CarePulse / CoreValuePulse are not
 * extracted in v1 and are filtered out server-side if the model emits them.
 */
export type ExtractedPulseKind = 'GoalPulse' | 'ResourcePulse' | 'StoryPulse'

export interface ExtractedPulseCandidate {
  kind: ExtractedPulseKind
  title: string
  content: string
  /** Optional id of a roster pulse the model thinks this mention matches. */
  existingId?: string
  status?: string
  intensity?: number
  horizon?: string
  resourceType?: string
  availability?: number
  why?: string
  location?: string
  time?: string
}

export interface ExtractionModelOutput {
  persons: ExtractedPersonCandidate[]
  pulses?: ExtractedPulseCandidate[]
  /** Free-text prose the model wrote alongside the structured output. */
  assistantText: string
}

export type ExtractionModelClient = (
  input: ExtractionModelInput
) => Promise<ExtractionModelOutput>

export interface ExtractionModelInput {
  /**
   * Plain-text content of the document. Set for text/markdown uploads where
   * the orchestrator decoded the bytes server-side. For binary documents
   * (PDFs) routed through a multimodal model this is the empty string and
   * the model reads from `documentUrl` instead.
   */
  documentText: string
  /**
   * Short-lived URL (typically a presigned S3 GET) the multimodal extractor
   * can fetch the file from. Set for the Gemini PDF path; unset for the
   * OpenAI text path.
   */
  documentUrl?: string
  /** MIME type of the document at `documentUrl`. */
  documentMimeType?: string
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

const ALLOWED_PULSE_KINDS = new Set<ExtractedPulseKind>([
  'GoalPulse',
  'ResourcePulse',
  'StoryPulse',
])

function isValidPulse(p: ExtractedPulseCandidate): boolean {
  if (!ALLOWED_PULSE_KINDS.has(p.kind)) return false
  if (!p.title || p.title.trim().length === 0) return false
  if (!p.content || p.content.trim().length === 0) return false
  return true
}

function normalizePersonKey(first: string, last: string): string {
  return `${first.trim().toLowerCase()}|${last.trim().toLowerCase()}`
}

function normalizePulseKey(kind: ExtractedPulseKind, title: string): string {
  return `${kind}|${title.trim().toLowerCase()}`
}

/**
 * Resolve a person candidate against the roster. Two-stage match:
 *   1. Model-provided existingId — wins if it points at a roster entry.
 *   2. Case-insensitive trimmed full-name match against the roster — the
 *      AC explicitly calls this out as the deterministic floor so the model
 *      cannot create a duplicate by simply forgetting to set existingId.
 */
function resolvePersonMatch(
  candidate: ExtractedPersonCandidate,
  roster: RosterPerson[]
): RosterPerson | null {
  const existingId = candidate.existingId?.trim()
  if (existingId) {
    const byId = roster.find((p) => p.id === existingId)
    if (byId) return byId
  }
  const full = `${candidate.firstName.trim()} ${candidate.lastName.trim()}`
    .trim()
    .toLowerCase()
  if (!full) return null
  return roster.find((p) => p.name.trim().toLowerCase() === full) ?? null
}

/**
 * Resolve a pulse candidate against the roster. Pulses rely solely on the
 * model's existingId — the AC explicitly states that pulse match heuristic
 * is left to the model with the roster inlined; no separate similarity step.
 */
function resolvePulseMatch(
  candidate: ExtractedPulseCandidate,
  roster: RosterPulse[]
): RosterPulse | null {
  const existingId = candidate.existingId?.trim()
  if (!existingId) return null
  const byId = roster.find((p) => p.id === existingId)
  if (!byId) return null
  // Guard: the model must not be allowed to "update" a pulse with a kind
  // that doesn't match the existing pulse's type. Drop the existingId in
  // that case and treat as a fresh create.
  if (byId.pulseType !== candidate.kind) return null
  return byId
}

function buildCreatePulseArgs(
  p: ExtractedPulseCandidate,
  input: ExtractionModelInput
): Record<string, unknown> {
  const args: Record<string, unknown> = {
    pulseType: p.kind,
    title: p.title.trim(),
    content: p.content.trim(),
    contextId: input.fieldContextId,
    contextTitle: input.fieldContextTitle,
    documentId: input.documentId,
  }
  if (p.status && p.status.trim()) args.status = p.status.trim()
  if (typeof p.intensity === 'number' && Number.isFinite(p.intensity)) {
    args.intensity = p.intensity
  }
  if (p.horizon && p.horizon.trim()) args.horizon = p.horizon.trim()
  if (p.resourceType && p.resourceType.trim()) {
    args.resourceType = p.resourceType.trim()
  }
  if (typeof p.availability === 'number' && Number.isFinite(p.availability)) {
    args.availability = p.availability
  }
  if (p.why && p.why.trim()) args.why = p.why.trim()
  if (p.location && p.location.trim()) {
    args.location = p.location.trim()
  } else if (p.kind === 'ResourcePulse' && input.documentId) {
    // GOAL-283: a member-uploaded document is itself the resource. When the
    // extractor didn't read an explicit location from the text, fall back to a
    // durable, Space-scoped link to the uploaded file so the Resource is always
    // openable/shareable. Never clobber an extracted/manual location above; the
    // `documentId` guard keeps the fallback from writing a malformed URL.
    args.location = buildDocumentDownloadUrl(input.documentId)
  }
  if (p.time && p.time.trim()) args.time = p.time.trim()
  return args
}

function buildUpdatePulseArgs(
  p: ExtractedPulseCandidate,
  match: RosterPulse,
  input: ExtractionModelInput
): Record<string, unknown> {
  // Field names mirror UpdatePulseInput in pulse.service.ts so the runtime
  // updatePulse() reads them without translation.
  const args: Record<string, unknown> = {
    pulseId: match.id,
    newTitle: p.title.trim(),
    newContent: p.content.trim(),
    pulseType: p.kind,
    currentTitle: match.title,
    contextId: input.fieldContextId,
    contextTitle: input.fieldContextTitle,
    documentId: input.documentId,
  }
  if (p.status && p.status.trim()) args.newStatus = p.status.trim()
  if (typeof p.intensity === 'number' && Number.isFinite(p.intensity)) {
    args.newIntensity = p.intensity
  }
  if (p.horizon && p.horizon.trim()) args.newHorizon = p.horizon.trim()
  if (p.resourceType && p.resourceType.trim()) {
    args.newResourceType = p.resourceType.trim()
  }
  if (typeof p.availability === 'number' && Number.isFinite(p.availability)) {
    args.newAvailability = p.availability
  }
  if (p.why && p.why.trim()) args.newWhy = p.why.trim()
  if (p.location && p.location.trim()) args.newLocation = p.location.trim()
  if (p.time && p.time.trim()) args.newTime = p.time.trim()
  return args
}

function buildCreatePersonArgs(
  p: ExtractedPersonCandidate,
  input: ExtractionModelInput
): Record<string, unknown> {
  return {
    firstName: p.firstName.trim(),
    lastName: p.lastName.trim(),
    contextId: input.fieldContextId,
    contextTitle: input.fieldContextTitle,
    documentId: input.documentId,
  }
}

function buildUpdatePersonArgs(
  p: ExtractedPersonCandidate,
  match: RosterPerson,
  input: ExtractionModelInput
): Record<string, unknown> {
  return {
    personId: match.id,
    firstName: p.firstName.trim(),
    lastName: p.lastName.trim(),
    currentName: match.name,
    contextId: input.fieldContextId,
    contextTitle: input.fieldContextTitle,
    documentId: input.documentId,
  }
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
  const rawPulses = raw.pulses ?? []
  const validPulses = rawPulses.filter(isValidPulse)

  // Intra-document dedup. The model is instructed to do this, but a quiet
  // floor keeps the synthesized turn clean even if the model slips. Keep the
  // first occurrence so the model's first decision (often with the richer
  // surrounding context) wins.
  const personByKey = new Map<string, ExtractedPersonCandidate>()
  for (const p of fullyNamed) {
    const key = normalizePersonKey(p.firstName, p.lastName)
    if (!personByKey.has(key)) personByKey.set(key, p)
  }
  const uniquePersons = Array.from(personByKey.values())

  const pulseByKey = new Map<string, ExtractedPulseCandidate>()
  for (const p of validPulses) {
    const key = normalizePulseKey(p.kind, p.title)
    if (!pulseByKey.has(key)) pulseByKey.set(key, p)
  }
  const uniquePulses = Array.from(pulseByKey.values())

  if (uniquePersons.length === 0 && uniquePulses.length === 0) {
    return {
      kind: 'ok',
      toolCalls: [],
      assistantText:
        `I read ${input.filename} but didn't find anything to extract.` +
        describeSkipped(skipped),
    }
  }

  const personCalls: SynthesizedToolCall[] = uniquePersons.map((person) => {
    const match = resolvePersonMatch(person, input.roster.persons)
    if (match) {
      return { tool: 'update_person', args: buildUpdatePersonArgs(person, match, input) }
    }
    return { tool: 'create_person', args: buildCreatePersonArgs(person, input) }
  })

  const pulseCalls: SynthesizedToolCall[] = uniquePulses.map((p) => {
    const match = resolvePulseMatch(p, input.roster.pulses)
    if (match) {
      return { tool: 'update_pulse', args: buildUpdatePulseArgs(p, match, input) }
    }
    return { tool: 'create_pulse', args: buildCreatePulseArgs(p, input) }
  })

  const toolCalls: SynthesizedToolCall[] = [...personCalls, ...pulseCalls]

  const assistantText = buildAssistantText({
    input,
    uniquePersons,
    rosterPersons: input.roster.persons,
    skipped,
    uniquePulses,
    rosterPulses: input.roster.pulses,
    droppedPulses: rawPulses.filter((p) => !isValidPulse(p)),
  })

  return { kind: 'ok', toolCalls, assistantText }
}

function buildAssistantText(params: {
  input: ExtractionModelInput
  uniquePersons: ExtractedPersonCandidate[]
  rosterPersons: RosterPerson[]
  skipped: ExtractedPersonCandidate[]
  uniquePulses: ExtractedPulseCandidate[]
  rosterPulses: RosterPulse[]
  droppedPulses: ExtractedPulseCandidate[]
}): string {
  const {
    input,
    uniquePersons,
    rosterPersons,
    skipped,
    uniquePulses,
    rosterPulses,
    droppedPulses,
  } = params
  const parts: string[] = []

  if (uniquePersons.length > 0 || uniquePulses.length > 0) {
    const segments: string[] = []
    if (uniquePersons.length > 0) {
      const namesList = uniquePersons
        .map((p) => `${p.firstName.trim()} ${p.lastName.trim()}`)
        .join(', ')
      segments.push(
        `${uniquePersons.length === 1 ? 'one person' : `${uniquePersons.length} people`}: ${namesList}`
      )
    }
    if (uniquePulses.length > 0) {
      const titles = uniquePulses.map((p) => `"${p.title.trim()}"`).join(', ')
      segments.push(
        `${uniquePulses.length === 1 ? 'one pulse' : `${uniquePulses.length} pulses`}: ${titles}`
      )
    }
    parts.push(
      `Reading ${input.filename}, I found ${segments.join(' and ')}.`
    )
  }

  // Surface recognised matches in the chat copy — names only, no ids.
  const matchedPersonNames = uniquePersons
    .map((p) => resolvePersonMatch(p, rosterPersons)?.name)
    .filter((n): n is string => Boolean(n))
  const matchedPulseTitles = uniquePulses
    .map((p) => resolvePulseMatch(p, rosterPulses)?.title)
    .filter((t): t is string => Boolean(t))
  if (matchedPersonNames.length > 0 || matchedPulseTitles.length > 0) {
    const matchSegments: string[] = []
    if (matchedPersonNames.length > 0) {
      matchSegments.push(
        `${matchedPersonNames.length === 1 ? 'a person' : 'people'} you already track: ${matchedPersonNames.join(', ')}`
      )
    }
    if (matchedPulseTitles.length > 0) {
      matchSegments.push(
        `${matchedPulseTitles.length === 1 ? 'a pulse' : 'pulses'} you already track: ${matchedPulseTitles.join(', ')}`
      )
    }
    const matchedCount = matchedPersonNames.length + matchedPulseTitles.length
    parts.push(
      ` I matched this against ${matchSegments.join(' and ')} and updated ${matchedCount === 1 ? 'that existing entry' : 'those existing entries'} instead of creating duplicates.`
    )
  }

  parts.push(describeSkipped(skipped))

  if (droppedPulses.length > 0) {
    const dropped = droppedPulses
      .map((p) => p.title?.trim())
      .filter((t): t is string => Boolean(t && t.length > 0))
    if (dropped.length > 0) {
      parts.push(
        ` I also dropped ${dropped.length === 1 ? 'a pulse' : `${dropped.length} pulses`} I couldn't fully form: ${dropped.join(', ')}.`
      )
    }
  }

  return parts.join('').trim()
}
