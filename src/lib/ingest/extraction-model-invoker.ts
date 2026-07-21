import type {
  FieldContextRoster,
  RosterPerson,
  RosterPulse,
  RosterOrganization,
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
  /**
   * GOAL-314: one short phrase on who this person is / their role, drawn from
   * the document. Persisted as the PersonPulse's `description` so an
   * upload-created person carries more than just a name. Optional.
   */
  description?: string
  /** Optional id of a roster person the model thinks this mention matches. */
  existingId?: string
}

/**
 * GOAL-298: an organization / group / company / cooperative named in the
 * document. Captured as a first-class :Organization so members can discover
 * and connect with it, and linked to the pulses it relates to via MENTIONED_IN.
 */
export interface ExtractedOrganizationCandidate {
  name: string
  description?: string
  /** Optional id of a roster organization the model thinks this matches. */
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
  /**
   * Full name of the person whose voice/authorship this pulse carries (the
   * document's author or a named speaker). Only honoured when it resolves to
   * an extracted person candidate or a roster person — see resolveAuthor.
   */
  authorName?: string
  /**
   * GOAL-298: full names of people RELATED TO / NAMED IN this pulse but not its
   * author (subjects, contributors, beneficiaries). Each is linked to the pulse
   * via MENTIONED_IN. Only honoured when the name resolves to an extracted
   * person candidate or a roster person.
   */
  relatedPersonNames?: string[]
  /**
   * GOAL-298: names of organizations related to this pulse. Each is linked via
   * MENTIONED_IN. Only honoured when the name resolves to an extracted
   * organization candidate or a roster organization.
   */
  relatedOrganizationNames?: string[]
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
  organizations?: ExtractedOrganizationCandidate[]
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
  /**
   * Uploader this extraction runs on behalf of. Used only for usage
   * metering (GOAL-297), never for authorization. Null when unknown.
   */
  userId?: string | null
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

function normalizeOrgKey(name: string): string {
  return name.trim().toLowerCase()
}

function isValidOrg(o: ExtractedOrganizationCandidate): boolean {
  return o.name.trim().length > 0
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

interface ResolvedAuthor {
  /** Canonical display name (extracted candidate's or the roster's). */
  name: string
  /**
   * Set only on a roster match — the id is already live, so attribution must
   * not depend on a person call running this run (the model is told not to
   * re-emit people it only saw in the hint or EXISTING PEOPLE list).
   */
  personId?: string
}

/**
 * Resolve a pulse's claimed author against the people this extraction run
 * actually knows: the extracted person candidates and the context roster.
 * A name that matches neither is dropped (hallucination guard) — attribution
 * must never invent a person. Extracted candidates win over the roster (their
 * id doesn't exist yet; the orchestrator closes that loop after the person
 * call executes — which, for a roster duplicate, returns the same live id).
 */
function resolveAuthor(
  candidate: ExtractedPulseCandidate,
  persons: ExtractedPersonCandidate[],
  rosterPersons: RosterPerson[]
): ResolvedAuthor | null {
  const raw = candidate.authorName?.trim()
  if (!raw) return null
  const key = raw.toLowerCase()
  const extracted = persons.find(
    (p) =>
      `${p.firstName.trim()} ${p.lastName.trim()}`.trim().toLowerCase() === key
  )
  if (extracted) {
    return {
      name: `${extracted.firstName.trim()} ${extracted.lastName.trim()}`.trim(),
    }
  }
  const roster = rosterPersons.find(
    (p) => p.name.trim().toLowerCase() === key
  )
  return roster ? { name: roster.name.trim(), personId: roster.id } : null
}

/**
 * GOAL-298: resolve a related-person name against the people this run knows —
 * extracted candidates first (their canonical full name), then the roster
 * (whose id is already live). Returns null for a name that matches neither, so
 * a MENTIONED_IN link is never minted to an invented person.
 */
function resolveRelatedPerson(
  rawName: string,
  persons: ExtractedPersonCandidate[],
  rosterPersons: RosterPerson[]
): ResolvedAuthor | null {
  const key = rawName.trim().toLowerCase()
  if (!key) return null
  const extracted = persons.find(
    (p) =>
      `${p.firstName.trim()} ${p.lastName.trim()}`.trim().toLowerCase() === key
  )
  if (extracted) {
    return {
      name: `${extracted.firstName.trim()} ${extracted.lastName.trim()}`.trim(),
    }
  }
  const roster = rosterPersons.find((p) => p.name.trim().toLowerCase() === key)
  return roster ? { name: roster.name.trim(), personId: roster.id } : null
}

interface ResolvedOrg {
  name: string
  /** Set only on a roster match — the id is already live. */
  organizationId?: string
}

/**
 * GOAL-298: resolve an organization name against the extracted org candidates
 * and the context roster. Returns null when it matches neither.
 */
function resolveRelatedOrg(
  rawName: string,
  orgs: ExtractedOrganizationCandidate[],
  rosterOrgs: RosterOrganization[]
): ResolvedOrg | null {
  const key = rawName.trim().toLowerCase()
  if (!key) return null
  const extracted = orgs.find((o) => o.name.trim().toLowerCase() === key)
  if (extracted) return { name: extracted.name.trim() }
  const roster = rosterOrgs.find((o) => o.name.trim().toLowerCase() === key)
  return roster ? { name: roster.name.trim(), organizationId: roster.id } : null
}

function buildCreateOrganizationArgs(
  o: ExtractedOrganizationCandidate,
  input: ExtractionModelInput
): Record<string, unknown> {
  const args: Record<string, unknown> = {
    name: o.name.trim(),
    contextId: input.fieldContextId,
    contextTitle: input.fieldContextTitle,
    documentId: input.documentId,
  }
  if (o.description && o.description.trim()) {
    args.description = o.description.trim()
  }
  return args
}

/**
 * GOAL-298: a MENTIONED_IN link from a person or organization to a pulse. The
 * invoker carries the resolved NAMES (and, for roster matches, the live id);
 * the ingest orchestrator fills any id it can only learn after the create_*
 * calls execute, keyed by name (person/org) and by (pulseType|title) for the
 * pulse. Kept name-based so a link never depends on ids that don't exist yet.
 */
function buildLinkArgs(params: {
  entityType: 'person' | 'organization'
  entityName: string
  entityId?: string
  pulse: ExtractedPulseCandidate
  pulseId?: string
  input: ExtractionModelInput
}): Record<string, unknown> {
  const { entityType, entityName, entityId, pulse, pulseId, input } = params
  const args: Record<string, unknown> = {
    entityType,
    entityName,
    pulseTitle: pulse.title.trim(),
    pulseType: pulse.kind,
    contextId: input.fieldContextId,
    contextTitle: input.fieldContextTitle,
    documentId: input.documentId,
  }
  if (entityId) {
    if (entityType === 'person') args.personId = entityId
    else args.organizationId = entityId
  }
  if (pulseId) args.pulseId = pulseId
  return args
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
  const args: Record<string, unknown> = {
    firstName: p.firstName.trim(),
    lastName: p.lastName.trim(),
    contextId: input.fieldContextId,
    contextTitle: input.fieldContextTitle,
    documentId: input.documentId,
  }
  // GOAL-314: carry the extracted role/bio phrase so the new PersonPulse has
  // renderable content beyond its name (persisted as p.description).
  if (p.description && p.description.trim()) {
    args.description = p.description.trim()
  }
  return args
}

function buildUpdatePersonArgs(
  p: ExtractedPersonCandidate,
  match: RosterPerson,
  input: ExtractionModelInput
): Record<string, unknown> {
  const args: Record<string, unknown> = {
    personId: match.id,
    firstName: p.firstName.trim(),
    lastName: p.lastName.trim(),
    currentName: match.name,
    contextId: input.fieldContextId,
    contextTitle: input.fieldContextTitle,
    documentId: input.documentId,
  }
  // GOAL-314: a re-encountered person may arrive with a description from this
  // document; pass it so update_person can fill it in when the node has none.
  if (p.description && p.description.trim()) {
    args.description = p.description.trim()
  }
  return args
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
    // The raw provider error routinely carries internals a member can't act on
    // and must never see — OpenAI/Gemini structured-output schema errors
    // ("Invalid schema for response_format 'response': ... Missing 'existingId'"),
    // rate-limit/timeout stack fragments, model ids. Interpolating `message`
    // into member-facing `assistantText` (which the ingest orchestrator persists
    // verbatim into the assistant turn) leaks exactly that — the kb/07 Rule 1
    // violation behind this turn's negative rating. So keep the real error in
    // `reason` (server-side outcome/telemetry only) plus the server log, and
    // hand the member a clean message naming just the human-readable filename.
    console.error('[Ingest Extraction Error]', {
      filename: input.filename,
      documentId: input.documentId,
      error: message,
    })
    return {
      kind: 'failure',
      reason: message,
      assistantText: `I couldn't read ${input.filename} just now — something went wrong on our end while processing it. Please try again in a moment.`,
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

  // GOAL-298: dedup organizations by lowercased name. Roster de-dup and
  // idempotency are enforced at write time (create_organization enriches an
  // existing same-named org in the context rather than duplicating), so a
  // single tool per distinct name is emitted here.
  const rawOrgs = raw.organizations ?? []
  const validOrgs = rawOrgs.filter(isValidOrg)
  const orgByKey = new Map<string, ExtractedOrganizationCandidate>()
  for (const o of validOrgs) {
    const key = normalizeOrgKey(o.name)
    if (!orgByKey.has(key)) orgByKey.set(key, o)
  }
  const uniqueOrgs = Array.from(orgByKey.values())

  if (
    uniquePersons.length === 0 &&
    uniquePulses.length === 0 &&
    uniqueOrgs.length === 0
  ) {
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

  // Organizations are always created (idempotent at write time). No update_*
  // twin — the write path enriches an existing same-named org in place.
  //
  // Unlike persons/pulses, the org candidate's `existingId` is deliberately NOT
  // branched on here. Org dedup is name-in-context at write time
  // (createOrganizationAuthorized), and — unlike a person/pulse, which owns a
  // stable roster id used as the create→attribution join key — an org has no
  // pre-resolved id in the create path. The name is the sole join key between
  // create_organization and the MENTIONED_IN links below, so introducing a
  // second (canonical) name from a roster match would break link resolution
  // (a related name uses the extractor's surface form). `existingId` stays an
  // advisory hint to the model (it steers the model off near-duplicate names);
  // roster de-dup is enforced by the write, not this branch.
  const orgCalls: SynthesizedToolCall[] = uniqueOrgs.map((org) => ({
    tool: 'create_organization',
    args: buildCreateOrganizationArgs(org, input),
  }))

  // MENTIONED_IN links accumulate here — emitted AFTER all create_*/update_*
  // calls so the orchestrator has learned every entity/pulse id by name/title
  // when it executes them. Deduped on (entityType|name|pulseKey).
  const linkCalls: SynthesizedToolCall[] = []
  const seenLinks = new Set<string>()

  const pulseCalls: SynthesizedToolCall[] = uniquePulses.map((p) => {
    const match = resolvePulseMatch(p, input.roster.pulses)
    const pulseId = match?.id
    // Attribution: the single author gets INITIATED_BY (below). Everyone else
    // the document names as related to this pulse gets a MENTIONED_IN link.
    const author = resolveAuthor(p, uniquePersons, input.roster.persons)
    const authorKey = author?.name.trim().toLowerCase() ?? ''

    for (const rawName of p.relatedPersonNames ?? []) {
      const resolved = resolveRelatedPerson(
        rawName,
        uniquePersons,
        input.roster.persons
      )
      if (!resolved) continue
      // The author is already tied to the pulse via INITIATED_BY — don't
      // double-link them as merely mentioned.
      if (resolved.name.trim().toLowerCase() === authorKey) continue
      const key = `person|${resolved.name.trim().toLowerCase()}|${normalizePulseKey(p.kind, p.title)}`
      if (seenLinks.has(key)) continue
      seenLinks.add(key)
      linkCalls.push({
        tool: 'link_entity_to_pulse',
        args: buildLinkArgs({
          entityType: 'person',
          entityName: resolved.name,
          entityId: resolved.personId,
          pulse: p,
          pulseId,
          input,
        }),
      })
    }

    for (const rawName of p.relatedOrganizationNames ?? []) {
      const resolved = resolveRelatedOrg(rawName, uniqueOrgs, input.roster.organizations)
      if (!resolved) continue
      const key = `organization|${resolved.name.trim().toLowerCase()}|${normalizePulseKey(p.kind, p.title)}`
      if (seenLinks.has(key)) continue
      seenLinks.add(key)
      linkCalls.push({
        tool: 'link_entity_to_pulse',
        args: buildLinkArgs({
          entityType: 'organization',
          entityName: resolved.name,
          entityId: resolved.organizationId,
          pulse: p,
          pulseId,
          input,
        }),
      })
    }

    if (match) {
      return { tool: 'update_pulse', args: buildUpdatePulseArgs(p, match, input) }
    }
    const args = buildCreatePulseArgs(p, input)
    // Attribution: always carry the validated author NAME. A roster match
    // also carries its live id — that person may get no person call this run
    // (the model doesn't re-emit hint-only mentions), so the orchestrator's
    // name→id map would never learn them. Extracted candidates carry the name
    // only; the orchestrator resolves their id after the person calls (which
    // run first) have executed.
    if (author) {
      args.attributedToName = author.name
      if (author.personId) args.attributedToPersonId = author.personId
    }
    return { tool: 'create_pulse', args }
  })

  // Order matters: persons + orgs create the nodes, pulses create the pulses,
  // links wire MENTIONED_IN once both endpoints exist. The orchestrator
  // executes in this order and resolves link ids from the earlier results.
  const toolCalls: SynthesizedToolCall[] = [
    ...personCalls,
    ...orgCalls,
    ...pulseCalls,
    ...linkCalls,
  ]

  const assistantText = buildAssistantText({
    input,
    uniquePersons,
    rosterPersons: input.roster.persons,
    skipped,
    uniquePulses,
    rosterPulses: input.roster.pulses,
    droppedPulses: rawPulses.filter((p) => !isValidPulse(p)),
    uniqueOrgs,
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
  uniqueOrgs: ExtractedOrganizationCandidate[]
}): string {
  const {
    input,
    uniquePersons,
    rosterPersons,
    skipped,
    uniquePulses,
    rosterPulses,
    droppedPulses,
    uniqueOrgs,
  } = params
  const parts: string[] = []

  if (
    uniquePersons.length > 0 ||
    uniquePulses.length > 0 ||
    uniqueOrgs.length > 0
  ) {
    const segments: string[] = []
    if (uniquePersons.length > 0) {
      const namesList = uniquePersons
        .map((p) => `${p.firstName.trim()} ${p.lastName.trim()}`)
        .join(', ')
      segments.push(
        `${uniquePersons.length === 1 ? 'one person' : `${uniquePersons.length} people`}: ${namesList}`
      )
    }
    if (uniqueOrgs.length > 0) {
      const orgList = uniqueOrgs.map((o) => `"${o.name.trim()}"`).join(', ')
      segments.push(
        `${uniqueOrgs.length === 1 ? 'one organization' : `${uniqueOrgs.length} organizations`}: ${orgList}`
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
