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
  /** A date, represented as a 'yyyy-mm-dd' string */
  Date: { input: any; output: any }
  /** A date and time, represented as an ISO-8601 string */
  DateTime: { input: any; output: any }
}

/**
 * The edge properties for the following fields:
 * * Person.communities
 */
export type BelongsTo = {
  __typename?: 'BelongsTo'
  signupDate?: Maybe<Scalars['Date']['output']>
  totem?: Maybe<Scalars['String']['output']>
}

export type BelongsToAggregationWhereInput = {
  AND?: InputMaybe<Array<BelongsToAggregationWhereInput>>
  NOT?: InputMaybe<BelongsToAggregationWhereInput>
  OR?: InputMaybe<Array<BelongsToAggregationWhereInput>>
  totem_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  totem_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  totem_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  totem_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  totem_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  totem_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  totem_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  totem_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  totem_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  totem_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  totem_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  totem_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  totem_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  totem_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  totem_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type BelongsToCreateInput = {
  signupDate?: InputMaybe<Scalars['Date']['input']>
  totem?: InputMaybe<Scalars['String']['input']>
}

export type BelongsToSort = {
  signupDate?: InputMaybe<SortDirection>
  totem?: InputMaybe<SortDirection>
}

export type BelongsToUpdateInput = {
  signupDate_SET?: InputMaybe<Scalars['Date']['input']>
  totem_SET?: InputMaybe<Scalars['String']['input']>
}

export type BelongsToWhere = {
  AND?: InputMaybe<Array<BelongsToWhere>>
  NOT?: InputMaybe<BelongsToWhere>
  OR?: InputMaybe<Array<BelongsToWhere>>
  signupDate_EQ?: InputMaybe<Scalars['Date']['input']>
  signupDate_GT?: InputMaybe<Scalars['Date']['input']>
  signupDate_GTE?: InputMaybe<Scalars['Date']['input']>
  signupDate_IN?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>
  signupDate_LT?: InputMaybe<Scalars['Date']['input']>
  signupDate_LTE?: InputMaybe<Scalars['Date']['input']>
  totem_CONTAINS?: InputMaybe<Scalars['String']['input']>
  totem_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  totem_EQ?: InputMaybe<Scalars['String']['input']>
  totem_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  totem_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type CarePoint = {
  __typename?: 'CarePoint'
  caresForGoals: Array<Goal>
  caresForGoalsAggregate?: Maybe<CarePointGoalCaresForGoalsAggregationSelection>
  caresForGoalsConnection: CarePointCaresForGoalsConnection
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  createdByAggregate?: Maybe<CarePointPersonCreatedByAggregationSelection>
  createdByConnection: CarePointCreatedByConnection
  description?: Maybe<Scalars['String']['output']>
  enabledByGoals: Array<Goal>
  enabledByGoalsAggregate?: Maybe<CarePointGoalEnabledByGoalsAggregationSelection>
  enabledByGoalsConnection: CarePointEnabledByGoalsConnection
  fulfillmentDate?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  issuesIdentified?: Maybe<Scalars['String']['output']>
  issuesResolved?: Maybe<Scalars['String']['output']>
  levelFulfilled?: Maybe<Scalars['String']['output']>
  location?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  resources: Array<Resource>
  resourcesAggregate?: Maybe<CarePointResourceResourcesAggregationSelection>
  resourcesConnection: CarePointResourcesConnection
  status: Scalars['String']['output']
  successMeasures?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  why?: Maybe<Scalars['String']['output']>
}

export type CarePointCaresForGoalsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalSort>>
  where?: InputMaybe<GoalWhere>
}

export type CarePointCaresForGoalsAggregateArgs = {
  where?: InputMaybe<GoalWhere>
}

export type CarePointCaresForGoalsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePointCaresForGoalsConnectionSort>>
  where?: InputMaybe<CarePointCaresForGoalsConnectionWhere>
}

export type CarePointCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type CarePointCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type CarePointCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePointCreatedByConnectionSort>>
  where?: InputMaybe<CarePointCreatedByConnectionWhere>
}

export type CarePointEnabledByGoalsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalSort>>
  where?: InputMaybe<GoalWhere>
}

export type CarePointEnabledByGoalsAggregateArgs = {
  where?: InputMaybe<GoalWhere>
}

export type CarePointEnabledByGoalsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePointEnabledByGoalsConnectionSort>>
  where?: InputMaybe<CarePointEnabledByGoalsConnectionWhere>
}

export type CarePointResourcesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type CarePointResourcesAggregateArgs = {
  where?: InputMaybe<ResourceWhere>
}

export type CarePointResourcesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePointResourcesConnectionSort>>
  where?: InputMaybe<CarePointResourcesConnectionWhere>
}

export type CarePointAggregateSelection = {
  __typename?: 'CarePointAggregateSelection'
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  fulfillmentDate: StringAggregateSelection
  id: IdAggregateSelection
  issuesIdentified: StringAggregateSelection
  issuesResolved: StringAggregateSelection
  levelFulfilled: StringAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CarePointCaresForGoalsAggregateInput = {
  AND?: InputMaybe<Array<CarePointCaresForGoalsAggregateInput>>
  NOT?: InputMaybe<CarePointCaresForGoalsAggregateInput>
  OR?: InputMaybe<Array<CarePointCaresForGoalsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CarePointCaresForGoalsNodeAggregationWhereInput>
}

export type CarePointCaresForGoalsConnectFieldInput = {
  connect?: InputMaybe<Array<GoalConnectInput>>
  where?: InputMaybe<GoalConnectWhere>
}

export type CarePointCaresForGoalsConnection = {
  __typename?: 'CarePointCaresForGoalsConnection'
  edges: Array<CarePointCaresForGoalsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CarePointCaresForGoalsConnectionSort = {
  node?: InputMaybe<GoalSort>
}

export type CarePointCaresForGoalsConnectionWhere = {
  AND?: InputMaybe<Array<CarePointCaresForGoalsConnectionWhere>>
  NOT?: InputMaybe<CarePointCaresForGoalsConnectionWhere>
  OR?: InputMaybe<Array<CarePointCaresForGoalsConnectionWhere>>
  node?: InputMaybe<GoalWhere>
}

export type CarePointCaresForGoalsCreateFieldInput = {
  node: GoalCreateInput
}

export type CarePointCaresForGoalsDeleteFieldInput = {
  delete?: InputMaybe<GoalDeleteInput>
  where?: InputMaybe<CarePointCaresForGoalsConnectionWhere>
}

export type CarePointCaresForGoalsDisconnectFieldInput = {
  disconnect?: InputMaybe<GoalDisconnectInput>
  where?: InputMaybe<CarePointCaresForGoalsConnectionWhere>
}

export type CarePointCaresForGoalsFieldInput = {
  connect?: InputMaybe<Array<CarePointCaresForGoalsConnectFieldInput>>
  create?: InputMaybe<Array<CarePointCaresForGoalsCreateFieldInput>>
}

export type CarePointCaresForGoalsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CarePointCaresForGoalsNodeAggregationWhereInput>>
  NOT?: InputMaybe<CarePointCaresForGoalsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CarePointCaresForGoalsNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CarePointCaresForGoalsRelationship = {
  __typename?: 'CarePointCaresForGoalsRelationship'
  cursor: Scalars['String']['output']
  node: Goal
}

export type CarePointCaresForGoalsUpdateConnectionInput = {
  node?: InputMaybe<GoalUpdateInput>
}

export type CarePointCaresForGoalsUpdateFieldInput = {
  connect?: InputMaybe<Array<CarePointCaresForGoalsConnectFieldInput>>
  create?: InputMaybe<Array<CarePointCaresForGoalsCreateFieldInput>>
  delete?: InputMaybe<Array<CarePointCaresForGoalsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CarePointCaresForGoalsDisconnectFieldInput>>
  update?: InputMaybe<CarePointCaresForGoalsUpdateConnectionInput>
  where?: InputMaybe<CarePointCaresForGoalsConnectionWhere>
}

export type CarePointConnectInput = {
  caresForGoals?: InputMaybe<Array<CarePointCaresForGoalsConnectFieldInput>>
  createdBy?: InputMaybe<Array<CarePointCreatedByConnectFieldInput>>
  enabledByGoals?: InputMaybe<Array<CarePointEnabledByGoalsConnectFieldInput>>
  resources?: InputMaybe<Array<CarePointResourcesConnectFieldInput>>
}

export type CarePointConnectWhere = {
  node: CarePointWhere
}

export type CarePointCreateInput = {
  caresForGoals?: InputMaybe<CarePointCaresForGoalsFieldInput>
  createdBy?: InputMaybe<CarePointCreatedByFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  enabledByGoals?: InputMaybe<CarePointEnabledByGoalsFieldInput>
  fulfillmentDate?: InputMaybe<Scalars['String']['input']>
  issuesIdentified?: InputMaybe<Scalars['String']['input']>
  issuesResolved?: InputMaybe<Scalars['String']['input']>
  levelFulfilled?: InputMaybe<Scalars['String']['input']>
  location?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  resources?: InputMaybe<CarePointResourcesFieldInput>
  status: Scalars['String']['input']
  successMeasures?: InputMaybe<Scalars['String']['input']>
  time?: InputMaybe<Scalars['String']['input']>
  why?: InputMaybe<Scalars['String']['input']>
}

export type CarePointCreatedByAggregateInput = {
  AND?: InputMaybe<Array<CarePointCreatedByAggregateInput>>
  NOT?: InputMaybe<CarePointCreatedByAggregateInput>
  OR?: InputMaybe<Array<CarePointCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CarePointCreatedByNodeAggregationWhereInput>
}

export type CarePointCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type CarePointCreatedByConnection = {
  __typename?: 'CarePointCreatedByConnection'
  edges: Array<CarePointCreatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CarePointCreatedByConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type CarePointCreatedByConnectionWhere = {
  AND?: InputMaybe<Array<CarePointCreatedByConnectionWhere>>
  NOT?: InputMaybe<CarePointCreatedByConnectionWhere>
  OR?: InputMaybe<Array<CarePointCreatedByConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type CarePointCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type CarePointCreatedByDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<CarePointCreatedByConnectionWhere>
}

export type CarePointCreatedByDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<CarePointCreatedByConnectionWhere>
}

export type CarePointCreatedByFieldInput = {
  connect?: InputMaybe<Array<CarePointCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<CarePointCreatedByCreateFieldInput>>
}

export type CarePointCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CarePointCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<CarePointCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CarePointCreatedByNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type CarePointCreatedByRelationship = {
  __typename?: 'CarePointCreatedByRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type CarePointCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type CarePointCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<CarePointCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<CarePointCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<CarePointCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CarePointCreatedByDisconnectFieldInput>>
  update?: InputMaybe<CarePointCreatedByUpdateConnectionInput>
  where?: InputMaybe<CarePointCreatedByConnectionWhere>
}

export type CarePointDeleteInput = {
  caresForGoals?: InputMaybe<Array<CarePointCaresForGoalsDeleteFieldInput>>
  createdBy?: InputMaybe<Array<CarePointCreatedByDeleteFieldInput>>
  enabledByGoals?: InputMaybe<Array<CarePointEnabledByGoalsDeleteFieldInput>>
  resources?: InputMaybe<Array<CarePointResourcesDeleteFieldInput>>
}

export type CarePointDisconnectInput = {
  caresForGoals?: InputMaybe<Array<CarePointCaresForGoalsDisconnectFieldInput>>
  createdBy?: InputMaybe<Array<CarePointCreatedByDisconnectFieldInput>>
  enabledByGoals?: InputMaybe<
    Array<CarePointEnabledByGoalsDisconnectFieldInput>
  >
  resources?: InputMaybe<Array<CarePointResourcesDisconnectFieldInput>>
}

export type CarePointEdge = {
  __typename?: 'CarePointEdge'
  cursor: Scalars['String']['output']
  node: CarePoint
}

export type CarePointEnabledByGoalsAggregateInput = {
  AND?: InputMaybe<Array<CarePointEnabledByGoalsAggregateInput>>
  NOT?: InputMaybe<CarePointEnabledByGoalsAggregateInput>
  OR?: InputMaybe<Array<CarePointEnabledByGoalsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CarePointEnabledByGoalsNodeAggregationWhereInput>
}

export type CarePointEnabledByGoalsConnectFieldInput = {
  connect?: InputMaybe<Array<GoalConnectInput>>
  where?: InputMaybe<GoalConnectWhere>
}

export type CarePointEnabledByGoalsConnection = {
  __typename?: 'CarePointEnabledByGoalsConnection'
  edges: Array<CarePointEnabledByGoalsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CarePointEnabledByGoalsConnectionSort = {
  node?: InputMaybe<GoalSort>
}

export type CarePointEnabledByGoalsConnectionWhere = {
  AND?: InputMaybe<Array<CarePointEnabledByGoalsConnectionWhere>>
  NOT?: InputMaybe<CarePointEnabledByGoalsConnectionWhere>
  OR?: InputMaybe<Array<CarePointEnabledByGoalsConnectionWhere>>
  node?: InputMaybe<GoalWhere>
}

export type CarePointEnabledByGoalsCreateFieldInput = {
  node: GoalCreateInput
}

export type CarePointEnabledByGoalsDeleteFieldInput = {
  delete?: InputMaybe<GoalDeleteInput>
  where?: InputMaybe<CarePointEnabledByGoalsConnectionWhere>
}

export type CarePointEnabledByGoalsDisconnectFieldInput = {
  disconnect?: InputMaybe<GoalDisconnectInput>
  where?: InputMaybe<CarePointEnabledByGoalsConnectionWhere>
}

export type CarePointEnabledByGoalsFieldInput = {
  connect?: InputMaybe<Array<CarePointEnabledByGoalsConnectFieldInput>>
  create?: InputMaybe<Array<CarePointEnabledByGoalsCreateFieldInput>>
}

export type CarePointEnabledByGoalsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CarePointEnabledByGoalsNodeAggregationWhereInput>>
  NOT?: InputMaybe<CarePointEnabledByGoalsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CarePointEnabledByGoalsNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CarePointEnabledByGoalsRelationship = {
  __typename?: 'CarePointEnabledByGoalsRelationship'
  cursor: Scalars['String']['output']
  node: Goal
}

export type CarePointEnabledByGoalsUpdateConnectionInput = {
  node?: InputMaybe<GoalUpdateInput>
}

export type CarePointEnabledByGoalsUpdateFieldInput = {
  connect?: InputMaybe<Array<CarePointEnabledByGoalsConnectFieldInput>>
  create?: InputMaybe<Array<CarePointEnabledByGoalsCreateFieldInput>>
  delete?: InputMaybe<Array<CarePointEnabledByGoalsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CarePointEnabledByGoalsDisconnectFieldInput>>
  update?: InputMaybe<CarePointEnabledByGoalsUpdateConnectionInput>
  where?: InputMaybe<CarePointEnabledByGoalsConnectionWhere>
}

export type CarePointGoalCaresForGoalsAggregationSelection = {
  __typename?: 'CarePointGoalCaresForGoalsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CarePointGoalCaresForGoalsNodeAggregateSelection>
}

export type CarePointGoalCaresForGoalsNodeAggregateSelection = {
  __typename?: 'CarePointGoalCaresForGoalsNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  photo: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CarePointGoalEnabledByGoalsAggregationSelection = {
  __typename?: 'CarePointGoalEnabledByGoalsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CarePointGoalEnabledByGoalsNodeAggregateSelection>
}

export type CarePointGoalEnabledByGoalsNodeAggregateSelection = {
  __typename?: 'CarePointGoalEnabledByGoalsNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  photo: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CarePointPersonCreatedByAggregationSelection = {
  __typename?: 'CarePointPersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CarePointPersonCreatedByNodeAggregateSelection>
}

export type CarePointPersonCreatedByNodeAggregateSelection = {
  __typename?: 'CarePointPersonCreatedByNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type CarePointResourceResourcesAggregationSelection = {
  __typename?: 'CarePointResourceResourcesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CarePointResourceResourcesNodeAggregateSelection>
}

export type CarePointResourceResourcesNodeAggregateSelection = {
  __typename?: 'CarePointResourceResourcesNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CarePointResourcesAggregateInput = {
  AND?: InputMaybe<Array<CarePointResourcesAggregateInput>>
  NOT?: InputMaybe<CarePointResourcesAggregateInput>
  OR?: InputMaybe<Array<CarePointResourcesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CarePointResourcesNodeAggregationWhereInput>
}

export type CarePointResourcesConnectFieldInput = {
  connect?: InputMaybe<Array<ResourceConnectInput>>
  where?: InputMaybe<ResourceConnectWhere>
}

export type CarePointResourcesConnection = {
  __typename?: 'CarePointResourcesConnection'
  edges: Array<CarePointResourcesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CarePointResourcesConnectionSort = {
  node?: InputMaybe<ResourceSort>
}

export type CarePointResourcesConnectionWhere = {
  AND?: InputMaybe<Array<CarePointResourcesConnectionWhere>>
  NOT?: InputMaybe<CarePointResourcesConnectionWhere>
  OR?: InputMaybe<Array<CarePointResourcesConnectionWhere>>
  node?: InputMaybe<ResourceWhere>
}

export type CarePointResourcesCreateFieldInput = {
  node: ResourceCreateInput
}

export type CarePointResourcesDeleteFieldInput = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<CarePointResourcesConnectionWhere>
}

export type CarePointResourcesDisconnectFieldInput = {
  disconnect?: InputMaybe<ResourceDisconnectInput>
  where?: InputMaybe<CarePointResourcesConnectionWhere>
}

export type CarePointResourcesFieldInput = {
  connect?: InputMaybe<Array<CarePointResourcesConnectFieldInput>>
  create?: InputMaybe<Array<CarePointResourcesCreateFieldInput>>
}

export type CarePointResourcesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CarePointResourcesNodeAggregationWhereInput>>
  NOT?: InputMaybe<CarePointResourcesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CarePointResourcesNodeAggregationWhereInput>>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CarePointResourcesRelationship = {
  __typename?: 'CarePointResourcesRelationship'
  cursor: Scalars['String']['output']
  node: Resource
}

export type CarePointResourcesUpdateConnectionInput = {
  node?: InputMaybe<ResourceUpdateInput>
}

export type CarePointResourcesUpdateFieldInput = {
  connect?: InputMaybe<Array<CarePointResourcesConnectFieldInput>>
  create?: InputMaybe<Array<CarePointResourcesCreateFieldInput>>
  delete?: InputMaybe<Array<CarePointResourcesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CarePointResourcesDisconnectFieldInput>>
  update?: InputMaybe<CarePointResourcesUpdateConnectionInput>
  where?: InputMaybe<CarePointResourcesConnectionWhere>
}

/** Fields to sort CarePoints by. The order in which sorts are applied is not guaranteed when specifying many fields in one CarePointSort object. */
export type CarePointSort = {
  createdAt?: InputMaybe<SortDirection>
  description?: InputMaybe<SortDirection>
  fulfillmentDate?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  issuesIdentified?: InputMaybe<SortDirection>
  issuesResolved?: InputMaybe<SortDirection>
  levelFulfilled?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  status?: InputMaybe<SortDirection>
  successMeasures?: InputMaybe<SortDirection>
  time?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
  why?: InputMaybe<SortDirection>
}

export type CarePointUpdateInput = {
  caresForGoals?: InputMaybe<Array<CarePointCaresForGoalsUpdateFieldInput>>
  createdBy?: InputMaybe<Array<CarePointCreatedByUpdateFieldInput>>
  description_SET?: InputMaybe<Scalars['String']['input']>
  enabledByGoals?: InputMaybe<Array<CarePointEnabledByGoalsUpdateFieldInput>>
  fulfillmentDate_SET?: InputMaybe<Scalars['String']['input']>
  issuesIdentified_SET?: InputMaybe<Scalars['String']['input']>
  issuesResolved_SET?: InputMaybe<Scalars['String']['input']>
  levelFulfilled_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  name_SET?: InputMaybe<Scalars['String']['input']>
  resources?: InputMaybe<Array<CarePointResourcesUpdateFieldInput>>
  status_SET?: InputMaybe<Scalars['String']['input']>
  successMeasures_SET?: InputMaybe<Scalars['String']['input']>
  time_SET?: InputMaybe<Scalars['String']['input']>
  why_SET?: InputMaybe<Scalars['String']['input']>
}

export type CarePointWhere = {
  AND?: InputMaybe<Array<CarePointWhere>>
  NOT?: InputMaybe<CarePointWhere>
  OR?: InputMaybe<Array<CarePointWhere>>
  caresForGoalsAggregate?: InputMaybe<CarePointCaresForGoalsAggregateInput>
  /** Return CarePoints where all of the related CarePointCaresForGoalsConnections match this filter */
  caresForGoalsConnection_ALL?: InputMaybe<CarePointCaresForGoalsConnectionWhere>
  /** Return CarePoints where none of the related CarePointCaresForGoalsConnections match this filter */
  caresForGoalsConnection_NONE?: InputMaybe<CarePointCaresForGoalsConnectionWhere>
  /** Return CarePoints where one of the related CarePointCaresForGoalsConnections match this filter */
  caresForGoalsConnection_SINGLE?: InputMaybe<CarePointCaresForGoalsConnectionWhere>
  /** Return CarePoints where some of the related CarePointCaresForGoalsConnections match this filter */
  caresForGoalsConnection_SOME?: InputMaybe<CarePointCaresForGoalsConnectionWhere>
  /** Return CarePoints where all of the related Goals match this filter */
  caresForGoals_ALL?: InputMaybe<GoalWhere>
  /** Return CarePoints where none of the related Goals match this filter */
  caresForGoals_NONE?: InputMaybe<GoalWhere>
  /** Return CarePoints where one of the related Goals match this filter */
  caresForGoals_SINGLE?: InputMaybe<GoalWhere>
  /** Return CarePoints where some of the related Goals match this filter */
  caresForGoals_SOME?: InputMaybe<GoalWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdByAggregate?: InputMaybe<CarePointCreatedByAggregateInput>
  /** Return CarePoints where all of the related CarePointCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<CarePointCreatedByConnectionWhere>
  /** Return CarePoints where none of the related CarePointCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<CarePointCreatedByConnectionWhere>
  /** Return CarePoints where one of the related CarePointCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<CarePointCreatedByConnectionWhere>
  /** Return CarePoints where some of the related CarePointCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<CarePointCreatedByConnectionWhere>
  /** Return CarePoints where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return CarePoints where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return CarePoints where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return CarePoints where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
  description_CONTAINS?: InputMaybe<Scalars['String']['input']>
  description_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  description_EQ?: InputMaybe<Scalars['String']['input']>
  description_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  description_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  enabledByGoalsAggregate?: InputMaybe<CarePointEnabledByGoalsAggregateInput>
  /** Return CarePoints where all of the related CarePointEnabledByGoalsConnections match this filter */
  enabledByGoalsConnection_ALL?: InputMaybe<CarePointEnabledByGoalsConnectionWhere>
  /** Return CarePoints where none of the related CarePointEnabledByGoalsConnections match this filter */
  enabledByGoalsConnection_NONE?: InputMaybe<CarePointEnabledByGoalsConnectionWhere>
  /** Return CarePoints where one of the related CarePointEnabledByGoalsConnections match this filter */
  enabledByGoalsConnection_SINGLE?: InputMaybe<CarePointEnabledByGoalsConnectionWhere>
  /** Return CarePoints where some of the related CarePointEnabledByGoalsConnections match this filter */
  enabledByGoalsConnection_SOME?: InputMaybe<CarePointEnabledByGoalsConnectionWhere>
  /** Return CarePoints where all of the related Goals match this filter */
  enabledByGoals_ALL?: InputMaybe<GoalWhere>
  /** Return CarePoints where none of the related Goals match this filter */
  enabledByGoals_NONE?: InputMaybe<GoalWhere>
  /** Return CarePoints where one of the related Goals match this filter */
  enabledByGoals_SINGLE?: InputMaybe<GoalWhere>
  /** Return CarePoints where some of the related Goals match this filter */
  enabledByGoals_SOME?: InputMaybe<GoalWhere>
  fulfillmentDate_CONTAINS?: InputMaybe<Scalars['String']['input']>
  fulfillmentDate_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  fulfillmentDate_EQ?: InputMaybe<Scalars['String']['input']>
  fulfillmentDate_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  fulfillmentDate_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  issuesIdentified_CONTAINS?: InputMaybe<Scalars['String']['input']>
  issuesIdentified_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  issuesIdentified_EQ?: InputMaybe<Scalars['String']['input']>
  issuesIdentified_IN?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  issuesIdentified_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  issuesResolved_CONTAINS?: InputMaybe<Scalars['String']['input']>
  issuesResolved_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  issuesResolved_EQ?: InputMaybe<Scalars['String']['input']>
  issuesResolved_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  issuesResolved_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  levelFulfilled_CONTAINS?: InputMaybe<Scalars['String']['input']>
  levelFulfilled_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  levelFulfilled_EQ?: InputMaybe<Scalars['String']['input']>
  levelFulfilled_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  levelFulfilled_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  location_CONTAINS?: InputMaybe<Scalars['String']['input']>
  location_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  location_EQ?: InputMaybe<Scalars['String']['input']>
  location_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  location_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  resourcesAggregate?: InputMaybe<CarePointResourcesAggregateInput>
  /** Return CarePoints where all of the related CarePointResourcesConnections match this filter */
  resourcesConnection_ALL?: InputMaybe<CarePointResourcesConnectionWhere>
  /** Return CarePoints where none of the related CarePointResourcesConnections match this filter */
  resourcesConnection_NONE?: InputMaybe<CarePointResourcesConnectionWhere>
  /** Return CarePoints where one of the related CarePointResourcesConnections match this filter */
  resourcesConnection_SINGLE?: InputMaybe<CarePointResourcesConnectionWhere>
  /** Return CarePoints where some of the related CarePointResourcesConnections match this filter */
  resourcesConnection_SOME?: InputMaybe<CarePointResourcesConnectionWhere>
  /** Return CarePoints where all of the related Resources match this filter */
  resources_ALL?: InputMaybe<ResourceWhere>
  /** Return CarePoints where none of the related Resources match this filter */
  resources_NONE?: InputMaybe<ResourceWhere>
  /** Return CarePoints where one of the related Resources match this filter */
  resources_SINGLE?: InputMaybe<ResourceWhere>
  /** Return CarePoints where some of the related Resources match this filter */
  resources_SOME?: InputMaybe<ResourceWhere>
  status_CONTAINS?: InputMaybe<Scalars['String']['input']>
  status_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  status_EQ?: InputMaybe<Scalars['String']['input']>
  status_IN?: InputMaybe<Array<Scalars['String']['input']>>
  status_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  successMeasures_CONTAINS?: InputMaybe<Scalars['String']['input']>
  successMeasures_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  successMeasures_EQ?: InputMaybe<Scalars['String']['input']>
  successMeasures_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  successMeasures_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  time_CONTAINS?: InputMaybe<Scalars['String']['input']>
  time_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  time_EQ?: InputMaybe<Scalars['String']['input']>
  time_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  time_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_CONTAINS?: InputMaybe<Scalars['String']['input']>
  why_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  why_EQ?: InputMaybe<Scalars['String']['input']>
  why_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  why_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type CarePointsConnection = {
  __typename?: 'CarePointsConnection'
  edges: Array<CarePointEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ChatbotResponse = {
  __typename?: 'ChatbotResponse'
  message: Scalars['String']['output']
  sessionId: Scalars['String']['output']
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
  edges: Array<ChatbotResponseEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunitiesConnection = {
  __typename?: 'CommunitiesConnection'
  edges: Array<CommunityEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Community = {
  __typename?: 'Community'
  activities?: Maybe<Scalars['String']['output']>
  coreValues: Array<CoreValue>
  coreValuesAggregate?: Maybe<CommunityCoreValueCoreValuesAggregationSelection>
  coreValuesConnection: CommunityCoreValuesConnection
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  createdByAggregate?: Maybe<CommunityPersonCreatedByAggregationSelection>
  createdByConnection: CommunityCreatedByConnection
  description?: Maybe<Scalars['String']['output']>
  goals: Array<Goal>
  goalsAggregate?: Maybe<CommunityGoalGoalsAggregationSelection>
  goalsConnection: CommunityGoalsConnection
  id: Scalars['ID']['output']
  location?: Maybe<Scalars['String']['output']>
  members: Array<Person>
  membersAggregate?: Maybe<CommunityPersonMembersAggregationSelection>
  membersConnection: CommunityMembersConnection
  name: Scalars['String']['output']
  relatedCommunities: Array<Community>
  relatedCommunitiesAggregate?: Maybe<CommunityCommunityRelatedCommunitiesAggregationSelection>
  relatedCommunitiesConnection: CommunityRelatedCommunitiesConnection
  resources: Array<Resource>
  resourcesAggregate?: Maybe<CommunityResourceResourcesAggregationSelection>
  resourcesConnection: CommunityResourcesConnection
  resultsAchieved?: Maybe<Scalars['String']['output']>
  status: Scalars['String']['output']
  time?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  why?: Maybe<Scalars['String']['output']>
}

export type CommunityCoreValuesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueSort>>
  where?: InputMaybe<CoreValueWhere>
}

export type CommunityCoreValuesAggregateArgs = {
  where?: InputMaybe<CoreValueWhere>
}

export type CommunityCoreValuesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunityCoreValuesConnectionSort>>
  where?: InputMaybe<CommunityCoreValuesConnectionWhere>
}

export type CommunityCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type CommunityCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type CommunityCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunityCreatedByConnectionSort>>
  where?: InputMaybe<CommunityCreatedByConnectionWhere>
}

export type CommunityGoalsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalSort>>
  where?: InputMaybe<GoalWhere>
}

export type CommunityGoalsAggregateArgs = {
  where?: InputMaybe<GoalWhere>
}

export type CommunityGoalsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunityGoalsConnectionSort>>
  where?: InputMaybe<CommunityGoalsConnectionWhere>
}

export type CommunityMembersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type CommunityMembersAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type CommunityMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunityMembersConnectionSort>>
  where?: InputMaybe<CommunityMembersConnectionWhere>
}

export type CommunityRelatedCommunitiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunitySort>>
  where?: InputMaybe<CommunityWhere>
}

export type CommunityRelatedCommunitiesAggregateArgs = {
  where?: InputMaybe<CommunityWhere>
}

export type CommunityRelatedCommunitiesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunityRelatedCommunitiesConnectionSort>>
  where?: InputMaybe<CommunityRelatedCommunitiesConnectionWhere>
}

export type CommunityResourcesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type CommunityResourcesAggregateArgs = {
  where?: InputMaybe<ResourceWhere>
}

export type CommunityResourcesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunityResourcesConnectionSort>>
  where?: InputMaybe<CommunityResourcesConnectionWhere>
}

export type CommunityAggregateSelection = {
  __typename?: 'CommunityAggregateSelection'
  activities: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  resultsAchieved: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CommunityCommunityRelatedCommunitiesAggregationSelection = {
  __typename?: 'CommunityCommunityRelatedCommunitiesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunityCommunityRelatedCommunitiesNodeAggregateSelection>
}

export type CommunityCommunityRelatedCommunitiesNodeAggregateSelection = {
  __typename?: 'CommunityCommunityRelatedCommunitiesNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  resultsAchieved: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CommunityConnectInput = {
  coreValues?: InputMaybe<Array<CommunityCoreValuesConnectFieldInput>>
  createdBy?: InputMaybe<Array<CommunityCreatedByConnectFieldInput>>
  goals?: InputMaybe<Array<CommunityGoalsConnectFieldInput>>
  members?: InputMaybe<Array<CommunityMembersConnectFieldInput>>
  relatedCommunities?: InputMaybe<
    Array<CommunityRelatedCommunitiesConnectFieldInput>
  >
  resources?: InputMaybe<Array<CommunityResourcesConnectFieldInput>>
}

export type CommunityConnectWhere = {
  node: CommunityWhere
}

export type CommunityCoreValueCoreValuesAggregationSelection = {
  __typename?: 'CommunityCoreValueCoreValuesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunityCoreValueCoreValuesNodeAggregateSelection>
}

export type CommunityCoreValueCoreValuesNodeAggregateSelection = {
  __typename?: 'CommunityCoreValueCoreValuesNodeAggregateSelection'
  alignmentChallenges: StringAggregateSelection
  alignmentExamples: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  name: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CommunityCoreValuesAggregateInput = {
  AND?: InputMaybe<Array<CommunityCoreValuesAggregateInput>>
  NOT?: InputMaybe<CommunityCoreValuesAggregateInput>
  OR?: InputMaybe<Array<CommunityCoreValuesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CommunityCoreValuesNodeAggregationWhereInput>
}

export type CommunityCoreValuesConnectFieldInput = {
  connect?: InputMaybe<Array<CoreValueConnectInput>>
  where?: InputMaybe<CoreValueConnectWhere>
}

export type CommunityCoreValuesConnection = {
  __typename?: 'CommunityCoreValuesConnection'
  edges: Array<CommunityCoreValuesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityCoreValuesConnectionSort = {
  node?: InputMaybe<CoreValueSort>
}

export type CommunityCoreValuesConnectionWhere = {
  AND?: InputMaybe<Array<CommunityCoreValuesConnectionWhere>>
  NOT?: InputMaybe<CommunityCoreValuesConnectionWhere>
  OR?: InputMaybe<Array<CommunityCoreValuesConnectionWhere>>
  node?: InputMaybe<CoreValueWhere>
}

export type CommunityCoreValuesCreateFieldInput = {
  node: CoreValueCreateInput
}

export type CommunityCoreValuesDeleteFieldInput = {
  delete?: InputMaybe<CoreValueDeleteInput>
  where?: InputMaybe<CommunityCoreValuesConnectionWhere>
}

export type CommunityCoreValuesDisconnectFieldInput = {
  disconnect?: InputMaybe<CoreValueDisconnectInput>
  where?: InputMaybe<CommunityCoreValuesConnectionWhere>
}

export type CommunityCoreValuesFieldInput = {
  connect?: InputMaybe<Array<CommunityCoreValuesConnectFieldInput>>
  create?: InputMaybe<Array<CommunityCoreValuesCreateFieldInput>>
}

export type CommunityCoreValuesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CommunityCoreValuesNodeAggregationWhereInput>>
  NOT?: InputMaybe<CommunityCoreValuesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CommunityCoreValuesNodeAggregationWhereInput>>
  alignmentChallenges_AVERAGE_LENGTH_EQUAL?: InputMaybe<
    Scalars['Float']['input']
  >
  alignmentChallenges_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_EQUAL?: InputMaybe<
    Scalars['Int']['input']
  >
  alignmentChallenges_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CommunityCoreValuesRelationship = {
  __typename?: 'CommunityCoreValuesRelationship'
  cursor: Scalars['String']['output']
  node: CoreValue
}

export type CommunityCoreValuesUpdateConnectionInput = {
  node?: InputMaybe<CoreValueUpdateInput>
}

export type CommunityCoreValuesUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityCoreValuesConnectFieldInput>>
  create?: InputMaybe<Array<CommunityCoreValuesCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityCoreValuesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CommunityCoreValuesDisconnectFieldInput>>
  update?: InputMaybe<CommunityCoreValuesUpdateConnectionInput>
  where?: InputMaybe<CommunityCoreValuesConnectionWhere>
}

export type CommunityCreateInput = {
  activities?: InputMaybe<Scalars['String']['input']>
  coreValues?: InputMaybe<CommunityCoreValuesFieldInput>
  createdBy?: InputMaybe<CommunityCreatedByFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  goals?: InputMaybe<CommunityGoalsFieldInput>
  location?: InputMaybe<Scalars['String']['input']>
  members?: InputMaybe<CommunityMembersFieldInput>
  name: Scalars['String']['input']
  relatedCommunities?: InputMaybe<CommunityRelatedCommunitiesFieldInput>
  resources?: InputMaybe<CommunityResourcesFieldInput>
  resultsAchieved?: InputMaybe<Scalars['String']['input']>
  status: Scalars['String']['input']
  time?: InputMaybe<Scalars['String']['input']>
  why?: InputMaybe<Scalars['String']['input']>
}

export type CommunityCreatedByAggregateInput = {
  AND?: InputMaybe<Array<CommunityCreatedByAggregateInput>>
  NOT?: InputMaybe<CommunityCreatedByAggregateInput>
  OR?: InputMaybe<Array<CommunityCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CommunityCreatedByNodeAggregationWhereInput>
}

export type CommunityCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type CommunityCreatedByConnection = {
  __typename?: 'CommunityCreatedByConnection'
  edges: Array<CommunityCreatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityCreatedByConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type CommunityCreatedByConnectionWhere = {
  AND?: InputMaybe<Array<CommunityCreatedByConnectionWhere>>
  NOT?: InputMaybe<CommunityCreatedByConnectionWhere>
  OR?: InputMaybe<Array<CommunityCreatedByConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type CommunityCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type CommunityCreatedByDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<CommunityCreatedByConnectionWhere>
}

export type CommunityCreatedByDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<CommunityCreatedByConnectionWhere>
}

export type CommunityCreatedByFieldInput = {
  connect?: InputMaybe<Array<CommunityCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<CommunityCreatedByCreateFieldInput>>
}

export type CommunityCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CommunityCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<CommunityCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CommunityCreatedByNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type CommunityCreatedByRelationship = {
  __typename?: 'CommunityCreatedByRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type CommunityCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type CommunityCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<CommunityCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CommunityCreatedByDisconnectFieldInput>>
  update?: InputMaybe<CommunityCreatedByUpdateConnectionInput>
  where?: InputMaybe<CommunityCreatedByConnectionWhere>
}

export type CommunityDeleteInput = {
  coreValues?: InputMaybe<Array<CommunityCoreValuesDeleteFieldInput>>
  createdBy?: InputMaybe<Array<CommunityCreatedByDeleteFieldInput>>
  goals?: InputMaybe<Array<CommunityGoalsDeleteFieldInput>>
  members?: InputMaybe<Array<CommunityMembersDeleteFieldInput>>
  relatedCommunities?: InputMaybe<
    Array<CommunityRelatedCommunitiesDeleteFieldInput>
  >
  resources?: InputMaybe<Array<CommunityResourcesDeleteFieldInput>>
}

export type CommunityDisconnectInput = {
  coreValues?: InputMaybe<Array<CommunityCoreValuesDisconnectFieldInput>>
  createdBy?: InputMaybe<Array<CommunityCreatedByDisconnectFieldInput>>
  goals?: InputMaybe<Array<CommunityGoalsDisconnectFieldInput>>
  members?: InputMaybe<Array<CommunityMembersDisconnectFieldInput>>
  relatedCommunities?: InputMaybe<
    Array<CommunityRelatedCommunitiesDisconnectFieldInput>
  >
  resources?: InputMaybe<Array<CommunityResourcesDisconnectFieldInput>>
}

export type CommunityEdge = {
  __typename?: 'CommunityEdge'
  cursor: Scalars['String']['output']
  node: Community
}

export type CommunityGoalGoalsAggregationSelection = {
  __typename?: 'CommunityGoalGoalsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunityGoalGoalsNodeAggregateSelection>
}

export type CommunityGoalGoalsNodeAggregateSelection = {
  __typename?: 'CommunityGoalGoalsNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  photo: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CommunityGoalsAggregateInput = {
  AND?: InputMaybe<Array<CommunityGoalsAggregateInput>>
  NOT?: InputMaybe<CommunityGoalsAggregateInput>
  OR?: InputMaybe<Array<CommunityGoalsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CommunityGoalsNodeAggregationWhereInput>
}

export type CommunityGoalsConnectFieldInput = {
  connect?: InputMaybe<Array<GoalConnectInput>>
  where?: InputMaybe<GoalConnectWhere>
}

export type CommunityGoalsConnection = {
  __typename?: 'CommunityGoalsConnection'
  edges: Array<CommunityGoalsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityGoalsConnectionSort = {
  node?: InputMaybe<GoalSort>
}

export type CommunityGoalsConnectionWhere = {
  AND?: InputMaybe<Array<CommunityGoalsConnectionWhere>>
  NOT?: InputMaybe<CommunityGoalsConnectionWhere>
  OR?: InputMaybe<Array<CommunityGoalsConnectionWhere>>
  node?: InputMaybe<GoalWhere>
}

export type CommunityGoalsCreateFieldInput = {
  node: GoalCreateInput
}

export type CommunityGoalsDeleteFieldInput = {
  delete?: InputMaybe<GoalDeleteInput>
  where?: InputMaybe<CommunityGoalsConnectionWhere>
}

export type CommunityGoalsDisconnectFieldInput = {
  disconnect?: InputMaybe<GoalDisconnectInput>
  where?: InputMaybe<CommunityGoalsConnectionWhere>
}

export type CommunityGoalsFieldInput = {
  connect?: InputMaybe<Array<CommunityGoalsConnectFieldInput>>
  create?: InputMaybe<Array<CommunityGoalsCreateFieldInput>>
}

export type CommunityGoalsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CommunityGoalsNodeAggregationWhereInput>>
  NOT?: InputMaybe<CommunityGoalsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CommunityGoalsNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CommunityGoalsRelationship = {
  __typename?: 'CommunityGoalsRelationship'
  cursor: Scalars['String']['output']
  node: Goal
}

export type CommunityGoalsUpdateConnectionInput = {
  node?: InputMaybe<GoalUpdateInput>
}

export type CommunityGoalsUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityGoalsConnectFieldInput>>
  create?: InputMaybe<Array<CommunityGoalsCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityGoalsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CommunityGoalsDisconnectFieldInput>>
  update?: InputMaybe<CommunityGoalsUpdateConnectionInput>
  where?: InputMaybe<CommunityGoalsConnectionWhere>
}

export type CommunityMembersAggregateInput = {
  AND?: InputMaybe<Array<CommunityMembersAggregateInput>>
  NOT?: InputMaybe<CommunityMembersAggregateInput>
  OR?: InputMaybe<Array<CommunityMembersAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CommunityMembersNodeAggregationWhereInput>
}

export type CommunityMembersConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type CommunityMembersConnection = {
  __typename?: 'CommunityMembersConnection'
  edges: Array<CommunityMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityMembersConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type CommunityMembersConnectionWhere = {
  AND?: InputMaybe<Array<CommunityMembersConnectionWhere>>
  NOT?: InputMaybe<CommunityMembersConnectionWhere>
  OR?: InputMaybe<Array<CommunityMembersConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type CommunityMembersCreateFieldInput = {
  node: PersonCreateInput
}

export type CommunityMembersDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<CommunityMembersConnectionWhere>
}

export type CommunityMembersDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<CommunityMembersConnectionWhere>
}

export type CommunityMembersFieldInput = {
  connect?: InputMaybe<Array<CommunityMembersConnectFieldInput>>
  create?: InputMaybe<Array<CommunityMembersCreateFieldInput>>
}

export type CommunityMembersNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CommunityMembersNodeAggregationWhereInput>>
  NOT?: InputMaybe<CommunityMembersNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CommunityMembersNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type CommunityMembersRelationship = {
  __typename?: 'CommunityMembersRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type CommunityMembersUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type CommunityMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityMembersConnectFieldInput>>
  create?: InputMaybe<Array<CommunityMembersCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CommunityMembersDisconnectFieldInput>>
  update?: InputMaybe<CommunityMembersUpdateConnectionInput>
  where?: InputMaybe<CommunityMembersConnectionWhere>
}

export type CommunityPersonCreatedByAggregationSelection = {
  __typename?: 'CommunityPersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunityPersonCreatedByNodeAggregateSelection>
}

export type CommunityPersonCreatedByNodeAggregateSelection = {
  __typename?: 'CommunityPersonCreatedByNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type CommunityPersonMembersAggregationSelection = {
  __typename?: 'CommunityPersonMembersAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunityPersonMembersNodeAggregateSelection>
}

export type CommunityPersonMembersNodeAggregateSelection = {
  __typename?: 'CommunityPersonMembersNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type CommunityRelatedCommunitiesAggregateInput = {
  AND?: InputMaybe<Array<CommunityRelatedCommunitiesAggregateInput>>
  NOT?: InputMaybe<CommunityRelatedCommunitiesAggregateInput>
  OR?: InputMaybe<Array<CommunityRelatedCommunitiesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CommunityRelatedCommunitiesNodeAggregationWhereInput>
}

export type CommunityRelatedCommunitiesConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type CommunityRelatedCommunitiesConnection = {
  __typename?: 'CommunityRelatedCommunitiesConnection'
  edges: Array<CommunityRelatedCommunitiesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityRelatedCommunitiesConnectionSort = {
  node?: InputMaybe<CommunitySort>
}

export type CommunityRelatedCommunitiesConnectionWhere = {
  AND?: InputMaybe<Array<CommunityRelatedCommunitiesConnectionWhere>>
  NOT?: InputMaybe<CommunityRelatedCommunitiesConnectionWhere>
  OR?: InputMaybe<Array<CommunityRelatedCommunitiesConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type CommunityRelatedCommunitiesCreateFieldInput = {
  node: CommunityCreateInput
}

export type CommunityRelatedCommunitiesDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<CommunityRelatedCommunitiesConnectionWhere>
}

export type CommunityRelatedCommunitiesDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<CommunityRelatedCommunitiesConnectionWhere>
}

export type CommunityRelatedCommunitiesFieldInput = {
  connect?: InputMaybe<Array<CommunityRelatedCommunitiesConnectFieldInput>>
  create?: InputMaybe<Array<CommunityRelatedCommunitiesCreateFieldInput>>
}

export type CommunityRelatedCommunitiesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CommunityRelatedCommunitiesNodeAggregationWhereInput>>
  NOT?: InputMaybe<CommunityRelatedCommunitiesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CommunityRelatedCommunitiesNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  resultsAchieved_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CommunityRelatedCommunitiesRelationship = {
  __typename?: 'CommunityRelatedCommunitiesRelationship'
  cursor: Scalars['String']['output']
  node: Community
}

export type CommunityRelatedCommunitiesUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
}

export type CommunityRelatedCommunitiesUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityRelatedCommunitiesConnectFieldInput>>
  create?: InputMaybe<Array<CommunityRelatedCommunitiesCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityRelatedCommunitiesDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<CommunityRelatedCommunitiesDisconnectFieldInput>
  >
  update?: InputMaybe<CommunityRelatedCommunitiesUpdateConnectionInput>
  where?: InputMaybe<CommunityRelatedCommunitiesConnectionWhere>
}

export type CommunityResourceResourcesAggregationSelection = {
  __typename?: 'CommunityResourceResourcesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunityResourceResourcesNodeAggregateSelection>
}

export type CommunityResourceResourcesNodeAggregateSelection = {
  __typename?: 'CommunityResourceResourcesNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CommunityResourcesAggregateInput = {
  AND?: InputMaybe<Array<CommunityResourcesAggregateInput>>
  NOT?: InputMaybe<CommunityResourcesAggregateInput>
  OR?: InputMaybe<Array<CommunityResourcesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CommunityResourcesNodeAggregationWhereInput>
}

export type CommunityResourcesConnectFieldInput = {
  connect?: InputMaybe<Array<ResourceConnectInput>>
  where?: InputMaybe<ResourceConnectWhere>
}

export type CommunityResourcesConnection = {
  __typename?: 'CommunityResourcesConnection'
  edges: Array<CommunityResourcesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityResourcesConnectionSort = {
  node?: InputMaybe<ResourceSort>
}

export type CommunityResourcesConnectionWhere = {
  AND?: InputMaybe<Array<CommunityResourcesConnectionWhere>>
  NOT?: InputMaybe<CommunityResourcesConnectionWhere>
  OR?: InputMaybe<Array<CommunityResourcesConnectionWhere>>
  node?: InputMaybe<ResourceWhere>
}

export type CommunityResourcesCreateFieldInput = {
  node: ResourceCreateInput
}

export type CommunityResourcesDeleteFieldInput = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<CommunityResourcesConnectionWhere>
}

export type CommunityResourcesDisconnectFieldInput = {
  disconnect?: InputMaybe<ResourceDisconnectInput>
  where?: InputMaybe<CommunityResourcesConnectionWhere>
}

export type CommunityResourcesFieldInput = {
  connect?: InputMaybe<Array<CommunityResourcesConnectFieldInput>>
  create?: InputMaybe<Array<CommunityResourcesCreateFieldInput>>
}

export type CommunityResourcesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CommunityResourcesNodeAggregationWhereInput>>
  NOT?: InputMaybe<CommunityResourcesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CommunityResourcesNodeAggregationWhereInput>>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CommunityResourcesRelationship = {
  __typename?: 'CommunityResourcesRelationship'
  cursor: Scalars['String']['output']
  node: Resource
}

export type CommunityResourcesUpdateConnectionInput = {
  node?: InputMaybe<ResourceUpdateInput>
}

export type CommunityResourcesUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityResourcesConnectFieldInput>>
  create?: InputMaybe<Array<CommunityResourcesCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityResourcesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CommunityResourcesDisconnectFieldInput>>
  update?: InputMaybe<CommunityResourcesUpdateConnectionInput>
  where?: InputMaybe<CommunityResourcesConnectionWhere>
}

/** Fields to sort Communities by. The order in which sorts are applied is not guaranteed when specifying many fields in one CommunitySort object. */
export type CommunitySort = {
  activities?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  description?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  resultsAchieved?: InputMaybe<SortDirection>
  status?: InputMaybe<SortDirection>
  time?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
  why?: InputMaybe<SortDirection>
}

export type CommunityUpdateInput = {
  activities_SET?: InputMaybe<Scalars['String']['input']>
  coreValues?: InputMaybe<Array<CommunityCoreValuesUpdateFieldInput>>
  createdBy?: InputMaybe<Array<CommunityCreatedByUpdateFieldInput>>
  description_SET?: InputMaybe<Scalars['String']['input']>
  goals?: InputMaybe<Array<CommunityGoalsUpdateFieldInput>>
  location_SET?: InputMaybe<Scalars['String']['input']>
  members?: InputMaybe<Array<CommunityMembersUpdateFieldInput>>
  name_SET?: InputMaybe<Scalars['String']['input']>
  relatedCommunities?: InputMaybe<
    Array<CommunityRelatedCommunitiesUpdateFieldInput>
  >
  resources?: InputMaybe<Array<CommunityResourcesUpdateFieldInput>>
  resultsAchieved_SET?: InputMaybe<Scalars['String']['input']>
  status_SET?: InputMaybe<Scalars['String']['input']>
  time_SET?: InputMaybe<Scalars['String']['input']>
  why_SET?: InputMaybe<Scalars['String']['input']>
}

export type CommunityWhere = {
  AND?: InputMaybe<Array<CommunityWhere>>
  NOT?: InputMaybe<CommunityWhere>
  OR?: InputMaybe<Array<CommunityWhere>>
  activities_CONTAINS?: InputMaybe<Scalars['String']['input']>
  activities_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  activities_EQ?: InputMaybe<Scalars['String']['input']>
  activities_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  activities_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  coreValuesAggregate?: InputMaybe<CommunityCoreValuesAggregateInput>
  /** Return Communities where all of the related CommunityCoreValuesConnections match this filter */
  coreValuesConnection_ALL?: InputMaybe<CommunityCoreValuesConnectionWhere>
  /** Return Communities where none of the related CommunityCoreValuesConnections match this filter */
  coreValuesConnection_NONE?: InputMaybe<CommunityCoreValuesConnectionWhere>
  /** Return Communities where one of the related CommunityCoreValuesConnections match this filter */
  coreValuesConnection_SINGLE?: InputMaybe<CommunityCoreValuesConnectionWhere>
  /** Return Communities where some of the related CommunityCoreValuesConnections match this filter */
  coreValuesConnection_SOME?: InputMaybe<CommunityCoreValuesConnectionWhere>
  /** Return Communities where all of the related CoreValues match this filter */
  coreValues_ALL?: InputMaybe<CoreValueWhere>
  /** Return Communities where none of the related CoreValues match this filter */
  coreValues_NONE?: InputMaybe<CoreValueWhere>
  /** Return Communities where one of the related CoreValues match this filter */
  coreValues_SINGLE?: InputMaybe<CoreValueWhere>
  /** Return Communities where some of the related CoreValues match this filter */
  coreValues_SOME?: InputMaybe<CoreValueWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdByAggregate?: InputMaybe<CommunityCreatedByAggregateInput>
  /** Return Communities where all of the related CommunityCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<CommunityCreatedByConnectionWhere>
  /** Return Communities where none of the related CommunityCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<CommunityCreatedByConnectionWhere>
  /** Return Communities where one of the related CommunityCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<CommunityCreatedByConnectionWhere>
  /** Return Communities where some of the related CommunityCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<CommunityCreatedByConnectionWhere>
  /** Return Communities where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return Communities where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return Communities where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return Communities where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
  description_CONTAINS?: InputMaybe<Scalars['String']['input']>
  description_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  description_EQ?: InputMaybe<Scalars['String']['input']>
  description_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  description_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  goalsAggregate?: InputMaybe<CommunityGoalsAggregateInput>
  /** Return Communities where all of the related CommunityGoalsConnections match this filter */
  goalsConnection_ALL?: InputMaybe<CommunityGoalsConnectionWhere>
  /** Return Communities where none of the related CommunityGoalsConnections match this filter */
  goalsConnection_NONE?: InputMaybe<CommunityGoalsConnectionWhere>
  /** Return Communities where one of the related CommunityGoalsConnections match this filter */
  goalsConnection_SINGLE?: InputMaybe<CommunityGoalsConnectionWhere>
  /** Return Communities where some of the related CommunityGoalsConnections match this filter */
  goalsConnection_SOME?: InputMaybe<CommunityGoalsConnectionWhere>
  /** Return Communities where all of the related Goals match this filter */
  goals_ALL?: InputMaybe<GoalWhere>
  /** Return Communities where none of the related Goals match this filter */
  goals_NONE?: InputMaybe<GoalWhere>
  /** Return Communities where one of the related Goals match this filter */
  goals_SINGLE?: InputMaybe<GoalWhere>
  /** Return Communities where some of the related Goals match this filter */
  goals_SOME?: InputMaybe<GoalWhere>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  location_CONTAINS?: InputMaybe<Scalars['String']['input']>
  location_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  location_EQ?: InputMaybe<Scalars['String']['input']>
  location_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  location_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  membersAggregate?: InputMaybe<CommunityMembersAggregateInput>
  /** Return Communities where all of the related CommunityMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<CommunityMembersConnectionWhere>
  /** Return Communities where none of the related CommunityMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<CommunityMembersConnectionWhere>
  /** Return Communities where one of the related CommunityMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<CommunityMembersConnectionWhere>
  /** Return Communities where some of the related CommunityMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<CommunityMembersConnectionWhere>
  /** Return Communities where all of the related People match this filter */
  members_ALL?: InputMaybe<PersonWhere>
  /** Return Communities where none of the related People match this filter */
  members_NONE?: InputMaybe<PersonWhere>
  /** Return Communities where one of the related People match this filter */
  members_SINGLE?: InputMaybe<PersonWhere>
  /** Return Communities where some of the related People match this filter */
  members_SOME?: InputMaybe<PersonWhere>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  relatedCommunitiesAggregate?: InputMaybe<CommunityRelatedCommunitiesAggregateInput>
  /** Return Communities where all of the related CommunityRelatedCommunitiesConnections match this filter */
  relatedCommunitiesConnection_ALL?: InputMaybe<CommunityRelatedCommunitiesConnectionWhere>
  /** Return Communities where none of the related CommunityRelatedCommunitiesConnections match this filter */
  relatedCommunitiesConnection_NONE?: InputMaybe<CommunityRelatedCommunitiesConnectionWhere>
  /** Return Communities where one of the related CommunityRelatedCommunitiesConnections match this filter */
  relatedCommunitiesConnection_SINGLE?: InputMaybe<CommunityRelatedCommunitiesConnectionWhere>
  /** Return Communities where some of the related CommunityRelatedCommunitiesConnections match this filter */
  relatedCommunitiesConnection_SOME?: InputMaybe<CommunityRelatedCommunitiesConnectionWhere>
  /** Return Communities where all of the related Communities match this filter */
  relatedCommunities_ALL?: InputMaybe<CommunityWhere>
  /** Return Communities where none of the related Communities match this filter */
  relatedCommunities_NONE?: InputMaybe<CommunityWhere>
  /** Return Communities where one of the related Communities match this filter */
  relatedCommunities_SINGLE?: InputMaybe<CommunityWhere>
  /** Return Communities where some of the related Communities match this filter */
  relatedCommunities_SOME?: InputMaybe<CommunityWhere>
  resourcesAggregate?: InputMaybe<CommunityResourcesAggregateInput>
  /** Return Communities where all of the related CommunityResourcesConnections match this filter */
  resourcesConnection_ALL?: InputMaybe<CommunityResourcesConnectionWhere>
  /** Return Communities where none of the related CommunityResourcesConnections match this filter */
  resourcesConnection_NONE?: InputMaybe<CommunityResourcesConnectionWhere>
  /** Return Communities where one of the related CommunityResourcesConnections match this filter */
  resourcesConnection_SINGLE?: InputMaybe<CommunityResourcesConnectionWhere>
  /** Return Communities where some of the related CommunityResourcesConnections match this filter */
  resourcesConnection_SOME?: InputMaybe<CommunityResourcesConnectionWhere>
  /** Return Communities where all of the related Resources match this filter */
  resources_ALL?: InputMaybe<ResourceWhere>
  /** Return Communities where none of the related Resources match this filter */
  resources_NONE?: InputMaybe<ResourceWhere>
  /** Return Communities where one of the related Resources match this filter */
  resources_SINGLE?: InputMaybe<ResourceWhere>
  /** Return Communities where some of the related Resources match this filter */
  resources_SOME?: InputMaybe<ResourceWhere>
  resultsAchieved_CONTAINS?: InputMaybe<Scalars['String']['input']>
  resultsAchieved_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  resultsAchieved_EQ?: InputMaybe<Scalars['String']['input']>
  resultsAchieved_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  resultsAchieved_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  status_CONTAINS?: InputMaybe<Scalars['String']['input']>
  status_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  status_EQ?: InputMaybe<Scalars['String']['input']>
  status_IN?: InputMaybe<Array<Scalars['String']['input']>>
  status_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  time_CONTAINS?: InputMaybe<Scalars['String']['input']>
  time_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  time_EQ?: InputMaybe<Scalars['String']['input']>
  time_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  time_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_CONTAINS?: InputMaybe<Scalars['String']['input']>
  why_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  why_EQ?: InputMaybe<Scalars['String']['input']>
  why_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  why_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type CoreValue = {
  __typename?: 'CoreValue'
  alignmentChallenges?: Maybe<Scalars['String']['output']>
  alignmentExamples?: Maybe<Scalars['String']['output']>
  communities: Array<Community>
  communitiesAggregate?: Maybe<CoreValueCommunityCommunitiesAggregationSelection>
  communitiesConnection: CoreValueCommunitiesConnection
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  createdByAggregate?: Maybe<CoreValuePersonCreatedByAggregationSelection>
  createdByConnection: CoreValueCreatedByConnection
  description?: Maybe<Scalars['String']['output']>
  goals: Array<Goal>
  goalsAggregate?: Maybe<CoreValueGoalGoalsAggregationSelection>
  goalsConnection: CoreValueGoalsConnection
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  people: Array<Person>
  peopleAggregate?: Maybe<CoreValuePersonPeopleAggregationSelection>
  peopleConnection: CoreValuePeopleConnection
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  why?: Maybe<Scalars['String']['output']>
}

export type CoreValueCommunitiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunitySort>>
  where?: InputMaybe<CommunityWhere>
}

export type CoreValueCommunitiesAggregateArgs = {
  where?: InputMaybe<CommunityWhere>
}

export type CoreValueCommunitiesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueCommunitiesConnectionSort>>
  where?: InputMaybe<CoreValueCommunitiesConnectionWhere>
}

export type CoreValueCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type CoreValueCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type CoreValueCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueCreatedByConnectionSort>>
  where?: InputMaybe<CoreValueCreatedByConnectionWhere>
}

export type CoreValueGoalsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalSort>>
  where?: InputMaybe<GoalWhere>
}

export type CoreValueGoalsAggregateArgs = {
  where?: InputMaybe<GoalWhere>
}

export type CoreValueGoalsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueGoalsConnectionSort>>
  where?: InputMaybe<CoreValueGoalsConnectionWhere>
}

export type CoreValuePeopleArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type CoreValuePeopleAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type CoreValuePeopleConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValuePeopleConnectionSort>>
  where?: InputMaybe<CoreValuePeopleConnectionWhere>
}

export type CoreValueAggregateSelection = {
  __typename?: 'CoreValueAggregateSelection'
  alignmentChallenges: StringAggregateSelection
  alignmentExamples: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  name: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CoreValueCommunitiesAggregateInput = {
  AND?: InputMaybe<Array<CoreValueCommunitiesAggregateInput>>
  NOT?: InputMaybe<CoreValueCommunitiesAggregateInput>
  OR?: InputMaybe<Array<CoreValueCommunitiesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CoreValueCommunitiesNodeAggregationWhereInput>
}

export type CoreValueCommunitiesConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type CoreValueCommunitiesConnection = {
  __typename?: 'CoreValueCommunitiesConnection'
  edges: Array<CoreValueCommunitiesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CoreValueCommunitiesConnectionSort = {
  node?: InputMaybe<CommunitySort>
}

export type CoreValueCommunitiesConnectionWhere = {
  AND?: InputMaybe<Array<CoreValueCommunitiesConnectionWhere>>
  NOT?: InputMaybe<CoreValueCommunitiesConnectionWhere>
  OR?: InputMaybe<Array<CoreValueCommunitiesConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type CoreValueCommunitiesCreateFieldInput = {
  node: CommunityCreateInput
}

export type CoreValueCommunitiesDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<CoreValueCommunitiesConnectionWhere>
}

export type CoreValueCommunitiesDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<CoreValueCommunitiesConnectionWhere>
}

export type CoreValueCommunitiesFieldInput = {
  connect?: InputMaybe<Array<CoreValueCommunitiesConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueCommunitiesCreateFieldInput>>
}

export type CoreValueCommunitiesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CoreValueCommunitiesNodeAggregationWhereInput>>
  NOT?: InputMaybe<CoreValueCommunitiesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CoreValueCommunitiesNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  resultsAchieved_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CoreValueCommunitiesRelationship = {
  __typename?: 'CoreValueCommunitiesRelationship'
  cursor: Scalars['String']['output']
  node: Community
}

export type CoreValueCommunitiesUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
}

export type CoreValueCommunitiesUpdateFieldInput = {
  connect?: InputMaybe<Array<CoreValueCommunitiesConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueCommunitiesCreateFieldInput>>
  delete?: InputMaybe<Array<CoreValueCommunitiesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CoreValueCommunitiesDisconnectFieldInput>>
  update?: InputMaybe<CoreValueCommunitiesUpdateConnectionInput>
  where?: InputMaybe<CoreValueCommunitiesConnectionWhere>
}

export type CoreValueCommunityCommunitiesAggregationSelection = {
  __typename?: 'CoreValueCommunityCommunitiesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CoreValueCommunityCommunitiesNodeAggregateSelection>
}

export type CoreValueCommunityCommunitiesNodeAggregateSelection = {
  __typename?: 'CoreValueCommunityCommunitiesNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  resultsAchieved: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CoreValueConnectInput = {
  communities?: InputMaybe<Array<CoreValueCommunitiesConnectFieldInput>>
  createdBy?: InputMaybe<Array<CoreValueCreatedByConnectFieldInput>>
  goals?: InputMaybe<Array<CoreValueGoalsConnectFieldInput>>
  people?: InputMaybe<Array<CoreValuePeopleConnectFieldInput>>
}

export type CoreValueConnectWhere = {
  node: CoreValueWhere
}

export type CoreValueCreateInput = {
  alignmentChallenges?: InputMaybe<Scalars['String']['input']>
  alignmentExamples?: InputMaybe<Scalars['String']['input']>
  communities?: InputMaybe<CoreValueCommunitiesFieldInput>
  createdBy?: InputMaybe<CoreValueCreatedByFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  goals?: InputMaybe<CoreValueGoalsFieldInput>
  name: Scalars['String']['input']
  people?: InputMaybe<CoreValuePeopleFieldInput>
  why?: InputMaybe<Scalars['String']['input']>
}

export type CoreValueCreatedByAggregateInput = {
  AND?: InputMaybe<Array<CoreValueCreatedByAggregateInput>>
  NOT?: InputMaybe<CoreValueCreatedByAggregateInput>
  OR?: InputMaybe<Array<CoreValueCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CoreValueCreatedByNodeAggregationWhereInput>
}

export type CoreValueCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type CoreValueCreatedByConnection = {
  __typename?: 'CoreValueCreatedByConnection'
  edges: Array<CoreValueCreatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CoreValueCreatedByConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type CoreValueCreatedByConnectionWhere = {
  AND?: InputMaybe<Array<CoreValueCreatedByConnectionWhere>>
  NOT?: InputMaybe<CoreValueCreatedByConnectionWhere>
  OR?: InputMaybe<Array<CoreValueCreatedByConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type CoreValueCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type CoreValueCreatedByDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<CoreValueCreatedByConnectionWhere>
}

export type CoreValueCreatedByDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<CoreValueCreatedByConnectionWhere>
}

export type CoreValueCreatedByFieldInput = {
  connect?: InputMaybe<Array<CoreValueCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueCreatedByCreateFieldInput>>
}

export type CoreValueCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CoreValueCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<CoreValueCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CoreValueCreatedByNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type CoreValueCreatedByRelationship = {
  __typename?: 'CoreValueCreatedByRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type CoreValueCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type CoreValueCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<CoreValueCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<CoreValueCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CoreValueCreatedByDisconnectFieldInput>>
  update?: InputMaybe<CoreValueCreatedByUpdateConnectionInput>
  where?: InputMaybe<CoreValueCreatedByConnectionWhere>
}

export type CoreValueDeleteInput = {
  communities?: InputMaybe<Array<CoreValueCommunitiesDeleteFieldInput>>
  createdBy?: InputMaybe<Array<CoreValueCreatedByDeleteFieldInput>>
  goals?: InputMaybe<Array<CoreValueGoalsDeleteFieldInput>>
  people?: InputMaybe<Array<CoreValuePeopleDeleteFieldInput>>
}

export type CoreValueDisconnectInput = {
  communities?: InputMaybe<Array<CoreValueCommunitiesDisconnectFieldInput>>
  createdBy?: InputMaybe<Array<CoreValueCreatedByDisconnectFieldInput>>
  goals?: InputMaybe<Array<CoreValueGoalsDisconnectFieldInput>>
  people?: InputMaybe<Array<CoreValuePeopleDisconnectFieldInput>>
}

export type CoreValueEdge = {
  __typename?: 'CoreValueEdge'
  cursor: Scalars['String']['output']
  node: CoreValue
}

export type CoreValueGoalGoalsAggregationSelection = {
  __typename?: 'CoreValueGoalGoalsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CoreValueGoalGoalsNodeAggregateSelection>
}

export type CoreValueGoalGoalsNodeAggregateSelection = {
  __typename?: 'CoreValueGoalGoalsNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  photo: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type CoreValueGoalsAggregateInput = {
  AND?: InputMaybe<Array<CoreValueGoalsAggregateInput>>
  NOT?: InputMaybe<CoreValueGoalsAggregateInput>
  OR?: InputMaybe<Array<CoreValueGoalsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CoreValueGoalsNodeAggregationWhereInput>
}

export type CoreValueGoalsConnectFieldInput = {
  connect?: InputMaybe<Array<GoalConnectInput>>
  where?: InputMaybe<GoalConnectWhere>
}

export type CoreValueGoalsConnection = {
  __typename?: 'CoreValueGoalsConnection'
  edges: Array<CoreValueGoalsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CoreValueGoalsConnectionSort = {
  node?: InputMaybe<GoalSort>
}

export type CoreValueGoalsConnectionWhere = {
  AND?: InputMaybe<Array<CoreValueGoalsConnectionWhere>>
  NOT?: InputMaybe<CoreValueGoalsConnectionWhere>
  OR?: InputMaybe<Array<CoreValueGoalsConnectionWhere>>
  node?: InputMaybe<GoalWhere>
}

export type CoreValueGoalsCreateFieldInput = {
  node: GoalCreateInput
}

export type CoreValueGoalsDeleteFieldInput = {
  delete?: InputMaybe<GoalDeleteInput>
  where?: InputMaybe<CoreValueGoalsConnectionWhere>
}

export type CoreValueGoalsDisconnectFieldInput = {
  disconnect?: InputMaybe<GoalDisconnectInput>
  where?: InputMaybe<CoreValueGoalsConnectionWhere>
}

export type CoreValueGoalsFieldInput = {
  connect?: InputMaybe<Array<CoreValueGoalsConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueGoalsCreateFieldInput>>
}

export type CoreValueGoalsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CoreValueGoalsNodeAggregationWhereInput>>
  NOT?: InputMaybe<CoreValueGoalsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CoreValueGoalsNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CoreValueGoalsRelationship = {
  __typename?: 'CoreValueGoalsRelationship'
  cursor: Scalars['String']['output']
  node: Goal
}

export type CoreValueGoalsUpdateConnectionInput = {
  node?: InputMaybe<GoalUpdateInput>
}

export type CoreValueGoalsUpdateFieldInput = {
  connect?: InputMaybe<Array<CoreValueGoalsConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueGoalsCreateFieldInput>>
  delete?: InputMaybe<Array<CoreValueGoalsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CoreValueGoalsDisconnectFieldInput>>
  update?: InputMaybe<CoreValueGoalsUpdateConnectionInput>
  where?: InputMaybe<CoreValueGoalsConnectionWhere>
}

export type CoreValuePeopleAggregateInput = {
  AND?: InputMaybe<Array<CoreValuePeopleAggregateInput>>
  NOT?: InputMaybe<CoreValuePeopleAggregateInput>
  OR?: InputMaybe<Array<CoreValuePeopleAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CoreValuePeopleNodeAggregationWhereInput>
}

export type CoreValuePeopleConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type CoreValuePeopleConnection = {
  __typename?: 'CoreValuePeopleConnection'
  edges: Array<CoreValuePeopleRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CoreValuePeopleConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type CoreValuePeopleConnectionWhere = {
  AND?: InputMaybe<Array<CoreValuePeopleConnectionWhere>>
  NOT?: InputMaybe<CoreValuePeopleConnectionWhere>
  OR?: InputMaybe<Array<CoreValuePeopleConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type CoreValuePeopleCreateFieldInput = {
  node: PersonCreateInput
}

export type CoreValuePeopleDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<CoreValuePeopleConnectionWhere>
}

export type CoreValuePeopleDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<CoreValuePeopleConnectionWhere>
}

export type CoreValuePeopleFieldInput = {
  connect?: InputMaybe<Array<CoreValuePeopleConnectFieldInput>>
  create?: InputMaybe<Array<CoreValuePeopleCreateFieldInput>>
}

export type CoreValuePeopleNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CoreValuePeopleNodeAggregationWhereInput>>
  NOT?: InputMaybe<CoreValuePeopleNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CoreValuePeopleNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type CoreValuePeopleRelationship = {
  __typename?: 'CoreValuePeopleRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type CoreValuePeopleUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type CoreValuePeopleUpdateFieldInput = {
  connect?: InputMaybe<Array<CoreValuePeopleConnectFieldInput>>
  create?: InputMaybe<Array<CoreValuePeopleCreateFieldInput>>
  delete?: InputMaybe<Array<CoreValuePeopleDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CoreValuePeopleDisconnectFieldInput>>
  update?: InputMaybe<CoreValuePeopleUpdateConnectionInput>
  where?: InputMaybe<CoreValuePeopleConnectionWhere>
}

export type CoreValuePersonCreatedByAggregationSelection = {
  __typename?: 'CoreValuePersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CoreValuePersonCreatedByNodeAggregateSelection>
}

export type CoreValuePersonCreatedByNodeAggregateSelection = {
  __typename?: 'CoreValuePersonCreatedByNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type CoreValuePersonPeopleAggregationSelection = {
  __typename?: 'CoreValuePersonPeopleAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CoreValuePersonPeopleNodeAggregateSelection>
}

export type CoreValuePersonPeopleNodeAggregateSelection = {
  __typename?: 'CoreValuePersonPeopleNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

/** Fields to sort CoreValues by. The order in which sorts are applied is not guaranteed when specifying many fields in one CoreValueSort object. */
export type CoreValueSort = {
  alignmentChallenges?: InputMaybe<SortDirection>
  alignmentExamples?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  description?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
  why?: InputMaybe<SortDirection>
}

export type CoreValueUpdateInput = {
  alignmentChallenges_SET?: InputMaybe<Scalars['String']['input']>
  alignmentExamples_SET?: InputMaybe<Scalars['String']['input']>
  communities?: InputMaybe<Array<CoreValueCommunitiesUpdateFieldInput>>
  createdBy?: InputMaybe<Array<CoreValueCreatedByUpdateFieldInput>>
  description_SET?: InputMaybe<Scalars['String']['input']>
  goals?: InputMaybe<Array<CoreValueGoalsUpdateFieldInput>>
  name_SET?: InputMaybe<Scalars['String']['input']>
  people?: InputMaybe<Array<CoreValuePeopleUpdateFieldInput>>
  why_SET?: InputMaybe<Scalars['String']['input']>
}

export type CoreValueWhere = {
  AND?: InputMaybe<Array<CoreValueWhere>>
  NOT?: InputMaybe<CoreValueWhere>
  OR?: InputMaybe<Array<CoreValueWhere>>
  alignmentChallenges_CONTAINS?: InputMaybe<Scalars['String']['input']>
  alignmentChallenges_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  alignmentChallenges_EQ?: InputMaybe<Scalars['String']['input']>
  alignmentChallenges_IN?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  alignmentChallenges_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  alignmentExamples_CONTAINS?: InputMaybe<Scalars['String']['input']>
  alignmentExamples_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  alignmentExamples_EQ?: InputMaybe<Scalars['String']['input']>
  alignmentExamples_IN?: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >
  alignmentExamples_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  communitiesAggregate?: InputMaybe<CoreValueCommunitiesAggregateInput>
  /** Return CoreValues where all of the related CoreValueCommunitiesConnections match this filter */
  communitiesConnection_ALL?: InputMaybe<CoreValueCommunitiesConnectionWhere>
  /** Return CoreValues where none of the related CoreValueCommunitiesConnections match this filter */
  communitiesConnection_NONE?: InputMaybe<CoreValueCommunitiesConnectionWhere>
  /** Return CoreValues where one of the related CoreValueCommunitiesConnections match this filter */
  communitiesConnection_SINGLE?: InputMaybe<CoreValueCommunitiesConnectionWhere>
  /** Return CoreValues where some of the related CoreValueCommunitiesConnections match this filter */
  communitiesConnection_SOME?: InputMaybe<CoreValueCommunitiesConnectionWhere>
  /** Return CoreValues where all of the related Communities match this filter */
  communities_ALL?: InputMaybe<CommunityWhere>
  /** Return CoreValues where none of the related Communities match this filter */
  communities_NONE?: InputMaybe<CommunityWhere>
  /** Return CoreValues where one of the related Communities match this filter */
  communities_SINGLE?: InputMaybe<CommunityWhere>
  /** Return CoreValues where some of the related Communities match this filter */
  communities_SOME?: InputMaybe<CommunityWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdByAggregate?: InputMaybe<CoreValueCreatedByAggregateInput>
  /** Return CoreValues where all of the related CoreValueCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<CoreValueCreatedByConnectionWhere>
  /** Return CoreValues where none of the related CoreValueCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<CoreValueCreatedByConnectionWhere>
  /** Return CoreValues where one of the related CoreValueCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<CoreValueCreatedByConnectionWhere>
  /** Return CoreValues where some of the related CoreValueCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<CoreValueCreatedByConnectionWhere>
  /** Return CoreValues where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return CoreValues where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return CoreValues where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return CoreValues where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
  description_CONTAINS?: InputMaybe<Scalars['String']['input']>
  description_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  description_EQ?: InputMaybe<Scalars['String']['input']>
  description_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  description_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  goalsAggregate?: InputMaybe<CoreValueGoalsAggregateInput>
  /** Return CoreValues where all of the related CoreValueGoalsConnections match this filter */
  goalsConnection_ALL?: InputMaybe<CoreValueGoalsConnectionWhere>
  /** Return CoreValues where none of the related CoreValueGoalsConnections match this filter */
  goalsConnection_NONE?: InputMaybe<CoreValueGoalsConnectionWhere>
  /** Return CoreValues where one of the related CoreValueGoalsConnections match this filter */
  goalsConnection_SINGLE?: InputMaybe<CoreValueGoalsConnectionWhere>
  /** Return CoreValues where some of the related CoreValueGoalsConnections match this filter */
  goalsConnection_SOME?: InputMaybe<CoreValueGoalsConnectionWhere>
  /** Return CoreValues where all of the related Goals match this filter */
  goals_ALL?: InputMaybe<GoalWhere>
  /** Return CoreValues where none of the related Goals match this filter */
  goals_NONE?: InputMaybe<GoalWhere>
  /** Return CoreValues where one of the related Goals match this filter */
  goals_SINGLE?: InputMaybe<GoalWhere>
  /** Return CoreValues where some of the related Goals match this filter */
  goals_SOME?: InputMaybe<GoalWhere>
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
  peopleAggregate?: InputMaybe<CoreValuePeopleAggregateInput>
  /** Return CoreValues where all of the related CoreValuePeopleConnections match this filter */
  peopleConnection_ALL?: InputMaybe<CoreValuePeopleConnectionWhere>
  /** Return CoreValues where none of the related CoreValuePeopleConnections match this filter */
  peopleConnection_NONE?: InputMaybe<CoreValuePeopleConnectionWhere>
  /** Return CoreValues where one of the related CoreValuePeopleConnections match this filter */
  peopleConnection_SINGLE?: InputMaybe<CoreValuePeopleConnectionWhere>
  /** Return CoreValues where some of the related CoreValuePeopleConnections match this filter */
  peopleConnection_SOME?: InputMaybe<CoreValuePeopleConnectionWhere>
  /** Return CoreValues where all of the related People match this filter */
  people_ALL?: InputMaybe<PersonWhere>
  /** Return CoreValues where none of the related People match this filter */
  people_NONE?: InputMaybe<PersonWhere>
  /** Return CoreValues where one of the related People match this filter */
  people_SINGLE?: InputMaybe<PersonWhere>
  /** Return CoreValues where some of the related People match this filter */
  people_SOME?: InputMaybe<PersonWhere>
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_CONTAINS?: InputMaybe<Scalars['String']['input']>
  why_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  why_EQ?: InputMaybe<Scalars['String']['input']>
  why_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  why_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type CoreValuesConnection = {
  __typename?: 'CoreValuesConnection'
  edges: Array<CoreValueEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CreateCarePointsMutationResponse = {
  __typename?: 'CreateCarePointsMutationResponse'
  carePoints: Array<CarePoint>
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

export type CreateCoreValuesMutationResponse = {
  __typename?: 'CreateCoreValuesMutationResponse'
  coreValues: Array<CoreValue>
  info: CreateInfo
}

export type CreateGoalsMutationResponse = {
  __typename?: 'CreateGoalsMutationResponse'
  goals: Array<Goal>
  info: CreateInfo
}

/** Information about the number of nodes and relationships created during a create mutation */
export type CreateInfo = {
  __typename?: 'CreateInfo'
  nodesCreated: Scalars['Int']['output']
  relationshipsCreated: Scalars['Int']['output']
}

export type CreatePeopleMutationResponse = {
  __typename?: 'CreatePeopleMutationResponse'
  info: CreateInfo
  people: Array<Person>
}

export type CreateResourcesMutationResponse = {
  __typename?: 'CreateResourcesMutationResponse'
  info: CreateInfo
  resources: Array<Resource>
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

export type Goal = {
  __typename?: 'Goal'
  activities?: Maybe<Scalars['String']['output']>
  caredForByCarePoints: Array<CarePoint>
  caredForByCarePointsAggregate?: Maybe<GoalCarePointCaredForByCarePointsAggregationSelection>
  caredForByCarePointsConnection: GoalCaredForByCarePointsConnection
  coreValues: Array<CoreValue>
  coreValuesAggregate?: Maybe<GoalCoreValueCoreValuesAggregationSelection>
  coreValuesConnection: GoalCoreValuesConnection
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  createdByAggregate?: Maybe<GoalPersonCreatedByAggregationSelection>
  createdByConnection: GoalCreatedByConnection
  description?: Maybe<Scalars['String']['output']>
  enablesCarePoints: Array<CarePoint>
  enablesCarePointsAggregate?: Maybe<GoalCarePointEnablesCarePointsAggregationSelection>
  enablesCarePointsConnection: GoalEnablesCarePointsConnection
  id: Scalars['ID']['output']
  location?: Maybe<Scalars['String']['output']>
  motivatesCommunities: Array<Community>
  motivatesCommunitiesAggregate?: Maybe<GoalCommunityMotivatesCommunitiesAggregationSelection>
  motivatesCommunitiesConnection: GoalMotivatesCommunitiesConnection
  motivatesPeople: Array<Person>
  motivatesPeopleAggregate?: Maybe<GoalPersonMotivatesPeopleAggregationSelection>
  motivatesPeopleConnection: GoalMotivatesPeopleConnection
  name: Scalars['String']['output']
  photo?: Maybe<Scalars['String']['output']>
  resources: Array<Resource>
  resourcesAggregate?: Maybe<GoalResourceResourcesAggregationSelection>
  resourcesConnection: GoalResourcesConnection
  status: Scalars['String']['output']
  successMeasures?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  why?: Maybe<Scalars['String']['output']>
}

export type GoalCaredForByCarePointsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePointSort>>
  where?: InputMaybe<CarePointWhere>
}

export type GoalCaredForByCarePointsAggregateArgs = {
  where?: InputMaybe<CarePointWhere>
}

export type GoalCaredForByCarePointsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalCaredForByCarePointsConnectionSort>>
  where?: InputMaybe<GoalCaredForByCarePointsConnectionWhere>
}

export type GoalCoreValuesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueSort>>
  where?: InputMaybe<CoreValueWhere>
}

export type GoalCoreValuesAggregateArgs = {
  where?: InputMaybe<CoreValueWhere>
}

export type GoalCoreValuesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalCoreValuesConnectionSort>>
  where?: InputMaybe<GoalCoreValuesConnectionWhere>
}

export type GoalCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type GoalCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type GoalCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalCreatedByConnectionSort>>
  where?: InputMaybe<GoalCreatedByConnectionWhere>
}

export type GoalEnablesCarePointsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePointSort>>
  where?: InputMaybe<CarePointWhere>
}

export type GoalEnablesCarePointsAggregateArgs = {
  where?: InputMaybe<CarePointWhere>
}

export type GoalEnablesCarePointsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalEnablesCarePointsConnectionSort>>
  where?: InputMaybe<GoalEnablesCarePointsConnectionWhere>
}

export type GoalMotivatesCommunitiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunitySort>>
  where?: InputMaybe<CommunityWhere>
}

export type GoalMotivatesCommunitiesAggregateArgs = {
  where?: InputMaybe<CommunityWhere>
}

export type GoalMotivatesCommunitiesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalMotivatesCommunitiesConnectionSort>>
  where?: InputMaybe<GoalMotivatesCommunitiesConnectionWhere>
}

export type GoalMotivatesPeopleArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type GoalMotivatesPeopleAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type GoalMotivatesPeopleConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalMotivatesPeopleConnectionSort>>
  where?: InputMaybe<GoalMotivatesPeopleConnectionWhere>
}

export type GoalResourcesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type GoalResourcesAggregateArgs = {
  where?: InputMaybe<ResourceWhere>
}

export type GoalResourcesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalResourcesConnectionSort>>
  where?: InputMaybe<GoalResourcesConnectionWhere>
}

export type GoalAggregateSelection = {
  __typename?: 'GoalAggregateSelection'
  activities: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  photo: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type GoalCarePointCaredForByCarePointsAggregationSelection = {
  __typename?: 'GoalCarePointCaredForByCarePointsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalCarePointCaredForByCarePointsNodeAggregateSelection>
}

export type GoalCarePointCaredForByCarePointsNodeAggregateSelection = {
  __typename?: 'GoalCarePointCaredForByCarePointsNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  fulfillmentDate: StringAggregateSelection
  id: IdAggregateSelection
  issuesIdentified: StringAggregateSelection
  issuesResolved: StringAggregateSelection
  levelFulfilled: StringAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type GoalCarePointEnablesCarePointsAggregationSelection = {
  __typename?: 'GoalCarePointEnablesCarePointsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalCarePointEnablesCarePointsNodeAggregateSelection>
}

export type GoalCarePointEnablesCarePointsNodeAggregateSelection = {
  __typename?: 'GoalCarePointEnablesCarePointsNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  fulfillmentDate: StringAggregateSelection
  id: IdAggregateSelection
  issuesIdentified: StringAggregateSelection
  issuesResolved: StringAggregateSelection
  levelFulfilled: StringAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type GoalCaredForByCarePointsAggregateInput = {
  AND?: InputMaybe<Array<GoalCaredForByCarePointsAggregateInput>>
  NOT?: InputMaybe<GoalCaredForByCarePointsAggregateInput>
  OR?: InputMaybe<Array<GoalCaredForByCarePointsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GoalCaredForByCarePointsNodeAggregationWhereInput>
}

export type GoalCaredForByCarePointsConnectFieldInput = {
  connect?: InputMaybe<Array<CarePointConnectInput>>
  where?: InputMaybe<CarePointConnectWhere>
}

export type GoalCaredForByCarePointsConnection = {
  __typename?: 'GoalCaredForByCarePointsConnection'
  edges: Array<GoalCaredForByCarePointsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GoalCaredForByCarePointsConnectionSort = {
  node?: InputMaybe<CarePointSort>
}

export type GoalCaredForByCarePointsConnectionWhere = {
  AND?: InputMaybe<Array<GoalCaredForByCarePointsConnectionWhere>>
  NOT?: InputMaybe<GoalCaredForByCarePointsConnectionWhere>
  OR?: InputMaybe<Array<GoalCaredForByCarePointsConnectionWhere>>
  node?: InputMaybe<CarePointWhere>
}

export type GoalCaredForByCarePointsCreateFieldInput = {
  node: CarePointCreateInput
}

export type GoalCaredForByCarePointsDeleteFieldInput = {
  delete?: InputMaybe<CarePointDeleteInput>
  where?: InputMaybe<GoalCaredForByCarePointsConnectionWhere>
}

export type GoalCaredForByCarePointsDisconnectFieldInput = {
  disconnect?: InputMaybe<CarePointDisconnectInput>
  where?: InputMaybe<GoalCaredForByCarePointsConnectionWhere>
}

export type GoalCaredForByCarePointsFieldInput = {
  connect?: InputMaybe<Array<GoalCaredForByCarePointsConnectFieldInput>>
  create?: InputMaybe<Array<GoalCaredForByCarePointsCreateFieldInput>>
}

export type GoalCaredForByCarePointsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GoalCaredForByCarePointsNodeAggregationWhereInput>>
  NOT?: InputMaybe<GoalCaredForByCarePointsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GoalCaredForByCarePointsNodeAggregationWhereInput>>
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
  fulfillmentDate_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  issuesIdentified_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type GoalCaredForByCarePointsRelationship = {
  __typename?: 'GoalCaredForByCarePointsRelationship'
  cursor: Scalars['String']['output']
  node: CarePoint
}

export type GoalCaredForByCarePointsUpdateConnectionInput = {
  node?: InputMaybe<CarePointUpdateInput>
}

export type GoalCaredForByCarePointsUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalCaredForByCarePointsConnectFieldInput>>
  create?: InputMaybe<Array<GoalCaredForByCarePointsCreateFieldInput>>
  delete?: InputMaybe<Array<GoalCaredForByCarePointsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<GoalCaredForByCarePointsDisconnectFieldInput>>
  update?: InputMaybe<GoalCaredForByCarePointsUpdateConnectionInput>
  where?: InputMaybe<GoalCaredForByCarePointsConnectionWhere>
}

export type GoalCommunityMotivatesCommunitiesAggregationSelection = {
  __typename?: 'GoalCommunityMotivatesCommunitiesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalCommunityMotivatesCommunitiesNodeAggregateSelection>
}

export type GoalCommunityMotivatesCommunitiesNodeAggregateSelection = {
  __typename?: 'GoalCommunityMotivatesCommunitiesNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  resultsAchieved: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type GoalConnectInput = {
  caredForByCarePoints?: InputMaybe<
    Array<GoalCaredForByCarePointsConnectFieldInput>
  >
  coreValues?: InputMaybe<Array<GoalCoreValuesConnectFieldInput>>
  createdBy?: InputMaybe<Array<GoalCreatedByConnectFieldInput>>
  enablesCarePoints?: InputMaybe<Array<GoalEnablesCarePointsConnectFieldInput>>
  motivatesCommunities?: InputMaybe<
    Array<GoalMotivatesCommunitiesConnectFieldInput>
  >
  motivatesPeople?: InputMaybe<Array<GoalMotivatesPeopleConnectFieldInput>>
  resources?: InputMaybe<Array<GoalResourcesConnectFieldInput>>
}

export type GoalConnectWhere = {
  node: GoalWhere
}

export type GoalCoreValueCoreValuesAggregationSelection = {
  __typename?: 'GoalCoreValueCoreValuesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalCoreValueCoreValuesNodeAggregateSelection>
}

export type GoalCoreValueCoreValuesNodeAggregateSelection = {
  __typename?: 'GoalCoreValueCoreValuesNodeAggregateSelection'
  alignmentChallenges: StringAggregateSelection
  alignmentExamples: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  name: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type GoalCoreValuesAggregateInput = {
  AND?: InputMaybe<Array<GoalCoreValuesAggregateInput>>
  NOT?: InputMaybe<GoalCoreValuesAggregateInput>
  OR?: InputMaybe<Array<GoalCoreValuesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GoalCoreValuesNodeAggregationWhereInput>
}

export type GoalCoreValuesConnectFieldInput = {
  connect?: InputMaybe<Array<CoreValueConnectInput>>
  where?: InputMaybe<CoreValueConnectWhere>
}

export type GoalCoreValuesConnection = {
  __typename?: 'GoalCoreValuesConnection'
  edges: Array<GoalCoreValuesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GoalCoreValuesConnectionSort = {
  node?: InputMaybe<CoreValueSort>
}

export type GoalCoreValuesConnectionWhere = {
  AND?: InputMaybe<Array<GoalCoreValuesConnectionWhere>>
  NOT?: InputMaybe<GoalCoreValuesConnectionWhere>
  OR?: InputMaybe<Array<GoalCoreValuesConnectionWhere>>
  node?: InputMaybe<CoreValueWhere>
}

export type GoalCoreValuesCreateFieldInput = {
  node: CoreValueCreateInput
}

export type GoalCoreValuesDeleteFieldInput = {
  delete?: InputMaybe<CoreValueDeleteInput>
  where?: InputMaybe<GoalCoreValuesConnectionWhere>
}

export type GoalCoreValuesDisconnectFieldInput = {
  disconnect?: InputMaybe<CoreValueDisconnectInput>
  where?: InputMaybe<GoalCoreValuesConnectionWhere>
}

export type GoalCoreValuesFieldInput = {
  connect?: InputMaybe<Array<GoalCoreValuesConnectFieldInput>>
  create?: InputMaybe<Array<GoalCoreValuesCreateFieldInput>>
}

export type GoalCoreValuesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GoalCoreValuesNodeAggregationWhereInput>>
  NOT?: InputMaybe<GoalCoreValuesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GoalCoreValuesNodeAggregationWhereInput>>
  alignmentChallenges_AVERAGE_LENGTH_EQUAL?: InputMaybe<
    Scalars['Float']['input']
  >
  alignmentChallenges_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_EQUAL?: InputMaybe<
    Scalars['Int']['input']
  >
  alignmentChallenges_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type GoalCoreValuesRelationship = {
  __typename?: 'GoalCoreValuesRelationship'
  cursor: Scalars['String']['output']
  node: CoreValue
}

export type GoalCoreValuesUpdateConnectionInput = {
  node?: InputMaybe<CoreValueUpdateInput>
}

export type GoalCoreValuesUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalCoreValuesConnectFieldInput>>
  create?: InputMaybe<Array<GoalCoreValuesCreateFieldInput>>
  delete?: InputMaybe<Array<GoalCoreValuesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<GoalCoreValuesDisconnectFieldInput>>
  update?: InputMaybe<GoalCoreValuesUpdateConnectionInput>
  where?: InputMaybe<GoalCoreValuesConnectionWhere>
}

export type GoalCreateInput = {
  activities?: InputMaybe<Scalars['String']['input']>
  caredForByCarePoints?: InputMaybe<GoalCaredForByCarePointsFieldInput>
  coreValues?: InputMaybe<GoalCoreValuesFieldInput>
  createdBy?: InputMaybe<GoalCreatedByFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  enablesCarePoints?: InputMaybe<GoalEnablesCarePointsFieldInput>
  location?: InputMaybe<Scalars['String']['input']>
  motivatesCommunities?: InputMaybe<GoalMotivatesCommunitiesFieldInput>
  motivatesPeople?: InputMaybe<GoalMotivatesPeopleFieldInput>
  name: Scalars['String']['input']
  photo?: InputMaybe<Scalars['String']['input']>
  resources?: InputMaybe<GoalResourcesFieldInput>
  status: Scalars['String']['input']
  successMeasures?: InputMaybe<Scalars['String']['input']>
  time?: InputMaybe<Scalars['String']['input']>
  why?: InputMaybe<Scalars['String']['input']>
}

export type GoalCreatedByAggregateInput = {
  AND?: InputMaybe<Array<GoalCreatedByAggregateInput>>
  NOT?: InputMaybe<GoalCreatedByAggregateInput>
  OR?: InputMaybe<Array<GoalCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GoalCreatedByNodeAggregationWhereInput>
}

export type GoalCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type GoalCreatedByConnection = {
  __typename?: 'GoalCreatedByConnection'
  edges: Array<GoalCreatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GoalCreatedByConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type GoalCreatedByConnectionWhere = {
  AND?: InputMaybe<Array<GoalCreatedByConnectionWhere>>
  NOT?: InputMaybe<GoalCreatedByConnectionWhere>
  OR?: InputMaybe<Array<GoalCreatedByConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type GoalCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type GoalCreatedByDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<GoalCreatedByConnectionWhere>
}

export type GoalCreatedByDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<GoalCreatedByConnectionWhere>
}

export type GoalCreatedByFieldInput = {
  connect?: InputMaybe<Array<GoalCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<GoalCreatedByCreateFieldInput>>
}

export type GoalCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GoalCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<GoalCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GoalCreatedByNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type GoalCreatedByRelationship = {
  __typename?: 'GoalCreatedByRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type GoalCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type GoalCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<GoalCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<GoalCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<GoalCreatedByDisconnectFieldInput>>
  update?: InputMaybe<GoalCreatedByUpdateConnectionInput>
  where?: InputMaybe<GoalCreatedByConnectionWhere>
}

export type GoalDeleteInput = {
  caredForByCarePoints?: InputMaybe<
    Array<GoalCaredForByCarePointsDeleteFieldInput>
  >
  coreValues?: InputMaybe<Array<GoalCoreValuesDeleteFieldInput>>
  createdBy?: InputMaybe<Array<GoalCreatedByDeleteFieldInput>>
  enablesCarePoints?: InputMaybe<Array<GoalEnablesCarePointsDeleteFieldInput>>
  motivatesCommunities?: InputMaybe<
    Array<GoalMotivatesCommunitiesDeleteFieldInput>
  >
  motivatesPeople?: InputMaybe<Array<GoalMotivatesPeopleDeleteFieldInput>>
  resources?: InputMaybe<Array<GoalResourcesDeleteFieldInput>>
}

export type GoalDisconnectInput = {
  caredForByCarePoints?: InputMaybe<
    Array<GoalCaredForByCarePointsDisconnectFieldInput>
  >
  coreValues?: InputMaybe<Array<GoalCoreValuesDisconnectFieldInput>>
  createdBy?: InputMaybe<Array<GoalCreatedByDisconnectFieldInput>>
  enablesCarePoints?: InputMaybe<
    Array<GoalEnablesCarePointsDisconnectFieldInput>
  >
  motivatesCommunities?: InputMaybe<
    Array<GoalMotivatesCommunitiesDisconnectFieldInput>
  >
  motivatesPeople?: InputMaybe<Array<GoalMotivatesPeopleDisconnectFieldInput>>
  resources?: InputMaybe<Array<GoalResourcesDisconnectFieldInput>>
}

export type GoalEdge = {
  __typename?: 'GoalEdge'
  cursor: Scalars['String']['output']
  node: Goal
}

export type GoalEnablesCarePointsAggregateInput = {
  AND?: InputMaybe<Array<GoalEnablesCarePointsAggregateInput>>
  NOT?: InputMaybe<GoalEnablesCarePointsAggregateInput>
  OR?: InputMaybe<Array<GoalEnablesCarePointsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GoalEnablesCarePointsNodeAggregationWhereInput>
}

export type GoalEnablesCarePointsConnectFieldInput = {
  connect?: InputMaybe<Array<CarePointConnectInput>>
  where?: InputMaybe<CarePointConnectWhere>
}

export type GoalEnablesCarePointsConnection = {
  __typename?: 'GoalEnablesCarePointsConnection'
  edges: Array<GoalEnablesCarePointsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GoalEnablesCarePointsConnectionSort = {
  node?: InputMaybe<CarePointSort>
}

export type GoalEnablesCarePointsConnectionWhere = {
  AND?: InputMaybe<Array<GoalEnablesCarePointsConnectionWhere>>
  NOT?: InputMaybe<GoalEnablesCarePointsConnectionWhere>
  OR?: InputMaybe<Array<GoalEnablesCarePointsConnectionWhere>>
  node?: InputMaybe<CarePointWhere>
}

export type GoalEnablesCarePointsCreateFieldInput = {
  node: CarePointCreateInput
}

export type GoalEnablesCarePointsDeleteFieldInput = {
  delete?: InputMaybe<CarePointDeleteInput>
  where?: InputMaybe<GoalEnablesCarePointsConnectionWhere>
}

export type GoalEnablesCarePointsDisconnectFieldInput = {
  disconnect?: InputMaybe<CarePointDisconnectInput>
  where?: InputMaybe<GoalEnablesCarePointsConnectionWhere>
}

export type GoalEnablesCarePointsFieldInput = {
  connect?: InputMaybe<Array<GoalEnablesCarePointsConnectFieldInput>>
  create?: InputMaybe<Array<GoalEnablesCarePointsCreateFieldInput>>
}

export type GoalEnablesCarePointsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GoalEnablesCarePointsNodeAggregationWhereInput>>
  NOT?: InputMaybe<GoalEnablesCarePointsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GoalEnablesCarePointsNodeAggregationWhereInput>>
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
  fulfillmentDate_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  issuesIdentified_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type GoalEnablesCarePointsRelationship = {
  __typename?: 'GoalEnablesCarePointsRelationship'
  cursor: Scalars['String']['output']
  node: CarePoint
}

export type GoalEnablesCarePointsUpdateConnectionInput = {
  node?: InputMaybe<CarePointUpdateInput>
}

export type GoalEnablesCarePointsUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalEnablesCarePointsConnectFieldInput>>
  create?: InputMaybe<Array<GoalEnablesCarePointsCreateFieldInput>>
  delete?: InputMaybe<Array<GoalEnablesCarePointsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<GoalEnablesCarePointsDisconnectFieldInput>>
  update?: InputMaybe<GoalEnablesCarePointsUpdateConnectionInput>
  where?: InputMaybe<GoalEnablesCarePointsConnectionWhere>
}

export type GoalMotivatesCommunitiesAggregateInput = {
  AND?: InputMaybe<Array<GoalMotivatesCommunitiesAggregateInput>>
  NOT?: InputMaybe<GoalMotivatesCommunitiesAggregateInput>
  OR?: InputMaybe<Array<GoalMotivatesCommunitiesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GoalMotivatesCommunitiesNodeAggregationWhereInput>
}

export type GoalMotivatesCommunitiesConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type GoalMotivatesCommunitiesConnection = {
  __typename?: 'GoalMotivatesCommunitiesConnection'
  edges: Array<GoalMotivatesCommunitiesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GoalMotivatesCommunitiesConnectionSort = {
  node?: InputMaybe<CommunitySort>
}

export type GoalMotivatesCommunitiesConnectionWhere = {
  AND?: InputMaybe<Array<GoalMotivatesCommunitiesConnectionWhere>>
  NOT?: InputMaybe<GoalMotivatesCommunitiesConnectionWhere>
  OR?: InputMaybe<Array<GoalMotivatesCommunitiesConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type GoalMotivatesCommunitiesCreateFieldInput = {
  node: CommunityCreateInput
}

export type GoalMotivatesCommunitiesDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<GoalMotivatesCommunitiesConnectionWhere>
}

export type GoalMotivatesCommunitiesDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<GoalMotivatesCommunitiesConnectionWhere>
}

export type GoalMotivatesCommunitiesFieldInput = {
  connect?: InputMaybe<Array<GoalMotivatesCommunitiesConnectFieldInput>>
  create?: InputMaybe<Array<GoalMotivatesCommunitiesCreateFieldInput>>
}

export type GoalMotivatesCommunitiesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GoalMotivatesCommunitiesNodeAggregationWhereInput>>
  NOT?: InputMaybe<GoalMotivatesCommunitiesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GoalMotivatesCommunitiesNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  resultsAchieved_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type GoalMotivatesCommunitiesRelationship = {
  __typename?: 'GoalMotivatesCommunitiesRelationship'
  cursor: Scalars['String']['output']
  node: Community
}

export type GoalMotivatesCommunitiesUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
}

export type GoalMotivatesCommunitiesUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalMotivatesCommunitiesConnectFieldInput>>
  create?: InputMaybe<Array<GoalMotivatesCommunitiesCreateFieldInput>>
  delete?: InputMaybe<Array<GoalMotivatesCommunitiesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<GoalMotivatesCommunitiesDisconnectFieldInput>>
  update?: InputMaybe<GoalMotivatesCommunitiesUpdateConnectionInput>
  where?: InputMaybe<GoalMotivatesCommunitiesConnectionWhere>
}

export type GoalMotivatesPeopleAggregateInput = {
  AND?: InputMaybe<Array<GoalMotivatesPeopleAggregateInput>>
  NOT?: InputMaybe<GoalMotivatesPeopleAggregateInput>
  OR?: InputMaybe<Array<GoalMotivatesPeopleAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GoalMotivatesPeopleNodeAggregationWhereInput>
}

export type GoalMotivatesPeopleConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type GoalMotivatesPeopleConnection = {
  __typename?: 'GoalMotivatesPeopleConnection'
  edges: Array<GoalMotivatesPeopleRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GoalMotivatesPeopleConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type GoalMotivatesPeopleConnectionWhere = {
  AND?: InputMaybe<Array<GoalMotivatesPeopleConnectionWhere>>
  NOT?: InputMaybe<GoalMotivatesPeopleConnectionWhere>
  OR?: InputMaybe<Array<GoalMotivatesPeopleConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type GoalMotivatesPeopleCreateFieldInput = {
  node: PersonCreateInput
}

export type GoalMotivatesPeopleDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<GoalMotivatesPeopleConnectionWhere>
}

export type GoalMotivatesPeopleDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<GoalMotivatesPeopleConnectionWhere>
}

export type GoalMotivatesPeopleFieldInput = {
  connect?: InputMaybe<Array<GoalMotivatesPeopleConnectFieldInput>>
  create?: InputMaybe<Array<GoalMotivatesPeopleCreateFieldInput>>
}

export type GoalMotivatesPeopleNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GoalMotivatesPeopleNodeAggregationWhereInput>>
  NOT?: InputMaybe<GoalMotivatesPeopleNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GoalMotivatesPeopleNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type GoalMotivatesPeopleRelationship = {
  __typename?: 'GoalMotivatesPeopleRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type GoalMotivatesPeopleUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type GoalMotivatesPeopleUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalMotivatesPeopleConnectFieldInput>>
  create?: InputMaybe<Array<GoalMotivatesPeopleCreateFieldInput>>
  delete?: InputMaybe<Array<GoalMotivatesPeopleDeleteFieldInput>>
  disconnect?: InputMaybe<Array<GoalMotivatesPeopleDisconnectFieldInput>>
  update?: InputMaybe<GoalMotivatesPeopleUpdateConnectionInput>
  where?: InputMaybe<GoalMotivatesPeopleConnectionWhere>
}

export type GoalPersonCreatedByAggregationSelection = {
  __typename?: 'GoalPersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalPersonCreatedByNodeAggregateSelection>
}

export type GoalPersonCreatedByNodeAggregateSelection = {
  __typename?: 'GoalPersonCreatedByNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type GoalPersonMotivatesPeopleAggregationSelection = {
  __typename?: 'GoalPersonMotivatesPeopleAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalPersonMotivatesPeopleNodeAggregateSelection>
}

export type GoalPersonMotivatesPeopleNodeAggregateSelection = {
  __typename?: 'GoalPersonMotivatesPeopleNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type GoalResourceResourcesAggregationSelection = {
  __typename?: 'GoalResourceResourcesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalResourceResourcesNodeAggregateSelection>
}

export type GoalResourceResourcesNodeAggregateSelection = {
  __typename?: 'GoalResourceResourcesNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type GoalResourcesAggregateInput = {
  AND?: InputMaybe<Array<GoalResourcesAggregateInput>>
  NOT?: InputMaybe<GoalResourcesAggregateInput>
  OR?: InputMaybe<Array<GoalResourcesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GoalResourcesNodeAggregationWhereInput>
}

export type GoalResourcesConnectFieldInput = {
  connect?: InputMaybe<Array<ResourceConnectInput>>
  where?: InputMaybe<ResourceConnectWhere>
}

export type GoalResourcesConnection = {
  __typename?: 'GoalResourcesConnection'
  edges: Array<GoalResourcesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GoalResourcesConnectionSort = {
  node?: InputMaybe<ResourceSort>
}

export type GoalResourcesConnectionWhere = {
  AND?: InputMaybe<Array<GoalResourcesConnectionWhere>>
  NOT?: InputMaybe<GoalResourcesConnectionWhere>
  OR?: InputMaybe<Array<GoalResourcesConnectionWhere>>
  node?: InputMaybe<ResourceWhere>
}

export type GoalResourcesCreateFieldInput = {
  node: ResourceCreateInput
}

export type GoalResourcesDeleteFieldInput = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<GoalResourcesConnectionWhere>
}

export type GoalResourcesDisconnectFieldInput = {
  disconnect?: InputMaybe<ResourceDisconnectInput>
  where?: InputMaybe<GoalResourcesConnectionWhere>
}

export type GoalResourcesFieldInput = {
  connect?: InputMaybe<Array<GoalResourcesConnectFieldInput>>
  create?: InputMaybe<Array<GoalResourcesCreateFieldInput>>
}

export type GoalResourcesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GoalResourcesNodeAggregationWhereInput>>
  NOT?: InputMaybe<GoalResourcesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GoalResourcesNodeAggregationWhereInput>>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type GoalResourcesRelationship = {
  __typename?: 'GoalResourcesRelationship'
  cursor: Scalars['String']['output']
  node: Resource
}

export type GoalResourcesUpdateConnectionInput = {
  node?: InputMaybe<ResourceUpdateInput>
}

export type GoalResourcesUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalResourcesConnectFieldInput>>
  create?: InputMaybe<Array<GoalResourcesCreateFieldInput>>
  delete?: InputMaybe<Array<GoalResourcesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<GoalResourcesDisconnectFieldInput>>
  update?: InputMaybe<GoalResourcesUpdateConnectionInput>
  where?: InputMaybe<GoalResourcesConnectionWhere>
}

/** Fields to sort Goals by. The order in which sorts are applied is not guaranteed when specifying many fields in one GoalSort object. */
export type GoalSort = {
  activities?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  description?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  photo?: InputMaybe<SortDirection>
  status?: InputMaybe<SortDirection>
  successMeasures?: InputMaybe<SortDirection>
  time?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
  why?: InputMaybe<SortDirection>
}

export type GoalUpdateInput = {
  activities_SET?: InputMaybe<Scalars['String']['input']>
  caredForByCarePoints?: InputMaybe<
    Array<GoalCaredForByCarePointsUpdateFieldInput>
  >
  coreValues?: InputMaybe<Array<GoalCoreValuesUpdateFieldInput>>
  createdBy?: InputMaybe<Array<GoalCreatedByUpdateFieldInput>>
  description_SET?: InputMaybe<Scalars['String']['input']>
  enablesCarePoints?: InputMaybe<Array<GoalEnablesCarePointsUpdateFieldInput>>
  location_SET?: InputMaybe<Scalars['String']['input']>
  motivatesCommunities?: InputMaybe<
    Array<GoalMotivatesCommunitiesUpdateFieldInput>
  >
  motivatesPeople?: InputMaybe<Array<GoalMotivatesPeopleUpdateFieldInput>>
  name_SET?: InputMaybe<Scalars['String']['input']>
  photo_SET?: InputMaybe<Scalars['String']['input']>
  resources?: InputMaybe<Array<GoalResourcesUpdateFieldInput>>
  status_SET?: InputMaybe<Scalars['String']['input']>
  successMeasures_SET?: InputMaybe<Scalars['String']['input']>
  time_SET?: InputMaybe<Scalars['String']['input']>
  why_SET?: InputMaybe<Scalars['String']['input']>
}

export type GoalWhere = {
  AND?: InputMaybe<Array<GoalWhere>>
  NOT?: InputMaybe<GoalWhere>
  OR?: InputMaybe<Array<GoalWhere>>
  activities_CONTAINS?: InputMaybe<Scalars['String']['input']>
  activities_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  activities_EQ?: InputMaybe<Scalars['String']['input']>
  activities_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  activities_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  caredForByCarePointsAggregate?: InputMaybe<GoalCaredForByCarePointsAggregateInput>
  /** Return Goals where all of the related GoalCaredForByCarePointsConnections match this filter */
  caredForByCarePointsConnection_ALL?: InputMaybe<GoalCaredForByCarePointsConnectionWhere>
  /** Return Goals where none of the related GoalCaredForByCarePointsConnections match this filter */
  caredForByCarePointsConnection_NONE?: InputMaybe<GoalCaredForByCarePointsConnectionWhere>
  /** Return Goals where one of the related GoalCaredForByCarePointsConnections match this filter */
  caredForByCarePointsConnection_SINGLE?: InputMaybe<GoalCaredForByCarePointsConnectionWhere>
  /** Return Goals where some of the related GoalCaredForByCarePointsConnections match this filter */
  caredForByCarePointsConnection_SOME?: InputMaybe<GoalCaredForByCarePointsConnectionWhere>
  /** Return Goals where all of the related CarePoints match this filter */
  caredForByCarePoints_ALL?: InputMaybe<CarePointWhere>
  /** Return Goals where none of the related CarePoints match this filter */
  caredForByCarePoints_NONE?: InputMaybe<CarePointWhere>
  /** Return Goals where one of the related CarePoints match this filter */
  caredForByCarePoints_SINGLE?: InputMaybe<CarePointWhere>
  /** Return Goals where some of the related CarePoints match this filter */
  caredForByCarePoints_SOME?: InputMaybe<CarePointWhere>
  coreValuesAggregate?: InputMaybe<GoalCoreValuesAggregateInput>
  /** Return Goals where all of the related GoalCoreValuesConnections match this filter */
  coreValuesConnection_ALL?: InputMaybe<GoalCoreValuesConnectionWhere>
  /** Return Goals where none of the related GoalCoreValuesConnections match this filter */
  coreValuesConnection_NONE?: InputMaybe<GoalCoreValuesConnectionWhere>
  /** Return Goals where one of the related GoalCoreValuesConnections match this filter */
  coreValuesConnection_SINGLE?: InputMaybe<GoalCoreValuesConnectionWhere>
  /** Return Goals where some of the related GoalCoreValuesConnections match this filter */
  coreValuesConnection_SOME?: InputMaybe<GoalCoreValuesConnectionWhere>
  /** Return Goals where all of the related CoreValues match this filter */
  coreValues_ALL?: InputMaybe<CoreValueWhere>
  /** Return Goals where none of the related CoreValues match this filter */
  coreValues_NONE?: InputMaybe<CoreValueWhere>
  /** Return Goals where one of the related CoreValues match this filter */
  coreValues_SINGLE?: InputMaybe<CoreValueWhere>
  /** Return Goals where some of the related CoreValues match this filter */
  coreValues_SOME?: InputMaybe<CoreValueWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdByAggregate?: InputMaybe<GoalCreatedByAggregateInput>
  /** Return Goals where all of the related GoalCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<GoalCreatedByConnectionWhere>
  /** Return Goals where none of the related GoalCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<GoalCreatedByConnectionWhere>
  /** Return Goals where one of the related GoalCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<GoalCreatedByConnectionWhere>
  /** Return Goals where some of the related GoalCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<GoalCreatedByConnectionWhere>
  /** Return Goals where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return Goals where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return Goals where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return Goals where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
  description_CONTAINS?: InputMaybe<Scalars['String']['input']>
  description_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  description_EQ?: InputMaybe<Scalars['String']['input']>
  description_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  description_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  enablesCarePointsAggregate?: InputMaybe<GoalEnablesCarePointsAggregateInput>
  /** Return Goals where all of the related GoalEnablesCarePointsConnections match this filter */
  enablesCarePointsConnection_ALL?: InputMaybe<GoalEnablesCarePointsConnectionWhere>
  /** Return Goals where none of the related GoalEnablesCarePointsConnections match this filter */
  enablesCarePointsConnection_NONE?: InputMaybe<GoalEnablesCarePointsConnectionWhere>
  /** Return Goals where one of the related GoalEnablesCarePointsConnections match this filter */
  enablesCarePointsConnection_SINGLE?: InputMaybe<GoalEnablesCarePointsConnectionWhere>
  /** Return Goals where some of the related GoalEnablesCarePointsConnections match this filter */
  enablesCarePointsConnection_SOME?: InputMaybe<GoalEnablesCarePointsConnectionWhere>
  /** Return Goals where all of the related CarePoints match this filter */
  enablesCarePoints_ALL?: InputMaybe<CarePointWhere>
  /** Return Goals where none of the related CarePoints match this filter */
  enablesCarePoints_NONE?: InputMaybe<CarePointWhere>
  /** Return Goals where one of the related CarePoints match this filter */
  enablesCarePoints_SINGLE?: InputMaybe<CarePointWhere>
  /** Return Goals where some of the related CarePoints match this filter */
  enablesCarePoints_SOME?: InputMaybe<CarePointWhere>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  location_CONTAINS?: InputMaybe<Scalars['String']['input']>
  location_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  location_EQ?: InputMaybe<Scalars['String']['input']>
  location_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  location_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  motivatesCommunitiesAggregate?: InputMaybe<GoalMotivatesCommunitiesAggregateInput>
  /** Return Goals where all of the related GoalMotivatesCommunitiesConnections match this filter */
  motivatesCommunitiesConnection_ALL?: InputMaybe<GoalMotivatesCommunitiesConnectionWhere>
  /** Return Goals where none of the related GoalMotivatesCommunitiesConnections match this filter */
  motivatesCommunitiesConnection_NONE?: InputMaybe<GoalMotivatesCommunitiesConnectionWhere>
  /** Return Goals where one of the related GoalMotivatesCommunitiesConnections match this filter */
  motivatesCommunitiesConnection_SINGLE?: InputMaybe<GoalMotivatesCommunitiesConnectionWhere>
  /** Return Goals where some of the related GoalMotivatesCommunitiesConnections match this filter */
  motivatesCommunitiesConnection_SOME?: InputMaybe<GoalMotivatesCommunitiesConnectionWhere>
  /** Return Goals where all of the related Communities match this filter */
  motivatesCommunities_ALL?: InputMaybe<CommunityWhere>
  /** Return Goals where none of the related Communities match this filter */
  motivatesCommunities_NONE?: InputMaybe<CommunityWhere>
  /** Return Goals where one of the related Communities match this filter */
  motivatesCommunities_SINGLE?: InputMaybe<CommunityWhere>
  /** Return Goals where some of the related Communities match this filter */
  motivatesCommunities_SOME?: InputMaybe<CommunityWhere>
  motivatesPeopleAggregate?: InputMaybe<GoalMotivatesPeopleAggregateInput>
  /** Return Goals where all of the related GoalMotivatesPeopleConnections match this filter */
  motivatesPeopleConnection_ALL?: InputMaybe<GoalMotivatesPeopleConnectionWhere>
  /** Return Goals where none of the related GoalMotivatesPeopleConnections match this filter */
  motivatesPeopleConnection_NONE?: InputMaybe<GoalMotivatesPeopleConnectionWhere>
  /** Return Goals where one of the related GoalMotivatesPeopleConnections match this filter */
  motivatesPeopleConnection_SINGLE?: InputMaybe<GoalMotivatesPeopleConnectionWhere>
  /** Return Goals where some of the related GoalMotivatesPeopleConnections match this filter */
  motivatesPeopleConnection_SOME?: InputMaybe<GoalMotivatesPeopleConnectionWhere>
  /** Return Goals where all of the related People match this filter */
  motivatesPeople_ALL?: InputMaybe<PersonWhere>
  /** Return Goals where none of the related People match this filter */
  motivatesPeople_NONE?: InputMaybe<PersonWhere>
  /** Return Goals where one of the related People match this filter */
  motivatesPeople_SINGLE?: InputMaybe<PersonWhere>
  /** Return Goals where some of the related People match this filter */
  motivatesPeople_SOME?: InputMaybe<PersonWhere>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  photo_CONTAINS?: InputMaybe<Scalars['String']['input']>
  photo_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  photo_EQ?: InputMaybe<Scalars['String']['input']>
  photo_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  photo_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  resourcesAggregate?: InputMaybe<GoalResourcesAggregateInput>
  /** Return Goals where all of the related GoalResourcesConnections match this filter */
  resourcesConnection_ALL?: InputMaybe<GoalResourcesConnectionWhere>
  /** Return Goals where none of the related GoalResourcesConnections match this filter */
  resourcesConnection_NONE?: InputMaybe<GoalResourcesConnectionWhere>
  /** Return Goals where one of the related GoalResourcesConnections match this filter */
  resourcesConnection_SINGLE?: InputMaybe<GoalResourcesConnectionWhere>
  /** Return Goals where some of the related GoalResourcesConnections match this filter */
  resourcesConnection_SOME?: InputMaybe<GoalResourcesConnectionWhere>
  /** Return Goals where all of the related Resources match this filter */
  resources_ALL?: InputMaybe<ResourceWhere>
  /** Return Goals where none of the related Resources match this filter */
  resources_NONE?: InputMaybe<ResourceWhere>
  /** Return Goals where one of the related Resources match this filter */
  resources_SINGLE?: InputMaybe<ResourceWhere>
  /** Return Goals where some of the related Resources match this filter */
  resources_SOME?: InputMaybe<ResourceWhere>
  status_CONTAINS?: InputMaybe<Scalars['String']['input']>
  status_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  status_EQ?: InputMaybe<Scalars['String']['input']>
  status_IN?: InputMaybe<Array<Scalars['String']['input']>>
  status_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  successMeasures_CONTAINS?: InputMaybe<Scalars['String']['input']>
  successMeasures_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  successMeasures_EQ?: InputMaybe<Scalars['String']['input']>
  successMeasures_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  successMeasures_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  time_CONTAINS?: InputMaybe<Scalars['String']['input']>
  time_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  time_EQ?: InputMaybe<Scalars['String']['input']>
  time_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  time_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_CONTAINS?: InputMaybe<Scalars['String']['input']>
  why_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  why_EQ?: InputMaybe<Scalars['String']['input']>
  why_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  why_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type GoalsConnection = {
  __typename?: 'GoalsConnection'
  edges: Array<GoalEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type IdAggregateSelection = {
  __typename?: 'IDAggregateSelection'
  longest?: Maybe<Scalars['ID']['output']>
  shortest?: Maybe<Scalars['ID']['output']>
}

export type Mutation = {
  __typename?: 'Mutation'
  createCarePoints: CreateCarePointsMutationResponse
  createChatbotResponses: CreateChatbotResponsesMutationResponse
  createCommunities: CreateCommunitiesMutationResponse
  createCoreValues: CreateCoreValuesMutationResponse
  createGoals: CreateGoalsMutationResponse
  createPeople: CreatePeopleMutationResponse
  createResources: CreateResourcesMutationResponse
  deleteCarePoints: DeleteInfo
  deleteChatbotResponses: DeleteInfo
  deleteCommunities: DeleteInfo
  deleteCoreValues: DeleteInfo
  deleteGoals: DeleteInfo
  deletePeople: DeleteInfo
  deleteResources: DeleteInfo
  generatePersonEmbeddings: Scalars['Boolean']['output']
  sendMessageToChatbot: ChatbotResponse
  updateCarePoints: UpdateCarePointsMutationResponse
  updateChatbotResponses: UpdateChatbotResponsesMutationResponse
  updateCommunities: UpdateCommunitiesMutationResponse
  updateCoreValues: UpdateCoreValuesMutationResponse
  updateGoals: UpdateGoalsMutationResponse
  updatePeople: UpdatePeopleMutationResponse
  updateResources: UpdateResourcesMutationResponse
}

export type MutationCreateCarePointsArgs = {
  input: Array<CarePointCreateInput>
}

export type MutationCreateChatbotResponsesArgs = {
  input: Array<ChatbotResponseCreateInput>
}

export type MutationCreateCommunitiesArgs = {
  input: Array<CommunityCreateInput>
}

export type MutationCreateCoreValuesArgs = {
  input: Array<CoreValueCreateInput>
}

export type MutationCreateGoalsArgs = {
  input: Array<GoalCreateInput>
}

export type MutationCreatePeopleArgs = {
  input: Array<PersonCreateInput>
}

export type MutationCreateResourcesArgs = {
  input: Array<ResourceCreateInput>
}

export type MutationDeleteCarePointsArgs = {
  delete?: InputMaybe<CarePointDeleteInput>
  where?: InputMaybe<CarePointWhere>
}

export type MutationDeleteChatbotResponsesArgs = {
  where?: InputMaybe<ChatbotResponseWhere>
}

export type MutationDeleteCommunitiesArgs = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<CommunityWhere>
}

export type MutationDeleteCoreValuesArgs = {
  delete?: InputMaybe<CoreValueDeleteInput>
  where?: InputMaybe<CoreValueWhere>
}

export type MutationDeleteGoalsArgs = {
  delete?: InputMaybe<GoalDeleteInput>
  where?: InputMaybe<GoalWhere>
}

export type MutationDeletePeopleArgs = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<PersonWhere>
}

export type MutationDeleteResourcesArgs = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<ResourceWhere>
}

export type MutationGeneratePersonEmbeddingsArgs = {
  personId: Scalars['ID']['input']
}

export type MutationSendMessageToChatbotArgs = {
  message: Scalars['String']['input']
  sessionId?: InputMaybe<Scalars['String']['input']>
}

export type MutationUpdateCarePointsArgs = {
  update?: InputMaybe<CarePointUpdateInput>
  where?: InputMaybe<CarePointWhere>
}

export type MutationUpdateChatbotResponsesArgs = {
  update?: InputMaybe<ChatbotResponseUpdateInput>
  where?: InputMaybe<ChatbotResponseWhere>
}

export type MutationUpdateCommunitiesArgs = {
  update?: InputMaybe<CommunityUpdateInput>
  where?: InputMaybe<CommunityWhere>
}

export type MutationUpdateCoreValuesArgs = {
  update?: InputMaybe<CoreValueUpdateInput>
  where?: InputMaybe<CoreValueWhere>
}

export type MutationUpdateGoalsArgs = {
  update?: InputMaybe<GoalUpdateInput>
  where?: InputMaybe<GoalWhere>
}

export type MutationUpdatePeopleArgs = {
  update?: InputMaybe<PersonUpdateInput>
  where?: InputMaybe<PersonWhere>
}

export type MutationUpdateResourcesArgs = {
  update?: InputMaybe<ResourceUpdateInput>
  where?: InputMaybe<ResourceWhere>
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
  edges: Array<PersonEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Person = PersonInterface & {
  __typename?: 'Person'
  authId?: Maybe<Scalars['String']['output']>
  avatar?: Maybe<Scalars['String']['output']>
  careManual?: Maybe<Scalars['String']['output']>
  carePoints: Array<CarePoint>
  communities: Array<Community>
  communitiesAggregate?: Maybe<PersonCommunityCommunitiesAggregationSelection>
  communitiesConnection: PersonCommunitiesConnection
  connectedTo: Array<Person>
  connections: Array<Person>
  connectionsAggregate?: Maybe<PersonPersonConnectionsAggregationSelection>
  connectionsConnection: PersonConnectionsConnection
  coreValues: Array<CoreValue>
  coreValuesAggregate?: Maybe<PersonCoreValueCoreValuesAggregationSelection>
  coreValuesConnection: PersonCoreValuesConnection
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  createdByAggregate?: Maybe<PersonPersonCreatedByAggregationSelection>
  createdByConnection: PersonCreatedByConnection
  email?: Maybe<Scalars['String']['output']>
  favorites?: Maybe<Scalars['String']['output']>
  fieldsOfCare?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  goals: Array<Goal>
  goalsAggregate?: Maybe<PersonGoalGoalsAggregationSelection>
  goalsConnection: PersonGoalsConnection
  id: Scalars['ID']['output']
  interests?: Maybe<Scalars['String']['output']>
  lastName: Scalars['String']['output']
  location?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  passions?: Maybe<Scalars['String']['output']>
  phone?: Maybe<Scalars['String']['output']>
  photo?: Maybe<Scalars['String']['output']>
  pronouns?: Maybe<Scalars['String']['output']>
  providesResources: Array<Resource>
  providesResourcesAggregate?: Maybe<PersonResourceProvidesResourcesAggregationSelection>
  providesResourcesConnection: PersonProvidesResourcesConnection
  status: Scalars['String']['output']
  traits?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type PersonCommunitiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunitySort>>
  where?: InputMaybe<CommunityWhere>
}

export type PersonCommunitiesAggregateArgs = {
  where?: InputMaybe<CommunityWhere>
}

export type PersonCommunitiesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonCommunitiesConnectionSort>>
  where?: InputMaybe<PersonCommunitiesConnectionWhere>
}

export type PersonConnectionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type PersonConnectionsAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type PersonConnectionsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonConnectionsConnectionSort>>
  where?: InputMaybe<PersonConnectionsConnectionWhere>
}

export type PersonCoreValuesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueSort>>
  where?: InputMaybe<CoreValueWhere>
}

export type PersonCoreValuesAggregateArgs = {
  where?: InputMaybe<CoreValueWhere>
}

export type PersonCoreValuesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonCoreValuesConnectionSort>>
  where?: InputMaybe<PersonCoreValuesConnectionWhere>
}

export type PersonCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type PersonCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type PersonCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonCreatedByConnectionSort>>
  where?: InputMaybe<PersonCreatedByConnectionWhere>
}

export type PersonGoalsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalSort>>
  where?: InputMaybe<GoalWhere>
}

export type PersonGoalsAggregateArgs = {
  where?: InputMaybe<GoalWhere>
}

export type PersonGoalsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonGoalsConnectionSort>>
  where?: InputMaybe<PersonGoalsConnectionWhere>
}

export type PersonProvidesResourcesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type PersonProvidesResourcesAggregateArgs = {
  where?: InputMaybe<ResourceWhere>
}

export type PersonProvidesResourcesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonProvidesResourcesConnectionSort>>
  where?: InputMaybe<PersonProvidesResourcesConnectionWhere>
}

export type PersonAggregateSelection = {
  __typename?: 'PersonAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type PersonCommunitiesAggregateInput = {
  AND?: InputMaybe<Array<PersonCommunitiesAggregateInput>>
  NOT?: InputMaybe<PersonCommunitiesAggregateInput>
  OR?: InputMaybe<Array<PersonCommunitiesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  edge?: InputMaybe<BelongsToAggregationWhereInput>
  node?: InputMaybe<PersonCommunitiesNodeAggregationWhereInput>
}

export type PersonCommunitiesConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  edge?: InputMaybe<BelongsToCreateInput>
  where?: InputMaybe<CommunityConnectWhere>
}

export type PersonCommunitiesConnection = {
  __typename?: 'PersonCommunitiesConnection'
  edges: Array<PersonCommunitiesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonCommunitiesConnectionSort = {
  edge?: InputMaybe<BelongsToSort>
  node?: InputMaybe<CommunitySort>
}

export type PersonCommunitiesConnectionWhere = {
  AND?: InputMaybe<Array<PersonCommunitiesConnectionWhere>>
  NOT?: InputMaybe<PersonCommunitiesConnectionWhere>
  OR?: InputMaybe<Array<PersonCommunitiesConnectionWhere>>
  edge?: InputMaybe<BelongsToWhere>
  node?: InputMaybe<CommunityWhere>
}

export type PersonCommunitiesCreateFieldInput = {
  edge?: InputMaybe<BelongsToCreateInput>
  node: CommunityCreateInput
}

export type PersonCommunitiesDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<PersonCommunitiesConnectionWhere>
}

export type PersonCommunitiesDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<PersonCommunitiesConnectionWhere>
}

export type PersonCommunitiesFieldInput = {
  connect?: InputMaybe<Array<PersonCommunitiesConnectFieldInput>>
  create?: InputMaybe<Array<PersonCommunitiesCreateFieldInput>>
}

export type PersonCommunitiesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonCommunitiesNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonCommunitiesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonCommunitiesNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  resultsAchieved_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type PersonCommunitiesRelationship = {
  __typename?: 'PersonCommunitiesRelationship'
  cursor: Scalars['String']['output']
  node: Community
  properties: BelongsTo
}

export type PersonCommunitiesUpdateConnectionInput = {
  edge?: InputMaybe<BelongsToUpdateInput>
  node?: InputMaybe<CommunityUpdateInput>
}

export type PersonCommunitiesUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonCommunitiesConnectFieldInput>>
  create?: InputMaybe<Array<PersonCommunitiesCreateFieldInput>>
  delete?: InputMaybe<Array<PersonCommunitiesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonCommunitiesDisconnectFieldInput>>
  update?: InputMaybe<PersonCommunitiesUpdateConnectionInput>
  where?: InputMaybe<PersonCommunitiesConnectionWhere>
}

export type PersonCommunityCommunitiesAggregationSelection = {
  __typename?: 'PersonCommunityCommunitiesAggregationSelection'
  count: Scalars['Int']['output']
  edge?: Maybe<PersonCommunityCommunitiesEdgeAggregateSelection>
  node?: Maybe<PersonCommunityCommunitiesNodeAggregateSelection>
}

export type PersonCommunityCommunitiesEdgeAggregateSelection = {
  __typename?: 'PersonCommunityCommunitiesEdgeAggregateSelection'
  totem: StringAggregateSelection
}

export type PersonCommunityCommunitiesNodeAggregateSelection = {
  __typename?: 'PersonCommunityCommunitiesNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  resultsAchieved: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type PersonConnectInput = {
  communities?: InputMaybe<Array<PersonCommunitiesConnectFieldInput>>
  connections?: InputMaybe<Array<PersonConnectionsConnectFieldInput>>
  coreValues?: InputMaybe<Array<PersonCoreValuesConnectFieldInput>>
  createdBy?: InputMaybe<Array<PersonCreatedByConnectFieldInput>>
  goals?: InputMaybe<Array<PersonGoalsConnectFieldInput>>
  providesResources?: InputMaybe<
    Array<PersonProvidesResourcesConnectFieldInput>
  >
}

export type PersonConnectWhere = {
  node: PersonWhere
}

export type PersonConnectionsAggregateInput = {
  AND?: InputMaybe<Array<PersonConnectionsAggregateInput>>
  NOT?: InputMaybe<PersonConnectionsAggregateInput>
  OR?: InputMaybe<Array<PersonConnectionsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<PersonConnectionsNodeAggregationWhereInput>
}

export type PersonConnectionsConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type PersonConnectionsConnection = {
  __typename?: 'PersonConnectionsConnection'
  edges: Array<PersonConnectionsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonConnectionsConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type PersonConnectionsConnectionWhere = {
  AND?: InputMaybe<Array<PersonConnectionsConnectionWhere>>
  NOT?: InputMaybe<PersonConnectionsConnectionWhere>
  OR?: InputMaybe<Array<PersonConnectionsConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type PersonConnectionsCreateFieldInput = {
  node: PersonCreateInput
}

export type PersonConnectionsDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<PersonConnectionsConnectionWhere>
}

export type PersonConnectionsDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<PersonConnectionsConnectionWhere>
}

export type PersonConnectionsFieldInput = {
  connect?: InputMaybe<Array<PersonConnectionsConnectFieldInput>>
  create?: InputMaybe<Array<PersonConnectionsCreateFieldInput>>
}

export type PersonConnectionsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonConnectionsNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonConnectionsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonConnectionsNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type PersonConnectionsRelationship = {
  __typename?: 'PersonConnectionsRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type PersonConnectionsUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type PersonConnectionsUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonConnectionsConnectFieldInput>>
  create?: InputMaybe<Array<PersonConnectionsCreateFieldInput>>
  delete?: InputMaybe<Array<PersonConnectionsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonConnectionsDisconnectFieldInput>>
  update?: InputMaybe<PersonConnectionsUpdateConnectionInput>
  where?: InputMaybe<PersonConnectionsConnectionWhere>
}

export type PersonCoreValueCoreValuesAggregationSelection = {
  __typename?: 'PersonCoreValueCoreValuesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<PersonCoreValueCoreValuesNodeAggregateSelection>
}

export type PersonCoreValueCoreValuesNodeAggregateSelection = {
  __typename?: 'PersonCoreValueCoreValuesNodeAggregateSelection'
  alignmentChallenges: StringAggregateSelection
  alignmentExamples: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  name: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type PersonCoreValuesAggregateInput = {
  AND?: InputMaybe<Array<PersonCoreValuesAggregateInput>>
  NOT?: InputMaybe<PersonCoreValuesAggregateInput>
  OR?: InputMaybe<Array<PersonCoreValuesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<PersonCoreValuesNodeAggregationWhereInput>
}

export type PersonCoreValuesConnectFieldInput = {
  connect?: InputMaybe<Array<CoreValueConnectInput>>
  where?: InputMaybe<CoreValueConnectWhere>
}

export type PersonCoreValuesConnection = {
  __typename?: 'PersonCoreValuesConnection'
  edges: Array<PersonCoreValuesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonCoreValuesConnectionSort = {
  node?: InputMaybe<CoreValueSort>
}

export type PersonCoreValuesConnectionWhere = {
  AND?: InputMaybe<Array<PersonCoreValuesConnectionWhere>>
  NOT?: InputMaybe<PersonCoreValuesConnectionWhere>
  OR?: InputMaybe<Array<PersonCoreValuesConnectionWhere>>
  node?: InputMaybe<CoreValueWhere>
}

export type PersonCoreValuesCreateFieldInput = {
  node: CoreValueCreateInput
}

export type PersonCoreValuesDeleteFieldInput = {
  delete?: InputMaybe<CoreValueDeleteInput>
  where?: InputMaybe<PersonCoreValuesConnectionWhere>
}

export type PersonCoreValuesDisconnectFieldInput = {
  disconnect?: InputMaybe<CoreValueDisconnectInput>
  where?: InputMaybe<PersonCoreValuesConnectionWhere>
}

export type PersonCoreValuesFieldInput = {
  connect?: InputMaybe<Array<PersonCoreValuesConnectFieldInput>>
  create?: InputMaybe<Array<PersonCoreValuesCreateFieldInput>>
}

export type PersonCoreValuesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonCoreValuesNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonCoreValuesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonCoreValuesNodeAggregationWhereInput>>
  alignmentChallenges_AVERAGE_LENGTH_EQUAL?: InputMaybe<
    Scalars['Float']['input']
  >
  alignmentChallenges_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  alignmentChallenges_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_EQUAL?: InputMaybe<
    Scalars['Int']['input']
  >
  alignmentChallenges_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentChallenges_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  alignmentExamples_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  alignmentExamples_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type PersonCoreValuesRelationship = {
  __typename?: 'PersonCoreValuesRelationship'
  cursor: Scalars['String']['output']
  node: CoreValue
}

export type PersonCoreValuesUpdateConnectionInput = {
  node?: InputMaybe<CoreValueUpdateInput>
}

export type PersonCoreValuesUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonCoreValuesConnectFieldInput>>
  create?: InputMaybe<Array<PersonCoreValuesCreateFieldInput>>
  delete?: InputMaybe<Array<PersonCoreValuesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonCoreValuesDisconnectFieldInput>>
  update?: InputMaybe<PersonCoreValuesUpdateConnectionInput>
  where?: InputMaybe<PersonCoreValuesConnectionWhere>
}

export type PersonCreateInput = {
  authId?: InputMaybe<Scalars['String']['input']>
  avatar?: InputMaybe<Scalars['String']['input']>
  careManual?: InputMaybe<Scalars['String']['input']>
  communities?: InputMaybe<PersonCommunitiesFieldInput>
  connections?: InputMaybe<PersonConnectionsFieldInput>
  coreValues?: InputMaybe<PersonCoreValuesFieldInput>
  createdBy?: InputMaybe<PersonCreatedByFieldInput>
  email?: InputMaybe<Scalars['String']['input']>
  favorites?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare?: InputMaybe<Scalars['String']['input']>
  firstName: Scalars['String']['input']
  goals?: InputMaybe<PersonGoalsFieldInput>
  interests?: InputMaybe<Scalars['String']['input']>
  lastName: Scalars['String']['input']
  location?: InputMaybe<Scalars['String']['input']>
  passions?: InputMaybe<Scalars['String']['input']>
  phone?: InputMaybe<Scalars['String']['input']>
  photo?: InputMaybe<Scalars['String']['input']>
  pronouns?: InputMaybe<Scalars['String']['input']>
  providesResources?: InputMaybe<PersonProvidesResourcesFieldInput>
  status: Scalars['String']['input']
  traits?: InputMaybe<Scalars['String']['input']>
}

export type PersonCreatedByAggregateInput = {
  AND?: InputMaybe<Array<PersonCreatedByAggregateInput>>
  NOT?: InputMaybe<PersonCreatedByAggregateInput>
  OR?: InputMaybe<Array<PersonCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<PersonCreatedByNodeAggregationWhereInput>
}

export type PersonCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type PersonCreatedByConnection = {
  __typename?: 'PersonCreatedByConnection'
  edges: Array<PersonCreatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonCreatedByConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type PersonCreatedByConnectionWhere = {
  AND?: InputMaybe<Array<PersonCreatedByConnectionWhere>>
  NOT?: InputMaybe<PersonCreatedByConnectionWhere>
  OR?: InputMaybe<Array<PersonCreatedByConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type PersonCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type PersonCreatedByDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<PersonCreatedByConnectionWhere>
}

export type PersonCreatedByDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<PersonCreatedByConnectionWhere>
}

export type PersonCreatedByFieldInput = {
  connect?: InputMaybe<Array<PersonCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<PersonCreatedByCreateFieldInput>>
}

export type PersonCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonCreatedByNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type PersonCreatedByRelationship = {
  __typename?: 'PersonCreatedByRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type PersonCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type PersonCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<PersonCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<PersonCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonCreatedByDisconnectFieldInput>>
  update?: InputMaybe<PersonCreatedByUpdateConnectionInput>
  where?: InputMaybe<PersonCreatedByConnectionWhere>
}

export type PersonDeleteInput = {
  communities?: InputMaybe<Array<PersonCommunitiesDeleteFieldInput>>
  connections?: InputMaybe<Array<PersonConnectionsDeleteFieldInput>>
  coreValues?: InputMaybe<Array<PersonCoreValuesDeleteFieldInput>>
  createdBy?: InputMaybe<Array<PersonCreatedByDeleteFieldInput>>
  goals?: InputMaybe<Array<PersonGoalsDeleteFieldInput>>
  providesResources?: InputMaybe<Array<PersonProvidesResourcesDeleteFieldInput>>
}

export type PersonDisconnectInput = {
  communities?: InputMaybe<Array<PersonCommunitiesDisconnectFieldInput>>
  connections?: InputMaybe<Array<PersonConnectionsDisconnectFieldInput>>
  coreValues?: InputMaybe<Array<PersonCoreValuesDisconnectFieldInput>>
  createdBy?: InputMaybe<Array<PersonCreatedByDisconnectFieldInput>>
  goals?: InputMaybe<Array<PersonGoalsDisconnectFieldInput>>
  providesResources?: InputMaybe<
    Array<PersonProvidesResourcesDisconnectFieldInput>
  >
}

export type PersonEdge = {
  __typename?: 'PersonEdge'
  cursor: Scalars['String']['output']
  node: Person
}

export type PersonGoalGoalsAggregationSelection = {
  __typename?: 'PersonGoalGoalsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<PersonGoalGoalsNodeAggregateSelection>
}

export type PersonGoalGoalsNodeAggregateSelection = {
  __typename?: 'PersonGoalGoalsNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  photo: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type PersonGoalsAggregateInput = {
  AND?: InputMaybe<Array<PersonGoalsAggregateInput>>
  NOT?: InputMaybe<PersonGoalsAggregateInput>
  OR?: InputMaybe<Array<PersonGoalsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<PersonGoalsNodeAggregationWhereInput>
}

export type PersonGoalsConnectFieldInput = {
  connect?: InputMaybe<Array<GoalConnectInput>>
  where?: InputMaybe<GoalConnectWhere>
}

export type PersonGoalsConnection = {
  __typename?: 'PersonGoalsConnection'
  edges: Array<PersonGoalsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonGoalsConnectionSort = {
  node?: InputMaybe<GoalSort>
}

export type PersonGoalsConnectionWhere = {
  AND?: InputMaybe<Array<PersonGoalsConnectionWhere>>
  NOT?: InputMaybe<PersonGoalsConnectionWhere>
  OR?: InputMaybe<Array<PersonGoalsConnectionWhere>>
  node?: InputMaybe<GoalWhere>
}

export type PersonGoalsCreateFieldInput = {
  node: GoalCreateInput
}

export type PersonGoalsDeleteFieldInput = {
  delete?: InputMaybe<GoalDeleteInput>
  where?: InputMaybe<PersonGoalsConnectionWhere>
}

export type PersonGoalsDisconnectFieldInput = {
  disconnect?: InputMaybe<GoalDisconnectInput>
  where?: InputMaybe<PersonGoalsConnectionWhere>
}

export type PersonGoalsFieldInput = {
  connect?: InputMaybe<Array<PersonGoalsConnectFieldInput>>
  create?: InputMaybe<Array<PersonGoalsCreateFieldInput>>
}

export type PersonGoalsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonGoalsNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonGoalsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonGoalsNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type PersonGoalsRelationship = {
  __typename?: 'PersonGoalsRelationship'
  cursor: Scalars['String']['output']
  node: Goal
}

export type PersonGoalsUpdateConnectionInput = {
  node?: InputMaybe<GoalUpdateInput>
}

export type PersonGoalsUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonGoalsConnectFieldInput>>
  create?: InputMaybe<Array<PersonGoalsCreateFieldInput>>
  delete?: InputMaybe<Array<PersonGoalsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonGoalsDisconnectFieldInput>>
  update?: InputMaybe<PersonGoalsUpdateConnectionInput>
  where?: InputMaybe<PersonGoalsConnectionWhere>
}

export type PersonInterface = {
  createdAt: Scalars['DateTime']['output']
  email?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  id: Scalars['ID']['output']
  lastName: Scalars['String']['output']
  location?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  phone?: Maybe<Scalars['String']['output']>
  photo?: Maybe<Scalars['String']['output']>
  pronouns?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type PersonInterfaceAggregateSelection = {
  __typename?: 'PersonInterfaceAggregateSelection'
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type PersonInterfaceEdge = {
  __typename?: 'PersonInterfaceEdge'
  cursor: Scalars['String']['output']
  node: PersonInterface
}

export enum PersonInterfaceImplementation {
  Person = 'Person',
}

/** Fields to sort PersonInterfaces by. The order in which sorts are applied is not guaranteed when specifying many fields in one PersonInterfaceSort object. */
export type PersonInterfaceSort = {
  createdAt?: InputMaybe<SortDirection>
  email?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  phone?: InputMaybe<SortDirection>
  photo?: InputMaybe<SortDirection>
  pronouns?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type PersonInterfaceWhere = {
  AND?: InputMaybe<Array<PersonInterfaceWhere>>
  NOT?: InputMaybe<PersonInterfaceWhere>
  OR?: InputMaybe<Array<PersonInterfaceWhere>>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
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
  location_CONTAINS?: InputMaybe<Scalars['String']['input']>
  location_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  location_EQ?: InputMaybe<Scalars['String']['input']>
  location_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  location_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  phone_CONTAINS?: InputMaybe<Scalars['String']['input']>
  phone_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  phone_EQ?: InputMaybe<Scalars['String']['input']>
  phone_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  phone_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  photo_CONTAINS?: InputMaybe<Scalars['String']['input']>
  photo_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  photo_EQ?: InputMaybe<Scalars['String']['input']>
  photo_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  photo_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  pronouns_CONTAINS?: InputMaybe<Scalars['String']['input']>
  pronouns_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  pronouns_EQ?: InputMaybe<Scalars['String']['input']>
  pronouns_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  pronouns_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  typename_IN?: InputMaybe<Array<PersonInterfaceImplementation>>
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type PersonInterfacesConnection = {
  __typename?: 'PersonInterfacesConnection'
  edges: Array<PersonInterfaceEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonPersonConnectionsAggregationSelection = {
  __typename?: 'PersonPersonConnectionsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<PersonPersonConnectionsNodeAggregateSelection>
}

export type PersonPersonConnectionsNodeAggregateSelection = {
  __typename?: 'PersonPersonConnectionsNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type PersonPersonCreatedByAggregationSelection = {
  __typename?: 'PersonPersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<PersonPersonCreatedByNodeAggregateSelection>
}

export type PersonPersonCreatedByNodeAggregateSelection = {
  __typename?: 'PersonPersonCreatedByNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type PersonProvidesResourcesAggregateInput = {
  AND?: InputMaybe<Array<PersonProvidesResourcesAggregateInput>>
  NOT?: InputMaybe<PersonProvidesResourcesAggregateInput>
  OR?: InputMaybe<Array<PersonProvidesResourcesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<PersonProvidesResourcesNodeAggregationWhereInput>
}

export type PersonProvidesResourcesConnectFieldInput = {
  connect?: InputMaybe<Array<ResourceConnectInput>>
  where?: InputMaybe<ResourceConnectWhere>
}

export type PersonProvidesResourcesConnection = {
  __typename?: 'PersonProvidesResourcesConnection'
  edges: Array<PersonProvidesResourcesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonProvidesResourcesConnectionSort = {
  node?: InputMaybe<ResourceSort>
}

export type PersonProvidesResourcesConnectionWhere = {
  AND?: InputMaybe<Array<PersonProvidesResourcesConnectionWhere>>
  NOT?: InputMaybe<PersonProvidesResourcesConnectionWhere>
  OR?: InputMaybe<Array<PersonProvidesResourcesConnectionWhere>>
  node?: InputMaybe<ResourceWhere>
}

export type PersonProvidesResourcesCreateFieldInput = {
  node: ResourceCreateInput
}

export type PersonProvidesResourcesDeleteFieldInput = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<PersonProvidesResourcesConnectionWhere>
}

export type PersonProvidesResourcesDisconnectFieldInput = {
  disconnect?: InputMaybe<ResourceDisconnectInput>
  where?: InputMaybe<PersonProvidesResourcesConnectionWhere>
}

export type PersonProvidesResourcesFieldInput = {
  connect?: InputMaybe<Array<PersonProvidesResourcesConnectFieldInput>>
  create?: InputMaybe<Array<PersonProvidesResourcesCreateFieldInput>>
}

export type PersonProvidesResourcesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonProvidesResourcesNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonProvidesResourcesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonProvidesResourcesNodeAggregationWhereInput>>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type PersonProvidesResourcesRelationship = {
  __typename?: 'PersonProvidesResourcesRelationship'
  cursor: Scalars['String']['output']
  node: Resource
}

export type PersonProvidesResourcesUpdateConnectionInput = {
  node?: InputMaybe<ResourceUpdateInput>
}

export type PersonProvidesResourcesUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonProvidesResourcesConnectFieldInput>>
  create?: InputMaybe<Array<PersonProvidesResourcesCreateFieldInput>>
  delete?: InputMaybe<Array<PersonProvidesResourcesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonProvidesResourcesDisconnectFieldInput>>
  update?: InputMaybe<PersonProvidesResourcesUpdateConnectionInput>
  where?: InputMaybe<PersonProvidesResourcesConnectionWhere>
}

export type PersonResourceProvidesResourcesAggregationSelection = {
  __typename?: 'PersonResourceProvidesResourcesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<PersonResourceProvidesResourcesNodeAggregateSelection>
}

export type PersonResourceProvidesResourcesNodeAggregateSelection = {
  __typename?: 'PersonResourceProvidesResourcesNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

/** Fields to sort People by. The order in which sorts are applied is not guaranteed when specifying many fields in one PersonSort object. */
export type PersonSort = {
  authId?: InputMaybe<SortDirection>
  avatar?: InputMaybe<SortDirection>
  careManual?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  email?: InputMaybe<SortDirection>
  favorites?: InputMaybe<SortDirection>
  fieldsOfCare?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  interests?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  passions?: InputMaybe<SortDirection>
  phone?: InputMaybe<SortDirection>
  photo?: InputMaybe<SortDirection>
  pronouns?: InputMaybe<SortDirection>
  status?: InputMaybe<SortDirection>
  traits?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type PersonUpdateInput = {
  authId_SET?: InputMaybe<Scalars['String']['input']>
  avatar_SET?: InputMaybe<Scalars['String']['input']>
  careManual_SET?: InputMaybe<Scalars['String']['input']>
  communities?: InputMaybe<Array<PersonCommunitiesUpdateFieldInput>>
  connections?: InputMaybe<Array<PersonConnectionsUpdateFieldInput>>
  coreValues?: InputMaybe<Array<PersonCoreValuesUpdateFieldInput>>
  createdBy?: InputMaybe<Array<PersonCreatedByUpdateFieldInput>>
  email_SET?: InputMaybe<Scalars['String']['input']>
  favorites_SET?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_SET?: InputMaybe<Scalars['String']['input']>
  firstName_SET?: InputMaybe<Scalars['String']['input']>
  goals?: InputMaybe<Array<PersonGoalsUpdateFieldInput>>
  interests_SET?: InputMaybe<Scalars['String']['input']>
  lastName_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  passions_SET?: InputMaybe<Scalars['String']['input']>
  phone_SET?: InputMaybe<Scalars['String']['input']>
  photo_SET?: InputMaybe<Scalars['String']['input']>
  pronouns_SET?: InputMaybe<Scalars['String']['input']>
  providesResources?: InputMaybe<Array<PersonProvidesResourcesUpdateFieldInput>>
  status_SET?: InputMaybe<Scalars['String']['input']>
  traits_SET?: InputMaybe<Scalars['String']['input']>
}

export type PersonWhere = {
  AND?: InputMaybe<Array<PersonWhere>>
  NOT?: InputMaybe<PersonWhere>
  OR?: InputMaybe<Array<PersonWhere>>
  authId_CONTAINS?: InputMaybe<Scalars['String']['input']>
  authId_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  authId_EQ?: InputMaybe<Scalars['String']['input']>
  authId_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  authId_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  avatar_CONTAINS?: InputMaybe<Scalars['String']['input']>
  avatar_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  avatar_EQ?: InputMaybe<Scalars['String']['input']>
  avatar_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  avatar_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  careManual_CONTAINS?: InputMaybe<Scalars['String']['input']>
  careManual_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  careManual_EQ?: InputMaybe<Scalars['String']['input']>
  careManual_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  careManual_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  carePoints?: InputMaybe<CarePointWhere>
  carePoints_ALL?: InputMaybe<CarePointWhere>
  carePoints_NONE?: InputMaybe<CarePointWhere>
  carePoints_SINGLE?: InputMaybe<CarePointWhere>
  carePoints_SOME?: InputMaybe<CarePointWhere>
  communitiesAggregate?: InputMaybe<PersonCommunitiesAggregateInput>
  /** Return People where all of the related PersonCommunitiesConnections match this filter */
  communitiesConnection_ALL?: InputMaybe<PersonCommunitiesConnectionWhere>
  /** Return People where none of the related PersonCommunitiesConnections match this filter */
  communitiesConnection_NONE?: InputMaybe<PersonCommunitiesConnectionWhere>
  /** Return People where one of the related PersonCommunitiesConnections match this filter */
  communitiesConnection_SINGLE?: InputMaybe<PersonCommunitiesConnectionWhere>
  /** Return People where some of the related PersonCommunitiesConnections match this filter */
  communitiesConnection_SOME?: InputMaybe<PersonCommunitiesConnectionWhere>
  /** Return People where all of the related Communities match this filter */
  communities_ALL?: InputMaybe<CommunityWhere>
  /** Return People where none of the related Communities match this filter */
  communities_NONE?: InputMaybe<CommunityWhere>
  /** Return People where one of the related Communities match this filter */
  communities_SINGLE?: InputMaybe<CommunityWhere>
  /** Return People where some of the related Communities match this filter */
  communities_SOME?: InputMaybe<CommunityWhere>
  connectedTo?: InputMaybe<PersonWhere>
  connectedTo_ALL?: InputMaybe<PersonWhere>
  connectedTo_NONE?: InputMaybe<PersonWhere>
  connectedTo_SINGLE?: InputMaybe<PersonWhere>
  connectedTo_SOME?: InputMaybe<PersonWhere>
  connectionsAggregate?: InputMaybe<PersonConnectionsAggregateInput>
  /** Return People where all of the related PersonConnectionsConnections match this filter */
  connectionsConnection_ALL?: InputMaybe<PersonConnectionsConnectionWhere>
  /** Return People where none of the related PersonConnectionsConnections match this filter */
  connectionsConnection_NONE?: InputMaybe<PersonConnectionsConnectionWhere>
  /** Return People where one of the related PersonConnectionsConnections match this filter */
  connectionsConnection_SINGLE?: InputMaybe<PersonConnectionsConnectionWhere>
  /** Return People where some of the related PersonConnectionsConnections match this filter */
  connectionsConnection_SOME?: InputMaybe<PersonConnectionsConnectionWhere>
  /** Return People where all of the related People match this filter */
  connections_ALL?: InputMaybe<PersonWhere>
  /** Return People where none of the related People match this filter */
  connections_NONE?: InputMaybe<PersonWhere>
  /** Return People where one of the related People match this filter */
  connections_SINGLE?: InputMaybe<PersonWhere>
  /** Return People where some of the related People match this filter */
  connections_SOME?: InputMaybe<PersonWhere>
  coreValuesAggregate?: InputMaybe<PersonCoreValuesAggregateInput>
  /** Return People where all of the related PersonCoreValuesConnections match this filter */
  coreValuesConnection_ALL?: InputMaybe<PersonCoreValuesConnectionWhere>
  /** Return People where none of the related PersonCoreValuesConnections match this filter */
  coreValuesConnection_NONE?: InputMaybe<PersonCoreValuesConnectionWhere>
  /** Return People where one of the related PersonCoreValuesConnections match this filter */
  coreValuesConnection_SINGLE?: InputMaybe<PersonCoreValuesConnectionWhere>
  /** Return People where some of the related PersonCoreValuesConnections match this filter */
  coreValuesConnection_SOME?: InputMaybe<PersonCoreValuesConnectionWhere>
  /** Return People where all of the related CoreValues match this filter */
  coreValues_ALL?: InputMaybe<CoreValueWhere>
  /** Return People where none of the related CoreValues match this filter */
  coreValues_NONE?: InputMaybe<CoreValueWhere>
  /** Return People where one of the related CoreValues match this filter */
  coreValues_SINGLE?: InputMaybe<CoreValueWhere>
  /** Return People where some of the related CoreValues match this filter */
  coreValues_SOME?: InputMaybe<CoreValueWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdByAggregate?: InputMaybe<PersonCreatedByAggregateInput>
  /** Return People where all of the related PersonCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<PersonCreatedByConnectionWhere>
  /** Return People where none of the related PersonCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<PersonCreatedByConnectionWhere>
  /** Return People where one of the related PersonCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<PersonCreatedByConnectionWhere>
  /** Return People where some of the related PersonCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<PersonCreatedByConnectionWhere>
  /** Return People where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return People where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return People where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return People where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
  email_CONTAINS?: InputMaybe<Scalars['String']['input']>
  email_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  email_EQ?: InputMaybe<Scalars['String']['input']>
  email_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  email_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  favorites_CONTAINS?: InputMaybe<Scalars['String']['input']>
  favorites_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  favorites_EQ?: InputMaybe<Scalars['String']['input']>
  favorites_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  favorites_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  goalsAggregate?: InputMaybe<PersonGoalsAggregateInput>
  /** Return People where all of the related PersonGoalsConnections match this filter */
  goalsConnection_ALL?: InputMaybe<PersonGoalsConnectionWhere>
  /** Return People where none of the related PersonGoalsConnections match this filter */
  goalsConnection_NONE?: InputMaybe<PersonGoalsConnectionWhere>
  /** Return People where one of the related PersonGoalsConnections match this filter */
  goalsConnection_SINGLE?: InputMaybe<PersonGoalsConnectionWhere>
  /** Return People where some of the related PersonGoalsConnections match this filter */
  goalsConnection_SOME?: InputMaybe<PersonGoalsConnectionWhere>
  /** Return People where all of the related Goals match this filter */
  goals_ALL?: InputMaybe<GoalWhere>
  /** Return People where none of the related Goals match this filter */
  goals_NONE?: InputMaybe<GoalWhere>
  /** Return People where one of the related Goals match this filter */
  goals_SINGLE?: InputMaybe<GoalWhere>
  /** Return People where some of the related Goals match this filter */
  goals_SOME?: InputMaybe<GoalWhere>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  interests_CONTAINS?: InputMaybe<Scalars['String']['input']>
  interests_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  interests_EQ?: InputMaybe<Scalars['String']['input']>
  interests_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  interests_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  lastName_CONTAINS?: InputMaybe<Scalars['String']['input']>
  lastName_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  lastName_EQ?: InputMaybe<Scalars['String']['input']>
  lastName_IN?: InputMaybe<Array<Scalars['String']['input']>>
  lastName_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  location_CONTAINS?: InputMaybe<Scalars['String']['input']>
  location_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  location_EQ?: InputMaybe<Scalars['String']['input']>
  location_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  location_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  passions_CONTAINS?: InputMaybe<Scalars['String']['input']>
  passions_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  passions_EQ?: InputMaybe<Scalars['String']['input']>
  passions_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  passions_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  phone_CONTAINS?: InputMaybe<Scalars['String']['input']>
  phone_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  phone_EQ?: InputMaybe<Scalars['String']['input']>
  phone_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  phone_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  photo_CONTAINS?: InputMaybe<Scalars['String']['input']>
  photo_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  photo_EQ?: InputMaybe<Scalars['String']['input']>
  photo_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  photo_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  pronouns_CONTAINS?: InputMaybe<Scalars['String']['input']>
  pronouns_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  pronouns_EQ?: InputMaybe<Scalars['String']['input']>
  pronouns_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  pronouns_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  providesResourcesAggregate?: InputMaybe<PersonProvidesResourcesAggregateInput>
  /** Return People where all of the related PersonProvidesResourcesConnections match this filter */
  providesResourcesConnection_ALL?: InputMaybe<PersonProvidesResourcesConnectionWhere>
  /** Return People where none of the related PersonProvidesResourcesConnections match this filter */
  providesResourcesConnection_NONE?: InputMaybe<PersonProvidesResourcesConnectionWhere>
  /** Return People where one of the related PersonProvidesResourcesConnections match this filter */
  providesResourcesConnection_SINGLE?: InputMaybe<PersonProvidesResourcesConnectionWhere>
  /** Return People where some of the related PersonProvidesResourcesConnections match this filter */
  providesResourcesConnection_SOME?: InputMaybe<PersonProvidesResourcesConnectionWhere>
  /** Return People where all of the related Resources match this filter */
  providesResources_ALL?: InputMaybe<ResourceWhere>
  /** Return People where none of the related Resources match this filter */
  providesResources_NONE?: InputMaybe<ResourceWhere>
  /** Return People where one of the related Resources match this filter */
  providesResources_SINGLE?: InputMaybe<ResourceWhere>
  /** Return People where some of the related Resources match this filter */
  providesResources_SOME?: InputMaybe<ResourceWhere>
  status_CONTAINS?: InputMaybe<Scalars['String']['input']>
  status_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  status_EQ?: InputMaybe<Scalars['String']['input']>
  status_IN?: InputMaybe<Array<Scalars['String']['input']>>
  status_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  traits_CONTAINS?: InputMaybe<Scalars['String']['input']>
  traits_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  traits_EQ?: InputMaybe<Scalars['String']['input']>
  traits_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  traits_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type Query = {
  __typename?: 'Query'
  carePointSubstringSearch: Array<CarePoint>
  carePoints: Array<CarePoint>
  carePointsAggregate: CarePointAggregateSelection
  carePointsConnection: CarePointsConnection
  chatbotResponses: Array<ChatbotResponse>
  chatbotResponsesAggregate: ChatbotResponseAggregateSelection
  chatbotResponsesConnection: ChatbotResponsesConnection
  communities: Array<Community>
  communitiesAggregate: CommunityAggregateSelection
  communitiesConnection: CommunitiesConnection
  communitySubstringSearch: Array<Community>
  coreValueSubstringSearch: Array<CoreValue>
  coreValues: Array<CoreValue>
  coreValuesAggregate: CoreValueAggregateSelection
  coreValuesConnection: CoreValuesConnection
  goalSubstringSearch: Array<Goal>
  goals: Array<Goal>
  goalsAggregate: GoalAggregateSelection
  goalsConnection: GoalsConnection
  people: Array<Person>
  peopleAggregate: PersonAggregateSelection
  peopleConnection: PeopleConnection
  peopleSubstringSearch: Array<Person>
  personInterfaces: Array<PersonInterface>
  personInterfacesAggregate: PersonInterfaceAggregateSelection
  personInterfacesConnection: PersonInterfacesConnection
  resourceSubstringSearch: Array<Resource>
  resources: Array<Resource>
  resourcesAggregate: ResourceAggregateSelection
  resourcesConnection: ResourcesConnection
}

export type QueryCarePointSubstringSearchArgs = {
  key: Scalars['String']['input']
}

export type QueryCarePointsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePointSort>>
  where?: InputMaybe<CarePointWhere>
}

export type QueryCarePointsAggregateArgs = {
  where?: InputMaybe<CarePointWhere>
}

export type QueryCarePointsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePointSort>>
  where?: InputMaybe<CarePointWhere>
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

export type QueryCommunitySubstringSearchArgs = {
  key: Scalars['String']['input']
}

export type QueryCoreValueSubstringSearchArgs = {
  key: Scalars['String']['input']
}

export type QueryCoreValuesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueSort>>
  where?: InputMaybe<CoreValueWhere>
}

export type QueryCoreValuesAggregateArgs = {
  where?: InputMaybe<CoreValueWhere>
}

export type QueryCoreValuesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueSort>>
  where?: InputMaybe<CoreValueWhere>
}

export type QueryGoalSubstringSearchArgs = {
  key: Scalars['String']['input']
}

export type QueryGoalsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalSort>>
  where?: InputMaybe<GoalWhere>
}

export type QueryGoalsAggregateArgs = {
  where?: InputMaybe<GoalWhere>
}

export type QueryGoalsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalSort>>
  where?: InputMaybe<GoalWhere>
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

export type QueryPeopleSubstringSearchArgs = {
  key: Scalars['String']['input']
}

export type QueryPersonInterfacesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonInterfaceSort>>
  where?: InputMaybe<PersonInterfaceWhere>
}

export type QueryPersonInterfacesAggregateArgs = {
  where?: InputMaybe<PersonInterfaceWhere>
}

export type QueryPersonInterfacesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonInterfaceSort>>
  where?: InputMaybe<PersonInterfaceWhere>
}

export type QueryResourceSubstringSearchArgs = {
  key: Scalars['String']['input']
}

export type QueryResourcesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type QueryResourcesAggregateArgs = {
  where?: InputMaybe<ResourceWhere>
}

export type QueryResourcesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type Resource = {
  __typename?: 'Resource'
  carePoints: Array<CarePoint>
  carePointsAggregate?: Maybe<ResourceCarePointCarePointsAggregationSelection>
  carePointsConnection: ResourceCarePointsConnection
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  createdByAggregate?: Maybe<ResourcePersonCreatedByAggregationSelection>
  createdByConnection: ResourceCreatedByConnection
  description?: Maybe<Scalars['String']['output']>
  goals: Array<Goal>
  goalsAggregate?: Maybe<ResourceGoalGoalsAggregationSelection>
  goalsConnection: ResourceGoalsConnection
  id: Scalars['ID']['output']
  location?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  providedByCommunity: Array<Community>
  providedByCommunityAggregate?: Maybe<ResourceCommunityProvidedByCommunityAggregationSelection>
  providedByCommunityConnection: ResourceProvidedByCommunityConnection
  providedByPerson: Array<Person>
  providedByPersonAggregate?: Maybe<ResourcePersonProvidedByPersonAggregationSelection>
  providedByPersonConnection: ResourceProvidedByPersonConnection
  resources: Array<Resource>
  resourcesAggregate?: Maybe<ResourceResourceResourcesAggregationSelection>
  resourcesConnection: ResourceResourcesConnection
  status: Scalars['String']['output']
  time?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  why?: Maybe<Scalars['String']['output']>
}

export type ResourceCarePointsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePointSort>>
  where?: InputMaybe<CarePointWhere>
}

export type ResourceCarePointsAggregateArgs = {
  where?: InputMaybe<CarePointWhere>
}

export type ResourceCarePointsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceCarePointsConnectionSort>>
  where?: InputMaybe<ResourceCarePointsConnectionWhere>
}

export type ResourceCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type ResourceCreatedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type ResourceCreatedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceCreatedByConnectionSort>>
  where?: InputMaybe<ResourceCreatedByConnectionWhere>
}

export type ResourceGoalsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalSort>>
  where?: InputMaybe<GoalWhere>
}

export type ResourceGoalsAggregateArgs = {
  where?: InputMaybe<GoalWhere>
}

export type ResourceGoalsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceGoalsConnectionSort>>
  where?: InputMaybe<ResourceGoalsConnectionWhere>
}

export type ResourceProvidedByCommunityArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunitySort>>
  where?: InputMaybe<CommunityWhere>
}

export type ResourceProvidedByCommunityAggregateArgs = {
  where?: InputMaybe<CommunityWhere>
}

export type ResourceProvidedByCommunityConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceProvidedByCommunityConnectionSort>>
  where?: InputMaybe<ResourceProvidedByCommunityConnectionWhere>
}

export type ResourceProvidedByPersonArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type ResourceProvidedByPersonAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type ResourceProvidedByPersonConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceProvidedByPersonConnectionSort>>
  where?: InputMaybe<ResourceProvidedByPersonConnectionWhere>
}

export type ResourceResourcesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type ResourceResourcesAggregateArgs = {
  where?: InputMaybe<ResourceWhere>
}

export type ResourceResourcesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceResourcesConnectionSort>>
  where?: InputMaybe<ResourceResourcesConnectionWhere>
}

export type ResourceAggregateSelection = {
  __typename?: 'ResourceAggregateSelection'
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type ResourceCarePointCarePointsAggregationSelection = {
  __typename?: 'ResourceCarePointCarePointsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourceCarePointCarePointsNodeAggregateSelection>
}

export type ResourceCarePointCarePointsNodeAggregateSelection = {
  __typename?: 'ResourceCarePointCarePointsNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  fulfillmentDate: StringAggregateSelection
  id: IdAggregateSelection
  issuesIdentified: StringAggregateSelection
  issuesResolved: StringAggregateSelection
  levelFulfilled: StringAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type ResourceCarePointsAggregateInput = {
  AND?: InputMaybe<Array<ResourceCarePointsAggregateInput>>
  NOT?: InputMaybe<ResourceCarePointsAggregateInput>
  OR?: InputMaybe<Array<ResourceCarePointsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourceCarePointsNodeAggregationWhereInput>
}

export type ResourceCarePointsConnectFieldInput = {
  connect?: InputMaybe<Array<CarePointConnectInput>>
  where?: InputMaybe<CarePointConnectWhere>
}

export type ResourceCarePointsConnection = {
  __typename?: 'ResourceCarePointsConnection'
  edges: Array<ResourceCarePointsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResourceCarePointsConnectionSort = {
  node?: InputMaybe<CarePointSort>
}

export type ResourceCarePointsConnectionWhere = {
  AND?: InputMaybe<Array<ResourceCarePointsConnectionWhere>>
  NOT?: InputMaybe<ResourceCarePointsConnectionWhere>
  OR?: InputMaybe<Array<ResourceCarePointsConnectionWhere>>
  node?: InputMaybe<CarePointWhere>
}

export type ResourceCarePointsCreateFieldInput = {
  node: CarePointCreateInput
}

export type ResourceCarePointsDeleteFieldInput = {
  delete?: InputMaybe<CarePointDeleteInput>
  where?: InputMaybe<ResourceCarePointsConnectionWhere>
}

export type ResourceCarePointsDisconnectFieldInput = {
  disconnect?: InputMaybe<CarePointDisconnectInput>
  where?: InputMaybe<ResourceCarePointsConnectionWhere>
}

export type ResourceCarePointsFieldInput = {
  connect?: InputMaybe<Array<ResourceCarePointsConnectFieldInput>>
  create?: InputMaybe<Array<ResourceCarePointsCreateFieldInput>>
}

export type ResourceCarePointsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourceCarePointsNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourceCarePointsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourceCarePointsNodeAggregationWhereInput>>
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
  fulfillmentDate_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  fulfillmentDate_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  fulfillmentDate_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  issuesIdentified_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  issuesIdentified_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesIdentified_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  issuesResolved_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  issuesResolved_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  levelFulfilled_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  levelFulfilled_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type ResourceCarePointsRelationship = {
  __typename?: 'ResourceCarePointsRelationship'
  cursor: Scalars['String']['output']
  node: CarePoint
}

export type ResourceCarePointsUpdateConnectionInput = {
  node?: InputMaybe<CarePointUpdateInput>
}

export type ResourceCarePointsUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourceCarePointsConnectFieldInput>>
  create?: InputMaybe<Array<ResourceCarePointsCreateFieldInput>>
  delete?: InputMaybe<Array<ResourceCarePointsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResourceCarePointsDisconnectFieldInput>>
  update?: InputMaybe<ResourceCarePointsUpdateConnectionInput>
  where?: InputMaybe<ResourceCarePointsConnectionWhere>
}

export type ResourceCommunityProvidedByCommunityAggregationSelection = {
  __typename?: 'ResourceCommunityProvidedByCommunityAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourceCommunityProvidedByCommunityNodeAggregateSelection>
}

export type ResourceCommunityProvidedByCommunityNodeAggregateSelection = {
  __typename?: 'ResourceCommunityProvidedByCommunityNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  resultsAchieved: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type ResourceConnectInput = {
  carePoints?: InputMaybe<Array<ResourceCarePointsConnectFieldInput>>
  createdBy?: InputMaybe<Array<ResourceCreatedByConnectFieldInput>>
  goals?: InputMaybe<Array<ResourceGoalsConnectFieldInput>>
  providedByCommunity?: InputMaybe<
    Array<ResourceProvidedByCommunityConnectFieldInput>
  >
  providedByPerson?: InputMaybe<
    Array<ResourceProvidedByPersonConnectFieldInput>
  >
  resources?: InputMaybe<Array<ResourceResourcesConnectFieldInput>>
}

export type ResourceConnectWhere = {
  node: ResourceWhere
}

export type ResourceCreateInput = {
  carePoints?: InputMaybe<ResourceCarePointsFieldInput>
  createdBy?: InputMaybe<ResourceCreatedByFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  goals?: InputMaybe<ResourceGoalsFieldInput>
  location?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  providedByCommunity?: InputMaybe<ResourceProvidedByCommunityFieldInput>
  providedByPerson?: InputMaybe<ResourceProvidedByPersonFieldInput>
  resources?: InputMaybe<ResourceResourcesFieldInput>
  status: Scalars['String']['input']
  time?: InputMaybe<Scalars['String']['input']>
  why?: InputMaybe<Scalars['String']['input']>
}

export type ResourceCreatedByAggregateInput = {
  AND?: InputMaybe<Array<ResourceCreatedByAggregateInput>>
  NOT?: InputMaybe<ResourceCreatedByAggregateInput>
  OR?: InputMaybe<Array<ResourceCreatedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourceCreatedByNodeAggregationWhereInput>
}

export type ResourceCreatedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type ResourceCreatedByConnection = {
  __typename?: 'ResourceCreatedByConnection'
  edges: Array<ResourceCreatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResourceCreatedByConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type ResourceCreatedByConnectionWhere = {
  AND?: InputMaybe<Array<ResourceCreatedByConnectionWhere>>
  NOT?: InputMaybe<ResourceCreatedByConnectionWhere>
  OR?: InputMaybe<Array<ResourceCreatedByConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type ResourceCreatedByCreateFieldInput = {
  node: PersonCreateInput
}

export type ResourceCreatedByDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<ResourceCreatedByConnectionWhere>
}

export type ResourceCreatedByDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<ResourceCreatedByConnectionWhere>
}

export type ResourceCreatedByFieldInput = {
  connect?: InputMaybe<Array<ResourceCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<ResourceCreatedByCreateFieldInput>>
}

export type ResourceCreatedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourceCreatedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourceCreatedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourceCreatedByNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type ResourceCreatedByRelationship = {
  __typename?: 'ResourceCreatedByRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type ResourceCreatedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type ResourceCreatedByUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourceCreatedByConnectFieldInput>>
  create?: InputMaybe<Array<ResourceCreatedByCreateFieldInput>>
  delete?: InputMaybe<Array<ResourceCreatedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResourceCreatedByDisconnectFieldInput>>
  update?: InputMaybe<ResourceCreatedByUpdateConnectionInput>
  where?: InputMaybe<ResourceCreatedByConnectionWhere>
}

export type ResourceDeleteInput = {
  carePoints?: InputMaybe<Array<ResourceCarePointsDeleteFieldInput>>
  createdBy?: InputMaybe<Array<ResourceCreatedByDeleteFieldInput>>
  goals?: InputMaybe<Array<ResourceGoalsDeleteFieldInput>>
  providedByCommunity?: InputMaybe<
    Array<ResourceProvidedByCommunityDeleteFieldInput>
  >
  providedByPerson?: InputMaybe<Array<ResourceProvidedByPersonDeleteFieldInput>>
  resources?: InputMaybe<Array<ResourceResourcesDeleteFieldInput>>
}

export type ResourceDisconnectInput = {
  carePoints?: InputMaybe<Array<ResourceCarePointsDisconnectFieldInput>>
  createdBy?: InputMaybe<Array<ResourceCreatedByDisconnectFieldInput>>
  goals?: InputMaybe<Array<ResourceGoalsDisconnectFieldInput>>
  providedByCommunity?: InputMaybe<
    Array<ResourceProvidedByCommunityDisconnectFieldInput>
  >
  providedByPerson?: InputMaybe<
    Array<ResourceProvidedByPersonDisconnectFieldInput>
  >
  resources?: InputMaybe<Array<ResourceResourcesDisconnectFieldInput>>
}

export type ResourceEdge = {
  __typename?: 'ResourceEdge'
  cursor: Scalars['String']['output']
  node: Resource
}

export type ResourceGoalGoalsAggregationSelection = {
  __typename?: 'ResourceGoalGoalsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourceGoalGoalsNodeAggregateSelection>
}

export type ResourceGoalGoalsNodeAggregateSelection = {
  __typename?: 'ResourceGoalGoalsNodeAggregateSelection'
  activities: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  photo: StringAggregateSelection
  status: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type ResourceGoalsAggregateInput = {
  AND?: InputMaybe<Array<ResourceGoalsAggregateInput>>
  NOT?: InputMaybe<ResourceGoalsAggregateInput>
  OR?: InputMaybe<Array<ResourceGoalsAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourceGoalsNodeAggregationWhereInput>
}

export type ResourceGoalsConnectFieldInput = {
  connect?: InputMaybe<Array<GoalConnectInput>>
  where?: InputMaybe<GoalConnectWhere>
}

export type ResourceGoalsConnection = {
  __typename?: 'ResourceGoalsConnection'
  edges: Array<ResourceGoalsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResourceGoalsConnectionSort = {
  node?: InputMaybe<GoalSort>
}

export type ResourceGoalsConnectionWhere = {
  AND?: InputMaybe<Array<ResourceGoalsConnectionWhere>>
  NOT?: InputMaybe<ResourceGoalsConnectionWhere>
  OR?: InputMaybe<Array<ResourceGoalsConnectionWhere>>
  node?: InputMaybe<GoalWhere>
}

export type ResourceGoalsCreateFieldInput = {
  node: GoalCreateInput
}

export type ResourceGoalsDeleteFieldInput = {
  delete?: InputMaybe<GoalDeleteInput>
  where?: InputMaybe<ResourceGoalsConnectionWhere>
}

export type ResourceGoalsDisconnectFieldInput = {
  disconnect?: InputMaybe<GoalDisconnectInput>
  where?: InputMaybe<ResourceGoalsConnectionWhere>
}

export type ResourceGoalsFieldInput = {
  connect?: InputMaybe<Array<ResourceGoalsConnectFieldInput>>
  create?: InputMaybe<Array<ResourceGoalsCreateFieldInput>>
}

export type ResourceGoalsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourceGoalsNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourceGoalsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourceGoalsNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  successMeasures_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  successMeasures_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  successMeasures_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type ResourceGoalsRelationship = {
  __typename?: 'ResourceGoalsRelationship'
  cursor: Scalars['String']['output']
  node: Goal
}

export type ResourceGoalsUpdateConnectionInput = {
  node?: InputMaybe<GoalUpdateInput>
}

export type ResourceGoalsUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourceGoalsConnectFieldInput>>
  create?: InputMaybe<Array<ResourceGoalsCreateFieldInput>>
  delete?: InputMaybe<Array<ResourceGoalsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResourceGoalsDisconnectFieldInput>>
  update?: InputMaybe<ResourceGoalsUpdateConnectionInput>
  where?: InputMaybe<ResourceGoalsConnectionWhere>
}

export type ResourcePersonCreatedByAggregationSelection = {
  __typename?: 'ResourcePersonCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourcePersonCreatedByNodeAggregateSelection>
}

export type ResourcePersonCreatedByNodeAggregateSelection = {
  __typename?: 'ResourcePersonCreatedByNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type ResourcePersonProvidedByPersonAggregationSelection = {
  __typename?: 'ResourcePersonProvidedByPersonAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourcePersonProvidedByPersonNodeAggregateSelection>
}

export type ResourcePersonProvidedByPersonNodeAggregateSelection = {
  __typename?: 'ResourcePersonProvidedByPersonNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favorites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  status: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type ResourceProvidedByCommunityAggregateInput = {
  AND?: InputMaybe<Array<ResourceProvidedByCommunityAggregateInput>>
  NOT?: InputMaybe<ResourceProvidedByCommunityAggregateInput>
  OR?: InputMaybe<Array<ResourceProvidedByCommunityAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourceProvidedByCommunityNodeAggregationWhereInput>
}

export type ResourceProvidedByCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type ResourceProvidedByCommunityConnection = {
  __typename?: 'ResourceProvidedByCommunityConnection'
  edges: Array<ResourceProvidedByCommunityRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResourceProvidedByCommunityConnectionSort = {
  node?: InputMaybe<CommunitySort>
}

export type ResourceProvidedByCommunityConnectionWhere = {
  AND?: InputMaybe<Array<ResourceProvidedByCommunityConnectionWhere>>
  NOT?: InputMaybe<ResourceProvidedByCommunityConnectionWhere>
  OR?: InputMaybe<Array<ResourceProvidedByCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type ResourceProvidedByCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type ResourceProvidedByCommunityDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<ResourceProvidedByCommunityConnectionWhere>
}

export type ResourceProvidedByCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<ResourceProvidedByCommunityConnectionWhere>
}

export type ResourceProvidedByCommunityFieldInput = {
  connect?: InputMaybe<Array<ResourceProvidedByCommunityConnectFieldInput>>
  create?: InputMaybe<Array<ResourceProvidedByCommunityCreateFieldInput>>
}

export type ResourceProvidedByCommunityNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourceProvidedByCommunityNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourceProvidedByCommunityNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourceProvidedByCommunityNodeAggregationWhereInput>>
  activities_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  activities_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  activities_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  activities_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  resultsAchieved_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  resultsAchieved_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  resultsAchieved_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type ResourceProvidedByCommunityRelationship = {
  __typename?: 'ResourceProvidedByCommunityRelationship'
  cursor: Scalars['String']['output']
  node: Community
}

export type ResourceProvidedByCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
}

export type ResourceProvidedByCommunityUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourceProvidedByCommunityConnectFieldInput>>
  create?: InputMaybe<Array<ResourceProvidedByCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<ResourceProvidedByCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<ResourceProvidedByCommunityDisconnectFieldInput>
  >
  update?: InputMaybe<ResourceProvidedByCommunityUpdateConnectionInput>
  where?: InputMaybe<ResourceProvidedByCommunityConnectionWhere>
}

export type ResourceProvidedByPersonAggregateInput = {
  AND?: InputMaybe<Array<ResourceProvidedByPersonAggregateInput>>
  NOT?: InputMaybe<ResourceProvidedByPersonAggregateInput>
  OR?: InputMaybe<Array<ResourceProvidedByPersonAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourceProvidedByPersonNodeAggregationWhereInput>
}

export type ResourceProvidedByPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type ResourceProvidedByPersonConnection = {
  __typename?: 'ResourceProvidedByPersonConnection'
  edges: Array<ResourceProvidedByPersonRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResourceProvidedByPersonConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type ResourceProvidedByPersonConnectionWhere = {
  AND?: InputMaybe<Array<ResourceProvidedByPersonConnectionWhere>>
  NOT?: InputMaybe<ResourceProvidedByPersonConnectionWhere>
  OR?: InputMaybe<Array<ResourceProvidedByPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type ResourceProvidedByPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type ResourceProvidedByPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<ResourceProvidedByPersonConnectionWhere>
}

export type ResourceProvidedByPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<ResourceProvidedByPersonConnectionWhere>
}

export type ResourceProvidedByPersonFieldInput = {
  connect?: InputMaybe<Array<ResourceProvidedByPersonConnectFieldInput>>
  create?: InputMaybe<Array<ResourceProvidedByPersonCreateFieldInput>>
}

export type ResourceProvidedByPersonNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourceProvidedByPersonNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourceProvidedByPersonNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourceProvidedByPersonNodeAggregationWhereInput>>
  authId_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  authId_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  authId_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  authId_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  avatar_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  avatar_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  avatar_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  careManual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  careManual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  careManual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favorites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favorites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favorites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favorites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  interests_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  interests_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  interests_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  interests_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  phone_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phone_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phone_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phone_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  photo_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  photo_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  photo_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pronouns_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pronouns_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pronouns_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type ResourceProvidedByPersonRelationship = {
  __typename?: 'ResourceProvidedByPersonRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type ResourceProvidedByPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type ResourceProvidedByPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourceProvidedByPersonConnectFieldInput>>
  create?: InputMaybe<Array<ResourceProvidedByPersonCreateFieldInput>>
  delete?: InputMaybe<Array<ResourceProvidedByPersonDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResourceProvidedByPersonDisconnectFieldInput>>
  update?: InputMaybe<ResourceProvidedByPersonUpdateConnectionInput>
  where?: InputMaybe<ResourceProvidedByPersonConnectionWhere>
}

export type ResourceResourceResourcesAggregationSelection = {
  __typename?: 'ResourceResourceResourcesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourceResourceResourcesNodeAggregateSelection>
}

export type ResourceResourceResourcesNodeAggregateSelection = {
  __typename?: 'ResourceResourceResourcesNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  status: StringAggregateSelection
  time: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  why: StringAggregateSelection
}

export type ResourceResourcesAggregateInput = {
  AND?: InputMaybe<Array<ResourceResourcesAggregateInput>>
  NOT?: InputMaybe<ResourceResourcesAggregateInput>
  OR?: InputMaybe<Array<ResourceResourcesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourceResourcesNodeAggregationWhereInput>
}

export type ResourceResourcesConnectFieldInput = {
  connect?: InputMaybe<Array<ResourceConnectInput>>
  where?: InputMaybe<ResourceConnectWhere>
}

export type ResourceResourcesConnection = {
  __typename?: 'ResourceResourcesConnection'
  edges: Array<ResourceResourcesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResourceResourcesConnectionSort = {
  node?: InputMaybe<ResourceSort>
}

export type ResourceResourcesConnectionWhere = {
  AND?: InputMaybe<Array<ResourceResourcesConnectionWhere>>
  NOT?: InputMaybe<ResourceResourcesConnectionWhere>
  OR?: InputMaybe<Array<ResourceResourcesConnectionWhere>>
  node?: InputMaybe<ResourceWhere>
}

export type ResourceResourcesCreateFieldInput = {
  node: ResourceCreateInput
}

export type ResourceResourcesDeleteFieldInput = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<ResourceResourcesConnectionWhere>
}

export type ResourceResourcesDisconnectFieldInput = {
  disconnect?: InputMaybe<ResourceDisconnectInput>
  where?: InputMaybe<ResourceResourcesConnectionWhere>
}

export type ResourceResourcesFieldInput = {
  connect?: InputMaybe<Array<ResourceResourcesConnectFieldInput>>
  create?: InputMaybe<Array<ResourceResourcesCreateFieldInput>>
}

export type ResourceResourcesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourceResourcesNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourceResourcesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourceResourcesNodeAggregationWhereInput>>
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
  id_MAX_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LT?: InputMaybe<Scalars['ID']['input']>
  id_MAX_LTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_EQUAL?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_GTE?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LT?: InputMaybe<Scalars['ID']['input']>
  id_MIN_LTE?: InputMaybe<Scalars['ID']['input']>
  location_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  location_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  location_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  location_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  status_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  status_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  status_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  status_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  time_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  time_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  time_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  updatedAt_MAX_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MAX_LTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_EQUAL?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_MIN_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  why_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  why_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  why_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type ResourceResourcesRelationship = {
  __typename?: 'ResourceResourcesRelationship'
  cursor: Scalars['String']['output']
  node: Resource
}

export type ResourceResourcesUpdateConnectionInput = {
  node?: InputMaybe<ResourceUpdateInput>
}

export type ResourceResourcesUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourceResourcesConnectFieldInput>>
  create?: InputMaybe<Array<ResourceResourcesCreateFieldInput>>
  delete?: InputMaybe<Array<ResourceResourcesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResourceResourcesDisconnectFieldInput>>
  update?: InputMaybe<ResourceResourcesUpdateConnectionInput>
  where?: InputMaybe<ResourceResourcesConnectionWhere>
}

/** Fields to sort Resources by. The order in which sorts are applied is not guaranteed when specifying many fields in one ResourceSort object. */
export type ResourceSort = {
  createdAt?: InputMaybe<SortDirection>
  description?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  status?: InputMaybe<SortDirection>
  time?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
  why?: InputMaybe<SortDirection>
}

export type ResourceUpdateInput = {
  carePoints?: InputMaybe<Array<ResourceCarePointsUpdateFieldInput>>
  createdBy?: InputMaybe<Array<ResourceCreatedByUpdateFieldInput>>
  description_SET?: InputMaybe<Scalars['String']['input']>
  goals?: InputMaybe<Array<ResourceGoalsUpdateFieldInput>>
  location_SET?: InputMaybe<Scalars['String']['input']>
  name_SET?: InputMaybe<Scalars['String']['input']>
  providedByCommunity?: InputMaybe<
    Array<ResourceProvidedByCommunityUpdateFieldInput>
  >
  providedByPerson?: InputMaybe<Array<ResourceProvidedByPersonUpdateFieldInput>>
  resources?: InputMaybe<Array<ResourceResourcesUpdateFieldInput>>
  status_SET?: InputMaybe<Scalars['String']['input']>
  time_SET?: InputMaybe<Scalars['String']['input']>
  why_SET?: InputMaybe<Scalars['String']['input']>
}

export type ResourceWhere = {
  AND?: InputMaybe<Array<ResourceWhere>>
  NOT?: InputMaybe<ResourceWhere>
  OR?: InputMaybe<Array<ResourceWhere>>
  carePointsAggregate?: InputMaybe<ResourceCarePointsAggregateInput>
  /** Return Resources where all of the related ResourceCarePointsConnections match this filter */
  carePointsConnection_ALL?: InputMaybe<ResourceCarePointsConnectionWhere>
  /** Return Resources where none of the related ResourceCarePointsConnections match this filter */
  carePointsConnection_NONE?: InputMaybe<ResourceCarePointsConnectionWhere>
  /** Return Resources where one of the related ResourceCarePointsConnections match this filter */
  carePointsConnection_SINGLE?: InputMaybe<ResourceCarePointsConnectionWhere>
  /** Return Resources where some of the related ResourceCarePointsConnections match this filter */
  carePointsConnection_SOME?: InputMaybe<ResourceCarePointsConnectionWhere>
  /** Return Resources where all of the related CarePoints match this filter */
  carePoints_ALL?: InputMaybe<CarePointWhere>
  /** Return Resources where none of the related CarePoints match this filter */
  carePoints_NONE?: InputMaybe<CarePointWhere>
  /** Return Resources where one of the related CarePoints match this filter */
  carePoints_SINGLE?: InputMaybe<CarePointWhere>
  /** Return Resources where some of the related CarePoints match this filter */
  carePoints_SOME?: InputMaybe<CarePointWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  createdByAggregate?: InputMaybe<ResourceCreatedByAggregateInput>
  /** Return Resources where all of the related ResourceCreatedByConnections match this filter */
  createdByConnection_ALL?: InputMaybe<ResourceCreatedByConnectionWhere>
  /** Return Resources where none of the related ResourceCreatedByConnections match this filter */
  createdByConnection_NONE?: InputMaybe<ResourceCreatedByConnectionWhere>
  /** Return Resources where one of the related ResourceCreatedByConnections match this filter */
  createdByConnection_SINGLE?: InputMaybe<ResourceCreatedByConnectionWhere>
  /** Return Resources where some of the related ResourceCreatedByConnections match this filter */
  createdByConnection_SOME?: InputMaybe<ResourceCreatedByConnectionWhere>
  /** Return Resources where all of the related People match this filter */
  createdBy_ALL?: InputMaybe<PersonWhere>
  /** Return Resources where none of the related People match this filter */
  createdBy_NONE?: InputMaybe<PersonWhere>
  /** Return Resources where one of the related People match this filter */
  createdBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return Resources where some of the related People match this filter */
  createdBy_SOME?: InputMaybe<PersonWhere>
  description_CONTAINS?: InputMaybe<Scalars['String']['input']>
  description_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  description_EQ?: InputMaybe<Scalars['String']['input']>
  description_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  description_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  goalsAggregate?: InputMaybe<ResourceGoalsAggregateInput>
  /** Return Resources where all of the related ResourceGoalsConnections match this filter */
  goalsConnection_ALL?: InputMaybe<ResourceGoalsConnectionWhere>
  /** Return Resources where none of the related ResourceGoalsConnections match this filter */
  goalsConnection_NONE?: InputMaybe<ResourceGoalsConnectionWhere>
  /** Return Resources where one of the related ResourceGoalsConnections match this filter */
  goalsConnection_SINGLE?: InputMaybe<ResourceGoalsConnectionWhere>
  /** Return Resources where some of the related ResourceGoalsConnections match this filter */
  goalsConnection_SOME?: InputMaybe<ResourceGoalsConnectionWhere>
  /** Return Resources where all of the related Goals match this filter */
  goals_ALL?: InputMaybe<GoalWhere>
  /** Return Resources where none of the related Goals match this filter */
  goals_NONE?: InputMaybe<GoalWhere>
  /** Return Resources where one of the related Goals match this filter */
  goals_SINGLE?: InputMaybe<GoalWhere>
  /** Return Resources where some of the related Goals match this filter */
  goals_SOME?: InputMaybe<GoalWhere>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  location_CONTAINS?: InputMaybe<Scalars['String']['input']>
  location_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  location_EQ?: InputMaybe<Scalars['String']['input']>
  location_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  location_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  providedByCommunityAggregate?: InputMaybe<ResourceProvidedByCommunityAggregateInput>
  /** Return Resources where all of the related ResourceProvidedByCommunityConnections match this filter */
  providedByCommunityConnection_ALL?: InputMaybe<ResourceProvidedByCommunityConnectionWhere>
  /** Return Resources where none of the related ResourceProvidedByCommunityConnections match this filter */
  providedByCommunityConnection_NONE?: InputMaybe<ResourceProvidedByCommunityConnectionWhere>
  /** Return Resources where one of the related ResourceProvidedByCommunityConnections match this filter */
  providedByCommunityConnection_SINGLE?: InputMaybe<ResourceProvidedByCommunityConnectionWhere>
  /** Return Resources where some of the related ResourceProvidedByCommunityConnections match this filter */
  providedByCommunityConnection_SOME?: InputMaybe<ResourceProvidedByCommunityConnectionWhere>
  /** Return Resources where all of the related Communities match this filter */
  providedByCommunity_ALL?: InputMaybe<CommunityWhere>
  /** Return Resources where none of the related Communities match this filter */
  providedByCommunity_NONE?: InputMaybe<CommunityWhere>
  /** Return Resources where one of the related Communities match this filter */
  providedByCommunity_SINGLE?: InputMaybe<CommunityWhere>
  /** Return Resources where some of the related Communities match this filter */
  providedByCommunity_SOME?: InputMaybe<CommunityWhere>
  providedByPersonAggregate?: InputMaybe<ResourceProvidedByPersonAggregateInput>
  /** Return Resources where all of the related ResourceProvidedByPersonConnections match this filter */
  providedByPersonConnection_ALL?: InputMaybe<ResourceProvidedByPersonConnectionWhere>
  /** Return Resources where none of the related ResourceProvidedByPersonConnections match this filter */
  providedByPersonConnection_NONE?: InputMaybe<ResourceProvidedByPersonConnectionWhere>
  /** Return Resources where one of the related ResourceProvidedByPersonConnections match this filter */
  providedByPersonConnection_SINGLE?: InputMaybe<ResourceProvidedByPersonConnectionWhere>
  /** Return Resources where some of the related ResourceProvidedByPersonConnections match this filter */
  providedByPersonConnection_SOME?: InputMaybe<ResourceProvidedByPersonConnectionWhere>
  /** Return Resources where all of the related People match this filter */
  providedByPerson_ALL?: InputMaybe<PersonWhere>
  /** Return Resources where none of the related People match this filter */
  providedByPerson_NONE?: InputMaybe<PersonWhere>
  /** Return Resources where one of the related People match this filter */
  providedByPerson_SINGLE?: InputMaybe<PersonWhere>
  /** Return Resources where some of the related People match this filter */
  providedByPerson_SOME?: InputMaybe<PersonWhere>
  resourcesAggregate?: InputMaybe<ResourceResourcesAggregateInput>
  /** Return Resources where all of the related ResourceResourcesConnections match this filter */
  resourcesConnection_ALL?: InputMaybe<ResourceResourcesConnectionWhere>
  /** Return Resources where none of the related ResourceResourcesConnections match this filter */
  resourcesConnection_NONE?: InputMaybe<ResourceResourcesConnectionWhere>
  /** Return Resources where one of the related ResourceResourcesConnections match this filter */
  resourcesConnection_SINGLE?: InputMaybe<ResourceResourcesConnectionWhere>
  /** Return Resources where some of the related ResourceResourcesConnections match this filter */
  resourcesConnection_SOME?: InputMaybe<ResourceResourcesConnectionWhere>
  /** Return Resources where all of the related Resources match this filter */
  resources_ALL?: InputMaybe<ResourceWhere>
  /** Return Resources where none of the related Resources match this filter */
  resources_NONE?: InputMaybe<ResourceWhere>
  /** Return Resources where one of the related Resources match this filter */
  resources_SINGLE?: InputMaybe<ResourceWhere>
  /** Return Resources where some of the related Resources match this filter */
  resources_SOME?: InputMaybe<ResourceWhere>
  status_CONTAINS?: InputMaybe<Scalars['String']['input']>
  status_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  status_EQ?: InputMaybe<Scalars['String']['input']>
  status_IN?: InputMaybe<Array<Scalars['String']['input']>>
  status_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  time_CONTAINS?: InputMaybe<Scalars['String']['input']>
  time_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  time_EQ?: InputMaybe<Scalars['String']['input']>
  time_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  time_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  why_CONTAINS?: InputMaybe<Scalars['String']['input']>
  why_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  why_EQ?: InputMaybe<Scalars['String']['input']>
  why_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  why_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type ResourcesConnection = {
  __typename?: 'ResourcesConnection'
  edges: Array<ResourceEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/** An enum for sorting in either ascending or descending order. */
export enum SortDirection {
  /** Sort by field values in ascending order. */
  Asc = 'ASC',
  /** Sort by field values in descending order. */
  Desc = 'DESC',
}

export type StringAggregateSelection = {
  __typename?: 'StringAggregateSelection'
  longest?: Maybe<Scalars['String']['output']>
  shortest?: Maybe<Scalars['String']['output']>
}

export type UpdateCarePointsMutationResponse = {
  __typename?: 'UpdateCarePointsMutationResponse'
  carePoints: Array<CarePoint>
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

export type UpdateCoreValuesMutationResponse = {
  __typename?: 'UpdateCoreValuesMutationResponse'
  coreValues: Array<CoreValue>
  info: UpdateInfo
}

export type UpdateGoalsMutationResponse = {
  __typename?: 'UpdateGoalsMutationResponse'
  goals: Array<Goal>
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

export type UpdatePeopleMutationResponse = {
  __typename?: 'UpdatePeopleMutationResponse'
  info: UpdateInfo
  people: Array<Person>
}

export type UpdateResourcesMutationResponse = {
  __typename?: 'UpdateResourcesMutationResponse'
  info: UpdateInfo
  resources: Array<Resource>
}

export type CreateCarePointsMutationVariables = Exact<{
  input: Array<CarePointCreateInput> | CarePointCreateInput
}>

export type CreateCarePointsMutation = {
  __typename?: 'Mutation'
  createCarePoints: {
    __typename?: 'CreateCarePointsMutationResponse'
    carePoints: Array<{
      __typename?: 'CarePoint'
      id: string
      name: string
      description?: string | null
      status: string
      why?: string | null
      location?: string | null
      time?: string | null
      levelFulfilled?: string | null
      fulfillmentDate?: string | null
      successMeasures?: string | null
      issuesIdentified?: string | null
      issuesResolved?: string | null
      createdAt: any
      resources: Array<{
        __typename?: 'Resource'
        id: string
        name: string
        description?: string | null
        status: string
      }>
      enabledByGoals: Array<{
        __typename?: 'Goal'
        id: string
        name: string
        photo?: string | null
        status: string
        createdAt: any
        description?: string | null
      }>
      caresForGoals: Array<{
        __typename?: 'Goal'
        id: string
        name: string
        photo?: string | null
        status: string
        createdAt: any
        description?: string | null
      }>
      createdBy: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
    }>
  }
}

export type UpdateCarePointMutationVariables = Exact<{
  id: Scalars['ID']['input']
  update: CarePointUpdateInput
}>

export type UpdateCarePointMutation = {
  __typename?: 'Mutation'
  updateCarePoints: {
    __typename?: 'UpdateCarePointsMutationResponse'
    carePoints: Array<{
      __typename?: 'CarePoint'
      id: string
      name: string
      description?: string | null
      status: string
      why?: string | null
      location?: string | null
      time?: string | null
      levelFulfilled?: string | null
      fulfillmentDate?: string | null
      successMeasures?: string | null
      issuesIdentified?: string | null
      issuesResolved?: string | null
      createdAt: any
      resources: Array<{
        __typename?: 'Resource'
        id: string
        name: string
        description?: string | null
        status: string
      }>
      enabledByGoals: Array<{
        __typename?: 'Goal'
        id: string
        name: string
        photo?: string | null
        status: string
        createdAt: any
        description?: string | null
      }>
      caresForGoals: Array<{
        __typename?: 'Goal'
        id: string
        name: string
        photo?: string | null
        status: string
        createdAt: any
        description?: string | null
      }>
      createdBy: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
    }>
  }
}

export type DeleteCarePointMutationVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type DeleteCarePointMutation = {
  __typename?: 'Mutation'
  deleteCarePoints: { __typename?: 'DeleteInfo'; nodesDeleted: number }
}

export type SendMessageToChatbotMutationVariables = Exact<{
  message: Scalars['String']['input']
  sessionId?: InputMaybe<Scalars['String']['input']>
}>

export type SendMessageToChatbotMutation = {
  __typename?: 'Mutation'
  sendMessageToChatbot: {
    __typename?: 'ChatbotResponse'
    sessionId: string
    message: string
  }
}

export type CreateCommunitiesMutationVariables = Exact<{
  input: Array<CommunityCreateInput> | CommunityCreateInput
}>

export type CreateCommunitiesMutation = {
  __typename?: 'Mutation'
  createCommunities: {
    __typename?: 'CreateCommunitiesMutationResponse'
    communities: Array<{
      __typename?: 'Community'
      id: string
      name: string
      description?: string | null
      why?: string | null
      location?: string | null
      time?: string | null
      activities?: string | null
      resultsAchieved?: string | null
      status: string
    }>
  }
}

export type UpdateCommunityMutationVariables = Exact<{
  id: Scalars['ID']['input']
  update: CommunityUpdateInput
}>

export type UpdateCommunityMutation = {
  __typename?: 'Mutation'
  updateCommunities: {
    __typename?: 'UpdateCommunitiesMutationResponse'
    communities: Array<{
      __typename?: 'Community'
      id: string
      name: string
      description?: string | null
      why?: string | null
      location?: string | null
      time?: string | null
      activities?: string | null
      resultsAchieved?: string | null
      status: string
      relatedCommunities: Array<{
        __typename?: 'Community'
        id: string
        name: string
        description?: string | null
        members: Array<{
          __typename?: 'Person'
          id: string
          name: string
          photo?: string | null
        }>
      }>
      members: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
      coreValues: Array<{
        __typename?: 'CoreValue'
        id: string
        name: string
        description?: string | null
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

export type DeleteCommunityMutationVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type DeleteCommunityMutation = {
  __typename?: 'Mutation'
  deleteCommunities: { __typename?: 'DeleteInfo'; nodesDeleted: number }
}

export type CreateCoreValuesMutationVariables = Exact<{
  input: Array<CoreValueCreateInput> | CoreValueCreateInput
}>

export type CreateCoreValuesMutation = {
  __typename?: 'Mutation'
  createCoreValues: {
    __typename?: 'CreateCoreValuesMutationResponse'
    coreValues: Array<{
      __typename?: 'CoreValue'
      id: string
      name: string
      alignmentChallenges?: string | null
      alignmentExamples?: string | null
      description?: string | null
      why?: string | null
      createdAt: any
    }>
  }
}

export type UpdateCoreValueMutationVariables = Exact<{
  id: Scalars['ID']['input']
  update: CoreValueUpdateInput
}>

export type UpdateCoreValueMutation = {
  __typename?: 'Mutation'
  updateCoreValues: {
    __typename?: 'UpdateCoreValuesMutationResponse'
    coreValues: Array<{
      __typename?: 'CoreValue'
      id: string
      name: string
      alignmentChallenges?: string | null
      alignmentExamples?: string | null
      description?: string | null
      why?: string | null
      createdAt: any
      people: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
      communities: Array<{
        __typename?: 'Community'
        id: string
        name: string
        description?: string | null
      }>
      goals: Array<{
        __typename?: 'Goal'
        id: string
        name: string
        description?: string | null
        status: string
      }>
    }>
  }
}

export type DeleteCoreValueMutationVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type DeleteCoreValueMutation = {
  __typename?: 'Mutation'
  deleteCoreValues: { __typename?: 'DeleteInfo'; nodesDeleted: number }
}

export type CreateGoalsMutationVariables = Exact<{
  input: Array<GoalCreateInput> | GoalCreateInput
}>

export type CreateGoalsMutation = {
  __typename?: 'Mutation'
  createGoals: {
    __typename?: 'CreateGoalsMutationResponse'
    goals: Array<{
      __typename?: 'Goal'
      id: string
      name: string
      description?: string | null
      successMeasures?: string | null
      photo?: string | null
      status: string
      location?: string | null
      time?: string | null
      createdAt: any
      coreValues: Array<{
        __typename?: 'CoreValue'
        id: string
        name: string
        description?: string | null
      }>
      motivatesPeople: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
      motivatesCommunities: Array<{
        __typename?: 'Community'
        id: string
        name: string
        description?: string | null
      }>
      enablesCarePoints: Array<{
        __typename?: 'CarePoint'
        id: string
        description?: string | null
        status: string
      }>
      caredForByCarePoints: Array<{
        __typename?: 'CarePoint'
        id: string
        description?: string | null
        status: string
      }>
      createdBy: Array<{ __typename?: 'Person'; id: string; name: string }>
    }>
  }
}

export type UpdateGoalMutationVariables = Exact<{
  id: Scalars['ID']['input']
  update: GoalUpdateInput
}>

export type UpdateGoalMutation = {
  __typename?: 'Mutation'
  updateGoals: {
    __typename?: 'UpdateGoalsMutationResponse'
    goals: Array<{
      __typename?: 'Goal'
      id: string
      name: string
      description?: string | null
      successMeasures?: string | null
      photo?: string | null
      status: string
      location?: string | null
      time?: string | null
      createdAt: any
      coreValues: Array<{
        __typename?: 'CoreValue'
        id: string
        name: string
        description?: string | null
      }>
      motivatesPeople: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
      motivatesCommunities: Array<{
        __typename?: 'Community'
        id: string
        name: string
        description?: string | null
      }>
      enablesCarePoints: Array<{
        __typename?: 'CarePoint'
        id: string
        description?: string | null
        status: string
      }>
      caredForByCarePoints: Array<{
        __typename?: 'CarePoint'
        id: string
        description?: string | null
        status: string
      }>
      resources: Array<{
        __typename?: 'Resource'
        id: string
        name: string
        description?: string | null
        status: string
      }>
      createdBy: Array<{ __typename?: 'Person'; id: string; name: string }>
    }>
  }
}

export type DeleteGoalMutationVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type DeleteGoalMutation = {
  __typename?: 'Mutation'
  deleteGoals: { __typename?: 'DeleteInfo'; nodesDeleted: number }
}

export type GeneratePersonEmbeddingsMutationVariables = Exact<{
  personId: Scalars['ID']['input']
}>

export type GeneratePersonEmbeddingsMutation = {
  __typename?: 'Mutation'
  generatePersonEmbeddings: boolean
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
      firstName: string
      lastName: string
      email?: string | null
      phone?: string | null
      photo?: string | null
      location?: string | null
      pronouns?: string | null
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
      firstName: string
      lastName: string
      name: string
      email?: string | null
      photo?: string | null
      phone?: string | null
      pronouns?: string | null
      status: string
      avatar?: string | null
      careManual?: string | null
      favorites?: string | null
      passions?: string | null
      traits?: string | null
      fieldsOfCare?: string | null
      interests?: string | null
      location?: string | null
      createdAt: any
      connectedTo: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
      providesResources: Array<{
        __typename?: 'Resource'
        id: string
        name: string
        description?: string | null
        status: string
      }>
      goals: Array<{
        __typename?: 'Goal'
        id: string
        name: string
        photo?: string | null
        status: string
        createdAt: any
        description?: string | null
      }>
      carePoints: Array<{
        __typename?: 'CarePoint'
        id: string
        description?: string | null
      }>
      coreValues: Array<{
        __typename?: 'CoreValue'
        id: string
        name: string
        description?: string | null
      }>
      communitiesConnection: {
        __typename?: 'PersonCommunitiesConnection'
        edges: Array<{
          __typename?: 'PersonCommunitiesRelationship'
          node: {
            __typename?: 'Community'
            id: string
            name: string
            description?: string | null
            members: Array<{
              __typename?: 'Person'
              id: string
              photo?: string | null
            }>
            membersAggregate?: {
              __typename?: 'CommunityPersonMembersAggregationSelection'
              count: number
            } | null
          }
          properties: {
            __typename?: 'BelongsTo'
            totem?: string | null
            signupDate?: any | null
          }
        }>
      }
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

export type CreateResourcesMutationVariables = Exact<{
  input: Array<ResourceCreateInput> | ResourceCreateInput
}>

export type CreateResourcesMutation = {
  __typename?: 'Mutation'
  createResources: {
    __typename?: 'CreateResourcesMutationResponse'
    resources: Array<{
      __typename?: 'Resource'
      id: string
      name: string
      description?: string | null
      status: string
      why?: string | null
      location?: string | null
      time?: string | null
      resources: Array<{ __typename?: 'Resource'; id: string; name: string }>
      goals: Array<{
        __typename?: 'Goal'
        id: string
        name: string
        description?: string | null
      }>
      providedByPerson: Array<{
        __typename?: 'Person'
        id: string
        name: string
      }>
    }>
  }
}

export type UpdateResourceMutationVariables = Exact<{
  id: Scalars['ID']['input']
  update: ResourceUpdateInput
}>

export type UpdateResourceMutation = {
  __typename?: 'Mutation'
  updateResources: {
    __typename?: 'UpdateResourcesMutationResponse'
    resources: Array<{
      __typename?: 'Resource'
      id: string
      name: string
      description?: string | null
      status: string
      why?: string | null
      location?: string | null
      time?: string | null
      resources: Array<{
        __typename?: 'Resource'
        id: string
        name: string
        description?: string | null
        status: string
      }>
      goals: Array<{
        __typename?: 'Goal'
        id: string
        name: string
        description?: string | null
        status: string
      }>
      carePoints: Array<{
        __typename?: 'CarePoint'
        id: string
        description?: string | null
        status: string
      }>
      providedByCommunity: Array<{
        __typename?: 'Community'
        name: string
        id: string
        description?: string | null
        members: Array<{
          __typename?: 'Person'
          id: string
          name: string
          photo?: string | null
        }>
      }>
      providedByPerson: Array<{
        __typename?: 'Person'
        id: string
        name: string
        email?: string | null
        phone?: string | null
        photo?: string | null
      }>
    }>
  }
}

export type DeleteResourceMutationVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type DeleteResourceMutation = {
  __typename?: 'Mutation'
  deleteResources: { __typename?: 'DeleteInfo'; nodesDeleted: number }
}

export type GetRecentActionsQueryVariables = Exact<{ [key: string]: never }>

export type GetRecentActionsQuery = {
  __typename?: 'Query'
  carePoints: Array<{
    __typename?: 'CarePoint'
    createdAt: any
    description?: string | null
    name: string
    id: string
    status: string
    createdBy: Array<{
      __typename?: 'Person'
      photo?: string | null
      name: string
      id: string
    }>
  }>
  goals: Array<{
    __typename?: 'Goal'
    createdAt: any
    id: string
    description?: string | null
    photo?: string | null
    status: string
    name: string
    createdBy: Array<{
      __typename?: 'Person'
      name: string
      id: string
      photo?: string | null
    }>
  }>
  resources: Array<{
    __typename?: 'Resource'
    name: string
    id: string
    status: string
    description?: string | null
    createdAt: any
    providedByPerson: Array<{
      __typename?: 'Person'
      name: string
      photo?: string | null
      id: string
    }>
  }>
  coreValues: Array<{
    __typename?: 'CoreValue'
    description?: string | null
    id: string
    name: string
    createdAt: any
    people: Array<{
      __typename?: 'Person'
      name: string
      id: string
      photo?: string | null
    }>
  }>
  communities: Array<{
    __typename?: 'Community'
    name: string
    id: string
    members: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
      createdAt: any
    }>
  }>
}

export type GetCarePointQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetCarePointQuery = {
  __typename?: 'Query'
  carePoints: Array<{
    __typename?: 'CarePoint'
    id: string
    name: string
    description?: string | null
    status: string
    why?: string | null
    location?: string | null
    time?: string | null
    levelFulfilled?: string | null
    fulfillmentDate?: string | null
    successMeasures?: string | null
    issuesIdentified?: string | null
    issuesResolved?: string | null
    createdAt: any
    resources: Array<{
      __typename?: 'Resource'
      id: string
      name: string
      description?: string | null
      status: string
    }>
    enabledByGoals: Array<{
      __typename?: 'Goal'
      id: string
      name: string
      photo?: string | null
      status: string
      createdAt: any
      description?: string | null
    }>
    caresForGoals: Array<{
      __typename?: 'Goal'
      id: string
      name: string
      photo?: string | null
      status: string
      createdAt: any
      description?: string | null
    }>
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
    }>
  }>
}

export type GetAllCarePointsQueryVariables = Exact<{
  where?: InputMaybe<CarePointWhere>
}>

export type GetAllCarePointsQuery = {
  __typename?: 'Query'
  carePoints: Array<{
    __typename?: 'CarePoint'
    id: string
    name: string
    description?: string | null
    status: string
    createdAt: any
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
    }>
    enabledByGoals: Array<{ __typename?: 'Goal'; name: string; id: string }>
  }>
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
    description?: string | null
    why?: string | null
    location?: string | null
    time?: string | null
    activities?: string | null
    resultsAchieved?: string | null
    status: string
    createdAt: any
    relatedCommunities: Array<{
      __typename?: 'Community'
      id: string
      name: string
      description?: string | null
      members: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
    }>
    members: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
    }>
    resources: Array<{
      __typename?: 'Resource'
      id: string
      name: string
      description?: string | null
      status: string
      providedByPerson: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
    }>
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
    }>
    coreValues: Array<{
      __typename?: 'CoreValue'
      id: string
      name: string
      description?: string | null
    }>
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
    description?: string | null
    why?: string | null
    location?: string | null
    time?: string | null
    activities?: string | null
    resultsAchieved?: string | null
    status: string
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
    }>
    members: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
    }>
    relatedCommunities: Array<{
      __typename?: 'Community'
      id: string
      name: string
    }>
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
    members: Array<{
      __typename?: 'Person'
      email?: string | null
      name: string
      id: string
      photo?: string | null
    }>
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
    photo?: string | null
    email?: string | null
  }>
}

export type GetCoreValueQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetCoreValueQuery = {
  __typename?: 'Query'
  coreValues: Array<{
    __typename?: 'CoreValue'
    id: string
    name: string
    alignmentChallenges?: string | null
    alignmentExamples?: string | null
    description?: string | null
    why?: string | null
    createdAt: any
    people: Array<{ __typename?: 'Person'; id: string; name: string }>
    communities: Array<{
      __typename?: 'Community'
      id: string
      name: string
      description?: string | null
    }>
    goals: Array<{
      __typename?: 'Goal'
      id: string
      name: string
      description?: string | null
      status: string
    }>
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
    }>
  }>
}

export type GetAllCoreValuesQueryVariables = Exact<{
  where?: InputMaybe<CoreValueWhere>
}>

export type GetAllCoreValuesQuery = {
  __typename?: 'Query'
  coreValues: Array<{
    __typename?: 'CoreValue'
    id: string
    name: string
    alignmentChallenges?: string | null
    alignmentExamples?: string | null
    description?: string | null
    why?: string | null
    createdBy: Array<{ __typename?: 'Person'; id: string; name: string }>
    people: Array<{
      __typename?: 'Person'
      goals: Array<{ __typename?: 'Goal'; id: string; name: string }>
    }>
    communities: Array<{
      __typename?: 'Community'
      id: string
      name: string
      description?: string | null
    }>
    goals: Array<{
      __typename?: 'Goal'
      id: string
      name: string
      description?: string | null
      status: string
    }>
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
    authId?: string | null
    firstName: string
    lastName: string
    name: string
    email?: string | null
    photo?: string | null
    createdAt: any
    connectedTo: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
    }>
    communities: Array<{
      __typename?: 'Community'
      id: string
      name: string
      members: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
    }>
  }>
}

export type GetGoalQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetGoalQuery = {
  __typename?: 'Query'
  goals: Array<{
    __typename?: 'Goal'
    id: string
    name: string
    description?: string | null
    successMeasures?: string | null
    photo?: string | null
    status: string
    location?: string | null
    time?: string | null
    createdAt: any
    coreValues: Array<{
      __typename?: 'CoreValue'
      id: string
      name: string
      description?: string | null
    }>
    motivatesPeople: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
    }>
    motivatesCommunities: Array<{
      __typename?: 'Community'
      id: string
      name: string
      description?: string | null
      createdAt: any
    }>
    enablesCarePoints: Array<{
      __typename?: 'CarePoint'
      id: string
      name: string
      description?: string | null
      status: string
    }>
    caredForByCarePoints: Array<{
      __typename?: 'CarePoint'
      id: string
      name: string
      description?: string | null
      status: string
    }>
    resources: Array<{
      __typename?: 'Resource'
      id: string
      name: string
      description?: string | null
      status: string
    }>
    createdBy: Array<{ __typename?: 'Person'; id: string; name: string }>
  }>
}

export type GetAllGoalsQueryVariables = Exact<{
  where?: InputMaybe<GoalWhere>
}>

export type GetAllGoalsQuery = {
  __typename?: 'Query'
  goals: Array<{
    __typename?: 'Goal'
    id: string
    name: string
    description?: string | null
    successMeasures?: string | null
    photo?: string | null
    status: string
    location?: string | null
    time?: string | null
    createdAt: any
    motivatesPeople: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
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
    photo?: string | null
    phone?: string | null
    pronouns?: string | null
    status: string
    avatar?: string | null
    careManual?: string | null
    favorites?: string | null
    passions?: string | null
    traits?: string | null
    fieldsOfCare?: string | null
    interests?: string | null
    location?: string | null
    createdAt: any
    connectedTo: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
    }>
    providesResources: Array<{
      __typename?: 'Resource'
      id: string
      name: string
      description?: string | null
      status: string
    }>
    goals: Array<{
      __typename?: 'Goal'
      id: string
      name: string
      photo?: string | null
      status: string
      createdAt: any
      description?: string | null
    }>
    carePoints: Array<{
      __typename?: 'CarePoint'
      id: string
      description?: string | null
    }>
    coreValues: Array<{
      __typename?: 'CoreValue'
      id: string
      name: string
      description?: string | null
    }>
    communitiesConnection: {
      __typename?: 'PersonCommunitiesConnection'
      edges: Array<{
        __typename?: 'PersonCommunitiesRelationship'
        node: {
          __typename?: 'Community'
          id: string
          name: string
          description?: string | null
          members: Array<{
            __typename?: 'Person'
            id: string
            photo?: string | null
          }>
          membersAggregate?: {
            __typename?: 'CommunityPersonMembersAggregationSelection'
            count: number
          } | null
        }
        properties: {
          __typename?: 'BelongsTo'
          totem?: string | null
          signupDate?: any | null
        }
      }>
    }
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
    firstName: string
    lastName: string
    name: string
    email?: string | null
    photo?: string | null
    phone?: string | null
    pronouns?: string | null
    location?: string | null
    connectedTo: Array<{ __typename?: 'Person'; id: string; name: string }>
    communities: Array<{ __typename?: 'Community'; name: string; id: string }>
    goals: Array<{ __typename?: 'Goal'; id: string; name: string }>
    coreValues: Array<{ __typename?: 'CoreValue'; name: string; id: string }>
    providesResources: Array<{
      __typename?: 'Resource'
      name: string
      id: string
    }>
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
    photo?: string | null
    goals: Array<{
      __typename?: 'Goal'
      id: string
      name: string
      description?: string | null
      successMeasures?: string | null
      photo?: string | null
      status: string
      location?: string | null
      time?: string | null
      createdAt: any
    }>
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
    photo?: string | null
    id: string
    providesResources: Array<{
      __typename?: 'Resource'
      name: string
      id: string
      description?: string | null
      status: string
      providedByPerson: Array<{
        __typename?: 'Person'
        name: string
        id: string
        photo?: string | null
      }>
    }>
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
    photo?: string | null
    coreValues: Array<{
      __typename?: 'CoreValue'
      id: string
      description?: string | null
      name: string
      people: Array<{
        __typename?: 'Person'
        id: string
        name: string
        photo?: string | null
      }>
    }>
  }>
}

export type GetResourceQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetResourceQuery = {
  __typename?: 'Query'
  resources: Array<{
    __typename?: 'Resource'
    id: string
    name: string
    description?: string | null
    status: string
    why?: string | null
    location?: string | null
    time?: string | null
    createdAt: any
    resources: Array<{ __typename?: 'Resource'; id: string; name: string }>
    carePoints: Array<{
      __typename?: 'CarePoint'
      id: string
      name: string
      description?: string | null
      status: string
    }>
    providedByPerson: Array<{
      __typename?: 'Person'
      id: string
      name: string
      email?: string | null
      phone?: string | null
      photo?: string | null
    }>
    goals: Array<{
      __typename?: 'Goal'
      id: string
      name: string
      description?: string | null
      createdAt: any
    }>
    providedByCommunity: Array<{
      __typename?: 'Community'
      name: string
      id: string
      description?: string | null
    }>
  }>
}

export type GetAllResourcesQueryVariables = Exact<{
  where?: InputMaybe<ResourceWhere>
}>

export type GetAllResourcesQuery = {
  __typename?: 'Query'
  resources: Array<{
    __typename?: 'Resource'
    id: string
    name: string
    description?: string | null
    status: string
    why?: string | null
    location?: string | null
    time?: string | null
    resources: Array<{ __typename?: 'Resource'; id: string; name: string }>
    carePoints: Array<{
      __typename?: 'CarePoint'
      id: string
      description?: string | null
      status: string
    }>
    providedByPerson: Array<{
      __typename?: 'Person'
      id: string
      name: string
      phone?: string | null
      photo?: string | null
    }>
  }>
}

export type GetMatchingEntitiesQueryVariables = Exact<{
  key: Scalars['String']['input']
}>

export type GetMatchingEntitiesQuery = {
  __typename?: 'Query'
  carePointSubstringSearch: Array<{
    __typename?: 'CarePoint'
    id: string
    description?: string | null
  }>
  communitySubstringSearch: Array<{
    __typename?: 'Community'
    id: string
    name: string
    description?: string | null
    members: Array<{ __typename?: 'Person'; photo?: string | null }>
  }>
  coreValueSubstringSearch: Array<{
    __typename?: 'CoreValue'
    description?: string | null
    id: string
    name: string
  }>
  peopleSubstringSearch: Array<{
    __typename?: 'Person'
    id: string
    name: string
    photo?: string | null
  }>
  resourceSubstringSearch: Array<{
    __typename?: 'Resource'
    name: string
    id: string
    description?: string | null
    status: string
    providedByPerson: Array<{
      __typename?: 'Person'
      name: string
      id: string
      photo?: string | null
    }>
  }>
  goalSubstringSearch: Array<{
    __typename?: 'Goal'
    id: string
    photo?: string | null
    description?: string | null
    name: string
    status: string
    createdAt: any
  }>
}

export const CreateCarePointsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createCarePoints' },
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
                  name: { kind: 'Name', value: 'CarePointCreateInput' },
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
            name: { kind: 'Name', value: 'createCarePoints' },
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
                  name: { kind: 'Name', value: 'carePoints' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'levelFulfilled' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'fulfillmentDate' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'successMeasures' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'issuesIdentified' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'issuesResolved' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resources' },
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
                        name: { kind: 'Name', value: 'enabledByGoals' },
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'caresForGoals' },
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resources' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
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
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'photo' },
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
  CreateCarePointsMutation,
  CreateCarePointsMutationVariables
>
export const UpdateCarePointDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCarePoint' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
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
              name: { kind: 'Name', value: 'CarePointUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCarePoints' },
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
                  name: { kind: 'Name', value: 'carePoints' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'levelFulfilled' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'fulfillmentDate' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'successMeasures' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'issuesIdentified' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'issuesResolved' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resources' },
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
                        name: { kind: 'Name', value: 'enabledByGoals' },
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'caresForGoals' },
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resources' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
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
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'photo' },
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
  UpdateCarePointMutation,
  UpdateCarePointMutationVariables
>
export const DeleteCarePointDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCarePoint' },
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
            name: { kind: 'Name', value: 'deleteCarePoints' },
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
  DeleteCarePointMutation,
  DeleteCarePointMutationVariables
>
export const SendMessageToChatbotDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SendMessageToChatbot' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'message' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'sessionId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sendMessageToChatbot' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'message' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'message' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sessionId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'sessionId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'sessionId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SendMessageToChatbotMutation,
  SendMessageToChatbotMutationVariables
>
export const CreateCommunitiesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateCommunities' },
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
                  name: { kind: 'Name', value: 'CommunityCreateInput' },
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
            name: { kind: 'Name', value: 'createCommunities' },
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
                  name: { kind: 'Name', value: 'communities' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'activities' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resultsAchieved' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
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
  CreateCommunitiesMutation,
  CreateCommunitiesMutationVariables
>
export const UpdateCommunityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateCommunity' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
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
              name: { kind: 'Name', value: 'CommunityUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCommunities' },
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
                  name: { kind: 'Name', value: 'communities' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'activities' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resultsAchieved' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'relatedCommunities' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'members' },
                              arguments: [
                                {
                                  kind: 'Argument',
                                  name: { kind: 'Name', value: 'limit' },
                                  value: { kind: 'IntValue', value: '5' },
                                },
                              ],
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
                                    name: { kind: 'Name', value: 'photo' },
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
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'photo' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'coreValues' },
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
                              name: { kind: 'Name', value: 'description' },
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
  UpdateCommunityMutation,
  UpdateCommunityMutationVariables
>
export const DeleteCommunityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCommunity' },
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
            name: { kind: 'Name', value: 'deleteCommunities' },
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
  DeleteCommunityMutation,
  DeleteCommunityMutationVariables
>
export const CreateCoreValuesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateCoreValues' },
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
                  name: { kind: 'Name', value: 'CoreValueCreateInput' },
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
            name: { kind: 'Name', value: 'createCoreValues' },
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
                  name: { kind: 'Name', value: 'coreValues' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'alignmentChallenges' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'alignmentExamples' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'why' } },
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
  CreateCoreValuesMutation,
  CreateCoreValuesMutationVariables
>
export const UpdateCoreValueDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCoreValue' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
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
              name: { kind: 'Name', value: 'CoreValueUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCoreValues' },
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
                  name: { kind: 'Name', value: 'coreValues' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'alignmentChallenges' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'alignmentExamples' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'people' },
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
                              name: { kind: 'Name', value: 'photo' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'goals' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
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
  UpdateCoreValueMutation,
  UpdateCoreValueMutationVariables
>
export const DeleteCoreValueDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCoreValue' },
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
            name: { kind: 'Name', value: 'deleteCoreValues' },
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
  DeleteCoreValueMutation,
  DeleteCoreValueMutationVariables
>
export const CreateGoalsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createGoals' },
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
                  name: { kind: 'Name', value: 'GoalCreateInput' },
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
            name: { kind: 'Name', value: 'createGoals' },
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
                  name: { kind: 'Name', value: 'goals' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'successMeasures' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'coreValues' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'motivatesPeople' },
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'motivatesCommunities' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enablesCarePoints' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'caredForByCarePoints' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
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
} as unknown as DocumentNode<CreateGoalsMutation, CreateGoalsMutationVariables>
export const UpdateGoalDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateGoal' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
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
              name: { kind: 'Name', value: 'GoalUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateGoals' },
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
                  name: { kind: 'Name', value: 'goals' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'successMeasures' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'coreValues' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'motivatesPeople' },
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'motivatesCommunities' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'enablesCarePoints' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'caredForByCarePoints' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resources' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
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
} as unknown as DocumentNode<UpdateGoalMutation, UpdateGoalMutationVariables>
export const DeleteGoalDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteGoal' },
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
            name: { kind: 'Name', value: 'deleteGoals' },
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
} as unknown as DocumentNode<DeleteGoalMutation, DeleteGoalMutationVariables>
export const GeneratePersonEmbeddingsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'GeneratePersonEmbeddings' },
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
            name: { kind: 'Name', value: 'generatePersonEmbeddings' },
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
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GeneratePersonEmbeddingsMutation,
  GeneratePersonEmbeddingsMutationVariables
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'firstName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pronouns' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pronouns' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'avatar' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'careManual' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'favorites' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'passions' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'traits' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'fieldsOfCare' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'interests' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'connectedTo' },
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'providesResources' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'goals' },
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdAt' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'carePoints' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'coreValues' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'communitiesConnection' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'edges' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'node' },
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
                                            value: 'members',
                                          },
                                          arguments: [
                                            {
                                              kind: 'Argument',
                                              name: {
                                                kind: 'Name',
                                                value: 'limit',
                                              },
                                              value: {
                                                kind: 'IntValue',
                                                value: '3',
                                              },
                                            },
                                          ],
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
                                                  value: 'photo',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'membersAggregate',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'count',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'description',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'properties' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'totem',
                                          },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'signupDate',
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
export const CreateResourcesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateResources' },
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
                  name: { kind: 'Name', value: 'ResourceCreateInput' },
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
            name: { kind: 'Name', value: 'createResources' },
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
                  name: { kind: 'Name', value: 'resources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resources' },
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
                        name: { kind: 'Name', value: 'goals' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'providedByPerson' },
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
  CreateResourcesMutation,
  CreateResourcesMutationVariables
>
export const UpdateResourceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateResource' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
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
              name: { kind: 'Name', value: 'ResourceUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateResources' },
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
                  name: { kind: 'Name', value: 'resources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'resources' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'goals' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'carePoints' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'providedByCommunity' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'members' },
                              arguments: [
                                {
                                  kind: 'Argument',
                                  name: { kind: 'Name', value: 'limit' },
                                  value: { kind: 'IntValue', value: '5' },
                                },
                              ],
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
                                    name: { kind: 'Name', value: 'photo' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'providedByPerson' },
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
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'phone' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'photo' },
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
  UpdateResourceMutation,
  UpdateResourceMutationVariables
>
export const DeleteResourceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteResource' },
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
            name: { kind: 'Name', value: 'deleteResources' },
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
  DeleteResourceMutation,
  DeleteResourceMutationVariables
>
export const GetRecentActionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getRecentActions' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'carePoints' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sort' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'createdAt' },
                      value: { kind: 'EnumValue', value: 'DESC' },
                    },
                  ],
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '3' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: { kind: 'ObjectValue', fields: [] },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createdBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'goals' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sort' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'createdAt' },
                      value: { kind: 'EnumValue', value: 'DESC' },
                    },
                  ],
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '3' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createdBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resources' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '3' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sort' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'createdAt' },
                      value: { kind: 'EnumValue', value: 'DESC' },
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
                  name: { kind: 'Name', value: 'providedByPerson' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'coreValues' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '3' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sort' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'createdAt' },
                      value: { kind: 'EnumValue', value: 'DESC' },
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
                  name: { kind: 'Name', value: 'people' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
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
                      name: { kind: 'Name', value: 'members_SOME' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'NOT' },
                            value: { kind: 'NullValue' },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '3' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sort' },
                value: { kind: 'ObjectValue', fields: [] },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'limit' },
                      value: { kind: 'IntValue', value: '3' },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'sort' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'createdAt' },
                            value: { kind: 'EnumValue', value: 'DESC' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
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
  GetRecentActionsQuery,
  GetRecentActionsQueryVariables
>
export const GetCarePointDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getCarePoint' },
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
            name: { kind: 'Name', value: 'carePoints' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'levelFulfilled' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fulfillmentDate' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'successMeasures' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'issuesIdentified' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'issuesResolved' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'enabledByGoals' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'caresForGoals' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createdBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
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
} as unknown as DocumentNode<GetCarePointQuery, GetCarePointQueryVariables>
export const GetAllCarePointsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAllCarePoints' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'CarePointWhere' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'carePoints' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createdBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'enabledByGoals' },
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
  GetAllCarePointsQuery,
  GetAllCarePointsQueryVariables
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
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                { kind: 'Field', name: { kind: 'Name', value: 'activities' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resultsAchieved' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'relatedCommunities' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'members' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'limit' },
                            value: { kind: 'IntValue', value: '5' },
                          },
                        ],
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
                              name: { kind: 'Name', value: 'photo' },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'providedByPerson' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'limit' },
                            value: { kind: 'IntValue', value: '1' },
                          },
                        ],
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createdBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'coreValues' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                { kind: 'Field', name: { kind: 'Name', value: 'activities' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resultsAchieved' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createdBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'relatedCommunities' },
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
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'members_SOME' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'NOT' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'id_EQ' },
                                  value: {
                                    kind: 'StringValue',
                                    value: '',
                                    block: false,
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
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
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
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'communitiesAggregate' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'count_EQ' },
                            value: { kind: 'IntValue', value: '0' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
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
export const GetCoreValueDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getCoreValue' },
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
            name: { kind: 'Name', value: 'coreValues' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'alignmentChallenges' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'alignmentExamples' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'people' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'goals' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createdBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
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
} as unknown as DocumentNode<GetCoreValueQuery, GetCoreValueQueryVariables>
export const GetAllCoreValuesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAllCoreValues' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'CoreValueWhere' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'coreValues' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'alignmentChallenges' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'alignmentExamples' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createdBy' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'people' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'goals' },
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
                  name: { kind: 'Name', value: 'communities' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'goals' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
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
  GetAllCoreValuesQuery,
  GetAllCoreValuesQueryVariables
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
                { kind: 'Field', name: { kind: 'Name', value: 'authId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'connectedTo' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
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
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'photo' },
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
export const GetGoalDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getGoal' },
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
            name: { kind: 'Name', value: 'goals' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'successMeasures' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'coreValues' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'motivatesPeople' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'motivatesCommunities' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
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
                  name: { kind: 'Name', value: 'enablesCarePoints' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'caredForByCarePoints' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
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
} as unknown as DocumentNode<GetGoalQuery, GetGoalQueryVariables>
export const GetAllGoalsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAllGoals' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'GoalWhere' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'goals' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'successMeasures' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'motivatesPeople' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
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
} as unknown as DocumentNode<GetAllGoalsQuery, GetAllGoalsQueryVariables>
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
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pronouns' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avatar' } },
                { kind: 'Field', name: { kind: 'Name', value: 'careManual' } },
                { kind: 'Field', name: { kind: 'Name', value: 'favorites' } },
                { kind: 'Field', name: { kind: 'Name', value: 'passions' } },
                { kind: 'Field', name: { kind: 'Name', value: 'traits' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fieldsOfCare' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'interests' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'connectedTo' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'providesResources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'goals' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'carePoints' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'coreValues' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'communitiesConnection' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'edges' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'node' },
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
                                      value: 'description',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'members' },
                                    arguments: [
                                      {
                                        kind: 'Argument',
                                        name: { kind: 'Name', value: 'limit' },
                                        value: { kind: 'IntValue', value: '3' },
                                      },
                                    ],
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
                                            value: 'photo',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'membersAggregate',
                                    },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'count',
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'description',
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'properties' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'totem' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'signupDate' },
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
} as unknown as DocumentNode<GetPersonQuery, GetPersonQueryVariables>
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
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pronouns' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'connectedTo' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'communities' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'goals' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'coreValues' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'providesResources' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'goals' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'limit' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'goalLimit' },
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
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'successMeasures' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'time' } },
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
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'providesResources_SOME' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'NOT' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'id_EQ' },
                                  value: {
                                    kind: 'StringValue',
                                    value: '',
                                    block: false,
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
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'providesResources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'providedByPerson' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'photo' },
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
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'coreValues_SOME' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'NOT' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'id_EQ' },
                                  value: {
                                    kind: 'StringValue',
                                    value: '',
                                    block: false,
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
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'coreValues' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'people' },
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
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
export const GetResourceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getResource' },
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
            name: { kind: 'Name', value: 'resources' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'carePoints' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'providedByPerson' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'goals' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'providedByCommunity' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
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
} as unknown as DocumentNode<GetResourceQuery, GetResourceQueryVariables>
export const GetAllResourcesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAllResources' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'ResourceWhere' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resources' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'why' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'time' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resources' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'carePoints' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'providedByPerson' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
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
  GetAllResourcesQuery,
  GetAllResourcesQueryVariables
>
export const GetMatchingEntitiesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getMatchingEntities' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'key' } },
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
            name: { kind: 'Name', value: 'carePointSubstringSearch' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'key' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'key' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'communitySubstringSearch' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'key' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'key' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'coreValueSubstringSearch' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'key' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'key' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'peopleSubstringSearch' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'key' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'key' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resourceSubstringSearch' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'key' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'key' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'providedByPerson' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'goalSubstringSearch' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'key' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'key' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'photo' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMatchingEntitiesQuery,
  GetMatchingEntitiesQueryVariables
>
