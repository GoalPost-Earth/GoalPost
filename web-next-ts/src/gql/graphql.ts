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
  K extends keyof T
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

export type AreaOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more AreaSort objects to sort Areas by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<AreaSort>>
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
  createdAt: Scalars['DateTime']['output']
  description: Scalars['String']['output']
  id: Scalars['ID']['output']
  status: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
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

export type CarePointCreateInput = {
  description: Scalars['String']['input']
  status: Scalars['String']['input']
}

export type CarePointEdge = {
  __typename?: 'CarePointEdge'
  cursor: Scalars['String']['output']
  node: CarePoint
}

export type CarePointOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more CarePointSort objects to sort CarePoints by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<CarePointSort>>
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
  description_SET?: InputMaybe<Scalars['String']['input']>
  status_SET?: InputMaybe<Scalars['String']['input']>
}

export type CarePointWhere = {
  AND?: InputMaybe<Array<CarePointWhere>>
  NOT?: InputMaybe<CarePointWhere>
  OR?: InputMaybe<Array<CarePointWhere>>
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
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_EQ?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
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
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type CommunityAggregateSelection = {
  __typename?: 'CommunityAggregateSelection'
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  id: IdAggregateSelection
  name: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type CommunityConnectWhere = {
  node: CommunityWhere
}

export type CommunityCreateInput = {
  name: Scalars['String']['input']
}

export type CommunityEdge = {
  __typename?: 'CommunityEdge'
  cursor: Scalars['String']['output']
  node: Community
}

export type CommunityOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more CommunitySort objects to sort Communities by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<CommunitySort>>
}

/** Fields to sort Communities by. The order in which sorts are applied is not guaranteed when specifying many fields in one CommunitySort object. */
export type CommunitySort = {
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type CommunityUpdateInput = {
  name_SET?: InputMaybe<Scalars['String']['input']>
}

export type CommunityWhere = {
  AND?: InputMaybe<Array<CommunityWhere>>
  NOT?: InputMaybe<CommunityWhere>
  OR?: InputMaybe<Array<CommunityWhere>>
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
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type CoreValue = {
  __typename?: 'CoreValue'
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
}

export type CoreValueAggregateSelection = {
  __typename?: 'CoreValueAggregateSelection'
  count: Scalars['Int']['output']
  id: IdAggregateSelection
  name: StringAggregateSelection
}

export type CoreValueCreateInput = {
  name: Scalars['String']['input']
}

export type CoreValueEdge = {
  __typename?: 'CoreValueEdge'
  cursor: Scalars['String']['output']
  node: CoreValue
}

export type CoreValueOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more CoreValueSort objects to sort CoreValues by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<CoreValueSort>>
}

/** Fields to sort CoreValues by. The order in which sorts are applied is not guaranteed when specifying many fields in one CoreValueSort object. */
export type CoreValueSort = {
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
}

export type CoreValueUpdateInput = {
  name_SET?: InputMaybe<Scalars['String']['input']>
}

export type CoreValueWhere = {
  AND?: InputMaybe<Array<CoreValueWhere>>
  NOT?: InputMaybe<CoreValueWhere>
  OR?: InputMaybe<Array<CoreValueWhere>>
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
  contactible: Scalars['Boolean']['output']
  cost: Scalars['Float']['output']
  createdAt: Scalars['DateTime']['output']
  deliveryLocation: Scalars['String']['output']
  deliveryType: Scalars['String']['output']
  description: Scalars['String']['output']
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  photo: Scalars['String']['output']
  type: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type GoalAggregateSelection = {
  __typename?: 'GoalAggregateSelection'
  cost: FloatAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  deliveryLocation: StringAggregateSelection
  deliveryType: StringAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  name: StringAggregateSelection
  photo: StringAggregateSelection
  type: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type GoalCreateInput = {
  contactible: Scalars['Boolean']['input']
  cost: Scalars['Float']['input']
  deliveryLocation: Scalars['String']['input']
  deliveryType: Scalars['String']['input']
  description: Scalars['String']['input']
  name: Scalars['String']['input']
  photo: Scalars['String']['input']
  type: Scalars['String']['input']
}

export type GoalEdge = {
  __typename?: 'GoalEdge'
  cursor: Scalars['String']['output']
  node: Goal
}

export type GoalOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more GoalSort objects to sort Goals by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<GoalSort>>
}

/** Fields to sort Goals by. The order in which sorts are applied is not guaranteed when specifying many fields in one GoalSort object. */
export type GoalSort = {
  contactible?: InputMaybe<SortDirection>
  cost?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  deliveryLocation?: InputMaybe<SortDirection>
  deliveryType?: InputMaybe<SortDirection>
  description?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  photo?: InputMaybe<SortDirection>
  type?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type GoalUpdateInput = {
  contactible_SET?: InputMaybe<Scalars['Boolean']['input']>
  cost_ADD?: InputMaybe<Scalars['Float']['input']>
  cost_DIVIDE?: InputMaybe<Scalars['Float']['input']>
  cost_MULTIPLY?: InputMaybe<Scalars['Float']['input']>
  cost_SET?: InputMaybe<Scalars['Float']['input']>
  cost_SUBTRACT?: InputMaybe<Scalars['Float']['input']>
  deliveryLocation_SET?: InputMaybe<Scalars['String']['input']>
  deliveryType_SET?: InputMaybe<Scalars['String']['input']>
  description_SET?: InputMaybe<Scalars['String']['input']>
  name_SET?: InputMaybe<Scalars['String']['input']>
  photo_SET?: InputMaybe<Scalars['String']['input']>
  type_SET?: InputMaybe<Scalars['String']['input']>
}

export type GoalWhere = {
  AND?: InputMaybe<Array<GoalWhere>>
  NOT?: InputMaybe<GoalWhere>
  OR?: InputMaybe<Array<GoalWhere>>
  contactible_EQ?: InputMaybe<Scalars['Boolean']['input']>
  cost_EQ?: InputMaybe<Scalars['Float']['input']>
  cost_GT?: InputMaybe<Scalars['Float']['input']>
  cost_GTE?: InputMaybe<Scalars['Float']['input']>
  cost_IN?: InputMaybe<Array<Scalars['Float']['input']>>
  cost_LT?: InputMaybe<Scalars['Float']['input']>
  cost_LTE?: InputMaybe<Scalars['Float']['input']>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  deliveryLocation_CONTAINS?: InputMaybe<Scalars['String']['input']>
  deliveryLocation_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  deliveryLocation_EQ?: InputMaybe<Scalars['String']['input']>
  deliveryLocation_IN?: InputMaybe<Array<Scalars['String']['input']>>
  deliveryLocation_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  deliveryType_CONTAINS?: InputMaybe<Scalars['String']['input']>
  deliveryType_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  deliveryType_EQ?: InputMaybe<Scalars['String']['input']>
  deliveryType_IN?: InputMaybe<Array<Scalars['String']['input']>>
  deliveryType_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  description_CONTAINS?: InputMaybe<Scalars['String']['input']>
  description_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  description_EQ?: InputMaybe<Scalars['String']['input']>
  description_IN?: InputMaybe<Array<Scalars['String']['input']>>
  description_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  photo_CONTAINS?: InputMaybe<Scalars['String']['input']>
  photo_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  photo_EQ?: InputMaybe<Scalars['String']['input']>
  photo_IN?: InputMaybe<Array<Scalars['String']['input']>>
  photo_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  authId: Scalars['String']['output']
  community: Array<Community>
  communityAggregate?: Maybe<MemberCommunityCommunityAggregationSelection>
  communityConnection: MemberCommunityConnection
  createdAt: Scalars['DateTime']['output']
  email?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  fullName: Scalars['String']['output']
  gender?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  lastName: Scalars['String']['output']
  location?: Maybe<Scalars['String']['output']>
  phone?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type MemberCommunityArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunitySort>>
  where?: InputMaybe<CommunityWhere>
}

export type MemberCommunityAggregateArgs = {
  where?: InputMaybe<CommunityWhere>
}

export type MemberCommunityConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberCommunityConnectionSort>>
  where?: InputMaybe<MemberCommunityConnectionWhere>
}

export type MemberAggregateSelection = {
  __typename?: 'MemberAggregateSelection'
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
  updatedAt: DateTimeAggregateSelection
}

export type MemberCommunityAggregateInput = {
  AND?: InputMaybe<Array<MemberCommunityAggregateInput>>
  NOT?: InputMaybe<MemberCommunityAggregateInput>
  OR?: InputMaybe<Array<MemberCommunityAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberCommunityNodeAggregationWhereInput>
}

export type MemberCommunityCommunityAggregationSelection = {
  __typename?: 'MemberCommunityCommunityAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberCommunityCommunityNodeAggregateSelection>
}

export type MemberCommunityCommunityNodeAggregateSelection = {
  __typename?: 'MemberCommunityCommunityNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  id: IdAggregateSelection
  name: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type MemberCommunityConnectFieldInput = {
  where?: InputMaybe<CommunityConnectWhere>
}

export type MemberCommunityConnection = {
  __typename?: 'MemberCommunityConnection'
  edges: Array<MemberCommunityRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberCommunityConnectionSort = {
  node?: InputMaybe<CommunitySort>
}

export type MemberCommunityConnectionWhere = {
  AND?: InputMaybe<Array<MemberCommunityConnectionWhere>>
  NOT?: InputMaybe<MemberCommunityConnectionWhere>
  OR?: InputMaybe<Array<MemberCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type MemberCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type MemberCommunityDeleteFieldInput = {
  where?: InputMaybe<MemberCommunityConnectionWhere>
}

export type MemberCommunityDisconnectFieldInput = {
  where?: InputMaybe<MemberCommunityConnectionWhere>
}

export type MemberCommunityFieldInput = {
  connect?: InputMaybe<Array<MemberCommunityConnectFieldInput>>
  create?: InputMaybe<Array<MemberCommunityCreateFieldInput>>
}

export type MemberCommunityNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberCommunityNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberCommunityNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberCommunityNodeAggregationWhereInput>>
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
}

export type MemberCommunityRelationship = {
  __typename?: 'MemberCommunityRelationship'
  cursor: Scalars['String']['output']
  node: Community
}

export type MemberCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
}

export type MemberCommunityUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberCommunityConnectFieldInput>>
  create?: InputMaybe<Array<MemberCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<MemberCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberCommunityDisconnectFieldInput>>
  update?: InputMaybe<MemberCommunityUpdateConnectionInput>
  where?: InputMaybe<MemberCommunityConnectionWhere>
}

export type MemberCreateInput = {
  authId: Scalars['String']['input']
  community?: InputMaybe<MemberCommunityFieldInput>
  email?: InputMaybe<Scalars['String']['input']>
  firstName: Scalars['String']['input']
  gender?: InputMaybe<Scalars['String']['input']>
  lastName: Scalars['String']['input']
  location?: InputMaybe<Scalars['String']['input']>
  phone?: InputMaybe<Scalars['String']['input']>
}

export type MemberDeleteInput = {
  community?: InputMaybe<Array<MemberCommunityDeleteFieldInput>>
}

export type MemberEdge = {
  __typename?: 'MemberEdge'
  cursor: Scalars['String']['output']
  node: Member
}

export type MemberOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more MemberSort objects to sort Members by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<MemberSort>>
}

/** Fields to sort Members by. The order in which sorts are applied is not guaranteed when specifying many fields in one MemberSort object. */
export type MemberSort = {
  authId?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  email?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  gender?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  phone?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type MemberUpdateInput = {
  authId_SET?: InputMaybe<Scalars['String']['input']>
  community?: InputMaybe<Array<MemberCommunityUpdateFieldInput>>
  email_SET?: InputMaybe<Scalars['String']['input']>
  firstName_SET?: InputMaybe<Scalars['String']['input']>
  gender_SET?: InputMaybe<Scalars['String']['input']>
  lastName_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  phone_SET?: InputMaybe<Scalars['String']['input']>
}

export type MemberWhere = {
  AND?: InputMaybe<Array<MemberWhere>>
  NOT?: InputMaybe<MemberWhere>
  OR?: InputMaybe<Array<MemberWhere>>
  authId_CONTAINS?: InputMaybe<Scalars['String']['input']>
  authId_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  authId_EQ?: InputMaybe<Scalars['String']['input']>
  authId_IN?: InputMaybe<Array<Scalars['String']['input']>>
  authId_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  communityAggregate?: InputMaybe<MemberCommunityAggregateInput>
  /** Return Members where all of the related MemberCommunityConnections match this filter */
  communityConnection_ALL?: InputMaybe<MemberCommunityConnectionWhere>
  /** Return Members where none of the related MemberCommunityConnections match this filter */
  communityConnection_NONE?: InputMaybe<MemberCommunityConnectionWhere>
  /** Return Members where one of the related MemberCommunityConnections match this filter */
  communityConnection_SINGLE?: InputMaybe<MemberCommunityConnectionWhere>
  /** Return Members where some of the related MemberCommunityConnections match this filter */
  communityConnection_SOME?: InputMaybe<MemberCommunityConnectionWhere>
  /** Return Members where all of the related Communities match this filter */
  community_ALL?: InputMaybe<CommunityWhere>
  /** Return Members where none of the related Communities match this filter */
  community_NONE?: InputMaybe<CommunityWhere>
  /** Return Members where one of the related Communities match this filter */
  community_SINGLE?: InputMaybe<CommunityWhere>
  /** Return Members where some of the related Communities match this filter */
  community_SOME?: InputMaybe<CommunityWhere>
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
  deleteAreas: DeleteInfo
  deleteCarePoints: DeleteInfo
  deleteCommunities: DeleteInfo
  deleteCoreValues: DeleteInfo
  deleteGoals: DeleteInfo
  deleteMembers: DeleteInfo
  deletePeople: DeleteInfo
  updateAreas: UpdateAreasMutationResponse
  updateCarePoints: UpdateCarePointsMutationResponse
  updateCommunities: UpdateCommunitiesMutationResponse
  updateCoreValues: UpdateCoreValuesMutationResponse
  updateGoals: UpdateGoalsMutationResponse
  updateMembers: UpdateMembersMutationResponse
  updatePeople: UpdatePeopleMutationResponse
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

export type MutationDeleteAreasArgs = {
  where?: InputMaybe<AreaWhere>
}

export type MutationDeleteCarePointsArgs = {
  where?: InputMaybe<CarePointWhere>
}

export type MutationDeleteCommunitiesArgs = {
  where?: InputMaybe<CommunityWhere>
}

export type MutationDeleteCoreValuesArgs = {
  where?: InputMaybe<CoreValueWhere>
}

export type MutationDeleteGoalsArgs = {
  where?: InputMaybe<GoalWhere>
}

export type MutationDeleteMembersArgs = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<MemberWhere>
}

export type MutationDeletePeopleArgs = {
  where?: InputMaybe<PersonWhere>
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
  createdAt: Scalars['DateTime']['output']
  email?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  fullName: Scalars['String']['output']
  gender?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  interests?: Maybe<Scalars['String']['output']>
  lastName: Scalars['String']['output']
  location?: Maybe<Scalars['String']['output']>
  manual?: Maybe<Scalars['String']['output']>
  phone?: Maybe<Scalars['String']['output']>
  pronouns?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type PersonAggregateSelection = {
  __typename?: 'PersonAggregateSelection'
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  firstName: StringAggregateSelection
  gender: StringAggregateSelection
  id: IdAggregateSelection
  interests: StringAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  manual: StringAggregateSelection
  phone: StringAggregateSelection
  pronouns: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type PersonCreateInput = {
  email?: InputMaybe<Scalars['String']['input']>
  firstName: Scalars['String']['input']
  gender?: InputMaybe<Scalars['String']['input']>
  interests?: InputMaybe<Scalars['String']['input']>
  lastName: Scalars['String']['input']
  location?: InputMaybe<Scalars['String']['input']>
  manual?: InputMaybe<Scalars['String']['input']>
  phone?: InputMaybe<Scalars['String']['input']>
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
  fullName: Scalars['String']['output']
  gender?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  lastName: Scalars['String']['output']
  location?: Maybe<Scalars['String']['output']>
  phone?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type PersonInterfaceAggregateSelection = {
  __typename?: 'PersonInterfaceAggregateSelection'
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  email: StringAggregateSelection
  firstName: StringAggregateSelection
  fullName: StringAggregateSelection
  gender: StringAggregateSelection
  id: IdAggregateSelection
  lastName: StringAggregateSelection
  location: StringAggregateSelection
  phone: StringAggregateSelection
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

export type PersonInterfaceOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more PersonInterfaceSort objects to sort PersonInterfaces by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<PersonInterfaceSort>>
}

/** Fields to sort PersonInterfaces by. The order in which sorts are applied is not guaranteed when specifying many fields in one PersonInterfaceSort object. */
export type PersonInterfaceSort = {
  createdAt?: InputMaybe<SortDirection>
  email?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  fullName?: InputMaybe<SortDirection>
  gender?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  phone?: InputMaybe<SortDirection>
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
  fullName_CONTAINS?: InputMaybe<Scalars['String']['input']>
  fullName_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  fullName_EQ?: InputMaybe<Scalars['String']['input']>
  fullName_IN?: InputMaybe<Array<Scalars['String']['input']>>
  fullName_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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

export type PersonOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more PersonSort objects to sort People by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<PersonSort>>
}

/** Fields to sort People by. The order in which sorts are applied is not guaranteed when specifying many fields in one PersonSort object. */
export type PersonSort = {
  createdAt?: InputMaybe<SortDirection>
  email?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  gender?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  interests?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  manual?: InputMaybe<SortDirection>
  phone?: InputMaybe<SortDirection>
  pronouns?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type PersonUpdateInput = {
  email_SET?: InputMaybe<Scalars['String']['input']>
  firstName_SET?: InputMaybe<Scalars['String']['input']>
  gender_SET?: InputMaybe<Scalars['String']['input']>
  interests_SET?: InputMaybe<Scalars['String']['input']>
  lastName_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  manual_SET?: InputMaybe<Scalars['String']['input']>
  phone_SET?: InputMaybe<Scalars['String']['input']>
  pronouns_SET?: InputMaybe<Scalars['String']['input']>
}

export type PersonWhere = {
  AND?: InputMaybe<Array<PersonWhere>>
  NOT?: InputMaybe<PersonWhere>
  OR?: InputMaybe<Array<PersonWhere>>
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
  manual_CONTAINS?: InputMaybe<Scalars['String']['input']>
  manual_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  manual_EQ?: InputMaybe<Scalars['String']['input']>
  manual_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  manual_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  phone_CONTAINS?: InputMaybe<Scalars['String']['input']>
  phone_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  phone_EQ?: InputMaybe<Scalars['String']['input']>
  phone_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  phone_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
      location?: string | null
      manual?: string | null
      interests?: string | null
      pronouns?: string | null
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

export type GetLoggedInUserQueryVariables = Exact<{
  authId: Scalars['String']['input']
}>

export type GetLoggedInUserQuery = {
  __typename?: 'Query'
  members: Array<{
    __typename?: 'Member'
    id: string
    firstName: string
    lastName: string
    email?: string | null
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
    fullName: string
    email?: string | null
    phone?: string | null
    manual?: string | null
    interests?: string | null
    gender?: string | null
    pronouns?: string | null
    location?: string | null
    createdAt: any
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
    fullName: string
    email?: string | null
    gender?: string | null
    phone?: string | null
  }>
}

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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'location' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'manual' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'interests' },
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
            name: { kind: 'Name', value: 'authId' },
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
                      name: { kind: 'Name', value: 'authId_EQ' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'authId' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                { kind: 'Field', name: { kind: 'Name', value: 'manual' } },
                { kind: 'Field', name: { kind: 'Name', value: 'interests' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMemberQuery, GetMemberQueryVariables>
