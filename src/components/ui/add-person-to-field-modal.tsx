'use client'

import { useState } from 'react'

export type CreateFieldPersonInput = {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  pronouns?: string
  location?: string
  photo?: string
  avatar?: string
  status?: string
  gender?: string
  careManual?: string
  favorites?: string
  passions?: string
  traits?: string
  fieldsOfCare?: string
  interests?: string
}

interface AddPersonToFieldModalProps {
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onCreatePerson: (input: CreateFieldPersonInput) => Promise<void>
}

export function AddPersonToFieldModal({
  isOpen,
  isSubmitting = false,
  onClose,
  onCreatePerson,
}: AddPersonToFieldModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CreateFieldPersonInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pronouns: '',
    location: '',
    photo: '',
    avatar: '',
    status: '',
    gender: '',
    careManual: '',
    favorites: '',
    passions: '',
    traits: '',
    fieldsOfCare: '',
    interests: '',
  })

  if (!isOpen) return null

  const toOptionalString = (value: string | undefined) => {
    const trimmed = (value || '').trim()
    return trimmed ? trimmed : undefined
  }

  const handleCreate = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.')
      return
    }

    try {
      setError(null)
      await onCreatePerson({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: toOptionalString(form.email),
        phone: toOptionalString(form.phone),
        pronouns: toOptionalString(form.pronouns),
        location: toOptionalString(form.location),
        photo: toOptionalString(form.photo),
        avatar: toOptionalString(form.avatar),
        status: toOptionalString(form.status),
        gender: toOptionalString(form.gender),
        careManual: toOptionalString(form.careManual),
        favorites: toOptionalString(form.favorites),
        passions: toOptionalString(form.passions),
        traits: toOptionalString(form.traits),
        fieldsOfCare: toOptionalString(form.fieldsOfCare),
        interests: toOptionalString(form.interests),
      })

      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        pronouns: '',
        location: '',
        photo: '',
        avatar: '',
        status: '',
        gender: '',
        careManual: '',
        favorites: '',
        passions: '',
        traits: '',
        fieldsOfCare: '',
        interests: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create person')
    }
  }

  const updateField = <K extends keyof CreateFieldPersonInput>(
    key: K,
    value: CreateFieldPersonInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gp-ink-strong">
            Add Person To Field
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-sm text-gp-ink-muted">
          Create a new Person and add them to this field
        </p>

        <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
              placeholder="First name *"
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
            <input
              type="text"
              value={form.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
              placeholder="Last name *"
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              value={form.email || ''}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="Email"
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
            <input
              type="text"
              value={form.phone || ''}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="Phone"
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.pronouns || ''}
              onChange={(event) => updateField('pronouns', event.target.value)}
              placeholder="Pronouns"
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
            <input
              type="text"
              value={form.location || ''}
              onChange={(event) => updateField('location', event.target.value)}
              placeholder="Location"
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.photo || ''}
              onChange={(event) => updateField('photo', event.target.value)}
              placeholder="Photo URL"
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
            <input
              type="text"
              value={form.avatar || ''}
              onChange={(event) => updateField('avatar', event.target.value)}
              placeholder="Avatar URL"
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.status || ''}
              onChange={(event) => updateField('status', event.target.value)}
              placeholder="Status"
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
            <input
              type="text"
              value={form.gender || ''}
              onChange={(event) => updateField('gender', event.target.value)}
              placeholder="Gender"
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
          </div>

          <textarea
            value={form.careManual || ''}
            onChange={(event) => updateField('careManual', event.target.value)}
            placeholder="Care manual"
            rows={2}
            className="w-full rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
          />

          <textarea
            value={form.favorites || ''}
            onChange={(event) => updateField('favorites', event.target.value)}
            placeholder="Favorites"
            rows={2}
            className="w-full rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
          />

          <div className="grid grid-cols-2 gap-3">
            <textarea
              value={form.passions || ''}
              onChange={(event) => updateField('passions', event.target.value)}
              placeholder="Passions"
              rows={2}
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
            <textarea
              value={form.traits || ''}
              onChange={(event) => updateField('traits', event.target.value)}
              placeholder="Traits"
              rows={2}
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <textarea
              value={form.fieldsOfCare || ''}
              onChange={(event) =>
                updateField('fieldsOfCare', event.target.value)
              }
              placeholder="Fields of care"
              rows={2}
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
            <textarea
              value={form.interests || ''}
              onChange={(event) => updateField('interests', event.target.value)}
              placeholder="Interests"
              rows={2}
              className="rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong outline-none focus:border-gp-primary"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border border-gp-glass-border text-gp-ink-muted hover:text-gp-ink-strong"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              isSubmitting || !form.firstName.trim() || !form.lastName.trim()
            }
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg text-sm bg-gp-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create And Add Person'}
          </button>
        </div>
      </div>
    </div>
  )
}
