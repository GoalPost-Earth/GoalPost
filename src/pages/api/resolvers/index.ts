import { Person } from '@/gql/graphql'
import { embeddingMutations } from './embedding-mutations'
import { chatbotResolvers } from './chatbot-resolvers'
import { inviteMutations } from './invite-resolver'

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
    ...inviteMutations,
  },
  Query: {},
}

export default resolvers
