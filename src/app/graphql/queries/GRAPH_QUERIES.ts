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
