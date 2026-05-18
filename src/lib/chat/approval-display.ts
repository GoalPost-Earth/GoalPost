/**
 * Pure presentation helpers for the batch HITL Dialog (GOAL-237). The dialog
 * renders one row per pending tool call, and each row offers inline editing
 * of human-meaningful fields. These helpers turn (tool, args) into the rows
 * and labels the UI displays — strictly Rule-1 compliant (no __typename, no
 * raw ids, no internal flags).
 *
 * Kept under src/lib/chat (not src/components) so they can be exercised in
 * Node-env Jest without pulling in jsdom.
 */

export interface EditableField {
  fieldName: string
  label: string
  value: string
  multiline: boolean
}

/**
 * Human-readable label for the entity kind a pending approval will create.
 * Mirrors `pulseTypeLabel` in hitl.ts; both must stay aligned so the dialog
 * header copy matches the per-row describeWriteAction summary.
 */
export function entityKindLabel(
  tool: string,
  args: Record<string, unknown>
): string {
  if (tool === 'create_person') return 'person'
  if (tool === 'create_pulse') {
    const pulseType = String(args.pulseType ?? '').trim()
    switch (pulseType) {
      case 'GoalPulse':
        return 'goal'
      case 'ResourcePulse':
        return 'resource'
      case 'StoryPulse':
        return 'story'
      case 'CarePulse':
        return 'care note'
      case 'CoreValuePulse':
        return 'core value'
      default:
        return 'pulse'
    }
  }
  return 'action'
}

interface FieldSpec {
  fieldName: string
  label: string
  multiline?: boolean
  numeric?: boolean
}

const PERSON_FIELDS: FieldSpec[] = [
  { fieldName: 'firstName', label: 'First name' },
  { fieldName: 'lastName', label: 'Last name' },
]

const PULSE_COMMON_FIELDS: FieldSpec[] = [
  { fieldName: 'title', label: 'Title' },
  { fieldName: 'content', label: 'Content', multiline: true },
]

const PULSE_KIND_SPECIFIC_FIELDS: Record<string, FieldSpec[]> = {
  GoalPulse: [
    { fieldName: 'horizon', label: 'Horizon' },
    { fieldName: 'status', label: 'Status' },
    { fieldName: 'intensity', label: 'Intensity', numeric: true },
    { fieldName: 'why', label: 'Why', multiline: true },
  ],
  ResourcePulse: [
    { fieldName: 'resourceType', label: 'Resource type' },
    { fieldName: 'availability', label: 'Availability', numeric: true },
    { fieldName: 'why', label: 'Why', multiline: true },
  ],
  StoryPulse: [
    { fieldName: 'why', label: 'Why', multiline: true },
    { fieldName: 'location', label: 'Location' },
    { fieldName: 'time', label: 'Time' },
  ],
}

const NUMERIC_FIELDS = new Set(
  Object.values(PULSE_KIND_SPECIFIC_FIELDS)
    .flat()
    .filter((f) => f.numeric)
    .map((f) => f.fieldName)
)

function specToField(
  spec: FieldSpec,
  args: Record<string, unknown>
): EditableField | null {
  const raw = args[spec.fieldName]
  if (raw === undefined || raw === null) return null
  const value = String(raw).trim()
  if (value.length === 0) return null
  return {
    fieldName: spec.fieldName,
    label: spec.label,
    value: String(raw),
    multiline: Boolean(spec.multiline),
  }
}

/**
 * Ordered list of fields the user can edit before approving a pending tool
 * call. Internal-only args (contextId, contextTitle, documentId, pulseType,
 * etc.) are never returned — they remain on the merged args via
 * `applyFieldEdits` so the runtime executor still sees them.
 */
export function getEditableFields(
  tool: string,
  args: Record<string, unknown>
): EditableField[] {
  if (tool === 'create_person') {
    return PERSON_FIELDS.map((spec) => specToField(spec, args)).filter(
      (f): f is EditableField => f !== null
    )
  }
  if (tool === 'create_pulse') {
    const pulseType = String(args.pulseType ?? '').trim()
    const kindFields = PULSE_KIND_SPECIFIC_FIELDS[pulseType] ?? []
    return [...PULSE_COMMON_FIELDS, ...kindFields]
      .map((spec) => specToField(spec, args))
      .filter((f): f is EditableField => f !== null)
  }
  return []
}

/**
 * Merge user-edited field values back into the original args. Internal
 * fields (contextId, documentId, pulseType, contextTitle) are preserved so
 * the runtime executor still receives them.
 *
 * Numeric edits for fields like intensity/availability are coerced via
 * Number(); invalid coercions fall back to the original value rather than
 * NaN-ing out the payload.
 */
export function applyFieldEdits(
  args: Record<string, unknown>,
  edits: Record<string, string>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...args }
  for (const [key, raw] of Object.entries(edits)) {
    if (NUMERIC_FIELDS.has(key)) {
      const parsed = Number(raw)
      if (Number.isFinite(parsed)) {
        merged[key] = parsed
      }
      continue
    }
    merged[key] = raw
  }
  return merged
}
