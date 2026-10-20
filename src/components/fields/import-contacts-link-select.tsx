'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

/**
 * GOAL-382 — the contact import's optional extra link: one pulse or person in
 * this field that every imported contact is also linked to. Split out of the
 * modal to keep it under the 400-line component budget.
 *
 * The value is `"<kind>:<id>"` (or '' for none); the modal turns it into the
 * route's `link` payload, and the route re-checks the target is in the field.
 */

const LINK_TARGETS_QUERY = gql`
  query ContactImportLinkTargets($id: ID!) {
    fieldContexts(where: { id_EQ: $id }) {
      id
      pulses {
        id
        title
      }
      people {
        id
        name
      }
    }
  }
`

interface LinkTargetsData {
  fieldContexts: {
    id: string
    pulses: { id: string; title: string }[]
    people: { id: string; name: string | null }[]
  }[]
}

export const CONTACT_SELECT_CLASS =
  'w-full min-w-0 rounded-lg border border-gp-glass-border bg-gp-surface-strong dark:bg-gp-surface-dark px-3 py-2 text-sm text-gp-ink-strong dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary'

export function ContactLinkSelect({
  fieldContextId,
  value,
  onChange,
}: {
  fieldContextId: string
  value: string
  onChange: (value: string) => void
}) {
  const { data } = useQuery<LinkTargetsData>(LINK_TARGETS_QUERY, {
    variables: { id: fieldContextId },
  })
  const field = data?.fieldContexts[0]

  return (
    <label className="flex flex-col gap-1 min-w-0 text-xs font-medium text-gp-ink-muted dark:text-gp-ink-soft">
      Also link every contact to (optional)
      <select
        className={CONTACT_SELECT_CLASS}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Nothing else</option>
        {field && field.pulses.length > 0 && (
          <optgroup label="Pulses in this field">
            {field.pulses.map((pulse) => (
              <option key={pulse.id} value={`pulse:${pulse.id}`}>
                {pulse.title}
              </option>
            ))}
          </optgroup>
        )}
        {field && field.people.length > 0 && (
          <optgroup label="People in this field">
            {field.people.map((person) => (
              <option key={person.id} value={`person:${person.id}`}>
                {person.name || 'Unnamed person'}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </label>
  )
}
