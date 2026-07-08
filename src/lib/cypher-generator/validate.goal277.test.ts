import { validateCypher } from './validate'

// Mock session whose EXPLAIN returns a plan with no write operators, so the
// test exercises the static checks (keyword/label/relationship/anchor) that
// run before the planner step.
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

const NON_MEMBERS = `
MATCH (user:Person {id: $userId})
OPTIONAL MATCH (user)-[ct:CONNECTED_TO]-(other:Person)
WHERE NOT other:User
OPTIONAL MATCH (user)-[owns:OWNS]->(sp:Space)-[hc:HAS_CONTEXT]->(ctx:FieldContext)-[hpn:HAS_PERSON]->(attached:Person)
WHERE NOT attached:User
RETURN user, ct, other, owns, sp, hc, ctx, hpn, attached
LIMIT 50
`

const MEMBERS = `
MATCH (user:Person {id: $userId})
OPTIONAL MATCH (user)-[ct:CONNECTED_TO]-(m:Person:User)
RETURN user, ct, m
LIMIT 50
`

const WEAVE = `
MATCH (user:Person {id: $userId})
MATCH (ctx:FieldContext)-[hw:HAS_WEAVE]->(w:PromiseWeave)
OPTIONAL MATCH (w)-[wv:WEAVES]->(fp:FieldPulse)
OPTIONAL MATCH (w)-[wf:WOVEN_FOR]->(per:Person)
RETURN user, ctx, hw, w, wv, fp, wf, per
LIMIT 25
`

const PATH_VIA_NONMEMBER = `
MATCH (user:Person {id: $userId})
MATCH (a:Person {id: "p1"}), (b:Person {id: "p2"})
OPTIONAL MATCH p = shortestPath((a)-[:OWNS|HAS_MEMBER|IS_MEMBER|HAS_CONTEXT|HAS_PULSE|HAS_PERSON|HAS_RESONANCE|INITIATED_BY|CREATED_BY|CONNECTED_TO|SOURCE|TARGET|RESONATES_AS*..6]-(b))
RETURN a, b, p
LIMIT 1
`

// Pulses authored by a person — must traverse the canonical INITIATED_BY
// author edge alongside the legacy CREATED_BY alias, or every modern pulse
// (including doc-ingest attributed ones) is invisible to "pulses by X".
const PULSES_BY_PERSON = `
MATCH (user:Person {id: $userId})
MATCH (author:Person {id: "p1"})
OPTIONAL MATCH (author)<-[cb:INITIATED_BY|CREATED_BY]-(p:FieldPulse)
OPTIONAL MATCH (ctx:FieldContext)-[hp:HAS_PULSE]->(p)
RETURN user, author, cb, p, hp, ctx
LIMIT 50
`

describe('GOAL-277 cypher validator — member/non-member + weave + authorship traversal', () => {
  it('accepts a non-member sweep using WHERE NOT x:User + HAS_PERSON', async () => {
    const r = await validateCypher(NON_MEMBERS, mockSession())
    expect(r).toEqual({ ok: true })
  })

  it('accepts a members-only sweep using :Person:User', async () => {
    const r = await validateCypher(MEMBERS, mockSession())
    expect(r).toEqual({ ok: true })
  })

  it('accepts PromiseWeave traversal', async () => {
    const r = await validateCypher(WEAVE, mockSession())
    expect(r).toEqual({ ok: true })
  })

  it('accepts shortest-path with HAS_PERSON in the disjunction', async () => {
    const r = await validateCypher(PATH_VIA_NONMEMBER, mockSession())
    expect(r).toEqual({ ok: true })
  })

  it('accepts pulse authorship via INITIATED_BY|CREATED_BY (attribution)', async () => {
    const r = await validateCypher(PULSES_BY_PERSON, mockSession())
    expect(r).toEqual({ ok: true })
  })

  it('rejects a non-whitelisted relationship type (whitelist boundary)', async () => {
    const bad = `
      MATCH (user:Person {id: $userId})
      OPTIONAL MATCH (user)-[r:BEFRIENDS]-(other:Person)
      RETURN user, r, other
      LIMIT 25
    `
    const r = await validateCypher(bad, mockSession())
    expect(r.ok).toBe(false)
  })
})
