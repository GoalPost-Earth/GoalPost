import { Member } from '@/gql/graphql'

const resolvers = {
  // Resolver Parameters
  // Object: the parent result of a previous resolver
  // Args: Field Arguments
  // Context: Context object, database connection, API, etc
  // GraphQLResolveInfo

  Person: {
    name: (source: Member) => `${source.firstName} ${source.lastName}`,
  },

  Mutation: {},
  Query: {},
}

export default resolvers
