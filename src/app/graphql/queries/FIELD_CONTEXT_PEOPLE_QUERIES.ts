import gql from 'graphql-tag'

/**
 * Fetch a field context with people currently attached, plus candidate people from the parent space.
 *
 * GOAL-275: every PII read goes through `privateProfile`, the single
 * type-level gate. It is null for a caller not authorized for that person, and
 * the attach UI falls back to the open directory identity (name / photo).
 *
 * GOAL-346: this is the ONE query behind the People roster on all three of its
 * surfaces — the field-context page, the entity drawer and Bloom — so the
 * `extractionFound` predicate below is the whole roster filter. Document
 * Ingestion and Bulk Article Import both land their people on `HAS_PERSON`,
 * and at import volume they buried the field's actual people; extraction-found
 * people stay reachable on the Document (`Document.extractedPeople`) and a
 * member can promote one into the roster with `addPersonToFieldContext`, which
 * clears the marker.
 *
 * This is a PRESENTATION filter only. The `HAS_PERSON` edge is untouched (ten
 * authorization gates read it) and `loadFieldContextRoster` — the de-dup
 * roster the extractor matches against — deliberately still sees everyone, so
 * filtering here cannot mint duplicate Person nodes on a re-extract.
 */
export const GET_FIELD_CONTEXT_PEOPLE = gql`
  query GetFieldContextPeople($contextId: ID!) {
    fieldContexts(where: { id_EQ: $contextId }) {
      id
      # An explicit OR with the null case, NOT the shorter
      # "NOT: { extractionFound_EQ: true }". That shorter form compiles to
      # "WHERE NOT (p.extractionFound = $param)", and Cypher's three-valued
      # logic makes that NULL — i.e. false — for every person who has no
      # marker at all: it matched 0 of 4 people on dev's North Star field.
      # This form compiles to
      # "WHERE (p.extractionFound = false OR p.extractionFound IS NULL)", so
      # the marker is opt-out — a hand-added person, or anyone predating
      # GOAL-346, stays in the roster and only an explicit true hides them.
      # Pinned by field-context-people-roster-filter.test.ts.
      people(
        where: {
          OR: [{ extractionFound_EQ: false }, { extractionFound_EQ: null }]
        }
      ) {
        id
        firstName
        lastName
        name
        photo
        privateProfile {
          id
          email
          description
          # The current user's relationship to this person lives on the
          # CONNECTED_TO edge; match the edge whose other end is the user.
          connectionEdges {
            connectedPersonId
            why
          }
        }
      }
      meSpace {
        id
        owner {
          id
          firstName
          lastName
          name
          photo
          privateProfile {
            id
            email
          }
        }
        members {
          id
          role
          member {
            id
            firstName
            lastName
            name
            photo
            privateProfile {
              id
              email
            }
          }
        }
      }
      weSpace {
        id
        owner {
          id
          firstName
          lastName
          name
          photo
          privateProfile {
            id
            email
          }
        }
        members {
          id
          role
          member {
            id
            firstName
            lastName
            name
            photo
            privateProfile {
              id
              email
            }
          }
        }
      }
    }
  }
`
