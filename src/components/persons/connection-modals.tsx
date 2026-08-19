'use client'

import type { FC } from 'react'
import ReactSelect from 'react-select'
import { cn } from '@/lib/utils'
import type { PersonSelectOption } from './use-person-connections'

/**
 * The three connection dialogs on the person profile page — add, edit, and the
 * delete confirmation. Presentational: every piece of state and every mutation
 * lives in `usePersonConnections`.
 */

/** Shared submit-button treatment — themed gradient + primary-tinted glow. */
const primaryButtonStyle = {
  background:
    'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 95%, white 5%), color-mix(in srgb, var(--gp-primary) 75%, black 25%))',
  boxShadow:
    '0 10px 28px color-mix(in srgb, var(--gp-primary) 40%, transparent)',
}

const overlayClass =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'

const textareaClass =
  'w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-gp-ink-strong dark:text-white placeholder-gp-ink-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gp-primary/50 resize-none'

const labelClass =
  'text-sm font-semibold text-gp-ink-muted dark:text-white/60 block mb-2'

const cancelButtonClass =
  'flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-gp-ink-strong dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-semibold cursor-pointer'

const submitButtonClass =
  'flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

const CloseButton: FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-4 right-4 text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
  >
    <span className="material-symbols-outlined">close</span>
  </button>
)

/** react-select needs inline styles — it renders its own DOM, not ours. */
const selectStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: 'transparent',
    borderColor: 'rgba(148, 163, 184, 0.4)',
    borderRadius: '0.5rem',
    minHeight: '42px',
    boxShadow: 'none',
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: 'var(--gp-surface)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    zIndex: 60,
  }),
  option: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isFocused
      ? 'rgba(59, 130, 246, 0.1)'
      : 'transparent',
    color: 'var(--gp-ink-strong)',
    cursor: 'pointer',
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: 'var(--gp-ink-strong)',
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    color: 'var(--gp-ink-strong)',
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: 'var(--gp-ink-muted)',
  }),
}

export const AddConnectionModal: FC<{
  onClose: () => void
  selectedPersonOption: PersonSelectOption | null
  personOptions: PersonSelectOption[]
  searchInput: string
  onSearchInput: (value: string) => void
  onSelect: (option: PersonSelectOption | null) => void
  onClearSelection: () => void
  why: string
  onWhyChange: (value: string) => void
  interests: string
  onInterestsChange: (value: string) => void
  creating: boolean
  canSubmit: boolean
  onSubmit: () => void
}> = ({
  onClose,
  selectedPersonOption,
  personOptions,
  searchInput,
  onSearchInput,
  onSelect,
  onClearSelection,
  why,
  onWhyChange,
  interests,
  onInterestsChange,
  creating,
  canSubmit,
  onSubmit,
}) => (
  <div className={overlayClass}>
    <div className="bg-white/80 dark:bg-black/80 rounded-2xl p-5 sm:p-8 max-w-md w-full mx-4 relative">
      <CloseButton onClick={onClose} />

      <h2 className="text-2xl font-bold text-gp-ink-strong dark:text-white mb-6">
        Create New Connection
      </h2>

      <div className="mb-6">
        <label className={labelClass}>Search for person</label>
        <ReactSelect<PersonSelectOption, false>
          value={selectedPersonOption}
          options={personOptions}
          isSearchable
          isClearable
          isDisabled={creating}
          placeholder="Search by name..."
          noOptionsMessage={() =>
            searchInput.trim().length < 2
              ? 'Type at least 2 characters'
              : 'No matching people found'
          }
          getOptionLabel={(option) => option.label}
          onInputChange={(value, actionMeta) => {
            if (actionMeta.action === 'input-change') {
              onSearchInput(value)
            }
          }}
          onChange={onSelect}
          styles={selectStyles}
        />
      </div>

      {selectedPersonOption && (
        <div className="mb-6 p-4 rounded-lg bg-gp-primary/10 border border-gp-primary/20">
          <div>
            <div className="font-semibold text-gp-ink-strong dark:text-white">
              {selectedPersonOption.label}
            </div>
            <button
              onClick={onClearSelection}
              className="mt-2 text-xs text-gp-primary hover:text-gp-primary-dark font-semibold transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className={labelClass}>Why are you connecting?</label>
        <textarea
          value={why}
          onChange={(e) => onWhyChange(e.target.value)}
          placeholder="Describe how you know this person or why you want to connect..."
          className={textareaClass}
          rows={3}
        />
      </div>

      <div className="mb-6">
        <label className={labelClass}>
          Interests or shared areas{' '}
          <span className="text-xs font-normal">(optional)</span>
        </label>
        <textarea
          value={interests}
          onChange={(e) => onInterestsChange(e.target.value)}
          placeholder="What interests or areas do you share?"
          className={textareaClass}
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className={cancelButtonClass}>
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={creating || !canSubmit}
          className={submitButtonClass}
          style={primaryButtonStyle}
        >
          {creating ? 'Creating...' : 'Create Connection'}
        </button>
      </div>
    </div>
  </div>
)

export const EditConnectionModal: FC<{
  onClose: () => void
  why: string
  onWhyChange: (value: string) => void
  interests: string
  onInterestsChange: (value: string) => void
  updating: boolean
  onSubmit: () => void
}> = ({
  onClose,
  why,
  onWhyChange,
  interests,
  onInterestsChange,
  updating,
  onSubmit,
}) => (
  <div className={overlayClass}>
    <div className="chat-card rounded-2xl p-5 sm:p-8 max-w-md w-full mx-4 relative">
      <CloseButton onClick={onClose} />

      <h2 className="text-2xl font-bold text-gp-ink-strong dark:text-white mb-6">
        Edit Connection
      </h2>

      <div className="mb-6">
        <label className={labelClass}>Why are you connecting?</label>
        <textarea
          value={why}
          onChange={(e) => onWhyChange(e.target.value)}
          placeholder="Tell us why you're connecting with this person..."
          className={textareaClass}
          rows={3}
        />
      </div>

      <div className="mb-6">
        <label className={labelClass}>Shared Interests</label>
        <textarea
          value={interests}
          onChange={(e) => onInterestsChange(e.target.value)}
          placeholder="What interests do you share?"
          className={textareaClass}
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className={cancelButtonClass}>
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={updating}
          className={submitButtonClass}
          style={primaryButtonStyle}
        >
          {updating ? 'Updating...' : 'Update Connection'}
        </button>
      </div>
    </div>
  </div>
)

export const DeleteConnectionModal: FC<{
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}> = ({ deleting, onCancel, onConfirm }) => (
  <div className={overlayClass}>
    <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-md w-full mx-4 p-5 sm:p-8 border border-gp-glass-border">
      <h2 className="text-2xl font-semibold text-gp-ink-strong dark:text-white mb-3">
        Delete Connection?
      </h2>

      <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft mb-6">
        Are you sure you want to delete this connection? This action cannot be
        undone.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={deleting}
          className="px-6 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {deleting && (
            <span
              className={cn(
                'material-symbols-outlined text-base',
                'motion-safe:animate-spin'
              )}
            >
              hourglass_bottom
            </span>
          )}
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
)
