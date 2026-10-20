import { z } from 'zod'
import { initGraph } from '@/modules/graph'
import { driver } from '@/lib/neo4j/driver'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { rateLimit, rateLimited } from '@/lib/auth/rate-limit'
import { loadEditableContext } from '@/lib/imports/article-import-service'
import {
  CONTACT_EMAIL_SHAPE,
  CONTACT_FIELD_LIMITS,
  CONTACT_KINDS,
  CONTACT_IMPORT_BATCH_SIZE,
  finalizeContactRecord,
  type ContactRecord,
} from '@/lib/imports/contact-import'
import {
  importContacts,
  resolveLinkTarget,
} from '@/lib/imports/contact-import-service'

/**
 * GOAL-382 — bulk contact import (people + organizations) into a FieldContext.
 *
 *   POST /api/import/contacts
 *   { fieldContextId, contacts: ContactRecord[], link?: { kind, id } }
 *   → 200 { summary, outcomes }
 *
 * The browser parses the vCard / CSV / JSON file and previews it (nothing is
 * written until the member confirms), then submits the mapped contacts. This
 * route authenticates, rate-limits, re-validates every contact with the same
 * rules the preview used, gates on edit rights to the field, and writes.
 *
 * Inline rather than queued like the article import: a contact import is graph
 * writes only — no fetching, no LLM or embedding spend. The browser sends a
 * file in batches of CONTACT_IMPORT_BATCH_SIZE, so each request stays well
 * inside the duration budget even on a slow database link.
 */
export const maxDuration = 300

const optionalText = (limit: number) => z.string().trim().max(limit).optional()

const contactSchema = z
  .object({
    row: z.number().int().min(1),
    kind: z.enum(CONTACT_KINDS),
    firstName: optionalText(CONTACT_FIELD_LIMITS.firstName),
    lastName: optionalText(CONTACT_FIELD_LIMITS.lastName),
    name: optionalText(CONTACT_FIELD_LIMITS.name),
    email: z
      .string()
      .trim()
      .max(CONTACT_FIELD_LIMITS.email)
      .regex(CONTACT_EMAIL_SHAPE, 'Invalid email.')
      .optional(),
    phone: optionalText(CONTACT_FIELD_LIMITS.phone),
    location: optionalText(CONTACT_FIELD_LIMITS.location),
    description: optionalText(CONTACT_FIELD_LIMITS.description),
    website: optionalText(CONTACT_FIELD_LIMITS.website),
    organization: optionalText(CONTACT_FIELD_LIMITS.organization),
    jobTitle: optionalText(CONTACT_FIELD_LIMITS.jobTitle),
  })
  .strict()

const contactImportSchema = z.object({
  fieldContextId: z.string().trim().min(1),
  contacts: z
    .array(contactSchema)
    .min(1, 'At least one contact is required.')
    .max(
      CONTACT_IMPORT_BATCH_SIZE,
      `Send at most ${CONTACT_IMPORT_BATCH_SIZE} contacts per request.`
    ),
  link: z
    .object({
      kind: z.enum(['pulse', 'person']),
      id: z.string().trim().min(1),
    })
    .optional(),
})

export async function POST(req: Request) {
  const currentUserId = resolveAuthenticatedUserId(req)
  if (!currentUserId) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { allowed, retryAfter } = await rateLimit({
    policy: 'contact-import',
    key: currentUserId,
  })
  if (!allowed) return rateLimited(retryAfter)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Expected JSON body.' }, { status: 400 })
  }

  const parsed = contactImportSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid import payload.', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Re-run the preview's own rules (name required, person/org field split) so
  // the writer only ever sees a record the shared finalizer produced.
  const records: ContactRecord[] = []
  for (const contact of parsed.data.contacts) {
    const result = finalizeContactRecord(contact)
    if ('error' in result) {
      return Response.json(
        { error: `Row ${result.error.row}: ${result.error.message}` },
        { status: 400 }
      )
    }
    records.push(result.record)
  }

  // A database that cannot be reached answers with a message the modal can
  // show, rather than an empty 500.
  try {
    const graph = await initGraph()
    // Missing and forbidden share one message so the response cannot be used to
    // probe for contexts in other people's Spaces.
    const context = await loadEditableContext(
      graph,
      currentUserId,
      parsed.data.fieldContextId
    )
    if (!context.found || !context.allowed) {
      return Response.json(
        {
          error: 'This field is not available, or you cannot add contacts to it.',
          reason: 'forbidden',
        },
        { status: 403 }
      )
    }

    const link = parsed.data.link ?? null
    const linkLabel = link
      ? await resolveLinkTarget(graph, parsed.data.fieldContextId, currentUserId, link)
      : ''
    if (linkLabel === null) {
      return Response.json(
        { error: 'The item to link these contacts to is not in this field.' },
        { status: 400 }
      )
    }

    const result = await importContacts({
      driver,
      userId: currentUserId,
      contextId: parsed.data.fieldContextId,
      contextTitle: context.title,
      records,
      link,
      linkLabel,
    })
    if (result.interrupted) {
      return Response.json(
        {
          ...result,
          error: 'The import lost its connection to the database — please try again.',
        },
        { status: 503 }
      )
    }
    return Response.json(result)
  } catch (error) {
    const code = (error as { code?: string })?.code ?? 'unknown'
    console.error(`[contact-import] request failed (${code})`)
    return Response.json(
      { error: 'The import could not reach the database — please try again.' },
      { status: 503 }
    )
  }
}
