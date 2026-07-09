import { z } from 'zod'
import { ExtractionSchema, mapExtractionObject } from './extraction-schema'

/**
 * Regression guard for GOAL-282.
 *
 * OpenAI structured outputs run in strict mode (the AI SDK default for
 * `generateObject`). Strict mode requires every property of every object in
 * the response schema to appear in that object's `required` array; a field
 * declared `.optional()` is dropped from `required` and OpenAI rejects the
 * whole extraction call:
 *
 *   Invalid schema for response_format 'response': ... 'required' is required
 *   to be supplied and to be an array including every key in properties.
 *   Missing 'existingId'.
 *
 * DOCX (and every other office/text upload) routes through the OpenAI client,
 * so a single stray `.optional()` silently breaks document ingest. These
 * tests walk the generated JSON schema and fail if any property is not
 * required, catching a reintroduced `.optional()` before it ships.
 */

/** Collect `path.key` for every object property missing from its `required`. */
function collectNonRequired(
  node: unknown,
  path: string,
  out: string[]
): void {
  if (!node || typeof node !== 'object') return
  const schema = node as Record<string, unknown>

  const properties = schema.properties as
    | Record<string, unknown>
    | undefined
  if (properties && typeof properties === 'object') {
    const required = new Set(
      Array.isArray(schema.required) ? (schema.required as string[]) : []
    )
    for (const key of Object.keys(properties)) {
      if (!required.has(key)) out.push(`${path}.${key}`)
      collectNonRequired(properties[key], `${path}.${key}`, out)
    }
  }

  if (schema.items) collectNonRequired(schema.items, `${path}[]`, out)
  // `.nullable()` renders as anyOf[type, null]; recurse so nested objects
  // inside a nullable branch are still checked.
  if (Array.isArray(schema.anyOf)) {
    for (const sub of schema.anyOf) collectNonRequired(sub, path, out)
  }
}

describe('ExtractionSchema — OpenAI strict-mode contract (GOAL-282)', () => {
  it('marks every property required so OpenAI strict structured outputs accepts it', () => {
    // `z.toJSONSchema` is an adjacent artifact, not the exact payload the AI
    // SDK transmits (the provider runs its own zod→JSON-schema conversion).
    // Both conversions drop a `.optional()` field from `required`, so this
    // still catches the GOAL-282 regression — it just isn't the wire schema.
    const json = z.toJSONSchema(ExtractionSchema)
    // The walker below assumes subschemas are inlined (no `$ref`/`$defs`).
    // Zod 4 inlines by default; assert it so a future change to ref output
    // can't let the walker silently skip a ref'd object's properties.
    expect(JSON.stringify(json)).not.toContain('$ref')
    const violations: string[] = []
    collectNonRequired(json, '$', violations)
    expect(violations).toEqual([])
  })

  it('still allows the model to omit values via null (existingId on persons)', () => {
    const json = z.toJSONSchema(ExtractionSchema) as unknown as {
      properties: {
        persons: { items: { properties: { existingId: { anyOf?: unknown[] } } } }
      }
    }
    const existingId = json.properties.persons.items.properties.existingId
    // anyOf[string, null] — required, but null is a legal value.
    expect(existingId.anyOf).toEqual(
      expect.arrayContaining([{ type: 'null' }])
    )
  })
})

describe('mapExtractionObject (GOAL-282)', () => {
  it('normalises null optional fields back to undefined', () => {
    const out = mapExtractionObject({
      persons: [{ firstName: 'Sarah', lastName: 'Chen', existingId: null }],
      pulses: [
        {
          kind: 'GoalPulse',
          title: 'Ship v1',
          content: 'Ship the v1 ingest pipeline.',
          existingId: null,
          authorName: null,
          status: null,
          intensity: null,
          horizon: null,
          resourceType: null,
          availability: null,
          why: null,
          location: null,
          time: null,
        },
      ],
      assistantText: 'Found one person and one goal.',
    })

    expect(out.persons[0].existingId).toBeUndefined()
    expect(out.pulses?.[0].existingId).toBeUndefined()
    expect(out.pulses?.[0].authorName).toBeUndefined()
    expect(out.pulses?.[0].status).toBeUndefined()
    expect(out.pulses?.[0].intensity).toBeUndefined()
  })

  it('treats a null pulses array as no pulses', () => {
    const out = mapExtractionObject({
      persons: [],
      pulses: null,
      assistantText: 'Nothing structured here.',
    })
    expect(out.pulses).toEqual([])
  })

  it('preserves real values (including 0) and existing ids', () => {
    const out = mapExtractionObject({
      persons: [{ firstName: 'Ada', lastName: 'Lovelace', existingId: 'person_1' }],
      pulses: [
        {
          kind: 'ResourcePulse',
          title: 'Compute budget',
          content: 'A small compute budget is available.',
          existingId: 'pulse_9',
          authorName: 'Ada Lovelace',
          status: null,
          intensity: 0,
          horizon: null,
          resourceType: 'budget',
          availability: 0,
          why: null,
          location: null,
          time: null,
        },
      ],
      assistantText: 'ok',
    })

    expect(out.persons[0].existingId).toBe('person_1')
    expect(out.pulses?.[0].existingId).toBe('pulse_9')
    expect(out.pulses?.[0].authorName).toBe('Ada Lovelace')
    expect(out.pulses?.[0].intensity).toBe(0)
    expect(out.pulses?.[0].availability).toBe(0)
    expect(out.pulses?.[0].resourceType).toBe('budget')
  })
})
