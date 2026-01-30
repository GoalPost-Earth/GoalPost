import { graphql } from '@/gql'

export const GET_GRAPH_STATS = graphql(`
  query getGraphStats {
    peopleAggregate {
      count
    }
    communitiesAggregate {
      count
    }
    meSpacesAggregate {
      count
    }
    weSpacesAggregate {
      count
    }
    fieldContextsAggregate {
      count
    }
    goalPulsesAggregate {
      count
    }
    resourcePulsesAggregate {
      count
    }
    storyPulsesAggregate {
      count
    }
    fieldResonancesAggregate {
      count
    }
  }
`)

export const GET_GRAPH_PEOPLE = graphql(`
  query getGraphPeople {
    people {
      id
      name
      email
      ownsSpaces {
        id
        ... on MeSpace {
          contexts {
            id
            pulses {
              id
            }
          }
        }
        ... on WeSpace {
          contexts {
            id
            pulses {
              id
            }
          }
        }
      }
    }
  }
`)

export const GET_GRAPH_SPACES = graphql(`
  query getGraphSpaces {
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
        addedAt
        member {
          id
          firstName
          lastName
        }
      }
    }
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
      members {
        id
        role
        addedAt
        member {
          id
          firstName
          lastName
        }
      }
    }
  }
`)

export const GET_GRAPH_RESONANCES = graphql(`
  query getGraphResonances {
    fieldResonances {
      id
      label
      description
    }
  }
`)

export const GET_PERSON_DETAILS = graphql(`
  query getPersonDetails($email: String!) {
    people(where: { email_EQ: $email }) {
      id
      name
      email
      ownsSpaces {
        id
        name
        ... on MeSpace {
          contexts {
            id
            title
            pulses {
              ... on GoalPulse {
                id
                content
                createdAt
                status
                intensity
                createdBy {
                  id
                  firstName
                  lastName
                  email
                }
              }
              ... on ResourcePulse {
                id
                content
                createdAt
                resourceType
                intensity
                createdBy {
                  id
                  firstName
                  lastName
                  email
                }
              }
              ... on StoryPulse {
                id
                content
                createdAt
                intensity
                createdBy {
                  id
                  firstName
                  lastName
                  email
                }
              }
            }
          }
        }
        ... on WeSpace {
          contexts {
            id
            title
            pulses {
              ... on GoalPulse {
                id
                content
                createdAt
                status
                intensity
                createdBy {
                  id
                  firstName
                  lastName
                  email
                }
              }
              ... on ResourcePulse {
                id
                content
                createdAt
                resourceType
                intensity
                createdBy {
                  id
                  firstName
                  lastName
                  email
                }
              }
              ... on StoryPulse {
                id
                content
                createdAt
                intensity
                createdBy {
                  id
                  firstName
                  lastName
                  email
                }
              }
            }
          }
        }
      }
    }
  }
`)

export const GET_SPACE_DETAILS = graphql(`
  query getSpaceDetails($spaceId: ID!) {
    meSpaces(where: { id_EQ: $spaceId }) {
      id
      name
      visibility
      contexts {
        id
        title
        emergentName
        createdAt
        pulses {
          ... on GoalPulse {
            id
            content
            createdAt
            status
            intensity
            createdBy {
              id
              firstName
              lastName
              email
            }
          }
          ... on ResourcePulse {
            id
            content
            createdAt
            resourceType
            intensity
            createdBy {
              id
              firstName
              lastName
              email
            }
          }
          ... on StoryPulse {
            id
            content
            createdAt
            intensity
            createdBy {
              id
              firstName
              lastName
              email
            }
          }
        }
      }
    }
    weSpaces(where: { id_EQ: $spaceId }) {
      id
      name
      visibility
      contexts {
        id
        title
        emergentName
        createdAt
        pulses {
          ... on GoalPulse {
            id
            content
            createdAt
            status
            intensity
            createdBy {
              id
              firstName
              lastName
              email
            }
          }
          ... on ResourcePulse {
            id
            content
            createdAt
            resourceType
            intensity
            createdBy {
              id
              firstName
              lastName
              email
            }
          }
          ... on StoryPulse {
            id
            content
            createdAt
            intensity
            createdBy {
              id
              firstName
              lastName
              email
            }
          }
        }
      }
    }
  }
`)

export const GET_RESONANCE_DETAILS = graphql(`
  query getResonanceDetails($resonanceId: ID!) {
    fieldResonances(where: { id_EQ: $resonanceId }) {
      id
      label
      description
      source {
        ... on GoalPulse {
          id
          content
          createdAt
          status
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
      }
      target {
        ... on GoalPulse {
          id
          content
          createdAt
          status
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`)

export const GET_RESONANCE_WITH_LINKS = graphql(`
  query getResonanceWithLinks($resonanceId: ID!) {
    fieldResonances(where: { id_EQ: $resonanceId }) {
      id
      label
      description
      source {
        __typename
        ... on GoalPulse {
          id
          content
          createdAt
          status
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
      }
      target {
        __typename
        ... on GoalPulse {
          id
          content
          createdAt
          status
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
          createdBy {
            id
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`)

export const GET_ALL_RESONANCES = graphql(`
  query getAllResonances {
    fieldResonances {
      id
      label
      description
    }
  }
`)

/**
 * Query to fetch a specific FieldResonance with its source and target pulses
 * Used when a resonance node is clicked to show connected pulses
 */
export const GET_LINKS_FOR_RESONANCE = graphql(`
  query getLinksForResonance($resonanceId: ID!) {
    fieldResonances(where: { id_EQ: $resonanceId }) {
      id
      label
      description
      confidence
      source {
        __typename
        ... on GoalPulse {
          id
          content
          createdAt
          status
          intensity
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
        }
      }
      target {
        __typename
        ... on GoalPulse {
          id
          content
          createdAt
          status
          intensity
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
        }
      }
    }
  }
`)

export const GET_ALL_RESONANCE_LINKS_WITH_RESONANCES = graphql(`
  query getAllResonanceLinksWithResonances {
    fieldResonances {
      id
      label
      description
      confidence
      source {
        __typename
        ... on GoalPulse {
          id
          content
          createdAt
          status
          intensity
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
        }
      }
      target {
        __typename
        ... on GoalPulse {
          id
          content
          createdAt
          status
          intensity
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
        }
      }
    }
  }
`)
