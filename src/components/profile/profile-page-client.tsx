'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { usePageContext, useApp } from '@/contexts'
import { useProfile, type EditableProfile, type ProfileData } from '@/hooks/use-profile'
import { AttributeCard, InfoField } from './profile-fields'
import { AvatarUploader } from './avatar-uploader'

const EDITABLE_KEYS: Array<keyof EditableProfile> = [
  'firstName',
  'lastName',
  'phone',
  'pronouns',
  'location',
  'photo',
  'passions',
  'traits',
  'fieldsOfCare',
  'interests',
  'careManual',
  'favorites',
]

function toDraft(profile: ProfileData): EditableProfile {
  return EDITABLE_KEYS.reduce((acc, key) => {
    acc[key] = profile[key]
    return acc
  }, {} as EditableProfile)
}

const ATTRIBUTES: Array<{
  key: keyof EditableProfile
  icon: string
  title: string
  placeholder: string
}> = [
  { key: 'passions', icon: 'favorite', title: 'Passions', placeholder: 'What are you passionate about?' },
  { key: 'traits', icon: 'psychology', title: 'Traits', placeholder: 'Describe your key traits…' },
  { key: 'fieldsOfCare', icon: 'volunteer_activism', title: 'Fields of Care', placeholder: 'What areas do you care about?' },
  { key: 'interests', icon: 'interests', title: 'Interests', placeholder: 'What interests you?' },
  { key: 'careManual', icon: 'menu_book', title: 'Care Manual', placeholder: 'How can people best support you?' },
  { key: 'favorites', icon: 'star', title: 'Favorites', placeholder: 'A few of your favorite things…' },
]

export function ProfilePageClient() {
  const { profile, isLoading, error, saving, updateProfile } = useProfile()
  const { setPageTitle } = usePageContext()
  const { user, setUser } = useApp()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<EditableProfile | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    setPageTitle('My Profile')
  }, [setPageTitle])

  const memberSince = useMemo(() => {
    if (!profile?.createdAt) return null
    try {
      return formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })
    } catch {
      return null
    }
  }, [profile])

  const startEditing = () => {
    if (!profile) return
    setDraft(toDraft(profile))
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setDraft(null)
  }

  const setField = (key: keyof EditableProfile, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const handleSave = async () => {
    if (!draft) return
    try {
      await updateProfile(draft)
      // Reflect a changed photo in the shared user context so the top-bar
      // avatar updates immediately, without waiting for a re-login.
      if (user && draft.photo !== user.photo) {
        setUser({ ...user, photo: draft.photo || null })
      }
      toast.success('Profile updated')
      setEditing(false)
      setDraft(null)
    } catch (err) {
      console.error('Failed to update profile', err)
      toast.error('Could not save your profile. Please try again.')
    }
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <ProfileShell>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-700 dark:text-red-300">
          We couldn&apos;t load your profile: {error.message}
        </div>
      </ProfileShell>
    )
  }

  if (!profile) {
    return (
      <ProfileShell>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-700 dark:text-amber-300">
          Profile data not found. Please try signing in again.
        </div>
      </ProfileShell>
    )
  }

  const active = editing && draft ? draft : null

  return (
    <ProfileShell>
      {/* Identity header */}
      <header className="flex flex-col gap-5 rounded-3xl border border-gp-glass-border bg-gp-glass-bg backdrop-blur-2xl p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <AvatarUploader
            name={profile.name}
            photo={active ? active.photo : profile.photo}
            editing={editing}
            onChange={(v) => setField('photo', v)}
            onUploadingChange={setUploadingPhoto}
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl sm:text-3xl font-bold text-gp-ink-strong dark:text-white">
              {profile.name}
            </h1>
            <p className="truncate text-sm text-gp-ink-muted dark:text-gp-ink-soft">
              {profile.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
              {profile.pronouns && (
                <span className="rounded-full border border-gp-glass-border px-2 py-0.5">
                  {profile.pronouns}
                </span>
              )}
              {profile.location && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gp-glass-border px-2 py-0.5">
                  <span className="material-symbols-outlined text-[13px]">place</span>
                  {profile.location}
                </span>
              )}
              {memberSince && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gp-glass-border px-2 py-0.5">
                  <span className="material-symbols-outlined text-[13px]">schedule</span>
                  Joined {memberSince}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-full border border-gp-glass-border px-4 py-2 text-sm font-semibold text-gp-ink-strong dark:text-white hover:bg-gp-surface-strong/40 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || uploadingPhoto}
                  className="inline-flex items-center gap-2 rounded-full bg-gp-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${saving ? 'animate-spin' : ''}`}
                  >
                    {saving ? 'progress_activity' : 'save'}
                  </span>
                  {saving ? 'Saving…' : uploadingPhoto ? 'Uploading…' : 'Save'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-2 rounded-full bg-gp-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat icon="workspaces" label="Spaces" value={profile.spaceCount} />
          <Stat icon="groups" label="WeSpaces" value={profile.weSpaceCount} />
          <Stat icon="hub" label="Connections" value={profile.connectionCount} />
        </div>
      </header>

      {/* View / edit grid — 2 columns minimum, 3 on wide screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Basic information */}
        <section className="flex flex-col gap-4 rounded-2xl border border-gp-glass-border bg-gp-glass-bg backdrop-blur-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gp-primary text-[20px]">contact_page</span>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gp-ink-muted dark:text-gp-ink-soft">
              Basic Information
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField label="First name" value={active ? active.firstName : profile.firstName} editing={editing} onChange={(v) => setField('firstName', v)} placeholder="First name" />
            <InfoField label="Last name" value={active ? active.lastName : profile.lastName} editing={editing} onChange={(v) => setField('lastName', v)} placeholder="Last name" />
            <InfoField label="Pronouns" value={active ? active.pronouns : profile.pronouns} editing={editing} onChange={(v) => setField('pronouns', v)} placeholder="they/them" />
            <InfoField label="Location" value={active ? active.location : profile.location} editing={editing} onChange={(v) => setField('location', v)} placeholder="City, Country" />
            <InfoField label="Phone" value={active ? active.phone : profile.phone} editing={editing} onChange={(v) => setField('phone', v)} placeholder="Phone number" type="tel" />
          </div>
        </section>

        {ATTRIBUTES.map(({ key, icon, title, placeholder }) => (
          <AttributeCard
            key={key}
            icon={icon}
            title={title}
            placeholder={placeholder}
            editing={editing}
            value={active ? active[key] : profile[key]}
            onChange={(v) => setField(key, v)}
          />
        ))}
      </div>
    </ProfileShell>
  )
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gp-glass-border bg-gp-surface-strong/40 dark:bg-white/5 p-3">
      <span className="material-symbols-outlined text-gp-primary text-[22px]">{icon}</span>
      <div className="min-w-0">
        <div className="text-base sm:text-lg font-bold leading-none text-gp-ink-strong dark:text-white">
          {value}
        </div>
        <div className="mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-gp-ink-muted dark:text-gp-ink-soft">
          {label}
        </div>
      </div>
    </div>
  )
}

function ProfileShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-full w-full overflow-y-auto bg-gp-surface dark:bg-gp-surface-dark transition-colors"
      style={{
        backgroundImage: `
          radial-gradient(at 18% 16%, color-mix(in srgb, var(--gp-primary) 10%, transparent) 0, transparent 55%),
          radial-gradient(at 82% 14%, color-mix(in srgb, var(--gp-accent-glow) 10%, transparent) 0, transparent 55%),
          radial-gradient(at 84% 86%, color-mix(in srgb, var(--gp-goal) 8%, transparent) 0, transparent 60%)
        `,
      }}
    >
      <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6 p-4 sm:p-8 pt-20 sm:pt-24">
        {children}
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <ProfileShell>
      <div className="h-44 animate-pulse rounded-3xl border border-gp-glass-border bg-gp-glass-bg" />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-gp-glass-border bg-gp-glass-bg"
          />
        ))}
      </div>
    </ProfileShell>
  )
}
