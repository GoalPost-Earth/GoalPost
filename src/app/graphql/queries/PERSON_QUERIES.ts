import { graphql } from '@/gql'

export const GET_PERSON_PROFILE = graphql(`
  query getPersonProfile($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      firstName
      lastName
      name
      photo
      # Null when the caller is not authorized for this person's PII — the
      # single GOAL-275 gate. The row itself still resolves, so the drawer and
      # profile page can render the directory card rather than a not-found.
      privateProfile {
        id
        email
        description
        traits
        passions
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
      ownsSpaces {
        ... on MeSpace {
          id
          name
          visibility
          createdAt
          contexts {
            id
            title
          }
        }
        ... on WeSpace {
          id
          name
          visibility
          createdAt
          contexts {
            id
            title
          }
        }
      }
      memberOf {
        id
        role
        space {
          ... on MeSpace {
            id
            name
            visibility
            createdAt
          }
          ... on WeSpace {
            id
            name
            visibility
            createdAt
          }
        }
      }
    }
  }
`)

/**
 * Fetched separately from GET_PERSON_PROFILE so a data-integrity issue in
 * a single pulse (e.g. a GoalPulse with a NULL title — schema says
 * String!, so the non-null cascade would otherwise null the entire
 * Person and surface as "entity no longer available" in the drawer) can
 * fail in isolation. The person drawer hides the pulses section
 * gracefully when this query errors out, instead of blanking the whole
 * drawer.
 */
export const GET_PERSON_OWNED_PULSES = graphql(`
  query getPersonOwnedPulses($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      ownsSpaces {
        ... on WeSpace {
          id
          name
          contexts {
            id
            title
            pulses(
              where: {
                OR: [
                  { initiatedBy_SOME: { id_EQ: $personId } }
                  { createdBy_SOME: { id_EQ: $personId } }
                ]
              }
            ) {
              id
              title
              intensity
            }
          }
        }
      }
    }
  }
`)

/**
 * Pulses a person is directly tied to through the graph, independent of any
 * Space they own: `initiatedPulses` (the INITIATED_BY author edge) and
 * `mentionedIn` (the MENTIONED_IN edge). This is the ONLY way an upload-created
 * PersonPulse's contributions surface — they own no WeSpace, so the
 * owned-space pulse traversal in GET_PERSON_PROFILE always misses them
 * (GOAL-314). Kept in its own query (like GET_PERSON_OWNED_PULSES) so a single
 * malformed pulse — e.g. a NULL title on the non-nullable schema field — fails
 * only this section, not the whole drawer. Each FieldPulse is auth-filtered by
 * its own directive, so a non-member of the parent Space sees empty lists.
 */
export const GET_PERSON_RELATED_PULSES = graphql(`
  query getPersonRelatedPulses($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      initiatedPulses {
        __typename
        id
        title
        intensity
        context {
          id
          title
        }
      }
      mentionedIn {
        __typename
        id
        title
        intensity
        context {
          id
          title
        }
      }
    }
  }
`)

export const GET_RELATED_PEOPLE = graphql(`
  query getRelatedPeople {
    relatedPeople {
      id
      name
      photo
      ownsSpaces {
        id
        name
        visibility
      }
    }
  }
`)

