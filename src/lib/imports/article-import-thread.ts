import { randomUUID } from 'node:crypto'
import type { Driver } from 'neo4j-driver'
import { appendConversationTurn } from '@/lib/simulation/conversation-thread.service'
import {
  ARTICLE_IMPORT_STATUS,
  summarizeArticleOutcomes,
} from './article-import'
import {
  IMPORT_STATUS_TOOL_NAME,
  buildImportThreadTitle,
  describeArticleImportForChat,
  summarizeChatImports,
  trimFieldName,
} from './article-import-chat'

/**
 * GOAL-359 — queueing a bulk article import opens a chat thread dedicated to
 * it, carrying a live progress visualizer.
 *
 * The shape is lifted wholesale from document ingestion (`createIngestThread`
 * in `lib/ingest/run-document-ingest-pipeline.ts`): a `ConversationThread` born
 * with an explicit `kind`, seeded with a synthesized user turn and a
 * synthesized assistant turn, which the client then opens via
 * `emitOpenAssistantThread`. Reusing that shape is deliberate — the thread
 * switcher, the hydration path, and the assistant-ui part renderer all already
 * understand it, so this feature needs no new plumbing between the graph and
 * the bubble.
 *
 * What differs from ingest is what the assistant turn *carries*. Ingest's turn
 * is a receipt: the writes already happened, and the parts record what landed.
 * An import's turn is a window onto work that has not happened yet, so its tool
 * part is the `get_import_status` call itself, holding the job id in its
 * INPUT — which is what lets `ImportProgressToolPart` poll the very same
 * endpoint the import status modal polls and re-render as rows land. The
 * OUTPUT paints the card's first frame before that poll returns, and carries
 * no ids (kb/07 Rule 1 + 3).
 *
 * Neither half reaches the model, and it is worth being precise about why:
 * `convertToAISDKMessages` in `/api/chat/simulation` flattens every hydrated
 * message to its text parts, so the whole tool part — job id included — is
 * dropped before `streamText` sees the thread. The model answers follow-up
 * questions by CALLING `get_import_status`, not by reading this. That makes
 * the flattening load-bearing: swapping it for the AI SDK's own
 * `convertToModelMessages`, which preserves tool inputs and outputs, would
 * start feeding `import_<uuid>` into every import thread's context.
 *
 * Everything here is best-effort. A thread is a nicety on top of an import that
 * is already durably queued, so `createArticleImportThread` swallows its own
 * failures and answers `null` rather than turning a successful 202 into a 500.
 */

export interface CreateArticleImportThreadInput {
  userId: string
  jobId: string
  totalRows: number
  /** Resolved by the route via `loadEditableContext` — a name, never an id. */
  fieldContextTitle: string | null
}

/**
 * Create the import's thread and seed both turns. Returns the thread id, or
 * `null` when anything went wrong — callers treat that as "no thread to open".
 */
export async function createArticleImportThread(
  driver: Driver,
  input: CreateArticleImportThreadInput
): Promise<string | null> {
  // Deliberately NOT pre-trimmed: `buildImportThreadTitle` caps the switcher
  // row itself, and `describeArticleImportForChat` caps what the model reads.
  // Trimming here fed one cosmetic ellipsis into both.
  const fieldTitle = (input.fieldContextTitle ?? '').trim()
  const threadId = `thread_${randomUUID()}`

  try {
    const session = driver.session()
    try {
      await session.executeWrite(async (tx) =>
        tx.run(
          `
          MATCH (p:Person:User {id: $userId})
          CREATE (p)-[:HAS_THREAD]->(t:ConversationThread {
            id: $threadId,
            createdAt: datetime(),
            lastTurnAt: datetime(),
            turnCount: 0,
            title: $title,
            mode: 'default',
            kind: 'import'
          })
          `,
          {
            userId: input.userId,
            threadId,
            title: buildImportThreadTitle(input.totalRows, fieldTitle),
          }
        )
      )
    } finally {
      await session.close()
    }

    // A just-queued job has landed nothing, so the seed is derived rather than
    // read back: a round trip to the job node would report exactly this and
    // could only be *staler*, since the worker may already be claiming it.
    const snapshot = describeArticleImportForChat({
      status: ARTICLE_IMPORT_STATUS.pending,
      statusMessage: null,
      processedRows: 0,
      summary: summarizeArticleOutcomes([], input.totalRows),
      fieldContextTitle: fieldTitle,
    })

    const rowsLabel = `${input.totalRows} ${input.totalRows === 1 ? 'article' : 'articles'}`
    // Capped: this turn's text is also the thread's `snippet` in the switcher.
    const shortField = trimFieldName(fieldTitle)
    const userTurn = shortField
      ? `Import ${rowsLabel} into ${shortField}`
      : `Import ${rowsLabel}`
    await appendConversationTurn(
      input.userId,
      { role: 'user', content: userTurn, parts: [{ type: 'text', text: userTurn }] },
      threadId
    )

    const assistantText = `Your import is queued. I'll keep the progress above up to date as rows land — ask me here any time and I'll tell you exactly how far it has got.`
    await appendConversationTurn(
      input.userId,
      {
        role: 'assistant',
        content: assistantText,
        parts: [
          {
            type: `tool-${IMPORT_STATUS_TOOL_NAME}`,
            toolCallId: `synth_${randomUUID()}`,
            state: 'output-available',
            // The job id lives HERE and nowhere else: the renderer reads it to
            // poll, and it stays out of the output the model paraphrases.
            input: { jobId: input.jobId },
            output: {
              found: true,
              imports: [snapshot],
              message: summarizeChatImports([snapshot]),
            },
          },
          { type: 'text', text: assistantText },
        ],
      },
      threadId
    )

    return threadId
  } catch (error) {
    console.warn(
      '[article-import-thread] Could not open an import thread:',
      error instanceof Error ? error.message : error
    )
    // The three writes above are three separate transactions, so "failed" and
    // "wrote nothing" are not the same thing: the thread can be committed and
    // one of its turns not be. Answering `null` then leaves the member a thread
    // the client never opens, sitting in the switcher titled "Import: 5
    // articles into …" with no answer in it — or worse, with only the user turn
    // asking for an import and nothing replying. Take it back out.
    await deleteImportThread(driver, input.userId, threadId)
    return null
  }
}

/**
 * Compensating delete for a half-written thread. Owner-anchored like every
 * other thread write, and silent on failure: this runs inside a catch, and a
 * throw here would replace the real error with a cleanup error and turn a
 * best-effort thread back into a failed import.
 */
async function deleteImportThread(
  driver: Driver,
  userId: string,
  threadId: string
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (p:Person:User {id: $userId})-[:HAS_THREAD]->(t:ConversationThread {id: $threadId})
        OPTIONAL MATCH (t)-[:HAS_TURN]->(turn:ConversationTurn)
        DETACH DELETE turn, t
        `,
        { userId, threadId }
      )
    )
  } catch (error) {
    console.warn(
      '[article-import-thread] Could not clean up a half-written import thread:',
      error instanceof Error ? error.message : error
    )
  } finally {
    await session.close()
  }
}
