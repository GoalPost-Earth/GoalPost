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

/**
 * Care or wellness-focused pulse.
 * Multi-label: ["FieldPulse", "CarePulse"]
 */
export type CarePulse = FieldPulse & {
  __typename?: 'CarePulse'
  content: Scalars['String']['output']
  context: Array<FieldContext>
  /** @deprecated Please use field "aggregate" inside "contextConnection" instead */
  contextAggregate?: Maybe<CarePulseFieldContextContextAggregationSelection>
  contextConnection: FieldPulseContextConnection
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  /** @deprecated Please use field "aggregate" inside "createdByConnection" instead */
  createdByAggregate?: Maybe<CarePulsePersonCreatedByAggregationSelection>
  createdByConnection: FieldPulseCreatedByConnection
  id: Scalars['ID']['output']
  intensity?: Maybe<Scalars['Float']['output']>
  sourceType?: Maybe<Scalars['String']['output']>
  title: Scalars['String']['output']
}

/**
 * Care or wellness-focused pulse.
 * Multi-label: ["FieldPulse", "CarePulse"]
 */
export type CarePulseContextArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

/**
 * Care or wellness-focused pulse.
 * Multi-label: ["FieldPulse", "CarePulse"]
 */
export type CarePulseContextAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

/**
 * Care or wellness-focused pulse.
 * Multi-label: ["FieldPulse", "CarePulse"]
 */
export type CarePulseContextConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseContextConnectionSort>>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

/**
 * Care or wellness-focused pulse.
 * Multi-label: ["FieldPulse", "CarePulse"]
 */
export type CarePulseCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

/**
 * Care or wellness-focused pulse.
 * Multi-label: ["FieldPulse", "CarePulse"]
 */
export type CarePulseCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

/**
 * Care or wellness-focused pulse.
 * Multi-label: ["FieldPulse", "CarePulse"]
 */
export type CarePulseCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseCreatedByConnectionSort>>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
}

export type CarePulseAggregate = {
  __typename?: 'CarePulseAggregate'
  count: Count
  node: CarePulseAggregateNode
}

export type CarePulseAggregateNode = {
  __typename?: 'CarePulseAggregateNode'
  content: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  sourceType: StringAggregateSelection
  title: StringAggregateSelection
}

export type CarePulseAggregateSelection = {
  __typename?: 'CarePulseAggregateSelection'
  content: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  sourceType: StringAggregateSelection
  title: StringAggregateSelection
}

export type CarePulseContextAggregateInput = {
  AND?: InputMaybe<Array<CarePulseContextAggregateInput>>
  NOT?: InputMaybe<CarePulseContextAggregateInput>
  OR?: InputMaybe<Array<CarePulseContextAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CarePulseContextNodeAggregationWhereInput>
}

export type CarePulseContextConnectFieldInput = {
  connect?: InputMaybe<Array<FieldContextConnectInput>>
  where?: InputMaybe<FieldContextConnectWhere>
}

export type CarePulseContextCreateFieldInput = {
  node: FieldContextCreateInput
}

export type CarePulseContextFieldInput = {
  connect?: InputMaybe<Array<CarePulseContextConnectFieldInput>>
  create?: InputMaybe<Array<CarePulseContextCreateFieldInput>>
}

export type CarePulseContextNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CarePulseContextNodeAggregationWhereInput>>
  NOT?: InputMaybe<CarePulseContextNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CarePulseContextNodeAggregationWhereInput>>
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

export type CarePulseContextUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

export type CarePulseContextUpdateFieldInput = {
  connect?: InputMaybe<Array<CarePulseContextConnectFieldInput>>
  create?: InputMaybe<Array<CarePulseContextCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseContextDisconnectFieldInput>>
  update?: InputMaybe<CarePulseContextUpdateConnectionInput>
}

export type CarePulseCreateInput = {
  content: Scalars['String']['input']
  context?: InputMaybe<CarePulseContextFieldInput>
  createdAt: Scalars['DateTime']['input']
  createdBy?: InputMaybe<CarePulseCreatedByFieldInput>
  intensity?: InputMaybe<Scalars['Float']['input']>
  sourceType?: InputMaybe<Scalars['String']['input']>
  title: Scalars['String']['input']
}

export type CarePulseCreatedByAggregateInput = {
  AND?: InputMaybe<Array<CarePulseCreatedByAggregateInput>>
  NOT?: InputMaybe<CarePulseCreatedByAggregateInput>
  OR?: InputMaybe<Array<CarePulseCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CarePulseCreatedByNodeAggregationWhereInput>
}

export type CarePulseCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type CarePulseCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type CarePulseCreatedByFieldInput = {
  connect?: InputMaybe<Array<CarePulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<CarePulseCreatedByCreateFieldInput>>
}

export type CarePulseCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CarePulseCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<CarePulseCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CarePulseCreatedByNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CarePulseCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
}

export type CarePulseCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<CarePulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<CarePulseCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseCreatedByDisconnectFieldInput>>
  update?: InputMaybe<CarePulseCreatedByUpdateConnectionInput>
}

export type CarePulseDeleteInput = {
  context?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  createdBy?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
}

export type CarePulseEdge = {
  __typename?: 'CarePulseEdge'
  cursor: Scalars['String']['output']
  node: CarePulse
}

export type CarePulseFieldContextContextAggregationSelection = {
  __typename?: 'CarePulseFieldContextContextAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CarePulseFieldContextContextNodeAggregateSelection>
}

export type CarePulseFieldContextContextNodeAggregateSelection = {
  __typename?: 'CarePulseFieldContextContextNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  emergentName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  title: StringAggregateSelection
}

export type CarePulsePersonCreatedByAggregationSelection = {
  __typename?: 'CarePulsePersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CarePulsePersonCreatedByNodeAggregateSelection>
}

export type CarePulsePersonCreatedByNodeAggregateSelection = {
  __typename?: 'CarePulsePersonCreatedByNodeAggregateSelection'
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
}

/** Fields to sort CarePulses by. The order in which sorts are applied is not guaranteed when specifying many fields in one CarePulseSort object. */
export type CarePulseSort = {
  content?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  intensity?: InputMaybe<SortDirection>
  sourceType?: InputMaybe<SortDirection>
  title?: InputMaybe<SortDirection>
}

export type CarePulseUpdateInput = {
  content_SET?: InputMaybe<Scalars['String']['input']>
  context?: InputMaybe<Array<CarePulseContextUpdateFieldInput>>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  createdBy?: InputMaybe<Array<CarePulseCreatedByUpdateFieldInput>>
  intensity_ADD?: InputMaybe<Scalars['Float']['input']>
  intensity_DIVIDE?: InputMaybe<Scalars['Float']['input']>
  intensity_MULTIPLY?: InputMaybe<Scalars['Float']['input']>
  intensity_SET?: InputMaybe<Scalars['Float']['input']>
  intensity_SUBTRACT?: InputMaybe<Scalars['Float']['input']>
  sourceType_SET?: InputMaybe<Scalars['String']['input']>
  title_SET?: InputMaybe<Scalars['String']['input']>
}

export type CarePulseWhere = {
  AND?: InputMaybe<Array<CarePulseWhere>>
  NOT?: InputMaybe<CarePulseWhere>
  OR?: InputMaybe<Array<CarePulseWhere>>
  content_CONTAINS?: InputMaybe<Scalars['String']['input']>
  content_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  content_EQ?: InputMaybe<Scalars['String']['input']>
  content_IN?: InputMaybe<Array<Scalars['String']['input']>>
  content_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  contextAggregate?: InputMaybe<CarePulseContextAggregateInput>
  /** Return CarePulses where all of the related FieldPulseContextConnections match this filter */
  contextConnection_ALL?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return CarePulses where none of the related FieldPulseContextConnections match this filter */
  contextConnection_NONE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return CarePulses where one of the related FieldPulseContextConnections match this filter */
  contextConnection_SINGLE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return CarePulses where some of the related FieldPulseContextConnections match this filter */
  contextConnection_SOME?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return CarePulses where all of the related FieldContexts match this filter */
  context_ALL?: InputMaybe<FieldContextWhere>
  /** Return CarePulses where none of the related FieldContexts match this filter */
  context_NONE?: InputMaybe<FieldContextWhere>
  /** Return CarePulses where one of the related FieldContexts match this filter */
  context_SINGLE?: InputMaybe<FieldContextWhere>
  /** Return CarePulses where some of the related FieldContexts match this filter */
  context_SOME?: InputMaybe<FieldContextWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdByAggregate?: InputMaybe<CarePulseCreatedByAggregateInput>
  /** Return CarePulses where all of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return CarePulses where none of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return CarePulses where one of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return CarePulses where some of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return CarePulses where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return CarePulses where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return CarePulses where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return CarePulses where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
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
  sourceType_CONTAINS?: InputMaybe<Scalars['String']['input']>
  sourceType_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  sourceType_EQ?: InputMaybe<Scalars['String']['input']>
  sourceType_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  sourceType_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  title_CONTAINS?: InputMaybe<Scalars['String']['input']>
  title_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  title_EQ?: InputMaybe<Scalars['String']['input']>
  title_IN?: InputMaybe<Array<Scalars['String']['input']>>
  title_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type CarePulsesConnection = {
  __typename?: 'CarePulsesConnection'
  aggregate: CarePulseAggregate
  edges: Array<CarePulseEdge>
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
  connect?: InputMaybe<SpaceConnectInput>
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
  delete?: InputMaybe<SpaceDeleteInput>
  where?: InputMaybe<CommunityOwnsSpacesConnectionWhere>
}

export type CommunityOwnsSpacesDisconnectFieldInput = {
  disconnect?: InputMaybe<SpaceDisconnectInput>
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

/**
 * Core value or principle-focused pulse.
 * Multi-label: ["FieldPulse", "CoreValuePulse"]
 */
export type CoreValuePulse = FieldPulse & {
  __typename?: 'CoreValuePulse'
  content: Scalars['String']['output']
  context: Array<FieldContext>
  /** @deprecated Please use field "aggregate" inside "contextConnection" instead */
  contextAggregate?: Maybe<CoreValuePulseFieldContextContextAggregationSelection>
  contextConnection: FieldPulseContextConnection
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  /** @deprecated Please use field "aggregate" inside "createdByConnection" instead */
  createdByAggregate?: Maybe<CoreValuePulsePersonCreatedByAggregationSelection>
  createdByConnection: FieldPulseCreatedByConnection
  id: Scalars['ID']['output']
  intensity?: Maybe<Scalars['Float']['output']>
  title: Scalars['String']['output']
}

/**
 * Core value or principle-focused pulse.
 * Multi-label: ["FieldPulse", "CoreValuePulse"]
 */
export type CoreValuePulseContextArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

/**
 * Core value or principle-focused pulse.
 * Multi-label: ["FieldPulse", "CoreValuePulse"]
 */
export type CoreValuePulseContextAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

/**
 * Core value or principle-focused pulse.
 * Multi-label: ["FieldPulse", "CoreValuePulse"]
 */
export type CoreValuePulseContextConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseContextConnectionSort>>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

/**
 * Core value or principle-focused pulse.
 * Multi-label: ["FieldPulse", "CoreValuePulse"]
 */
export type CoreValuePulseCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

/**
 * Core value or principle-focused pulse.
 * Multi-label: ["FieldPulse", "CoreValuePulse"]
 */
export type CoreValuePulseCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

/**
 * Core value or principle-focused pulse.
 * Multi-label: ["FieldPulse", "CoreValuePulse"]
 */
export type CoreValuePulseCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseCreatedByConnectionSort>>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
}

export type CoreValuePulseAggregate = {
  __typename?: 'CoreValuePulseAggregate'
  count: Count
  node: CoreValuePulseAggregateNode
}

export type CoreValuePulseAggregateNode = {
  __typename?: 'CoreValuePulseAggregateNode'
  content: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type CoreValuePulseAggregateSelection = {
  __typename?: 'CoreValuePulseAggregateSelection'
  content: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  intensity: FloatAggregateSelection
  title: StringAggregateSelection
}

export type CoreValuePulseContextAggregateInput = {
  AND?: InputMaybe<Array<CoreValuePulseContextAggregateInput>>
  NOT?: InputMaybe<CoreValuePulseContextAggregateInput>
  OR?: InputMaybe<Array<CoreValuePulseContextAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CoreValuePulseContextNodeAggregationWhereInput>
}

export type CoreValuePulseContextConnectFieldInput = {
  connect?: InputMaybe<Array<FieldContextConnectInput>>
  where?: InputMaybe<FieldContextConnectWhere>
}

export type CoreValuePulseContextCreateFieldInput = {
  node: FieldContextCreateInput
}

export type CoreValuePulseContextFieldInput = {
  connect?: InputMaybe<Array<CoreValuePulseContextConnectFieldInput>>
  create?: InputMaybe<Array<CoreValuePulseContextCreateFieldInput>>
}

export type CoreValuePulseContextNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CoreValuePulseContextNodeAggregationWhereInput>>
  NOT?: InputMaybe<CoreValuePulseContextNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CoreValuePulseContextNodeAggregationWhereInput>>
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

export type CoreValuePulseContextUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<FieldPulseContextConnectionWhere>
}

export type CoreValuePulseContextUpdateFieldInput = {
  connect?: InputMaybe<Array<CoreValuePulseContextConnectFieldInput>>
  create?: InputMaybe<Array<CoreValuePulseContextCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseContextDisconnectFieldInput>>
  update?: InputMaybe<CoreValuePulseContextUpdateConnectionInput>
}

export type CoreValuePulseCreateInput = {
  content: Scalars['String']['input']
  context?: InputMaybe<CoreValuePulseContextFieldInput>
  createdAt: Scalars['DateTime']['input']
  createdBy?: InputMaybe<CoreValuePulseCreatedByFieldInput>
  intensity?: InputMaybe<Scalars['Float']['input']>
  title: Scalars['String']['input']
}

export type CoreValuePulseCreatedByAggregateInput = {
  AND?: InputMaybe<Array<CoreValuePulseCreatedByAggregateInput>>
  NOT?: InputMaybe<CoreValuePulseCreatedByAggregateInput>
  OR?: InputMaybe<Array<CoreValuePulseCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CoreValuePulseCreatedByNodeAggregationWhereInput>
}

export type CoreValuePulseCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type CoreValuePulseCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type CoreValuePulseCreatedByFieldInput = {
  connect?: InputMaybe<Array<CoreValuePulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<CoreValuePulseCreatedByCreateFieldInput>>
}

export type CoreValuePulseCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CoreValuePulseCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<CoreValuePulseCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CoreValuePulseCreatedByNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CoreValuePulseCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
}

export type CoreValuePulseCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<CoreValuePulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<CoreValuePulseCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseCreatedByDisconnectFieldInput>>
  update?: InputMaybe<CoreValuePulseCreatedByUpdateConnectionInput>
}

export type CoreValuePulseDeleteInput = {
  context?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  createdBy?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
}

export type CoreValuePulseEdge = {
  __typename?: 'CoreValuePulseEdge'
  cursor: Scalars['String']['output']
  node: CoreValuePulse
}

export type CoreValuePulseFieldContextContextAggregationSelection = {
  __typename?: 'CoreValuePulseFieldContextContextAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CoreValuePulseFieldContextContextNodeAggregateSelection>
}

export type CoreValuePulseFieldContextContextNodeAggregateSelection = {
  __typename?: 'CoreValuePulseFieldContextContextNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  emergentName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  title: StringAggregateSelection
}

export type CoreValuePulsePersonCreatedByAggregationSelection = {
  __typename?: 'CoreValuePulsePersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CoreValuePulsePersonCreatedByNodeAggregateSelection>
}

export type CoreValuePulsePersonCreatedByNodeAggregateSelection = {
  __typename?: 'CoreValuePulsePersonCreatedByNodeAggregateSelection'
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
}

/** Fields to sort CoreValuePulses by. The order in which sorts are applied is not guaranteed when specifying many fields in one CoreValuePulseSort object. */
export type CoreValuePulseSort = {
  content?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  intensity?: InputMaybe<SortDirection>
  title?: InputMaybe<SortDirection>
}

export type CoreValuePulseUpdateInput = {
  content_SET?: InputMaybe<Scalars['String']['input']>
  context?: InputMaybe<Array<CoreValuePulseContextUpdateFieldInput>>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  createdBy?: InputMaybe<Array<CoreValuePulseCreatedByUpdateFieldInput>>
  intensity_ADD?: InputMaybe<Scalars['Float']['input']>
  intensity_DIVIDE?: InputMaybe<Scalars['Float']['input']>
  intensity_MULTIPLY?: InputMaybe<Scalars['Float']['input']>
  intensity_SET?: InputMaybe<Scalars['Float']['input']>
  intensity_SUBTRACT?: InputMaybe<Scalars['Float']['input']>
  title_SET?: InputMaybe<Scalars['String']['input']>
}

export type CoreValuePulseWhere = {
  AND?: InputMaybe<Array<CoreValuePulseWhere>>
  NOT?: InputMaybe<CoreValuePulseWhere>
  OR?: InputMaybe<Array<CoreValuePulseWhere>>
  content_CONTAINS?: InputMaybe<Scalars['String']['input']>
  content_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  content_EQ?: InputMaybe<Scalars['String']['input']>
  content_IN?: InputMaybe<Array<Scalars['String']['input']>>
  content_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  contextAggregate?: InputMaybe<CoreValuePulseContextAggregateInput>
  /** Return CoreValuePulses where all of the related FieldPulseContextConnections match this filter */
  contextConnection_ALL?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return CoreValuePulses where none of the related FieldPulseContextConnections match this filter */
  contextConnection_NONE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return CoreValuePulses where one of the related FieldPulseContextConnections match this filter */
  contextConnection_SINGLE?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return CoreValuePulses where some of the related FieldPulseContextConnections match this filter */
  contextConnection_SOME?: InputMaybe<FieldPulseContextConnectionWhere>
  /** Return CoreValuePulses where all of the related FieldContexts match this filter */
  context_ALL?: InputMaybe<FieldContextWhere>
  /** Return CoreValuePulses where none of the related FieldContexts match this filter */
  context_NONE?: InputMaybe<FieldContextWhere>
  /** Return CoreValuePulses where one of the related FieldContexts match this filter */
  context_SINGLE?: InputMaybe<FieldContextWhere>
  /** Return CoreValuePulses where some of the related FieldContexts match this filter */
  context_SOME?: InputMaybe<FieldContextWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdByAggregate?: InputMaybe<CoreValuePulseCreatedByAggregateInput>
  /** Return CoreValuePulses where all of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return CoreValuePulses where none of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return CoreValuePulses where one of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return CoreValuePulses where some of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return CoreValuePulses where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return CoreValuePulses where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return CoreValuePulses where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return CoreValuePulses where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
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
}

export type CoreValuePulsesConnection = {
  __typename?: 'CoreValuePulsesConnection'
  aggregate: CoreValuePulseAggregate
  edges: Array<CoreValuePulseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
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

export type CreateCarePulsesMutationResponse = {
  __typename?: 'CreateCarePulsesMutationResponse'
  carePulses: Array<CarePulse>
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

export type CreateCoreValuePulsesMutationResponse = {
  __typename?: 'CreateCoreValuePulsesMutationResponse'
  coreValuePulses: Array<CoreValuePulse>
  info: CreateInfo
}

export type CreateFieldContextsMutationResponse = {
  __typename?: 'CreateFieldContextsMutationResponse'
  fieldContexts: Array<FieldContext>
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

export type CreateUpdateUserAiResponsesMutationResponse = {
  __typename?: 'CreateUpdateUserAiResponsesMutationResponse'
  info: CreateInfo
  updateUserAiResponses: Array<UpdateUserAiResponse>
}

export type CreateUsersMutationResponse = {
  __typename?: 'CreateUsersMutationResponse'
  info: CreateInfo
  users: Array<User>
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
  createdBy: Array<Person>
  /** @deprecated Please use field "aggregate" inside "createdByConnection" instead */
  createdByAggregate?: Maybe<FieldContextPersonCreatedByAggregationSelection>
  createdByConnection: FieldContextCreatedByConnection
  emergentName?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  meSpace: Array<MeSpace>
  /** @deprecated Please use field "aggregate" inside "meSpaceConnection" instead */
  meSpaceAggregate?: Maybe<FieldContextMeSpaceMeSpaceAggregationSelection>
  meSpaceConnection: FieldContextMeSpaceConnection
  owner: Array<Person>
  pulses: Array<FieldPulse>
  /** @deprecated Please use field "aggregate" inside "pulsesConnection" instead */
  pulsesAggregate?: Maybe<FieldContextFieldPulsePulsesAggregationSelection>
  pulsesConnection: FieldContextPulsesConnection
  resonances: Array<ResonanceLink>
  /** @deprecated Please use field "aggregate" inside "resonancesConnection" instead */
  resonancesAggregate?: Maybe<FieldContextResonanceLinkResonancesAggregationSelection>
  resonancesConnection: FieldContextResonancesConnection
  space: Array<Space>
  title: Scalars['String']['output']
  weSpace: Array<WeSpace>
  /** @deprecated Please use field "aggregate" inside "weSpaceConnection" instead */
  weSpaceAggregate?: Maybe<FieldContextWeSpaceWeSpaceAggregationSelection>
  weSpaceConnection: FieldContextWeSpaceConnection
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextCreatedByConnectionSort>>
  where?: InputMaybe<FieldContextCreatedByConnectionWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextMeSpaceArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MeSpaceSort>>
  where?: InputMaybe<MeSpaceWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextMeSpaceAggregateArgs = {
  where?: InputMaybe<MeSpaceWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextMeSpaceConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextMeSpaceConnectionSort>>
  where?: InputMaybe<FieldContextMeSpaceConnectionWhere>
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
export type FieldContextResonancesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResonanceLinkSort>>
  where?: InputMaybe<ResonanceLinkWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextResonancesAggregateArgs = {
  where?: InputMaybe<ResonanceLinkWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextResonancesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextResonancesConnectionSort>>
  where?: InputMaybe<FieldContextResonancesConnectionWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextWeSpaceArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<WeSpaceSort>>
  where?: InputMaybe<WeSpaceWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextWeSpaceAggregateArgs = {
  where?: InputMaybe<WeSpaceWhere>
}

/**
 * A thematic or temporal container inside a Space.
 * Groups related pulses together.
 * Label: ["FieldContext"]
 */
export type FieldContextWeSpaceConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextWeSpaceConnectionSort>>
  where?: InputMaybe<FieldContextWeSpaceConnectionWhere>
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
  createdBy?: InputMaybe<Array<FieldContextCreatedByConnectFieldInput>>
  meSpace?: InputMaybe<Array<FieldContextMeSpaceConnectFieldInput>>
  pulses?: InputMaybe<Array<FieldContextPulsesConnectFieldInput>>
  resonances?: InputMaybe<Array<FieldContextResonancesConnectFieldInput>>
  weSpace?: InputMaybe<Array<FieldContextWeSpaceConnectFieldInput>>
}

export type FieldContextConnectWhere = {
  node: FieldContextWhere
}

export type FieldContextCreateInput = {
  createdAt: Scalars['DateTime']['input']
  createdBy?: InputMaybe<FieldContextCreatedByFieldInput>
  emergentName?: InputMaybe<Scalars['String']['input']>
  meSpace?: InputMaybe<FieldContextMeSpaceFieldInput>
  pulses?: InputMaybe<FieldContextPulsesFieldInput>
  resonances?: InputMaybe<FieldContextResonancesFieldInput>
  title: Scalars['String']['input']
  weSpace?: InputMaybe<FieldContextWeSpaceFieldInput>
}

export type FieldContextCreatedByAggregateInput = {
  AND?: InputMaybe<Array<FieldContextCreatedByAggregateInput>>
  NOT?: InputMaybe<FieldContextCreatedByAggregateInput>
  OR?: InputMaybe<Array<FieldContextCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<FieldContextCreatedByNodeAggregationWhereInput>
}

export type FieldContextCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type FieldContextCreatedByConnection = {
  __typename?: 'FieldContextCreatedByConnection'
  aggregate: FieldContextPersonCreatedByAggregateSelection
  edges: Array<FieldContextCreatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type FieldContextCreatedByConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type FieldContextCreatedByConnectionWhere = {
  AND?: InputMaybe<Array<FieldContextCreatedByConnectionWhere>>
  NOT?: InputMaybe<FieldContextCreatedByConnectionWhere>
  OR?: InputMaybe<Array<FieldContextCreatedByConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type FieldContextCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type FieldContextCreatedByDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<FieldContextCreatedByConnectionWhere>
}

export type FieldContextCreatedByDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<FieldContextCreatedByConnectionWhere>
}

export type FieldContextCreatedByFieldInput = {
  connect?: InputMaybe<Array<FieldContextCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextCreatedByCreateFieldInput>>
}

export type FieldContextCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<FieldContextCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<FieldContextCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<FieldContextCreatedByNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type FieldContextCreatedByRelationship = {
  __typename?: 'FieldContextCreatedByRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type FieldContextCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<FieldContextCreatedByConnectionWhere>
}

export type FieldContextCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<FieldContextCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<FieldContextCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldContextCreatedByDisconnectFieldInput>>
  update?: InputMaybe<FieldContextCreatedByUpdateConnectionInput>
}

export type FieldContextDeleteInput = {
  createdBy?: InputMaybe<Array<FieldContextCreatedByDeleteFieldInput>>
  meSpace?: InputMaybe<Array<FieldContextMeSpaceDeleteFieldInput>>
  pulses?: InputMaybe<Array<FieldContextPulsesDeleteFieldInput>>
  resonances?: InputMaybe<Array<FieldContextResonancesDeleteFieldInput>>
  weSpace?: InputMaybe<Array<FieldContextWeSpaceDeleteFieldInput>>
}

export type FieldContextDisconnectInput = {
  createdBy?: InputMaybe<Array<FieldContextCreatedByDisconnectFieldInput>>
  meSpace?: InputMaybe<Array<FieldContextMeSpaceDisconnectFieldInput>>
  pulses?: InputMaybe<Array<FieldContextPulsesDisconnectFieldInput>>
  resonances?: InputMaybe<Array<FieldContextResonancesDisconnectFieldInput>>
  weSpace?: InputMaybe<Array<FieldContextWeSpaceDisconnectFieldInput>>
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

export type FieldContextMeSpaceAggregateInput = {
  AND?: InputMaybe<Array<FieldContextMeSpaceAggregateInput>>
  NOT?: InputMaybe<FieldContextMeSpaceAggregateInput>
  OR?: InputMaybe<Array<FieldContextMeSpaceAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<FieldContextMeSpaceNodeAggregationWhereInput>
}

export type FieldContextMeSpaceConnectFieldInput = {
  connect?: InputMaybe<Array<MeSpaceConnectInput>>
  where?: InputMaybe<MeSpaceConnectWhere>
}

export type FieldContextMeSpaceConnection = {
  __typename?: 'FieldContextMeSpaceConnection'
  aggregate: FieldContextMeSpaceMeSpaceAggregateSelection
  edges: Array<FieldContextMeSpaceRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type FieldContextMeSpaceConnectionSort = {
  node?: InputMaybe<MeSpaceSort>
}

export type FieldContextMeSpaceConnectionWhere = {
  AND?: InputMaybe<Array<FieldContextMeSpaceConnectionWhere>>
  NOT?: InputMaybe<FieldContextMeSpaceConnectionWhere>
  OR?: InputMaybe<Array<FieldContextMeSpaceConnectionWhere>>
  node?: InputMaybe<MeSpaceWhere>
}

export type FieldContextMeSpaceCreateFieldInput = {
  node: MeSpaceCreateInput
}

export type FieldContextMeSpaceDeleteFieldInput = {
  delete?: InputMaybe<MeSpaceDeleteInput>
  where?: InputMaybe<FieldContextMeSpaceConnectionWhere>
}

export type FieldContextMeSpaceDisconnectFieldInput = {
  disconnect?: InputMaybe<MeSpaceDisconnectInput>
  where?: InputMaybe<FieldContextMeSpaceConnectionWhere>
}

export type FieldContextMeSpaceFieldInput = {
  connect?: InputMaybe<Array<FieldContextMeSpaceConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextMeSpaceCreateFieldInput>>
}

export type FieldContextMeSpaceMeSpaceAggregateSelection = {
  __typename?: 'FieldContextMeSpaceMeSpaceAggregateSelection'
  count: CountConnection
  node?: Maybe<FieldContextMeSpaceMeSpaceNodeAggregateSelection>
}

export type FieldContextMeSpaceMeSpaceAggregationSelection = {
  __typename?: 'FieldContextMeSpaceMeSpaceAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<FieldContextMeSpaceMeSpaceNodeAggregateSelection>
}

export type FieldContextMeSpaceMeSpaceNodeAggregateSelection = {
  __typename?: 'FieldContextMeSpaceMeSpaceNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type FieldContextMeSpaceNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<FieldContextMeSpaceNodeAggregationWhereInput>>
  NOT?: InputMaybe<FieldContextMeSpaceNodeAggregationWhereInput>
  OR?: InputMaybe<Array<FieldContextMeSpaceNodeAggregationWhereInput>>
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

export type FieldContextMeSpaceRelationship = {
  __typename?: 'FieldContextMeSpaceRelationship'
  cursor: Scalars['String']['output']
  node: MeSpace
}

export type FieldContextMeSpaceUpdateConnectionInput = {
  node?: InputMaybe<MeSpaceUpdateInput>
  where?: InputMaybe<FieldContextMeSpaceConnectionWhere>
}

export type FieldContextMeSpaceUpdateFieldInput = {
  connect?: InputMaybe<Array<FieldContextMeSpaceConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextMeSpaceCreateFieldInput>>
  delete?: InputMaybe<Array<FieldContextMeSpaceDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldContextMeSpaceDisconnectFieldInput>>
  update?: InputMaybe<FieldContextMeSpaceUpdateConnectionInput>
}

export type FieldContextPersonCreatedByAggregateSelection = {
  __typename?: 'FieldContextPersonCreatedByAggregateSelection'
  count: CountConnection
  node?: Maybe<FieldContextPersonCreatedByNodeAggregateSelection>
}

export type FieldContextPersonCreatedByAggregationSelection = {
  __typename?: 'FieldContextPersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<FieldContextPersonCreatedByNodeAggregateSelection>
}

export type FieldContextPersonCreatedByNodeAggregateSelection = {
  __typename?: 'FieldContextPersonCreatedByNodeAggregateSelection'
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
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

export type FieldContextResonanceLinkResonancesAggregateSelection = {
  __typename?: 'FieldContextResonanceLinkResonancesAggregateSelection'
  count: CountConnection
  node?: Maybe<FieldContextResonanceLinkResonancesNodeAggregateSelection>
}

export type FieldContextResonanceLinkResonancesAggregationSelection = {
  __typename?: 'FieldContextResonanceLinkResonancesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<FieldContextResonanceLinkResonancesNodeAggregateSelection>
}

export type FieldContextResonanceLinkResonancesNodeAggregateSelection = {
  __typename?: 'FieldContextResonanceLinkResonancesNodeAggregateSelection'
  confidence: FloatAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  evidence: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  label: StringAggregateSelection
  mergedFrom: StringAggregateSelection
}

export type FieldContextResonancesAggregateInput = {
  AND?: InputMaybe<Array<FieldContextResonancesAggregateInput>>
  NOT?: InputMaybe<FieldContextResonancesAggregateInput>
  OR?: InputMaybe<Array<FieldContextResonancesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<FieldContextResonancesNodeAggregationWhereInput>
}

export type FieldContextResonancesConnectFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkConnectInput>>
  where?: InputMaybe<ResonanceLinkConnectWhere>
}

export type FieldContextResonancesConnection = {
  __typename?: 'FieldContextResonancesConnection'
  aggregate: FieldContextResonanceLinkResonancesAggregateSelection
  edges: Array<FieldContextResonancesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type FieldContextResonancesConnectionSort = {
  node?: InputMaybe<ResonanceLinkSort>
}

export type FieldContextResonancesConnectionWhere = {
  AND?: InputMaybe<Array<FieldContextResonancesConnectionWhere>>
  NOT?: InputMaybe<FieldContextResonancesConnectionWhere>
  OR?: InputMaybe<Array<FieldContextResonancesConnectionWhere>>
  node?: InputMaybe<ResonanceLinkWhere>
}

export type FieldContextResonancesCreateFieldInput = {
  node: ResonanceLinkCreateInput
}

export type FieldContextResonancesDeleteFieldInput = {
  delete?: InputMaybe<ResonanceLinkDeleteInput>
  where?: InputMaybe<FieldContextResonancesConnectionWhere>
}

export type FieldContextResonancesDisconnectFieldInput = {
  disconnect?: InputMaybe<ResonanceLinkDisconnectInput>
  where?: InputMaybe<FieldContextResonancesConnectionWhere>
}

export type FieldContextResonancesFieldInput = {
  connect?: InputMaybe<Array<FieldContextResonancesConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextResonancesCreateFieldInput>>
}

export type FieldContextResonancesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<FieldContextResonancesNodeAggregationWhereInput>>
  NOT?: InputMaybe<FieldContextResonancesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<FieldContextResonancesNodeAggregationWhereInput>>
  confidence_AVERAGE_EQUAL?: InputMaybe<Scalars['Float']['input']>
  confidence_AVERAGE_GT?: InputMaybe<Scalars['Float']['input']>
  confidence_AVERAGE_GTE?: InputMaybe<Scalars['Float']['input']>
  confidence_AVERAGE_LT?: InputMaybe<Scalars['Float']['input']>
  confidence_AVERAGE_LTE?: InputMaybe<Scalars['Float']['input']>
  confidence_MAX_EQUAL?: InputMaybe<Scalars['Float']['input']>
  confidence_MAX_GT?: InputMaybe<Scalars['Float']['input']>
  confidence_MAX_GTE?: InputMaybe<Scalars['Float']['input']>
  confidence_MAX_LT?: InputMaybe<Scalars['Float']['input']>
  confidence_MAX_LTE?: InputMaybe<Scalars['Float']['input']>
  confidence_MIN_EQUAL?: InputMaybe<Scalars['Float']['input']>
  confidence_MIN_GT?: InputMaybe<Scalars['Float']['input']>
  confidence_MIN_GTE?: InputMaybe<Scalars['Float']['input']>
  confidence_MIN_LT?: InputMaybe<Scalars['Float']['input']>
  confidence_MIN_LTE?: InputMaybe<Scalars['Float']['input']>
  confidence_SUM_EQUAL?: InputMaybe<Scalars['Float']['input']>
  confidence_SUM_GT?: InputMaybe<Scalars['Float']['input']>
  confidence_SUM_GTE?: InputMaybe<Scalars['Float']['input']>
  confidence_SUM_LT?: InputMaybe<Scalars['Float']['input']>
  confidence_SUM_LTE?: InputMaybe<Scalars['Float']['input']>
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
  evidence_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  evidence_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  evidence_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  evidence_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  evidence_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  evidence_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  evidence_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  evidence_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  evidence_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  evidence_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  evidence_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  evidence_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  evidence_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  evidence_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  evidence_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  mergedFrom_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  mergedFrom_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  mergedFrom_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  mergedFrom_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  mergedFrom_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  mergedFrom_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  mergedFrom_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  mergedFrom_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  mergedFrom_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  mergedFrom_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  mergedFrom_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  mergedFrom_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  mergedFrom_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  mergedFrom_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  mergedFrom_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type FieldContextResonancesRelationship = {
  __typename?: 'FieldContextResonancesRelationship'
  cursor: Scalars['String']['output']
  node: ResonanceLink
}

export type FieldContextResonancesUpdateConnectionInput = {
  node?: InputMaybe<ResonanceLinkUpdateInput>
  where?: InputMaybe<FieldContextResonancesConnectionWhere>
}

export type FieldContextResonancesUpdateFieldInput = {
  connect?: InputMaybe<Array<FieldContextResonancesConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextResonancesCreateFieldInput>>
  delete?: InputMaybe<Array<FieldContextResonancesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldContextResonancesDisconnectFieldInput>>
  update?: InputMaybe<FieldContextResonancesUpdateConnectionInput>
}

/** Fields to sort FieldContexts by. The order in which sorts are applied is not guaranteed when specifying many fields in one FieldContextSort object. */
export type FieldContextSort = {
  createdAt?: InputMaybe<SortDirection>
  emergentName?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  title?: InputMaybe<SortDirection>
}

export type FieldContextUpdateInput = {
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  createdBy?: InputMaybe<Array<FieldContextCreatedByUpdateFieldInput>>
  emergentName_SET?: InputMaybe<Scalars['String']['input']>
  meSpace?: InputMaybe<Array<FieldContextMeSpaceUpdateFieldInput>>
  pulses?: InputMaybe<Array<FieldContextPulsesUpdateFieldInput>>
  resonances?: InputMaybe<Array<FieldContextResonancesUpdateFieldInput>>
  title_SET?: InputMaybe<Scalars['String']['input']>
  weSpace?: InputMaybe<Array<FieldContextWeSpaceUpdateFieldInput>>
}

export type FieldContextWeSpaceAggregateInput = {
  AND?: InputMaybe<Array<FieldContextWeSpaceAggregateInput>>
  NOT?: InputMaybe<FieldContextWeSpaceAggregateInput>
  OR?: InputMaybe<Array<FieldContextWeSpaceAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<FieldContextWeSpaceNodeAggregationWhereInput>
}

export type FieldContextWeSpaceConnectFieldInput = {
  connect?: InputMaybe<Array<WeSpaceConnectInput>>
  where?: InputMaybe<WeSpaceConnectWhere>
}

export type FieldContextWeSpaceConnection = {
  __typename?: 'FieldContextWeSpaceConnection'
  aggregate: FieldContextWeSpaceWeSpaceAggregateSelection
  edges: Array<FieldContextWeSpaceRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type FieldContextWeSpaceConnectionSort = {
  node?: InputMaybe<WeSpaceSort>
}

export type FieldContextWeSpaceConnectionWhere = {
  AND?: InputMaybe<Array<FieldContextWeSpaceConnectionWhere>>
  NOT?: InputMaybe<FieldContextWeSpaceConnectionWhere>
  OR?: InputMaybe<Array<FieldContextWeSpaceConnectionWhere>>
  node?: InputMaybe<WeSpaceWhere>
}

export type FieldContextWeSpaceCreateFieldInput = {
  node: WeSpaceCreateInput
}

export type FieldContextWeSpaceDeleteFieldInput = {
  delete?: InputMaybe<WeSpaceDeleteInput>
  where?: InputMaybe<FieldContextWeSpaceConnectionWhere>
}

export type FieldContextWeSpaceDisconnectFieldInput = {
  disconnect?: InputMaybe<WeSpaceDisconnectInput>
  where?: InputMaybe<FieldContextWeSpaceConnectionWhere>
}

export type FieldContextWeSpaceFieldInput = {
  connect?: InputMaybe<Array<FieldContextWeSpaceConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextWeSpaceCreateFieldInput>>
}

export type FieldContextWeSpaceNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<FieldContextWeSpaceNodeAggregationWhereInput>>
  NOT?: InputMaybe<FieldContextWeSpaceNodeAggregationWhereInput>
  OR?: InputMaybe<Array<FieldContextWeSpaceNodeAggregationWhereInput>>
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

export type FieldContextWeSpaceRelationship = {
  __typename?: 'FieldContextWeSpaceRelationship'
  cursor: Scalars['String']['output']
  node: WeSpace
}

export type FieldContextWeSpaceUpdateConnectionInput = {
  node?: InputMaybe<WeSpaceUpdateInput>
  where?: InputMaybe<FieldContextWeSpaceConnectionWhere>
}

export type FieldContextWeSpaceUpdateFieldInput = {
  connect?: InputMaybe<Array<FieldContextWeSpaceConnectFieldInput>>
  create?: InputMaybe<Array<FieldContextWeSpaceCreateFieldInput>>
  delete?: InputMaybe<Array<FieldContextWeSpaceDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldContextWeSpaceDisconnectFieldInput>>
  update?: InputMaybe<FieldContextWeSpaceUpdateConnectionInput>
}

export type FieldContextWeSpaceWeSpaceAggregateSelection = {
  __typename?: 'FieldContextWeSpaceWeSpaceAggregateSelection'
  count: CountConnection
  node?: Maybe<FieldContextWeSpaceWeSpaceNodeAggregateSelection>
}

export type FieldContextWeSpaceWeSpaceAggregationSelection = {
  __typename?: 'FieldContextWeSpaceWeSpaceAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<FieldContextWeSpaceWeSpaceNodeAggregateSelection>
}

export type FieldContextWeSpaceWeSpaceNodeAggregateSelection = {
  __typename?: 'FieldContextWeSpaceWeSpaceNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
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
  createdByAggregate?: InputMaybe<FieldContextCreatedByAggregateInput>
  /** Return FieldContexts where all of the related FieldContextCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<FieldContextCreatedByConnectionWhere>
  /** Return FieldContexts where none of the related FieldContextCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<FieldContextCreatedByConnectionWhere>
  /** Return FieldContexts where one of the related FieldContextCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<FieldContextCreatedByConnectionWhere>
  /** Return FieldContexts where some of the related FieldContextCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<FieldContextCreatedByConnectionWhere>
  /** Return FieldContexts where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return FieldContexts where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return FieldContexts where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return FieldContexts where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
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
  meSpaceAggregate?: InputMaybe<FieldContextMeSpaceAggregateInput>
  /** Return FieldContexts where all of the related FieldContextMeSpaceConnections match this filter */
  meSpaceConnection_ALL?: InputMaybe<FieldContextMeSpaceConnectionWhere>
  /** Return FieldContexts where none of the related FieldContextMeSpaceConnections match this filter */
  meSpaceConnection_NONE?: InputMaybe<FieldContextMeSpaceConnectionWhere>
  /** Return FieldContexts where one of the related FieldContextMeSpaceConnections match this filter */
  meSpaceConnection_SINGLE?: InputMaybe<FieldContextMeSpaceConnectionWhere>
  /** Return FieldContexts where some of the related FieldContextMeSpaceConnections match this filter */
  meSpaceConnection_SOME?: InputMaybe<FieldContextMeSpaceConnectionWhere>
  /** Return FieldContexts where all of the related MeSpaces match this filter */
  meSpace_ALL?: InputMaybe<MeSpaceWhere>
  /** Return FieldContexts where none of the related MeSpaces match this filter */
  meSpace_NONE?: InputMaybe<MeSpaceWhere>
  /** Return FieldContexts where one of the related MeSpaces match this filter */
  meSpace_SINGLE?: InputMaybe<MeSpaceWhere>
  /** Return FieldContexts where some of the related MeSpaces match this filter */
  meSpace_SOME?: InputMaybe<MeSpaceWhere>
  owner?: InputMaybe<PersonWhere>
  owner_ALL?: InputMaybe<PersonWhere>
  owner_NONE?: InputMaybe<PersonWhere>
  owner_SINGLE?: InputMaybe<PersonWhere>
  owner_SOME?: InputMaybe<PersonWhere>
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
  resonancesAggregate?: InputMaybe<FieldContextResonancesAggregateInput>
  /** Return FieldContexts where all of the related FieldContextResonancesConnections match this filter */
  resonancesConnection_ALL?: InputMaybe<FieldContextResonancesConnectionWhere>
  /** Return FieldContexts where none of the related FieldContextResonancesConnections match this filter */
  resonancesConnection_NONE?: InputMaybe<FieldContextResonancesConnectionWhere>
  /** Return FieldContexts where one of the related FieldContextResonancesConnections match this filter */
  resonancesConnection_SINGLE?: InputMaybe<FieldContextResonancesConnectionWhere>
  /** Return FieldContexts where some of the related FieldContextResonancesConnections match this filter */
  resonancesConnection_SOME?: InputMaybe<FieldContextResonancesConnectionWhere>
  /** Return FieldContexts where all of the related ResonanceLinks match this filter */
  resonances_ALL?: InputMaybe<ResonanceLinkWhere>
  /** Return FieldContexts where none of the related ResonanceLinks match this filter */
  resonances_NONE?: InputMaybe<ResonanceLinkWhere>
  /** Return FieldContexts where one of the related ResonanceLinks match this filter */
  resonances_SINGLE?: InputMaybe<ResonanceLinkWhere>
  /** Return FieldContexts where some of the related ResonanceLinks match this filter */
  resonances_SOME?: InputMaybe<ResonanceLinkWhere>
  title_CONTAINS?: InputMaybe<Scalars['String']['input']>
  title_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  title_EQ?: InputMaybe<Scalars['String']['input']>
  title_IN?: InputMaybe<Array<Scalars['String']['input']>>
  title_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  weSpaceAggregate?: InputMaybe<FieldContextWeSpaceAggregateInput>
  /** Return FieldContexts where all of the related FieldContextWeSpaceConnections match this filter */
  weSpaceConnection_ALL?: InputMaybe<FieldContextWeSpaceConnectionWhere>
  /** Return FieldContexts where none of the related FieldContextWeSpaceConnections match this filter */
  weSpaceConnection_NONE?: InputMaybe<FieldContextWeSpaceConnectionWhere>
  /** Return FieldContexts where one of the related FieldContextWeSpaceConnections match this filter */
  weSpaceConnection_SINGLE?: InputMaybe<FieldContextWeSpaceConnectionWhere>
  /** Return FieldContexts where some of the related FieldContextWeSpaceConnections match this filter */
  weSpaceConnection_SOME?: InputMaybe<FieldContextWeSpaceConnectionWhere>
  /** Return FieldContexts where all of the related WeSpaces match this filter */
  weSpace_ALL?: InputMaybe<WeSpaceWhere>
  /** Return FieldContexts where none of the related WeSpaces match this filter */
  weSpace_NONE?: InputMaybe<WeSpaceWhere>
  /** Return FieldContexts where one of the related WeSpaces match this filter */
  weSpace_SINGLE?: InputMaybe<WeSpaceWhere>
  /** Return FieldContexts where some of the related WeSpaces match this filter */
  weSpace_SOME?: InputMaybe<WeSpaceWhere>
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
  createdBy: Array<Person>
  createdByConnection: FieldPulseCreatedByConnection
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

export type FieldPulseCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type FieldPulseCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseCreatedByConnectionSort>>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
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
  createdBy?: InputMaybe<Array<FieldPulseCreatedByConnectFieldInput>>
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
  CarePulse?: InputMaybe<CarePulseCreateInput>
  CoreValuePulse?: InputMaybe<CoreValuePulseCreateInput>
  GoalPulse?: InputMaybe<GoalPulseCreateInput>
  ResourcePulse?: InputMaybe<ResourcePulseCreateInput>
  StoryPulse?: InputMaybe<StoryPulseCreateInput>
}

export type FieldPulseCreatedByAggregateInput = {
  AND?: InputMaybe<Array<FieldPulseCreatedByAggregateInput>>
  NOT?: InputMaybe<FieldPulseCreatedByAggregateInput>
  OR?: InputMaybe<Array<FieldPulseCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<FieldPulseCreatedByNodeAggregationWhereInput>
}

export type FieldPulseCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type FieldPulseCreatedByConnection = {
  __typename?: 'FieldPulseCreatedByConnection'
  edges: Array<FieldPulseCreatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type FieldPulseCreatedByConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type FieldPulseCreatedByConnectionWhere = {
  AND?: InputMaybe<Array<FieldPulseCreatedByConnectionWhere>>
  NOT?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  OR?: InputMaybe<Array<FieldPulseCreatedByConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type FieldPulseCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type FieldPulseCreatedByDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
}

export type FieldPulseCreatedByDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
}

export type FieldPulseCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<FieldPulseCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<FieldPulseCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<FieldPulseCreatedByNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type FieldPulseCreatedByRelationship = {
  __typename?: 'FieldPulseCreatedByRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type FieldPulseCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
}

export type FieldPulseCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<FieldPulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<FieldPulseCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseCreatedByDisconnectFieldInput>>
  update?: InputMaybe<FieldPulseCreatedByUpdateConnectionInput>
}

export type FieldPulseDeleteInput = {
  context?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  createdBy?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
}

export type FieldPulseDisconnectInput = {
  context?: InputMaybe<Array<FieldPulseContextDisconnectFieldInput>>
  createdBy?: InputMaybe<Array<FieldPulseCreatedByDisconnectFieldInput>>
}

export type FieldPulseEdge = {
  __typename?: 'FieldPulseEdge'
  cursor: Scalars['String']['output']
  node: FieldPulse
}

export enum FieldPulseImplementation {
  CarePulse = 'CarePulse',
  CoreValuePulse = 'CoreValuePulse',
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
  createdBy?: InputMaybe<Array<FieldPulseCreatedByUpdateFieldInput>>
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
  createdByAggregate?: InputMaybe<FieldPulseCreatedByAggregateInput>
  /** Return FieldPulses where all of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return FieldPulses where none of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return FieldPulses where one of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return FieldPulses where some of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return FieldPulses where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return FieldPulses where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return FieldPulses where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return FieldPulses where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
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
  createdBy: Array<Person>
  /** @deprecated Please use field "aggregate" inside "createdByConnection" instead */
  createdByAggregate?: Maybe<GoalPulsePersonCreatedByAggregationSelection>
  createdByConnection: FieldPulseCreatedByConnection
  horizon?: Maybe<GoalHorizon>
  id: Scalars['ID']['output']
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
export type GoalPulseCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

/**
 * A pulse that functions as a goal in its context.
 * Multi-label: ["FieldPulse", "GoalPulse"]
 */
export type GoalPulseCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

/**
 * A pulse that functions as a goal in its context.
 * Multi-label: ["FieldPulse", "GoalPulse"]
 */
export type GoalPulseCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseCreatedByConnectionSort>>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
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
  createdBy?: InputMaybe<GoalPulseCreatedByFieldInput>
  horizon?: InputMaybe<GoalHorizon>
  intensity?: InputMaybe<Scalars['Float']['input']>
  status: GoalStatus
  title: Scalars['String']['input']
}

export type GoalPulseCreatedByAggregateInput = {
  AND?: InputMaybe<Array<GoalPulseCreatedByAggregateInput>>
  NOT?: InputMaybe<GoalPulseCreatedByAggregateInput>
  OR?: InputMaybe<Array<GoalPulseCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GoalPulseCreatedByNodeAggregationWhereInput>
}

export type GoalPulseCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type GoalPulseCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type GoalPulseCreatedByFieldInput = {
  connect?: InputMaybe<Array<GoalPulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<GoalPulseCreatedByCreateFieldInput>>
}

export type GoalPulseCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GoalPulseCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<GoalPulseCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GoalPulseCreatedByNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type GoalPulseCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
}

export type GoalPulseCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalPulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<GoalPulseCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseCreatedByDisconnectFieldInput>>
  update?: InputMaybe<GoalPulseCreatedByUpdateConnectionInput>
}

export type GoalPulseDeleteInput = {
  context?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  createdBy?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
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

export type GoalPulsePersonCreatedByAggregationSelection = {
  __typename?: 'GoalPulsePersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalPulsePersonCreatedByNodeAggregateSelection>
}

export type GoalPulsePersonCreatedByNodeAggregateSelection = {
  __typename?: 'GoalPulsePersonCreatedByNodeAggregateSelection'
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
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
  createdBy?: InputMaybe<Array<GoalPulseCreatedByUpdateFieldInput>>
  horizon_SET?: InputMaybe<GoalHorizon>
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
  createdByAggregate?: InputMaybe<GoalPulseCreatedByAggregateInput>
  /** Return GoalPulses where all of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return GoalPulses where none of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return GoalPulses where one of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return GoalPulses where some of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return GoalPulses where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return GoalPulses where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return GoalPulses where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return GoalPulses where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
  horizon_EQ?: InputMaybe<GoalHorizon>
  horizon_IN?: InputMaybe<Array<InputMaybe<GoalHorizon>>>
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
 * Authorization: Only the owner can view, create, update, or delete a MeSpace.
 */
export type MeSpace = Space & {
  __typename?: 'MeSpace'
  contexts: Array<FieldContext>
  /** @deprecated Please use field "aggregate" inside "contextsConnection" instead */
  contextsAggregate?: Maybe<MeSpaceFieldContextContextsAggregationSelection>
  contextsConnection: SpaceContextsConnection
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  members: Array<SpaceMembership>
  /** @deprecated Please use field "aggregate" inside "membersConnection" instead */
  membersAggregate?: Maybe<MeSpaceSpaceMembershipMembersAggregationSelection>
  membersConnection: SpaceMembersConnection
  name: Scalars['String']['output']
  owner: Array<Person>
  /** @deprecated Please use field "aggregate" inside "ownerConnection" instead */
  ownerAggregate?: Maybe<MeSpacePersonOwnerAggregationSelection>
  ownerConnection: SpaceOwnerConnection
  visibility: SpaceVisibility
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 * Authorization: Only the owner can view, create, update, or delete a MeSpace.
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
 * Authorization: Only the owner can view, create, update, or delete a MeSpace.
 */
export type MeSpaceContextsAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 * Authorization: Only the owner can view, create, update, or delete a MeSpace.
 */
export type MeSpaceContextsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceContextsConnectionSort>>
  where?: InputMaybe<SpaceContextsConnectionWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 * Authorization: Only the owner can view, create, update, or delete a MeSpace.
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
 * Authorization: Only the owner can view, create, update, or delete a MeSpace.
 */
export type MeSpaceMembersAggregateArgs = {
  where?: InputMaybe<SpaceMembershipWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 * Authorization: Only the owner can view, create, update, or delete a MeSpace.
 */
export type MeSpaceMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembersConnectionSort>>
  where?: InputMaybe<SpaceMembersConnectionWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 * Authorization: Only the owner can view, create, update, or delete a MeSpace.
 */
export type MeSpaceOwnerArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 * Authorization: Only the owner can view, create, update, or delete a MeSpace.
 */
export type MeSpaceOwnerAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

/**
 * A personal space owned by one person or community.
 * Can be private (only owner) or shared with specific members.
 * Multi-label: ["Space", "MeSpace"]
 * Authorization: Only the owner can view, create, update, or delete a MeSpace.
 */
export type MeSpaceOwnerConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceOwnerConnectionSort>>
  where?: InputMaybe<SpaceOwnerConnectionWhere>
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

export type MeSpaceConnectInput = {
  contexts?: InputMaybe<Array<MeSpaceContextsConnectFieldInput>>
  members?: InputMaybe<Array<MeSpaceMembersConnectFieldInput>>
  owner?: InputMaybe<Array<MeSpaceOwnerConnectFieldInput>>
}

export type MeSpaceConnectWhere = {
  node: MeSpaceWhere
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

export type MeSpaceContextsCreateFieldInput = {
  node: FieldContextCreateInput
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

export type MeSpaceContextsUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<SpaceContextsConnectionWhere>
}

export type MeSpaceContextsUpdateFieldInput = {
  connect?: InputMaybe<Array<MeSpaceContextsConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceContextsCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceContextsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceContextsDisconnectFieldInput>>
  update?: InputMaybe<MeSpaceContextsUpdateConnectionInput>
}

export type MeSpaceCreateInput = {
  contexts?: InputMaybe<MeSpaceContextsFieldInput>
  createdAt: Scalars['DateTime']['input']
  members?: InputMaybe<MeSpaceMembersFieldInput>
  name: Scalars['String']['input']
  owner?: InputMaybe<MeSpaceOwnerFieldInput>
  visibility: SpaceVisibility
}

export type MeSpaceDeleteInput = {
  contexts?: InputMaybe<Array<SpaceContextsDeleteFieldInput>>
  members?: InputMaybe<Array<SpaceMembersDeleteFieldInput>>
  owner?: InputMaybe<Array<SpaceOwnerDeleteFieldInput>>
}

export type MeSpaceDisconnectInput = {
  contexts?: InputMaybe<Array<SpaceContextsDisconnectFieldInput>>
  members?: InputMaybe<Array<SpaceMembersDisconnectFieldInput>>
  owner?: InputMaybe<Array<SpaceOwnerDisconnectFieldInput>>
}

export type MeSpaceEdge = {
  __typename?: 'MeSpaceEdge'
  cursor: Scalars['String']['output']
  node: MeSpace
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

export type MeSpaceMembersCreateFieldInput = {
  node: SpaceMembershipCreateInput
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

export type MeSpaceMembersUpdateConnectionInput = {
  node?: InputMaybe<SpaceMembershipUpdateInput>
  where?: InputMaybe<SpaceMembersConnectionWhere>
}

export type MeSpaceMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<MeSpaceMembersConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceMembersCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceMembersDisconnectFieldInput>>
  update?: InputMaybe<MeSpaceMembersUpdateConnectionInput>
}

export type MeSpaceOwnerAggregateInput = {
  AND?: InputMaybe<Array<MeSpaceOwnerAggregateInput>>
  NOT?: InputMaybe<MeSpaceOwnerAggregateInput>
  OR?: InputMaybe<Array<MeSpaceOwnerAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MeSpaceOwnerNodeAggregationWhereInput>
}

export type MeSpaceOwnerConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type MeSpaceOwnerCreateFieldInput = {
  node: PersonCreateInput
}

export type MeSpaceOwnerFieldInput = {
  connect?: InputMaybe<Array<MeSpaceOwnerConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceOwnerCreateFieldInput>>
}

export type MeSpaceOwnerNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MeSpaceOwnerNodeAggregationWhereInput>>
  NOT?: InputMaybe<MeSpaceOwnerNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MeSpaceOwnerNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type MeSpaceOwnerUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<SpaceOwnerConnectionWhere>
}

export type MeSpaceOwnerUpdateFieldInput = {
  connect?: InputMaybe<Array<MeSpaceOwnerConnectFieldInput>>
  create?: InputMaybe<Array<MeSpaceOwnerCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceOwnerDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceOwnerDisconnectFieldInput>>
  update?: InputMaybe<MeSpaceOwnerUpdateConnectionInput>
}

export type MeSpacePersonOwnerAggregationSelection = {
  __typename?: 'MeSpacePersonOwnerAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MeSpacePersonOwnerNodeAggregateSelection>
}

export type MeSpacePersonOwnerNodeAggregateSelection = {
  __typename?: 'MeSpacePersonOwnerNodeAggregateSelection'
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
}

/** Fields to sort MeSpaces by. The order in which sorts are applied is not guaranteed when specifying many fields in one MeSpaceSort object. */
export type MeSpaceSort = {
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  visibility?: InputMaybe<SortDirection>
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
  owner?: InputMaybe<Array<MeSpaceOwnerUpdateFieldInput>>
  visibility_SET?: InputMaybe<SpaceVisibility>
}

export type MeSpaceWhere = {
  AND?: InputMaybe<Array<MeSpaceWhere>>
  NOT?: InputMaybe<MeSpaceWhere>
  OR?: InputMaybe<Array<MeSpaceWhere>>
  contextsAggregate?: InputMaybe<MeSpaceContextsAggregateInput>
  /** Return MeSpaces where all of the related SpaceContextsConnections match this filter */
  contextsConnection_ALL?: InputMaybe<SpaceContextsConnectionWhere>
  /** Return MeSpaces where none of the related SpaceContextsConnections match this filter */
  contextsConnection_NONE?: InputMaybe<SpaceContextsConnectionWhere>
  /** Return MeSpaces where one of the related SpaceContextsConnections match this filter */
  contextsConnection_SINGLE?: InputMaybe<SpaceContextsConnectionWhere>
  /** Return MeSpaces where some of the related SpaceContextsConnections match this filter */
  contextsConnection_SOME?: InputMaybe<SpaceContextsConnectionWhere>
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
  /** Return MeSpaces where all of the related SpaceMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<SpaceMembersConnectionWhere>
  /** Return MeSpaces where none of the related SpaceMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<SpaceMembersConnectionWhere>
  /** Return MeSpaces where one of the related SpaceMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<SpaceMembersConnectionWhere>
  /** Return MeSpaces where some of the related SpaceMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<SpaceMembersConnectionWhere>
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
  ownerAggregate?: InputMaybe<MeSpaceOwnerAggregateInput>
  /** Return MeSpaces where all of the related SpaceOwnerConnections match this filter */
  ownerConnection_ALL?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return MeSpaces where none of the related SpaceOwnerConnections match this filter */
  ownerConnection_NONE?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return MeSpaces where one of the related SpaceOwnerConnections match this filter */
  ownerConnection_SINGLE?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return MeSpaces where some of the related SpaceOwnerConnections match this filter */
  ownerConnection_SOME?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return MeSpaces where all of the related People match this filter */
  owner_ALL?: InputMaybe<PersonWhere>
  /** Return MeSpaces where none of the related People match this filter */
  owner_NONE?: InputMaybe<PersonWhere>
  /** Return MeSpaces where one of the related People match this filter */
  owner_SINGLE?: InputMaybe<PersonWhere>
  /** Return MeSpaces where some of the related People match this filter */
  owner_SOME?: InputMaybe<PersonWhere>
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
  createCarePulses: CreateCarePulsesMutationResponse
  createChatbotResponses: CreateChatbotResponsesMutationResponse
  createCommunities: CreateCommunitiesMutationResponse
  createCoreValuePulses: CreateCoreValuePulsesMutationResponse
  createFieldContexts: CreateFieldContextsMutationResponse
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
  createUpdateUserAiResponses: CreateUpdateUserAiResponsesMutationResponse
  createUsers: CreateUsersMutationResponse
  createWeSpaces: CreateWeSpacesMutationResponse
  deleteAddSpaceMemberResponses: DeleteInfo
  deleteCarePulses: DeleteInfo
  deleteChatbotResponses: DeleteInfo
  deleteCommunities: DeleteInfo
  deleteCoreValuePulses: DeleteInfo
  deleteFieldContexts: DeleteInfo
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
  deleteUpdateUserAiResponses: DeleteInfo
  deleteUsers: DeleteInfo
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
  updateCarePulses: UpdateCarePulsesMutationResponse
  updateChatbotResponses: UpdateChatbotResponsesMutationResponse
  updateCommunities: UpdateCommunitiesMutationResponse
  updateCoreValuePulses: UpdateCoreValuePulsesMutationResponse
  updateFieldContexts: UpdateFieldContextsMutationResponse
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
  updateUpdateUserAiResponses: UpdateUpdateUserAiResponsesMutationResponse
  /**
   * Update AI functionality preferences for a user.
   * Users can enable or disable AI features in the application.
   */
  updateUserAI: UpdateUserAiResponse
  updateUsers: UpdateUsersMutationResponse
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

export type MutationCreateCarePulsesArgs = {
  input: Array<CarePulseCreateInput>
}

export type MutationCreateChatbotResponsesArgs = {
  input: Array<ChatbotResponseCreateInput>
}

export type MutationCreateCommunitiesArgs = {
  input: Array<CommunityCreateInput>
}

export type MutationCreateCoreValuePulsesArgs = {
  input: Array<CoreValuePulseCreateInput>
}

export type MutationCreateFieldContextsArgs = {
  input: Array<FieldContextCreateInput>
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

export type MutationCreateUpdateUserAiResponsesArgs = {
  input: Array<UpdateUserAiResponseCreateInput>
}

export type MutationCreateUsersArgs = {
  input: Array<UserCreateInput>
}

export type MutationCreateWeSpacesArgs = {
  input: Array<WeSpaceCreateInput>
}

export type MutationDeleteAddSpaceMemberResponsesArgs = {
  where?: InputMaybe<AddSpaceMemberResponseWhere>
}

export type MutationDeleteCarePulsesArgs = {
  delete?: InputMaybe<CarePulseDeleteInput>
  where?: InputMaybe<CarePulseWhere>
}

export type MutationDeleteChatbotResponsesArgs = {
  where?: InputMaybe<ChatbotResponseWhere>
}

export type MutationDeleteCommunitiesArgs = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<CommunityWhere>
}

export type MutationDeleteCoreValuePulsesArgs = {
  delete?: InputMaybe<CoreValuePulseDeleteInput>
  where?: InputMaybe<CoreValuePulseWhere>
}

export type MutationDeleteFieldContextsArgs = {
  delete?: InputMaybe<FieldContextDeleteInput>
  where?: InputMaybe<FieldContextWhere>
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

export type MutationDeleteUpdateUserAiResponsesArgs = {
  where?: InputMaybe<UpdateUserAiResponseWhere>
}

export type MutationDeleteUsersArgs = {
  delete?: InputMaybe<UserDeleteInput>
  where?: InputMaybe<UserWhere>
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

export type MutationUpdateCarePulsesArgs = {
  update?: InputMaybe<CarePulseUpdateInput>
  where?: InputMaybe<CarePulseWhere>
}

export type MutationUpdateChatbotResponsesArgs = {
  update?: InputMaybe<ChatbotResponseUpdateInput>
  where?: InputMaybe<ChatbotResponseWhere>
}

export type MutationUpdateCommunitiesArgs = {
  update?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<CommunityWhere>
}

export type MutationUpdateCoreValuePulsesArgs = {
  update?: InputMaybe<CoreValuePulseUpdateInput>
  where?: InputMaybe<CoreValuePulseWhere>
}

export type MutationUpdateFieldContextsArgs = {
  update?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<FieldContextWhere>
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

export type MutationUpdateUpdateUserAiResponsesArgs = {
  update?: InputMaybe<UpdateUserAiResponseUpdateInput>
  where?: InputMaybe<UpdateUserAiResponseWhere>
}

export type MutationUpdateUserAiArgs = {
  aiEnabled: Scalars['Boolean']['input']
  userId: Scalars['ID']['input']
}

export type MutationUpdateUsersArgs = {
  update?: InputMaybe<UserUpdateInput>
  where?: InputMaybe<UserWhere>
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
 * Authorization: Can only view people who are owners or members of shared spaces.
 */
export type Person = {
  __typename?: 'Person'
  email?: Maybe<Scalars['String']['output']>
  fieldsOfCare?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  id: Scalars['ID']['output']
  lastName: Scalars['String']['output']
  memberOf: Array<SpaceMembership>
  /** @deprecated Please use field "aggregate" inside "memberOfConnection" instead */
  memberOfAggregate?: Maybe<PersonSpaceMembershipMemberOfAggregationSelection>
  memberOfConnection: PersonMemberOfConnection
  name: Scalars['String']['output']
  ownsSpaces: Array<Space>
  /** @deprecated Please use field "aggregate" inside "ownsSpacesConnection" instead */
  ownsSpacesAggregate?: Maybe<PersonSpaceOwnsSpacesAggregationSelection>
  ownsSpacesConnection: PersonOwnsSpacesConnection
  passions?: Maybe<Scalars['String']['output']>
  traits?: Maybe<Scalars['String']['output']>
}

/**
 * A human user of the system.
 * Multi-label: ["Person", "User"]
 * Authorization: Can only view people who are owners or members of shared spaces.
 */
export type PersonMemberOfArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembershipSort>>
  where?: InputMaybe<SpaceMembershipWhere>
}

/**
 * A human user of the system.
 * Multi-label: ["Person", "User"]
 * Authorization: Can only view people who are owners or members of shared spaces.
 */
export type PersonMemberOfAggregateArgs = {
  where?: InputMaybe<SpaceMembershipWhere>
}

/**
 * A human user of the system.
 * Multi-label: ["Person", "User"]
 * Authorization: Can only view people who are owners or members of shared spaces.
 */
export type PersonMemberOfConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonMemberOfConnectionSort>>
  where?: InputMaybe<PersonMemberOfConnectionWhere>
}

/**
 * A human user of the system.
 * Multi-label: ["Person", "User"]
 * Authorization: Can only view people who are owners or members of shared spaces.
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
 * Authorization: Can only view people who are owners or members of shared spaces.
 */
export type PersonOwnsSpacesAggregateArgs = {
  where?: InputMaybe<SpaceWhere>
}

/**
 * A human user of the system.
 * Multi-label: ["Person", "User"]
 * Authorization: Can only view people who are owners or members of shared spaces.
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
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
}

export type PersonAggregateSelection = {
  __typename?: 'PersonAggregateSelection'
  count: Scalars['Int']['output']
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
}

export type PersonConnectInput = {
  memberOf?: InputMaybe<Array<PersonMemberOfConnectFieldInput>>
  ownsSpaces?: InputMaybe<Array<PersonOwnsSpacesConnectFieldInput>>
}

export type PersonConnectWhere = {
  node: PersonWhere
}

export type PersonCreateInput = {
  email?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare?: InputMaybe<Scalars['String']['input']>
  firstName: Scalars['String']['input']
  lastName: Scalars['String']['input']
  memberOf?: InputMaybe<PersonMemberOfFieldInput>
  ownsSpaces?: InputMaybe<PersonOwnsSpacesFieldInput>
  passions?: InputMaybe<Scalars['String']['input']>
  traits?: InputMaybe<Scalars['String']['input']>
}

export type PersonDeleteInput = {
  memberOf?: InputMaybe<Array<PersonMemberOfDeleteFieldInput>>
  ownsSpaces?: InputMaybe<Array<PersonOwnsSpacesDeleteFieldInput>>
}

export type PersonDisconnectInput = {
  memberOf?: InputMaybe<Array<PersonMemberOfDisconnectFieldInput>>
  ownsSpaces?: InputMaybe<Array<PersonOwnsSpacesDisconnectFieldInput>>
}

export type PersonEdge = {
  __typename?: 'PersonEdge'
  cursor: Scalars['String']['output']
  node: Person
}

export type PersonMemberOfAggregateInput = {
  AND?: InputMaybe<Array<PersonMemberOfAggregateInput>>
  NOT?: InputMaybe<PersonMemberOfAggregateInput>
  OR?: InputMaybe<Array<PersonMemberOfAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<PersonMemberOfNodeAggregationWhereInput>
}

export type PersonMemberOfConnectFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipConnectInput>>
  where?: InputMaybe<SpaceMembershipConnectWhere>
}

export type PersonMemberOfConnection = {
  __typename?: 'PersonMemberOfConnection'
  aggregate: PersonSpaceMembershipMemberOfAggregateSelection
  edges: Array<PersonMemberOfRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonMemberOfConnectionSort = {
  node?: InputMaybe<SpaceMembershipSort>
}

export type PersonMemberOfConnectionWhere = {
  AND?: InputMaybe<Array<PersonMemberOfConnectionWhere>>
  NOT?: InputMaybe<PersonMemberOfConnectionWhere>
  OR?: InputMaybe<Array<PersonMemberOfConnectionWhere>>
  node?: InputMaybe<SpaceMembershipWhere>
}

export type PersonMemberOfCreateFieldInput = {
  node: SpaceMembershipCreateInput
}

export type PersonMemberOfDeleteFieldInput = {
  delete?: InputMaybe<SpaceMembershipDeleteInput>
  where?: InputMaybe<PersonMemberOfConnectionWhere>
}

export type PersonMemberOfDisconnectFieldInput = {
  disconnect?: InputMaybe<SpaceMembershipDisconnectInput>
  where?: InputMaybe<PersonMemberOfConnectionWhere>
}

export type PersonMemberOfFieldInput = {
  connect?: InputMaybe<Array<PersonMemberOfConnectFieldInput>>
  create?: InputMaybe<Array<PersonMemberOfCreateFieldInput>>
}

export type PersonMemberOfNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonMemberOfNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonMemberOfNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonMemberOfNodeAggregationWhereInput>>
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

export type PersonMemberOfRelationship = {
  __typename?: 'PersonMemberOfRelationship'
  cursor: Scalars['String']['output']
  node: SpaceMembership
}

export type PersonMemberOfUpdateConnectionInput = {
  node?: InputMaybe<SpaceMembershipUpdateInput>
  where?: InputMaybe<PersonMemberOfConnectionWhere>
}

export type PersonMemberOfUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonMemberOfConnectFieldInput>>
  create?: InputMaybe<Array<PersonMemberOfCreateFieldInput>>
  delete?: InputMaybe<Array<PersonMemberOfDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonMemberOfDisconnectFieldInput>>
  update?: InputMaybe<PersonMemberOfUpdateConnectionInput>
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
  connect?: InputMaybe<SpaceConnectInput>
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
  delete?: InputMaybe<SpaceDeleteInput>
  where?: InputMaybe<PersonOwnsSpacesConnectionWhere>
}

export type PersonOwnsSpacesDisconnectFieldInput = {
  disconnect?: InputMaybe<SpaceDisconnectInput>
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
  fieldsOfCare?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  passions?: InputMaybe<SortDirection>
  traits?: InputMaybe<SortDirection>
}

export type PersonSpaceMembershipMemberOfAggregateSelection = {
  __typename?: 'PersonSpaceMembershipMemberOfAggregateSelection'
  count: CountConnection
  node?: Maybe<PersonSpaceMembershipMemberOfNodeAggregateSelection>
}

export type PersonSpaceMembershipMemberOfAggregationSelection = {
  __typename?: 'PersonSpaceMembershipMemberOfAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<PersonSpaceMembershipMemberOfNodeAggregateSelection>
}

export type PersonSpaceMembershipMemberOfNodeAggregateSelection = {
  __typename?: 'PersonSpaceMembershipMemberOfNodeAggregateSelection'
  addedAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
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
  fieldsOfCare_SET?: InputMaybe<Scalars['String']['input']>
  firstName_SET?: InputMaybe<Scalars['String']['input']>
  lastName_SET?: InputMaybe<Scalars['String']['input']>
  memberOf?: InputMaybe<Array<PersonMemberOfUpdateFieldInput>>
  ownsSpaces?: InputMaybe<Array<PersonOwnsSpacesUpdateFieldInput>>
  passions_SET?: InputMaybe<Scalars['String']['input']>
  traits_SET?: InputMaybe<Scalars['String']['input']>
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
  fieldsOfCare_CONTAINS?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_EQ?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  fieldsOfCare_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  memberOfAggregate?: InputMaybe<PersonMemberOfAggregateInput>
  /** Return People where all of the related PersonMemberOfConnections match this filter */
  memberOfConnection_ALL?: InputMaybe<PersonMemberOfConnectionWhere>
  /** Return People where none of the related PersonMemberOfConnections match this filter */
  memberOfConnection_NONE?: InputMaybe<PersonMemberOfConnectionWhere>
  /** Return People where one of the related PersonMemberOfConnections match this filter */
  memberOfConnection_SINGLE?: InputMaybe<PersonMemberOfConnectionWhere>
  /** Return People where some of the related PersonMemberOfConnections match this filter */
  memberOfConnection_SOME?: InputMaybe<PersonMemberOfConnectionWhere>
  /** Return People where all of the related SpaceMemberships match this filter */
  memberOf_ALL?: InputMaybe<SpaceMembershipWhere>
  /** Return People where none of the related SpaceMemberships match this filter */
  memberOf_NONE?: InputMaybe<SpaceMembershipWhere>
  /** Return People where one of the related SpaceMemberships match this filter */
  memberOf_SINGLE?: InputMaybe<SpaceMembershipWhere>
  /** Return People where some of the related SpaceMemberships match this filter */
  memberOf_SOME?: InputMaybe<SpaceMembershipWhere>
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
  passions_CONTAINS?: InputMaybe<Scalars['String']['input']>
  passions_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  passions_EQ?: InputMaybe<Scalars['String']['input']>
  passions_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  passions_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  traits_CONTAINS?: InputMaybe<Scalars['String']['input']>
  traits_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  traits_EQ?: InputMaybe<Scalars['String']['input']>
  traits_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  traits_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type Query = {
  __typename?: 'Query'
  addSpaceMemberResponses: Array<AddSpaceMemberResponse>
  /** @deprecated Please use the explicit field "aggregate" inside "addSpaceMemberResponsesConnection" instead */
  addSpaceMemberResponsesAggregate: AddSpaceMemberResponseAggregateSelection
  addSpaceMemberResponsesConnection: AddSpaceMemberResponsesConnection
  carePulses: Array<CarePulse>
  /** @deprecated Please use the explicit field "aggregate" inside "carePulsesConnection" instead */
  carePulsesAggregate: CarePulseAggregateSelection
  carePulsesConnection: CarePulsesConnection
  chatbotResponses: Array<ChatbotResponse>
  /** @deprecated Please use the explicit field "aggregate" inside "chatbotResponsesConnection" instead */
  chatbotResponsesAggregate: ChatbotResponseAggregateSelection
  chatbotResponsesConnection: ChatbotResponsesConnection
  communities: Array<Community>
  /** @deprecated Please use the explicit field "aggregate" inside "communitiesConnection" instead */
  communitiesAggregate: CommunityAggregateSelection
  communitiesConnection: CommunitiesConnection
  coreValuePulses: Array<CoreValuePulse>
  /** @deprecated Please use the explicit field "aggregate" inside "coreValuePulsesConnection" instead */
  coreValuePulsesAggregate: CoreValuePulseAggregateSelection
  coreValuePulsesConnection: CoreValuePulsesConnection
  fieldContexts: Array<FieldContext>
  /** @deprecated Please use the explicit field "aggregate" inside "fieldContextsConnection" instead */
  fieldContextsAggregate: FieldContextAggregateSelection
  fieldContextsConnection: FieldContextsConnection
  fieldPulses: Array<FieldPulse>
  /** @deprecated Please use the explicit field "aggregate" inside "fieldPulsesConnection" instead */
  fieldPulsesAggregate: FieldPulseAggregateSelection
  fieldPulsesConnection: FieldPulsesConnection
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
  updateUserAiResponses: Array<UpdateUserAiResponse>
  /** @deprecated Please use the explicit field "aggregate" inside "updateUserAiResponsesConnection" instead */
  updateUserAiResponsesAggregate: UpdateUserAiResponseAggregateSelection
  updateUserAiResponsesConnection: UpdateUserAiResponsesConnection
  users: Array<User>
  /** @deprecated Please use the explicit field "aggregate" inside "usersConnection" instead */
  usersAggregate: UserAggregateSelection
  usersConnection: UsersConnection
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

export type QueryCarePulsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePulseSort>>
  where?: InputMaybe<CarePulseWhere>
}

export type QueryCarePulsesAggregateArgs = {
  where?: InputMaybe<CarePulseWhere>
}

export type QueryCarePulsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePulseSort>>
  where?: InputMaybe<CarePulseWhere>
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

export type QueryCoreValuePulsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValuePulseSort>>
  where?: InputMaybe<CoreValuePulseWhere>
}

export type QueryCoreValuePulsesAggregateArgs = {
  where?: InputMaybe<CoreValuePulseWhere>
}

export type QueryCoreValuePulsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValuePulseSort>>
  where?: InputMaybe<CoreValuePulseWhere>
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

export type QueryUpdateUserAiResponsesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<UpdateUserAiResponseSort>>
  where?: InputMaybe<UpdateUserAiResponseWhere>
}

export type QueryUpdateUserAiResponsesAggregateArgs = {
  where?: InputMaybe<UpdateUserAiResponseWhere>
}

export type QueryUpdateUserAiResponsesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<UpdateUserAiResponseSort>>
  where?: InputMaybe<UpdateUserAiResponseWhere>
}

export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<UserSort>>
  where?: InputMaybe<UserWhere>
}

export type QueryUsersAggregateArgs = {
  where?: InputMaybe<UserWhere>
}

export type QueryUsersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<UserSort>>
  where?: InputMaybe<UserWhere>
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
 * A discovered semantic resonance link between two pulses within the same FieldContext.
 * Represents an AI-identified connection with confidence scoring.
 * Scoped to a single FieldContext - only pulses in the same context can resonate.
 * Multi-label: ["ResonanceLink"]
 */
export type ResonanceLink = {
  __typename?: 'ResonanceLink'
  confidence: Scalars['Float']['output']
  context: Array<FieldContext>
  /** @deprecated Please use field "aggregate" inside "contextConnection" instead */
  contextAggregate?: Maybe<ResonanceLinkFieldContextContextAggregationSelection>
  contextConnection: ResonanceLinkContextConnection
  createdAt: Scalars['DateTime']['output']
  description?: Maybe<Scalars['String']['output']>
  evidence?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  label: Scalars['String']['output']
  mergedFrom?: Maybe<Scalars['String']['output']>
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
 * A discovered semantic resonance link between two pulses within the same FieldContext.
 * Represents an AI-identified connection with confidence scoring.
 * Scoped to a single FieldContext - only pulses in the same context can resonate.
 * Multi-label: ["ResonanceLink"]
 */
export type ResonanceLinkContextArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A discovered semantic resonance link between two pulses within the same FieldContext.
 * Represents an AI-identified connection with confidence scoring.
 * Scoped to a single FieldContext - only pulses in the same context can resonate.
 * Multi-label: ["ResonanceLink"]
 */
export type ResonanceLinkContextAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A discovered semantic resonance link between two pulses within the same FieldContext.
 * Represents an AI-identified connection with confidence scoring.
 * Scoped to a single FieldContext - only pulses in the same context can resonate.
 * Multi-label: ["ResonanceLink"]
 */
export type ResonanceLinkContextConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResonanceLinkContextConnectionSort>>
  where?: InputMaybe<ResonanceLinkContextConnectionWhere>
}

/**
 * A discovered semantic resonance link between two pulses within the same FieldContext.
 * Represents an AI-identified connection with confidence scoring.
 * Scoped to a single FieldContext - only pulses in the same context can resonate.
 * Multi-label: ["ResonanceLink"]
 */
export type ResonanceLinkSourceArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseSort>>
  where?: InputMaybe<FieldPulseWhere>
}

/**
 * A discovered semantic resonance link between two pulses within the same FieldContext.
 * Represents an AI-identified connection with confidence scoring.
 * Scoped to a single FieldContext - only pulses in the same context can resonate.
 * Multi-label: ["ResonanceLink"]
 */
export type ResonanceLinkSourceAggregateArgs = {
  where?: InputMaybe<FieldPulseWhere>
}

/**
 * A discovered semantic resonance link between two pulses within the same FieldContext.
 * Represents an AI-identified connection with confidence scoring.
 * Scoped to a single FieldContext - only pulses in the same context can resonate.
 * Multi-label: ["ResonanceLink"]
 */
export type ResonanceLinkSourceConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResonanceLinkSourceConnectionSort>>
  where?: InputMaybe<ResonanceLinkSourceConnectionWhere>
}

/**
 * A discovered semantic resonance link between two pulses within the same FieldContext.
 * Represents an AI-identified connection with confidence scoring.
 * Scoped to a single FieldContext - only pulses in the same context can resonate.
 * Multi-label: ["ResonanceLink"]
 */
export type ResonanceLinkTargetArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseSort>>
  where?: InputMaybe<FieldPulseWhere>
}

/**
 * A discovered semantic resonance link between two pulses within the same FieldContext.
 * Represents an AI-identified connection with confidence scoring.
 * Scoped to a single FieldContext - only pulses in the same context can resonate.
 * Multi-label: ["ResonanceLink"]
 */
export type ResonanceLinkTargetAggregateArgs = {
  where?: InputMaybe<FieldPulseWhere>
}

/**
 * A discovered semantic resonance link between two pulses within the same FieldContext.
 * Represents an AI-identified connection with confidence scoring.
 * Scoped to a single FieldContext - only pulses in the same context can resonate.
 * Multi-label: ["ResonanceLink"]
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
  description: StringAggregateSelection
  evidence: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  label: StringAggregateSelection
  mergedFrom: StringAggregateSelection
}

export type ResonanceLinkAggregateSelection = {
  __typename?: 'ResonanceLinkAggregateSelection'
  confidence: FloatAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  evidence: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  label: StringAggregateSelection
  mergedFrom: StringAggregateSelection
}

export type ResonanceLinkConnectInput = {
  context?: InputMaybe<Array<ResonanceLinkContextConnectFieldInput>>
  source?: InputMaybe<Array<ResonanceLinkSourceConnectFieldInput>>
  target?: InputMaybe<Array<ResonanceLinkTargetConnectFieldInput>>
}

export type ResonanceLinkConnectWhere = {
  node: ResonanceLinkWhere
}

export type ResonanceLinkContextAggregateInput = {
  AND?: InputMaybe<Array<ResonanceLinkContextAggregateInput>>
  NOT?: InputMaybe<ResonanceLinkContextAggregateInput>
  OR?: InputMaybe<Array<ResonanceLinkContextAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResonanceLinkContextNodeAggregationWhereInput>
}

export type ResonanceLinkContextConnectFieldInput = {
  connect?: InputMaybe<Array<FieldContextConnectInput>>
  where?: InputMaybe<FieldContextConnectWhere>
}

export type ResonanceLinkContextConnection = {
  __typename?: 'ResonanceLinkContextConnection'
  aggregate: ResonanceLinkFieldContextContextAggregateSelection
  edges: Array<ResonanceLinkContextRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResonanceLinkContextConnectionSort = {
  node?: InputMaybe<FieldContextSort>
}

export type ResonanceLinkContextConnectionWhere = {
  AND?: InputMaybe<Array<ResonanceLinkContextConnectionWhere>>
  NOT?: InputMaybe<ResonanceLinkContextConnectionWhere>
  OR?: InputMaybe<Array<ResonanceLinkContextConnectionWhere>>
  node?: InputMaybe<FieldContextWhere>
}

export type ResonanceLinkContextCreateFieldInput = {
  node: FieldContextCreateInput
}

export type ResonanceLinkContextDeleteFieldInput = {
  delete?: InputMaybe<FieldContextDeleteInput>
  where?: InputMaybe<ResonanceLinkContextConnectionWhere>
}

export type ResonanceLinkContextDisconnectFieldInput = {
  disconnect?: InputMaybe<FieldContextDisconnectInput>
  where?: InputMaybe<ResonanceLinkContextConnectionWhere>
}

export type ResonanceLinkContextFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkContextConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkContextCreateFieldInput>>
}

export type ResonanceLinkContextNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResonanceLinkContextNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResonanceLinkContextNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResonanceLinkContextNodeAggregationWhereInput>>
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

export type ResonanceLinkContextRelationship = {
  __typename?: 'ResonanceLinkContextRelationship'
  cursor: Scalars['String']['output']
  node: FieldContext
}

export type ResonanceLinkContextUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<ResonanceLinkContextConnectionWhere>
}

export type ResonanceLinkContextUpdateFieldInput = {
  connect?: InputMaybe<Array<ResonanceLinkContextConnectFieldInput>>
  create?: InputMaybe<Array<ResonanceLinkContextCreateFieldInput>>
  delete?: InputMaybe<Array<ResonanceLinkContextDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResonanceLinkContextDisconnectFieldInput>>
  update?: InputMaybe<ResonanceLinkContextUpdateConnectionInput>
}

export type ResonanceLinkCreateInput = {
  confidence: Scalars['Float']['input']
  context?: InputMaybe<ResonanceLinkContextFieldInput>
  createdAt: Scalars['DateTime']['input']
  description?: InputMaybe<Scalars['String']['input']>
  evidence?: InputMaybe<Scalars['String']['input']>
  label: Scalars['String']['input']
  mergedFrom?: InputMaybe<Scalars['String']['input']>
  source?: InputMaybe<ResonanceLinkSourceFieldInput>
  target?: InputMaybe<ResonanceLinkTargetFieldInput>
}

export type ResonanceLinkDeleteInput = {
  context?: InputMaybe<Array<ResonanceLinkContextDeleteFieldInput>>
  source?: InputMaybe<Array<ResonanceLinkSourceDeleteFieldInput>>
  target?: InputMaybe<Array<ResonanceLinkTargetDeleteFieldInput>>
}

export type ResonanceLinkDisconnectInput = {
  context?: InputMaybe<Array<ResonanceLinkContextDisconnectFieldInput>>
  source?: InputMaybe<Array<ResonanceLinkSourceDisconnectFieldInput>>
  target?: InputMaybe<Array<ResonanceLinkTargetDisconnectFieldInput>>
}

export type ResonanceLinkEdge = {
  __typename?: 'ResonanceLinkEdge'
  cursor: Scalars['String']['output']
  node: ResonanceLink
}

export type ResonanceLinkFieldContextContextAggregateSelection = {
  __typename?: 'ResonanceLinkFieldContextContextAggregateSelection'
  count: CountConnection
  node?: Maybe<ResonanceLinkFieldContextContextNodeAggregateSelection>
}

export type ResonanceLinkFieldContextContextAggregationSelection = {
  __typename?: 'ResonanceLinkFieldContextContextAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResonanceLinkFieldContextContextNodeAggregateSelection>
}

export type ResonanceLinkFieldContextContextNodeAggregateSelection = {
  __typename?: 'ResonanceLinkFieldContextContextNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  emergentName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  title: StringAggregateSelection
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

/** Fields to sort ResonanceLinks by. The order in which sorts are applied is not guaranteed when specifying many fields in one ResonanceLinkSort object. */
export type ResonanceLinkSort = {
  confidence?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  description?: InputMaybe<SortDirection>
  evidence?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  label?: InputMaybe<SortDirection>
  mergedFrom?: InputMaybe<SortDirection>
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
  context?: InputMaybe<Array<ResonanceLinkContextUpdateFieldInput>>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  description_SET?: InputMaybe<Scalars['String']['input']>
  evidence_SET?: InputMaybe<Scalars['String']['input']>
  label_SET?: InputMaybe<Scalars['String']['input']>
  mergedFrom_SET?: InputMaybe<Scalars['String']['input']>
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
  contextAggregate?: InputMaybe<ResonanceLinkContextAggregateInput>
  /** Return ResonanceLinks where all of the related ResonanceLinkContextConnections match this filter */
  contextConnection_ALL?: InputMaybe<ResonanceLinkContextConnectionWhere>
  /** Return ResonanceLinks where none of the related ResonanceLinkContextConnections match this filter */
  contextConnection_NONE?: InputMaybe<ResonanceLinkContextConnectionWhere>
  /** Return ResonanceLinks where one of the related ResonanceLinkContextConnections match this filter */
  contextConnection_SINGLE?: InputMaybe<ResonanceLinkContextConnectionWhere>
  /** Return ResonanceLinks where some of the related ResonanceLinkContextConnections match this filter */
  contextConnection_SOME?: InputMaybe<ResonanceLinkContextConnectionWhere>
  /** Return ResonanceLinks where all of the related FieldContexts match this filter */
  context_ALL?: InputMaybe<FieldContextWhere>
  /** Return ResonanceLinks where none of the related FieldContexts match this filter */
  context_NONE?: InputMaybe<FieldContextWhere>
  /** Return ResonanceLinks where one of the related FieldContexts match this filter */
  context_SINGLE?: InputMaybe<FieldContextWhere>
  /** Return ResonanceLinks where some of the related FieldContexts match this filter */
  context_SOME?: InputMaybe<FieldContextWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  description_CONTAINS?: InputMaybe<Scalars['String']['input']>
  description_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  description_EQ?: InputMaybe<Scalars['String']['input']>
  description_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  description_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  label_CONTAINS?: InputMaybe<Scalars['String']['input']>
  label_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  label_EQ?: InputMaybe<Scalars['String']['input']>
  label_IN?: InputMaybe<Array<Scalars['String']['input']>>
  label_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  mergedFrom_CONTAINS?: InputMaybe<Scalars['String']['input']>
  mergedFrom_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  mergedFrom_EQ?: InputMaybe<Scalars['String']['input']>
  mergedFrom_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  mergedFrom_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  createdBy: Array<Person>
  /** @deprecated Please use field "aggregate" inside "createdByConnection" instead */
  createdByAggregate?: Maybe<ResourcePulsePersonCreatedByAggregationSelection>
  createdByConnection: FieldPulseCreatedByConnection
  id: Scalars['ID']['output']
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
export type ResourcePulseCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

/**
 * A pulse that functions as a resource in its context.
 * Multi-label: ["FieldPulse", "ResourcePulse"]
 */
export type ResourcePulseCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

/**
 * A pulse that functions as a resource in its context.
 * Multi-label: ["FieldPulse", "ResourcePulse"]
 */
export type ResourcePulseCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseCreatedByConnectionSort>>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
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
  createdBy?: InputMaybe<ResourcePulseCreatedByFieldInput>
  intensity?: InputMaybe<Scalars['Float']['input']>
  resourceType: Scalars['String']['input']
  title: Scalars['String']['input']
}

export type ResourcePulseCreatedByAggregateInput = {
  AND?: InputMaybe<Array<ResourcePulseCreatedByAggregateInput>>
  NOT?: InputMaybe<ResourcePulseCreatedByAggregateInput>
  OR?: InputMaybe<Array<ResourcePulseCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourcePulseCreatedByNodeAggregationWhereInput>
}

export type ResourcePulseCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type ResourcePulseCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type ResourcePulseCreatedByFieldInput = {
  connect?: InputMaybe<Array<ResourcePulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<ResourcePulseCreatedByCreateFieldInput>>
}

export type ResourcePulseCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourcePulseCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourcePulseCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourcePulseCreatedByNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type ResourcePulseCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
}

export type ResourcePulseCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourcePulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<ResourcePulseCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseCreatedByDisconnectFieldInput>>
  update?: InputMaybe<ResourcePulseCreatedByUpdateConnectionInput>
}

export type ResourcePulseDeleteInput = {
  context?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  createdBy?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
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

export type ResourcePulsePersonCreatedByAggregationSelection = {
  __typename?: 'ResourcePulsePersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourcePulsePersonCreatedByNodeAggregateSelection>
}

export type ResourcePulsePersonCreatedByNodeAggregateSelection = {
  __typename?: 'ResourcePulsePersonCreatedByNodeAggregateSelection'
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
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
  createdBy?: InputMaybe<Array<ResourcePulseCreatedByUpdateFieldInput>>
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
  createdByAggregate?: InputMaybe<ResourcePulseCreatedByAggregateInput>
  /** Return ResourcePulses where all of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return ResourcePulses where none of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return ResourcePulses where one of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return ResourcePulses where some of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return ResourcePulses where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return ResourcePulses where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return ResourcePulses where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return ResourcePulses where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
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
  contexts: Array<FieldContext>
  contextsConnection: SpaceContextsConnection
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  members: Array<SpaceMembership>
  membersConnection: SpaceMembersConnection
  name: Scalars['String']['output']
  owner: Array<Person>
  ownerConnection: SpaceOwnerConnection
  visibility: SpaceVisibility
}

export type SpaceContextsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldContextSort>>
  where?: InputMaybe<FieldContextWhere>
}

export type SpaceContextsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceContextsConnectionSort>>
  where?: InputMaybe<SpaceContextsConnectionWhere>
}

export type SpaceMembersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembershipSort>>
  where?: InputMaybe<SpaceMembershipWhere>
}

export type SpaceMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembersConnectionSort>>
  where?: InputMaybe<SpaceMembersConnectionWhere>
}

export type SpaceOwnerArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type SpaceOwnerConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceOwnerConnectionSort>>
  where?: InputMaybe<SpaceOwnerConnectionWhere>
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

export type SpaceConnectInput = {
  contexts?: InputMaybe<Array<SpaceContextsConnectFieldInput>>
  members?: InputMaybe<Array<SpaceMembersConnectFieldInput>>
  owner?: InputMaybe<Array<SpaceOwnerConnectFieldInput>>
}

export type SpaceConnectWhere = {
  node: SpaceWhere
}

export type SpaceContextsAggregateInput = {
  AND?: InputMaybe<Array<SpaceContextsAggregateInput>>
  NOT?: InputMaybe<SpaceContextsAggregateInput>
  OR?: InputMaybe<Array<SpaceContextsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<SpaceContextsNodeAggregationWhereInput>
}

export type SpaceContextsConnectFieldInput = {
  connect?: InputMaybe<Array<FieldContextConnectInput>>
  where?: InputMaybe<FieldContextConnectWhere>
}

export type SpaceContextsConnection = {
  __typename?: 'SpaceContextsConnection'
  edges: Array<SpaceContextsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type SpaceContextsConnectionSort = {
  node?: InputMaybe<FieldContextSort>
}

export type SpaceContextsConnectionWhere = {
  AND?: InputMaybe<Array<SpaceContextsConnectionWhere>>
  NOT?: InputMaybe<SpaceContextsConnectionWhere>
  OR?: InputMaybe<Array<SpaceContextsConnectionWhere>>
  node?: InputMaybe<FieldContextWhere>
}

export type SpaceContextsCreateFieldInput = {
  node: FieldContextCreateInput
}

export type SpaceContextsDeleteFieldInput = {
  delete?: InputMaybe<FieldContextDeleteInput>
  where?: InputMaybe<SpaceContextsConnectionWhere>
}

export type SpaceContextsDisconnectFieldInput = {
  disconnect?: InputMaybe<FieldContextDisconnectInput>
  where?: InputMaybe<SpaceContextsConnectionWhere>
}

export type SpaceContextsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<SpaceContextsNodeAggregationWhereInput>>
  NOT?: InputMaybe<SpaceContextsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<SpaceContextsNodeAggregationWhereInput>>
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

export type SpaceContextsRelationship = {
  __typename?: 'SpaceContextsRelationship'
  cursor: Scalars['String']['output']
  node: FieldContext
}

export type SpaceContextsUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<SpaceContextsConnectionWhere>
}

export type SpaceContextsUpdateFieldInput = {
  connect?: InputMaybe<Array<SpaceContextsConnectFieldInput>>
  create?: InputMaybe<Array<SpaceContextsCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceContextsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceContextsDisconnectFieldInput>>
  update?: InputMaybe<SpaceContextsUpdateConnectionInput>
}

export type SpaceCreateInput = {
  MeSpace?: InputMaybe<MeSpaceCreateInput>
  WeSpace?: InputMaybe<WeSpaceCreateInput>
}

export type SpaceDeleteInput = {
  contexts?: InputMaybe<Array<SpaceContextsDeleteFieldInput>>
  members?: InputMaybe<Array<SpaceMembersDeleteFieldInput>>
  owner?: InputMaybe<Array<SpaceOwnerDeleteFieldInput>>
}

export type SpaceDisconnectInput = {
  contexts?: InputMaybe<Array<SpaceContextsDisconnectFieldInput>>
  members?: InputMaybe<Array<SpaceMembersDisconnectFieldInput>>
  owner?: InputMaybe<Array<SpaceOwnerDisconnectFieldInput>>
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

export type SpaceMembersAggregateInput = {
  AND?: InputMaybe<Array<SpaceMembersAggregateInput>>
  NOT?: InputMaybe<SpaceMembersAggregateInput>
  OR?: InputMaybe<Array<SpaceMembersAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<SpaceMembersNodeAggregationWhereInput>
}

export type SpaceMembersConnectFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipConnectInput>>
  where?: InputMaybe<SpaceMembershipConnectWhere>
}

export type SpaceMembersConnection = {
  __typename?: 'SpaceMembersConnection'
  edges: Array<SpaceMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type SpaceMembersConnectionSort = {
  node?: InputMaybe<SpaceMembershipSort>
}

export type SpaceMembersConnectionWhere = {
  AND?: InputMaybe<Array<SpaceMembersConnectionWhere>>
  NOT?: InputMaybe<SpaceMembersConnectionWhere>
  OR?: InputMaybe<Array<SpaceMembersConnectionWhere>>
  node?: InputMaybe<SpaceMembershipWhere>
}

export type SpaceMembersCreateFieldInput = {
  node: SpaceMembershipCreateInput
}

export type SpaceMembersDeleteFieldInput = {
  delete?: InputMaybe<SpaceMembershipDeleteInput>
  where?: InputMaybe<SpaceMembersConnectionWhere>
}

export type SpaceMembersDisconnectFieldInput = {
  disconnect?: InputMaybe<SpaceMembershipDisconnectInput>
  where?: InputMaybe<SpaceMembersConnectionWhere>
}

export type SpaceMembersNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<SpaceMembersNodeAggregationWhereInput>>
  NOT?: InputMaybe<SpaceMembersNodeAggregationWhereInput>
  OR?: InputMaybe<Array<SpaceMembersNodeAggregationWhereInput>>
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

export type SpaceMembersRelationship = {
  __typename?: 'SpaceMembersRelationship'
  cursor: Scalars['String']['output']
  node: SpaceMembership
}

export type SpaceMembersUpdateConnectionInput = {
  node?: InputMaybe<SpaceMembershipUpdateInput>
  where?: InputMaybe<SpaceMembersConnectionWhere>
}

export type SpaceMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<SpaceMembersConnectFieldInput>>
  create?: InputMaybe<Array<SpaceMembersCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceMembersDisconnectFieldInput>>
  update?: InputMaybe<SpaceMembersUpdateConnectionInput>
}

/**
 * Represents a person or community as a member of a space with a specific role.
 * Label: ["SpaceMembership"]
 */
export type SpaceMembership = {
  __typename?: 'SpaceMembership'
  addedAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  member: Array<Person>
  /** @deprecated Please use field "aggregate" inside "memberConnection" instead */
  memberAggregate?: Maybe<SpaceMembershipPersonMemberAggregationSelection>
  memberConnection: SpaceMembershipMemberConnection
  role: SpaceRole
  space: Array<Space>
  /** @deprecated Please use field "aggregate" inside "spaceConnection" instead */
  spaceAggregate?: Maybe<SpaceMembershipSpaceSpaceAggregationSelection>
  spaceConnection: SpaceMembershipSpaceConnection
}

/**
 * Represents a person or community as a member of a space with a specific role.
 * Label: ["SpaceMembership"]
 */
export type SpaceMembershipMemberArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

/**
 * Represents a person or community as a member of a space with a specific role.
 * Label: ["SpaceMembership"]
 */
export type SpaceMembershipMemberAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

/**
 * Represents a person or community as a member of a space with a specific role.
 * Label: ["SpaceMembership"]
 */
export type SpaceMembershipMemberConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembershipMemberConnectionSort>>
  where?: InputMaybe<SpaceMembershipMemberConnectionWhere>
}

/**
 * Represents a person or community as a member of a space with a specific role.
 * Label: ["SpaceMembership"]
 */
export type SpaceMembershipSpaceArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceSort>>
  where?: InputMaybe<SpaceWhere>
}

/**
 * Represents a person or community as a member of a space with a specific role.
 * Label: ["SpaceMembership"]
 */
export type SpaceMembershipSpaceAggregateArgs = {
  where?: InputMaybe<SpaceWhere>
}

/**
 * Represents a person or community as a member of a space with a specific role.
 * Label: ["SpaceMembership"]
 */
export type SpaceMembershipSpaceConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembershipSpaceConnectionSort>>
  where?: InputMaybe<SpaceMembershipSpaceConnectionWhere>
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
  member?: InputMaybe<Array<SpaceMembershipMemberConnectFieldInput>>
  space?: InputMaybe<Array<SpaceMembershipSpaceConnectFieldInput>>
}

export type SpaceMembershipConnectWhere = {
  node: SpaceMembershipWhere
}

export type SpaceMembershipCreateInput = {
  addedAt: Scalars['DateTime']['input']
  member?: InputMaybe<SpaceMembershipMemberFieldInput>
  role: SpaceRole
  space?: InputMaybe<SpaceMembershipSpaceFieldInput>
}

export type SpaceMembershipDeleteInput = {
  member?: InputMaybe<Array<SpaceMembershipMemberDeleteFieldInput>>
  space?: InputMaybe<Array<SpaceMembershipSpaceDeleteFieldInput>>
}

export type SpaceMembershipDisconnectInput = {
  member?: InputMaybe<Array<SpaceMembershipMemberDisconnectFieldInput>>
  space?: InputMaybe<Array<SpaceMembershipSpaceDisconnectFieldInput>>
}

export type SpaceMembershipEdge = {
  __typename?: 'SpaceMembershipEdge'
  cursor: Scalars['String']['output']
  node: SpaceMembership
}

export type SpaceMembershipMemberAggregateInput = {
  AND?: InputMaybe<Array<SpaceMembershipMemberAggregateInput>>
  NOT?: InputMaybe<SpaceMembershipMemberAggregateInput>
  OR?: InputMaybe<Array<SpaceMembershipMemberAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<SpaceMembershipMemberNodeAggregationWhereInput>
}

export type SpaceMembershipMemberConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type SpaceMembershipMemberConnection = {
  __typename?: 'SpaceMembershipMemberConnection'
  aggregate: SpaceMembershipPersonMemberAggregateSelection
  edges: Array<SpaceMembershipMemberRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type SpaceMembershipMemberConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type SpaceMembershipMemberConnectionWhere = {
  AND?: InputMaybe<Array<SpaceMembershipMemberConnectionWhere>>
  NOT?: InputMaybe<SpaceMembershipMemberConnectionWhere>
  OR?: InputMaybe<Array<SpaceMembershipMemberConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type SpaceMembershipMemberCreateFieldInput = {
  node: PersonCreateInput
}

export type SpaceMembershipMemberDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<SpaceMembershipMemberConnectionWhere>
}

export type SpaceMembershipMemberDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<SpaceMembershipMemberConnectionWhere>
}

export type SpaceMembershipMemberFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipMemberConnectFieldInput>>
  create?: InputMaybe<Array<SpaceMembershipMemberCreateFieldInput>>
}

export type SpaceMembershipMemberNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<SpaceMembershipMemberNodeAggregationWhereInput>>
  NOT?: InputMaybe<SpaceMembershipMemberNodeAggregationWhereInput>
  OR?: InputMaybe<Array<SpaceMembershipMemberNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type SpaceMembershipMemberRelationship = {
  __typename?: 'SpaceMembershipMemberRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type SpaceMembershipMemberUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<SpaceMembershipMemberConnectionWhere>
}

export type SpaceMembershipMemberUpdateFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipMemberConnectFieldInput>>
  create?: InputMaybe<Array<SpaceMembershipMemberCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceMembershipMemberDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceMembershipMemberDisconnectFieldInput>>
  update?: InputMaybe<SpaceMembershipMemberUpdateConnectionInput>
}

export type SpaceMembershipPersonMemberAggregateSelection = {
  __typename?: 'SpaceMembershipPersonMemberAggregateSelection'
  count: CountConnection
  node?: Maybe<SpaceMembershipPersonMemberNodeAggregateSelection>
}

export type SpaceMembershipPersonMemberAggregationSelection = {
  __typename?: 'SpaceMembershipPersonMemberAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<SpaceMembershipPersonMemberNodeAggregateSelection>
}

export type SpaceMembershipPersonMemberNodeAggregateSelection = {
  __typename?: 'SpaceMembershipPersonMemberNodeAggregateSelection'
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
}

/** Fields to sort SpaceMemberships by. The order in which sorts are applied is not guaranteed when specifying many fields in one SpaceMembershipSort object. */
export type SpaceMembershipSort = {
  addedAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  role?: InputMaybe<SortDirection>
}

export type SpaceMembershipSpaceAggregateInput = {
  AND?: InputMaybe<Array<SpaceMembershipSpaceAggregateInput>>
  NOT?: InputMaybe<SpaceMembershipSpaceAggregateInput>
  OR?: InputMaybe<Array<SpaceMembershipSpaceAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<SpaceMembershipSpaceNodeAggregationWhereInput>
}

export type SpaceMembershipSpaceConnectFieldInput = {
  connect?: InputMaybe<SpaceConnectInput>
  where?: InputMaybe<SpaceConnectWhere>
}

export type SpaceMembershipSpaceConnection = {
  __typename?: 'SpaceMembershipSpaceConnection'
  aggregate: SpaceMembershipSpaceSpaceAggregateSelection
  edges: Array<SpaceMembershipSpaceRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type SpaceMembershipSpaceConnectionSort = {
  node?: InputMaybe<SpaceSort>
}

export type SpaceMembershipSpaceConnectionWhere = {
  AND?: InputMaybe<Array<SpaceMembershipSpaceConnectionWhere>>
  NOT?: InputMaybe<SpaceMembershipSpaceConnectionWhere>
  OR?: InputMaybe<Array<SpaceMembershipSpaceConnectionWhere>>
  node?: InputMaybe<SpaceWhere>
}

export type SpaceMembershipSpaceCreateFieldInput = {
  node: SpaceCreateInput
}

export type SpaceMembershipSpaceDeleteFieldInput = {
  delete?: InputMaybe<SpaceDeleteInput>
  where?: InputMaybe<SpaceMembershipSpaceConnectionWhere>
}

export type SpaceMembershipSpaceDisconnectFieldInput = {
  disconnect?: InputMaybe<SpaceDisconnectInput>
  where?: InputMaybe<SpaceMembershipSpaceConnectionWhere>
}

export type SpaceMembershipSpaceFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipSpaceConnectFieldInput>>
  create?: InputMaybe<Array<SpaceMembershipSpaceCreateFieldInput>>
}

export type SpaceMembershipSpaceNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<SpaceMembershipSpaceNodeAggregationWhereInput>>
  NOT?: InputMaybe<SpaceMembershipSpaceNodeAggregationWhereInput>
  OR?: InputMaybe<Array<SpaceMembershipSpaceNodeAggregationWhereInput>>
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

export type SpaceMembershipSpaceRelationship = {
  __typename?: 'SpaceMembershipSpaceRelationship'
  cursor: Scalars['String']['output']
  node: Space
}

export type SpaceMembershipSpaceSpaceAggregateSelection = {
  __typename?: 'SpaceMembershipSpaceSpaceAggregateSelection'
  count: CountConnection
  node?: Maybe<SpaceMembershipSpaceSpaceNodeAggregateSelection>
}

export type SpaceMembershipSpaceSpaceAggregationSelection = {
  __typename?: 'SpaceMembershipSpaceSpaceAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<SpaceMembershipSpaceSpaceNodeAggregateSelection>
}

export type SpaceMembershipSpaceSpaceNodeAggregateSelection = {
  __typename?: 'SpaceMembershipSpaceSpaceNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type SpaceMembershipSpaceUpdateConnectionInput = {
  node?: InputMaybe<SpaceUpdateInput>
  where?: InputMaybe<SpaceMembershipSpaceConnectionWhere>
}

export type SpaceMembershipSpaceUpdateFieldInput = {
  connect?: InputMaybe<Array<SpaceMembershipSpaceConnectFieldInput>>
  create?: InputMaybe<Array<SpaceMembershipSpaceCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceMembershipSpaceDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceMembershipSpaceDisconnectFieldInput>>
  update?: InputMaybe<SpaceMembershipSpaceUpdateConnectionInput>
}

export type SpaceMembershipUpdateInput = {
  addedAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  member?: InputMaybe<Array<SpaceMembershipMemberUpdateFieldInput>>
  role_SET?: InputMaybe<SpaceRole>
  space?: InputMaybe<Array<SpaceMembershipSpaceUpdateFieldInput>>
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
  memberAggregate?: InputMaybe<SpaceMembershipMemberAggregateInput>
  /** Return SpaceMemberships where all of the related SpaceMembershipMemberConnections match this filter */
  memberConnection_ALL?: InputMaybe<SpaceMembershipMemberConnectionWhere>
  /** Return SpaceMemberships where none of the related SpaceMembershipMemberConnections match this filter */
  memberConnection_NONE?: InputMaybe<SpaceMembershipMemberConnectionWhere>
  /** Return SpaceMemberships where one of the related SpaceMembershipMemberConnections match this filter */
  memberConnection_SINGLE?: InputMaybe<SpaceMembershipMemberConnectionWhere>
  /** Return SpaceMemberships where some of the related SpaceMembershipMemberConnections match this filter */
  memberConnection_SOME?: InputMaybe<SpaceMembershipMemberConnectionWhere>
  /** Return SpaceMemberships where all of the related People match this filter */
  member_ALL?: InputMaybe<PersonWhere>
  /** Return SpaceMemberships where none of the related People match this filter */
  member_NONE?: InputMaybe<PersonWhere>
  /** Return SpaceMemberships where one of the related People match this filter */
  member_SINGLE?: InputMaybe<PersonWhere>
  /** Return SpaceMemberships where some of the related People match this filter */
  member_SOME?: InputMaybe<PersonWhere>
  role_EQ?: InputMaybe<SpaceRole>
  role_IN?: InputMaybe<Array<SpaceRole>>
  spaceAggregate?: InputMaybe<SpaceMembershipSpaceAggregateInput>
  /** Return SpaceMemberships where all of the related SpaceMembershipSpaceConnections match this filter */
  spaceConnection_ALL?: InputMaybe<SpaceMembershipSpaceConnectionWhere>
  /** Return SpaceMemberships where none of the related SpaceMembershipSpaceConnections match this filter */
  spaceConnection_NONE?: InputMaybe<SpaceMembershipSpaceConnectionWhere>
  /** Return SpaceMemberships where one of the related SpaceMembershipSpaceConnections match this filter */
  spaceConnection_SINGLE?: InputMaybe<SpaceMembershipSpaceConnectionWhere>
  /** Return SpaceMemberships where some of the related SpaceMembershipSpaceConnections match this filter */
  spaceConnection_SOME?: InputMaybe<SpaceMembershipSpaceConnectionWhere>
  /** Return SpaceMemberships where all of the related Spaces match this filter */
  space_ALL?: InputMaybe<SpaceWhere>
  /** Return SpaceMemberships where none of the related Spaces match this filter */
  space_NONE?: InputMaybe<SpaceWhere>
  /** Return SpaceMemberships where one of the related Spaces match this filter */
  space_SINGLE?: InputMaybe<SpaceWhere>
  /** Return SpaceMemberships where some of the related Spaces match this filter */
  space_SOME?: InputMaybe<SpaceWhere>
}

export type SpaceMembershipsConnection = {
  __typename?: 'SpaceMembershipsConnection'
  aggregate: SpaceMembershipAggregate
  edges: Array<SpaceMembershipEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type SpaceOwnerAggregateInput = {
  AND?: InputMaybe<Array<SpaceOwnerAggregateInput>>
  NOT?: InputMaybe<SpaceOwnerAggregateInput>
  OR?: InputMaybe<Array<SpaceOwnerAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<SpaceOwnerNodeAggregationWhereInput>
}

export type SpaceOwnerConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type SpaceOwnerConnection = {
  __typename?: 'SpaceOwnerConnection'
  edges: Array<SpaceOwnerRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type SpaceOwnerConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type SpaceOwnerConnectionWhere = {
  AND?: InputMaybe<Array<SpaceOwnerConnectionWhere>>
  NOT?: InputMaybe<SpaceOwnerConnectionWhere>
  OR?: InputMaybe<Array<SpaceOwnerConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type SpaceOwnerCreateFieldInput = {
  node: PersonCreateInput
}

export type SpaceOwnerDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<SpaceOwnerConnectionWhere>
}

export type SpaceOwnerDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<SpaceOwnerConnectionWhere>
}

export type SpaceOwnerNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<SpaceOwnerNodeAggregationWhereInput>>
  NOT?: InputMaybe<SpaceOwnerNodeAggregationWhereInput>
  OR?: InputMaybe<Array<SpaceOwnerNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type SpaceOwnerRelationship = {
  __typename?: 'SpaceOwnerRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type SpaceOwnerUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<SpaceOwnerConnectionWhere>
}

export type SpaceOwnerUpdateFieldInput = {
  connect?: InputMaybe<Array<SpaceOwnerConnectFieldInput>>
  create?: InputMaybe<Array<SpaceOwnerCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceOwnerDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceOwnerDisconnectFieldInput>>
  update?: InputMaybe<SpaceOwnerUpdateConnectionInput>
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
  contexts?: InputMaybe<Array<SpaceContextsUpdateFieldInput>>
  createdAt_SET?: InputMaybe<Scalars['DateTime']['input']>
  id_SET?: InputMaybe<Scalars['ID']['input']>
  members?: InputMaybe<Array<SpaceMembersUpdateFieldInput>>
  name_SET?: InputMaybe<Scalars['String']['input']>
  owner?: InputMaybe<Array<SpaceOwnerUpdateFieldInput>>
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
  contextsAggregate?: InputMaybe<SpaceContextsAggregateInput>
  /** Return Spaces where all of the related SpaceContextsConnections match this filter */
  contextsConnection_ALL?: InputMaybe<SpaceContextsConnectionWhere>
  /** Return Spaces where none of the related SpaceContextsConnections match this filter */
  contextsConnection_NONE?: InputMaybe<SpaceContextsConnectionWhere>
  /** Return Spaces where one of the related SpaceContextsConnections match this filter */
  contextsConnection_SINGLE?: InputMaybe<SpaceContextsConnectionWhere>
  /** Return Spaces where some of the related SpaceContextsConnections match this filter */
  contextsConnection_SOME?: InputMaybe<SpaceContextsConnectionWhere>
  /** Return Spaces where all of the related FieldContexts match this filter */
  contexts_ALL?: InputMaybe<FieldContextWhere>
  /** Return Spaces where none of the related FieldContexts match this filter */
  contexts_NONE?: InputMaybe<FieldContextWhere>
  /** Return Spaces where one of the related FieldContexts match this filter */
  contexts_SINGLE?: InputMaybe<FieldContextWhere>
  /** Return Spaces where some of the related FieldContexts match this filter */
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
  membersAggregate?: InputMaybe<SpaceMembersAggregateInput>
  /** Return Spaces where all of the related SpaceMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<SpaceMembersConnectionWhere>
  /** Return Spaces where none of the related SpaceMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<SpaceMembersConnectionWhere>
  /** Return Spaces where one of the related SpaceMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<SpaceMembersConnectionWhere>
  /** Return Spaces where some of the related SpaceMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<SpaceMembersConnectionWhere>
  /** Return Spaces where all of the related SpaceMemberships match this filter */
  members_ALL?: InputMaybe<SpaceMembershipWhere>
  /** Return Spaces where none of the related SpaceMemberships match this filter */
  members_NONE?: InputMaybe<SpaceMembershipWhere>
  /** Return Spaces where one of the related SpaceMemberships match this filter */
  members_SINGLE?: InputMaybe<SpaceMembershipWhere>
  /** Return Spaces where some of the related SpaceMemberships match this filter */
  members_SOME?: InputMaybe<SpaceMembershipWhere>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  ownerAggregate?: InputMaybe<SpaceOwnerAggregateInput>
  /** Return Spaces where all of the related SpaceOwnerConnections match this filter */
  ownerConnection_ALL?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return Spaces where none of the related SpaceOwnerConnections match this filter */
  ownerConnection_NONE?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return Spaces where one of the related SpaceOwnerConnections match this filter */
  ownerConnection_SINGLE?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return Spaces where some of the related SpaceOwnerConnections match this filter */
  ownerConnection_SOME?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return Spaces where all of the related People match this filter */
  owner_ALL?: InputMaybe<PersonWhere>
  /** Return Spaces where none of the related People match this filter */
  owner_NONE?: InputMaybe<PersonWhere>
  /** Return Spaces where one of the related People match this filter */
  owner_SINGLE?: InputMaybe<PersonWhere>
  /** Return Spaces where some of the related People match this filter */
  owner_SOME?: InputMaybe<PersonWhere>
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
  createdBy: Array<Person>
  /** @deprecated Please use field "aggregate" inside "createdByConnection" instead */
  createdByAggregate?: Maybe<StoryPulsePersonCreatedByAggregationSelection>
  createdByConnection: FieldPulseCreatedByConnection
  id: Scalars['ID']['output']
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
export type StoryPulseCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

/**
 * Narrative or reflective pulse.
 * Multi-label: ["FieldPulse", "StoryPulse"]
 */
export type StoryPulseCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

/**
 * Narrative or reflective pulse.
 * Multi-label: ["FieldPulse", "StoryPulse"]
 */
export type StoryPulseCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<FieldPulseCreatedByConnectionSort>>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
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
  createdBy?: InputMaybe<StoryPulseCreatedByFieldInput>
  intensity?: InputMaybe<Scalars['Float']['input']>
  title: Scalars['String']['input']
}

export type StoryPulseCreatedByAggregateInput = {
  AND?: InputMaybe<Array<StoryPulseCreatedByAggregateInput>>
  NOT?: InputMaybe<StoryPulseCreatedByAggregateInput>
  OR?: InputMaybe<Array<StoryPulseCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<StoryPulseCreatedByNodeAggregationWhereInput>
}

export type StoryPulseCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type StoryPulseCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type StoryPulseCreatedByFieldInput = {
  connect?: InputMaybe<Array<StoryPulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<StoryPulseCreatedByCreateFieldInput>>
}

export type StoryPulseCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<StoryPulseCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<StoryPulseCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<StoryPulseCreatedByNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type StoryPulseCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<FieldPulseCreatedByConnectionWhere>
}

export type StoryPulseCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<StoryPulseCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<StoryPulseCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<FieldPulseCreatedByDisconnectFieldInput>>
  update?: InputMaybe<StoryPulseCreatedByUpdateConnectionInput>
}

export type StoryPulseDeleteInput = {
  context?: InputMaybe<Array<FieldPulseContextDeleteFieldInput>>
  createdBy?: InputMaybe<Array<FieldPulseCreatedByDeleteFieldInput>>
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

export type StoryPulsePersonCreatedByAggregationSelection = {
  __typename?: 'StoryPulsePersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<StoryPulsePersonCreatedByNodeAggregateSelection>
}

export type StoryPulsePersonCreatedByNodeAggregateSelection = {
  __typename?: 'StoryPulsePersonCreatedByNodeAggregateSelection'
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
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
  createdBy?: InputMaybe<Array<StoryPulseCreatedByUpdateFieldInput>>
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
  createdByAggregate?: InputMaybe<StoryPulseCreatedByAggregateInput>
  /** Return StoryPulses where all of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return StoryPulses where none of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return StoryPulses where one of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return StoryPulses where some of the related FieldPulseCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<FieldPulseCreatedByConnectionWhere>
  /** Return StoryPulses where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return StoryPulses where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return StoryPulses where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return StoryPulses where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
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

export type UpdateCarePulsesMutationResponse = {
  __typename?: 'UpdateCarePulsesMutationResponse'
  carePulses: Array<CarePulse>
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

export type UpdateCoreValuePulsesMutationResponse = {
  __typename?: 'UpdateCoreValuePulsesMutationResponse'
  coreValuePulses: Array<CoreValuePulse>
  info: UpdateInfo
}

export type UpdateFieldContextsMutationResponse = {
  __typename?: 'UpdateFieldContextsMutationResponse'
  fieldContexts: Array<FieldContext>
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

export type UpdateUpdateUserAiResponsesMutationResponse = {
  __typename?: 'UpdateUpdateUserAiResponsesMutationResponse'
  info: UpdateInfo
  updateUserAiResponses: Array<UpdateUserAiResponse>
}

/** Response when updating user AI preferences. */
export type UpdateUserAiResponse = {
  __typename?: 'UpdateUserAIResponse'
  message: Scalars['String']['output']
  success: Scalars['Boolean']['output']
  user?: Maybe<User>
}

export type UpdateUserAiResponseAggregate = {
  __typename?: 'UpdateUserAIResponseAggregate'
  count: Count
  node: UpdateUserAiResponseAggregateNode
}

export type UpdateUserAiResponseAggregateNode = {
  __typename?: 'UpdateUserAIResponseAggregateNode'
  message: StringAggregateSelection
}

export type UpdateUserAiResponseAggregateSelection = {
  __typename?: 'UpdateUserAIResponseAggregateSelection'
  count: Scalars['Int']['output']
  message: StringAggregateSelection
}

export type UpdateUserAiResponseCreateInput = {
  message: Scalars['String']['input']
  success: Scalars['Boolean']['input']
}

export type UpdateUserAiResponseEdge = {
  __typename?: 'UpdateUserAIResponseEdge'
  cursor: Scalars['String']['output']
  node: UpdateUserAiResponse
}

/** Fields to sort UpdateUserAiResponses by. The order in which sorts are applied is not guaranteed when specifying many fields in one UpdateUserAIResponseSort object. */
export type UpdateUserAiResponseSort = {
  message?: InputMaybe<SortDirection>
  success?: InputMaybe<SortDirection>
}

export type UpdateUserAiResponseUpdateInput = {
  message_SET?: InputMaybe<Scalars['String']['input']>
  success_SET?: InputMaybe<Scalars['Boolean']['input']>
}

export type UpdateUserAiResponseWhere = {
  AND?: InputMaybe<Array<UpdateUserAiResponseWhere>>
  NOT?: InputMaybe<UpdateUserAiResponseWhere>
  OR?: InputMaybe<Array<UpdateUserAiResponseWhere>>
  message_CONTAINS?: InputMaybe<Scalars['String']['input']>
  message_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  message_EQ?: InputMaybe<Scalars['String']['input']>
  message_IN?: InputMaybe<Array<Scalars['String']['input']>>
  message_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  success_EQ?: InputMaybe<Scalars['Boolean']['input']>
}

export type UpdateUserAiResponsesConnection = {
  __typename?: 'UpdateUserAiResponsesConnection'
  aggregate: UpdateUserAiResponseAggregate
  edges: Array<UpdateUserAiResponseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type UpdateUsersMutationResponse = {
  __typename?: 'UpdateUsersMutationResponse'
  info: UpdateInfo
  users: Array<User>
}

export type UpdateWeSpacesMutationResponse = {
  __typename?: 'UpdateWeSpacesMutationResponse'
  info: UpdateInfo
  weSpaces: Array<WeSpace>
}

/**
 * User authentication and preferences.
 * Extends Person with login and feature flags.
 * Multi-label: ["Person", "User"]
 */
export type User = {
  __typename?: 'User'
  aiEnabled: Scalars['Boolean']['output']
  email?: Maybe<Scalars['String']['output']>
  fieldsOfCare?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  id: Scalars['ID']['output']
  lastName: Scalars['String']['output']
  name: Scalars['String']['output']
  ownsSpaces: Array<Space>
  /** @deprecated Please use field "aggregate" inside "ownsSpacesConnection" instead */
  ownsSpacesAggregate?: Maybe<UserSpaceOwnsSpacesAggregationSelection>
  ownsSpacesConnection: UserOwnsSpacesConnection
  passions?: Maybe<Scalars['String']['output']>
  traits?: Maybe<Scalars['String']['output']>
}

/**
 * User authentication and preferences.
 * Extends Person with login and feature flags.
 * Multi-label: ["Person", "User"]
 */
export type UserOwnsSpacesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceSort>>
  where?: InputMaybe<SpaceWhere>
}

/**
 * User authentication and preferences.
 * Extends Person with login and feature flags.
 * Multi-label: ["Person", "User"]
 */
export type UserOwnsSpacesAggregateArgs = {
  where?: InputMaybe<SpaceWhere>
}

/**
 * User authentication and preferences.
 * Extends Person with login and feature flags.
 * Multi-label: ["Person", "User"]
 */
export type UserOwnsSpacesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<UserOwnsSpacesConnectionSort>>
  where?: InputMaybe<UserOwnsSpacesConnectionWhere>
}

export type UserAggregate = {
  __typename?: 'UserAggregate'
  count: Count
  node: UserAggregateNode
}

export type UserAggregateNode = {
  __typename?: 'UserAggregateNode'
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
}

export type UserAggregateSelection = {
  __typename?: 'UserAggregateSelection'
  count: Scalars['Int']['output']
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
}

export type UserCreateInput = {
  aiEnabled: Scalars['Boolean']['input']
  email?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare?: InputMaybe<Scalars['String']['input']>
  firstName: Scalars['String']['input']
  lastName: Scalars['String']['input']
  ownsSpaces?: InputMaybe<UserOwnsSpacesFieldInput>
  passions?: InputMaybe<Scalars['String']['input']>
  traits?: InputMaybe<Scalars['String']['input']>
}

export type UserDeleteInput = {
  ownsSpaces?: InputMaybe<Array<UserOwnsSpacesDeleteFieldInput>>
}

export type UserEdge = {
  __typename?: 'UserEdge'
  cursor: Scalars['String']['output']
  node: User
}

export type UserOwnsSpacesAggregateInput = {
  AND?: InputMaybe<Array<UserOwnsSpacesAggregateInput>>
  NOT?: InputMaybe<UserOwnsSpacesAggregateInput>
  OR?: InputMaybe<Array<UserOwnsSpacesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<UserOwnsSpacesNodeAggregationWhereInput>
}

export type UserOwnsSpacesConnectFieldInput = {
  connect?: InputMaybe<SpaceConnectInput>
  where?: InputMaybe<SpaceConnectWhere>
}

export type UserOwnsSpacesConnection = {
  __typename?: 'UserOwnsSpacesConnection'
  aggregate: UserSpaceOwnsSpacesAggregateSelection
  edges: Array<UserOwnsSpacesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type UserOwnsSpacesConnectionSort = {
  node?: InputMaybe<SpaceSort>
}

export type UserOwnsSpacesConnectionWhere = {
  AND?: InputMaybe<Array<UserOwnsSpacesConnectionWhere>>
  NOT?: InputMaybe<UserOwnsSpacesConnectionWhere>
  OR?: InputMaybe<Array<UserOwnsSpacesConnectionWhere>>
  node?: InputMaybe<SpaceWhere>
}

export type UserOwnsSpacesCreateFieldInput = {
  node: SpaceCreateInput
}

export type UserOwnsSpacesDeleteFieldInput = {
  delete?: InputMaybe<SpaceDeleteInput>
  where?: InputMaybe<UserOwnsSpacesConnectionWhere>
}

export type UserOwnsSpacesDisconnectFieldInput = {
  disconnect?: InputMaybe<SpaceDisconnectInput>
  where?: InputMaybe<UserOwnsSpacesConnectionWhere>
}

export type UserOwnsSpacesFieldInput = {
  connect?: InputMaybe<Array<UserOwnsSpacesConnectFieldInput>>
  create?: InputMaybe<Array<UserOwnsSpacesCreateFieldInput>>
}

export type UserOwnsSpacesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<UserOwnsSpacesNodeAggregationWhereInput>>
  NOT?: InputMaybe<UserOwnsSpacesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<UserOwnsSpacesNodeAggregationWhereInput>>
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

export type UserOwnsSpacesRelationship = {
  __typename?: 'UserOwnsSpacesRelationship'
  cursor: Scalars['String']['output']
  node: Space
}

export type UserOwnsSpacesUpdateConnectionInput = {
  node?: InputMaybe<SpaceUpdateInput>
  where?: InputMaybe<UserOwnsSpacesConnectionWhere>
}

export type UserOwnsSpacesUpdateFieldInput = {
  connect?: InputMaybe<Array<UserOwnsSpacesConnectFieldInput>>
  create?: InputMaybe<Array<UserOwnsSpacesCreateFieldInput>>
  delete?: InputMaybe<Array<UserOwnsSpacesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<UserOwnsSpacesDisconnectFieldInput>>
  update?: InputMaybe<UserOwnsSpacesUpdateConnectionInput>
}

/** Fields to sort Users by. The order in which sorts are applied is not guaranteed when specifying many fields in one UserSort object. */
export type UserSort = {
  aiEnabled?: InputMaybe<SortDirection>
  email?: InputMaybe<SortDirection>
  fieldsOfCare?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  passions?: InputMaybe<SortDirection>
  traits?: InputMaybe<SortDirection>
}

export type UserSpaceOwnsSpacesAggregateSelection = {
  __typename?: 'UserSpaceOwnsSpacesAggregateSelection'
  count: CountConnection
  node?: Maybe<UserSpaceOwnsSpacesNodeAggregateSelection>
}

export type UserSpaceOwnsSpacesAggregationSelection = {
  __typename?: 'UserSpaceOwnsSpacesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<UserSpaceOwnsSpacesNodeAggregateSelection>
}

export type UserSpaceOwnsSpacesNodeAggregateSelection = {
  __typename?: 'UserSpaceOwnsSpacesNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type UserUpdateInput = {
  aiEnabled_SET?: InputMaybe<Scalars['Boolean']['input']>
  email_SET?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_SET?: InputMaybe<Scalars['String']['input']>
  firstName_SET?: InputMaybe<Scalars['String']['input']>
  lastName_SET?: InputMaybe<Scalars['String']['input']>
  ownsSpaces?: InputMaybe<Array<UserOwnsSpacesUpdateFieldInput>>
  passions_SET?: InputMaybe<Scalars['String']['input']>
  traits_SET?: InputMaybe<Scalars['String']['input']>
}

export type UserWhere = {
  AND?: InputMaybe<Array<UserWhere>>
  NOT?: InputMaybe<UserWhere>
  OR?: InputMaybe<Array<UserWhere>>
  aiEnabled_EQ?: InputMaybe<Scalars['Boolean']['input']>
  email_CONTAINS?: InputMaybe<Scalars['String']['input']>
  email_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  email_EQ?: InputMaybe<Scalars['String']['input']>
  email_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  email_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_CONTAINS?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_EQ?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  fieldsOfCare_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  ownsSpacesAggregate?: InputMaybe<UserOwnsSpacesAggregateInput>
  /** Return Users where all of the related UserOwnsSpacesConnections match this filter */
  ownsSpacesConnection_ALL?: InputMaybe<UserOwnsSpacesConnectionWhere>
  /** Return Users where none of the related UserOwnsSpacesConnections match this filter */
  ownsSpacesConnection_NONE?: InputMaybe<UserOwnsSpacesConnectionWhere>
  /** Return Users where one of the related UserOwnsSpacesConnections match this filter */
  ownsSpacesConnection_SINGLE?: InputMaybe<UserOwnsSpacesConnectionWhere>
  /** Return Users where some of the related UserOwnsSpacesConnections match this filter */
  ownsSpacesConnection_SOME?: InputMaybe<UserOwnsSpacesConnectionWhere>
  /** Return Users where all of the related Spaces match this filter */
  ownsSpaces_ALL?: InputMaybe<SpaceWhere>
  /** Return Users where none of the related Spaces match this filter */
  ownsSpaces_NONE?: InputMaybe<SpaceWhere>
  /** Return Users where one of the related Spaces match this filter */
  ownsSpaces_SINGLE?: InputMaybe<SpaceWhere>
  /** Return Users where some of the related Spaces match this filter */
  ownsSpaces_SOME?: InputMaybe<SpaceWhere>
  passions_CONTAINS?: InputMaybe<Scalars['String']['input']>
  passions_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  passions_EQ?: InputMaybe<Scalars['String']['input']>
  passions_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  passions_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  traits_CONTAINS?: InputMaybe<Scalars['String']['input']>
  traits_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  traits_EQ?: InputMaybe<Scalars['String']['input']>
  traits_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  traits_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type UsersConnection = {
  __typename?: 'UsersConnection'
  aggregate: UserAggregate
  edges: Array<UserEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 * Authorization: Owner and members can access. Non-members cannot.
 */
export type WeSpace = Space & {
  __typename?: 'WeSpace'
  contexts: Array<FieldContext>
  /** @deprecated Please use field "aggregate" inside "contextsConnection" instead */
  contextsAggregate?: Maybe<WeSpaceFieldContextContextsAggregationSelection>
  contextsConnection: SpaceContextsConnection
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  members: Array<SpaceMembership>
  /** @deprecated Please use field "aggregate" inside "membersConnection" instead */
  membersAggregate?: Maybe<WeSpaceSpaceMembershipMembersAggregationSelection>
  membersConnection: SpaceMembersConnection
  name: Scalars['String']['output']
  owner: Array<Person>
  /** @deprecated Please use field "aggregate" inside "ownerConnection" instead */
  ownerAggregate?: Maybe<WeSpacePersonOwnerAggregationSelection>
  ownerConnection: SpaceOwnerConnection
  visibility: SpaceVisibility
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 * Authorization: Owner and members can access. Non-members cannot.
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
 * Authorization: Owner and members can access. Non-members cannot.
 */
export type WeSpaceContextsAggregateArgs = {
  where?: InputMaybe<FieldContextWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 * Authorization: Owner and members can access. Non-members cannot.
 */
export type WeSpaceContextsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceContextsConnectionSort>>
  where?: InputMaybe<SpaceContextsConnectionWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 * Authorization: Owner and members can access. Non-members cannot.
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
 * Authorization: Owner and members can access. Non-members cannot.
 */
export type WeSpaceMembersAggregateArgs = {
  where?: InputMaybe<SpaceMembershipWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 * Authorization: Owner and members can access. Non-members cannot.
 */
export type WeSpaceMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceMembersConnectionSort>>
  where?: InputMaybe<SpaceMembersConnectionWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 * Authorization: Owner and members can access. Non-members cannot.
 */
export type WeSpaceOwnerArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 * Authorization: Owner and members can access. Non-members cannot.
 */
export type WeSpaceOwnerAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

/**
 * A collaborative space shared with other people.
 * Has an owner and members who can all participate.
 * Multi-label: ["Space", "WeSpace"]
 * Authorization: Owner and members can access. Non-members cannot.
 */
export type WeSpaceOwnerConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<SpaceOwnerConnectionSort>>
  where?: InputMaybe<SpaceOwnerConnectionWhere>
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

export type WeSpaceConnectInput = {
  contexts?: InputMaybe<Array<WeSpaceContextsConnectFieldInput>>
  members?: InputMaybe<Array<WeSpaceMembersConnectFieldInput>>
  owner?: InputMaybe<Array<WeSpaceOwnerConnectFieldInput>>
}

export type WeSpaceConnectWhere = {
  node: WeSpaceWhere
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

export type WeSpaceContextsCreateFieldInput = {
  node: FieldContextCreateInput
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

export type WeSpaceContextsUpdateConnectionInput = {
  node?: InputMaybe<FieldContextUpdateInput>
  where?: InputMaybe<SpaceContextsConnectionWhere>
}

export type WeSpaceContextsUpdateFieldInput = {
  connect?: InputMaybe<Array<WeSpaceContextsConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceContextsCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceContextsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceContextsDisconnectFieldInput>>
  update?: InputMaybe<WeSpaceContextsUpdateConnectionInput>
}

export type WeSpaceCreateInput = {
  contexts?: InputMaybe<WeSpaceContextsFieldInput>
  createdAt: Scalars['DateTime']['input']
  members?: InputMaybe<WeSpaceMembersFieldInput>
  name: Scalars['String']['input']
  owner?: InputMaybe<WeSpaceOwnerFieldInput>
  visibility: SpaceVisibility
}

export type WeSpaceDeleteInput = {
  contexts?: InputMaybe<Array<SpaceContextsDeleteFieldInput>>
  members?: InputMaybe<Array<SpaceMembersDeleteFieldInput>>
  owner?: InputMaybe<Array<SpaceOwnerDeleteFieldInput>>
}

export type WeSpaceDisconnectInput = {
  contexts?: InputMaybe<Array<SpaceContextsDisconnectFieldInput>>
  members?: InputMaybe<Array<SpaceMembersDisconnectFieldInput>>
  owner?: InputMaybe<Array<SpaceOwnerDisconnectFieldInput>>
}

export type WeSpaceEdge = {
  __typename?: 'WeSpaceEdge'
  cursor: Scalars['String']['output']
  node: WeSpace
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

export type WeSpaceMembersCreateFieldInput = {
  node: SpaceMembershipCreateInput
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

export type WeSpaceMembersUpdateConnectionInput = {
  node?: InputMaybe<SpaceMembershipUpdateInput>
  where?: InputMaybe<SpaceMembersConnectionWhere>
}

export type WeSpaceMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<WeSpaceMembersConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceMembersCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceMembersDisconnectFieldInput>>
  update?: InputMaybe<WeSpaceMembersUpdateConnectionInput>
}

export type WeSpaceOwnerAggregateInput = {
  AND?: InputMaybe<Array<WeSpaceOwnerAggregateInput>>
  NOT?: InputMaybe<WeSpaceOwnerAggregateInput>
  OR?: InputMaybe<Array<WeSpaceOwnerAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<WeSpaceOwnerNodeAggregationWhereInput>
}

export type WeSpaceOwnerConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type WeSpaceOwnerCreateFieldInput = {
  node: PersonCreateInput
}

export type WeSpaceOwnerFieldInput = {
  connect?: InputMaybe<Array<WeSpaceOwnerConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceOwnerCreateFieldInput>>
}

export type WeSpaceOwnerNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<WeSpaceOwnerNodeAggregationWhereInput>>
  NOT?: InputMaybe<WeSpaceOwnerNodeAggregationWhereInput>
  OR?: InputMaybe<Array<WeSpaceOwnerNodeAggregationWhereInput>>
  email_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  email_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  email_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  email_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fieldsOfCare_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fieldsOfCare_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  firstName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  firstName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  firstName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  lastName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  lastName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  lastName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  passions_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  passions_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  passions_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  traits_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  traits_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  traits_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type WeSpaceOwnerUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<SpaceOwnerConnectionWhere>
}

export type WeSpaceOwnerUpdateFieldInput = {
  connect?: InputMaybe<Array<WeSpaceOwnerConnectFieldInput>>
  create?: InputMaybe<Array<WeSpaceOwnerCreateFieldInput>>
  delete?: InputMaybe<Array<SpaceOwnerDeleteFieldInput>>
  disconnect?: InputMaybe<Array<SpaceOwnerDisconnectFieldInput>>
  update?: InputMaybe<WeSpaceOwnerUpdateConnectionInput>
}

export type WeSpacePersonOwnerAggregationSelection = {
  __typename?: 'WeSpacePersonOwnerAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<WeSpacePersonOwnerNodeAggregateSelection>
}

export type WeSpacePersonOwnerNodeAggregateSelection = {
  __typename?: 'WeSpacePersonOwnerNodeAggregateSelection'
  email: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  /** @deprecated aggregation of ID fields are deprecated and will be removed */
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  passions: StringAggregateSelection
  traits: StringAggregateSelection
}

/** Fields to sort WeSpaces by. The order in which sorts are applied is not guaranteed when specifying many fields in one WeSpaceSort object. */
export type WeSpaceSort = {
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  visibility?: InputMaybe<SortDirection>
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
  owner?: InputMaybe<Array<WeSpaceOwnerUpdateFieldInput>>
  visibility_SET?: InputMaybe<SpaceVisibility>
}

export type WeSpaceWhere = {
  AND?: InputMaybe<Array<WeSpaceWhere>>
  NOT?: InputMaybe<WeSpaceWhere>
  OR?: InputMaybe<Array<WeSpaceWhere>>
  contextsAggregate?: InputMaybe<WeSpaceContextsAggregateInput>
  /** Return WeSpaces where all of the related SpaceContextsConnections match this filter */
  contextsConnection_ALL?: InputMaybe<SpaceContextsConnectionWhere>
  /** Return WeSpaces where none of the related SpaceContextsConnections match this filter */
  contextsConnection_NONE?: InputMaybe<SpaceContextsConnectionWhere>
  /** Return WeSpaces where one of the related SpaceContextsConnections match this filter */
  contextsConnection_SINGLE?: InputMaybe<SpaceContextsConnectionWhere>
  /** Return WeSpaces where some of the related SpaceContextsConnections match this filter */
  contextsConnection_SOME?: InputMaybe<SpaceContextsConnectionWhere>
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
  /** Return WeSpaces where all of the related SpaceMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<SpaceMembersConnectionWhere>
  /** Return WeSpaces where none of the related SpaceMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<SpaceMembersConnectionWhere>
  /** Return WeSpaces where one of the related SpaceMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<SpaceMembersConnectionWhere>
  /** Return WeSpaces where some of the related SpaceMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<SpaceMembersConnectionWhere>
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
  ownerAggregate?: InputMaybe<WeSpaceOwnerAggregateInput>
  /** Return WeSpaces where all of the related SpaceOwnerConnections match this filter */
  ownerConnection_ALL?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return WeSpaces where none of the related SpaceOwnerConnections match this filter */
  ownerConnection_NONE?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return WeSpaces where one of the related SpaceOwnerConnections match this filter */
  ownerConnection_SINGLE?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return WeSpaces where some of the related SpaceOwnerConnections match this filter */
  ownerConnection_SOME?: InputMaybe<SpaceOwnerConnectionWhere>
  /** Return WeSpaces where all of the related People match this filter */
  owner_ALL?: InputMaybe<PersonWhere>
  /** Return WeSpaces where none of the related People match this filter */
  owner_NONE?: InputMaybe<PersonWhere>
  /** Return WeSpaces where one of the related People match this filter */
  owner_SINGLE?: InputMaybe<PersonWhere>
  /** Return WeSpaces where some of the related People match this filter */
  owner_SOME?: InputMaybe<PersonWhere>
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
      meSpace: Array<{
        __typename?: 'MeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
        createdAt: any
      }>
      weSpace: Array<{
        __typename?: 'WeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
        createdAt: any
      }>
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
      meSpace: Array<{
        __typename?: 'MeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
      }>
      weSpace: Array<{
        __typename?: 'WeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
      }>
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

export type CreateGoalPulseMutationVariables = Exact<{
  input: Array<GoalPulseCreateInput> | GoalPulseCreateInput
}>

export type CreateGoalPulseMutation = {
  __typename?: 'Mutation'
  createGoalPulses: {
    __typename?: 'CreateGoalPulsesMutationResponse'
    goalPulses: Array<{
      __typename?: 'GoalPulse'
      id: string
      title: string
      content: string
      status: GoalStatus
      horizon?: GoalHorizon | null
      intensity?: number | null
      createdAt: any
      createdBy: Array<{ __typename?: 'Person'; id: string; name: string }>
      context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    }>
    info: {
      __typename?: 'CreateInfo'
      nodesCreated: number
      relationshipsCreated: number
    }
  }
}

export type CreateResourcePulseMutationVariables = Exact<{
  input: Array<ResourcePulseCreateInput> | ResourcePulseCreateInput
}>

export type CreateResourcePulseMutation = {
  __typename?: 'Mutation'
  createResourcePulses: {
    __typename?: 'CreateResourcePulsesMutationResponse'
    resourcePulses: Array<{
      __typename?: 'ResourcePulse'
      id: string
      title: string
      content: string
      resourceType: string
      availability?: number | null
      intensity?: number | null
      createdAt: any
      createdBy: Array<{ __typename?: 'Person'; id: string; name: string }>
      context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    }>
    info: {
      __typename?: 'CreateInfo'
      nodesCreated: number
      relationshipsCreated: number
    }
  }
}

export type CreateStoryPulseMutationVariables = Exact<{
  input: Array<StoryPulseCreateInput> | StoryPulseCreateInput
}>

export type CreateStoryPulseMutation = {
  __typename?: 'Mutation'
  createStoryPulses: {
    __typename?: 'CreateStoryPulsesMutationResponse'
    storyPulses: Array<{
      __typename?: 'StoryPulse'
      id: string
      title: string
      content: string
      intensity?: number | null
      createdAt: any
      createdBy: Array<{ __typename?: 'Person'; id: string; name: string }>
      context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    }>
    info: {
      __typename?: 'CreateInfo'
      nodesCreated: number
      relationshipsCreated: number
    }
  }
}

export type UpdateGoalPulseMutationVariables = Exact<{
  where: GoalPulseWhere
  update: GoalPulseUpdateInput
}>

export type UpdateGoalPulseMutation = {
  __typename?: 'Mutation'
  updateGoalPulses: {
    __typename?: 'UpdateGoalPulsesMutationResponse'
    goalPulses: Array<{
      __typename?: 'GoalPulse'
      id: string
      title: string
      content: string
      status: GoalStatus
      horizon?: GoalHorizon | null
      intensity?: number | null
      createdAt: any
      createdBy: Array<{ __typename?: 'Person'; id: string; name: string }>
      context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    }>
  }
}

export type UpdateResourcePulseMutationVariables = Exact<{
  where: ResourcePulseWhere
  update: ResourcePulseUpdateInput
}>

export type UpdateResourcePulseMutation = {
  __typename?: 'Mutation'
  updateResourcePulses: {
    __typename?: 'UpdateResourcePulsesMutationResponse'
    resourcePulses: Array<{
      __typename?: 'ResourcePulse'
      id: string
      title: string
      content: string
      resourceType: string
      availability?: number | null
      intensity?: number | null
      createdAt: any
      createdBy: Array<{ __typename?: 'Person'; id: string; name: string }>
      context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    }>
  }
}

export type UpdateStoryPulseMutationVariables = Exact<{
  where: StoryPulseWhere
  update: StoryPulseUpdateInput
}>

export type UpdateStoryPulseMutation = {
  __typename?: 'Mutation'
  updateStoryPulses: {
    __typename?: 'UpdateStoryPulsesMutationResponse'
    storyPulses: Array<{
      __typename?: 'StoryPulse'
      id: string
      title: string
      content: string
      intensity?: number | null
      createdAt: any
      createdBy: Array<{ __typename?: 'Person'; id: string; name: string }>
      context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    }>
  }
}

export type DeleteGoalPulseMutationVariables = Exact<{
  where: GoalPulseWhere
}>

export type DeleteGoalPulseMutation = {
  __typename?: 'Mutation'
  deleteGoalPulses: {
    __typename?: 'DeleteInfo'
    nodesDeleted: number
    relationshipsDeleted: number
  }
}

export type DeleteResonancesByPulseMutationVariables = Exact<{
  pulseId: Scalars['ID']['input']
}>

export type DeleteResonancesByPulseMutation = {
  __typename?: 'Mutation'
  deleteResonanceLinks: {
    __typename?: 'DeleteInfo'
    nodesDeleted: number
    relationshipsDeleted: number
  }
}

export type DeleteResourcePulseMutationVariables = Exact<{
  where: ResourcePulseWhere
}>

export type DeleteResourcePulseMutation = {
  __typename?: 'Mutation'
  deleteResourcePulses: {
    __typename?: 'DeleteInfo'
    nodesDeleted: number
    relationshipsDeleted: number
  }
}

export type DeleteStoryPulseMutationVariables = Exact<{
  where: StoryPulseWhere
}>

export type DeleteStoryPulseMutation = {
  __typename?: 'Mutation'
  deleteStoryPulses: {
    __typename?: 'DeleteInfo'
    nodesDeleted: number
    relationshipsDeleted: number
  }
}

export type CreateResonanceLinkMutationVariables = Exact<{
  input: Array<ResonanceLinkCreateInput> | ResonanceLinkCreateInput
}>

export type CreateResonanceLinkMutation = {
  __typename?: 'Mutation'
  createResonanceLinks: {
    __typename?: 'CreateResonanceLinksMutationResponse'
    resonanceLinks: Array<{
      __typename?: 'ResonanceLink'
      id: string
      label: string
      description?: string | null
      confidence: number
      evidence?: string | null
      createdAt: any
      source: Array<
        | { __typename?: 'CarePulse' }
        | { __typename?: 'CoreValuePulse' }
        | {
            __typename?: 'GoalPulse'
            id: string
            title: string
            content: string
            type: 'GoalPulse'
          }
        | {
            __typename?: 'ResourcePulse'
            id: string
            title: string
            content: string
            type: 'ResourcePulse'
          }
        | {
            __typename?: 'StoryPulse'
            id: string
            title: string
            content: string
            type: 'StoryPulse'
          }
      >
      target: Array<
        | { __typename?: 'CarePulse' }
        | { __typename?: 'CoreValuePulse' }
        | {
            __typename?: 'GoalPulse'
            id: string
            title: string
            content: string
            type: 'GoalPulse'
          }
        | {
            __typename?: 'ResourcePulse'
            id: string
            title: string
            content: string
            type: 'ResourcePulse'
          }
        | {
            __typename?: 'StoryPulse'
            id: string
            title: string
            content: string
            type: 'StoryPulse'
          }
      >
      context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    }>
    info: {
      __typename?: 'CreateInfo'
      nodesCreated: number
      relationshipsCreated: number
    }
  }
}

export type UpdateResonanceLinkMutationVariables = Exact<{
  where: ResonanceLinkWhere
  update: ResonanceLinkUpdateInput
}>

export type UpdateResonanceLinkMutation = {
  __typename?: 'Mutation'
  updateResonanceLinks: {
    __typename?: 'UpdateResonanceLinksMutationResponse'
    resonanceLinks: Array<{
      __typename?: 'ResonanceLink'
      id: string
      label: string
      description?: string | null
      confidence: number
      evidence?: string | null
      createdAt: any
      source: Array<
        | { __typename?: 'CarePulse' }
        | { __typename?: 'CoreValuePulse' }
        | { __typename?: 'GoalPulse'; id: string; title: string }
        | { __typename?: 'ResourcePulse'; id: string; title: string }
        | { __typename?: 'StoryPulse'; id: string; title: string }
      >
      target: Array<
        | { __typename?: 'CarePulse' }
        | { __typename?: 'CoreValuePulse' }
        | { __typename?: 'GoalPulse'; id: string; title: string }
        | { __typename?: 'ResourcePulse'; id: string; title: string }
        | { __typename?: 'StoryPulse'; id: string; title: string }
      >
    }>
    info: {
      __typename?: 'UpdateInfo'
      relationshipsCreated: number
      relationshipsDeleted: number
    }
  }
}

export type DeleteResonanceLinkMutationVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type DeleteResonanceLinkMutation = {
  __typename?: 'Mutation'
  deleteResonanceLinks: {
    __typename?: 'DeleteInfo'
    nodesDeleted: number
    relationshipsDeleted: number
  }
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

export type UpdateMeSpaceMutationVariables = Exact<{
  where: MeSpaceWhere
  update: MeSpaceUpdateInput
}>

export type UpdateMeSpaceMutation = {
  __typename?: 'Mutation'
  updateMeSpaces: {
    __typename?: 'UpdateMeSpacesMutationResponse'
    meSpaces: Array<{
      __typename?: 'MeSpace'
      id: string
      name: string
      visibility: SpaceVisibility
      createdAt: any
      owner: Array<{ __typename?: 'Person'; id: string; name: string }>
      contexts: Array<{
        __typename?: 'FieldContext'
        id: string
        title: string
      }>
    }>
  }
}

export type UpdateWeSpaceMutationVariables = Exact<{
  where: WeSpaceWhere
  update: WeSpaceUpdateInput
}>

export type UpdateWeSpaceMutation = {
  __typename?: 'Mutation'
  updateWeSpaces: {
    __typename?: 'UpdateWeSpacesMutationResponse'
    weSpaces: Array<{
      __typename?: 'WeSpace'
      id: string
      name: string
      visibility: SpaceVisibility
      createdAt: any
      owner: Array<{ __typename?: 'Person'; id: string; name: string }>
      contexts: Array<{
        __typename?: 'FieldContext'
        id: string
        title: string
      }>
    }>
  }
}

export type DeleteMeSpaceMutationVariables = Exact<{
  where: MeSpaceWhere
}>

export type DeleteMeSpaceMutation = {
  __typename?: 'Mutation'
  deleteMeSpaces: {
    __typename?: 'DeleteInfo'
    nodesDeleted: number
    relationshipsDeleted: number
  }
}

export type DeleteWeSpaceMutationVariables = Exact<{
  where: WeSpaceWhere
}>

export type DeleteWeSpaceMutation = {
  __typename?: 'Mutation'
  deleteWeSpaces: {
    __typename?: 'DeleteInfo'
    nodesDeleted: number
    relationshipsDeleted: number
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
          __typename: 'MeSpace'
          id: string
          name: string
          visibility: SpaceVisibility
          createdAt: any
        }
      | {
          __typename: 'WeSpace'
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
          __typename: 'CarePulse'
          id: string
          title: string
          content: string
          createdAt: any
        }
      | {
          __typename: 'CoreValuePulse'
          id: string
          title: string
          content: string
          createdAt: any
        }
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
    owner: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
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

export type GetResonanceLinksByContextQueryVariables = Exact<{
  contextId: Scalars['ID']['input']
}>

export type GetResonanceLinksByContextQuery = {
  __typename?: 'Query'
  fieldContexts: Array<{
    __typename?: 'FieldContext'
    id: string
    title: string
    resonances: Array<{
      __typename?: 'ResonanceLink'
      id: string
      label: string
      description?: string | null
      confidence: number
      evidence?: string | null
      createdAt: any
      source: Array<
        | { __typename?: 'CarePulse' }
        | { __typename?: 'CoreValuePulse' }
        | {
            __typename?: 'GoalPulse'
            id: string
            title: string
            content: string
            type: 'GoalPulse'
          }
        | {
            __typename?: 'ResourcePulse'
            id: string
            title: string
            content: string
            type: 'ResourcePulse'
          }
        | {
            __typename?: 'StoryPulse'
            id: string
            title: string
            content: string
            type: 'StoryPulse'
          }
      >
      target: Array<
        | { __typename?: 'CarePulse' }
        | { __typename?: 'CoreValuePulse' }
        | {
            __typename?: 'GoalPulse'
            id: string
            title: string
            content: string
            type: 'GoalPulse'
          }
        | {
            __typename?: 'ResourcePulse'
            id: string
            title: string
            content: string
            type: 'ResourcePulse'
          }
        | {
            __typename?: 'StoryPulse'
            id: string
            title: string
            content: string
            type: 'StoryPulse'
          }
      >
    }>
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
              | { __typename?: 'CarePulse'; id: string }
              | { __typename?: 'CoreValuePulse'; id: string }
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
              | { __typename?: 'CarePulse'; id: string }
              | { __typename?: 'CoreValuePulse'; id: string }
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
    owner: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
    }>
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<{
        __typename?: 'Person'
        id: string
        firstName: string
        lastName: string
      }>
    }>
  }>
  weSpaces: Array<{
    __typename?: 'WeSpace'
    id: string
    name: string
    visibility: SpaceVisibility
    createdAt: any
    owner: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
    }>
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<{
        __typename?: 'Person'
        id: string
        firstName: string
        lastName: string
      }>
    }>
  }>
}

export type GetGraphResonancesQueryVariables = Exact<{ [key: string]: never }>

export type GetGraphResonancesQuery = {
  __typename?: 'Query'
  resonanceLinks: Array<{
    __typename?: 'ResonanceLink'
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
              | { __typename?: 'CarePulse' }
              | { __typename?: 'CoreValuePulse' }
              | {
                  __typename?: 'GoalPulse'
                  id: string
                  content: string
                  createdAt: any
                  status: GoalStatus
                  intensity?: number | null
                  createdBy: Array<{
                    __typename?: 'Person'
                    id: string
                    firstName: string
                    lastName: string
                    email?: string | null
                  }>
                }
              | {
                  __typename?: 'ResourcePulse'
                  id: string
                  content: string
                  createdAt: any
                  resourceType: string
                  intensity?: number | null
                  createdBy: Array<{
                    __typename?: 'Person'
                    id: string
                    firstName: string
                    lastName: string
                    email?: string | null
                  }>
                }
              | {
                  __typename?: 'StoryPulse'
                  id: string
                  content: string
                  createdAt: any
                  intensity?: number | null
                  createdBy: Array<{
                    __typename?: 'Person'
                    id: string
                    firstName: string
                    lastName: string
                    email?: string | null
                  }>
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
              | { __typename?: 'CarePulse' }
              | { __typename?: 'CoreValuePulse' }
              | {
                  __typename?: 'GoalPulse'
                  id: string
                  content: string
                  createdAt: any
                  status: GoalStatus
                  intensity?: number | null
                  createdBy: Array<{
                    __typename?: 'Person'
                    id: string
                    firstName: string
                    lastName: string
                    email?: string | null
                  }>
                }
              | {
                  __typename?: 'ResourcePulse'
                  id: string
                  content: string
                  createdAt: any
                  resourceType: string
                  intensity?: number | null
                  createdBy: Array<{
                    __typename?: 'Person'
                    id: string
                    firstName: string
                    lastName: string
                    email?: string | null
                  }>
                }
              | {
                  __typename?: 'StoryPulse'
                  id: string
                  content: string
                  createdAt: any
                  intensity?: number | null
                  createdBy: Array<{
                    __typename?: 'Person'
                    id: string
                    firstName: string
                    lastName: string
                    email?: string | null
                  }>
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
        | { __typename?: 'CarePulse' }
        | { __typename?: 'CoreValuePulse' }
        | {
            __typename?: 'GoalPulse'
            id: string
            content: string
            createdAt: any
            status: GoalStatus
            intensity?: number | null
            createdBy: Array<{
              __typename?: 'Person'
              id: string
              firstName: string
              lastName: string
              email?: string | null
            }>
          }
        | {
            __typename?: 'ResourcePulse'
            id: string
            content: string
            createdAt: any
            resourceType: string
            intensity?: number | null
            createdBy: Array<{
              __typename?: 'Person'
              id: string
              firstName: string
              lastName: string
              email?: string | null
            }>
          }
        | {
            __typename?: 'StoryPulse'
            id: string
            content: string
            createdAt: any
            intensity?: number | null
            createdBy: Array<{
              __typename?: 'Person'
              id: string
              firstName: string
              lastName: string
              email?: string | null
            }>
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
        | { __typename?: 'CarePulse' }
        | { __typename?: 'CoreValuePulse' }
        | {
            __typename?: 'GoalPulse'
            id: string
            content: string
            createdAt: any
            status: GoalStatus
            intensity?: number | null
            createdBy: Array<{
              __typename?: 'Person'
              id: string
              firstName: string
              lastName: string
              email?: string | null
            }>
          }
        | {
            __typename?: 'ResourcePulse'
            id: string
            content: string
            createdAt: any
            resourceType: string
            intensity?: number | null
            createdBy: Array<{
              __typename?: 'Person'
              id: string
              firstName: string
              lastName: string
              email?: string | null
            }>
          }
        | {
            __typename?: 'StoryPulse'
            id: string
            content: string
            createdAt: any
            intensity?: number | null
            createdBy: Array<{
              __typename?: 'Person'
              id: string
              firstName: string
              lastName: string
              email?: string | null
            }>
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
  resonanceLinks: Array<{
    __typename?: 'ResonanceLink'
    id: string
    label: string
    description?: string | null
    source: Array<
      | { __typename?: 'CarePulse' }
      | { __typename?: 'CoreValuePulse' }
      | {
          __typename?: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
      | {
          __typename?: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
      | {
          __typename?: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
    >
    target: Array<
      | { __typename?: 'CarePulse' }
      | { __typename?: 'CoreValuePulse' }
      | {
          __typename?: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
      | {
          __typename?: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
      | {
          __typename?: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
    >
  }>
}

export type GetResonanceWithLinksQueryVariables = Exact<{
  resonanceId: Scalars['ID']['input']
}>

export type GetResonanceWithLinksQuery = {
  __typename?: 'Query'
  resonanceLinks: Array<{
    __typename?: 'ResonanceLink'
    id: string
    label: string
    description?: string | null
    source: Array<
      | { __typename: 'CarePulse' }
      | { __typename: 'CoreValuePulse' }
      | {
          __typename: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
      | {
          __typename: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
      | {
          __typename: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
    >
    target: Array<
      | { __typename: 'CarePulse' }
      | { __typename: 'CoreValuePulse' }
      | {
          __typename: 'GoalPulse'
          id: string
          content: string
          createdAt: any
          status: GoalStatus
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
      | {
          __typename: 'ResourcePulse'
          id: string
          content: string
          createdAt: any
          resourceType: string
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
      | {
          __typename: 'StoryPulse'
          id: string
          content: string
          createdAt: any
          intensity?: number | null
          createdBy: Array<{
            __typename?: 'Person'
            id: string
            firstName: string
            lastName: string
            email?: string | null
          }>
        }
    >
  }>
}

export type GetAllResonancesQueryVariables = Exact<{ [key: string]: never }>

export type GetAllResonancesQuery = {
  __typename?: 'Query'
  resonanceLinks: Array<{
    __typename?: 'ResonanceLink'
    id: string
    label: string
    description?: string | null
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
    label: string
    description?: string | null
    confidence: number
    source: Array<
      | { __typename: 'CarePulse' }
      | { __typename: 'CoreValuePulse' }
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
      | { __typename: 'CarePulse' }
      | { __typename: 'CoreValuePulse' }
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

export type GetAllResonanceLinksWithResonancesQueryVariables = Exact<{
  [key: string]: never
}>

export type GetAllResonanceLinksWithResonancesQuery = {
  __typename?: 'Query'
  resonanceLinks: Array<{
    __typename?: 'ResonanceLink'
    id: string
    label: string
    description?: string | null
    confidence: number
    source: Array<
      | { __typename: 'CarePulse' }
      | { __typename: 'CoreValuePulse' }
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
      | { __typename: 'CarePulse' }
      | { __typename: 'CoreValuePulse' }
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
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      name: string
      email?: string | null
    }>
  }>
  resourcePulses: Array<{
    __typename: 'ResourcePulse'
    id: string
    content: string
    createdAt: any
    intensity?: number | null
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      name: string
      email?: string | null
    }>
  }>
  storyPulses: Array<{
    __typename: 'StoryPulse'
    id: string
    content: string
    createdAt: any
    intensity?: number | null
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      name: string
      email?: string | null
    }>
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
    weSpace: Array<{
      __typename?: 'WeSpace'
      id: string
      name: string
      visibility: SpaceVisibility
    }>
    pulses: Array<
      | { __typename?: 'CarePulse' }
      | { __typename?: 'CoreValuePulse' }
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
    owner: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      email?: string | null
    }>
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<{
        __typename?: 'Person'
        id: string
        firstName: string
        lastName: string
        email?: string | null
      }>
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
    owner: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      name: string
      email?: string | null
    }>
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<{
        __typename?: 'Person'
        id: string
        firstName: string
        lastName: string
        email?: string | null
      }>
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
    firstName: string
    lastName: string
    name: string
    email?: string | null
    traits?: string | null
    passions?: string | null
    fieldsOfCare?: string | null
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
    traits?: string | null
    passions?: string | null
    fieldsOfCare?: string | null
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
                  __typename?: 'CarePulse'
                  id: string
                  title: string
                  intensity?: number | null
                }
              | {
                  __typename?: 'CoreValuePulse'
                  id: string
                  title: string
                  intensity?: number | null
                }
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
                  __typename?: 'CarePulse'
                  id: string
                  title: string
                  intensity?: number | null
                }
              | {
                  __typename?: 'CoreValuePulse'
                  id: string
                  title: string
                  intensity?: number | null
                }
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
    memberOf: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
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
    traits?: string | null
    passions?: string | null
    fieldsOfCare?: string | null
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
    traits?: string | null
    passions?: string | null
    fieldsOfCare?: string | null
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
    traits?: string | null
    passions?: string | null
    fieldsOfCare?: string | null
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
    traits?: string | null
    passions?: string | null
    fieldsOfCare?: string | null
  }>
}

export type GetPulseDetailsWithContextQueryVariables = Exact<{
  pulseId: Scalars['ID']['input']
}>

export type GetPulseDetailsWithContextQuery = {
  __typename?: 'Query'
  goalPulses: Array<{
    __typename: 'GoalPulse'
    id: string
    title: string
    content: string
    createdAt: any
    status: GoalStatus
    horizon?: GoalHorizon | null
    intensity?: number | null
    context: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      emergentName?: string | null
      createdAt: any
      pulses: Array<
        | {
            __typename: 'CarePulse'
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'CoreValuePulse'
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'GoalPulse'
            status: GoalStatus
            horizon?: GoalHorizon | null
            intensity?: number | null
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'ResourcePulse'
            resourceType: string
            availability?: number | null
            intensity?: number | null
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'StoryPulse'
            intensity?: number | null
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
      meSpace: Array<{
        __typename: 'MeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
      }>
      weSpace: Array<{
        __typename: 'WeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
      }>
    }>
  }>
  resourcePulses: Array<{
    __typename: 'ResourcePulse'
    id: string
    title: string
    content: string
    createdAt: any
    resourceType: string
    availability?: number | null
    intensity?: number | null
    context: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      emergentName?: string | null
      createdAt: any
      pulses: Array<
        | {
            __typename: 'CarePulse'
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'CoreValuePulse'
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'GoalPulse'
            status: GoalStatus
            horizon?: GoalHorizon | null
            intensity?: number | null
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'ResourcePulse'
            resourceType: string
            availability?: number | null
            intensity?: number | null
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'StoryPulse'
            intensity?: number | null
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
      meSpace: Array<{
        __typename: 'MeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
      }>
      weSpace: Array<{
        __typename: 'WeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
      }>
    }>
  }>
  storyPulses: Array<{
    __typename: 'StoryPulse'
    id: string
    title: string
    content: string
    createdAt: any
    intensity?: number | null
    context: Array<{
      __typename?: 'FieldContext'
      id: string
      title: string
      emergentName?: string | null
      createdAt: any
      pulses: Array<
        | {
            __typename: 'CarePulse'
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'CoreValuePulse'
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'GoalPulse'
            status: GoalStatus
            horizon?: GoalHorizon | null
            intensity?: number | null
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'ResourcePulse'
            resourceType: string
            availability?: number | null
            intensity?: number | null
            id: string
            title: string
            content: string
            createdAt: any
          }
        | {
            __typename: 'StoryPulse'
            intensity?: number | null
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
      meSpace: Array<{
        __typename: 'MeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
      }>
      weSpace: Array<{
        __typename: 'WeSpace'
        id: string
        name: string
        visibility: SpaceVisibility
      }>
    }>
  }>
}

export type GetPulsesByContextQueryVariables = Exact<{
  contextId: Scalars['ID']['input']
}>

export type GetPulsesByContextQuery = {
  __typename?: 'Query'
  goalPulses: Array<{
    __typename: 'GoalPulse'
    id: string
    title: string
    content: string
    createdAt: any
    type: 'GoalPulse'
  }>
  resourcePulses: Array<{
    __typename: 'ResourcePulse'
    id: string
    title: string
    content: string
    createdAt: any
    type: 'ResourcePulse'
  }>
  storyPulses: Array<{
    __typename: 'StoryPulse'
    id: string
    title: string
    content: string
    createdAt: any
    type: 'StoryPulse'
  }>
  carePulses: Array<{
    __typename: 'CarePulse'
    id: string
    title: string
    content: string
    createdAt: any
    type: 'CarePulse'
  }>
  coreValuePulses: Array<{
    __typename: 'CoreValuePulse'
    id: string
    title: string
    content: string
    createdAt: any
    type: 'CoreValuePulse'
  }>
  fieldContexts: Array<{ __typename?: 'FieldContext'; id: string }>
  resonanceLinks: Array<{
    __typename?: 'ResonanceLink'
    id: string
    label: string
    description?: string | null
    confidence: number
    evidence?: string | null
    createdAt: any
    source: Array<
      | {
          __typename: 'CarePulse'
          id: string
          title: string
          content: string
          createdAt: any
        }
      | {
          __typename: 'CoreValuePulse'
          id: string
          title: string
          content: string
          createdAt: any
        }
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
    target: Array<
      | {
          __typename: 'CarePulse'
          id: string
          title: string
          content: string
          createdAt: any
        }
      | {
          __typename: 'CoreValuePulse'
          id: string
          title: string
          content: string
          createdAt: any
        }
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
  }>
}

export type GetPulseDetailsQueryVariables = Exact<{
  pulseId: Scalars['ID']['input']
}>

export type GetPulseDetailsQuery = {
  __typename?: 'Query'
  goalPulses: Array<{
    __typename: 'GoalPulse'
    id: string
    title: string
    content: string
    createdAt: any
    intensity?: number | null
    status: GoalStatus
    horizon?: GoalHorizon | null
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      name: string
      email?: string | null
    }>
  }>
  resourcePulses: Array<{
    __typename: 'ResourcePulse'
    id: string
    title: string
    content: string
    createdAt: any
    intensity?: number | null
    resourceType: string
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      name: string
      email?: string | null
    }>
  }>
  storyPulses: Array<{
    __typename: 'StoryPulse'
    id: string
    title: string
    content: string
    createdAt: any
    intensity?: number | null
    context: Array<{ __typename?: 'FieldContext'; id: string; title: string }>
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      name: string
      email?: string | null
    }>
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
        owner: Array<{
          __typename: 'Person'
          id: string
          firstName: string
          lastName: string
          name: string
          email?: string | null
        }>
        members: Array<{
          __typename?: 'SpaceMembership'
          id: string
          role: SpaceRole
          addedAt: any
          member: Array<{
            __typename: 'Person'
            id: string
            firstName: string
            lastName: string
            name: string
            email?: string | null
          }>
        }>
        contexts: Array<{
          __typename?: 'FieldContext'
          id: string
          title: string
          emergentName?: string | null
          createdAt: any
          pulses: Array<
            | {
                __typename: 'CarePulse'
                id: string
                title: string
                intensity?: number | null
              }
            | {
                __typename: 'CoreValuePulse'
                id: string
                title: string
                intensity?: number | null
              }
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
        owner: Array<{
          __typename: 'Person'
          id: string
          firstName: string
          lastName: string
          name: string
          email?: string | null
        }>
        members: Array<{
          __typename?: 'SpaceMembership'
          id: string
          role: SpaceRole
          addedAt: any
          member: Array<{
            __typename: 'Person'
            id: string
            firstName: string
            lastName: string
            name: string
            email?: string | null
          }>
        }>
        contexts: Array<{
          __typename?: 'FieldContext'
          id: string
          title: string
          emergentName?: string | null
          createdAt: any
          pulses: Array<
            | {
                __typename: 'CarePulse'
                id: string
                title: string
                intensity?: number | null
              }
            | {
                __typename: 'CoreValuePulse'
                id: string
                title: string
                intensity?: number | null
              }
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
      member: Array<{
        __typename?: 'Person'
        id: string
        firstName: string
        lastName: string
        name: string
        email?: string | null
      }>
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
      member: Array<{
        __typename?: 'Person'
        id: string
        firstName: string
        lastName: string
        name: string
        email?: string | null
      }>
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
    owner: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      name: string
      email?: string | null
    }>
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<{
        __typename?: 'Person'
        id: string
        firstName: string
        lastName: string
        name: string
        email?: string | null
      }>
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
    owner: Array<{
      __typename?: 'Person'
      id: string
      firstName: string
      lastName: string
      name: string
      email?: string | null
    }>
    members: Array<{
      __typename?: 'SpaceMembership'
      id: string
      role: SpaceRole
      addedAt: any
      member: Array<{
        __typename?: 'Person'
        id: string
        firstName: string
        lastName: string
        name: string
        email?: string | null
      }>
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
                        name: { kind: 'Name', value: 'meSpace' },
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'weSpace' },
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
                        name: { kind: 'Name', value: 'meSpace' },
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'weSpace' },
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
                      name: { kind: 'Name', value: 'meSpace' },
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
export const CreateGoalPulseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateGoalPulse' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'horizon' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdBy' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'context' },
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
  CreateGoalPulseMutation,
  CreateGoalPulseMutationVariables
>
export const CreateResourcePulseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateResourcePulse' },
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
                  name: { kind: 'Name', value: 'ResourcePulseCreateInput' },
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
            name: { kind: 'Name', value: 'createResourcePulses' },
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
                  name: { kind: 'Name', value: 'resourcePulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resourceType' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'availability' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdBy' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'context' },
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
  CreateResourcePulseMutation,
  CreateResourcePulseMutationVariables
>
export const CreateStoryPulseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateStoryPulse' },
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
                  name: { kind: 'Name', value: 'StoryPulseCreateInput' },
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
            name: { kind: 'Name', value: 'createStoryPulses' },
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
                  name: { kind: 'Name', value: 'storyPulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdBy' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'context' },
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
  CreateStoryPulseMutation,
  CreateStoryPulseMutationVariables
>
export const UpdateGoalPulseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateGoalPulse' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'horizon' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdBy' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'context' },
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
  UpdateGoalPulseMutation,
  UpdateGoalPulseMutationVariables
>
export const UpdateResourcePulseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateResourcePulse' },
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
              name: { kind: 'Name', value: 'ResourcePulseWhere' },
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
              name: { kind: 'Name', value: 'ResourcePulseUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateResourcePulses' },
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
                  name: { kind: 'Name', value: 'resourcePulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resourceType' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'availability' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdBy' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'context' },
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
  UpdateResourcePulseMutation,
  UpdateResourcePulseMutationVariables
>
export const UpdateStoryPulseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateStoryPulse' },
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
              name: { kind: 'Name', value: 'StoryPulseWhere' },
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
              name: { kind: 'Name', value: 'StoryPulseUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateStoryPulses' },
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
                  name: { kind: 'Name', value: 'storyPulses' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'intensity' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdBy' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'context' },
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
  UpdateStoryPulseMutation,
  UpdateStoryPulseMutationVariables
>
export const DeleteGoalPulseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteGoalPulse' },
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
  DeleteGoalPulseMutation,
  DeleteGoalPulseMutationVariables
>
export const DeleteResonancesByPulseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteResonancesByPulse' },
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
            name: { kind: 'Name', value: 'deleteResonanceLinks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'OR' },
                      value: {
                        kind: 'ListValue',
                        values: [
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'source_SOME' },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: { kind: 'Name', value: 'id_EQ' },
                                      value: {
                                        kind: 'Variable',
                                        name: {
                                          kind: 'Name',
                                          value: 'pulseId',
                                        },
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'target_SOME' },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: { kind: 'Name', value: 'id_EQ' },
                                      value: {
                                        kind: 'Variable',
                                        name: {
                                          kind: 'Name',
                                          value: 'pulseId',
                                        },
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
  DeleteResonancesByPulseMutation,
  DeleteResonancesByPulseMutationVariables
>
export const DeleteResourcePulseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteResourcePulse' },
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
              name: { kind: 'Name', value: 'ResourcePulseWhere' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteResourcePulses' },
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
  DeleteResourcePulseMutation,
  DeleteResourcePulseMutationVariables
>
export const DeleteStoryPulseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteStoryPulse' },
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
              name: { kind: 'Name', value: 'StoryPulseWhere' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteStoryPulses' },
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
  DeleteStoryPulseMutation,
  DeleteStoryPulseMutationVariables
>
export const CreateResonanceLinkDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateResonanceLink' },
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
                  name: { kind: 'Name', value: 'ResonanceLinkCreateInput' },
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
            name: { kind: 'Name', value: 'createResonanceLinks' },
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
                  name: { kind: 'Name', value: 'resonanceLinks' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'confidence' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'evidence' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'context' },
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
  CreateResonanceLinkMutation,
  CreateResonanceLinkMutationVariables
>
export const UpdateResonanceLinkDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateResonanceLink' },
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
              name: { kind: 'Name', value: 'ResonanceLinkWhere' },
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
              name: { kind: 'Name', value: 'ResonanceLinkUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateResonanceLinks' },
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
                  name: { kind: 'Name', value: 'resonanceLinks' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'confidence' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'evidence' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
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
                                    name: { kind: 'Name', value: 'title' },
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
                                    name: { kind: 'Name', value: 'title' },
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
                                    name: { kind: 'Name', value: 'title' },
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
                                    name: { kind: 'Name', value: 'title' },
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
                                    name: { kind: 'Name', value: 'title' },
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
                                    name: { kind: 'Name', value: 'title' },
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
                  name: { kind: 'Name', value: 'info' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
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
  UpdateResonanceLinkMutation,
  UpdateResonanceLinkMutationVariables
>
export const DeleteResonanceLinkDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteResonanceLink' },
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
            name: { kind: 'Name', value: 'deleteResonanceLinks' },
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
  DeleteResonanceLinkMutation,
  DeleteResonanceLinkMutationVariables
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
export const UpdateMeSpaceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateMeSpace' },
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
              name: { kind: 'Name', value: 'MeSpaceWhere' },
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
              name: { kind: 'Name', value: 'MeSpaceUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateMeSpaces' },
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'owner' },
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
  UpdateMeSpaceMutation,
  UpdateMeSpaceMutationVariables
>
export const UpdateWeSpaceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateWeSpace' },
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
              name: { kind: 'Name', value: 'WeSpaceWhere' },
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
              name: { kind: 'Name', value: 'WeSpaceUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateWeSpaces' },
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'owner' },
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
  UpdateWeSpaceMutation,
  UpdateWeSpaceMutationVariables
>
export const DeleteMeSpaceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteMeSpace' },
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
              name: { kind: 'Name', value: 'MeSpaceWhere' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteMeSpaces' },
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
  DeleteMeSpaceMutation,
  DeleteMeSpaceMutationVariables
>
export const DeleteWeSpaceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteWeSpace' },
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
              name: { kind: 'Name', value: 'WeSpaceWhere' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteWeSpaces' },
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
  DeleteWeSpaceMutation,
  DeleteWeSpaceMutationVariables
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
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'firstName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastName' },
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
                      name: { kind: 'Name', value: 'OR' },
                      value: {
                        kind: 'ListValue',
                        values: [
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'meSpace_SOME' },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: { kind: 'Name', value: 'id_EQ' },
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
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'weSpace_SOME' },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: { kind: 'Name', value: 'id_EQ' },
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
                      name: { kind: 'Name', value: 'OR' },
                      value: {
                        kind: 'ListValue',
                        values: [
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'meSpace_SOME' },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: { kind: 'Name', value: 'id_EQ' },
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
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'weSpace_SOME' },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: { kind: 'Name', value: 'id_EQ' },
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
export const GetResonanceLinksByContextDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetResonanceLinksByContext' },
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
                  name: { kind: 'Name', value: 'resonances' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'confidence' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'evidence' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
                                    name: { kind: 'Name', value: 'title' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'content' },
                                  },
                                  {
                                    kind: 'Field',
                                    alias: { kind: 'Name', value: 'type' },
                                    name: { kind: 'Name', value: '__typename' },
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
  GetResonanceLinksByContextQuery,
  GetResonanceLinksByContextQueryVariables
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
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'firstName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastName' },
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
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'firstName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastName' },
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
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
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
            name: { kind: 'Name', value: 'resonanceLinks' },
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
                                                  value: 'createdBy',
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
                                                        value: 'firstName',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'lastName',
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
                                                  value: 'createdBy',
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
                                                        value: 'firstName',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'lastName',
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
                                                  value: 'createdBy',
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
                                                        value: 'firstName',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'lastName',
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
                                                  value: 'createdBy',
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
                                                        value: 'firstName',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'lastName',
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
                                                  value: 'createdBy',
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
                                                        value: 'firstName',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'lastName',
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
                                                  value: 'createdBy',
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
                                                        value: 'firstName',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'lastName',
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
                                    name: { kind: 'Name', value: 'createdBy' },
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
                                            value: 'firstName',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'lastName',
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
                                    name: { kind: 'Name', value: 'createdBy' },
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
                                            value: 'firstName',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'lastName',
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
                                    name: { kind: 'Name', value: 'createdBy' },
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
                                            value: 'firstName',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'lastName',
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
                                    name: { kind: 'Name', value: 'createdBy' },
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
                                            value: 'firstName',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'lastName',
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
                                    name: { kind: 'Name', value: 'createdBy' },
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
                                            value: 'firstName',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'lastName',
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
                                    name: { kind: 'Name', value: 'createdBy' },
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
                                            value: 'firstName',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'lastName',
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
                              name: { kind: 'Name', value: 'createdBy' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'email' },
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
            name: { kind: 'Name', value: 'resonanceLinks' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'confidence' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'confidence' } },
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
                  name: { kind: 'Name', value: 'createdBy' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                  name: { kind: 'Name', value: 'createdBy' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                  name: { kind: 'Name', value: 'createdBy' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                  name: { kind: 'Name', value: 'weSpace' },
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
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'firstName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'traits' } },
                { kind: 'Field', name: { kind: 'Name', value: 'passions' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fieldsOfCare' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'traits' } },
                { kind: 'Field', name: { kind: 'Name', value: 'passions' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fieldsOfCare' },
                },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'memberOf' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'space' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'traits' } },
                { kind: 'Field', name: { kind: 'Name', value: 'passions' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fieldsOfCare' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'traits' } },
                { kind: 'Field', name: { kind: 'Name', value: 'passions' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fieldsOfCare' },
                },
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
                { kind: 'Field', name: { kind: 'Name', value: 'traits' } },
                { kind: 'Field', name: { kind: 'Name', value: 'passions' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fieldsOfCare' },
                },
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
                { kind: 'Field', name: { kind: 'Name', value: 'traits' } },
                { kind: 'Field', name: { kind: 'Name', value: 'passions' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fieldsOfCare' },
                },
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
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'horizon' } },
                { kind: 'Field', name: { kind: 'Name', value: 'intensity' } },
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
                                    name: { kind: 'Name', value: 'status' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'horizon' },
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
                                    name: {
                                      kind: 'Name',
                                      value: 'resourceType',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'availability',
                                    },
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
                        name: { kind: 'Name', value: 'space' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meSpace' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'weSpace' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resourceType' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'availability' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'intensity' } },
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
                                    name: { kind: 'Name', value: 'status' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'horizon' },
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
                                    name: {
                                      kind: 'Name',
                                      value: 'resourceType',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'availability',
                                    },
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
                        name: { kind: 'Name', value: 'space' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meSpace' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'weSpace' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'intensity' } },
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
                                    name: { kind: 'Name', value: 'status' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'horizon' },
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
                                    name: {
                                      kind: 'Name',
                                      value: 'resourceType',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'availability',
                                    },
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
                        name: { kind: 'Name', value: 'space' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meSpace' },
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
                        kind: 'Field',
                        name: { kind: 'Name', value: 'weSpace' },
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
  GetPulseDetailsWithContextQuery,
  GetPulseDetailsWithContextQueryVariables
>
export const GetPulsesByContextDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetPulsesByContext' },
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
                      name: { kind: 'Name', value: 'context_SOME' },
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
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'type' },
                  name: { kind: 'Name', value: '__typename' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
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
                      name: { kind: 'Name', value: 'context_SOME' },
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
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'type' },
                  name: { kind: 'Name', value: '__typename' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
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
                      name: { kind: 'Name', value: 'context_SOME' },
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
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'type' },
                  name: { kind: 'Name', value: '__typename' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'carePulses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'context_SOME' },
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
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'type' },
                  name: { kind: 'Name', value: '__typename' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'coreValuePulses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'context_SOME' },
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
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'type' },
                  name: { kind: 'Name', value: '__typename' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
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
                      name: { kind: 'Name', value: 'context_SOME' },
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
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
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
                              name: { kind: 'Name', value: '__typename' },
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
                              name: { kind: 'Name', value: '__typename' },
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
                              name: { kind: 'Name', value: '__typename' },
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
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'CarePulse' },
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
                              name: { kind: 'Name', value: '__typename' },
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
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'CoreValuePulse' },
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
                              name: { kind: 'Name', value: '__typename' },
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
                              name: { kind: 'Name', value: '__typename' },
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
                              name: { kind: 'Name', value: '__typename' },
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
                              name: { kind: 'Name', value: '__typename' },
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
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'CarePulse' },
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
                              name: { kind: 'Name', value: '__typename' },
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
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: {
                          kind: 'NamedType',
                          name: { kind: 'Name', value: 'CoreValuePulse' },
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
                              name: { kind: 'Name', value: '__typename' },
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
  GetPulsesByContextQuery,
  GetPulsesByContextQueryVariables
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
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
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
                  name: { kind: 'Name', value: 'createdBy' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
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
                  name: { kind: 'Name', value: 'createdBy' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
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
                  name: { kind: 'Name', value: 'createdBy' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
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
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
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
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
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
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
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
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
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
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'firstName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'firstName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
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
