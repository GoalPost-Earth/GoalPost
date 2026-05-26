/**
 * Graph Neighborhood API
 *
 * Returns the active focal entity's one-hop neighborhood as NVL-shaped
 * nodes + relationships for the studio's Bloom view. Replaces the
 * hardcoded ontology placeholder. Space-based authorization is enforced
 * per `kb/02-user-roles.md`:
 *   - MeSpace neighborhoods are only returned to the owner.
 *   - WeSpace neighborhoods require the user to OWN the space or hold
 *     any SpaceMembership role (ADMIN / MEMBER / GUEST).
 *   - FieldContext / FieldPulse neighborhoods inherit Space access via
 *     their enclosing Space.
 *
 * Auth is JWT-driven (cookie or body fallback to mirror the chat route),
 * mirroring `src/app/api/chat/simulation/route.ts`.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  parseRequestBody,
  resolveAuthenticatedUserId,
} from '../../auth/utils'
import { getSession, initializeDB } from '../../auth/neo4j'
import { parseError } from '@/utils'
import { z } from 'zod'
import {
  isFocalEntityType,
  type FocalEntityType,
} from '@/lib/focal-entity/types'

const requestSchema = z.object({
  focalType: z.string().nullable().optional(),
  focalId: z.string().nullable().optional(),
})

interface NVLNode {
  id: string
  caption?: string
  size?: number
  color?: string
  labels?: string[]
}

interface NVLRelationship {
  id: string
  from: string
  to: string
  caption?: string
}

const NODE_STYLE: Record<string, { color: string; size: number }> = {
  MeSpace: { color: '#86efac', size: 42 },
  WeSpace: { color: '#86efac', size: 42 },
  FieldContext: { color: '#fde68a', size: 34 },
  GoalPulse: { color: '#93c5fd', size: 26 },
  ResourcePulse: { color: '#a7f3d0', size: 26 },
  StoryPulse: { color: '#c4b5fd', size: 26 },
  CarePulse: { color: '#fca5a5', size: 26 },
  CoreValuePulse: { color: '#fcd34d', size: 26 },
  FieldPulse: { color: '#93c5fd', size: 26 },
  Person: { color: '#f9a8d4', size: 30 },
  ResonanceLink: { color: '#d8b4fe', size: 22 },
  PersonPulse: { color: '#f9a8d4', size: 26 },
}

function styleFor(label: string) {
  return NODE_STYLE[label] ?? { color: '#cbd5e1', size: 24 }
}

interface RawNode {
  id: string
  labels: string[]
  caption: string
}
interface RawRel {
  id: string
  from: string
  to: string
  type: string
}

function toNVL(
  rawNodes: RawNode[],
  rawRels: RawRel[]
): { nodes: NVLNode[]; relationships: NVLRelationship[] } {
  const nodes: NVLNode[] = rawNodes.map((n) => {
    const primaryLabel = n.labels.find((l) => NODE_STYLE[l]) ?? n.labels[0] ?? ''
    const { color, size } = styleFor(primaryLabel)
    return {
      id: n.id,
      caption: n.caption || primaryLabel,
      size,
      color,
      labels: n.labels,
    }
  })
  const relationships: NVLRelationship[] = rawRels.map((r) => ({
    id: r.id,
    from: r.from,
    to: r.to,
    caption: r.type,
  }))
  return { nodes, relationships }
}

/**
 * Authorize the user against a Space (any role). Returns true on permit.
 * Uses the canonical OWNS + SpaceMembership relationship per
 * kb/02-user-roles.md — matches `canViewContent` in
 * src/lib/permissions/space-permissions.ts.
 */
async function canViewSpace(
  session: ReturnType<typeof getSession>,
  userId: string,
  spaceId: string
): Promise<boolean> {
  const result = await session.run(
    `
    MATCH (user:Person {id: $userId})
    OPTIONAL MATCH (user)-[:OWNS]->(s1:Space {id: $spaceId})
    OPTIONAL MATCH (user)<-[:IS_MEMBER]-(:SpaceMembership)<-[:HAS_MEMBER]-(s2:Space {id: $spaceId})
    RETURN (s1 IS NOT NULL) OR (s2 IS NOT NULL) AS allowed
    `,
    { userId, spaceId }
  )
  return result.records[0]?.get('allowed') === true
}

/**
 * Resolve the Space id that owns a given FieldContext / FieldPulse / etc.
 * The focal entity's own id might not be directly authorizable (a Pulse is
 * not a Space) — but every node we surface in Bloom is rooted in a Space,
 * so we walk up once and authorize there.
 */
async function resolveEnclosingSpaceId(
  session: ReturnType<typeof getSession>,
  focalType: FocalEntityType,
  focalId: string
): Promise<string | null> {
  if (focalType === 'MeSpace' || focalType === 'WeSpace') return focalId
  if (focalType === 'FieldContext') {
    const r = await session.run(
      `MATCH (ctx:FieldContext {id: $focalId})<-[:HAS_CONTEXT]-(s:Space) RETURN s.id AS id LIMIT 1`,
      { focalId }
    )
    return (r.records[0]?.get('id') as string) ?? null
  }
  // Pulse types — walk pulse → context → space
  const r = await session.run(
    `
    MATCH (p {id: $focalId})
    OPTIONAL MATCH (p)<-[:HAS_PULSE]-(ctx:FieldContext)<-[:HAS_CONTEXT]-(s:Space)
    RETURN s.id AS id LIMIT 1
    `,
    { focalId }
  )
  return (r.records[0]?.get('id') as string) ?? null
}

/**
 * Fetch raw nodes + relationships for the focal entity at one hop. Each
 * branch is a narrow query — no polymorphic mega-query (per the technical
 * notes on GOAL-232).
 *
 * The Cypher uses `coalesce(<name fields…>)` to surface a human-readable
 * caption per `kb/07-ai-assistant-ux.md` Rule 1 — UI never shows raw IDs.
 */
async function fetchNeighborhood(
  session: ReturnType<typeof getSession>,
  focalType: FocalEntityType,
  focalId: string
): Promise<{ rawNodes: RawNode[]; rawRels: RawRel[] }> {
  if (focalType === 'MeSpace' || focalType === 'WeSpace') {
    const r = await session.run(
      `
      MATCH (space:Space {id: $focalId})
      OPTIONAL MATCH (space)-[:HAS_CONTEXT]->(ctx:FieldContext)
      OPTIONAL MATCH (ctx)-[:HAS_PULSE]->(p:FieldPulse)
      WITH space, collect(DISTINCT ctx) AS contexts, collect(DISTINCT p) AS pulses
      RETURN
        space,
        contexts,
        pulses
      `,
      { focalId }
    )
    if (r.records.length === 0) return { rawNodes: [], rawRels: [] }
    const rec = r.records[0]
    const space = rec.get('space')
    const contexts = (rec.get('contexts') as Array<Record<string, unknown>>) ?? []
    const pulses = (rec.get('pulses') as Array<Record<string, unknown>>) ?? []
    const rawNodes: RawNode[] = [
      {
        id: String(space.properties.id),
        labels: space.labels as string[],
        caption: String(space.properties.name || 'Space'),
      },
      ...contexts.map((ctx) => ({
        id: String((ctx as { properties: { id: string } }).properties.id),
        labels: (ctx as { labels: string[] }).labels,
        caption: String(
          (ctx as { properties: { title?: string; emergentName?: string } })
            .properties.title ||
            (ctx as { properties: { emergentName?: string } }).properties
              .emergentName ||
            'Field'
        ),
      })),
      ...pulses.map((p) => ({
        id: String((p as { properties: { id: string } }).properties.id),
        labels: (p as { labels: string[] }).labels,
        caption: String(
          (p as { properties: { title?: string } }).properties.title || 'Pulse'
        ),
      })),
    ]
    const rawRels: RawRel[] = []
    for (const ctx of contexts) {
      const ctxId = String((ctx as { properties: { id: string } }).properties.id)
      rawRels.push({
        id: `${space.properties.id}->${ctxId}`,
        from: String(space.properties.id),
        to: ctxId,
        type: 'HAS_CONTEXT',
      })
    }
    // Edge from each context to its pulses requires re-resolution — quick
    // second pass keyed off pulse.context relationship.
    const pulseLinks = await session.run(
      `
      MATCH (space:Space {id: $focalId})-[:HAS_CONTEXT]->(ctx:FieldContext)-[:HAS_PULSE]->(p:FieldPulse)
      RETURN ctx.id AS ctxId, p.id AS pulseId
      `,
      { focalId }
    )
    for (const row of pulseLinks.records) {
      const ctxId = String(row.get('ctxId'))
      const pulseId = String(row.get('pulseId'))
      rawRels.push({
        id: `${ctxId}->${pulseId}`,
        from: ctxId,
        to: pulseId,
        type: 'HAS_PULSE',
      })
    }
    return { rawNodes, rawRels }
  }

  if (focalType === 'FieldContext') {
    // Two trips instead of one — chaining all five OPTIONAL MATCH clauses
    // in a single query fans the intermediate row count 26× (profile: 18.6k
    // dbHits → 2k). The split keeps the same shape but lets each subgraph
    // collect independently. Recommendation from the GOAL-230..234 cypher
    // review; ~89% dbHit reduction on Robert's FieldContext.
    const r = await session.run(
      `
      MATCH (ctx:FieldContext {id: $focalId})
      OPTIONAL MATCH (ctx)-[:HAS_PULSE]->(p:FieldPulse)
      OPTIONAL MATCH (p)-[:CREATED_BY]->(person:Person)
      WITH ctx,
           collect(DISTINCT p) AS pulses,
           collect(DISTINCT person) AS persons,
           collect(DISTINCT {pulseId: p.id, personId: person.id}) AS createdByEdges
      RETURN ctx, pulses, persons, createdByEdges
      `,
      { focalId }
    )
    if (r.records.length === 0) return { rawNodes: [], rawRels: [] }
    const rec = r.records[0]
    const ctx = rec.get('ctx')
    const pulses = (rec.get('pulses') as Array<Record<string, unknown>>) ?? []
    const persons = (rec.get('persons') as Array<Record<string, unknown>>) ?? []
    const createdByEdges =
      (rec.get('createdByEdges') as Array<{
        pulseId: string | null
        personId: string | null
      }>) ?? []

    // Second trip — resonances anchored on the same context. Anchoring on
    // the FieldContext means we never scan ResonanceLink globally.
    const resoTrip = await session.run(
      `
      MATCH (ctx:FieldContext {id: $focalId})
      OPTIONAL MATCH (ctx)-[:HAS_RESONANCE]->(rl:ResonanceLink)
      OPTIONAL MATCH (rl)-[:SOURCE]->(srcPulse:FieldPulse)
      OPTIONAL MATCH (rl)-[:TARGET]->(tgtPulse:FieldPulse)
      WITH collect(DISTINCT rl) AS resonances,
           collect(DISTINCT {rlId: rl.id, srcId: srcPulse.id, tgtId: tgtPulse.id}) AS resoEdges
      RETURN resonances, resoEdges
      `,
      { focalId }
    )
    const resoRec = resoTrip.records[0]
    const resonances =
      (resoRec?.get('resonances') as Array<Record<string, unknown>>) ?? []
    const resoEdges =
      (resoRec?.get('resoEdges') as Array<{
        rlId: string | null
        srcId: string | null
        tgtId: string | null
      }>) ?? []

    const rawNodes: RawNode[] = [
      {
        id: String(ctx.properties.id),
        labels: ctx.labels as string[],
        caption: String(
          ctx.properties.title || ctx.properties.emergentName || 'Field'
        ),
      },
      ...pulses.map((p) => ({
        id: String((p as { properties: { id: string } }).properties.id),
        labels: (p as { labels: string[] }).labels,
        caption: String(
          (p as { properties: { title?: string } }).properties.title || 'Pulse'
        ),
      })),
      ...persons.map((person) => ({
        id: String(
          (person as { properties: { id: string } }).properties.id
        ),
        labels: (person as { labels: string[] }).labels,
        caption: String(
          (person as {
            properties: {
              name?: string
              firstName?: string
              lastName?: string
            }
          }).properties.name ||
            `${
              (person as { properties: { firstName?: string } }).properties
                .firstName ?? ''
            } ${
              (person as { properties: { lastName?: string } }).properties
                .lastName ?? ''
            }`.trim() ||
            'Person'
        ),
      })),
      ...resonances.map((rl) => ({
        id: String((rl as { properties: { id: string } }).properties.id),
        labels: (rl as { labels: string[] }).labels,
        caption: 'Resonance',
      })),
    ]
    const rawRels: RawRel[] = []
    for (const p of pulses) {
      const pulseId = String(
        (p as { properties: { id: string } }).properties.id
      )
      rawRels.push({
        id: `${ctx.properties.id}->${pulseId}`,
        from: String(ctx.properties.id),
        to: pulseId,
        type: 'HAS_PULSE',
      })
    }
    for (const edge of createdByEdges) {
      if (!edge.pulseId || !edge.personId) continue
      rawRels.push({
        id: `${edge.pulseId}->${edge.personId}`,
        from: edge.pulseId,
        to: edge.personId,
        type: 'CREATED_BY',
      })
    }
    for (const edge of resoEdges) {
      if (!edge.rlId) continue
      if (edge.srcId) {
        rawRels.push({
          id: `${edge.rlId}-source-${edge.srcId}`,
          from: edge.rlId,
          to: edge.srcId,
          type: 'SOURCE',
        })
      }
      if (edge.tgtId) {
        rawRels.push({
          id: `${edge.rlId}-target-${edge.tgtId}`,
          from: edge.rlId,
          to: edge.tgtId,
          type: 'TARGET',
        })
      }
    }
    return { rawNodes, rawRels }
  }

  // Pulse focal — show pulse + creator + resonance neighbors
  const r = await session.run(
    `
    MATCH (p:FieldPulse {id: $focalId})
    OPTIONAL MATCH (p)-[:CREATED_BY]->(person:Person)
    OPTIONAL MATCH (p)<-[:SOURCE|TARGET]-(rl:ResonanceLink)-[:SOURCE|TARGET]->(neighbor:FieldPulse)
      WHERE neighbor.id <> $focalId
    WITH p,
         collect(DISTINCT person) AS persons,
         collect(DISTINCT rl) AS resonances,
         collect(DISTINCT neighbor) AS neighbors
    RETURN p, persons, resonances, neighbors
    `,
    { focalId }
  )
  if (r.records.length === 0) return { rawNodes: [], rawRels: [] }
  const rec = r.records[0]
  const pulse = rec.get('p')
  const persons = (rec.get('persons') as Array<Record<string, unknown>>) ?? []
  const resonances =
    (rec.get('resonances') as Array<Record<string, unknown>>) ?? []
  const neighbors =
    (rec.get('neighbors') as Array<Record<string, unknown>>) ?? []
  const rawNodes: RawNode[] = [
    {
      id: String(pulse.properties.id),
      labels: pulse.labels as string[],
      caption: String(pulse.properties.title || 'Pulse'),
    },
    ...persons.map((person) => ({
      id: String((person as { properties: { id: string } }).properties.id),
      labels: (person as { labels: string[] }).labels,
      caption: String(
        (person as { properties: { name?: string } }).properties.name ||
          'Person'
      ),
    })),
    ...resonances.map((rl) => ({
      id: String((rl as { properties: { id: string } }).properties.id),
      labels: (rl as { labels: string[] }).labels,
      caption: 'Resonance',
    })),
    ...neighbors.map((n) => ({
      id: String((n as { properties: { id: string } }).properties.id),
      labels: (n as { labels: string[] }).labels,
      caption: String(
        (n as { properties: { title?: string } }).properties.title || 'Pulse'
      ),
    })),
  ]
  const rawRels: RawRel[] = []
  for (const person of persons) {
    const personId = String(
      (person as { properties: { id: string } }).properties.id
    )
    rawRels.push({
      id: `${pulse.properties.id}->${personId}`,
      from: String(pulse.properties.id),
      to: personId,
      type: 'CREATED_BY',
    })
  }
  // Resonance edges require a second pass to know which side each pulse is on
  const resoLinks = await session.run(
    `
    MATCH (p:FieldPulse {id: $focalId})<-[:SOURCE|TARGET]-(rl:ResonanceLink)-[:SOURCE|TARGET]->(neighbor:FieldPulse)
      WHERE neighbor.id <> $focalId
    OPTIONAL MATCH (rl)-[:SOURCE]->(src:FieldPulse)
    OPTIONAL MATCH (rl)-[:TARGET]->(tgt:FieldPulse)
    RETURN DISTINCT rl.id AS rlId, src.id AS srcId, tgt.id AS tgtId
    `,
    { focalId }
  )
  for (const row of resoLinks.records) {
    const rlId = row.get('rlId') as string | null
    const srcId = row.get('srcId') as string | null
    const tgtId = row.get('tgtId') as string | null
    if (!rlId) continue
    if (srcId) {
      rawRels.push({
        id: `${rlId}-source-${srcId}`,
        from: rlId,
        to: srcId,
        type: 'SOURCE',
      })
    }
    if (tgtId) {
      rawRels.push({
        id: `${rlId}-target-${tgtId}`,
        from: rlId,
        to: tgtId,
        type: 'TARGET',
      })
    }
  }
  return { rawNodes, rawRels }
}

/**
 * Fallback when no focal is set — show the user's own MeSpace one hop deep.
 * Keeps Bloom from rendering empty on the neutral surface.
 */
async function fetchDefaultNeighborhood(
  session: ReturnType<typeof getSession>,
  userId: string
): Promise<{ focalType: FocalEntityType; focalId: string } | null> {
  const r = await session.run(
    `MATCH (u:Person {id: $userId})-[:OWNS]->(s:MeSpace) RETURN s.id AS id LIMIT 1`,
    { userId }
  )
  const id = r.records[0]?.get('id') as string | null
  if (!id) return null
  return { focalType: 'MeSpace', focalId: id }
}

export async function POST(request: NextRequest) {
  try {
    const userId = resolveAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      )
    }

    const parsed = await parseRequestBody(request)
    // Allow empty body for the default neighborhood case.
    const body = parsed.ok ? parsed.body : {}
    const parseResult = requestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      )
    }

    let focalType = parseResult.data.focalType ?? null
    let focalId = parseResult.data.focalId ?? null
    if (focalType && !isFocalEntityType(focalType)) {
      return NextResponse.json(
        { error: `Unsupported focal type: ${focalType}` },
        { status: 400 }
      )
    }

    initializeDB()
    const session = getSession()

    try {
      // No focal — fall back to the user's MeSpace so the graph isn't empty.
      if (!focalType || !focalId) {
        const fallback = await fetchDefaultNeighborhood(session, userId)
        if (!fallback) {
          return NextResponse.json({ nodes: [], relationships: [] })
        }
        focalType = fallback.focalType
        focalId = fallback.focalId
      }

      // Authorize against the enclosing Space.
      const spaceId = await resolveEnclosingSpaceId(
        session,
        focalType as FocalEntityType,
        focalId
      )
      if (!spaceId) {
        // Focal target does not resolve to any Space — likely deleted /
        // unauthorized. Return empty rather than 404 so the UI degrades
        // gracefully (the focal chip stays, the graph just shows nothing).
        return NextResponse.json({ nodes: [], relationships: [] })
      }
      const allowed = await canViewSpace(session, userId, spaceId)
      if (!allowed) {
        return NextResponse.json(
          { error: 'You do not have access to that scope.' },
          { status: 403 }
        )
      }

      const { rawNodes, rawRels } = await fetchNeighborhood(
        session,
        focalType as FocalEntityType,
        focalId
      )
      return NextResponse.json(toNVL(rawNodes, rawRels))
    } finally {
      await session.close()
    }
  } catch (error) {
    return NextResponse.json(
      { error: parseError(error) },
      { status: 500 }
    )
  }
}
