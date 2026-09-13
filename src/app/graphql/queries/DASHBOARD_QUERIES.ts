import { graphql } from '@/gql'

// Both of the self-reads below are keyed on the caller's own Person id, NOT
// their email. `Person.email` is no longer filterable: the generated
// `email_STARTS_WITH` / `_CONTAINS` operators that came with `email_EQ` were an
// account-enumeration oracle for any authenticated caller. The id is already in
// hand — login and signup both return it and it is the same value as the JWT's
// `user.id` — so this lookup loses nothing, seeks the id index instead of
// scanning a property, and cannot be aimed at somebody else's account.

// GOAL-371 — the app-shell bootstrap read, split out of GET_LOGGED_IN_USER.
//
// `UserDataProvider` runs this on app init purely to find the caller's MeSpace
// id, but it used to send the full profile document, PII block and all. The
// `PersonPrivateProfile` gate (GOAL-275) is one type-level `@authorization`
// filter, so selecting it costs a flat ~41 extra `EXISTS {` blocks on a query
// whose answer is a single id — measured on dev against the real schema:
//
//   GET_LOGGED_IN_USER (with privateProfile + memberOf) : 45 EXISTS / 9.4k chars
//   GET_SHELL_USER     (this document)                  :  4 EXISTS / 1.6k chars
//
// and `CYPHER replan=force` on dev drops 702–761 ms → 118–141 ms, with PROFILE
// dbHits 118 → 53. That matters because the bootstrap read sits on the critical
// path *before* the dashboard's own documents fire.
//
// Scope note, measured rather than assumed: the bootstrap read does NOT fire on
// every protected page load, despite what GOAL-371 assumed. `UserDataProvider`
// skips while `localStorage.meSpaceId` is set, and `AppContext`'s hydration
// effect derives that id from the persisted login payload before `user` reaches
// the tree. So this document only goes to the server when the id genuinely
// cannot be recovered locally — a cold session, or a persisted user whose
// `ownsSpaces` carries no MeSpace. The win is on that path, not per-navigation.
//
// `memberOf` is deliberately absent: the only shell consumers are
// `UserDataProvider` (reads `ownsSpaces`), `AppContext` and `FocalEntityContext`
// (both read `ownsSpaces` off the persisted login payload). Nothing in the shell
// reads `memberOf` — the profile page does, and it keeps the full document below.
//
// Space authorization is untouched: `ownsSpaces` still resolves through the
// MeSpace (owner-only) and WeSpace (owner-or-member) `@authorization` filters,
// which are the only two rules the emitted Cypher carries.
export const GET_SHELL_USER = graphql(`
  query getShellUser($id: ID!) {
    people(where: { id_EQ: $id }) {
      id
      name
      firstName
      lastName
      photo
      onboardingCurrentStepIndex
      onboardingCompletedSteps
      onboardingIsCompleted
      onboardingSkipped
      ownsSpaces {
        id
        name
        visibility
        createdAt
        ... on MeSpace {
          __typename
          id
          name
        }
        ... on WeSpace {
          __typename
          id
          name
        }
      }
    }
  }
`)

// The full PII document. GOAL-371: `UserDataProvider` no longer sends it, so
// `use-profile.ts` is its only consumer and it is fetched only when
// /protected/profile mounts. It normalizes into the same `Person:<id>` cache
// entry as GET_SHELL_USER above — note that this does NOT let the profile page
// paint early from the shell result: `use-profile.ts` runs `cache-and-network`
// without `returnPartialData`, and an entry missing `privateProfile` is a
// partial diff, which Apollo v4 reports as `data: undefined`.
export const GET_LOGGED_IN_USER = graphql(`
  query getLoggedInUser($id: ID!) {
    people(where: { id_EQ: $id }) {
      id
      name
      firstName
      lastName
      photo
      # GOAL-275 PII — read through the single type-level gate. This is the
      # caller's OWN node (matched on their own id), so the "is the person"
      # branch always authorizes it and privateProfile is never null here.
      privateProfile {
        id
        email
        phone
        pronouns
        location
        passions
        traits
        fieldsOfCare
        interests
        careManual
        favorites
        connections {
          id
          firstName
          lastName
          name
          photo
        }
        connectionEdges {
          connectedPersonId
          why
          interests
        }
      }
      onboardingCurrentStepIndex
      onboardingCompletedSteps
      onboardingIsCompleted
      onboardingSkipped
      ownsSpaces {
        id
        name
        visibility
        createdAt
        ... on MeSpace {
          __typename
          id
          name
        }
        ... on WeSpace {
          __typename
          id
          name
        }
      }
      memberOf {
        id
        role
        space {
          id
          name
          visibility
          createdAt
          ... on MeSpace {
            __typename
            id
            name
          }
          ... on WeSpace {
            __typename
            id
            name
          }
        }
      }
    }
  }
`)

// GOAL-275: directory FIND by name only. Searching by email (email_CONTAINS)
// enabled cross-Space email enumeration; `email` is also now Space-scoped, and
// selecting a gated field would filter the whole Person out of results for
// non-co-Space callers (breaking discovery). So this query selects ONLY the
// open directory fields (id/name/photo) and matches on name — every Person
// stays findable, and no PII is exposed.
export const SEARCH_PEOPLE_QUERY = graphql(`
  query SearchPeople($nameContains: String!) {
    people(
      where: {
        OR: [
          { firstName_CONTAINS: $nameContains }
          { lastName_CONTAINS: $nameContains }
        ]
      }
    ) {
      id
      name
      photo
    }
  }
`)
