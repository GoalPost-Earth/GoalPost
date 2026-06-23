// Shared types + style tokens for the PersonPanel and its two body variants
// (PersonPulse vs member). Kept in one place so the shell and bodies agree on
// role colors and form styling without a circular import.

export interface PersonInPanel {
  id: string
  firstName: string
  lastName: string
  name: string | null
  email?: string | null
  photo?: string | null
  role?: 'ADMIN' | 'MEMBER' | 'GUEST' | 'OWNER' | 'PERSON'
}

export interface ConnectedPerson {
  id: string
  firstName: string
  lastName: string
  name: string | null
  photo?: string | null
  role?: 'ADMIN' | 'MEMBER' | 'GUEST' | 'OWNER' | 'PERSON'
}

export const roleColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  OWNER: {
    bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/40',
  },
  ADMIN: {
    bg: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/40',
  },
  MEMBER: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/40',
  },
  PERSON: {
    bg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/40',
  },
  GUEST: {
    bg: 'bg-gradient-to-br from-slate-500/20 to-gray-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/40',
  },
}

export const inputClass =
  'w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-gp-ink-strong outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:text-white'

export const sectionTitleClass =
  'text-xs font-semibold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wide'
