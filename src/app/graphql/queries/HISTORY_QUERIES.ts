import { graphql } from '@/gql'

/**
 * Query to fetch all pulses for the history page
 * Includes GoalPulse, ResourcePulse, StoryPulse, and CoreValuePulse with their contexts and initiators
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
        email
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
        email
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
        email
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
        email
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
        email
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
        email
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
        email
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
        email
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
        email
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
        email
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
        email
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
        email
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
        email
      }
      members {
        id
        role
        addedAt
        member {
          id
          firstName
          lastName
          email
        }
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
        email
      }
      members {
        id
        role
        addedAt
        member {
          id
          firstName
          lastName
          email
        }
      }
      contexts {
        id
        title
        createdAt
      }
    }
  }
`)
