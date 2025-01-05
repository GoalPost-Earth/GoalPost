import { Person } from '@/gql/graphql'
import { embeddingMutations } from './embeddingMutations'

const resolvers = {
  // Resolver Parameters
  // source: the parent result of a previous resolver
  // Args: Field Arguments
  // Context: Context object, database connection, API, etc
  // GraphQLResolveInfo

  Person: {
    name: (source: Person) => `${source.firstName} ${source.lastName}`,
  },

  Mutation: {
    ...embeddingMutations,
  },
  Query: {},
}

export default resolvers
