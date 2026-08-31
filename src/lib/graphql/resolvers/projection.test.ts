/**
 * Regression guard for the shadowed-projection bug.
 *
 * `@neo4j/graphql` resolves a whole query tree in ONE Cypher statement and
 * hands every nested field down on `source`. A hand-written field resolver
 * shadows that projection rather than replacing it — so any resolver that
 * re-queries the graph unconditionally silently drops every nested field the
 * caller selected below it. That is what made
 * `spaces { contexts { parentContext { id } } }` fail with
 *
 *     Cannot return null for non-nullable field FieldContext.parentContext.
 *
 * Pinned in two layers: the helper itself, and every relationship fallback
 * actually registered on the schema — so a fallback added without the guard
 * fails here rather than in the browser.
 */
import { projectedList, relationshipField } from './projection'
import {
  fieldContextRelationshipResolvers,
  personRelationshipResolvers,
  spaceMembershipRelationshipResolvers,
  spaceRelationshipResolvers,
} from './relationship-fallbacks'
import { closeDriver } from '@/lib/neo4j/driver'

// The fallbacks module pulls in the shared Neo4j driver singleton. Nothing
// here opens a session — that is the point of the assertions below — but the
// pool must still be released or the suite hangs after the last test.
afterAll(async () => {
  await closeDriver()
})

describe('projectedList', () => {
  it('returns the library projection when the field is present', () => {
    const rows = [{ id: 'a' }]
    expect(projectedList({ id: 'x', contexts: rows }, 'contexts')).toBe(rows)
  })

  it('returns an empty projection as-is rather than falling through', () => {
    // A genuinely empty relationship must NOT trigger the fallback re-query —
    // that is the "context has no parent" case in the reported bug.
    expect(projectedList({ id: 'x', contexts: [] }, 'contexts')).toEqual([])
  })

  it('returns undefined when the parent carries no projection', () => {
    expect(projectedList({ id: 'x' }, 'contexts')).toBeUndefined()
  })

  it('ignores a non-array value rather than handing back garbage', () => {
    expect(
      projectedList({ id: 'x', contexts: null }, 'contexts')
    ).toBeUndefined()
  })
})

describe('relationshipField', () => {
  it('never calls the fallback when the library already projected the field', async () => {
    const fetch = jest.fn(async () => [{ id: 'from-db' }])
    const resolve = relationshipField('contexts', fetch)

    // Resolved synchronously — the guard short-circuits before any await.
    expect(await resolve({ id: 'x', contexts: [{ id: 'projected' }] })).toEqual(
      [{ id: 'projected' }]
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('falls back for parents materialized by a custom root resolver', async () => {
    const fetch = jest.fn(async () => [{ id: 'from-db' }])
    const resolve = relationshipField('contexts', fetch)

    await expect(resolve({ id: 'x' })).resolves.toEqual([{ id: 'from-db' }])
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('registered relationship fallbacks honour the library projection', () => {
  const registered: Record<
    string,
    Record<string, (source: Record<string, unknown>) => unknown>
  > = {
    Person: personRelationshipResolvers,
    Space: spaceRelationshipResolvers,
    SpaceMembership: spaceMembershipRelationshipResolvers,
    FieldContext: fieldContextRelationshipResolvers,
  }

  const cases = Object.entries(registered).flatMap(([typeName, fields]) =>
    Object.keys(fields).map((field) => [typeName, field] as const)
  )

  it('covers every field on every registered fallback map', () => {
    // Guards the loop above: if the maps are restructured and stop exposing
    // field resolvers, the per-field assertions would pass on nothing.
    expect(cases.map(([t, f]) => `${t}.${f}`).sort()).toEqual([
      'FieldContext.pulses',
      'FieldContext.resonances',
      'Person.memberOf',
      'Person.ownsSpaces',
      'Space.contexts',
      'Space.members',
      'Space.owner',
      'SpaceMembership.member',
      'SpaceMembership.space',
    ])
  })

  it.each(cases)(
    '%s.%s returns the projected rows untouched',
    async (typeName, field) => {
      const projected = [{ id: 'projected-row' }]

      // No Neo4j session may be opened here — if one were, the resolver had
      // ignored the projection and this call would hit the network instead.
      expect(
        await registered[typeName][field]({
          id: 'parent-id',
          [field]: projected,
        })
      ).toEqual(projected)
    }
  )
})
