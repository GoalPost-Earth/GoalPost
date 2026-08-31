import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Neo4jGraphQL } from '@neo4j/graphql'
import {
  parse,
  validate,
  type GraphQLInputObjectType,
  type GraphQLSchema,
} from 'graphql'

/**
 * GOAL-341 nested-write guard — no database required.
 *
 * `PromiseWeave` shipped read-only under GOAL-266 (`@mutation(operations: [])`)
 * and GOAL-341 opened CREATE/UPDATE/DELETE for member authoring. Opening the
 * ROOT mutations also opens a whole nested-input tree that `@neo4j/graphql`
 * generates from every `@relationship` on the type, and the pre-merge security
 * review walked through three doors it left open:
 *
 * 1. `deletePromiseWeaves(delete: { context: ... })` cascaded a bare
 *    DETACH DELETE into the parent FieldContext. Every pulse in that field was
 *    left with no HAS_PULSE anchor and no `deletedAt` stamp — invisible to
 *    every read, undeletable, and never collected by the 90-day purge cron.
 *    That is what GOAL-319 removed `deleteFieldContexts` to prevent.
 * 2. Any MEMBER could `disconnect` a weave's `context` edge. The type-level
 *    `validate` block enumerates CREATE/UPDATE/DELETE and so never matches
 *    DELETE_RELATIONSHIP; only the READ filter applied, and it admits any
 *    member. The weave became unreadable, unwritable and undeletable by
 *    everyone including its author — a permanent ghost.
 * 3. `createdBy` is a plain nested CONNECT, so a member could attribute a
 *    weave to the Space owner and the entity-info drawer rendered it verbatim.
 *
 * The fix enumerates `nestedOperations` per edge and pins authorship with a
 * CREATE-scoped `createdBy_SINGLE` rule. This suite compiles the real
 * schema.gql against a stub driver and asserts those doors stay shut, so a
 * regression fails here rather than in production.
 *
 * See kb/05-data-entities.md (PromiseWeave) and
 * docs/promise-weave-design-spike.md §10.
 */

function makeRecord(obj: Record<string, unknown>) {
  const values = Object.values(obj)
  return {
    get: (k: string | number) => (typeof k === 'number' ? values[k] : obj[k]),
    keys: Object.keys(obj),
    [Symbol.iterator]: function* () {
      yield* values
    },
  }
}

const stubTx = {
  run: async (cypher: string) => {
    if (cypher.includes('dbms.components')) {
      return {
        records: [makeRecord({ version: '5.26.0', edition: 'enterprise' })],
      }
    }
    return {
      records: [],
      summary: {
        counters: { updates: () => ({}), containsUpdates: () => false },
      },
    }
  },
}

const stubDriver = {
  session: () => ({
    executeRead: async (fn: (tx: typeof stubTx) => unknown) => fn(stubTx),
    executeWrite: async (fn: (tx: typeof stubTx) => unknown) => fn(stubTx),
    run: (c: string) => stubTx.run(c),
    close: async () => {},
  }),
  close: async () => {},
}

const SDL_PATH = path.join(process.cwd(), 'src/lib/graphql/schema/schema.gql')

let schema: GraphQLSchema
let sdl: string

beforeAll(async () => {
  sdl = readFileSync(SDL_PATH, 'utf8')
  schema = await new Neo4jGraphQL({
    typeDefs: sdl,
    resolvers: {
      Person: {
        name: (s: { firstName: string; lastName: string }) =>
          `${s.firstName} ${s.lastName}`,
      },
      User: {
        name: (s: { firstName: string; lastName: string }) =>
          `${s.firstName} ${s.lastName}`,
      },
      Document: { downloadUrl: () => null },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    driver: stubDriver as any,
    features: {
      authorization: { key: 'promise-weave-nested-write-guard' },
      excludeDeprecatedFields: {
        implicitEqualFilters: true,
        implicitSet: true,
        deprecatedOptionsArgument: true,
        directedArgument: true,
        connectOrCreate: true,
      },
    },
  }).getSchema()
}, 60_000)

/** Input-object field names, or null when the type no longer exists at all. */
function inputFields(name: string): string[] | null {
  const type = schema.getType(name) as GraphQLInputObjectType | undefined
  return type?.getFields ? Object.keys(type.getFields()) : null
}

/** True when the document is rejected by schema validation. */
function rejected(document: string): boolean {
  return validate(schema, parse(document)).length > 0
}

/** The `type PromiseWeave` block of the raw SDL, directives included. */
function promiseWeaveBlock(): string {
  const from = sdl.indexOf('type PromiseWeave')
  return sdl.slice(from, sdl.indexOf('\n}', from))
}

describe('PromiseWeave nested writes', () => {
  describe('the FieldContext delete cascade (finding 1)', () => {
    it('exposes no context cascade on the delete input', () => {
      const fields = inputFields('PromiseWeaveDeleteInput')
      expect(fields ?? []).not.toContain('context')
    })

    it('rejects deletePromiseWeaves(delete:)', () => {
      expect(
        rejected(`mutation {
          deletePromiseWeaves(
            where: { id_EQ: "w" }
            delete: { context: [{ where: {} }] }
          ) { nodesDeleted }
        }`)
      ).toBe(true)
    })

    it('rejects the same cascade reached through update', () => {
      expect(
        rejected(`mutation {
          updatePromiseWeaves(
            where: { id_EQ: "w" }
            update: { context: [{ delete: [{ where: {} }] }] }
          ) { info { nodesDeleted } }
        }`)
      ).toBe(true)
    })

    it('closes the reverse door on FieldContext', () => {
      // `FieldContext.weaves` is nestedOperations: [] — it reaches the same
      // input tree from the other side.
      expect(inputFields('FieldContextUpdateInput') ?? []).not.toContain(
        'weaves'
      )
    })
  })

  describe('the ghost-weave disconnect (finding 2)', () => {
    it('offers CONNECT only on the context edge', () => {
      const fields = inputFields('PromiseWeaveContextUpdateFieldInput') ?? []
      expect(fields).toContain('connect')
      expect(fields).not.toContain('disconnect')
      expect(fields).not.toContain('delete')
    })

    it('rejects disconnecting the visibility anchor', () => {
      expect(
        rejected(`mutation {
          updatePromiseWeaves(
            where: { id_EQ: "w" }
            update: { context: [{ disconnect: [{ where: {} }] }] }
          ) { info { relationshipsDeleted } }
        }`)
      ).toBe(true)
    })
  })

  describe('forged authorship (finding 3)', () => {
    it('pins createdBy to the caller at CREATE', () => {
      const block = promiseWeaveBlock()
      expect(block).toContain('operations: [CREATE]')
      expect(block).toContain('createdBy_SINGLE: { id_EQ: "$jwt.user.id" }')
    })

    it('never lets createdBy be disconnected or deleted', () => {
      const fields = inputFields('PromiseWeaveCreatedByUpdateFieldInput') ?? []
      expect(fields).toContain('connect')
      expect(fields).not.toContain('disconnect')
      expect(fields).not.toContain('delete')
    })
  })

  describe('the authoring paths the hook actually uses still work', () => {
    it('accepts the create shape from usePromiseWeaves', () => {
      expect(
        rejected(`mutation {
          createPromiseWeaves(input: [{
            title: "t"
            description: null
            status: "active"
            origin: "user"
            createdAt: "2026-01-01T00:00:00Z"
            weaves: { connect: [{ where: { node: { id_IN: ["p"] } } }] }
            wovenFor: { connect: [{ where: { node: { id_EQ: "pe" } } }] }
            createdBy: { connect: [{ where: { node: { id_EQ: "me" } } }] }
            context: { connect: [{ where: { node: { id_EQ: "c" } } }] }
          }]) { promiseWeaves { id } }
        }`)
      ).toBe(false)
    })

    it('accepts the edit shape, including untick-to-remove', () => {
      // disconnect + connect inside ONE field entry is what makes removing a
      // pulse actually remove it (kb/05-data-entities.md).
      expect(
        rejected(`mutation {
          updatePromiseWeaves(
            where: { id_EQ: "w" }
            update: {
              title_SET: "t"
              status_SET: "active"
              modifiedAt_SET: "2026-01-01T00:00:00Z"
              weaves: [
                { disconnect: [{ where: {} }] }
                { connect: [{ where: { node: { id_IN: ["p"] } } }] }
              ]
            }
          ) { promiseWeaves { id } }
        }`)
      ).toBe(false)
    })

    it('keeps ordinary deletion working', () => {
      expect(
        rejected(`mutation {
          deletePromiseWeaves(where: { id_EQ: "w" }) {
            nodesDeleted
            relationshipsDeleted
          }
        }`)
      ).toBe(false)
    })

    it('keeps connect+disconnect on the woven pulses and person', () => {
      for (const input of [
        'PromiseWeaveWeavesUpdateFieldInput',
        'PromiseWeaveWovenForUpdateFieldInput',
      ]) {
        const fields = inputFields(input) ?? []
        expect(fields).toContain('connect')
        expect(fields).toContain('disconnect')
        expect(fields).not.toContain('delete')
      }
    })
  })
})
