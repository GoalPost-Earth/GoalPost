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
  '\n  query getCouncilJobs($id: ID!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      jobs {\n        id\n        title\n        description\n        createdOn\n        updatedOn\n        dueDate\n        members {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n        completionCount\n        memberCount\n      }\n    }\n  }\n':
    types.GetCouncilJobsDocument,
  '\n  query getGovernorshipJobs($id: ID!) {\n    governorships(where: { id: $id }) {\n      id\n      name\n      jobs {\n        id\n        title\n        description\n        createdOn\n        updatedOn\n        dueDate\n        members {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n        completionCount\n        memberCount\n      }\n    }\n  }\n':
    types.GetGovernorshipJobsDocument,
  '\n  query getMemberChurches($authId: String!) {\n    members(where: { auth_id: $authId }) {\n      id\n      firstName\n      lastName\n      fullName\n      pictureUrl\n\n      adminCouncil {\n        id\n        name\n      }\n\n      leadsCouncil {\n        id\n        name\n      }\n\n      leadsGovernorship {\n        id\n        name\n      }\n\n      adminGovernorship {\n        id\n        name\n      }\n\n      leadsStream {\n        id\n        name\n      }\n\n      adminStream {\n        id\n        name\n      }\n\n      adminStream {\n        id\n        name\n      }\n\n      leadsCampus {\n        id\n        name\n      }\n\n      adminCampus {\n        id\n        name\n      }\n    }\n  }\n':
    types.GetMemberChurchesDocument,
  '\n  query getMemberBio($authId: String!) {\n    members(where: { auth_id: $authId }) {\n      id\n      email\n    }\n  }\n':
    types.GetMemberBioDocument,
  '\n  mutation createJob(\n    $title: String!\n    $dueDate: String!\n    $description: String!\n    $churchLevel: String!\n    $churchId: ID!\n    $createdBy: MemberInput!\n  ) {\n    createJob(\n      title: $title\n      dueDate: $dueDate\n      description: $description\n      churchLevel: $churchLevel\n      churchId: $churchId\n      createdBy: $createdBy\n    ) {\n      id\n      title\n      dueDate\n      description\n      createdOn\n      updatedOn\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n        pictureUrl\n      }\n    }\n  }\n':
    types.CreateJobDocument,
  '\n  mutation createJobForGovernors(\n    $title: String!\n    $dueDate: String!\n    $description: String!\n    $churchLevel: String!\n    $churchId: ID!\n    $createdBy: MemberInput!\n  ) {\n    createJobForGovernors(\n      title: $title\n      dueDate: $dueDate\n      description: $description\n      churchLevel: $churchLevel\n      churchId: $churchId\n      createdBy: $createdBy\n    )\n  }\n':
    types.CreateJobForGovernorsDocument,
  '\n  mutation markMemberAsDone($jobId: ID!, $memberId: ID!) {\n    markMemberAsDone(jobId: $jobId, memberId: $memberId) {\n      id\n      firstName\n      lastName\n      fullName\n      pictureUrl\n      phoneNumber\n      whatsappNumber\n      done(jobId: $jobId)\n    }\n  }\n':
    types.MarkMemberAsDoneDocument,
  '\n  query getJobs($id: ID!) {\n    jobs(where: { id: $id }) {\n      id\n      title\n      description\n      createdOn\n      updatedOn\n      dueDate\n      members {\n        id\n        firstName\n        lastName\n        fullName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n        done(jobId: $id)\n      }\n      memberCount\n      completionCount\n    }\n  }\n':
    types.GetJobsDocument,
  '\n  mutation addMembersToJob($jobId: ID!, $members: [MemberInput!]!) {\n    addMembersToJob(jobId: $jobId, members: $members) {\n      id\n      title\n      dueDate\n      description\n      createdOn\n      updatedOn\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n        pictureUrl\n      }\n      members {\n        id\n        firstName\n        lastName\n        fullName\n        pictureUrl\n        email\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n':
    types.AddMembersToJobDocument,
  '\n  query getGovernorshipMembers($id: ID!) {\n    governorships(where: { id: $id }) {\n      id\n      name\n      members {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n':
    types.GetGovernorshipMembersDocument,
  '\n  query getGovernorshipMembersWithDateRange(\n    $id: ID!\n    $from: String!\n    $to: String!\n  ) {\n    governorships(where: { id: $id }) {\n      id\n      name\n      membersWithinDateRange(from: $from, to: $to) {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n':
    types.GetGovernorshipMembersWithDateRangeDocument,
  '\n  query getCouncilMembers($id: ID!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      members {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n':
    types.GetCouncilMembersDocument,
  '\n  query getCouncilMembersWithDateRange($id: ID!, $from: String!, $to: String!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      membersWithinDateRange(from: $from, to: $to) {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n':
    types.GetCouncilMembersWithDateRangeDocument,
  '\n  query getCouncilJobsByGovernor($id: ID!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      governorships {\n        id\n        name\n        leader {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n\n        jobs {\n          id\n          title\n          description\n          createdOn\n          updatedOn\n          dueDate\n          members {\n            id\n            firstName\n            lastName\n            fullName\n            pictureUrl\n          }\n          completionCount\n          memberCount\n        }\n      }\n    }\n  }\n':
    types.GetCouncilJobsByGovernorDocument,
  '\n  query getCouncilsByStream($id: ID!) {\n    streams(where: { id: $id }) {\n      id\n      name\n      councils {\n        id\n        name\n        leader {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n      }\n    }\n  }\n':
    types.GetCouncilsByStreamDocument,
  '\n  query getStreamsByCampus($id: ID!) {\n    campuses(where: { id: $id }) {\n      id\n      name\n      streams {\n        id\n        name\n        leader {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n      }\n    }\n  }\n':
    types.GetStreamsByCampusDocument,
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
  source: '\n  query getCouncilJobs($id: ID!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      jobs {\n        id\n        title\n        description\n        createdOn\n        updatedOn\n        dueDate\n        members {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n        completionCount\n        memberCount\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getCouncilJobs($id: ID!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      jobs {\n        id\n        title\n        description\n        createdOn\n        updatedOn\n        dueDate\n        members {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n        completionCount\n        memberCount\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getGovernorshipJobs($id: ID!) {\n    governorships(where: { id: $id }) {\n      id\n      name\n      jobs {\n        id\n        title\n        description\n        createdOn\n        updatedOn\n        dueDate\n        members {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n        completionCount\n        memberCount\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getGovernorshipJobs($id: ID!) {\n    governorships(where: { id: $id }) {\n      id\n      name\n      jobs {\n        id\n        title\n        description\n        createdOn\n        updatedOn\n        dueDate\n        members {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n        completionCount\n        memberCount\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getMemberChurches($authId: String!) {\n    members(where: { auth_id: $authId }) {\n      id\n      firstName\n      lastName\n      fullName\n      pictureUrl\n\n      adminCouncil {\n        id\n        name\n      }\n\n      leadsCouncil {\n        id\n        name\n      }\n\n      leadsGovernorship {\n        id\n        name\n      }\n\n      adminGovernorship {\n        id\n        name\n      }\n\n      leadsStream {\n        id\n        name\n      }\n\n      adminStream {\n        id\n        name\n      }\n\n      adminStream {\n        id\n        name\n      }\n\n      leadsCampus {\n        id\n        name\n      }\n\n      adminCampus {\n        id\n        name\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getMemberChurches($authId: String!) {\n    members(where: { auth_id: $authId }) {\n      id\n      firstName\n      lastName\n      fullName\n      pictureUrl\n\n      adminCouncil {\n        id\n        name\n      }\n\n      leadsCouncil {\n        id\n        name\n      }\n\n      leadsGovernorship {\n        id\n        name\n      }\n\n      adminGovernorship {\n        id\n        name\n      }\n\n      leadsStream {\n        id\n        name\n      }\n\n      adminStream {\n        id\n        name\n      }\n\n      adminStream {\n        id\n        name\n      }\n\n      leadsCampus {\n        id\n        name\n      }\n\n      adminCampus {\n        id\n        name\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getMemberBio($authId: String!) {\n    members(where: { auth_id: $authId }) {\n      id\n      email\n    }\n  }\n'
): (typeof documents)['\n  query getMemberBio($authId: String!) {\n    members(where: { auth_id: $authId }) {\n      id\n      email\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createJob(\n    $title: String!\n    $dueDate: String!\n    $description: String!\n    $churchLevel: String!\n    $churchId: ID!\n    $createdBy: MemberInput!\n  ) {\n    createJob(\n      title: $title\n      dueDate: $dueDate\n      description: $description\n      churchLevel: $churchLevel\n      churchId: $churchId\n      createdBy: $createdBy\n    ) {\n      id\n      title\n      dueDate\n      description\n      createdOn\n      updatedOn\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n        pictureUrl\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation createJob(\n    $title: String!\n    $dueDate: String!\n    $description: String!\n    $churchLevel: String!\n    $churchId: ID!\n    $createdBy: MemberInput!\n  ) {\n    createJob(\n      title: $title\n      dueDate: $dueDate\n      description: $description\n      churchLevel: $churchLevel\n      churchId: $churchId\n      createdBy: $createdBy\n    ) {\n      id\n      title\n      dueDate\n      description\n      createdOn\n      updatedOn\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n        pictureUrl\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createJobForGovernors(\n    $title: String!\n    $dueDate: String!\n    $description: String!\n    $churchLevel: String!\n    $churchId: ID!\n    $createdBy: MemberInput!\n  ) {\n    createJobForGovernors(\n      title: $title\n      dueDate: $dueDate\n      description: $description\n      churchLevel: $churchLevel\n      churchId: $churchId\n      createdBy: $createdBy\n    )\n  }\n'
): (typeof documents)['\n  mutation createJobForGovernors(\n    $title: String!\n    $dueDate: String!\n    $description: String!\n    $churchLevel: String!\n    $churchId: ID!\n    $createdBy: MemberInput!\n  ) {\n    createJobForGovernors(\n      title: $title\n      dueDate: $dueDate\n      description: $description\n      churchLevel: $churchLevel\n      churchId: $churchId\n      createdBy: $createdBy\n    )\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation markMemberAsDone($jobId: ID!, $memberId: ID!) {\n    markMemberAsDone(jobId: $jobId, memberId: $memberId) {\n      id\n      firstName\n      lastName\n      fullName\n      pictureUrl\n      phoneNumber\n      whatsappNumber\n      done(jobId: $jobId)\n    }\n  }\n'
): (typeof documents)['\n  mutation markMemberAsDone($jobId: ID!, $memberId: ID!) {\n    markMemberAsDone(jobId: $jobId, memberId: $memberId) {\n      id\n      firstName\n      lastName\n      fullName\n      pictureUrl\n      phoneNumber\n      whatsappNumber\n      done(jobId: $jobId)\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getJobs($id: ID!) {\n    jobs(where: { id: $id }) {\n      id\n      title\n      description\n      createdOn\n      updatedOn\n      dueDate\n      members {\n        id\n        firstName\n        lastName\n        fullName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n        done(jobId: $id)\n      }\n      memberCount\n      completionCount\n    }\n  }\n'
): (typeof documents)['\n  query getJobs($id: ID!) {\n    jobs(where: { id: $id }) {\n      id\n      title\n      description\n      createdOn\n      updatedOn\n      dueDate\n      members {\n        id\n        firstName\n        lastName\n        fullName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n        done(jobId: $id)\n      }\n      memberCount\n      completionCount\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation addMembersToJob($jobId: ID!, $members: [MemberInput!]!) {\n    addMembersToJob(jobId: $jobId, members: $members) {\n      id\n      title\n      dueDate\n      description\n      createdOn\n      updatedOn\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n        pictureUrl\n      }\n      members {\n        id\n        firstName\n        lastName\n        fullName\n        pictureUrl\n        email\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation addMembersToJob($jobId: ID!, $members: [MemberInput!]!) {\n    addMembersToJob(jobId: $jobId, members: $members) {\n      id\n      title\n      dueDate\n      description\n      createdOn\n      updatedOn\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n        pictureUrl\n      }\n      members {\n        id\n        firstName\n        lastName\n        fullName\n        pictureUrl\n        email\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getGovernorshipMembers($id: ID!) {\n    governorships(where: { id: $id }) {\n      id\n      name\n      members {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getGovernorshipMembers($id: ID!) {\n    governorships(where: { id: $id }) {\n      id\n      name\n      members {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getGovernorshipMembersWithDateRange(\n    $id: ID!\n    $from: String!\n    $to: String!\n  ) {\n    governorships(where: { id: $id }) {\n      id\n      name\n      membersWithinDateRange(from: $from, to: $to) {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getGovernorshipMembersWithDateRange(\n    $id: ID!\n    $from: String!\n    $to: String!\n  ) {\n    governorships(where: { id: $id }) {\n      id\n      name\n      membersWithinDateRange(from: $from, to: $to) {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCouncilMembers($id: ID!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      members {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getCouncilMembers($id: ID!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      members {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCouncilMembersWithDateRange($id: ID!, $from: String!, $to: String!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      membersWithinDateRange(from: $from, to: $to) {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getCouncilMembersWithDateRange($id: ID!, $from: String!, $to: String!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      membersWithinDateRange(from: $from, to: $to) {\n        id\n        firstName\n        lastName\n        pictureUrl\n        phoneNumber\n        whatsappNumber\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCouncilJobsByGovernor($id: ID!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      governorships {\n        id\n        name\n        leader {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n\n        jobs {\n          id\n          title\n          description\n          createdOn\n          updatedOn\n          dueDate\n          members {\n            id\n            firstName\n            lastName\n            fullName\n            pictureUrl\n          }\n          completionCount\n          memberCount\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getCouncilJobsByGovernor($id: ID!) {\n    councils(where: { id: $id }) {\n      id\n      name\n      governorships {\n        id\n        name\n        leader {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n\n        jobs {\n          id\n          title\n          description\n          createdOn\n          updatedOn\n          dueDate\n          members {\n            id\n            firstName\n            lastName\n            fullName\n            pictureUrl\n          }\n          completionCount\n          memberCount\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCouncilsByStream($id: ID!) {\n    streams(where: { id: $id }) {\n      id\n      name\n      councils {\n        id\n        name\n        leader {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getCouncilsByStream($id: ID!) {\n    streams(where: { id: $id }) {\n      id\n      name\n      councils {\n        id\n        name\n        leader {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getStreamsByCampus($id: ID!) {\n    campuses(where: { id: $id }) {\n      id\n      name\n      streams {\n        id\n        name\n        leader {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getStreamsByCampus($id: ID!) {\n    campuses(where: { id: $id }) {\n      id\n      name\n      streams {\n        id\n        name\n        leader {\n          id\n          firstName\n          lastName\n          fullName\n          pictureUrl\n        }\n      }\n    }\n  }\n']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
