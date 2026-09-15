import { graphql } from '@/gql'

/**
 * Query to fetch all pulses for the history page
 * Includes GoalPulse, ResourcePulse, StoryPulse, and CoreValuePulse with their contexts and initiators
 *
 * GOAL-370: `createdBy` carries identity only — `id` / `firstName` /
 * `lastName` / `name` — never `privateProfile`. Each sub-query is planned on
 * its own, and the PII selection added a full copy of the PersonPrivateProfile
 * gate to all four: 50 EXISTS blocks and ~515 ms of planning each, measured on
 * dev, against ~100 dbHits of real work (ADR-010). Same for the two scoped
 * variants below.
 *
 * `createdBy` itself is currently read by nobody — `active-pulses.tsx` is the
 * only consumer of these three documents and it renders no author line. It is
 * kept because an author line is the obvious next thing these cards grow, and
 * the identity fields are cheap; the gate was not.
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
      createdBy {
        id
        firstName
        lastName
        name
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
 * Query to fetch all MeSpaces with their contexts and members
 *
 * GOAL-370: deliberately selects no `privateProfile` and no nested
 * `members.member`. The cards render the owner's name, `members.length` and
 * `contexts.length` — nothing else — and every `privateProfile` selection site
 * makes @neo4j/graphql emit another full copy of the PersonPrivateProfile
 * gate, whose planning cost is super-linear in predicate count (ADR-010).
 * Owner + member + the nested member hop cost 77 EXISTS blocks and 1.5 s of
 * planning for ~100 dbHits of work. A surface that needs a member's identity
 * asks for it through its own document (GET_SPACE_DETAILS).
 * `dashboard-list-plan-size.test.ts` fails if a selection comes back.
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
      members {
        id
        role
      }
      contexts {
        id
        title
        createdAt
      }
    }
  }
`)

/**
 * Query to fetch all WeSpaces with their contexts and members
 *
 * Same GOAL-370 trim as GET_ALL_ME_SPACES above — see that comment for why the
 * owner's and members' `privateProfile` is not selected here.
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
        name
      }
      members {
        id
        role
      }
      contexts {
        id
        title
        createdAt
      }
    }
  }
`)
