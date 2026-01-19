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
    resonanceLinksAggregate {
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
        ... on Person {
          id
          name
        }
        ... on Community {
          id
          name
        }
      }
      members {
        ... on Person {
          id
          name
        }
        ... on Community {
          id
          name
        }
      }
    }
    weSpaces {
      id
      name
      visibility
      createdAt
      owner {
        ... on Person {
          id
          name
        }
        ... on Community {
          id
          name
        }
      }
      members {
        ... on Person {
          id
          name
        }
        ... on Community {
          id
          name
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
                initiatedBy {
                  ... on Person {
                    id
                    name
                    email
                  }
                  ... on Community {
                    id
                    name
                  }
                }
              }
              ... on ResourcePulse {
                id
                content
                createdAt
                resourceType
                intensity
                initiatedBy {
                  ... on Person {
                    id
                    name
                    email
                  }
                  ... on Community {
                    id
                    name
                  }
                }
              }
              ... on StoryPulse {
                id
                content
                createdAt
                intensity
                initiatedBy {
                  ... on Person {
                    id
                    name
                    email
                  }
                  ... on Community {
                    id
                    name
                  }
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
                initiatedBy {
                  ... on Person {
                    id
                    name
                    email
                  }
                  ... on Community {
                    id
                    name
                  }
                }
              }
              ... on ResourcePulse {
                id
                content
                createdAt
                resourceType
                intensity
                initiatedBy {
                  ... on Person {
                    id
                    name
                    email
                  }
                  ... on Community {
                    id
                    name
                  }
                }
              }
              ... on StoryPulse {
                id
                content
                createdAt
                intensity
                initiatedBy {
                  ... on Person {
                    id
                    name
                    email
                  }
                  ... on Community {
                    id
                    name
                  }
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
            initiatedBy {
              ... on Person {
                id
                name
                email
              }
              ... on Community {
                id
                name
              }
            }
          }
          ... on ResourcePulse {
            id
            content
            createdAt
            resourceType
            intensity
            initiatedBy {
              ... on Person {
                id
                name
                email
              }
              ... on Community {
                id
                name
              }
            }
          }
          ... on StoryPulse {
            id
            content
            createdAt
            intensity
            initiatedBy {
              ... on Person {
                id
                name
                email
              }
              ... on Community {
                id
                name
              }
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
            initiatedBy {
              ... on Person {
                id
                name
                email
              }
              ... on Community {
                id
                name
              }
            }
          }
          ... on ResourcePulse {
            id
            content
            createdAt
            resourceType
            intensity
            initiatedBy {
              ... on Person {
                id
                name
                email
              }
              ... on Community {
                id
                name
              }
            }
          }
          ... on StoryPulse {
            id
            content
            createdAt
            intensity
            initiatedBy {
              ... on Person {
                id
                name
                email
              }
              ... on Community {
                id
                name
              }
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
    }
    resonanceLinks(where: { resonance_SOME: { id_EQ: $resonanceId } }) {
      id
      confidence
      evidence
      createdAt
      source {
        ... on GoalPulse {
          id
          content
          createdAt
          status
          intensity
          initiatedBy {
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
          }
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
          initiatedBy {
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
          }
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
          initiatedBy {
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
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
          initiatedBy {
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
          }
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
          initiatedBy {
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
          }
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
          initiatedBy {
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
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
    }
    resonanceLinks(where: { resonance_SOME: { id_EQ: $resonanceId } }) {
      id
      confidence
      evidence
      createdAt
      source {
        __typename
        ... on GoalPulse {
          id
          content
          createdAt
          status
          intensity
          initiatedBy {
            __typename
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
          }
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
          initiatedBy {
            __typename
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
          }
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
          initiatedBy {
            __typename
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
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
          initiatedBy {
            __typename
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
          }
        }
        ... on ResourcePulse {
          id
          content
          createdAt
          resourceType
          intensity
          initiatedBy {
            __typename
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
          }
        }
        ... on StoryPulse {
          id
          content
          createdAt
          intensity
          initiatedBy {
            __typename
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
            }
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
 * Query to fetch all ResonanceLinks with their connected FieldResonances
 * This is the primary query for the new three-level resonance page
 * Returns links grouped by their resonance for hierarchical display
 */
export const GET_ALL_RESONANCE_LINKS_WITH_RESONANCES = graphql(`
  query getAllResonanceLinksWithResonances {
    resonanceLinks {
      id
      confidence
      evidence
      createdAt
      resonance {
        id
        label
        description
      }
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

/**
 * Query to fetch resonance links for a specific FieldResonance
 * Used when a resonance node is clicked to show connected links
 */
export const GET_LINKS_FOR_RESONANCE = graphql(`
  query getLinksForResonance($resonanceId: ID!) {
    resonanceLinks(where: { resonance_SOME: { id_EQ: $resonanceId } }) {
      id
      confidence
      evidence
      createdAt
      resonance {
        id
        label
        description
      }
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
