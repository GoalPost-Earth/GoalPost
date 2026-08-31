import { validateCypher } from './validate'
import { ALLOWED_LABELS, SCHEMA_DOC } from './schema-context'
import { styleFor, NODE_STYLE } from './node-style'

/**
 * GOAL-333 — "assistant cannot find any CoreValues".
 *
 * The fix is almost entirely prompt + whitelist, so nothing else in the repo
 * notices if it regresses. These tests pin the two mechanisms the fix rests on:
 *
 *   1. `:CoreValue` (the provenance marker on every migrated value, and the
 *      ONLY value marker on a pre-GOAL-287 `FieldPulse:StoryPulse:CoreValue`
 *      node) is whitelisted, so the generator may both name and traverse it.
 *      Before the fix the validator rejected it outright — kb/07 Rule 9's
 *      "doubly invisible" failure.
 *   2. The enumeration canonical shape — which reaches content through BOTH
 *      owned Spaces and Spaces the member merely belongs to — passes the
 *      validator. Reaching only through OWNS was the reproduced root cause:
 *      values in a shared WeSpace came back empty in 4/4 runs.
 */

function mockSession() {
  return {
    executeRead: async (fn: (tx: unknown) => unknown) =>
      fn({
        run: async () => ({
          summary: { plan: { operatorType: 'ProduceResults', children: [] } },
        }),
      }),
  } as unknown as Parameters<typeof validateCypher>[1]
}

// The canonical enumeration shape taught in generate.ts. UNION — NOT chained
// OPTIONAL MATCHes. The executor wraps every query as
// `CALL { … } RETURN * LIMIT 60`, a ROW cap, so chaining the two access paths
// multiplies their row counts and the first entity's permutations consume the
// whole budget: profiled at 2 of 245 visible core values delivered. UNION makes
// rows add instead, and the per-branch LIMIT stops one branch starving the other.
const ENUMERATE_VALUES = `
MATCH (user:Person {id: $userId})-[owns:OWNS]->(s:Space)-[hc:HAS_CONTEXT]->(c:FieldContext)-[hp:HAS_PULSE]->(p:FieldPulse)
WHERE p:CoreValuePulse OR p:CoreValue
RETURN owns AS acc, s AS space, hc AS ctxEdge, c AS ctx, hp AS pulseEdge, p AS pulse
LIMIT 28
UNION
MATCH (user:Person {id: $userId})<-[:IS_MEMBER]-(:SpaceMembership)<-[hm:HAS_MEMBER]-(s:Space)-[hc:HAS_CONTEXT]->(c:FieldContext)-[hp:HAS_PULSE]->(p:FieldPulse)
WHERE p:CoreValuePulse OR p:CoreValue
RETURN hm AS acc, s AS space, hc AS ctxEdge, c AS ctx, hp AS pulseEdge, p AS pulse
LIMIT 28
`

// The "and their associated nodes" variant: neighbours gathered into LIST
// columns so they cannot multiply rows.
const ENUMERATE_WITH_NEIGHBOURS = `
MATCH (user:Person {id: $userId})-[owns:OWNS]->(s:Space)-[hc:HAS_CONTEXT]->(c:FieldContext)-[hp:HAS_PULSE]->(p:FieldPulse)
WHERE p:CoreValuePulse OR p:CoreValue
OPTIONAL MATCH (p)-[sem:ALIGNED_TO|ENABLES|DEPENDS_ON]-(rel:FieldPulse)
OPTIONAL MATCH (p)-[ppl:EMBRACES|INITIATED_BY|CREATED_BY]-(per:Person)
WITH owns AS acc, s, hc, c, hp, p,
     collect(DISTINCT sem) AS sems, collect(DISTINCT rel) AS rels,
     collect(DISTINCT ppl) AS ppls, collect(DISTINCT per) AS pers
RETURN acc, s AS space, hc AS ctxEdge, c AS ctx, hp AS pulseEdge, p AS pulse, sems, rels, ppls, pers
LIMIT 28
`

describe('GOAL-333 — core value discovery', () => {
  it('whitelists the :CoreValue provenance marker', () => {
    expect([...ALLOWED_LABELS]).toContain('CoreValue')
  })

  it('accepts the enumeration shape that sweeps owned AND member Spaces', async () => {
    const r = await validateCypher(ENUMERATE_VALUES, mockSession())
    expect(r).toEqual({ ok: true })
  })

  it('accepts the neighbour variant that collect()s into list columns', async () => {
    const r = await validateCypher(ENUMERATE_WITH_NEIGHBOURS, mockSession())
    expect(r).toEqual({ ok: true })
  })

  it('uses UNION rather than chained OPTIONAL MATCH for the two access paths', () => {
    // Chaining multiplies rows against a 60-ROW executor cap; profiled at
    // 2 of 245 core values delivered. UNION makes rows add.
    expect(ENUMERATE_VALUES).toMatch(/\bUNION\b/)
    expect(ENUMERATE_VALUES).not.toMatch(/OPTIONAL MATCH/)
    // Each branch carries its own LIMIT so one cannot starve the other.
    expect(ENUMERATE_VALUES.match(/LIMIT \d+/g)).toHaveLength(2)
  })

  it('leaves the SpaceMembership hop anonymous so it never reaches the canvas', () => {
    // captionFor() falls back to labels[0], so a bound SpaceMembership renders
    // captioned with a raw database label (kb/07 Rule 1) and burns a node slot.
    expect(ENUMERATE_VALUES).toMatch(/<-\[:IS_MEMBER\]-\(:SpaceMembership\)/)
    expect(ENUMERATE_VALUES).not.toMatch(/\(sm:SpaceMembership\)/)
  })

  it('accepts a WHERE predicate testing both value markers', async () => {
    const q = `
      MATCH (user:Person {id: $userId})
      OPTIONAL MATCH (ctx:FieldContext)-[hp:HAS_PULSE]->(v:FieldPulse)
      WHERE v:CoreValuePulse OR v:CoreValue
      RETURN user, ctx, hp, v
      LIMIT 60
    `
    const r = await validateCypher(q, mockSession())
    expect(r).toEqual({ ok: true })
  })

  it('reaches member Spaces through SpaceMembership, not only OWNS', () => {
    // The reproduced root cause: an OWNS-only anchor. Both traversals must be
    // present in the shape the generator is taught.
    expect(ENUMERATE_VALUES).toMatch(/\[owns:OWNS\]/)
    expect(ENUMERATE_VALUES).toMatch(/\[:IS_MEMBER\]/)
    expect(ENUMERATE_VALUES).toMatch(/\[hm:HAS_MEMBER\]/)
  })

  it('tells the generator to match values by BOTH markers', () => {
    expect(SCHEMA_DOC).toMatch(/CoreValuePulse OR v:CoreValue/)
  })

  describe('styleFor — the value marker wins over the base/story labels', () => {
    // Neo4j gives no ordering guarantee on labels, and a legacy value carries
    // :StoryPulse. Without the precedence branch a core value painted as a goal
    // (FieldPulse blue) or a story (violet) on the canvas.
    it('paints a legacy FieldPulse:StoryPulse:CoreValue as a core value', () => {
      expect(styleFor(['FieldPulse', 'StoryPulse', 'CoreValue'])).toEqual(
        NODE_STYLE.CoreValuePulse
      )
    })

    it('paints a backfilled CoreValue:FieldPulse:CoreValuePulse as a core value', () => {
      expect(styleFor(['CoreValue', 'FieldPulse', 'CoreValuePulse'])).toEqual(
        NODE_STYLE.CoreValuePulse
      )
    })

    // Label order is not guaranteed, so the generic base label must never win
    // over the subtype — otherwise a story/care/resource all paint FieldPulse
    // blue and the "associated nodes" around a value become indistinguishable.
    it.each([
      [['FieldPulse', 'StoryPulse'], 'StoryPulse'],
      [['StoryPulse', 'FieldPulse'], 'StoryPulse'],
      [['FieldPulse', 'CarePulse'], 'CarePulse'],
      [['FieldPulse', 'ResourcePulse'], 'ResourcePulse'],
      [['FieldPulse', 'GoalPulse'], 'GoalPulse'],
      [['Person', 'PersonPulse'], 'PersonPulse'],
      [['Space', 'WeSpace'], 'WeSpace'],
    ] as const)('paints %j as %s', (labels, expected) => {
      expect(styleFor([...labels])).toEqual(NODE_STYLE[expected])
    })

    it('falls back to the base label when there is no subtype', () => {
      expect(styleFor(['FieldPulse'])).toEqual(NODE_STYLE.FieldPulse)
    })
  })
})
