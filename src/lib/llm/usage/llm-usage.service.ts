import { randomUUID } from 'node:crypto'
import type { ManagedTransaction } from 'neo4j-driver'
import { driver } from '@/lib/neo4j/driver'
import { computeCostUsd, KNOWN_MODELS } from '@/lib/llm/pricing'

/**
 * Per-user, per-model LLM usage & cost metering (GOAL-297, Phase 1).
 *
 * Every LLM / embedding call writes one `(:LlmUsage)` node here, attributed
 * either to the acting `Person` (interactive requests) or to a singleton
 * `SystemPrincipal` node (background / cron work that has no logged-in
 * caller: resonance discovery, person enrichment, feedback classification,
 * embedding backfills). Cost is derived from the configurable per-model
 * price table (`@/lib/llm/pricing`).
 *
 * Schema:
 *
 *   (:LlmUsage {
 *      id, model, provider, source,
 *      promptTokens, completionTokens, totalTokens,
 *      costUsd, tokensEstimated, priced, principal, userId, createdAt
 *   })
 *     -[:INCURRED_BY]-> (:Person)                      // principal = 'user'
 *     -[:INCURRED_BY]-> (:SystemPrincipal {id:'system'}) // principal = 'system'
 *     -[:IN_CONTEXT_OF]-> (:ConversationThread)         // optional (chat)
 *
 * Activity logging: usage writes are NOT mirrored into the `Log` stream —
 * they follow the same exemption as `ConversationTurn` / `AssistantFeedback`
 * (the node itself is the audit trail). The Phase-2 cap-config mutations
 * WILL be logged; those are out of scope here.
 *
 * Every write is safe to fire-and-forget: callers wrap in `void … .catch()`
 * so a Neo4j hiccup on the metering path can never break a chat turn, an
 * ingest run, or a cron job.
 */

export type LlmUsagePrincipal = 'user' | 'system'
export type LlmProviderName = 'openai' | 'gemini'

/**
 * Where the spend came from — one label per logical call site. Kept as a
 * closed union so the dashboard can group/label consistently.
 */
export type LlmUsageSource =
  | 'chat'
  | 'title-gen'
  | 'cypher-gen'
  | 'doc-extract'
  | 'doc-summary'
  | 'embeddings'
  | 'enrichment'
  | 'resonance-analysis'
  | 'feedback-classify'

export interface RecordLlmUsageInput {
  model: string
  provider: LlmProviderName
  source: LlmUsageSource
  promptTokens: number
  completionTokens: number
  /** Optional; defaults to promptTokens + completionTokens. */
  totalTokens?: number
  principal: LlmUsagePrincipal
  /** Required when principal = 'user'; ignored for 'system'. */
  userId?: string | null
  /** Optional link to the chat thread the spend happened in. */
  threadId?: string | null
  /**
   * True when the token counts were locally estimated rather than reported
   * by the model API (today: never — embeddings use an exact tiktoken
   * count. Reserved for a future coarse-estimate fallback).
   */
  tokensEstimated?: boolean
}

const SYSTEM_PRINCIPAL_LABEL = 'System (background)'

/**
 * Persist a single usage record. Never throws in a way that reaches the
 * caller's hot path — the caller should still `void`/`.catch()` it, but we
 * also swallow-and-log internally so a transient DB error is a no-op.
 */
export async function recordLlmUsage(input: RecordLlmUsageInput): Promise<void> {
  const promptTokens = Math.max(0, Math.round(input.promptTokens || 0))
  const completionTokens = Math.max(0, Math.round(input.completionTokens || 0))
  const totalTokens =
    typeof input.totalTokens === 'number'
      ? Math.max(0, Math.round(input.totalTokens))
      : promptTokens + completionTokens

  const { costUsd, priced } = computeCostUsd(input.model, {
    promptTokens,
    completionTokens,
  })

  const userId = input.principal === 'user' ? input.userId ?? null : null

  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        CREATE (u:LlmUsage {
          id: $id,
          model: $model,
          provider: $provider,
          source: $source,
          promptTokens: $promptTokens,
          completionTokens: $completionTokens,
          totalTokens: $totalTokens,
          costUsd: $costUsd,
          priced: $priced,
          tokensEstimated: $tokensEstimated,
          principal: $principal,
          userId: $userId,
          createdAt: datetime()
        })
        WITH u
        // System spend → singleton principal (MERGE'd so no migration needed).
        CALL {
          WITH u
          WITH u WHERE $principal = 'system'
          MERGE (sp:SystemPrincipal {id: 'system'})
            ON CREATE SET sp.label = $systemLabel
          CREATE (u)-[:INCURRED_BY]->(sp)
        }
        // User spend → the acting Person (edge only if the Person exists;
        // the usage node is written either way so nothing is dropped).
        CALL {
          WITH u
          WITH u WHERE $principal = 'user' AND $userId IS NOT NULL
          OPTIONAL MATCH (p:Person {id: $userId})
          FOREACH (_ IN CASE WHEN p IS NULL THEN [] ELSE [1] END |
            CREATE (u)-[:INCURRED_BY]->(p))
        }
        // Optional thread linkage for chat spend.
        CALL {
          WITH u
          WITH u WHERE $threadId IS NOT NULL
          OPTIONAL MATCH (t:ConversationThread {id: $threadId})
          FOREACH (_ IN CASE WHEN t IS NULL THEN [] ELSE [1] END |
            CREATE (u)-[:IN_CONTEXT_OF]->(t))
        }
        RETURN u.id AS id
        `,
        {
          id: `usage_${randomUUID()}`,
          model: input.model,
          provider: input.provider,
          source: input.source,
          promptTokens,
          completionTokens,
          totalTokens,
          costUsd,
          priced,
          tokensEstimated: input.tokensEstimated ?? false,
          principal: input.principal,
          userId,
          threadId: input.threadId ?? null,
          systemLabel: SYSTEM_PRINCIPAL_LABEL,
        }
      )
    )
  } catch (error) {
    console.warn(
      '[llm-usage] Failed to record usage:',
      error instanceof Error ? error.message : error
    )
  } finally {
    // Swallow close() errors too — this function must NEVER reject, so the
    // `void recordLlmUsage(...)` fire-and-forget call sites can't produce an
    // unhandled rejection from a transient driver hiccup.
    await session.close().catch(() => {})
  }
}

/** Coerce a Neo4j numeric (Integer object | number | null) to a JS number. */
function num(value: unknown): number {
  if (value == null) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'object' && 'toNumber' in (value as object)) {
    try {
      return (value as { toNumber: () => number }).toNumber()
    } catch {
      return 0
    }
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export interface UsageTotals {
  calls: number
  totalTokens: number
  promptTokens: number
  completionTokens: number
  costUsd: number
}

export interface UsageByModelRow {
  model: string
  provider: string
  calls: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
  costUsd: number
}

export interface UsageByActorRow {
  /** Person id or 'system'. NOT rendered raw in UI — name is. */
  actorId: string
  /** Resolved display name (person name/email, or "System (background)"). */
  name: string
  principal: LlmUsagePrincipal
  calls: number
  totalTokens: number
  costUsd: number
}

export interface UsageRecentRow {
  id: string
  model: string
  provider: string
  source: string
  principal: LlmUsagePrincipal
  actorName: string
  totalTokens: number
  costUsd: number
  priced: boolean
  createdAt: string
}

export interface LlmUsageReport {
  totals: UsageTotals
  byModel: UsageByModelRow[]
  byActor: UsageByActorRow[]
  recent: UsageRecentRow[]
  /** ISO cutoff applied, or null for all-time. */
  since: string | null
}

/**
 * Build the dev-dashboard report: totals, spend-by-model, spend-by-actor
 * (per user + the system principal), and recent calls. Optionally scoped
 * to calls at/after `sinceIso`.
 *
 * Dev-only surface (env-gated at the route). NOT user-scoped by design —
 * do not expose through any user-facing route without adding a userId gate.
 */
export async function getLlmUsageReport(
  opts: { sinceIso?: string | null; recentLimit?: number } = {}
): Promise<LlmUsageReport> {
  const since = opts.sinceIso ?? null
  const recentLimit = Math.min(Math.max(opts.recentLimit ?? 50, 1), 200)

  // Static WHERE fragment so a range index on LlmUsage.createdAt is
  // reachable — a `$since IS NULL OR …` disjunction defeats the index. Only
  // a constant clause is interpolated here; the value stays parameterized as
  // $since. All-time reads omit it (a full label scan is the right plan when
  // every row is genuinely wanted).
  const sinceClause = since ? 'WHERE u.createdAt >= datetime($since)' : ''

  // Each parallel read needs its OWN session: neo4j-driver runs one
  // transaction at a time per session, so Promise.all over a single
  // session's executeRead would conflict. Mirror the session-per-read
  // pattern in search-resolver.ts.
  const runRead = <T>(
    work: (tx: ManagedTransaction) => Promise<T>
  ): Promise<T> => {
    const s = driver.session()
    return s.executeRead(work).finally(() => s.close())
  }

  const [totalsRes, byModelRes, byActorRes, recentRes] = await Promise.all([
      runRead((tx) =>
        tx.run(
          `
          MATCH (u:LlmUsage)
          ${sinceClause}
          RETURN
            count(u) AS calls,
            sum(u.totalTokens) AS totalTokens,
            sum(u.promptTokens) AS promptTokens,
            sum(u.completionTokens) AS completionTokens,
            sum(u.costUsd) AS costUsd
          `,
          { since }
        )
      ),
      runRead((tx) =>
        tx.run(
          `
          MATCH (u:LlmUsage)
          ${sinceClause}
          RETURN
            u.model AS model,
            coalesce(u.provider, 'openai') AS provider,
            count(u) AS calls,
            sum(u.promptTokens) AS promptTokens,
            sum(u.completionTokens) AS completionTokens,
            sum(u.totalTokens) AS totalTokens,
            sum(u.costUsd) AS costUsd
          ORDER BY costUsd DESC
          `,
          { since }
        )
      ),
      runRead((tx) =>
        tx.run(
          `
          MATCH (u:LlmUsage)
          ${sinceClause}
          OPTIONAL MATCH (u)-[:INCURRED_BY]->(actor)
          WITH
            u,
            actor,
            CASE
              WHEN actor:SystemPrincipal THEN 'system'
              WHEN actor:Person THEN coalesce(actor.id, 'unknown')
              ELSE coalesce(u.userId, 'unattributed')
            END AS actorId,
            CASE
              WHEN actor:SystemPrincipal THEN coalesce(actor.label, 'System (background)')
              WHEN actor:Person THEN coalesce(
                actor.name,
                // Name-only in the report — never fall through to email (PII).
                CASE
                  WHEN trim(coalesce(actor.firstName,'') + ' ' + coalesce(actor.lastName,'')) = ''
                  THEN null ELSE trim(coalesce(actor.firstName,'') + ' ' + coalesce(actor.lastName,''))
                END,
                'Unknown person'
              )
              ELSE 'Unattributed'
            END AS name,
            coalesce(u.principal, 'user') AS principal
          RETURN
            actorId,
            head(collect(name)) AS name,
            head(collect(principal)) AS principal,
            count(u) AS calls,
            sum(u.totalTokens) AS totalTokens,
            sum(u.costUsd) AS costUsd
          ORDER BY costUsd DESC
          `,
          { since }
        )
      ),
      runRead((tx) =>
        tx.run(
          `
          MATCH (u:LlmUsage)
          ${sinceClause}
          OPTIONAL MATCH (u)-[:INCURRED_BY]->(actor)
          WITH u, actor
          ORDER BY u.createdAt DESC
          LIMIT toInteger($recentLimit)
          RETURN
            u.id AS id,
            u.model AS model,
            coalesce(u.provider, 'openai') AS provider,
            u.source AS source,
            coalesce(u.principal, 'user') AS principal,
            coalesce(u.costUsd, 0.0) AS costUsd,
            coalesce(u.totalTokens, 0) AS totalTokens,
            coalesce(u.priced, true) AS priced,
            toString(u.createdAt) AS createdAt,
            CASE
              WHEN actor:SystemPrincipal THEN coalesce(actor.label, 'System (background)')
              WHEN actor:Person THEN coalesce(
                actor.name,
                // Name-only in the report — never fall through to email (PII).
                CASE
                  WHEN trim(coalesce(actor.firstName,'') + ' ' + coalesce(actor.lastName,'')) = ''
                  THEN null ELSE trim(coalesce(actor.firstName,'') + ' ' + coalesce(actor.lastName,''))
                END,
                'Unknown person'
              )
              ELSE 'Unattributed'
            END AS actorName
          `,
          { since, recentLimit }
        )
      ),
    ])

    const t = totalsRes.records[0]
    const totals: UsageTotals = {
      calls: num(t?.get('calls')),
      totalTokens: num(t?.get('totalTokens')),
      promptTokens: num(t?.get('promptTokens')),
      completionTokens: num(t?.get('completionTokens')),
      costUsd: num(t?.get('costUsd')),
    }

    // Seed a zero row for every model GoalPost is wired to call, then overlay
    // the recorded aggregates. This makes the "Spend by model" table a
    // catalog, not just a log: a configured-but-unused model (e.g. the Gemini
    // multimodal extractor before any document is ingested, or any model with
    // no spend in the selected window) shows with $0 rather than vanishing.
    // Recorded models that aren't in the catalog (e.g. an env-overridden
    // extraction model id) are still included from their usage rows.
    const modelMap = new Map<string, UsageByModelRow>()
    for (const km of KNOWN_MODELS) {
      modelMap.set(km.model, {
        model: km.model,
        provider: km.provider,
        calls: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        costUsd: 0,
      })
    }
    for (const r of byModelRes.records) {
      const model = (r.get('model') as string) ?? 'unknown'
      modelMap.set(model, {
        model,
        provider: (r.get('provider') as string) ?? 'openai',
        calls: num(r.get('calls')),
        promptTokens: num(r.get('promptTokens')),
        completionTokens: num(r.get('completionTokens')),
        totalTokens: num(r.get('totalTokens')),
        costUsd: num(r.get('costUsd')),
      })
    }
    // Highest spend first; unused models fall to the bottom, ordered by id so
    // the list is stable across windows.
    const byModel: UsageByModelRow[] = Array.from(modelMap.values()).sort(
      (a, b) =>
        b.costUsd - a.costUsd ||
        b.totalTokens - a.totalTokens ||
        a.model.localeCompare(b.model)
    )

    const byActor: UsageByActorRow[] = byActorRes.records.map((r) => ({
      actorId: (r.get('actorId') as string) ?? 'unattributed',
      name: (r.get('name') as string) ?? 'Unattributed',
      principal: ((r.get('principal') as string) ?? 'user') as LlmUsagePrincipal,
      calls: num(r.get('calls')),
      totalTokens: num(r.get('totalTokens')),
      costUsd: num(r.get('costUsd')),
    }))

    const recent: UsageRecentRow[] = recentRes.records.map((r) => ({
      id: r.get('id') as string,
      model: (r.get('model') as string) ?? 'unknown',
      provider: (r.get('provider') as string) ?? 'openai',
      source: (r.get('source') as string) ?? 'chat',
      principal: ((r.get('principal') as string) ?? 'user') as LlmUsagePrincipal,
      actorName: (r.get('actorName') as string) ?? 'Unattributed',
      totalTokens: num(r.get('totalTokens')),
      costUsd: num(r.get('costUsd')),
      priced: Boolean(r.get('priced')),
      createdAt: (r.get('createdAt') as string) ?? '',
    }))

    return { totals, byModel, byActor, recent, since }
}
