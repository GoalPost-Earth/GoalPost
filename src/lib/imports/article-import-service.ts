import { randomUUID } from 'node:crypto'
import type { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { executeAuthorizedWriteTool } from '@/lib/chat/hitl'
import { normalizeEmail } from '@/lib/auth/normalize-email'
import {
  type ArticleImportResult,
  type ArticleImportRowInput,
  type ArticleImportSummary,
  type ArticleRowOutcome,
  buildArticleRowContent,
  normalizeArticleDate,
  normalizeArticleUrl,
} from './article-import'

/**
 * GOAL-317 — server-side orchestration for the article import batch.
 *
 * Every write goes through `executeAuthorizedWriteTool` (the same audited
 * path chat HITL and document ingestion use), so each row inherits the
 * canEditContext gate, the enrich-don't-duplicate idempotency, the
 * INITIATED_BY attribution guard, and per-entity activity Logs. Rows are
 * processed independently — one failing row never aborts the batch.
 */

interface ProcessArticleImportParams {
  graph: Neo4jGraph
  currentUserId: string
  fieldContextId: string
  rows: ArticleImportRowInput[]
}

interface ResolvedAuthor {
  personId: string
  authorName: string
}

type AuthorResolution =
  | (ResolvedAuthor & { ok: true; isNewPerson: boolean; wasMatched: boolean })
  | { ok: false; failureMessage: string }

const ALLOWED_ARTICLE_PULSE_TYPES = new Set([
  'GoalPulse',
  'ResourcePulse',
  'StoryPulse',
])

/** Member-safe copy — raw errors are logged server-side only (kb/07 Rule 1). */
const ROW_WRITE_FAILED_MESSAGE =
  'Something went wrong while saving this row. Please try again.'

function buildImportLogMetadata(fieldContextId: string): string {
  return JSON.stringify({ source: 'article-import', fieldContextId })
}

/**
 * Resolve the context's title and whether the caller may contribute to it —
 * owner or ADMIN/MEMBER on the parent Space (GUEST is view-only). Same gate
 * shape as the ingest presign route.
 */
async function loadEditableContext(
  graph: Neo4jGraph,
  currentUserId: string,
  fieldContextId: string
): Promise<{ found: boolean; allowed: boolean; title: string }> {
  // EXISTS-wrapped so an anomalous context with two HAS_CONTEXT parents can
  // neither fan out into rows nor let LIMIT 1 pick the wrong parent — same
  // shape as addPersonToFieldContext's edit gate.
  const rows = await graph.query<{ title: string | null; allowed: boolean }>(
    `
    MATCH (c:FieldContext {id: $fieldContextId})
    RETURN c.title AS title,
      EXISTS {
        MATCH (space:Space)-[:HAS_CONTEXT]->(c)
        WHERE (:Person {id: $userId})-[:OWNS]->(space)
           OR EXISTS {
             MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(:Person {id: $userId})
             WHERE sm.role IN ['ADMIN', 'MEMBER']
           }
      } AS allowed
    LIMIT 1
    `,
    { fieldContextId, userId: currentUserId }
  )
  const record = rows?.[0]
  if (!record) return { found: false, allowed: false, title: '' }
  return {
    found: true,
    allowed: Boolean(record.allowed),
    title: record.title?.trim() || '',
  }
}

/**
 * Email-first author match, scoped to the caller's relational world: their
 * own account, people already attached to this context, then their
 * CONNECTED_TO contacts. A connection match is attached to the context
 * (HAS_PERSON) so the attribution guard in create_pulse can credit them;
 * the attach writes one Log, only when the edge is actually new.
 */
async function matchAuthorByEmail(
  graph: Neo4jGraph,
  currentUserId: string,
  fieldContextId: string,
  contextTitle: string,
  email: string
): Promise<ResolvedAuthor | null> {
  const rows = await graph.query<{
    isSelf: boolean
    contextPersonId: string | null
    contextPersonName: string | null
    connectionPersonId: string | null
    connectionPersonName: string | null
  }>(
    `
    MATCH (me:Person {id: $currentUserId})
    OPTIONAL MATCH (:FieldContext {id: $fieldContextId})-[:HAS_PERSON]->(cp:Person)
      WHERE toLower(trim(coalesce(cp.email, ''))) = $email
    WITH me, collect(DISTINCT cp)[0] AS contextMatch
    OPTIONAL MATCH (me)-[:CONNECTED_TO]-(conn:Person)
      WHERE toLower(trim(coalesce(conn.email, ''))) = $email
    WITH me, contextMatch, collect(DISTINCT conn)[0] AS connectionMatch
    RETURN
      toLower(trim(coalesce(me.email, ''))) = $email AS isSelf,
      contextMatch.id AS contextPersonId,
      coalesce(contextMatch.name, trim(coalesce(contextMatch.firstName, '') + ' ' + coalesce(contextMatch.lastName, ''))) AS contextPersonName,
      connectionMatch.id AS connectionPersonId,
      coalesce(connectionMatch.name, trim(coalesce(connectionMatch.firstName, '') + ' ' + coalesce(connectionMatch.lastName, ''))) AS connectionPersonName
    LIMIT 1
    `,
    { currentUserId, fieldContextId, email }
  )

  const match = rows?.[0]
  if (!match) return null

  if (match.isSelf) {
    // Attribution to the acting user is the create_pulse default — no
    // HAS_PERSON attach needed.
    return { personId: currentUserId, authorName: 'you' }
  }

  if (match.contextPersonId) {
    return {
      personId: match.contextPersonId,
      authorName: match.contextPersonName?.trim() || 'person',
    }
  }

  if (match.connectionPersonId) {
    const name = match.connectionPersonName?.trim() || 'person'
    const attached = await graph.query<{ id: string }>(
      `
      MATCH (c:FieldContext {id: $fieldContextId})
      MATCH (u:Person {id: $currentUserId})
      MATCH (p:Person {id: $personId})
      // Target gate (mirrors addPersonToFieldContext): attaching unlocks the
      // person's gated PII to EVERY Space that can reach this context, so a
      // registered User may only be attached when they are the caller or
      // already belong to ALL exposing Spaces. CONNECTED_TO alone is NOT a
      // consent signal — without this clause a caller could force-attach any
      // registered user by email and expose their PII to the whole Space.
      WHERE (NOT p:User)
         OR p.id = $currentUserId
         OR ALL(space IN [(s:Space)-[:HAS_CONTEXT]->(c) | s] WHERE
              (p)-[:OWNS]->(space)
              OR EXISTS {
                MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(p)
              })
      OPTIONAL MATCH (c)-[existing:HAS_PERSON]->(p)
      WITH c, u, p, existing IS NOT NULL AS alreadyAttached
      MERGE (c)-[:HAS_PERSON]->(p)
      FOREACH (_ IN CASE WHEN alreadyAttached THEN [] ELSE [1] END |
        CREATE (log:Log {
          id: $logId,
          description: $description,
          metadata: $metadata,
          createdAt: datetime()
        })
        CREATE (log)-[:CREATED_BY]->(u)
      )
      RETURN p.id AS id
      `,
      {
        fieldContextId,
        currentUserId,
        personId: match.connectionPersonId,
        logId: `log_${Date.now()}_${randomUUID().slice(0, 8)}`,
        description: contextTitle
          ? `Added ${name} to ${contextTitle}`
          : `Added ${name}`,
        metadata: buildImportLogMetadata(fieldContextId),
      }
    )
    // Guard rejected (e.g. a registered User outside this Space): no attach,
    // no match — fall through to the name path, which creates a distinct
    // PersonPulse in the caller's relational world instead.
    if (!attached?.[0]?.id) return null
    return { personId: match.connectionPersonId, authorName: name }
  }

  return null
}

/**
 * Resolve a row's author to a Person id: email match first (when the sheet
 * carries one), then the name-in-context path via the authorized
 * create_person tool (self-link / enrich / create PersonPulse). Results are
 * cached per batch so a 50-row sheet by one author resolves once.
 */
async function resolveRowAuthor(
  graph: Neo4jGraph,
  currentUserId: string,
  fieldContextId: string,
  contextTitle: string,
  row: ArticleImportRowInput,
  cache: Map<string, ResolvedAuthor>
): Promise<AuthorResolution> {
  const email = row.authorEmail ? normalizeEmail(row.authorEmail) : ''
  const cacheKey = email
    ? `email:${email}`
    : `name:${row.author.trim().toLowerCase()}`

  const cached = cache.get(cacheKey)
  if (cached) {
    return { ok: true, ...cached, isNewPerson: false, wasMatched: false }
  }

  if (email) {
    const emailMatch = await matchAuthorByEmail(
      graph,
      currentUserId,
      fieldContextId,
      contextTitle,
      email
    )
    if (emailMatch) {
      cache.set(cacheKey, emailMatch)
      return { ok: true, ...emailMatch, isNewPerson: false, wasMatched: true }
    }
  }

  // "Last, First" bylines (common in article exports) split on the comma;
  // everything else splits on whitespace with the first token as firstName.
  const trimmedAuthor = row.author.trim()
  const commaParts = trimmedAuthor.split(',')
  let firstName: string
  let lastName: string | undefined
  if (commaParts.length === 2 && commaParts[1].trim()) {
    firstName = commaParts[1].trim()
    lastName = commaParts[0].trim()
  } else {
    const nameTokens = trimmedAuthor.split(/\s+/)
    firstName = nameTokens[0]
    lastName = nameTokens.slice(1).join(' ') || undefined
  }
  const personResult = await executeAuthorizedWriteTool(
    graph,
    currentUserId,
    'create_person',
    {
      firstName,
      lastName,
      contextId: fieldContextId,
      contextTitle,
    }
  )

  if (personResult.success === false || !personResult.personId) {
    return {
      ok: false,
      failureMessage:
        personResult.message?.trim() ||
        `Could not resolve the author "${row.author}".`,
    }
  }

  const resolved: ResolvedAuthor = {
    personId: String(personResult.personId),
    authorName:
      (typeof personResult.name === 'string' && personResult.name.trim()) ||
      row.author.trim(),
  }
  cache.set(cacheKey, resolved)
  return {
    ok: true,
    ...resolved,
    isNewPerson: personResult.alreadyExisted !== true,
    wasMatched: personResult.alreadyExisted === true,
  }
}

/** Server-side re-validation — never trust the client's parse. */
function validateTypedRow(row: ArticleImportRowInput): string | null {
  if (!row.title?.trim()) return 'Article title is required.'
  if (!row.author?.trim()) return 'Author name is required.'
  if (!row.date?.trim()) return 'Date is required.'
  if (!row.url?.trim() || !normalizeArticleUrl(row.url)) {
    return 'A valid http(s) URL is required.'
  }
  if (!ALLOWED_ARTICLE_PULSE_TYPES.has(row.pulseType)) {
    return 'Unsupported pulse type — use goal, resource, or story.'
  }
  return null
}

function buildResultMessage(summary: ArticleImportSummary): string {
  const landed = summary.created + summary.skippedExisting
  if (landed === 0) {
    // People may still have been created/matched before their rows' pulse
    // writes failed — acknowledge that instead of claiming nothing happened.
    return summary.createdPeople > 0
      ? `No pulses were imported, though ${summary.createdPeople} new ${summary.createdPeople === 1 ? 'person was' : 'people were'} added. Fix the errors below and upload again.`
      : 'No rows were imported. Fix the errors below and upload again.'
  }
  const parts: string[] = [
    `Imported ${summary.created} of ${summary.totalRows} row${summary.totalRows === 1 ? '' : 's'}`,
  ]
  if (summary.skippedExisting > 0) {
    parts.push(`${summary.skippedExisting} already existed`)
  }
  if (summary.failed > 0) {
    parts.push(`${summary.failed} failed`)
  }
  const peopleBits: string[] = []
  if (summary.createdPeople > 0) {
    peopleBits.push(
      `${summary.createdPeople} new ${summary.createdPeople === 1 ? 'person' : 'people'} added`
    )
  }
  if (summary.matchedPeople > 0) {
    peopleBits.push(
      `${summary.matchedPeople} author${summary.matchedPeople === 1 ? '' : 's'} matched to existing people`
    )
  }
  const head = parts.join(', ')
  return peopleBits.length > 0 ? `${head}. ${peopleBits.join('; ')}.` : `${head}.`
}

export async function processArticleImport({
  graph,
  currentUserId,
  fieldContextId,
  rows,
}: ProcessArticleImportParams): Promise<ArticleImportResult> {
  const summary: ArticleImportSummary = {
    totalRows: rows.length,
    created: 0,
    skippedExisting: 0,
    failed: 0,
    createdPeople: 0,
    matchedPeople: 0,
  }
  const outcomes: ArticleRowOutcome[] = []
  const warnings: string[] = []

  const context = await loadEditableContext(graph, currentUserId, fieldContextId)
  if (!context.found || !context.allowed) {
    // Same copy for missing and forbidden — do not leak context existence.
    return {
      success: false,
      message: 'This field is not available, or you cannot add pulses to it.',
      summary: { ...summary, failed: rows.length },
      outcomes: rows.map((row) => ({
        row: row.row,
        title: row.title ?? '',
        status: 'failed' as const,
        message: 'Not imported — the target field was not available.',
      })),
      warnings,
    }
  }

  const authorCache = new Map<string, ResolvedAuthor>()

  for (const row of rows) {
    const validationProblem = validateTypedRow(row)
    if (validationProblem) {
      summary.failed += 1
      outcomes.push({
        row: row.row,
        title: row.title?.trim() ?? '',
        status: 'failed',
        message: validationProblem,
      })
      continue
    }

    try {
      const author = await resolveRowAuthor(
        graph,
        currentUserId,
        fieldContextId,
        context.title,
        row,
        authorCache
      )
      if (!author.ok) {
        summary.failed += 1
        outcomes.push({
          row: row.row,
          title: row.title.trim(),
          status: 'failed',
          message: author.failureMessage,
        })
        continue
      }
      if (author.isNewPerson) summary.createdPeople += 1
      if (author.wasMatched) summary.matchedPeople += 1

      const pulseResult = await executeAuthorizedWriteTool(
        graph,
        currentUserId,
        'create_pulse',
        {
          contextId: fieldContextId,
          contextTitle: context.title,
          title: row.title.trim(),
          content: buildArticleRowContent(row),
          pulseType: row.pulseType,
          resourceType:
            row.pulseType === 'ResourcePulse' ? 'article' : undefined,
          location: normalizeArticleUrl(row.url) ?? undefined,
          time: normalizeArticleDate(row.date ?? '') || undefined,
          attributedToPersonId: author.personId,
          attributedToName: author.authorName,
        }
      )

      if (pulseResult.success === false) {
        summary.failed += 1
        outcomes.push({
          row: row.row,
          title: row.title.trim(),
          status: 'failed',
          message: pulseResult.message?.trim() || ROW_WRITE_FAILED_MESSAGE,
        })
        continue
      }

      if (pulseResult.alreadyExisted === true) {
        summary.skippedExisting += 1
        outcomes.push({
          row: row.row,
          title: row.title.trim(),
          status: 'skipped_existing',
          message:
            'A pulse with this title already exists in the field — kept it and filled in any missing details.',
          authorName: author.authorName,
        })
        continue
      }

      summary.created += 1
      outcomes.push({
        row: row.row,
        title: row.title.trim(),
        status: 'created',
        message: 'Created.',
        authorName: author.authorName,
      })
    } catch (error) {
      // Raw driver/Cypher error text never reaches the member — log it
      // server-side for diagnosis and return fixed copy.
      console.error(
        `[article-import] row ${row.row} failed for context ${fieldContextId}:`,
        error
      )
      summary.failed += 1
      outcomes.push({
        row: row.row,
        title: row.title?.trim() ?? '',
        status: 'failed',
        message: ROW_WRITE_FAILED_MESSAGE,
      })
    }
  }

  return {
    success: summary.failed === 0,
    message: buildResultMessage(summary),
    summary,
    outcomes,
    warnings,
  }
}
