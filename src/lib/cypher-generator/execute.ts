/**
 * Safe executor for AI-generated Cypher.
 *
 * - Wraps the validated query inside `CALL { … } RETURN * LIMIT
 *   $maxNodes` so even a forgetful generator can't return a million
 *   rows.
 * - Runs inside `executeRead` with a 5s transaction timeout. A write
 *   that slipped past validation would still be rejected by the driver
 *   here.
 * - Walks every column of every record, collecting Neo4j Node and
 *   Relationship instances. Non-graph columns are silently dropped.
 * - Post-filters the collected nodes against Space-based authorization:
 *   each node is mapped to its enclosing Space, then `canViewContent`
 *   gates access. Nodes the user cannot see are dropped, along with
 *   any relationships that referenced a dropped node.
 *
 * Returns NVL-shape nodes + relationships ready to drop into Bloom.
 */

import neo4j, { type Node, type Relationship } from 'neo4j-driver'
import { driver } from '@/lib/neo4j/driver'
import { canViewContent } from '@/lib/permissions/space-permissions'
import {
  ALLOWED_RELATIONSHIPS,
  type AllowedRelationship,
} from './schema-context'
import type { NVLNode, NVLRelationship } from './types'

const MAX_NODES = 60
const MAX_RELS = MAX_NODES * 3
const QUERY_TIMEOUT_MS = 5_000

const NODE_STYLE: Record<string, { color: string; size: number }> = {
  MeSpace: { color: '#86efac', size: 42 },
  WeSpace: { color: '#86efac', size: 42 },
  Space: { color: '#86efac', size: 42 },
  Community: { color: '#fdba74', size: 38 }, // orange-300 — public collective
  FieldContext: { color: '#fde68a', size: 34 },
  GoalPulse: { color: '#93c5fd', size: 26 },
  ResourcePulse: { color: '#a7f3d0', size: 26 },
  StoryPulse: { color: '#c4b5fd', size: 26 },
  CarePulse: { color: '#fca5a5', size: 26 },
  CoreValuePulse: { color: '#fcd34d', size: 26 },
  FieldPulse: { color: '#93c5fd', size: 26 },
  Person: { color: '#f9a8d4', size: 30 },
  User: { color: '#f9a8d4', size: 30 },
  PersonPulse: { color: '#f9a8d4', size: 26 },
  ResonanceLink: { color: '#d8b4fe', size: 22 },
  FieldResonance: { color: '#e9d5ff', size: 22 },
  SpaceMembership: { color: '#cbd5e1', size: 18 },
}

const SPACE_LABELS = new Set(['MeSpace', 'WeSpace', 'Space'])
/**
 * Labels that are universally visible to every authenticated user
 * regardless of Space-based authorization. Used by the post-execute
 * auth filter as a short-circuit — these nodes need no Space anchor.
 * Communities (a public collective like "GoalPost Core Team") fit
 * this model: the search_community tool already exposes them to any
 * signed-in user, so showing them on the canvas is consistent.
 */
const PUBLIC_LABELS = new Set(['Community'])
/**
 * Synthetic anchor id used by mapNodesToEnclosingSpaces to mark a node
 * as universally visible (no Space membership required). The post-
 * filter accepts the node when this id is in its anchor set without
 * having to look it up against the per-user allowedSpaces set.
 */
const PUBLIC_ANCHOR = '__public__'
const CONTENT_VIA_SPACE = new Set([
  'FieldContext',
  'FieldPulse',
  'GoalPulse',
  'ResourcePulse',
  'StoryPulse',
  'CarePulse',
  'CoreValuePulse',
  'ResonanceLink',
])

function styleFor(labels: string[]): { color: string; size: number } {
  for (const l of labels) {
    if (NODE_STYLE[l]) return NODE_STYLE[l]
  }
  return { color: '#cbd5e1', size: 24 }
}

function captionFor(node: Node): string {
  const p = node.properties as Record<string, unknown>
  const candidates = [
    p.name,
    p.title,
    p.emergentName,
    typeof p.firstName === 'string' && typeof p.lastName === 'string'
      ? `${p.firstName} ${p.lastName}`.trim()
      : null,
    p.label,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return node.labels[0] ?? 'Node'
}

function nodeId(node: Node): string | null {
  const id = (node.properties as { id?: unknown }).id
  return typeof id === 'string' && id ? id : null
}

interface CollectedGraph {
  nodes: Map<string, Node>
  rels: Map<string, Relationship>
  capped: boolean
}

/**
 * Walk a result column value and accumulate Neo4j Node / Relationship
 * instances into `acc`. Stops early once the caps are reached so a
 * malicious `RETURN collect(n) AS nodes` (one row carrying thousands
 * of nodes) can't blow past the `LIMIT $maxNodes` cap. The wrapper
 * subquery applies LIMIT at the row level; this caps at the node
 * level for defense in depth.
 */
function collectFromRecord(value: unknown, acc: CollectedGraph): void {
  if (acc.capped) return
  if (value === null || value === undefined) return
  if (neo4j.isNode(value)) {
    const id = nodeId(value)
    if (id && !acc.nodes.has(id)) {
      if (acc.nodes.size >= MAX_NODES) {
        acc.capped = true
        return
      }
      acc.nodes.set(id, value)
    }
    return
  }
  if (neo4j.isRelationship(value)) {
    const id = (value.properties as { id?: unknown }).id
    const key =
      typeof id === 'string' && id
        ? id
        : `${value.startNodeElementId}->${value.type}->${value.endNodeElementId}`
    if (!acc.rels.has(key)) {
      if (acc.rels.size >= MAX_RELS) {
        acc.capped = true
        return
      }
      acc.rels.set(key, value)
    }
    return
  }
  if (Array.isArray(value)) {
    for (const v of value) {
      if (acc.capped) return
      collectFromRecord(v, acc)
    }
    return
  }
  if (typeof value === 'object') {
    // Neo4j Path objects expose `.segments` / `.start` / `.end`.
    const obj = value as {
      segments?: Array<{ start?: Node; end?: Node; relationship?: Relationship }>
      start?: Node
      end?: Node
    }
    if (Array.isArray(obj.segments)) {
      if (obj.start) collectFromRecord(obj.start, acc)
      if (obj.end) collectFromRecord(obj.end, acc)
      for (const seg of obj.segments) {
        if (acc.capped) return
        if (seg.start) collectFromRecord(seg.start, acc)
        if (seg.end) collectFromRecord(seg.end, acc)
        if (seg.relationship) collectFromRecord(seg.relationship, acc)
      }
    }
  }
}

/**
 * For each collected node, return every candidate enclosing Space id —
 * any Space whose visibility implies the user may view the node.
 *
 * Multi-candidate (not single) on purpose: a Person who owns their own
 * MeSpace AND is a member of a shared WeSpace has two anchor Spaces.
 * Picking only the first (e.g. their owned MeSpace) would tell the
 * authorization filter to check whether the current user can see
 * *that other person's MeSpace*, which always fails — the Person
 * would be dropped even though the shared WeSpace makes them
 * legitimately visible. Returning all candidates lets the post-filter
 * accept the node if ANY candidate Space is viewable by the user.
 *
 * Every helper query runs through `executeRead` on the session. Bare
 * `session.run` would open an auto-tx in the driver's default access
 * mode (write-capable), so even if a future caller swapped the
 * enclosing transaction we keep these reads on a read tx.
 */
async function mapNodesToEnclosingSpaces(
  session: ReturnType<typeof driver.session>,
  nodes: Node[]
): Promise<Map<string, Set<string>>> {
  const result = new Map<string, Set<string>>()
  if (nodes.length === 0) return result

  const runRead = async (
    query: string,
    params: Record<string, unknown>
  ) => session.executeRead((tx) => tx.run(query, params))

  for (const node of nodes) {
    const id = nodeId(node)
    if (!id) continue
    const labels = node.labels
    const anchors = new Set<string>()

    // Public nodes (Community) need no Space anchor — they're visible
    // to every authenticated user. Use the synthetic "__public__" id
    // so the post-filter recognises them as always-allowed without
    // having to scan the entire allowedSpaces set.
    if (labels.some((l) => PUBLIC_LABELS.has(l))) {
      anchors.add(PUBLIC_ANCHOR)
      result.set(id, anchors)
      continue
    }

    if (labels.some((l) => SPACE_LABELS.has(l))) {
      anchors.add(id)
      result.set(id, anchors)
      continue
    }

    if (labels.includes('FieldContext')) {
      const r = await runRead(
        `MATCH (:FieldContext {id: $id})<-[:HAS_CONTEXT]-(s:Space) RETURN collect(DISTINCT s.id) AS sids`,
        { id }
      )
      const sids = (r.records[0]?.get('sids') as string[] | null) ?? []
      for (const sid of sids) anchors.add(sid)
      result.set(id, anchors)
      continue
    }

    if (labels.includes('FieldPulse') || CONTENT_VIA_SPACE.has(labels[0] ?? '')) {
      const r = await runRead(
        `
        MATCH (p {id: $id})
        OPTIONAL MATCH (p)<-[:HAS_PULSE]-(:FieldContext)<-[:HAS_CONTEXT]-(s1:Space)
        OPTIONAL MATCH (p)<-[:SOURCE|TARGET]-(:ResonanceLink)<-[:HAS_RESONANCE]-(:FieldContext)<-[:HAS_CONTEXT]-(s2:Space)
        OPTIONAL MATCH (p)<-[:HAS_RESONANCE]-(:FieldContext)<-[:HAS_CONTEXT]-(s3:Space)
        WITH collect(DISTINCT s1.id) + collect(DISTINCT s2.id) + collect(DISTINCT s3.id) AS sids
        RETURN [sid IN sids WHERE sid IS NOT NULL] AS sids
        `,
        { id }
      )
      const sids = (r.records[0]?.get('sids') as string[] | null) ?? []
      for (const sid of sids) anchors.add(sid)
      result.set(id, anchors)
      continue
    }

    if (labels.includes('Person')) {
      // A Person is visible to the current user when they share any
      // Space OR any Community. Communities are public collectives
      // (see PUBLIC_LABELS comment), so being a fellow Community member
      // is sufficient anchor — the synthetic "__public__" anchor lets
      // the post-filter accept the Person regardless of Space overlap.
      const r = await runRead(
        `
        MATCH (p:Person {id: $id})
        OPTIONAL MATCH (p)-[:OWNS]->(s1:Space)
        OPTIONAL MATCH (p)<-[:IS_MEMBER]-(:SpaceMembership)<-[:HAS_MEMBER]-(s2:Space)
        OPTIONAL MATCH (p)<-[:CREATED_BY]-(:FieldPulse)<-[:HAS_PULSE]-(:FieldContext)<-[:HAS_CONTEXT]-(s3:Space)
        OPTIONAL MATCH (p)<-[:HAS_MEMBER]-(c:Community)
        WITH collect(DISTINCT s1.id) + collect(DISTINCT s2.id) + collect(DISTINCT s3.id) AS sids,
             count(c) > 0 AS inAnyCommunity
        RETURN [sid IN sids WHERE sid IS NOT NULL] AS sids, inAnyCommunity
        `,
        { id }
      )
      const sids = (r.records[0]?.get('sids') as string[] | null) ?? []
      for (const sid of sids) anchors.add(sid)
      if (r.records[0]?.get('inAnyCommunity') === true) {
        anchors.add(PUBLIC_ANCHOR)
      }
      result.set(id, anchors)
      continue
    }

    // SpaceMembership / FieldResonance / unknown — anchor through any
    // adjacent Space at up to 3 hops.
    const r = await runRead(
      `
      MATCH (n {id: $id})
      OPTIONAL MATCH (n)-[*1..3]-(s:Space)
      RETURN collect(DISTINCT s.id) AS sids
      `,
      { id }
    )
    const sids = (r.records[0]?.get('sids') as string[] | null) ?? []
    for (const sid of sids) anchors.add(sid)
    result.set(id, anchors)
  }

  return result
}

/**
 * Find every whitelisted relationship that exists between any two of
 * `nodeIds` and isn't already in `existingKeys`. Lets the executor
 * rescue the visual when the generator MATCHed edges but forgot to
 * bind / RETURN them. Bounded by `budget` so we honor the row cap.
 *
 * Uses the project's allowed-relationships whitelist as the disjunction
 * filter so the query is safe and bounded regardless of what surprise
 * relationship types might exist in the graph.
 */
async function fillInRelationships(
  session: ReturnType<typeof driver.session>,
  nodeIds: string[],
  budget: number,
  existingKeys: Set<string>
): Promise<NVLRelationship[]> {
  if (nodeIds.length < 2 || budget <= 0) return []
  const allowed: AllowedRelationship[] = [...ALLOWED_RELATIONSHIPS]
  const result = await session.executeRead((tx) =>
    tx.run(
      `
      UNWIND $nodeIds AS aid
      MATCH (a {id: aid})
      MATCH (a)-[r]->(b)
      WHERE b.id IN $nodeIds AND type(r) IN $allowedTypes
      RETURN a.id AS fromId, b.id AS toId, type(r) AS relType, r.id AS relId
      LIMIT $budget
      `,
      {
        nodeIds,
        allowedTypes: allowed,
        budget: neo4j.int(budget),
      }
    )
  )

  const rels: NVLRelationship[] = []
  for (const record of result.records) {
    const fromId = record.get('fromId') as string | null
    const toId = record.get('toId') as string | null
    const relType = record.get('relType') as string | null
    const relPropId = record.get('relId') as string | null
    if (!fromId || !toId || !relType) continue
    // Synthesise a stable key so dedupe works against the originally
    // collected relationships (which key on `id` or `from->type->to`).
    const key =
      typeof relPropId === 'string' && relPropId
        ? relPropId
        : `${fromId}-${relType}->${toId}`
    if (existingKeys.has(key)) continue
    existingKeys.add(key)
    rels.push({
      id: key,
      from: fromId,
      to: toId,
      caption: relType,
    })
  }
  return rels
}

export interface ExecuteArgs {
  cypher: string
  userId: string
  params?: Record<string, unknown>
}

export interface ExecutionFailure {
  ok: false
  reason: string
}

export interface ExecutionSuccess {
  ok: true
  nodes: NVLNode[]
  relationships: NVLRelationship[]
  rawNodeCount: number
  filteredNodeCount: number
}

export type ExecutionResult = ExecutionSuccess | ExecutionFailure

export async function executeForBloom(
  args: ExecuteArgs
): Promise<ExecutionResult> {
  const wrapped = `CALL { ${args.cypher} } RETURN * LIMIT $maxNodes`
  const session = driver.session()
  try {
    const collected: CollectedGraph = {
      nodes: new Map(),
      rels: new Map(),
      capped: false,
    }

    const result = await session.executeRead(
      (tx) =>
        tx.run(
          wrapped,
          {
            ...(args.params ?? {}),
            userId: args.userId,
            maxNodes: neo4j.int(MAX_NODES),
          }
        ),
      { timeout: QUERY_TIMEOUT_MS }
    )

    outer: for (const record of result.records) {
      for (const key of record.keys) {
        collectFromRecord(record.get(key as string), collected)
        if (collected.capped) break outer
      }
    }

    const rawNodeCount = collected.nodes.size

    // Authorization post-filter — every kept node must reach at least
    // one Space the user can view.
    const nodeArray = [...collected.nodes.values()]
    const enclosingSpaces = await mapNodesToEnclosingSpaces(session, nodeArray)
    const allCandidateSpaces = new Set<string>()
    for (const candidates of enclosingSpaces.values()) {
      for (const sid of candidates) allCandidateSpaces.add(sid)
    }

    const allowedSpaces = new Set<string>()
    for (const spaceId of allCandidateSpaces) {
      if (spaceId === PUBLIC_ANCHOR) continue // resolved short-circuit, no canViewContent call needed
      // canViewContent opens its own read tx — safe to share the session.
      const allowed = await canViewContent(session, args.userId, spaceId)
      if (allowed) allowedSpaces.add(spaceId)
    }

    const keptNodeIds = new Set<string>()
    for (const node of nodeArray) {
      const id = nodeId(node)
      if (!id) continue
      const candidates = enclosingSpaces.get(id)
      if (!candidates || candidates.size === 0) continue
      let ok = false
      for (const sid of candidates) {
        // PUBLIC_ANCHOR means "node is always visible" (e.g. Community).
        if (sid === PUBLIC_ANCHOR || allowedSpaces.has(sid)) {
          ok = true
          break
        }
      }
      if (ok) keptNodeIds.add(id)
    }

    const nvlNodes: NVLNode[] = nodeArray
      .filter((n) => {
        const id = nodeId(n)
        return id !== null && keptNodeIds.has(id)
      })
      .map((n) => {
        const { color, size } = styleFor(n.labels)
        return {
          id: nodeId(n)!,
          caption: captionFor(n),
          color,
          size,
        }
      })

    const nvlRels: NVLRelationship[] = []
    const seenRelKeys = new Set<string>()
    for (const [key, rel] of collected.rels.entries()) {
      // Resolve from/to ids by walking element ids back to property ids.
      const fromNode = nodeArray.find(
        (n) => n.elementId === rel.startNodeElementId
      )
      const toNode = nodeArray.find(
        (n) => n.elementId === rel.endNodeElementId
      )
      const fromId = fromNode ? nodeId(fromNode) : null
      const toId = toNode ? nodeId(toNode) : null
      if (!fromId || !toId) continue
      if (!keptNodeIds.has(fromId) || !keptNodeIds.has(toId)) continue
      seenRelKeys.add(key)
      nvlRels.push({
        id: key,
        from: fromId,
        to: toId,
        caption: rel.type,
      })
    }

    // Defense in depth: ask Neo4j for every whitelisted relationship
    // between any two kept nodes that the generator didn't already
    // return. This rescues the visual when the LLM matches edges but
    // forgets to bind / RETURN them (you see disconnected nodes
    // floating on the canvas otherwise). Bounded by MAX_RELS minus what
    // we already have so we still honor the row cap.
    const remainingRelBudget = MAX_RELS - nvlRels.length
    if (keptNodeIds.size >= 2 && remainingRelBudget > 0) {
      const filled = await fillInRelationships(
        session,
        [...keptNodeIds],
        remainingRelBudget,
        seenRelKeys
      )
      for (const rel of filled) nvlRels.push(rel)
    }

    return {
      ok: true,
      nodes: nvlNodes,
      relationships: nvlRels,
      rawNodeCount,
      filteredNodeCount: nvlNodes.length,
    }
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'Unknown execution error',
    }
  } finally {
    await session.close()
  }
}
