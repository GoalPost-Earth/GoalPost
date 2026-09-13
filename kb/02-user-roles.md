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
| **Person (identity)**| Any authenticated user — name + photo, so people stay findable |
| **Person (PII)**     | Self, creator, Space-sharer, or context-viewer — via `privateProfile` |

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
- **FieldContext**: Returns if user owns/is member of the parent Space
- **Pulse types**: Same as FieldContext (inherit from parent context's space)
- **SpaceMembership**: Only returns if user is owner/member of the associated space
- **Person**: the open directory fields (`id`, `firstName`, `lastName`, `name`, `photo`) are readable by any authenticated user, so people stay findable by name across Spaces. All PII is gated — see below.
- **Log**: Readable by any authenticated user

### Space visibility — the `SpaceAuthAnchor` shape (GOAL-373)

`FieldContext`, `SpaceMembership` and all five pulse types all ask the same
question — *is the caller the owner of, or any member of, the Space this node
hangs off?* — and the shape that question is written in dominates the planning
cost of every dashboard list document.

The rule is anchored on **`SpaceAuthAnchor`**, a GraphQL type over
`@node(labels: ["Space"])` that exists only to be named by these filters:

```graphql
spaces_SOME: {
  OR: [
    { owner_SOME: { id_EQ: "$jwt.user.id" } }
    { members_SOME: { member_SOME: { id_EQ: "$jwt.user.id" } } }
  ]
}
```

Things that trip people up:

- **The policy has not changed** and must not. Owner **or any member, any role,
  GUEST included**, for READ, on every one of those types. This is a *reach*
  test, not a role test — the role-checked rules are the `validate` blocks in
  the operation matrix below, and they stay declarative on
  `meSpace` / `weSpace`.
- **The `Space` INTERFACE cannot carry this rule.** `@neo4j/graphql` expands an
  interface-typed relationship filter once per implementing type, so
  `space_SOME` over `Space` emits `(:Space:MeSpace)` OR `(:Space:WeSpace)` —
  byte-identical Cypher to naming `meSpace_SOME` and `weSpace_SOME` by hand.
  Only a **concrete** type over the shared `:Space` label collapses it. Measured
  GOAL-373: `FieldContext` 10 → 4 `EXISTS`, 19 → 12 dbHits on a single-row read;
  a post-trim `GET_ALL_PULSES` sub-query 21 → 9 `EXISTS` and ~350 ms → ~175 ms
  to plan under `CYPHER replan=force` (median of 5), and
  `meSpaces { contexts { pulses } }` 1,323 ms → 598 ms.
- **A `@cypher` Boolean gate does NOT work here** — see ADR-010. It was
  prototyped and rejected on measurement: 238 rows into the `CALL` instead of 1,
  and 19 → 2,146 dbHits on a single-row `FieldContext` lookup.
- **`SpaceAuthAnchor` is not a read surface.** No root query, no mutations, and
  every field that points at it carries `@selectable(onRead: false,
  onAggregate: false)` *and* `aggregate: false`. `@selectable` alone is not
  enough — it leaves `spacesAggregate` and `spacesConnection` on the parent, and
  the connection projects the Space itself, which a MeSpace *member* is not
  allowed to read. It also carries the same READ filter itself, as defence in
  depth. Verify that against `printSchema`, never against the directive list.
- **It anchors on `HAS_CONTEXT` / `HAS_MEMBER`, never `HAS_DELETED_CONTEXT`.**
  That is what keeps soft-deleted fields (GOAL-319) invisible while nested
  sub-contexts (GOAL-295), which keep their own `HAS_CONTEXT` edge, stay
  visible.
- **Raw-Cypher readers restate this policy themselves** and are NOT covered by
  it: `viewablePulsePredicate`, the assistant's `search_field_context`, and
  `query_for_bloom`'s Space anchoring. Change the branch table here and you must
  change them too.

Pinned by `space-visibility-plan-size.test.ts` (plan size + read surface, no DB)
and `space-visibility-read-auth.integration.test.ts` (minted JWTs against dev:
outsider sees none of the four types, GUEST sees all four, an owner sees their
own MeSpace and nobody else's).

Still on the four-branch `meSpace_SOME` / `weSpace_SOME` form, out of GOAL-373's
scope: `Document`, `ResonanceLink`, `PromiseWeave`, `Organization`, `Log`, and
branches 3-5 of `PersonPrivateProfile` below. The rewrite is mechanical; it just
has not been measured on those surfaces.

### Person PII — the `privateProfile` gate (GOAL-275)

Person PII is **not** readable from the `Person` type. It lives on
`PersonPrivateProfile`, reached through `Person.privateProfile`, behind a
single **type-level** `@authorization` filter. The gated set is `email`,
`phone`, `pronouns`, `location`, `gender`, `description`, `careManual`,
`favorites`, `passions`, `traits`, `fieldsOfCare`, `interests`, plus
`connections` and `connectionEdges`.

A caller may read it when **any** of these hold:

| # | Branch          | Who that is                                                          |
| - | --------------- | -------------------------------------------------------------------- |
| 1 | self            | The person themselves (`id_EQ: $jwt.user.id`)                        |
| 2 | `createdBy`     | Whoever created the node — their own imported / ingested contact      |
| 3 | `ownsSpaces`    | A co-owner or co-member of any Space the person **owns**              |
| 4 | `memberOf`      | The owner or a co-member of any Space the person **belongs to**       |
| 5 | `contexts`      | Anyone who can view a FieldContext holding them (`HAS_PERSON`)        |

Otherwise `privateProfile` resolves to **null**; the Person row itself still
returns, so UI renders the directory identity (name + photo) with a "Private
profile" notice rather than a not-found.

Notes that trip people up:

- **Role is not part of the test.** Branches 3–5 match *any* membership, so a
  **GUEST** of a WeSpace reads every member's PII exactly like an ADMIN does.
  That has always been true; the table above is a reach test, not a role test.
- **`@authorization` covers the GraphQL read path only.** Server-side raw
  Cypher runs underneath it, so any tool or resolver that reads `:Person`
  properties directly has to **restate** this branch table or it bypasses the
  gate entirely. The assistant's `person-search.tool.ts` used to do exactly
  that — bare `(p:Person)`, no caller scoping, returning `email`, `pronouns`,
  `location`, `passions`, `traits`, `interests`, `fieldsOfCare`, `favorites`
  plus every `CONNECTED_TO` neighbour to anyone who asked. It now takes a
  `userId` and carries a hand port of the filter (`CAN_READ_PII`), pinned by
  `person-search-pii.integration.test.ts`; a null caller is refused outright.
  **When you add a branch to the SDL filter, add it to that constant too** —
  the SDL test does not see the Cypher copy. Treat the branch table as the
  policy, and audit every new raw-Cypher Person read against it.
- **`CONNECTED_TO` is not a branch.** An edge records a claim by its author,
  never the far endpoint's consent. See `kb/03-workflows.md` and the
  `addPersonToFieldContext` target gate.
- **Branch 5 is privilege-granting.** Attaching a person to a context unlocks
  their PII to everyone who can reach that context, which is why the attach
  path is itself gated.
- **Sub-contexts (GOAL-295) do unlock**, because every context — nested or not
  — also hangs off its Space by its own `HAS_CONTEXT` edge.
- **Soft-deleted contexts (GOAL-319) do not**, because the Space edge is
  re-pointed to `HAS_DELETED_CONTEXT`. Deleting a field withdraws the PII reach
  it granted.
- Writes are unaffected — the fields are still ordinary node properties, only
  the GraphQL read path moved.
- **No PII scalar is filterable, `email` included.** `email` was the last one
  left, for the `people(where: { email_EQ })` login bootstrap. @neo4j/graphql
  generates the whole operator family or none, so that also shipped
  `email_STARTS_WITH` — an account-enumeration oracle for any authenticated
  caller, readable through `peopleAggregate { count }` without returning a
  single row. An `@authorization` filter gates projections, not `where`
  predicates, so nothing about the PII gate ever covered it. The bootstrap now
  keys on `id_EQ` (the client already holds its own id, and it is the same
  value as the JWT's `user.id`), and `email` carries
  `@filterable(byValue: false)` on **both** `Person` and `User` — `User` too,
  because `UserWhere` stays reachable via `updateUsers` / `deleteUsers`, where
  a Forbidden-vs-success response is itself the oracle. The only by-email path
  is the exact-match `findUserByEmail` resolver, for adding a Space member.
- **Verify these things against the BUILT schema, never the directive list.**
  `printSchema(await neoSchema.getSchema())` and grep it. That is how the
  `UserWhere` half of the email surface was found.

### Cascading authorization — operation matrix

Authorization cascades Space → FieldContext → FieldPulse. The `@authorization` directives split into `filter` (READ/AGGREGATE) and `validate` (CREATE/UPDATE/DELETE) blocks:

| Entity         | READ/AGGREGATE                     | CREATE/UPDATE                       | DELETE                                  |
| -------------- | ---------------------------------- | ----------------------------------- | --------------------------------------- |
| MeSpace        | Owner only                         | Owner only                          | Owner only                              |
| WeSpace        | Owner or any member                | Owner, ADMIN, or MEMBER             | Owner only                              |
| FieldContext   | Inherits from parent Space         | Owner, ADMIN, or MEMBER             | Owner or ADMIN                          |
| FieldPulse     | Inherits from parent FieldContext  | Owner, ADMIN, or MEMBER             | Creator (either author edge — `createdBy` or `initiatedBy`), ADMIN, or owner |

### MeSpace → WeSpace auto-conversion

When the first non-owner member is added to a MeSpace via `addSpaceMember` (`src/lib/graphql/resolvers/space-membership-resolver.ts`), the resolver removes the `MeSpace` label and adds the `WeSpace` label in place. The owner relationship, contexts, pulses, and resonances are preserved — only the label set changes, which flips the `@authorization` filter from owner-only to owner-or-member. There is no separate "convert space" mutation; conversion is a side effect of the first member add.

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
