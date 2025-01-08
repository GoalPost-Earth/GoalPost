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
}

export type BelongsToCreateInput = {
  signupDate?: InputMaybe<Scalars['Date']['input']>
}

export type BelongsToSort = {
  signupDate?: InputMaybe<SortDirection>
}

export type BelongsToUpdateInput = {
  signupDate_SET?: InputMaybe<Scalars['Date']['input']>
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
  description: Scalars['String']['output']
  enabledByGoals: Array<Goal>
  enabledByGoalsAggregate?: Maybe<CarePointGoalEnabledByGoalsAggregationSelection>
  enabledByGoalsConnection: CarePointEnabledByGoalsConnection
  id: Scalars['ID']['output']
  resources: Array<Resource>
  resourcesAggregate?: Maybe<CarePointResourceResourcesAggregationSelection>
  resourcesConnection: CarePointResourcesConnection
  status: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
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
  id: IdAggregateSelection
  status: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
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
  description: Scalars['String']['input']
  enabledByGoals?: InputMaybe<CarePointEnabledByGoalsFieldInput>
  resources?: InputMaybe<CarePointResourcesFieldInput>
  status: Scalars['String']['input']
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
  id?: InputMaybe<SortDirection>
  status?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type CarePointUpdateInput = {
  caresForGoals?: InputMaybe<Array<CarePointCaresForGoalsUpdateFieldInput>>
  createdBy?: InputMaybe<Array<CarePointCreatedByUpdateFieldInput>>
  description_SET?: InputMaybe<Scalars['String']['input']>
  enabledByGoals?: InputMaybe<Array<CarePointEnabledByGoalsUpdateFieldInput>>
  resources?: InputMaybe<Array<CarePointResourcesUpdateFieldInput>>
  status_SET?: InputMaybe<Scalars['String']['input']>
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
  description_IN?: InputMaybe<Array<Scalars['String']['input']>>
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
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
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
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
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
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  createdByAggregate?: Maybe<CommunityPersonCreatedByAggregationSelection>
  createdByConnection: CommunityCreatedByConnection
  description?: Maybe<Scalars['String']['output']>
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
  status?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  why?: Maybe<Scalars['String']['output']>
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
  createdBy?: InputMaybe<Array<CommunityCreatedByConnectFieldInput>>
  members?: InputMaybe<Array<CommunityMembersConnectFieldInput>>
  relatedCommunities?: InputMaybe<
    Array<CommunityRelatedCommunitiesConnectFieldInput>
  >
  resources?: InputMaybe<Array<CommunityResourcesConnectFieldInput>>
}

export type CommunityConnectWhere = {
  node: CommunityWhere
}

export type CommunityCreateInput = {
  activities?: InputMaybe<Scalars['String']['input']>
  createdBy?: InputMaybe<CommunityCreatedByFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  location?: InputMaybe<Scalars['String']['input']>
  members?: InputMaybe<CommunityMembersFieldInput>
  name: Scalars['String']['input']
  relatedCommunities?: InputMaybe<CommunityRelatedCommunitiesFieldInput>
  resources?: InputMaybe<CommunityResourcesFieldInput>
  resultsAchieved?: InputMaybe<Scalars['String']['input']>
  status?: InputMaybe<Scalars['String']['input']>
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
  createdBy?: InputMaybe<Array<CommunityCreatedByDeleteFieldInput>>
  members?: InputMaybe<Array<CommunityMembersDeleteFieldInput>>
  relatedCommunities?: InputMaybe<
    Array<CommunityRelatedCommunitiesDeleteFieldInput>
  >
  resources?: InputMaybe<Array<CommunityResourcesDeleteFieldInput>>
}

export type CommunityDisconnectInput = {
  createdBy?: InputMaybe<Array<CommunityCreatedByDisconnectFieldInput>>
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
  createdBy?: InputMaybe<Array<CommunityCreatedByUpdateFieldInput>>
  description_SET?: InputMaybe<Scalars['String']['input']>
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
  status_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
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
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  createdByAggregate?: Maybe<CoreValuePersonCreatedByAggregationSelection>
  createdByConnection: CoreValueCreatedByConnection
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  isEmbracedBy: Array<Person>
  isEmbracedByAggregate?: Maybe<CoreValuePersonIsEmbracedByAggregationSelection>
  isEmbracedByConnection: CoreValueIsEmbracedByConnection
  name: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  whoSupports?: Maybe<Scalars['String']['output']>
  why?: Maybe<Scalars['String']['output']>
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

export type CoreValueIsEmbracedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type CoreValueIsEmbracedByAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type CoreValueIsEmbracedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueIsEmbracedByConnectionSort>>
  where?: InputMaybe<CoreValueIsEmbracedByConnectionWhere>
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
  whoSupports: StringAggregateSelection
  why: StringAggregateSelection
}

export type CoreValueConnectInput = {
  createdBy?: InputMaybe<Array<CoreValueCreatedByConnectFieldInput>>
  isEmbracedBy?: InputMaybe<Array<CoreValueIsEmbracedByConnectFieldInput>>
}

export type CoreValueConnectWhere = {
  node: CoreValueWhere
}

export type CoreValueCreateInput = {
  alignmentChallenges?: InputMaybe<Scalars['String']['input']>
  alignmentExamples?: InputMaybe<Scalars['String']['input']>
  createdBy?: InputMaybe<CoreValueCreatedByFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  isEmbracedBy?: InputMaybe<CoreValueIsEmbracedByFieldInput>
  name: Scalars['String']['input']
  whoSupports?: InputMaybe<Scalars['String']['input']>
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
  createdBy?: InputMaybe<Array<CoreValueCreatedByDeleteFieldInput>>
  isEmbracedBy?: InputMaybe<Array<CoreValueIsEmbracedByDeleteFieldInput>>
}

export type CoreValueDisconnectInput = {
  createdBy?: InputMaybe<Array<CoreValueCreatedByDisconnectFieldInput>>
  isEmbracedBy?: InputMaybe<Array<CoreValueIsEmbracedByDisconnectFieldInput>>
}

export type CoreValueEdge = {
  __typename?: 'CoreValueEdge'
  cursor: Scalars['String']['output']
  node: CoreValue
}

export type CoreValueIsEmbracedByAggregateInput = {
  AND?: InputMaybe<Array<CoreValueIsEmbracedByAggregateInput>>
  NOT?: InputMaybe<CoreValueIsEmbracedByAggregateInput>
  OR?: InputMaybe<Array<CoreValueIsEmbracedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CoreValueIsEmbracedByNodeAggregationWhereInput>
}

export type CoreValueIsEmbracedByConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type CoreValueIsEmbracedByConnection = {
  __typename?: 'CoreValueIsEmbracedByConnection'
  edges: Array<CoreValueIsEmbracedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CoreValueIsEmbracedByConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type CoreValueIsEmbracedByConnectionWhere = {
  AND?: InputMaybe<Array<CoreValueIsEmbracedByConnectionWhere>>
  NOT?: InputMaybe<CoreValueIsEmbracedByConnectionWhere>
  OR?: InputMaybe<Array<CoreValueIsEmbracedByConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type CoreValueIsEmbracedByCreateFieldInput = {
  node: PersonCreateInput
}

export type CoreValueIsEmbracedByDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<CoreValueIsEmbracedByConnectionWhere>
}

export type CoreValueIsEmbracedByDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<CoreValueIsEmbracedByConnectionWhere>
}

export type CoreValueIsEmbracedByFieldInput = {
  connect?: InputMaybe<Array<CoreValueIsEmbracedByConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueIsEmbracedByCreateFieldInput>>
}

export type CoreValueIsEmbracedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CoreValueIsEmbracedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<CoreValueIsEmbracedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CoreValueIsEmbracedByNodeAggregationWhereInput>>
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

export type CoreValueIsEmbracedByRelationship = {
  __typename?: 'CoreValueIsEmbracedByRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type CoreValueIsEmbracedByUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type CoreValueIsEmbracedByUpdateFieldInput = {
  connect?: InputMaybe<Array<CoreValueIsEmbracedByConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueIsEmbracedByCreateFieldInput>>
  delete?: InputMaybe<Array<CoreValueIsEmbracedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CoreValueIsEmbracedByDisconnectFieldInput>>
  update?: InputMaybe<CoreValueIsEmbracedByUpdateConnectionInput>
  where?: InputMaybe<CoreValueIsEmbracedByConnectionWhere>
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
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type CoreValuePersonIsEmbracedByAggregationSelection = {
  __typename?: 'CoreValuePersonIsEmbracedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CoreValuePersonIsEmbracedByNodeAggregateSelection>
}

export type CoreValuePersonIsEmbracedByNodeAggregateSelection = {
  __typename?: 'CoreValuePersonIsEmbracedByNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
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
  whoSupports?: InputMaybe<SortDirection>
  why?: InputMaybe<SortDirection>
}

export type CoreValueUpdateInput = {
  alignmentChallenges_SET?: InputMaybe<Scalars['String']['input']>
  alignmentExamples_SET?: InputMaybe<Scalars['String']['input']>
  createdBy?: InputMaybe<Array<CoreValueCreatedByUpdateFieldInput>>
  description_SET?: InputMaybe<Scalars['String']['input']>
  isEmbracedBy?: InputMaybe<Array<CoreValueIsEmbracedByUpdateFieldInput>>
  name_SET?: InputMaybe<Scalars['String']['input']>
  whoSupports_SET?: InputMaybe<Scalars['String']['input']>
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
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  isEmbracedByAggregate?: InputMaybe<CoreValueIsEmbracedByAggregateInput>
  /** Return CoreValues where all of the related CoreValueIsEmbracedByConnections match this filter */
  isEmbracedByConnection_ALL?: InputMaybe<CoreValueIsEmbracedByConnectionWhere>
  /** Return CoreValues where none of the related CoreValueIsEmbracedByConnections match this filter */
  isEmbracedByConnection_NONE?: InputMaybe<CoreValueIsEmbracedByConnectionWhere>
  /** Return CoreValues where one of the related CoreValueIsEmbracedByConnections match this filter */
  isEmbracedByConnection_SINGLE?: InputMaybe<CoreValueIsEmbracedByConnectionWhere>
  /** Return CoreValues where some of the related CoreValueIsEmbracedByConnections match this filter */
  isEmbracedByConnection_SOME?: InputMaybe<CoreValueIsEmbracedByConnectionWhere>
  /** Return CoreValues where all of the related People match this filter */
  isEmbracedBy_ALL?: InputMaybe<PersonWhere>
  /** Return CoreValues where none of the related People match this filter */
  isEmbracedBy_NONE?: InputMaybe<PersonWhere>
  /** Return CoreValues where one of the related People match this filter */
  isEmbracedBy_SINGLE?: InputMaybe<PersonWhere>
  /** Return CoreValues where some of the related People match this filter */
  isEmbracedBy_SOME?: InputMaybe<PersonWhere>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_EQ?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  whoSupports_CONTAINS?: InputMaybe<Scalars['String']['input']>
  whoSupports_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  whoSupports_EQ?: InputMaybe<Scalars['String']['input']>
  whoSupports_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  whoSupports_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Person>
  createdByAggregate?: Maybe<GoalPersonCreatedByAggregationSelection>
  createdByConnection: GoalCreatedByConnection
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  location?: Maybe<Scalars['String']['output']>
  motivatesPeople: Array<Person>
  motivatesPeopleAggregate?: Maybe<GoalPersonMotivatesPeopleAggregationSelection>
  motivatesPeopleConnection: GoalMotivatesPeopleConnection
  name: Scalars['String']['output']
  photo?: Maybe<Scalars['String']['output']>
  status: Scalars['String']['output']
  successMeasures?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
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
}

export type GoalConnectInput = {
  createdBy?: InputMaybe<Array<GoalCreatedByConnectFieldInput>>
  motivatesPeople?: InputMaybe<Array<GoalMotivatesPeopleConnectFieldInput>>
}

export type GoalConnectWhere = {
  node: GoalWhere
}

export type GoalCreateInput = {
  activities?: InputMaybe<Scalars['String']['input']>
  createdBy?: InputMaybe<GoalCreatedByFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  location?: InputMaybe<Scalars['String']['input']>
  motivatesPeople?: InputMaybe<GoalMotivatesPeopleFieldInput>
  name: Scalars['String']['input']
  photo?: InputMaybe<Scalars['String']['input']>
  status: Scalars['String']['input']
  successMeasures?: InputMaybe<Scalars['String']['input']>
  time?: InputMaybe<Scalars['String']['input']>
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
  createdBy?: InputMaybe<Array<GoalCreatedByDeleteFieldInput>>
  motivatesPeople?: InputMaybe<Array<GoalMotivatesPeopleDeleteFieldInput>>
}

export type GoalDisconnectInput = {
  createdBy?: InputMaybe<Array<GoalCreatedByDisconnectFieldInput>>
  motivatesPeople?: InputMaybe<Array<GoalMotivatesPeopleDisconnectFieldInput>>
}

export type GoalEdge = {
  __typename?: 'GoalEdge'
  cursor: Scalars['String']['output']
  node: Goal
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
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
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
}

export type GoalUpdateInput = {
  activities_SET?: InputMaybe<Scalars['String']['input']>
  createdBy?: InputMaybe<Array<GoalCreatedByUpdateFieldInput>>
  description_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  motivatesPeople?: InputMaybe<Array<GoalMotivatesPeopleUpdateFieldInput>>
  name_SET?: InputMaybe<Scalars['String']['input']>
  photo_SET?: InputMaybe<Scalars['String']['input']>
  status_SET?: InputMaybe<Scalars['String']['input']>
  successMeasures_SET?: InputMaybe<Scalars['String']['input']>
  time_SET?: InputMaybe<Scalars['String']['input']>
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
  communities: Array<Community>
  communitiesAggregate?: Maybe<PersonCommunityCommunitiesAggregationSelection>
  communitiesConnection: PersonCommunitiesConnection
  connectedTo: Array<Person>
  connectedToAggregate?: Maybe<PersonPersonConnectedToAggregationSelection>
  connectedToConnection: PersonConnectedToConnection
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

export type PersonConnectedToArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type PersonConnectedToAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type PersonConnectedToConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonConnectedToConnectionSort>>
  where?: InputMaybe<PersonConnectedToConnectionWhere>
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
  node?: Maybe<PersonCommunityCommunitiesNodeAggregateSelection>
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
  connectedTo?: InputMaybe<Array<PersonConnectedToConnectFieldInput>>
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

export type PersonConnectedToAggregateInput = {
  AND?: InputMaybe<Array<PersonConnectedToAggregateInput>>
  NOT?: InputMaybe<PersonConnectedToAggregateInput>
  OR?: InputMaybe<Array<PersonConnectedToAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<PersonConnectedToNodeAggregationWhereInput>
}

export type PersonConnectedToConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type PersonConnectedToConnection = {
  __typename?: 'PersonConnectedToConnection'
  edges: Array<PersonConnectedToRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonConnectedToConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type PersonConnectedToConnectionWhere = {
  AND?: InputMaybe<Array<PersonConnectedToConnectionWhere>>
  NOT?: InputMaybe<PersonConnectedToConnectionWhere>
  OR?: InputMaybe<Array<PersonConnectedToConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type PersonConnectedToCreateFieldInput = {
  node: PersonCreateInput
}

export type PersonConnectedToDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<PersonConnectedToConnectionWhere>
}

export type PersonConnectedToDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<PersonConnectedToConnectionWhere>
}

export type PersonConnectedToFieldInput = {
  connect?: InputMaybe<Array<PersonConnectedToConnectFieldInput>>
  create?: InputMaybe<Array<PersonConnectedToCreateFieldInput>>
}

export type PersonConnectedToNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonConnectedToNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonConnectedToNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonConnectedToNodeAggregationWhereInput>>
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

export type PersonConnectedToRelationship = {
  __typename?: 'PersonConnectedToRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type PersonConnectedToUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type PersonConnectedToUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonConnectedToConnectFieldInput>>
  create?: InputMaybe<Array<PersonConnectedToCreateFieldInput>>
  delete?: InputMaybe<Array<PersonConnectedToDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonConnectedToDisconnectFieldInput>>
  update?: InputMaybe<PersonConnectedToUpdateConnectionInput>
  where?: InputMaybe<PersonConnectedToConnectionWhere>
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
  whoSupports: StringAggregateSelection
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
  whoSupports_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  whoSupports_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  whoSupports_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  whoSupports_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  whoSupports_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  whoSupports_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whoSupports_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whoSupports_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whoSupports_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whoSupports_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whoSupports_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whoSupports_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whoSupports_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whoSupports_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whoSupports_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  communities?: InputMaybe<PersonCommunitiesFieldInput>
  connectedTo?: InputMaybe<PersonConnectedToFieldInput>
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
  connectedTo?: InputMaybe<Array<PersonConnectedToDeleteFieldInput>>
  coreValues?: InputMaybe<Array<PersonCoreValuesDeleteFieldInput>>
  createdBy?: InputMaybe<Array<PersonCreatedByDeleteFieldInput>>
  goals?: InputMaybe<Array<PersonGoalsDeleteFieldInput>>
  providesResources?: InputMaybe<Array<PersonProvidesResourcesDeleteFieldInput>>
}

export type PersonDisconnectInput = {
  communities?: InputMaybe<Array<PersonCommunitiesDisconnectFieldInput>>
  connectedTo?: InputMaybe<Array<PersonConnectedToDisconnectFieldInput>>
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

export type PersonPersonConnectedToAggregationSelection = {
  __typename?: 'PersonPersonConnectedToAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<PersonPersonConnectedToNodeAggregateSelection>
}

export type PersonPersonConnectedToNodeAggregateSelection = {
  __typename?: 'PersonPersonConnectedToNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
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
  traits?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type PersonUpdateInput = {
  authId_SET?: InputMaybe<Scalars['String']['input']>
  avatar_SET?: InputMaybe<Scalars['String']['input']>
  communities?: InputMaybe<Array<PersonCommunitiesUpdateFieldInput>>
  connectedTo?: InputMaybe<Array<PersonConnectedToUpdateFieldInput>>
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
  connectedToAggregate?: InputMaybe<PersonConnectedToAggregateInput>
  /** Return People where all of the related PersonConnectedToConnections match this filter */
  connectedToConnection_ALL?: InputMaybe<PersonConnectedToConnectionWhere>
  /** Return People where none of the related PersonConnectedToConnections match this filter */
  connectedToConnection_NONE?: InputMaybe<PersonConnectedToConnectionWhere>
  /** Return People where one of the related PersonConnectedToConnections match this filter */
  connectedToConnection_SINGLE?: InputMaybe<PersonConnectedToConnectionWhere>
  /** Return People where some of the related PersonConnectedToConnections match this filter */
  connectedToConnection_SOME?: InputMaybe<PersonConnectedToConnectionWhere>
  /** Return People where all of the related People match this filter */
  connectedTo_ALL?: InputMaybe<PersonWhere>
  /** Return People where none of the related People match this filter */
  connectedTo_NONE?: InputMaybe<PersonWhere>
  /** Return People where one of the related People match this filter */
  connectedTo_SINGLE?: InputMaybe<PersonWhere>
  /** Return People where some of the related People match this filter */
  connectedTo_SOME?: InputMaybe<PersonWhere>
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
  dependsOnResources: Array<Resource>
  dependsOnResourcesAggregate?: Maybe<ResourceResourceDependsOnResourcesAggregationSelection>
  dependsOnResourcesConnection: ResourceDependsOnResourcesConnection
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  location?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  providedByPerson: Array<Person>
  providedByPersonAggregate?: Maybe<ResourcePersonProvidedByPersonAggregationSelection>
  providedByPersonConnection: ResourceProvidedByPersonConnection
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

export type ResourceDependsOnResourcesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type ResourceDependsOnResourcesAggregateArgs = {
  where?: InputMaybe<ResourceWhere>
}

export type ResourceDependsOnResourcesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceDependsOnResourcesConnectionSort>>
  where?: InputMaybe<ResourceDependsOnResourcesConnectionWhere>
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
  id: IdAggregateSelection
  status: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
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

export type ResourceConnectInput = {
  carePoints?: InputMaybe<Array<ResourceCarePointsConnectFieldInput>>
  createdBy?: InputMaybe<Array<ResourceCreatedByConnectFieldInput>>
  dependsOnResources?: InputMaybe<
    Array<ResourceDependsOnResourcesConnectFieldInput>
  >
  providedByPerson?: InputMaybe<
    Array<ResourceProvidedByPersonConnectFieldInput>
  >
}

export type ResourceConnectWhere = {
  node: ResourceWhere
}

export type ResourceCreateInput = {
  carePoints?: InputMaybe<ResourceCarePointsFieldInput>
  createdBy?: InputMaybe<ResourceCreatedByFieldInput>
  dependsOnResources?: InputMaybe<ResourceDependsOnResourcesFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  location?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  providedByPerson?: InputMaybe<ResourceProvidedByPersonFieldInput>
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
  dependsOnResources?: InputMaybe<
    Array<ResourceDependsOnResourcesDeleteFieldInput>
  >
  providedByPerson?: InputMaybe<Array<ResourceProvidedByPersonDeleteFieldInput>>
}

export type ResourceDependsOnResourcesAggregateInput = {
  AND?: InputMaybe<Array<ResourceDependsOnResourcesAggregateInput>>
  NOT?: InputMaybe<ResourceDependsOnResourcesAggregateInput>
  OR?: InputMaybe<Array<ResourceDependsOnResourcesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourceDependsOnResourcesNodeAggregationWhereInput>
}

export type ResourceDependsOnResourcesConnectFieldInput = {
  connect?: InputMaybe<Array<ResourceConnectInput>>
  where?: InputMaybe<ResourceConnectWhere>
}

export type ResourceDependsOnResourcesConnection = {
  __typename?: 'ResourceDependsOnResourcesConnection'
  edges: Array<ResourceDependsOnResourcesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResourceDependsOnResourcesConnectionSort = {
  node?: InputMaybe<ResourceSort>
}

export type ResourceDependsOnResourcesConnectionWhere = {
  AND?: InputMaybe<Array<ResourceDependsOnResourcesConnectionWhere>>
  NOT?: InputMaybe<ResourceDependsOnResourcesConnectionWhere>
  OR?: InputMaybe<Array<ResourceDependsOnResourcesConnectionWhere>>
  node?: InputMaybe<ResourceWhere>
}

export type ResourceDependsOnResourcesCreateFieldInput = {
  node: ResourceCreateInput
}

export type ResourceDependsOnResourcesDeleteFieldInput = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<ResourceDependsOnResourcesConnectionWhere>
}

export type ResourceDependsOnResourcesDisconnectFieldInput = {
  disconnect?: InputMaybe<ResourceDisconnectInput>
  where?: InputMaybe<ResourceDependsOnResourcesConnectionWhere>
}

export type ResourceDependsOnResourcesFieldInput = {
  connect?: InputMaybe<Array<ResourceDependsOnResourcesConnectFieldInput>>
  create?: InputMaybe<Array<ResourceDependsOnResourcesCreateFieldInput>>
}

export type ResourceDependsOnResourcesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourceDependsOnResourcesNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourceDependsOnResourcesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourceDependsOnResourcesNodeAggregationWhereInput>>
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

export type ResourceDependsOnResourcesRelationship = {
  __typename?: 'ResourceDependsOnResourcesRelationship'
  cursor: Scalars['String']['output']
  node: Resource
}

export type ResourceDependsOnResourcesUpdateConnectionInput = {
  node?: InputMaybe<ResourceUpdateInput>
}

export type ResourceDependsOnResourcesUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourceDependsOnResourcesConnectFieldInput>>
  create?: InputMaybe<Array<ResourceDependsOnResourcesCreateFieldInput>>
  delete?: InputMaybe<Array<ResourceDependsOnResourcesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResourceDependsOnResourcesDisconnectFieldInput>>
  update?: InputMaybe<ResourceDependsOnResourcesUpdateConnectionInput>
  where?: InputMaybe<ResourceDependsOnResourcesConnectionWhere>
}

export type ResourceDisconnectInput = {
  carePoints?: InputMaybe<Array<ResourceCarePointsDisconnectFieldInput>>
  createdBy?: InputMaybe<Array<ResourceCreatedByDisconnectFieldInput>>
  dependsOnResources?: InputMaybe<
    Array<ResourceDependsOnResourcesDisconnectFieldInput>
  >
  providedByPerson?: InputMaybe<
    Array<ResourceProvidedByPersonDisconnectFieldInput>
  >
}

export type ResourceEdge = {
  __typename?: 'ResourceEdge'
  cursor: Scalars['String']['output']
  node: Resource
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
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
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

export type ResourceResourceDependsOnResourcesAggregationSelection = {
  __typename?: 'ResourceResourceDependsOnResourcesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourceResourceDependsOnResourcesNodeAggregateSelection>
}

export type ResourceResourceDependsOnResourcesNodeAggregateSelection = {
  __typename?: 'ResourceResourceDependsOnResourcesNodeAggregateSelection'
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
  dependsOnResources?: InputMaybe<
    Array<ResourceDependsOnResourcesUpdateFieldInput>
  >
  description_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  name_SET?: InputMaybe<Scalars['String']['input']>
  providedByPerson?: InputMaybe<Array<ResourceProvidedByPersonUpdateFieldInput>>
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
  dependsOnResourcesAggregate?: InputMaybe<ResourceDependsOnResourcesAggregateInput>
  /** Return Resources where all of the related ResourceDependsOnResourcesConnections match this filter */
  dependsOnResourcesConnection_ALL?: InputMaybe<ResourceDependsOnResourcesConnectionWhere>
  /** Return Resources where none of the related ResourceDependsOnResourcesConnections match this filter */
  dependsOnResourcesConnection_NONE?: InputMaybe<ResourceDependsOnResourcesConnectionWhere>
  /** Return Resources where one of the related ResourceDependsOnResourcesConnections match this filter */
  dependsOnResourcesConnection_SINGLE?: InputMaybe<ResourceDependsOnResourcesConnectionWhere>
  /** Return Resources where some of the related ResourceDependsOnResourcesConnections match this filter */
  dependsOnResourcesConnection_SOME?: InputMaybe<ResourceDependsOnResourcesConnectionWhere>
  /** Return Resources where all of the related Resources match this filter */
  dependsOnResources_ALL?: InputMaybe<ResourceWhere>
  /** Return Resources where none of the related Resources match this filter */
  dependsOnResources_NONE?: InputMaybe<ResourceWhere>
  /** Return Resources where one of the related Resources match this filter */
  dependsOnResources_SINGLE?: InputMaybe<ResourceWhere>
  /** Return Resources where some of the related Resources match this filter */
  dependsOnResources_SOME?: InputMaybe<ResourceWhere>
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
      status?: string | null
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
      status?: string | null
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
      whoSupports?: string | null
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
      whoSupports?: string | null
      alignmentChallenges?: string | null
      alignmentExamples?: string | null
      description?: string | null
      why?: string | null
      createdAt: any
    }>
  }
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
    }>
  }
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
      email?: string | null
      phone?: string | null
      photo?: string | null
      location?: string | null
      pronouns?: string | null
    }>
  }
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
      dependsOnResources: Array<{
        __typename?: 'Resource'
        id: string
        name: string
      }>
      carePoints: Array<{ __typename?: 'CarePoint'; id: string }>
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
      dependsOnResources: Array<{
        __typename?: 'Resource'
        id: string
        name: string
      }>
      carePoints: Array<{ __typename?: 'CarePoint'; id: string }>
    }>
  }
}

export type GetRecentActionsQueryVariables = Exact<{ [key: string]: never }>

export type GetRecentActionsQuery = {
  __typename?: 'Query'
  carePoints: Array<{
    __typename?: 'CarePoint'
    createdAt: any
    description: string
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
    isEmbracedBy: Array<{
      __typename?: 'Person'
      name: string
      id: string
      photo?: string | null
    }>
  }>
  communities: Array<{
    __typename?: 'Community'
    name: string
    members: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
      createdAt: any
    }>
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
    status?: string | null
    createdBy: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
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
    status?: string | null
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
    whoSupports?: string | null
    alignmentChallenges?: string | null
    alignmentExamples?: string | null
    description?: string | null
    why?: string | null
    isEmbracedBy: Array<{ __typename?: 'Person'; id: string; name: string }>
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
    whoSupports?: string | null
    alignmentChallenges?: string | null
    alignmentExamples?: string | null
    description?: string | null
    why?: string | null
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
    motivatesPeople: Array<{
      __typename?: 'Person'
      id: string
      name: string
      photo?: string | null
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
    location?: string | null
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
      description?: string | null
      members: Array<{ __typename?: 'Person'; photo?: string | null }>
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
    firstName: string
    lastName: string
    name: string
    email?: string | null
    photo?: string | null
    phone?: string | null
    pronouns?: string | null
    location?: string | null
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
    dependsOnResources: Array<{
      __typename?: 'Resource'
      id: string
      name: string
    }>
    carePoints: Array<{ __typename?: 'CarePoint'; id: string }>
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
    dependsOnResources: Array<{
      __typename?: 'Resource'
      id: string
      name: string
    }>
    carePoints: Array<{ __typename?: 'CarePoint'; id: string }>
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
    description: string
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
    id: string
    name: string
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
                        name: { kind: 'Name', value: 'whoSupports' },
                      },
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
                        name: { kind: 'Name', value: 'whoSupports' },
                      },
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
  UpdateCoreValueMutation,
  UpdateCoreValueMutationVariables
>
export const CreateGoalsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateGoals' },
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
      name: { kind: 'Name', value: 'UpdateGoal' },
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
  UpdatePersonMutation,
  UpdatePersonMutationVariables
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
                        name: { kind: 'Name', value: 'dependsOnResources' },
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
                        name: { kind: 'Name', value: 'carePoints' },
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
                        name: { kind: 'Name', value: 'dependsOnResources' },
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
                        name: { kind: 'Name', value: 'carePoints' },
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
} as unknown as DocumentNode<
  UpdateResourceMutation,
  UpdateResourceMutationVariables
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
                  name: { kind: 'Name', value: 'isEmbracedBy' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'whoSupports' } },
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
                  name: { kind: 'Name', value: 'isEmbracedBy' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'whoSupports' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
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
                              name: { kind: 'Name', value: 'photo' },
                            },
                          ],
                        },
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
                  name: { kind: 'Name', value: 'dependsOnResources' },
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
                  name: { kind: 'Name', value: 'dependsOnResources' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
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
