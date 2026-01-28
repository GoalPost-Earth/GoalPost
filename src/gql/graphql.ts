/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never
    }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  /** A date and time, represented as an ISO-8601 string */
  DateTime: { input: any; output: any }
}

/** Response when adding a member to a space. */
export type AddSpaceMemberResponse = {
  __typename?: 'AddSpaceMemberResponse'
  membership?: Maybe<SpaceMembership>
  message: Scalars['String']['output']
  success: Scalars['Boolean']['output']
}

export type AddSpaceMemberResponseAggregate = {
  __typename?: 'AddSpaceMemberResponseAggregate'
  count: Count
  node: AddSpaceMemberResponseAggregateNode
}

export type AddSpaceMemberResponseAggregateNode = {
  __typename?: 'AddSpaceMemberResponseAggregateNode'
  message: StringAggregateSelection
}

export type AddSpaceMemberResponseAggregateSelection = {
  __typename?: 'AddSpaceMemberResponseAggregateSelection'
  count: Scalars['Int']['output']
  message: StringAggregateSelection
}

export type AddSpaceMemberResponseCreateInput = {
  message: Scalars['String']['input']
  success: Scalars['Boolean']['input']
}

export type AddSpaceMemberResponseEdge = {
  __typename?: 'AddSpaceMemberResponseEdge'
  cursor: Scalars['String']['output']
  node: AddSpaceMemberResponse
}

/** Fields to sort AddSpaceMemberResponses by. The order in which sorts are applied is not guaranteed when specifying many fields in one AddSpaceMemberResponseSort object. */
export type AddSpaceMemberResponseSort = {
  message?: InputMaybe<SortDirection>
  success?: InputMaybe<SortDirection>
}

export type AddSpaceMemberResponseUpdateInput = {
  message_SET?: InputMaybe<Scalars['String']['input']>
  success_SET?: InputMaybe<Scalars['Boolean']['input']>
}

export type AddSpaceMemberResponseWhere = {
  AND?: InputMaybe<Array<AddSpaceMemberResponseWhere>>
  NOT?: InputMaybe<AddSpaceMemberResponseWhere>
  OR?: InputMaybe<Array<AddSpaceMemberResponseWhere>>
  message_CONTAINS?: InputMaybe<Scalars['String']['input']>
  message_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  message_EQ?: InputMaybe<Scalars['String']['input']>
  message_IN?: InputMaybe<Array<Scalars['String']['input']>>
  message_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  success_EQ?: InputMaybe<Scalars['Boolean']['input']>
}

export type AddSpaceMemberResponsesConnection = {
  __typename?: 'AddSpaceMemberResponsesConnection'
  aggregate: AddSpaceMemberResponseAggregate
  edges: Array<AddSpaceMemberResponseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/** Response from the chatbot containing the message and session ID. */
export type ChatbotResponse = {
  __typename?: 'ChatbotResponse'
  message: Scalars['String']['output']
  sessionId: Scalars['String']['output']
}

export type ChatbotResponseAggregate = {
  __typename?: 'ChatbotResponseAggregate'
  count: Count
  node: ChatbotResponseAggregateNode
}

export type ChatbotResponseAggregateNode = {
  __typename?: 'ChatbotResponseAggregateNode'
  message: StringAggregateSelection
  sessionId: StringAggregateSelection
}

export type ChatbotResponseAggregateSelection = {
  __typename?: 'ChatbotResponseAggregateSelection'
  count: Scalars['Int']['output']
  message: StringAggregateSelection
  sessionId: StringAggregateSelection
}

export type ChatbotResponseCreateInput = {
  message: Scalars['String']['input']
  sessionId: Scalars['String']['input']
}

export type ChatbotResponseEdge = {
  __typename?: 'ChatbotResponseEdge'
  cursor: Scalars['String']['output']
  node: ChatbotResponse
}

/** Fields to sort ChatbotResponses by. The order in which sorts are applied is not guaranteed when specifying many fields in one ChatbotResponseSort object. */
export type ChatbotResponseSort = {
  message?: InputMaybe<SortDirection>
  sessionId?: InputMaybe<SortDirection>
}

export type ChatbotResponseUpdateInput = {
  message_SET?: InputMaybe<Scalars['String']['input']>
  sessionId_SET?: InputMaybe<Scalars['String']['input']>
}

export type ChatbotResponseWhere = {
  AND?: InputMaybe<Array<ChatbotResponseWhere>>
  NOT?: InputMaybe<ChatbotResponseWhere>
  OR?: InputMaybe<Array<ChatbotResponseWhere>>
  message_CONTAINS?: InputMaybe<Scalars['String']['input']>
  message_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  message_EQ?: InputMaybe<Scalars['String']['input']>
  message_IN?: InputMaybe<Array<Scalars['String']['input']>>
  message_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  sessionId_CONTAINS?: InputMaybe<Scalars['String']['input']>
  sessionId_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  sessionId_EQ?: InputMaybe<Scalars['String']['input']>
  sessionId_IN?: InputMaybe<Array<Scalars['String']['input']>>
  sessionId_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type ChatbotResponsesConnection = {
  __typename?: 'ChatbotResponsesConnection'
  aggregate: ChatbotResponseAggregate
  edges: Array<ChatbotResponseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunitiesConnection = {
  __typename?: 'CommunitiesConnection'
  aggregate: CommunityAggregate
  edges: Array<CommunityEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/**
 * A collective identity (team, family, cohort, etc).
 * Has members and can own spaces and initiate pulses.
 * Multi-label: ["Community"]
 */
export type Community = {
  __typename?: 'Community'
  id: Scalars['ID']['output']
  members: Array<LifeSensor>
  membersConnection: CommunityMembersConnection
  name: Scalars['String']['output']
  ownsSpaces: Array<Space>
  /** @deprecated Please use field "aggregate" inside "ownsSpacesConnection" instead */
  ownsSpacesAggregate?: Maybe<CommunitySpaceOwnsSpacesAggregationSelection>
  ownsSpacesConnection: CommunityOwnsSpacesConnection
  type?: Maybe<Scalars['String']['output']>
}

/**
 * A collective identity (team, family, cohort, etc).
 * Has members and can own spaces and initiate pulses.
 * Multi-label: ["Community"]
 */
export type CommunityMembersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<LifeSensorWhere>
}

/**
 * A collective identity (team, family, cohort, etc).
 * Has members and can own spaces and initiate pulses.
 * Multi-label: ["Community"]
 */
export type CommunityMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<CommunityMembersConnectionWhere>
}

/**
 * A collective identity (team, family, cohort, etc).
 * Has members and can own spaces and initiate pulses.
 * Multi-label: ["Community"]
 */
export type CommunityOwnsSpacesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceSort>>
  where?: InputMaybe<SpaceWhere>
}

/**
 * A collective identity (team, family, cohort, etc).
 * Has members and can own spaces and initiate pulses.
 * Multi-label: ["Community"]
 */
export type CommunityOwnsSpacesAggregateArgs = {
  where?: InputMaybe<SpaceWhere>
}

/**
 * A collective identity (team, family, cohort, etc).
 * Has members and can own spaces and initiate pulses.
 * Multi-label: ["Community"]
 */
export type CommunityOwnsSpacesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunityOwnsSpacesConnectionSort>>
  where?: InputMaybe<CommunityOwnsSpacesConnectionWhere>
}

export type CommunityAggregate = {
  __typename?: 'CommunityAggregate'
  count: Count
  node: CommunityAggregateNode
}

export type CommunityAggregateNode = {
  __typename?: 'CommunityAggregateNode'
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
  type: StringAggregateSelection
}

export type CommunityAggregateSelection = {
  __typename?: 'CommunityAggregateSelection'
  count: Scalars['Int']['output']
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
  type: StringAggregateSelection
}

export type CommunityConnectInput = {
  members?: InputMaybe<CommunityMembersConnectInput>
  ownsSpaces?: InputMaybe<Array<CommunityOwnsSpacesConnectFieldInput>>
}

export type CommunityConnectWhere = {
  node: CommunityWhere
}

export type CommunityCreateInput = {
  members?: InputMaybe<CommunityMembersCreateInput>
  name: Scalars['String']['input']
  ownsSpaces?: InputMaybe<CommunityOwnsSpacesFieldInput>
  type?: InputMaybe<Scalars['String']['input']>
}

export type CommunityDeleteInput = {
  members?: InputMaybe<CommunityMembersDeleteInput>
  ownsSpaces?: InputMaybe<Array<CommunityOwnsSpacesDeleteFieldInput>>
}

export type CommunityDisconnectInput = {
  members?: InputMaybe<CommunityMembersDisconnectInput>
  ownsSpaces?: InputMaybe<Array<CommunityOwnsSpacesDisconnectFieldInput>>
}

export type CommunityEdge = {
  __typename?: 'CommunityEdge'
  cursor: Scalars['String']['output']
  node: Community
}

export type CommunityMembersCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type CommunityMembersCommunityConnectionWhere = {
  AND?: InputMaybe<Array<CommunityMembersCommunityConnectionWhere>>
  NOT?: InputMaybe<CommunityMembersCommunityConnectionWhere>
  OR?: InputMaybe<Array<CommunityMembersCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type CommunityMembersCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type CommunityMembersCommunityDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<CommunityMembersCommunityConnectionWhere>
}

export type CommunityMembersCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<CommunityMembersCommunityConnectionWhere>
}

export type CommunityMembersCommunityFieldInput = {
  connect?: InputMaybe<Array<CommunityMembersCommunityConnectFieldInput>>
  create?: InputMaybe<Array<CommunityMembersCommunityCreateFieldInput>>
}

export type CommunityMembersCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<CommunityMembersCommunityConnectionWhere>
}

export type CommunityMembersCommunityUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityMembersCommunityConnectFieldInput>>
  create?: InputMaybe<Array<CommunityMembersCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityMembersCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CommunityMembersCommunityDisconnectFieldInput>>
  update?: InputMaybe<CommunityMembersCommunityUpdateConnectionInput>
}

export type CommunityMembersConnectInput = {
  Community?: InputMaybe<Array<CommunityMembersCommunityConnectFieldInput>>
  Person?: InputMaybe<Array<CommunityMembersPersonConnectFieldInput>>
}

export type CommunityMembersConnection = {
  __typename?: 'CommunityMembersConnection'
  edges: Array<CommunityMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityMembersConnectionWhere = {
  Community?: InputMaybe<CommunityMembersCommunityConnectionWhere>
  Person?: InputMaybe<CommunityMembersPersonConnectionWhere>
}

export type CommunityMembersCreateInput = {
  Community?: InputMaybe<CommunityMembersCommunityFieldInput>
  Person?: InputMaybe<CommunityMembersPersonFieldInput>
}

export type CommunityMembersDeleteInput = {
  Community?: InputMaybe<Array<CommunityMembersCommunityDeleteFieldInput>>
  Person?: InputMaybe<Array<CommunityMembersPersonDeleteFieldInput>>
}

export type CommunityMembersDisconnectInput = {
  Community?: InputMaybe<Array<CommunityMembersCommunityDisconnectFieldInput>>
  Person?: InputMaybe<Array<CommunityMembersPersonDisconnectFieldInput>>
}

export type CommunityMembersPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type CommunityMembersPersonConnectionWhere = {
  AND?: InputMaybe<Array<CommunityMembersPersonConnectionWhere>>
  NOT?: InputMaybe<CommunityMembersPersonConnectionWhere>
  OR?: InputMaybe<Array<CommunityMembersPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type CommunityMembersPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type CommunityMembersPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<CommunityMembersPersonConnectionWhere>
}

export type CommunityMembersPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<CommunityMembersPersonConnectionWhere>
}

export type CommunityMembersPersonFieldInput = {
  connect?: InputMaybe<Array<CommunityMembersPersonConnectFieldInput>>
  create?: InputMaybe<Array<CommunityMembersPersonCreateFieldInput>>
}

export type CommunityMembersPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<CommunityMembersPersonConnectionWhere>
}

export type CommunityMembersPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityMembersPersonConnectFieldInput>>
  create?: InputMaybe<Array<CommunityMembersPersonCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityMembersPersonDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CommunityMembersPersonDisconnectFieldInput>>
  update?: InputMaybe<CommunityMembersPersonUpdateConnectionInput>
}

export type CommunityMembersRelationship = {
  __typename?: 'CommunityMembersRelationship'
  cursor: Scalars['String']['output']
  node: LifeSensor
}

export type CommunityMembersUpdateInput = {
  Community?: InputMaybe<Array<CommunityMembersCommunityUpdateFieldInput>>
  Person?: InputMaybe<Array<CommunityMembersPersonUpdateFieldInput>>
}

export type CommunityOwnsSpacesAggregateInput = {
  AND?: InputMaybe<Array<CommunityOwnsSpacesAggregateInput>>
  NOT?: InputMaybe<CommunityOwnsSpacesAggregateInput>
  OR?: InputMaybe<Array<CommunityOwnsSpacesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CommunityOwnsSpacesNodeAggregationWhereInput>
}

export type CommunityOwnsSpacesConnectFieldInput = {
  where?: InputMaybe<SpaceConnectWhere>
}

export type CommunityOwnsSpacesConnection = {
  __typename?: 'CommunityOwnsSpacesConnection'
  aggregate: CommunitySpaceOwnsSpacesAggregateSelection
  edges: Array<CommunityOwnsSpacesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityOwnsSpacesConnectionSort = {
  node?: InputMaybe<SpaceSort>
}

export type CommunityOwnsSpacesConnectionWhere = {
  AND?: InputMaybe<Array<CommunityOwnsSpacesConnectionWhere>>
  NOT?: InputMaybe<CommunityOwnsSpacesConnectionWhere>
  OR?: InputMaybe<Array<CommunityOwnsSpacesConnectionWhere>>
  node?: InputMaybe<SpaceWhere>
}

export type CommunityOwnsSpacesCreateFieldInput = {
  node: SpaceCreateInput
}

export type CommunityOwnsSpacesDeleteFieldInput = {
  where?: InputMaybe<CommunityOwnsSpacesConnectionWhere>
}

export type CommunityOwnsSpacesDisconnectFieldInput = {
  where?: InputMaybe<CommunityOwnsSpacesConnectionWhere>
}

export type CommunityOwnsSpacesFieldInput = {
  connect?: InputMaybe<Array<CommunityOwnsSpacesConnectFieldInput>>
  create?: InputMaybe<Array<CommunityOwnsSpacesCreateFieldInput>>
}

export type CommunityOwnsSpacesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CommunityOwnsSpacesNodeAggregationWhereInput>>
  NOT?: InputMaybe<CommunityOwnsSpacesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CommunityOwnsSpacesNodeAggregationWhereInput>>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  name_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  name_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CommunityOwnsSpacesRelationship = {
  __typename?: 'CommunityOwnsSpacesRelationship'
  cursor: Scalars['String']['output']
  node: Space
}

export type CommunityOwnsSpacesUpdateConnectionInput = {
  node?: InputMaybe<SpaceUpdateInput>
  where?: InputMaybe<CommunityOwnsSpacesConnectionWhere>
}

export type CommunityOwnsSpacesUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityOwnsSpacesConnectFieldInput>>
  create?: InputMaybe<Array<CommunityOwnsSpacesCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityOwnsSpacesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CommunityOwnsSpacesDisconnectFieldInput>>
  update?: InputMaybe<CommunityOwnsSpacesUpdateConnectionInput>
}

/** Fields to sort Communities by. The order in which sorts are applied is not guaranteed when specifying many fields in one CommunitySort object. */
export type CommunitySort = {
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  type?: InputMaybe<SortDirection>
}

export type CommunitySpaceOwnsSpacesAggregateSelection = {
  __typename?: 'CommunitySpaceOwnsSpacesAggregateSelection'
  count: CountConnection
  node?: Maybe<CommunitySpaceOwnsSpacesNodeAggregateSelection>
}

export type CommunitySpaceOwnsSpacesAggregationSelection = {
  __typename?: 'CommunitySpaceOwnsSpacesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunitySpaceOwnsSpacesNodeAggregateSelection>
}

export type CommunitySpaceOwnsSpacesNodeAggregateSelection = {
  __typename?: 'CommunitySpaceOwnsSpacesNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type CommunityUpdateInput = {
  members?: InputMaybe<CommunityMembersUpdateInput>
  name_SET?: InputMaybe<Scalars['String']['input']>
  ownsSpaces?: InputMaybe<Array<CommunityOwnsSpacesUpdateFieldInput>>
  type_SET?: InputMaybe<Scalars['String']['input']>
}

export type CommunityWhere = {
  AND?: InputMaybe<Array<CommunityWhere>>
  NOT?: InputMaybe<CommunityWhere>
  OR?: InputMaybe<Array<CommunityWhere>>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  /** Return Communities where all of the related CommunityMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<CommunityMembersConnectionWhere>
  /** Return Communities where none of the related CommunityMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<CommunityMembersConnectionWhere>
  /** Return Communities where one of the related CommunityMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<CommunityMembersConnectionWhere>
  /** Return Communities where some of the related CommunityMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<CommunityMembersConnectionWhere>
  /** Return Communities where all of the related LifeSensors match this filter */
  members_ALL?: InputMaybe<LifeSensorWhere>
  /** Return Communities where none of the related LifeSensors match this filter */
  members_NONE?: InputMaybe<LifeSensorWhere>
  /** Return Communities where one of the related LifeSensors match this filter */
  members_SINGLE?: InputMaybe<LifeSensorWhere>
  /** Return Communities where some of the related LifeSensors match this filter */
  members_SOME?: InputMaybe<LifeSensorWhere>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  ownsSpacesAggregate?: InputMaybe<CommunityOwnsSpacesAggregateInput>
  /** Return Communities where all of the related CommunityOwnsSpacesConnections match this filter */
  ownsSpacesConnection_ALL?: InputMaybe<CommunityOwnsSpacesConnectionWhere>
  /** Return Communities where none of the related CommunityOwnsSpacesConnections match this filter */
  ownsSpacesConnection_NONE?: InputMaybe<CommunityOwnsSpacesConnectionWhere>
  /** Return Communities where one of the related CommunityOwnsSpacesConnections match this filter */
  ownsSpacesConnection_SINGLE?: InputMaybe<CommunityOwnsSpacesConnectionWhere>
  /** Return Communities where some of the related CommunityOwnsSpacesConnections match this filter */
  ownsSpacesConnection_SOME?: InputMaybe<CommunityOwnsSpacesConnectionWhere>
  /** Return Communities where all of the related Spaces match this filter */
  ownsSpaces_ALL?: InputMaybe<SpaceWhere>
  /** Return Communities where none of the related Spaces match this filter */
  ownsSpaces_NONE?: InputMaybe<SpaceWhere>
  /** Return Communities where one of the related Spaces match this filter */
  ownsSpaces_SINGLE?: InputMaybe<SpaceWhere>
  /** Return Communities where some of the related Spaces match this filter */
  ownsSpaces_SOME?: InputMaybe<SpaceWhere>
  type_CONTAINS?: InputMaybe<Scalars['String']['input']>
  type_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  type_EQ?: InputMaybe<Scalars['String']['input']>
  type_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  type_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type Count = {
  __typename?: 'Count'
  nodes: Scalars['Int']['output']
}

export type CountConnection = {
  __typename?: 'CountConnection'
  edges: Scalars['Int']['output']
  nodes: Scalars['Int']['output']
}

export type CreateAddSpaceMemberResponsesMutationResponse = {
  __typename?: 'CreateAddSpaceMemberResponsesMutationResponse'
  addSpaceMemberResponses: Array<AddSpaceMemberResponse>
  info: CreateInfo
}

export type CreateChatbotResponsesMutationResponse = {
  __typename?: 'CreateChatbotResponsesMutationResponse'
  chatbotResponses: Array<ChatbotResponse>
  info: CreateInfo
}

export type CreateCommunitiesMutationResponse = {
  __typename?: 'CreateCommunitiesMutationResponse'
  communities: Array<Community>
  info: CreateInfo
}

export type CreateFieldContextsMutationResponse = {
  __typename?: 'CreateFieldContextsMutationResponse'
  fieldContexts: Array<FieldContext>
  info: CreateInfo
}

export type CreateFieldResonancesMutationResponse = {
  __typename?: 'CreateFieldResonancesMutationResponse'
  fieldResonances: Array<FieldResonance>
  info: CreateInfo
}

export type CreateGoalPulsesMutationResponse = {
  __typename?: 'CreateGoalPulsesMutationResponse'
  goalPulses: Array<GoalPulse>
  info: CreateInfo
}

/** Information about the number of nodes and relationships created during a create mutation */
export type CreateInfo = {
  __typename?: 'CreateInfo'
  nodesCreated: Scalars['Int']['output']
  relationshipsCreated: Scalars['Int']['output']
}

export type CreateMeSpacesMutationResponse = {
  __typename?: 'CreateMeSpacesMutationResponse'
  info: CreateInfo
  meSpaces: Array<MeSpace>
}

export type CreatePeopleMutationResponse = {
  __typename?: 'CreatePeopleMutationResponse'
  info: CreateInfo
  people: Array<Person>
}

export type CreateRemoveSpaceMemberResponsesMutationResponse = {
  __typename?: 'CreateRemoveSpaceMemberResponsesMutationResponse'
  info: CreateInfo
  removeSpaceMemberResponses: Array<RemoveSpaceMemberResponse>
}

export type CreateResonanceLinksMutationResponse = {
  __typename?: 'CreateResonanceLinksMutationResponse'
  info: CreateInfo
  resonanceLinks: Array<ResonanceLink>
}

export type CreateResourcePulsesMutationResponse = {
  __typename?: 'CreateResourcePulsesMutationResponse'
  info: CreateInfo
  resourcePulses: Array<ResourcePulse>
}

export type CreateSearchResultsMutationResponse = {
  __typename?: 'CreateSearchResultsMutationResponse'
  info: CreateInfo
  searchResults: Array<SearchResults>
}

export type CreateSpaceMembershipsMutationResponse = {
  __typename?: 'CreateSpaceMembershipsMutationResponse'
  info: CreateInfo
  spaceMemberships: Array<SpaceMembership>
}

export type CreateStoryPulsesMutationResponse = {
  __typename?: 'CreateStoryPulsesMutationResponse'
  info: CreateInfo
  storyPulses: Array<StoryPulse>
}

export type CreateUpdateSpaceMemberRoleResponsesMutationResponse = {
  __typename?: 'CreateUpdateSpaceMemberRoleResponsesMutationResponse'
  info: CreateInfo
  updateSpaceMemberRoleResponses: Array<UpdateSpaceMemberRoleResponse>
}

export type CreateWeSpacesMutationResponse = {
  __typename?: 'CreateWeSpacesMutationResponse'
  info: CreateInfo
  weSpaces: Array<WeSpace>
}

export type DateTimeAggregateSelection = {
  __typename?: 'DateTimeAggregateSelection'
  max?: Maybe<Scalars['DateTime']['output']>
  min?: Maybe<Scalars['DateTime']['output']>
}

/** Information about the number of nodes and relationships deleted during a delete mutation */
export type DeleteInfo = {
  __typename?: 'DeleteInfo'
  nodesDeleted: Scalars['Int']['output']
  relationshipsDeleted: Scalars['Int']['output']
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContext = {
  __typename?: 'FieldContext'
  createdAt: Scalars['DateTime']['output']
  emergentName?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  pulses: Array<FieldPulse>
  /** @deprecated Please use field "aggregate" inside "pulsesConnection" instead */
  pulsesAggregate?: Maybe<FieldContextFieldPulsePulsesAggregationSelection>
  pulsesConnection: FieldContextPulsesConnection
  space: Array<Space>
  /** @deprecated Please use field "aggregate" inside "spaceConnection" instead */
  spaceAggregate?: Maybe<FieldContextSpaceSpaceAggregationSelection>
  spaceConnection: FieldContextSpaceConnection
  title: Scalars['String']['output']
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextPulsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseSort>>
  where?: InputMaybe<FieldPulseWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextPulsesAggregateArgs = {
  where?: InputMaybe<FieldPulseWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextPulsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextPulsesConnectionSort>>
  where?: InputMaybe<FieldContextPulsesConnectionWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextSpaceArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceSort>>
  where?: InputMaybe<SpaceWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextSpaceAggregateArgs = {
  where?: InputMaybe<SpaceWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextSpaceConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSpaceConnectionSort>>
  where?: InputMaybe<FieldContextSpaceConnectionWhere>
}

export type FieldContextAggregate = {
  __typename?: 'FieldContextAggregate'
  count: Count
  node: FieldContextAggregateNode
}

export type FieldContextAggregateNode = {
  __typename?: 'FieldContextAggregateNode'
  createdAt: DateTimeAggregateSelection
  emergentName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  title: StringAggregateSelection
}

export type FieldContextAggregateSelection = {
  __typename?: 'FieldContextAggregateSelection'
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  emergentName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  title: StringAggregateSelection
}

export type FieldContextConnectInput = {
  pulses?: InputMaybe<Array<FieldContextPulsesConnectFieldInput>>
  space?: InputMaybe<Array<FieldContextSpaceConnectFieldInput>>
}

export type FieldContextConnectWhere = {
  node: FieldContextWhere
}

export type FieldContextCreateInput = {
  createdAt: Scalars['DateTime']['input']
  emergentName?: InputMaybe<Scalars['String']['input']>
  pulses?: InputMaybe<FieldContextPulsesFieldInput>
  space?: InputMaybe<FieldContextSpaceFieldInput>
  title: Scalars['String']['input']
}

export type FieldContextDeleteInput = {
  pulses?: InputMaybe<Array<FieldContextPulsesDeleteFieldInput>>
  space?: InputMaybe<Array<FieldContextSpaceDeleteFieldInput>>
}

export type FieldContextDisconnectInput = {
  pulses?: InputMaybe<Array<FieldContextPulsesDisconnectFieldInput>>
  space?: InputMaybe<Array<FieldContextSpaceDisconnectFieldInput>>
}

export type FieldContextEdge = {
  __typename?: 'FieldContextEdge'
  cursor: Scalars['String']['output']
  node: FieldContext
}

export type FieldContextFieldPulsePulsesAggregateSelection = {
  __typename?: 'FieldContextFieldPulsePulsesAggregateSelection'
  count: CountConnection
  node?: Maybe<FieldContextFieldPulsePulsesNodeAggregateSelection>
}

export type FieldContextFieldPulsePulsesAggregationSelection = {
  __typename?: 'FieldContextFieldPulsePulsesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<FieldContextFieldPulsePulsesNodeAggregateSelection>
}

export type FieldContextFieldPulsePulsesNodeAggregateSelection = {
  __typename?: 'FieldContextFieldPulsePulsesNodeAggregateSelection'
  content: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type FieldContextPulsesAggregateInput = {
  AND?: InputMaybe<Array<FieldContextPulsesAggregateInput>>
  NOT?: InputMaybe<FieldContextPulsesAggregateInput>
  OR?: InputMaybe<Array<FieldContextPulsesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<FieldContextPulsesNodeAggregationWhereInput>
}

export type FieldContextPulsesConnectFieldInput = {
  connect?: InputMaybe<FieldPulseConnectInput>
  where?: InputMaybe<FieldPulseConnectWhere>
}

export type FieldContextPulsesConnection = {
  __typename?: 'FieldContextPulsesConnection'
  aggregate: FieldContextFieldPulsePulsesAggregateSelection
  edges: Array<FieldContextPulsesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type FieldContextPulsesConnectionSort = {
  node?: InputMaybe<FieldPulseSort>
}

export type FieldContextPulsesConnectionWhere = {
  AND?: InputMaybe<Array<FieldContextPulsesConnectionWhere>>
  NOT?: InputMaybe<FieldContextPulsesConnectionWhere>
  OR?: InputMaybe<Array<FieldContextPulsesConnectionWhere>>
  node?: InputMaybe<FieldPulseWhere>
}

export type FieldContextPulsesCreateFieldInput = {
  node: FieldPulseCreateInput
}

export type FieldContextPulsesDeleteFieldInput = {
  delete?: InputMaybe<FieldPulseDeleteInput>
  where?: InputMaybe<FieldContextPulsesConnectionWhere>
}

export type FieldContextPulsesDisconnectFieldInput = {
  disconnect?: InputMaybe<FieldPulseDisconnectInput>
  where?: InputMaybe<FieldContextPulsesConnectionWhere>
}

export type FieldContextPulsesFieldInput = {
  connect?: InputMaybe<Array<FieldContextPulsesConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextPulsesCreateFieldInput>>
}

export type FieldContextPulsesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<FieldContextPulsesNodeAggregationWhereInput>>
  NOT?: InputMaybe<FieldContextPulsesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<FieldContextPulsesNodeAggregationWhereInput>>
  content_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  content_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  intensity_AVERAGE_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_LTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_LTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_LTE?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_LTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  title_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type FieldContextPulsesRelationship = {
  __typename?: 'FieldContextPulsesRelationship'
  cursor: Scalars['String']['output']
  node: FieldPulse
}

export type FieldContextPulsesUpdateConnectionInput = {
  node?: InputMaybe<FieldPulseUpdateInput>
  where?: InputMaybe<FieldContextPulsesConnectionWhere>
}

export type FieldContextPulsesUpdateFieldInput = {
  connect?: InputMaybe<Array<FieldContextPulsesConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextPulsesCreateFieldInput>>
  delete?: InputMaybe<Array<FieldContextPulsesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldContextPulsesDisconnectFieldInput>>
  update?: InputMaybe<FieldContextPulsesUpdateConnectionInput>
}

/** Fields to sort FieldContexts by. The order in which sorts are applied is not guaranteed when specifying many fields in one FieldContextSort object. */
export type FieldContextSort = {
  createdAt?: InputMaybe<SortDirection>
  emergentName?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  title?: InputMaybe<SortDirection>
}

export type FieldContextSpaceAggregateInput = {
  AND?: InputMaybe<Array<FieldContextSpaceAggregateInput>>
  NOT?: InputMaybe<FieldContextSpaceAggregateInput>
  OR?: InputMaybe<Array<FieldContextSpaceAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<FieldContextSpaceNodeAggregationWhereInput>
}

export type FieldContextSpaceConnectFieldInput = {
  where?: InputMaybe<SpaceConnectWhere>
}

export type FieldContextSpaceConnection = {
  __typename?: 'FieldContextSpaceConnection'
  aggregate: FieldContextSpaceSpaceAggregateSelection
  edges: Array<FieldContextSpaceRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type FieldContextSpaceConnectionSort = {
  node?: InputMaybe<SpaceSort>
}

export type FieldContextSpaceConnectionWhere = {
  AND?: InputMaybe<Array<FieldContextSpaceConnectionWhere>>
  NOT?: InputMaybe<FieldContextSpaceConnectionWhere>
  OR?: InputMaybe<Array<FieldContextSpaceConnectionWhere>>
  node?: InputMaybe<SpaceWhere>
}

export type FieldContextSpaceCreateFieldInput = {
  node: SpaceCreateInput
}

export type FieldContextSpaceDeleteFieldInput = {
  where?: InputMaybe<FieldContextSpaceConnectionWhere>
}

export type FieldContextSpaceDisconnectFieldInput = {
  where?: InputMaybe<FieldContextSpaceConnectionWhere>
}

export type FieldContextSpaceFieldInput = {
  connect?: InputMaybe<Array<FieldContextSpaceConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextSpaceCreateFieldInput>>
}

export type FieldContextSpaceNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<FieldContextSpaceNodeAggregationWhereInput>>
  NOT?: InputMaybe<FieldContextSpaceNodeAggregationWhereInput>
  OR?: InputMaybe<Array<FieldContextSpaceNodeAggregationWhereInput>>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  name_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  name_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type FieldContextSpaceRelationship = {
  __typename?: 'FieldContextSpaceRelationship'
  cursor: Scalars['String']['output']
  node: Space
}

export type FieldContextSpaceSpaceAggregateSelection = {
  __typename?: 'FieldContextSpaceSpaceAggregateSelection'
  count: CountConnection
  node?: Maybe<FieldContextSpaceSpaceNodeAggregateSelection>
}

export type FieldContextSpaceSpaceAggregationSelection = {
  __typename?: 'FieldContextSpaceSpaceAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<FieldContextSpaceSpaceNodeAggregateSelection>
}

export type FieldContextSpaceSpaceNodeAggregateSelection = {
  __typename?: 'FieldContextSpaceSpaceNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type FieldContextSpaceUpdateConnectionInput = {
  node?: InputMaybe<SpaceUpdateInput>
  where?: InputMaybe<FieldContextSpaceConnectionWhere>
}

export type FieldContextSpaceUpdateFieldInput = {
  connect?: InputMaybe<Array<FieldContextSpaceConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextSpaceCreateFieldInput>>
  delete?: InputMaybe<Array<FieldContextSpaceDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldContextSpaceDisconnectFieldInput>>
  update?: InputMaybe<FieldContextSpaceUpdateConnectionInput>
}

export type FieldContextUpdateInput = {
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  emergentName_SET?: InputMaybe<Scalars['String']['input']>
  pulses?: InputMaybe<Array<FieldContextPulsesUpdateFieldInput>>
  space?: InputMaybe<Array<FieldContextSpaceUpdateFieldInput>>
  title_SET?: InputMaybe<Scalars['String']['input']>
}

export type FieldContextWhere = {
  AND?: InputMaybe<Array<FieldContextWhere>>
  NOT?: InputMaybe<FieldContextWhere>
  OR?: InputMaybe<Array<FieldContextWhere>>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  emergentName_CONTAINS?: InputMaybe<Scalars['String']['input']>
  emergentName_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  emergentName_EQ?: InputMaybe<Scalars['String']['input']>
  emergentName_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  emergentName_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  pulsesAggregate?: InputMaybe<FieldContextPulsesAggregateInput>
  /** Return FieldContexts where all of the related FieldContextPulsesConnections match this filter */
  pulsesConnection_ALL?: InputMaybe<FieldContextPulsesConnectionWhere>
  /** Return FieldContexts where none of the related FieldContextPulsesConnections match this filter */
  pulsesConnection_NONE?: InputMaybe<FieldContextPulsesConnectionWhere>
  /** Return FieldContexts where one of the related FieldContextPulsesConnections match this filter */
  pulsesConnection_SINGLE?: InputMaybe<FieldContextPulsesConnectionWhere>
  /** Return FieldContexts where some of the related FieldContextPulsesConnections match this filter */
  pulsesConnection_SOME?: InputMaybe<FieldContextPulsesConnectionWhere>
  /** Return FieldContexts where all of the related FieldPulses match this filter */
  pulses_ALL?: InputMaybe<FieldPulseWhere>
  /** Return FieldContexts where none of the related FieldPulses match this filter */
  pulses_NONE?: InputMaybe<FieldPulseWhere>
  /** Return FieldContexts where one of the related FieldPulses match this filter */
  pulses_SINGLE?: InputMaybe<FieldPulseWhere>
  /** Return FieldContexts where some of the related FieldPulses match this filter */
  pulses_SOME?: InputMaybe<FieldPulseWhere>
  spaceAggregate?: InputMaybe<FieldContextSpaceAggregateInput>
  /** Return FieldContexts where all of the related FieldContextSpaceConnections match this filter */
  spaceConnection_ALL?: InputMaybe<FieldContextSpaceConnectionWhere>
  /** Return FieldContexts where none of the related FieldContextSpaceConnections match this filter */
  spaceConnection_NONE?: InputMaybe<FieldContextSpaceConnectionWhere>
  /** Return FieldContexts where one of the related FieldContextSpaceConnections match this filter */
  spaceConnection_SINGLE?: InputMaybe<FieldContextSpaceConnectionWhere>
  /** Return FieldContexts where some of the related FieldContextSpaceConnections match this filter */
  spaceConnection_SOME?: InputMaybe<FieldContextSpaceConnectionWhere>
  /** Return FieldContexts where all of the related Spaces match this filter */
  space_ALL?: InputMaybe<SpaceWhere>
  /** Return FieldContexts where none of the related Spaces match this filter */
  space_NONE?: InputMaybe<SpaceWhere>
  /** Return FieldContexts where one of the related Spaces match this filter */
  space_SINGLE?: InputMaybe<SpaceWhere>
  /** Return FieldContexts where some of the related Spaces match this filter */
  space_SOME?: InputMaybe<SpaceWhere>
  title_CONTAINS?: InputMaybe<Scalars['String']['input']>
  title_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  title_EQ?: InputMaybe<Scalars['String']['input']>
  title_IN?: InputMaybe<Array<Scalars['String']['input']>>
  title_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type FieldContextsConnection = {
  __typename?: 'FieldContextsConnection'
  aggregate: FieldContextAggregate
  edges: Array<FieldContextEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type FieldPulse = {
  content: Scalars['String']['output']
  context: Array<FieldContext>
  contextConnection: FieldPulseContextConnection
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  intensity?: Maybe<Scalars['Float']['output']>
  title: Scalars['String']['output']
}

export type FieldPulseContextArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

export type FieldPulseContextConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseContextConnectionSort>>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

export type FieldPulseAggregate = {
  __typename?: 'FieldPulseAggregate'
  count: Count
  node: FieldPulseAggregateNode
}

export type FieldPulseAggregateNode = {
  __typename?: 'FieldPulseAggregateNode'
  content: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type FieldPulseAggregateSelection = {
  __typename?: 'FieldPulseAggregateSelection'
  content: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type FieldPulseConnectInput = {
  context?: InputMaybe<Array<FieldPulseContextConnectFieldInput>>
}

export type FieldPulseConnectWhere = {
  node: FieldPulseWhere
}

export type FieldPulseContextAggregateInput = {
  AND?: InputMaybe<Array<FieldPulseContextAggregateInput>>
  NOT?: InputMaybe<FieldPulseContextAggregateInput>
  OR?: InputMaybe<Array<FieldPulseContextAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<FieldPulseContextNodeAggregationWhereInput>
}

export type FieldPulseContextConnectFieldInput = {
  connect?: InputMaybe<Array<FieldContextConnectInput>>
  where?: InputMaybe<FieldContextConnectWhere>
}

export type FieldPulseContextConnection = {
  __typename?: 'FieldPulseContextConnection'
  edges: Array<FieldPulseContextRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type FieldPulseContextConnectionSort = {
  node?: InputMaybe<FieldContextSort>
}

export type FieldPulseContextConnectionWhere = {
  AND?: InputMaybe<Array<FieldPulseContextConnectionWhere>>
  NOT?: InputMaybe<FieldPulseContextConnectionWhere>
  OR?: InputMaybe<Array<FieldPulseContextConnectionWhere>>
  node?: InputMaybe<FieldContextWhere>
}

export type FieldPulseContextCreateFieldInput = {
  node: FieldContextCreateInput
}

export type FieldPulseContextDeleteFieldInput = {
  delete?: InputMaybe<FieldContextDeleteInput>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

export type FieldPulseContextDisconnectFieldInput = {
  disconnect?: InputMaybe<FieldContextDisconnectInput>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

export type FieldPulseContextNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<FieldPulseContextNodeAggregationWhereInput>>
  NOT?: InputMaybe<FieldPulseContextNodeAggregationWhereInput>
  OR?: InputMaybe<Array<FieldPulseContextNodeAggregationWhereInput>>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  emergentName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  title_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type FieldPulseContextRelationship = {
  __typename?: 'FieldPulseContextRelationship'
  cursor: Scalars['String']['output']
  node: FieldContext
}

export type FieldPulseContextUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

export type FieldPulseContextUpdateFieldInput = {
  connect?: InputMaybe<Array<FieldPulseContextConnectFieldInput>>
  create?: InputMaybe<Array<FieldPulseContextCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseContextDisconnectFieldInput>>
  update?: InputMaybe<FieldPulseContextUpdateConnectionInput>
}

export type FieldPulseCreateInput = {
  GoalPulse?: InputMaybe<GoalPulseCreateInput>
  ResourcePulse?: InputMaybe<ResourcePulseCreateInput>
  StoryPulse?: InputMaybe<StoryPulseCreateInput>
}

export type FieldPulseDeleteInput = {
  context?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
}

export type FieldPulseDisconnectInput = {
  context?: InputMaybe<Array<FieldPulseContextDisconnectFieldInput>>
}

export type FieldPulseEdge = {
  __typename?: 'FieldPulseEdge'
  cursor: Scalars['String']['output']
  node: FieldPulse
}

export enum FieldPulseImplementation {
  GoalPulse = 'GoalPulse',
  ResourcePulse = 'ResourcePulse',
  StoryPulse = 'StoryPulse',
}

/** Fields to sort FieldPulses by. The order in which sorts are applied is not guaranteed when specifying many fields in one FieldPulseSort object. */
export type FieldPulseSort = {
  content?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  intensity?: InputMaybe<SortDirection>
  title?: InputMaybe<SortDirection>
}

export type FieldPulseUpdateInput = {
  content_SET?: InputMaybe<Scalars['String']['input']>
  context?: InputMaybe<Array<FieldPulseContextUpdateFieldInput>>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  id_SET?: InputMaybe<Scalars['ID']['input']>
  intensity_ADD?: InputMaybe<Scalars['Float']['input']>
  intensity_DIVIDE?: InputMaybe<Scalars['Float']['input']>
  intensity_MULTIPLY?: InputMaybe<Scalars['Float']['input']>
  intensity_SET?: InputMaybe<Scalars['Float']['input']>
  intensity_SUBTRACT?: InputMaybe<Scalars['Float']['input']>
  title_SET?: InputMaybe<Scalars['String']['input']>
}

export type FieldPulseWhere = {
  AND?: InputMaybe<Array<FieldPulseWhere>>
  NOT?: InputMaybe<FieldPulseWhere>
  OR?: InputMaybe<Array<FieldPulseWhere>>
  content_CONTAINS?: InputMaybe<Scalars['String']['input']>
  content_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  content_EQ?: InputMaybe<Scalars['String']['input']>
  content_IN?: InputMaybe<Array<Scalars['String']['input']>>
  content_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  contextAggregate?: InputMaybe<FieldPulseContextAggregateInput>
  /** Return FieldPulses where all of the related FieldPulseContextConnections match this filter */
  contextConnection_ALL?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return FieldPulses where none of the related FieldPulseContextConnections match this filter */
  contextConnection_NONE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return FieldPulses where one of the related FieldPulseContextConnections match this filter */
  contextConnection_SINGLE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return FieldPulses where some of the related FieldPulseContextConnections match this filter */
  contextConnection_SOME?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return FieldPulses where all of the related FieldContexts match this filter */
  context_ALL?: InputMaybe<FieldContextWhere>
  /** Return FieldPulses where none of the related FieldContexts match this filter */
  context_NONE?: InputMaybe<FieldContextWhere>
  /** Return FieldPulses where one of the related FieldContexts match this filter */
  context_SINGLE?: InputMaybe<FieldContextWhere>
  /** Return FieldPulses where some of the related FieldContexts match this filter */
  context_SOME?: InputMaybe<FieldContextWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  intensity_EQ?: InputMaybe<Scalars['Float']['input']>
  intensity_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_IN?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  intensity_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_LTE?: InputMaybe<Scalars['Float']['input']>
  title_CONTAINS?: InputMaybe<Scalars['String']['input']>
  title_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  title_EQ?: InputMaybe<Scalars['String']['input']>
  title_IN?: InputMaybe<Array<Scalars['String']['input']>>
  title_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  typename?: InputMaybe<Array<FieldPulseImplementation>>
}

export type FieldPulsesConnection = {
  __typename?: 'FieldPulsesConnection'
  aggregate: FieldPulseAggregate
  edges: Array<FieldPulseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/**
 * A semantic or symbolic pattern discovered across pulses.
 * Usually AI-generated.
 * Label: ["FieldResonance"]
 */
export type FieldResonance = {
  __typename?: 'FieldResonance'
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  label: Scalars['String']['output']
}

export type FieldResonanceAggregate = {
  __typename?: 'FieldResonanceAggregate'
  count: Count
  node: FieldResonanceAggregateNode
}

export type FieldResonanceAggregateNode = {
  __typename?: 'FieldResonanceAggregateNode'
  description: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  label: StringAggregateSelection
}

export type FieldResonanceAggregateSelection = {
  __typename?: 'FieldResonanceAggregateSelection'
  count: Scalars['Int']['output']
  description: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  label: StringAggregateSelection
}

export type FieldResonanceConnectWhere = {
  node: FieldResonanceWhere
}

export type FieldResonanceCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>
  label: Scalars['String']['input']
}

export type FieldResonanceEdge = {
  __typename?: 'FieldResonanceEdge'
  cursor: Scalars['String']['output']
  node: FieldResonance
}

/** Fields to sort FieldResonances by. The order in which sorts are applied is not guaranteed when specifying many fields in one FieldResonanceSort object. */
export type FieldResonanceSort = {
  description?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  label?: InputMaybe<SortDirection>
}

export type FieldResonanceUpdateInput = {
  description_SET?: InputMaybe<Scalars['String']['input']>
  label_SET?: InputMaybe<Scalars['String']['input']>
}

export type FieldResonanceWhere = {
  AND?: InputMaybe<Array<FieldResonanceWhere>>
  NOT?: InputMaybe<FieldResonanceWhere>
  OR?: InputMaybe<Array<FieldResonanceWhere>>
  description_CONTAINS?: InputMaybe<Scalars['String']['input']>
  description_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  description_EQ?: InputMaybe<Scalars['String']['input']>
  description_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  description_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  label_CONTAINS?: InputMaybe<Scalars['String']['input']>
  label_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  label_EQ?: InputMaybe<Scalars['String']['input']>
  label_IN?: InputMaybe<Array<Scalars['String']['input']>>
  label_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type FieldResonancesConnection = {
  __typename?: 'FieldResonancesConnection'
  aggregate: FieldResonanceAggregate
  edges: Array<FieldResonanceEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type FloatAggregateSelection = {
  __typename?: 'FloatAggregateSelection'
  average?: Maybe<Scalars['Float']['output']>
  max?: Maybe<Scalars['Float']['output']>
  min?: Maybe<Scalars['Float']['output']>
  sum?: Maybe<Scalars['Float']['output']>
}

export enum GoalHorizon {
  Long = 'LONG',
  Mid = 'MID',
  Short = 'SHORT',
}

/**
 * A pulse that functions as a goal in its context.
 * Multi-label: ["FieldPulse", "GoalPulse"]
 */
export type GoalPulse = FieldPulse & {
  __typename?: 'GoalPulse'
  content: Scalars['String']['output']
  context: Array<FieldContext>
  /** @deprecated Please use field "aggregate" inside "contextConnection" instead */
  contextAggregate?: Maybe<GoalPulseFieldContextContextAggregationSelection>
  contextConnection: FieldPulseContextConnection
  createdAt: Scalars['DateTime']['output']
  horizon?: Maybe<GoalHorizon>
  id: Scalars['ID']['output']
  initiatedBy: Array<LifeSensor>
  initiatedByConnection: GoalPulseInitiatedByConnection
  intensity?: Maybe<Scalars['Float']['output']>
  status: GoalStatus
  title: Scalars['String']['output']
}

/**
 * A pulse that functions as a goal in its context.
 * Multi-label: ["FieldPulse", "GoalPulse"]
 */
export type GoalPulseContextArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A pulse that functions as a goal in its context.
 * Multi-label: ["FieldPulse", "GoalPulse"]
 */
export type GoalPulseContextAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A pulse that functions as a goal in its context.
 * Multi-label: ["FieldPulse", "GoalPulse"]
 */
export type GoalPulseContextConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseContextConnectionSort>>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

/**
 * A pulse that functions as a goal in its context.
 * Multi-label: ["FieldPulse", "GoalPulse"]
 */
export type GoalPulseInitiatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<LifeSensorWhere>
}

/**
 * A pulse that functions as a goal in its context.
 * Multi-label: ["FieldPulse", "GoalPulse"]
 */
export type GoalPulseInitiatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<GoalPulseInitiatedByConnectionWhere>
}

export type GoalPulseAggregate = {
  __typename?: 'GoalPulseAggregate'
  count: Count
  node: GoalPulseAggregateNode
}

export type GoalPulseAggregateNode = {
  __typename?: 'GoalPulseAggregateNode'
  content: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type GoalPulseAggregateSelection = {
  __typename?: 'GoalPulseAggregateSelection'
  content: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type GoalPulseContextAggregateInput = {
  AND?: InputMaybe<Array<GoalPulseContextAggregateInput>>
  NOT?: InputMaybe<GoalPulseContextAggregateInput>
  OR?: InputMaybe<Array<GoalPulseContextAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GoalPulseContextNodeAggregationWhereInput>
}

export type GoalPulseContextConnectFieldInput = {
  connect?: InputMaybe<Array<FieldContextConnectInput>>
  where?: InputMaybe<FieldContextConnectWhere>
}

export type GoalPulseContextCreateFieldInput = {
  node: FieldContextCreateInput
}

export type GoalPulseContextFieldInput = {
  connect?: InputMaybe<Array<GoalPulseContextConnectFieldInput>>
  create?: InputMaybe<Array<GoalPulseContextCreateFieldInput>>
}

export type GoalPulseContextNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GoalPulseContextNodeAggregationWhereInput>>
  NOT?: InputMaybe<GoalPulseContextNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GoalPulseContextNodeAggregationWhereInput>>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  emergentName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  title_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type GoalPulseContextUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

export type GoalPulseContextUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalPulseContextConnectFieldInput>>
  create?: InputMaybe<Array<GoalPulseContextCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseContextDisconnectFieldInput>>
  update?: InputMaybe<GoalPulseContextUpdateConnectionInput>
}

export type GoalPulseCreateInput = {
  content: Scalars['String']['input']
  context?: InputMaybe<GoalPulseContextFieldInput>
  createdAt: Scalars['DateTime']['input']
  horizon?: InputMaybe<GoalHorizon>
  initiatedBy?: InputMaybe<GoalPulseInitiatedByCreateInput>
  intensity?: InputMaybe<Scalars['Float']['input']>
  status: GoalStatus
  title: Scalars['String']['input']
}

export type GoalPulseDeleteInput = {
  context?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  initiatedBy?: InputMaybe<GoalPulseInitiatedByDeleteInput>
}

export type GoalPulseEdge = {
  __typename?: 'GoalPulseEdge'
  cursor: Scalars['String']['output']
  node: GoalPulse
}

export type GoalPulseFieldContextContextAggregationSelection = {
  __typename?: 'GoalPulseFieldContextContextAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalPulseFieldContextContextNodeAggregateSelection>
}

export type GoalPulseFieldContextContextNodeAggregateSelection = {
  __typename?: 'GoalPulseFieldContextContextNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  emergentName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  title: StringAggregateSelection
}

export type GoalPulseInitiatedByCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type GoalPulseInitiatedByCommunityConnectionWhere = {
  AND?: InputMaybe<Array<GoalPulseInitiatedByCommunityConnectionWhere>>
  NOT?: InputMaybe<GoalPulseInitiatedByCommunityConnectionWhere>
  OR?: InputMaybe<Array<GoalPulseInitiatedByCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type GoalPulseInitiatedByCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type GoalPulseInitiatedByCommunityDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<GoalPulseInitiatedByCommunityConnectionWhere>
}

export type GoalPulseInitiatedByCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<GoalPulseInitiatedByCommunityConnectionWhere>
}

export type GoalPulseInitiatedByCommunityFieldInput = {
  connect?: InputMaybe<Array<GoalPulseInitiatedByCommunityConnectFieldInput>>
  create?: InputMaybe<Array<GoalPulseInitiatedByCommunityCreateFieldInput>>
}

export type GoalPulseInitiatedByCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<GoalPulseInitiatedByCommunityConnectionWhere>
}

export type GoalPulseInitiatedByCommunityUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalPulseInitiatedByCommunityConnectFieldInput>>
  create?: InputMaybe<Array<GoalPulseInitiatedByCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<GoalPulseInitiatedByCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<GoalPulseInitiatedByCommunityDisconnectFieldInput>
  >
  update?: InputMaybe<GoalPulseInitiatedByCommunityUpdateConnectionInput>
}

export type GoalPulseInitiatedByConnection = {
  __typename?: 'GoalPulseInitiatedByConnection'
  edges: Array<GoalPulseInitiatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GoalPulseInitiatedByConnectionWhere = {
  Community?: InputMaybe<GoalPulseInitiatedByCommunityConnectionWhere>
  Person?: InputMaybe<GoalPulseInitiatedByPersonConnectionWhere>
}

export type GoalPulseInitiatedByCreateInput = {
  Community?: InputMaybe<GoalPulseInitiatedByCommunityFieldInput>
  Person?: InputMaybe<GoalPulseInitiatedByPersonFieldInput>
}

export type GoalPulseInitiatedByDeleteInput = {
  Community?: InputMaybe<Array<GoalPulseInitiatedByCommunityDeleteFieldInput>>
  Person?: InputMaybe<Array<GoalPulseInitiatedByPersonDeleteFieldInput>>
}

export type GoalPulseInitiatedByPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type GoalPulseInitiatedByPersonConnectionWhere = {
  AND?: InputMaybe<Array<GoalPulseInitiatedByPersonConnectionWhere>>
  NOT?: InputMaybe<GoalPulseInitiatedByPersonConnectionWhere>
  OR?: InputMaybe<Array<GoalPulseInitiatedByPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type GoalPulseInitiatedByPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type GoalPulseInitiatedByPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<GoalPulseInitiatedByPersonConnectionWhere>
}

export type GoalPulseInitiatedByPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<GoalPulseInitiatedByPersonConnectionWhere>
}

export type GoalPulseInitiatedByPersonFieldInput = {
  connect?: InputMaybe<Array<GoalPulseInitiatedByPersonConnectFieldInput>>
  create?: InputMaybe<Array<GoalPulseInitiatedByPersonCreateFieldInput>>
}

export type GoalPulseInitiatedByPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<GoalPulseInitiatedByPersonConnectionWhere>
}

export type GoalPulseInitiatedByPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalPulseInitiatedByPersonConnectFieldInput>>
  create?: InputMaybe<Array<GoalPulseInitiatedByPersonCreateFieldInput>>
  delete?: InputMaybe<Array<GoalPulseInitiatedByPersonDeleteFieldInput>>
  disconnect?: InputMaybe<Array<GoalPulseInitiatedByPersonDisconnectFieldInput>>
  update?: InputMaybe<GoalPulseInitiatedByPersonUpdateConnectionInput>
}

export type GoalPulseInitiatedByRelationship = {
  __typename?: 'GoalPulseInitiatedByRelationship'
  cursor: Scalars['String']['output']
  node: LifeSensor
}

export type GoalPulseInitiatedByUpdateInput = {
  Community?: InputMaybe<Array<GoalPulseInitiatedByCommunityUpdateFieldInput>>
  Person?: InputMaybe<Array<GoalPulseInitiatedByPersonUpdateFieldInput>>
}

/** Fields to sort GoalPulses by. The order in which sorts are applied is not guaranteed when specifying many fields in one GoalPulseSort object. */
export type GoalPulseSort = {
  content?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  horizon?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  intensity?: InputMaybe<SortDirection>
  status?: InputMaybe<SortDirection>
  title?: InputMaybe<SortDirection>
}

export type GoalPulseUpdateInput = {
  content_SET?: InputMaybe<Scalars['String']['input']>
  context?: InputMaybe<Array<GoalPulseContextUpdateFieldInput>>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  horizon_SET?: InputMaybe<GoalHorizon>
  initiatedBy?: InputMaybe<GoalPulseInitiatedByUpdateInput>
  intensity_ADD?: InputMaybe<Scalars['Float']['input']>
  intensity_DIVIDE?: InputMaybe<Scalars['Float']['input']>
  intensity_MULTIPLY?: InputMaybe<Scalars['Float']['input']>
  intensity_SET?: InputMaybe<Scalars['Float']['input']>
  intensity_SUBTRACT?: InputMaybe<Scalars['Float']['input']>
  status_SET?: InputMaybe<GoalStatus>
  title_SET?: InputMaybe<Scalars['String']['input']>
}

export type GoalPulseWhere = {
  AND?: InputMaybe<Array<GoalPulseWhere>>
  NOT?: InputMaybe<GoalPulseWhere>
  OR?: InputMaybe<Array<GoalPulseWhere>>
  content_CONTAINS?: InputMaybe<Scalars['String']['input']>
  content_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  content_EQ?: InputMaybe<Scalars['String']['input']>
  content_IN?: InputMaybe<Array<Scalars['String']['input']>>
  content_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  contextAggregate?: InputMaybe<GoalPulseContextAggregateInput>
  /** Return GoalPulses where all of the related FieldPulseContextConnections match this filter */
  contextConnection_ALL?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return GoalPulses where none of the related FieldPulseContextConnections match this filter */
  contextConnection_NONE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return GoalPulses where one of the related FieldPulseContextConnections match this filter */
  contextConnection_SINGLE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return GoalPulses where some of the related FieldPulseContextConnections match this filter */
  contextConnection_SOME?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return GoalPulses where all of the related FieldContexts match this filter */
  context_ALL?: InputMaybe<FieldContextWhere>
  /** Return GoalPulses where none of the related FieldContexts match this filter */
  context_NONE?: InputMaybe<FieldContextWhere>
  /** Return GoalPulses where one of the related FieldContexts match this filter */
  context_SINGLE?: InputMaybe<FieldContextWhere>
  /** Return GoalPulses where some of the related FieldContexts match this filter */
  context_SOME?: InputMaybe<FieldContextWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  horizon_EQ?: InputMaybe<GoalHorizon>
  horizon_IN?: InputMaybe<Array<InputMaybe<GoalHorizon>>>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  /** Return GoalPulses where all of the related GoalPulseInitiatedByConnections match this filter */
  initiatedByConnection_ALL?: InputMaybe<GoalPulseInitiatedByConnectionWhere>
  /** Return GoalPulses where none of the related GoalPulseInitiatedByConnections match this filter */
  initiatedByConnection_NONE?: InputMaybe<GoalPulseInitiatedByConnectionWhere>
  /** Return GoalPulses where one of the related GoalPulseInitiatedByConnections match this filter */
  initiatedByConnection_SINGLE?: InputMaybe<GoalPulseInitiatedByConnectionWhere>
  /** Return GoalPulses where some of the related GoalPulseInitiatedByConnections match this filter */
  initiatedByConnection_SOME?: InputMaybe<GoalPulseInitiatedByConnectionWhere>
  /** Return GoalPulses where all of the related LifeSensors match this filter */
  initiatedBy_ALL?: InputMaybe<LifeSensorWhere>
  /** Return GoalPulses where none of the related LifeSensors match this filter */
  initiatedBy_NONE?: InputMaybe<LifeSensorWhere>
  /** Return GoalPulses where one of the related LifeSensors match this filter */
  initiatedBy_SINGLE?: InputMaybe<LifeSensorWhere>
  /** Return GoalPulses where some of the related LifeSensors match this filter */
  initiatedBy_SOME?: InputMaybe<LifeSensorWhere>
  intensity_EQ?: InputMaybe<Scalars['Float']['input']>
  intensity_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_IN?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  intensity_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_LTE?: InputMaybe<Scalars['Float']['input']>
  status_EQ?: InputMaybe<GoalStatus>
  status_IN?: InputMaybe<Array<GoalStatus>>
  title_CONTAINS?: InputMaybe<Scalars['String']['input']>
  title_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  title_EQ?: InputMaybe<Scalars['String']['input']>
  title_IN?: InputMaybe<Array<Scalars['String']['input']>>
  title_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type GoalPulsesConnection = {
  __typename?: 'GoalPulsesConnection'
  aggregate: GoalPulseAggregate
  edges: Array<GoalPulseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export enum GoalStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Paused = 'PAUSED',
}

export type IdAggregateSelection = {
  __typename?: 'IDAggregateSelection'
  longest?: Maybe<Scalars['ID']['output']>
  shortest?: Maybe<Scalars['ID']['output']>
}

/**
 * Anything that can initiate pulses or own spaces.
 * Query-time abstraction - either a Person or Community.
 */
export type LifeSensor = Community | Person

export type LifeSensorWhere = {
  Community?: InputMaybe<CommunityWhere>
  Person?: InputMaybe<PersonWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 */
export type MeSpace = Space & {
  __typename?: 'MeSpace'
  contexts: Array<FieldContext>
  /** @deprecated Please use field "aggregate" inside "contextsConnection" instead */
  contextsAggregate?: Maybe<MeSpaceFieldContextContextsAggregationSelection>
  contextsConnection: MeSpaceContextsConnection
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  members: Array<SpaceMembership>
  /** @deprecated Please use field "aggregate" inside "membersConnection" instead */
  membersAggregate?: Maybe<MeSpaceSpaceMembershipMembersAggregationSelection>
  membersConnection: MeSpaceMembersConnection
  name: Scalars['String']['output']
  owner: Array<LifeSensor>
  ownerConnection: MeSpaceOwnerConnection
  visibility: SpaceVisibility
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 */
export type MeSpaceContextsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 */
export type MeSpaceContextsAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 */
export type MeSpaceContextsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MeSpaceContextsConnectionSort>>
  where?: InputMaybe<MeSpaceContextsConnectionWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 */
export type MeSpaceMembersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembershipSort>>
  where?: InputMaybe<SpaceMembershipWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 */
export type MeSpaceMembersAggregateArgs = {
  where?: InputMaybe<SpaceMembershipWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 */
export type MeSpaceMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MeSpaceMembersConnectionSort>>
  where?: InputMaybe<MeSpaceMembersConnectionWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 */
export type MeSpaceOwnerArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<LifeSensorWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 */
export type MeSpaceOwnerConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<MeSpaceOwnerConnectionWhere>
}

export type MeSpaceAggregate = {
  __typename?: 'MeSpaceAggregate'
  count: Count
  node: MeSpaceAggregateNode
}

export type MeSpaceAggregateNode = {
  __typename?: 'MeSpaceAggregateNode'
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type MeSpaceAggregateSelection = {
  __typename?: 'MeSpaceAggregateSelection'
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type MeSpaceContextsAggregateInput = {
  AND?: InputMaybe<Array<MeSpaceContextsAggregateInput>>
  NOT?: InputMaybe<MeSpaceContextsAggregateInput>
  OR?: InputMaybe<Array<MeSpaceContextsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MeSpaceContextsNodeAggregationWhereInput>
}

export type MeSpaceContextsConnectFieldInput = {
  connect?: InputMaybe<Array<FieldContextConnectInput>>
  where?: InputMaybe<FieldContextConnectWhere>
}

export type MeSpaceContextsConnection = {
  __typename?: 'MeSpaceContextsConnection'
  aggregate: MeSpaceFieldContextContextsAggregateSelection
  edges: Array<MeSpaceContextsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MeSpaceContextsConnectionSort = {
  node?: InputMaybe<FieldContextSort>
}

export type MeSpaceContextsConnectionWhere = {
  AND?: InputMaybe<Array<MeSpaceContextsConnectionWhere>>
  NOT?: InputMaybe<MeSpaceContextsConnectionWhere>
  OR?: InputMaybe<Array<MeSpaceContextsConnectionWhere>>
  node?: InputMaybe<FieldContextWhere>
}

export type MeSpaceContextsCreateFieldInput = {
  node: FieldContextCreateInput
}

export type MeSpaceContextsDeleteFieldInput = {
  delete?: InputMaybe<FieldContextDeleteInput>
  where?: InputMaybe<MeSpaceContextsConnectionWhere>
}

export type MeSpaceContextsDisconnectFieldInput = {
  disconnect?: InputMaybe<FieldContextDisconnectInput>
  where?: InputMaybe<MeSpaceContextsConnectionWhere>
}

export type MeSpaceContextsFieldInput = {
  connect?: InputMaybe<Array<MeSpaceContextsConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceContextsCreateFieldInput>>
}

export type MeSpaceContextsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MeSpaceContextsNodeAggregationWhereInput>>
  NOT?: InputMaybe<MeSpaceContextsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MeSpaceContextsNodeAggregationWhereInput>>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  emergentName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  title_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type MeSpaceContextsRelationship = {
  __typename?: 'MeSpaceContextsRelationship'
  cursor: Scalars['String']['output']
  node: FieldContext
}

export type MeSpaceContextsUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<MeSpaceContextsConnectionWhere>
}

export type MeSpaceContextsUpdateFieldInput = {
  connect?: InputMaybe<Array<MeSpaceContextsConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceContextsCreateFieldInput>>
  delete?: InputMaybe<Array<MeSpaceContextsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MeSpaceContextsDisconnectFieldInput>>
  update?: InputMaybe<MeSpaceContextsUpdateConnectionInput>
}

export type MeSpaceCreateInput = {
  contexts?: InputMaybe<MeSpaceContextsFieldInput>
  createdAt: Scalars['DateTime']['input']
  members?: InputMaybe<MeSpaceMembersFieldInput>
  name: Scalars['String']['input']
  owner?: InputMaybe<MeSpaceOwnerCreateInput>
  visibility: SpaceVisibility
}

export type MeSpaceDeleteInput = {
  contexts?: InputMaybe<Array<MeSpaceContextsDeleteFieldInput>>
  members?: InputMaybe<Array<MeSpaceMembersDeleteFieldInput>>
  owner?: InputMaybe<MeSpaceOwnerDeleteInput>
}

export type MeSpaceEdge = {
  __typename?: 'MeSpaceEdge'
  cursor: Scalars['String']['output']
  node: MeSpace
}

export type MeSpaceFieldContextContextsAggregateSelection = {
  __typename?: 'MeSpaceFieldContextContextsAggregateSelection'
  count: CountConnection
  node?: Maybe<MeSpaceFieldContextContextsNodeAggregateSelection>
}

export type MeSpaceFieldContextContextsAggregationSelection = {
  __typename?: 'MeSpaceFieldContextContextsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MeSpaceFieldContextContextsNodeAggregateSelection>
}

export type MeSpaceFieldContextContextsNodeAggregateSelection = {
  __typename?: 'MeSpaceFieldContextContextsNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  emergentName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  title: StringAggregateSelection
}

export type MeSpaceMembersAggregateInput = {
  AND?: InputMaybe<Array<MeSpaceMembersAggregateInput>>
  NOT?: InputMaybe<MeSpaceMembersAggregateInput>
  OR?: InputMaybe<Array<MeSpaceMembersAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MeSpaceMembersNodeAggregationWhereInput>
}

export type MeSpaceMembersConnectFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipConnectInput>>
  where?: InputMaybe<SpaceMembershipConnectWhere>
}

export type MeSpaceMembersConnection = {
  __typename?: 'MeSpaceMembersConnection'
  aggregate: MeSpaceSpaceMembershipMembersAggregateSelection
  edges: Array<MeSpaceMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MeSpaceMembersConnectionSort = {
  node?: InputMaybe<SpaceMembershipSort>
}

export type MeSpaceMembersConnectionWhere = {
  AND?: InputMaybe<Array<MeSpaceMembersConnectionWhere>>
  NOT?: InputMaybe<MeSpaceMembersConnectionWhere>
  OR?: InputMaybe<Array<MeSpaceMembersConnectionWhere>>
  node?: InputMaybe<SpaceMembershipWhere>
}

export type MeSpaceMembersCreateFieldInput = {
  node: SpaceMembershipCreateInput
}

export type MeSpaceMembersDeleteFieldInput = {
  delete?: InputMaybe<SpaceMembershipDeleteInput>
  where?: InputMaybe<MeSpaceMembersConnectionWhere>
}

export type MeSpaceMembersDisconnectFieldInput = {
  disconnect?: InputMaybe<SpaceMembershipDisconnectInput>
  where?: InputMaybe<MeSpaceMembersConnectionWhere>
}

export type MeSpaceMembersFieldInput = {
  connect?: InputMaybe<Array<MeSpaceMembersConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceMembersCreateFieldInput>>
}

export type MeSpaceMembersNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MeSpaceMembersNodeAggregationWhereInput>>
  NOT?: InputMaybe<MeSpaceMembersNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MeSpaceMembersNodeAggregationWhereInput>>
  addedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type MeSpaceMembersRelationship = {
  __typename?: 'MeSpaceMembersRelationship'
  cursor: Scalars['String']['output']
  node: SpaceMembership
}

export type MeSpaceMembersUpdateConnectionInput = {
  node?: InputMaybe<SpaceMembershipUpdateInput>
  where?: InputMaybe<MeSpaceMembersConnectionWhere>
}

export type MeSpaceMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<MeSpaceMembersConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceMembersCreateFieldInput>>
  delete?: InputMaybe<Array<MeSpaceMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MeSpaceMembersDisconnectFieldInput>>
  update?: InputMaybe<MeSpaceMembersUpdateConnectionInput>
}

export type MeSpaceOwnerCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type MeSpaceOwnerCommunityConnectionWhere = {
  AND?: InputMaybe<Array<MeSpaceOwnerCommunityConnectionWhere>>
  NOT?: InputMaybe<MeSpaceOwnerCommunityConnectionWhere>
  OR?: InputMaybe<Array<MeSpaceOwnerCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type MeSpaceOwnerCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type MeSpaceOwnerCommunityDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<MeSpaceOwnerCommunityConnectionWhere>
}

export type MeSpaceOwnerCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<MeSpaceOwnerCommunityConnectionWhere>
}

export type MeSpaceOwnerCommunityFieldInput = {
  connect?: InputMaybe<Array<MeSpaceOwnerCommunityConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceOwnerCommunityCreateFieldInput>>
}

export type MeSpaceOwnerCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<MeSpaceOwnerCommunityConnectionWhere>
}

export type MeSpaceOwnerCommunityUpdateFieldInput = {
  connect?: InputMaybe<Array<MeSpaceOwnerCommunityConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceOwnerCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<MeSpaceOwnerCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MeSpaceOwnerCommunityDisconnectFieldInput>>
  update?: InputMaybe<MeSpaceOwnerCommunityUpdateConnectionInput>
}

export type MeSpaceOwnerConnection = {
  __typename?: 'MeSpaceOwnerConnection'
  edges: Array<MeSpaceOwnerRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MeSpaceOwnerConnectionWhere = {
  Community?: InputMaybe<MeSpaceOwnerCommunityConnectionWhere>
  Person?: InputMaybe<MeSpaceOwnerPersonConnectionWhere>
}

export type MeSpaceOwnerCreateInput = {
  Community?: InputMaybe<MeSpaceOwnerCommunityFieldInput>
  Person?: InputMaybe<MeSpaceOwnerPersonFieldInput>
}

export type MeSpaceOwnerDeleteInput = {
  Community?: InputMaybe<Array<MeSpaceOwnerCommunityDeleteFieldInput>>
  Person?: InputMaybe<Array<MeSpaceOwnerPersonDeleteFieldInput>>
}

export type MeSpaceOwnerPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type MeSpaceOwnerPersonConnectionWhere = {
  AND?: InputMaybe<Array<MeSpaceOwnerPersonConnectionWhere>>
  NOT?: InputMaybe<MeSpaceOwnerPersonConnectionWhere>
  OR?: InputMaybe<Array<MeSpaceOwnerPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type MeSpaceOwnerPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type MeSpaceOwnerPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<MeSpaceOwnerPersonConnectionWhere>
}

export type MeSpaceOwnerPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<MeSpaceOwnerPersonConnectionWhere>
}

export type MeSpaceOwnerPersonFieldInput = {
  connect?: InputMaybe<Array<MeSpaceOwnerPersonConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceOwnerPersonCreateFieldInput>>
}

export type MeSpaceOwnerPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<MeSpaceOwnerPersonConnectionWhere>
}

export type MeSpaceOwnerPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<MeSpaceOwnerPersonConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceOwnerPersonCreateFieldInput>>
  delete?: InputMaybe<Array<MeSpaceOwnerPersonDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MeSpaceOwnerPersonDisconnectFieldInput>>
  update?: InputMaybe<MeSpaceOwnerPersonUpdateConnectionInput>
}

export type MeSpaceOwnerRelationship = {
  __typename?: 'MeSpaceOwnerRelationship'
  cursor: Scalars['String']['output']
  node: LifeSensor
}

export type MeSpaceOwnerUpdateInput = {
  Community?: InputMaybe<Array<MeSpaceOwnerCommunityUpdateFieldInput>>
  Person?: InputMaybe<Array<MeSpaceOwnerPersonUpdateFieldInput>>
}

/** Fields to sort MeSpaces by. The order in which sorts are applied is not guaranteed when specifying many fields in one MeSpaceSort object. */
export type MeSpaceSort = {
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  visibility?: InputMaybe<SortDirection>
}

export type MeSpaceSpaceMembershipMembersAggregateSelection = {
  __typename?: 'MeSpaceSpaceMembershipMembersAggregateSelection'
  count: CountConnection
  node?: Maybe<MeSpaceSpaceMembershipMembersNodeAggregateSelection>
}

export type MeSpaceSpaceMembershipMembersAggregationSelection = {
  __typename?: 'MeSpaceSpaceMembershipMembersAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MeSpaceSpaceMembershipMembersNodeAggregateSelection>
}

export type MeSpaceSpaceMembershipMembersNodeAggregateSelection = {
  __typename?: 'MeSpaceSpaceMembershipMembersNodeAggregateSelection'
  addedAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
}

export type MeSpaceUpdateInput = {
  contexts?: InputMaybe<Array<MeSpaceContextsUpdateFieldInput>>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  members?: InputMaybe<Array<MeSpaceMembersUpdateFieldInput>>
  name_SET?: InputMaybe<Scalars['String']['input']>
  owner?: InputMaybe<MeSpaceOwnerUpdateInput>
  visibility_SET?: InputMaybe<SpaceVisibility>
}

export type MeSpaceWhere = {
  AND?: InputMaybe<Array<MeSpaceWhere>>
  NOT?: InputMaybe<MeSpaceWhere>
  OR?: InputMaybe<Array<MeSpaceWhere>>
  contextsAggregate?: InputMaybe<MeSpaceContextsAggregateInput>
  /** Return MeSpaces where all of the related MeSpaceContextsConnections match this filter */
  contextsConnection_ALL?: InputMaybe<MeSpaceContextsConnectionWhere>
  /** Return MeSpaces where none of the related MeSpaceContextsConnections match this filter */
  contextsConnection_NONE?: InputMaybe<MeSpaceContextsConnectionWhere>
  /** Return MeSpaces where one of the related MeSpaceContextsConnections match this filter */
  contextsConnection_SINGLE?: InputMaybe<MeSpaceContextsConnectionWhere>
  /** Return MeSpaces where some of the related MeSpaceContextsConnections match this filter */
  contextsConnection_SOME?: InputMaybe<MeSpaceContextsConnectionWhere>
  /** Return MeSpaces where all of the related FieldContexts match this filter */
  contexts_ALL?: InputMaybe<FieldContextWhere>
  /** Return MeSpaces where none of the related FieldContexts match this filter */
  contexts_NONE?: InputMaybe<FieldContextWhere>
  /** Return MeSpaces where one of the related FieldContexts match this filter */
  contexts_SINGLE?: InputMaybe<FieldContextWhere>
  /** Return MeSpaces where some of the related FieldContexts match this filter */
  contexts_SOME?: InputMaybe<FieldContextWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  membersAggregate?: InputMaybe<MeSpaceMembersAggregateInput>
  /** Return MeSpaces where all of the related MeSpaceMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<MeSpaceMembersConnectionWhere>
  /** Return MeSpaces where none of the related MeSpaceMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<MeSpaceMembersConnectionWhere>
  /** Return MeSpaces where one of the related MeSpaceMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<MeSpaceMembersConnectionWhere>
  /** Return MeSpaces where some of the related MeSpaceMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<MeSpaceMembersConnectionWhere>
  /** Return MeSpaces where all of the related SpaceMemberships match this filter */
  members_ALL?: InputMaybe<SpaceMembershipWhere>
  /** Return MeSpaces where none of the related SpaceMemberships match this filter */
  members_NONE?: InputMaybe<SpaceMembershipWhere>
  /** Return MeSpaces where one of the related SpaceMemberships match this filter */
  members_SINGLE?: InputMaybe<SpaceMembershipWhere>
  /** Return MeSpaces where some of the related SpaceMemberships match this filter */
  members_SOME?: InputMaybe<SpaceMembershipWhere>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  /** Return MeSpaces where all of the related MeSpaceOwnerConnections match this filter */
  ownerConnection_ALL?: InputMaybe<MeSpaceOwnerConnectionWhere>
  /** Return MeSpaces where none of the related MeSpaceOwnerConnections match this filter */
  ownerConnection_NONE?: InputMaybe<MeSpaceOwnerConnectionWhere>
  /** Return MeSpaces where one of the related MeSpaceOwnerConnections match this filter */
  ownerConnection_SINGLE?: InputMaybe<MeSpaceOwnerConnectionWhere>
  /** Return MeSpaces where some of the related MeSpaceOwnerConnections match this filter */
  ownerConnection_SOME?: InputMaybe<MeSpaceOwnerConnectionWhere>
  /** Return MeSpaces where all of the related LifeSensors match this filter */
  owner_ALL?: InputMaybe<LifeSensorWhere>
  /** Return MeSpaces where none of the related LifeSensors match this filter */
  owner_NONE?: InputMaybe<LifeSensorWhere>
  /** Return MeSpaces where one of the related LifeSensors match this filter */
  owner_SINGLE?: InputMaybe<LifeSensorWhere>
  /** Return MeSpaces where some of the related LifeSensors match this filter */
  owner_SOME?: InputMaybe<LifeSensorWhere>
  visibility_EQ?: InputMaybe<SpaceVisibility>
  visibility_IN?: InputMaybe<Array<SpaceVisibility>>
}

export type MeSpacesConnection = {
  __typename?: 'MeSpacesConnection'
  aggregate: MeSpaceAggregate
  edges: Array<MeSpaceEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Mutation = {
  __typename?: 'Mutation'
  /**
   * Add a member to a space with a specific role.
   * Only the space owner or members with ADMIN role can add new members.
   */
  addSpaceMember: AddSpaceMemberResponse
  /**
   * Cancel an invitation for a person.
   * Removes the User label and invite-related properties.
   */
  cancelInvite?: Maybe<Person>
  createAddSpaceMemberResponses: CreateAddSpaceMemberResponsesMutationResponse
  createChatbotResponses: CreateChatbotResponsesMutationResponse
  createCommunities: CreateCommunitiesMutationResponse
  createFieldContexts: CreateFieldContextsMutationResponse
  createFieldResonances: CreateFieldResonancesMutationResponse
  createGoalPulses: CreateGoalPulsesMutationResponse
  createMeSpaces: CreateMeSpacesMutationResponse
  createPeople: CreatePeopleMutationResponse
  createRemoveSpaceMemberResponses: CreateRemoveSpaceMemberResponsesMutationResponse
  createResonanceLinks: CreateResonanceLinksMutationResponse
  createResourcePulses: CreateResourcePulsesMutationResponse
  createSearchResults: CreateSearchResultsMutationResponse
  createSpaceMemberships: CreateSpaceMembershipsMutationResponse
  createStoryPulses: CreateStoryPulsesMutationResponse
  createUpdateSpaceMemberRoleResponses: CreateUpdateSpaceMemberRoleResponsesMutationResponse
  createWeSpaces: CreateWeSpacesMutationResponse
  deleteAddSpaceMemberResponses: DeleteInfo
  deleteChatbotResponses: DeleteInfo
  deleteCommunities: DeleteInfo
  deleteFieldContexts: DeleteInfo
  deleteFieldResonances: DeleteInfo
  deleteGoalPulses: DeleteInfo
  deleteMeSpaces: DeleteInfo
  deletePeople: DeleteInfo
  deleteRemoveSpaceMemberResponses: DeleteInfo
  deleteResonanceLinks: DeleteInfo
  deleteResourcePulses: DeleteInfo
  deleteSearchResults: DeleteInfo
  deleteSpaceMemberships: DeleteInfo
  deleteStoryPulses: DeleteInfo
  deleteUpdateSpaceMemberRoleResponses: DeleteInfo
  deleteWeSpaces: DeleteInfo
  /**
   * Invite a person to join the platform.
   * Sends an invite email with a password reset link.
   */
  invitePerson?: Maybe<Person>
  /**
   * Remove a member from a space.
   * Only the space owner or members with ADMIN role can remove members.
   * Cannot remove the space owner.
   */
  removeSpaceMember: RemoveSpaceMemberResponse
  /**
   * Send a message to the chatbot and receive a response.
   * Placeholder for future chatbot functionality.
   */
  sendMessageToChatbot?: Maybe<ChatbotResponse>
  updateAddSpaceMemberResponses: UpdateAddSpaceMemberResponsesMutationResponse
  updateChatbotResponses: UpdateChatbotResponsesMutationResponse
  updateCommunities: UpdateCommunitiesMutationResponse
  updateFieldContexts: UpdateFieldContextsMutationResponse
  updateFieldResonances: UpdateFieldResonancesMutationResponse
  updateGoalPulses: UpdateGoalPulsesMutationResponse
  updateMeSpaces: UpdateMeSpacesMutationResponse
  updatePeople: UpdatePeopleMutationResponse
  updateRemoveSpaceMemberResponses: UpdateRemoveSpaceMemberResponsesMutationResponse
  updateResonanceLinks: UpdateResonanceLinksMutationResponse
  updateResourcePulses: UpdateResourcePulsesMutationResponse
  updateSearchResults: UpdateSearchResultsMutationResponse
  /**
   * Update a space member's role.
   * Only the space owner or members with ADMIN role can change roles.
   */
  updateSpaceMemberRole: UpdateSpaceMemberRoleResponse
  updateSpaceMemberships: UpdateSpaceMembershipsMutationResponse
  updateStoryPulses: UpdateStoryPulsesMutationResponse
  updateUpdateSpaceMemberRoleResponses: UpdateUpdateSpaceMemberRoleResponsesMutationResponse
  updateWeSpaces: UpdateWeSpacesMutationResponse
}

export type MutationAddSpaceMemberArgs = {
  memberId: Scalars['ID']['input']
  role: SpaceRole
  spaceId: Scalars['ID']['input']
}

export type MutationCancelInviteArgs = {
  personId: Scalars['String']['input']
}

export type MutationCreateAddSpaceMemberResponsesArgs = {
  input: Array<AddSpaceMemberResponseCreateInput>
}

export type MutationCreateChatbotResponsesArgs = {
  input: Array<ChatbotResponseCreateInput>
}

export type MutationCreateCommunitiesArgs = {
  input: Array<CommunityCreateInput>
}

export type MutationCreateFieldContextsArgs = {
  input: Array<FieldContextCreateInput>
}

export type MutationCreateFieldResonancesArgs = {
  input: Array<FieldResonanceCreateInput>
}

export type MutationCreateGoalPulsesArgs = {
  input: Array<GoalPulseCreateInput>
}

export type MutationCreateMeSpacesArgs = {
  input: Array<MeSpaceCreateInput>
}

export type MutationCreatePeopleArgs = {
  input: Array<PersonCreateInput>
}

export type MutationCreateRemoveSpaceMemberResponsesArgs = {
  input: Array<RemoveSpaceMemberResponseCreateInput>
}

export type MutationCreateResonanceLinksArgs = {
  input: Array<ResonanceLinkCreateInput>
}

export type MutationCreateResourcePulsesArgs = {
  input: Array<ResourcePulseCreateInput>
}

export type MutationCreateSearchResultsArgs = {
  input: Array<SearchResultsCreateInput>
}

export type MutationCreateSpaceMembershipsArgs = {
  input: Array<SpaceMembershipCreateInput>
}

export type MutationCreateStoryPulsesArgs = {
  input: Array<StoryPulseCreateInput>
}

export type MutationCreateUpdateSpaceMemberRoleResponsesArgs = {
  input: Array<UpdateSpaceMemberRoleResponseCreateInput>
}

export type MutationCreateWeSpacesArgs = {
  input: Array<WeSpaceCreateInput>
}

export type MutationDeleteAddSpaceMemberResponsesArgs = {
  where?: InputMaybe<AddSpaceMemberResponseWhere>
}

export type MutationDeleteChatbotResponsesArgs = {
  where?: InputMaybe<ChatbotResponseWhere>
}

export type MutationDeleteCommunitiesArgs = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<CommunityWhere>
}

export type MutationDeleteFieldContextsArgs = {
  delete?: InputMaybe<FieldContextDeleteInput>
  where?: InputMaybe<FieldContextWhere>
}

export type MutationDeleteFieldResonancesArgs = {
  where?: InputMaybe<FieldResonanceWhere>
}

export type MutationDeleteGoalPulsesArgs = {
  delete?: InputMaybe<GoalPulseDeleteInput>
  where?: InputMaybe<GoalPulseWhere>
}

export type MutationDeleteMeSpacesArgs = {
  delete?: InputMaybe<MeSpaceDeleteInput>
  where?: InputMaybe<MeSpaceWhere>
}

export type MutationDeletePeopleArgs = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<PersonWhere>
}

export type MutationDeleteRemoveSpaceMemberResponsesArgs = {
  where?: InputMaybe<RemoveSpaceMemberResponseWhere>
}

export type MutationDeleteResonanceLinksArgs = {
  delete?: InputMaybe<ResonanceLinkDeleteInput>
  where?: InputMaybe<ResonanceLinkWhere>
}

export type MutationDeleteResourcePulsesArgs = {
  delete?: InputMaybe<ResourcePulseDeleteInput>
  where?: InputMaybe<ResourcePulseWhere>
}

export type MutationDeleteSearchResultsArgs = {
  where?: InputMaybe<SearchResultsWhere>
}

export type MutationDeleteSpaceMembershipsArgs = {
  delete?: InputMaybe<SpaceMembershipDeleteInput>
  where?: InputMaybe<SpaceMembershipWhere>
}

export type MutationDeleteStoryPulsesArgs = {
  delete?: InputMaybe<StoryPulseDeleteInput>
  where?: InputMaybe<StoryPulseWhere>
}

export type MutationDeleteUpdateSpaceMemberRoleResponsesArgs = {
  where?: InputMaybe<UpdateSpaceMemberRoleResponseWhere>
}

export type MutationDeleteWeSpacesArgs = {
  delete?: InputMaybe<WeSpaceDeleteInput>
  where?: InputMaybe<WeSpaceWhere>
}

export type MutationInvitePersonArgs = {
  personId: Scalars['String']['input']
}

export type MutationRemoveSpaceMemberArgs = {
  memberId: Scalars['ID']['input']
  spaceId: Scalars['ID']['input']
}

export type MutationSendMessageToChatbotArgs = {
  message: Scalars['String']['input']
  sessionId?: InputMaybe<Scalars['String']['input']>
}

export type MutationUpdateAddSpaceMemberResponsesArgs = {
  update?: InputMaybe<AddSpaceMemberResponseUpdateInput>
  where?: InputMaybe<AddSpaceMemberResponseWhere>
}

export type MutationUpdateChatbotResponsesArgs = {
  update?: InputMaybe<ChatbotResponseUpdateInput>
  where?: InputMaybe<ChatbotResponseWhere>
}

export type MutationUpdateCommunitiesArgs = {
  update?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<CommunityWhere>
}

export type MutationUpdateFieldContextsArgs = {
  update?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<FieldContextWhere>
}

export type MutationUpdateFieldResonancesArgs = {
  update?: InputMaybe<FieldResonanceUpdateInput>
  where?: InputMaybe<FieldResonanceWhere>
}

export type MutationUpdateGoalPulsesArgs = {
  update?: InputMaybe<GoalPulseUpdateInput>
  where?: InputMaybe<GoalPulseWhere>
}

export type MutationUpdateMeSpacesArgs = {
  update?: InputMaybe<MeSpaceUpdateInput>
  where?: InputMaybe<MeSpaceWhere>
}

export type MutationUpdatePeopleArgs = {
  update?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<PersonWhere>
}

export type MutationUpdateRemoveSpaceMemberResponsesArgs = {
  update?: InputMaybe<RemoveSpaceMemberResponseUpdateInput>
  where?: InputMaybe<RemoveSpaceMemberResponseWhere>
}

export type MutationUpdateResonanceLinksArgs = {
  update?: InputMaybe<ResonanceLinkUpdateInput>
  where?: InputMaybe<ResonanceLinkWhere>
}

export type MutationUpdateResourcePulsesArgs = {
  update?: InputMaybe<ResourcePulseUpdateInput>
  where?: InputMaybe<ResourcePulseWhere>
}

export type MutationUpdateSearchResultsArgs = {
  update?: InputMaybe<SearchResultsUpdateInput>
  where?: InputMaybe<SearchResultsWhere>
}

export type MutationUpdateSpaceMemberRoleArgs = {
  memberId: Scalars['ID']['input']
  role: SpaceRole
  spaceId: Scalars['ID']['input']
}

export type MutationUpdateSpaceMembershipsArgs = {
  update?: InputMaybe<SpaceMembershipUpdateInput>
  where?: InputMaybe<SpaceMembershipWhere>
}

export type MutationUpdateStoryPulsesArgs = {
  update?: InputMaybe<StoryPulseUpdateInput>
  where?: InputMaybe<StoryPulseWhere>
}

export type MutationUpdateUpdateSpaceMemberRoleResponsesArgs = {
  update?: InputMaybe<UpdateSpaceMemberRoleResponseUpdateInput>
  where?: InputMaybe<UpdateSpaceMemberRoleResponseWhere>
}

export type MutationUpdateWeSpacesArgs = {
  update?: InputMaybe<WeSpaceUpdateInput>
  where?: InputMaybe<WeSpaceWhere>
}

/** Pagination information (Relay) */
export type PageInfo = {
  __typename?: 'PageInfo'
  endCursor?: Maybe<Scalars['String']['output']>
  hasNextPage: Scalars['Boolean']['output']
  hasPreviousPage: Scalars['Boolean']['output']
  startCursor?: Maybe<Scalars['String']['output']>
}

export type PeopleConnection = {
  __typename?: 'PeopleConnection'
  aggregate: PersonAggregate
  edges: Array<PersonEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/**
 * A human user of the system.
 * Multi-label: ["Person", "User"]
 */
export type Person = {
  __typename?: 'Person'
  email?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  id: Scalars['ID']['output']
  lastName: Scalars['String']['output']
  name: Scalars['String']['output']
  ownsSpaces: Array<Space>
  /** @deprecated Please use field "aggregate" inside "ownsSpacesConnection" instead */
  ownsSpacesAggregate?: Maybe<PersonSpaceOwnsSpacesAggregationSelection>
  ownsSpacesConnection: PersonOwnsSpacesConnection
}

/**
 * A human user of the system.
 * Multi-label: ["Person", "User"]
 */
export type PersonOwnsSpacesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceSort>>
  where?: InputMaybe<SpaceWhere>
}

/**
 * A human user of the system.
 * Multi-label: ["Person", "User"]
 */
export type PersonOwnsSpacesAggregateArgs = {
  where?: InputMaybe<SpaceWhere>
}

/**
 * A human user of the system.
 * Multi-label: ["Person", "User"]
 */
export type PersonOwnsSpacesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonOwnsSpacesConnectionSort>>
  where?: InputMaybe<PersonOwnsSpacesConnectionWhere>
}

export type PersonAggregate = {
  __typename?: 'PersonAggregate'
  count: Count
  node: PersonAggregateNode
}

export type PersonAggregateNode = {
  __typename?: 'PersonAggregateNode'
  email: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
}

export type PersonAggregateSelection = {
  __typename?: 'PersonAggregateSelection'
  count: Scalars['Int']['output']
  email: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
}

export type PersonConnectInput = {
  ownsSpaces?: InputMaybe<Array<PersonOwnsSpacesConnectFieldInput>>
}

export type PersonConnectWhere = {
  node: PersonWhere
}

export type PersonCreateInput = {
  email?: InputMaybe<Scalars['String']['input']>
  firstName: Scalars['String']['input']
  lastName: Scalars['String']['input']
  ownsSpaces?: InputMaybe<PersonOwnsSpacesFieldInput>
}

export type PersonDeleteInput = {
  ownsSpaces?: InputMaybe<Array<PersonOwnsSpacesDeleteFieldInput>>
}

export type PersonDisconnectInput = {
  ownsSpaces?: InputMaybe<Array<PersonOwnsSpacesDisconnectFieldInput>>
}

export type PersonEdge = {
  __typename?: 'PersonEdge'
  cursor: Scalars['String']['output']
  node: Person
}

export type PersonOwnsSpacesAggregateInput = {
  AND?: InputMaybe<Array<PersonOwnsSpacesAggregateInput>>
  NOT?: InputMaybe<PersonOwnsSpacesAggregateInput>
  OR?: InputMaybe<Array<PersonOwnsSpacesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<PersonOwnsSpacesNodeAggregationWhereInput>
}

export type PersonOwnsSpacesConnectFieldInput = {
  where?: InputMaybe<SpaceConnectWhere>
}

export type PersonOwnsSpacesConnection = {
  __typename?: 'PersonOwnsSpacesConnection'
  aggregate: PersonSpaceOwnsSpacesAggregateSelection
  edges: Array<PersonOwnsSpacesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonOwnsSpacesConnectionSort = {
  node?: InputMaybe<SpaceSort>
}

export type PersonOwnsSpacesConnectionWhere = {
  AND?: InputMaybe<Array<PersonOwnsSpacesConnectionWhere>>
  NOT?: InputMaybe<PersonOwnsSpacesConnectionWhere>
  OR?: InputMaybe<Array<PersonOwnsSpacesConnectionWhere>>
  node?: InputMaybe<SpaceWhere>
}

export type PersonOwnsSpacesCreateFieldInput = {
  node: SpaceCreateInput
}

export type PersonOwnsSpacesDeleteFieldInput = {
  where?: InputMaybe<PersonOwnsSpacesConnectionWhere>
}

export type PersonOwnsSpacesDisconnectFieldInput = {
  where?: InputMaybe<PersonOwnsSpacesConnectionWhere>
}

export type PersonOwnsSpacesFieldInput = {
  connect?: InputMaybe<Array<PersonOwnsSpacesConnectFieldInput>>
  create?: InputMaybe<Array<PersonOwnsSpacesCreateFieldInput>>
}

export type PersonOwnsSpacesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonOwnsSpacesNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonOwnsSpacesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonOwnsSpacesNodeAggregationWhereInput>>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  name_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  name_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  name_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  name_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  name_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type PersonOwnsSpacesRelationship = {
  __typename?: 'PersonOwnsSpacesRelationship'
  cursor: Scalars['String']['output']
  node: Space
}

export type PersonOwnsSpacesUpdateConnectionInput = {
  node?: InputMaybe<SpaceUpdateInput>
  where?: InputMaybe<PersonOwnsSpacesConnectionWhere>
}

export type PersonOwnsSpacesUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonOwnsSpacesConnectFieldInput>>
  create?: InputMaybe<Array<PersonOwnsSpacesCreateFieldInput>>
  delete?: InputMaybe<Array<PersonOwnsSpacesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonOwnsSpacesDisconnectFieldInput>>
  update?: InputMaybe<PersonOwnsSpacesUpdateConnectionInput>
}

/** Fields to sort People by. The order in which sorts are applied is not guaranteed when specifying many fields in one PersonSort object. */
export type PersonSort = {
  email?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
}

export type PersonSpaceOwnsSpacesAggregateSelection = {
  __typename?: 'PersonSpaceOwnsSpacesAggregateSelection'
  count: CountConnection
  node?: Maybe<PersonSpaceOwnsSpacesNodeAggregateSelection>
}

export type PersonSpaceOwnsSpacesAggregationSelection = {
  __typename?: 'PersonSpaceOwnsSpacesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<PersonSpaceOwnsSpacesNodeAggregateSelection>
}

export type PersonSpaceOwnsSpacesNodeAggregateSelection = {
  __typename?: 'PersonSpaceOwnsSpacesNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type PersonUpdateInput = {
  email_SET?: InputMaybe<Scalars['String']['input']>
  firstName_SET?: InputMaybe<Scalars['String']['input']>
  lastName_SET?: InputMaybe<Scalars['String']['input']>
  ownsSpaces?: InputMaybe<Array<PersonOwnsSpacesUpdateFieldInput>>
}

export type PersonWhere = {
  AND?: InputMaybe<Array<PersonWhere>>
  NOT?: InputMaybe<PersonWhere>
  OR?: InputMaybe<Array<PersonWhere>>
  email_CONTAINS?: InputMaybe<Scalars['String']['input']>
  email_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  email_EQ?: InputMaybe<Scalars['String']['input']>
  email_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  email_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  firstName_CONTAINS?: InputMaybe<Scalars['String']['input']>
  firstName_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  firstName_EQ?: InputMaybe<Scalars['String']['input']>
  firstName_IN?: InputMaybe<Array<Scalars['String']['input']>>
  firstName_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  lastName_CONTAINS?: InputMaybe<Scalars['String']['input']>
  lastName_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  lastName_EQ?: InputMaybe<Scalars['String']['input']>
  lastName_IN?: InputMaybe<Array<Scalars['String']['input']>>
  lastName_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  ownsSpacesAggregate?: InputMaybe<PersonOwnsSpacesAggregateInput>
  /** Return People where all of the related PersonOwnsSpacesConnections match this filter */
  ownsSpacesConnection_ALL?: InputMaybe<PersonOwnsSpacesConnectionWhere>
  /** Return People where none of the related PersonOwnsSpacesConnections match this filter */
  ownsSpacesConnection_NONE?: InputMaybe<PersonOwnsSpacesConnectionWhere>
  /** Return People where one of the related PersonOwnsSpacesConnections match this filter */
  ownsSpacesConnection_SINGLE?: InputMaybe<PersonOwnsSpacesConnectionWhere>
  /** Return People where some of the related PersonOwnsSpacesConnections match this filter */
  ownsSpacesConnection_SOME?: InputMaybe<PersonOwnsSpacesConnectionWhere>
  /** Return People where all of the related Spaces match this filter */
  ownsSpaces_ALL?: InputMaybe<SpaceWhere>
  /** Return People where none of the related Spaces match this filter */
  ownsSpaces_NONE?: InputMaybe<SpaceWhere>
  /** Return People where one of the related Spaces match this filter */
  ownsSpaces_SINGLE?: InputMaybe<SpaceWhere>
  /** Return People where some of the related Spaces match this filter */
  ownsSpaces_SOME?: InputMaybe<SpaceWhere>
}

export type Query = {
  __typename?: 'Query'
  addSpaceMemberResponses: Array<AddSpaceMemberResponse>
  /** @deprecated Please use the explicit field "aggregate" inside "addSpaceMemberResponsesConnection" instead */
  addSpaceMemberResponsesAggregate: AddSpaceMemberResponseAggregateSelection
  addSpaceMemberResponsesConnection: AddSpaceMemberResponsesConnection
  chatbotResponses: Array<ChatbotResponse>
  /** @deprecated Please use the explicit field "aggregate" inside "chatbotResponsesConnection" instead */
  chatbotResponsesAggregate: ChatbotResponseAggregateSelection
  chatbotResponsesConnection: ChatbotResponsesConnection
  communities: Array<Community>
  /** @deprecated Please use the explicit field "aggregate" inside "communitiesConnection" instead */
  communitiesAggregate: CommunityAggregateSelection
  communitiesConnection: CommunitiesConnection
  fieldContexts: Array<FieldContext>
  /** @deprecated Please use the explicit field "aggregate" inside "fieldContextsConnection" instead */
  fieldContextsAggregate: FieldContextAggregateSelection
  fieldContextsConnection: FieldContextsConnection
  fieldPulses: Array<FieldPulse>
  /** @deprecated Please use the explicit field "aggregate" inside "fieldPulsesConnection" instead */
  fieldPulsesAggregate: FieldPulseAggregateSelection
  fieldPulsesConnection: FieldPulsesConnection
  fieldResonances: Array<FieldResonance>
  /** @deprecated Please use the explicit field "aggregate" inside "fieldResonancesConnection" instead */
  fieldResonancesAggregate: FieldResonanceAggregateSelection
  fieldResonancesConnection: FieldResonancesConnection
  goalPulses: Array<GoalPulse>
  /** @deprecated Please use the explicit field "aggregate" inside "goalPulsesConnection" instead */
  goalPulsesAggregate: GoalPulseAggregateSelection
  goalPulsesConnection: GoalPulsesConnection
  lifeSensors: Array<LifeSensor>
  meSpaces: Array<MeSpace>
  /** @deprecated Please use the explicit field "aggregate" inside "meSpacesConnection" instead */
  meSpacesAggregate: MeSpaceAggregateSelection
  meSpacesConnection: MeSpacesConnection
  people: Array<Person>
  /** @deprecated Please use the explicit field "aggregate" inside "peopleConnection" instead */
  peopleAggregate: PersonAggregateSelection
  peopleConnection: PeopleConnection
  removeSpaceMemberResponses: Array<RemoveSpaceMemberResponse>
  /** @deprecated Please use the explicit field "aggregate" inside "removeSpaceMemberResponsesConnection" instead */
  removeSpaceMemberResponsesAggregate: RemoveSpaceMemberResponseAggregateSelection
  removeSpaceMemberResponsesConnection: RemoveSpaceMemberResponsesConnection
  resonanceLinks: Array<ResonanceLink>
  /** @deprecated Please use the explicit field "aggregate" inside "resonanceLinksConnection" instead */
  resonanceLinksAggregate: ResonanceLinkAggregateSelection
  resonanceLinksConnection: ResonanceLinksConnection
  resourcePulses: Array<ResourcePulse>
  /** @deprecated Please use the explicit field "aggregate" inside "resourcePulsesConnection" instead */
  resourcePulsesAggregate: ResourcePulseAggregateSelection
  resourcePulsesConnection: ResourcePulsesConnection
  /**
   * Global federated search across all entity types.
   * Searches using case-insensitive substring matching on:
   *   - Pulses: content field
   *   - People: firstName, lastName, email
   *   - Contexts: title field
   *   - Spaces (MeSpace/WeSpace): name field (filtered by user ownership/membership)
   *   - Communities: name field
   *
   * Space Filtering:
   *   - Only returns spaces where the current user is the owner OR a member with any role (ADMIN, MEMBER, or GUEST)
   *   - Private spaces not owned or joined by the user are excluded from results
   *
   * Args:
   *   - query: Search term (required, case-insensitive substring match)
   *
   * Returns: SearchResults with up to 10 results of each entity type
   */
  searchAll?: Maybe<SearchResults>
  searchResults: Array<SearchResults>
  /** @deprecated Please use the explicit field "aggregate" inside "searchResultsConnection" instead */
  searchResultsAggregate: SearchResultsAggregateSelection
  searchResultsConnection: SearchResultsConnection
  spaceMemberships: Array<SpaceMembership>
  /** @deprecated Please use the explicit field "aggregate" inside "spaceMembershipsConnection" instead */
  spaceMembershipsAggregate: SpaceMembershipAggregateSelection
  spaceMembershipsConnection: SpaceMembershipsConnection
  spaces: Array<Space>
  /** @deprecated Please use the explicit field "aggregate" inside "spacesConnection" instead */
  spacesAggregate: SpaceAggregateSelection
  spacesConnection: SpacesConnection
  storyPulses: Array<StoryPulse>
  /** @deprecated Please use the explicit field "aggregate" inside "storyPulsesConnection" instead */
  storyPulsesAggregate: StoryPulseAggregateSelection
  storyPulsesConnection: StoryPulsesConnection
  updateSpaceMemberRoleResponses: Array<UpdateSpaceMemberRoleResponse>
  /** @deprecated Please use the explicit field "aggregate" inside "updateSpaceMemberRoleResponsesConnection" instead */
  updateSpaceMemberRoleResponsesAggregate: UpdateSpaceMemberRoleResponseAggregateSelection
  updateSpaceMemberRoleResponsesConnection: UpdateSpaceMemberRoleResponsesConnection
  weSpaces: Array<WeSpace>
  /** @deprecated Please use the explicit field "aggregate" inside "weSpacesConnection" instead */
  weSpacesAggregate: WeSpaceAggregateSelection
  weSpacesConnection: WeSpacesConnection
}

export type QueryAddSpaceMemberResponsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<AddSpaceMemberResponseSort>>
  where?: InputMaybe<AddSpaceMemberResponseWhere>
}

export type QueryAddSpaceMemberResponsesAggregateArgs = {
  where?: InputMaybe<AddSpaceMemberResponseWhere>
}

export type QueryAddSpaceMemberResponsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<AddSpaceMemberResponseSort>>
  where?: InputMaybe<AddSpaceMemberResponseWhere>
}

export type QueryChatbotResponsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ChatbotResponseSort>>
  where?: InputMaybe<ChatbotResponseWhere>
}

export type QueryChatbotResponsesAggregateArgs = {
  where?: InputMaybe<ChatbotResponseWhere>
}

export type QueryChatbotResponsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ChatbotResponseSort>>
  where?: InputMaybe<ChatbotResponseWhere>
}

export type QueryCommunitiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunitySort>>
  where?: InputMaybe<CommunityWhere>
}

export type QueryCommunitiesAggregateArgs = {
  where?: InputMaybe<CommunityWhere>
}

export type QueryCommunitiesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunitySort>>
  where?: InputMaybe<CommunityWhere>
}

export type QueryFieldContextsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

export type QueryFieldContextsAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

export type QueryFieldContextsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

export type QueryFieldPulsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseSort>>
  where?: InputMaybe<FieldPulseWhere>
}

export type QueryFieldPulsesAggregateArgs = {
  where?: InputMaybe<FieldPulseWhere>
}

export type QueryFieldPulsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseSort>>
  where?: InputMaybe<FieldPulseWhere>
}

export type QueryFieldResonancesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldResonanceSort>>
  where?: InputMaybe<FieldResonanceWhere>
}

export type QueryFieldResonancesAggregateArgs = {
  where?: InputMaybe<FieldResonanceWhere>
}

export type QueryFieldResonancesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldResonanceSort>>
  where?: InputMaybe<FieldResonanceWhere>
}

export type QueryGoalPulsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalPulseSort>>
  where?: InputMaybe<GoalPulseWhere>
}

export type QueryGoalPulsesAggregateArgs = {
  where?: InputMaybe<GoalPulseWhere>
}

export type QueryGoalPulsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalPulseSort>>
  where?: InputMaybe<GoalPulseWhere>
}

export type QueryLifeSensorsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<LifeSensorWhere>
}

export type QueryMeSpacesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MeSpaceSort>>
  where?: InputMaybe<MeSpaceWhere>
}

export type QueryMeSpacesAggregateArgs = {
  where?: InputMaybe<MeSpaceWhere>
}

export type QueryMeSpacesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MeSpaceSort>>
  where?: InputMaybe<MeSpaceWhere>
}

export type QueryPeopleArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type QueryPeopleAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type QueryPeopleConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type QueryRemoveSpaceMemberResponsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<RemoveSpaceMemberResponseSort>>
  where?: InputMaybe<RemoveSpaceMemberResponseWhere>
}

export type QueryRemoveSpaceMemberResponsesAggregateArgs = {
  where?: InputMaybe<RemoveSpaceMemberResponseWhere>
}

export type QueryRemoveSpaceMemberResponsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<RemoveSpaceMemberResponseSort>>
  where?: InputMaybe<RemoveSpaceMemberResponseWhere>
}

export type QueryResonanceLinksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResonanceLinkSort>>
  where?: InputMaybe<ResonanceLinkWhere>
}

export type QueryResonanceLinksAggregateArgs = {
  where?: InputMaybe<ResonanceLinkWhere>
}

export type QueryResonanceLinksConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResonanceLinkSort>>
  where?: InputMaybe<ResonanceLinkWhere>
}

export type QueryResourcePulsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourcePulseSort>>
  where?: InputMaybe<ResourcePulseWhere>
}

export type QueryResourcePulsesAggregateArgs = {
  where?: InputMaybe<ResourcePulseWhere>
}

export type QueryResourcePulsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourcePulseSort>>
  where?: InputMaybe<ResourcePulseWhere>
}

export type QuerySearchAllArgs = {
  query: Scalars['String']['input']
}

export type QuerySearchResultsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SearchResultsWhere>
}

export type QuerySearchResultsAggregateArgs = {
  where?: InputMaybe<SearchResultsWhere>
}

export type QuerySearchResultsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SearchResultsWhere>
}

export type QuerySpaceMembershipsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembershipSort>>
  where?: InputMaybe<SpaceMembershipWhere>
}

export type QuerySpaceMembershipsAggregateArgs = {
  where?: InputMaybe<SpaceMembershipWhere>
}

export type QuerySpaceMembershipsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembershipSort>>
  where?: InputMaybe<SpaceMembershipWhere>
}

export type QuerySpacesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceSort>>
  where?: InputMaybe<SpaceWhere>
}

export type QuerySpacesAggregateArgs = {
  where?: InputMaybe<SpaceWhere>
}

export type QuerySpacesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceSort>>
  where?: InputMaybe<SpaceWhere>
}

export type QueryStoryPulsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<StoryPulseSort>>
  where?: InputMaybe<StoryPulseWhere>
}

export type QueryStoryPulsesAggregateArgs = {
  where?: InputMaybe<StoryPulseWhere>
}

export type QueryStoryPulsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<StoryPulseSort>>
  where?: InputMaybe<StoryPulseWhere>
}

export type QueryUpdateSpaceMemberRoleResponsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<UpdateSpaceMemberRoleResponseSort>>
  where?: InputMaybe<UpdateSpaceMemberRoleResponseWhere>
}

export type QueryUpdateSpaceMemberRoleResponsesAggregateArgs = {
  where?: InputMaybe<UpdateSpaceMemberRoleResponseWhere>
}

export type QueryUpdateSpaceMemberRoleResponsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<UpdateSpaceMemberRoleResponseSort>>
  where?: InputMaybe<UpdateSpaceMemberRoleResponseWhere>
}

export type QueryWeSpacesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<WeSpaceSort>>
  where?: InputMaybe<WeSpaceWhere>
}

export type QueryWeSpacesAggregateArgs = {
  where?: InputMaybe<WeSpaceWhere>
}

export type QueryWeSpacesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<WeSpaceSort>>
  where?: InputMaybe<WeSpaceWhere>
}

/** Response when removing a member from a space. */
export type RemoveSpaceMemberResponse = {
  __typename?: 'RemoveSpaceMemberResponse'
  message: Scalars['String']['output']
  success: Scalars['Boolean']['output']
}

export type RemoveSpaceMemberResponseAggregate = {
  __typename?: 'RemoveSpaceMemberResponseAggregate'
  count: Count
  node: RemoveSpaceMemberResponseAggregateNode
}

export type RemoveSpaceMemberResponseAggregateNode = {
  __typename?: 'RemoveSpaceMemberResponseAggregateNode'
  message: StringAggregateSelection
}

export type RemoveSpaceMemberResponseAggregateSelection = {
  __typename?: 'RemoveSpaceMemberResponseAggregateSelection'
  count: Scalars['Int']['output']
  message: StringAggregateSelection
}

export type RemoveSpaceMemberResponseCreateInput = {
  message: Scalars['String']['input']
  success: Scalars['Boolean']['input']
}

export type RemoveSpaceMemberResponseEdge = {
  __typename?: 'RemoveSpaceMemberResponseEdge'
  cursor: Scalars['String']['output']
  node: RemoveSpaceMemberResponse
}

/** Fields to sort RemoveSpaceMemberResponses by. The order in which sorts are applied is not guaranteed when specifying many fields in one RemoveSpaceMemberResponseSort object. */
export type RemoveSpaceMemberResponseSort = {
  message?: InputMaybe<SortDirection>
  success?: InputMaybe<SortDirection>
}

export type RemoveSpaceMemberResponseUpdateInput = {
  message_SET?: InputMaybe<Scalars['String']['input']>
  success_SET?: InputMaybe<Scalars['Boolean']['input']>
}

export type RemoveSpaceMemberResponseWhere = {
  AND?: InputMaybe<Array<RemoveSpaceMemberResponseWhere>>
  NOT?: InputMaybe<RemoveSpaceMemberResponseWhere>
  OR?: InputMaybe<Array<RemoveSpaceMemberResponseWhere>>
  message_CONTAINS?: InputMaybe<Scalars['String']['input']>
  message_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  message_EQ?: InputMaybe<Scalars['String']['input']>
  message_IN?: InputMaybe<Array<Scalars['String']['input']>>
  message_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  success_EQ?: InputMaybe<Scalars['Boolean']['input']>
}

export type RemoveSpaceMemberResponsesConnection = {
  __typename?: 'RemoveSpaceMemberResponsesConnection'
  aggregate: RemoveSpaceMemberResponseAggregate
  edges: Array<RemoveSpaceMemberResponseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLink = {
  __typename?: 'ResonanceLink'
  confidence: Scalars['Float']['output']
  createdAt: Scalars['DateTime']['output']
  detectedBy: Array<LifeSensor>
  detectedByConnection: ResonanceLinkDetectedByConnection
  evidence?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  resonance: Array<FieldResonance>
  /** @deprecated Please use field "aggregate" inside "resonanceConnection" instead */
  resonanceAggregate?: Maybe<ResonanceLinkFieldResonanceResonanceAggregationSelection>
  resonanceConnection: ResonanceLinkResonanceConnection
  source: Array<FieldPulse>
  /** @deprecated Please use field "aggregate" inside "sourceConnection" instead */
  sourceAggregate?: Maybe<ResonanceLinkFieldPulseSourceAggregationSelection>
  sourceConnection: ResonanceLinkSourceConnection
  target: Array<FieldPulse>
  /** @deprecated Please use field "aggregate" inside "targetConnection" instead */
  targetAggregate?: Maybe<ResonanceLinkFieldPulseTargetAggregationSelection>
  targetConnection: ResonanceLinkTargetConnection
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkDetectedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<LifeSensorWhere>
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkDetectedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ResonanceLinkDetectedByConnectionWhere>
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkResonanceArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldResonanceSort>>
  where?: InputMaybe<FieldResonanceWhere>
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkResonanceAggregateArgs = {
  where?: InputMaybe<FieldResonanceWhere>
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkResonanceConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResonanceLinkResonanceConnectionSort>>
  where?: InputMaybe<ResonanceLinkResonanceConnectionWhere>
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkSourceArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseSort>>
  where?: InputMaybe<FieldPulseWhere>
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkSourceAggregateArgs = {
  where?: InputMaybe<FieldPulseWhere>
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkSourceConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResonanceLinkSourceConnectionSort>>
  where?: InputMaybe<ResonanceLinkSourceConnectionWhere>
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkTargetArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseSort>>
  where?: InputMaybe<FieldPulseWhere>
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkTargetAggregateArgs = {
  where?: InputMaybe<FieldPulseWhere>
}

/**
 * A justified resonance connection between two pulses.
 * This is the explainability layer for AI-generated insights.
 * Label: ["ResonanceLink"]
 */
export type ResonanceLinkTargetConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResonanceLinkTargetConnectionSort>>
  where?: InputMaybe<ResonanceLinkTargetConnectionWhere>
}

export type ResonanceLinkAggregate = {
  __typename?: 'ResonanceLinkAggregate'
  count: Count
  node: ResonanceLinkAggregateNode
}

export type ResonanceLinkAggregateNode = {
  __typename?: 'ResonanceLinkAggregateNode'
  confidence: FloatAggregateSelection
  createdAt: DateTimeAggregateSelection
  evidence: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
}

export type ResonanceLinkAggregateSelection = {
  __typename?: 'ResonanceLinkAggregateSelection'
  confidence: FloatAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  evidence: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
}

export type ResonanceLinkCreateInput = {
  confidence: Scalars['Float']['input']
  createdAt: Scalars['DateTime']['input']
  detectedBy?: InputMaybe<ResonanceLinkDetectedByCreateInput>
  evidence?: InputMaybe<Scalars['String']['input']>
  resonance?: InputMaybe<ResonanceLinkResonanceFieldInput>
  source?: InputMaybe<ResonanceLinkSourceFieldInput>
  target?: InputMaybe<ResonanceLinkTargetFieldInput>
}

export type ResonanceLinkDeleteInput = {
  detectedBy?: InputMaybe<ResonanceLinkDetectedByDeleteInput>
  resonance?: InputMaybe<Array<ResonanceLinkResonanceDeleteFieldInput>>
  source?: InputMaybe<Array<ResonanceLinkSourceDeleteFieldInput>>
  target?: InputMaybe<Array<ResonanceLinkTargetDeleteFieldInput>>
}

export type ResonanceLinkDetectedByCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type ResonanceLinkDetectedByCommunityConnectionWhere = {
  AND?: InputMaybe<Array<ResonanceLinkDetectedByCommunityConnectionWhere>>
  NOT?: InputMaybe<ResonanceLinkDetectedByCommunityConnectionWhere>
  OR?: InputMaybe<Array<ResonanceLinkDetectedByCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type ResonanceLinkDetectedByCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type ResonanceLinkDetectedByCommunityDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<ResonanceLinkDetectedByCommunityConnectionWhere>
}

export type ResonanceLinkDetectedByCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<ResonanceLinkDetectedByCommunityConnectionWhere>
}

export type ResonanceLinkDetectedByCommunityFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkDetectedByCommunityConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkDetectedByCommunityCreateFieldInput>>
}

export type ResonanceLinkDetectedByCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<ResonanceLinkDetectedByCommunityConnectionWhere>
}

export type ResonanceLinkDetectedByCommunityUpdateFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkDetectedByCommunityConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkDetectedByCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<ResonanceLinkDetectedByCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<ResonanceLinkDetectedByCommunityDisconnectFieldInput>
  >
  update?: InputMaybe<ResonanceLinkDetectedByCommunityUpdateConnectionInput>
}

export type ResonanceLinkDetectedByConnection = {
  __typename?: 'ResonanceLinkDetectedByConnection'
  edges: Array<ResonanceLinkDetectedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResonanceLinkDetectedByConnectionWhere = {
  Community?: InputMaybe<ResonanceLinkDetectedByCommunityConnectionWhere>
  Person?: InputMaybe<ResonanceLinkDetectedByPersonConnectionWhere>
}

export type ResonanceLinkDetectedByCreateInput = {
  Community?: InputMaybe<ResonanceLinkDetectedByCommunityFieldInput>
  Person?: InputMaybe<ResonanceLinkDetectedByPersonFieldInput>
}

export type ResonanceLinkDetectedByDeleteInput = {
  Community?: InputMaybe<
    Array<ResonanceLinkDetectedByCommunityDeleteFieldInput>
  >
  Person?: InputMaybe<Array<ResonanceLinkDetectedByPersonDeleteFieldInput>>
}

export type ResonanceLinkDetectedByPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type ResonanceLinkDetectedByPersonConnectionWhere = {
  AND?: InputMaybe<Array<ResonanceLinkDetectedByPersonConnectionWhere>>
  NOT?: InputMaybe<ResonanceLinkDetectedByPersonConnectionWhere>
  OR?: InputMaybe<Array<ResonanceLinkDetectedByPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type ResonanceLinkDetectedByPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type ResonanceLinkDetectedByPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<ResonanceLinkDetectedByPersonConnectionWhere>
}

export type ResonanceLinkDetectedByPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<ResonanceLinkDetectedByPersonConnectionWhere>
}

export type ResonanceLinkDetectedByPersonFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkDetectedByPersonConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkDetectedByPersonCreateFieldInput>>
}

export type ResonanceLinkDetectedByPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<ResonanceLinkDetectedByPersonConnectionWhere>
}

export type ResonanceLinkDetectedByPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkDetectedByPersonConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkDetectedByPersonCreateFieldInput>>
  delete?: InputMaybe<Array<ResonanceLinkDetectedByPersonDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<ResonanceLinkDetectedByPersonDisconnectFieldInput>
  >
  update?: InputMaybe<ResonanceLinkDetectedByPersonUpdateConnectionInput>
}

export type ResonanceLinkDetectedByRelationship = {
  __typename?: 'ResonanceLinkDetectedByRelationship'
  cursor: Scalars['String']['output']
  node: LifeSensor
}

export type ResonanceLinkDetectedByUpdateInput = {
  Community?: InputMaybe<
    Array<ResonanceLinkDetectedByCommunityUpdateFieldInput>
  >
  Person?: InputMaybe<Array<ResonanceLinkDetectedByPersonUpdateFieldInput>>
}

export type ResonanceLinkEdge = {
  __typename?: 'ResonanceLinkEdge'
  cursor: Scalars['String']['output']
  node: ResonanceLink
}

export type ResonanceLinkFieldPulseSourceAggregateSelection = {
  __typename?: 'ResonanceLinkFieldPulseSourceAggregateSelection'
  count: CountConnection
  node?: Maybe<ResonanceLinkFieldPulseSourceNodeAggregateSelection>
}

export type ResonanceLinkFieldPulseSourceAggregationSelection = {
  __typename?: 'ResonanceLinkFieldPulseSourceAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResonanceLinkFieldPulseSourceNodeAggregateSelection>
}

export type ResonanceLinkFieldPulseSourceNodeAggregateSelection = {
  __typename?: 'ResonanceLinkFieldPulseSourceNodeAggregateSelection'
  content: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type ResonanceLinkFieldPulseTargetAggregateSelection = {
  __typename?: 'ResonanceLinkFieldPulseTargetAggregateSelection'
  count: CountConnection
  node?: Maybe<ResonanceLinkFieldPulseTargetNodeAggregateSelection>
}

export type ResonanceLinkFieldPulseTargetAggregationSelection = {
  __typename?: 'ResonanceLinkFieldPulseTargetAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResonanceLinkFieldPulseTargetNodeAggregateSelection>
}

export type ResonanceLinkFieldPulseTargetNodeAggregateSelection = {
  __typename?: 'ResonanceLinkFieldPulseTargetNodeAggregateSelection'
  content: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type ResonanceLinkFieldResonanceResonanceAggregateSelection = {
  __typename?: 'ResonanceLinkFieldResonanceResonanceAggregateSelection'
  count: CountConnection
  node?: Maybe<ResonanceLinkFieldResonanceResonanceNodeAggregateSelection>
}

export type ResonanceLinkFieldResonanceResonanceAggregationSelection = {
  __typename?: 'ResonanceLinkFieldResonanceResonanceAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResonanceLinkFieldResonanceResonanceNodeAggregateSelection>
}

export type ResonanceLinkFieldResonanceResonanceNodeAggregateSelection = {
  __typename?: 'ResonanceLinkFieldResonanceResonanceNodeAggregateSelection'
  description: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  label: StringAggregateSelection
}

export type ResonanceLinkResonanceAggregateInput = {
  AND?: InputMaybe<Array<ResonanceLinkResonanceAggregateInput>>
  NOT?: InputMaybe<ResonanceLinkResonanceAggregateInput>
  OR?: InputMaybe<Array<ResonanceLinkResonanceAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResonanceLinkResonanceNodeAggregationWhereInput>
}

export type ResonanceLinkResonanceConnectFieldInput = {
  where?: InputMaybe<FieldResonanceConnectWhere>
}

export type ResonanceLinkResonanceConnection = {
  __typename?: 'ResonanceLinkResonanceConnection'
  aggregate: ResonanceLinkFieldResonanceResonanceAggregateSelection
  edges: Array<ResonanceLinkResonanceRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResonanceLinkResonanceConnectionSort = {
  node?: InputMaybe<FieldResonanceSort>
}

export type ResonanceLinkResonanceConnectionWhere = {
  AND?: InputMaybe<Array<ResonanceLinkResonanceConnectionWhere>>
  NOT?: InputMaybe<ResonanceLinkResonanceConnectionWhere>
  OR?: InputMaybe<Array<ResonanceLinkResonanceConnectionWhere>>
  node?: InputMaybe<FieldResonanceWhere>
}

export type ResonanceLinkResonanceCreateFieldInput = {
  node: FieldResonanceCreateInput
}

export type ResonanceLinkResonanceDeleteFieldInput = {
  where?: InputMaybe<ResonanceLinkResonanceConnectionWhere>
}

export type ResonanceLinkResonanceDisconnectFieldInput = {
  where?: InputMaybe<ResonanceLinkResonanceConnectionWhere>
}

export type ResonanceLinkResonanceFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkResonanceConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkResonanceCreateFieldInput>>
}

export type ResonanceLinkResonanceNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResonanceLinkResonanceNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResonanceLinkResonanceNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResonanceLinkResonanceNodeAggregationWhereInput>>
  description_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  description_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  description_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  description_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  description_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  description_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  description_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  description_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  description_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  description_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  description_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  description_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  description_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  description_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  description_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  label_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  label_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  label_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  label_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  label_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  label_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  label_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  label_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  label_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  label_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  label_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  label_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  label_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  label_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  label_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type ResonanceLinkResonanceRelationship = {
  __typename?: 'ResonanceLinkResonanceRelationship'
  cursor: Scalars['String']['output']
  node: FieldResonance
}

export type ResonanceLinkResonanceUpdateConnectionInput = {
  node?: InputMaybe<FieldResonanceUpdateInput>
  where?: InputMaybe<ResonanceLinkResonanceConnectionWhere>
}

export type ResonanceLinkResonanceUpdateFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkResonanceConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkResonanceCreateFieldInput>>
  delete?: InputMaybe<Array<ResonanceLinkResonanceDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResonanceLinkResonanceDisconnectFieldInput>>
  update?: InputMaybe<ResonanceLinkResonanceUpdateConnectionInput>
}

/** Fields to sort ResonanceLinks by. The order in which sorts are applied is not guaranteed when specifying many fields in one ResonanceLinkSort object. */
export type ResonanceLinkSort = {
  confidence?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  evidence?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
}

export type ResonanceLinkSourceAggregateInput = {
  AND?: InputMaybe<Array<ResonanceLinkSourceAggregateInput>>
  NOT?: InputMaybe<ResonanceLinkSourceAggregateInput>
  OR?: InputMaybe<Array<ResonanceLinkSourceAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResonanceLinkSourceNodeAggregationWhereInput>
}

export type ResonanceLinkSourceConnectFieldInput = {
  connect?: InputMaybe<FieldPulseConnectInput>
  where?: InputMaybe<FieldPulseConnectWhere>
}

export type ResonanceLinkSourceConnection = {
  __typename?: 'ResonanceLinkSourceConnection'
  aggregate: ResonanceLinkFieldPulseSourceAggregateSelection
  edges: Array<ResonanceLinkSourceRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResonanceLinkSourceConnectionSort = {
  node?: InputMaybe<FieldPulseSort>
}

export type ResonanceLinkSourceConnectionWhere = {
  AND?: InputMaybe<Array<ResonanceLinkSourceConnectionWhere>>
  NOT?: InputMaybe<ResonanceLinkSourceConnectionWhere>
  OR?: InputMaybe<Array<ResonanceLinkSourceConnectionWhere>>
  node?: InputMaybe<FieldPulseWhere>
}

export type ResonanceLinkSourceCreateFieldInput = {
  node: FieldPulseCreateInput
}

export type ResonanceLinkSourceDeleteFieldInput = {
  delete?: InputMaybe<FieldPulseDeleteInput>
  where?: InputMaybe<ResonanceLinkSourceConnectionWhere>
}

export type ResonanceLinkSourceDisconnectFieldInput = {
  disconnect?: InputMaybe<FieldPulseDisconnectInput>
  where?: InputMaybe<ResonanceLinkSourceConnectionWhere>
}

export type ResonanceLinkSourceFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkSourceConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkSourceCreateFieldInput>>
}

export type ResonanceLinkSourceNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResonanceLinkSourceNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResonanceLinkSourceNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResonanceLinkSourceNodeAggregationWhereInput>>
  content_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  content_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  intensity_AVERAGE_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_LTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_LTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_LTE?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_LTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  title_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type ResonanceLinkSourceRelationship = {
  __typename?: 'ResonanceLinkSourceRelationship'
  cursor: Scalars['String']['output']
  node: FieldPulse
}

export type ResonanceLinkSourceUpdateConnectionInput = {
  node?: InputMaybe<FieldPulseUpdateInput>
  where?: InputMaybe<ResonanceLinkSourceConnectionWhere>
}

export type ResonanceLinkSourceUpdateFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkSourceConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkSourceCreateFieldInput>>
  delete?: InputMaybe<Array<ResonanceLinkSourceDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResonanceLinkSourceDisconnectFieldInput>>
  update?: InputMaybe<ResonanceLinkSourceUpdateConnectionInput>
}

export type ResonanceLinkTargetAggregateInput = {
  AND?: InputMaybe<Array<ResonanceLinkTargetAggregateInput>>
  NOT?: InputMaybe<ResonanceLinkTargetAggregateInput>
  OR?: InputMaybe<Array<ResonanceLinkTargetAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResonanceLinkTargetNodeAggregationWhereInput>
}

export type ResonanceLinkTargetConnectFieldInput = {
  connect?: InputMaybe<FieldPulseConnectInput>
  where?: InputMaybe<FieldPulseConnectWhere>
}

export type ResonanceLinkTargetConnection = {
  __typename?: 'ResonanceLinkTargetConnection'
  aggregate: ResonanceLinkFieldPulseTargetAggregateSelection
  edges: Array<ResonanceLinkTargetRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResonanceLinkTargetConnectionSort = {
  node?: InputMaybe<FieldPulseSort>
}

export type ResonanceLinkTargetConnectionWhere = {
  AND?: InputMaybe<Array<ResonanceLinkTargetConnectionWhere>>
  NOT?: InputMaybe<ResonanceLinkTargetConnectionWhere>
  OR?: InputMaybe<Array<ResonanceLinkTargetConnectionWhere>>
  node?: InputMaybe<FieldPulseWhere>
}

export type ResonanceLinkTargetCreateFieldInput = {
  node: FieldPulseCreateInput
}

export type ResonanceLinkTargetDeleteFieldInput = {
  delete?: InputMaybe<FieldPulseDeleteInput>
  where?: InputMaybe<ResonanceLinkTargetConnectionWhere>
}

export type ResonanceLinkTargetDisconnectFieldInput = {
  disconnect?: InputMaybe<FieldPulseDisconnectInput>
  where?: InputMaybe<ResonanceLinkTargetConnectionWhere>
}

export type ResonanceLinkTargetFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkTargetConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkTargetCreateFieldInput>>
}

export type ResonanceLinkTargetNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResonanceLinkTargetNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResonanceLinkTargetNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResonanceLinkTargetNodeAggregationWhereInput>>
  content_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  content_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  content_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  content_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  content_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  intensity_AVERAGE_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_AVERAGE_LTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_MAX_LTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_MIN_LTE?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_EQUAL?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_SUM_LTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  title_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type ResonanceLinkTargetRelationship = {
  __typename?: 'ResonanceLinkTargetRelationship'
  cursor: Scalars['String']['output']
  node: FieldPulse
}

export type ResonanceLinkTargetUpdateConnectionInput = {
  node?: InputMaybe<FieldPulseUpdateInput>
  where?: InputMaybe<ResonanceLinkTargetConnectionWhere>
}

export type ResonanceLinkTargetUpdateFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkTargetConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkTargetCreateFieldInput>>
  delete?: InputMaybe<Array<ResonanceLinkTargetDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResonanceLinkTargetDisconnectFieldInput>>
  update?: InputMaybe<ResonanceLinkTargetUpdateConnectionInput>
}

export type ResonanceLinkUpdateInput = {
  confidence_ADD?: InputMaybe<Scalars['Float']['input']>
  confidence_DIVIDE?: InputMaybe<Scalars['Float']['input']>
  confidence_MULTIPLY?: InputMaybe<Scalars['Float']['input']>
  confidence_SET?: InputMaybe<Scalars['Float']['input']>
  confidence_SUBTRACT?: InputMaybe<Scalars['Float']['input']>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  detectedBy?: InputMaybe<ResonanceLinkDetectedByUpdateInput>
  evidence_SET?: InputMaybe<Scalars['String']['input']>
  resonance?: InputMaybe<Array<ResonanceLinkResonanceUpdateFieldInput>>
  source?: InputMaybe<Array<ResonanceLinkSourceUpdateFieldInput>>
  target?: InputMaybe<Array<ResonanceLinkTargetUpdateFieldInput>>
}

export type ResonanceLinkWhere = {
  AND?: InputMaybe<Array<ResonanceLinkWhere>>
  NOT?: InputMaybe<ResonanceLinkWhere>
  OR?: InputMaybe<Array<ResonanceLinkWhere>>
  confidence_EQ?: InputMaybe<Scalars['Float']['input']>
  confidence_GT?: InputMaybe<Scalars['Float']['input']>
  confidence_GTE?: InputMaybe<Scalars['Float']['input']>
  confidence_IN?: InputMaybe<Array<Scalars['Float']['input']>>
  confidence_LT?: InputMaybe<Scalars['Float']['input']>
  confidence_LTE?: InputMaybe<Scalars['Float']['input']>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  /** Return ResonanceLinks where all of the related ResonanceLinkDetectedByConnections match this filter */
  detectedByConnection_ALL?: InputMaybe<ResonanceLinkDetectedByConnectionWhere>
  /** Return ResonanceLinks where none of the related ResonanceLinkDetectedByConnections match this filter */
  detectedByConnection_NONE?: InputMaybe<ResonanceLinkDetectedByConnectionWhere>
  /** Return ResonanceLinks where one of the related ResonanceLinkDetectedByConnections match this filter */
  detectedByConnection_SINGLE?: InputMaybe<ResonanceLinkDetectedByConnectionWhere>
  /** Return ResonanceLinks where some of the related ResonanceLinkDetectedByConnections match this filter */
  detectedByConnection_SOME?: InputMaybe<ResonanceLinkDetectedByConnectionWhere>
  /** Return ResonanceLinks where all of the related LifeSensors match this filter */
  detectedBy_ALL?: InputMaybe<LifeSensorWhere>
  /** Return ResonanceLinks where none of the related LifeSensors match this filter */
  detectedBy_NONE?: InputMaybe<LifeSensorWhere>
  /** Return ResonanceLinks where one of the related LifeSensors match this filter */
  detectedBy_SINGLE?: InputMaybe<LifeSensorWhere>
  /** Return ResonanceLinks where some of the related LifeSensors match this filter */
  detectedBy_SOME?: InputMaybe<LifeSensorWhere>
  evidence_CONTAINS?: InputMaybe<Scalars['String']['input']>
  evidence_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  evidence_EQ?: InputMaybe<Scalars['String']['input']>
  evidence_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  evidence_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  resonanceAggregate?: InputMaybe<ResonanceLinkResonanceAggregateInput>
  /** Return ResonanceLinks where all of the related ResonanceLinkResonanceConnections match this filter */
  resonanceConnection_ALL?: InputMaybe<ResonanceLinkResonanceConnectionWhere>
  /** Return ResonanceLinks where none of the related ResonanceLinkResonanceConnections match this filter */
  resonanceConnection_NONE?: InputMaybe<ResonanceLinkResonanceConnectionWhere>
  /** Return ResonanceLinks where one of the related ResonanceLinkResonanceConnections match this filter */
  resonanceConnection_SINGLE?: InputMaybe<ResonanceLinkResonanceConnectionWhere>
  /** Return ResonanceLinks where some of the related ResonanceLinkResonanceConnections match this filter */
  resonanceConnection_SOME?: InputMaybe<ResonanceLinkResonanceConnectionWhere>
  /** Return ResonanceLinks where all of the related FieldResonances match this filter */
  resonance_ALL?: InputMaybe<FieldResonanceWhere>
  /** Return ResonanceLinks where none of the related FieldResonances match this filter */
  resonance_NONE?: InputMaybe<FieldResonanceWhere>
  /** Return ResonanceLinks where one of the related FieldResonances match this filter */
  resonance_SINGLE?: InputMaybe<FieldResonanceWhere>
  /** Return ResonanceLinks where some of the related FieldResonances match this filter */
  resonance_SOME?: InputMaybe<FieldResonanceWhere>
  sourceAggregate?: InputMaybe<ResonanceLinkSourceAggregateInput>
  /** Return ResonanceLinks where all of the related ResonanceLinkSourceConnections match this filter */
  sourceConnection_ALL?: InputMaybe<ResonanceLinkSourceConnectionWhere>
  /** Return ResonanceLinks where none of the related ResonanceLinkSourceConnections match this filter */
  sourceConnection_NONE?: InputMaybe<ResonanceLinkSourceConnectionWhere>
  /** Return ResonanceLinks where one of the related ResonanceLinkSourceConnections match this filter */
  sourceConnection_SINGLE?: InputMaybe<ResonanceLinkSourceConnectionWhere>
  /** Return ResonanceLinks where some of the related ResonanceLinkSourceConnections match this filter */
  sourceConnection_SOME?: InputMaybe<ResonanceLinkSourceConnectionWhere>
  /** Return ResonanceLinks where all of the related FieldPulses match this filter */
  source_ALL?: InputMaybe<FieldPulseWhere>
  /** Return ResonanceLinks where none of the related FieldPulses match this filter */
  source_NONE?: InputMaybe<FieldPulseWhere>
  /** Return ResonanceLinks where one of the related FieldPulses match this filter */
  source_SINGLE?: InputMaybe<FieldPulseWhere>
  /** Return ResonanceLinks where some of the related FieldPulses match this filter */
  source_SOME?: InputMaybe<FieldPulseWhere>
  targetAggregate?: InputMaybe<ResonanceLinkTargetAggregateInput>
  /** Return ResonanceLinks where all of the related ResonanceLinkTargetConnections match this filter */
  targetConnection_ALL?: InputMaybe<ResonanceLinkTargetConnectionWhere>
  /** Return ResonanceLinks where none of the related ResonanceLinkTargetConnections match this filter */
  targetConnection_NONE?: InputMaybe<ResonanceLinkTargetConnectionWhere>
  /** Return ResonanceLinks where one of the related ResonanceLinkTargetConnections match this filter */
  targetConnection_SINGLE?: InputMaybe<ResonanceLinkTargetConnectionWhere>
  /** Return ResonanceLinks where some of the related ResonanceLinkTargetConnections match this filter */
  targetConnection_SOME?: InputMaybe<ResonanceLinkTargetConnectionWhere>
  /** Return ResonanceLinks where all of the related FieldPulses match this filter */
  target_ALL?: InputMaybe<FieldPulseWhere>
  /** Return ResonanceLinks where none of the related FieldPulses match this filter */
  target_NONE?: InputMaybe<FieldPulseWhere>
  /** Return ResonanceLinks where one of the related FieldPulses match this filter */
  target_SINGLE?: InputMaybe<FieldPulseWhere>
  /** Return ResonanceLinks where some of the related FieldPulses match this filter */
  target_SOME?: InputMaybe<FieldPulseWhere>
}

export type ResonanceLinksConnection = {
  __typename?: 'ResonanceLinksConnection'
  aggregate: ResonanceLinkAggregate
  edges: Array<ResonanceLinkEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/**
 * A pulse that functions as a resource in its context.
 * Multi-label: ["FieldPulse", "ResourcePulse"]
 */
export type ResourcePulse = FieldPulse & {
  __typename?: 'ResourcePulse'
  availability?: Maybe<Scalars['Float']['output']>
  content: Scalars['String']['output']
  context: Array<FieldContext>
  /** @deprecated Please use field "aggregate" inside "contextConnection" instead */
  contextAggregate?: Maybe<ResourcePulseFieldContextContextAggregationSelection>
  contextConnection: FieldPulseContextConnection
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  initiatedBy: Array<LifeSensor>
  initiatedByConnection: ResourcePulseInitiatedByConnection
  intensity?: Maybe<Scalars['Float']['output']>
  resourceType: Scalars['String']['output']
  title: Scalars['String']['output']
}

/**
 * A pulse that functions as a resource in its context.
 * Multi-label: ["FieldPulse", "ResourcePulse"]
 */
export type ResourcePulseContextArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A pulse that functions as a resource in its context.
 * Multi-label: ["FieldPulse", "ResourcePulse"]
 */
export type ResourcePulseContextAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A pulse that functions as a resource in its context.
 * Multi-label: ["FieldPulse", "ResourcePulse"]
 */
export type ResourcePulseContextConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseContextConnectionSort>>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

/**
 * A pulse that functions as a resource in its context.
 * Multi-label: ["FieldPulse", "ResourcePulse"]
 */
export type ResourcePulseInitiatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<LifeSensorWhere>
}

/**
 * A pulse that functions as a resource in its context.
 * Multi-label: ["FieldPulse", "ResourcePulse"]
 */
export type ResourcePulseInitiatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<ResourcePulseInitiatedByConnectionWhere>
}

export type ResourcePulseAggregate = {
  __typename?: 'ResourcePulseAggregate'
  count: Count
  node: ResourcePulseAggregateNode
}

export type ResourcePulseAggregateNode = {
  __typename?: 'ResourcePulseAggregateNode'
  availability: FloatAggregateSelection
  content: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  resourceType: StringAggregateSelection
  title: StringAggregateSelection
}

export type ResourcePulseAggregateSelection = {
  __typename?: 'ResourcePulseAggregateSelection'
  availability: FloatAggregateSelection
  content: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  resourceType: StringAggregateSelection
  title: StringAggregateSelection
}

export type ResourcePulseContextAggregateInput = {
  AND?: InputMaybe<Array<ResourcePulseContextAggregateInput>>
  NOT?: InputMaybe<ResourcePulseContextAggregateInput>
  OR?: InputMaybe<Array<ResourcePulseContextAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourcePulseContextNodeAggregationWhereInput>
}

export type ResourcePulseContextConnectFieldInput = {
  connect?: InputMaybe<Array<FieldContextConnectInput>>
  where?: InputMaybe<FieldContextConnectWhere>
}

export type ResourcePulseContextCreateFieldInput = {
  node: FieldContextCreateInput
}

export type ResourcePulseContextFieldInput = {
  connect?: InputMaybe<Array<ResourcePulseContextConnectFieldInput>>
  create?: InputMaybe<Array<ResourcePulseContextCreateFieldInput>>
}

export type ResourcePulseContextNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourcePulseContextNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourcePulseContextNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourcePulseContextNodeAggregationWhereInput>>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  emergentName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  title_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type ResourcePulseContextUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

export type ResourcePulseContextUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourcePulseContextConnectFieldInput>>
  create?: InputMaybe<Array<ResourcePulseContextCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseContextDisconnectFieldInput>>
  update?: InputMaybe<ResourcePulseContextUpdateConnectionInput>
}

export type ResourcePulseCreateInput = {
  availability?: InputMaybe<Scalars['Float']['input']>
  content: Scalars['String']['input']
  context?: InputMaybe<ResourcePulseContextFieldInput>
  createdAt: Scalars['DateTime']['input']
  initiatedBy?: InputMaybe<ResourcePulseInitiatedByCreateInput>
  intensity?: InputMaybe<Scalars['Float']['input']>
  resourceType: Scalars['String']['input']
  title: Scalars['String']['input']
}

export type ResourcePulseDeleteInput = {
  context?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  initiatedBy?: InputMaybe<ResourcePulseInitiatedByDeleteInput>
}

export type ResourcePulseEdge = {
  __typename?: 'ResourcePulseEdge'
  cursor: Scalars['String']['output']
  node: ResourcePulse
}

export type ResourcePulseFieldContextContextAggregationSelection = {
  __typename?: 'ResourcePulseFieldContextContextAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourcePulseFieldContextContextNodeAggregateSelection>
}

export type ResourcePulseFieldContextContextNodeAggregateSelection = {
  __typename?: 'ResourcePulseFieldContextContextNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  emergentName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  title: StringAggregateSelection
}

export type ResourcePulseInitiatedByCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type ResourcePulseInitiatedByCommunityConnectionWhere = {
  AND?: InputMaybe<Array<ResourcePulseInitiatedByCommunityConnectionWhere>>
  NOT?: InputMaybe<ResourcePulseInitiatedByCommunityConnectionWhere>
  OR?: InputMaybe<Array<ResourcePulseInitiatedByCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type ResourcePulseInitiatedByCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type ResourcePulseInitiatedByCommunityDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<ResourcePulseInitiatedByCommunityConnectionWhere>
}

export type ResourcePulseInitiatedByCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<ResourcePulseInitiatedByCommunityConnectionWhere>
}

export type ResourcePulseInitiatedByCommunityFieldInput = {
  connect?: InputMaybe<
    Array<ResourcePulseInitiatedByCommunityConnectFieldInput>
  >
  create?: InputMaybe<Array<ResourcePulseInitiatedByCommunityCreateFieldInput>>
}

export type ResourcePulseInitiatedByCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<ResourcePulseInitiatedByCommunityConnectionWhere>
}

export type ResourcePulseInitiatedByCommunityUpdateFieldInput = {
  connect?: InputMaybe<
    Array<ResourcePulseInitiatedByCommunityConnectFieldInput>
  >
  create?: InputMaybe<Array<ResourcePulseInitiatedByCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<ResourcePulseInitiatedByCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<ResourcePulseInitiatedByCommunityDisconnectFieldInput>
  >
  update?: InputMaybe<ResourcePulseInitiatedByCommunityUpdateConnectionInput>
}

export type ResourcePulseInitiatedByConnection = {
  __typename?: 'ResourcePulseInitiatedByConnection'
  edges: Array<ResourcePulseInitiatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResourcePulseInitiatedByConnectionWhere = {
  Community?: InputMaybe<ResourcePulseInitiatedByCommunityConnectionWhere>
  Person?: InputMaybe<ResourcePulseInitiatedByPersonConnectionWhere>
}

export type ResourcePulseInitiatedByCreateInput = {
  Community?: InputMaybe<ResourcePulseInitiatedByCommunityFieldInput>
  Person?: InputMaybe<ResourcePulseInitiatedByPersonFieldInput>
}

export type ResourcePulseInitiatedByDeleteInput = {
  Community?: InputMaybe<
    Array<ResourcePulseInitiatedByCommunityDeleteFieldInput>
  >
  Person?: InputMaybe<Array<ResourcePulseInitiatedByPersonDeleteFieldInput>>
}

export type ResourcePulseInitiatedByPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type ResourcePulseInitiatedByPersonConnectionWhere = {
  AND?: InputMaybe<Array<ResourcePulseInitiatedByPersonConnectionWhere>>
  NOT?: InputMaybe<ResourcePulseInitiatedByPersonConnectionWhere>
  OR?: InputMaybe<Array<ResourcePulseInitiatedByPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type ResourcePulseInitiatedByPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type ResourcePulseInitiatedByPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<ResourcePulseInitiatedByPersonConnectionWhere>
}

export type ResourcePulseInitiatedByPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<ResourcePulseInitiatedByPersonConnectionWhere>
}

export type ResourcePulseInitiatedByPersonFieldInput = {
  connect?: InputMaybe<Array<ResourcePulseInitiatedByPersonConnectFieldInput>>
  create?: InputMaybe<Array<ResourcePulseInitiatedByPersonCreateFieldInput>>
}

export type ResourcePulseInitiatedByPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<ResourcePulseInitiatedByPersonConnectionWhere>
}

export type ResourcePulseInitiatedByPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourcePulseInitiatedByPersonConnectFieldInput>>
  create?: InputMaybe<Array<ResourcePulseInitiatedByPersonCreateFieldInput>>
  delete?: InputMaybe<Array<ResourcePulseInitiatedByPersonDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<ResourcePulseInitiatedByPersonDisconnectFieldInput>
  >
  update?: InputMaybe<ResourcePulseInitiatedByPersonUpdateConnectionInput>
}

export type ResourcePulseInitiatedByRelationship = {
  __typename?: 'ResourcePulseInitiatedByRelationship'
  cursor: Scalars['String']['output']
  node: LifeSensor
}

export type ResourcePulseInitiatedByUpdateInput = {
  Community?: InputMaybe<
    Array<ResourcePulseInitiatedByCommunityUpdateFieldInput>
  >
  Person?: InputMaybe<Array<ResourcePulseInitiatedByPersonUpdateFieldInput>>
}

/** Fields to sort ResourcePulses by. The order in which sorts are applied is not guaranteed when specifying many fields in one ResourcePulseSort object. */
export type ResourcePulseSort = {
  availability?: InputMaybe<SortDirection>
  content?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  intensity?: InputMaybe<SortDirection>
  resourceType?: InputMaybe<SortDirection>
  title?: InputMaybe<SortDirection>
}

export type ResourcePulseUpdateInput = {
  availability_ADD?: InputMaybe<Scalars['Float']['input']>
  availability_DIVIDE?: InputMaybe<Scalars['Float']['input']>
  availability_MULTIPLY?: InputMaybe<Scalars['Float']['input']>
  availability_SET?: InputMaybe<Scalars['Float']['input']>
  availability_SUBTRACT?: InputMaybe<Scalars['Float']['input']>
  content_SET?: InputMaybe<Scalars['String']['input']>
  context?: InputMaybe<Array<ResourcePulseContextUpdateFieldInput>>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  initiatedBy?: InputMaybe<ResourcePulseInitiatedByUpdateInput>
  intensity_ADD?: InputMaybe<Scalars['Float']['input']>
  intensity_DIVIDE?: InputMaybe<Scalars['Float']['input']>
  intensity_MULTIPLY?: InputMaybe<Scalars['Float']['input']>
  intensity_SET?: InputMaybe<Scalars['Float']['input']>
  intensity_SUBTRACT?: InputMaybe<Scalars['Float']['input']>
  resourceType_SET?: InputMaybe<Scalars['String']['input']>
  title_SET?: InputMaybe<Scalars['String']['input']>
}

export type ResourcePulseWhere = {
  AND?: InputMaybe<Array<ResourcePulseWhere>>
  NOT?: InputMaybe<ResourcePulseWhere>
  OR?: InputMaybe<Array<ResourcePulseWhere>>
  availability_EQ?: InputMaybe<Scalars['Float']['input']>
  availability_GT?: InputMaybe<Scalars['Float']['input']>
  availability_GTE?: InputMaybe<Scalars['Float']['input']>
  availability_IN?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  availability_LT?: InputMaybe<Scalars['Float']['input']>
  availability_LTE?: InputMaybe<Scalars['Float']['input']>
  content_CONTAINS?: InputMaybe<Scalars['String']['input']>
  content_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  content_EQ?: InputMaybe<Scalars['String']['input']>
  content_IN?: InputMaybe<Array<Scalars['String']['input']>>
  content_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  contextAggregate?: InputMaybe<ResourcePulseContextAggregateInput>
  /** Return ResourcePulses where all of the related FieldPulseContextConnections match this filter */
  contextConnection_ALL?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return ResourcePulses where none of the related FieldPulseContextConnections match this filter */
  contextConnection_NONE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return ResourcePulses where one of the related FieldPulseContextConnections match this filter */
  contextConnection_SINGLE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return ResourcePulses where some of the related FieldPulseContextConnections match this filter */
  contextConnection_SOME?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return ResourcePulses where all of the related FieldContexts match this filter */
  context_ALL?: InputMaybe<FieldContextWhere>
  /** Return ResourcePulses where none of the related FieldContexts match this filter */
  context_NONE?: InputMaybe<FieldContextWhere>
  /** Return ResourcePulses where one of the related FieldContexts match this filter */
  context_SINGLE?: InputMaybe<FieldContextWhere>
  /** Return ResourcePulses where some of the related FieldContexts match this filter */
  context_SOME?: InputMaybe<FieldContextWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  /** Return ResourcePulses where all of the related ResourcePulseInitiatedByConnections match this filter */
  initiatedByConnection_ALL?: InputMaybe<ResourcePulseInitiatedByConnectionWhere>
  /** Return ResourcePulses where none of the related ResourcePulseInitiatedByConnections match this filter */
  initiatedByConnection_NONE?: InputMaybe<ResourcePulseInitiatedByConnectionWhere>
  /** Return ResourcePulses where one of the related ResourcePulseInitiatedByConnections match this filter */
  initiatedByConnection_SINGLE?: InputMaybe<ResourcePulseInitiatedByConnectionWhere>
  /** Return ResourcePulses where some of the related ResourcePulseInitiatedByConnections match this filter */
  initiatedByConnection_SOME?: InputMaybe<ResourcePulseInitiatedByConnectionWhere>
  /** Return ResourcePulses where all of the related LifeSensors match this filter */
  initiatedBy_ALL?: InputMaybe<LifeSensorWhere>
  /** Return ResourcePulses where none of the related LifeSensors match this filter */
  initiatedBy_NONE?: InputMaybe<LifeSensorWhere>
  /** Return ResourcePulses where one of the related LifeSensors match this filter */
  initiatedBy_SINGLE?: InputMaybe<LifeSensorWhere>
  /** Return ResourcePulses where some of the related LifeSensors match this filter */
  initiatedBy_SOME?: InputMaybe<LifeSensorWhere>
  intensity_EQ?: InputMaybe<Scalars['Float']['input']>
  intensity_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_IN?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  intensity_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_LTE?: InputMaybe<Scalars['Float']['input']>
  resourceType_CONTAINS?: InputMaybe<Scalars['String']['input']>
  resourceType_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  resourceType_EQ?: InputMaybe<Scalars['String']['input']>
  resourceType_IN?: InputMaybe<Array<Scalars['String']['input']>>
  resourceType_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  title_CONTAINS?: InputMaybe<Scalars['String']['input']>
  title_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  title_EQ?: InputMaybe<Scalars['String']['input']>
  title_IN?: InputMaybe<Array<Scalars['String']['input']>>
  title_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type ResourcePulsesConnection = {
  __typename?: 'ResourcePulsesConnection'
  aggregate: ResourcePulseAggregate
  edges: Array<ResourcePulseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/**
 * Structured response for categorized search results.
 * Returns up to 10 results of each entity type matching the search query.
 */
export type SearchResults = {
  __typename?: 'SearchResults'
  communities: Array<Community>
  contexts: Array<FieldContext>
  goalPulses: Array<GoalPulse>
  meSpaces: Array<MeSpace>
  people: Array<Person>
  resourcePulses: Array<ResourcePulse>
  storyPulses: Array<StoryPulse>
  weSpaces: Array<WeSpace>
}

export type SearchResultsAggregate = {
  __typename?: 'SearchResultsAggregate'
  count: Count
}

export type SearchResultsAggregateSelection = {
  __typename?: 'SearchResultsAggregateSelection'
  count: Scalars['Int']['output']
}

export type SearchResultsConnection = {
  __typename?: 'SearchResultsConnection'
  aggregate: SearchResultsAggregate
  edges: Array<SearchResultsEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type SearchResultsCreateInput = {
  /** Appears because this input type would be empty otherwise because this type is composed of just generated and/or relationship properties. See https://neo4j.com/docs/graphql-manual/current/troubleshooting/faqs/ */
  _emptyInput?: InputMaybe<Scalars['Boolean']['input']>
}

export type SearchResultsEdge = {
  __typename?: 'SearchResultsEdge'
  cursor: Scalars['String']['output']
  node: SearchResults
}

export type SearchResultsUpdateInput = {
  /** Appears because this input type would be empty otherwise because this type is composed of just generated and/or relationship properties. See https://neo4j.com/docs/graphql-manual/current/troubleshooting/faqs/ */
  _emptyInput?: InputMaybe<Scalars['Boolean']['input']>
}

export type SearchResultsWhere = {
  AND?: InputMaybe<Array<SearchResultsWhere>>
  NOT?: InputMaybe<SearchResultsWhere>
  OR?: InputMaybe<Array<SearchResultsWhere>>
}

/** An enum for sorting in either ascending or descending order. */
export enum SortDirection {
  /** Sort by field values in ascending order. */
  Asc = 'ASC',
  /** Sort by field values in descending order. */
  Desc = 'DESC',
}

export type Space = {
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  visibility: SpaceVisibility
}

export type SpaceAggregate = {
  __typename?: 'SpaceAggregate'
  count: Count
  node: SpaceAggregateNode
}

export type SpaceAggregateNode = {
  __typename?: 'SpaceAggregateNode'
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type SpaceAggregateSelection = {
  __typename?: 'SpaceAggregateSelection'
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type SpaceConnectWhere = {
  node: SpaceWhere
}

export type SpaceCreateInput = {
  MeSpace?: InputMaybe<MeSpaceCreateInput>
  WeSpace?: InputMaybe<WeSpaceCreateInput>
}

export type SpaceEdge = {
  __typename?: 'SpaceEdge'
  cursor: Scalars['String']['output']
  node: Space
}

export enum SpaceImplementation {
  MeSpace = 'MeSpace',
  WeSpace = 'WeSpace',
}

/**
 * Represents a person or community as a member of a space with a specific role.
 * Label: ["SpaceMembership"]
 */
export type SpaceMembership = {
  __typename?: 'SpaceMembership'
  addedAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  member: Array<LifeSensor>
  memberConnection: SpaceMembershipMemberConnection
  role: SpaceRole
}

/**
 * Represents a person or community as a member of a space with a specific role.
 * Label: ["SpaceMembership"]
 */
export type SpaceMembershipMemberArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<LifeSensorWhere>
}

/**
 * Represents a person or community as a member of a space with a specific role.
 * Label: ["SpaceMembership"]
 */
export type SpaceMembershipMemberConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<SpaceMembershipMemberConnectionWhere>
}

export type SpaceMembershipAggregate = {
  __typename?: 'SpaceMembershipAggregate'
  count: Count
  node: SpaceMembershipAggregateNode
}

export type SpaceMembershipAggregateNode = {
  __typename?: 'SpaceMembershipAggregateNode'
  addedAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
}

export type SpaceMembershipAggregateSelection = {
  __typename?: 'SpaceMembershipAggregateSelection'
  addedAt: DateTimeAggregateSelection
  count: Scalars['Int']['output']
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
}

export type SpaceMembershipConnectInput = {
  member?: InputMaybe<SpaceMembershipMemberConnectInput>
}

export type SpaceMembershipConnectWhere = {
  node: SpaceMembershipWhere
}

export type SpaceMembershipCreateInput = {
  addedAt: Scalars['DateTime']['input']
  member?: InputMaybe<SpaceMembershipMemberCreateInput>
  role: SpaceRole
}

export type SpaceMembershipDeleteInput = {
  member?: InputMaybe<SpaceMembershipMemberDeleteInput>
}

export type SpaceMembershipDisconnectInput = {
  member?: InputMaybe<SpaceMembershipMemberDisconnectInput>
}

export type SpaceMembershipEdge = {
  __typename?: 'SpaceMembershipEdge'
  cursor: Scalars['String']['output']
  node: SpaceMembership
}

export type SpaceMembershipMemberCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type SpaceMembershipMemberCommunityConnectionWhere = {
  AND?: InputMaybe<Array<SpaceMembershipMemberCommunityConnectionWhere>>
  NOT?: InputMaybe<SpaceMembershipMemberCommunityConnectionWhere>
  OR?: InputMaybe<Array<SpaceMembershipMemberCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type SpaceMembershipMemberCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type SpaceMembershipMemberCommunityDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<SpaceMembershipMemberCommunityConnectionWhere>
}

export type SpaceMembershipMemberCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<SpaceMembershipMemberCommunityConnectionWhere>
}

export type SpaceMembershipMemberCommunityFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipMemberCommunityConnectFieldInput>>
  create?: InputMaybe<Array<SpaceMembershipMemberCommunityCreateFieldInput>>
}

export type SpaceMembershipMemberCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<SpaceMembershipMemberCommunityConnectionWhere>
}

export type SpaceMembershipMemberCommunityUpdateFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipMemberCommunityConnectFieldInput>>
  create?: InputMaybe<Array<SpaceMembershipMemberCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceMembershipMemberCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<SpaceMembershipMemberCommunityDisconnectFieldInput>
  >
  update?: InputMaybe<SpaceMembershipMemberCommunityUpdateConnectionInput>
}

export type SpaceMembershipMemberConnectInput = {
  Community?: InputMaybe<Array<SpaceMembershipMemberCommunityConnectFieldInput>>
  Person?: InputMaybe<Array<SpaceMembershipMemberPersonConnectFieldInput>>
}

export type SpaceMembershipMemberConnection = {
  __typename?: 'SpaceMembershipMemberConnection'
  edges: Array<SpaceMembershipMemberRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type SpaceMembershipMemberConnectionWhere = {
  Community?: InputMaybe<SpaceMembershipMemberCommunityConnectionWhere>
  Person?: InputMaybe<SpaceMembershipMemberPersonConnectionWhere>
}

export type SpaceMembershipMemberCreateInput = {
  Community?: InputMaybe<SpaceMembershipMemberCommunityFieldInput>
  Person?: InputMaybe<SpaceMembershipMemberPersonFieldInput>
}

export type SpaceMembershipMemberDeleteInput = {
  Community?: InputMaybe<Array<SpaceMembershipMemberCommunityDeleteFieldInput>>
  Person?: InputMaybe<Array<SpaceMembershipMemberPersonDeleteFieldInput>>
}

export type SpaceMembershipMemberDisconnectInput = {
  Community?: InputMaybe<
    Array<SpaceMembershipMemberCommunityDisconnectFieldInput>
  >
  Person?: InputMaybe<Array<SpaceMembershipMemberPersonDisconnectFieldInput>>
}

export type SpaceMembershipMemberPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type SpaceMembershipMemberPersonConnectionWhere = {
  AND?: InputMaybe<Array<SpaceMembershipMemberPersonConnectionWhere>>
  NOT?: InputMaybe<SpaceMembershipMemberPersonConnectionWhere>
  OR?: InputMaybe<Array<SpaceMembershipMemberPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type SpaceMembershipMemberPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type SpaceMembershipMemberPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<SpaceMembershipMemberPersonConnectionWhere>
}

export type SpaceMembershipMemberPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<SpaceMembershipMemberPersonConnectionWhere>
}

export type SpaceMembershipMemberPersonFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipMemberPersonConnectFieldInput>>
  create?: InputMaybe<Array<SpaceMembershipMemberPersonCreateFieldInput>>
}

export type SpaceMembershipMemberPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<SpaceMembershipMemberPersonConnectionWhere>
}

export type SpaceMembershipMemberPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipMemberPersonConnectFieldInput>>
  create?: InputMaybe<Array<SpaceMembershipMemberPersonCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceMembershipMemberPersonDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<SpaceMembershipMemberPersonDisconnectFieldInput>
  >
  update?: InputMaybe<SpaceMembershipMemberPersonUpdateConnectionInput>
}

export type SpaceMembershipMemberRelationship = {
  __typename?: 'SpaceMembershipMemberRelationship'
  cursor: Scalars['String']['output']
  node: LifeSensor
}

export type SpaceMembershipMemberUpdateInput = {
  Community?: InputMaybe<Array<SpaceMembershipMemberCommunityUpdateFieldInput>>
  Person?: InputMaybe<Array<SpaceMembershipMemberPersonUpdateFieldInput>>
}

/** Fields to sort SpaceMemberships by. The order in which sorts are applied is not guaranteed when specifying many fields in one SpaceMembershipSort object. */
export type SpaceMembershipSort = {
  addedAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  role?: InputMaybe<SortDirection>
}

export type SpaceMembershipUpdateInput = {
  addedAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  member?: InputMaybe<SpaceMembershipMemberUpdateInput>
  role_SET?: InputMaybe<SpaceRole>
}

export type SpaceMembershipWhere = {
  AND?: InputMaybe<Array<SpaceMembershipWhere>>
  NOT?: InputMaybe<SpaceMembershipWhere>
  OR?: InputMaybe<Array<SpaceMembershipWhere>>
  addedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  addedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  /** Return SpaceMemberships where all of the related SpaceMembershipMemberConnections match this filter */
  memberConnection_ALL?: InputMaybe<SpaceMembershipMemberConnectionWhere>
  /** Return SpaceMemberships where none of the related SpaceMembershipMemberConnections match this filter */
  memberConnection_NONE?: InputMaybe<SpaceMembershipMemberConnectionWhere>
  /** Return SpaceMemberships where one of the related SpaceMembershipMemberConnections match this filter */
  memberConnection_SINGLE?: InputMaybe<SpaceMembershipMemberConnectionWhere>
  /** Return SpaceMemberships where some of the related SpaceMembershipMemberConnections match this filter */
  memberConnection_SOME?: InputMaybe<SpaceMembershipMemberConnectionWhere>
  /** Return SpaceMemberships where all of the related LifeSensors match this filter */
  member_ALL?: InputMaybe<LifeSensorWhere>
  /** Return SpaceMemberships where none of the related LifeSensors match this filter */
  member_NONE?: InputMaybe<LifeSensorWhere>
  /** Return SpaceMemberships where one of the related LifeSensors match this filter */
  member_SINGLE?: InputMaybe<LifeSensorWhere>
  /** Return SpaceMemberships where some of the related LifeSensors match this filter */
  member_SOME?: InputMaybe<LifeSensorWhere>
  role_EQ?: InputMaybe<SpaceRole>
  role_IN?: InputMaybe<Array<SpaceRole>>
}

export type SpaceMembershipsConnection = {
  __typename?: 'SpaceMembershipsConnection'
  aggregate: SpaceMembershipAggregate
  edges: Array<SpaceMembershipEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/**
 * Role-based permission for space membership.
 * ADMIN: Can manage members and modify pulses/contexts
 * MEMBER: Can create and modify pulses/contexts
 * GUEST: Can view pulses and contexts (read-only)
 */
export enum SpaceRole {
  Admin = 'ADMIN',
  Guest = 'GUEST',
  Member = 'MEMBER',
}

/** Fields to sort Spaces by. The order in which sorts are applied is not guaranteed when specifying many fields in one SpaceSort object. */
export type SpaceSort = {
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  visibility?: InputMaybe<SortDirection>
}

export type SpaceUpdateInput = {
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  id_SET?: InputMaybe<Scalars['ID']['input']>
  name_SET?: InputMaybe<Scalars['String']['input']>
  visibility_SET?: InputMaybe<SpaceVisibility>
}

export enum SpaceVisibility {
  Private = 'PRIVATE',
  Shared = 'SHARED',
}

export type SpaceWhere = {
  AND?: InputMaybe<Array<SpaceWhere>>
  NOT?: InputMaybe<SpaceWhere>
  OR?: InputMaybe<Array<SpaceWhere>>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  typename?: InputMaybe<Array<SpaceImplementation>>
  visibility_EQ?: InputMaybe<SpaceVisibility>
  visibility_IN?: InputMaybe<Array<SpaceVisibility>>
}

export type SpacesConnection = {
  __typename?: 'SpacesConnection'
  aggregate: SpaceAggregate
  edges: Array<SpaceEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/**
 * Narrative or reflective pulse.
 * Multi-label: ["FieldPulse", "StoryPulse"]
 */
export type StoryPulse = FieldPulse & {
  __typename?: 'StoryPulse'
  content: Scalars['String']['output']
  context: Array<FieldContext>
  /** @deprecated Please use field "aggregate" inside "contextConnection" instead */
  contextAggregate?: Maybe<StoryPulseFieldContextContextAggregationSelection>
  contextConnection: FieldPulseContextConnection
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  initiatedBy: Array<LifeSensor>
  initiatedByConnection: StoryPulseInitiatedByConnection
  intensity?: Maybe<Scalars['Float']['output']>
  title: Scalars['String']['output']
}

/**
 * Narrative or reflective pulse.
 * Multi-label: ["FieldPulse", "StoryPulse"]
 */
export type StoryPulseContextArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

/**
 * Narrative or reflective pulse.
 * Multi-label: ["FieldPulse", "StoryPulse"]
 */
export type StoryPulseContextAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

/**
 * Narrative or reflective pulse.
 * Multi-label: ["FieldPulse", "StoryPulse"]
 */
export type StoryPulseContextConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseContextConnectionSort>>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

/**
 * Narrative or reflective pulse.
 * Multi-label: ["FieldPulse", "StoryPulse"]
 */
export type StoryPulseInitiatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<LifeSensorWhere>
}

/**
 * Narrative or reflective pulse.
 * Multi-label: ["FieldPulse", "StoryPulse"]
 */
export type StoryPulseInitiatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<StoryPulseInitiatedByConnectionWhere>
}

export type StoryPulseAggregate = {
  __typename?: 'StoryPulseAggregate'
  count: Count
  node: StoryPulseAggregateNode
}

export type StoryPulseAggregateNode = {
  __typename?: 'StoryPulseAggregateNode'
  content: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type StoryPulseAggregateSelection = {
  __typename?: 'StoryPulseAggregateSelection'
  content: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type StoryPulseContextAggregateInput = {
  AND?: InputMaybe<Array<StoryPulseContextAggregateInput>>
  NOT?: InputMaybe<StoryPulseContextAggregateInput>
  OR?: InputMaybe<Array<StoryPulseContextAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<StoryPulseContextNodeAggregationWhereInput>
}

export type StoryPulseContextConnectFieldInput = {
  connect?: InputMaybe<Array<FieldContextConnectInput>>
  where?: InputMaybe<FieldContextConnectWhere>
}

export type StoryPulseContextCreateFieldInput = {
  node: FieldContextCreateInput
}

export type StoryPulseContextFieldInput = {
  connect?: InputMaybe<Array<StoryPulseContextConnectFieldInput>>
  create?: InputMaybe<Array<StoryPulseContextCreateFieldInput>>
}

export type StoryPulseContextNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<StoryPulseContextNodeAggregationWhereInput>>
  NOT?: InputMaybe<StoryPulseContextNodeAggregationWhereInput>
  OR?: InputMaybe<Array<StoryPulseContextNodeAggregationWhereInput>>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  emergentName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  title_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type StoryPulseContextUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

export type StoryPulseContextUpdateFieldInput = {
  connect?: InputMaybe<Array<StoryPulseContextConnectFieldInput>>
  create?: InputMaybe<Array<StoryPulseContextCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseContextDisconnectFieldInput>>
  update?: InputMaybe<StoryPulseContextUpdateConnectionInput>
}

export type StoryPulseCreateInput = {
  content: Scalars['String']['input']
  context?: InputMaybe<StoryPulseContextFieldInput>
  createdAt: Scalars['DateTime']['input']
  initiatedBy?: InputMaybe<StoryPulseInitiatedByCreateInput>
  intensity?: InputMaybe<Scalars['Float']['input']>
  title: Scalars['String']['input']
}

export type StoryPulseDeleteInput = {
  context?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  initiatedBy?: InputMaybe<StoryPulseInitiatedByDeleteInput>
}

export type StoryPulseEdge = {
  __typename?: 'StoryPulseEdge'
  cursor: Scalars['String']['output']
  node: StoryPulse
}

export type StoryPulseFieldContextContextAggregationSelection = {
  __typename?: 'StoryPulseFieldContextContextAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<StoryPulseFieldContextContextNodeAggregateSelection>
}

export type StoryPulseFieldContextContextNodeAggregateSelection = {
  __typename?: 'StoryPulseFieldContextContextNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  emergentName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  title: StringAggregateSelection
}

export type StoryPulseInitiatedByCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type StoryPulseInitiatedByCommunityConnectionWhere = {
  AND?: InputMaybe<Array<StoryPulseInitiatedByCommunityConnectionWhere>>
  NOT?: InputMaybe<StoryPulseInitiatedByCommunityConnectionWhere>
  OR?: InputMaybe<Array<StoryPulseInitiatedByCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type StoryPulseInitiatedByCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type StoryPulseInitiatedByCommunityDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<StoryPulseInitiatedByCommunityConnectionWhere>
}

export type StoryPulseInitiatedByCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<StoryPulseInitiatedByCommunityConnectionWhere>
}

export type StoryPulseInitiatedByCommunityFieldInput = {
  connect?: InputMaybe<Array<StoryPulseInitiatedByCommunityConnectFieldInput>>
  create?: InputMaybe<Array<StoryPulseInitiatedByCommunityCreateFieldInput>>
}

export type StoryPulseInitiatedByCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<StoryPulseInitiatedByCommunityConnectionWhere>
}

export type StoryPulseInitiatedByCommunityUpdateFieldInput = {
  connect?: InputMaybe<Array<StoryPulseInitiatedByCommunityConnectFieldInput>>
  create?: InputMaybe<Array<StoryPulseInitiatedByCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<StoryPulseInitiatedByCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<StoryPulseInitiatedByCommunityDisconnectFieldInput>
  >
  update?: InputMaybe<StoryPulseInitiatedByCommunityUpdateConnectionInput>
}

export type StoryPulseInitiatedByConnection = {
  __typename?: 'StoryPulseInitiatedByConnection'
  edges: Array<StoryPulseInitiatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type StoryPulseInitiatedByConnectionWhere = {
  Community?: InputMaybe<StoryPulseInitiatedByCommunityConnectionWhere>
  Person?: InputMaybe<StoryPulseInitiatedByPersonConnectionWhere>
}

export type StoryPulseInitiatedByCreateInput = {
  Community?: InputMaybe<StoryPulseInitiatedByCommunityFieldInput>
  Person?: InputMaybe<StoryPulseInitiatedByPersonFieldInput>
}

export type StoryPulseInitiatedByDeleteInput = {
  Community?: InputMaybe<Array<StoryPulseInitiatedByCommunityDeleteFieldInput>>
  Person?: InputMaybe<Array<StoryPulseInitiatedByPersonDeleteFieldInput>>
}

export type StoryPulseInitiatedByPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type StoryPulseInitiatedByPersonConnectionWhere = {
  AND?: InputMaybe<Array<StoryPulseInitiatedByPersonConnectionWhere>>
  NOT?: InputMaybe<StoryPulseInitiatedByPersonConnectionWhere>
  OR?: InputMaybe<Array<StoryPulseInitiatedByPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type StoryPulseInitiatedByPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type StoryPulseInitiatedByPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<StoryPulseInitiatedByPersonConnectionWhere>
}

export type StoryPulseInitiatedByPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<StoryPulseInitiatedByPersonConnectionWhere>
}

export type StoryPulseInitiatedByPersonFieldInput = {
  connect?: InputMaybe<Array<StoryPulseInitiatedByPersonConnectFieldInput>>
  create?: InputMaybe<Array<StoryPulseInitiatedByPersonCreateFieldInput>>
}

export type StoryPulseInitiatedByPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<StoryPulseInitiatedByPersonConnectionWhere>
}

export type StoryPulseInitiatedByPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<StoryPulseInitiatedByPersonConnectFieldInput>>
  create?: InputMaybe<Array<StoryPulseInitiatedByPersonCreateFieldInput>>
  delete?: InputMaybe<Array<StoryPulseInitiatedByPersonDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<StoryPulseInitiatedByPersonDisconnectFieldInput>
  >
  update?: InputMaybe<StoryPulseInitiatedByPersonUpdateConnectionInput>
}

export type StoryPulseInitiatedByRelationship = {
  __typename?: 'StoryPulseInitiatedByRelationship'
  cursor: Scalars['String']['output']
  node: LifeSensor
}

export type StoryPulseInitiatedByUpdateInput = {
  Community?: InputMaybe<Array<StoryPulseInitiatedByCommunityUpdateFieldInput>>
  Person?: InputMaybe<Array<StoryPulseInitiatedByPersonUpdateFieldInput>>
}

/** Fields to sort StoryPulses by. The order in which sorts are applied is not guaranteed when specifying many fields in one StoryPulseSort object. */
export type StoryPulseSort = {
  content?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  intensity?: InputMaybe<SortDirection>
  title?: InputMaybe<SortDirection>
}

export type StoryPulseUpdateInput = {
  content_SET?: InputMaybe<Scalars['String']['input']>
  context?: InputMaybe<Array<StoryPulseContextUpdateFieldInput>>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  initiatedBy?: InputMaybe<StoryPulseInitiatedByUpdateInput>
  intensity_ADD?: InputMaybe<Scalars['Float']['input']>
  intensity_DIVIDE?: InputMaybe<Scalars['Float']['input']>
  intensity_MULTIPLY?: InputMaybe<Scalars['Float']['input']>
  intensity_SET?: InputMaybe<Scalars['Float']['input']>
  intensity_SUBTRACT?: InputMaybe<Scalars['Float']['input']>
  title_SET?: InputMaybe<Scalars['String']['input']>
}

export type StoryPulseWhere = {
  AND?: InputMaybe<Array<StoryPulseWhere>>
  NOT?: InputMaybe<StoryPulseWhere>
  OR?: InputMaybe<Array<StoryPulseWhere>>
  content_CONTAINS?: InputMaybe<Scalars['String']['input']>
  content_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  content_EQ?: InputMaybe<Scalars['String']['input']>
  content_IN?: InputMaybe<Array<Scalars['String']['input']>>
  content_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  contextAggregate?: InputMaybe<StoryPulseContextAggregateInput>
  /** Return StoryPulses where all of the related FieldPulseContextConnections match this filter */
  contextConnection_ALL?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return StoryPulses where none of the related FieldPulseContextConnections match this filter */
  contextConnection_NONE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return StoryPulses where one of the related FieldPulseContextConnections match this filter */
  contextConnection_SINGLE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return StoryPulses where some of the related FieldPulseContextConnections match this filter */
  contextConnection_SOME?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return StoryPulses where all of the related FieldContexts match this filter */
  context_ALL?: InputMaybe<FieldContextWhere>
  /** Return StoryPulses where none of the related FieldContexts match this filter */
  context_NONE?: InputMaybe<FieldContextWhere>
  /** Return StoryPulses where one of the related FieldContexts match this filter */
  context_SINGLE?: InputMaybe<FieldContextWhere>
  /** Return StoryPulses where some of the related FieldContexts match this filter */
  context_SOME?: InputMaybe<FieldContextWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  /** Return StoryPulses where all of the related StoryPulseInitiatedByConnections match this filter */
  initiatedByConnection_ALL?: InputMaybe<StoryPulseInitiatedByConnectionWhere>
  /** Return StoryPulses where none of the related StoryPulseInitiatedByConnections match this filter */
  initiatedByConnection_NONE?: InputMaybe<StoryPulseInitiatedByConnectionWhere>
  /** Return StoryPulses where one of the related StoryPulseInitiatedByConnections match this filter */
  initiatedByConnection_SINGLE?: InputMaybe<StoryPulseInitiatedByConnectionWhere>
  /** Return StoryPulses where some of the related StoryPulseInitiatedByConnections match this filter */
  initiatedByConnection_SOME?: InputMaybe<StoryPulseInitiatedByConnectionWhere>
  /** Return StoryPulses where all of the related LifeSensors match this filter */
  initiatedBy_ALL?: InputMaybe<LifeSensorWhere>
  /** Return StoryPulses where none of the related LifeSensors match this filter */
  initiatedBy_NONE?: InputMaybe<LifeSensorWhere>
  /** Return StoryPulses where one of the related LifeSensors match this filter */
  initiatedBy_SINGLE?: InputMaybe<LifeSensorWhere>
  /** Return StoryPulses where some of the related LifeSensors match this filter */
  initiatedBy_SOME?: InputMaybe<LifeSensorWhere>
  intensity_EQ?: InputMaybe<Scalars['Float']['input']>
  intensity_GT?: InputMaybe<Scalars['Float']['input']>
  intensity_GTE?: InputMaybe<Scalars['Float']['input']>
  intensity_IN?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>
  intensity_LT?: InputMaybe<Scalars['Float']['input']>
  intensity_LTE?: InputMaybe<Scalars['Float']['input']>
  title_CONTAINS?: InputMaybe<Scalars['String']['input']>
  title_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  title_EQ?: InputMaybe<Scalars['String']['input']>
  title_IN?: InputMaybe<Array<Scalars['String']['input']>>
  title_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type StoryPulsesConnection = {
  __typename?: 'StoryPulsesConnection'
  aggregate: StoryPulseAggregate
  edges: Array<StoryPulseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type StringAggregateSelection = {
  __typename?: 'StringAggregateSelection'
  longest?: Maybe<Scalars['String']['output']>
  shortest?: Maybe<Scalars['String']['output']>
}

export type UpdateAddSpaceMemberResponsesMutationResponse = {
  __typename?: 'UpdateAddSpaceMemberResponsesMutationResponse'
  addSpaceMemberResponses: Array<AddSpaceMemberResponse>
  info: UpdateInfo
}

export type UpdateChatbotResponsesMutationResponse = {
  __typename?: 'UpdateChatbotResponsesMutationResponse'
  chatbotResponses: Array<ChatbotResponse>
  info: UpdateInfo
}

export type UpdateCommunitiesMutationResponse = {
  __typename?: 'UpdateCommunitiesMutationResponse'
  communities: Array<Community>
  info: UpdateInfo
}

export type UpdateFieldContextsMutationResponse = {
  __typename?: 'UpdateFieldContextsMutationResponse'
  fieldContexts: Array<FieldContext>
  info: UpdateInfo
}

export type UpdateFieldResonancesMutationResponse = {
  __typename?: 'UpdateFieldResonancesMutationResponse'
  fieldResonances: Array<FieldResonance>
  info: UpdateInfo
}

export type UpdateGoalPulsesMutationResponse = {
  __typename?: 'UpdateGoalPulsesMutationResponse'
  goalPulses: Array<GoalPulse>
  info: UpdateInfo
}

/** Information about the number of nodes and relationships created and deleted during an update mutation */
export type UpdateInfo = {
  __typename?: 'UpdateInfo'
  nodesCreated: Scalars['Int']['output']
  nodesDeleted: Scalars['Int']['output']
  relationshipsCreated: Scalars['Int']['output']
  relationshipsDeleted: Scalars['Int']['output']
}

export type UpdateMeSpacesMutationResponse = {
  __typename?: 'UpdateMeSpacesMutationResponse'
  info: UpdateInfo
  meSpaces: Array<MeSpace>
}

export type UpdatePeopleMutationResponse = {
  __typename?: 'UpdatePeopleMutationResponse'
  info: UpdateInfo
  people: Array<Person>
}

export type UpdateRemoveSpaceMemberResponsesMutationResponse = {
  __typename?: 'UpdateRemoveSpaceMemberResponsesMutationResponse'
  info: UpdateInfo
  removeSpaceMemberResponses: Array<RemoveSpaceMemberResponse>
}

export type UpdateResonanceLinksMutationResponse = {
  __typename?: 'UpdateResonanceLinksMutationResponse'
  info: UpdateInfo
  resonanceLinks: Array<ResonanceLink>
}

export type UpdateResourcePulsesMutationResponse = {
  __typename?: 'UpdateResourcePulsesMutationResponse'
  info: UpdateInfo
  resourcePulses: Array<ResourcePulse>
}

export type UpdateSearchResultsMutationResponse = {
  __typename?: 'UpdateSearchResultsMutationResponse'
  info: UpdateInfo
  searchResults: Array<SearchResults>
}

/** Response when updating a space member's role. */
export type UpdateSpaceMemberRoleResponse = {
  __typename?: 'UpdateSpaceMemberRoleResponse'
  membership?: Maybe<SpaceMembership>
  message: Scalars['String']['output']
  success: Scalars['Boolean']['output']
}

export type UpdateSpaceMemberRoleResponseAggregate = {
  __typename?: 'UpdateSpaceMemberRoleResponseAggregate'
  count: Count
  node: UpdateSpaceMemberRoleResponseAggregateNode
}

export type UpdateSpaceMemberRoleResponseAggregateNode = {
  __typename?: 'UpdateSpaceMemberRoleResponseAggregateNode'
  message: StringAggregateSelection
}

export type UpdateSpaceMemberRoleResponseAggregateSelection = {
  __typename?: 'UpdateSpaceMemberRoleResponseAggregateSelection'
  count: Scalars['Int']['output']
  message: StringAggregateSelection
}

export type UpdateSpaceMemberRoleResponseCreateInput = {
  message: Scalars['String']['input']
  success: Scalars['Boolean']['input']
}

export type UpdateSpaceMemberRoleResponseEdge = {
  __typename?: 'UpdateSpaceMemberRoleResponseEdge'
  cursor: Scalars['String']['output']
  node: UpdateSpaceMemberRoleResponse
}

/** Fields to sort UpdateSpaceMemberRoleResponses by. The order in which sorts are applied is not guaranteed when specifying many fields in one UpdateSpaceMemberRoleResponseSort object. */
export type UpdateSpaceMemberRoleResponseSort = {
  message?: InputMaybe<SortDirection>
  success?: InputMaybe<SortDirection>
}

export type UpdateSpaceMemberRoleResponseUpdateInput = {
  message_SET?: InputMaybe<Scalars['String']['input']>
  success_SET?: InputMaybe<Scalars['Boolean']['input']>
}

export type UpdateSpaceMemberRoleResponseWhere = {
  AND?: InputMaybe<Array<UpdateSpaceMemberRoleResponseWhere>>
  NOT?: InputMaybe<UpdateSpaceMemberRoleResponseWhere>
  OR?: InputMaybe<Array<UpdateSpaceMemberRoleResponseWhere>>
  message_CONTAINS?: InputMaybe<Scalars['String']['input']>
  message_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  message_EQ?: InputMaybe<Scalars['String']['input']>
  message_IN?: InputMaybe<Array<Scalars['String']['input']>>
  message_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  success_EQ?: InputMaybe<Scalars['Boolean']['input']>
}

export type UpdateSpaceMemberRoleResponsesConnection = {
  __typename?: 'UpdateSpaceMemberRoleResponsesConnection'
  aggregate: UpdateSpaceMemberRoleResponseAggregate
  edges: Array<UpdateSpaceMemberRoleResponseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type UpdateSpaceMembershipsMutationResponse = {
  __typename?: 'UpdateSpaceMembershipsMutationResponse'
  info: UpdateInfo
  spaceMemberships: Array<SpaceMembership>
}

export type UpdateStoryPulsesMutationResponse = {
  __typename?: 'UpdateStoryPulsesMutationResponse'
  info: UpdateInfo
  storyPulses: Array<StoryPulse>
}

export type UpdateUpdateSpaceMemberRoleResponsesMutationResponse = {
  __typename?: 'UpdateUpdateSpaceMemberRoleResponsesMutationResponse'
  info: UpdateInfo
  updateSpaceMemberRoleResponses: Array<UpdateSpaceMemberRoleResponse>
}

export type UpdateWeSpacesMutationResponse = {
  __typename?: 'UpdateWeSpacesMutationResponse'
  info: UpdateInfo
  weSpaces: Array<WeSpace>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 */
export type WeSpace = Space & {
  __typename?: 'WeSpace'
  contexts: Array<FieldContext>
  /** @deprecated Please use field "aggregate" inside "contextsConnection" instead */
  contextsAggregate?: Maybe<WeSpaceFieldContextContextsAggregationSelection>
  contextsConnection: WeSpaceContextsConnection
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  members: Array<SpaceMembership>
  /** @deprecated Please use field "aggregate" inside "membersConnection" instead */
  membersAggregate?: Maybe<WeSpaceSpaceMembershipMembersAggregationSelection>
  membersConnection: WeSpaceMembersConnection
  name: Scalars['String']['output']
  owner: Array<LifeSensor>
  ownerConnection: WeSpaceOwnerConnection
  visibility: SpaceVisibility
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 */
export type WeSpaceContextsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 */
export type WeSpaceContextsAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 */
export type WeSpaceContextsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<WeSpaceContextsConnectionSort>>
  where?: InputMaybe<WeSpaceContextsConnectionWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 */
export type WeSpaceMembersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembershipSort>>
  where?: InputMaybe<SpaceMembershipWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 */
export type WeSpaceMembersAggregateArgs = {
  where?: InputMaybe<SpaceMembershipWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 */
export type WeSpaceMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<WeSpaceMembersConnectionSort>>
  where?: InputMaybe<WeSpaceMembersConnectionWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 */
export type WeSpaceOwnerArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<LifeSensorWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 */
export type WeSpaceOwnerConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  where?: InputMaybe<WeSpaceOwnerConnectionWhere>
}

export type WeSpaceAggregate = {
  __typename?: 'WeSpaceAggregate'
  count: Count
  node: WeSpaceAggregateNode
}

export type WeSpaceAggregateNode = {
  __typename?: 'WeSpaceAggregateNode'
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type WeSpaceAggregateSelection = {
  __typename?: 'WeSpaceAggregateSelection'
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type WeSpaceContextsAggregateInput = {
  AND?: InputMaybe<Array<WeSpaceContextsAggregateInput>>
  NOT?: InputMaybe<WeSpaceContextsAggregateInput>
  OR?: InputMaybe<Array<WeSpaceContextsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<WeSpaceContextsNodeAggregationWhereInput>
}

export type WeSpaceContextsConnectFieldInput = {
  connect?: InputMaybe<Array<FieldContextConnectInput>>
  where?: InputMaybe<FieldContextConnectWhere>
}

export type WeSpaceContextsConnection = {
  __typename?: 'WeSpaceContextsConnection'
  aggregate: WeSpaceFieldContextContextsAggregateSelection
  edges: Array<WeSpaceContextsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type WeSpaceContextsConnectionSort = {
  node?: InputMaybe<FieldContextSort>
}

export type WeSpaceContextsConnectionWhere = {
  AND?: InputMaybe<Array<WeSpaceContextsConnectionWhere>>
  NOT?: InputMaybe<WeSpaceContextsConnectionWhere>
  OR?: InputMaybe<Array<WeSpaceContextsConnectionWhere>>
  node?: InputMaybe<FieldContextWhere>
}

export type WeSpaceContextsCreateFieldInput = {
  node: FieldContextCreateInput
}

export type WeSpaceContextsDeleteFieldInput = {
  delete?: InputMaybe<FieldContextDeleteInput>
  where?: InputMaybe<WeSpaceContextsConnectionWhere>
}

export type WeSpaceContextsDisconnectFieldInput = {
  disconnect?: InputMaybe<FieldContextDisconnectInput>
  where?: InputMaybe<WeSpaceContextsConnectionWhere>
}

export type WeSpaceContextsFieldInput = {
  connect?: InputMaybe<Array<WeSpaceContextsConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceContextsCreateFieldInput>>
}

export type WeSpaceContextsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<WeSpaceContextsNodeAggregationWhereInput>>
  NOT?: InputMaybe<WeSpaceContextsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<WeSpaceContextsNodeAggregationWhereInput>>
  createdAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  emergentName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  emergentName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  emergentName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  emergentName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  title_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  title_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  title_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type WeSpaceContextsRelationship = {
  __typename?: 'WeSpaceContextsRelationship'
  cursor: Scalars['String']['output']
  node: FieldContext
}

export type WeSpaceContextsUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<WeSpaceContextsConnectionWhere>
}

export type WeSpaceContextsUpdateFieldInput = {
  connect?: InputMaybe<Array<WeSpaceContextsConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceContextsCreateFieldInput>>
  delete?: InputMaybe<Array<WeSpaceContextsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<WeSpaceContextsDisconnectFieldInput>>
  update?: InputMaybe<WeSpaceContextsUpdateConnectionInput>
}

export type WeSpaceCreateInput = {
  contexts?: InputMaybe<WeSpaceContextsFieldInput>
  createdAt: Scalars['DateTime']['input']
  members?: InputMaybe<WeSpaceMembersFieldInput>
  name: Scalars['String']['input']
  owner?: InputMaybe<WeSpaceOwnerCreateInput>
  visibility: SpaceVisibility
}

export type WeSpaceDeleteInput = {
  contexts?: InputMaybe<Array<WeSpaceContextsDeleteFieldInput>>
  members?: InputMaybe<Array<WeSpaceMembersDeleteFieldInput>>
  owner?: InputMaybe<WeSpaceOwnerDeleteInput>
}

export type WeSpaceEdge = {
  __typename?: 'WeSpaceEdge'
  cursor: Scalars['String']['output']
  node: WeSpace
}

export type WeSpaceFieldContextContextsAggregateSelection = {
  __typename?: 'WeSpaceFieldContextContextsAggregateSelection'
  count: CountConnection
  node?: Maybe<WeSpaceFieldContextContextsNodeAggregateSelection>
}

export type WeSpaceFieldContextContextsAggregationSelection = {
  __typename?: 'WeSpaceFieldContextContextsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<WeSpaceFieldContextContextsNodeAggregateSelection>
}

export type WeSpaceFieldContextContextsNodeAggregateSelection = {
  __typename?: 'WeSpaceFieldContextContextsNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  emergentName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  title: StringAggregateSelection
}

export type WeSpaceMembersAggregateInput = {
  AND?: InputMaybe<Array<WeSpaceMembersAggregateInput>>
  NOT?: InputMaybe<WeSpaceMembersAggregateInput>
  OR?: InputMaybe<Array<WeSpaceMembersAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<WeSpaceMembersNodeAggregationWhereInput>
}

export type WeSpaceMembersConnectFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipConnectInput>>
  where?: InputMaybe<SpaceMembershipConnectWhere>
}

export type WeSpaceMembersConnection = {
  __typename?: 'WeSpaceMembersConnection'
  aggregate: WeSpaceSpaceMembershipMembersAggregateSelection
  edges: Array<WeSpaceMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type WeSpaceMembersConnectionSort = {
  node?: InputMaybe<SpaceMembershipSort>
}

export type WeSpaceMembersConnectionWhere = {
  AND?: InputMaybe<Array<WeSpaceMembersConnectionWhere>>
  NOT?: InputMaybe<WeSpaceMembersConnectionWhere>
  OR?: InputMaybe<Array<WeSpaceMembersConnectionWhere>>
  node?: InputMaybe<SpaceMembershipWhere>
}

export type WeSpaceMembersCreateFieldInput = {
  node: SpaceMembershipCreateInput
}

export type WeSpaceMembersDeleteFieldInput = {
  delete?: InputMaybe<SpaceMembershipDeleteInput>
  where?: InputMaybe<WeSpaceMembersConnectionWhere>
}

export type WeSpaceMembersDisconnectFieldInput = {
  disconnect?: InputMaybe<SpaceMembershipDisconnectInput>
  where?: InputMaybe<WeSpaceMembersConnectionWhere>
}

export type WeSpaceMembersFieldInput = {
  connect?: InputMaybe<Array<WeSpaceMembersConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceMembersCreateFieldInput>>
}

export type WeSpaceMembersNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<WeSpaceMembersNodeAggregationWhereInput>>
  NOT?: InputMaybe<WeSpaceMembersNodeAggregationWhereInput>
  OR?: InputMaybe<Array<WeSpaceMembersNodeAggregationWhereInput>>
  addedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  addedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type WeSpaceMembersRelationship = {
  __typename?: 'WeSpaceMembersRelationship'
  cursor: Scalars['String']['output']
  node: SpaceMembership
}

export type WeSpaceMembersUpdateConnectionInput = {
  node?: InputMaybe<SpaceMembershipUpdateInput>
  where?: InputMaybe<WeSpaceMembersConnectionWhere>
}

export type WeSpaceMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<WeSpaceMembersConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceMembersCreateFieldInput>>
  delete?: InputMaybe<Array<WeSpaceMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<WeSpaceMembersDisconnectFieldInput>>
  update?: InputMaybe<WeSpaceMembersUpdateConnectionInput>
}

export type WeSpaceOwnerCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type WeSpaceOwnerCommunityConnectionWhere = {
  AND?: InputMaybe<Array<WeSpaceOwnerCommunityConnectionWhere>>
  NOT?: InputMaybe<WeSpaceOwnerCommunityConnectionWhere>
  OR?: InputMaybe<Array<WeSpaceOwnerCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type WeSpaceOwnerCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type WeSpaceOwnerCommunityDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<WeSpaceOwnerCommunityConnectionWhere>
}

export type WeSpaceOwnerCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<WeSpaceOwnerCommunityConnectionWhere>
}

export type WeSpaceOwnerCommunityFieldInput = {
  connect?: InputMaybe<Array<WeSpaceOwnerCommunityConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceOwnerCommunityCreateFieldInput>>
}

export type WeSpaceOwnerCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<WeSpaceOwnerCommunityConnectionWhere>
}

export type WeSpaceOwnerCommunityUpdateFieldInput = {
  connect?: InputMaybe<Array<WeSpaceOwnerCommunityConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceOwnerCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<WeSpaceOwnerCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<Array<WeSpaceOwnerCommunityDisconnectFieldInput>>
  update?: InputMaybe<WeSpaceOwnerCommunityUpdateConnectionInput>
}

export type WeSpaceOwnerConnection = {
  __typename?: 'WeSpaceOwnerConnection'
  edges: Array<WeSpaceOwnerRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type WeSpaceOwnerConnectionWhere = {
  Community?: InputMaybe<WeSpaceOwnerCommunityConnectionWhere>
  Person?: InputMaybe<WeSpaceOwnerPersonConnectionWhere>
}

export type WeSpaceOwnerCreateInput = {
  Community?: InputMaybe<WeSpaceOwnerCommunityFieldInput>
  Person?: InputMaybe<WeSpaceOwnerPersonFieldInput>
}

export type WeSpaceOwnerDeleteInput = {
  Community?: InputMaybe<Array<WeSpaceOwnerCommunityDeleteFieldInput>>
  Person?: InputMaybe<Array<WeSpaceOwnerPersonDeleteFieldInput>>
}

export type WeSpaceOwnerPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type WeSpaceOwnerPersonConnectionWhere = {
  AND?: InputMaybe<Array<WeSpaceOwnerPersonConnectionWhere>>
  NOT?: InputMaybe<WeSpaceOwnerPersonConnectionWhere>
  OR?: InputMaybe<Array<WeSpaceOwnerPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type WeSpaceOwnerPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type WeSpaceOwnerPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<WeSpaceOwnerPersonConnectionWhere>
}

export type WeSpaceOwnerPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<WeSpaceOwnerPersonConnectionWhere>
}

export type WeSpaceOwnerPersonFieldInput = {
  connect?: InputMaybe<Array<WeSpaceOwnerPersonConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceOwnerPersonCreateFieldInput>>
}

export type WeSpaceOwnerPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<WeSpaceOwnerPersonConnectionWhere>
}

export type WeSpaceOwnerPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<WeSpaceOwnerPersonConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceOwnerPersonCreateFieldInput>>
  delete?: InputMaybe<Array<WeSpaceOwnerPersonDeleteFieldInput>>
  disconnect?: InputMaybe<Array<WeSpaceOwnerPersonDisconnectFieldInput>>
  update?: InputMaybe<WeSpaceOwnerPersonUpdateConnectionInput>
}

export type WeSpaceOwnerRelationship = {
  __typename?: 'WeSpaceOwnerRelationship'
  cursor: Scalars['String']['output']
  node: LifeSensor
}

export type WeSpaceOwnerUpdateInput = {
  Community?: InputMaybe<Array<WeSpaceOwnerCommunityUpdateFieldInput>>
  Person?: InputMaybe<Array<WeSpaceOwnerPersonUpdateFieldInput>>
}

/** Fields to sort WeSpaces by. The order in which sorts are applied is not guaranteed when specifying many fields in one WeSpaceSort object. */
export type WeSpaceSort = {
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  visibility?: InputMaybe<SortDirection>
}

export type WeSpaceSpaceMembershipMembersAggregateSelection = {
  __typename?: 'WeSpaceSpaceMembershipMembersAggregateSelection'
  count: CountConnection
  node?: Maybe<WeSpaceSpaceMembershipMembersNodeAggregateSelection>
}

export type WeSpaceSpaceMembershipMembersAggregationSelection = {
  __typename?: 'WeSpaceSpaceMembershipMembersAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<WeSpaceSpaceMembershipMembersNodeAggregateSelection>
}

export type WeSpaceSpaceMembershipMembersNodeAggregateSelection = {
  __typename?: 'WeSpaceSpaceMembershipMembersNodeAggregateSelection'
  addedAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
}

export type WeSpaceUpdateInput = {
  contexts?: InputMaybe<Array<WeSpaceContextsUpdateFieldInput>>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  members?: InputMaybe<Array<WeSpaceMembersUpdateFieldInput>>
  name_SET?: InputMaybe<Scalars['String']['input']>
  owner?: InputMaybe<WeSpaceOwnerUpdateInput>
  visibility_SET?: InputMaybe<SpaceVisibility>
}

export type WeSpaceWhere = {
  AND?: InputMaybe<Array<WeSpaceWhere>>
  NOT?: InputMaybe<WeSpaceWhere>
  OR?: InputMaybe<Array<WeSpaceWhere>>
  contextsAggregate?: InputMaybe<WeSpaceContextsAggregateInput>
  /** Return WeSpaces where all of the related WeSpaceContextsConnections match this filter */
  contextsConnection_ALL?: InputMaybe<WeSpaceContextsConnectionWhere>
  /** Return WeSpaces where none of the related WeSpaceContextsConnections match this filter */
  contextsConnection_NONE?: InputMaybe<WeSpaceContextsConnectionWhere>
  /** Return WeSpaces where one of the related WeSpaceContextsConnections match this filter */
  contextsConnection_SINGLE?: InputMaybe<WeSpaceContextsConnectionWhere>
  /** Return WeSpaces where some of the related WeSpaceContextsConnections match this filter */
  contextsConnection_SOME?: InputMaybe<WeSpaceContextsConnectionWhere>
  /** Return WeSpaces where all of the related FieldContexts match this filter */
  contexts_ALL?: InputMaybe<FieldContextWhere>
  /** Return WeSpaces where none of the related FieldContexts match this filter */
  contexts_NONE?: InputMaybe<FieldContextWhere>
  /** Return WeSpaces where one of the related FieldContexts match this filter */
  contexts_SINGLE?: InputMaybe<FieldContextWhere>
  /** Return WeSpaces where some of the related FieldContexts match this filter */
  contexts_SOME?: InputMaybe<FieldContextWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  membersAggregate?: InputMaybe<WeSpaceMembersAggregateInput>
  /** Return WeSpaces where all of the related WeSpaceMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<WeSpaceMembersConnectionWhere>
  /** Return WeSpaces where none of the related WeSpaceMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<WeSpaceMembersConnectionWhere>
  /** Return WeSpaces where one of the related WeSpaceMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<WeSpaceMembersConnectionWhere>
  /** Return WeSpaces where some of the related WeSpaceMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<WeSpaceMembersConnectionWhere>
  /** Return WeSpaces where all of the related SpaceMemberships match this filter */
  members_ALL?: InputMaybe<SpaceMembershipWhere>
  /** Return WeSpaces where none of the related SpaceMemberships match this filter */
  members_NONE?: InputMaybe<SpaceMembershipWhere>
  /** Return WeSpaces where one of the related SpaceMemberships match this filter */
  members_SINGLE?: InputMaybe<SpaceMembershipWhere>
  /** Return WeSpaces where some of the related SpaceMemberships match this filter */
  members_SOME?: InputMaybe<SpaceMembershipWhere>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  /** Return WeSpaces where all of the related WeSpaceOwnerConnections match this filter */
  ownerConnection_ALL?: InputMaybe<WeSpaceOwnerConnectionWhere>
  /** Return WeSpaces where none of the related WeSpaceOwnerConnections match this filter */
  ownerConnection_NONE?: InputMaybe<WeSpaceOwnerConnectionWhere>
  /** Return WeSpaces where one of the related WeSpaceOwnerConnections match this filter */
  ownerConnection_SINGLE?: InputMaybe<WeSpaceOwnerConnectionWhere>
  /** Return WeSpaces where some of the related WeSpaceOwnerConnections match this filter */
  ownerConnection_SOME?: InputMaybe<WeSpaceOwnerConnectionWhere>
  /** Return WeSpaces where all of the related LifeSensors match this filter */
  owner_ALL?: InputMaybe<LifeSensorWhere>
  /** Return WeSpaces where none of the related LifeSensors match this filter */
  owner_NONE?: InputMaybe<LifeSensorWhere>
  /** Return WeSpaces where one of the related LifeSensors match this filter */
  owner_SINGLE?: InputMaybe<LifeSensorWhere>
  /** Return WeSpaces where some of the related LifeSensors match this filter */
  owner_SOME?: InputMaybe<LifeSensorWhere>
  visibility_EQ?: InputMaybe<SpaceVisibility>
  visibility_IN?: InputMaybe<Array<SpaceVisibility>>
}

export type WeSpacesConnection = {
  __typename?: 'WeSpacesConnection'
  aggregate: WeSpaceAggregate
  edges: Array<WeSpaceEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CreateFieldContextMutationVariables = Exact<{
  input: Array<FieldContextCreateInput> | FieldContextCreateInput
}>

export type CreateFieldContextMutation = {
  __typename?: 'Mutation'
  createFieldContexts: {
    __typename?: 'CreateFieldContextsMutationResponse'
    fieldContexts: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      emergentName?: string | null
      createdAt: any
      space: Array<
        | {
            __typename?: 'MeSpace'
            id: string
            name: string
            visibility: SpaceVisibility
            createdAt: any
          }
        | {
            __typename?: 'WeSpace'
            id: string
            name: string
            visibility: SpaceVisibility
            createdAt: any
          }
      >
    }>
    info: {
      __typename?: 'CreateInfo'
      nodesCreated: number
      relationshipsCreated: number
    }
  }
}

export type UpdateFieldContextMutationVariables = Exact<{
  where: FieldContextWhere
  update: FieldContextUpdateInput
}>

export type UpdateFieldContextMutation = {
  __typename?: 'Mutation'
  updateFieldContexts: {
    __typename?: 'UpdateFieldContextsMutationResponse'
    fieldContexts: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      emergentName?: string | null
      createdAt: any
      space: Array<
        | {
            __typename?: 'MeSpace'
            id: string
            name: string
            visibility: SpaceVisibility
          }
        | {
            __typename?: 'WeSpace'
            id: string
            name: string
            visibility: SpaceVisibility
          }
      >
    }>
    info: {
      __typename?: 'UpdateInfo'
      nodesCreated: number
      nodesDeleted: number
      relationshipsCreated: number
      relationshipsDeleted: number
    }
  }
}

export type DeleteFieldContextMutationVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type DeleteFieldContextMutation = {
  __typename?: 'Mutation'
  deleteFieldContexts: {
    __typename?: 'DeleteInfo'
    nodesDeleted: number
    relationshipsDeleted: number
  }
}

export type ConnectFieldToSpaceMutationVariables = Exact<{
  fieldId: Scalars['ID']['input']
  spaceId: Scalars['ID']['input']
}>

export type ConnectFieldToSpaceMutation = {
  __typename?: 'Mutation'
  updateFieldContexts: {
    __typename?: 'UpdateFieldContextsMutationResponse'
    fieldContexts: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      space: Array<
        | { __typename?: 'MeSpace'; id: string; name: string }
        | { __typename?: 'WeSpace'; id: string; name: string }
      >
    }>
  }
}

export type CreateGoalPulsesMutationVariables = Exact<{
  input: Array<GoalPulseCreateInput> | GoalPulseCreateInput
}>

export type CreateGoalPulsesMutation = {
  __typename?: 'Mutation'
  createGoalPulses: {
    __typename?: 'CreateGoalPulsesMutationResponse'
    goalPulses: Array<{
      __typename?: 'GoalPulse'
      id: string
      content: string
      createdAt: any
      intensity?: number | null
      status: GoalStatus
      horizon?: GoalHorizon | null
    }>
  }
}

export type UpdateGoalPulsesMutationVariables = Exact<{
  where: GoalPulseWhere
  update: GoalPulseUpdateInput
}>

export type UpdateGoalPulsesMutation = {
  __typename?: 'Mutation'
  updateGoalPulses: {
    __typename?: 'UpdateGoalPulsesMutationResponse'
    goalPulses: Array<{
      __typename?: 'GoalPulse'
      id: string
      content: string
      createdAt: any
      intensity?: number | null
      status: GoalStatus
      horizon?: GoalHorizon | null
    }>
  }
}

export type DeleteGoalPulsesMutationVariables = Exact<{
  where: GoalPulseWhere
}>

export type DeleteGoalPulsesMutation = {
  __typename?: 'Mutation'
  deleteGoalPulses: { __typename?: 'DeleteInfo'; nodesDeleted: number }
}

export type CreatePeopleMutationVariables = Exact<{
  input: Array<PersonCreateInput> | PersonCreateInput
}>

export type CreatePeopleMutation = {
  __typename?: 'Mutation'
  createPeople: {
    __typename?: 'CreatePeopleMutationResponse'
    people: Array<{
      __typename?: 'Person'
      id: string
      name: string
      email?: string | null
      ownsSpaces: Array<
        | {
            __typename?: 'MeSpace'
            id: string
            name: string
            visibility: SpaceVisibility
          }
        | {
            __typename?: 'WeSpace'
            id: string
            name: string
            visibility: SpaceVisibility
          }
      >
    }>
  }
}

export type UpdatePersonMutationVariables = Exact<{
  where: PersonWhere
  update: PersonUpdateInput
}>

export type UpdatePersonMutation = {
  __typename?: 'Mutation'
  updatePeople: {
    __typename?: 'UpdatePeopleMutationResponse'
    people: Array<{
      __typename?: 'Person'
      id: string
      name: string
      email?: string | null
      ownsSpaces: Array<
        | {
            __typename?: 'MeSpace'
            id: string
            name: string
            visibility: SpaceVisibility
            createdAt: any
          }
        | {
            __typename?: 'WeSpace'
            id: string
            name: string
            visibility: SpaceVisibility
            createdAt: any
          }
      >
    }>
  }
}

export type DeletePersonMutationVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type DeletePersonMutation = {
  __typename?: 'Mutation'
  deletePeople: { __typename?: 'DeleteInfo'; nodesDeleted: number }
}

export type InvitePersonMutationVariables = Exact<{
  personId: Scalars['String']['input']
}>

export type InvitePersonMutation = {
  __typename?: 'Mutation'
  invitePerson?: {
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
  } | null
}

export type CancelInviteMutationVariables = Exact<{
  personId: Scalars['String']['input']
}>

export type CancelInviteMutation = {
  __typename?: 'Mutation'
  cancelInvite?: {
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
  } | null
}

export type ResolvePersonByEmailQueryVariables = Exact<{
  email: Scalars['String']['input']
}>

export type ResolvePersonByEmailQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
  }>
}

export type AddSpaceMemberMutationVariables = Exact<{
  spaceId: Scalars['ID']['input']
  memberId: Scalars['ID']['input']
  role: SpaceRole
}>

export type AddSpaceMemberMutation = {
  __typename?: 'Mutation'
  addSpaceMember: {
    __typename?: 'AddSpaceMemberResponse'
    success: boolean
    message: string
    membership?: {
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
    } | null
  }
}

export type UpdateSpaceMemberRoleMutationVariables = Exact<{
  spaceId: Scalars['ID']['input']
  memberId: Scalars['ID']['input']
  role: SpaceRole
}>

export type UpdateSpaceMemberRoleMutation = {
  __typename?: 'Mutation'
  updateSpaceMemberRole: {
    __typename?: 'UpdateSpaceMemberRoleResponse'
    success: boolean
    message: string
    membership?: {
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
    } | null
  }
}

export type RemoveSpaceMemberMutationVariables = Exact<{
  spaceId: Scalars['ID']['input']
  memberId: Scalars['ID']['input']
}>

export type RemoveSpaceMemberMutation = {
  __typename?: 'Mutation'
  removeSpaceMember: {
    __typename?: 'RemoveSpaceMemberResponse'
    success: boolean
    message: string
  }
}

export type GetCommunityQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetCommunityQuery = {
  __typename?: 'Query'
  communities: Array<{
    __typename?: 'Community'
    id: string
    name: string
    type?: string | null
    members: Array<
      | {
          __typename?: 'Community'
          id: string
          name: string
          type?: string | null
        }
      | {
          __typename?: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
    ownsSpaces: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
          createdAt: any
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
          createdAt: any
        }
    >
  }>
}

export type GetAllCommunitesQueryVariables = Exact<{
  where?: InputMaybe<CommunityWhere>
}>

export type GetAllCommunitesQuery = {
  __typename?: 'Query'
  communities: Array<{
    __typename?: 'Community'
    id: string
    name: string
    type?: string | null
    members: Array<
      | {
          __typename?: 'Community'
          id: string
          name: string
          type?: string | null
        }
      | {
          __typename?: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
    ownsSpaces: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
    >
  }>
}

export type GetCommunitiesAndTheirMembersQueryVariables = Exact<{
  [key: string]: never
}>

export type GetCommunitiesAndTheirMembersQuery = {
  __typename?: 'Query'
  communities: Array<{
    __typename?: 'Community'
    id: string
    name: string
    type?: string | null
  }>
}

export type GetPeopleNotInCommunitiesQueryVariables = Exact<{
  [key: string]: never
}>

export type GetPeopleNotInCommunitiesQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
  }>
}

export type GetLoggedInUserQueryVariables = Exact<{
  email: Scalars['String']['input']
}>

export type GetLoggedInUserQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
    ownsSpaces: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
          createdAt: any
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
          createdAt: any
        }
    >
  }>
}

export type GetFieldContextDetailsQueryVariables = Exact<{
  contextId: Scalars['ID']['input']
}>

export type GetFieldContextDetailsQuery = {
  __typename?: 'Query'
  fieldContexts: Array<{
    __typename?: 'FieldContext'
    id: string
    title: string
    emergentName?: string | null
    createdAt: any
    pulses: Array<
      | {
          __typename: 'GoalPulse'
          id: string
          title: string
          content: string
          createdAt: any
        }
      | {
          __typename: 'ResourcePulse'
          id: string
          title: string
          content: string
          createdAt: any
        }
      | {
          __typename: 'StoryPulse'
          id: string
          title: string
          content: string
          createdAt: any
        }
    >
    space: Array<
      | {
          __typename: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
      | {
          __typename: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
    >
  }>
}

export type GetFieldContextsQueryVariables = Exact<{
  where?: InputMaybe<FieldContextWhere>
}>

export type GetFieldContextsQuery = {
  __typename?: 'Query'
  fieldContexts: Array<{
    __typename?: 'FieldContext'
    id: string
    title: string
    emergentName?: string | null
    createdAt: any
    space: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
    >
  }>
}

export type GetMeSpaceFieldsQueryVariables = Exact<{ [key: string]: never }>

export type GetMeSpaceFieldsQuery = {
  __typename?: 'Query'
  meSpaces: Array<{
    __typename?: 'MeSpace'
    id: string
    name: string
    owner: Array<
      | { __typename?: 'Community'; id: string }
      | { __typename?: 'Person'; id: string }
    >
    contexts: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      emergentName?: string | null
      createdAt: any
    }>
  }>
}

export type GetFieldsForSpaceQueryVariables = Exact<{
  spaceId: Scalars['ID']['input']
}>

export type GetFieldsForSpaceQuery = {
  __typename?: 'Query'
  fieldContexts: Array<{
    __typename?: 'FieldContext'
    id: string
    title: string
    emergentName?: string | null
    createdAt: any
    space: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
    >
  }>
}

export type GetFieldContextByIdQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetFieldContextByIdQuery = {
  __typename?: 'Query'
  fieldContexts: Array<{
    __typename?: 'FieldContext'
    id: string
    title: string
    emergentName?: string | null
    createdAt: any
    space: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
    >
  }>
}

export type GetFieldsForSpacePaginatedQueryVariables = Exact<{
  spaceId: Scalars['ID']['input']
  offset?: InputMaybe<Scalars['Int']['input']>
  limit?: InputMaybe<Scalars['Int']['input']>
}>

export type GetFieldsForSpacePaginatedQuery = {
  __typename?: 'Query'
  fieldContexts: Array<{
    __typename?: 'FieldContext'
    id: string
    title: string
    emergentName?: string | null
    createdAt: any
    space: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
    >
  }>
}

export type GetGraphStatsQueryVariables = Exact<{ [key: string]: never }>

export type GetGraphStatsQuery = {
  __typename?: 'Query'
  peopleAggregate: { __typename?: 'PersonAggregateSelection'; count: number }
  communitiesAggregate: {
    __typename?: 'CommunityAggregateSelection'
    count: number
  }
  meSpacesAggregate: { __typename?: 'MeSpaceAggregateSelection'; count: number }
  weSpacesAggregate: { __typename?: 'WeSpaceAggregateSelection'; count: number }
  fieldContextsAggregate: {
    __typename?: 'FieldContextAggregateSelection'
    count: number
  }
  goalPulsesAggregate: {
    __typename?: 'GoalPulseAggregateSelection'
    count: number
  }
  resourcePulsesAggregate: {
    __typename?: 'ResourcePulseAggregateSelection'
    count: number
  }
  storyPulsesAggregate: {
    __typename?: 'StoryPulseAggregateSelection'
    count: number
  }
  fieldResonancesAggregate: {
    __typename?: 'FieldResonanceAggregateSelection'
    count: number
  }
  resonanceLinksAggregate: {
    __typename?: 'ResonanceLinkAggregateSelection'
    count: number
  }
}

export type GetGraphPeopleQueryVariables = Exact<{ [key: string]: never }>

export type GetGraphPeopleQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
    ownsSpaces: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          contexts: Array<{
            __typename?: 'FieldContext'
            id: string
            pulses: Array<
              | { __typename?: 'GoalPulse'; id: string }
              | { __typename?: 'ResourcePulse'; id: string }
              | { __typename?: 'StoryPulse'; id: string }
            >
          }>
        }
      | {
          __typename?: 'WeSpace'
          id: string
          contexts: Array<{
            __typename?: 'FieldContext'
            id: string
            pulses: Array<
              | { __typename?: 'GoalPulse'; id: string }
              | { __typename?: 'ResourcePulse'; id: string }
              | { __typename?: 'StoryPulse'; id: string }
            >
          }>
        }
    >
  }>
}

export type GetGraphSpacesQueryVariables = Exact<{ [key: string]: never }>

export type GetGraphSpacesQuery = {
  __typename?: 'Query'
  meSpaces: Array<{
    __typename?: 'MeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    createdAt: any
    owner: Array<
      | { __typename?: 'Community'; id: string; name: string }
      | { __typename?: 'Person'; id: string; name: string }
    >
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<
        | { __typename?: 'Community'; id: string; name: string }
        | { __typename?: 'Person'; id: string; name: string }
      >
    }>
  }>
  weSpaces: Array<{
    __typename?: 'WeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    createdAt: any
    owner: Array<
      | { __typename?: 'Community'; id: string; name: string }
      | { __typename?: 'Person'; id: string; name: string }
    >
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<
        | { __typename?: 'Community'; id: string; name: string }
        | { __typename?: 'Person'; id: string; name: string }
      >
    }>
  }>
}

export type GetGraphResonancesQueryVariables = Exact<{ [key: string]: never }>

export type GetGraphResonancesQuery = {
  __typename?: 'Query'
  fieldResonances: Array<{
    __typename?: 'FieldResonance'
    id: string
    label: string
    description?: string | null
  }>
}

export type GetPersonDetailsQueryVariables = Exact<{
  email: Scalars['String']['input']
}>

export type GetPersonDetailsQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
    ownsSpaces: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          contexts: Array<{
            __typename?: 'FieldContext'
            id: string
            title: string
            pulses: Array<
              | {
                  __typename?: 'GoalPulse'
                  id: string
                  content: string
                  createdAt: any
                  status: GoalStatus
                  intensity?: number | null
                  initiatedBy: Array<
                    | { __typename?: 'Community'; id: string; name: string }
                    | {
                        __typename?: 'Person'
                        id: string
                        name: string
                        email?: string | null
                      }
                  >
                }
              | {
                  __typename?: 'ResourcePulse'
                  id: string
                  content: string
                  createdAt: any
                  resourceType: string
                  intensity?: number | null
                  initiatedBy: Array<
                    | { __typename?: 'Community'; id: string; name: string }
                    | {
                        __typename?: 'Person'
                        id: string
                        name: string
                        email?: string | null
                      }
                  >
                }
              | {
                  __typename?: 'StoryPulse'
                  id: string
                  content: string
                  createdAt: any
                  intensity?: number | null
                  initiatedBy: Array<
                    | { __typename?: 'Community'; id: string; name: string }
                    | {
                        __typename?: 'Person'
                        id: string
                        name: string
                        email?: string | null
                      }
                  >
                }
            >
          }>
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          contexts: Array<{
            __typename?: 'FieldContext'
            id: string
            title: string
            pulses: Array<
              | {
                  __typename?: 'GoalPulse'
                  id: string
                  content: string
                  createdAt: any
                  status: GoalStatus
                  intensity?: number | null
                  initiatedBy: Array<
                    | { __typename?: 'Community'; id: string; name: string }
                    | {
                        __typename?: 'Person'
                        id: string
                        name: string
                        email?: string | null
                      }
                  >
                }
              | {
                  __typename?: 'ResourcePulse'
                  id: string
                  content: string
                  createdAt: any
                  resourceType: string
                  intensity?: number | null
                  initiatedBy: Array<
                    | { __typename?: 'Community'; id: string; name: string }
                    | {
                        __typename?: 'Person'
                        id: string
                        name: string
                        email?: string | null
                      }
                  >
                }
              | {
                  __typename?: 'StoryPulse'
                  id: string
                  content: string
                  createdAt: any
                  intensity?: number | null
                  initiatedBy: Array<
                    | { __typename?: 'Community'; id: string; name: string }
                    | {
                        __typename?: 'Person'
                        id: string
                        name: string
                        email?: string | null
                      }
                  >
                }
            >
          }>
        }
    >
  }>
}

export type GetSpaceDetailsQueryVariables = Exact<{
  spaceId: Scalars['ID']['input']
}>

export type GetSpaceDetailsQuery = {
  __typename?: 'Query'
  meSpaces: Array<{
    __typename?: 'MeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    contexts: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      emergentName?: string | null
      createdAt: any
      pulses: Array<
        | {
            __typename?: 'GoalPulse'
            id: string
            content: string
            createdAt: any
            status: GoalStatus
            intensity?: number | null
            initiatedBy: Array<
              | { __typename?: 'Community'; id: string; name: string }
              | {
                  __typename?: 'Person'
                  id: string
                  name: string
                  email?: string | null
                }
            >
          }
        | {
            __typename?: 'ResourcePulse'
            id: string
            content: string
            createdAt: any
            resourceType: string
            intensity?: number | null
            initiatedBy: Array<
              | { __typename?: 'Community'; id: string; name: string }
              | {
                  __typename?: 'Person'
                  id: string
                  name: string
                  email?: string | null
                }
            >
          }
        | {
            __typename?: 'StoryPulse'
            id: string
            content: string
            createdAt: any
            intensity?: number | null
            initiatedBy: Array<
              | { __typename?: 'Community'; id: string; name: string }
              | {
                  __typename?: 'Person'
                  id: string
                  name: string
                  email?: string | null
                }
            >
          }
      >
    }>
  }>
  weSpaces: Array<{
    __typename?: 'WeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    contexts: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      emergentName?: string | null
      createdAt: any
      pulses: Array<
        | {
            __typename?: 'GoalPulse'
            id: string
            content: string
            createdAt: any
            status: GoalStatus
            intensity?: number | null
            initiatedBy: Array<
              | { __typename?: 'Community'; id: string; name: string }
              | {
                  __typename?: 'Person'
                  id: string
                  name: string
                  email?: string | null
                }
            >
          }
        | {
            __typename?: 'ResourcePulse'
            id: string
            content: string
            createdAt: any
            resourceType: string
            intensity?: number | null
            initiatedBy: Array<
              | { __typename?: 'Community'; id: string; name: string }
              | {
                  __typename?: 'Person'
                  id: string
                  name: string
                  email?: string | null
                }
            >
          }
        | {
            __typename?: 'StoryPulse'
            id: string
            content: string
            createdAt: any
            intensity?: number | null
            initiatedBy: Array<
              | { __typename?: 'Community'; id: string; name: string }
              | {
                  __typename?: 'Person'
                  id: string
                  name: string
                  email?: string | null
                }
            >
          }
      >
    }>
  }>
}

export type GetResonanceDetailsQueryVariables = Exact<{
  resonanceId: Scalars['ID']['input']
}>

export type GetResonanceDetailsQuery = {
  __typename?: 'Query'
  fieldResonances: Array<{
    __typename?: 'FieldResonance'
    id: string
    label: string
    description?: string | null
  }>
  resonanceLinks: Array<{
    __typename?: 'ResonanceLink'
    id: string
    confidence: number
    evidence?: string | null
    createdAt: any
    source: Array<
      | {
          __typename?: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
          initiatedBy: Array<
            | { __typename?: 'Community'; id: string; name: string }
            | {
                __typename?: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
      | {
          __typename?: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
          initiatedBy: Array<
            | { __typename?: 'Community'; id: string; name: string }
            | {
                __typename?: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
      | {
          __typename?: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
          initiatedBy: Array<
            | { __typename?: 'Community'; id: string; name: string }
            | {
                __typename?: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
    >
    target: Array<
      | {
          __typename?: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
          initiatedBy: Array<
            | { __typename?: 'Community'; id: string; name: string }
            | {
                __typename?: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
      | {
          __typename?: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
          initiatedBy: Array<
            | { __typename?: 'Community'; id: string; name: string }
            | {
                __typename?: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
      | {
          __typename?: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
          initiatedBy: Array<
            | { __typename?: 'Community'; id: string; name: string }
            | {
                __typename?: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
    >
  }>
}

export type GetResonanceWithLinksQueryVariables = Exact<{
  resonanceId: Scalars['ID']['input']
}>

export type GetResonanceWithLinksQuery = {
  __typename?: 'Query'
  fieldResonances: Array<{
    __typename?: 'FieldResonance'
    id: string
    label: string
    description?: string | null
  }>
  resonanceLinks: Array<{
    __typename?: 'ResonanceLink'
    id: string
    confidence: number
    evidence?: string | null
    createdAt: any
    source: Array<
      | {
          __typename: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
          initiatedBy: Array<
            | { __typename: 'Community'; id: string; name: string }
            | {
                __typename: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
      | {
          __typename: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
          initiatedBy: Array<
            | { __typename: 'Community'; id: string; name: string }
            | {
                __typename: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
      | {
          __typename: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
          initiatedBy: Array<
            | { __typename: 'Community'; id: string; name: string }
            | {
                __typename: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
    >
    target: Array<
      | {
          __typename: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
          initiatedBy: Array<
            | { __typename: 'Community'; id: string; name: string }
            | {
                __typename: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
      | {
          __typename: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
          initiatedBy: Array<
            | { __typename: 'Community'; id: string; name: string }
            | {
                __typename: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
      | {
          __typename: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
          initiatedBy: Array<
            | { __typename: 'Community'; id: string; name: string }
            | {
                __typename: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }
    >
  }>
}

export type GetAllResonancesQueryVariables = Exact<{ [key: string]: never }>

export type GetAllResonancesQuery = {
  __typename?: 'Query'
  fieldResonances: Array<{
    __typename?: 'FieldResonance'
    id: string
    label: string
    description?: string | null
  }>
}

export type GetAllResonanceLinksWithResonancesQueryVariables = Exact<{
  [key: string]: never
}>

export type GetAllResonanceLinksWithResonancesQuery = {
  __typename?: 'Query'
  resonanceLinks: Array<{
    __typename?: 'ResonanceLink'
    id: string
    confidence: number
    evidence?: string | null
    createdAt: any
    resonance: Array<{
      __typename?: 'FieldResonance'
      id: string
      label: string
      description?: string | null
    }>
    source: Array<
      | {
          __typename: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
        }
      | {
          __typename: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
        }
      | {
          __typename: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
        }
    >
    target: Array<
      | {
          __typename: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
        }
      | {
          __typename: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
        }
      | {
          __typename: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
        }
    >
  }>
}

export type GetLinksForResonanceQueryVariables = Exact<{
  resonanceId: Scalars['ID']['input']
}>

export type GetLinksForResonanceQuery = {
  __typename?: 'Query'
  resonanceLinks: Array<{
    __typename?: 'ResonanceLink'
    id: string
    confidence: number
    evidence?: string | null
    createdAt: any
    resonance: Array<{
      __typename?: 'FieldResonance'
      id: string
      label: string
      description?: string | null
    }>
    source: Array<
      | {
          __typename: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
        }
      | {
          __typename: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
        }
      | {
          __typename: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
        }
    >
    target: Array<
      | {
          __typename: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
        }
      | {
          __typename: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
        }
      | {
          __typename: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
        }
    >
  }>
}

export type GetAllPulsesQueryVariables = Exact<{ [key: string]: never }>

export type GetAllPulsesQuery = {
  __typename?: 'Query'
  goalPulses: Array<{
    __typename: 'GoalPulse'
    id: string
    content: string
    createdAt: any
    intensity?: number | null
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    initiatedBy: Array<
      | { __typename: 'Community'; id: string; name: string }
      | {
          __typename: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
  }>
  resourcePulses: Array<{
    __typename: 'ResourcePulse'
    id: string
    content: string
    createdAt: any
    intensity?: number | null
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    initiatedBy: Array<
      | { __typename: 'Community'; id: string; name: string }
      | {
          __typename: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
  }>
  storyPulses: Array<{
    __typename: 'StoryPulse'
    id: string
    content: string
    createdAt: any
    intensity?: number | null
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    initiatedBy: Array<
      | { __typename: 'Community'; id: string; name: string }
      | {
          __typename: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
  }>
}

export type GetAllFieldContextsQueryVariables = Exact<{ [key: string]: never }>

export type GetAllFieldContextsQuery = {
  __typename?: 'Query'
  fieldContexts: Array<{
    __typename?: 'FieldContext'
    id: string
    title: string
    emergentName?: string | null
    createdAt: any
    space: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
    >
    pulses: Array<
      | { __typename: 'GoalPulse'; id: string; createdAt: any }
      | { __typename: 'ResourcePulse'; id: string; createdAt: any }
      | { __typename: 'StoryPulse'; id: string; createdAt: any }
    >
  }>
}

export type GetAllMeSpacesQueryVariables = Exact<{ [key: string]: never }>

export type GetAllMeSpacesQuery = {
  __typename?: 'Query'
  meSpaces: Array<{
    __typename?: 'MeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    createdAt: any
    owner: Array<
      | { __typename?: 'Community'; id: string; name: string }
      | {
          __typename?: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<
        | { __typename?: 'Community'; id: string; name: string }
        | {
            __typename?: 'Person'
            id: string
            name: string
            email?: string | null
          }
      >
    }>
    contexts: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      createdAt: any
    }>
  }>
}

export type GetAllWeSpacesQueryVariables = Exact<{ [key: string]: never }>

export type GetAllWeSpacesQuery = {
  __typename?: 'Query'
  weSpaces: Array<{
    __typename?: 'WeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    createdAt: any
    owner: Array<
      | { __typename?: 'Community'; id: string; name: string }
      | {
          __typename?: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<
        | { __typename?: 'Community'; id: string; name: string }
        | {
            __typename?: 'Person'
            id: string
            name: string
            email?: string | null
          }
      >
    }>
    contexts: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      createdAt: any
    }>
  }>
}

export type GetPersonQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetPersonQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
    ownsSpaces: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
          createdAt: any
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
          createdAt: any
        }
    >
  }>
}

export type GetPersonProfileQueryVariables = Exact<{
  personId: Scalars['ID']['input']
}>

export type GetPersonProfileQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    firstName: string
    lastName: string
    name: string
    email?: string | null
    ownsSpaces: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
          createdAt: any
          contexts: Array<{
            __typename?: 'FieldContext'
            id: string
            title: string
            pulses: Array<
              | {
                  __typename?: 'GoalPulse'
                  id: string
                  title: string
                  intensity?: number | null
                }
              | {
                  __typename?: 'ResourcePulse'
                  id: string
                  title: string
                  intensity?: number | null
                }
              | {
                  __typename?: 'StoryPulse'
                  id: string
                  title: string
                  intensity?: number | null
                }
            >
          }>
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
          createdAt: any
          contexts: Array<{
            __typename?: 'FieldContext'
            id: string
            title: string
            pulses: Array<
              | {
                  __typename?: 'GoalPulse'
                  id: string
                  title: string
                  intensity?: number | null
                }
              | {
                  __typename?: 'ResourcePulse'
                  id: string
                  title: string
                  intensity?: number | null
                }
              | {
                  __typename?: 'StoryPulse'
                  id: string
                  title: string
                  intensity?: number | null
                }
            >
          }>
        }
    >
  }>
}

export type GetAllPeopleQueryVariables = Exact<{
  where?: InputMaybe<PersonWhere>
}>

export type GetAllPeopleQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
    ownsSpaces: Array<
      | {
          __typename?: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
      | {
          __typename?: 'WeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
        }
    >
  }>
}

export type GetPeopleAndTheirGoalsQueryVariables = Exact<{
  personWhere?: InputMaybe<PersonWhere>
  goalLimit?: InputMaybe<Scalars['Int']['input']>
}>

export type GetPeopleAndTheirGoalsQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    name: string
    ownsSpaces: Array<
      | { __typename?: 'MeSpace'; id: string; name: string }
      | { __typename?: 'WeSpace'; id: string; name: string }
    >
  }>
}

export type GetPeopleAndTheirResourcesQueryVariables = Exact<{
  [key: string]: never
}>

export type GetPeopleAndTheirResourcesQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    name: string
    id: string
    email?: string | null
    ownsSpaces: Array<
      | { __typename?: 'MeSpace'; name: string; id: string }
      | { __typename?: 'WeSpace'; name: string; id: string }
    >
  }>
}

export type GetPeopleAndTheirCoreValuesQueryVariables = Exact<{
  [key: string]: never
}>

export type GetPeopleAndTheirCoreValuesQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
    ownsSpaces: Array<
      | { __typename?: 'MeSpace'; id: string; name: string }
      | { __typename?: 'WeSpace'; id: string; name: string }
    >
  }>
}

export type GetUserByIdQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetUserByIdQuery = {
  __typename?: 'Query'
  people: Array<{
    __typename?: 'Person'
    id: string
    name: string
    email?: string | null
  }>
}

export type GetPulseDetailsWithContextQueryVariables = Exact<{
  pulseId: Scalars['ID']['input']
}>

export type GetPulseDetailsWithContextQuery = {
  __typename?: 'Query'
  fieldPulses: Array<
    | {
        __typename: 'GoalPulse'
        id: string
        title: string
        content: string
        createdAt: any
        context: Array<{
          __typename?: 'FieldContext'
          id: string
          title: string
          emergentName?: string | null
          createdAt: any
          pulses: Array<
            | {
                __typename: 'GoalPulse'
                id: string
                title: string
                content: string
                createdAt: any
              }
            | {
                __typename: 'ResourcePulse'
                id: string
                title: string
                content: string
                createdAt: any
              }
            | {
                __typename: 'StoryPulse'
                id: string
                title: string
                content: string
                createdAt: any
              }
          >
          space: Array<
            | {
                __typename: 'MeSpace'
                id: string
                name: string
                visibility: SpaceVisibility
              }
            | {
                __typename: 'WeSpace'
                id: string
                name: string
                visibility: SpaceVisibility
              }
          >
        }>
      }
    | {
        __typename: 'ResourcePulse'
        id: string
        title: string
        content: string
        createdAt: any
        context: Array<{
          __typename?: 'FieldContext'
          id: string
          title: string
          emergentName?: string | null
          createdAt: any
          pulses: Array<
            | {
                __typename: 'GoalPulse'
                id: string
                title: string
                content: string
                createdAt: any
              }
            | {
                __typename: 'ResourcePulse'
                id: string
                title: string
                content: string
                createdAt: any
              }
            | {
                __typename: 'StoryPulse'
                id: string
                title: string
                content: string
                createdAt: any
              }
          >
          space: Array<
            | {
                __typename: 'MeSpace'
                id: string
                name: string
                visibility: SpaceVisibility
              }
            | {
                __typename: 'WeSpace'
                id: string
                name: string
                visibility: SpaceVisibility
              }
          >
        }>
      }
    | {
        __typename: 'StoryPulse'
        id: string
        title: string
        content: string
        createdAt: any
        context: Array<{
          __typename?: 'FieldContext'
          id: string
          title: string
          emergentName?: string | null
          createdAt: any
          pulses: Array<
            | {
                __typename: 'GoalPulse'
                id: string
                title: string
                content: string
                createdAt: any
              }
            | {
                __typename: 'ResourcePulse'
                id: string
                title: string
                content: string
                createdAt: any
              }
            | {
                __typename: 'StoryPulse'
                id: string
                title: string
                content: string
                createdAt: any
              }
          >
          space: Array<
            | {
                __typename: 'MeSpace'
                id: string
                name: string
                visibility: SpaceVisibility
              }
            | {
                __typename: 'WeSpace'
                id: string
                name: string
                visibility: SpaceVisibility
              }
          >
        }>
      }
  >
}

export type GetPulseDetailsQueryVariables = Exact<{
  pulseId: Scalars['ID']['input']
}>

export type GetPulseDetailsQuery = {
  __typename?: 'Query'
  goalPulses: Array<{
    __typename: 'GoalPulse'
    id: string
    content: string
    createdAt: any
    intensity?: number | null
    status: GoalStatus
    horizon?: GoalHorizon | null
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    initiatedBy: Array<
      | { __typename: 'Community'; id: string; name: string }
      | {
          __typename: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
  }>
  resourcePulses: Array<{
    __typename: 'ResourcePulse'
    id: string
    content: string
    createdAt: any
    intensity?: number | null
    resourceType: string
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    initiatedBy: Array<
      | { __typename: 'Community'; id: string; name: string }
      | {
          __typename: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
  }>
  storyPulses: Array<{
    __typename: 'StoryPulse'
    id: string
    content: string
    createdAt: any
    intensity?: number | null
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    initiatedBy: Array<
      | { __typename: 'Community'; id: string; name: string }
      | {
          __typename: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
  }>
}

export type SearchAllQueryVariables = Exact<{
  query: Scalars['String']['input']
}>

export type SearchAllQuery = {
  __typename?: 'Query'
  searchAll?: {
    __typename?: 'SearchResults'
    people: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      email?: string | null
    }>
    contexts: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    goalPulses: Array<{
      __typename?: 'GoalPulse'
      id: string
      content: string
      createdAt: any
      intensity?: number | null
    }>
    resourcePulses: Array<{
      __typename?: 'ResourcePulse'
      id: string
      content: string
      createdAt: any
      intensity?: number | null
    }>
    storyPulses: Array<{
      __typename?: 'StoryPulse'
      id: string
      content: string
      createdAt: any
      intensity?: number | null
    }>
    meSpaces: Array<{
      __typename?: 'MeSpace'
      id: string
      name: string
      visibility: SpaceVisibility
      createdAt: any
    }>
    weSpaces: Array<{
      __typename?: 'WeSpace'
      id: string
      name: string
      visibility: SpaceVisibility
      createdAt: any
    }>
    communities: Array<{
      __typename?: 'Community'
      id: string
      name: string
      type?: string | null
    }>
  } | null
}

export type GetSpaceDetailsCompleteQueryVariables = Exact<{
  spaceId: Scalars['ID']['input']
}>

export type GetSpaceDetailsCompleteQuery = {
  __typename?: 'Query'
  spaces: Array<
    | {
        __typename?: 'MeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
        createdAt: any
        owner: Array<
          | {
              __typename: 'Community'
              id: string
              name: string
              type?: string | null
            }
          | {
              __typename: 'Person'
              id: string
              name: string
              email?: string | null
            }
        >
        members: Array<{
          __typename?: 'SpaceMembership'
          id: string
          role: SpaceRole
          addedAt: any
          member: Array<
            | {
                __typename: 'Community'
                id: string
                name: string
                type?: string | null
              }
            | {
                __typename: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }>
        contexts: Array<{
          __typename?: 'FieldContext'
          id: string
          title: string
          emergentName?: string | null
          createdAt: any
          pulses: Array<
            | {
                __typename: 'GoalPulse'
                id: string
                title: string
                intensity?: number | null
              }
            | {
                __typename: 'ResourcePulse'
                id: string
                title: string
                intensity?: number | null
              }
            | {
                __typename: 'StoryPulse'
                id: string
                title: string
                intensity?: number | null
              }
          >
        }>
      }
    | {
        __typename?: 'WeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
        createdAt: any
        owner: Array<
          | {
              __typename: 'Community'
              id: string
              name: string
              type?: string | null
            }
          | {
              __typename: 'Person'
              id: string
              name: string
              email?: string | null
            }
        >
        members: Array<{
          __typename?: 'SpaceMembership'
          id: string
          role: SpaceRole
          addedAt: any
          member: Array<
            | {
                __typename: 'Community'
                id: string
                name: string
                type?: string | null
              }
            | {
                __typename: 'Person'
                id: string
                name: string
                email?: string | null
              }
          >
        }>
        contexts: Array<{
          __typename?: 'FieldContext'
          id: string
          title: string
          emergentName?: string | null
          createdAt: any
          pulses: Array<
            | {
                __typename: 'GoalPulse'
                id: string
                title: string
                intensity?: number | null
              }
            | {
                __typename: 'ResourcePulse'
                id: string
                title: string
                intensity?: number | null
              }
            | {
                __typename: 'StoryPulse'
                id: string
                title: string
                intensity?: number | null
              }
          >
        }>
      }
  >
}

export type GetUserMeSpacesQueryVariables = Exact<{ [key: string]: never }>

export type GetUserMeSpacesQuery = {
  __typename?: 'Query'
  meSpaces: Array<{
    __typename?: 'MeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    createdAt: any
    contexts: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
  }>
}

export type GetUserWeSpacesQueryVariables = Exact<{ [key: string]: never }>

export type GetUserWeSpacesQuery = {
  __typename?: 'Query'
  weSpaces: Array<{
    __typename?: 'WeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    createdAt: any
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
    }>
    contexts: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
  }>
}

export type GetSpaceMembersQueryVariables = Exact<{
  spaceId: Scalars['ID']['input']
}>

export type GetSpaceMembersQuery = {
  __typename?: 'Query'
  meSpaces: Array<{
    __typename?: 'MeSpace'
    id: string
    name: string
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<
        | { __typename?: 'Community'; id: string; name: string }
        | {
            __typename?: 'Person'
            id: string
            name: string
            email?: string | null
          }
      >
    }>
  }>
  weSpaces: Array<{
    __typename?: 'WeSpace'
    id: string
    name: string
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<
        | { __typename?: 'Community'; id: string; name: string }
        | {
            __typename?: 'Person'
            id: string
            name: string
            email?: string | null
          }
      >
    }>
  }>
}

export type GetWeSpaceDetailsQueryVariables = Exact<{
  spaceId: Scalars['ID']['input']
}>

export type GetWeSpaceDetailsQuery = {
  __typename?: 'Query'
  weSpaces: Array<{
    __typename?: 'WeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    createdAt: any
    owner: Array<
      | { __typename?: 'Community'; id: string; name: string }
      | {
          __typename?: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<
        | { __typename?: 'Community'; id: string; name: string }
        | {
            __typename?: 'Person'
            id: string
            name: string
            email?: string | null
          }
      >
    }>
    contexts: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      emergentName?: string | null
      createdAt: any
    }>
  }>
}

export type GetMeSpaceDetailsQueryVariables = Exact<{
  spaceId: Scalars['ID']['input']
}>

export type GetMeSpaceDetailsQuery = {
  __typename?: 'Query'
  meSpaces: Array<{
    __typename?: 'MeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    createdAt: any
    owner: Array<
      | { __typename?: 'Community'; id: string; name: string }
      | {
          __typename?: 'Person'
          id: string
          name: string
          email?: string | null
        }
    >
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<
        | { __typename?: 'Community'; id: string; name: string }
        | {
            __typename?: 'Person'
            id: string
            name: string
            email?: string | null
          }
      >
    }>
    contexts: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      emergentName?: string | null
      createdAt: any
    }>
  }>
}

export const CreateFieldContextDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateFieldContext' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'FieldContextCreateInput' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createFieldContexts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fieldContexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'emergentName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'space' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'visibility' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'info' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'nodesCreated' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'relationshipsCreated' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateFieldContextMutation,
  CreateFieldContextMutationVariables
>
export const UpdateFieldContextDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateFieldContext' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'FieldContextWhere' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'update' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'FieldContextUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateFieldContexts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'where' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'update' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'update' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fieldContexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'emergentName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'space' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'visibility' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'info' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'nodesCreated' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'nodesDeleted' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'relationshipsCreated' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'relationshipsDeleted' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateFieldContextMutation,
  UpdateFieldContextMutationVariables
>
export const DeleteFieldContextDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteFieldContext' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteFieldContexts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'id' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'nodesDeleted' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'relationshipsDeleted' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteFieldContextMutation,
  DeleteFieldContextMutationVariables
>
export const ConnectFieldToSpaceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ConnectFieldToSpace' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'fieldId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateFieldContexts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'fieldId' },
                      },
                    },
                  ],
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'update' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'space' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'connect' },
                            value: {
                              kind: 'ListValue',
                              values: [
                                {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: { kind: 'Name', value: 'where' },
                                      value: {
                                        kind: 'ObjectValue',
                                        fields: [
                                          {
                                            kind: 'ObjectField',
                                            name: {
                                              kind: 'Name',
                                              value: 'node',
                                            },
                                            value: {
                                              kind: 'ObjectValue',
                                              fields: [
                                                {
                                                  kind: 'ObjectField',
                                                  name: {
                                                    kind: 'Name',
                                                    value: 'id_EQ',
                                                  },
                                                  value: {
                                                    kind: 'Variable',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'spaceId',
                                                    },
                                                  },
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fieldContexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'space' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ConnectFieldToSpaceMutation,
  ConnectFieldToSpaceMutationVariables
>
export const CreateGoalPulsesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createGoalPulses' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'GoalPulseCreateInput' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createGoalPulses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'goalPulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'horizon' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateGoalPulsesMutation,
  CreateGoalPulsesMutationVariables
>
export const UpdateGoalPulsesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateGoalPulses' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'GoalPulseWhere' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'update' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'GoalPulseUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateGoalPulses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'where' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'update' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'update' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'goalPulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'horizon' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateGoalPulsesMutation,
  UpdateGoalPulsesMutationVariables
>
export const DeleteGoalPulsesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteGoalPulses' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'GoalPulseWhere' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteGoalPulses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'where' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'nodesDeleted' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteGoalPulsesMutation,
  DeleteGoalPulsesMutationVariables
>
export const CreatePeopleDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreatePeople' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'PersonCreateInput' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createPeople' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'people' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'ownsSpaces' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'visibility' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreatePeopleMutation,
  CreatePeopleMutationVariables
>
export const UpdatePersonDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdatePerson' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'PersonWhere' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'update' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'PersonUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updatePeople' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'where' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'update' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'update' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'people' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'ownsSpaces' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'visibility' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdatePersonMutation,
  UpdatePersonMutationVariables
>
export const DeletePersonDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePerson' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePeople' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'id' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'nodesDeleted' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeletePersonMutation,
  DeletePersonMutationVariables
>
export const InvitePersonDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'InvitePerson' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'personId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'invitePerson' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'personId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'personId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  InvitePersonMutation,
  InvitePersonMutationVariables
>
export const CancelInviteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CancelInvite' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'personId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cancelInvite' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'personId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'personId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CancelInviteMutation,
  CancelInviteMutationVariables
>
export const ResolvePersonByEmailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ResolvePersonByEmail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'email' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'email_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'email' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResolvePersonByEmailQuery,
  ResolvePersonByEmailQueryVariables
>
export const AddSpaceMemberDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AddSpaceMember' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'memberId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'role' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SpaceRole' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addSpaceMember' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'spaceId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'spaceId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'memberId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'memberId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'role' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'role' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'membership' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'addedAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AddSpaceMemberMutation,
  AddSpaceMemberMutationVariables
>
export const UpdateSpaceMemberRoleDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateSpaceMemberRole' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'memberId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'role' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SpaceRole' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateSpaceMemberRole' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'spaceId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'spaceId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'memberId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'memberId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'role' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'role' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'membership' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'addedAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSpaceMemberRoleMutation,
  UpdateSpaceMemberRoleMutationVariables
>
export const RemoveSpaceMemberDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RemoveSpaceMember' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'memberId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'removeSpaceMember' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'spaceId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'spaceId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'memberId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'memberId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveSpaceMemberMutation,
  RemoveSpaceMemberMutationVariables
>
export const GetCommunityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getCommunity' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'communities' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'id' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCommunityQuery, GetCommunityQueryVariables>
export const GetAllCommunitesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAllCommunites' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'CommunityWhere' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'communities' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'where' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllCommunitesQuery,
  GetAllCommunitesQueryVariables
>
export const GetCommunitiesAndTheirMembersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getCommunitiesAndTheirMembers' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'communities' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCommunitiesAndTheirMembersQuery,
  GetCommunitiesAndTheirMembersQueryVariables
>
export const GetPeopleNotInCommunitiesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getPeopleNotInCommunities' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPeopleNotInCommunitiesQuery,
  GetPeopleNotInCommunitiesQueryVariables
>
export const GetLoggedInUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getLoggedInUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'email' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'email_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'email' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetLoggedInUserQuery,
  GetLoggedInUserQueryVariables
>
export const GetFieldContextDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getFieldContextDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'contextId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldContexts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'contextId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'emergentName' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'space' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'MeSpace' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: '__typename' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'visibility' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'WeSpace' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: '__typename' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'visibility' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetFieldContextDetailsQuery,
  GetFieldContextDetailsQueryVariables
>
export const GetFieldContextsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetFieldContexts' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'FieldContextWhere' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldContexts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'where' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'emergentName' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'space' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetFieldContextsQuery,
  GetFieldContextsQueryVariables
>
export const GetMeSpaceFieldsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMeSpaceFields' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'meSpaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'emergentName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMeSpaceFieldsQuery,
  GetMeSpaceFieldsQueryVariables
>
export const GetFieldsForSpaceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetFieldsForSpace' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldContexts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'space_SOME' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'id_EQ' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'spaceId' },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'emergentName' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'space' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetFieldsForSpaceQuery,
  GetFieldsForSpaceQueryVariables
>
export const GetFieldContextByIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetFieldContextById' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldContexts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'id' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'emergentName' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'space' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetFieldContextByIdQuery,
  GetFieldContextByIdQueryVariables
>
export const GetFieldsForSpacePaginatedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetFieldsForSpacePaginated' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'offset' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldContexts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'space_SOME' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'id_EQ' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'spaceId' },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'offset' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'emergentName' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'space' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetFieldsForSpacePaginatedQuery,
  GetFieldsForSpacePaginatedQueryVariables
>
export const GetGraphStatsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getGraphStats' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'peopleAggregate' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'communitiesAggregate' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'meSpacesAggregate' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weSpacesAggregate' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldContextsAggregate' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'goalPulsesAggregate' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resourcePulsesAggregate' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storyPulsesAggregate' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldResonancesAggregate' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resonanceLinksAggregate' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetGraphStatsQuery, GetGraphStatsQueryVariables>
export const GetGraphPeopleDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getGraphPeople' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'MeSpace' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'contexts' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'pulses' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'WeSpace' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'contexts' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'pulses' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetGraphPeopleQuery, GetGraphPeopleQueryVariables>
export const GetGraphSpacesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getGraphSpaces' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'meSpaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'addedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'member' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Person' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Community' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weSpaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'addedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'member' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Person' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Community' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetGraphSpacesQuery, GetGraphSpacesQueryVariables>
export const GetGraphResonancesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getGraphResonances' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldResonances' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetGraphResonancesQuery,
  GetGraphResonancesQueryVariables
>
export const GetPersonDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getPersonDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'email' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'email_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'email' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'MeSpace' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'contexts' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'pulses' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'GoalPulse',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'content',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'createdAt',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'status',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'intensity',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'initiatedBy',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Person',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'email',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Community',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'ResourcePulse',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'content',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'createdAt',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'resourceType',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'intensity',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'initiatedBy',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Person',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'email',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Community',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'StoryPulse',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'content',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'createdAt',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'intensity',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'initiatedBy',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Person',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'email',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Community',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'WeSpace' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'contexts' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'pulses' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'GoalPulse',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'content',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'createdAt',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'status',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'intensity',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'initiatedBy',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Person',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'email',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Community',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'ResourcePulse',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'content',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'createdAt',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'resourceType',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'intensity',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'initiatedBy',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Person',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'email',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Community',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'StoryPulse',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'content',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'createdAt',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'intensity',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'initiatedBy',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Person',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'email',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                    {
                                                      kind: 'InlineFragment',
                                                      typeCondition: {
                                                        kind: 'NamedType',
                                                        name: {
                                                          kind: 'Name',
                                                          value: 'Community',
                                                        },
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'id',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPersonDetailsQuery,
  GetPersonDetailsQueryVariables
>
export const GetSpaceDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getSpaceDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'meSpaces' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'spaceId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'emergentName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pulses' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'GoalPulse' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'createdAt' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'status' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'intensity' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'initiatedBy',
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Person',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'email',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Community',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'ResourcePulse' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'createdAt' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'resourceType',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'intensity' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'initiatedBy',
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Person',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'email',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Community',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'StoryPulse' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'createdAt' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'intensity' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'initiatedBy',
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Person',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'email',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Community',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weSpaces' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'spaceId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'emergentName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pulses' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'GoalPulse' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'createdAt' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'status' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'intensity' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'initiatedBy',
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Person',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'email',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Community',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'ResourcePulse' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'createdAt' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'resourceType',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'intensity' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'initiatedBy',
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Person',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'email',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Community',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'StoryPulse' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'createdAt' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'intensity' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'initiatedBy',
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Person',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'email',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'InlineFragment',
                                          typeCondition: {
                                            kind: 'NamedType',
                                            name: {
                                              kind: 'Name',
                                              value: 'Community',
                                            },
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'id',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetSpaceDetailsQuery,
  GetSpaceDetailsQueryVariables
>
export const GetResonanceDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getResonanceDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'resonanceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldResonances' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'resonanceId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resonanceLinks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'resonance_SOME' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'id_EQ' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'resonanceId' },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'confidence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'source' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'GoalPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'ResourcePulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'resourceType' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'StoryPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'target' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'GoalPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'ResourcePulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'resourceType' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'StoryPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetResonanceDetailsQuery,
  GetResonanceDetailsQueryVariables
>
export const GetResonanceWithLinksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getResonanceWithLinks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'resonanceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldResonances' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'resonanceId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resonanceLinks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'resonance_SOME' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'id_EQ' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'resonanceId' },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'confidence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'source' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'GoalPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'ResourcePulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'resourceType' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'StoryPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'target' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'GoalPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'ResourcePulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'resourceType' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'StoryPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'initiatedBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetResonanceWithLinksQuery,
  GetResonanceWithLinksQueryVariables
>
export const GetAllResonancesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAllResonances' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldResonances' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllResonancesQuery,
  GetAllResonancesQueryVariables
>
export const GetAllResonanceLinksWithResonancesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAllResonanceLinksWithResonances' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resonanceLinks' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'confidence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resonance' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'source' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'GoalPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'ResourcePulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'resourceType' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'StoryPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'target' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'GoalPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'ResourcePulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'resourceType' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'StoryPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllResonanceLinksWithResonancesQuery,
  GetAllResonanceLinksWithResonancesQueryVariables
>
export const GetLinksForResonanceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getLinksForResonance' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'resonanceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resonanceLinks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'resonance_SOME' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'id_EQ' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'resonanceId' },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'confidence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'evidence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resonance' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'source' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'GoalPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'ResourcePulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'resourceType' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'StoryPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'target' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'GoalPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'ResourcePulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'resourceType' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'StoryPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'intensity' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetLinksForResonanceQuery,
  GetLinksForResonanceQueryVariables
>
export const GetAllPulsesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllPulses' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'goalPulses' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'intensity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'context' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'initiatedBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resourcePulses' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'intensity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'context' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'initiatedBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storyPulses' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'intensity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'context' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'initiatedBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAllPulsesQuery, GetAllPulsesQueryVariables>
export const GetAllFieldContextsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllFieldContexts' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldContexts' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'emergentName' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'space' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'GoalPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: '__typename' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'ResourcePulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: '__typename' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'StoryPulse' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: '__typename' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllFieldContextsQuery,
  GetAllFieldContextsQueryVariables
>
export const GetAllMeSpacesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllMeSpaces' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'meSpaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'addedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'member' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Person' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Community' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAllMeSpacesQuery, GetAllMeSpacesQueryVariables>
export const GetAllWeSpacesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllWeSpaces' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weSpaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'addedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'member' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Person' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Community' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAllWeSpacesQuery, GetAllWeSpacesQueryVariables>
export const GetPersonDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getPerson' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'id' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetPersonQuery, GetPersonQueryVariables>
export const GetPersonProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getPersonProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'personId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'personId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'MeSpace' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'visibility' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'contexts' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'pulses' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'title',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'intensity',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'WeSpace' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'visibility' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'contexts' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'pulses' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'title',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'intensity',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPersonProfileQuery,
  GetPersonProfileQueryVariables
>
export const GetAllPeopleDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAllPeople' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'PersonWhere' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'where' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAllPeopleQuery, GetAllPeopleQueryVariables>
export const GetPeopleAndTheirGoalsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getPeopleAndTheirGoals' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'personWhere' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'PersonWhere' },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'goalLimit' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'personWhere' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPeopleAndTheirGoalsQuery,
  GetPeopleAndTheirGoalsQueryVariables
>
export const GetPeopleAndTheirResourcesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getPeopleAndTheirResources' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPeopleAndTheirResourcesQuery,
  GetPeopleAndTheirResourcesQueryVariables
>
export const GetPeopleAndTheirCoreValuesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getPeopleAndTheirCoreValues' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ownsSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPeopleAndTheirCoreValuesQuery,
  GetPeopleAndTheirCoreValuesQueryVariables
>
export const GetUserByIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getUserById' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'people' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'id' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserByIdQuery, GetUserByIdQueryVariables>
export const GetPulseDetailsWithContextDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getPulseDetailsWithContext' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'pulseId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fieldPulses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'pulseId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'context' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'emergentName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pulses' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'title' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'content' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: '__typename' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'space' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'visibility' },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'MeSpace' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'visibility' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'WeSpace' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'visibility' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPulseDetailsWithContextQuery,
  GetPulseDetailsWithContextQueryVariables
>
export const GetPulseDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getPulseDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'pulseId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'goalPulses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'pulseId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'intensity' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'horizon' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'context' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'initiatedBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resourcePulses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'pulseId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'intensity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resourceType' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'context' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'initiatedBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storyPulses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'pulseId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'intensity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'context' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'initiatedBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: '__typename' },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPulseDetailsQuery,
  GetPulseDetailsQueryVariables
>
export const SearchAllDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchAll' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'query' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchAll' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'query' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'query' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'people' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'firstName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'goalPulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resourcePulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'storyPulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'meSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'weSpaces' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'communities' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchAllQuery, SearchAllQueryVariables>
export const GetSpaceDetailsCompleteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getSpaceDetailsComplete' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'spaces' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'spaceId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'InlineFragment',
                  typeCondition: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: 'MeSpace' },
                  },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'owner' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: '__typename' },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Person' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Community' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'type' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'members' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'role' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'addedAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'member' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'type' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'contexts' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'title' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'emergentName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'pulses' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'intensity' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'InlineFragment',
                  typeCondition: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: 'WeSpace' },
                  },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'visibility' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'owner' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: '__typename' },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Person' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Community' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'type' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'members' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'role' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'addedAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'member' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: { kind: 'Name', value: 'Person' },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'email',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'InlineFragment',
                                    typeCondition: {
                                      kind: 'NamedType',
                                      name: {
                                        kind: 'Name',
                                        value: 'Community',
                                      },
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'id' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'type' },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'contexts' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'title' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'emergentName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'pulses' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'intensity' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetSpaceDetailsCompleteQuery,
  GetSpaceDetailsCompleteQueryVariables
>
export const GetUserMeSpacesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetUserMeSpaces' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'meSpaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetUserMeSpacesQuery,
  GetUserMeSpacesQueryVariables
>
export const GetUserWeSpacesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetUserWeSpaces' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weSpaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetUserWeSpacesQuery,
  GetUserWeSpacesQueryVariables
>
export const GetSpaceMembersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSpaceMembers' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'meSpaces' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'spaceId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'addedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'member' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Person' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Community' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weSpaces' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'spaceId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'addedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'member' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Person' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Community' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetSpaceMembersQuery,
  GetSpaceMembersQueryVariables
>
export const GetWeSpaceDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetWeSpaceDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'weSpaces' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'spaceId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'addedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'member' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Person' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Community' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'emergentName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetWeSpaceDetailsQuery,
  GetWeSpaceDetailsQueryVariables
>
export const GetMeSpaceDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMeSpaceDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'spaceId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'meSpaces' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'spaceId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'visibility' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Person' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'Community' },
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'addedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'member' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Person' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'InlineFragment',
                              typeCondition: {
                                kind: 'NamedType',
                                name: { kind: 'Name', value: 'Community' },
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contexts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'emergentName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMeSpaceDetailsQuery,
  GetMeSpaceDetailsQueryVariables
>
