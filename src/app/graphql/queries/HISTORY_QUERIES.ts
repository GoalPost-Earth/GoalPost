import { graphql } from '@/gql'

/**
 * Query to fetch all pulses for the history page.
 * Includes GoalPulse, ResourcePulse, StoryPulse and CoreValuePulse with the
 * FieldContext each one sits in.
 *
 * GOAL-369 — this is a LIST document: it feeds the card grid in
 * `src/components/dashboard/active-pulses.tsx`, which renders
 * `__typename / id / title / content / createdAt / context[0].title`. It
 * deliberately selects NOTHING that pulls a nested `Person` in.
 *
 * (`intensity` is also selected here and read by nobody on this path — only
 * `pulse-details-body.tsx` renders it, from its own document. It is left alone
 * because it is a plain scalar on a node already being matched and is free to
 * plan: measured at 21 EXISTS both with and without it. Do not read that as
 * precedent for re-adding a RELATIONSHIP selection, which is a different animal
 * — see below.)
 *
 * It used to also select `createdBy { … privateProfile { id email } }`, which
 * nothing rendered. That one block was the single most expensive thing in the
 * dashboard's critical path: selecting `privateProfile` on a nested Person
 * expands the type-level `PersonPrivateProfile` @authorization filter
 * (`schema.gql`, 5 nested branches) into ~29 `EXISTS {` blocks inside the
 * generated Cypher — and this document has FOUR root fields, so it paid for it
 * four times over. Neo4j's planning cost is super-linear in predicate count and
 * the Aura plan cache misses often, so the app paid 0.5–0.9 s of PLANNING per
 * root field on most requests while execution itself was ~1 ms.
 *
 * Measured with the harness described on GOAL-369 (compile the document through
 * the real schema.gql against a stub driver and count `EXISTS {`): 50 EXISTS /
 * 7.7k chars per root field before, 21 / 2.9k after. `dashboard-list-plan-size.test.ts`
 * pins the EXISTS budget — the char and millisecond figures there are prose.
 *
 * If you need the author of a pulse here, DO NOT re-add `privateProfile`. The
 * info drawer already fetches it per-pulse via `GET_PULSE_DETAILS_WITH_CONTEXT`,
 * which is the right place to pay that cost — once, on demand, for one pulse.
 */
export const GET_ALL_PULSES = graphql(`
  query GetAllPulses {
    goalPulses {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
    resourcePulses {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
    storyPulses {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
    coreValuePulses {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
  }
`)

/**
 * Fetch pulses scoped to a single FieldContext. Used by the studio's
 * dashboard mode when the FocalEntityContext has an `activeFieldContextId` —
 * the surrounding lists narrow to the user's current context instead of
 * showing the entire MeSpace + WeSpace history.
 *
 * Authorization is still enforced by the per-pulse-type `@authorization`
 * directives in `src/lib/graphql/schema/schema.gql`; this query only narrows
 * the row set the user is already allowed to see.
 */
export const GET_ALL_PULSES_BY_CONTEXT = graphql(`
  query GetAllPulsesByContext($contextId: ID!) {
    goalPulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
    resourcePulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
    storyPulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
    coreValuePulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
  }
`)

/**
 * Fetch pulses scoped to a single Space (MeSpace or WeSpace). Used by the
 * studio's dashboard mode when FocalEntityContext has an `activeSpaceId` but
 * no `activeFieldContextId` — narrows to all pulses across every FieldContext
 * inside the active Space.
 *
 * A FieldContext attaches to its Space through either `meSpace` or `weSpace`
 * (see `kb/05-data-entities.md`), so the filter ORs both. Authorization is
 * still enforced by the per-pulse-type `@authorization` directives.
 */
export const GET_ALL_PULSES_BY_SPACE = graphql(`
  query GetAllPulsesBySpace($spaceId: ID!) {
    goalPulses(
      where: {
        context_SOME: {
          OR: [
            { meSpace_SOME: { id_EQ: $spaceId } }
            { weSpace_SOME: { id_EQ: $spaceId } }
          ]
        }
      }
    ) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
    resourcePulses(
      where: {
        context_SOME: {
          OR: [
            { meSpace_SOME: { id_EQ: $spaceId } }
            { weSpace_SOME: { id_EQ: $spaceId } }
          ]
        }
      }
    ) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
    storyPulses(
      where: {
        context_SOME: {
          OR: [
            { meSpace_SOME: { id_EQ: $spaceId } }
            { weSpace_SOME: { id_EQ: $spaceId } }
          ]
        }
      }
    ) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
    coreValuePulses(
      where: {
        context_SOME: {
          OR: [
            { meSpace_SOME: { id_EQ: $spaceId } }
            { weSpace_SOME: { id_EQ: $spaceId } }
          ]
        }
      }
    ) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
    }
  }
`)

/**
 * Fetch FieldContexts scoped to a single Space. Used by the studio's
 * dashboard mode when FocalEntityContext has an `activeSpaceId` — same
 * shape as GET_ALL_FIELD_CONTEXTS so callers can swap.
 *
 * A FieldContext attaches to its Space through either `meSpace` or `weSpace`
 * (see `kb/05-data-entities.md`), so the filter ORs both. Authorization is
 * still enforced by the `@authorization` directive on FieldContext.
 */
export const GET_FIELD_CONTEXTS_BY_SPACE = graphql(`
  query GetFieldContextsBySpace($spaceId: ID!) {
    fieldContexts(
      where: {
        OR: [
          { meSpace_SOME: { id_EQ: $spaceId } }
          { weSpace_SOME: { id_EQ: $spaceId } }
        ]
      }
    ) {
      id
      title
      emergentName
      createdAt
      space {
        id
        name
        visibility
      }
      weSpace {
        id
        name
        visibility
      }
      pulses {
        ... on GoalPulse {
          __typename
          id
          createdAt
        }
        ... on ResourcePulse {
          __typename
          id
          createdAt
        }
        ... on StoryPulse {
          __typename
          id
          createdAt
        }
        ... on CarePulse {
          __typename
          id
          createdAt
        }
        ... on CoreValuePulse {
          __typename
          id
          createdAt
        }
      }
    }
  }
`)

/**
 * Query to fetch all FieldContexts with their pulses
 */
export const GET_ALL_FIELD_CONTEXTS = graphql(`
  query GetAllFieldContexts {
    fieldContexts {
      id
      title
      emergentName
      createdAt
      space {
        id
        name
        visibility
      }
      weSpace {
        id
        name
        visibility
      }
      pulses {
        ... on GoalPulse {
          __typename
          id
          createdAt
        }
        ... on ResourcePulse {
          __typename
          id
          createdAt
        }
        ... on StoryPulse {
          __typename
          id
          createdAt
        }
        ... on CarePulse {
          __typename
          id
          createdAt
        }
        ... on CoreValuePulse {
          __typename
          id
          createdAt
        }
      }
    }
  }
`)

/**
 * Query to fetch all MeSpaces for the space CARDS.
 *
 * GOAL-369 — LIST document. Its consumers (`dashboard/spaces-list.tsx`,
 * `dashboard/spaces-overview.tsx`, `studio/modes/graph-mode/bloom-view.tsx`,
 * `studio/canvas-action-bar.tsx`) render exactly: the space's own scalars, the
 * owner's name, `members.length` and `contexts.length`. So `members` and
 * `contexts` are selected down to `id` — enough to keep the counts and the
 * Apollo cache normalization — and nothing reaches into a nested Person's PII.
 *
 * `owner { id }` is load-bearing and easy to miss: bloom-view derives
 * `currentUserId` from `meSpaces[0].owner[0].id` behind an `as` cast, so
 * dropping it would NOT fail typecheck but would silently delete the root "You"
 * hub node and every owns/member spoke from the bloom graph.
 *
 * Removed here: `owner.privateProfile`, the whole `members.member` sub-selection,
 * `members.role`, `members.addedAt`, `contexts.title`, `contexts.createdAt` —
 * none of them were read anywhere.
 *
 * Be precise about WHICH of those cost anything, or the next person will avoid
 * the wrong field. Measured, dropping `members.role` / `members.addedAt` /
 * `contexts.title` / `contexts.createdAt` bought exactly ZERO (19 EXISTS either
 * way) — they went only because they were dead. The entire saving came from the
 * two `privateProfile` selections (77 → 19 EXISTS): each one expands the
 * type-level `PersonPrivateProfile` @authorization filter into ~29 `EXISTS {`
 * blocks of generated Cypher, which is what made this document plan for
 * 1.3–3.0 s on a cold plan while executing in 1–4 ms.
 *
 * So: if you genuinely need member names here, `members.member { firstName }`
 * is affordable. `members.member { privateProfile { … } }` is not.
 *
 * This is a projection change only — narrowing what the client ASKS for can
 * never loosen authorization. The gate in `schema.gql` is untouched, and the
 * drawer/profile documents that legitimately need PII still go through it.
 */
export const GET_ALL_ME_SPACES = graphql(`
  query GetAllMeSpaces {
    meSpaces {
      id
      name
      visibility
      createdAt
      owner {
        id
        firstName
        lastName
      }
      # Count only — see the note above before widening this.
      members {
        id
      }
      # Count only — see the note above before widening this.
      contexts {
        id
      }
    }
  }
`)

/**
 * Query to fetch all WeSpaces for the space CARDS.
 * Same shape, same consumers and the same GOAL-369 reasoning as
 * GET_ALL_ME_SPACES above — read that note before adding a field here.
 */
export const GET_ALL_WE_SPACES = graphql(`
  query GetAllWeSpaces {
    weSpaces {
      id
      name
      visibility
      createdAt
      owner {
        id
        firstName
        lastName
      }
      # Count only — see the note on GET_ALL_ME_SPACES before widening this.
      members {
        id
      }
      # Count only — see the note on GET_ALL_ME_SPACES before widening this.
      contexts {
        id
      }
    }
  }
`)
