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

export type Area = {
  __typename?: 'Area'
  city: Scalars['String']['output']
  country: Scalars['String']['output']
  createdAt: Scalars['DateTime']['output']
  distance: Scalars['Float']['output']
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  region: Scalars['String']['output']
  state: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type AreaAggregateSelection = {
  __typename?: 'AreaAggregateSelection'
  city: StringAggregateSelection
  count: Scalars['Int']['output']
  country: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  distance: FloatAggregateSelection
  id: IdAggregateSelection
  name: StringAggregateSelection
  region: StringAggregateSelection
  state: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type AreaCreateInput = {
  city: Scalars['String']['input']
  country: Scalars['String']['input']
  distance: Scalars['Float']['input']
  name: Scalars['String']['input']
  region: Scalars['String']['input']
  state: Scalars['String']['input']
}

export type AreaEdge = {
  __typename?: 'AreaEdge'
  cursor: Scalars['String']['output']
  node: Area
}

/** Fields to sort Areas by. The order in which sorts are applied is not guaranteed when specifying many fields in one AreaSort object. */
export type AreaSort = {
  city?: InputMaybe<SortDirection>
  country?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  distance?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  region?: InputMaybe<SortDirection>
  state?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type AreaUpdateInput = {
  city_SET?: InputMaybe<Scalars['String']['input']>
  country_SET?: InputMaybe<Scalars['String']['input']>
  distance_ADD?: InputMaybe<Scalars['Float']['input']>
  distance_DIVIDE?: InputMaybe<Scalars['Float']['input']>
  distance_MULTIPLY?: InputMaybe<Scalars['Float']['input']>
  distance_SET?: InputMaybe<Scalars['Float']['input']>
  distance_SUBTRACT?: InputMaybe<Scalars['Float']['input']>
  name_SET?: InputMaybe<Scalars['String']['input']>
  region_SET?: InputMaybe<Scalars['String']['input']>
  state_SET?: InputMaybe<Scalars['String']['input']>
}

export type AreaWhere = {
  AND?: InputMaybe<Array<AreaWhere>>
  NOT?: InputMaybe<AreaWhere>
  OR?: InputMaybe<Array<AreaWhere>>
  city_CONTAINS?: InputMaybe<Scalars['String']['input']>
  city_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  city_EQ?: InputMaybe<Scalars['String']['input']>
  city_IN?: InputMaybe<Array<Scalars['String']['input']>>
  city_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  country_CONTAINS?: InputMaybe<Scalars['String']['input']>
  country_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  country_EQ?: InputMaybe<Scalars['String']['input']>
  country_IN?: InputMaybe<Array<Scalars['String']['input']>>
  country_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  distance_EQ?: InputMaybe<Scalars['Float']['input']>
  distance_GT?: InputMaybe<Scalars['Float']['input']>
  distance_GTE?: InputMaybe<Scalars['Float']['input']>
  distance_IN?: InputMaybe<Array<Scalars['Float']['input']>>
  distance_LT?: InputMaybe<Scalars['Float']['input']>
  distance_LTE?: InputMaybe<Scalars['Float']['input']>
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
  region_CONTAINS?: InputMaybe<Scalars['String']['input']>
  region_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  region_EQ?: InputMaybe<Scalars['String']['input']>
  region_IN?: InputMaybe<Array<Scalars['String']['input']>>
  region_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  state_CONTAINS?: InputMaybe<Scalars['String']['input']>
  state_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  state_EQ?: InputMaybe<Scalars['String']['input']>
  state_IN?: InputMaybe<Array<Scalars['String']['input']>>
  state_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type AreasConnection = {
  __typename?: 'AreasConnection'
  edges: Array<AreaEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CarePoint = {
  __typename?: 'CarePoint'
  caresForGoals: Array<Goal>
  caresForGoalsAggregate?: Maybe<CarePointGoalCaresForGoalsAggregationSelection>
  caresForGoalsConnection: CarePointCaresForGoalsConnection
  createdAt: Scalars['DateTime']['output']
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
  type_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  type_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  type_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  type_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  type_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  type_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  type_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  type_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  type_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  type_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  type_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  type_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  type_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  type_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  type_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  enabledByGoals?: InputMaybe<Array<CarePointEnabledByGoalsConnectFieldInput>>
  resources?: InputMaybe<Array<CarePointResourcesConnectFieldInput>>
}

export type CarePointConnectWhere = {
  node: CarePointWhere
}

export type CarePointCreateInput = {
  caresForGoals?: InputMaybe<CarePointCaresForGoalsFieldInput>
  description: Scalars['String']['input']
  enabledByGoals?: InputMaybe<CarePointEnabledByGoalsFieldInput>
  resources?: InputMaybe<CarePointResourcesFieldInput>
  status: Scalars['String']['input']
}

export type CarePointDeleteInput = {
  caresForGoals?: InputMaybe<Array<CarePointCaresForGoalsDeleteFieldInput>>
  enabledByGoals?: InputMaybe<Array<CarePointEnabledByGoalsDeleteFieldInput>>
  resources?: InputMaybe<Array<CarePointResourcesDeleteFieldInput>>
}

export type CarePointDisconnectInput = {
  caresForGoals?: InputMaybe<Array<CarePointCaresForGoalsDisconnectFieldInput>>
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
  type_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  type_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  type_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  type_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  type_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  type_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  type_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  type_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  type_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  type_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  type_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  type_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  type_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  type_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  type_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  type: StringAggregateSelection
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
  type: StringAggregateSelection
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
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  location?: Maybe<Scalars['String']['output']>
  members: Array<Member>
  membersAggregate?: Maybe<CommunityMemberMembersAggregationSelection>
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

export type CommunityMembersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberSort>>
  where?: InputMaybe<MemberWhere>
}

export type CommunityMembersAggregateArgs = {
  where?: InputMaybe<MemberWhere>
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

export type CommunityDeleteInput = {
  members?: InputMaybe<Array<CommunityMembersDeleteFieldInput>>
  relatedCommunities?: InputMaybe<
    Array<CommunityRelatedCommunitiesDeleteFieldInput>
  >
  resources?: InputMaybe<Array<CommunityResourcesDeleteFieldInput>>
}

export type CommunityDisconnectInput = {
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

export type CommunityMemberMembersAggregationSelection = {
  __typename?: 'CommunityMemberMembersAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunityMemberMembersNodeAggregateSelection>
}

export type CommunityMemberMembersNodeAggregateSelection = {
  __typename?: 'CommunityMemberMembersNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  circles: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favourites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  gender: StringAggregateSelection
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
  connect?: InputMaybe<Array<MemberConnectInput>>
  where?: InputMaybe<MemberConnectWhere>
}

export type CommunityMembersConnection = {
  __typename?: 'CommunityMembersConnection'
  edges: Array<CommunityMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityMembersConnectionSort = {
  node?: InputMaybe<MemberSort>
}

export type CommunityMembersConnectionWhere = {
  AND?: InputMaybe<Array<CommunityMembersConnectionWhere>>
  NOT?: InputMaybe<CommunityMembersConnectionWhere>
  OR?: InputMaybe<Array<CommunityMembersConnectionWhere>>
  node?: InputMaybe<MemberWhere>
}

export type CommunityMembersCreateFieldInput = {
  node: MemberCreateInput
}

export type CommunityMembersDeleteFieldInput = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<CommunityMembersConnectionWhere>
}

export type CommunityMembersDisconnectFieldInput = {
  disconnect?: InputMaybe<MemberDisconnectInput>
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
  circles_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  circles_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favourites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favourites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  gender_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  gender_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  node: Member
}

export type CommunityMembersUpdateConnectionInput = {
  node?: InputMaybe<MemberUpdateInput>
}

export type CommunityMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityMembersConnectFieldInput>>
  create?: InputMaybe<Array<CommunityMembersCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CommunityMembersDisconnectFieldInput>>
  update?: InputMaybe<CommunityMembersUpdateConnectionInput>
  where?: InputMaybe<CommunityMembersConnectionWhere>
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
  /** Return Communities where all of the related Members match this filter */
  members_ALL?: InputMaybe<MemberWhere>
  /** Return Communities where none of the related Members match this filter */
  members_NONE?: InputMaybe<MemberWhere>
  /** Return Communities where one of the related Members match this filter */
  members_SINGLE?: InputMaybe<MemberWhere>
  /** Return Communities where some of the related Members match this filter */
  members_SOME?: InputMaybe<MemberWhere>
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
  description?: Maybe<Scalars['String']['output']>
  guidesPeople: Array<Member>
  guidesPeopleAggregate?: Maybe<CoreValueMemberGuidesPeopleAggregationSelection>
  guidesPeopleConnection: CoreValueGuidesPeopleConnection
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  whoSupports?: Maybe<Scalars['String']['output']>
  why?: Maybe<Scalars['String']['output']>
}

export type CoreValueGuidesPeopleArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberSort>>
  where?: InputMaybe<MemberWhere>
}

export type CoreValueGuidesPeopleAggregateArgs = {
  where?: InputMaybe<MemberWhere>
}

export type CoreValueGuidesPeopleConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueGuidesPeopleConnectionSort>>
  where?: InputMaybe<CoreValueGuidesPeopleConnectionWhere>
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
  guidesPeople?: InputMaybe<Array<CoreValueGuidesPeopleConnectFieldInput>>
}

export type CoreValueConnectWhere = {
  node: CoreValueWhere
}

export type CoreValueCreateInput = {
  alignmentChallenges?: InputMaybe<Scalars['String']['input']>
  alignmentExamples?: InputMaybe<Scalars['String']['input']>
  description?: InputMaybe<Scalars['String']['input']>
  guidesPeople?: InputMaybe<CoreValueGuidesPeopleFieldInput>
  name: Scalars['String']['input']
  whoSupports?: InputMaybe<Scalars['String']['input']>
  why?: InputMaybe<Scalars['String']['input']>
}

export type CoreValueDeleteInput = {
  guidesPeople?: InputMaybe<Array<CoreValueGuidesPeopleDeleteFieldInput>>
}

export type CoreValueDisconnectInput = {
  guidesPeople?: InputMaybe<Array<CoreValueGuidesPeopleDisconnectFieldInput>>
}

export type CoreValueEdge = {
  __typename?: 'CoreValueEdge'
  cursor: Scalars['String']['output']
  node: CoreValue
}

export type CoreValueGuidesPeopleAggregateInput = {
  AND?: InputMaybe<Array<CoreValueGuidesPeopleAggregateInput>>
  NOT?: InputMaybe<CoreValueGuidesPeopleAggregateInput>
  OR?: InputMaybe<Array<CoreValueGuidesPeopleAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CoreValueGuidesPeopleNodeAggregationWhereInput>
}

export type CoreValueGuidesPeopleConnectFieldInput = {
  connect?: InputMaybe<Array<MemberConnectInput>>
  where?: InputMaybe<MemberConnectWhere>
}

export type CoreValueGuidesPeopleConnection = {
  __typename?: 'CoreValueGuidesPeopleConnection'
  edges: Array<CoreValueGuidesPeopleRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CoreValueGuidesPeopleConnectionSort = {
  node?: InputMaybe<MemberSort>
}

export type CoreValueGuidesPeopleConnectionWhere = {
  AND?: InputMaybe<Array<CoreValueGuidesPeopleConnectionWhere>>
  NOT?: InputMaybe<CoreValueGuidesPeopleConnectionWhere>
  OR?: InputMaybe<Array<CoreValueGuidesPeopleConnectionWhere>>
  node?: InputMaybe<MemberWhere>
}

export type CoreValueGuidesPeopleCreateFieldInput = {
  node: MemberCreateInput
}

export type CoreValueGuidesPeopleDeleteFieldInput = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<CoreValueGuidesPeopleConnectionWhere>
}

export type CoreValueGuidesPeopleDisconnectFieldInput = {
  disconnect?: InputMaybe<MemberDisconnectInput>
  where?: InputMaybe<CoreValueGuidesPeopleConnectionWhere>
}

export type CoreValueGuidesPeopleFieldInput = {
  connect?: InputMaybe<Array<CoreValueGuidesPeopleConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueGuidesPeopleCreateFieldInput>>
}

export type CoreValueGuidesPeopleNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CoreValueGuidesPeopleNodeAggregationWhereInput>>
  NOT?: InputMaybe<CoreValueGuidesPeopleNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CoreValueGuidesPeopleNodeAggregationWhereInput>>
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
  circles_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  circles_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favourites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favourites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  gender_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  gender_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type CoreValueGuidesPeopleRelationship = {
  __typename?: 'CoreValueGuidesPeopleRelationship'
  cursor: Scalars['String']['output']
  node: Member
}

export type CoreValueGuidesPeopleUpdateConnectionInput = {
  node?: InputMaybe<MemberUpdateInput>
}

export type CoreValueGuidesPeopleUpdateFieldInput = {
  connect?: InputMaybe<Array<CoreValueGuidesPeopleConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueGuidesPeopleCreateFieldInput>>
  delete?: InputMaybe<Array<CoreValueGuidesPeopleDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CoreValueGuidesPeopleDisconnectFieldInput>>
  update?: InputMaybe<CoreValueGuidesPeopleUpdateConnectionInput>
  where?: InputMaybe<CoreValueGuidesPeopleConnectionWhere>
}

export type CoreValueMemberGuidesPeopleAggregationSelection = {
  __typename?: 'CoreValueMemberGuidesPeopleAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CoreValueMemberGuidesPeopleNodeAggregateSelection>
}

export type CoreValueMemberGuidesPeopleNodeAggregateSelection = {
  __typename?: 'CoreValueMemberGuidesPeopleNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  circles: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favourites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  gender: StringAggregateSelection
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
  whoSupports?: InputMaybe<SortDirection>
  why?: InputMaybe<SortDirection>
}

export type CoreValueUpdateInput = {
  alignmentChallenges_SET?: InputMaybe<Scalars['String']['input']>
  alignmentExamples_SET?: InputMaybe<Scalars['String']['input']>
  description_SET?: InputMaybe<Scalars['String']['input']>
  guidesPeople?: InputMaybe<Array<CoreValueGuidesPeopleUpdateFieldInput>>
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
  description_CONTAINS?: InputMaybe<Scalars['String']['input']>
  description_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  description_EQ?: InputMaybe<Scalars['String']['input']>
  description_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  description_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  guidesPeopleAggregate?: InputMaybe<CoreValueGuidesPeopleAggregateInput>
  /** Return CoreValues where all of the related CoreValueGuidesPeopleConnections match this filter */
  guidesPeopleConnection_ALL?: InputMaybe<CoreValueGuidesPeopleConnectionWhere>
  /** Return CoreValues where none of the related CoreValueGuidesPeopleConnections match this filter */
  guidesPeopleConnection_NONE?: InputMaybe<CoreValueGuidesPeopleConnectionWhere>
  /** Return CoreValues where one of the related CoreValueGuidesPeopleConnections match this filter */
  guidesPeopleConnection_SINGLE?: InputMaybe<CoreValueGuidesPeopleConnectionWhere>
  /** Return CoreValues where some of the related CoreValueGuidesPeopleConnections match this filter */
  guidesPeopleConnection_SOME?: InputMaybe<CoreValueGuidesPeopleConnectionWhere>
  /** Return CoreValues where all of the related Members match this filter */
  guidesPeople_ALL?: InputMaybe<MemberWhere>
  /** Return CoreValues where none of the related Members match this filter */
  guidesPeople_NONE?: InputMaybe<MemberWhere>
  /** Return CoreValues where one of the related Members match this filter */
  guidesPeople_SINGLE?: InputMaybe<MemberWhere>
  /** Return CoreValues where some of the related Members match this filter */
  guidesPeople_SOME?: InputMaybe<MemberWhere>
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

export type CreateAreasMutationResponse = {
  __typename?: 'CreateAreasMutationResponse'
  areas: Array<Area>
  info: CreateInfo
}

export type CreateCarePointsMutationResponse = {
  __typename?: 'CreateCarePointsMutationResponse'
  carePoints: Array<CarePoint>
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

export type CreateMembersMutationResponse = {
  __typename?: 'CreateMembersMutationResponse'
  info: CreateInfo
  members: Array<Member>
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

export type FloatAggregateSelection = {
  __typename?: 'FloatAggregateSelection'
  average?: Maybe<Scalars['Float']['output']>
  max?: Maybe<Scalars['Float']['output']>
  min?: Maybe<Scalars['Float']['output']>
  sum?: Maybe<Scalars['Float']['output']>
}

export type Goal = {
  __typename?: 'Goal'
  activities?: Maybe<Scalars['String']['output']>
  createdAt: Scalars['DateTime']['output']
  createdBy: Array<Member>
  createdByAggregate?: Maybe<GoalMemberCreatedByAggregationSelection>
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
  type: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type GoalCreatedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberSort>>
  where?: InputMaybe<MemberWhere>
}

export type GoalCreatedByAggregateArgs = {
  where?: InputMaybe<MemberWhere>
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
  type: StringAggregateSelection
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
  type: Scalars['String']['input']
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
  connect?: InputMaybe<Array<MemberConnectInput>>
  where?: InputMaybe<MemberConnectWhere>
}

export type GoalCreatedByConnection = {
  __typename?: 'GoalCreatedByConnection'
  edges: Array<GoalCreatedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GoalCreatedByConnectionSort = {
  node?: InputMaybe<MemberSort>
}

export type GoalCreatedByConnectionWhere = {
  AND?: InputMaybe<Array<GoalCreatedByConnectionWhere>>
  NOT?: InputMaybe<GoalCreatedByConnectionWhere>
  OR?: InputMaybe<Array<GoalCreatedByConnectionWhere>>
  node?: InputMaybe<MemberWhere>
}

export type GoalCreatedByCreateFieldInput = {
  node: MemberCreateInput
}

export type GoalCreatedByDeleteFieldInput = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<GoalCreatedByConnectionWhere>
}

export type GoalCreatedByDisconnectFieldInput = {
  disconnect?: InputMaybe<MemberDisconnectInput>
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
  circles_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  circles_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  circles_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  circles_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  circles_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  favourites_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  favourites_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  favourites_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favourites_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  favourites_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  gender_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  gender_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  node: Member
}

export type GoalCreatedByUpdateConnectionInput = {
  node?: InputMaybe<MemberUpdateInput>
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

export type GoalMemberCreatedByAggregationSelection = {
  __typename?: 'GoalMemberCreatedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalMemberCreatedByNodeAggregateSelection>
}

export type GoalMemberCreatedByNodeAggregateSelection = {
  __typename?: 'GoalMemberCreatedByNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  circles: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favourites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  gender: StringAggregateSelection
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
  where?: InputMaybe<GoalMotivatesPeopleConnectionWhere>
}

export type GoalMotivatesPeopleDisconnectFieldInput = {
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
  gender_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  gender_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type GoalPersonMotivatesPeopleAggregationSelection = {
  __typename?: 'GoalPersonMotivatesPeopleAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalPersonMotivatesPeopleNodeAggregateSelection>
}

export type GoalPersonMotivatesPeopleNodeAggregateSelection = {
  __typename?: 'GoalPersonMotivatesPeopleNodeAggregateSelection'
  authId: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  firstName: StringAggregateSelection
  gender: StringAggregateSelection
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
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
  type?: InputMaybe<SortDirection>
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
  type_SET?: InputMaybe<Scalars['String']['input']>
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
  /** Return Goals where all of the related Members match this filter */
  createdBy_ALL?: InputMaybe<MemberWhere>
  /** Return Goals where none of the related Members match this filter */
  createdBy_NONE?: InputMaybe<MemberWhere>
  /** Return Goals where one of the related Members match this filter */
  createdBy_SINGLE?: InputMaybe<MemberWhere>
  /** Return Goals where some of the related Members match this filter */
  createdBy_SOME?: InputMaybe<MemberWhere>
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
  type_CONTAINS?: InputMaybe<Scalars['String']['input']>
  type_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  type_EQ?: InputMaybe<Scalars['String']['input']>
  type_IN?: InputMaybe<Array<Scalars['String']['input']>>
  type_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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

export type Member = PersonInterface & {
  __typename?: 'Member'
  authId?: Maybe<Scalars['String']['output']>
  avatar?: Maybe<Scalars['String']['output']>
  careManual?: Maybe<Scalars['String']['output']>
  circles?: Maybe<Scalars['String']['output']>
  communities: Array<Community>
  communitiesAggregate?: Maybe<MemberCommunityCommunitiesAggregationSelection>
  communitiesConnection: MemberCommunitiesConnection
  connectedTo: Array<Person>
  connectedToAggregate?: Maybe<MemberPersonConnectedToAggregationSelection>
  connectedToConnection: MemberConnectedToConnection
  coreValues: Array<CoreValue>
  coreValuesAggregate?: Maybe<MemberCoreValueCoreValuesAggregationSelection>
  coreValuesConnection: MemberCoreValuesConnection
  createdAt: Scalars['DateTime']['output']
  email?: Maybe<Scalars['String']['output']>
  favourites?: Maybe<Scalars['String']['output']>
  fieldsOfCare?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  gender?: Maybe<Scalars['String']['output']>
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
  providesResourcesAggregate?: Maybe<MemberResourceProvidesResourcesAggregationSelection>
  providesResourcesConnection: MemberProvidesResourcesConnection
  signupDate: Scalars['Date']['output']
  status: Scalars['String']['output']
  traits?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type MemberCommunitiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunitySort>>
  where?: InputMaybe<CommunityWhere>
}

export type MemberCommunitiesAggregateArgs = {
  where?: InputMaybe<CommunityWhere>
}

export type MemberCommunitiesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberCommunitiesConnectionSort>>
  where?: InputMaybe<MemberCommunitiesConnectionWhere>
}

export type MemberConnectedToArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type MemberConnectedToAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type MemberConnectedToConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberConnectedToConnectionSort>>
  where?: InputMaybe<MemberConnectedToConnectionWhere>
}

export type MemberCoreValuesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueSort>>
  where?: InputMaybe<CoreValueWhere>
}

export type MemberCoreValuesAggregateArgs = {
  where?: InputMaybe<CoreValueWhere>
}

export type MemberCoreValuesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberCoreValuesConnectionSort>>
  where?: InputMaybe<MemberCoreValuesConnectionWhere>
}

export type MemberProvidesResourcesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type MemberProvidesResourcesAggregateArgs = {
  where?: InputMaybe<ResourceWhere>
}

export type MemberProvidesResourcesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberProvidesResourcesConnectionSort>>
  where?: InputMaybe<MemberProvidesResourcesConnectionWhere>
}

export type MemberAggregateSelection = {
  __typename?: 'MemberAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
  careManual: StringAggregateSelection
  circles: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  favourites: StringAggregateSelection
  fieldsOfCare: StringAggregateSelection
  firstName: StringAggregateSelection
  gender: StringAggregateSelection
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

export type MemberCommunitiesAggregateInput = {
  AND?: InputMaybe<Array<MemberCommunitiesAggregateInput>>
  NOT?: InputMaybe<MemberCommunitiesAggregateInput>
  OR?: InputMaybe<Array<MemberCommunitiesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberCommunitiesNodeAggregationWhereInput>
}

export type MemberCommunitiesConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type MemberCommunitiesConnection = {
  __typename?: 'MemberCommunitiesConnection'
  edges: Array<MemberCommunitiesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberCommunitiesConnectionSort = {
  node?: InputMaybe<CommunitySort>
}

export type MemberCommunitiesConnectionWhere = {
  AND?: InputMaybe<Array<MemberCommunitiesConnectionWhere>>
  NOT?: InputMaybe<MemberCommunitiesConnectionWhere>
  OR?: InputMaybe<Array<MemberCommunitiesConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type MemberCommunitiesCreateFieldInput = {
  node: CommunityCreateInput
}

export type MemberCommunitiesDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<MemberCommunitiesConnectionWhere>
}

export type MemberCommunitiesDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<MemberCommunitiesConnectionWhere>
}

export type MemberCommunitiesFieldInput = {
  connect?: InputMaybe<Array<MemberCommunitiesConnectFieldInput>>
  create?: InputMaybe<Array<MemberCommunitiesCreateFieldInput>>
}

export type MemberCommunitiesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberCommunitiesNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberCommunitiesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberCommunitiesNodeAggregationWhereInput>>
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

export type MemberCommunitiesRelationship = {
  __typename?: 'MemberCommunitiesRelationship'
  cursor: Scalars['String']['output']
  node: Community
}

export type MemberCommunitiesUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
}

export type MemberCommunitiesUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberCommunitiesConnectFieldInput>>
  create?: InputMaybe<Array<MemberCommunitiesCreateFieldInput>>
  delete?: InputMaybe<Array<MemberCommunitiesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberCommunitiesDisconnectFieldInput>>
  update?: InputMaybe<MemberCommunitiesUpdateConnectionInput>
  where?: InputMaybe<MemberCommunitiesConnectionWhere>
}

export type MemberCommunityCommunitiesAggregationSelection = {
  __typename?: 'MemberCommunityCommunitiesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberCommunityCommunitiesNodeAggregateSelection>
}

export type MemberCommunityCommunitiesNodeAggregateSelection = {
  __typename?: 'MemberCommunityCommunitiesNodeAggregateSelection'
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

export type MemberConnectInput = {
  communities?: InputMaybe<Array<MemberCommunitiesConnectFieldInput>>
  connectedTo?: InputMaybe<Array<MemberConnectedToConnectFieldInput>>
  coreValues?: InputMaybe<Array<MemberCoreValuesConnectFieldInput>>
  providesResources?: InputMaybe<
    Array<MemberProvidesResourcesConnectFieldInput>
  >
}

export type MemberConnectWhere = {
  node: MemberWhere
}

export type MemberConnectedToAggregateInput = {
  AND?: InputMaybe<Array<MemberConnectedToAggregateInput>>
  NOT?: InputMaybe<MemberConnectedToAggregateInput>
  OR?: InputMaybe<Array<MemberConnectedToAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberConnectedToNodeAggregationWhereInput>
}

export type MemberConnectedToConnectFieldInput = {
  where?: InputMaybe<PersonConnectWhere>
}

export type MemberConnectedToConnection = {
  __typename?: 'MemberConnectedToConnection'
  edges: Array<MemberConnectedToRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberConnectedToConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type MemberConnectedToConnectionWhere = {
  AND?: InputMaybe<Array<MemberConnectedToConnectionWhere>>
  NOT?: InputMaybe<MemberConnectedToConnectionWhere>
  OR?: InputMaybe<Array<MemberConnectedToConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type MemberConnectedToCreateFieldInput = {
  node: PersonCreateInput
}

export type MemberConnectedToDeleteFieldInput = {
  where?: InputMaybe<MemberConnectedToConnectionWhere>
}

export type MemberConnectedToDisconnectFieldInput = {
  where?: InputMaybe<MemberConnectedToConnectionWhere>
}

export type MemberConnectedToFieldInput = {
  connect?: InputMaybe<Array<MemberConnectedToConnectFieldInput>>
  create?: InputMaybe<Array<MemberConnectedToCreateFieldInput>>
}

export type MemberConnectedToNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberConnectedToNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberConnectedToNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberConnectedToNodeAggregationWhereInput>>
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
  gender_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  gender_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type MemberConnectedToRelationship = {
  __typename?: 'MemberConnectedToRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type MemberConnectedToUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type MemberConnectedToUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberConnectedToConnectFieldInput>>
  create?: InputMaybe<Array<MemberConnectedToCreateFieldInput>>
  delete?: InputMaybe<Array<MemberConnectedToDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberConnectedToDisconnectFieldInput>>
  update?: InputMaybe<MemberConnectedToUpdateConnectionInput>
  where?: InputMaybe<MemberConnectedToConnectionWhere>
}

export type MemberCoreValueCoreValuesAggregationSelection = {
  __typename?: 'MemberCoreValueCoreValuesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberCoreValueCoreValuesNodeAggregateSelection>
}

export type MemberCoreValueCoreValuesNodeAggregateSelection = {
  __typename?: 'MemberCoreValueCoreValuesNodeAggregateSelection'
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

export type MemberCoreValuesAggregateInput = {
  AND?: InputMaybe<Array<MemberCoreValuesAggregateInput>>
  NOT?: InputMaybe<MemberCoreValuesAggregateInput>
  OR?: InputMaybe<Array<MemberCoreValuesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberCoreValuesNodeAggregationWhereInput>
}

export type MemberCoreValuesConnectFieldInput = {
  connect?: InputMaybe<Array<CoreValueConnectInput>>
  where?: InputMaybe<CoreValueConnectWhere>
}

export type MemberCoreValuesConnection = {
  __typename?: 'MemberCoreValuesConnection'
  edges: Array<MemberCoreValuesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberCoreValuesConnectionSort = {
  node?: InputMaybe<CoreValueSort>
}

export type MemberCoreValuesConnectionWhere = {
  AND?: InputMaybe<Array<MemberCoreValuesConnectionWhere>>
  NOT?: InputMaybe<MemberCoreValuesConnectionWhere>
  OR?: InputMaybe<Array<MemberCoreValuesConnectionWhere>>
  node?: InputMaybe<CoreValueWhere>
}

export type MemberCoreValuesCreateFieldInput = {
  node: CoreValueCreateInput
}

export type MemberCoreValuesDeleteFieldInput = {
  delete?: InputMaybe<CoreValueDeleteInput>
  where?: InputMaybe<MemberCoreValuesConnectionWhere>
}

export type MemberCoreValuesDisconnectFieldInput = {
  disconnect?: InputMaybe<CoreValueDisconnectInput>
  where?: InputMaybe<MemberCoreValuesConnectionWhere>
}

export type MemberCoreValuesFieldInput = {
  connect?: InputMaybe<Array<MemberCoreValuesConnectFieldInput>>
  create?: InputMaybe<Array<MemberCoreValuesCreateFieldInput>>
}

export type MemberCoreValuesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberCoreValuesNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberCoreValuesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberCoreValuesNodeAggregationWhereInput>>
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

export type MemberCoreValuesRelationship = {
  __typename?: 'MemberCoreValuesRelationship'
  cursor: Scalars['String']['output']
  node: CoreValue
}

export type MemberCoreValuesUpdateConnectionInput = {
  node?: InputMaybe<CoreValueUpdateInput>
}

export type MemberCoreValuesUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberCoreValuesConnectFieldInput>>
  create?: InputMaybe<Array<MemberCoreValuesCreateFieldInput>>
  delete?: InputMaybe<Array<MemberCoreValuesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberCoreValuesDisconnectFieldInput>>
  update?: InputMaybe<MemberCoreValuesUpdateConnectionInput>
  where?: InputMaybe<MemberCoreValuesConnectionWhere>
}

export type MemberCreateInput = {
  authId?: InputMaybe<Scalars['String']['input']>
  avatar?: InputMaybe<Scalars['String']['input']>
  careManual?: InputMaybe<Scalars['String']['input']>
  circles?: InputMaybe<Scalars['String']['input']>
  communities?: InputMaybe<MemberCommunitiesFieldInput>
  connectedTo?: InputMaybe<MemberConnectedToFieldInput>
  coreValues?: InputMaybe<MemberCoreValuesFieldInput>
  email?: InputMaybe<Scalars['String']['input']>
  favourites?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare?: InputMaybe<Scalars['String']['input']>
  firstName: Scalars['String']['input']
  gender?: InputMaybe<Scalars['String']['input']>
  interests?: InputMaybe<Scalars['String']['input']>
  lastName: Scalars['String']['input']
  location?: InputMaybe<Scalars['String']['input']>
  passions?: InputMaybe<Scalars['String']['input']>
  phone?: InputMaybe<Scalars['String']['input']>
  photo?: InputMaybe<Scalars['String']['input']>
  pronouns?: InputMaybe<Scalars['String']['input']>
  providesResources?: InputMaybe<MemberProvidesResourcesFieldInput>
  signupDate: Scalars['Date']['input']
  status: Scalars['String']['input']
  traits?: InputMaybe<Scalars['String']['input']>
}

export type MemberDeleteInput = {
  communities?: InputMaybe<Array<MemberCommunitiesDeleteFieldInput>>
  connectedTo?: InputMaybe<Array<MemberConnectedToDeleteFieldInput>>
  coreValues?: InputMaybe<Array<MemberCoreValuesDeleteFieldInput>>
  providesResources?: InputMaybe<Array<MemberProvidesResourcesDeleteFieldInput>>
}

export type MemberDisconnectInput = {
  communities?: InputMaybe<Array<MemberCommunitiesDisconnectFieldInput>>
  connectedTo?: InputMaybe<Array<MemberConnectedToDisconnectFieldInput>>
  coreValues?: InputMaybe<Array<MemberCoreValuesDisconnectFieldInput>>
  providesResources?: InputMaybe<
    Array<MemberProvidesResourcesDisconnectFieldInput>
  >
}

export type MemberEdge = {
  __typename?: 'MemberEdge'
  cursor: Scalars['String']['output']
  node: Member
}

export type MemberPersonConnectedToAggregationSelection = {
  __typename?: 'MemberPersonConnectedToAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberPersonConnectedToNodeAggregateSelection>
}

export type MemberPersonConnectedToNodeAggregateSelection = {
  __typename?: 'MemberPersonConnectedToNodeAggregateSelection'
  authId: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  firstName: StringAggregateSelection
  gender: StringAggregateSelection
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type MemberProvidesResourcesAggregateInput = {
  AND?: InputMaybe<Array<MemberProvidesResourcesAggregateInput>>
  NOT?: InputMaybe<MemberProvidesResourcesAggregateInput>
  OR?: InputMaybe<Array<MemberProvidesResourcesAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberProvidesResourcesNodeAggregationWhereInput>
}

export type MemberProvidesResourcesConnectFieldInput = {
  connect?: InputMaybe<Array<ResourceConnectInput>>
  where?: InputMaybe<ResourceConnectWhere>
}

export type MemberProvidesResourcesConnection = {
  __typename?: 'MemberProvidesResourcesConnection'
  edges: Array<MemberProvidesResourcesRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberProvidesResourcesConnectionSort = {
  node?: InputMaybe<ResourceSort>
}

export type MemberProvidesResourcesConnectionWhere = {
  AND?: InputMaybe<Array<MemberProvidesResourcesConnectionWhere>>
  NOT?: InputMaybe<MemberProvidesResourcesConnectionWhere>
  OR?: InputMaybe<Array<MemberProvidesResourcesConnectionWhere>>
  node?: InputMaybe<ResourceWhere>
}

export type MemberProvidesResourcesCreateFieldInput = {
  node: ResourceCreateInput
}

export type MemberProvidesResourcesDeleteFieldInput = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<MemberProvidesResourcesConnectionWhere>
}

export type MemberProvidesResourcesDisconnectFieldInput = {
  disconnect?: InputMaybe<ResourceDisconnectInput>
  where?: InputMaybe<MemberProvidesResourcesConnectionWhere>
}

export type MemberProvidesResourcesFieldInput = {
  connect?: InputMaybe<Array<MemberProvidesResourcesConnectFieldInput>>
  create?: InputMaybe<Array<MemberProvidesResourcesCreateFieldInput>>
}

export type MemberProvidesResourcesNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberProvidesResourcesNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberProvidesResourcesNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberProvidesResourcesNodeAggregationWhereInput>>
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

export type MemberProvidesResourcesRelationship = {
  __typename?: 'MemberProvidesResourcesRelationship'
  cursor: Scalars['String']['output']
  node: Resource
}

export type MemberProvidesResourcesUpdateConnectionInput = {
  node?: InputMaybe<ResourceUpdateInput>
}

export type MemberProvidesResourcesUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberProvidesResourcesConnectFieldInput>>
  create?: InputMaybe<Array<MemberProvidesResourcesCreateFieldInput>>
  delete?: InputMaybe<Array<MemberProvidesResourcesDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberProvidesResourcesDisconnectFieldInput>>
  update?: InputMaybe<MemberProvidesResourcesUpdateConnectionInput>
  where?: InputMaybe<MemberProvidesResourcesConnectionWhere>
}

export type MemberResourceProvidesResourcesAggregationSelection = {
  __typename?: 'MemberResourceProvidesResourcesAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberResourceProvidesResourcesNodeAggregateSelection>
}

export type MemberResourceProvidesResourcesNodeAggregateSelection = {
  __typename?: 'MemberResourceProvidesResourcesNodeAggregateSelection'
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

/** Fields to sort Members by. The order in which sorts are applied is not guaranteed when specifying many fields in one MemberSort object. */
export type MemberSort = {
  authId?: InputMaybe<SortDirection>
  avatar?: InputMaybe<SortDirection>
  careManual?: InputMaybe<SortDirection>
  circles?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  email?: InputMaybe<SortDirection>
  favourites?: InputMaybe<SortDirection>
  fieldsOfCare?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  gender?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  interests?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  passions?: InputMaybe<SortDirection>
  phone?: InputMaybe<SortDirection>
  photo?: InputMaybe<SortDirection>
  pronouns?: InputMaybe<SortDirection>
  signupDate?: InputMaybe<SortDirection>
  status?: InputMaybe<SortDirection>
  traits?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type MemberUpdateInput = {
  authId_SET?: InputMaybe<Scalars['String']['input']>
  avatar_SET?: InputMaybe<Scalars['String']['input']>
  careManual_SET?: InputMaybe<Scalars['String']['input']>
  circles_SET?: InputMaybe<Scalars['String']['input']>
  communities?: InputMaybe<Array<MemberCommunitiesUpdateFieldInput>>
  connectedTo?: InputMaybe<Array<MemberConnectedToUpdateFieldInput>>
  coreValues?: InputMaybe<Array<MemberCoreValuesUpdateFieldInput>>
  email_SET?: InputMaybe<Scalars['String']['input']>
  favourites_SET?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_SET?: InputMaybe<Scalars['String']['input']>
  firstName_SET?: InputMaybe<Scalars['String']['input']>
  gender_SET?: InputMaybe<Scalars['String']['input']>
  interests_SET?: InputMaybe<Scalars['String']['input']>
  lastName_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  passions_SET?: InputMaybe<Scalars['String']['input']>
  phone_SET?: InputMaybe<Scalars['String']['input']>
  photo_SET?: InputMaybe<Scalars['String']['input']>
  pronouns_SET?: InputMaybe<Scalars['String']['input']>
  providesResources?: InputMaybe<Array<MemberProvidesResourcesUpdateFieldInput>>
  signupDate_SET?: InputMaybe<Scalars['Date']['input']>
  status_SET?: InputMaybe<Scalars['String']['input']>
  traits_SET?: InputMaybe<Scalars['String']['input']>
}

export type MemberWhere = {
  AND?: InputMaybe<Array<MemberWhere>>
  NOT?: InputMaybe<MemberWhere>
  OR?: InputMaybe<Array<MemberWhere>>
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
  circles_CONTAINS?: InputMaybe<Scalars['String']['input']>
  circles_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  circles_EQ?: InputMaybe<Scalars['String']['input']>
  circles_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  circles_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  communitiesAggregate?: InputMaybe<MemberCommunitiesAggregateInput>
  /** Return Members where all of the related MemberCommunitiesConnections match this filter */
  communitiesConnection_ALL?: InputMaybe<MemberCommunitiesConnectionWhere>
  /** Return Members where none of the related MemberCommunitiesConnections match this filter */
  communitiesConnection_NONE?: InputMaybe<MemberCommunitiesConnectionWhere>
  /** Return Members where one of the related MemberCommunitiesConnections match this filter */
  communitiesConnection_SINGLE?: InputMaybe<MemberCommunitiesConnectionWhere>
  /** Return Members where some of the related MemberCommunitiesConnections match this filter */
  communitiesConnection_SOME?: InputMaybe<MemberCommunitiesConnectionWhere>
  /** Return Members where all of the related Communities match this filter */
  communities_ALL?: InputMaybe<CommunityWhere>
  /** Return Members where none of the related Communities match this filter */
  communities_NONE?: InputMaybe<CommunityWhere>
  /** Return Members where one of the related Communities match this filter */
  communities_SINGLE?: InputMaybe<CommunityWhere>
  /** Return Members where some of the related Communities match this filter */
  communities_SOME?: InputMaybe<CommunityWhere>
  connectedToAggregate?: InputMaybe<MemberConnectedToAggregateInput>
  /** Return Members where all of the related MemberConnectedToConnections match this filter */
  connectedToConnection_ALL?: InputMaybe<MemberConnectedToConnectionWhere>
  /** Return Members where none of the related MemberConnectedToConnections match this filter */
  connectedToConnection_NONE?: InputMaybe<MemberConnectedToConnectionWhere>
  /** Return Members where one of the related MemberConnectedToConnections match this filter */
  connectedToConnection_SINGLE?: InputMaybe<MemberConnectedToConnectionWhere>
  /** Return Members where some of the related MemberConnectedToConnections match this filter */
  connectedToConnection_SOME?: InputMaybe<MemberConnectedToConnectionWhere>
  /** Return Members where all of the related People match this filter */
  connectedTo_ALL?: InputMaybe<PersonWhere>
  /** Return Members where none of the related People match this filter */
  connectedTo_NONE?: InputMaybe<PersonWhere>
  /** Return Members where one of the related People match this filter */
  connectedTo_SINGLE?: InputMaybe<PersonWhere>
  /** Return Members where some of the related People match this filter */
  connectedTo_SOME?: InputMaybe<PersonWhere>
  coreValuesAggregate?: InputMaybe<MemberCoreValuesAggregateInput>
  /** Return Members where all of the related MemberCoreValuesConnections match this filter */
  coreValuesConnection_ALL?: InputMaybe<MemberCoreValuesConnectionWhere>
  /** Return Members where none of the related MemberCoreValuesConnections match this filter */
  coreValuesConnection_NONE?: InputMaybe<MemberCoreValuesConnectionWhere>
  /** Return Members where one of the related MemberCoreValuesConnections match this filter */
  coreValuesConnection_SINGLE?: InputMaybe<MemberCoreValuesConnectionWhere>
  /** Return Members where some of the related MemberCoreValuesConnections match this filter */
  coreValuesConnection_SOME?: InputMaybe<MemberCoreValuesConnectionWhere>
  /** Return Members where all of the related CoreValues match this filter */
  coreValues_ALL?: InputMaybe<CoreValueWhere>
  /** Return Members where none of the related CoreValues match this filter */
  coreValues_NONE?: InputMaybe<CoreValueWhere>
  /** Return Members where one of the related CoreValues match this filter */
  coreValues_SINGLE?: InputMaybe<CoreValueWhere>
  /** Return Members where some of the related CoreValues match this filter */
  coreValues_SOME?: InputMaybe<CoreValueWhere>
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
  favourites_CONTAINS?: InputMaybe<Scalars['String']['input']>
  favourites_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  favourites_EQ?: InputMaybe<Scalars['String']['input']>
  favourites_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  favourites_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  gender_CONTAINS?: InputMaybe<Scalars['String']['input']>
  gender_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  gender_EQ?: InputMaybe<Scalars['String']['input']>
  gender_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  gender_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  providesResourcesAggregate?: InputMaybe<MemberProvidesResourcesAggregateInput>
  /** Return Members where all of the related MemberProvidesResourcesConnections match this filter */
  providesResourcesConnection_ALL?: InputMaybe<MemberProvidesResourcesConnectionWhere>
  /** Return Members where none of the related MemberProvidesResourcesConnections match this filter */
  providesResourcesConnection_NONE?: InputMaybe<MemberProvidesResourcesConnectionWhere>
  /** Return Members where one of the related MemberProvidesResourcesConnections match this filter */
  providesResourcesConnection_SINGLE?: InputMaybe<MemberProvidesResourcesConnectionWhere>
  /** Return Members where some of the related MemberProvidesResourcesConnections match this filter */
  providesResourcesConnection_SOME?: InputMaybe<MemberProvidesResourcesConnectionWhere>
  /** Return Members where all of the related Resources match this filter */
  providesResources_ALL?: InputMaybe<ResourceWhere>
  /** Return Members where none of the related Resources match this filter */
  providesResources_NONE?: InputMaybe<ResourceWhere>
  /** Return Members where one of the related Resources match this filter */
  providesResources_SINGLE?: InputMaybe<ResourceWhere>
  /** Return Members where some of the related Resources match this filter */
  providesResources_SOME?: InputMaybe<ResourceWhere>
  signupDate_EQ?: InputMaybe<Scalars['Date']['input']>
  signupDate_GT?: InputMaybe<Scalars['Date']['input']>
  signupDate_GTE?: InputMaybe<Scalars['Date']['input']>
  signupDate_IN?: InputMaybe<Array<Scalars['Date']['input']>>
  signupDate_LT?: InputMaybe<Scalars['Date']['input']>
  signupDate_LTE?: InputMaybe<Scalars['Date']['input']>
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

export type MembersConnection = {
  __typename?: 'MembersConnection'
  edges: Array<MemberEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Mutation = {
  __typename?: 'Mutation'
  createAreas: CreateAreasMutationResponse
  createCarePoints: CreateCarePointsMutationResponse
  createCommunities: CreateCommunitiesMutationResponse
  createCoreValues: CreateCoreValuesMutationResponse
  createGoals: CreateGoalsMutationResponse
  createMembers: CreateMembersMutationResponse
  createPeople: CreatePeopleMutationResponse
  createResources: CreateResourcesMutationResponse
  deleteAreas: DeleteInfo
  deleteCarePoints: DeleteInfo
  deleteCommunities: DeleteInfo
  deleteCoreValues: DeleteInfo
  deleteGoals: DeleteInfo
  deleteMembers: DeleteInfo
  deletePeople: DeleteInfo
  deleteResources: DeleteInfo
  updateAreas: UpdateAreasMutationResponse
  updateCarePoints: UpdateCarePointsMutationResponse
  updateCommunities: UpdateCommunitiesMutationResponse
  updateCoreValues: UpdateCoreValuesMutationResponse
  updateGoals: UpdateGoalsMutationResponse
  updateMembers: UpdateMembersMutationResponse
  updatePeople: UpdatePeopleMutationResponse
  updateResources: UpdateResourcesMutationResponse
}

export type MutationCreateAreasArgs = {
  input: Array<AreaCreateInput>
}

export type MutationCreateCarePointsArgs = {
  input: Array<CarePointCreateInput>
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

export type MutationCreateMembersArgs = {
  input: Array<MemberCreateInput>
}

export type MutationCreatePeopleArgs = {
  input: Array<PersonCreateInput>
}

export type MutationCreateResourcesArgs = {
  input: Array<ResourceCreateInput>
}

export type MutationDeleteAreasArgs = {
  where?: InputMaybe<AreaWhere>
}

export type MutationDeleteCarePointsArgs = {
  delete?: InputMaybe<CarePointDeleteInput>
  where?: InputMaybe<CarePointWhere>
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

export type MutationDeleteMembersArgs = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<MemberWhere>
}

export type MutationDeletePeopleArgs = {
  where?: InputMaybe<PersonWhere>
}

export type MutationDeleteResourcesArgs = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<ResourceWhere>
}

export type MutationUpdateAreasArgs = {
  update?: InputMaybe<AreaUpdateInput>
  where?: InputMaybe<AreaWhere>
}

export type MutationUpdateCarePointsArgs = {
  update?: InputMaybe<CarePointUpdateInput>
  where?: InputMaybe<CarePointWhere>
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

export type MutationUpdateMembersArgs = {
  update?: InputMaybe<MemberUpdateInput>
  where?: InputMaybe<MemberWhere>
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
  createdAt: Scalars['DateTime']['output']
  email?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  gender?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  lastName: Scalars['String']['output']
  location?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  phone?: Maybe<Scalars['String']['output']>
  photo?: Maybe<Scalars['String']['output']>
  pronouns?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type PersonAggregateSelection = {
  __typename?: 'PersonAggregateSelection'
  authId: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  firstName: StringAggregateSelection
  gender: StringAggregateSelection
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type PersonConnectWhere = {
  node: PersonWhere
}

export type PersonCreateInput = {
  authId?: InputMaybe<Scalars['String']['input']>
  email?: InputMaybe<Scalars['String']['input']>
  firstName: Scalars['String']['input']
  gender?: InputMaybe<Scalars['String']['input']>
  lastName: Scalars['String']['input']
  location?: InputMaybe<Scalars['String']['input']>
  phone?: InputMaybe<Scalars['String']['input']>
  photo?: InputMaybe<Scalars['String']['input']>
  pronouns?: InputMaybe<Scalars['String']['input']>
}

export type PersonEdge = {
  __typename?: 'PersonEdge'
  cursor: Scalars['String']['output']
  node: Person
}

export type PersonInterface = {
  createdAt: Scalars['DateTime']['output']
  email?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  gender?: Maybe<Scalars['String']['output']>
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
  gender: StringAggregateSelection
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
  Member = 'Member',
  Person = 'Person',
}

/** Fields to sort PersonInterfaces by. The order in which sorts are applied is not guaranteed when specifying many fields in one PersonInterfaceSort object. */
export type PersonInterfaceSort = {
  createdAt?: InputMaybe<SortDirection>
  email?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  gender?: InputMaybe<SortDirection>
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
  gender_CONTAINS?: InputMaybe<Scalars['String']['input']>
  gender_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  gender_EQ?: InputMaybe<Scalars['String']['input']>
  gender_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  gender_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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

/** Fields to sort People by. The order in which sorts are applied is not guaranteed when specifying many fields in one PersonSort object. */
export type PersonSort = {
  authId?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  email?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  gender?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  phone?: InputMaybe<SortDirection>
  photo?: InputMaybe<SortDirection>
  pronouns?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type PersonUpdateInput = {
  authId_SET?: InputMaybe<Scalars['String']['input']>
  email_SET?: InputMaybe<Scalars['String']['input']>
  firstName_SET?: InputMaybe<Scalars['String']['input']>
  gender_SET?: InputMaybe<Scalars['String']['input']>
  lastName_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  phone_SET?: InputMaybe<Scalars['String']['input']>
  photo_SET?: InputMaybe<Scalars['String']['input']>
  pronouns_SET?: InputMaybe<Scalars['String']['input']>
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
  gender_CONTAINS?: InputMaybe<Scalars['String']['input']>
  gender_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  gender_EQ?: InputMaybe<Scalars['String']['input']>
  gender_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  gender_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type Query = {
  __typename?: 'Query'
  areas: Array<Area>
  areasAggregate: AreaAggregateSelection
  areasConnection: AreasConnection
  carePoints: Array<CarePoint>
  carePointsAggregate: CarePointAggregateSelection
  carePointsConnection: CarePointsConnection
  communities: Array<Community>
  communitiesAggregate: CommunityAggregateSelection
  communitiesConnection: CommunitiesConnection
  coreValues: Array<CoreValue>
  coreValuesAggregate: CoreValueAggregateSelection
  coreValuesConnection: CoreValuesConnection
  goals: Array<Goal>
  goalsAggregate: GoalAggregateSelection
  goalsConnection: GoalsConnection
  members: Array<Member>
  membersAggregate: MemberAggregateSelection
  membersConnection: MembersConnection
  people: Array<Person>
  peopleAggregate: PersonAggregateSelection
  peopleConnection: PeopleConnection
  personInterfaces: Array<PersonInterface>
  personInterfacesAggregate: PersonInterfaceAggregateSelection
  personInterfacesConnection: PersonInterfacesConnection
  resources: Array<Resource>
  resourcesAggregate: ResourceAggregateSelection
  resourcesConnection: ResourcesConnection
}

export type QueryAreasArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<AreaSort>>
  where?: InputMaybe<AreaWhere>
}

export type QueryAreasAggregateArgs = {
  where?: InputMaybe<AreaWhere>
}

export type QueryAreasConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<AreaSort>>
  where?: InputMaybe<AreaWhere>
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

export type QueryMembersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberSort>>
  where?: InputMaybe<MemberWhere>
}

export type QueryMembersAggregateArgs = {
  where?: InputMaybe<MemberWhere>
}

export type QueryMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberSort>>
  where?: InputMaybe<MemberWhere>
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
  dependsOnResources?: InputMaybe<ResourceDependsOnResourcesFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  location?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  providedByPerson?: InputMaybe<ResourceProvidedByPersonFieldInput>
  status: Scalars['String']['input']
  time?: InputMaybe<Scalars['String']['input']>
  why?: InputMaybe<Scalars['String']['input']>
}

export type ResourceDeleteInput = {
  carePoints?: InputMaybe<Array<ResourceCarePointsDeleteFieldInput>>
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

export type ResourcePersonProvidedByPersonAggregationSelection = {
  __typename?: 'ResourcePersonProvidedByPersonAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourcePersonProvidedByPersonNodeAggregateSelection>
}

export type ResourcePersonProvidedByPersonNodeAggregateSelection = {
  __typename?: 'ResourcePersonProvidedByPersonNodeAggregateSelection'
  authId: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  firstName: StringAggregateSelection
  gender: StringAggregateSelection
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
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
  where?: InputMaybe<ResourceProvidedByPersonConnectionWhere>
}

export type ResourceProvidedByPersonDisconnectFieldInput = {
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
  gender_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  gender_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  gender_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  gender_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type UpdateAreasMutationResponse = {
  __typename?: 'UpdateAreasMutationResponse'
  areas: Array<Area>
  info: UpdateInfo
}

export type UpdateCarePointsMutationResponse = {
  __typename?: 'UpdateCarePointsMutationResponse'
  carePoints: Array<CarePoint>
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

export type UpdateMembersMutationResponse = {
  __typename?: 'UpdateMembersMutationResponse'
  info: UpdateInfo
  members: Array<Member>
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
      type: string
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

export type CreateMembersMutationVariables = Exact<{
  input: Array<MemberCreateInput> | MemberCreateInput
}>

export type CreateMembersMutation = {
  __typename?: 'Mutation'
  createMembers: {
    __typename?: 'CreateMembersMutationResponse'
    members: Array<{
      __typename?: 'Member'
      id: string
      firstName: string
      lastName: string
      email?: string | null
    }>
  }
}

export type UpdateMemberMutationVariables = Exact<{
  where: MemberWhere
  update: MemberUpdateInput
}>

export type UpdateMemberMutation = {
  __typename?: 'Mutation'
  updateMembers: {
    __typename?: 'UpdateMembersMutationResponse'
    members: Array<{
      __typename?: 'Member'
      id: string
      authId?: string | null
      firstName: string
      lastName: string
      email?: string | null
    }>
  }
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
    guidesPeople: Array<{ __typename?: 'Member'; id: string; name: string }>
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
  members: Array<{
    __typename?: 'Member'
    id: string
    authId?: string | null
    firstName: string
    lastName: string
    email?: string | null
    communities: Array<{
      __typename?: 'Community'
      id: string
      name: string
      members: Array<{
        __typename?: 'Member'
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
    type: string
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
    createdBy: Array<{ __typename?: 'Member'; id: string; name: string }>
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
    type: string
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

export type GetMembersQueryVariables = Exact<{ [key: string]: never }>

export type GetMembersQuery = {
  __typename?: 'Query'
  members: Array<{
    __typename?: 'Member'
    id: string
    firstName: string
    lastName: string
    email?: string | null
  }>
}

export type GetMemberQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetMemberQuery = {
  __typename?: 'Query'
  members: Array<{
    __typename?: 'Member'
    id: string
    firstName: string
    lastName: string
    name: string
    email?: string | null
    photo?: string | null
    phone?: string | null
    gender?: string | null
    pronouns?: string | null
    location?: string | null
    interests?: string | null
    createdAt: any
    coreValues: Array<{ __typename?: 'CoreValue'; id: string; name: string }>
  }>
}

export type GetAllMembersQueryVariables = Exact<{
  where?: InputMaybe<MemberWhere>
}>

export type GetAllMembersQuery = {
  __typename?: 'Query'
  members: Array<{
    __typename?: 'Member'
    id: string
    firstName: string
    lastName: string
    name: string
    email?: string | null
    photo?: string | null
    phone?: string | null
    gender?: string | null
    pronouns?: string | null
    location?: string | null
    coreValues: Array<{ __typename?: 'CoreValue'; id: string; name: string }>
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
    gender?: string | null
    pronouns?: string | null
    location?: string | null
    createdAt: any
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
    gender?: string | null
    pronouns?: string | null
    location?: string | null
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
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
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
export const CreateMembersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateMembers' },
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
                  name: { kind: 'Name', value: 'MemberCreateInput' },
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
            name: { kind: 'Name', value: 'createMembers' },
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
                  name: { kind: 'Name', value: 'members' },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateMembersMutation,
  CreateMembersMutationVariables
>
export const UpdateMemberDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateMember' },
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
              name: { kind: 'Name', value: 'MemberWhere' },
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
              name: { kind: 'Name', value: 'MemberUpdateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateMembers' },
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
                  name: { kind: 'Name', value: 'members' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'authId' },
                      },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateMemberMutation,
  UpdateMemberMutationVariables
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
                  name: { kind: 'Name', value: 'guidesPeople' },
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
            name: { kind: 'Name', value: 'members' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
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
export const GetMembersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMembers' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMembersQuery, GetMembersQueryVariables>
export const GetMemberDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getMember' },
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
            name: { kind: 'Name', value: 'members' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pronouns' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'interests' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'coreValues' },
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
} as unknown as DocumentNode<GetMemberQuery, GetMemberQueryVariables>
export const GetAllMembersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAllMembers' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'where' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'MemberWhere' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'members' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pronouns' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'coreValues' },
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
} as unknown as DocumentNode<GetAllMembersQuery, GetAllMembersQueryVariables>
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
                { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pronouns' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
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
