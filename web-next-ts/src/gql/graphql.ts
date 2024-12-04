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
  /** A date, represented as a 'yyyy-mm-dd' string */
  Date: { input: any; output: any }
  /** A date and time, represented as an ISO-8601 string */
  DateTime: { input: any; output: any }
}

export type Bacenta = Church & {
  __typename?: 'Bacenta'
  id: Scalars['ID']['output']
  leader: Member
  leaderAggregate?: Maybe<BacentaMemberLeaderAggregationSelection>
  leaderConnection: ChurchLeaderConnection
  name: Scalars['String']['output']
}

export type BacentaLeaderArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<MemberOptions>
  where?: InputMaybe<MemberWhere>
}

export type BacentaLeaderAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<MemberWhere>
}

export type BacentaLeaderConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ChurchLeaderConnectionSort>>
  where?: InputMaybe<ChurchLeaderConnectionWhere>
}

export type BacentaAggregateSelection = {
  __typename?: 'BacentaAggregateSelection'
  count: Scalars['Int']['output']
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type BacentaConnectInput = {
  leader?: InputMaybe<ChurchLeaderConnectFieldInput>
}

export type BacentaConnectWhere = {
  node: BacentaWhere
}

export type BacentaCreateInput = {
  id: Scalars['ID']['input']
  leader?: InputMaybe<ChurchLeaderFieldInput>
  name: Scalars['String']['input']
}

export type BacentaDeleteInput = {
  leader?: InputMaybe<ChurchLeaderDeleteFieldInput>
}

export type BacentaDisconnectInput = {
  leader?: InputMaybe<ChurchLeaderDisconnectFieldInput>
}

export type BacentaEdge = {
  __typename?: 'BacentaEdge'
  cursor: Scalars['String']['output']
  node: Bacenta
}

export type BacentaLeaderAggregateInput = {
  AND?: InputMaybe<Array<BacentaLeaderAggregateInput>>
  NOT?: InputMaybe<BacentaLeaderAggregateInput>
  OR?: InputMaybe<Array<BacentaLeaderAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<BacentaLeaderNodeAggregationWhereInput>
}

export type BacentaLeaderNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<BacentaLeaderNodeAggregationWhereInput>>
  NOT?: InputMaybe<BacentaLeaderNodeAggregationWhereInput>
  OR?: InputMaybe<Array<BacentaLeaderNodeAggregationWhereInput>>
  auth_id_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  middleName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  middleName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type BacentaMemberLeaderAggregationSelection = {
  __typename?: 'BacentaMemberLeaderAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<BacentaMemberLeaderNodeAggregateSelection>
}

export type BacentaMemberLeaderNodeAggregateSelection = {
  __typename?: 'BacentaMemberLeaderNodeAggregateSelection'
  auth_id: StringAggregateSelectionNullable
  email: StringAggregateSelectionNullable
  firstName: StringAggregateSelectionNullable
  id: IdAggregateSelectionNonNullable
  lastName: StringAggregateSelectionNullable
  middleName: StringAggregateSelectionNullable
  phoneNumber: StringAggregateSelectionNullable
  pictureUrl: StringAggregateSelectionNullable
  whatsappNumber: StringAggregateSelectionNullable
}

export type BacentaOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more BacentaSort objects to sort Bacentas by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<BacentaSort>>
}

export type BacentaRelationInput = {
  leader?: InputMaybe<ChurchLeaderCreateFieldInput>
}

/** Fields to sort Bacentas by. The order in which sorts are applied is not guaranteed when specifying many fields in one BacentaSort object. */
export type BacentaSort = {
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
}

export type BacentaUpdateInput = {
  id?: InputMaybe<Scalars['ID']['input']>
  leader?: InputMaybe<ChurchLeaderUpdateFieldInput>
  name?: InputMaybe<Scalars['String']['input']>
}

export type BacentaWhere = {
  AND?: InputMaybe<Array<BacentaWhere>>
  NOT?: InputMaybe<BacentaWhere>
  OR?: InputMaybe<Array<BacentaWhere>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  leader?: InputMaybe<MemberWhere>
  leaderAggregate?: InputMaybe<BacentaLeaderAggregateInput>
  leaderConnection?: InputMaybe<ChurchLeaderConnectionWhere>
  leaderConnection_NOT?: InputMaybe<ChurchLeaderConnectionWhere>
  leader_NOT?: InputMaybe<MemberWhere>
  name?: InputMaybe<Scalars['String']['input']>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type BacentasConnection = {
  __typename?: 'BacentasConnection'
  edges: Array<BacentaEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Campus = Church & {
  __typename?: 'Campus'
  id: Scalars['ID']['output']
  leader: Member
  leaderAggregate?: Maybe<CampusMemberLeaderAggregationSelection>
  leaderConnection: ChurchLeaderConnection
  name: Scalars['String']['output']
  streams: Array<Stream>
  streamsAggregate?: Maybe<CampusStreamStreamsAggregationSelection>
  streamsConnection: CampusStreamsConnection
}

export type CampusLeaderArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<MemberOptions>
  where?: InputMaybe<MemberWhere>
}

export type CampusLeaderAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<MemberWhere>
}

export type CampusLeaderConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ChurchLeaderConnectionSort>>
  where?: InputMaybe<ChurchLeaderConnectionWhere>
}

export type CampusStreamsArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<StreamOptions>
  where?: InputMaybe<StreamWhere>
}

export type CampusStreamsAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<StreamWhere>
}

export type CampusStreamsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CampusStreamsConnectionSort>>
  where?: InputMaybe<CampusStreamsConnectionWhere>
}

export type CampusAggregateSelection = {
  __typename?: 'CampusAggregateSelection'
  count: Scalars['Int']['output']
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type CampusConnectInput = {
  leader?: InputMaybe<ChurchLeaderConnectFieldInput>
  streams?: InputMaybe<Array<CampusStreamsConnectFieldInput>>
}

export type CampusConnectWhere = {
  node: CampusWhere
}

export type CampusCreateInput = {
  id: Scalars['ID']['input']
  leader?: InputMaybe<ChurchLeaderFieldInput>
  name: Scalars['String']['input']
  streams?: InputMaybe<CampusStreamsFieldInput>
}

export type CampusDeleteInput = {
  leader?: InputMaybe<ChurchLeaderDeleteFieldInput>
  streams?: InputMaybe<Array<CampusStreamsDeleteFieldInput>>
}

export type CampusDisconnectInput = {
  leader?: InputMaybe<ChurchLeaderDisconnectFieldInput>
  streams?: InputMaybe<Array<CampusStreamsDisconnectFieldInput>>
}

export type CampusEdge = {
  __typename?: 'CampusEdge'
  cursor: Scalars['String']['output']
  node: Campus
}

export type CampusLeaderAggregateInput = {
  AND?: InputMaybe<Array<CampusLeaderAggregateInput>>
  NOT?: InputMaybe<CampusLeaderAggregateInput>
  OR?: InputMaybe<Array<CampusLeaderAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CampusLeaderNodeAggregationWhereInput>
}

export type CampusLeaderNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CampusLeaderNodeAggregationWhereInput>>
  NOT?: InputMaybe<CampusLeaderNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CampusLeaderNodeAggregationWhereInput>>
  auth_id_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  middleName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  middleName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CampusMemberLeaderAggregationSelection = {
  __typename?: 'CampusMemberLeaderAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CampusMemberLeaderNodeAggregateSelection>
}

export type CampusMemberLeaderNodeAggregateSelection = {
  __typename?: 'CampusMemberLeaderNodeAggregateSelection'
  auth_id: StringAggregateSelectionNullable
  email: StringAggregateSelectionNullable
  firstName: StringAggregateSelectionNullable
  id: IdAggregateSelectionNonNullable
  lastName: StringAggregateSelectionNullable
  middleName: StringAggregateSelectionNullable
  phoneNumber: StringAggregateSelectionNullable
  pictureUrl: StringAggregateSelectionNullable
  whatsappNumber: StringAggregateSelectionNullable
}

export type CampusOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more CampusSort objects to sort Campuses by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<CampusSort>>
}

export type CampusRelationInput = {
  leader?: InputMaybe<ChurchLeaderCreateFieldInput>
  streams?: InputMaybe<Array<CampusStreamsCreateFieldInput>>
}

/** Fields to sort Campuses by. The order in which sorts are applied is not guaranteed when specifying many fields in one CampusSort object. */
export type CampusSort = {
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
}

export type CampusStreamStreamsAggregationSelection = {
  __typename?: 'CampusStreamStreamsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CampusStreamStreamsNodeAggregateSelection>
}

export type CampusStreamStreamsNodeAggregateSelection = {
  __typename?: 'CampusStreamStreamsNodeAggregateSelection'
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type CampusStreamsAggregateInput = {
  AND?: InputMaybe<Array<CampusStreamsAggregateInput>>
  NOT?: InputMaybe<CampusStreamsAggregateInput>
  OR?: InputMaybe<Array<CampusStreamsAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CampusStreamsNodeAggregationWhereInput>
}

export type CampusStreamsConnectFieldInput = {
  connect?: InputMaybe<Array<StreamConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<StreamConnectWhere>
}

export type CampusStreamsConnection = {
  __typename?: 'CampusStreamsConnection'
  edges: Array<CampusStreamsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CampusStreamsConnectionSort = {
  node?: InputMaybe<StreamSort>
}

export type CampusStreamsConnectionWhere = {
  AND?: InputMaybe<Array<CampusStreamsConnectionWhere>>
  NOT?: InputMaybe<CampusStreamsConnectionWhere>
  OR?: InputMaybe<Array<CampusStreamsConnectionWhere>>
  node?: InputMaybe<StreamWhere>
}

export type CampusStreamsCreateFieldInput = {
  node: StreamCreateInput
}

export type CampusStreamsDeleteFieldInput = {
  delete?: InputMaybe<StreamDeleteInput>
  where?: InputMaybe<CampusStreamsConnectionWhere>
}

export type CampusStreamsDisconnectFieldInput = {
  disconnect?: InputMaybe<StreamDisconnectInput>
  where?: InputMaybe<CampusStreamsConnectionWhere>
}

export type CampusStreamsFieldInput = {
  connect?: InputMaybe<Array<CampusStreamsConnectFieldInput>>
  create?: InputMaybe<Array<CampusStreamsCreateFieldInput>>
}

export type CampusStreamsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CampusStreamsNodeAggregationWhereInput>>
  NOT?: InputMaybe<CampusStreamsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CampusStreamsNodeAggregationWhereInput>>
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

export type CampusStreamsRelationship = {
  __typename?: 'CampusStreamsRelationship'
  cursor: Scalars['String']['output']
  node: Stream
}

export type CampusStreamsUpdateConnectionInput = {
  node?: InputMaybe<StreamUpdateInput>
}

export type CampusStreamsUpdateFieldInput = {
  connect?: InputMaybe<Array<CampusStreamsConnectFieldInput>>
  create?: InputMaybe<Array<CampusStreamsCreateFieldInput>>
  delete?: InputMaybe<Array<CampusStreamsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CampusStreamsDisconnectFieldInput>>
  update?: InputMaybe<CampusStreamsUpdateConnectionInput>
  where?: InputMaybe<CampusStreamsConnectionWhere>
}

export type CampusUpdateInput = {
  id?: InputMaybe<Scalars['ID']['input']>
  leader?: InputMaybe<ChurchLeaderUpdateFieldInput>
  name?: InputMaybe<Scalars['String']['input']>
  streams?: InputMaybe<Array<CampusStreamsUpdateFieldInput>>
}

export type CampusWhere = {
  AND?: InputMaybe<Array<CampusWhere>>
  NOT?: InputMaybe<CampusWhere>
  OR?: InputMaybe<Array<CampusWhere>>
  id?: InputMaybe<Scalars['ID']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  leader?: InputMaybe<MemberWhere>
  leaderAggregate?: InputMaybe<CampusLeaderAggregateInput>
  leaderConnection?: InputMaybe<ChurchLeaderConnectionWhere>
  leaderConnection_NOT?: InputMaybe<ChurchLeaderConnectionWhere>
  leader_NOT?: InputMaybe<MemberWhere>
  name?: InputMaybe<Scalars['String']['input']>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  streamsAggregate?: InputMaybe<CampusStreamsAggregateInput>
  /** Return Campuses where all of the related CampusStreamsConnections match this filter */
  streamsConnection_ALL?: InputMaybe<CampusStreamsConnectionWhere>
  /** Return Campuses where none of the related CampusStreamsConnections match this filter */
  streamsConnection_NONE?: InputMaybe<CampusStreamsConnectionWhere>
  /** Return Campuses where one of the related CampusStreamsConnections match this filter */
  streamsConnection_SINGLE?: InputMaybe<CampusStreamsConnectionWhere>
  /** Return Campuses where some of the related CampusStreamsConnections match this filter */
  streamsConnection_SOME?: InputMaybe<CampusStreamsConnectionWhere>
  /** Return Campuses where all of the related Streams match this filter */
  streams_ALL?: InputMaybe<StreamWhere>
  /** Return Campuses where none of the related Streams match this filter */
  streams_NONE?: InputMaybe<StreamWhere>
  /** Return Campuses where one of the related Streams match this filter */
  streams_SINGLE?: InputMaybe<StreamWhere>
  /** Return Campuses where some of the related Streams match this filter */
  streams_SOME?: InputMaybe<StreamWhere>
}

export type CampusesConnection = {
  __typename?: 'CampusesConnection'
  edges: Array<CampusEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Church = {
  id: Scalars['ID']['output']
  leader: Member
  leaderConnection: ChurchLeaderConnection
  name: Scalars['String']['output']
}

export type ChurchLeaderConnectFieldInput = {
  connect?: InputMaybe<MemberConnectInput>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<MemberConnectWhere>
}

export type ChurchLeaderConnection = {
  __typename?: 'ChurchLeaderConnection'
  edges: Array<ChurchLeaderRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type ChurchLeaderConnectionSort = {
  node?: InputMaybe<MemberSort>
}

export type ChurchLeaderConnectionWhere = {
  AND?: InputMaybe<Array<ChurchLeaderConnectionWhere>>
  NOT?: InputMaybe<ChurchLeaderConnectionWhere>
  OR?: InputMaybe<Array<ChurchLeaderConnectionWhere>>
  node?: InputMaybe<MemberWhere>
}

export type ChurchLeaderCreateFieldInput = {
  node: MemberCreateInput
}

export type ChurchLeaderDeleteFieldInput = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<ChurchLeaderConnectionWhere>
}

export type ChurchLeaderDisconnectFieldInput = {
  disconnect?: InputMaybe<MemberDisconnectInput>
  where?: InputMaybe<ChurchLeaderConnectionWhere>
}

export type ChurchLeaderFieldInput = {
  connect?: InputMaybe<ChurchLeaderConnectFieldInput>
  create?: InputMaybe<ChurchLeaderCreateFieldInput>
}

export type ChurchLeaderRelationship = {
  __typename?: 'ChurchLeaderRelationship'
  cursor: Scalars['String']['output']
  node: Member
}

export type ChurchLeaderUpdateConnectionInput = {
  node?: InputMaybe<MemberUpdateInput>
}

export type ChurchLeaderUpdateFieldInput = {
  connect?: InputMaybe<ChurchLeaderConnectFieldInput>
  create?: InputMaybe<ChurchLeaderCreateFieldInput>
  delete?: InputMaybe<ChurchLeaderDeleteFieldInput>
  disconnect?: InputMaybe<ChurchLeaderDisconnectFieldInput>
  update?: InputMaybe<ChurchLeaderUpdateConnectionInput>
  where?: InputMaybe<ChurchLeaderConnectionWhere>
}

export type Council = Church & {
  __typename?: 'Council'
  governorships: Array<Governorship>
  governorshipsAggregate?: Maybe<CouncilGovernorshipGovernorshipsAggregationSelection>
  governorshipsConnection: CouncilGovernorshipsConnection
  id: Scalars['ID']['output']
  jobs: Array<Job>
  leader: Member
  leaderAggregate?: Maybe<CouncilMemberLeaderAggregationSelection>
  leaderConnection: ChurchLeaderConnection
  members: Array<Member>
  membersWithinDateRange: Array<Member>
  name: Scalars['String']['output']
}

export type CouncilGovernorshipsArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<GovernorshipOptions>
  where?: InputMaybe<GovernorshipWhere>
}

export type CouncilGovernorshipsAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<GovernorshipWhere>
}

export type CouncilGovernorshipsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<CouncilGovernorshipsConnectionSort>>
  where?: InputMaybe<CouncilGovernorshipsConnectionWhere>
}

export type CouncilLeaderArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<MemberOptions>
  where?: InputMaybe<MemberWhere>
}

export type CouncilLeaderAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<MemberWhere>
}

export type CouncilLeaderConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ChurchLeaderConnectionSort>>
  where?: InputMaybe<ChurchLeaderConnectionWhere>
}

export type CouncilMembersWithinDateRangeArgs = {
  from: Scalars['String']['input']
  to: Scalars['String']['input']
}

export type CouncilAggregateSelection = {
  __typename?: 'CouncilAggregateSelection'
  count: Scalars['Int']['output']
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type CouncilConnectInput = {
  governorships?: InputMaybe<Array<CouncilGovernorshipsConnectFieldInput>>
  leader?: InputMaybe<ChurchLeaderConnectFieldInput>
}

export type CouncilConnectWhere = {
  node: CouncilWhere
}

export type CouncilCreateInput = {
  governorships?: InputMaybe<CouncilGovernorshipsFieldInput>
  id: Scalars['ID']['input']
  leader?: InputMaybe<ChurchLeaderFieldInput>
  name: Scalars['String']['input']
}

export type CouncilDeleteInput = {
  governorships?: InputMaybe<Array<CouncilGovernorshipsDeleteFieldInput>>
  leader?: InputMaybe<ChurchLeaderDeleteFieldInput>
}

export type CouncilDisconnectInput = {
  governorships?: InputMaybe<Array<CouncilGovernorshipsDisconnectFieldInput>>
  leader?: InputMaybe<ChurchLeaderDisconnectFieldInput>
}

export type CouncilEdge = {
  __typename?: 'CouncilEdge'
  cursor: Scalars['String']['output']
  node: Council
}

export type CouncilGovernorshipGovernorshipsAggregationSelection = {
  __typename?: 'CouncilGovernorshipGovernorshipsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CouncilGovernorshipGovernorshipsNodeAggregateSelection>
}

export type CouncilGovernorshipGovernorshipsNodeAggregateSelection = {
  __typename?: 'CouncilGovernorshipGovernorshipsNodeAggregateSelection'
  bankingCode: IntAggregateSelectionNonNullable
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type CouncilGovernorshipsAggregateInput = {
  AND?: InputMaybe<Array<CouncilGovernorshipsAggregateInput>>
  NOT?: InputMaybe<CouncilGovernorshipsAggregateInput>
  OR?: InputMaybe<Array<CouncilGovernorshipsAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CouncilGovernorshipsNodeAggregationWhereInput>
}

export type CouncilGovernorshipsConnectFieldInput = {
  connect?: InputMaybe<Array<GovernorshipConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<GovernorshipConnectWhere>
}

export type CouncilGovernorshipsConnection = {
  __typename?: 'CouncilGovernorshipsConnection'
  edges: Array<CouncilGovernorshipsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CouncilGovernorshipsConnectionSort = {
  node?: InputMaybe<GovernorshipSort>
}

export type CouncilGovernorshipsConnectionWhere = {
  AND?: InputMaybe<Array<CouncilGovernorshipsConnectionWhere>>
  NOT?: InputMaybe<CouncilGovernorshipsConnectionWhere>
  OR?: InputMaybe<Array<CouncilGovernorshipsConnectionWhere>>
  node?: InputMaybe<GovernorshipWhere>
}

export type CouncilGovernorshipsCreateFieldInput = {
  node: GovernorshipCreateInput
}

export type CouncilGovernorshipsDeleteFieldInput = {
  delete?: InputMaybe<GovernorshipDeleteInput>
  where?: InputMaybe<CouncilGovernorshipsConnectionWhere>
}

export type CouncilGovernorshipsDisconnectFieldInput = {
  disconnect?: InputMaybe<GovernorshipDisconnectInput>
  where?: InputMaybe<CouncilGovernorshipsConnectionWhere>
}

export type CouncilGovernorshipsFieldInput = {
  connect?: InputMaybe<Array<CouncilGovernorshipsConnectFieldInput>>
  create?: InputMaybe<Array<CouncilGovernorshipsCreateFieldInput>>
}

export type CouncilGovernorshipsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CouncilGovernorshipsNodeAggregationWhereInput>>
  NOT?: InputMaybe<CouncilGovernorshipsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CouncilGovernorshipsNodeAggregationWhereInput>>
  bankingCode_AVERAGE_EQUAL?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_GT?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_GTE?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_LT?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_LTE?: InputMaybe<Scalars['Float']['input']>
  bankingCode_MAX_EQUAL?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_GT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_GTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_LT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_LTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_EQUAL?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_GT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_GTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_LT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_LTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_EQUAL?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_GT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_GTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_LT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type CouncilGovernorshipsRelationship = {
  __typename?: 'CouncilGovernorshipsRelationship'
  cursor: Scalars['String']['output']
  node: Governorship
}

export type CouncilGovernorshipsUpdateConnectionInput = {
  node?: InputMaybe<GovernorshipUpdateInput>
}

export type CouncilGovernorshipsUpdateFieldInput = {
  connect?: InputMaybe<Array<CouncilGovernorshipsConnectFieldInput>>
  create?: InputMaybe<Array<CouncilGovernorshipsCreateFieldInput>>
  delete?: InputMaybe<Array<CouncilGovernorshipsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<CouncilGovernorshipsDisconnectFieldInput>>
  update?: InputMaybe<CouncilGovernorshipsUpdateConnectionInput>
  where?: InputMaybe<CouncilGovernorshipsConnectionWhere>
}

export type CouncilLeaderAggregateInput = {
  AND?: InputMaybe<Array<CouncilLeaderAggregateInput>>
  NOT?: InputMaybe<CouncilLeaderAggregateInput>
  OR?: InputMaybe<Array<CouncilLeaderAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<CouncilLeaderNodeAggregationWhereInput>
}

export type CouncilLeaderNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<CouncilLeaderNodeAggregationWhereInput>>
  NOT?: InputMaybe<CouncilLeaderNodeAggregationWhereInput>
  OR?: InputMaybe<Array<CouncilLeaderNodeAggregationWhereInput>>
  auth_id_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  middleName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  middleName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type CouncilMemberLeaderAggregationSelection = {
  __typename?: 'CouncilMemberLeaderAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<CouncilMemberLeaderNodeAggregateSelection>
}

export type CouncilMemberLeaderNodeAggregateSelection = {
  __typename?: 'CouncilMemberLeaderNodeAggregateSelection'
  auth_id: StringAggregateSelectionNullable
  email: StringAggregateSelectionNullable
  firstName: StringAggregateSelectionNullable
  id: IdAggregateSelectionNonNullable
  lastName: StringAggregateSelectionNullable
  middleName: StringAggregateSelectionNullable
  phoneNumber: StringAggregateSelectionNullable
  pictureUrl: StringAggregateSelectionNullable
  whatsappNumber: StringAggregateSelectionNullable
}

export type CouncilOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more CouncilSort objects to sort Councils by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<CouncilSort>>
}

export type CouncilRelationInput = {
  governorships?: InputMaybe<Array<CouncilGovernorshipsCreateFieldInput>>
  leader?: InputMaybe<ChurchLeaderCreateFieldInput>
}

/** Fields to sort Councils by. The order in which sorts are applied is not guaranteed when specifying many fields in one CouncilSort object. */
export type CouncilSort = {
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
}

export type CouncilUpdateInput = {
  governorships?: InputMaybe<Array<CouncilGovernorshipsUpdateFieldInput>>
  id?: InputMaybe<Scalars['ID']['input']>
  leader?: InputMaybe<ChurchLeaderUpdateFieldInput>
  name?: InputMaybe<Scalars['String']['input']>
}

export type CouncilWhere = {
  AND?: InputMaybe<Array<CouncilWhere>>
  NOT?: InputMaybe<CouncilWhere>
  OR?: InputMaybe<Array<CouncilWhere>>
  governorshipsAggregate?: InputMaybe<CouncilGovernorshipsAggregateInput>
  /** Return Councils where all of the related CouncilGovernorshipsConnections match this filter */
  governorshipsConnection_ALL?: InputMaybe<CouncilGovernorshipsConnectionWhere>
  /** Return Councils where none of the related CouncilGovernorshipsConnections match this filter */
  governorshipsConnection_NONE?: InputMaybe<CouncilGovernorshipsConnectionWhere>
  /** Return Councils where one of the related CouncilGovernorshipsConnections match this filter */
  governorshipsConnection_SINGLE?: InputMaybe<CouncilGovernorshipsConnectionWhere>
  /** Return Councils where some of the related CouncilGovernorshipsConnections match this filter */
  governorshipsConnection_SOME?: InputMaybe<CouncilGovernorshipsConnectionWhere>
  /** Return Councils where all of the related Governorships match this filter */
  governorships_ALL?: InputMaybe<GovernorshipWhere>
  /** Return Councils where none of the related Governorships match this filter */
  governorships_NONE?: InputMaybe<GovernorshipWhere>
  /** Return Councils where one of the related Governorships match this filter */
  governorships_SINGLE?: InputMaybe<GovernorshipWhere>
  /** Return Councils where some of the related Governorships match this filter */
  governorships_SOME?: InputMaybe<GovernorshipWhere>
  id?: InputMaybe<Scalars['ID']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  leader?: InputMaybe<MemberWhere>
  leaderAggregate?: InputMaybe<CouncilLeaderAggregateInput>
  leaderConnection?: InputMaybe<ChurchLeaderConnectionWhere>
  leaderConnection_NOT?: InputMaybe<ChurchLeaderConnectionWhere>
  leader_NOT?: InputMaybe<MemberWhere>
  name?: InputMaybe<Scalars['String']['input']>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type CouncilsConnection = {
  __typename?: 'CouncilsConnection'
  edges: Array<CouncilEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type CreateBacentasMutationResponse = {
  __typename?: 'CreateBacentasMutationResponse'
  bacentas: Array<Bacenta>
  info: CreateInfo
}

export type CreateCampusesMutationResponse = {
  __typename?: 'CreateCampusesMutationResponse'
  campuses: Array<Campus>
  info: CreateInfo
}

export type CreateCouncilsMutationResponse = {
  __typename?: 'CreateCouncilsMutationResponse'
  councils: Array<Council>
  info: CreateInfo
}

export type CreateGendersMutationResponse = {
  __typename?: 'CreateGendersMutationResponse'
  genders: Array<Gender>
  info: CreateInfo
}

export type CreateGovernorshipsMutationResponse = {
  __typename?: 'CreateGovernorshipsMutationResponse'
  governorships: Array<Governorship>
  info: CreateInfo
}

export type CreateInfo = {
  __typename?: 'CreateInfo'
  bookmark?: Maybe<Scalars['String']['output']>
  nodesCreated: Scalars['Int']['output']
  relationshipsCreated: Scalars['Int']['output']
}

export type CreateJobsMutationResponse = {
  __typename?: 'CreateJobsMutationResponse'
  info: CreateInfo
  jobs: Array<Job>
}

export type CreateMaritalStatusesMutationResponse = {
  __typename?: 'CreateMaritalStatusesMutationResponse'
  info: CreateInfo
  maritalStatuses: Array<MaritalStatus>
}

export type CreateMembersMutationResponse = {
  __typename?: 'CreateMembersMutationResponse'
  info: CreateInfo
  members: Array<Member>
}

export type CreateOccupationsMutationResponse = {
  __typename?: 'CreateOccupationsMutationResponse'
  info: CreateInfo
  occupations: Array<Occupation>
}

export type CreateStreamsMutationResponse = {
  __typename?: 'CreateStreamsMutationResponse'
  info: CreateInfo
  streams: Array<Stream>
}

export type CreateTimeGraphsMutationResponse = {
  __typename?: 'CreateTimeGraphsMutationResponse'
  info: CreateInfo
  timeGraphs: Array<TimeGraph>
}

export type CreateTitlesMutationResponse = {
  __typename?: 'CreateTitlesMutationResponse'
  info: CreateInfo
  titles: Array<Title>
}

export type DateTimeAggregateSelectionNonNullable = {
  __typename?: 'DateTimeAggregateSelectionNonNullable'
  max: Scalars['DateTime']['output']
  min: Scalars['DateTime']['output']
}

export type DeleteInfo = {
  __typename?: 'DeleteInfo'
  bookmark?: Maybe<Scalars['String']['output']>
  nodesDeleted: Scalars['Int']['output']
  relationshipsDeleted: Scalars['Int']['output']
}

export type Gender = {
  __typename?: 'Gender'
  gender?: Maybe<Scalars['String']['output']>
  members: Array<Member>
  membersAggregate?: Maybe<GenderMemberMembersAggregationSelection>
  membersConnection: GenderMembersConnection
}

export type GenderMembersArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<MemberOptions>
  where?: InputMaybe<MemberWhere>
}

export type GenderMembersAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<MemberWhere>
}

export type GenderMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<GenderMembersConnectionSort>>
  where?: InputMaybe<GenderMembersConnectionWhere>
}

export type GenderAggregateSelection = {
  __typename?: 'GenderAggregateSelection'
  count: Scalars['Int']['output']
  gender: StringAggregateSelectionNullable
}

export type GenderConnectInput = {
  members?: InputMaybe<Array<GenderMembersConnectFieldInput>>
}

export type GenderConnectWhere = {
  node: GenderWhere
}

export type GenderCreateInput = {
  gender?: InputMaybe<Scalars['String']['input']>
  members?: InputMaybe<GenderMembersFieldInput>
}

export type GenderDeleteInput = {
  members?: InputMaybe<Array<GenderMembersDeleteFieldInput>>
}

export type GenderDisconnectInput = {
  members?: InputMaybe<Array<GenderMembersDisconnectFieldInput>>
}

export type GenderEdge = {
  __typename?: 'GenderEdge'
  cursor: Scalars['String']['output']
  node: Gender
}

export type GenderMemberMembersAggregationSelection = {
  __typename?: 'GenderMemberMembersAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GenderMemberMembersNodeAggregateSelection>
}

export type GenderMemberMembersNodeAggregateSelection = {
  __typename?: 'GenderMemberMembersNodeAggregateSelection'
  auth_id: StringAggregateSelectionNullable
  email: StringAggregateSelectionNullable
  firstName: StringAggregateSelectionNullable
  id: IdAggregateSelectionNonNullable
  lastName: StringAggregateSelectionNullable
  middleName: StringAggregateSelectionNullable
  phoneNumber: StringAggregateSelectionNullable
  pictureUrl: StringAggregateSelectionNullable
  whatsappNumber: StringAggregateSelectionNullable
}

export type GenderMembersAggregateInput = {
  AND?: InputMaybe<Array<GenderMembersAggregateInput>>
  NOT?: InputMaybe<GenderMembersAggregateInput>
  OR?: InputMaybe<Array<GenderMembersAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GenderMembersNodeAggregationWhereInput>
}

export type GenderMembersConnectFieldInput = {
  connect?: InputMaybe<Array<MemberConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<MemberConnectWhere>
}

export type GenderMembersConnection = {
  __typename?: 'GenderMembersConnection'
  edges: Array<GenderMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type GenderMembersConnectionSort = {
  node?: InputMaybe<MemberSort>
}

export type GenderMembersConnectionWhere = {
  AND?: InputMaybe<Array<GenderMembersConnectionWhere>>
  NOT?: InputMaybe<GenderMembersConnectionWhere>
  OR?: InputMaybe<Array<GenderMembersConnectionWhere>>
  node?: InputMaybe<MemberWhere>
}

export type GenderMembersCreateFieldInput = {
  node: MemberCreateInput
}

export type GenderMembersDeleteFieldInput = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<GenderMembersConnectionWhere>
}

export type GenderMembersDisconnectFieldInput = {
  disconnect?: InputMaybe<MemberDisconnectInput>
  where?: InputMaybe<GenderMembersConnectionWhere>
}

export type GenderMembersFieldInput = {
  connect?: InputMaybe<Array<GenderMembersConnectFieldInput>>
  create?: InputMaybe<Array<GenderMembersCreateFieldInput>>
}

export type GenderMembersNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GenderMembersNodeAggregationWhereInput>>
  NOT?: InputMaybe<GenderMembersNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GenderMembersNodeAggregationWhereInput>>
  auth_id_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  middleName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  middleName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type GenderMembersRelationship = {
  __typename?: 'GenderMembersRelationship'
  cursor: Scalars['String']['output']
  node: Member
}

export type GenderMembersUpdateConnectionInput = {
  node?: InputMaybe<MemberUpdateInput>
}

export type GenderMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<GenderMembersConnectFieldInput>>
  create?: InputMaybe<Array<GenderMembersCreateFieldInput>>
  delete?: InputMaybe<Array<GenderMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<GenderMembersDisconnectFieldInput>>
  update?: InputMaybe<GenderMembersUpdateConnectionInput>
  where?: InputMaybe<GenderMembersConnectionWhere>
}

export type GenderOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more GenderSort objects to sort Genders by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<GenderSort>>
}

export type GenderRelationInput = {
  members?: InputMaybe<Array<GenderMembersCreateFieldInput>>
}

/** Fields to sort Genders by. The order in which sorts are applied is not guaranteed when specifying many fields in one GenderSort object. */
export type GenderSort = {
  gender?: InputMaybe<SortDirection>
}

export type GenderUpdateInput = {
  gender?: InputMaybe<Scalars['String']['input']>
  members?: InputMaybe<Array<GenderMembersUpdateFieldInput>>
}

export type GenderWhere = {
  AND?: InputMaybe<Array<GenderWhere>>
  NOT?: InputMaybe<GenderWhere>
  OR?: InputMaybe<Array<GenderWhere>>
  gender?: InputMaybe<Scalars['String']['input']>
  gender_CONTAINS?: InputMaybe<Scalars['String']['input']>
  gender_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  gender_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  gender_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  membersAggregate?: InputMaybe<GenderMembersAggregateInput>
  /** Return Genders where all of the related GenderMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<GenderMembersConnectionWhere>
  /** Return Genders where none of the related GenderMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<GenderMembersConnectionWhere>
  /** Return Genders where one of the related GenderMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<GenderMembersConnectionWhere>
  /** Return Genders where some of the related GenderMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<GenderMembersConnectionWhere>
  /** Return Genders where all of the related Members match this filter */
  members_ALL?: InputMaybe<MemberWhere>
  /** Return Genders where none of the related Members match this filter */
  members_NONE?: InputMaybe<MemberWhere>
  /** Return Genders where one of the related Members match this filter */
  members_SINGLE?: InputMaybe<MemberWhere>
  /** Return Genders where some of the related Members match this filter */
  members_SOME?: InputMaybe<MemberWhere>
}

export type GendersConnection = {
  __typename?: 'GendersConnection'
  edges: Array<GenderEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Governorship = Church & {
  __typename?: 'Governorship'
  bankingCode: Scalars['Int']['output']
  id: Scalars['ID']['output']
  jobs: Array<Job>
  leader: Member
  leaderAggregate?: Maybe<GovernorshipMemberLeaderAggregationSelection>
  leaderConnection: ChurchLeaderConnection
  members: Array<Member>
  membersWithinDateRange: Array<Member>
  name: Scalars['String']['output']
}

export type GovernorshipLeaderArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<MemberOptions>
  where?: InputMaybe<MemberWhere>
}

export type GovernorshipLeaderAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<MemberWhere>
}

export type GovernorshipLeaderConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ChurchLeaderConnectionSort>>
  where?: InputMaybe<ChurchLeaderConnectionWhere>
}

export type GovernorshipMembersWithinDateRangeArgs = {
  from: Scalars['String']['input']
  to: Scalars['String']['input']
}

export type GovernorshipAggregateSelection = {
  __typename?: 'GovernorshipAggregateSelection'
  bankingCode: IntAggregateSelectionNonNullable
  count: Scalars['Int']['output']
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type GovernorshipConnectInput = {
  leader?: InputMaybe<ChurchLeaderConnectFieldInput>
}

export type GovernorshipConnectWhere = {
  node: GovernorshipWhere
}

export type GovernorshipCreateInput = {
  bankingCode: Scalars['Int']['input']
  id: Scalars['ID']['input']
  leader?: InputMaybe<ChurchLeaderFieldInput>
  name: Scalars['String']['input']
}

export type GovernorshipDeleteInput = {
  leader?: InputMaybe<ChurchLeaderDeleteFieldInput>
}

export type GovernorshipDisconnectInput = {
  leader?: InputMaybe<ChurchLeaderDisconnectFieldInput>
}

export type GovernorshipEdge = {
  __typename?: 'GovernorshipEdge'
  cursor: Scalars['String']['output']
  node: Governorship
}

export type GovernorshipLeaderAggregateInput = {
  AND?: InputMaybe<Array<GovernorshipLeaderAggregateInput>>
  NOT?: InputMaybe<GovernorshipLeaderAggregateInput>
  OR?: InputMaybe<Array<GovernorshipLeaderAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<GovernorshipLeaderNodeAggregationWhereInput>
}

export type GovernorshipLeaderNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<GovernorshipLeaderNodeAggregationWhereInput>>
  NOT?: InputMaybe<GovernorshipLeaderNodeAggregationWhereInput>
  OR?: InputMaybe<Array<GovernorshipLeaderNodeAggregationWhereInput>>
  auth_id_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  middleName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  middleName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type GovernorshipMemberLeaderAggregationSelection = {
  __typename?: 'GovernorshipMemberLeaderAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<GovernorshipMemberLeaderNodeAggregateSelection>
}

export type GovernorshipMemberLeaderNodeAggregateSelection = {
  __typename?: 'GovernorshipMemberLeaderNodeAggregateSelection'
  auth_id: StringAggregateSelectionNullable
  email: StringAggregateSelectionNullable
  firstName: StringAggregateSelectionNullable
  id: IdAggregateSelectionNonNullable
  lastName: StringAggregateSelectionNullable
  middleName: StringAggregateSelectionNullable
  phoneNumber: StringAggregateSelectionNullable
  pictureUrl: StringAggregateSelectionNullable
  whatsappNumber: StringAggregateSelectionNullable
}

export type GovernorshipOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more GovernorshipSort objects to sort Governorships by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<GovernorshipSort>>
}

export type GovernorshipRelationInput = {
  leader?: InputMaybe<ChurchLeaderCreateFieldInput>
}

/** Fields to sort Governorships by. The order in which sorts are applied is not guaranteed when specifying many fields in one GovernorshipSort object. */
export type GovernorshipSort = {
  bankingCode?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
}

export type GovernorshipUpdateInput = {
  bankingCode?: InputMaybe<Scalars['Int']['input']>
  bankingCode_DECREMENT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_INCREMENT?: InputMaybe<Scalars['Int']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  leader?: InputMaybe<ChurchLeaderUpdateFieldInput>
  name?: InputMaybe<Scalars['String']['input']>
}

export type GovernorshipWhere = {
  AND?: InputMaybe<Array<GovernorshipWhere>>
  NOT?: InputMaybe<GovernorshipWhere>
  OR?: InputMaybe<Array<GovernorshipWhere>>
  bankingCode?: InputMaybe<Scalars['Int']['input']>
  bankingCode_GT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_GTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_IN?: InputMaybe<Array<Scalars['Int']['input']>>
  bankingCode_LT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_LTE?: InputMaybe<Scalars['Int']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  leader?: InputMaybe<MemberWhere>
  leaderAggregate?: InputMaybe<GovernorshipLeaderAggregateInput>
  leaderConnection?: InputMaybe<ChurchLeaderConnectionWhere>
  leaderConnection_NOT?: InputMaybe<ChurchLeaderConnectionWhere>
  leader_NOT?: InputMaybe<MemberWhere>
  name?: InputMaybe<Scalars['String']['input']>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type GovernorshipsConnection = {
  __typename?: 'GovernorshipsConnection'
  edges: Array<GovernorshipEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type HasTitle = {
  date?: Maybe<Scalars['Date']['output']>
}

export type HasTitleCreateInput = {
  date?: InputMaybe<Scalars['Date']['input']>
}

export type HasTitleSort = {
  date?: InputMaybe<SortDirection>
}

export type HasTitleUpdateInput = {
  date?: InputMaybe<Scalars['Date']['input']>
}

export type HasTitleWhere = {
  AND?: InputMaybe<Array<HasTitleWhere>>
  NOT?: InputMaybe<HasTitleWhere>
  OR?: InputMaybe<Array<HasTitleWhere>>
  date?: InputMaybe<Scalars['Date']['input']>
  date_GT?: InputMaybe<Scalars['Date']['input']>
  date_GTE?: InputMaybe<Scalars['Date']['input']>
  date_IN?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>
  date_LT?: InputMaybe<Scalars['Date']['input']>
  date_LTE?: InputMaybe<Scalars['Date']['input']>
}

export type IdAggregateSelectionNonNullable = {
  __typename?: 'IDAggregateSelectionNonNullable'
  longest: Scalars['ID']['output']
  shortest: Scalars['ID']['output']
}

export type IntAggregateSelectionNonNullable = {
  __typename?: 'IntAggregateSelectionNonNullable'
  average: Scalars['Float']['output']
  max: Scalars['Int']['output']
  min: Scalars['Int']['output']
  sum: Scalars['Int']['output']
}

export type IntAggregateSelectionNullable = {
  __typename?: 'IntAggregateSelectionNullable'
  average?: Maybe<Scalars['Float']['output']>
  max?: Maybe<Scalars['Int']['output']>
  min?: Maybe<Scalars['Int']['output']>
  sum?: Maybe<Scalars['Int']['output']>
}

export type Job = {
  __typename?: 'Job'
  completionCount?: Maybe<Scalars['Int']['output']>
  createdBy: Member
  createdOn: Scalars['DateTime']['output']
  description: Scalars['String']['output']
  dueDate: Scalars['String']['output']
  id: Scalars['ID']['output']
  memberCount: Scalars['Int']['output']
  members: Array<Member>
  title: Scalars['String']['output']
  updatedOn: Scalars['DateTime']['output']
}

export type JobAggregateSelection = {
  __typename?: 'JobAggregateSelection'
  completionCount: IntAggregateSelectionNullable
  count: Scalars['Int']['output']
  createdOn: DateTimeAggregateSelectionNonNullable
  description: StringAggregateSelectionNonNullable
  dueDate: StringAggregateSelectionNonNullable
  id: IdAggregateSelectionNonNullable
  memberCount: IntAggregateSelectionNonNullable
  title: StringAggregateSelectionNonNullable
  updatedOn: DateTimeAggregateSelectionNonNullable
}

export type JobCreateInput = {
  completionCount?: InputMaybe<Scalars['Int']['input']>
  createdOn: Scalars['DateTime']['input']
  description: Scalars['String']['input']
  dueDate: Scalars['String']['input']
  id: Scalars['ID']['input']
  memberCount: Scalars['Int']['input']
  title: Scalars['String']['input']
  updatedOn: Scalars['DateTime']['input']
}

export type JobEdge = {
  __typename?: 'JobEdge'
  cursor: Scalars['String']['output']
  node: Job
}

export type JobOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more JobSort objects to sort Jobs by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<JobSort>>
}

/** Fields to sort Jobs by. The order in which sorts are applied is not guaranteed when specifying many fields in one JobSort object. */
export type JobSort = {
  completionCount?: InputMaybe<SortDirection>
  createdOn?: InputMaybe<SortDirection>
  description?: InputMaybe<SortDirection>
  dueDate?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  memberCount?: InputMaybe<SortDirection>
  title?: InputMaybe<SortDirection>
  updatedOn?: InputMaybe<SortDirection>
}

export type JobUpdateInput = {
  completionCount?: InputMaybe<Scalars['Int']['input']>
  completionCount_DECREMENT?: InputMaybe<Scalars['Int']['input']>
  completionCount_INCREMENT?: InputMaybe<Scalars['Int']['input']>
  createdOn?: InputMaybe<Scalars['DateTime']['input']>
  description?: InputMaybe<Scalars['String']['input']>
  dueDate?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  memberCount?: InputMaybe<Scalars['Int']['input']>
  memberCount_DECREMENT?: InputMaybe<Scalars['Int']['input']>
  memberCount_INCREMENT?: InputMaybe<Scalars['Int']['input']>
  title?: InputMaybe<Scalars['String']['input']>
  updatedOn?: InputMaybe<Scalars['DateTime']['input']>
}

export type JobWhere = {
  AND?: InputMaybe<Array<JobWhere>>
  NOT?: InputMaybe<JobWhere>
  OR?: InputMaybe<Array<JobWhere>>
  completionCount?: InputMaybe<Scalars['Int']['input']>
  completionCount_GT?: InputMaybe<Scalars['Int']['input']>
  completionCount_GTE?: InputMaybe<Scalars['Int']['input']>
  completionCount_IN?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>
  completionCount_LT?: InputMaybe<Scalars['Int']['input']>
  completionCount_LTE?: InputMaybe<Scalars['Int']['input']>
  createdOn?: InputMaybe<Scalars['DateTime']['input']>
  createdOn_GT?: InputMaybe<Scalars['DateTime']['input']>
  createdOn_GTE?: InputMaybe<Scalars['DateTime']['input']>
  createdOn_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  createdOn_LT?: InputMaybe<Scalars['DateTime']['input']>
  createdOn_LTE?: InputMaybe<Scalars['DateTime']['input']>
  description?: InputMaybe<Scalars['String']['input']>
  description_CONTAINS?: InputMaybe<Scalars['String']['input']>
  description_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  description_IN?: InputMaybe<Array<Scalars['String']['input']>>
  description_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  dueDate?: InputMaybe<Scalars['String']['input']>
  dueDate_CONTAINS?: InputMaybe<Scalars['String']['input']>
  dueDate_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  dueDate_IN?: InputMaybe<Array<Scalars['String']['input']>>
  dueDate_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['ID']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  memberCount?: InputMaybe<Scalars['Int']['input']>
  memberCount_GT?: InputMaybe<Scalars['Int']['input']>
  memberCount_GTE?: InputMaybe<Scalars['Int']['input']>
  memberCount_IN?: InputMaybe<Array<Scalars['Int']['input']>>
  memberCount_LT?: InputMaybe<Scalars['Int']['input']>
  memberCount_LTE?: InputMaybe<Scalars['Int']['input']>
  title?: InputMaybe<Scalars['String']['input']>
  title_CONTAINS?: InputMaybe<Scalars['String']['input']>
  title_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  title_IN?: InputMaybe<Array<Scalars['String']['input']>>
  title_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  updatedOn?: InputMaybe<Scalars['DateTime']['input']>
  updatedOn_GT?: InputMaybe<Scalars['DateTime']['input']>
  updatedOn_GTE?: InputMaybe<Scalars['DateTime']['input']>
  updatedOn_IN?: InputMaybe<Array<Scalars['DateTime']['input']>>
  updatedOn_LT?: InputMaybe<Scalars['DateTime']['input']>
  updatedOn_LTE?: InputMaybe<Scalars['DateTime']['input']>
}

export type JobsConnection = {
  __typename?: 'JobsConnection'
  edges: Array<JobEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MaritalStatus = {
  __typename?: 'MaritalStatus'
  members: Array<Member>
  membersAggregate?: Maybe<MaritalStatusMemberMembersAggregationSelection>
  membersConnection: MaritalStatusMembersConnection
  status?: Maybe<Scalars['String']['output']>
}

export type MaritalStatusMembersArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<MemberOptions>
  where?: InputMaybe<MemberWhere>
}

export type MaritalStatusMembersAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<MemberWhere>
}

export type MaritalStatusMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MaritalStatusMembersConnectionSort>>
  where?: InputMaybe<MaritalStatusMembersConnectionWhere>
}

export type MaritalStatusAggregateSelection = {
  __typename?: 'MaritalStatusAggregateSelection'
  count: Scalars['Int']['output']
  status: StringAggregateSelectionNullable
}

export type MaritalStatusConnectInput = {
  members?: InputMaybe<Array<MaritalStatusMembersConnectFieldInput>>
}

export type MaritalStatusConnectWhere = {
  node: MaritalStatusWhere
}

export type MaritalStatusCreateInput = {
  members?: InputMaybe<MaritalStatusMembersFieldInput>
  status?: InputMaybe<Scalars['String']['input']>
}

export type MaritalStatusDeleteInput = {
  members?: InputMaybe<Array<MaritalStatusMembersDeleteFieldInput>>
}

export type MaritalStatusDisconnectInput = {
  members?: InputMaybe<Array<MaritalStatusMembersDisconnectFieldInput>>
}

export type MaritalStatusEdge = {
  __typename?: 'MaritalStatusEdge'
  cursor: Scalars['String']['output']
  node: MaritalStatus
}

export type MaritalStatusMemberMembersAggregationSelection = {
  __typename?: 'MaritalStatusMemberMembersAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MaritalStatusMemberMembersNodeAggregateSelection>
}

export type MaritalStatusMemberMembersNodeAggregateSelection = {
  __typename?: 'MaritalStatusMemberMembersNodeAggregateSelection'
  auth_id: StringAggregateSelectionNullable
  email: StringAggregateSelectionNullable
  firstName: StringAggregateSelectionNullable
  id: IdAggregateSelectionNonNullable
  lastName: StringAggregateSelectionNullable
  middleName: StringAggregateSelectionNullable
  phoneNumber: StringAggregateSelectionNullable
  pictureUrl: StringAggregateSelectionNullable
  whatsappNumber: StringAggregateSelectionNullable
}

export type MaritalStatusMembersAggregateInput = {
  AND?: InputMaybe<Array<MaritalStatusMembersAggregateInput>>
  NOT?: InputMaybe<MaritalStatusMembersAggregateInput>
  OR?: InputMaybe<Array<MaritalStatusMembersAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MaritalStatusMembersNodeAggregationWhereInput>
}

export type MaritalStatusMembersConnectFieldInput = {
  connect?: InputMaybe<Array<MemberConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<MemberConnectWhere>
}

export type MaritalStatusMembersConnection = {
  __typename?: 'MaritalStatusMembersConnection'
  edges: Array<MaritalStatusMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MaritalStatusMembersConnectionSort = {
  node?: InputMaybe<MemberSort>
}

export type MaritalStatusMembersConnectionWhere = {
  AND?: InputMaybe<Array<MaritalStatusMembersConnectionWhere>>
  NOT?: InputMaybe<MaritalStatusMembersConnectionWhere>
  OR?: InputMaybe<Array<MaritalStatusMembersConnectionWhere>>
  node?: InputMaybe<MemberWhere>
}

export type MaritalStatusMembersCreateFieldInput = {
  node: MemberCreateInput
}

export type MaritalStatusMembersDeleteFieldInput = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<MaritalStatusMembersConnectionWhere>
}

export type MaritalStatusMembersDisconnectFieldInput = {
  disconnect?: InputMaybe<MemberDisconnectInput>
  where?: InputMaybe<MaritalStatusMembersConnectionWhere>
}

export type MaritalStatusMembersFieldInput = {
  connect?: InputMaybe<Array<MaritalStatusMembersConnectFieldInput>>
  create?: InputMaybe<Array<MaritalStatusMembersCreateFieldInput>>
}

export type MaritalStatusMembersNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MaritalStatusMembersNodeAggregationWhereInput>>
  NOT?: InputMaybe<MaritalStatusMembersNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MaritalStatusMembersNodeAggregationWhereInput>>
  auth_id_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  middleName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  middleName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type MaritalStatusMembersRelationship = {
  __typename?: 'MaritalStatusMembersRelationship'
  cursor: Scalars['String']['output']
  node: Member
}

export type MaritalStatusMembersUpdateConnectionInput = {
  node?: InputMaybe<MemberUpdateInput>
}

export type MaritalStatusMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<MaritalStatusMembersConnectFieldInput>>
  create?: InputMaybe<Array<MaritalStatusMembersCreateFieldInput>>
  delete?: InputMaybe<Array<MaritalStatusMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MaritalStatusMembersDisconnectFieldInput>>
  update?: InputMaybe<MaritalStatusMembersUpdateConnectionInput>
  where?: InputMaybe<MaritalStatusMembersConnectionWhere>
}

export type MaritalStatusOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more MaritalStatusSort objects to sort MaritalStatuses by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<MaritalStatusSort>>
}

export type MaritalStatusRelationInput = {
  members?: InputMaybe<Array<MaritalStatusMembersCreateFieldInput>>
}

/** Fields to sort MaritalStatuses by. The order in which sorts are applied is not guaranteed when specifying many fields in one MaritalStatusSort object. */
export type MaritalStatusSort = {
  status?: InputMaybe<SortDirection>
}

export type MaritalStatusUpdateInput = {
  members?: InputMaybe<Array<MaritalStatusMembersUpdateFieldInput>>
  status?: InputMaybe<Scalars['String']['input']>
}

export type MaritalStatusWhere = {
  AND?: InputMaybe<Array<MaritalStatusWhere>>
  NOT?: InputMaybe<MaritalStatusWhere>
  OR?: InputMaybe<Array<MaritalStatusWhere>>
  membersAggregate?: InputMaybe<MaritalStatusMembersAggregateInput>
  /** Return MaritalStatuses where all of the related MaritalStatusMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<MaritalStatusMembersConnectionWhere>
  /** Return MaritalStatuses where none of the related MaritalStatusMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<MaritalStatusMembersConnectionWhere>
  /** Return MaritalStatuses where one of the related MaritalStatusMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<MaritalStatusMembersConnectionWhere>
  /** Return MaritalStatuses where some of the related MaritalStatusMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<MaritalStatusMembersConnectionWhere>
  /** Return MaritalStatuses where all of the related Members match this filter */
  members_ALL?: InputMaybe<MemberWhere>
  /** Return MaritalStatuses where none of the related Members match this filter */
  members_NONE?: InputMaybe<MemberWhere>
  /** Return MaritalStatuses where one of the related Members match this filter */
  members_SINGLE?: InputMaybe<MemberWhere>
  /** Return MaritalStatuses where some of the related Members match this filter */
  members_SOME?: InputMaybe<MemberWhere>
  status?: InputMaybe<Scalars['String']['input']>
  status_CONTAINS?: InputMaybe<Scalars['String']['input']>
  status_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  status_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  status_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type MaritalStatusesConnection = {
  __typename?: 'MaritalStatusesConnection'
  edges: Array<MaritalStatusEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Member = {
  __typename?: 'Member'
  adminCampus: Array<Campus>
  adminCampusAggregate?: Maybe<MemberCampusAdminCampusAggregationSelection>
  adminCampusConnection: MemberAdminCampusConnection
  adminCouncil: Array<Council>
  adminCouncilAggregate?: Maybe<MemberCouncilAdminCouncilAggregationSelection>
  adminCouncilConnection: MemberAdminCouncilConnection
  adminGovernorship: Array<Governorship>
  adminGovernorshipAggregate?: Maybe<MemberGovernorshipAdminGovernorshipAggregationSelection>
  adminGovernorshipConnection: MemberAdminGovernorshipConnection
  adminStream: Array<Stream>
  adminStreamAggregate?: Maybe<MemberStreamAdminStreamAggregationSelection>
  adminStreamConnection: MemberAdminStreamConnection
  auth_id?: Maybe<Scalars['String']['output']>
  bacenta: Bacenta
  bacentaAggregate?: Maybe<MemberBacentaBacentaAggregationSelection>
  bacentaConnection: MemberBacentaConnection
  council: Council
  dob?: Maybe<TimeGraph>
  dobAggregate?: Maybe<MemberTimeGraphDobAggregationSelection>
  dobConnection: MemberDobConnection
  done?: Maybe<Scalars['Boolean']['output']>
  email?: Maybe<Scalars['String']['output']>
  firstName?: Maybe<Scalars['String']['output']>
  fullName?: Maybe<Scalars['String']['output']>
  gender: Gender
  genderAggregate?: Maybe<MemberGenderGenderAggregationSelection>
  genderConnection: MemberGenderConnection
  id: Scalars['ID']['output']
  lastName?: Maybe<Scalars['String']['output']>
  leadsCampus: Array<Campus>
  leadsCampusAggregate?: Maybe<MemberCampusLeadsCampusAggregationSelection>
  leadsCampusConnection: MemberLeadsCampusConnection
  leadsCouncil: Array<Council>
  leadsCouncilAggregate?: Maybe<MemberCouncilLeadsCouncilAggregationSelection>
  leadsCouncilConnection: MemberLeadsCouncilConnection
  leadsGovernorship: Array<Governorship>
  leadsGovernorshipAggregate?: Maybe<MemberGovernorshipLeadsGovernorshipAggregationSelection>
  leadsGovernorshipConnection: MemberLeadsGovernorshipConnection
  leadsStream: Array<Stream>
  leadsStreamAggregate?: Maybe<MemberStreamLeadsStreamAggregationSelection>
  leadsStreamConnection: MemberLeadsStreamConnection
  maritalStatus: MaritalStatus
  maritalStatusAggregate?: Maybe<MemberMaritalStatusMaritalStatusAggregationSelection>
  maritalStatusConnection: MemberMaritalStatusConnection
  middleName?: Maybe<Scalars['String']['output']>
  occupation?: Maybe<Occupation>
  occupationAggregate?: Maybe<MemberOccupationOccupationAggregationSelection>
  occupationConnection: MemberOccupationConnection
  phoneNumber?: Maybe<Scalars['String']['output']>
  pictureUrl?: Maybe<Scalars['String']['output']>
  title: Array<Title>
  titleAggregate?: Maybe<MemberTitleTitleAggregationSelection>
  titleConnection: MemberTitleConnection
  whatsappNumber?: Maybe<Scalars['String']['output']>
}

export type MemberAdminCampusArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<CampusOptions>
  where?: InputMaybe<CampusWhere>
}

export type MemberAdminCampusAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<CampusWhere>
}

export type MemberAdminCampusConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberAdminCampusConnectionSort>>
  where?: InputMaybe<MemberAdminCampusConnectionWhere>
}

export type MemberAdminCouncilArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<CouncilOptions>
  where?: InputMaybe<CouncilWhere>
}

export type MemberAdminCouncilAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<CouncilWhere>
}

export type MemberAdminCouncilConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberAdminCouncilConnectionSort>>
  where?: InputMaybe<MemberAdminCouncilConnectionWhere>
}

export type MemberAdminGovernorshipArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<GovernorshipOptions>
  where?: InputMaybe<GovernorshipWhere>
}

export type MemberAdminGovernorshipAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<GovernorshipWhere>
}

export type MemberAdminGovernorshipConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberAdminGovernorshipConnectionSort>>
  where?: InputMaybe<MemberAdminGovernorshipConnectionWhere>
}

export type MemberAdminStreamArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<StreamOptions>
  where?: InputMaybe<StreamWhere>
}

export type MemberAdminStreamAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<StreamWhere>
}

export type MemberAdminStreamConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberAdminStreamConnectionSort>>
  where?: InputMaybe<MemberAdminStreamConnectionWhere>
}

export type MemberBacentaArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<BacentaOptions>
  where?: InputMaybe<BacentaWhere>
}

export type MemberBacentaAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<BacentaWhere>
}

export type MemberBacentaConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberBacentaConnectionSort>>
  where?: InputMaybe<MemberBacentaConnectionWhere>
}

export type MemberDobArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<TimeGraphOptions>
  where?: InputMaybe<TimeGraphWhere>
}

export type MemberDobAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<TimeGraphWhere>
}

export type MemberDobConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberDobConnectionSort>>
  where?: InputMaybe<MemberDobConnectionWhere>
}

export type MemberDoneArgs = {
  jobId: Scalars['ID']['input']
}

export type MemberGenderArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<GenderOptions>
  where?: InputMaybe<GenderWhere>
}

export type MemberGenderAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<GenderWhere>
}

export type MemberGenderConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberGenderConnectionSort>>
  where?: InputMaybe<MemberGenderConnectionWhere>
}

export type MemberLeadsCampusArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<CampusOptions>
  where?: InputMaybe<CampusWhere>
}

export type MemberLeadsCampusAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<CampusWhere>
}

export type MemberLeadsCampusConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberLeadsCampusConnectionSort>>
  where?: InputMaybe<MemberLeadsCampusConnectionWhere>
}

export type MemberLeadsCouncilArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<CouncilOptions>
  where?: InputMaybe<CouncilWhere>
}

export type MemberLeadsCouncilAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<CouncilWhere>
}

export type MemberLeadsCouncilConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberLeadsCouncilConnectionSort>>
  where?: InputMaybe<MemberLeadsCouncilConnectionWhere>
}

export type MemberLeadsGovernorshipArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<GovernorshipOptions>
  where?: InputMaybe<GovernorshipWhere>
}

export type MemberLeadsGovernorshipAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<GovernorshipWhere>
}

export type MemberLeadsGovernorshipConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberLeadsGovernorshipConnectionSort>>
  where?: InputMaybe<MemberLeadsGovernorshipConnectionWhere>
}

export type MemberLeadsStreamArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<StreamOptions>
  where?: InputMaybe<StreamWhere>
}

export type MemberLeadsStreamAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<StreamWhere>
}

export type MemberLeadsStreamConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberLeadsStreamConnectionSort>>
  where?: InputMaybe<MemberLeadsStreamConnectionWhere>
}

export type MemberMaritalStatusArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<MaritalStatusOptions>
  where?: InputMaybe<MaritalStatusWhere>
}

export type MemberMaritalStatusAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<MaritalStatusWhere>
}

export type MemberMaritalStatusConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberMaritalStatusConnectionSort>>
  where?: InputMaybe<MemberMaritalStatusConnectionWhere>
}

export type MemberOccupationArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<OccupationOptions>
  where?: InputMaybe<OccupationWhere>
}

export type MemberOccupationAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<OccupationWhere>
}

export type MemberOccupationConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberOccupationConnectionSort>>
  where?: InputMaybe<MemberOccupationConnectionWhere>
}

export type MemberTitleArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<TitleOptions>
  where?: InputMaybe<TitleWhere>
}

export type MemberTitleAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<TitleWhere>
}

export type MemberTitleConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<MemberTitleConnectionSort>>
  where?: InputMaybe<MemberTitleConnectionWhere>
}

export type MemberAdminCampusAggregateInput = {
  AND?: InputMaybe<Array<MemberAdminCampusAggregateInput>>
  NOT?: InputMaybe<MemberAdminCampusAggregateInput>
  OR?: InputMaybe<Array<MemberAdminCampusAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberAdminCampusNodeAggregationWhereInput>
}

export type MemberAdminCampusConnectFieldInput = {
  connect?: InputMaybe<Array<CampusConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<CampusConnectWhere>
}

export type MemberAdminCampusConnection = {
  __typename?: 'MemberAdminCampusConnection'
  edges: Array<MemberAdminCampusRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberAdminCampusConnectionSort = {
  node?: InputMaybe<CampusSort>
}

export type MemberAdminCampusConnectionWhere = {
  AND?: InputMaybe<Array<MemberAdminCampusConnectionWhere>>
  NOT?: InputMaybe<MemberAdminCampusConnectionWhere>
  OR?: InputMaybe<Array<MemberAdminCampusConnectionWhere>>
  node?: InputMaybe<CampusWhere>
}

export type MemberAdminCampusCreateFieldInput = {
  node: CampusCreateInput
}

export type MemberAdminCampusDeleteFieldInput = {
  delete?: InputMaybe<CampusDeleteInput>
  where?: InputMaybe<MemberAdminCampusConnectionWhere>
}

export type MemberAdminCampusDisconnectFieldInput = {
  disconnect?: InputMaybe<CampusDisconnectInput>
  where?: InputMaybe<MemberAdminCampusConnectionWhere>
}

export type MemberAdminCampusFieldInput = {
  connect?: InputMaybe<Array<MemberAdminCampusConnectFieldInput>>
  create?: InputMaybe<Array<MemberAdminCampusCreateFieldInput>>
}

export type MemberAdminCampusNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberAdminCampusNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberAdminCampusNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberAdminCampusNodeAggregationWhereInput>>
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

export type MemberAdminCampusRelationship = {
  __typename?: 'MemberAdminCampusRelationship'
  cursor: Scalars['String']['output']
  node: Campus
}

export type MemberAdminCampusUpdateConnectionInput = {
  node?: InputMaybe<CampusUpdateInput>
}

export type MemberAdminCampusUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberAdminCampusConnectFieldInput>>
  create?: InputMaybe<Array<MemberAdminCampusCreateFieldInput>>
  delete?: InputMaybe<Array<MemberAdminCampusDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberAdminCampusDisconnectFieldInput>>
  update?: InputMaybe<MemberAdminCampusUpdateConnectionInput>
  where?: InputMaybe<MemberAdminCampusConnectionWhere>
}

export type MemberAdminCouncilAggregateInput = {
  AND?: InputMaybe<Array<MemberAdminCouncilAggregateInput>>
  NOT?: InputMaybe<MemberAdminCouncilAggregateInput>
  OR?: InputMaybe<Array<MemberAdminCouncilAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberAdminCouncilNodeAggregationWhereInput>
}

export type MemberAdminCouncilConnectFieldInput = {
  connect?: InputMaybe<Array<CouncilConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<CouncilConnectWhere>
}

export type MemberAdminCouncilConnection = {
  __typename?: 'MemberAdminCouncilConnection'
  edges: Array<MemberAdminCouncilRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberAdminCouncilConnectionSort = {
  node?: InputMaybe<CouncilSort>
}

export type MemberAdminCouncilConnectionWhere = {
  AND?: InputMaybe<Array<MemberAdminCouncilConnectionWhere>>
  NOT?: InputMaybe<MemberAdminCouncilConnectionWhere>
  OR?: InputMaybe<Array<MemberAdminCouncilConnectionWhere>>
  node?: InputMaybe<CouncilWhere>
}

export type MemberAdminCouncilCreateFieldInput = {
  node: CouncilCreateInput
}

export type MemberAdminCouncilDeleteFieldInput = {
  delete?: InputMaybe<CouncilDeleteInput>
  where?: InputMaybe<MemberAdminCouncilConnectionWhere>
}

export type MemberAdminCouncilDisconnectFieldInput = {
  disconnect?: InputMaybe<CouncilDisconnectInput>
  where?: InputMaybe<MemberAdminCouncilConnectionWhere>
}

export type MemberAdminCouncilFieldInput = {
  connect?: InputMaybe<Array<MemberAdminCouncilConnectFieldInput>>
  create?: InputMaybe<Array<MemberAdminCouncilCreateFieldInput>>
}

export type MemberAdminCouncilNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberAdminCouncilNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberAdminCouncilNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberAdminCouncilNodeAggregationWhereInput>>
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

export type MemberAdminCouncilRelationship = {
  __typename?: 'MemberAdminCouncilRelationship'
  cursor: Scalars['String']['output']
  node: Council
}

export type MemberAdminCouncilUpdateConnectionInput = {
  node?: InputMaybe<CouncilUpdateInput>
}

export type MemberAdminCouncilUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberAdminCouncilConnectFieldInput>>
  create?: InputMaybe<Array<MemberAdminCouncilCreateFieldInput>>
  delete?: InputMaybe<Array<MemberAdminCouncilDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberAdminCouncilDisconnectFieldInput>>
  update?: InputMaybe<MemberAdminCouncilUpdateConnectionInput>
  where?: InputMaybe<MemberAdminCouncilConnectionWhere>
}

export type MemberAdminGovernorshipAggregateInput = {
  AND?: InputMaybe<Array<MemberAdminGovernorshipAggregateInput>>
  NOT?: InputMaybe<MemberAdminGovernorshipAggregateInput>
  OR?: InputMaybe<Array<MemberAdminGovernorshipAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberAdminGovernorshipNodeAggregationWhereInput>
}

export type MemberAdminGovernorshipConnectFieldInput = {
  connect?: InputMaybe<Array<GovernorshipConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<GovernorshipConnectWhere>
}

export type MemberAdminGovernorshipConnection = {
  __typename?: 'MemberAdminGovernorshipConnection'
  edges: Array<MemberAdminGovernorshipRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberAdminGovernorshipConnectionSort = {
  node?: InputMaybe<GovernorshipSort>
}

export type MemberAdminGovernorshipConnectionWhere = {
  AND?: InputMaybe<Array<MemberAdminGovernorshipConnectionWhere>>
  NOT?: InputMaybe<MemberAdminGovernorshipConnectionWhere>
  OR?: InputMaybe<Array<MemberAdminGovernorshipConnectionWhere>>
  node?: InputMaybe<GovernorshipWhere>
}

export type MemberAdminGovernorshipCreateFieldInput = {
  node: GovernorshipCreateInput
}

export type MemberAdminGovernorshipDeleteFieldInput = {
  delete?: InputMaybe<GovernorshipDeleteInput>
  where?: InputMaybe<MemberAdminGovernorshipConnectionWhere>
}

export type MemberAdminGovernorshipDisconnectFieldInput = {
  disconnect?: InputMaybe<GovernorshipDisconnectInput>
  where?: InputMaybe<MemberAdminGovernorshipConnectionWhere>
}

export type MemberAdminGovernorshipFieldInput = {
  connect?: InputMaybe<Array<MemberAdminGovernorshipConnectFieldInput>>
  create?: InputMaybe<Array<MemberAdminGovernorshipCreateFieldInput>>
}

export type MemberAdminGovernorshipNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberAdminGovernorshipNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberAdminGovernorshipNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberAdminGovernorshipNodeAggregationWhereInput>>
  bankingCode_AVERAGE_EQUAL?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_GT?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_GTE?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_LT?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_LTE?: InputMaybe<Scalars['Float']['input']>
  bankingCode_MAX_EQUAL?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_GT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_GTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_LT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_LTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_EQUAL?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_GT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_GTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_LT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_LTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_EQUAL?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_GT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_GTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_LT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type MemberAdminGovernorshipRelationship = {
  __typename?: 'MemberAdminGovernorshipRelationship'
  cursor: Scalars['String']['output']
  node: Governorship
}

export type MemberAdminGovernorshipUpdateConnectionInput = {
  node?: InputMaybe<GovernorshipUpdateInput>
}

export type MemberAdminGovernorshipUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberAdminGovernorshipConnectFieldInput>>
  create?: InputMaybe<Array<MemberAdminGovernorshipCreateFieldInput>>
  delete?: InputMaybe<Array<MemberAdminGovernorshipDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberAdminGovernorshipDisconnectFieldInput>>
  update?: InputMaybe<MemberAdminGovernorshipUpdateConnectionInput>
  where?: InputMaybe<MemberAdminGovernorshipConnectionWhere>
}

export type MemberAdminStreamAggregateInput = {
  AND?: InputMaybe<Array<MemberAdminStreamAggregateInput>>
  NOT?: InputMaybe<MemberAdminStreamAggregateInput>
  OR?: InputMaybe<Array<MemberAdminStreamAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberAdminStreamNodeAggregationWhereInput>
}

export type MemberAdminStreamConnectFieldInput = {
  connect?: InputMaybe<Array<StreamConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<StreamConnectWhere>
}

export type MemberAdminStreamConnection = {
  __typename?: 'MemberAdminStreamConnection'
  edges: Array<MemberAdminStreamRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberAdminStreamConnectionSort = {
  node?: InputMaybe<StreamSort>
}

export type MemberAdminStreamConnectionWhere = {
  AND?: InputMaybe<Array<MemberAdminStreamConnectionWhere>>
  NOT?: InputMaybe<MemberAdminStreamConnectionWhere>
  OR?: InputMaybe<Array<MemberAdminStreamConnectionWhere>>
  node?: InputMaybe<StreamWhere>
}

export type MemberAdminStreamCreateFieldInput = {
  node: StreamCreateInput
}

export type MemberAdminStreamDeleteFieldInput = {
  delete?: InputMaybe<StreamDeleteInput>
  where?: InputMaybe<MemberAdminStreamConnectionWhere>
}

export type MemberAdminStreamDisconnectFieldInput = {
  disconnect?: InputMaybe<StreamDisconnectInput>
  where?: InputMaybe<MemberAdminStreamConnectionWhere>
}

export type MemberAdminStreamFieldInput = {
  connect?: InputMaybe<Array<MemberAdminStreamConnectFieldInput>>
  create?: InputMaybe<Array<MemberAdminStreamCreateFieldInput>>
}

export type MemberAdminStreamNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberAdminStreamNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberAdminStreamNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberAdminStreamNodeAggregationWhereInput>>
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

export type MemberAdminStreamRelationship = {
  __typename?: 'MemberAdminStreamRelationship'
  cursor: Scalars['String']['output']
  node: Stream
}

export type MemberAdminStreamUpdateConnectionInput = {
  node?: InputMaybe<StreamUpdateInput>
}

export type MemberAdminStreamUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberAdminStreamConnectFieldInput>>
  create?: InputMaybe<Array<MemberAdminStreamCreateFieldInput>>
  delete?: InputMaybe<Array<MemberAdminStreamDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberAdminStreamDisconnectFieldInput>>
  update?: InputMaybe<MemberAdminStreamUpdateConnectionInput>
  where?: InputMaybe<MemberAdminStreamConnectionWhere>
}

export type MemberAggregateSelection = {
  __typename?: 'MemberAggregateSelection'
  auth_id: StringAggregateSelectionNullable
  count: Scalars['Int']['output']
  email: StringAggregateSelectionNullable
  firstName: StringAggregateSelectionNullable
  id: IdAggregateSelectionNonNullable
  lastName: StringAggregateSelectionNullable
  middleName: StringAggregateSelectionNullable
  phoneNumber: StringAggregateSelectionNullable
  pictureUrl: StringAggregateSelectionNullable
  whatsappNumber: StringAggregateSelectionNullable
}

export type MemberBacentaAggregateInput = {
  AND?: InputMaybe<Array<MemberBacentaAggregateInput>>
  NOT?: InputMaybe<MemberBacentaAggregateInput>
  OR?: InputMaybe<Array<MemberBacentaAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberBacentaNodeAggregationWhereInput>
}

export type MemberBacentaBacentaAggregationSelection = {
  __typename?: 'MemberBacentaBacentaAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberBacentaBacentaNodeAggregateSelection>
}

export type MemberBacentaBacentaNodeAggregateSelection = {
  __typename?: 'MemberBacentaBacentaNodeAggregateSelection'
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type MemberBacentaConnectFieldInput = {
  connect?: InputMaybe<BacentaConnectInput>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<BacentaConnectWhere>
}

export type MemberBacentaConnection = {
  __typename?: 'MemberBacentaConnection'
  edges: Array<MemberBacentaRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberBacentaConnectionSort = {
  node?: InputMaybe<BacentaSort>
}

export type MemberBacentaConnectionWhere = {
  AND?: InputMaybe<Array<MemberBacentaConnectionWhere>>
  NOT?: InputMaybe<MemberBacentaConnectionWhere>
  OR?: InputMaybe<Array<MemberBacentaConnectionWhere>>
  node?: InputMaybe<BacentaWhere>
}

export type MemberBacentaCreateFieldInput = {
  node: BacentaCreateInput
}

export type MemberBacentaDeleteFieldInput = {
  delete?: InputMaybe<BacentaDeleteInput>
  where?: InputMaybe<MemberBacentaConnectionWhere>
}

export type MemberBacentaDisconnectFieldInput = {
  disconnect?: InputMaybe<BacentaDisconnectInput>
  where?: InputMaybe<MemberBacentaConnectionWhere>
}

export type MemberBacentaFieldInput = {
  connect?: InputMaybe<MemberBacentaConnectFieldInput>
  create?: InputMaybe<MemberBacentaCreateFieldInput>
}

export type MemberBacentaNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberBacentaNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberBacentaNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberBacentaNodeAggregationWhereInput>>
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

export type MemberBacentaRelationship = {
  __typename?: 'MemberBacentaRelationship'
  cursor: Scalars['String']['output']
  node: Bacenta
}

export type MemberBacentaUpdateConnectionInput = {
  node?: InputMaybe<BacentaUpdateInput>
}

export type MemberBacentaUpdateFieldInput = {
  connect?: InputMaybe<MemberBacentaConnectFieldInput>
  create?: InputMaybe<MemberBacentaCreateFieldInput>
  delete?: InputMaybe<MemberBacentaDeleteFieldInput>
  disconnect?: InputMaybe<MemberBacentaDisconnectFieldInput>
  update?: InputMaybe<MemberBacentaUpdateConnectionInput>
  where?: InputMaybe<MemberBacentaConnectionWhere>
}

export type MemberCampusAdminCampusAggregationSelection = {
  __typename?: 'MemberCampusAdminCampusAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberCampusAdminCampusNodeAggregateSelection>
}

export type MemberCampusAdminCampusNodeAggregateSelection = {
  __typename?: 'MemberCampusAdminCampusNodeAggregateSelection'
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type MemberCampusLeadsCampusAggregationSelection = {
  __typename?: 'MemberCampusLeadsCampusAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberCampusLeadsCampusNodeAggregateSelection>
}

export type MemberCampusLeadsCampusNodeAggregateSelection = {
  __typename?: 'MemberCampusLeadsCampusNodeAggregateSelection'
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type MemberConnectInput = {
  adminCampus?: InputMaybe<Array<MemberAdminCampusConnectFieldInput>>
  adminCouncil?: InputMaybe<Array<MemberAdminCouncilConnectFieldInput>>
  adminGovernorship?: InputMaybe<
    Array<MemberAdminGovernorshipConnectFieldInput>
  >
  adminStream?: InputMaybe<Array<MemberAdminStreamConnectFieldInput>>
  bacenta?: InputMaybe<MemberBacentaConnectFieldInput>
  dob?: InputMaybe<MemberDobConnectFieldInput>
  gender?: InputMaybe<MemberGenderConnectFieldInput>
  leadsCampus?: InputMaybe<Array<MemberLeadsCampusConnectFieldInput>>
  leadsCouncil?: InputMaybe<Array<MemberLeadsCouncilConnectFieldInput>>
  leadsGovernorship?: InputMaybe<
    Array<MemberLeadsGovernorshipConnectFieldInput>
  >
  leadsStream?: InputMaybe<Array<MemberLeadsStreamConnectFieldInput>>
  maritalStatus?: InputMaybe<MemberMaritalStatusConnectFieldInput>
  occupation?: InputMaybe<MemberOccupationConnectFieldInput>
  title?: InputMaybe<Array<MemberTitleConnectFieldInput>>
}

export type MemberConnectWhere = {
  node: MemberWhere
}

export type MemberCouncilAdminCouncilAggregationSelection = {
  __typename?: 'MemberCouncilAdminCouncilAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberCouncilAdminCouncilNodeAggregateSelection>
}

export type MemberCouncilAdminCouncilNodeAggregateSelection = {
  __typename?: 'MemberCouncilAdminCouncilNodeAggregateSelection'
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type MemberCouncilLeadsCouncilAggregationSelection = {
  __typename?: 'MemberCouncilLeadsCouncilAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberCouncilLeadsCouncilNodeAggregateSelection>
}

export type MemberCouncilLeadsCouncilNodeAggregateSelection = {
  __typename?: 'MemberCouncilLeadsCouncilNodeAggregateSelection'
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type MemberCreateInput = {
  adminCampus?: InputMaybe<MemberAdminCampusFieldInput>
  adminCouncil?: InputMaybe<MemberAdminCouncilFieldInput>
  adminGovernorship?: InputMaybe<MemberAdminGovernorshipFieldInput>
  adminStream?: InputMaybe<MemberAdminStreamFieldInput>
  auth_id?: InputMaybe<Scalars['String']['input']>
  bacenta?: InputMaybe<MemberBacentaFieldInput>
  dob?: InputMaybe<MemberDobFieldInput>
  done?: InputMaybe<Scalars['Boolean']['input']>
  email?: InputMaybe<Scalars['String']['input']>
  firstName?: InputMaybe<Scalars['String']['input']>
  gender?: InputMaybe<MemberGenderFieldInput>
  id: Scalars['ID']['input']
  lastName?: InputMaybe<Scalars['String']['input']>
  leadsCampus?: InputMaybe<MemberLeadsCampusFieldInput>
  leadsCouncil?: InputMaybe<MemberLeadsCouncilFieldInput>
  leadsGovernorship?: InputMaybe<MemberLeadsGovernorshipFieldInput>
  leadsStream?: InputMaybe<MemberLeadsStreamFieldInput>
  maritalStatus?: InputMaybe<MemberMaritalStatusFieldInput>
  middleName?: InputMaybe<Scalars['String']['input']>
  occupation?: InputMaybe<MemberOccupationFieldInput>
  phoneNumber?: InputMaybe<Scalars['String']['input']>
  pictureUrl?: InputMaybe<Scalars['String']['input']>
  title?: InputMaybe<MemberTitleFieldInput>
  whatsappNumber?: InputMaybe<Scalars['String']['input']>
}

export type MemberDeleteInput = {
  adminCampus?: InputMaybe<Array<MemberAdminCampusDeleteFieldInput>>
  adminCouncil?: InputMaybe<Array<MemberAdminCouncilDeleteFieldInput>>
  adminGovernorship?: InputMaybe<Array<MemberAdminGovernorshipDeleteFieldInput>>
  adminStream?: InputMaybe<Array<MemberAdminStreamDeleteFieldInput>>
  bacenta?: InputMaybe<MemberBacentaDeleteFieldInput>
  dob?: InputMaybe<MemberDobDeleteFieldInput>
  gender?: InputMaybe<MemberGenderDeleteFieldInput>
  leadsCampus?: InputMaybe<Array<MemberLeadsCampusDeleteFieldInput>>
  leadsCouncil?: InputMaybe<Array<MemberLeadsCouncilDeleteFieldInput>>
  leadsGovernorship?: InputMaybe<Array<MemberLeadsGovernorshipDeleteFieldInput>>
  leadsStream?: InputMaybe<Array<MemberLeadsStreamDeleteFieldInput>>
  maritalStatus?: InputMaybe<MemberMaritalStatusDeleteFieldInput>
  occupation?: InputMaybe<MemberOccupationDeleteFieldInput>
  title?: InputMaybe<Array<MemberTitleDeleteFieldInput>>
}

export type MemberDisconnectInput = {
  adminCampus?: InputMaybe<Array<MemberAdminCampusDisconnectFieldInput>>
  adminCouncil?: InputMaybe<Array<MemberAdminCouncilDisconnectFieldInput>>
  adminGovernorship?: InputMaybe<
    Array<MemberAdminGovernorshipDisconnectFieldInput>
  >
  adminStream?: InputMaybe<Array<MemberAdminStreamDisconnectFieldInput>>
  bacenta?: InputMaybe<MemberBacentaDisconnectFieldInput>
  dob?: InputMaybe<MemberDobDisconnectFieldInput>
  gender?: InputMaybe<MemberGenderDisconnectFieldInput>
  leadsCampus?: InputMaybe<Array<MemberLeadsCampusDisconnectFieldInput>>
  leadsCouncil?: InputMaybe<Array<MemberLeadsCouncilDisconnectFieldInput>>
  leadsGovernorship?: InputMaybe<
    Array<MemberLeadsGovernorshipDisconnectFieldInput>
  >
  leadsStream?: InputMaybe<Array<MemberLeadsStreamDisconnectFieldInput>>
  maritalStatus?: InputMaybe<MemberMaritalStatusDisconnectFieldInput>
  occupation?: InputMaybe<MemberOccupationDisconnectFieldInput>
  title?: InputMaybe<Array<MemberTitleDisconnectFieldInput>>
}

export type MemberDobAggregateInput = {
  AND?: InputMaybe<Array<MemberDobAggregateInput>>
  NOT?: InputMaybe<MemberDobAggregateInput>
  OR?: InputMaybe<Array<MemberDobAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type MemberDobConnectFieldInput = {
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<TimeGraphConnectWhere>
}

export type MemberDobConnection = {
  __typename?: 'MemberDobConnection'
  edges: Array<MemberDobRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberDobConnectionSort = {
  node?: InputMaybe<TimeGraphSort>
}

export type MemberDobConnectionWhere = {
  AND?: InputMaybe<Array<MemberDobConnectionWhere>>
  NOT?: InputMaybe<MemberDobConnectionWhere>
  OR?: InputMaybe<Array<MemberDobConnectionWhere>>
  node?: InputMaybe<TimeGraphWhere>
}

export type MemberDobCreateFieldInput = {
  node: TimeGraphCreateInput
}

export type MemberDobDeleteFieldInput = {
  where?: InputMaybe<MemberDobConnectionWhere>
}

export type MemberDobDisconnectFieldInput = {
  where?: InputMaybe<MemberDobConnectionWhere>
}

export type MemberDobFieldInput = {
  connect?: InputMaybe<MemberDobConnectFieldInput>
  create?: InputMaybe<MemberDobCreateFieldInput>
}

export type MemberDobRelationship = {
  __typename?: 'MemberDobRelationship'
  cursor: Scalars['String']['output']
  node: TimeGraph
}

export type MemberDobUpdateConnectionInput = {
  node?: InputMaybe<TimeGraphUpdateInput>
}

export type MemberDobUpdateFieldInput = {
  connect?: InputMaybe<MemberDobConnectFieldInput>
  create?: InputMaybe<MemberDobCreateFieldInput>
  delete?: InputMaybe<MemberDobDeleteFieldInput>
  disconnect?: InputMaybe<MemberDobDisconnectFieldInput>
  update?: InputMaybe<MemberDobUpdateConnectionInput>
  where?: InputMaybe<MemberDobConnectionWhere>
}

export type MemberEdge = {
  __typename?: 'MemberEdge'
  cursor: Scalars['String']['output']
  node: Member
}

export type MemberGenderAggregateInput = {
  AND?: InputMaybe<Array<MemberGenderAggregateInput>>
  NOT?: InputMaybe<MemberGenderAggregateInput>
  OR?: InputMaybe<Array<MemberGenderAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberGenderNodeAggregationWhereInput>
}

export type MemberGenderConnectFieldInput = {
  connect?: InputMaybe<GenderConnectInput>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<GenderConnectWhere>
}

export type MemberGenderConnection = {
  __typename?: 'MemberGenderConnection'
  edges: Array<MemberGenderRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberGenderConnectionSort = {
  node?: InputMaybe<GenderSort>
}

export type MemberGenderConnectionWhere = {
  AND?: InputMaybe<Array<MemberGenderConnectionWhere>>
  NOT?: InputMaybe<MemberGenderConnectionWhere>
  OR?: InputMaybe<Array<MemberGenderConnectionWhere>>
  node?: InputMaybe<GenderWhere>
}

export type MemberGenderCreateFieldInput = {
  node: GenderCreateInput
}

export type MemberGenderDeleteFieldInput = {
  delete?: InputMaybe<GenderDeleteInput>
  where?: InputMaybe<MemberGenderConnectionWhere>
}

export type MemberGenderDisconnectFieldInput = {
  disconnect?: InputMaybe<GenderDisconnectInput>
  where?: InputMaybe<MemberGenderConnectionWhere>
}

export type MemberGenderFieldInput = {
  connect?: InputMaybe<MemberGenderConnectFieldInput>
  create?: InputMaybe<MemberGenderCreateFieldInput>
}

export type MemberGenderGenderAggregationSelection = {
  __typename?: 'MemberGenderGenderAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberGenderGenderNodeAggregateSelection>
}

export type MemberGenderGenderNodeAggregateSelection = {
  __typename?: 'MemberGenderGenderNodeAggregateSelection'
  gender: StringAggregateSelectionNullable
}

export type MemberGenderNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberGenderNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberGenderNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberGenderNodeAggregationWhereInput>>
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
}

export type MemberGenderRelationship = {
  __typename?: 'MemberGenderRelationship'
  cursor: Scalars['String']['output']
  node: Gender
}

export type MemberGenderUpdateConnectionInput = {
  node?: InputMaybe<GenderUpdateInput>
}

export type MemberGenderUpdateFieldInput = {
  connect?: InputMaybe<MemberGenderConnectFieldInput>
  create?: InputMaybe<MemberGenderCreateFieldInput>
  delete?: InputMaybe<MemberGenderDeleteFieldInput>
  disconnect?: InputMaybe<MemberGenderDisconnectFieldInput>
  update?: InputMaybe<MemberGenderUpdateConnectionInput>
  where?: InputMaybe<MemberGenderConnectionWhere>
}

export type MemberGovernorshipAdminGovernorshipAggregationSelection = {
  __typename?: 'MemberGovernorshipAdminGovernorshipAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberGovernorshipAdminGovernorshipNodeAggregateSelection>
}

export type MemberGovernorshipAdminGovernorshipNodeAggregateSelection = {
  __typename?: 'MemberGovernorshipAdminGovernorshipNodeAggregateSelection'
  bankingCode: IntAggregateSelectionNonNullable
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type MemberGovernorshipLeadsGovernorshipAggregationSelection = {
  __typename?: 'MemberGovernorshipLeadsGovernorshipAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberGovernorshipLeadsGovernorshipNodeAggregateSelection>
}

export type MemberGovernorshipLeadsGovernorshipNodeAggregateSelection = {
  __typename?: 'MemberGovernorshipLeadsGovernorshipNodeAggregateSelection'
  bankingCode: IntAggregateSelectionNonNullable
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type MemberInput = {
  firstName: Scalars['String']['input']
  id: Scalars['ID']['input']
  lastName: Scalars['String']['input']
  phoneNumber: Scalars['String']['input']
  pictureUrl: Scalars['String']['input']
  whatsappNumber: Scalars['String']['input']
}

export type MemberLeadsCampusAggregateInput = {
  AND?: InputMaybe<Array<MemberLeadsCampusAggregateInput>>
  NOT?: InputMaybe<MemberLeadsCampusAggregateInput>
  OR?: InputMaybe<Array<MemberLeadsCampusAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberLeadsCampusNodeAggregationWhereInput>
}

export type MemberLeadsCampusConnectFieldInput = {
  connect?: InputMaybe<Array<CampusConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<CampusConnectWhere>
}

export type MemberLeadsCampusConnection = {
  __typename?: 'MemberLeadsCampusConnection'
  edges: Array<MemberLeadsCampusRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberLeadsCampusConnectionSort = {
  node?: InputMaybe<CampusSort>
}

export type MemberLeadsCampusConnectionWhere = {
  AND?: InputMaybe<Array<MemberLeadsCampusConnectionWhere>>
  NOT?: InputMaybe<MemberLeadsCampusConnectionWhere>
  OR?: InputMaybe<Array<MemberLeadsCampusConnectionWhere>>
  node?: InputMaybe<CampusWhere>
}

export type MemberLeadsCampusCreateFieldInput = {
  node: CampusCreateInput
}

export type MemberLeadsCampusDeleteFieldInput = {
  delete?: InputMaybe<CampusDeleteInput>
  where?: InputMaybe<MemberLeadsCampusConnectionWhere>
}

export type MemberLeadsCampusDisconnectFieldInput = {
  disconnect?: InputMaybe<CampusDisconnectInput>
  where?: InputMaybe<MemberLeadsCampusConnectionWhere>
}

export type MemberLeadsCampusFieldInput = {
  connect?: InputMaybe<Array<MemberLeadsCampusConnectFieldInput>>
  create?: InputMaybe<Array<MemberLeadsCampusCreateFieldInput>>
}

export type MemberLeadsCampusNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberLeadsCampusNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberLeadsCampusNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberLeadsCampusNodeAggregationWhereInput>>
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

export type MemberLeadsCampusRelationship = {
  __typename?: 'MemberLeadsCampusRelationship'
  cursor: Scalars['String']['output']
  node: Campus
}

export type MemberLeadsCampusUpdateConnectionInput = {
  node?: InputMaybe<CampusUpdateInput>
}

export type MemberLeadsCampusUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberLeadsCampusConnectFieldInput>>
  create?: InputMaybe<Array<MemberLeadsCampusCreateFieldInput>>
  delete?: InputMaybe<Array<MemberLeadsCampusDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberLeadsCampusDisconnectFieldInput>>
  update?: InputMaybe<MemberLeadsCampusUpdateConnectionInput>
  where?: InputMaybe<MemberLeadsCampusConnectionWhere>
}

export type MemberLeadsCouncilAggregateInput = {
  AND?: InputMaybe<Array<MemberLeadsCouncilAggregateInput>>
  NOT?: InputMaybe<MemberLeadsCouncilAggregateInput>
  OR?: InputMaybe<Array<MemberLeadsCouncilAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberLeadsCouncilNodeAggregationWhereInput>
}

export type MemberLeadsCouncilConnectFieldInput = {
  connect?: InputMaybe<Array<CouncilConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<CouncilConnectWhere>
}

export type MemberLeadsCouncilConnection = {
  __typename?: 'MemberLeadsCouncilConnection'
  edges: Array<MemberLeadsCouncilRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberLeadsCouncilConnectionSort = {
  node?: InputMaybe<CouncilSort>
}

export type MemberLeadsCouncilConnectionWhere = {
  AND?: InputMaybe<Array<MemberLeadsCouncilConnectionWhere>>
  NOT?: InputMaybe<MemberLeadsCouncilConnectionWhere>
  OR?: InputMaybe<Array<MemberLeadsCouncilConnectionWhere>>
  node?: InputMaybe<CouncilWhere>
}

export type MemberLeadsCouncilCreateFieldInput = {
  node: CouncilCreateInput
}

export type MemberLeadsCouncilDeleteFieldInput = {
  delete?: InputMaybe<CouncilDeleteInput>
  where?: InputMaybe<MemberLeadsCouncilConnectionWhere>
}

export type MemberLeadsCouncilDisconnectFieldInput = {
  disconnect?: InputMaybe<CouncilDisconnectInput>
  where?: InputMaybe<MemberLeadsCouncilConnectionWhere>
}

export type MemberLeadsCouncilFieldInput = {
  connect?: InputMaybe<Array<MemberLeadsCouncilConnectFieldInput>>
  create?: InputMaybe<Array<MemberLeadsCouncilCreateFieldInput>>
}

export type MemberLeadsCouncilNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberLeadsCouncilNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberLeadsCouncilNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberLeadsCouncilNodeAggregationWhereInput>>
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

export type MemberLeadsCouncilRelationship = {
  __typename?: 'MemberLeadsCouncilRelationship'
  cursor: Scalars['String']['output']
  node: Council
}

export type MemberLeadsCouncilUpdateConnectionInput = {
  node?: InputMaybe<CouncilUpdateInput>
}

export type MemberLeadsCouncilUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberLeadsCouncilConnectFieldInput>>
  create?: InputMaybe<Array<MemberLeadsCouncilCreateFieldInput>>
  delete?: InputMaybe<Array<MemberLeadsCouncilDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberLeadsCouncilDisconnectFieldInput>>
  update?: InputMaybe<MemberLeadsCouncilUpdateConnectionInput>
  where?: InputMaybe<MemberLeadsCouncilConnectionWhere>
}

export type MemberLeadsGovernorshipAggregateInput = {
  AND?: InputMaybe<Array<MemberLeadsGovernorshipAggregateInput>>
  NOT?: InputMaybe<MemberLeadsGovernorshipAggregateInput>
  OR?: InputMaybe<Array<MemberLeadsGovernorshipAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberLeadsGovernorshipNodeAggregationWhereInput>
}

export type MemberLeadsGovernorshipConnectFieldInput = {
  connect?: InputMaybe<Array<GovernorshipConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<GovernorshipConnectWhere>
}

export type MemberLeadsGovernorshipConnection = {
  __typename?: 'MemberLeadsGovernorshipConnection'
  edges: Array<MemberLeadsGovernorshipRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberLeadsGovernorshipConnectionSort = {
  node?: InputMaybe<GovernorshipSort>
}

export type MemberLeadsGovernorshipConnectionWhere = {
  AND?: InputMaybe<Array<MemberLeadsGovernorshipConnectionWhere>>
  NOT?: InputMaybe<MemberLeadsGovernorshipConnectionWhere>
  OR?: InputMaybe<Array<MemberLeadsGovernorshipConnectionWhere>>
  node?: InputMaybe<GovernorshipWhere>
}

export type MemberLeadsGovernorshipCreateFieldInput = {
  node: GovernorshipCreateInput
}

export type MemberLeadsGovernorshipDeleteFieldInput = {
  delete?: InputMaybe<GovernorshipDeleteInput>
  where?: InputMaybe<MemberLeadsGovernorshipConnectionWhere>
}

export type MemberLeadsGovernorshipDisconnectFieldInput = {
  disconnect?: InputMaybe<GovernorshipDisconnectInput>
  where?: InputMaybe<MemberLeadsGovernorshipConnectionWhere>
}

export type MemberLeadsGovernorshipFieldInput = {
  connect?: InputMaybe<Array<MemberLeadsGovernorshipConnectFieldInput>>
  create?: InputMaybe<Array<MemberLeadsGovernorshipCreateFieldInput>>
}

export type MemberLeadsGovernorshipNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberLeadsGovernorshipNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberLeadsGovernorshipNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberLeadsGovernorshipNodeAggregationWhereInput>>
  bankingCode_AVERAGE_EQUAL?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_GT?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_GTE?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_LT?: InputMaybe<Scalars['Float']['input']>
  bankingCode_AVERAGE_LTE?: InputMaybe<Scalars['Float']['input']>
  bankingCode_MAX_EQUAL?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_GT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_GTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_LT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MAX_LTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_EQUAL?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_GT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_GTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_LT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_MIN_LTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_EQUAL?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_GT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_GTE?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_LT?: InputMaybe<Scalars['Int']['input']>
  bankingCode_SUM_LTE?: InputMaybe<Scalars['Int']['input']>
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

export type MemberLeadsGovernorshipRelationship = {
  __typename?: 'MemberLeadsGovernorshipRelationship'
  cursor: Scalars['String']['output']
  node: Governorship
}

export type MemberLeadsGovernorshipUpdateConnectionInput = {
  node?: InputMaybe<GovernorshipUpdateInput>
}

export type MemberLeadsGovernorshipUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberLeadsGovernorshipConnectFieldInput>>
  create?: InputMaybe<Array<MemberLeadsGovernorshipCreateFieldInput>>
  delete?: InputMaybe<Array<MemberLeadsGovernorshipDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberLeadsGovernorshipDisconnectFieldInput>>
  update?: InputMaybe<MemberLeadsGovernorshipUpdateConnectionInput>
  where?: InputMaybe<MemberLeadsGovernorshipConnectionWhere>
}

export type MemberLeadsStreamAggregateInput = {
  AND?: InputMaybe<Array<MemberLeadsStreamAggregateInput>>
  NOT?: InputMaybe<MemberLeadsStreamAggregateInput>
  OR?: InputMaybe<Array<MemberLeadsStreamAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberLeadsStreamNodeAggregationWhereInput>
}

export type MemberLeadsStreamConnectFieldInput = {
  connect?: InputMaybe<Array<StreamConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<StreamConnectWhere>
}

export type MemberLeadsStreamConnection = {
  __typename?: 'MemberLeadsStreamConnection'
  edges: Array<MemberLeadsStreamRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberLeadsStreamConnectionSort = {
  node?: InputMaybe<StreamSort>
}

export type MemberLeadsStreamConnectionWhere = {
  AND?: InputMaybe<Array<MemberLeadsStreamConnectionWhere>>
  NOT?: InputMaybe<MemberLeadsStreamConnectionWhere>
  OR?: InputMaybe<Array<MemberLeadsStreamConnectionWhere>>
  node?: InputMaybe<StreamWhere>
}

export type MemberLeadsStreamCreateFieldInput = {
  node: StreamCreateInput
}

export type MemberLeadsStreamDeleteFieldInput = {
  delete?: InputMaybe<StreamDeleteInput>
  where?: InputMaybe<MemberLeadsStreamConnectionWhere>
}

export type MemberLeadsStreamDisconnectFieldInput = {
  disconnect?: InputMaybe<StreamDisconnectInput>
  where?: InputMaybe<MemberLeadsStreamConnectionWhere>
}

export type MemberLeadsStreamFieldInput = {
  connect?: InputMaybe<Array<MemberLeadsStreamConnectFieldInput>>
  create?: InputMaybe<Array<MemberLeadsStreamCreateFieldInput>>
}

export type MemberLeadsStreamNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberLeadsStreamNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberLeadsStreamNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberLeadsStreamNodeAggregationWhereInput>>
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

export type MemberLeadsStreamRelationship = {
  __typename?: 'MemberLeadsStreamRelationship'
  cursor: Scalars['String']['output']
  node: Stream
}

export type MemberLeadsStreamUpdateConnectionInput = {
  node?: InputMaybe<StreamUpdateInput>
}

export type MemberLeadsStreamUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberLeadsStreamConnectFieldInput>>
  create?: InputMaybe<Array<MemberLeadsStreamCreateFieldInput>>
  delete?: InputMaybe<Array<MemberLeadsStreamDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberLeadsStreamDisconnectFieldInput>>
  update?: InputMaybe<MemberLeadsStreamUpdateConnectionInput>
  where?: InputMaybe<MemberLeadsStreamConnectionWhere>
}

export type MemberMaritalStatusAggregateInput = {
  AND?: InputMaybe<Array<MemberMaritalStatusAggregateInput>>
  NOT?: InputMaybe<MemberMaritalStatusAggregateInput>
  OR?: InputMaybe<Array<MemberMaritalStatusAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberMaritalStatusNodeAggregationWhereInput>
}

export type MemberMaritalStatusConnectFieldInput = {
  connect?: InputMaybe<MaritalStatusConnectInput>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<MaritalStatusConnectWhere>
}

export type MemberMaritalStatusConnection = {
  __typename?: 'MemberMaritalStatusConnection'
  edges: Array<MemberMaritalStatusRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberMaritalStatusConnectionSort = {
  node?: InputMaybe<MaritalStatusSort>
}

export type MemberMaritalStatusConnectionWhere = {
  AND?: InputMaybe<Array<MemberMaritalStatusConnectionWhere>>
  NOT?: InputMaybe<MemberMaritalStatusConnectionWhere>
  OR?: InputMaybe<Array<MemberMaritalStatusConnectionWhere>>
  node?: InputMaybe<MaritalStatusWhere>
}

export type MemberMaritalStatusCreateFieldInput = {
  node: MaritalStatusCreateInput
}

export type MemberMaritalStatusDeleteFieldInput = {
  delete?: InputMaybe<MaritalStatusDeleteInput>
  where?: InputMaybe<MemberMaritalStatusConnectionWhere>
}

export type MemberMaritalStatusDisconnectFieldInput = {
  disconnect?: InputMaybe<MaritalStatusDisconnectInput>
  where?: InputMaybe<MemberMaritalStatusConnectionWhere>
}

export type MemberMaritalStatusFieldInput = {
  connect?: InputMaybe<MemberMaritalStatusConnectFieldInput>
  create?: InputMaybe<MemberMaritalStatusCreateFieldInput>
}

export type MemberMaritalStatusMaritalStatusAggregationSelection = {
  __typename?: 'MemberMaritalStatusMaritalStatusAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberMaritalStatusMaritalStatusNodeAggregateSelection>
}

export type MemberMaritalStatusMaritalStatusNodeAggregateSelection = {
  __typename?: 'MemberMaritalStatusMaritalStatusNodeAggregateSelection'
  status: StringAggregateSelectionNullable
}

export type MemberMaritalStatusNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberMaritalStatusNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberMaritalStatusNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberMaritalStatusNodeAggregationWhereInput>>
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
}

export type MemberMaritalStatusRelationship = {
  __typename?: 'MemberMaritalStatusRelationship'
  cursor: Scalars['String']['output']
  node: MaritalStatus
}

export type MemberMaritalStatusUpdateConnectionInput = {
  node?: InputMaybe<MaritalStatusUpdateInput>
}

export type MemberMaritalStatusUpdateFieldInput = {
  connect?: InputMaybe<MemberMaritalStatusConnectFieldInput>
  create?: InputMaybe<MemberMaritalStatusCreateFieldInput>
  delete?: InputMaybe<MemberMaritalStatusDeleteFieldInput>
  disconnect?: InputMaybe<MemberMaritalStatusDisconnectFieldInput>
  update?: InputMaybe<MemberMaritalStatusUpdateConnectionInput>
  where?: InputMaybe<MemberMaritalStatusConnectionWhere>
}

export type MemberOccupationAggregateInput = {
  AND?: InputMaybe<Array<MemberOccupationAggregateInput>>
  NOT?: InputMaybe<MemberOccupationAggregateInput>
  OR?: InputMaybe<Array<MemberOccupationAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberOccupationNodeAggregationWhereInput>
}

export type MemberOccupationConnectFieldInput = {
  connect?: InputMaybe<OccupationConnectInput>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<OccupationConnectWhere>
}

export type MemberOccupationConnection = {
  __typename?: 'MemberOccupationConnection'
  edges: Array<MemberOccupationRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberOccupationConnectionSort = {
  node?: InputMaybe<OccupationSort>
}

export type MemberOccupationConnectionWhere = {
  AND?: InputMaybe<Array<MemberOccupationConnectionWhere>>
  NOT?: InputMaybe<MemberOccupationConnectionWhere>
  OR?: InputMaybe<Array<MemberOccupationConnectionWhere>>
  node?: InputMaybe<OccupationWhere>
}

export type MemberOccupationCreateFieldInput = {
  node: OccupationCreateInput
}

export type MemberOccupationDeleteFieldInput = {
  delete?: InputMaybe<OccupationDeleteInput>
  where?: InputMaybe<MemberOccupationConnectionWhere>
}

export type MemberOccupationDisconnectFieldInput = {
  disconnect?: InputMaybe<OccupationDisconnectInput>
  where?: InputMaybe<MemberOccupationConnectionWhere>
}

export type MemberOccupationFieldInput = {
  connect?: InputMaybe<MemberOccupationConnectFieldInput>
  create?: InputMaybe<MemberOccupationCreateFieldInput>
}

export type MemberOccupationNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberOccupationNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberOccupationNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberOccupationNodeAggregationWhereInput>>
  occupation_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  occupation_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  occupation_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  occupation_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  occupation_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  occupation_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  occupation_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  occupation_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  occupation_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  occupation_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  occupation_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  occupation_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  occupation_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  occupation_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  occupation_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type MemberOccupationOccupationAggregationSelection = {
  __typename?: 'MemberOccupationOccupationAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberOccupationOccupationNodeAggregateSelection>
}

export type MemberOccupationOccupationNodeAggregateSelection = {
  __typename?: 'MemberOccupationOccupationNodeAggregateSelection'
  occupation: StringAggregateSelectionNullable
}

export type MemberOccupationRelationship = {
  __typename?: 'MemberOccupationRelationship'
  cursor: Scalars['String']['output']
  node: Occupation
}

export type MemberOccupationUpdateConnectionInput = {
  node?: InputMaybe<OccupationUpdateInput>
}

export type MemberOccupationUpdateFieldInput = {
  connect?: InputMaybe<MemberOccupationConnectFieldInput>
  create?: InputMaybe<MemberOccupationCreateFieldInput>
  delete?: InputMaybe<MemberOccupationDeleteFieldInput>
  disconnect?: InputMaybe<MemberOccupationDisconnectFieldInput>
  update?: InputMaybe<MemberOccupationUpdateConnectionInput>
  where?: InputMaybe<MemberOccupationConnectionWhere>
}

export type MemberOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more MemberSort objects to sort Members by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<MemberSort>>
}

export type MemberRelationInput = {
  adminCampus?: InputMaybe<Array<MemberAdminCampusCreateFieldInput>>
  adminCouncil?: InputMaybe<Array<MemberAdminCouncilCreateFieldInput>>
  adminGovernorship?: InputMaybe<Array<MemberAdminGovernorshipCreateFieldInput>>
  adminStream?: InputMaybe<Array<MemberAdminStreamCreateFieldInput>>
  bacenta?: InputMaybe<MemberBacentaCreateFieldInput>
  dob?: InputMaybe<MemberDobCreateFieldInput>
  gender?: InputMaybe<MemberGenderCreateFieldInput>
  leadsCampus?: InputMaybe<Array<MemberLeadsCampusCreateFieldInput>>
  leadsCouncil?: InputMaybe<Array<MemberLeadsCouncilCreateFieldInput>>
  leadsGovernorship?: InputMaybe<Array<MemberLeadsGovernorshipCreateFieldInput>>
  leadsStream?: InputMaybe<Array<MemberLeadsStreamCreateFieldInput>>
  maritalStatus?: InputMaybe<MemberMaritalStatusCreateFieldInput>
  occupation?: InputMaybe<MemberOccupationCreateFieldInput>
  title?: InputMaybe<Array<MemberTitleCreateFieldInput>>
}

/** Fields to sort Members by. The order in which sorts are applied is not guaranteed when specifying many fields in one MemberSort object. */
export type MemberSort = {
  auth_id?: InputMaybe<SortDirection>
  done?: InputMaybe<SortDirection>
  email?: InputMaybe<SortDirection>
  firstName?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
  lastName?: InputMaybe<SortDirection>
  middleName?: InputMaybe<SortDirection>
  phoneNumber?: InputMaybe<SortDirection>
  pictureUrl?: InputMaybe<SortDirection>
  whatsappNumber?: InputMaybe<SortDirection>
}

export type MemberStreamAdminStreamAggregationSelection = {
  __typename?: 'MemberStreamAdminStreamAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberStreamAdminStreamNodeAggregateSelection>
}

export type MemberStreamAdminStreamNodeAggregateSelection = {
  __typename?: 'MemberStreamAdminStreamNodeAggregateSelection'
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type MemberStreamLeadsStreamAggregationSelection = {
  __typename?: 'MemberStreamLeadsStreamAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberStreamLeadsStreamNodeAggregateSelection>
}

export type MemberStreamLeadsStreamNodeAggregateSelection = {
  __typename?: 'MemberStreamLeadsStreamNodeAggregateSelection'
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type MemberTimeGraphDobAggregationSelection = {
  __typename?: 'MemberTimeGraphDobAggregationSelection'
  count: Scalars['Int']['output']
}

export type MemberTitleAggregateInput = {
  AND?: InputMaybe<Array<MemberTitleAggregateInput>>
  NOT?: InputMaybe<MemberTitleAggregateInput>
  OR?: InputMaybe<Array<MemberTitleAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<MemberTitleNodeAggregationWhereInput>
}

export type MemberTitleConnectFieldInput = {
  connect?: InputMaybe<Array<TitleConnectInput>>
  edge?: InputMaybe<HasTitleCreateInput>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<TitleConnectWhere>
}

export type MemberTitleConnection = {
  __typename?: 'MemberTitleConnection'
  edges: Array<MemberTitleRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type MemberTitleConnectionSort = {
  edge?: InputMaybe<HasTitleSort>
  node?: InputMaybe<TitleSort>
}

export type MemberTitleConnectionWhere = {
  AND?: InputMaybe<Array<MemberTitleConnectionWhere>>
  NOT?: InputMaybe<MemberTitleConnectionWhere>
  OR?: InputMaybe<Array<MemberTitleConnectionWhere>>
  edge?: InputMaybe<HasTitleWhere>
  node?: InputMaybe<TitleWhere>
}

export type MemberTitleCreateFieldInput = {
  edge?: InputMaybe<HasTitleCreateInput>
  node: TitleCreateInput
}

export type MemberTitleDeleteFieldInput = {
  delete?: InputMaybe<TitleDeleteInput>
  where?: InputMaybe<MemberTitleConnectionWhere>
}

export type MemberTitleDisconnectFieldInput = {
  disconnect?: InputMaybe<TitleDisconnectInput>
  where?: InputMaybe<MemberTitleConnectionWhere>
}

export type MemberTitleFieldInput = {
  connect?: InputMaybe<Array<MemberTitleConnectFieldInput>>
  create?: InputMaybe<Array<MemberTitleCreateFieldInput>>
}

export type MemberTitleNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<MemberTitleNodeAggregationWhereInput>>
  NOT?: InputMaybe<MemberTitleNodeAggregationWhereInput>
  OR?: InputMaybe<Array<MemberTitleNodeAggregationWhereInput>>
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

export type MemberTitleRelationship = HasTitle & {
  __typename?: 'MemberTitleRelationship'
  cursor: Scalars['String']['output']
  date?: Maybe<Scalars['Date']['output']>
  node: Title
}

export type MemberTitleTitleAggregationSelection = {
  __typename?: 'MemberTitleTitleAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<MemberTitleTitleNodeAggregateSelection>
}

export type MemberTitleTitleNodeAggregateSelection = {
  __typename?: 'MemberTitleTitleNodeAggregateSelection'
  name: StringAggregateSelectionNonNullable
}

export type MemberTitleUpdateConnectionInput = {
  edge?: InputMaybe<HasTitleUpdateInput>
  node?: InputMaybe<TitleUpdateInput>
}

export type MemberTitleUpdateFieldInput = {
  connect?: InputMaybe<Array<MemberTitleConnectFieldInput>>
  create?: InputMaybe<Array<MemberTitleCreateFieldInput>>
  delete?: InputMaybe<Array<MemberTitleDeleteFieldInput>>
  disconnect?: InputMaybe<Array<MemberTitleDisconnectFieldInput>>
  update?: InputMaybe<MemberTitleUpdateConnectionInput>
  where?: InputMaybe<MemberTitleConnectionWhere>
}

export type MemberUpdateInput = {
  adminCampus?: InputMaybe<Array<MemberAdminCampusUpdateFieldInput>>
  adminCouncil?: InputMaybe<Array<MemberAdminCouncilUpdateFieldInput>>
  adminGovernorship?: InputMaybe<Array<MemberAdminGovernorshipUpdateFieldInput>>
  adminStream?: InputMaybe<Array<MemberAdminStreamUpdateFieldInput>>
  auth_id?: InputMaybe<Scalars['String']['input']>
  bacenta?: InputMaybe<MemberBacentaUpdateFieldInput>
  dob?: InputMaybe<MemberDobUpdateFieldInput>
  done?: InputMaybe<Scalars['Boolean']['input']>
  email?: InputMaybe<Scalars['String']['input']>
  firstName?: InputMaybe<Scalars['String']['input']>
  gender?: InputMaybe<MemberGenderUpdateFieldInput>
  id?: InputMaybe<Scalars['ID']['input']>
  lastName?: InputMaybe<Scalars['String']['input']>
  leadsCampus?: InputMaybe<Array<MemberLeadsCampusUpdateFieldInput>>
  leadsCouncil?: InputMaybe<Array<MemberLeadsCouncilUpdateFieldInput>>
  leadsGovernorship?: InputMaybe<Array<MemberLeadsGovernorshipUpdateFieldInput>>
  leadsStream?: InputMaybe<Array<MemberLeadsStreamUpdateFieldInput>>
  maritalStatus?: InputMaybe<MemberMaritalStatusUpdateFieldInput>
  middleName?: InputMaybe<Scalars['String']['input']>
  occupation?: InputMaybe<MemberOccupationUpdateFieldInput>
  phoneNumber?: InputMaybe<Scalars['String']['input']>
  pictureUrl?: InputMaybe<Scalars['String']['input']>
  title?: InputMaybe<Array<MemberTitleUpdateFieldInput>>
  whatsappNumber?: InputMaybe<Scalars['String']['input']>
}

export type MemberWhere = {
  AND?: InputMaybe<Array<MemberWhere>>
  NOT?: InputMaybe<MemberWhere>
  OR?: InputMaybe<Array<MemberWhere>>
  adminCampusAggregate?: InputMaybe<MemberAdminCampusAggregateInput>
  /** Return Members where all of the related MemberAdminCampusConnections match this filter */
  adminCampusConnection_ALL?: InputMaybe<MemberAdminCampusConnectionWhere>
  /** Return Members where none of the related MemberAdminCampusConnections match this filter */
  adminCampusConnection_NONE?: InputMaybe<MemberAdminCampusConnectionWhere>
  /** Return Members where one of the related MemberAdminCampusConnections match this filter */
  adminCampusConnection_SINGLE?: InputMaybe<MemberAdminCampusConnectionWhere>
  /** Return Members where some of the related MemberAdminCampusConnections match this filter */
  adminCampusConnection_SOME?: InputMaybe<MemberAdminCampusConnectionWhere>
  /** Return Members where all of the related Campuses match this filter */
  adminCampus_ALL?: InputMaybe<CampusWhere>
  /** Return Members where none of the related Campuses match this filter */
  adminCampus_NONE?: InputMaybe<CampusWhere>
  /** Return Members where one of the related Campuses match this filter */
  adminCampus_SINGLE?: InputMaybe<CampusWhere>
  /** Return Members where some of the related Campuses match this filter */
  adminCampus_SOME?: InputMaybe<CampusWhere>
  adminCouncilAggregate?: InputMaybe<MemberAdminCouncilAggregateInput>
  /** Return Members where all of the related MemberAdminCouncilConnections match this filter */
  adminCouncilConnection_ALL?: InputMaybe<MemberAdminCouncilConnectionWhere>
  /** Return Members where none of the related MemberAdminCouncilConnections match this filter */
  adminCouncilConnection_NONE?: InputMaybe<MemberAdminCouncilConnectionWhere>
  /** Return Members where one of the related MemberAdminCouncilConnections match this filter */
  adminCouncilConnection_SINGLE?: InputMaybe<MemberAdminCouncilConnectionWhere>
  /** Return Members where some of the related MemberAdminCouncilConnections match this filter */
  adminCouncilConnection_SOME?: InputMaybe<MemberAdminCouncilConnectionWhere>
  /** Return Members where all of the related Councils match this filter */
  adminCouncil_ALL?: InputMaybe<CouncilWhere>
  /** Return Members where none of the related Councils match this filter */
  adminCouncil_NONE?: InputMaybe<CouncilWhere>
  /** Return Members where one of the related Councils match this filter */
  adminCouncil_SINGLE?: InputMaybe<CouncilWhere>
  /** Return Members where some of the related Councils match this filter */
  adminCouncil_SOME?: InputMaybe<CouncilWhere>
  adminGovernorshipAggregate?: InputMaybe<MemberAdminGovernorshipAggregateInput>
  /** Return Members where all of the related MemberAdminGovernorshipConnections match this filter */
  adminGovernorshipConnection_ALL?: InputMaybe<MemberAdminGovernorshipConnectionWhere>
  /** Return Members where none of the related MemberAdminGovernorshipConnections match this filter */
  adminGovernorshipConnection_NONE?: InputMaybe<MemberAdminGovernorshipConnectionWhere>
  /** Return Members where one of the related MemberAdminGovernorshipConnections match this filter */
  adminGovernorshipConnection_SINGLE?: InputMaybe<MemberAdminGovernorshipConnectionWhere>
  /** Return Members where some of the related MemberAdminGovernorshipConnections match this filter */
  adminGovernorshipConnection_SOME?: InputMaybe<MemberAdminGovernorshipConnectionWhere>
  /** Return Members where all of the related Governorships match this filter */
  adminGovernorship_ALL?: InputMaybe<GovernorshipWhere>
  /** Return Members where none of the related Governorships match this filter */
  adminGovernorship_NONE?: InputMaybe<GovernorshipWhere>
  /** Return Members where one of the related Governorships match this filter */
  adminGovernorship_SINGLE?: InputMaybe<GovernorshipWhere>
  /** Return Members where some of the related Governorships match this filter */
  adminGovernorship_SOME?: InputMaybe<GovernorshipWhere>
  adminStreamAggregate?: InputMaybe<MemberAdminStreamAggregateInput>
  /** Return Members where all of the related MemberAdminStreamConnections match this filter */
  adminStreamConnection_ALL?: InputMaybe<MemberAdminStreamConnectionWhere>
  /** Return Members where none of the related MemberAdminStreamConnections match this filter */
  adminStreamConnection_NONE?: InputMaybe<MemberAdminStreamConnectionWhere>
  /** Return Members where one of the related MemberAdminStreamConnections match this filter */
  adminStreamConnection_SINGLE?: InputMaybe<MemberAdminStreamConnectionWhere>
  /** Return Members where some of the related MemberAdminStreamConnections match this filter */
  adminStreamConnection_SOME?: InputMaybe<MemberAdminStreamConnectionWhere>
  /** Return Members where all of the related Streams match this filter */
  adminStream_ALL?: InputMaybe<StreamWhere>
  /** Return Members where none of the related Streams match this filter */
  adminStream_NONE?: InputMaybe<StreamWhere>
  /** Return Members where one of the related Streams match this filter */
  adminStream_SINGLE?: InputMaybe<StreamWhere>
  /** Return Members where some of the related Streams match this filter */
  adminStream_SOME?: InputMaybe<StreamWhere>
  auth_id?: InputMaybe<Scalars['String']['input']>
  auth_id_CONTAINS?: InputMaybe<Scalars['String']['input']>
  auth_id_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  auth_id_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  auth_id_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  bacenta?: InputMaybe<BacentaWhere>
  bacentaAggregate?: InputMaybe<MemberBacentaAggregateInput>
  bacentaConnection?: InputMaybe<MemberBacentaConnectionWhere>
  bacentaConnection_NOT?: InputMaybe<MemberBacentaConnectionWhere>
  bacenta_NOT?: InputMaybe<BacentaWhere>
  dob?: InputMaybe<TimeGraphWhere>
  dobAggregate?: InputMaybe<MemberDobAggregateInput>
  dobConnection?: InputMaybe<MemberDobConnectionWhere>
  dobConnection_NOT?: InputMaybe<MemberDobConnectionWhere>
  dob_NOT?: InputMaybe<TimeGraphWhere>
  done?: InputMaybe<Scalars['Boolean']['input']>
  email?: InputMaybe<Scalars['String']['input']>
  email_CONTAINS?: InputMaybe<Scalars['String']['input']>
  email_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  email_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  email_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  firstName?: InputMaybe<Scalars['String']['input']>
  firstName_CONTAINS?: InputMaybe<Scalars['String']['input']>
  firstName_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  firstName_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  firstName_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  gender?: InputMaybe<GenderWhere>
  genderAggregate?: InputMaybe<MemberGenderAggregateInput>
  genderConnection?: InputMaybe<MemberGenderConnectionWhere>
  genderConnection_NOT?: InputMaybe<MemberGenderConnectionWhere>
  gender_NOT?: InputMaybe<GenderWhere>
  id?: InputMaybe<Scalars['ID']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  lastName?: InputMaybe<Scalars['String']['input']>
  lastName_CONTAINS?: InputMaybe<Scalars['String']['input']>
  lastName_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  lastName_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  lastName_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  leadsCampusAggregate?: InputMaybe<MemberLeadsCampusAggregateInput>
  /** Return Members where all of the related MemberLeadsCampusConnections match this filter */
  leadsCampusConnection_ALL?: InputMaybe<MemberLeadsCampusConnectionWhere>
  /** Return Members where none of the related MemberLeadsCampusConnections match this filter */
  leadsCampusConnection_NONE?: InputMaybe<MemberLeadsCampusConnectionWhere>
  /** Return Members where one of the related MemberLeadsCampusConnections match this filter */
  leadsCampusConnection_SINGLE?: InputMaybe<MemberLeadsCampusConnectionWhere>
  /** Return Members where some of the related MemberLeadsCampusConnections match this filter */
  leadsCampusConnection_SOME?: InputMaybe<MemberLeadsCampusConnectionWhere>
  /** Return Members where all of the related Campuses match this filter */
  leadsCampus_ALL?: InputMaybe<CampusWhere>
  /** Return Members where none of the related Campuses match this filter */
  leadsCampus_NONE?: InputMaybe<CampusWhere>
  /** Return Members where one of the related Campuses match this filter */
  leadsCampus_SINGLE?: InputMaybe<CampusWhere>
  /** Return Members where some of the related Campuses match this filter */
  leadsCampus_SOME?: InputMaybe<CampusWhere>
  leadsCouncilAggregate?: InputMaybe<MemberLeadsCouncilAggregateInput>
  /** Return Members where all of the related MemberLeadsCouncilConnections match this filter */
  leadsCouncilConnection_ALL?: InputMaybe<MemberLeadsCouncilConnectionWhere>
  /** Return Members where none of the related MemberLeadsCouncilConnections match this filter */
  leadsCouncilConnection_NONE?: InputMaybe<MemberLeadsCouncilConnectionWhere>
  /** Return Members where one of the related MemberLeadsCouncilConnections match this filter */
  leadsCouncilConnection_SINGLE?: InputMaybe<MemberLeadsCouncilConnectionWhere>
  /** Return Members where some of the related MemberLeadsCouncilConnections match this filter */
  leadsCouncilConnection_SOME?: InputMaybe<MemberLeadsCouncilConnectionWhere>
  /** Return Members where all of the related Councils match this filter */
  leadsCouncil_ALL?: InputMaybe<CouncilWhere>
  /** Return Members where none of the related Councils match this filter */
  leadsCouncil_NONE?: InputMaybe<CouncilWhere>
  /** Return Members where one of the related Councils match this filter */
  leadsCouncil_SINGLE?: InputMaybe<CouncilWhere>
  /** Return Members where some of the related Councils match this filter */
  leadsCouncil_SOME?: InputMaybe<CouncilWhere>
  leadsGovernorshipAggregate?: InputMaybe<MemberLeadsGovernorshipAggregateInput>
  /** Return Members where all of the related MemberLeadsGovernorshipConnections match this filter */
  leadsGovernorshipConnection_ALL?: InputMaybe<MemberLeadsGovernorshipConnectionWhere>
  /** Return Members where none of the related MemberLeadsGovernorshipConnections match this filter */
  leadsGovernorshipConnection_NONE?: InputMaybe<MemberLeadsGovernorshipConnectionWhere>
  /** Return Members where one of the related MemberLeadsGovernorshipConnections match this filter */
  leadsGovernorshipConnection_SINGLE?: InputMaybe<MemberLeadsGovernorshipConnectionWhere>
  /** Return Members where some of the related MemberLeadsGovernorshipConnections match this filter */
  leadsGovernorshipConnection_SOME?: InputMaybe<MemberLeadsGovernorshipConnectionWhere>
  /** Return Members where all of the related Governorships match this filter */
  leadsGovernorship_ALL?: InputMaybe<GovernorshipWhere>
  /** Return Members where none of the related Governorships match this filter */
  leadsGovernorship_NONE?: InputMaybe<GovernorshipWhere>
  /** Return Members where one of the related Governorships match this filter */
  leadsGovernorship_SINGLE?: InputMaybe<GovernorshipWhere>
  /** Return Members where some of the related Governorships match this filter */
  leadsGovernorship_SOME?: InputMaybe<GovernorshipWhere>
  leadsStreamAggregate?: InputMaybe<MemberLeadsStreamAggregateInput>
  /** Return Members where all of the related MemberLeadsStreamConnections match this filter */
  leadsStreamConnection_ALL?: InputMaybe<MemberLeadsStreamConnectionWhere>
  /** Return Members where none of the related MemberLeadsStreamConnections match this filter */
  leadsStreamConnection_NONE?: InputMaybe<MemberLeadsStreamConnectionWhere>
  /** Return Members where one of the related MemberLeadsStreamConnections match this filter */
  leadsStreamConnection_SINGLE?: InputMaybe<MemberLeadsStreamConnectionWhere>
  /** Return Members where some of the related MemberLeadsStreamConnections match this filter */
  leadsStreamConnection_SOME?: InputMaybe<MemberLeadsStreamConnectionWhere>
  /** Return Members where all of the related Streams match this filter */
  leadsStream_ALL?: InputMaybe<StreamWhere>
  /** Return Members where none of the related Streams match this filter */
  leadsStream_NONE?: InputMaybe<StreamWhere>
  /** Return Members where one of the related Streams match this filter */
  leadsStream_SINGLE?: InputMaybe<StreamWhere>
  /** Return Members where some of the related Streams match this filter */
  leadsStream_SOME?: InputMaybe<StreamWhere>
  maritalStatus?: InputMaybe<MaritalStatusWhere>
  maritalStatusAggregate?: InputMaybe<MemberMaritalStatusAggregateInput>
  maritalStatusConnection?: InputMaybe<MemberMaritalStatusConnectionWhere>
  maritalStatusConnection_NOT?: InputMaybe<MemberMaritalStatusConnectionWhere>
  maritalStatus_NOT?: InputMaybe<MaritalStatusWhere>
  middleName?: InputMaybe<Scalars['String']['input']>
  middleName_CONTAINS?: InputMaybe<Scalars['String']['input']>
  middleName_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  middleName_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  middleName_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  occupation?: InputMaybe<OccupationWhere>
  occupationAggregate?: InputMaybe<MemberOccupationAggregateInput>
  occupationConnection?: InputMaybe<MemberOccupationConnectionWhere>
  occupationConnection_NOT?: InputMaybe<MemberOccupationConnectionWhere>
  occupation_NOT?: InputMaybe<OccupationWhere>
  phoneNumber?: InputMaybe<Scalars['String']['input']>
  phoneNumber_CONTAINS?: InputMaybe<Scalars['String']['input']>
  phoneNumber_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  phoneNumber_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  phoneNumber_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  pictureUrl?: InputMaybe<Scalars['String']['input']>
  pictureUrl_CONTAINS?: InputMaybe<Scalars['String']['input']>
  pictureUrl_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  pictureUrl_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  pictureUrl_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
  titleAggregate?: InputMaybe<MemberTitleAggregateInput>
  /** Return Members where all of the related MemberTitleConnections match this filter */
  titleConnection_ALL?: InputMaybe<MemberTitleConnectionWhere>
  /** Return Members where none of the related MemberTitleConnections match this filter */
  titleConnection_NONE?: InputMaybe<MemberTitleConnectionWhere>
  /** Return Members where one of the related MemberTitleConnections match this filter */
  titleConnection_SINGLE?: InputMaybe<MemberTitleConnectionWhere>
  /** Return Members where some of the related MemberTitleConnections match this filter */
  titleConnection_SOME?: InputMaybe<MemberTitleConnectionWhere>
  /** Return Members where all of the related Titles match this filter */
  title_ALL?: InputMaybe<TitleWhere>
  /** Return Members where none of the related Titles match this filter */
  title_NONE?: InputMaybe<TitleWhere>
  /** Return Members where one of the related Titles match this filter */
  title_SINGLE?: InputMaybe<TitleWhere>
  /** Return Members where some of the related Titles match this filter */
  title_SOME?: InputMaybe<TitleWhere>
  whatsappNumber?: InputMaybe<Scalars['String']['input']>
  whatsappNumber_CONTAINS?: InputMaybe<Scalars['String']['input']>
  whatsappNumber_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  whatsappNumber_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  whatsappNumber_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type MembersConnection = {
  __typename?: 'MembersConnection'
  edges: Array<MemberEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Mutation = {
  __typename?: 'Mutation'
  addMembersToJob: Job
  createBacentas: CreateBacentasMutationResponse
  createCampuses: CreateCampusesMutationResponse
  createCouncils: CreateCouncilsMutationResponse
  createGenders: CreateGendersMutationResponse
  createGovernorships: CreateGovernorshipsMutationResponse
  createJob: Job
  createJobForGovernors: Scalars['Boolean']['output']
  createJobs: CreateJobsMutationResponse
  createMaritalStatuses: CreateMaritalStatusesMutationResponse
  createMembers: CreateMembersMutationResponse
  createOccupations: CreateOccupationsMutationResponse
  createStreams: CreateStreamsMutationResponse
  createTimeGraphs: CreateTimeGraphsMutationResponse
  createTitles: CreateTitlesMutationResponse
  deleteBacentas: DeleteInfo
  deleteCampuses: DeleteInfo
  deleteCouncils: DeleteInfo
  deleteGenders: DeleteInfo
  deleteGovernorships: DeleteInfo
  deleteJobs: DeleteInfo
  deleteMaritalStatuses: DeleteInfo
  deleteMembers: DeleteInfo
  deleteOccupations: DeleteInfo
  deleteStreams: DeleteInfo
  deleteTimeGraphs: DeleteInfo
  deleteTitles: DeleteInfo
  markMemberAsDone: Member
  updateBacentas: UpdateBacentasMutationResponse
  updateCampuses: UpdateCampusesMutationResponse
  updateCouncils: UpdateCouncilsMutationResponse
  updateGenders: UpdateGendersMutationResponse
  updateGovernorships: UpdateGovernorshipsMutationResponse
  updateJobs: UpdateJobsMutationResponse
  updateMaritalStatuses: UpdateMaritalStatusesMutationResponse
  updateMembers: UpdateMembersMutationResponse
  updateOccupations: UpdateOccupationsMutationResponse
  updateStreams: UpdateStreamsMutationResponse
  updateTimeGraphs: UpdateTimeGraphsMutationResponse
  updateTitles: UpdateTitlesMutationResponse
}

export type MutationAddMembersToJobArgs = {
  jobId: Scalars['ID']['input']
  members: Array<MemberInput>
}

export type MutationCreateBacentasArgs = {
  input: Array<BacentaCreateInput>
}

export type MutationCreateCampusesArgs = {
  input: Array<CampusCreateInput>
}

export type MutationCreateCouncilsArgs = {
  input: Array<CouncilCreateInput>
}

export type MutationCreateGendersArgs = {
  input: Array<GenderCreateInput>
}

export type MutationCreateGovernorshipsArgs = {
  input: Array<GovernorshipCreateInput>
}

export type MutationCreateJobArgs = {
  churchId: Scalars['ID']['input']
  churchLevel: Scalars['String']['input']
  createdBy: MemberInput
  description: Scalars['String']['input']
  dueDate: Scalars['String']['input']
  title: Scalars['String']['input']
}

export type MutationCreateJobForGovernorsArgs = {
  churchId: Scalars['ID']['input']
  churchLevel: Scalars['String']['input']
  createdBy: MemberInput
  description: Scalars['String']['input']
  dueDate: Scalars['String']['input']
  title: Scalars['String']['input']
}

export type MutationCreateJobsArgs = {
  input: Array<JobCreateInput>
}

export type MutationCreateMaritalStatusesArgs = {
  input: Array<MaritalStatusCreateInput>
}

export type MutationCreateMembersArgs = {
  input: Array<MemberCreateInput>
}

export type MutationCreateOccupationsArgs = {
  input: Array<OccupationCreateInput>
}

export type MutationCreateStreamsArgs = {
  input: Array<StreamCreateInput>
}

export type MutationCreateTimeGraphsArgs = {
  input: Array<TimeGraphCreateInput>
}

export type MutationCreateTitlesArgs = {
  input: Array<TitleCreateInput>
}

export type MutationDeleteBacentasArgs = {
  delete?: InputMaybe<BacentaDeleteInput>
  where?: InputMaybe<BacentaWhere>
}

export type MutationDeleteCampusesArgs = {
  delete?: InputMaybe<CampusDeleteInput>
  where?: InputMaybe<CampusWhere>
}

export type MutationDeleteCouncilsArgs = {
  delete?: InputMaybe<CouncilDeleteInput>
  where?: InputMaybe<CouncilWhere>
}

export type MutationDeleteGendersArgs = {
  delete?: InputMaybe<GenderDeleteInput>
  where?: InputMaybe<GenderWhere>
}

export type MutationDeleteGovernorshipsArgs = {
  delete?: InputMaybe<GovernorshipDeleteInput>
  where?: InputMaybe<GovernorshipWhere>
}

export type MutationDeleteJobsArgs = {
  where?: InputMaybe<JobWhere>
}

export type MutationDeleteMaritalStatusesArgs = {
  delete?: InputMaybe<MaritalStatusDeleteInput>
  where?: InputMaybe<MaritalStatusWhere>
}

export type MutationDeleteMembersArgs = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<MemberWhere>
}

export type MutationDeleteOccupationsArgs = {
  delete?: InputMaybe<OccupationDeleteInput>
  where?: InputMaybe<OccupationWhere>
}

export type MutationDeleteStreamsArgs = {
  delete?: InputMaybe<StreamDeleteInput>
  where?: InputMaybe<StreamWhere>
}

export type MutationDeleteTimeGraphsArgs = {
  where?: InputMaybe<TimeGraphWhere>
}

export type MutationDeleteTitlesArgs = {
  delete?: InputMaybe<TitleDeleteInput>
  where?: InputMaybe<TitleWhere>
}

export type MutationMarkMemberAsDoneArgs = {
  jobId: Scalars['ID']['input']
  memberId: Scalars['ID']['input']
}

export type MutationUpdateBacentasArgs = {
  connect?: InputMaybe<BacentaConnectInput>
  create?: InputMaybe<BacentaRelationInput>
  delete?: InputMaybe<BacentaDeleteInput>
  disconnect?: InputMaybe<BacentaDisconnectInput>
  update?: InputMaybe<BacentaUpdateInput>
  where?: InputMaybe<BacentaWhere>
}

export type MutationUpdateCampusesArgs = {
  connect?: InputMaybe<CampusConnectInput>
  create?: InputMaybe<CampusRelationInput>
  delete?: InputMaybe<CampusDeleteInput>
  disconnect?: InputMaybe<CampusDisconnectInput>
  update?: InputMaybe<CampusUpdateInput>
  where?: InputMaybe<CampusWhere>
}

export type MutationUpdateCouncilsArgs = {
  connect?: InputMaybe<CouncilConnectInput>
  create?: InputMaybe<CouncilRelationInput>
  delete?: InputMaybe<CouncilDeleteInput>
  disconnect?: InputMaybe<CouncilDisconnectInput>
  update?: InputMaybe<CouncilUpdateInput>
  where?: InputMaybe<CouncilWhere>
}

export type MutationUpdateGendersArgs = {
  connect?: InputMaybe<GenderConnectInput>
  create?: InputMaybe<GenderRelationInput>
  delete?: InputMaybe<GenderDeleteInput>
  disconnect?: InputMaybe<GenderDisconnectInput>
  update?: InputMaybe<GenderUpdateInput>
  where?: InputMaybe<GenderWhere>
}

export type MutationUpdateGovernorshipsArgs = {
  connect?: InputMaybe<GovernorshipConnectInput>
  create?: InputMaybe<GovernorshipRelationInput>
  delete?: InputMaybe<GovernorshipDeleteInput>
  disconnect?: InputMaybe<GovernorshipDisconnectInput>
  update?: InputMaybe<GovernorshipUpdateInput>
  where?: InputMaybe<GovernorshipWhere>
}

export type MutationUpdateJobsArgs = {
  update?: InputMaybe<JobUpdateInput>
  where?: InputMaybe<JobWhere>
}

export type MutationUpdateMaritalStatusesArgs = {
  connect?: InputMaybe<MaritalStatusConnectInput>
  create?: InputMaybe<MaritalStatusRelationInput>
  delete?: InputMaybe<MaritalStatusDeleteInput>
  disconnect?: InputMaybe<MaritalStatusDisconnectInput>
  update?: InputMaybe<MaritalStatusUpdateInput>
  where?: InputMaybe<MaritalStatusWhere>
}

export type MutationUpdateMembersArgs = {
  connect?: InputMaybe<MemberConnectInput>
  create?: InputMaybe<MemberRelationInput>
  delete?: InputMaybe<MemberDeleteInput>
  disconnect?: InputMaybe<MemberDisconnectInput>
  update?: InputMaybe<MemberUpdateInput>
  where?: InputMaybe<MemberWhere>
}

export type MutationUpdateOccupationsArgs = {
  connect?: InputMaybe<OccupationConnectInput>
  create?: InputMaybe<OccupationRelationInput>
  delete?: InputMaybe<OccupationDeleteInput>
  disconnect?: InputMaybe<OccupationDisconnectInput>
  update?: InputMaybe<OccupationUpdateInput>
  where?: InputMaybe<OccupationWhere>
}

export type MutationUpdateStreamsArgs = {
  connect?: InputMaybe<StreamConnectInput>
  create?: InputMaybe<StreamRelationInput>
  delete?: InputMaybe<StreamDeleteInput>
  disconnect?: InputMaybe<StreamDisconnectInput>
  update?: InputMaybe<StreamUpdateInput>
  where?: InputMaybe<StreamWhere>
}

export type MutationUpdateTimeGraphsArgs = {
  update?: InputMaybe<TimeGraphUpdateInput>
  where?: InputMaybe<TimeGraphWhere>
}

export type MutationUpdateTitlesArgs = {
  connect?: InputMaybe<TitleConnectInput>
  create?: InputMaybe<TitleRelationInput>
  delete?: InputMaybe<TitleDeleteInput>
  disconnect?: InputMaybe<TitleDisconnectInput>
  update?: InputMaybe<TitleUpdateInput>
  where?: InputMaybe<TitleWhere>
}

export type Occupation = {
  __typename?: 'Occupation'
  members: Array<Member>
  membersAggregate?: Maybe<OccupationMemberMembersAggregationSelection>
  membersConnection: OccupationMembersConnection
  occupation?: Maybe<Scalars['String']['output']>
}

export type OccupationMembersArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<MemberOptions>
  where?: InputMaybe<MemberWhere>
}

export type OccupationMembersAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<MemberWhere>
}

export type OccupationMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<OccupationMembersConnectionSort>>
  where?: InputMaybe<OccupationMembersConnectionWhere>
}

export type OccupationAggregateSelection = {
  __typename?: 'OccupationAggregateSelection'
  count: Scalars['Int']['output']
  occupation: StringAggregateSelectionNullable
}

export type OccupationConnectInput = {
  members?: InputMaybe<Array<OccupationMembersConnectFieldInput>>
}

export type OccupationConnectWhere = {
  node: OccupationWhere
}

export type OccupationCreateInput = {
  members?: InputMaybe<OccupationMembersFieldInput>
  occupation?: InputMaybe<Scalars['String']['input']>
}

export type OccupationDeleteInput = {
  members?: InputMaybe<Array<OccupationMembersDeleteFieldInput>>
}

export type OccupationDisconnectInput = {
  members?: InputMaybe<Array<OccupationMembersDisconnectFieldInput>>
}

export type OccupationEdge = {
  __typename?: 'OccupationEdge'
  cursor: Scalars['String']['output']
  node: Occupation
}

export type OccupationMemberMembersAggregationSelection = {
  __typename?: 'OccupationMemberMembersAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<OccupationMemberMembersNodeAggregateSelection>
}

export type OccupationMemberMembersNodeAggregateSelection = {
  __typename?: 'OccupationMemberMembersNodeAggregateSelection'
  auth_id: StringAggregateSelectionNullable
  email: StringAggregateSelectionNullable
  firstName: StringAggregateSelectionNullable
  id: IdAggregateSelectionNonNullable
  lastName: StringAggregateSelectionNullable
  middleName: StringAggregateSelectionNullable
  phoneNumber: StringAggregateSelectionNullable
  pictureUrl: StringAggregateSelectionNullable
  whatsappNumber: StringAggregateSelectionNullable
}

export type OccupationMembersAggregateInput = {
  AND?: InputMaybe<Array<OccupationMembersAggregateInput>>
  NOT?: InputMaybe<OccupationMembersAggregateInput>
  OR?: InputMaybe<Array<OccupationMembersAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<OccupationMembersNodeAggregationWhereInput>
}

export type OccupationMembersConnectFieldInput = {
  connect?: InputMaybe<Array<MemberConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<MemberConnectWhere>
}

export type OccupationMembersConnection = {
  __typename?: 'OccupationMembersConnection'
  edges: Array<OccupationMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type OccupationMembersConnectionSort = {
  node?: InputMaybe<MemberSort>
}

export type OccupationMembersConnectionWhere = {
  AND?: InputMaybe<Array<OccupationMembersConnectionWhere>>
  NOT?: InputMaybe<OccupationMembersConnectionWhere>
  OR?: InputMaybe<Array<OccupationMembersConnectionWhere>>
  node?: InputMaybe<MemberWhere>
}

export type OccupationMembersCreateFieldInput = {
  node: MemberCreateInput
}

export type OccupationMembersDeleteFieldInput = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<OccupationMembersConnectionWhere>
}

export type OccupationMembersDisconnectFieldInput = {
  disconnect?: InputMaybe<MemberDisconnectInput>
  where?: InputMaybe<OccupationMembersConnectionWhere>
}

export type OccupationMembersFieldInput = {
  connect?: InputMaybe<Array<OccupationMembersConnectFieldInput>>
  create?: InputMaybe<Array<OccupationMembersCreateFieldInput>>
}

export type OccupationMembersNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<OccupationMembersNodeAggregationWhereInput>>
  NOT?: InputMaybe<OccupationMembersNodeAggregationWhereInput>
  OR?: InputMaybe<Array<OccupationMembersNodeAggregationWhereInput>>
  auth_id_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  middleName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  middleName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type OccupationMembersRelationship = {
  __typename?: 'OccupationMembersRelationship'
  cursor: Scalars['String']['output']
  node: Member
}

export type OccupationMembersUpdateConnectionInput = {
  node?: InputMaybe<MemberUpdateInput>
}

export type OccupationMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<OccupationMembersConnectFieldInput>>
  create?: InputMaybe<Array<OccupationMembersCreateFieldInput>>
  delete?: InputMaybe<Array<OccupationMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<OccupationMembersDisconnectFieldInput>>
  update?: InputMaybe<OccupationMembersUpdateConnectionInput>
  where?: InputMaybe<OccupationMembersConnectionWhere>
}

export type OccupationOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more OccupationSort objects to sort Occupations by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<OccupationSort>>
}

export type OccupationRelationInput = {
  members?: InputMaybe<Array<OccupationMembersCreateFieldInput>>
}

/** Fields to sort Occupations by. The order in which sorts are applied is not guaranteed when specifying many fields in one OccupationSort object. */
export type OccupationSort = {
  occupation?: InputMaybe<SortDirection>
}

export type OccupationUpdateInput = {
  members?: InputMaybe<Array<OccupationMembersUpdateFieldInput>>
  occupation?: InputMaybe<Scalars['String']['input']>
}

export type OccupationWhere = {
  AND?: InputMaybe<Array<OccupationWhere>>
  NOT?: InputMaybe<OccupationWhere>
  OR?: InputMaybe<Array<OccupationWhere>>
  membersAggregate?: InputMaybe<OccupationMembersAggregateInput>
  /** Return Occupations where all of the related OccupationMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<OccupationMembersConnectionWhere>
  /** Return Occupations where none of the related OccupationMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<OccupationMembersConnectionWhere>
  /** Return Occupations where one of the related OccupationMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<OccupationMembersConnectionWhere>
  /** Return Occupations where some of the related OccupationMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<OccupationMembersConnectionWhere>
  /** Return Occupations where all of the related Members match this filter */
  members_ALL?: InputMaybe<MemberWhere>
  /** Return Occupations where none of the related Members match this filter */
  members_NONE?: InputMaybe<MemberWhere>
  /** Return Occupations where one of the related Members match this filter */
  members_SINGLE?: InputMaybe<MemberWhere>
  /** Return Occupations where some of the related Members match this filter */
  members_SOME?: InputMaybe<MemberWhere>
  occupation?: InputMaybe<Scalars['String']['input']>
  occupation_CONTAINS?: InputMaybe<Scalars['String']['input']>
  occupation_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  occupation_IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>
  occupation_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type OccupationsConnection = {
  __typename?: 'OccupationsConnection'
  edges: Array<OccupationEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

/** Pagination information (Relay) */
export type PageInfo = {
  __typename?: 'PageInfo'
  endCursor?: Maybe<Scalars['String']['output']>
  hasNextPage: Scalars['Boolean']['output']
  hasPreviousPage: Scalars['Boolean']['output']
  startCursor?: Maybe<Scalars['String']['output']>
}

export type Query = {
  __typename?: 'Query'
  bacentas: Array<Bacenta>
  bacentasAggregate: BacentaAggregateSelection
  bacentasConnection: BacentasConnection
  campuses: Array<Campus>
  campusesAggregate: CampusAggregateSelection
  campusesConnection: CampusesConnection
  councils: Array<Council>
  councilsAggregate: CouncilAggregateSelection
  councilsConnection: CouncilsConnection
  genders: Array<Gender>
  gendersAggregate: GenderAggregateSelection
  gendersConnection: GendersConnection
  governorships: Array<Governorship>
  governorshipsAggregate: GovernorshipAggregateSelection
  governorshipsConnection: GovernorshipsConnection
  jobs: Array<Job>
  jobsAggregate: JobAggregateSelection
  jobsConnection: JobsConnection
  maritalStatuses: Array<MaritalStatus>
  maritalStatusesAggregate: MaritalStatusAggregateSelection
  maritalStatusesConnection: MaritalStatusesConnection
  members: Array<Member>
  membersAggregate: MemberAggregateSelection
  membersConnection: MembersConnection
  occupations: Array<Occupation>
  occupationsAggregate: OccupationAggregateSelection
  occupationsConnection: OccupationsConnection
  streams: Array<Stream>
  streamsAggregate: StreamAggregateSelection
  streamsConnection: StreamsConnection
  timeGraphs: Array<TimeGraph>
  timeGraphsAggregate: TimeGraphAggregateSelection
  timeGraphsConnection: TimeGraphsConnection
  titles: Array<Title>
  titlesAggregate: TitleAggregateSelection
  titlesConnection: TitlesConnection
}

export type QueryBacentasArgs = {
  options?: InputMaybe<BacentaOptions>
  where?: InputMaybe<BacentaWhere>
}

export type QueryBacentasAggregateArgs = {
  where?: InputMaybe<BacentaWhere>
}

export type QueryBacentasConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<BacentaSort>>>
  where?: InputMaybe<BacentaWhere>
}

export type QueryCampusesArgs = {
  options?: InputMaybe<CampusOptions>
  where?: InputMaybe<CampusWhere>
}

export type QueryCampusesAggregateArgs = {
  where?: InputMaybe<CampusWhere>
}

export type QueryCampusesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<CampusSort>>>
  where?: InputMaybe<CampusWhere>
}

export type QueryCouncilsArgs = {
  options?: InputMaybe<CouncilOptions>
  where?: InputMaybe<CouncilWhere>
}

export type QueryCouncilsAggregateArgs = {
  where?: InputMaybe<CouncilWhere>
}

export type QueryCouncilsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<CouncilSort>>>
  where?: InputMaybe<CouncilWhere>
}

export type QueryGendersArgs = {
  options?: InputMaybe<GenderOptions>
  where?: InputMaybe<GenderWhere>
}

export type QueryGendersAggregateArgs = {
  where?: InputMaybe<GenderWhere>
}

export type QueryGendersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<GenderSort>>>
  where?: InputMaybe<GenderWhere>
}

export type QueryGovernorshipsArgs = {
  options?: InputMaybe<GovernorshipOptions>
  where?: InputMaybe<GovernorshipWhere>
}

export type QueryGovernorshipsAggregateArgs = {
  where?: InputMaybe<GovernorshipWhere>
}

export type QueryGovernorshipsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<GovernorshipSort>>>
  where?: InputMaybe<GovernorshipWhere>
}

export type QueryJobsArgs = {
  options?: InputMaybe<JobOptions>
  where?: InputMaybe<JobWhere>
}

export type QueryJobsAggregateArgs = {
  where?: InputMaybe<JobWhere>
}

export type QueryJobsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<JobSort>>>
  where?: InputMaybe<JobWhere>
}

export type QueryMaritalStatusesArgs = {
  options?: InputMaybe<MaritalStatusOptions>
  where?: InputMaybe<MaritalStatusWhere>
}

export type QueryMaritalStatusesAggregateArgs = {
  where?: InputMaybe<MaritalStatusWhere>
}

export type QueryMaritalStatusesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<MaritalStatusSort>>>
  where?: InputMaybe<MaritalStatusWhere>
}

export type QueryMembersArgs = {
  options?: InputMaybe<MemberOptions>
  where?: InputMaybe<MemberWhere>
}

export type QueryMembersAggregateArgs = {
  where?: InputMaybe<MemberWhere>
}

export type QueryMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<MemberSort>>>
  where?: InputMaybe<MemberWhere>
}

export type QueryOccupationsArgs = {
  options?: InputMaybe<OccupationOptions>
  where?: InputMaybe<OccupationWhere>
}

export type QueryOccupationsAggregateArgs = {
  where?: InputMaybe<OccupationWhere>
}

export type QueryOccupationsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<OccupationSort>>>
  where?: InputMaybe<OccupationWhere>
}

export type QueryStreamsArgs = {
  options?: InputMaybe<StreamOptions>
  where?: InputMaybe<StreamWhere>
}

export type QueryStreamsAggregateArgs = {
  where?: InputMaybe<StreamWhere>
}

export type QueryStreamsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<StreamSort>>>
  where?: InputMaybe<StreamWhere>
}

export type QueryTimeGraphsArgs = {
  options?: InputMaybe<TimeGraphOptions>
  where?: InputMaybe<TimeGraphWhere>
}

export type QueryTimeGraphsAggregateArgs = {
  where?: InputMaybe<TimeGraphWhere>
}

export type QueryTimeGraphsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<TimeGraphSort>>>
  where?: InputMaybe<TimeGraphWhere>
}

export type QueryTitlesArgs = {
  options?: InputMaybe<TitleOptions>
  where?: InputMaybe<TitleWhere>
}

export type QueryTitlesAggregateArgs = {
  where?: InputMaybe<TitleWhere>
}

export type QueryTitlesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<InputMaybe<TitleSort>>>
  where?: InputMaybe<TitleWhere>
}

export enum SortDirection {
  /** Sort by field values in ascending order. */
  Asc = 'ASC',
  /** Sort by field values in descending order. */
  Desc = 'DESC',
}

export type Stream = Church & {
  __typename?: 'Stream'
  councils: Array<Council>
  councilsAggregate?: Maybe<StreamCouncilCouncilsAggregationSelection>
  councilsConnection: StreamCouncilsConnection
  id: Scalars['ID']['output']
  leader: Member
  leaderAggregate?: Maybe<StreamMemberLeaderAggregationSelection>
  leaderConnection: ChurchLeaderConnection
  members: Array<Member>
  name: Scalars['String']['output']
}

export type StreamCouncilsArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<CouncilOptions>
  where?: InputMaybe<CouncilWhere>
}

export type StreamCouncilsAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<CouncilWhere>
}

export type StreamCouncilsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<StreamCouncilsConnectionSort>>
  where?: InputMaybe<StreamCouncilsConnectionWhere>
}

export type StreamLeaderArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<MemberOptions>
  where?: InputMaybe<MemberWhere>
}

export type StreamLeaderAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<MemberWhere>
}

export type StreamLeaderConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<ChurchLeaderConnectionSort>>
  where?: InputMaybe<ChurchLeaderConnectionWhere>
}

export type StreamAggregateSelection = {
  __typename?: 'StreamAggregateSelection'
  count: Scalars['Int']['output']
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type StreamConnectInput = {
  councils?: InputMaybe<Array<StreamCouncilsConnectFieldInput>>
  leader?: InputMaybe<ChurchLeaderConnectFieldInput>
}

export type StreamConnectWhere = {
  node: StreamWhere
}

export type StreamCouncilCouncilsAggregationSelection = {
  __typename?: 'StreamCouncilCouncilsAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<StreamCouncilCouncilsNodeAggregateSelection>
}

export type StreamCouncilCouncilsNodeAggregateSelection = {
  __typename?: 'StreamCouncilCouncilsNodeAggregateSelection'
  id: IdAggregateSelectionNonNullable
  name: StringAggregateSelectionNonNullable
}

export type StreamCouncilsAggregateInput = {
  AND?: InputMaybe<Array<StreamCouncilsAggregateInput>>
  NOT?: InputMaybe<StreamCouncilsAggregateInput>
  OR?: InputMaybe<Array<StreamCouncilsAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<StreamCouncilsNodeAggregationWhereInput>
}

export type StreamCouncilsConnectFieldInput = {
  connect?: InputMaybe<Array<CouncilConnectInput>>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<CouncilConnectWhere>
}

export type StreamCouncilsConnection = {
  __typename?: 'StreamCouncilsConnection'
  edges: Array<StreamCouncilsRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type StreamCouncilsConnectionSort = {
  node?: InputMaybe<CouncilSort>
}

export type StreamCouncilsConnectionWhere = {
  AND?: InputMaybe<Array<StreamCouncilsConnectionWhere>>
  NOT?: InputMaybe<StreamCouncilsConnectionWhere>
  OR?: InputMaybe<Array<StreamCouncilsConnectionWhere>>
  node?: InputMaybe<CouncilWhere>
}

export type StreamCouncilsCreateFieldInput = {
  node: CouncilCreateInput
}

export type StreamCouncilsDeleteFieldInput = {
  delete?: InputMaybe<CouncilDeleteInput>
  where?: InputMaybe<StreamCouncilsConnectionWhere>
}

export type StreamCouncilsDisconnectFieldInput = {
  disconnect?: InputMaybe<CouncilDisconnectInput>
  where?: InputMaybe<StreamCouncilsConnectionWhere>
}

export type StreamCouncilsFieldInput = {
  connect?: InputMaybe<Array<StreamCouncilsConnectFieldInput>>
  create?: InputMaybe<Array<StreamCouncilsCreateFieldInput>>
}

export type StreamCouncilsNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<StreamCouncilsNodeAggregationWhereInput>>
  NOT?: InputMaybe<StreamCouncilsNodeAggregationWhereInput>
  OR?: InputMaybe<Array<StreamCouncilsNodeAggregationWhereInput>>
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

export type StreamCouncilsRelationship = {
  __typename?: 'StreamCouncilsRelationship'
  cursor: Scalars['String']['output']
  node: Council
}

export type StreamCouncilsUpdateConnectionInput = {
  node?: InputMaybe<CouncilUpdateInput>
}

export type StreamCouncilsUpdateFieldInput = {
  connect?: InputMaybe<Array<StreamCouncilsConnectFieldInput>>
  create?: InputMaybe<Array<StreamCouncilsCreateFieldInput>>
  delete?: InputMaybe<Array<StreamCouncilsDeleteFieldInput>>
  disconnect?: InputMaybe<Array<StreamCouncilsDisconnectFieldInput>>
  update?: InputMaybe<StreamCouncilsUpdateConnectionInput>
  where?: InputMaybe<StreamCouncilsConnectionWhere>
}

export type StreamCreateInput = {
  councils?: InputMaybe<StreamCouncilsFieldInput>
  id: Scalars['ID']['input']
  leader?: InputMaybe<ChurchLeaderFieldInput>
  name: Scalars['String']['input']
}

export type StreamDeleteInput = {
  councils?: InputMaybe<Array<StreamCouncilsDeleteFieldInput>>
  leader?: InputMaybe<ChurchLeaderDeleteFieldInput>
}

export type StreamDisconnectInput = {
  councils?: InputMaybe<Array<StreamCouncilsDisconnectFieldInput>>
  leader?: InputMaybe<ChurchLeaderDisconnectFieldInput>
}

export type StreamEdge = {
  __typename?: 'StreamEdge'
  cursor: Scalars['String']['output']
  node: Stream
}

export type StreamLeaderAggregateInput = {
  AND?: InputMaybe<Array<StreamLeaderAggregateInput>>
  NOT?: InputMaybe<StreamLeaderAggregateInput>
  OR?: InputMaybe<Array<StreamLeaderAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<StreamLeaderNodeAggregationWhereInput>
}

export type StreamLeaderNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<StreamLeaderNodeAggregationWhereInput>>
  NOT?: InputMaybe<StreamLeaderNodeAggregationWhereInput>
  OR?: InputMaybe<Array<StreamLeaderNodeAggregationWhereInput>>
  auth_id_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  middleName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  middleName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type StreamMemberLeaderAggregationSelection = {
  __typename?: 'StreamMemberLeaderAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<StreamMemberLeaderNodeAggregateSelection>
}

export type StreamMemberLeaderNodeAggregateSelection = {
  __typename?: 'StreamMemberLeaderNodeAggregateSelection'
  auth_id: StringAggregateSelectionNullable
  email: StringAggregateSelectionNullable
  firstName: StringAggregateSelectionNullable
  id: IdAggregateSelectionNonNullable
  lastName: StringAggregateSelectionNullable
  middleName: StringAggregateSelectionNullable
  phoneNumber: StringAggregateSelectionNullable
  pictureUrl: StringAggregateSelectionNullable
  whatsappNumber: StringAggregateSelectionNullable
}

export type StreamOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more StreamSort objects to sort Streams by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<StreamSort>>
}

export type StreamRelationInput = {
  councils?: InputMaybe<Array<StreamCouncilsCreateFieldInput>>
  leader?: InputMaybe<ChurchLeaderCreateFieldInput>
}

/** Fields to sort Streams by. The order in which sorts are applied is not guaranteed when specifying many fields in one StreamSort object. */
export type StreamSort = {
  id?: InputMaybe<SortDirection>
  name?: InputMaybe<SortDirection>
}

export type StreamUpdateInput = {
  councils?: InputMaybe<Array<StreamCouncilsUpdateFieldInput>>
  id?: InputMaybe<Scalars['ID']['input']>
  leader?: InputMaybe<ChurchLeaderUpdateFieldInput>
  name?: InputMaybe<Scalars['String']['input']>
}

export type StreamWhere = {
  AND?: InputMaybe<Array<StreamWhere>>
  NOT?: InputMaybe<StreamWhere>
  OR?: InputMaybe<Array<StreamWhere>>
  councilsAggregate?: InputMaybe<StreamCouncilsAggregateInput>
  /** Return Streams where all of the related StreamCouncilsConnections match this filter */
  councilsConnection_ALL?: InputMaybe<StreamCouncilsConnectionWhere>
  /** Return Streams where none of the related StreamCouncilsConnections match this filter */
  councilsConnection_NONE?: InputMaybe<StreamCouncilsConnectionWhere>
  /** Return Streams where one of the related StreamCouncilsConnections match this filter */
  councilsConnection_SINGLE?: InputMaybe<StreamCouncilsConnectionWhere>
  /** Return Streams where some of the related StreamCouncilsConnections match this filter */
  councilsConnection_SOME?: InputMaybe<StreamCouncilsConnectionWhere>
  /** Return Streams where all of the related Councils match this filter */
  councils_ALL?: InputMaybe<CouncilWhere>
  /** Return Streams where none of the related Councils match this filter */
  councils_NONE?: InputMaybe<CouncilWhere>
  /** Return Streams where one of the related Councils match this filter */
  councils_SINGLE?: InputMaybe<CouncilWhere>
  /** Return Streams where some of the related Councils match this filter */
  councils_SOME?: InputMaybe<CouncilWhere>
  id?: InputMaybe<Scalars['ID']['input']>
  id_CONTAINS?: InputMaybe<Scalars['ID']['input']>
  id_ENDS_WITH?: InputMaybe<Scalars['ID']['input']>
  id_IN?: InputMaybe<Array<Scalars['ID']['input']>>
  id_STARTS_WITH?: InputMaybe<Scalars['ID']['input']>
  leader?: InputMaybe<MemberWhere>
  leaderAggregate?: InputMaybe<StreamLeaderAggregateInput>
  leaderConnection?: InputMaybe<ChurchLeaderConnectionWhere>
  leaderConnection_NOT?: InputMaybe<ChurchLeaderConnectionWhere>
  leader_NOT?: InputMaybe<MemberWhere>
  name?: InputMaybe<Scalars['String']['input']>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type StreamsConnection = {
  __typename?: 'StreamsConnection'
  edges: Array<StreamEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type StringAggregateSelectionNonNullable = {
  __typename?: 'StringAggregateSelectionNonNullable'
  longest: Scalars['String']['output']
  shortest: Scalars['String']['output']
}

export type StringAggregateSelectionNullable = {
  __typename?: 'StringAggregateSelectionNullable'
  longest?: Maybe<Scalars['String']['output']>
  shortest?: Maybe<Scalars['String']['output']>
}

export type TimeGraph = TimeGraphNode & {
  __typename?: 'TimeGraph'
  date?: Maybe<Scalars['Date']['output']>
  id?: Maybe<Scalars['ID']['output']>
}

export type TimeGraphAggregateSelection = {
  __typename?: 'TimeGraphAggregateSelection'
  count: Scalars['Int']['output']
}

export type TimeGraphConnectWhere = {
  node: TimeGraphWhere
}

export type TimeGraphCreateInput = {
  date?: InputMaybe<Scalars['Date']['input']>
}

export type TimeGraphEdge = {
  __typename?: 'TimeGraphEdge'
  cursor: Scalars['String']['output']
  node: TimeGraph
}

export type TimeGraphNode = {
  date?: Maybe<Scalars['Date']['output']>
}

export type TimeGraphOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more TimeGraphSort objects to sort TimeGraphs by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<TimeGraphSort>>
}

/** Fields to sort TimeGraphs by. The order in which sorts are applied is not guaranteed when specifying many fields in one TimeGraphSort object. */
export type TimeGraphSort = {
  date?: InputMaybe<SortDirection>
  id?: InputMaybe<SortDirection>
}

export type TimeGraphUpdateInput = {
  date?: InputMaybe<Scalars['Date']['input']>
}

export type TimeGraphWhere = {
  AND?: InputMaybe<Array<TimeGraphWhere>>
  NOT?: InputMaybe<TimeGraphWhere>
  OR?: InputMaybe<Array<TimeGraphWhere>>
  date?: InputMaybe<Scalars['Date']['input']>
  date_GT?: InputMaybe<Scalars['Date']['input']>
  date_GTE?: InputMaybe<Scalars['Date']['input']>
  date_IN?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>
  date_LT?: InputMaybe<Scalars['Date']['input']>
  date_LTE?: InputMaybe<Scalars['Date']['input']>
}

export type TimeGraphsConnection = {
  __typename?: 'TimeGraphsConnection'
  edges: Array<TimeGraphEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type Title = {
  __typename?: 'Title'
  members: Array<Member>
  membersAggregate?: Maybe<TitleMemberMembersAggregationSelection>
  membersConnection: TitleMembersConnection
  name: Scalars['String']['output']
}

export type TitleMembersArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  options?: InputMaybe<MemberOptions>
  where?: InputMaybe<MemberWhere>
}

export type TitleMembersAggregateArgs = {
  directed?: InputMaybe<Scalars['Boolean']['input']>
  where?: InputMaybe<MemberWhere>
}

export type TitleMembersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>
  directed?: InputMaybe<Scalars['Boolean']['input']>
  first?: InputMaybe<Scalars['Int']['input']>
  sort?: InputMaybe<Array<TitleMembersConnectionSort>>
  where?: InputMaybe<TitleMembersConnectionWhere>
}

export type TitleAggregateSelection = {
  __typename?: 'TitleAggregateSelection'
  count: Scalars['Int']['output']
  name: StringAggregateSelectionNonNullable
}

export type TitleConnectInput = {
  members?: InputMaybe<Array<TitleMembersConnectFieldInput>>
}

export type TitleConnectWhere = {
  node: TitleWhere
}

export type TitleCreateInput = {
  members?: InputMaybe<TitleMembersFieldInput>
  name: Scalars['String']['input']
}

export type TitleDeleteInput = {
  members?: InputMaybe<Array<TitleMembersDeleteFieldInput>>
}

export type TitleDisconnectInput = {
  members?: InputMaybe<Array<TitleMembersDisconnectFieldInput>>
}

export type TitleEdge = {
  __typename?: 'TitleEdge'
  cursor: Scalars['String']['output']
  node: Title
}

export type TitleMemberMembersAggregationSelection = {
  __typename?: 'TitleMemberMembersAggregationSelection'
  count: Scalars['Int']['output']
  node?: Maybe<TitleMemberMembersNodeAggregateSelection>
}

export type TitleMemberMembersNodeAggregateSelection = {
  __typename?: 'TitleMemberMembersNodeAggregateSelection'
  auth_id: StringAggregateSelectionNullable
  email: StringAggregateSelectionNullable
  firstName: StringAggregateSelectionNullable
  id: IdAggregateSelectionNonNullable
  lastName: StringAggregateSelectionNullable
  middleName: StringAggregateSelectionNullable
  phoneNumber: StringAggregateSelectionNullable
  pictureUrl: StringAggregateSelectionNullable
  whatsappNumber: StringAggregateSelectionNullable
}

export type TitleMembersAggregateInput = {
  AND?: InputMaybe<Array<TitleMembersAggregateInput>>
  NOT?: InputMaybe<TitleMembersAggregateInput>
  OR?: InputMaybe<Array<TitleMembersAggregateInput>>
  count?: InputMaybe<Scalars['Int']['input']>
  count_GT?: InputMaybe<Scalars['Int']['input']>
  count_GTE?: InputMaybe<Scalars['Int']['input']>
  count_LT?: InputMaybe<Scalars['Int']['input']>
  count_LTE?: InputMaybe<Scalars['Int']['input']>
  node?: InputMaybe<TitleMembersNodeAggregationWhereInput>
}

export type TitleMembersConnectFieldInput = {
  connect?: InputMaybe<Array<MemberConnectInput>>
  edge?: InputMaybe<HasTitleCreateInput>
  /** Whether or not to overwrite any matching relationship with the new properties. Will default to `false` in 4.0.0. */
  overwrite?: Scalars['Boolean']['input']
  where?: InputMaybe<MemberConnectWhere>
}

export type TitleMembersConnection = {
  __typename?: 'TitleMembersConnection'
  edges: Array<TitleMembersRelationship>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type TitleMembersConnectionSort = {
  edge?: InputMaybe<HasTitleSort>
  node?: InputMaybe<MemberSort>
}

export type TitleMembersConnectionWhere = {
  AND?: InputMaybe<Array<TitleMembersConnectionWhere>>
  NOT?: InputMaybe<TitleMembersConnectionWhere>
  OR?: InputMaybe<Array<TitleMembersConnectionWhere>>
  edge?: InputMaybe<HasTitleWhere>
  node?: InputMaybe<MemberWhere>
}

export type TitleMembersCreateFieldInput = {
  edge?: InputMaybe<HasTitleCreateInput>
  node: MemberCreateInput
}

export type TitleMembersDeleteFieldInput = {
  delete?: InputMaybe<MemberDeleteInput>
  where?: InputMaybe<TitleMembersConnectionWhere>
}

export type TitleMembersDisconnectFieldInput = {
  disconnect?: InputMaybe<MemberDisconnectInput>
  where?: InputMaybe<TitleMembersConnectionWhere>
}

export type TitleMembersFieldInput = {
  connect?: InputMaybe<Array<TitleMembersConnectFieldInput>>
  create?: InputMaybe<Array<TitleMembersCreateFieldInput>>
}

export type TitleMembersNodeAggregationWhereInput = {
  AND?: InputMaybe<Array<TitleMembersNodeAggregationWhereInput>>
  NOT?: InputMaybe<TitleMembersNodeAggregationWhereInput>
  OR?: InputMaybe<Array<TitleMembersNodeAggregationWhereInput>>
  auth_id_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  auth_id_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  auth_id_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  auth_id_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
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
  middleName_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  middleName_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  middleName_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  middleName_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  phoneNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  phoneNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  pictureUrl_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  pictureUrl_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LT?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars['Float']['input']>
  whatsappNumber_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_LONGEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LT?: InputMaybe<Scalars['Int']['input']>
  whatsappNumber_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars['Int']['input']>
}

export type TitleMembersRelationship = HasTitle & {
  __typename?: 'TitleMembersRelationship'
  cursor: Scalars['String']['output']
  date?: Maybe<Scalars['Date']['output']>
  node: Member
}

export type TitleMembersUpdateConnectionInput = {
  edge?: InputMaybe<HasTitleUpdateInput>
  node?: InputMaybe<MemberUpdateInput>
}

export type TitleMembersUpdateFieldInput = {
  connect?: InputMaybe<Array<TitleMembersConnectFieldInput>>
  create?: InputMaybe<Array<TitleMembersCreateFieldInput>>
  delete?: InputMaybe<Array<TitleMembersDeleteFieldInput>>
  disconnect?: InputMaybe<Array<TitleMembersDisconnectFieldInput>>
  update?: InputMaybe<TitleMembersUpdateConnectionInput>
  where?: InputMaybe<TitleMembersConnectionWhere>
}

export type TitleOptions = {
  limit?: InputMaybe<Scalars['Int']['input']>
  offset?: InputMaybe<Scalars['Int']['input']>
  /** Specify one or more TitleSort objects to sort Titles by. The sorts will be applied in the order in which they are arranged in the array. */
  sort?: InputMaybe<Array<TitleSort>>
}

export type TitleRelationInput = {
  members?: InputMaybe<Array<TitleMembersCreateFieldInput>>
}

/** Fields to sort Titles by. The order in which sorts are applied is not guaranteed when specifying many fields in one TitleSort object. */
export type TitleSort = {
  name?: InputMaybe<SortDirection>
}

export type TitleUpdateInput = {
  members?: InputMaybe<Array<TitleMembersUpdateFieldInput>>
  name?: InputMaybe<Scalars['String']['input']>
}

export type TitleWhere = {
  AND?: InputMaybe<Array<TitleWhere>>
  NOT?: InputMaybe<TitleWhere>
  OR?: InputMaybe<Array<TitleWhere>>
  membersAggregate?: InputMaybe<TitleMembersAggregateInput>
  /** Return Titles where all of the related TitleMembersConnections match this filter */
  membersConnection_ALL?: InputMaybe<TitleMembersConnectionWhere>
  /** Return Titles where none of the related TitleMembersConnections match this filter */
  membersConnection_NONE?: InputMaybe<TitleMembersConnectionWhere>
  /** Return Titles where one of the related TitleMembersConnections match this filter */
  membersConnection_SINGLE?: InputMaybe<TitleMembersConnectionWhere>
  /** Return Titles where some of the related TitleMembersConnections match this filter */
  membersConnection_SOME?: InputMaybe<TitleMembersConnectionWhere>
  /** Return Titles where all of the related Members match this filter */
  members_ALL?: InputMaybe<MemberWhere>
  /** Return Titles where none of the related Members match this filter */
  members_NONE?: InputMaybe<MemberWhere>
  /** Return Titles where one of the related Members match this filter */
  members_SINGLE?: InputMaybe<MemberWhere>
  /** Return Titles where some of the related Members match this filter */
  members_SOME?: InputMaybe<MemberWhere>
  name?: InputMaybe<Scalars['String']['input']>
  name_CONTAINS?: InputMaybe<Scalars['String']['input']>
  name_ENDS_WITH?: InputMaybe<Scalars['String']['input']>
  name_IN?: InputMaybe<Array<Scalars['String']['input']>>
  name_STARTS_WITH?: InputMaybe<Scalars['String']['input']>
}

export type TitlesConnection = {
  __typename?: 'TitlesConnection'
  edges: Array<TitleEdge>
  pageInfo: PageInfo
  totalCount: Scalars['Int']['output']
}

export type UpdateBacentasMutationResponse = {
  __typename?: 'UpdateBacentasMutationResponse'
  bacentas: Array<Bacenta>
  info: UpdateInfo
}

export type UpdateCampusesMutationResponse = {
  __typename?: 'UpdateCampusesMutationResponse'
  campuses: Array<Campus>
  info: UpdateInfo
}

export type UpdateCouncilsMutationResponse = {
  __typename?: 'UpdateCouncilsMutationResponse'
  councils: Array<Council>
  info: UpdateInfo
}

export type UpdateGendersMutationResponse = {
  __typename?: 'UpdateGendersMutationResponse'
  genders: Array<Gender>
  info: UpdateInfo
}

export type UpdateGovernorshipsMutationResponse = {
  __typename?: 'UpdateGovernorshipsMutationResponse'
  governorships: Array<Governorship>
  info: UpdateInfo
}

export type UpdateInfo = {
  __typename?: 'UpdateInfo'
  bookmark?: Maybe<Scalars['String']['output']>
  nodesCreated: Scalars['Int']['output']
  nodesDeleted: Scalars['Int']['output']
  relationshipsCreated: Scalars['Int']['output']
  relationshipsDeleted: Scalars['Int']['output']
}

export type UpdateJobsMutationResponse = {
  __typename?: 'UpdateJobsMutationResponse'
  info: UpdateInfo
  jobs: Array<Job>
}

export type UpdateMaritalStatusesMutationResponse = {
  __typename?: 'UpdateMaritalStatusesMutationResponse'
  info: UpdateInfo
  maritalStatuses: Array<MaritalStatus>
}

export type UpdateMembersMutationResponse = {
  __typename?: 'UpdateMembersMutationResponse'
  info: UpdateInfo
  members: Array<Member>
}

export type UpdateOccupationsMutationResponse = {
  __typename?: 'UpdateOccupationsMutationResponse'
  info: UpdateInfo
  occupations: Array<Occupation>
}

export type UpdateStreamsMutationResponse = {
  __typename?: 'UpdateStreamsMutationResponse'
  info: UpdateInfo
  streams: Array<Stream>
}

export type UpdateTimeGraphsMutationResponse = {
  __typename?: 'UpdateTimeGraphsMutationResponse'
  info: UpdateInfo
  timeGraphs: Array<TimeGraph>
}

export type UpdateTitlesMutationResponse = {
  __typename?: 'UpdateTitlesMutationResponse'
  info: UpdateInfo
  titles: Array<Title>
}

export type GetCouncilJobsQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetCouncilJobsQuery = {
  __typename?: 'Query'
  councils: Array<{
    __typename?: 'Council'
    id: string
    name: string
    jobs: Array<{
      __typename?: 'Job'
      id: string
      title: string
      description: string
      createdOn: any
      updatedOn: any
      dueDate: string
      completionCount?: number | null
      memberCount: number
      members: Array<{
        __typename?: 'Member'
        id: string
        firstName?: string | null
        lastName?: string | null
        fullName?: string | null
        pictureUrl?: string | null
      }>
    }>
  }>
}

export type GetGovernorshipJobsQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetGovernorshipJobsQuery = {
  __typename?: 'Query'
  governorships: Array<{
    __typename?: 'Governorship'
    id: string
    name: string
    jobs: Array<{
      __typename?: 'Job'
      id: string
      title: string
      description: string
      createdOn: any
      updatedOn: any
      dueDate: string
      completionCount?: number | null
      memberCount: number
      members: Array<{
        __typename?: 'Member'
        id: string
        firstName?: string | null
        lastName?: string | null
        fullName?: string | null
        pictureUrl?: string | null
      }>
    }>
  }>
}

export type GetMemberChurchesQueryVariables = Exact<{
  authId: Scalars['String']['input']
}>

export type GetMemberChurchesQuery = {
  __typename?: 'Query'
  members: Array<{
    __typename?: 'Member'
    id: string
    firstName?: string | null
    lastName?: string | null
    fullName?: string | null
    pictureUrl?: string | null
    adminCouncil: Array<{ __typename?: 'Council'; id: string; name: string }>
    leadsCouncil: Array<{ __typename?: 'Council'; id: string; name: string }>
    leadsGovernorship: Array<{
      __typename?: 'Governorship'
      id: string
      name: string
    }>
    adminGovernorship: Array<{
      __typename?: 'Governorship'
      id: string
      name: string
    }>
    leadsStream: Array<{ __typename?: 'Stream'; id: string; name: string }>
    adminStream: Array<{ __typename?: 'Stream'; id: string; name: string }>
    leadsCampus: Array<{ __typename?: 'Campus'; id: string; name: string }>
    adminCampus: Array<{ __typename?: 'Campus'; id: string; name: string }>
  }>
}

export type GetMemberBioQueryVariables = Exact<{
  authId: Scalars['String']['input']
}>

export type GetMemberBioQuery = {
  __typename?: 'Query'
  members: Array<{ __typename?: 'Member'; id: string; email?: string | null }>
}

export type CreateJobMutationVariables = Exact<{
  title: Scalars['String']['input']
  dueDate: Scalars['String']['input']
  description: Scalars['String']['input']
  churchLevel: Scalars['String']['input']
  churchId: Scalars['ID']['input']
  createdBy: MemberInput
}>

export type CreateJobMutation = {
  __typename?: 'Mutation'
  createJob: {
    __typename?: 'Job'
    id: string
    title: string
    dueDate: string
    description: string
    createdOn: any
    updatedOn: any
    createdBy: {
      __typename?: 'Member'
      id: string
      firstName?: string | null
      lastName?: string | null
      email?: string | null
      pictureUrl?: string | null
    }
  }
}

export type CreateJobForGovernorsMutationVariables = Exact<{
  title: Scalars['String']['input']
  dueDate: Scalars['String']['input']
  description: Scalars['String']['input']
  churchLevel: Scalars['String']['input']
  churchId: Scalars['ID']['input']
  createdBy: MemberInput
}>

export type CreateJobForGovernorsMutation = {
  __typename?: 'Mutation'
  createJobForGovernors: boolean
}

export type MarkMemberAsDoneMutationVariables = Exact<{
  jobId: Scalars['ID']['input']
  memberId: Scalars['ID']['input']
}>

export type MarkMemberAsDoneMutation = {
  __typename?: 'Mutation'
  markMemberAsDone: {
    __typename?: 'Member'
    id: string
    firstName?: string | null
    lastName?: string | null
    fullName?: string | null
    pictureUrl?: string | null
    phoneNumber?: string | null
    whatsappNumber?: string | null
    done?: boolean | null
  }
}

export type GetJobsQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetJobsQuery = {
  __typename?: 'Query'
  jobs: Array<{
    __typename?: 'Job'
    id: string
    title: string
    description: string
    createdOn: any
    updatedOn: any
    dueDate: string
    memberCount: number
    completionCount?: number | null
    members: Array<{
      __typename?: 'Member'
      id: string
      firstName?: string | null
      lastName?: string | null
      fullName?: string | null
      pictureUrl?: string | null
      phoneNumber?: string | null
      whatsappNumber?: string | null
      done?: boolean | null
    }>
  }>
}

export type AddMembersToJobMutationVariables = Exact<{
  jobId: Scalars['ID']['input']
  members: Array<MemberInput> | MemberInput
}>

export type AddMembersToJobMutation = {
  __typename?: 'Mutation'
  addMembersToJob: {
    __typename?: 'Job'
    id: string
    title: string
    dueDate: string
    description: string
    createdOn: any
    updatedOn: any
    createdBy: {
      __typename?: 'Member'
      id: string
      firstName?: string | null
      lastName?: string | null
      email?: string | null
      pictureUrl?: string | null
    }
    members: Array<{
      __typename?: 'Member'
      id: string
      firstName?: string | null
      lastName?: string | null
      fullName?: string | null
      pictureUrl?: string | null
      email?: string | null
      phoneNumber?: string | null
      whatsappNumber?: string | null
    }>
  }
}

export type GetGovernorshipMembersQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetGovernorshipMembersQuery = {
  __typename?: 'Query'
  governorships: Array<{
    __typename?: 'Governorship'
    id: string
    name: string
    members: Array<{
      __typename?: 'Member'
      id: string
      firstName?: string | null
      lastName?: string | null
      pictureUrl?: string | null
      phoneNumber?: string | null
      whatsappNumber?: string | null
    }>
  }>
}

export type GetGovernorshipMembersWithDateRangeQueryVariables = Exact<{
  id: Scalars['ID']['input']
  from: Scalars['String']['input']
  to: Scalars['String']['input']
}>

export type GetGovernorshipMembersWithDateRangeQuery = {
  __typename?: 'Query'
  governorships: Array<{
    __typename?: 'Governorship'
    id: string
    name: string
    membersWithinDateRange: Array<{
      __typename?: 'Member'
      id: string
      firstName?: string | null
      lastName?: string | null
      pictureUrl?: string | null
      phoneNumber?: string | null
      whatsappNumber?: string | null
    }>
  }>
}

export type GetCouncilMembersQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetCouncilMembersQuery = {
  __typename?: 'Query'
  councils: Array<{
    __typename?: 'Council'
    id: string
    name: string
    members: Array<{
      __typename?: 'Member'
      id: string
      firstName?: string | null
      lastName?: string | null
      pictureUrl?: string | null
      phoneNumber?: string | null
      whatsappNumber?: string | null
    }>
  }>
}

export type GetCouncilMembersWithDateRangeQueryVariables = Exact<{
  id: Scalars['ID']['input']
  from: Scalars['String']['input']
  to: Scalars['String']['input']
}>

export type GetCouncilMembersWithDateRangeQuery = {
  __typename?: 'Query'
  councils: Array<{
    __typename?: 'Council'
    id: string
    name: string
    membersWithinDateRange: Array<{
      __typename?: 'Member'
      id: string
      firstName?: string | null
      lastName?: string | null
      pictureUrl?: string | null
      phoneNumber?: string | null
      whatsappNumber?: string | null
    }>
  }>
}

export type GetCouncilJobsByGovernorQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetCouncilJobsByGovernorQuery = {
  __typename?: 'Query'
  councils: Array<{
    __typename?: 'Council'
    id: string
    name: string
    governorships: Array<{
      __typename?: 'Governorship'
      id: string
      name: string
      leader: {
        __typename?: 'Member'
        id: string
        firstName?: string | null
        lastName?: string | null
        fullName?: string | null
        pictureUrl?: string | null
      }
      jobs: Array<{
        __typename?: 'Job'
        id: string
        title: string
        description: string
        createdOn: any
        updatedOn: any
        dueDate: string
        completionCount?: number | null
        memberCount: number
        members: Array<{
          __typename?: 'Member'
          id: string
          firstName?: string | null
          lastName?: string | null
          fullName?: string | null
          pictureUrl?: string | null
        }>
      }>
    }>
  }>
}

export type GetCouncilsByStreamQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetCouncilsByStreamQuery = {
  __typename?: 'Query'
  streams: Array<{
    __typename?: 'Stream'
    id: string
    name: string
    councils: Array<{
      __typename?: 'Council'
      id: string
      name: string
      leader: {
        __typename?: 'Member'
        id: string
        firstName?: string | null
        lastName?: string | null
        fullName?: string | null
        pictureUrl?: string | null
      }
    }>
  }>
}

export type GetStreamsByCampusQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetStreamsByCampusQuery = {
  __typename?: 'Query'
  campuses: Array<{
    __typename?: 'Campus'
    id: string
    name: string
    streams: Array<{
      __typename?: 'Stream'
      id: string
      name: string
      leader: {
        __typename?: 'Member'
        id: string
        firstName?: string | null
        lastName?: string | null
        fullName?: string | null
        pictureUrl?: string | null
      }
    }>
  }>
}

export const GetCouncilJobsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getCouncilJobs' },
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
            name: { kind: 'Name', value: 'councils' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
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
                  name: { kind: 'Name', value: 'jobs' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdOn' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'updatedOn' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dueDate' },
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
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'fullName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'pictureUrl' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'completionCount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'memberCount' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCouncilJobsQuery, GetCouncilJobsQueryVariables>
export const GetGovernorshipJobsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getGovernorshipJobs' },
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
            name: { kind: 'Name', value: 'governorships' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
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
                  name: { kind: 'Name', value: 'jobs' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdOn' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'updatedOn' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dueDate' },
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
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'fullName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'pictureUrl' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'completionCount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'memberCount' },
                      },
                    ],
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
  GetGovernorshipJobsQuery,
  GetGovernorshipJobsQueryVariables
>
export const GetMemberChurchesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getMemberChurches' },
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
                      name: { kind: 'Name', value: 'auth_id' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pictureUrl' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'adminCouncil' },
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
                  name: { kind: 'Name', value: 'leadsCouncil' },
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
                  name: { kind: 'Name', value: 'leadsGovernorship' },
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
                  name: { kind: 'Name', value: 'adminGovernorship' },
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
                  name: { kind: 'Name', value: 'leadsStream' },
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
                  name: { kind: 'Name', value: 'adminStream' },
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
                  name: { kind: 'Name', value: 'adminStream' },
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
                  name: { kind: 'Name', value: 'leadsCampus' },
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
                  name: { kind: 'Name', value: 'adminCampus' },
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
  GetMemberChurchesQuery,
  GetMemberChurchesQueryVariables
>
export const GetMemberBioDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getMemberBio' },
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
                      name: { kind: 'Name', value: 'auth_id' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMemberBioQuery, GetMemberBioQueryVariables>
export const CreateJobDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createJob' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'title' },
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
            name: { kind: 'Name', value: 'dueDate' },
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
            name: { kind: 'Name', value: 'description' },
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
            name: { kind: 'Name', value: 'churchLevel' },
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
            name: { kind: 'Name', value: 'churchId' },
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
            name: { kind: 'Name', value: 'createdBy' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'MemberInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createJob' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'title' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'title' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'dueDate' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'dueDate' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'description' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'description' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'churchLevel' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'churchLevel' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'churchId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'churchId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'createdBy' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'createdBy' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdOn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedOn' } },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUrl' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateJobMutation, CreateJobMutationVariables>
export const CreateJobForGovernorsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createJobForGovernors' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'title' },
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
            name: { kind: 'Name', value: 'dueDate' },
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
            name: { kind: 'Name', value: 'description' },
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
            name: { kind: 'Name', value: 'churchLevel' },
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
            name: { kind: 'Name', value: 'churchId' },
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
            name: { kind: 'Name', value: 'createdBy' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'MemberInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createJobForGovernors' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'title' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'title' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'dueDate' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'dueDate' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'description' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'description' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'churchLevel' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'churchLevel' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'churchId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'churchId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'createdBy' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'createdBy' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateJobForGovernorsMutation,
  CreateJobForGovernorsMutationVariables
>
export const MarkMemberAsDoneDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'markMemberAsDone' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'jobId' },
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
            name: { kind: 'Name', value: 'markMemberAsDone' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'jobId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'jobId' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pictureUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'phoneNumber' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'whatsappNumber' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'done' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'jobId' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'jobId' },
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
} as unknown as DocumentNode<
  MarkMemberAsDoneMutation,
  MarkMemberAsDoneMutationVariables
>
export const GetJobsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getJobs' },
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
            name: { kind: 'Name', value: 'jobs' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdOn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedOn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'fullName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUrl' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'phoneNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'whatsappNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'done' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'jobId' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'id' },
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'memberCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'completionCount' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetJobsQuery, GetJobsQueryVariables>
export const AddMembersToJobDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'addMembersToJob' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'jobId' },
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
            name: { kind: 'Name', value: 'members' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'MemberInput' },
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
            name: { kind: 'Name', value: 'addMembersToJob' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'jobId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'jobId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'members' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'members' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdOn' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedOn' } },
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
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUrl' },
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
                        name: { kind: 'Name', value: 'fullName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUrl' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'phoneNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'whatsappNumber' },
                      },
                    ],
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
  AddMembersToJobMutation,
  AddMembersToJobMutationVariables
>
export const GetGovernorshipMembersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getGovernorshipMembers' },
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
            name: { kind: 'Name', value: 'governorships' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUrl' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'phoneNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'whatsappNumber' },
                      },
                    ],
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
  GetGovernorshipMembersQuery,
  GetGovernorshipMembersQueryVariables
>
export const GetGovernorshipMembersWithDateRangeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getGovernorshipMembersWithDateRange' },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'from' } },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'to' } },
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
            name: { kind: 'Name', value: 'governorships' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
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
                  name: { kind: 'Name', value: 'membersWithinDateRange' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'from' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'from' },
                      },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'to' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'to' },
                      },
                    },
                  ],
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUrl' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'phoneNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'whatsappNumber' },
                      },
                    ],
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
  GetGovernorshipMembersWithDateRangeQuery,
  GetGovernorshipMembersWithDateRangeQueryVariables
>
export const GetCouncilMembersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getCouncilMembers' },
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
            name: { kind: 'Name', value: 'councils' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUrl' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'phoneNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'whatsappNumber' },
                      },
                    ],
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
  GetCouncilMembersQuery,
  GetCouncilMembersQueryVariables
>
export const GetCouncilMembersWithDateRangeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getCouncilMembersWithDateRange' },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'from' } },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'to' } },
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
            name: { kind: 'Name', value: 'councils' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
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
                  name: { kind: 'Name', value: 'membersWithinDateRange' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'from' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'from' },
                      },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'to' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'to' },
                      },
                    },
                  ],
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUrl' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'phoneNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'whatsappNumber' },
                      },
                    ],
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
  GetCouncilMembersWithDateRangeQuery,
  GetCouncilMembersWithDateRangeQueryVariables
>
export const GetCouncilJobsByGovernorDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getCouncilJobsByGovernor' },
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
            name: { kind: 'Name', value: 'councils' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
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
                  name: { kind: 'Name', value: 'governorships' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'leader' },
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
                              name: { kind: 'Name', value: 'fullName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'pictureUrl' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'jobs' },
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
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'createdOn' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'updatedOn' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'dueDate' },
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
                                    name: { kind: 'Name', value: 'firstName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'lastName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'fullName' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'pictureUrl' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'completionCount' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'memberCount' },
                            },
                          ],
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
  GetCouncilJobsByGovernorQuery,
  GetCouncilJobsByGovernorQueryVariables
>
export const GetCouncilsByStreamDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getCouncilsByStream' },
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
            name: { kind: 'Name', value: 'streams' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
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
                  name: { kind: 'Name', value: 'councils' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'leader' },
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
                              name: { kind: 'Name', value: 'fullName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'pictureUrl' },
                            },
                          ],
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
  GetCouncilsByStreamQuery,
  GetCouncilsByStreamQueryVariables
>
export const GetStreamsByCampusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getStreamsByCampus' },
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
            name: { kind: 'Name', value: 'campuses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
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
                  name: { kind: 'Name', value: 'streams' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'leader' },
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
                              name: { kind: 'Name', value: 'fullName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'pictureUrl' },
                            },
                          ],
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
  GetStreamsByCampusQuery,
  GetStreamsByCampusQueryVariables
>
