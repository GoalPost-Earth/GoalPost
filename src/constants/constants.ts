// Registration toggle. Set NEXT_PUBLIC_DISABLE_SIGNUP=true to hide the public
// sign up flow — the "Create an account" links and the /auth/signup page route
// (redirected to login by middleware). Onboarding then happens via invite only.
export const SIGNUP_DISABLED =
  process.env.NEXT_PUBLIC_DISABLE_SIGNUP === 'true'

export const CLOUDINARY_MEMBER_PRESET = 'member-photos'

export const RANDOM_IMAGE_URL_400 = 'https://picsum.photos/300/300'

export const PRONOUN_SELECT_OPTIONS = [
  { label: 'He/Him', value: 'He/Him' },
  { label: 'She/Her', value: 'She/Her' },
  { label: 'They/Them', value: 'They/Them' },
]

export const GENDER_SELECT_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
]

export const STATUS_SELECT_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

// --- WeSpace invite flow (GOAL-329) ---
// Shared between server (accept-invite route, space-membership resolver) and
// client (accept-invite page, permissions modal) so copy and the client-side
// detection of these outcomes can never drift apart.

// The single collapsed message for every failed invite redemption (invalid /
// expired / already used / rate-limited). The endpoint must not be usable as
// an enumeration oracle, so exactly one string covers all failure modes.
export const INVITE_INVALID_MESSAGE = 'This invite is invalid or has expired.'

// Success message when re-adding a pending (not-yet-registered) invitee
// re-mints and re-sends their invite link instead of failing.
export const INVITE_RESENT_MESSAGE =
  'This person already had a pending invite — a fresh invite email has been sent.'
