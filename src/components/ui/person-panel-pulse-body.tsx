'use client'

import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { cn } from '@/lib/utils'
import { UPDATE_PERSON_PULSE_MUTATION } from '@/app/graphql/mutations/PERSON_MUTATIONS'
import {
  type PersonInPanel,
  inputClass,
  sectionTitleClass,
} from './person-panel-shared'

/**
 * PersonPulse body — a relational contact: identity, description, relationship.
 * They never use GoalPost and own no pulses, so this view foregrounds the three
 * things that matter (who they are, the note, your relationship) and lets the
 * user write/refine them inline via the authorized updatePersonPulse mutation.
 */
export function PersonPulseBody({
  person,
  description,
  relationshipWhy,
  onPersonUpdated,
  onViewProfile,
  onRemoveFromField,
  isRemovingFromField,
}: {
  person: PersonInPanel
  description: string | null
  relationshipWhy: string | null
  onPersonUpdated?: () => void
  onViewProfile: () => void
  onRemoveFromField?: (personId: string) => Promise<void>
  isRemovingFromField: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState(person.firstName)
  const [lastName, setLastName] = useState(person.lastName)
  const [descDraft, setDescDraft] = useState(description ?? '')
  const [whyDraft, setWhyDraft] = useState(relationshipWhy ?? '')
  const [error, setError] = useState<string | null>(null)

  const [updatePersonPulse, { loading }] = useMutation(
    UPDATE_PERSON_PULSE_MUTATION
  )

  // Re-seed drafts whenever the person or its persisted values change so the
  // editor never shows another person's text after navigating between people.
  useEffect(() => {
    setEditing(false)
    setFirstName(person.firstName)
    setLastName(person.lastName)
    setDescDraft(description ?? '')
    setWhyDraft(relationshipWhy ?? '')
    setError(null)
  }, [
    person.id,
    person.firstName,
    person.lastName,
    description,
    relationshipWhy,
  ])

  const handleSave = async () => {
    setError(null)
    if (!firstName.trim()) {
      setError('A first name is required.')
      return
    }
    try {
      const res = await updatePersonPulse({
        variables: {
          personId: person.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          description: descDraft.trim(),
          relationshipWhy: whyDraft.trim(),
        },
      })
      if (res.data?.updatePersonPulse?.success === false) {
        setError(
          res.data.updatePersonPulse.message || 'Could not save changes.'
        )
        return
      }
      setEditing(false)
      onPersonUpdated?.()
    } catch (err) {
      console.warn(
        '[PersonPulseBody] update failed:',
        err instanceof Error ? err.message : err
      )
      setError('Something went wrong saving your changes.')
    }
  }

  return (
    <div className="mt-5 space-y-5">
      <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
        A person in your world — they don&apos;t use GoalPost and don&apos;t own
        any pulses. What matters here is who they are and how you relate to them.
      </p>

      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className={cn('mb-1 block', sectionTitleClass)}>
                First name
              </span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={cn('mb-1 block', sectionTitleClass)}>
                Last name
              </span>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <label className="block">
            <span className={cn('mb-1 block', sectionTitleClass)}>
              Description
            </span>
            <textarea
              rows={3}
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              placeholder={`Who is ${person.firstName || 'this person'}?`}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={cn('mb-1 block', sectionTitleClass)}>
              Your relationship
            </span>
            <textarea
              rows={3}
              value={whyDraft}
              onChange={(e) => setWhyDraft(e.target.value)}
              placeholder="How do you know them? e.g. a mentor and close friend"
              className={inputClass}
            />
          </label>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gp-primary text-white font-medium transition-all hover:shadow-[0_8px_25px_color-mix(in_srgb,var(--gp-primary)_40%,transparent)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => {
                // Revert unsaved drafts to the persisted values — read mode
                // renders the drafts, so without this a cancelled edit would
                // linger on screen.
                setFirstName(person.firstName)
                setLastName(person.lastName)
                setDescDraft(description ?? '')
                setWhyDraft(relationshipWhy ?? '')
                setError(null)
                setEditing(false)
              }}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-gp-glass-border text-gp-ink-muted dark:text-gp-ink-soft font-medium transition-colors hover:bg-white/10 dark:hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Read from the local drafts (seeded from props, updated on Save) so
              the panel reflects an edit immediately — the parent's refetch lags
              behind and would otherwise show stale text until reopened. */}
          <ReadSection
            icon="notes"
            title="Description"
            value={descDraft}
            empty="No description yet."
          />
          <ReadSection
            icon="handshake"
            title="Your relationship"
            value={whyDraft}
            empty="No relationship noted yet."
          />

          <button
            onClick={() => setEditing(true)}
            className="w-full px-4 py-2.5 rounded-xl border border-gp-glass-border text-gp-ink-strong dark:text-white font-medium transition-colors hover:bg-white/10 dark:hover:bg-white/5 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
            Edit details
          </button>

          <button
            onClick={onViewProfile}
            className="w-full px-4 py-3 rounded-xl bg-gp-primary hover:shadow-[0_8px_25px_color-mix(in_srgb,var(--gp-primary)_40%,transparent)] hover:scale-[1.02] transition-all text-white font-medium flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">
              open_in_new
            </span>
            View full profile
          </button>

          {onRemoveFromField && (
            <button
              onClick={() => onRemoveFromField(person.id)}
              disabled={isRemovingFromField}
              className="w-full px-4 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">
                person_remove
              </span>
              {isRemovingFromField ? 'Removing…' : 'Remove from Field'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ReadSection({
  icon,
  title,
  value,
  empty,
}: {
  icon: string
  title: string
  value: string | null
  empty: string
}) {
  return (
    <div className="space-y-2">
      <h4 className={cn('flex items-center gap-1.5', sectionTitleClass)}>
        <span className="material-symbols-outlined text-base leading-none">
          {icon}
        </span>
        {title}
      </h4>
      <div className="p-3 rounded-lg bg-black/[0.05] dark:bg-white/5 border border-gp-glass-border">
        {value?.trim() ? (
          <p className="text-sm text-gp-ink-strong dark:text-white leading-relaxed whitespace-pre-wrap">
            {value}
          </p>
        ) : (
          <p className="text-sm italic text-gp-ink-soft dark:text-gp-ink-soft">
            {empty}
          </p>
        )}
      </div>
    </div>
  )
}
