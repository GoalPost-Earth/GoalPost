import { Person } from '@/gql/graphql'
import { embeddingMutations } from './embedding-mutations'
import { chatbotResolvers } from './chatbot-resolvers'

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
    ...chatbotResolvers,
  },
  Query: {},
}

export default resolvers
