import { GraphQLError, type ASTVisitor, type ValidationContext } from 'graphql'
import type { Plugin } from 'graphql-yoga'
import logger from '@/lib/logger'

/**
 * GOAL-372 — keep the PII gate's `@cypher` predicate out of client documents.
 *
 * `PersonPrivateProfile.callerCanRead` exists ONLY to be referenced by that
 * type's `@authorization` filter. It is `@selectable(onRead: false)`, so it is
 * absent from every output type, and no sort input is generated for it. What
 * could not be closed declaratively is the WHERE side: `@filterable(byValue:
 * false)` removes `callerCanRead_EQ` from `PersonPrivateProfileWhere`, and
 * `@authorization` is validated against that same generated input — so hiding
 * the predicate from the client also hides it from the directive, and the
 * schema fails to build with `Field "callerCanRead_EQ" is not defined by type`.
 * The library offers no way to expose a predicate to `@authorization` only.
 *
 * So `callerCanRead_EQ` is reachable from `PersonWhere.privateProfile`. Two
 * reasons to reject it here rather than leave it:
 *
 *  1. It does not work, and that is an accident. `@neo4j/graphql` v6.6.4 emits
 *     a cypher-field filter without binding the variable it then compares —
 *     `CALL { … } WITH * WHERE var2 = $param0`, where `var2` is never defined —
 *     so today the query reaches Neo4j and dies with
 *     `Neo.ClientError.Statement.SyntaxError: Variable 'var2' not defined`.
 *     Any authenticated caller can trigger that with a three-line document, and
 *     a routine library upgrade that fixes the emission turns the predicate
 *     live on the public surface with nothing in the repo noticing.
 *  2. Even live it is information-free — one Boolean, computed against the
 *     caller's OWN `$jwt.user.id`, answering exactly what `privateProfile { id }`
 *     already answers by returning null. That argument is why this is not an
 *     urgent hole. It is not a reason to keep the surface.
 *
 * Rejecting at validation makes the gate closed BY DESIGN rather than by
 * library bug, and costs one AST visit over documents that are already
 * depth- and token-limited (query-limits.ts).
 *
 * This is an authorization-surface control, which is why it does not live in
 * query-limits.ts — that file is explicitly a DoS control.
 */

/** Input-object field names that only the server may ever supply. */
const SERVER_ONLY_INPUT_FIELDS = new Set([
  'callerCanRead',
  'callerCanRead_EQ',
  'callerCanRead_IN',
])

export function gateFieldGuardRule(context: ValidationContext): ASTVisitor {
  return {
    ObjectField(node) {
      if (SERVER_ONLY_INPUT_FIELDS.has(node.name.value)) {
        // Same reasoning as query-limits.ts `onReject`: nothing the app sends
        // can trip this, so a rejection means someone is reading the schema and
        // poking at the gate. Worth seeing.
        logger.warn('[graphql] request referenced a server-only gate field', {
          field: node.name.value,
        })
        context.reportError(
          new GraphQLError(
            `Field "${node.name.value}" is not available on this schema.`,
            { nodes: node }
          )
        )
      }
    },
  }
}

export function createGateFieldGuardPlugin(): Plugin {
  return {
    onValidate({ addValidationRule }) {
      addValidationRule(gateFieldGuardRule)
    },
  }
}

export const __testing = { SERVER_ONLY_INPUT_FIELDS }
