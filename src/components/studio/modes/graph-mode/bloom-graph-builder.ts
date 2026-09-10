import type { Node, Relationship } from '@neo4j-nvl/base'
import type { FocalEntityType } from '@/lib/focal-entity/types'
import { lightColorFor, UNKNOWN_NODE_STYLE } from '@/lib/cypher-generator/node-style'
import type { BloomPalette } from './bloom-palette'
import type { DocumentProvenanceLayer } from './document-provenance-layer'
import type { BloomOverlay } from '../../bloom-overlay-context'
import type { BloomCanvas } from './bloom-type-registry'
import { edgeCaption, edgeEndpoints } from './edge-caption'
import {
  buildSweptRelationships,
  edgeKey,
  sweptEdgeKeys,
  type SweptEdge,
} from './edge-sweep'

/**
 * Construction of the Bloom canvas — every native NVL node and relationship
 * the four scopes paint, as one pure derivation.
 *
 * Extracted from `bloom-view.tsx` for GOAL-350. Two reasons, in order:
 *
 *  1. That component is far past CLAUDE.md's 400-line rule, and the story
 *     required this work to shrink it rather than grow it. These two builders
 *     were its single largest block.
 *  2. The type filter is a transform over exactly this output. Keeping
 *     construction pure — no React, no hooks, no Apollo — means the filter,
 *     the legend and the canvas all read one derivation and cannot disagree
 *     about what is on screen, which is the invariant the whole dangling-edge
 *     guard rests on.
 *
 * Nothing here fetches. Bloom is a visual transform over the Apollo cache the
 * dashboard already warmed (ADR-011); callers hand in records they read from
 * that cache.
 *
 * No x/y is set on any node: with `layout: 'forceDirected'`, supplying
 * positions makes NVL treat the layout as already-settled and the simulation
 * never runs until the user disturbs a node. Letting NVL place everything from
 * scratch is what makes the force-directed shape appear on first load.
 */

export interface SpaceRecord {
  id: string
  name: string
  type: 'MeSpace' | 'WeSpace'
}

export interface FieldContextRecord {
  id: string
  name: string
  spaceKind: 'MeSpace' | 'WeSpace'
  /** Direct parent context when this field is nested (GOAL-295). */
  parentId: string | null
}

export interface PulseRecord {
  id: string
  name: string
  pulseType: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
  focalType: FocalEntityType
}

/**
 * The member ring, as an NVL `overlayIcon`.
 *
 * NVL paints a node as a bare filled circle: the Node type exposes `color`,
 * `size`, `caption`, `icon` and `overlayIcon`, and nothing that strokes an
 * outline. `overlayIcon` is the only channel that can put a mark *around* the
 * node — it is centred on the node by default and sized as a multiple of the
 * node's own size, so an SVG whose only content is a stroked circle at the edge
 * of its viewBox renders as a ring sitting just outside the fill.
 *
 * Inlined as a data URI rather than a file so it re-colours with the theme: the
 * stroke is whatever `palette.memberRing` resolves to for the active mode.
 */
export function memberRing(color: string): { url: string; size: number } {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<circle cx="50" cy="50" r="44" fill="none" stroke="${color}" stroke-width="7"/>` +
    `</svg>`
  return { url: `data:image/svg+xml,${encodeURIComponent(svg)}`, size: 1.34 }
}

export interface PersonRecord {
  id: string
  name: string
  // Owner is a User; field-attached people are PersonPulses. The view branches
  // its focal-entity machinery on this distinction.
  focalType: 'User' | 'PersonPulse'
  /**
   * Has access to the Space that contains this FieldContext — its owner, or a
   * SpaceMembership on it. Drawn as a ring rather than a colour: colour is the
   * legend's type key, so a distinct member colour would move these people out
   * of the Person row entirely. A member is a Person, so it stays one.
   */
  isSpaceMember?: boolean
}

/** In-space people carry their relationship to the space so the spoke edge
 *  picks the right caption (owns vs member). */
export interface SpacePersonRecord {
  id: string
  name: string
  role: 'OWNER' | 'MEMBER'
}

export interface ResonanceRecord {
  id: string
  sourceId: string
  targetId: string
  label: string
}

/**
 * A PromiseWeave rendered in-field: the connector node plus the ids of the
 * pulses it weaves. Unlike a resonance (a pulse↔pulse edge), a weave is its
 * own hub node with WEAVES spokes to each pulse it connects.
 */
export interface WeaveRecord {
  id: string
  name: string
  wovenPulseIds: string[]
  /**
   * True for a `proposed` weave — one the assistant suggested that no member
   * has confirmed yet (kb/04-state-machines.md). The canvas MUST NOT draw it
   * identically to an agreed weave: every other weave surface distinguishes
   * the two, and a hub that looks established is the canvas asserting a
   * connection nobody made.
   */
  awaitingReview: boolean
}

export interface ConnectionRecord {
  fromId: string
  toId: string
  why: string | null
}

/**
 * A pulse and the person credited for it. Authorship lives on TWO live edges
 * (INITIATED_BY: assistant/doc-ingest paths; CREATED_BY: dashboard flow,
 * imports), so the caller resolves them the way `resolvePulseAuthor`
 * (src/lib/pulse-author.ts) does — prefer initiatedBy, fall back to createdBy
 * — else dashboard-created pulses render authorless.
 */
export interface PulseAuthorRecord {
  pulseId: string
  authorId: string
}

export interface NamedEntity {
  id: string
  name: string
}

export interface SpaceAnchor extends NamedEntity {
  kind: 'MeSpace' | 'WeSpace'
}

/**
 * Everything the four scopes need. One bag rather than two argument lists so
 * the node and relationship builders provably read the same records — they
 * must agree on which entities are on canvas or the dangling-edge guard has
 * nothing to stand on.
 */
export interface BloomGraphInput {
  /** Chat-pushed subgraph. Always wins when present. */
  overlay: BloomOverlay | null
  isDark: boolean
  palette: BloomPalette
  inField: boolean
  inSpace: boolean

  // In-field scope.
  pulses: PulseRecord[]
  persons: PersonRecord[]
  weaves: WeaveRecord[]
  resonances: ResonanceRecord[]
  connections: ConnectionRecord[]
  pulseAuthors: PulseAuthorRecord[]
  subContexts: NamedEntity[]
  fieldAnchor: NamedEntity | null
  inFieldSpaceKind: 'MeSpace' | 'WeSpace'
  documentProvenance: DocumentProvenanceLayer
  /**
   * GOAL-362 — every relationship among this context's entities, straight from
   * the server (`FieldContext.edges`). Layered on top of the hand-built
   * families below, deduped, so edge types nobody wrote a branch for still
   * reach the canvas. Empty when the field has none or the query is in flight.
   */
  sweptEdges: readonly SweptEdge[]

  // In-space scope.
  fieldContexts: FieldContextRecord[]
  spaceAnchor: SpaceAnchor | null
  inSpacePeople: SpacePersonRecord[]

  // Root scope.
  spaces: SpaceRecord[]
  currentUserId: string | null
  /** Spaces the current user owns — drives `owns` vs `member` at root. */
  ownedSpaceIds: ReadonlySet<string>
}

const SPACE_SIZE = {
  MeSpace: 44,
  WeSpace: 48,
} as const

const FIELD_SIZE = 36

// The active field rendered as the hub its nested fields hang off in-field —
// slightly larger than its children so the hierarchy reads at a glance
// (GOAL-339).
const FIELD_ANCHOR_SIZE = 42

const PULSE_SIZE = 32

const PERSON_SIZE = 30

// The root "You" hub reads slightly larger than its spokes — it's the
// identity node every space radiates from.
const YOU_SIZE = 44

const EMPTY_RELATIONSHIPS: Relationship[] = []

/**
 * Native NVL nodes — caption / colour / size only. NVL paints these directly
 * without any HTML container; that's the "minimal GoalPost opinionation" the
 * kb calls out.
 *
 * Precedence:
 *   1. Overlay (chat-pushed subgraph) — always wins; cleared via the
 *      "Custom view from chat" chip in the canvas header.
 *   2. In-field scope — the active FieldContext's pulses.
 *   3. In-space scope — the active Space's field contexts.
 *   4. Default — the user's MeSpace + WeSpace cluster.
 */
export function buildBloomNodes(input: BloomGraphInput): Node[] {
  const {
    overlay,
    isDark,
    palette,
    inField,
    inSpace,
    pulses,
    persons,
    weaves,
    subContexts,
    fieldAnchor,
    inFieldSpaceKind,
    fieldContexts,
    spaceAnchor,
    inSpacePeople,
    spaces,
    currentUserId,
  } = input

  if (overlay) {
    // The overlay payload is styled server-side (cypher-generator/execute.ts)
    // with the dark pastel palette — the executor can't know the viewer's
    // theme. Remap to the light counterparts here so a chat "custom view"
    // doesn't dissolve into a light backdrop. Only the *painted* colour is
    // remapped; `overlay.nodes[].color` keeps its original value, which is
    // what `colorToInfoEntityType` resolves clicks against.
    return overlay.nodes.map((n) => {
      const color = n.color ?? UNKNOWN_NODE_STYLE.color
      return {
        id: n.id,
        caption: n.caption ?? n.id,
        color: isDark ? color : lightColorFor(color),
        size: n.size ?? 30,
      } as Node
    })
  }

  if (inField) {
    const pulseNodes = pulses.map(
      (pulse) =>
        ({
          id: pulse.id,
          caption: pulse.name,
          color: palette.pulse[pulse.pulseType],
          size: PULSE_SIZE,
        }) as Node
    )
    const personNodes = persons.map(
      (person) =>
        ({
          id: person.id,
          caption: person.name,
          color: palette.person,
          size: PERSON_SIZE,
          // NVL has no border/stroke on a node — only colour, size, caption and
          // icons — so the ring is an overlayIcon: a transparent SVG whose only
          // mark is a stroked circle, centred and scaled just outside the node.
          ...(person.isSpaceMember
            ? { overlayIcon: memberRing(palette.memberRing) }
            : {}),
        }) as Node
    )
    // NVL renders `caption` and nothing else per node, so the proposed state
    // rides in the caption. A separate colour would need its own palette entry
    // AND a legend row to be decodable, where the suffix is legible in every
    // theme and both modes for free.
    const weaveNodes = weaves.map(
      (weave) =>
        ({
          id: weave.id,
          caption: weave.awaitingReview
            ? `${weave.name} (proposed)`
            : weave.name,
          color: palette.weaveNode,
          size: PULSE_SIZE,
        }) as Node
    )
    // Nested fields hang off the field anchor (GOAL-339). Children reuse the
    // in-space field tint so the existing "Field context" legend row decodes
    // them without a palette change.
    const anchorNodes: Node[] = fieldAnchor
      ? [
          {
            id: fieldAnchor.id,
            caption: fieldAnchor.name,
            color: palette.field[inFieldSpaceKind],
            size: FIELD_ANCHOR_SIZE,
          } as Node,
        ]
      : []
    const subContextNodes = subContexts.map(
      (sub) =>
        ({
          id: sub.id,
          caption: sub.name,
          color: palette.field[inFieldSpaceKind],
          size: FIELD_SIZE,
        }) as Node
    )
    return [
      ...pulseNodes,
      ...personNodes,
      ...weaveNodes,
      ...anchorNodes,
      ...subContextNodes,
      // GOAL-354: no document nodes. A document is a ResourcePulse, so it is
      // already in `pulseNodes` above; the provenance layer contributes only
      // the EXTRACTED_FROM edges that start on it.
    ]
  }

  if (inSpace) {
    // Hub-and-spoke: the space anchors the cluster, its field contexts and
    // owner/members radiate off it via the structural edges below.
    const anchorNode: Node[] = spaceAnchor
      ? [
          {
            id: spaceAnchor.id,
            caption: spaceAnchor.name,
            color: palette.space[spaceAnchor.kind],
            size: SPACE_SIZE[spaceAnchor.kind],
          } as Node,
        ]
      : []
    const fieldNodes = fieldContexts.map(
      (ctx) =>
        ({
          id: ctx.id,
          caption: ctx.name,
          color: palette.field[ctx.spaceKind],
          size: FIELD_SIZE,
        }) as Node
    )
    const peopleNodes = inSpacePeople.map(
      (p) =>
        ({
          id: p.id,
          caption: p.name,
          color: palette.person,
          size: PERSON_SIZE,
        }) as Node
    )
    return [...anchorNode, ...fieldNodes, ...peopleNodes]
  }

  // Root: the current user is the hub; each space hangs off it.
  const spaceNodes = spaces.map(
    (space) =>
      ({
        id: space.id,
        caption: space.name,
        color: palette.space[space.type],
        size: SPACE_SIZE[space.type],
      }) as Node
  )
  const youNode: Node[] =
    currentUserId && spaces.length > 0
      ? [
          {
            id: currentUserId,
            caption: 'You',
            color: palette.person,
            size: YOU_SIZE,
          } as Node,
        ]
      : []
  return [...youNode, ...spaceNodes]
}

/**
 * Dedupe defensively on `from|type|to` even when the backend should already be
 * sending unique edges — both the cypher-generator overlay path and the Apollo
 * resonance path have produced duplicates before, and a doubled edge is more
 * visually misleading than a missing one.
 */
function dedupe(rels: Relationship[]): Relationship[] {
  const seen = new Set<string>()
  const out: Relationship[] = []
  for (const r of rels) {
    const key = `${r.from}|${r.caption ?? ''}|${r.to}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(r)
  }
  return out
}

/**
 * Native NVL relationships for the current scope.
 *
 * Every branch guards its edges against a `visibleIds` set built from the
 * nodes the matching `buildBloomNodes` branch emits, so NVL is never handed an
 * arrow to a node that isn't rendered. `applyBloomTypeFilters` re-applies that
 * same guard after type filtering — see `bloom-type-registry.ts`.
 */
export function buildBloomRelationships(
  input: BloomGraphInput
): Relationship[] {
  const {
    overlay,
    palette,
    inField,
    inSpace,
    pulses,
    persons,
    weaves,
    resonances,
    connections,
    pulseAuthors,
    subContexts,
    fieldAnchor,
    documentProvenance,
    sweptEdges,
    fieldContexts,
    spaceAnchor,
    inSpacePeople,
    spaces,
    currentUserId,
    ownedSpaceIds,
  } = input

  if (overlay) {
    return dedupe(
      overlay.relationships.map(
        (r) =>
          ({
            id: r.id,
            from: r.from,
            to: r.to,
            caption: r.caption ?? '',
          }) as Relationship
      )
    )
  }

  if (inField) {
    // Endpoints that are actually rendered. Edges to anything off-screen (a
    // resonance into an inaccessible pulse, an initiator whose person node
    // didn't load) are dropped so NVL never draws a dangling arrow.
    const visibleIds = new Set<string>([
      ...pulses.map((p) => p.id),
      ...persons.map((p) => p.id),
    ])
    // GOAL-362: the sweep runs FIRST and its keys suppress the hand-built
    // family for any edge it already carries. Inverted on purpose — for an
    // edge both layers know, the sweep's caption is the writer's own words
    // while the family can only produce the generic type word. The families
    // still cover what the sweep's scope cannot reach (an author who belongs
    // to the parent Space but has no HAS_PERSON on this context), so both are
    // needed.
    const swept = buildSweptRelationships({
      edges: sweptEdges,
      visibleIds,
      existing: new Set<string>(),
      palette,
    })
    const covered = sweptEdgeKeys(sweptEdges, visibleIds)

    const edges: Relationship[] = []

    // RESONATES_WITH — pulse↔pulse semantic links. Built unconditionally now
    // (previously gated on `resonances.length > 0`); the dedupe below handles
    // the empty case, and most fields have zero resonances, so the old guard
    // is what made Bloom look edge-less next to the Graph view.
    for (const r of resonances) {
      if (!visibleIds.has(r.sourceId) || !visibleIds.has(r.targetId)) continue
      edges.push({
        id: `resonance-${r.id}`,
        from: r.sourceId,
        to: r.targetId,
        caption: edgeCaption(r.label, 'HAS_RESONANCE'),
        color: palette.resonanceEdge,
        width: 2,
      } as Relationship)
    }

    // Author edge — pulse → the person credited for it. The caller resolved
    // INITIATED_BY / CREATED_BY into `pulseAuthors` the way resolvePulseAuthor
    // does; both endpoints still have to be on canvas.
    for (const author of pulseAuthors) {
      if (!visibleIds.has(author.pulseId)) continue
      if (!visibleIds.has(author.authorId)) continue
      // Stored pulse->person; drawn person->pulse so "Authored" reads the way
      // a reader asks the question. See REVERSED_ON_CANVAS.
      const ends = edgeEndpoints(author.pulseId, author.authorId, 'INITIATED_BY')
      // The sweep already drew this one, with the extractor's own wording.
      if (covered.has(edgeKey(ends.from, ends.to, 'INITIATED_BY'))) continue
      edges.push({
        id: `initiated-by-${author.pulseId}-${author.authorId}`,
        from: ends.from,
        to: ends.to,
        // No label here by construction: this record is built from
        // `initiatedBy { id }`, a relationship field that carries no edge
        // properties. The labelled version of this edge comes from the sweep,
        // which is why it runs first and suppresses this one.
        caption: edgeCaption(null, 'INITIATED_BY'),
        color: palette.initiatedEdge,
        width: 1.5,
      } as Relationship)
    }

    // WEAVES — each PromiseWeave hub → the pulses it connects. The weave node
    // is always rendered (added by buildBloomNodes), so we only guard the
    // pulse endpoint against the visible set to avoid a dangling spoke.
    for (const w of weaves) {
      for (const pid of w.wovenPulseIds) {
        if (!visibleIds.has(pid)) continue
        edges.push({
          id: `weaves-${w.id}-${pid}`,
          from: w.id,
          to: pid,
          caption: edgeCaption(null, 'WEAVES'),
          color: palette.weaveEdge,
          width: 1.5,
        } as Relationship)
      }
    }

    // EXTRACTED_FROM — each Document out to the people it named (GOAL-346).
    // The layer already filtered its person endpoints against the same person
    // set `visibleIds` is built from, and only emits a document that kept at
    // least one, so these need no further guard here.
    edges.push(
      ...documentProvenance.relationships.filter(
        (r) =>
          !covered.has(
            edgeKey(String(r.from), String(r.to), 'EXTRACTED_FROM')
          )
      )
    )

    // CONNECTED_TO — interpersonal relationships between the people in this
    // field (including the user↔person relationships, e.g. "your wife"). Both
    // endpoints must be on canvas; the owner/user is rendered as a field
    // person so user↔person relationships draw correctly.
    for (const c of connections) {
      if (!visibleIds.has(c.fromId) || !visibleIds.has(c.toId)) continue
      // CONNECTED_TO is undirected: this layer orders endpoints by the people
      // array, the sweep reports the stored order. `edgeKey` normalises both
      // to the sorted pair, so the two can't each draw their own line.
      if (covered.has(edgeKey(c.fromId, c.toId, 'CONNECTED_TO'))) continue
      edges.push({
        id: `connected-${[c.fromId, c.toId].sort().join('-')}`,
        from: c.fromId,
        to: c.toId,
        caption: edgeCaption(c.why, 'CONNECTED_TO'),
        color: palette.connectedEdge,
        width: 1.5,
      } as Relationship)
    }

    // HAS_SUBCONTEXT — the field anchor out to each nested field (GOAL-339).
    // Both endpoints are always rendered (the anchor only materializes when
    // sub-contexts exist), so no visibility guard.
    if (fieldAnchor) {
      for (const sub of subContexts) {
        edges.push({
          id: `subcontext-${fieldAnchor.id}-${sub.id}`,
          from: fieldAnchor.id,
          to: sub.id,
          caption: edgeCaption(null, 'HAS_SUBCONTEXT'),
          color: palette.structuralEdge,
          width: 1.5,
        } as Relationship)
      }
    }

    return [...swept, ...dedupe(edges)]
  }

  if (inSpace && spaceAnchor) {
    // Space —has→ each field context; owner/member —owns|member→ space.
    const visibleIds = new Set<string>([
      spaceAnchor.id,
      ...fieldContexts.map((f) => f.id),
      ...inSpacePeople.map((p) => p.id),
    ])
    const edges: Relationship[] = []
    // A nested field hangs off its parent field, not the space anchor, so the
    // hierarchy reads correctly (GOAL-339 — previously every context rendered
    // flat off the space even when nested). Falls back to the space edge if
    // the parent isn't on canvas.
    const contextIds = new Set(fieldContexts.map((f) => f.id))
    for (const ctx of fieldContexts) {
      const nestedParentId =
        ctx.parentId && contextIds.has(ctx.parentId) ? ctx.parentId : null
      edges.push(
        nestedParentId
          ? ({
              id: `subcontext-${nestedParentId}-${ctx.id}`,
              from: nestedParentId,
              to: ctx.id,
              caption: edgeCaption(null, 'HAS_SUBCONTEXT'),
              color: palette.structuralEdge,
              width: 1.5,
            } as Relationship)
          : ({
              id: `has-${spaceAnchor.id}-${ctx.id}`,
              from: spaceAnchor.id,
              to: ctx.id,
              caption: edgeCaption(null, 'HAS_CONTEXT'),
              color: palette.structuralEdge,
              width: 1.5,
            } as Relationship)
      )
    }
    for (const p of inSpacePeople) {
      if (!visibleIds.has(p.id)) continue
      const owns = p.role === 'OWNER'
      edges.push({
        id: `${owns ? 'owns' : 'member'}-${p.id}-${spaceAnchor.id}`,
        from: p.id,
        to: spaceAnchor.id,
        caption: edgeCaption(null, owns ? 'OWNS' : 'HAS_MEMBER'),
        color: palette.structuralEdge,
        width: 1.5,
      } as Relationship)
    }
    return dedupe(edges)
  }

  if (!inField && !inSpace) {
    // Root: the current user is the hub; each visible space hangs off it with
    // an `owns` (MeSpace, or a WeSpace they created) or `member` (a WeSpace
    // they only belong to) edge.
    if (!currentUserId || spaces.length === 0) return EMPTY_RELATIONSHIPS
    const edges: Relationship[] = spaces.map((space) => {
      const owns = ownedSpaceIds.has(space.id)
      return {
        id: `${owns ? 'owns' : 'member'}-${currentUserId}-${space.id}`,
        from: currentUserId,
        to: space.id,
        caption: edgeCaption(null, owns ? 'OWNS' : 'HAS_MEMBER'),
        color: palette.structuralEdge,
        width: 1.5,
      } as Relationship
    })
    return dedupe(edges)
  }

  return EMPTY_RELATIONSHIPS
}

/** Both halves of the canvas from one input bag. */
export function buildBloomCanvas(input: BloomGraphInput): BloomCanvas {
  return {
    nodes: buildBloomNodes(input),
    relationships: buildBloomRelationships(input),
  }
}
