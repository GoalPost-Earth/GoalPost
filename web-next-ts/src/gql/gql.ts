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
  '\n  mutation CreateGoals($input: [GoalCreateInput!]!) {\n    createGoals(input: $input) {\n      goals {\n        id\n        name\n        type\n        description\n        caresFor\n        successMeasures\n        photo\n        status\n        location\n        time\n        createdAt\n      }\n    }\n  }\n':
    types.CreateGoalsDocument,
  '\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        firstName\n        lastName\n        email\n        phone\n        location\n        manual\n        interests\n        pronouns\n      }\n    }\n  }\n':
    types.CreatePeopleDocument,
  '\n  mutation CreateMembers($input: [MemberCreateInput!]!) {\n    createMembers(input: $input) {\n      members {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n':
    types.CreateMembersDocument,
  '\n  query getLoggedInUser($authId: String!) {\n    members(where: { authId_EQ: $authId }) {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n':
    types.GetLoggedInUserDocument,
  '\n  query getGoal($id: ID!) {\n    goals(where: { id_EQ: $id }) {\n      id\n      name\n      type\n      description\n      caresFor\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n    }\n  }\n':
    types.GetGoalDocument,
  '\n  query GetMembers {\n    members {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n':
    types.GetMembersDocument,
  '\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      fullName\n      email\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n    }\n  }\n':
    types.GetPersonDocument,
  '\n  query getAllPeople {\n    people {\n      id\n      firstName\n      lastName\n      fullName\n      email\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n      # createdAt\n    }\n  }\n':
    types.GetAllPeopleDocument,
  '\n  query getMember($id: ID!) {\n    members(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      fullName\n      email\n      gender\n      phone\n    }\n  }\n':
    types.GetMemberDocument,
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
  source: '\n  query getLoggedInUser($authId: String!) {\n    members(where: { authId_EQ: $authId }) {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n'
): (typeof documents)['\n  query getLoggedInUser($authId: String!) {\n    members(where: { authId_EQ: $authId }) {\n      id\n      firstName\n      lastName\n      email\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getGoal($id: ID!) {\n    goals(where: { id_EQ: $id }) {\n      id\n      name\n      type\n      description\n      caresFor\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n    }\n  }\n'
): (typeof documents)['\n  query getGoal($id: ID!) {\n    goals(where: { id_EQ: $id }) {\n      id\n      name\n      type\n      description\n      caresFor\n      successMeasures\n      photo\n      status\n      location\n      time\n      createdAt\n    }\n  }\n']
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
  source: '\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      fullName\n      email\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n    }\n  }\n'
): (typeof documents)['\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      fullName\n      email\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllPeople {\n    people {\n      id\n      firstName\n      lastName\n      fullName\n      email\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n      # createdAt\n    }\n  }\n'
): (typeof documents)['\n  query getAllPeople {\n    people {\n      id\n      firstName\n      lastName\n      fullName\n      email\n      phone\n      manual\n      interests\n      gender\n      pronouns\n      location\n      # createdAt\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getMember($id: ID!) {\n    members(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      fullName\n      email\n      gender\n      phone\n    }\n  }\n'
): (typeof documents)['\n  query getMember($id: ID!) {\n    members(where: { id_EQ: $id }) {\n      id\n      firstName\n      lastName\n      fullName\n      email\n      gender\n      phone\n    }\n  }\n']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
