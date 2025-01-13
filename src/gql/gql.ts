/* eslint-disable */
import * as types from './graphql'
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
  '\n  mutation createCarePoints($input: [CarePointCreateInput!]!) {\n    createCarePoints(input: $input) {\n      carePoints {\n        id\n        description\n        status\n      }\n    }\n  }\n':
    types.CreateCarePointsDocument,
  '\n  mutation UpdateCarePoint($id: ID!, $update: CarePointUpdateInput!) {\n    updateCarePoints(where: { id_EQ: $id }, update: $update) {\n      carePoints {\n        id\n        description\n        status\n      }\n    }\n  }\n':
    types.UpdateCarePointDocument,
  '\n  mutation DeleteCarePoint($id: ID!) {\n    deleteCarePoints(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n':
    types.DeleteCarePointDocument,
  '\n  mutation SendMessageToChatbot($message: String!, $sessionId: String) {\n    sendMessageToChatbot(message: $message, sessionId: $sessionId) {\n      sessionId\n      message\n    }\n  }\n':
    types.SendMessageToChatbotDocument,
  '\n  mutation CreateCommunities($input: [CommunityCreateInput!]!) {\n    createCommunities(input: $input) {\n      communities {\n        id\n        name\n        description\n        why\n        location\n        time\n        activities\n        resultsAchieved\n        status\n      }\n    }\n  }\n':
    types.CreateCommunitiesDocument,
  '\n  mutation updateCommunity($id: ID!, $update: CommunityUpdateInput!) {\n    updateCommunities(where: { id_EQ: $id }, update: $update) {\n      communities {\n        id\n        name\n        description\n        why\n        location\n        time\n        activities\n        resultsAchieved\n        status\n      }\n      info {\n        nodesCreated\n        nodesDeleted\n        relationshipsCreated\n        relationshipsDeleted\n      }\n    }\n  }\n':
    types.UpdateCommunityDocument,
  '\n  mutation DeleteCommunity($id: ID!) {\n    deleteCommunities(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n':
    types.DeleteCommunityDocument,
  '\n  mutation CreateCoreValues($input: [CoreValueCreateInput!]!) {\n    createCoreValues(input: $input) {\n      coreValues {\n        id\n        name\n        whoSupports\n        alignmentChallenges\n        alignmentExamples\n        description\n        why\n        createdAt\n      }\n    }\n  }\n':
    types.CreateCoreValuesDocument,
  '\n  mutation UpdateCoreValue($id: ID!, $update: CoreValueUpdateInput!) {\n    updateCoreValues(where: { id_EQ: $id }, update: $update) {\n      coreValues {\n        id\n        name\n        whoSupports\n        alignmentChallenges\n        alignmentExamples\n        description\n        why\n        createdAt\n      }\n    }\n  }\n':
    types.UpdateCoreValueDocument,
  '\n  mutation DeleteCoreValue($id: ID!) {\n    deleteCoreValues(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n':
    types.DeleteCoreValueDocument,
  '\n  mutation createGoals($input: [GoalCreateInput!]!) {\n    createGoals(input: $input) {\n      goals {\n        id\n        name\n        description\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n        coreValues {\n          id\n          name\n          description\n        }\n        motivatesPeople {\n          id\n          name\n          photo\n        }\n        motivatesCommunities {\n          id\n          name\n        }\n        enablesCarePoints {\n          id\n          description\n          status\n        }\n        caredForByCarePoints {\n          id\n          description\n          status\n        }\n        createdBy {\n          id\n          name\n        }\n      }\n    }\n  }\n':
    types.CreateGoalsDocument,
  '\n  mutation updateGoal($id: ID!, $update: GoalUpdateInput!) {\n    updateGoals(where: { id_EQ: $id }, update: $update) {\n      goals {\n        id\n        name\n        description\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n        coreValues {\n          id\n          name\n          description\n        }\n        motivatesPeople {\n          id\n          name\n          photo\n        }\n        motivatesCommunities {\n          id\n          name\n        }\n        enablesCarePoints {\n          id\n          description\n          status\n        }\n        caredForByCarePoints {\n          id\n          description\n          status\n        }\n        createdBy {\n          id\n          name\n        }\n      }\n    }\n  }\n':
    types.UpdateGoalDocument,
  '\n  mutation deleteGoal($id: ID!) {\n    deleteGoals(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n':
    types.DeleteGoalDocument,
  '\n  mutation GeneratePersonEmbeddings($personId: ID!) {\n    generatePersonEmbeddings(personId: $personId)\n  }\n':
    types.GeneratePersonEmbeddingsDocument,
  '\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        firstName\n        lastName\n        email\n        phone\n        photo\n        location\n        pronouns\n      }\n    }\n  }\n':
    types.CreatePeopleDocument,
  '\n  mutation UpdatePerson($where: PersonWhere!, $update: PersonUpdateInput!) {\n    updatePeople(where: $where, update: $update) {\n      people {\n        id\n        firstName\n        lastName\n        name\n        email\n        photo\n        phone\n        pronouns\n\n        status\n        avatar\n        careManual\n        favorites\n        passions\n        traits\n        fieldsOfCare\n        interests\n\n        connectedTo {\n          id\n          name\n          photo\n        }\n        providesResources {\n          id\n          name\n          description\n          status\n        }\n        goals {\n          id\n          name\n          photo\n          status\n          createdAt\n          description\n        }\n        carePoints {\n          id\n          # name\n          description\n        }\n        coreValues {\n          id\n          name\n          description\n        }\n        location\n        createdAt\n\n        communitiesConnection {\n          edges {\n            node {\n              id\n              name\n              members(limit: 3) {\n                id\n                photo\n              }\n              membersAggregate {\n                count\n              }\n              description\n            }\n            properties {\n              totem\n              signupDate\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.UpdatePersonDocument,
  '\n  mutation DeletePerson($id: ID!) {\n    deletePeople(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n':
    types.DeletePersonDocument,
  '\n  mutation CreateResources($input: [ResourceCreateInput!]!) {\n    createResources(input: $input) {\n      resources {\n        id\n        name\n        description\n        status\n        why\n        location\n        time\n        dependsOnResources {\n          id\n          name\n        }\n        carePoints {\n          id\n        }\n      }\n    }\n  }\n':
    types.CreateResourcesDocument,
  '\n  mutation UpdateResource($id: ID!, $update: ResourceUpdateInput!) {\n    updateResources(where: { id_EQ: $id }, update: $update) {\n      resources {\n        id\n        name\n        description\n        status\n        why\n        location\n        time\n        dependsOnResources {\n          id\n          name\n        }\n        carePoints {\n          id\n        }\n      }\n    }\n  }\n':
    types.UpdateResourceDocument,
  '\n  mutation DeleteResource($id: ID!) {\n    deleteResources(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n':
    types.DeleteResourceDocument,
  '\n  query getRecentActions {\n    carePoints(sort: { createdAt: DESC }, limit: 3, where: {}) {\n      createdAt\n      description\n      id\n      status\n      createdBy {\n        photo\n        name\n        id\n      }\n    }\n    goals(sort: { createdAt: DESC }, limit: 3) {\n      createdAt\n      id\n      description\n      photo\n      status\n      name\n      createdBy {\n        name\n        id\n        photo\n      }\n    }\n    resources(limit: 3, sort: { createdAt: DESC }) {\n      providedByPerson {\n        name\n        photo\n        id\n      }\n      name\n      id\n      status\n      description\n      createdAt\n    }\n    coreValues(limit: 3, sort: { createdAt: DESC }) {\n      isEmbracedBy {\n        name\n        id\n        photo\n      }\n      description\n      id\n      name\n      createdAt\n    }\n    communities(where: { members_SOME: { NOT: null } }, limit: 3, sort: {}) {\n      name\n      members(limit: 3, sort: { createdAt: DESC }) {\n        id\n        name\n        photo\n        createdAt\n      }\n    }\n  }\n':
    types.GetRecentActionsDocument,
  '\n  query getCarePoint($id: ID!) {\n    carePoints(where: { id_EQ: $id }) {\n      id\n      description\n      status\n      resources {\n        id\n        name\n      }\n      enabledByGoals {\n        id\n        name\n        photo\n        status\n        createdAt\n        description\n      }\n      caresForGoals {\n        id\n        name\n        photo\n        status\n        createdAt\n        description\n      }\n      createdAt\n      createdBy {\n        id\n        name\n        photo\n      }\n    }\n  }\n':
    types.GetCarePointDocument,
  '\n  query getAllCarePoints($where: CarePointWhere) {\n    carePoints(where: $where) {\n      id\n      description\n      status\n\n      createdAt\n      createdBy {\n        id\n        name\n        photo\n      }\n      enabledByGoals {\n        name\n        id\n      }\n    }\n  }\n':
    types.GetAllCarePointsDocument,
  '\n  query getCommunity($id: ID!) {\n    communities(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      why\n      location\n      time\n      activities\n      resultsAchieved\n      status\n\n      relatedCommunities {\n        id\n        name\n        description\n        members(limit: 5) {\n          id\n          name\n          photo\n        }\n      }\n\n      members {\n        id\n        name\n        photo\n      }\n\n      resources {\n        id\n        name\n        description\n        status\n        providedByPerson(limit: 1) {\n          id\n          name\n          photo\n        }\n      }\n\n      createdBy {\n        id\n        name\n        photo\n      }\n    }\n  }\n':
    types.GetCommunityDocument,
  '\n  query getAllCommunites($where: CommunityWhere) {\n    communities(where: $where) {\n      id\n      name\n      description\n      why\n      location\n      time\n      activities\n      resultsAchieved\n      status\n      createdBy {\n        id\n        name\n        photo\n      }\n      members {\n        id\n        name\n        photo\n      }\n      relatedCommunities {\n        id\n        name\n      }\n    }\n  }\n':
    types.GetAllCommunitesDocument,
  '\n  query getCommunitiesAndTheirMembers {\n    communities(where: { members_SOME: { NOT: { id_EQ: "" } } }) {\n      id\n      name\n      members {\n        email\n        name\n        id\n        photo\n      }\n    }\n  }\n':
    types.GetCommunitiesAndTheirMembersDocument,
  '\n  query getPeopleNotInCommunities {\n    people(where: { communitiesAggregate: { count_EQ: 0 } }) {\n      id\n      name\n      photo\n      email\n    }\n  }\n':
    types.GetPeopleNotInCommunitiesDocument,
  '\n  query getCoreValue($id: ID!) {\n    coreValues(where: { id_EQ: $id }) {\n      id\n      name\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      isEmbracedBy {\n        id\n        name\n      }\n      createdAt\n      createdBy {\n        id\n        name\n        photo\n      }\n    }\n  }\n':
    types.GetCoreValueDocument,
  '\n  query getAllCoreValues($where: CoreValueWhere) {\n    coreValues(where: $where) {\n      id\n      name\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      # createdAt\n      isEmbracedBy {\n        goals {\n          id\n          name\n        }\n      }\n    }\n  }\n':
    types.GetAllCoreValuesDocument,
  '\n  query getLoggedInUser($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      authId\n      firstName\n      lastName\n      name\n      email\n      photo\n      createdAt\n      connectedTo {\n        id\n        name\n        photo\n      }\n      communities {\n        id\n        name\n        members {\n          id\n          name\n          photo\n        }\n      }\n    }\n  }\n':
    types.GetLoggedInUserDocument,
  '\n  query getGoal($id: ID!) {\n    goals(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      coreValues {\n        id\n        name\n        description\n      }\n      motivatesPeople {\n        id\n        name\n        photo\n      }\n      motivatesCommunities {\n        id\n        name\n      }\n      enablesCarePoints {\n        id\n        description\n        status\n      }\n      caredForByCarePoints {\n        id\n        description\n        status\n      }\n      createdBy {\n        id\n        name\n      }\n    }\n  }\n':
    types.GetGoalDocument,
  '\n  query getAllGoals($where: GoalWhere) {\n    goals(where: $where) {\n      id\n      name\n      description\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      motivatesPeople {\n        id\n        name\n        photo\n      }\n    }\n  }\n':
    types.GetAllGoalsDocument,
  '\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      pronouns\n\n      status\n      avatar\n      careManual\n      favorites\n      passions\n      traits\n      fieldsOfCare\n      interests\n\n      connectedTo {\n        id\n        name\n        photo\n      }\n      providesResources {\n        id\n        name\n        description\n        status\n      }\n      goals {\n        id\n        name\n        photo\n        status\n        createdAt\n        description\n      }\n      carePoints {\n        id\n        # name\n        description\n      }\n      coreValues {\n        id\n        name\n        description\n      }\n      location\n      createdAt\n\n      communitiesConnection {\n        edges {\n          node {\n            id\n            name\n            description\n            members(limit: 3) {\n              id\n              photo\n            }\n            membersAggregate {\n              count\n            }\n            description\n          }\n          properties {\n            totem\n            signupDate\n          }\n        }\n      }\n    }\n  }\n':
    types.GetPersonDocument,
  '\n  query getAllPeople($where: PersonWhere) {\n    people(where: $where) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      pronouns\n      location\n      # createdAt\n      connectedTo {\n        id\n        name\n      }\n      communities {\n        name\n        id\n      }\n      goals {\n        id\n        name\n      }\n      coreValues {\n        name\n        id\n      }\n      providesResources {\n        name\n        id\n      }\n    }\n  }\n':
    types.GetAllPeopleDocument,
  '\n  query getPeopleAndTheirGoals($personWhere: PersonWhere, $goalLimit: Int) {\n    people(where: $personWhere) {\n      id\n      name\n      photo\n      goals(limit: $goalLimit) {\n        id\n        name\n        description\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n      }\n    }\n  }\n':
    types.GetPeopleAndTheirGoalsDocument,
  '\n  query getPeopleAndTheirResources {\n    people(where: { providesResources_SOME: { NOT: { id_EQ: "" } } }) {\n      name\n      photo\n      id\n      providesResources {\n        name\n        id\n        description\n        status\n        providedByPerson {\n          name\n          id\n          photo\n        }\n      }\n    }\n  }\n':
    types.GetPeopleAndTheirResourcesDocument,
  '\n  query getPeopleAndTheirCoreValues {\n    people(where: { coreValues_SOME: { NOT: { id_EQ: "" } } }) {\n      coreValues {\n        isEmbracedBy {\n          id\n          name\n          photo\n        }\n        id\n        description\n        name\n      }\n      id\n      name\n      photo\n    }\n  }\n':
    types.GetPeopleAndTheirCoreValuesDocument,
  '\n  query getResource($id: ID!) {\n    resources(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResources {\n        id\n        name\n      }\n      carePoints {\n        id\n        description\n        status\n      }\n      providedByPerson {\n        id\n        name\n        email\n        phone\n        photo\n      }\n    }\n  }\n':
    types.GetResourceDocument,
  '\n  query getAllResources($where: ResourceWhere) {\n    resources(where: $where) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResources {\n        id\n        name\n      }\n      carePoints {\n        id\n      }\n      providedByPerson {\n        id\n        name\n        phone\n        photo\n      }\n    }\n  }\n':
    types.GetAllResourcesDocument,
  '\n  query getMatchingEntities($key: String!) {\n    carePointSubstringSearch(key: $key) {\n      id\n      description\n    }\n    communitySubstringSearch(key: $key) {\n      id\n      name\n      description\n      members {\n        photo\n      }\n    }\n    coreValueSubstringSearch(key: $key) {\n      description\n      id\n      name\n    }\n    peopleSubstringSearch(key: $key) {\n      id\n      name\n      photo\n    }\n    resourceSubstringSearch(key: $key) {\n      name\n      id\n      description\n      status\n      providedByPerson {\n        name\n        id\n        photo\n      }\n    }\n    goalSubstringSearch(key: $key) {\n      id\n      photo\n      description\n      name\n      status\n      createdAt\n    }\n  }\n':
    types.GetMatchingEntitiesDocument,
}

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createCarePoints($input: [CarePointCreateInput!]!) {\n    createCarePoints(input: $input) {\n      carePoints {\n        id\n        description\n        status\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation createCarePoints($input: [CarePointCreateInput!]!) {\n    createCarePoints(input: $input) {\n      carePoints {\n        id\n        description\n        status\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateCarePoint($id: ID!, $update: CarePointUpdateInput!) {\n    updateCarePoints(where: { id_EQ: $id }, update: $update) {\n      carePoints {\n        id\n        description\n        status\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation UpdateCarePoint($id: ID!, $update: CarePointUpdateInput!) {\n    updateCarePoints(where: { id_EQ: $id }, update: $update) {\n      carePoints {\n        id\n        description\n        status\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteCarePoint($id: ID!) {\n    deleteCarePoints(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n'
): (typeof documents)['\n  mutation DeleteCarePoint($id: ID!) {\n    deleteCarePoints(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation SendMessageToChatbot($message: String!, $sessionId: String) {\n    sendMessageToChatbot(message: $message, sessionId: $sessionId) {\n      sessionId\n      message\n    }\n  }\n'
): (typeof documents)['\n  mutation SendMessageToChatbot($message: String!, $sessionId: String) {\n    sendMessageToChatbot(message: $message, sessionId: $sessionId) {\n      sessionId\n      message\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateCommunities($input: [CommunityCreateInput!]!) {\n    createCommunities(input: $input) {\n      communities {\n        id\n        name\n        description\n        why\n        location\n        time\n        activities\n        resultsAchieved\n        status\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreateCommunities($input: [CommunityCreateInput!]!) {\n    createCommunities(input: $input) {\n      communities {\n        id\n        name\n        description\n        why\n        location\n        time\n        activities\n        resultsAchieved\n        status\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation updateCommunity($id: ID!, $update: CommunityUpdateInput!) {\n    updateCommunities(where: { id_EQ: $id }, update: $update) {\n      communities {\n        id\n        name\n        description\n        why\n        location\n        time\n        activities\n        resultsAchieved\n        status\n      }\n      info {\n        nodesCreated\n        nodesDeleted\n        relationshipsCreated\n        relationshipsDeleted\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation updateCommunity($id: ID!, $update: CommunityUpdateInput!) {\n    updateCommunities(where: { id_EQ: $id }, update: $update) {\n      communities {\n        id\n        name\n        description\n        why\n        location\n        time\n        activities\n        resultsAchieved\n        status\n      }\n      info {\n        nodesCreated\n        nodesDeleted\n        relationshipsCreated\n        relationshipsDeleted\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteCommunity($id: ID!) {\n    deleteCommunities(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n'
): (typeof documents)['\n  mutation DeleteCommunity($id: ID!) {\n    deleteCommunities(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateCoreValues($input: [CoreValueCreateInput!]!) {\n    createCoreValues(input: $input) {\n      coreValues {\n        id\n        name\n        whoSupports\n        alignmentChallenges\n        alignmentExamples\n        description\n        why\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreateCoreValues($input: [CoreValueCreateInput!]!) {\n    createCoreValues(input: $input) {\n      coreValues {\n        id\n        name\n        whoSupports\n        alignmentChallenges\n        alignmentExamples\n        description\n        why\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateCoreValue($id: ID!, $update: CoreValueUpdateInput!) {\n    updateCoreValues(where: { id_EQ: $id }, update: $update) {\n      coreValues {\n        id\n        name\n        whoSupports\n        alignmentChallenges\n        alignmentExamples\n        description\n        why\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation UpdateCoreValue($id: ID!, $update: CoreValueUpdateInput!) {\n    updateCoreValues(where: { id_EQ: $id }, update: $update) {\n      coreValues {\n        id\n        name\n        whoSupports\n        alignmentChallenges\n        alignmentExamples\n        description\n        why\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteCoreValue($id: ID!) {\n    deleteCoreValues(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n'
): (typeof documents)['\n  mutation DeleteCoreValue($id: ID!) {\n    deleteCoreValues(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createGoals($input: [GoalCreateInput!]!) {\n    createGoals(input: $input) {\n      goals {\n        id\n        name\n        description\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n        coreValues {\n          id\n          name\n          description\n        }\n        motivatesPeople {\n          id\n          name\n          photo\n        }\n        motivatesCommunities {\n          id\n          name\n        }\n        enablesCarePoints {\n          id\n          description\n          status\n        }\n        caredForByCarePoints {\n          id\n          description\n          status\n        }\n        createdBy {\n          id\n          name\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation createGoals($input: [GoalCreateInput!]!) {\n    createGoals(input: $input) {\n      goals {\n        id\n        name\n        description\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n        coreValues {\n          id\n          name\n          description\n        }\n        motivatesPeople {\n          id\n          name\n          photo\n        }\n        motivatesCommunities {\n          id\n          name\n        }\n        enablesCarePoints {\n          id\n          description\n          status\n        }\n        caredForByCarePoints {\n          id\n          description\n          status\n        }\n        createdBy {\n          id\n          name\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation updateGoal($id: ID!, $update: GoalUpdateInput!) {\n    updateGoals(where: { id_EQ: $id }, update: $update) {\n      goals {\n        id\n        name\n        description\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n        coreValues {\n          id\n          name\n          description\n        }\n        motivatesPeople {\n          id\n          name\n          photo\n        }\n        motivatesCommunities {\n          id\n          name\n        }\n        enablesCarePoints {\n          id\n          description\n          status\n        }\n        caredForByCarePoints {\n          id\n          description\n          status\n        }\n        createdBy {\n          id\n          name\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation updateGoal($id: ID!, $update: GoalUpdateInput!) {\n    updateGoals(where: { id_EQ: $id }, update: $update) {\n      goals {\n        id\n        name\n        description\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n        coreValues {\n          id\n          name\n          description\n        }\n        motivatesPeople {\n          id\n          name\n          photo\n        }\n        motivatesCommunities {\n          id\n          name\n        }\n        enablesCarePoints {\n          id\n          description\n          status\n        }\n        caredForByCarePoints {\n          id\n          description\n          status\n        }\n        createdBy {\n          id\n          name\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteGoal($id: ID!) {\n    deleteGoals(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n'
): (typeof documents)['\n  mutation deleteGoal($id: ID!) {\n    deleteGoals(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation GeneratePersonEmbeddings($personId: ID!) {\n    generatePersonEmbeddings(personId: $personId)\n  }\n'
): (typeof documents)['\n  mutation GeneratePersonEmbeddings($personId: ID!) {\n    generatePersonEmbeddings(personId: $personId)\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        firstName\n        lastName\n        email\n        phone\n        photo\n        location\n        pronouns\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        firstName\n        lastName\n        email\n        phone\n        photo\n        location\n        pronouns\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdatePerson($where: PersonWhere!, $update: PersonUpdateInput!) {\n    updatePeople(where: $where, update: $update) {\n      people {\n        id\n        firstName\n        lastName\n        name\n        email\n        photo\n        phone\n        pronouns\n\n        status\n        avatar\n        careManual\n        favorites\n        passions\n        traits\n        fieldsOfCare\n        interests\n\n        connectedTo {\n          id\n          name\n          photo\n        }\n        providesResources {\n          id\n          name\n          description\n          status\n        }\n        goals {\n          id\n          name\n          photo\n          status\n          createdAt\n          description\n        }\n        carePoints {\n          id\n          # name\n          description\n        }\n        coreValues {\n          id\n          name\n          description\n        }\n        location\n        createdAt\n\n        communitiesConnection {\n          edges {\n            node {\n              id\n              name\n              members(limit: 3) {\n                id\n                photo\n              }\n              membersAggregate {\n                count\n              }\n              description\n            }\n            properties {\n              totem\n              signupDate\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation UpdatePerson($where: PersonWhere!, $update: PersonUpdateInput!) {\n    updatePeople(where: $where, update: $update) {\n      people {\n        id\n        firstName\n        lastName\n        name\n        email\n        photo\n        phone\n        pronouns\n\n        status\n        avatar\n        careManual\n        favorites\n        passions\n        traits\n        fieldsOfCare\n        interests\n\n        connectedTo {\n          id\n          name\n          photo\n        }\n        providesResources {\n          id\n          name\n          description\n          status\n        }\n        goals {\n          id\n          name\n          photo\n          status\n          createdAt\n          description\n        }\n        carePoints {\n          id\n          # name\n          description\n        }\n        coreValues {\n          id\n          name\n          description\n        }\n        location\n        createdAt\n\n        communitiesConnection {\n          edges {\n            node {\n              id\n              name\n              members(limit: 3) {\n                id\n                photo\n              }\n              membersAggregate {\n                count\n              }\n              description\n            }\n            properties {\n              totem\n              signupDate\n            }\n          }\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeletePerson($id: ID!) {\n    deletePeople(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n'
): (typeof documents)['\n  mutation DeletePerson($id: ID!) {\n    deletePeople(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateResources($input: [ResourceCreateInput!]!) {\n    createResources(input: $input) {\n      resources {\n        id\n        name\n        description\n        status\n        why\n        location\n        time\n        dependsOnResources {\n          id\n          name\n        }\n        carePoints {\n          id\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreateResources($input: [ResourceCreateInput!]!) {\n    createResources(input: $input) {\n      resources {\n        id\n        name\n        description\n        status\n        why\n        location\n        time\n        dependsOnResources {\n          id\n          name\n        }\n        carePoints {\n          id\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateResource($id: ID!, $update: ResourceUpdateInput!) {\n    updateResources(where: { id_EQ: $id }, update: $update) {\n      resources {\n        id\n        name\n        description\n        status\n        why\n        location\n        time\n        dependsOnResources {\n          id\n          name\n        }\n        carePoints {\n          id\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation UpdateResource($id: ID!, $update: ResourceUpdateInput!) {\n    updateResources(where: { id_EQ: $id }, update: $update) {\n      resources {\n        id\n        name\n        description\n        status\n        why\n        location\n        time\n        dependsOnResources {\n          id\n          name\n        }\n        carePoints {\n          id\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteResource($id: ID!) {\n    deleteResources(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n'
): (typeof documents)['\n  mutation DeleteResource($id: ID!) {\n    deleteResources(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getRecentActions {\n    carePoints(sort: { createdAt: DESC }, limit: 3, where: {}) {\n      createdAt\n      description\n      id\n      status\n      createdBy {\n        photo\n        name\n        id\n      }\n    }\n    goals(sort: { createdAt: DESC }, limit: 3) {\n      createdAt\n      id\n      description\n      photo\n      status\n      name\n      createdBy {\n        name\n        id\n        photo\n      }\n    }\n    resources(limit: 3, sort: { createdAt: DESC }) {\n      providedByPerson {\n        name\n        photo\n        id\n      }\n      name\n      id\n      status\n      description\n      createdAt\n    }\n    coreValues(limit: 3, sort: { createdAt: DESC }) {\n      isEmbracedBy {\n        name\n        id\n        photo\n      }\n      description\n      id\n      name\n      createdAt\n    }\n    communities(where: { members_SOME: { NOT: null } }, limit: 3, sort: {}) {\n      name\n      members(limit: 3, sort: { createdAt: DESC }) {\n        id\n        name\n        photo\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getRecentActions {\n    carePoints(sort: { createdAt: DESC }, limit: 3, where: {}) {\n      createdAt\n      description\n      id\n      status\n      createdBy {\n        photo\n        name\n        id\n      }\n    }\n    goals(sort: { createdAt: DESC }, limit: 3) {\n      createdAt\n      id\n      description\n      photo\n      status\n      name\n      createdBy {\n        name\n        id\n        photo\n      }\n    }\n    resources(limit: 3, sort: { createdAt: DESC }) {\n      providedByPerson {\n        name\n        photo\n        id\n      }\n      name\n      id\n      status\n      description\n      createdAt\n    }\n    coreValues(limit: 3, sort: { createdAt: DESC }) {\n      isEmbracedBy {\n        name\n        id\n        photo\n      }\n      description\n      id\n      name\n      createdAt\n    }\n    communities(where: { members_SOME: { NOT: null } }, limit: 3, sort: {}) {\n      name\n      members(limit: 3, sort: { createdAt: DESC }) {\n        id\n        name\n        photo\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCarePoint($id: ID!) {\n    carePoints(where: { id_EQ: $id }) {\n      id\n      description\n      status\n      resources {\n        id\n        name\n      }\n      enabledByGoals {\n        id\n        name\n        photo\n        status\n        createdAt\n        description\n      }\n      caresForGoals {\n        id\n        name\n        photo\n        status\n        createdAt\n        description\n      }\n      createdAt\n      createdBy {\n        id\n        name\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getCarePoint($id: ID!) {\n    carePoints(where: { id_EQ: $id }) {\n      id\n      description\n      status\n      resources {\n        id\n        name\n      }\n      enabledByGoals {\n        id\n        name\n        photo\n        status\n        createdAt\n        description\n      }\n      caresForGoals {\n        id\n        name\n        photo\n        status\n        createdAt\n        description\n      }\n      createdAt\n      createdBy {\n        id\n        name\n        photo\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllCarePoints($where: CarePointWhere) {\n    carePoints(where: $where) {\n      id\n      description\n      status\n\n      createdAt\n      createdBy {\n        id\n        name\n        photo\n      }\n      enabledByGoals {\n        name\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllCarePoints($where: CarePointWhere) {\n    carePoints(where: $where) {\n      id\n      description\n      status\n\n      createdAt\n      createdBy {\n        id\n        name\n        photo\n      }\n      enabledByGoals {\n        name\n        id\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCommunity($id: ID!) {\n    communities(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      why\n      location\n      time\n      activities\n      resultsAchieved\n      status\n\n      relatedCommunities {\n        id\n        name\n        description\n        members(limit: 5) {\n          id\n          name\n          photo\n        }\n      }\n\n      members {\n        id\n        name\n        photo\n      }\n\n      resources {\n        id\n        name\n        description\n        status\n        providedByPerson(limit: 1) {\n          id\n          name\n          photo\n        }\n      }\n\n      createdBy {\n        id\n        name\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getCommunity($id: ID!) {\n    communities(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      why\n      location\n      time\n      activities\n      resultsAchieved\n      status\n\n      relatedCommunities {\n        id\n        name\n        description\n        members(limit: 5) {\n          id\n          name\n          photo\n        }\n      }\n\n      members {\n        id\n        name\n        photo\n      }\n\n      resources {\n        id\n        name\n        description\n        status\n        providedByPerson(limit: 1) {\n          id\n          name\n          photo\n        }\n      }\n\n      createdBy {\n        id\n        name\n        photo\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllCommunites($where: CommunityWhere) {\n    communities(where: $where) {\n      id\n      name\n      description\n      why\n      location\n      time\n      activities\n      resultsAchieved\n      status\n      createdBy {\n        id\n        name\n        photo\n      }\n      members {\n        id\n        name\n        photo\n      }\n      relatedCommunities {\n        id\n        name\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllCommunites($where: CommunityWhere) {\n    communities(where: $where) {\n      id\n      name\n      description\n      why\n      location\n      time\n      activities\n      resultsAchieved\n      status\n      createdBy {\n        id\n        name\n        photo\n      }\n      members {\n        id\n        name\n        photo\n      }\n      relatedCommunities {\n        id\n        name\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCommunitiesAndTheirMembers {\n    communities(where: { members_SOME: { NOT: { id_EQ: "" } } }) {\n      id\n      name\n      members {\n        email\n        name\n        id\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getCommunitiesAndTheirMembers {\n    communities(where: { members_SOME: { NOT: { id_EQ: "" } } }) {\n      id\n      name\n      members {\n        email\n        name\n        id\n        photo\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPeopleNotInCommunities {\n    people(where: { communitiesAggregate: { count_EQ: 0 } }) {\n      id\n      name\n      photo\n      email\n    }\n  }\n'
): (typeof documents)['\n  query getPeopleNotInCommunities {\n    people(where: { communitiesAggregate: { count_EQ: 0 } }) {\n      id\n      name\n      photo\n      email\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCoreValue($id: ID!) {\n    coreValues(where: { id_EQ: $id }) {\n      id\n      name\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      isEmbracedBy {\n        id\n        name\n      }\n      createdAt\n      createdBy {\n        id\n        name\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getCoreValue($id: ID!) {\n    coreValues(where: { id_EQ: $id }) {\n      id\n      name\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      isEmbracedBy {\n        id\n        name\n      }\n      createdAt\n      createdBy {\n        id\n        name\n        photo\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllCoreValues($where: CoreValueWhere) {\n    coreValues(where: $where) {\n      id\n      name\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      # createdAt\n      isEmbracedBy {\n        goals {\n          id\n          name\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllCoreValues($where: CoreValueWhere) {\n    coreValues(where: $where) {\n      id\n      name\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      # createdAt\n      isEmbracedBy {\n        goals {\n          id\n          name\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getLoggedInUser($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      authId\n      firstName\n      lastName\n      name\n      email\n      photo\n      createdAt\n      connectedTo {\n        id\n        name\n        photo\n      }\n      communities {\n        id\n        name\n        members {\n          id\n          name\n          photo\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getLoggedInUser($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      authId\n      firstName\n      lastName\n      name\n      email\n      photo\n      createdAt\n      connectedTo {\n        id\n        name\n        photo\n      }\n      communities {\n        id\n        name\n        members {\n          id\n          name\n          photo\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getGoal($id: ID!) {\n    goals(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      coreValues {\n        id\n        name\n        description\n      }\n      motivatesPeople {\n        id\n        name\n        photo\n      }\n      motivatesCommunities {\n        id\n        name\n      }\n      enablesCarePoints {\n        id\n        description\n        status\n      }\n      caredForByCarePoints {\n        id\n        description\n        status\n      }\n      createdBy {\n        id\n        name\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getGoal($id: ID!) {\n    goals(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      coreValues {\n        id\n        name\n        description\n      }\n      motivatesPeople {\n        id\n        name\n        photo\n      }\n      motivatesCommunities {\n        id\n        name\n      }\n      enablesCarePoints {\n        id\n        description\n        status\n      }\n      caredForByCarePoints {\n        id\n        description\n        status\n      }\n      createdBy {\n        id\n        name\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllGoals($where: GoalWhere) {\n    goals(where: $where) {\n      id\n      name\n      description\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      motivatesPeople {\n        id\n        name\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllGoals($where: GoalWhere) {\n    goals(where: $where) {\n      id\n      name\n      description\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      motivatesPeople {\n        id\n        name\n        photo\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      pronouns\n\n      status\n      avatar\n      careManual\n      favorites\n      passions\n      traits\n      fieldsOfCare\n      interests\n\n      connectedTo {\n        id\n        name\n        photo\n      }\n      providesResources {\n        id\n        name\n        description\n        status\n      }\n      goals {\n        id\n        name\n        photo\n        status\n        createdAt\n        description\n      }\n      carePoints {\n        id\n        # name\n        description\n      }\n      coreValues {\n        id\n        name\n        description\n      }\n      location\n      createdAt\n\n      communitiesConnection {\n        edges {\n          node {\n            id\n            name\n            description\n            members(limit: 3) {\n              id\n              photo\n            }\n            membersAggregate {\n              count\n            }\n            description\n          }\n          properties {\n            totem\n            signupDate\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      pronouns\n\n      status\n      avatar\n      careManual\n      favorites\n      passions\n      traits\n      fieldsOfCare\n      interests\n\n      connectedTo {\n        id\n        name\n        photo\n      }\n      providesResources {\n        id\n        name\n        description\n        status\n      }\n      goals {\n        id\n        name\n        photo\n        status\n        createdAt\n        description\n      }\n      carePoints {\n        id\n        # name\n        description\n      }\n      coreValues {\n        id\n        name\n        description\n      }\n      location\n      createdAt\n\n      communitiesConnection {\n        edges {\n          node {\n            id\n            name\n            description\n            members(limit: 3) {\n              id\n              photo\n            }\n            membersAggregate {\n              count\n            }\n            description\n          }\n          properties {\n            totem\n            signupDate\n          }\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllPeople($where: PersonWhere) {\n    people(where: $where) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      pronouns\n      location\n      # createdAt\n      connectedTo {\n        id\n        name\n      }\n      communities {\n        name\n        id\n      }\n      goals {\n        id\n        name\n      }\n      coreValues {\n        name\n        id\n      }\n      providesResources {\n        name\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllPeople($where: PersonWhere) {\n    people(where: $where) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      pronouns\n      location\n      # createdAt\n      connectedTo {\n        id\n        name\n      }\n      communities {\n        name\n        id\n      }\n      goals {\n        id\n        name\n      }\n      coreValues {\n        name\n        id\n      }\n      providesResources {\n        name\n        id\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPeopleAndTheirGoals($personWhere: PersonWhere, $goalLimit: Int) {\n    people(where: $personWhere) {\n      id\n      name\n      photo\n      goals(limit: $goalLimit) {\n        id\n        name\n        description\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPeopleAndTheirGoals($personWhere: PersonWhere, $goalLimit: Int) {\n    people(where: $personWhere) {\n      id\n      name\n      photo\n      goals(limit: $goalLimit) {\n        id\n        name\n        description\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPeopleAndTheirResources {\n    people(where: { providesResources_SOME: { NOT: { id_EQ: "" } } }) {\n      name\n      photo\n      id\n      providesResources {\n        name\n        id\n        description\n        status\n        providedByPerson {\n          name\n          id\n          photo\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPeopleAndTheirResources {\n    people(where: { providesResources_SOME: { NOT: { id_EQ: "" } } }) {\n      name\n      photo\n      id\n      providesResources {\n        name\n        id\n        description\n        status\n        providedByPerson {\n          name\n          id\n          photo\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPeopleAndTheirCoreValues {\n    people(where: { coreValues_SOME: { NOT: { id_EQ: "" } } }) {\n      coreValues {\n        isEmbracedBy {\n          id\n          name\n          photo\n        }\n        id\n        description\n        name\n      }\n      id\n      name\n      photo\n    }\n  }\n'
): (typeof documents)['\n  query getPeopleAndTheirCoreValues {\n    people(where: { coreValues_SOME: { NOT: { id_EQ: "" } } }) {\n      coreValues {\n        isEmbracedBy {\n          id\n          name\n          photo\n        }\n        id\n        description\n        name\n      }\n      id\n      name\n      photo\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getResource($id: ID!) {\n    resources(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResources {\n        id\n        name\n      }\n      carePoints {\n        id\n        description\n        status\n      }\n      providedByPerson {\n        id\n        name\n        email\n        phone\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getResource($id: ID!) {\n    resources(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResources {\n        id\n        name\n      }\n      carePoints {\n        id\n        description\n        status\n      }\n      providedByPerson {\n        id\n        name\n        email\n        phone\n        photo\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllResources($where: ResourceWhere) {\n    resources(where: $where) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResources {\n        id\n        name\n      }\n      carePoints {\n        id\n      }\n      providedByPerson {\n        id\n        name\n        phone\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllResources($where: ResourceWhere) {\n    resources(where: $where) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResources {\n        id\n        name\n      }\n      carePoints {\n        id\n      }\n      providedByPerson {\n        id\n        name\n        phone\n        photo\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getMatchingEntities($key: String!) {\n    carePointSubstringSearch(key: $key) {\n      id\n      description\n    }\n    communitySubstringSearch(key: $key) {\n      id\n      name\n      description\n      members {\n        photo\n      }\n    }\n    coreValueSubstringSearch(key: $key) {\n      description\n      id\n      name\n    }\n    peopleSubstringSearch(key: $key) {\n      id\n      name\n      photo\n    }\n    resourceSubstringSearch(key: $key) {\n      name\n      id\n      description\n      status\n      providedByPerson {\n        name\n        id\n        photo\n      }\n    }\n    goalSubstringSearch(key: $key) {\n      id\n      photo\n      description\n      name\n      status\n      createdAt\n    }\n  }\n'
): (typeof documents)['\n  query getMatchingEntities($key: String!) {\n    carePointSubstringSearch(key: $key) {\n      id\n      description\n    }\n    communitySubstringSearch(key: $key) {\n      id\n      name\n      description\n      members {\n        photo\n      }\n    }\n    coreValueSubstringSearch(key: $key) {\n      description\n      id\n      name\n    }\n    peopleSubstringSearch(key: $key) {\n      id\n      name\n      photo\n    }\n    resourceSubstringSearch(key: $key) {\n      name\n      id\n      description\n      status\n      providedByPerson {\n        name\n        id\n        photo\n      }\n    }\n    goalSubstringSearch(key: $key) {\n      id\n      photo\n      description\n      name\n      status\n      createdAt\n    }\n  }\n']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
