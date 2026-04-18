# User Roles & Permissions — GoalPost

## Overview

GoalPost does not use traditional role-based access control with named user roles (like "admin" or "editor"). Instead, privacy and authorization are enforced through **Space ownership and membership**. Access to content flows from Space → FieldContext → Pulse.

## Access Model

| Level                | Who Can Access                             |
| -------------------- | ------------------------------------------ |
| **MeSpace**          | Owner only                                 |
| **WeSpace**          | Owner + Members (by membership role)       |
| **FieldContext**     | Inherits from parent Space                 |
| **Pulse**            | Inherits from parent FieldContext          |
| **Person (profile)** | Any authenticated user (for search/lookup) |

---

## Space Roles

When a Person is a member of a WeSpace, they hold one of three roles via `SpaceMembership`:

| Role       | Permissions                                                  |
| ---------- | ------------------------------------------------------------ |
| **ADMIN**  | Full control — manage members, edit content, view everything |
| **MEMBER** | Contribute pulses, view content, cannot manage members       |
| **GUEST**  | View-only access to the space                                |

The **Space Owner** has implicit full control, equivalent to ADMIN but separate (tracked via `OWNS` relationship, not membership).

---

## Permission Functions

Defined in `src/lib/permissions/space-permissions.ts`:

| Function                                 | Who Passes                             |
| ---------------------------------------- | -------------------------------------- |
| `canManageMembers(userId, spaceId)`      | Owner or ADMIN                         |
| `canEditContent(userId, spaceId)`        | Owner, ADMIN, or MEMBER                |
| `canViewContent(userId, spaceId)`        | Owner or any member role               |
| `getUserSpaceRole(userId, spaceId)`      | Returns `'OWNER'` / SpaceRole / `null` |
| `isSpaceOwner(userId, spaceId)`          | Boolean — checks `OWNS` relationship   |
| `memberExistsInSpace(memberId, spaceId)` | Boolean — checks `HAS_MEMBER` chain    |

---

## Authentication

- **JWT-based** — custom implementation (not a third-party provider)
- User token contains `user.id`, used for all authorization checks
- Token stored in localStorage (`token`) and cookie (`accessToken`)
- Refresh token rotation supported (`refreshToken`, `refreshTokenExp`, `refreshTokenRevoked`)
- Auth state managed via `AppContext` in `src/contexts/AppContext.tsx`

### Auth Flow

```
Sign Up → Login → JWT issued → Token stored (localStorage + cookie)
    → User data fetched via GraphQL (GET_LOGGED_IN_USER)
    → MeSpace ID cached in localStorage
    → Protected routes check isAuthenticated
```

### Password Reset

```
Request reset → Email sent via Resend → User clicks link → Set new password
```

---

## Route Protection

- **Public routes:** `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`
- **Protected routes:** Everything under `/protected/*` — requires valid JWT
- No role-based route gating (unlike the previous TDX model); all authenticated users access the same app shell
- Space-level authorization enforced at the GraphQL layer via `@authorization` directives

---

## GraphQL Authorization

All types use `@authorization` directives that filter data based on `$jwt.user.id`:

- **MeSpace**: Only returns if `owner` matches current user
- **WeSpace**: Returns if user is owner OR a member
- **FieldContext**: Returns if user owns/is member of the parent Space (checks both MeSpace and WeSpace paths)
- **Pulse types**: Same as FieldContext (inherit from parent context's space)
- **SpaceMembership**: Only returns if user is owner/member of the associated space
- **Person**: Readable by any authenticated user (no filter)
- **Log**: Readable by any authenticated user

---

## User Profile

Users have rich profile data beyond basic auth:

| Field                   | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `firstName`, `lastName` | Display name                                    |
| `email`                 | Login identifier                                |
| `pronouns`              | Self-described pronouns                         |
| `location`              | Geographic location                             |
| `photo`                 | Avatar/profile picture                          |
| `careManual`            | How this person wants to be cared for           |
| `favorites`             | Things they value                               |
| `passions`              | Extracted/self-reported passions                |
| `traits`                | Personality traits                              |
| `fieldsOfCare`          | Areas of care and concern                       |
| `interests`             | Broader interests                               |
| `embedding`             | Vector embedding of profile for semantic search |

---

## Onboarding

New users go through an onboarding flow tracked by:

| Field                        | Type     | Purpose                         |
| ---------------------------- | -------- | ------------------------------- |
| `onboardingCurrentStepIndex` | Int      | Current step in the flow        |
| `onboardingCompletedSteps`   | [String] | Steps already completed         |
| `onboardingIsCompleted`      | Boolean  | Whether onboarding is done      |
| `onboardingSkipped`          | Boolean  | Whether user skipped onboarding |
