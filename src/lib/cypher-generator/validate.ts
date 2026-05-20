/**
 * Cypher safety validator.
 *
 * Defense in depth — the validator pipeline runs in order, cheapest checks
 * first. Each step has a single responsibility and a clear failure
 * message, so the orchestrator can pass the reason back to the generator
 * LLM as a correction hint.
 *
 *  1. Forbidden-keyword regex — catches obvious writes / LOAD CSV.
 *  2. Backtick rejection — Cypher allows identifier quoting via
 *     backticks (`:`SomeLabel``), which silently bypasses any
 *     `:Label` regex that only matches identifiers. Treated as
 *     suspicious — no legitimate generated query needs it.
 *  3. CALL ban — blocks `apoc.cypher.run*` and procedure-eval
 *     bypasses. Token-level, not regex-with-lookahead: even
 *     `CALL\n\tapoc.do.when()` matches.
 *  4. labels() ban — Cypher's `labels(n)` predicate lets a query
 *     return arbitrary labels via `WHERE "Log" IN labels(n)` without
 *     ever writing `:Log`. Banned alongside untyped-MATCH (#6).
 *  5. Label whitelist — every `:LabelName` token must be in
 *     ALLOWED_LABELS. Negative-lookbehind on `:` skips property-map
 *     keys like `{since: 2024}`.
 *  6. Relationship whitelist — same for `[:REL]` / `[:A|B]` / `[*:REL]`.
 *  7. Every node-pattern variable must carry an explicit label. A
 *     bare `MATCH (n)` would otherwise scan all labels in the graph;
 *     combined with the post-filter this is a leak surface.
 *  8. `$userId` presence AND a `:Person {id: $userId}` traversal —
 *     auth must be anchored on the runtime user inside the query,
 *     not just mentioned somewhere.
 *  9. `EXPLAIN` — Neo4j's own plan inspection. Any Write/Delete/Merge/
 *     Remove/SetProperty/LoadCSV operator in the plan tree rejects the
 *     query. This is the authoritative read-only gate; everything above
 *     is fast pre-filtering for better error messages.
 *
 * String literals + comments are stripped before tokenization so a
 * Cypher value like `"CREATE table"` or `/* CREATE *\/` does not trip
 * the keyword filter.
 */

import { Session } from 'neo4j-driver'
import {
  ALLOWED_LABELS_SET,
  ALLOWED_RELATIONSHIPS_SET,
} from './schema-context'

export type ValidationOk = { ok: true }
export type ValidationErr = { ok: false; reason: string }
export type ValidationResult = ValidationOk | ValidationErr

const FORBIDDEN_KEYWORDS =
  /\b(CREATE|MERGE|SET|DELETE|REMOVE|DETACH|DROP|LOAD\s+CSV|FOREACH)\b/i

const WRITE_PLAN_OPERATORS = /create|delete|merge|set|remove|loadcsv/i

function stripStringLiterals(input: string): string {
  let out = ''
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    if (ch === '"' || ch === "'") {
      const quote = ch
      i++
      while (i < input.length && input[i] !== quote) {
        if (input[i] === '\\' && i + 1 < input.length) {
          i += 2
          continue
        }
        i++
      }
      // skip closing quote (or end of input)
      if (i < input.length) i++
      out += ' '
      continue
    }
    if (ch === '/' && input[i + 1] === '/') {
      while (i < input.length && input[i] !== '\n') i++
      continue
    }
    if (ch === '/' && input[i + 1] === '*') {
      i += 2
      while (
        i < input.length - 1 &&
        !(input[i] === '*' && input[i + 1] === '/')
      ) {
        i++
      }
      // advance past the closing `*/` if present; bail otherwise
      if (i < input.length - 1) i += 2
      else i = input.length
      continue
    }
    out += ch
    i++
  }
  return out
}

function isLikelyRelationshipToken(
  source: string,
  matchIndex: number
): boolean {
  // Walk backwards from the matched `:` to determine whether this
  // `:Identifier` token is inside `[...]` (relationship) or `(...)` /
  // bare (node label).
  for (let i = matchIndex - 1; i >= 0; i--) {
    const c = source[i]
    if (c === '[') return true
    if (c === '(' || c === ',' || c === '{') return false
    if (c === ']' || c === ')' || c === '\n' || c === ';') return false
  }
  return false
}

/**
 * True if the `:` at `matchIndex` is inside a Cypher property map
 * `{key: value}`. Used to skip property-map keys (which would
 * otherwise be parsed as bogus label tokens). Walks backwards through
 * a small window looking for the nearest `{` or pattern-opener.
 */
function isInsidePropertyMap(source: string, matchIndex: number): boolean {
  let depth = 0
  for (let i = matchIndex - 1; i >= 0; i--) {
    const c = source[i]
    if (c === '}') depth++
    else if (c === '{') {
      if (depth === 0) return true
      depth--
    } else if (c === '(' || c === '[') {
      // Reached the enclosing pattern without crossing a `{` — not in
      // a property map.
      return false
    } else if (c === ')' || c === ']' || c === ';') {
      return false
    }
  }
  return false
}

/**
 * Walk every node-pattern in the source and collect variable names that
 * are introduced with at least one label, e.g. `(user:Person)`, `(s:Space)`,
 * `(user:Person:Foo {…})`. Subsequent re-uses like `(user)-[…]->…` are
 * then safe because the variable is already typed.
 */
function collectLabelBoundVariables(stripped: string): Set<string> {
  const bound = new Set<string>()
  // Match `(name:Label …)` with optional whitespace and label tail.
  const re = /\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/g
  let m: RegExpExecArray | null
  while ((m = re.exec(stripped)) !== null) {
    // Skip function calls — these attach the `(` directly to an
    // identifier with no whitespace between them (e.g. `count(`,
    // `coalesce(`, `toLower(`). Cypher node patterns always have at
    // least one whitespace or operator char before the `(`
    // (e.g. `MATCH (`, `->( `, `, (`, ` (`), so a direct-attach is
    // the unambiguous signal of a function call.
    const start = m.index
    if (start > 0 && /[A-Za-z0-9_]/.test(stripped[start - 1])) continue
    bound.add(m[1])
  }
  return bound
}

/**
 * Verify every node pattern `(var:Label …)` has at least one label.
 * Cypher node patterns are `(name?:Label?:Label? {props}?)` — bare
 * `(n)` matches every label in the database. The validator could not
 * detect that node's actual labels at parse time, so the safest
 * behavior is to require explicit labels.
 *
 * This is a textual scan, not a full Cypher parse — it walks every
 * `(` in the stripped source, finds the balanced `)`, and inspects
 * the content. False positives are possible in extremely contorted
 * queries (e.g. `()` empty patterns); those would also be rejected
 * because they're not useful anyway.
 */
function checkAllNodePatternsHaveLabels(
  stripped: string,
  labelBoundVars: Set<string>
): string | null {
  for (let i = 0; i < stripped.length; i++) {
    if (stripped[i] !== '(') continue
    // Skip function calls — these attach `(` directly to an identifier
    // with no whitespace (e.g. `count(`, `coalesce(`). Cypher node
    // patterns always have whitespace or an operator before the `(`,
    // so a direct-attach unambiguously means a function call.
    if (i > 0 && /[A-Za-z0-9_]/.test(stripped[i - 1])) continue
    // Walk forward to find balanced `)`. Stop at the first `)` since
    // parenthesised expressions inside WHERE clauses are also caught here
    // — that's fine, those won't contain `:` so they pass trivially.
    let depth = 0
    let end = -1
    for (let k = i; k < stripped.length; k++) {
      const c = stripped[k]
      if (c === '(') depth++
      else if (c === ')') {
        depth--
        if (depth === 0) {
          end = k
          break
        }
      }
    }
    if (end === -1) return 'Unbalanced parentheses in query.'
    const inner = stripped.substring(i + 1, end)
    const trimmedInner = inner.trim()
    if (trimmedInner.length === 0) {
      // Anonymous endpoint like `(user)-[:OWNS]->()` is occasionally used
      // for "exists" probes but isn't useful in our subgraph-returning
      // contract. Reject so the generator names the endpoint.
      return 'Node patterns must declare a variable AND a label (no bare `()` allowed).'
    }
    // Find the head — everything before the first property-map `{` (if any).
    let stop = inner.length
    const braceIdx = inner.indexOf('{')
    if (braceIdx !== -1) stop = braceIdx
    const headPart = inner.substring(0, stop)
    if (/:/.test(headPart)) continue // has a label in the head — fine
    // No label in the head — distinguish a true node pattern from an
    // expression (`a OR b`, comparisons, etc.).
    if (/[<>=!]|\bAND\b|\bOR\b|\bIN\b|\bNOT\b/i.test(headPart)) continue
    // Identifier-only `(n)` — accept iff `n` was previously bound to a
    // label elsewhere in the query. Cypher allows re-using a label-bound
    // variable without re-declaring its label, so flagging every such
    // re-use would reject most legitimate multi-MATCH queries.
    const idOnly = headPart.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)$/)
    if (idOnly) {
      const varName = idOnly[1]
      if (labelBoundVars.has(varName)) continue
      return `Node pattern "(${varName})" is missing a label and was never bound with one earlier in the query. Every node variable must be introduced with a label like "(${varName}:Person)".`
    }
    // Anything else (parenthesised grouping with no `:` and no identifier
    // match) we treat as benign.
  }
  return null
}

/**
 * Require the query to anchor authorization on a Person node bound to
 * $userId. Mere `$userId` presence is not enough; a query like
 * `MATCH (n:FieldContext) WHERE $userId IS NOT NULL RETURN n` would
 * satisfy a substring check but never traverse from the user.
 *
 * Accepts the common patterns:
 *   (user:Person {id: $userId})
 *   (:Person {id: $userId})
 *   (user:Person)         …with later `user.id = $userId` in WHERE
 *
 * The second form is the strictest for our purposes — we require it
 * as the floor, so the generator must either inline `Person {id:
 * $userId}` in the MATCH or accept a clearer rejection.
 */
function hasUserIdAnchor(stripped: string): boolean {
  return /Person\s*\{\s*id\s*:\s*\$userId\s*\}/.test(stripped)
}

export async function validateCypher(
  cypher: string,
  session: Session
): Promise<ValidationResult> {
  const trimmed = cypher.trim()
  if (!trimmed) return { ok: false, reason: 'Empty query.' }

  const stripped = stripStringLiterals(trimmed)

  // 1. Forbidden keywords.
  if (FORBIDDEN_KEYWORDS.test(stripped)) {
    return {
      ok: false,
      reason:
        'Query contains a write keyword (CREATE/MERGE/SET/DELETE/REMOVE/DETACH/DROP/LOAD CSV/FOREACH). Only read-only queries are allowed.',
    }
  }

  // 2. Backtick rejection. Cypher allows `:`SomeLabel`` (identifier
  // quoting) which would silently bypass any whitelist that only
  // matches plain identifiers. No legitimate generated query needs
  // backticks.
  if (/`/.test(stripped)) {
    return {
      ok: false,
      reason:
        'Backtick-quoted identifiers are not allowed in generated Cypher.',
    }
  }

  // 3. CALL ban — token-level, no peeking at what follows so
  // `CALL  /*x*/  apoc.…` doesn't slip through. The executor wraps
  // the validated query in its own `CALL { … }` subquery, so the
  // generator never needs CALL.
  if (/\bCALL\b/i.test(stripped)) {
    return {
      ok: false,
      reason:
        'CALL statements (procedures or subqueries) are not allowed in generated Cypher.',
    }
  }

  // 4. labels() ban. `WHERE "Log" IN labels(n)` lets a bare `(n)`
  // match return any label without the validator seeing a `:Log`
  // token. Banned. Other label-introspection functions go with it.
  if (/\blabels\s*\(/i.test(stripped)) {
    return {
      ok: false,
      reason:
        'Use of `labels()` is not allowed — every node variable must declare its label inline.',
    }
  }
  if (/\bnodes\s*\(|\brelationships\s*\(|\btype\s*\(/i.test(stripped)) {
    return {
      ok: false,
      reason:
        'Use of `nodes()`/`relationships()`/`type()` is not allowed in generated Cypher — return node and relationship variables directly.',
    }
  }

  // 5/6. Label + relationship whitelist. Walk every `:Label`-shape
  // token without the negative lookbehind — but skip tokens whose `:`
  // sits inside a property map `{key: value}` so property keys don't
  // get mis-parsed as labels.
  const labelOffsets: Array<{ name: string; isRel: boolean }> = []
  const tokenRe = /:([A-Za-z_][A-Za-z0-9_]*)/g
  let m: RegExpExecArray | null
  while ((m = tokenRe.exec(stripped)) !== null) {
    if (isInsidePropertyMap(stripped, m.index)) continue
    labelOffsets.push({
      name: m[1],
      isRel: isLikelyRelationshipToken(stripped, m.index),
    })
  }

  for (const tok of labelOffsets) {
    if (tok.isRel) {
      if (!ALLOWED_RELATIONSHIPS_SET.has(tok.name)) {
        return {
          ok: false,
          reason: `Relationship type ":${tok.name}" is not in the allowed list. Allowed: ${[...ALLOWED_RELATIONSHIPS_SET].join(', ')}.`,
        }
      }
    } else {
      if (!ALLOWED_LABELS_SET.has(tok.name)) {
        return {
          ok: false,
          reason: `Label ":${tok.name}" is not in the allowed list. Allowed: ${[...ALLOWED_LABELS_SET].join(', ')}.`,
        }
      }
    }
  }

  // Pick up relationship disjunction alternates: `[r:A|B|C]`.
  const disjunctionRe = /\[[^\]]*:([A-Za-z_][A-Za-z0-9_|]+)\]/g
  let dm: RegExpExecArray | null
  while ((dm = disjunctionRe.exec(stripped)) !== null) {
    for (const part of dm[1].split('|')) {
      if (!ALLOWED_RELATIONSHIPS_SET.has(part)) {
        return {
          ok: false,
          reason: `Relationship type ":${part}" is not in the allowed list.`,
        }
      }
    }
  }

  // Variable-length paths: `[*..N]` / `[r*..N]` / `[r:TYPE*..N]`. The `*`
  // makes the relationship traverse multiple hops, so the validator cannot
  // see what relationship types are crossed without a type restriction.
  // Anonymous variable-length paths (no `:Type` inside the brackets) would
  // let a query walk into private internal relationships (HAS_THREAD,
  // HAS_TURN, HAS_CHUNK, LOGGED_FOR, etc.) that aren't part of the public
  // schema surface. Require an explicit type disjunction.
  const varLenRe = /\[[^\]]*\*[^\]]*\]/g
  let vm: RegExpExecArray | null
  while ((vm = varLenRe.exec(stripped)) !== null) {
    const inside = vm[0]
    if (!/:/.test(inside)) {
      return {
        ok: false,
        reason:
          'Variable-length path patterns (e.g. [*..6]) must specify relationship types from the allowed list. Use [r:OWNS|HAS_CONTEXT|…*..6] instead of [*..6].',
      }
    }
    // The disjunction regex above assumes `:TYPES]` directly, but variable-
    // length brackets put the `*..N` range between the type list and the
    // closing bracket — so the type alternates need their own pass here.
    const typeTokens = inside.match(/:[A-Za-z_][A-Za-z0-9_|]*/g) ?? []
    for (const token of typeTokens) {
      const parts = token.slice(1).split('|')
      for (const part of parts) {
        if (!part) continue
        if (!ALLOWED_RELATIONSHIPS_SET.has(part)) {
          return {
            ok: false,
            reason: `Relationship type ":${part}" in variable-length path is not in the allowed list.`,
          }
        }
      }
    }
  }

  // 7. Every node-pattern variable must declare a label (or be a re-use
  // of a previously label-bound variable).
  const labelBoundVars = collectLabelBoundVariables(stripped)
  const labelGap = checkAllNodePatternsHaveLabels(stripped, labelBoundVars)
  if (labelGap) {
    return { ok: false, reason: labelGap }
  }

  // 8. $userId must be anchored to a Person node in the query body.
  if (!/\$userId\b/.test(stripped)) {
    return {
      ok: false,
      reason:
        'Query must reference $userId so authorization can be anchored to the current user.',
    }
  }
  if (!hasUserIdAnchor(stripped)) {
    return {
      ok: false,
      reason:
        'Query must MATCH a (:Person {id: $userId}) node and traverse outward — $userId presence alone is not enough.',
    }
  }

  // 9. EXPLAIN — authoritative read-only check via the Neo4j planner.
  // Bind a few common optional params alongside the always-bound ones so
  // the planner can resolve `$keyword`, `$spaceId`, `$contextId` without
  // failing EXPLAIN itself. Nothing actually executes.
  try {
    const explain = await session.executeRead((tx) =>
      tx.run(`EXPLAIN ${trimmed}`, {
        userId: '00000000-0000-0000-0000-000000000000',
        maxNodes: 1,
        keyword: '',
        spaceId: '',
        contextId: '',
      })
    )
    const summary = explain.summary
    const plan = summary.plan ?? summary.profile ?? null
    if (plan) {
      const operators: string[] = []
      const walk = (node: unknown) => {
        if (!node || typeof node !== 'object') return
        const obj = node as Record<string, unknown>
        if (typeof obj.operatorType === 'string') operators.push(obj.operatorType)
        const children = obj.children
        if (Array.isArray(children)) children.forEach(walk)
      }
      walk(plan)
      const offending = operators.find((op) => WRITE_PLAN_OPERATORS.test(op))
      if (offending) {
        return {
          ok: false,
          reason: `EXPLAIN plan contains write operator "${offending}". Only read-only queries are allowed.`,
        }
      }
    }
  } catch (error) {
    return {
      ok: false,
      reason: `Query failed EXPLAIN: ${error instanceof Error ? error.message : 'unknown error'}`,
    }
  }

  return { ok: true }
}
