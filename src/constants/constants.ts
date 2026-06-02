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
