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
type Documents = {
  '\n  mutation CreateFieldContext($input: [FieldContextCreateInput!]!) {\n    createFieldContexts(input: $input) {\n      fieldContexts {\n        id\n        title\n        emergentName\n        createdAt\n        space {\n          id\n          name\n          visibility\n          createdAt\n        }\n      }\n      info {\n        nodesCreated\n        relationshipsCreated\n      }\n    }\n  }\n': typeof types.CreateFieldContextDocument
  '\n  mutation UpdateFieldContext(\n    $where: FieldContextWhere!\n    $update: FieldContextUpdateInput!\n  ) {\n    updateFieldContexts(where: $where, update: $update) {\n      fieldContexts {\n        id\n        title\n        emergentName\n        createdAt\n        space {\n          id\n          name\n          visibility\n        }\n      }\n      info {\n        nodesCreated\n        nodesDeleted\n        relationshipsCreated\n        relationshipsDeleted\n      }\n    }\n  }\n': typeof types.UpdateFieldContextDocument
  '\n  mutation DeleteFieldContext($id: ID!) {\n    deleteFieldContexts(where: { id_EQ: $id }) {\n      nodesDeleted\n      relationshipsDeleted\n    }\n  }\n': typeof types.DeleteFieldContextDocument
  '\n  mutation ConnectFieldToSpace($fieldId: ID!, $spaceId: ID!) {\n    updateFieldContexts(\n      where: { id_EQ: $fieldId }\n      update: {\n        meSpace: { connect: [{ where: { node: { id_EQ: $spaceId } } }] }\n      }\n    ) {\n      fieldContexts {\n        id\n        title\n        space {\n          id\n          name\n        }\n      }\n    }\n  }\n': typeof types.ConnectFieldToSpaceDocument
  '\n  mutation createGoalPulses($input: [GoalPulseCreateInput!]!) {\n    createGoalPulses(input: $input) {\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n        status\n        horizon\n      }\n    }\n  }\n': typeof types.CreateGoalPulsesDocument
  '\n  mutation updateGoalPulses(\n    $where: GoalPulseWhere!\n    $update: GoalPulseUpdateInput!\n  ) {\n    updateGoalPulses(where: $where, update: $update) {\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n        status\n        horizon\n      }\n    }\n  }\n': typeof types.UpdateGoalPulsesDocument
  '\n  mutation deleteGoalPulses($where: GoalPulseWhere!) {\n    deleteGoalPulses(where: $where) {\n      nodesDeleted\n    }\n  }\n': typeof types.DeleteGoalPulsesDocument
  '\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        name\n        email\n        ownsSpaces {\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n': typeof types.CreatePeopleDocument
  '\n  mutation UpdatePerson($where: PersonWhere!, $update: PersonUpdateInput!) {\n    updatePeople(where: $where, update: $update) {\n      people {\n        id\n        name\n        email\n        ownsSpaces {\n          id\n          name\n          visibility\n          createdAt\n        }\n      }\n    }\n  }\n': typeof types.UpdatePersonDocument
  '\n  mutation DeletePerson($id: ID!) {\n    deletePeople(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n': typeof types.DeletePersonDocument
  '\n  mutation InvitePerson($personId: String!) {\n    invitePerson(personId: $personId) {\n      id\n      name\n      email\n    }\n  }\n': typeof types.InvitePersonDocument
  '\n  mutation CancelInvite($personId: String!) {\n    cancelInvite(personId: $personId) {\n      id\n      name\n      email\n    }\n  }\n': typeof types.CancelInviteDocument
  '\n  query ResolvePersonByEmail($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      name\n      email\n    }\n  }\n': typeof types.ResolvePersonByEmailDocument
  '\n  mutation AddSpaceMember($spaceId: ID!, $memberId: ID!, $role: SpaceRole!) {\n    addSpaceMember(spaceId: $spaceId, memberId: $memberId, role: $role) {\n      success\n      message\n      membership {\n        id\n        role\n        addedAt\n      }\n    }\n  }\n': typeof types.AddSpaceMemberDocument
  '\n  mutation UpdateSpaceMemberRole(\n    $spaceId: ID!\n    $memberId: ID!\n    $role: SpaceRole!\n  ) {\n    updateSpaceMemberRole(spaceId: $spaceId, memberId: $memberId, role: $role) {\n      success\n      message\n      membership {\n        id\n        role\n        addedAt\n      }\n    }\n  }\n': typeof types.UpdateSpaceMemberRoleDocument
  '\n  mutation RemoveSpaceMember($spaceId: ID!, $memberId: ID!) {\n    removeSpaceMember(spaceId: $spaceId, memberId: $memberId) {\n      success\n      message\n    }\n  }\n': typeof types.RemoveSpaceMemberDocument
  '\n  query getCommunity($id: ID!) {\n    communities(where: { id_EQ: $id }) {\n      id\n      name\n      type\n      members {\n        ... on Person {\n          id\n          name\n          email\n        }\n        ... on Community {\n          id\n          name\n          type\n        }\n      }\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n': typeof types.GetCommunityDocument
  '\n  query getAllCommunites($where: CommunityWhere) {\n    communities(where: $where) {\n      id\n      name\n      type\n      members {\n        ... on Person {\n          id\n          name\n          email\n        }\n        ... on Community {\n          id\n          name\n          type\n        }\n      }\n      ownsSpaces {\n        id\n        name\n        visibility\n      }\n    }\n  }\n': typeof types.GetAllCommunitesDocument
  '\n  query getCommunitiesAndTheirMembers {\n    communities {\n      id\n      name\n      type\n    }\n  }\n': typeof types.GetCommunitiesAndTheirMembersDocument
  '\n  query getPeopleNotInCommunities {\n    people {\n      id\n      name\n      email\n    }\n  }\n': typeof types.GetPeopleNotInCommunitiesDocument
  '\n  query getLoggedInUser($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n': typeof types.GetLoggedInUserDocument
  '\n  query getFieldContextDetails($contextId: ID!) {\n    fieldContexts(where: { id_EQ: $contextId }) {\n      id\n      title\n      emergentName\n      createdAt\n      pulses {\n        __typename\n        id\n        title\n        content\n        createdAt\n      }\n      space {\n        id\n        name\n        visibility\n        ... on MeSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n        ... on WeSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n': typeof types.GetFieldContextDetailsDocument
  '\n  query GetFieldContexts($where: FieldContextWhere) {\n    fieldContexts(where: $where) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n': typeof types.GetFieldContextsDocument
  '\n  query GetMeSpaceFields {\n    meSpaces {\n      id\n      name\n      owner {\n        id\n        firstName\n        lastName\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n': typeof types.GetMeSpaceFieldsDocument
  '\n  query GetFieldsForSpace($spaceId: ID!) {\n    fieldContexts(\n      where: {\n        OR: [\n          { meSpace_SOME: { id_EQ: $spaceId } }\n          { weSpace_SOME: { id_EQ: $spaceId } }\n        ]\n      }\n    ) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n': typeof types.GetFieldsForSpaceDocument
  '\n  query GetFieldContextById($id: ID!) {\n    fieldContexts(where: { id_EQ: $id }) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n': typeof types.GetFieldContextByIdDocument
  '\n  query GetFieldsForSpacePaginated($spaceId: ID!, $offset: Int, $limit: Int) {\n    fieldContexts(\n      where: {\n        OR: [\n          { meSpace_SOME: { id_EQ: $spaceId } }\n          { weSpace_SOME: { id_EQ: $spaceId } }\n        ]\n      }\n      offset: $offset\n      limit: $limit\n    ) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n': typeof types.GetFieldsForSpacePaginatedDocument
  '\n  query GetAllPulses {\n    goalPulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    resourcePulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    storyPulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n': typeof types.GetAllPulsesDocument
  '\n  query GetAllFieldContexts {\n    fieldContexts {\n      id\n      title\n      emergentName\n      createdAt\n      meSpace {\n        id\n        name\n        visibility\n      }\n      weSpace {\n        id\n        name\n        visibility\n      }\n      pulses {\n        ... on GoalPulse {\n          __typename\n          id\n          createdAt\n        }\n        ... on ResourcePulse {\n          __typename\n          id\n          createdAt\n        }\n        ... on StoryPulse {\n          __typename\n          id\n          createdAt\n        }\n      }\n    }\n  }\n': typeof types.GetAllFieldContextsDocument
  '\n  query GetAllMeSpaces {\n    meSpaces {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        createdAt\n      }\n    }\n  }\n': typeof types.GetAllMeSpacesDocument
  '\n  query GetAllWeSpaces {\n    weSpaces {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        createdAt\n      }\n    }\n  }\n': typeof types.GetAllWeSpacesDocument
  '\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n': typeof types.GetPersonDocument
  '\n  query getPersonProfile($personId: ID!) {\n    people(where: { id_EQ: $personId }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      ownsSpaces {\n        ... on MeSpace {\n          id\n          name\n          visibility\n          createdAt\n          contexts {\n            id\n            title\n            pulses {\n              id\n              title\n              intensity\n            }\n          }\n        }\n        ... on WeSpace {\n          id\n          name\n          visibility\n          createdAt\n          contexts {\n            id\n            title\n            pulses {\n              id\n              title\n              intensity\n            }\n          }\n        }\n      }\n    }\n  }\n': typeof types.GetPersonProfileDocument
  '\n  query getAllPeople($where: PersonWhere) {\n    people(where: $where) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n      }\n    }\n  }\n': typeof types.GetAllPeopleDocument
  '\n  query getPeopleAndTheirGoals($personWhere: PersonWhere, $goalLimit: Int) {\n    people(where: $personWhere) {\n      id\n      name\n      ownsSpaces {\n        id\n        name\n      }\n    }\n  }\n': typeof types.GetPeopleAndTheirGoalsDocument
  '\n  query getPeopleAndTheirResources {\n    people {\n      name\n      id\n      email\n      ownsSpaces {\n        name\n        id\n      }\n    }\n  }\n': typeof types.GetPeopleAndTheirResourcesDocument
  '\n  query getPeopleAndTheirCoreValues {\n    people {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n      }\n    }\n  }\n': typeof types.GetPeopleAndTheirCoreValuesDocument
  '\n  query getUserById($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      name\n      email\n    }\n  }\n': typeof types.GetUserByIdDocument
  '\n  query getPulseDetailsWithContext($pulseId: ID!) {\n    fieldPulses(where: { id_EQ: $pulseId }) {\n      id\n      title\n      content\n      createdAt\n      __typename\n      context {\n        id\n        title\n        emergentName\n        createdAt\n        pulses {\n          id\n          title\n          content\n          createdAt\n          __typename\n        }\n        meSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n        weSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n': typeof types.GetPulseDetailsWithContextDocument
  '\n  query getPulseDetails($pulseId: ID!) {\n    goalPulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      status\n      horizon\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        name\n        email\n      }\n    }\n    resourcePulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      resourceType\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    storyPulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n': typeof types.GetPulseDetailsDocument
  '\n  query SearchAll($query: String!) {\n    searchAll(query: $query) {\n      people {\n        id\n        firstName\n        lastName\n        email\n      }\n      contexts {\n        id\n        title\n      }\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      resourcePulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      storyPulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      meSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n      weSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n      communities {\n        id\n        name\n        type\n      }\n    }\n  }\n': typeof types.SearchAllDocument
  '\n  query getSpaceDetailsComplete($spaceId: ID!) {\n    spaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      ... on MeSpace {\n        id\n        name\n        visibility\n        createdAt\n        owner {\n          __typename\n          id\n          firstName\n          lastName\n          email\n        }\n        members {\n          id\n          role\n          addedAt\n          member {\n            __typename\n            id\n            firstName\n            lastName\n            email\n          }\n        }\n        contexts {\n          id\n          title\n          emergentName\n          createdAt\n          pulses {\n            __typename\n            id\n            title\n            intensity\n          }\n        }\n      }\n      ... on WeSpace {\n        id\n        name\n        visibility\n        createdAt\n        owner {\n          __typename\n          id\n          firstName\n          lastName\n          email\n        }\n        members {\n          id\n          role\n          addedAt\n          member {\n            __typename\n            id\n            firstName\n            lastName\n            email\n          }\n        }\n        contexts {\n          id\n          title\n          emergentName\n          createdAt\n          pulses {\n            __typename\n            id\n            title\n            intensity\n          }\n        }\n      }\n    }\n  }\n': typeof types.GetSpaceDetailsCompleteDocument
  '\n  query GetUserMeSpaces {\n    meSpaces {\n      id\n      name\n      visibility\n      createdAt\n      contexts {\n        id\n        title\n      }\n    }\n  }\n': typeof types.GetUserMeSpacesDocument
  '\n  query GetUserWeSpaces {\n    weSpaces {\n      id\n      name\n      visibility\n      createdAt\n      members {\n        id\n        role\n      }\n      contexts {\n        id\n        title\n      }\n    }\n  }\n': typeof types.GetUserWeSpacesDocument
  '\n  query GetSpaceMembers($spaceId: ID!) {\n    meSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n    }\n    weSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n    }\n  }\n': typeof types.GetSpaceMembersDocument
  '\n  query GetWeSpaceDetails($spaceId: ID!) {\n    weSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n': typeof types.GetWeSpaceDetailsDocument
  '\n  query GetMeSpaceDetails($spaceId: ID!) {\n    meSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n': typeof types.GetMeSpaceDetailsDocument
}
const documents: Documents = {
  '\n  mutation CreateFieldContext($input: [FieldContextCreateInput!]!) {\n    createFieldContexts(input: $input) {\n      fieldContexts {\n        id\n        title\n        emergentName\n        createdAt\n        space {\n          id\n          name\n          visibility\n          createdAt\n        }\n      }\n      info {\n        nodesCreated\n        relationshipsCreated\n      }\n    }\n  }\n':
    types.CreateFieldContextDocument,
  '\n  mutation UpdateFieldContext(\n    $where: FieldContextWhere!\n    $update: FieldContextUpdateInput!\n  ) {\n    updateFieldContexts(where: $where, update: $update) {\n      fieldContexts {\n        id\n        title\n        emergentName\n        createdAt\n        space {\n          id\n          name\n          visibility\n        }\n      }\n      info {\n        nodesCreated\n        nodesDeleted\n        relationshipsCreated\n        relationshipsDeleted\n      }\n    }\n  }\n':
    types.UpdateFieldContextDocument,
  '\n  mutation DeleteFieldContext($id: ID!) {\n    deleteFieldContexts(where: { id_EQ: $id }) {\n      nodesDeleted\n      relationshipsDeleted\n    }\n  }\n':
    types.DeleteFieldContextDocument,
  '\n  mutation ConnectFieldToSpace($fieldId: ID!, $spaceId: ID!) {\n    updateFieldContexts(\n      where: { id_EQ: $fieldId }\n      update: {\n        meSpace: { connect: [{ where: { node: { id_EQ: $spaceId } } }] }\n      }\n    ) {\n      fieldContexts {\n        id\n        title\n        space {\n          id\n          name\n        }\n      }\n    }\n  }\n':
    types.ConnectFieldToSpaceDocument,
  '\n  mutation createGoalPulses($input: [GoalPulseCreateInput!]!) {\n    createGoalPulses(input: $input) {\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n        status\n        horizon\n      }\n    }\n  }\n':
    types.CreateGoalPulsesDocument,
  '\n  mutation updateGoalPulses(\n    $where: GoalPulseWhere!\n    $update: GoalPulseUpdateInput!\n  ) {\n    updateGoalPulses(where: $where, update: $update) {\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n        status\n        horizon\n      }\n    }\n  }\n':
    types.UpdateGoalPulsesDocument,
  '\n  mutation deleteGoalPulses($where: GoalPulseWhere!) {\n    deleteGoalPulses(where: $where) {\n      nodesDeleted\n    }\n  }\n':
    types.DeleteGoalPulsesDocument,
  '\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        name\n        email\n        ownsSpaces {\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n':
    types.CreatePeopleDocument,
  '\n  mutation UpdatePerson($where: PersonWhere!, $update: PersonUpdateInput!) {\n    updatePeople(where: $where, update: $update) {\n      people {\n        id\n        name\n        email\n        ownsSpaces {\n          id\n          name\n          visibility\n          createdAt\n        }\n      }\n    }\n  }\n':
    types.UpdatePersonDocument,
  '\n  mutation DeletePerson($id: ID!) {\n    deletePeople(where: { id_EQ: $id }) {\n      nodesDeleted\n    }\n  }\n':
    types.DeletePersonDocument,
  '\n  mutation InvitePerson($personId: String!) {\n    invitePerson(personId: $personId) {\n      id\n      name\n      email\n    }\n  }\n':
    types.InvitePersonDocument,
  '\n  mutation CancelInvite($personId: String!) {\n    cancelInvite(personId: $personId) {\n      id\n      name\n      email\n    }\n  }\n':
    types.CancelInviteDocument,
  '\n  query ResolvePersonByEmail($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      name\n      email\n    }\n  }\n':
    types.ResolvePersonByEmailDocument,
  '\n  mutation AddSpaceMember($spaceId: ID!, $memberId: ID!, $role: SpaceRole!) {\n    addSpaceMember(spaceId: $spaceId, memberId: $memberId, role: $role) {\n      success\n      message\n      membership {\n        id\n        role\n        addedAt\n      }\n    }\n  }\n':
    types.AddSpaceMemberDocument,
  '\n  mutation UpdateSpaceMemberRole(\n    $spaceId: ID!\n    $memberId: ID!\n    $role: SpaceRole!\n  ) {\n    updateSpaceMemberRole(spaceId: $spaceId, memberId: $memberId, role: $role) {\n      success\n      message\n      membership {\n        id\n        role\n        addedAt\n      }\n    }\n  }\n':
    types.UpdateSpaceMemberRoleDocument,
  '\n  mutation RemoveSpaceMember($spaceId: ID!, $memberId: ID!) {\n    removeSpaceMember(spaceId: $spaceId, memberId: $memberId) {\n      success\n      message\n    }\n  }\n':
    types.RemoveSpaceMemberDocument,
  '\n  query getCommunity($id: ID!) {\n    communities(where: { id_EQ: $id }) {\n      id\n      name\n      type\n      members {\n        ... on Person {\n          id\n          name\n          email\n        }\n        ... on Community {\n          id\n          name\n          type\n        }\n      }\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n':
    types.GetCommunityDocument,
  '\n  query getAllCommunites($where: CommunityWhere) {\n    communities(where: $where) {\n      id\n      name\n      type\n      members {\n        ... on Person {\n          id\n          name\n          email\n        }\n        ... on Community {\n          id\n          name\n          type\n        }\n      }\n      ownsSpaces {\n        id\n        name\n        visibility\n      }\n    }\n  }\n':
    types.GetAllCommunitesDocument,
  '\n  query getCommunitiesAndTheirMembers {\n    communities {\n      id\n      name\n      type\n    }\n  }\n':
    types.GetCommunitiesAndTheirMembersDocument,
  '\n  query getPeopleNotInCommunities {\n    people {\n      id\n      name\n      email\n    }\n  }\n':
    types.GetPeopleNotInCommunitiesDocument,
  '\n  query getLoggedInUser($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n':
    types.GetLoggedInUserDocument,
  '\n  query getFieldContextDetails($contextId: ID!) {\n    fieldContexts(where: { id_EQ: $contextId }) {\n      id\n      title\n      emergentName\n      createdAt\n      pulses {\n        __typename\n        id\n        title\n        content\n        createdAt\n      }\n      space {\n        id\n        name\n        visibility\n        ... on MeSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n        ... on WeSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n':
    types.GetFieldContextDetailsDocument,
  '\n  query GetFieldContexts($where: FieldContextWhere) {\n    fieldContexts(where: $where) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n':
    types.GetFieldContextsDocument,
  '\n  query GetMeSpaceFields {\n    meSpaces {\n      id\n      name\n      owner {\n        id\n        firstName\n        lastName\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n':
    types.GetMeSpaceFieldsDocument,
  '\n  query GetFieldsForSpace($spaceId: ID!) {\n    fieldContexts(\n      where: {\n        OR: [\n          { meSpace_SOME: { id_EQ: $spaceId } }\n          { weSpace_SOME: { id_EQ: $spaceId } }\n        ]\n      }\n    ) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n':
    types.GetFieldsForSpaceDocument,
  '\n  query GetFieldContextById($id: ID!) {\n    fieldContexts(where: { id_EQ: $id }) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n':
    types.GetFieldContextByIdDocument,
  '\n  query GetFieldsForSpacePaginated($spaceId: ID!, $offset: Int, $limit: Int) {\n    fieldContexts(\n      where: {\n        OR: [\n          { meSpace_SOME: { id_EQ: $spaceId } }\n          { weSpace_SOME: { id_EQ: $spaceId } }\n        ]\n      }\n      offset: $offset\n      limit: $limit\n    ) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n':
    types.GetFieldsForSpacePaginatedDocument,
  '\n  query GetAllPulses {\n    goalPulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    resourcePulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    storyPulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n':
    types.GetAllPulsesDocument,
  '\n  query GetAllFieldContexts {\n    fieldContexts {\n      id\n      title\n      emergentName\n      createdAt\n      meSpace {\n        id\n        name\n        visibility\n      }\n      weSpace {\n        id\n        name\n        visibility\n      }\n      pulses {\n        ... on GoalPulse {\n          __typename\n          id\n          createdAt\n        }\n        ... on ResourcePulse {\n          __typename\n          id\n          createdAt\n        }\n        ... on StoryPulse {\n          __typename\n          id\n          createdAt\n        }\n      }\n    }\n  }\n':
    types.GetAllFieldContextsDocument,
  '\n  query GetAllMeSpaces {\n    meSpaces {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        createdAt\n      }\n    }\n  }\n':
    types.GetAllMeSpacesDocument,
  '\n  query GetAllWeSpaces {\n    weSpaces {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        createdAt\n      }\n    }\n  }\n':
    types.GetAllWeSpacesDocument,
  '\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n':
    types.GetPersonDocument,
  '\n  query getPersonProfile($personId: ID!) {\n    people(where: { id_EQ: $personId }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      ownsSpaces {\n        ... on MeSpace {\n          id\n          name\n          visibility\n          createdAt\n          contexts {\n            id\n            title\n            pulses {\n              id\n              title\n              intensity\n            }\n          }\n        }\n        ... on WeSpace {\n          id\n          name\n          visibility\n          createdAt\n          contexts {\n            id\n            title\n            pulses {\n              id\n              title\n              intensity\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.GetPersonProfileDocument,
  '\n  query getAllPeople($where: PersonWhere) {\n    people(where: $where) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n      }\n    }\n  }\n':
    types.GetAllPeopleDocument,
  '\n  query getPeopleAndTheirGoals($personWhere: PersonWhere, $goalLimit: Int) {\n    people(where: $personWhere) {\n      id\n      name\n      ownsSpaces {\n        id\n        name\n      }\n    }\n  }\n':
    types.GetPeopleAndTheirGoalsDocument,
  '\n  query getPeopleAndTheirResources {\n    people {\n      name\n      id\n      email\n      ownsSpaces {\n        name\n        id\n      }\n    }\n  }\n':
    types.GetPeopleAndTheirResourcesDocument,
  '\n  query getPeopleAndTheirCoreValues {\n    people {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n      }\n    }\n  }\n':
    types.GetPeopleAndTheirCoreValuesDocument,
  '\n  query getUserById($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      name\n      email\n    }\n  }\n':
    types.GetUserByIdDocument,
  '\n  query getPulseDetailsWithContext($pulseId: ID!) {\n    fieldPulses(where: { id_EQ: $pulseId }) {\n      id\n      title\n      content\n      createdAt\n      __typename\n      context {\n        id\n        title\n        emergentName\n        createdAt\n        pulses {\n          id\n          title\n          content\n          createdAt\n          __typename\n        }\n        meSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n        weSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n':
    types.GetPulseDetailsWithContextDocument,
  '\n  query getPulseDetails($pulseId: ID!) {\n    goalPulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      status\n      horizon\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        name\n        email\n      }\n    }\n    resourcePulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      resourceType\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    storyPulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n':
    types.GetPulseDetailsDocument,
  '\n  query SearchAll($query: String!) {\n    searchAll(query: $query) {\n      people {\n        id\n        firstName\n        lastName\n        email\n      }\n      contexts {\n        id\n        title\n      }\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      resourcePulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      storyPulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      meSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n      weSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n      communities {\n        id\n        name\n        type\n      }\n    }\n  }\n':
    types.SearchAllDocument,
  '\n  query getSpaceDetailsComplete($spaceId: ID!) {\n    spaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      ... on MeSpace {\n        id\n        name\n        visibility\n        createdAt\n        owner {\n          __typename\n          id\n          firstName\n          lastName\n          email\n        }\n        members {\n          id\n          role\n          addedAt\n          member {\n            __typename\n            id\n            firstName\n            lastName\n            email\n          }\n        }\n        contexts {\n          id\n          title\n          emergentName\n          createdAt\n          pulses {\n            __typename\n            id\n            title\n            intensity\n          }\n        }\n      }\n      ... on WeSpace {\n        id\n        name\n        visibility\n        createdAt\n        owner {\n          __typename\n          id\n          firstName\n          lastName\n          email\n        }\n        members {\n          id\n          role\n          addedAt\n          member {\n            __typename\n            id\n            firstName\n            lastName\n            email\n          }\n        }\n        contexts {\n          id\n          title\n          emergentName\n          createdAt\n          pulses {\n            __typename\n            id\n            title\n            intensity\n          }\n        }\n      }\n    }\n  }\n':
    types.GetSpaceDetailsCompleteDocument,
  '\n  query GetUserMeSpaces {\n    meSpaces {\n      id\n      name\n      visibility\n      createdAt\n      contexts {\n        id\n        title\n      }\n    }\n  }\n':
    types.GetUserMeSpacesDocument,
  '\n  query GetUserWeSpaces {\n    weSpaces {\n      id\n      name\n      visibility\n      createdAt\n      members {\n        id\n        role\n      }\n      contexts {\n        id\n        title\n      }\n    }\n  }\n':
    types.GetUserWeSpacesDocument,
  '\n  query GetSpaceMembers($spaceId: ID!) {\n    meSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n    }\n    weSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n    }\n  }\n':
    types.GetSpaceMembersDocument,
  '\n  query GetWeSpaceDetails($spaceId: ID!) {\n    weSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n':
    types.GetWeSpaceDetailsDocument,
  '\n  query GetMeSpaceDetails($spaceId: ID!) {\n    meSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n':
    types.GetMeSpaceDetailsDocument,
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
  source: '\n  mutation CreateFieldContext($input: [FieldContextCreateInput!]!) {\n    createFieldContexts(input: $input) {\n      fieldContexts {\n        id\n        title\n        emergentName\n        createdAt\n        space {\n          id\n          name\n          visibility\n          createdAt\n        }\n      }\n      info {\n        nodesCreated\n        relationshipsCreated\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreateFieldContext($input: [FieldContextCreateInput!]!) {\n    createFieldContexts(input: $input) {\n      fieldContexts {\n        id\n        title\n        emergentName\n        createdAt\n        space {\n          id\n          name\n          visibility\n          createdAt\n        }\n      }\n      info {\n        nodesCreated\n        relationshipsCreated\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateFieldContext(\n    $where: FieldContextWhere!\n    $update: FieldContextUpdateInput!\n  ) {\n    updateFieldContexts(where: $where, update: $update) {\n      fieldContexts {\n        id\n        title\n        emergentName\n        createdAt\n        space {\n          id\n          name\n          visibility\n        }\n      }\n      info {\n        nodesCreated\n        nodesDeleted\n        relationshipsCreated\n        relationshipsDeleted\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation UpdateFieldContext(\n    $where: FieldContextWhere!\n    $update: FieldContextUpdateInput!\n  ) {\n    updateFieldContexts(where: $where, update: $update) {\n      fieldContexts {\n        id\n        title\n        emergentName\n        createdAt\n        space {\n          id\n          name\n          visibility\n        }\n      }\n      info {\n        nodesCreated\n        nodesDeleted\n        relationshipsCreated\n        relationshipsDeleted\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteFieldContext($id: ID!) {\n    deleteFieldContexts(where: { id_EQ: $id }) {\n      nodesDeleted\n      relationshipsDeleted\n    }\n  }\n'
): (typeof documents)['\n  mutation DeleteFieldContext($id: ID!) {\n    deleteFieldContexts(where: { id_EQ: $id }) {\n      nodesDeleted\n      relationshipsDeleted\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation ConnectFieldToSpace($fieldId: ID!, $spaceId: ID!) {\n    updateFieldContexts(\n      where: { id_EQ: $fieldId }\n      update: {\n        meSpace: { connect: [{ where: { node: { id_EQ: $spaceId } } }] }\n      }\n    ) {\n      fieldContexts {\n        id\n        title\n        space {\n          id\n          name\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation ConnectFieldToSpace($fieldId: ID!, $spaceId: ID!) {\n    updateFieldContexts(\n      where: { id_EQ: $fieldId }\n      update: {\n        meSpace: { connect: [{ where: { node: { id_EQ: $spaceId } } }] }\n      }\n    ) {\n      fieldContexts {\n        id\n        title\n        space {\n          id\n          name\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createGoalPulses($input: [GoalPulseCreateInput!]!) {\n    createGoalPulses(input: $input) {\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n        status\n        horizon\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation createGoalPulses($input: [GoalPulseCreateInput!]!) {\n    createGoalPulses(input: $input) {\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n        status\n        horizon\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation updateGoalPulses(\n    $where: GoalPulseWhere!\n    $update: GoalPulseUpdateInput!\n  ) {\n    updateGoalPulses(where: $where, update: $update) {\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n        status\n        horizon\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation updateGoalPulses(\n    $where: GoalPulseWhere!\n    $update: GoalPulseUpdateInput!\n  ) {\n    updateGoalPulses(where: $where, update: $update) {\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n        status\n        horizon\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteGoalPulses($where: GoalPulseWhere!) {\n    deleteGoalPulses(where: $where) {\n      nodesDeleted\n    }\n  }\n'
): (typeof documents)['\n  mutation deleteGoalPulses($where: GoalPulseWhere!) {\n    deleteGoalPulses(where: $where) {\n      nodesDeleted\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        name\n        email\n        ownsSpaces {\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation CreatePeople($input: [PersonCreateInput!]!) {\n    createPeople(input: $input) {\n      people {\n        id\n        name\n        email\n        ownsSpaces {\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdatePerson($where: PersonWhere!, $update: PersonUpdateInput!) {\n    updatePeople(where: $where, update: $update) {\n      people {\n        id\n        name\n        email\n        ownsSpaces {\n          id\n          name\n          visibility\n          createdAt\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation UpdatePerson($where: PersonWhere!, $update: PersonUpdateInput!) {\n    updatePeople(where: $where, update: $update) {\n      people {\n        id\n        name\n        email\n        ownsSpaces {\n          id\n          name\n          visibility\n          createdAt\n        }\n      }\n    }\n  }\n']
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
  source: '\n  mutation InvitePerson($personId: String!) {\n    invitePerson(personId: $personId) {\n      id\n      name\n      email\n    }\n  }\n'
): (typeof documents)['\n  mutation InvitePerson($personId: String!) {\n    invitePerson(personId: $personId) {\n      id\n      name\n      email\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CancelInvite($personId: String!) {\n    cancelInvite(personId: $personId) {\n      id\n      name\n      email\n    }\n  }\n'
): (typeof documents)['\n  mutation CancelInvite($personId: String!) {\n    cancelInvite(personId: $personId) {\n      id\n      name\n      email\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ResolvePersonByEmail($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      name\n      email\n    }\n  }\n'
): (typeof documents)['\n  query ResolvePersonByEmail($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      name\n      email\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddSpaceMember($spaceId: ID!, $memberId: ID!, $role: SpaceRole!) {\n    addSpaceMember(spaceId: $spaceId, memberId: $memberId, role: $role) {\n      success\n      message\n      membership {\n        id\n        role\n        addedAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation AddSpaceMember($spaceId: ID!, $memberId: ID!, $role: SpaceRole!) {\n    addSpaceMember(spaceId: $spaceId, memberId: $memberId, role: $role) {\n      success\n      message\n      membership {\n        id\n        role\n        addedAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateSpaceMemberRole(\n    $spaceId: ID!\n    $memberId: ID!\n    $role: SpaceRole!\n  ) {\n    updateSpaceMemberRole(spaceId: $spaceId, memberId: $memberId, role: $role) {\n      success\n      message\n      membership {\n        id\n        role\n        addedAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  mutation UpdateSpaceMemberRole(\n    $spaceId: ID!\n    $memberId: ID!\n    $role: SpaceRole!\n  ) {\n    updateSpaceMemberRole(spaceId: $spaceId, memberId: $memberId, role: $role) {\n      success\n      message\n      membership {\n        id\n        role\n        addedAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RemoveSpaceMember($spaceId: ID!, $memberId: ID!) {\n    removeSpaceMember(spaceId: $spaceId, memberId: $memberId) {\n      success\n      message\n    }\n  }\n'
): (typeof documents)['\n  mutation RemoveSpaceMember($spaceId: ID!, $memberId: ID!) {\n    removeSpaceMember(spaceId: $spaceId, memberId: $memberId) {\n      success\n      message\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCommunity($id: ID!) {\n    communities(where: { id_EQ: $id }) {\n      id\n      name\n      type\n      members {\n        ... on Person {\n          id\n          name\n          email\n        }\n        ... on Community {\n          id\n          name\n          type\n        }\n      }\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getCommunity($id: ID!) {\n    communities(where: { id_EQ: $id }) {\n      id\n      name\n      type\n      members {\n        ... on Person {\n          id\n          name\n          email\n        }\n        ... on Community {\n          id\n          name\n          type\n        }\n      }\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllCommunites($where: CommunityWhere) {\n    communities(where: $where) {\n      id\n      name\n      type\n      members {\n        ... on Person {\n          id\n          name\n          email\n        }\n        ... on Community {\n          id\n          name\n          type\n        }\n      }\n      ownsSpaces {\n        id\n        name\n        visibility\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllCommunites($where: CommunityWhere) {\n    communities(where: $where) {\n      id\n      name\n      type\n      members {\n        ... on Person {\n          id\n          name\n          email\n        }\n        ... on Community {\n          id\n          name\n          type\n        }\n      }\n      ownsSpaces {\n        id\n        name\n        visibility\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getCommunitiesAndTheirMembers {\n    communities {\n      id\n      name\n      type\n    }\n  }\n'
): (typeof documents)['\n  query getCommunitiesAndTheirMembers {\n    communities {\n      id\n      name\n      type\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPeopleNotInCommunities {\n    people {\n      id\n      name\n      email\n    }\n  }\n'
): (typeof documents)['\n  query getPeopleNotInCommunities {\n    people {\n      id\n      name\n      email\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getLoggedInUser($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getLoggedInUser($email: String!) {\n    people(where: { email_EQ: $email }) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getFieldContextDetails($contextId: ID!) {\n    fieldContexts(where: { id_EQ: $contextId }) {\n      id\n      title\n      emergentName\n      createdAt\n      pulses {\n        __typename\n        id\n        title\n        content\n        createdAt\n      }\n      space {\n        id\n        name\n        visibility\n        ... on MeSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n        ... on WeSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getFieldContextDetails($contextId: ID!) {\n    fieldContexts(where: { id_EQ: $contextId }) {\n      id\n      title\n      emergentName\n      createdAt\n      pulses {\n        __typename\n        id\n        title\n        content\n        createdAt\n      }\n      space {\n        id\n        name\n        visibility\n        ... on MeSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n        ... on WeSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetFieldContexts($where: FieldContextWhere) {\n    fieldContexts(where: $where) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetFieldContexts($where: FieldContextWhere) {\n    fieldContexts(where: $where) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetMeSpaceFields {\n    meSpaces {\n      id\n      name\n      owner {\n        id\n        firstName\n        lastName\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetMeSpaceFields {\n    meSpaces {\n      id\n      name\n      owner {\n        id\n        firstName\n        lastName\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetFieldsForSpace($spaceId: ID!) {\n    fieldContexts(\n      where: {\n        OR: [\n          { meSpace_SOME: { id_EQ: $spaceId } }\n          { weSpace_SOME: { id_EQ: $spaceId } }\n        ]\n      }\n    ) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetFieldsForSpace($spaceId: ID!) {\n    fieldContexts(\n      where: {\n        OR: [\n          { meSpace_SOME: { id_EQ: $spaceId } }\n          { weSpace_SOME: { id_EQ: $spaceId } }\n        ]\n      }\n    ) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetFieldContextById($id: ID!) {\n    fieldContexts(where: { id_EQ: $id }) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetFieldContextById($id: ID!) {\n    fieldContexts(where: { id_EQ: $id }) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetFieldsForSpacePaginated($spaceId: ID!, $offset: Int, $limit: Int) {\n    fieldContexts(\n      where: {\n        OR: [\n          { meSpace_SOME: { id_EQ: $spaceId } }\n          { weSpace_SOME: { id_EQ: $spaceId } }\n        ]\n      }\n      offset: $offset\n      limit: $limit\n    ) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetFieldsForSpacePaginated($spaceId: ID!, $offset: Int, $limit: Int) {\n    fieldContexts(\n      where: {\n        OR: [\n          { meSpace_SOME: { id_EQ: $spaceId } }\n          { weSpace_SOME: { id_EQ: $spaceId } }\n        ]\n      }\n      offset: $offset\n      limit: $limit\n    ) {\n      id\n      title\n      emergentName\n      createdAt\n      space {\n        id\n        name\n        visibility\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetAllPulses {\n    goalPulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    resourcePulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    storyPulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetAllPulses {\n    goalPulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    resourcePulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    storyPulses {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetAllFieldContexts {\n    fieldContexts {\n      id\n      title\n      emergentName\n      createdAt\n      meSpace {\n        id\n        name\n        visibility\n      }\n      weSpace {\n        id\n        name\n        visibility\n      }\n      pulses {\n        ... on GoalPulse {\n          __typename\n          id\n          createdAt\n        }\n        ... on ResourcePulse {\n          __typename\n          id\n          createdAt\n        }\n        ... on StoryPulse {\n          __typename\n          id\n          createdAt\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetAllFieldContexts {\n    fieldContexts {\n      id\n      title\n      emergentName\n      createdAt\n      meSpace {\n        id\n        name\n        visibility\n      }\n      weSpace {\n        id\n        name\n        visibility\n      }\n      pulses {\n        ... on GoalPulse {\n          __typename\n          id\n          createdAt\n        }\n        ... on ResourcePulse {\n          __typename\n          id\n          createdAt\n        }\n        ... on StoryPulse {\n          __typename\n          id\n          createdAt\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetAllMeSpaces {\n    meSpaces {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetAllMeSpaces {\n    meSpaces {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetAllWeSpaces {\n    weSpaces {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetAllWeSpaces {\n    weSpaces {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPerson($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPersonProfile($personId: ID!) {\n    people(where: { id_EQ: $personId }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      ownsSpaces {\n        ... on MeSpace {\n          id\n          name\n          visibility\n          createdAt\n          contexts {\n            id\n            title\n            pulses {\n              id\n              title\n              intensity\n            }\n          }\n        }\n        ... on WeSpace {\n          id\n          name\n          visibility\n          createdAt\n          contexts {\n            id\n            title\n            pulses {\n              id\n              title\n              intensity\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPersonProfile($personId: ID!) {\n    people(where: { id_EQ: $personId }) {\n      id\n      firstName\n      lastName\n      name\n      email\n      ownsSpaces {\n        ... on MeSpace {\n          id\n          name\n          visibility\n          createdAt\n          contexts {\n            id\n            title\n            pulses {\n              id\n              title\n              intensity\n            }\n          }\n        }\n        ... on WeSpace {\n          id\n          name\n          visibility\n          createdAt\n          contexts {\n            id\n            title\n            pulses {\n              id\n              title\n              intensity\n            }\n          }\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAllPeople($where: PersonWhere) {\n    people(where: $where) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getAllPeople($where: PersonWhere) {\n    people(where: $where) {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n        visibility\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPeopleAndTheirGoals($personWhere: PersonWhere, $goalLimit: Int) {\n    people(where: $personWhere) {\n      id\n      name\n      ownsSpaces {\n        id\n        name\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPeopleAndTheirGoals($personWhere: PersonWhere, $goalLimit: Int) {\n    people(where: $personWhere) {\n      id\n      name\n      ownsSpaces {\n        id\n        name\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPeopleAndTheirResources {\n    people {\n      name\n      id\n      email\n      ownsSpaces {\n        name\n        id\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPeopleAndTheirResources {\n    people {\n      name\n      id\n      email\n      ownsSpaces {\n        name\n        id\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPeopleAndTheirCoreValues {\n    people {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPeopleAndTheirCoreValues {\n    people {\n      id\n      name\n      email\n      ownsSpaces {\n        id\n        name\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getUserById($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      name\n      email\n    }\n  }\n'
): (typeof documents)['\n  query getUserById($id: ID!) {\n    people(where: { id_EQ: $id }) {\n      id\n      name\n      email\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPulseDetailsWithContext($pulseId: ID!) {\n    fieldPulses(where: { id_EQ: $pulseId }) {\n      id\n      title\n      content\n      createdAt\n      __typename\n      context {\n        id\n        title\n        emergentName\n        createdAt\n        pulses {\n          id\n          title\n          content\n          createdAt\n          __typename\n        }\n        meSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n        weSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPulseDetailsWithContext($pulseId: ID!) {\n    fieldPulses(where: { id_EQ: $pulseId }) {\n      id\n      title\n      content\n      createdAt\n      __typename\n      context {\n        id\n        title\n        emergentName\n        createdAt\n        pulses {\n          id\n          title\n          content\n          createdAt\n          __typename\n        }\n        meSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n        weSpace {\n          __typename\n          id\n          name\n          visibility\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPulseDetails($pulseId: ID!) {\n    goalPulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      status\n      horizon\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        name\n        email\n      }\n    }\n    resourcePulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      resourceType\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    storyPulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getPulseDetails($pulseId: ID!) {\n    goalPulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      status\n      horizon\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        name\n        email\n      }\n    }\n    resourcePulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      resourceType\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n    storyPulses(where: { id_EQ: $pulseId }) {\n      __typename\n      id\n      content\n      createdAt\n      intensity\n      context {\n        id\n        title\n      }\n      createdBy {\n        id\n        firstName\n        lastName\n        email\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query SearchAll($query: String!) {\n    searchAll(query: $query) {\n      people {\n        id\n        firstName\n        lastName\n        email\n      }\n      contexts {\n        id\n        title\n      }\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      resourcePulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      storyPulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      meSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n      weSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n      communities {\n        id\n        name\n        type\n      }\n    }\n  }\n'
): (typeof documents)['\n  query SearchAll($query: String!) {\n    searchAll(query: $query) {\n      people {\n        id\n        firstName\n        lastName\n        email\n      }\n      contexts {\n        id\n        title\n      }\n      goalPulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      resourcePulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      storyPulses {\n        id\n        content\n        createdAt\n        intensity\n      }\n      meSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n      weSpaces {\n        id\n        name\n        visibility\n        createdAt\n      }\n      communities {\n        id\n        name\n        type\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getSpaceDetailsComplete($spaceId: ID!) {\n    spaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      ... on MeSpace {\n        id\n        name\n        visibility\n        createdAt\n        owner {\n          __typename\n          id\n          firstName\n          lastName\n          email\n        }\n        members {\n          id\n          role\n          addedAt\n          member {\n            __typename\n            id\n            firstName\n            lastName\n            email\n          }\n        }\n        contexts {\n          id\n          title\n          emergentName\n          createdAt\n          pulses {\n            __typename\n            id\n            title\n            intensity\n          }\n        }\n      }\n      ... on WeSpace {\n        id\n        name\n        visibility\n        createdAt\n        owner {\n          __typename\n          id\n          firstName\n          lastName\n          email\n        }\n        members {\n          id\n          role\n          addedAt\n          member {\n            __typename\n            id\n            firstName\n            lastName\n            email\n          }\n        }\n        contexts {\n          id\n          title\n          emergentName\n          createdAt\n          pulses {\n            __typename\n            id\n            title\n            intensity\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query getSpaceDetailsComplete($spaceId: ID!) {\n    spaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      ... on MeSpace {\n        id\n        name\n        visibility\n        createdAt\n        owner {\n          __typename\n          id\n          firstName\n          lastName\n          email\n        }\n        members {\n          id\n          role\n          addedAt\n          member {\n            __typename\n            id\n            firstName\n            lastName\n            email\n          }\n        }\n        contexts {\n          id\n          title\n          emergentName\n          createdAt\n          pulses {\n            __typename\n            id\n            title\n            intensity\n          }\n        }\n      }\n      ... on WeSpace {\n        id\n        name\n        visibility\n        createdAt\n        owner {\n          __typename\n          id\n          firstName\n          lastName\n          email\n        }\n        members {\n          id\n          role\n          addedAt\n          member {\n            __typename\n            id\n            firstName\n            lastName\n            email\n          }\n        }\n        contexts {\n          id\n          title\n          emergentName\n          createdAt\n          pulses {\n            __typename\n            id\n            title\n            intensity\n          }\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetUserMeSpaces {\n    meSpaces {\n      id\n      name\n      visibility\n      createdAt\n      contexts {\n        id\n        title\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetUserMeSpaces {\n    meSpaces {\n      id\n      name\n      visibility\n      createdAt\n      contexts {\n        id\n        title\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetUserWeSpaces {\n    weSpaces {\n      id\n      name\n      visibility\n      createdAt\n      members {\n        id\n        role\n      }\n      contexts {\n        id\n        title\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetUserWeSpaces {\n    weSpaces {\n      id\n      name\n      visibility\n      createdAt\n      members {\n        id\n        role\n      }\n      contexts {\n        id\n        title\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetSpaceMembers($spaceId: ID!) {\n    meSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n    }\n    weSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetSpaceMembers($spaceId: ID!) {\n    meSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n    }\n    weSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetWeSpaceDetails($spaceId: ID!) {\n    weSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetWeSpaceDetails($spaceId: ID!) {\n    weSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetMeSpaceDetails($spaceId: ID!) {\n    meSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n'
): (typeof documents)['\n  query GetMeSpaceDetails($spaceId: ID!) {\n    meSpaces(where: { id_EQ: $spaceId }) {\n      id\n      name\n      visibility\n      createdAt\n      owner {\n        id\n        firstName\n        lastName\n        email\n      }\n      members {\n        id\n        role\n        addedAt\n        member {\n          id\n          firstName\n          lastName\n          email\n        }\n      }\n      contexts {\n        id\n        title\n        emergentName\n        createdAt\n      }\n    }\n  }\n']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
