'use client'

import { useCallback, useRef, useState } from 'react'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'
import {
  CONTACT_IMPORT_BATCH_SIZE,
  summarizeContactOutcomes,
  type ContactImportOutcome,
  type ContactImportResult,
  type ContactLinkTarget,
  type ContactRecord,
} from '@/lib/imports/contact-import'

/**
 * GOAL-382 — submit a contact import in batches.
 *
 * The route writes inline, one transaction per contact, so a whole 500-contact
 * file in one request could outlast the function on a slow database link. The
 * file goes in batches of CONTACT_IMPORT_BATCH_SIZE instead, with progress,
 * and the outcomes are merged into one result. A failed batch stops the
 * import: what already landed is reported alongside the error, and the batch
 * itself wrote nothing it reports (each contact is its own transaction).
 */
export function useContactImport({
  fieldContextId,
  onImported,
}: {
  fieldContextId: string
  onImported: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<ContactImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  // State lags a render; this stops a double click starting two imports.
  const inFlightRef = useRef(false)

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setProgress({ done: 0, total: 0 })
  }, [])

  const submit = useCallback(
    async (records: ContactRecord[], link: ContactLinkTarget | undefined) => {
      if (records.length === 0 || inFlightRef.current) return
      inFlightRef.current = true
      setIsSubmitting(true)
      setError(null)
      setProgress({ done: 0, total: records.length })
      const outcomes: ContactImportOutcome[] = []
      try {
        for (
          let start = 0;
          start < records.length;
          start += CONTACT_IMPORT_BATCH_SIZE
        ) {
          const batch = records.slice(start, start + CONTACT_IMPORT_BATCH_SIZE)
          // Per batch — a long import can outlive the access token.
          const authHeaders = await chatApiAuthHeaders()
          const res = await fetch('/api/import/contacts', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ fieldContextId, contacts: batch, link }),
          })
          const body = (await res.json().catch(() => null)) as
            | (ContactImportResult & { error?: string })
            | null
          if (res.status === 429) {
            throw new Error(
              'You have imported a lot of contacts recently — wait a while before importing more.'
            )
          }
          // A batch cut short by the database still reports what it saved.
          if (body?.outcomes) outcomes.push(...body.outcomes)
          if (!res.ok || !body?.outcomes) {
            throw new Error(
              body?.error || 'The import failed — please try again.'
            )
          }
          setProgress({ done: start + batch.length, total: records.length })
        }
      } catch (submitError) {
        const message =
          submitError instanceof Error
            ? submitError.message
            : 'The import failed — please try again.'
        const saved = outcomes.filter((o) => o.status !== 'skipped').length
        setError(
          saved > 0
            ? `${message} ${saved} contact${saved === 1 ? ' was' : 's were'} saved before it stopped — see below. Importing the file again updates them rather than adding them twice.`
            : message
        )
      } finally {
        if (outcomes.length > 0) {
          setResult({ summary: summarizeContactOutcomes(outcomes), outcomes })
          onImported()
        }
        setIsSubmitting(false)
        inFlightRef.current = false
      }
    },
    [fieldContextId, onImported]
  )

  return { isSubmitting, progress, result, error, setError, submit, reset }
}
