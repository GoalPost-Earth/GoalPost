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
  '\n  mutation CreateCoreValues($input: [CoreValueCreateInput!]!) {\n    createCoreValues(input: $input) {\n      coreValues {\n        id\n        name\n        caresFor\n        whoSupports\n        alignmentChallenges\n        alignmentExamples\n        description\n        why\n        createdAt\n      }\n    }\n  }\n':
    types.CreateCoreValuesDocument,
  '\n  mutation CreateGoals($input: [GoalCreateInput!]!) {\n    createGoals(input: $input) {\n      goals {\n        id\n        name\n        type\n        description\n        caresFor\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n      }\n    }\n  }\n':
    types.CreateGoalsDocument,
  '\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        firstName\n        lastName\n        email\n        phone\n        location\n        manual\n        interests\n        pronouns\n      }\n    }\n  }\n':
    types.CreatePeopleDocument,
  '\n  mutation CreateMembers($input: [MemberCreateInput!]!) {\n    createMembers(input: $input) {\n      members {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n':
    types.CreateMembersDocument,
  '\n  mutation CreateResources($input: [ResourceCreateInput!]!) {\n    createResources(input: $input) {\n      resources {\n        id\n        name\n        description\n        status\n        why\n        location\n        time\n        dependsOnResource {\n          id\n          name\n        }\n        appliedToCarePoint {\n          id\n        }\n      }\n    }\n  }\n':
    types.CreateResourcesDocument,
  '\n  query getCoreValue($id: ID!) {\n    coreValues(where: { id_EQ: $id }) {\n      id\n      name\n      caresFor\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      guidesPerson {\n        id\n        name\n      }\n      # createdAt\n    }\n  }\n':
    types.GetCoreValueDocument,
  '\n  query getAllCoreValues($where: CoreValueWhere) {\n    coreValues(where: $where) {\n      id\n      name\n      caresFor\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      # createdAt\n    }\n  }\n':
    types.GetAllCoreValuesDocument,
  '\n  query getLoggedInUser($email: String!) {\n    members(where: { email_EQ: $email }) {\n      id\n      firstName\n      lastName\n      email\n      community {\n        id\n        name\n        hasMembers {\n          id\n          name\n          photo\n        }\n      }\n    }\n  }\n':
    types.GetLoggedInUserDocument,
  '\n  query getGoal($id: ID!) {\n    goals(where: { id_EQ: $id }) {\n      id\n      name\n      type\n      description\n      caresFor\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      motivatesPerson {\n        id\n        name\n        photo\n      }\n    }\n  }\n':
    types.GetGoalDocument,
  '\n  query getAllGoals($where: GoalWhere) {\n    goals(where: $where) {\n      id\n      name\n      type\n      description\n      caresFor\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      motivatesPerson {\n        id\n        name\n        photo\n      }\n    }\n  }\n':
    types.GetAllGoalsDocument,
  '\n  query GetMembers {\n    members {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n':
    types.GetMembersDocument,
  '\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n      createdAt\n    }\n  }\n':
    types.GetPersonDocument,
  '\n  query getAllPeople($where: PersonWhere) {\n    people(where: $where) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n      guidedBy {\n        id\n        name\n      }\n      # createdAt\n    }\n  }\n':
    types.GetAllPeopleDocument,
  '\n  query getMember($id: ID!) {\n    members(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      gender\n      phone\n    }\n  }\n':
    types.GetMemberDocument,
  '\n  query getResource($id: ID!) {\n    resources(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResource {\n        id\n        name\n      }\n      appliedToCarePoint {\n        id\n      }\n      providedByPerson {\n        id\n        name\n        phone\n        photo\n      }\n    }\n  }\n':
    types.GetResourceDocument,
  '\n  query getAllResources($where: ResourceWhere) {\n    resources(where: $where) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResource {\n        id\n        name\n      }\n      appliedToCarePoint {\n        id\n      }\n      providedByPerson {\n        id\n        name\n        phone\n        photo\n      }\n    }\n  }\n':
    types.GetAllResourcesDocument,
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
  source: '\n  mutation CreateCoreValues($input: [CoreValueCreateInput!]!) {\n    createCoreValues(input: $input) {\n      coreValues {\n        id\n        name\n        caresFor\n        whoSupports\n        alignmentChallenges\n        alignmentExamples\n        description\n        why\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreateCoreValues($input: [CoreValueCreateInput!]!) {\n    createCoreValues(input: $input) {\n      coreValues {\n        id\n        name\n        caresFor\n        whoSupports\n        alignmentChallenges\n        alignmentExamples\n        description\n        why\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateGoals($input: [GoalCreateInput!]!) {\n    createGoals(input: $input) {\n      goals {\n        id\n        name\n        type\n        description\n        caresFor\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreateGoals($input: [GoalCreateInput!]!) {\n    createGoals(input: $input) {\n      goals {\n        id\n        name\n        type\n        description\n        caresFor\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        firstName\n        lastName\n        email\n        phone\n        location\n        manual\n        interests\n        pronouns\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        firstName\n        lastName\n        email\n        phone\n        location\n        manual\n        interests\n        pronouns\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateMembers($input: [MemberCreateInput!]!) {\n    createMembers(input: $input) {\n      members {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreateMembers($input: [MemberCreateInput!]!) {\n    createMembers(input: $input) {\n      members {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateResources($input: [ResourceCreateInput!]!) {\n    createResources(input: $input) {\n      resources {\n        id\n        name\n        description\n        status\n        why\n        location\n        time\n        dependsOnResource {\n          id\n          name\n        }\n        appliedToCarePoint {\n          id\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreateResources($input: [ResourceCreateInput!]!) {\n    createResources(input: $input) {\n      resources {\n        id\n        name\n        description\n        status\n        why\n        location\n        time\n        dependsOnResource {\n          id\n          name\n        }\n        appliedToCarePoint {\n          id\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCoreValue($id: ID!) {\n    coreValues(where: { id_EQ: $id }) {\n      id\n      name\n      caresFor\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      guidesPerson {\n        id\n        name\n      }\n      # createdAt\n    }\n  }\n'
): (typeof documents)['\n  query getCoreValue($id: ID!) {\n    coreValues(where: { id_EQ: $id }) {\n      id\n      name\n      caresFor\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      guidesPerson {\n        id\n        name\n      }\n      # createdAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllCoreValues($where: CoreValueWhere) {\n    coreValues(where: $where) {\n      id\n      name\n      caresFor\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      # createdAt\n    }\n  }\n'
): (typeof documents)['\n  query getAllCoreValues($where: CoreValueWhere) {\n    coreValues(where: $where) {\n      id\n      name\n      caresFor\n      whoSupports\n      alignmentChallenges\n      alignmentExamples\n      description\n      why\n      # createdAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getLoggedInUser($email: String!) {\n    members(where: { email_EQ: $email }) {\n      id\n      firstName\n      lastName\n      email\n      community {\n        id\n        name\n        hasMembers {\n          id\n          name\n          photo\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getLoggedInUser($email: String!) {\n    members(where: { email_EQ: $email }) {\n      id\n      firstName\n      lastName\n      email\n      community {\n        id\n        name\n        hasMembers {\n          id\n          name\n          photo\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getGoal($id: ID!) {\n    goals(where: { id_EQ: $id }) {\n      id\n      name\n      type\n      description\n      caresFor\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      motivatesPerson {\n        id\n        name\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getGoal($id: ID!) {\n    goals(where: { id_EQ: $id }) {\n      id\n      name\n      type\n      description\n      caresFor\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      motivatesPerson {\n        id\n        name\n        photo\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllGoals($where: GoalWhere) {\n    goals(where: $where) {\n      id\n      name\n      type\n      description\n      caresFor\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      motivatesPerson {\n        id\n        name\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllGoals($where: GoalWhere) {\n    goals(where: $where) {\n      id\n      name\n      type\n      description\n      caresFor\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n      motivatesPerson {\n        id\n        name\n        photo\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetMembers {\n    members {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n'
): (typeof documents)['\n  query GetMembers {\n    members {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n      createdAt\n    }\n  }\n'
): (typeof documents)['\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n      createdAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllPeople($where: PersonWhere) {\n    people(where: $where) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n      guidedBy {\n        id\n        name\n      }\n      # createdAt\n    }\n  }\n'
): (typeof documents)['\n  query getAllPeople($where: PersonWhere) {\n    people(where: $where) {\n      id\n      firstName\n      lastName\n      name\n      email\n      photo\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n      guidedBy {\n        id\n        name\n      }\n      # createdAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getMember($id: ID!) {\n    members(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      gender\n      phone\n    }\n  }\n'
): (typeof documents)['\n  query getMember($id: ID!) {\n    members(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      gender\n      phone\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getResource($id: ID!) {\n    resources(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResource {\n        id\n        name\n      }\n      appliedToCarePoint {\n        id\n      }\n      providedByPerson {\n        id\n        name\n        phone\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getResource($id: ID!) {\n    resources(where: { id_EQ: $id }) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResource {\n        id\n        name\n      }\n      appliedToCarePoint {\n        id\n      }\n      providedByPerson {\n        id\n        name\n        phone\n        photo\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllResources($where: ResourceWhere) {\n    resources(where: $where) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResource {\n        id\n        name\n      }\n      appliedToCarePoint {\n        id\n      }\n      providedByPerson {\n        id\n        name\n        phone\n        photo\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllResources($where: ResourceWhere) {\n    resources(where: $where) {\n      id\n      name\n      description\n      status\n      why\n      location\n      time\n      dependsOnResource {\n        id\n        name\n      }\n      appliedToCarePoint {\n        id\n      }\n      providedByPerson {\n        id\n        name\n        phone\n        photo\n      }\n    }\n  }\n']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
