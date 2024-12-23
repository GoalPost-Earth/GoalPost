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

export type CarePointConnectWhere = {
  node: CarePointWhere
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
  activities?: Maybe<Scalars['String']['output']>
  caresFor?: Maybe<Scalars['String']['output']>
  createdAt: Scalars['DateTime']['output']
  hasAccessToResource: Array<Resource>
  hasAccessToResourceAggregate?: Maybe<CommunityResourceHasAccessToResourceAggregationSelection>
  hasAccessToResourceConnection: CommunityHasAccessToResourceConnection
  hasMembers: Array<Member>
  hasMembersAggregate?: Maybe<CommunityMemberHasMembersAggregationSelection>
  hasMembersConnection: CommunityHasMembersConnection
  id: Scalars['ID']['output']
  location?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  relatesToCommunity: Array<Community>
  relatesToCommunityAggregate?: Maybe<CommunityCommunityRelatesToCommunityAggregationSelection>
  relatesToCommunityConnection: CommunityRelatesToCommunityConnection
  resultsAchieved?: Maybe<Scalars['String']['output']>
  status: Scalars['Boolean']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type CommunityHasAccessToResourceArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type CommunityHasAccessToResourceAggregateArgs = {
  where?: InputMaybe<ResourceWhere>
}

export type CommunityHasAccessToResourceConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunityHasAccessToResourceConnectionSort>>
  where?: InputMaybe<CommunityHasAccessToResourceConnectionWhere>
}

export type CommunityHasMembersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberSort>>
  where?: InputMaybe<MemberWhere>
}

export type CommunityHasMembersAggregateArgs = {
  where?: InputMaybe<MemberWhere>
}

export type CommunityHasMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunityHasMembersConnectionSort>>
  where?: InputMaybe<CommunityHasMembersConnectionWhere>
}

export type CommunityRelatesToCommunityArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunitySort>>
  where?: InputMaybe<CommunityWhere>
}

export type CommunityRelatesToCommunityAggregateArgs = {
  where?: InputMaybe<CommunityWhere>
}

export type CommunityRelatesToCommunityConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CommunityRelatesToCommunityConnectionSort>>
  where?: InputMaybe<CommunityRelatesToCommunityConnectionWhere>
}

export type CommunityAggregateSelection = {
  __typename?: 'CommunityAggregateSelection'
  activities: StringAggregateSelection
  caresFor: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  resultsAchieved: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type CommunityCommunityRelatesToCommunityAggregationSelection = {
  __typename?: 'CommunityCommunityRelatesToCommunityAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunityCommunityRelatesToCommunityNodeAggregateSelection>
}

export type CommunityCommunityRelatesToCommunityNodeAggregateSelection = {
  __typename?: 'CommunityCommunityRelatesToCommunityNodeAggregateSelection'
  activities: StringAggregateSelection
  caresFor: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  resultsAchieved: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type CommunityConnectInput = {
  hasAccessToResource?: InputMaybe<
    Array<CommunityHasAccessToResourceConnectFieldInput>
  >
  hasMembers?: InputMaybe<Array<CommunityHasMembersConnectFieldInput>>
  relatesToCommunity?: InputMaybe<
    Array<CommunityRelatesToCommunityConnectFieldInput>
  >
}

export type CommunityConnectWhere = {
  node: CommunityWhere
}

export type CommunityCreateInput = {
  activities?: InputMaybe<Scalars['String']['input']>
  caresFor?: InputMaybe<Scalars['String']['input']>
  hasAccessToResource?: InputMaybe<CommunityHasAccessToResourceFieldInput>
  hasMembers?: InputMaybe<CommunityHasMembersFieldInput>
  location?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  relatesToCommunity?: InputMaybe<CommunityRelatesToCommunityFieldInput>
  resultsAchieved?: InputMaybe<Scalars['String']['input']>
  status: Scalars['Boolean']['input']
}

export type CommunityDeleteInput = {
  hasAccessToResource?: InputMaybe<
    Array<CommunityHasAccessToResourceDeleteFieldInput>
  >
  hasMembers?: InputMaybe<Array<CommunityHasMembersDeleteFieldInput>>
  relatesToCommunity?: InputMaybe<
    Array<CommunityRelatesToCommunityDeleteFieldInput>
  >
}

export type CommunityDisconnectInput = {
  hasAccessToResource?: InputMaybe<
    Array<CommunityHasAccessToResourceDisconnectFieldInput>
  >
  hasMembers?: InputMaybe<Array<CommunityHasMembersDisconnectFieldInput>>
  relatesToCommunity?: InputMaybe<
    Array<CommunityRelatesToCommunityDisconnectFieldInput>
  >
}

export type CommunityEdge = {
  __typename?: 'CommunityEdge'
  cursor: Scalars['String']['output']
  node: Community
}

export type CommunityHasAccessToResourceAggregateInput = {
  AND?: InputMaybe<Array<CommunityHasAccessToResourceAggregateInput>>
  NOT?: InputMaybe<CommunityHasAccessToResourceAggregateInput>
  OR?: InputMaybe<Array<CommunityHasAccessToResourceAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CommunityHasAccessToResourceNodeAggregationWhereInput>
}

export type CommunityHasAccessToResourceConnectFieldInput = {
  connect?: InputMaybe<Array<ResourceConnectInput>>
  where?: InputMaybe<ResourceConnectWhere>
}

export type CommunityHasAccessToResourceConnection = {
  __typename?: 'CommunityHasAccessToResourceConnection'
  edges: Array<CommunityHasAccessToResourceRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityHasAccessToResourceConnectionSort = {
  node?: InputMaybe<ResourceSort>
}

export type CommunityHasAccessToResourceConnectionWhere = {
  AND?: InputMaybe<Array<CommunityHasAccessToResourceConnectionWhere>>
  NOT?: InputMaybe<CommunityHasAccessToResourceConnectionWhere>
  OR?: InputMaybe<Array<CommunityHasAccessToResourceConnectionWhere>>
  node?: InputMaybe<ResourceWhere>
}

export type CommunityHasAccessToResourceCreateFieldInput = {
  node: ResourceCreateInput
}

export type CommunityHasAccessToResourceDeleteFieldInput = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<CommunityHasAccessToResourceConnectionWhere>
}

export type CommunityHasAccessToResourceDisconnectFieldInput = {
  disconnect?: InputMaybe<ResourceDisconnectInput>
  where?: InputMaybe<CommunityHasAccessToResourceConnectionWhere>
}

export type CommunityHasAccessToResourceFieldInput = {
  connect?: InputMaybe<Array<CommunityHasAccessToResourceConnectFieldInput>>
  create?: InputMaybe<Array<CommunityHasAccessToResourceCreateFieldInput>>
}

export type CommunityHasAccessToResourceNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CommunityHasAccessToResourceNodeAggregationWhereInput>>
  NOT?: InputMaybe<CommunityHasAccessToResourceNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CommunityHasAccessToResourceNodeAggregationWhereInput>>
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

export type CommunityHasAccessToResourceRelationship = {
  __typename?: 'CommunityHasAccessToResourceRelationship'
  cursor: Scalars['String']['output']
  node: Resource
}

export type CommunityHasAccessToResourceUpdateConnectionInput = {
  node?: InputMaybe<ResourceUpdateInput>
}

export type CommunityHasAccessToResourceUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityHasAccessToResourceConnectFieldInput>>
  create?: InputMaybe<Array<CommunityHasAccessToResourceCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityHasAccessToResourceDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<CommunityHasAccessToResourceDisconnectFieldInput>
  >
  update?: InputMaybe<CommunityHasAccessToResourceUpdateConnectionInput>
  where?: InputMaybe<CommunityHasAccessToResourceConnectionWhere>
}

export type CommunityHasMembersAggregateInput = {
  AND?: InputMaybe<Array<CommunityHasMembersAggregateInput>>
  NOT?: InputMaybe<CommunityHasMembersAggregateInput>
  OR?: InputMaybe<Array<CommunityHasMembersAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CommunityHasMembersNodeAggregationWhereInput>
}

export type CommunityHasMembersConnectFieldInput = {
  connect?: InputMaybe<Array<MemberConnectInput>>
  where?: InputMaybe<MemberConnectWhere>
}

export type CommunityHasMembersConnection = {
  __typename?: 'CommunityHasMembersConnection'
  edges: Array<CommunityHasMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityHasMembersConnectionSort = {
  node?: InputMaybe<MemberSort>
}

export type CommunityHasMembersConnectionWhere = {
  AND?: InputMaybe<Array<CommunityHasMembersConnectionWhere>>
  NOT?: InputMaybe<CommunityHasMembersConnectionWhere>
  OR?: InputMaybe<Array<CommunityHasMembersConnectionWhere>>
  node?: InputMaybe<MemberWhere>
}

export type CommunityHasMembersCreateFieldInput = {
  node: MemberCreateInput
}

export type CommunityHasMembersDeleteFieldInput = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<CommunityHasMembersConnectionWhere>
}

export type CommunityHasMembersDisconnectFieldInput = {
  disconnect?: InputMaybe<MemberDisconnectInput>
  where?: InputMaybe<CommunityHasMembersConnectionWhere>
}

export type CommunityHasMembersFieldInput = {
  connect?: InputMaybe<Array<CommunityHasMembersConnectFieldInput>>
  create?: InputMaybe<Array<CommunityHasMembersCreateFieldInput>>
}

export type CommunityHasMembersNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CommunityHasMembersNodeAggregationWhereInput>>
  NOT?: InputMaybe<CommunityHasMembersNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CommunityHasMembersNodeAggregationWhereInput>>
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
  manual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  manual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type CommunityHasMembersRelationship = {
  __typename?: 'CommunityHasMembersRelationship'
  cursor: Scalars['String']['output']
  node: Member
}

export type CommunityHasMembersUpdateConnectionInput = {
  node?: InputMaybe<MemberUpdateInput>
}

export type CommunityHasMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityHasMembersConnectFieldInput>>
  create?: InputMaybe<Array<CommunityHasMembersCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityHasMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CommunityHasMembersDisconnectFieldInput>>
  update?: InputMaybe<CommunityHasMembersUpdateConnectionInput>
  where?: InputMaybe<CommunityHasMembersConnectionWhere>
}

export type CommunityMemberHasMembersAggregationSelection = {
  __typename?: 'CommunityMemberHasMembersAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunityMemberHasMembersNodeAggregateSelection>
}

export type CommunityMemberHasMembersNodeAggregateSelection = {
  __typename?: 'CommunityMemberHasMembersNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
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
  manual: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type CommunityOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more CommunitySort objects to sort Communities by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<CommunitySort>>
}

export type CommunityRelatesToCommunityAggregateInput = {
  AND?: InputMaybe<Array<CommunityRelatesToCommunityAggregateInput>>
  NOT?: InputMaybe<CommunityRelatesToCommunityAggregateInput>
  OR?: InputMaybe<Array<CommunityRelatesToCommunityAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CommunityRelatesToCommunityNodeAggregationWhereInput>
}

export type CommunityRelatesToCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
  where?: InputMaybe<CommunityConnectWhere>
}

export type CommunityRelatesToCommunityConnection = {
  __typename?: 'CommunityRelatesToCommunityConnection'
  edges: Array<CommunityRelatesToCommunityRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CommunityRelatesToCommunityConnectionSort = {
  node?: InputMaybe<CommunitySort>
}

export type CommunityRelatesToCommunityConnectionWhere = {
  AND?: InputMaybe<Array<CommunityRelatesToCommunityConnectionWhere>>
  NOT?: InputMaybe<CommunityRelatesToCommunityConnectionWhere>
  OR?: InputMaybe<Array<CommunityRelatesToCommunityConnectionWhere>>
  node?: InputMaybe<CommunityWhere>
}

export type CommunityRelatesToCommunityCreateFieldInput = {
  node: CommunityCreateInput
}

export type CommunityRelatesToCommunityDeleteFieldInput = {
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<CommunityRelatesToCommunityConnectionWhere>
}

export type CommunityRelatesToCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
  where?: InputMaybe<CommunityRelatesToCommunityConnectionWhere>
}

export type CommunityRelatesToCommunityFieldInput = {
  connect?: InputMaybe<Array<CommunityRelatesToCommunityConnectFieldInput>>
  create?: InputMaybe<Array<CommunityRelatesToCommunityCreateFieldInput>>
}

export type CommunityRelatesToCommunityNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CommunityRelatesToCommunityNodeAggregationWhereInput>>
  NOT?: InputMaybe<CommunityRelatesToCommunityNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CommunityRelatesToCommunityNodeAggregationWhereInput>>
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
  caresFor_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  caresFor_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type CommunityRelatesToCommunityRelationship = {
  __typename?: 'CommunityRelatesToCommunityRelationship'
  cursor: Scalars['String']['output']
  node: Community
}

export type CommunityRelatesToCommunityUpdateConnectionInput = {
  node?: InputMaybe<CommunityUpdateInput>
}

export type CommunityRelatesToCommunityUpdateFieldInput = {
  connect?: InputMaybe<Array<CommunityRelatesToCommunityConnectFieldInput>>
  create?: InputMaybe<Array<CommunityRelatesToCommunityCreateFieldInput>>
  delete?: InputMaybe<Array<CommunityRelatesToCommunityDeleteFieldInput>>
  disconnect?: InputMaybe<
    Array<CommunityRelatesToCommunityDisconnectFieldInput>
  >
  update?: InputMaybe<CommunityRelatesToCommunityUpdateConnectionInput>
  where?: InputMaybe<CommunityRelatesToCommunityConnectionWhere>
}

export type CommunityResourceHasAccessToResourceAggregationSelection = {
  __typename?: 'CommunityResourceHasAccessToResourceAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CommunityResourceHasAccessToResourceNodeAggregateSelection>
}

export type CommunityResourceHasAccessToResourceNodeAggregateSelection = {
  __typename?: 'CommunityResourceHasAccessToResourceNodeAggregateSelection'
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

/** Fields to sort Communities by. The order in which sorts are applied is not guaranteed when specifying many fields in one CommunitySort object. */
export type CommunitySort = {
  activities?: InputMaybe<SortDirection>
  caresFor?: InputMaybe<SortDirection>
  createdAt?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
  resultsAchieved?: InputMaybe<SortDirection>
  status?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type CommunityUpdateInput = {
  activities_SET?: InputMaybe<Scalars['String']['input']>
  caresFor_SET?: InputMaybe<Scalars['String']['input']>
  hasAccessToResource?: InputMaybe<
    Array<CommunityHasAccessToResourceUpdateFieldInput>
  >
  hasMembers?: InputMaybe<Array<CommunityHasMembersUpdateFieldInput>>
  location_SET?: InputMaybe<Scalars['String']['input']>
  name_SET?: InputMaybe<Scalars['String']['input']>
  relatesToCommunity?: InputMaybe<
    Array<CommunityRelatesToCommunityUpdateFieldInput>
  >
  resultsAchieved_SET?: InputMaybe<Scalars['String']['input']>
  status_SET?: InputMaybe<Scalars['Boolean']['input']>
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
  caresFor_CONTAINS?: InputMaybe<Scalars['String']['input']>
  caresFor_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  caresFor_EQ?: InputMaybe<Scalars['String']['input']>
  caresFor_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  caresFor_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  hasAccessToResourceAggregate?: InputMaybe<CommunityHasAccessToResourceAggregateInput>
  /** Return Communities where all of the related CommunityHasAccessToResourceConnections match this filter */
  hasAccessToResourceConnection_ALL?: InputMaybe<CommunityHasAccessToResourceConnectionWhere>
  /** Return Communities where none of the related CommunityHasAccessToResourceConnections match this filter */
  hasAccessToResourceConnection_NONE?: InputMaybe<CommunityHasAccessToResourceConnectionWhere>
  /** Return Communities where one of the related CommunityHasAccessToResourceConnections match this filter */
  hasAccessToResourceConnection_SINGLE?: InputMaybe<CommunityHasAccessToResourceConnectionWhere>
  /** Return Communities where some of the related CommunityHasAccessToResourceConnections match this filter */
  hasAccessToResourceConnection_SOME?: InputMaybe<CommunityHasAccessToResourceConnectionWhere>
  /** Return Communities where all of the related Resources match this filter */
  hasAccessToResource_ALL?: InputMaybe<ResourceWhere>
  /** Return Communities where none of the related Resources match this filter */
  hasAccessToResource_NONE?: InputMaybe<ResourceWhere>
  /** Return Communities where one of the related Resources match this filter */
  hasAccessToResource_SINGLE?: InputMaybe<ResourceWhere>
  /** Return Communities where some of the related Resources match this filter */
  hasAccessToResource_SOME?: InputMaybe<ResourceWhere>
  hasMembersAggregate?: InputMaybe<CommunityHasMembersAggregateInput>
  /** Return Communities where all of the related CommunityHasMembersConnections match this filter */
  hasMembersConnection_ALL?: InputMaybe<CommunityHasMembersConnectionWhere>
  /** Return Communities where none of the related CommunityHasMembersConnections match this filter */
  hasMembersConnection_NONE?: InputMaybe<CommunityHasMembersConnectionWhere>
  /** Return Communities where one of the related CommunityHasMembersConnections match this filter */
  hasMembersConnection_SINGLE?: InputMaybe<CommunityHasMembersConnectionWhere>
  /** Return Communities where some of the related CommunityHasMembersConnections match this filter */
  hasMembersConnection_SOME?: InputMaybe<CommunityHasMembersConnectionWhere>
  /** Return Communities where all of the related Members match this filter */
  hasMembers_ALL?: InputMaybe<MemberWhere>
  /** Return Communities where none of the related Members match this filter */
  hasMembers_NONE?: InputMaybe<MemberWhere>
  /** Return Communities where one of the related Members match this filter */
  hasMembers_SINGLE?: InputMaybe<MemberWhere>
  /** Return Communities where some of the related Members match this filter */
  hasMembers_SOME?: InputMaybe<MemberWhere>
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
  relatesToCommunityAggregate?: InputMaybe<CommunityRelatesToCommunityAggregateInput>
  /** Return Communities where all of the related CommunityRelatesToCommunityConnections match this filter */
  relatesToCommunityConnection_ALL?: InputMaybe<CommunityRelatesToCommunityConnectionWhere>
  /** Return Communities where none of the related CommunityRelatesToCommunityConnections match this filter */
  relatesToCommunityConnection_NONE?: InputMaybe<CommunityRelatesToCommunityConnectionWhere>
  /** Return Communities where one of the related CommunityRelatesToCommunityConnections match this filter */
  relatesToCommunityConnection_SINGLE?: InputMaybe<CommunityRelatesToCommunityConnectionWhere>
  /** Return Communities where some of the related CommunityRelatesToCommunityConnections match this filter */
  relatesToCommunityConnection_SOME?: InputMaybe<CommunityRelatesToCommunityConnectionWhere>
  /** Return Communities where all of the related Communities match this filter */
  relatesToCommunity_ALL?: InputMaybe<CommunityWhere>
  /** Return Communities where none of the related Communities match this filter */
  relatesToCommunity_NONE?: InputMaybe<CommunityWhere>
  /** Return Communities where one of the related Communities match this filter */
  relatesToCommunity_SINGLE?: InputMaybe<CommunityWhere>
  /** Return Communities where some of the related Communities match this filter */
  relatesToCommunity_SOME?: InputMaybe<CommunityWhere>
  resultsAchieved_CONTAINS?: InputMaybe<Scalars['String']['input']>
  resultsAchieved_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  resultsAchieved_EQ?: InputMaybe<Scalars['String']['input']>
  resultsAchieved_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  resultsAchieved_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  status_EQ?: InputMaybe<Scalars['Boolean']['input']>
  updatedAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_IN?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>
  updatedAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type CoreValue = {
  __typename?: 'CoreValue'
  alignmentChallenges?: Maybe<Scalars['String']['output']>
  alignmentExamples?: Maybe<Scalars['String']['output']>
  caresFor?: Maybe<Scalars['String']['output']>
  createdAt: Scalars['DateTime']['output']
  description?: Maybe<Scalars['String']['output']>
  guidesPerson: Array<Person>
  guidesPersonAggregate?: Maybe<CoreValuePersonGuidesPersonAggregationSelection>
  guidesPersonConnection: CoreValueGuidesPersonConnection
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  whoSupports?: Maybe<Scalars['String']['output']>
  why?: Maybe<Scalars['String']['output']>
}

export type CoreValueGuidesPersonArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type CoreValueGuidesPersonAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type CoreValueGuidesPersonConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueGuidesPersonConnectionSort>>
  where?: InputMaybe<CoreValueGuidesPersonConnectionWhere>
}

export type CoreValueAggregateSelection = {
  __typename?: 'CoreValueAggregateSelection'
  alignmentChallenges: StringAggregateSelection
  alignmentExamples: StringAggregateSelection
  caresFor: StringAggregateSelection
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
  guidesPerson?: InputMaybe<Array<CoreValueGuidesPersonConnectFieldInput>>
}

export type CoreValueConnectWhere = {
  node: CoreValueWhere
}

export type CoreValueCreateInput = {
  alignmentChallenges?: InputMaybe<Scalars['String']['input']>
  alignmentExamples?: InputMaybe<Scalars['String']['input']>
  caresFor?: InputMaybe<Scalars['String']['input']>
  description?: InputMaybe<Scalars['String']['input']>
  guidesPerson?: InputMaybe<CoreValueGuidesPersonFieldInput>
  name: Scalars['String']['input']
  whoSupports?: InputMaybe<Scalars['String']['input']>
  why?: InputMaybe<Scalars['String']['input']>
}

export type CoreValueDeleteInput = {
  guidesPerson?: InputMaybe<Array<CoreValueGuidesPersonDeleteFieldInput>>
}

export type CoreValueDisconnectInput = {
  guidesPerson?: InputMaybe<Array<CoreValueGuidesPersonDisconnectFieldInput>>
}

export type CoreValueEdge = {
  __typename?: 'CoreValueEdge'
  cursor: Scalars['String']['output']
  node: CoreValue
}

export type CoreValueGuidesPersonAggregateInput = {
  AND?: InputMaybe<Array<CoreValueGuidesPersonAggregateInput>>
  NOT?: InputMaybe<CoreValueGuidesPersonAggregateInput>
  OR?: InputMaybe<Array<CoreValueGuidesPersonAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CoreValueGuidesPersonNodeAggregationWhereInput>
}

export type CoreValueGuidesPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type CoreValueGuidesPersonConnection = {
  __typename?: 'CoreValueGuidesPersonConnection'
  edges: Array<CoreValueGuidesPersonRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CoreValueGuidesPersonConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type CoreValueGuidesPersonConnectionWhere = {
  AND?: InputMaybe<Array<CoreValueGuidesPersonConnectionWhere>>
  NOT?: InputMaybe<CoreValueGuidesPersonConnectionWhere>
  OR?: InputMaybe<Array<CoreValueGuidesPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type CoreValueGuidesPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type CoreValueGuidesPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<CoreValueGuidesPersonConnectionWhere>
}

export type CoreValueGuidesPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<CoreValueGuidesPersonConnectionWhere>
}

export type CoreValueGuidesPersonFieldInput = {
  connect?: InputMaybe<Array<CoreValueGuidesPersonConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueGuidesPersonCreateFieldInput>>
}

export type CoreValueGuidesPersonNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CoreValueGuidesPersonNodeAggregationWhereInput>>
  NOT?: InputMaybe<CoreValueGuidesPersonNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CoreValueGuidesPersonNodeAggregationWhereInput>>
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
  manual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  manual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type CoreValueGuidesPersonRelationship = {
  __typename?: 'CoreValueGuidesPersonRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type CoreValueGuidesPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type CoreValueGuidesPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<CoreValueGuidesPersonConnectFieldInput>>
  create?: InputMaybe<Array<CoreValueGuidesPersonCreateFieldInput>>
  delete?: InputMaybe<Array<CoreValueGuidesPersonDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CoreValueGuidesPersonDisconnectFieldInput>>
  update?: InputMaybe<CoreValueGuidesPersonUpdateConnectionInput>
  where?: InputMaybe<CoreValueGuidesPersonConnectionWhere>
}

export type CoreValueOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more CoreValueSort objects to sort CoreValues by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<CoreValueSort>>
}

export type CoreValuePersonGuidesPersonAggregationSelection = {
  __typename?: 'CoreValuePersonGuidesPersonAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CoreValuePersonGuidesPersonNodeAggregateSelection>
}

export type CoreValuePersonGuidesPersonNodeAggregateSelection = {
  __typename?: 'CoreValuePersonGuidesPersonNodeAggregateSelection'
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
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

/** Fields to sort CoreValues by. The order in which sorts are applied is not guaranteed when specifying many fields in one CoreValueSort object. */
export type CoreValueSort = {
  alignmentChallenges?: InputMaybe<SortDirection>
  alignmentExamples?: InputMaybe<SortDirection>
  caresFor?: InputMaybe<SortDirection>
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
  caresFor_SET?: InputMaybe<Scalars['String']['input']>
  description_SET?: InputMaybe<Scalars['String']['input']>
  guidesPerson?: InputMaybe<Array<CoreValueGuidesPersonUpdateFieldInput>>
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
  caresFor_CONTAINS?: InputMaybe<Scalars['String']['input']>
  caresFor_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  caresFor_EQ?: InputMaybe<Scalars['String']['input']>
  caresFor_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  caresFor_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  guidesPersonAggregate?: InputMaybe<CoreValueGuidesPersonAggregateInput>
  /** Return CoreValues where all of the related CoreValueGuidesPersonConnections match this filter */
  guidesPersonConnection_ALL?: InputMaybe<CoreValueGuidesPersonConnectionWhere>
  /** Return CoreValues where none of the related CoreValueGuidesPersonConnections match this filter */
  guidesPersonConnection_NONE?: InputMaybe<CoreValueGuidesPersonConnectionWhere>
  /** Return CoreValues where one of the related CoreValueGuidesPersonConnections match this filter */
  guidesPersonConnection_SINGLE?: InputMaybe<CoreValueGuidesPersonConnectionWhere>
  /** Return CoreValues where some of the related CoreValueGuidesPersonConnections match this filter */
  guidesPersonConnection_SOME?: InputMaybe<CoreValueGuidesPersonConnectionWhere>
  /** Return CoreValues where all of the related People match this filter */
  guidesPerson_ALL?: InputMaybe<PersonWhere>
  /** Return CoreValues where none of the related People match this filter */
  guidesPerson_NONE?: InputMaybe<PersonWhere>
  /** Return CoreValues where one of the related People match this filter */
  guidesPerson_SINGLE?: InputMaybe<PersonWhere>
  /** Return CoreValues where some of the related People match this filter */
  guidesPerson_SOME?: InputMaybe<PersonWhere>
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
  caresFor?: Maybe<Scalars['String']['output']>
  createdAt: Scalars['DateTime']['output']
  description: Scalars['String']['output']
  id: Scalars['ID']['output']
  location?: Maybe<Scalars['String']['output']>
  motivatesPerson: Array<Person>
  motivatesPersonAggregate?: Maybe<GoalPersonMotivatesPersonAggregationSelection>
  motivatesPersonConnection: GoalMotivatesPersonConnection
  name: Scalars['String']['output']
  photo?: Maybe<Scalars['String']['output']>
  status: Scalars['Boolean']['output']
  successMeasures?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['String']['output']>
  type: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type GoalMotivatesPersonArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonSort>>
  where?: InputMaybe<PersonWhere>
}

export type GoalMotivatesPersonAggregateArgs = {
  where?: InputMaybe<PersonWhere>
}

export type GoalMotivatesPersonConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GoalMotivatesPersonConnectionSort>>
  where?: InputMaybe<GoalMotivatesPersonConnectionWhere>
}

export type GoalAggregateSelection = {
  __typename?: 'GoalAggregateSelection'
  caresFor: StringAggregateSelection
  count: Scalars['Int']['output']
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  photo: StringAggregateSelection
  successMeasures: StringAggregateSelection
  time: StringAggregateSelection
  type: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type GoalCreateInput = {
  caresFor?: InputMaybe<Scalars['String']['input']>
  description: Scalars['String']['input']
  location?: InputMaybe<Scalars['String']['input']>
  motivatesPerson?: InputMaybe<GoalMotivatesPersonFieldInput>
  name: Scalars['String']['input']
  photo?: InputMaybe<Scalars['String']['input']>
  status: Scalars['Boolean']['input']
  successMeasures?: InputMaybe<Scalars['String']['input']>
  time?: InputMaybe<Scalars['String']['input']>
  type: Scalars['String']['input']
}

export type GoalDeleteInput = {
  motivatesPerson?: InputMaybe<Array<GoalMotivatesPersonDeleteFieldInput>>
}

export type GoalEdge = {
  __typename?: 'GoalEdge'
  cursor: Scalars['String']['output']
  node: Goal
}

export type GoalMotivatesPersonAggregateInput = {
  AND?: InputMaybe<Array<GoalMotivatesPersonAggregateInput>>
  NOT?: InputMaybe<GoalMotivatesPersonAggregateInput>
  OR?: InputMaybe<Array<GoalMotivatesPersonAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GoalMotivatesPersonNodeAggregationWhereInput>
}

export type GoalMotivatesPersonConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>
  where?: InputMaybe<PersonConnectWhere>
}

export type GoalMotivatesPersonConnection = {
  __typename?: 'GoalMotivatesPersonConnection'
  edges: Array<GoalMotivatesPersonRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GoalMotivatesPersonConnectionSort = {
  node?: InputMaybe<PersonSort>
}

export type GoalMotivatesPersonConnectionWhere = {
  AND?: InputMaybe<Array<GoalMotivatesPersonConnectionWhere>>
  NOT?: InputMaybe<GoalMotivatesPersonConnectionWhere>
  OR?: InputMaybe<Array<GoalMotivatesPersonConnectionWhere>>
  node?: InputMaybe<PersonWhere>
}

export type GoalMotivatesPersonCreateFieldInput = {
  node: PersonCreateInput
}

export type GoalMotivatesPersonDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>
  where?: InputMaybe<GoalMotivatesPersonConnectionWhere>
}

export type GoalMotivatesPersonDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>
  where?: InputMaybe<GoalMotivatesPersonConnectionWhere>
}

export type GoalMotivatesPersonFieldInput = {
  connect?: InputMaybe<Array<GoalMotivatesPersonConnectFieldInput>>
  create?: InputMaybe<Array<GoalMotivatesPersonCreateFieldInput>>
}

export type GoalMotivatesPersonNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GoalMotivatesPersonNodeAggregationWhereInput>>
  NOT?: InputMaybe<GoalMotivatesPersonNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GoalMotivatesPersonNodeAggregationWhereInput>>
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
  manual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  manual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type GoalMotivatesPersonRelationship = {
  __typename?: 'GoalMotivatesPersonRelationship'
  cursor: Scalars['String']['output']
  node: Person
}

export type GoalMotivatesPersonUpdateConnectionInput = {
  node?: InputMaybe<PersonUpdateInput>
}

export type GoalMotivatesPersonUpdateFieldInput = {
  connect?: InputMaybe<Array<GoalMotivatesPersonConnectFieldInput>>
  create?: InputMaybe<Array<GoalMotivatesPersonCreateFieldInput>>
  delete?: InputMaybe<Array<GoalMotivatesPersonDeleteFieldInput>>
  disconnect?: InputMaybe<Array<GoalMotivatesPersonDisconnectFieldInput>>
  update?: InputMaybe<GoalMotivatesPersonUpdateConnectionInput>
  where?: InputMaybe<GoalMotivatesPersonConnectionWhere>
}

export type GoalOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more GoalSort objects to sort Goals by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<GoalSort>>
}

export type GoalPersonMotivatesPersonAggregationSelection = {
  __typename?: 'GoalPersonMotivatesPersonAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GoalPersonMotivatesPersonNodeAggregateSelection>
}

export type GoalPersonMotivatesPersonNodeAggregateSelection = {
  __typename?: 'GoalPersonMotivatesPersonNodeAggregateSelection'
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
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

/** Fields to sort Goals by. The order in which sorts are applied is not guaranteed when specifying many fields in one GoalSort object. */
export type GoalSort = {
  caresFor?: InputMaybe<SortDirection>
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
  caresFor_SET?: InputMaybe<Scalars['String']['input']>
  description_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  motivatesPerson?: InputMaybe<Array<GoalMotivatesPersonUpdateFieldInput>>
  name_SET?: InputMaybe<Scalars['String']['input']>
  photo_SET?: InputMaybe<Scalars['String']['input']>
  status_SET?: InputMaybe<Scalars['Boolean']['input']>
  successMeasures_SET?: InputMaybe<Scalars['String']['input']>
  time_SET?: InputMaybe<Scalars['String']['input']>
  type_SET?: InputMaybe<Scalars['String']['input']>
}

export type GoalWhere = {
  AND?: InputMaybe<Array<GoalWhere>>
  NOT?: InputMaybe<GoalWhere>
  OR?: InputMaybe<Array<GoalWhere>>
  caresFor_CONTAINS?: InputMaybe<Scalars['String']['input']>
  caresFor_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  caresFor_EQ?: InputMaybe<Scalars['String']['input']>
  caresFor_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  caresFor_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  location_CONTAINS?: InputMaybe<Scalars['String']['input']>
  location_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  location_EQ?: InputMaybe<Scalars['String']['input']>
  location_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  location_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  motivatesPersonAggregate?: InputMaybe<GoalMotivatesPersonAggregateInput>
  /** Return Goals where all of the related GoalMotivatesPersonConnections match this filter */
  motivatesPersonConnection_ALL?: InputMaybe<GoalMotivatesPersonConnectionWhere>
  /** Return Goals where none of the related GoalMotivatesPersonConnections match this filter */
  motivatesPersonConnection_NONE?: InputMaybe<GoalMotivatesPersonConnectionWhere>
  /** Return Goals where one of the related GoalMotivatesPersonConnections match this filter */
  motivatesPersonConnection_SINGLE?: InputMaybe<GoalMotivatesPersonConnectionWhere>
  /** Return Goals where some of the related GoalMotivatesPersonConnections match this filter */
  motivatesPersonConnection_SOME?: InputMaybe<GoalMotivatesPersonConnectionWhere>
  /** Return Goals where all of the related People match this filter */
  motivatesPerson_ALL?: InputMaybe<PersonWhere>
  /** Return Goals where none of the related People match this filter */
  motivatesPerson_NONE?: InputMaybe<PersonWhere>
  /** Return Goals where one of the related People match this filter */
  motivatesPerson_SINGLE?: InputMaybe<PersonWhere>
  /** Return Goals where some of the related People match this filter */
  motivatesPerson_SOME?: InputMaybe<PersonWhere>
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
  status_EQ?: InputMaybe<Scalars['Boolean']['input']>
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
  authId: Scalars['String']['output']
  avatar?: Maybe<Scalars['String']['output']>
  circles?: Maybe<Scalars['String']['output']>
  community: Array<Community>
  communityAggregate?: Maybe<MemberCommunityCommunityAggregationSelection>
  communityConnection: MemberCommunityConnection
  connectsToMember: Array<Member>
  connectsToMemberAggregate?: Maybe<MemberMemberConnectsToMemberAggregationSelection>
  connectsToMemberConnection: MemberConnectsToMemberConnection
  createdAt: Scalars['DateTime']['output']
  email?: Maybe<Scalars['String']['output']>
  favourites?: Maybe<Scalars['String']['output']>
  fieldsOfCare?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  gender?: Maybe<Scalars['String']['output']>
  guidedBy: Array<CoreValue>
  guidedByAggregate?: Maybe<MemberCoreValueGuidedByAggregationSelection>
  guidedByConnection: PersonInterfaceGuidedByConnection
  id: Scalars['ID']['output']
  interests?: Maybe<Scalars['String']['output']>
  lastName: Scalars['String']['output']
  location?: Maybe<Scalars['String']['output']>
  manual?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  passions?: Maybe<Scalars['String']['output']>
  phone?: Maybe<Scalars['String']['output']>
  photo?: Maybe<Scalars['String']['output']>
  pronouns?: Maybe<Scalars['String']['output']>
  signupDate: Scalars['Date']['output']
  status: Scalars['Boolean']['output']
  traits?: Maybe<Scalars['String']['output']>
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

export type MemberConnectsToMemberArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberSort>>
  where?: InputMaybe<MemberWhere>
}

export type MemberConnectsToMemberAggregateArgs = {
  where?: InputMaybe<MemberWhere>
}

export type MemberConnectsToMemberConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberConnectsToMemberConnectionSort>>
  where?: InputMaybe<MemberConnectsToMemberConnectionWhere>
}

export type MemberGuidedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueSort>>
  where?: InputMaybe<CoreValueWhere>
}

export type MemberGuidedByAggregateArgs = {
  where?: InputMaybe<CoreValueWhere>
}

export type MemberGuidedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonInterfaceGuidedByConnectionSort>>
  where?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
}

export type MemberAggregateSelection = {
  __typename?: 'MemberAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
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
  manual: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  traits: StringAggregateSelection
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
  activities: StringAggregateSelection
  caresFor: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  id: IdAggregateSelection
  location: StringAggregateSelection
  name: StringAggregateSelection
  resultsAchieved: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type MemberCommunityConnectFieldInput = {
  connect?: InputMaybe<Array<CommunityConnectInput>>
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
  delete?: InputMaybe<CommunityDeleteInput>
  where?: InputMaybe<MemberCommunityConnectionWhere>
}

export type MemberCommunityDisconnectFieldInput = {
  disconnect?: InputMaybe<CommunityDisconnectInput>
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
  caresFor_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  caresFor_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type MemberConnectInput = {
  community?: InputMaybe<Array<MemberCommunityConnectFieldInput>>
  connectsToMember?: InputMaybe<Array<MemberConnectsToMemberConnectFieldInput>>
  guidedBy?: InputMaybe<Array<MemberGuidedByConnectFieldInput>>
}

export type MemberConnectWhere = {
  node: MemberWhere
}

export type MemberConnectsToMemberAggregateInput = {
  AND?: InputMaybe<Array<MemberConnectsToMemberAggregateInput>>
  NOT?: InputMaybe<MemberConnectsToMemberAggregateInput>
  OR?: InputMaybe<Array<MemberConnectsToMemberAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberConnectsToMemberNodeAggregationWhereInput>
}

export type MemberConnectsToMemberConnectFieldInput = {
  connect?: InputMaybe<Array<MemberConnectInput>>
  where?: InputMaybe<MemberConnectWhere>
}

export type MemberConnectsToMemberConnection = {
  __typename?: 'MemberConnectsToMemberConnection'
  edges: Array<MemberConnectsToMemberRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberConnectsToMemberConnectionSort = {
  node?: InputMaybe<MemberSort>
}

export type MemberConnectsToMemberConnectionWhere = {
  AND?: InputMaybe<Array<MemberConnectsToMemberConnectionWhere>>
  NOT?: InputMaybe<MemberConnectsToMemberConnectionWhere>
  OR?: InputMaybe<Array<MemberConnectsToMemberConnectionWhere>>
  node?: InputMaybe<MemberWhere>
}

export type MemberConnectsToMemberCreateFieldInput = {
  node: MemberCreateInput
}

export type MemberConnectsToMemberDeleteFieldInput = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<MemberConnectsToMemberConnectionWhere>
}

export type MemberConnectsToMemberDisconnectFieldInput = {
  disconnect?: InputMaybe<MemberDisconnectInput>
  where?: InputMaybe<MemberConnectsToMemberConnectionWhere>
}

export type MemberConnectsToMemberFieldInput = {
  connect?: InputMaybe<Array<MemberConnectsToMemberConnectFieldInput>>
  create?: InputMaybe<Array<MemberConnectsToMemberCreateFieldInput>>
}

export type MemberConnectsToMemberNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberConnectsToMemberNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberConnectsToMemberNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberConnectsToMemberNodeAggregationWhereInput>>
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
  manual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  manual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type MemberConnectsToMemberRelationship = {
  __typename?: 'MemberConnectsToMemberRelationship'
  cursor: Scalars['String']['output']
  node: Member
}

export type MemberConnectsToMemberUpdateConnectionInput = {
  node?: InputMaybe<MemberUpdateInput>
}

export type MemberConnectsToMemberUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberConnectsToMemberConnectFieldInput>>
  create?: InputMaybe<Array<MemberConnectsToMemberCreateFieldInput>>
  delete?: InputMaybe<Array<MemberConnectsToMemberDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberConnectsToMemberDisconnectFieldInput>>
  update?: InputMaybe<MemberConnectsToMemberUpdateConnectionInput>
  where?: InputMaybe<MemberConnectsToMemberConnectionWhere>
}

export type MemberCoreValueGuidedByAggregationSelection = {
  __typename?: 'MemberCoreValueGuidedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberCoreValueGuidedByNodeAggregateSelection>
}

export type MemberCoreValueGuidedByNodeAggregateSelection = {
  __typename?: 'MemberCoreValueGuidedByNodeAggregateSelection'
  alignmentChallenges: StringAggregateSelection
  alignmentExamples: StringAggregateSelection
  caresFor: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  name: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  whoSupports: StringAggregateSelection
  why: StringAggregateSelection
}

export type MemberCreateInput = {
  authId: Scalars['String']['input']
  avatar?: InputMaybe<Scalars['String']['input']>
  circles?: InputMaybe<Scalars['String']['input']>
  community?: InputMaybe<MemberCommunityFieldInput>
  connectsToMember?: InputMaybe<MemberConnectsToMemberFieldInput>
  email?: InputMaybe<Scalars['String']['input']>
  favourites?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare?: InputMaybe<Scalars['String']['input']>
  firstName: Scalars['String']['input']
  gender?: InputMaybe<Scalars['String']['input']>
  guidedBy?: InputMaybe<MemberGuidedByFieldInput>
  interests?: InputMaybe<Scalars['String']['input']>
  lastName: Scalars['String']['input']
  location?: InputMaybe<Scalars['String']['input']>
  manual?: InputMaybe<Scalars['String']['input']>
  passions?: InputMaybe<Scalars['String']['input']>
  phone?: InputMaybe<Scalars['String']['input']>
  photo?: InputMaybe<Scalars['String']['input']>
  pronouns?: InputMaybe<Scalars['String']['input']>
  signupDate: Scalars['Date']['input']
  status: Scalars['Boolean']['input']
  traits?: InputMaybe<Scalars['String']['input']>
}

export type MemberDeleteInput = {
  community?: InputMaybe<Array<MemberCommunityDeleteFieldInput>>
  connectsToMember?: InputMaybe<Array<MemberConnectsToMemberDeleteFieldInput>>
  guidedBy?: InputMaybe<Array<PersonInterfaceGuidedByDeleteFieldInput>>
}

export type MemberDisconnectInput = {
  community?: InputMaybe<Array<MemberCommunityDisconnectFieldInput>>
  connectsToMember?: InputMaybe<
    Array<MemberConnectsToMemberDisconnectFieldInput>
  >
  guidedBy?: InputMaybe<Array<PersonInterfaceGuidedByDisconnectFieldInput>>
}

export type MemberEdge = {
  __typename?: 'MemberEdge'
  cursor: Scalars['String']['output']
  node: Member
}

export type MemberGuidedByAggregateInput = {
  AND?: InputMaybe<Array<MemberGuidedByAggregateInput>>
  NOT?: InputMaybe<MemberGuidedByAggregateInput>
  OR?: InputMaybe<Array<MemberGuidedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberGuidedByNodeAggregationWhereInput>
}

export type MemberGuidedByConnectFieldInput = {
  connect?: InputMaybe<Array<CoreValueConnectInput>>
  where?: InputMaybe<CoreValueConnectWhere>
}

export type MemberGuidedByCreateFieldInput = {
  node: CoreValueCreateInput
}

export type MemberGuidedByFieldInput = {
  connect?: InputMaybe<Array<MemberGuidedByConnectFieldInput>>
  create?: InputMaybe<Array<MemberGuidedByCreateFieldInput>>
}

export type MemberGuidedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberGuidedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberGuidedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberGuidedByNodeAggregationWhereInput>>
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
  caresFor_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  caresFor_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type MemberGuidedByUpdateConnectionInput = {
  node?: InputMaybe<CoreValueUpdateInput>
}

export type MemberGuidedByUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberGuidedByConnectFieldInput>>
  create?: InputMaybe<Array<MemberGuidedByCreateFieldInput>>
  delete?: InputMaybe<Array<PersonInterfaceGuidedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonInterfaceGuidedByDisconnectFieldInput>>
  update?: InputMaybe<MemberGuidedByUpdateConnectionInput>
  where?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
}

export type MemberMemberConnectsToMemberAggregationSelection = {
  __typename?: 'MemberMemberConnectsToMemberAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberMemberConnectsToMemberNodeAggregateSelection>
}

export type MemberMemberConnectsToMemberNodeAggregateSelection = {
  __typename?: 'MemberMemberConnectsToMemberNodeAggregateSelection'
  authId: StringAggregateSelection
  avatar: StringAggregateSelection
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
  manual: StringAggregateSelection
  passions: StringAggregateSelection
  phone: StringAggregateSelection
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  traits: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
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
  avatar?: InputMaybe<SortDirection>
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
  manual?: InputMaybe<SortDirection>
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
  circles_SET?: InputMaybe<Scalars['String']['input']>
  community?: InputMaybe<Array<MemberCommunityUpdateFieldInput>>
  connectsToMember?: InputMaybe<Array<MemberConnectsToMemberUpdateFieldInput>>
  email_SET?: InputMaybe<Scalars['String']['input']>
  favourites_SET?: InputMaybe<Scalars['String']['input']>
  fieldsOfCare_SET?: InputMaybe<Scalars['String']['input']>
  firstName_SET?: InputMaybe<Scalars['String']['input']>
  gender_SET?: InputMaybe<Scalars['String']['input']>
  guidedBy?: InputMaybe<Array<MemberGuidedByUpdateFieldInput>>
  interests_SET?: InputMaybe<Scalars['String']['input']>
  lastName_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  manual_SET?: InputMaybe<Scalars['String']['input']>
  passions_SET?: InputMaybe<Scalars['String']['input']>
  phone_SET?: InputMaybe<Scalars['String']['input']>
  photo_SET?: InputMaybe<Scalars['String']['input']>
  pronouns_SET?: InputMaybe<Scalars['String']['input']>
  signupDate_SET?: InputMaybe<Scalars['Date']['input']>
  status_SET?: InputMaybe<Scalars['Boolean']['input']>
  traits_SET?: InputMaybe<Scalars['String']['input']>
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
  avatar_CONTAINS?: InputMaybe<Scalars['String']['input']>
  avatar_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  avatar_EQ?: InputMaybe<Scalars['String']['input']>
  avatar_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  avatar_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  circles_CONTAINS?: InputMaybe<Scalars['String']['input']>
  circles_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  circles_EQ?: InputMaybe<Scalars['String']['input']>
  circles_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  circles_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
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
  connectsToMemberAggregate?: InputMaybe<MemberConnectsToMemberAggregateInput>
  /** Return Members where all of the related MemberConnectsToMemberConnections match this filter */
  connectsToMemberConnection_ALL?: InputMaybe<MemberConnectsToMemberConnectionWhere>
  /** Return Members where none of the related MemberConnectsToMemberConnections match this filter */
  connectsToMemberConnection_NONE?: InputMaybe<MemberConnectsToMemberConnectionWhere>
  /** Return Members where one of the related MemberConnectsToMemberConnections match this filter */
  connectsToMemberConnection_SINGLE?: InputMaybe<MemberConnectsToMemberConnectionWhere>
  /** Return Members where some of the related MemberConnectsToMemberConnections match this filter */
  connectsToMemberConnection_SOME?: InputMaybe<MemberConnectsToMemberConnectionWhere>
  /** Return Members where all of the related Members match this filter */
  connectsToMember_ALL?: InputMaybe<MemberWhere>
  /** Return Members where none of the related Members match this filter */
  connectsToMember_NONE?: InputMaybe<MemberWhere>
  /** Return Members where one of the related Members match this filter */
  connectsToMember_SINGLE?: InputMaybe<MemberWhere>
  /** Return Members where some of the related Members match this filter */
  connectsToMember_SOME?: InputMaybe<MemberWhere>
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
  guidedByAggregate?: InputMaybe<MemberGuidedByAggregateInput>
  /** Return Members where all of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_ALL?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return Members where none of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_NONE?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return Members where one of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_SINGLE?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return Members where some of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_SOME?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return Members where all of the related CoreValues match this filter */
  guidedBy_ALL?: InputMaybe<CoreValueWhere>
  /** Return Members where none of the related CoreValues match this filter */
  guidedBy_NONE?: InputMaybe<CoreValueWhere>
  /** Return Members where one of the related CoreValues match this filter */
  guidedBy_SINGLE?: InputMaybe<CoreValueWhere>
  /** Return Members where some of the related CoreValues match this filter */
  guidedBy_SOME?: InputMaybe<CoreValueWhere>
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
  signupDate_EQ?: InputMaybe<Scalars['Date']['input']>
  signupDate_GT?: InputMaybe<Scalars['Date']['input']>
  signupDate_GTE?: InputMaybe<Scalars['Date']['input']>
  signupDate_IN?: InputMaybe<Array<Scalars['Date']['input']>>
  signupDate_LT?: InputMaybe<Scalars['Date']['input']>
  signupDate_LTE?: InputMaybe<Scalars['Date']['input']>
  status_EQ?: InputMaybe<Scalars['Boolean']['input']>
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
  delete?: InputMaybe<PersonDeleteInput>
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
  createdAt: Scalars['DateTime']['output']
  email?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  gender?: Maybe<Scalars['String']['output']>
  guidedBy: Array<CoreValue>
  guidedByAggregate?: Maybe<PersonCoreValueGuidedByAggregationSelection>
  guidedByConnection: PersonInterfaceGuidedByConnection
  id: Scalars['ID']['output']
  interests?: Maybe<Scalars['String']['output']>
  lastName: Scalars['String']['output']
  location?: Maybe<Scalars['String']['output']>
  manual?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  phone?: Maybe<Scalars['String']['output']>
  photo?: Maybe<Scalars['String']['output']>
  pronouns?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type PersonGuidedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueSort>>
  where?: InputMaybe<CoreValueWhere>
}

export type PersonGuidedByAggregateArgs = {
  where?: InputMaybe<CoreValueWhere>
}

export type PersonGuidedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonInterfaceGuidedByConnectionSort>>
  where?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
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
  photo: StringAggregateSelection
  pronouns: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type PersonConnectInput = {
  guidedBy?: InputMaybe<Array<PersonGuidedByConnectFieldInput>>
}

export type PersonConnectWhere = {
  node: PersonWhere
}

export type PersonCoreValueGuidedByAggregationSelection = {
  __typename?: 'PersonCoreValueGuidedByAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<PersonCoreValueGuidedByNodeAggregateSelection>
}

export type PersonCoreValueGuidedByNodeAggregateSelection = {
  __typename?: 'PersonCoreValueGuidedByNodeAggregateSelection'
  alignmentChallenges: StringAggregateSelection
  alignmentExamples: StringAggregateSelection
  caresFor: StringAggregateSelection
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  name: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
  whoSupports: StringAggregateSelection
  why: StringAggregateSelection
}

export type PersonCreateInput = {
  email?: InputMaybe<Scalars['String']['input']>
  firstName: Scalars['String']['input']
  gender?: InputMaybe<Scalars['String']['input']>
  guidedBy?: InputMaybe<PersonGuidedByFieldInput>
  interests?: InputMaybe<Scalars['String']['input']>
  lastName: Scalars['String']['input']
  location?: InputMaybe<Scalars['String']['input']>
  manual?: InputMaybe<Scalars['String']['input']>
  phone?: InputMaybe<Scalars['String']['input']>
  photo?: InputMaybe<Scalars['String']['input']>
  pronouns?: InputMaybe<Scalars['String']['input']>
}

export type PersonDeleteInput = {
  guidedBy?: InputMaybe<Array<PersonInterfaceGuidedByDeleteFieldInput>>
}

export type PersonDisconnectInput = {
  guidedBy?: InputMaybe<Array<PersonInterfaceGuidedByDisconnectFieldInput>>
}

export type PersonEdge = {
  __typename?: 'PersonEdge'
  cursor: Scalars['String']['output']
  node: Person
}

export type PersonGuidedByAggregateInput = {
  AND?: InputMaybe<Array<PersonGuidedByAggregateInput>>
  NOT?: InputMaybe<PersonGuidedByAggregateInput>
  OR?: InputMaybe<Array<PersonGuidedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<PersonGuidedByNodeAggregationWhereInput>
}

export type PersonGuidedByConnectFieldInput = {
  connect?: InputMaybe<Array<CoreValueConnectInput>>
  where?: InputMaybe<CoreValueConnectWhere>
}

export type PersonGuidedByCreateFieldInput = {
  node: CoreValueCreateInput
}

export type PersonGuidedByFieldInput = {
  connect?: InputMaybe<Array<PersonGuidedByConnectFieldInput>>
  create?: InputMaybe<Array<PersonGuidedByCreateFieldInput>>
}

export type PersonGuidedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonGuidedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonGuidedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonGuidedByNodeAggregationWhereInput>>
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
  caresFor_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  caresFor_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type PersonGuidedByUpdateConnectionInput = {
  node?: InputMaybe<CoreValueUpdateInput>
}

export type PersonGuidedByUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonGuidedByConnectFieldInput>>
  create?: InputMaybe<Array<PersonGuidedByCreateFieldInput>>
  delete?: InputMaybe<Array<PersonInterfaceGuidedByDeleteFieldInput>>
  disconnect?: InputMaybe<Array<PersonInterfaceGuidedByDisconnectFieldInput>>
  update?: InputMaybe<PersonGuidedByUpdateConnectionInput>
  where?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
}

export type PersonInterface = {
  createdAt: Scalars['DateTime']['output']
  email?: Maybe<Scalars['String']['output']>
  firstName: Scalars['String']['output']
  gender?: Maybe<Scalars['String']['output']>
  guidedBy: Array<CoreValue>
  guidedByConnection: PersonInterfaceGuidedByConnection
  id: Scalars['ID']['output']
  interests?: Maybe<Scalars['String']['output']>
  lastName: Scalars['String']['output']
  location?: Maybe<Scalars['String']['output']>
  manual?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  phone?: Maybe<Scalars['String']['output']>
  photo?: Maybe<Scalars['String']['output']>
  pronouns?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type PersonInterfaceGuidedByArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CoreValueSort>>
  where?: InputMaybe<CoreValueWhere>
}

export type PersonInterfaceGuidedByConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<PersonInterfaceGuidedByConnectionSort>>
  where?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
}

export type PersonInterfaceAggregateSelection = {
  __typename?: 'PersonInterfaceAggregateSelection'
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

export type PersonInterfaceGuidedByAggregateInput = {
  AND?: InputMaybe<Array<PersonInterfaceGuidedByAggregateInput>>
  NOT?: InputMaybe<PersonInterfaceGuidedByAggregateInput>
  OR?: InputMaybe<Array<PersonInterfaceGuidedByAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<PersonInterfaceGuidedByNodeAggregationWhereInput>
}

export type PersonInterfaceGuidedByConnection = {
  __typename?: 'PersonInterfaceGuidedByConnection'
  edges: Array<PersonInterfaceGuidedByRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type PersonInterfaceGuidedByConnectionSort = {
  node?: InputMaybe<CoreValueSort>
}

export type PersonInterfaceGuidedByConnectionWhere = {
  AND?: InputMaybe<Array<PersonInterfaceGuidedByConnectionWhere>>
  NOT?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  OR?: InputMaybe<Array<PersonInterfaceGuidedByConnectionWhere>>
  node?: InputMaybe<CoreValueWhere>
}

export type PersonInterfaceGuidedByDeleteFieldInput = {
  delete?: InputMaybe<CoreValueDeleteInput>
  where?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
}

export type PersonInterfaceGuidedByDisconnectFieldInput = {
  disconnect?: InputMaybe<CoreValueDisconnectInput>
  where?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
}

export type PersonInterfaceGuidedByNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<PersonInterfaceGuidedByNodeAggregationWhereInput>>
  NOT?: InputMaybe<PersonInterfaceGuidedByNodeAggregationWhereInput>
  OR?: InputMaybe<Array<PersonInterfaceGuidedByNodeAggregationWhereInput>>
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
  caresFor_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  caresFor_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  caresFor_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  caresFor_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  caresFor_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type PersonInterfaceGuidedByRelationship = {
  __typename?: 'PersonInterfaceGuidedByRelationship'
  cursor: Scalars['String']['output']
  node: CoreValue
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
  gender?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  interests?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  location?: InputMaybe<SortDirection>
  manual?: InputMaybe<SortDirection>
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
  guidedByAggregate?: InputMaybe<PersonInterfaceGuidedByAggregateInput>
  /** Return PersonInterfaces where all of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_ALL?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return PersonInterfaces where none of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_NONE?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return PersonInterfaces where one of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_SINGLE?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return PersonInterfaces where some of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_SOME?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return PersonInterfaces where all of the related CoreValues match this filter */
  guidedBy_ALL?: InputMaybe<CoreValueWhere>
  /** Return PersonInterfaces where none of the related CoreValues match this filter */
  guidedBy_NONE?: InputMaybe<CoreValueWhere>
  /** Return PersonInterfaces where one of the related CoreValues match this filter */
  guidedBy_SINGLE?: InputMaybe<CoreValueWhere>
  /** Return PersonInterfaces where some of the related CoreValues match this filter */
  guidedBy_SOME?: InputMaybe<CoreValueWhere>
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
  photo?: InputMaybe<SortDirection>
  pronouns?: InputMaybe<SortDirection>
  updatedAt?: InputMaybe<SortDirection>
}

export type PersonUpdateInput = {
  email_SET?: InputMaybe<Scalars['String']['input']>
  firstName_SET?: InputMaybe<Scalars['String']['input']>
  gender_SET?: InputMaybe<Scalars['String']['input']>
  guidedBy?: InputMaybe<Array<PersonGuidedByUpdateFieldInput>>
  interests_SET?: InputMaybe<Scalars['String']['input']>
  lastName_SET?: InputMaybe<Scalars['String']['input']>
  location_SET?: InputMaybe<Scalars['String']['input']>
  manual_SET?: InputMaybe<Scalars['String']['input']>
  phone_SET?: InputMaybe<Scalars['String']['input']>
  photo_SET?: InputMaybe<Scalars['String']['input']>
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
  guidedByAggregate?: InputMaybe<PersonGuidedByAggregateInput>
  /** Return People where all of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_ALL?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return People where none of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_NONE?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return People where one of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_SINGLE?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return People where some of the related PersonInterfaceGuidedByConnections match this filter */
  guidedByConnection_SOME?: InputMaybe<PersonInterfaceGuidedByConnectionWhere>
  /** Return People where all of the related CoreValues match this filter */
  guidedBy_ALL?: InputMaybe<CoreValueWhere>
  /** Return People where none of the related CoreValues match this filter */
  guidedBy_NONE?: InputMaybe<CoreValueWhere>
  /** Return People where one of the related CoreValues match this filter */
  guidedBy_SINGLE?: InputMaybe<CoreValueWhere>
  /** Return People where some of the related CoreValues match this filter */
  guidedBy_SOME?: InputMaybe<CoreValueWhere>
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
  appliedToCarePoint: Array<CarePoint>
  appliedToCarePointAggregate?: Maybe<ResourceCarePointAppliedToCarePointAggregationSelection>
  appliedToCarePointConnection: ResourceAppliedToCarePointConnection
  createdAt: Scalars['DateTime']['output']
  dependsOnResource: Array<Resource>
  dependsOnResourceAggregate?: Maybe<ResourceResourceDependsOnResourceAggregationSelection>
  dependsOnResourceConnection: ResourceDependsOnResourceConnection
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  location?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  providedByPerson: Array<Person>
  providedByPersonAggregate?: Maybe<ResourcePersonProvidedByPersonAggregationSelection>
  providedByPersonConnection: ResourceProvidedByPersonConnection
  status?: Maybe<Scalars['String']['output']>
  time?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  why?: Maybe<Scalars['String']['output']>
}

export type ResourceAppliedToCarePointArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CarePointSort>>
  where?: InputMaybe<CarePointWhere>
}

export type ResourceAppliedToCarePointAggregateArgs = {
  where?: InputMaybe<CarePointWhere>
}

export type ResourceAppliedToCarePointConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceAppliedToCarePointConnectionSort>>
  where?: InputMaybe<ResourceAppliedToCarePointConnectionWhere>
}

export type ResourceDependsOnResourceArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceSort>>
  where?: InputMaybe<ResourceWhere>
}

export type ResourceDependsOnResourceAggregateArgs = {
  where?: InputMaybe<ResourceWhere>
}

export type ResourceDependsOnResourceConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ResourceDependsOnResourceConnectionSort>>
  where?: InputMaybe<ResourceDependsOnResourceConnectionWhere>
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

export type ResourceAppliedToCarePointAggregateInput = {
  AND?: InputMaybe<Array<ResourceAppliedToCarePointAggregateInput>>
  NOT?: InputMaybe<ResourceAppliedToCarePointAggregateInput>
  OR?: InputMaybe<Array<ResourceAppliedToCarePointAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourceAppliedToCarePointNodeAggregationWhereInput>
}

export type ResourceAppliedToCarePointConnectFieldInput = {
  where?: InputMaybe<CarePointConnectWhere>
}

export type ResourceAppliedToCarePointConnection = {
  __typename?: 'ResourceAppliedToCarePointConnection'
  edges: Array<ResourceAppliedToCarePointRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResourceAppliedToCarePointConnectionSort = {
  node?: InputMaybe<CarePointSort>
}

export type ResourceAppliedToCarePointConnectionWhere = {
  AND?: InputMaybe<Array<ResourceAppliedToCarePointConnectionWhere>>
  NOT?: InputMaybe<ResourceAppliedToCarePointConnectionWhere>
  OR?: InputMaybe<Array<ResourceAppliedToCarePointConnectionWhere>>
  node?: InputMaybe<CarePointWhere>
}

export type ResourceAppliedToCarePointCreateFieldInput = {
  node: CarePointCreateInput
}

export type ResourceAppliedToCarePointDeleteFieldInput = {
  where?: InputMaybe<ResourceAppliedToCarePointConnectionWhere>
}

export type ResourceAppliedToCarePointDisconnectFieldInput = {
  where?: InputMaybe<ResourceAppliedToCarePointConnectionWhere>
}

export type ResourceAppliedToCarePointFieldInput = {
  connect?: InputMaybe<Array<ResourceAppliedToCarePointConnectFieldInput>>
  create?: InputMaybe<Array<ResourceAppliedToCarePointCreateFieldInput>>
}

export type ResourceAppliedToCarePointNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourceAppliedToCarePointNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourceAppliedToCarePointNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourceAppliedToCarePointNodeAggregationWhereInput>>
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

export type ResourceAppliedToCarePointRelationship = {
  __typename?: 'ResourceAppliedToCarePointRelationship'
  cursor: Scalars['String']['output']
  node: CarePoint
}

export type ResourceAppliedToCarePointUpdateConnectionInput = {
  node?: InputMaybe<CarePointUpdateInput>
}

export type ResourceAppliedToCarePointUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourceAppliedToCarePointConnectFieldInput>>
  create?: InputMaybe<Array<ResourceAppliedToCarePointCreateFieldInput>>
  delete?: InputMaybe<Array<ResourceAppliedToCarePointDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResourceAppliedToCarePointDisconnectFieldInput>>
  update?: InputMaybe<ResourceAppliedToCarePointUpdateConnectionInput>
  where?: InputMaybe<ResourceAppliedToCarePointConnectionWhere>
}

export type ResourceCarePointAppliedToCarePointAggregationSelection = {
  __typename?: 'ResourceCarePointAppliedToCarePointAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourceCarePointAppliedToCarePointNodeAggregateSelection>
}

export type ResourceCarePointAppliedToCarePointNodeAggregateSelection = {
  __typename?: 'ResourceCarePointAppliedToCarePointNodeAggregateSelection'
  createdAt: DateTimeAggregateSelection
  description: StringAggregateSelection
  id: IdAggregateSelection
  status: StringAggregateSelection
  updatedAt: DateTimeAggregateSelection
}

export type ResourceConnectInput = {
  appliedToCarePoint?: InputMaybe<
    Array<ResourceAppliedToCarePointConnectFieldInput>
  >
  dependsOnResource?: InputMaybe<
    Array<ResourceDependsOnResourceConnectFieldInput>
  >
  providedByPerson?: InputMaybe<
    Array<ResourceProvidedByPersonConnectFieldInput>
  >
}

export type ResourceConnectWhere = {
  node: ResourceWhere
}

export type ResourceCreateInput = {
  appliedToCarePoint?: InputMaybe<ResourceAppliedToCarePointFieldInput>
  dependsOnResource?: InputMaybe<ResourceDependsOnResourceFieldInput>
  description?: InputMaybe<Scalars['String']['input']>
  location?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  providedByPerson?: InputMaybe<ResourceProvidedByPersonFieldInput>
  status?: InputMaybe<Scalars['String']['input']>
  time?: InputMaybe<Scalars['String']['input']>
  why?: InputMaybe<Scalars['String']['input']>
}

export type ResourceDeleteInput = {
  appliedToCarePoint?: InputMaybe<
    Array<ResourceAppliedToCarePointDeleteFieldInput>
  >
  dependsOnResource?: InputMaybe<
    Array<ResourceDependsOnResourceDeleteFieldInput>
  >
  providedByPerson?: InputMaybe<Array<ResourceProvidedByPersonDeleteFieldInput>>
}

export type ResourceDependsOnResourceAggregateInput = {
  AND?: InputMaybe<Array<ResourceDependsOnResourceAggregateInput>>
  NOT?: InputMaybe<ResourceDependsOnResourceAggregateInput>
  OR?: InputMaybe<Array<ResourceDependsOnResourceAggregateInput>>
  count_EQ?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<ResourceDependsOnResourceNodeAggregationWhereInput>
}

export type ResourceDependsOnResourceConnectFieldInput = {
  connect?: InputMaybe<Array<ResourceConnectInput>>
  where?: InputMaybe<ResourceConnectWhere>
}

export type ResourceDependsOnResourceConnection = {
  __typename?: 'ResourceDependsOnResourceConnection'
  edges: Array<ResourceDependsOnResourceRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ResourceDependsOnResourceConnectionSort = {
  node?: InputMaybe<ResourceSort>
}

export type ResourceDependsOnResourceConnectionWhere = {
  AND?: InputMaybe<Array<ResourceDependsOnResourceConnectionWhere>>
  NOT?: InputMaybe<ResourceDependsOnResourceConnectionWhere>
  OR?: InputMaybe<Array<ResourceDependsOnResourceConnectionWhere>>
  node?: InputMaybe<ResourceWhere>
}

export type ResourceDependsOnResourceCreateFieldInput = {
  node: ResourceCreateInput
}

export type ResourceDependsOnResourceDeleteFieldInput = {
  delete?: InputMaybe<ResourceDeleteInput>
  where?: InputMaybe<ResourceDependsOnResourceConnectionWhere>
}

export type ResourceDependsOnResourceDisconnectFieldInput = {
  disconnect?: InputMaybe<ResourceDisconnectInput>
  where?: InputMaybe<ResourceDependsOnResourceConnectionWhere>
}

export type ResourceDependsOnResourceFieldInput = {
  connect?: InputMaybe<Array<ResourceDependsOnResourceConnectFieldInput>>
  create?: InputMaybe<Array<ResourceDependsOnResourceCreateFieldInput>>
}

export type ResourceDependsOnResourceNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<ResourceDependsOnResourceNodeAggregationWhereInput>>
  NOT?: InputMaybe<ResourceDependsOnResourceNodeAggregationWhereInput>
  OR?: InputMaybe<Array<ResourceDependsOnResourceNodeAggregationWhereInput>>
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

export type ResourceDependsOnResourceRelationship = {
  __typename?: 'ResourceDependsOnResourceRelationship'
  cursor: Scalars['String']['output']
  node: Resource
}

export type ResourceDependsOnResourceUpdateConnectionInput = {
  node?: InputMaybe<ResourceUpdateInput>
}

export type ResourceDependsOnResourceUpdateFieldInput = {
  connect?: InputMaybe<Array<ResourceDependsOnResourceConnectFieldInput>>
  create?: InputMaybe<Array<ResourceDependsOnResourceCreateFieldInput>>
  delete?: InputMaybe<Array<ResourceDependsOnResourceDeleteFieldInput>>
  disconnect?: InputMaybe<Array<ResourceDependsOnResourceDisconnectFieldInput>>
  update?: InputMaybe<ResourceDependsOnResourceUpdateConnectionInput>
  where?: InputMaybe<ResourceDependsOnResourceConnectionWhere>
}

export type ResourceDisconnectInput = {
  appliedToCarePoint?: InputMaybe<
    Array<ResourceAppliedToCarePointDisconnectFieldInput>
  >
  dependsOnResource?: InputMaybe<
    Array<ResourceDependsOnResourceDisconnectFieldInput>
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

export type ResourceOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more ResourceSort objects to sort Resources by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<ResourceSort>>
}

export type ResourcePersonProvidedByPersonAggregationSelection = {
  __typename?: 'ResourcePersonProvidedByPersonAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourcePersonProvidedByPersonNodeAggregateSelection>
}

export type ResourcePersonProvidedByPersonNodeAggregateSelection = {
  __typename?: 'ResourcePersonProvidedByPersonNodeAggregateSelection'
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
  manual_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  manual_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  manual_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  manual_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  manual_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type ResourceResourceDependsOnResourceAggregationSelection = {
  __typename?: 'ResourceResourceDependsOnResourceAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<ResourceResourceDependsOnResourceNodeAggregateSelection>
}

export type ResourceResourceDependsOnResourceNodeAggregateSelection = {
  __typename?: 'ResourceResourceDependsOnResourceNodeAggregateSelection'
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
  appliedToCarePoint?: InputMaybe<
    Array<ResourceAppliedToCarePointUpdateFieldInput>
  >
  dependsOnResource?: InputMaybe<
    Array<ResourceDependsOnResourceUpdateFieldInput>
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
  appliedToCarePointAggregate?: InputMaybe<ResourceAppliedToCarePointAggregateInput>
  /** Return Resources where all of the related ResourceAppliedToCarePointConnections match this filter */
  appliedToCarePointConnection_ALL?: InputMaybe<ResourceAppliedToCarePointConnectionWhere>
  /** Return Resources where none of the related ResourceAppliedToCarePointConnections match this filter */
  appliedToCarePointConnection_NONE?: InputMaybe<ResourceAppliedToCarePointConnectionWhere>
  /** Return Resources where one of the related ResourceAppliedToCarePointConnections match this filter */
  appliedToCarePointConnection_SINGLE?: InputMaybe<ResourceAppliedToCarePointConnectionWhere>
  /** Return Resources where some of the related ResourceAppliedToCarePointConnections match this filter */
  appliedToCarePointConnection_SOME?: InputMaybe<ResourceAppliedToCarePointConnectionWhere>
  /** Return Resources where all of the related CarePoints match this filter */
  appliedToCarePoint_ALL?: InputMaybe<CarePointWhere>
  /** Return Resources where none of the related CarePoints match this filter */
  appliedToCarePoint_NONE?: InputMaybe<CarePointWhere>
  /** Return Resources where one of the related CarePoints match this filter */
  appliedToCarePoint_SINGLE?: InputMaybe<CarePointWhere>
  /** Return Resources where some of the related CarePoints match this filter */
  appliedToCarePoint_SOME?: InputMaybe<CarePointWhere>
  createdAt_EQ?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdAt_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdAt_LTE?: InputMaybe<Scalars['DateTime']['input']>
  dependsOnResourceAggregate?: InputMaybe<ResourceDependsOnResourceAggregateInput>
  /** Return Resources where all of the related ResourceDependsOnResourceConnections match this filter */
  dependsOnResourceConnection_ALL?: InputMaybe<ResourceDependsOnResourceConnectionWhere>
  /** Return Resources where none of the related ResourceDependsOnResourceConnections match this filter */
  dependsOnResourceConnection_NONE?: InputMaybe<ResourceDependsOnResourceConnectionWhere>
  /** Return Resources where one of the related ResourceDependsOnResourceConnections match this filter */
  dependsOnResourceConnection_SINGLE?: InputMaybe<ResourceDependsOnResourceConnectionWhere>
  /** Return Resources where some of the related ResourceDependsOnResourceConnections match this filter */
  dependsOnResourceConnection_SOME?: InputMaybe<ResourceDependsOnResourceConnectionWhere>
  /** Return Resources where all of the related Resources match this filter */
  dependsOnResource_ALL?: InputMaybe<ResourceWhere>
  /** Return Resources where none of the related Resources match this filter */
  dependsOnResource_NONE?: InputMaybe<ResourceWhere>
  /** Return Resources where one of the related Resources match this filter */
  dependsOnResource_SINGLE?: InputMaybe<ResourceWhere>
  /** Return Resources where some of the related Resources match this filter */
  dependsOnResource_SOME?: InputMaybe<ResourceWhere>
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
      caresFor?: string | null
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
      description: string
      caresFor?: string | null
      successMeasures?: string | null
      photo?: string | null
      status: boolean
      location?: string | null
      time?: string | null
      createdAt: any
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
      status?: string | null
      why?: string | null
      location?: string | null
      time?: string | null
      dependsOnResource: Array<{
        __typename?: 'Resource'
        id: string
        name: string
      }>
      appliedToCarePoint: Array<{ __typename?: 'CarePoint'; id: string }>
    }>
  }
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
    caresFor?: string | null
    whoSupports?: string | null
    alignmentChallenges?: string | null
    alignmentExamples?: string | null
    description?: string | null
    why?: string | null
    guidesPerson: Array<{ __typename?: 'Person'; id: string; name: string }>
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
    caresFor?: string | null
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
    firstName: string
    lastName: string
    email?: string | null
    community: Array<{
      __typename?: 'Community'
      id: string
      name: string
      hasMembers: Array<{
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
    description: string
    caresFor?: string | null
    successMeasures?: string | null
    photo?: string | null
    status: boolean
    location?: string | null
    time?: string | null
    createdAt: any
    motivatesPerson: Array<{ __typename?: 'Person'; id: string; name: string }>
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
    description: string
    caresFor?: string | null
    successMeasures?: string | null
    photo?: string | null
    status: boolean
    location?: string | null
    time?: string | null
    createdAt: any
    motivatesPerson: Array<{ __typename?: 'Person'; id: string; name: string }>
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
    name: string
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
    phone?: string | null
    manual?: string | null
    interests?: string | null
    gender?: string | null
    pronouns?: string | null
    location?: string | null
    guidedBy: Array<{ __typename?: 'CoreValue'; id: string; name: string }>
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
    gender?: string | null
    phone?: string | null
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
    status?: string | null
    why?: string | null
    location?: string | null
    time?: string | null
    dependsOnResource: Array<{
      __typename?: 'Resource'
      id: string
      name: string
    }>
    appliedToCarePoint: Array<{ __typename?: 'CarePoint'; id: string }>
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
    status?: string | null
    why?: string | null
    location?: string | null
    time?: string | null
    dependsOnResource: Array<{
      __typename?: 'Resource'
      id: string
      name: string
    }>
    appliedToCarePoint: Array<{ __typename?: 'CarePoint'; id: string }>
    providedByPerson: Array<{
      __typename?: 'Person'
      id: string
      name: string
      phone?: string | null
      photo?: string | null
    }>
  }>
}

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
                        name: { kind: 'Name', value: 'caresFor' },
                      },
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
                        name: { kind: 'Name', value: 'caresFor' },
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
                        name: { kind: 'Name', value: 'dependsOnResource' },
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
                        name: { kind: 'Name', value: 'appliedToCarePoint' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'caresFor' } },
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
                  name: { kind: 'Name', value: 'guidesPerson' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'caresFor' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'community' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'hasMembers' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'caresFor' } },
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
                  name: { kind: 'Name', value: 'motivatesPerson' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'caresFor' } },
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
                  name: { kind: 'Name', value: 'motivatesPerson' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                { kind: 'Field', name: { kind: 'Name', value: 'manual' } },
                { kind: 'Field', name: { kind: 'Name', value: 'interests' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pronouns' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'guidedBy' },
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
} as unknown as DocumentNode<GetAllPeopleQuery, GetAllPeopleQueryVariables>
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
                  name: { kind: 'Name', value: 'dependsOnResource' },
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
                  name: { kind: 'Name', value: 'appliedToCarePoint' },
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
                  name: { kind: 'Name', value: 'dependsOnResource' },
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
                  name: { kind: 'Name', value: 'appliedToCarePoint' },
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
