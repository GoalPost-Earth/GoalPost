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
  }
`)

export const GET_RESONANCE_DETAILS = graphql(`
  query getResonanceDetails($resonanceId: ID!) {
    fieldResonances(where: { id_EQ: $resonanceId }) {
      id
      label
      description
    }
  }
`)
