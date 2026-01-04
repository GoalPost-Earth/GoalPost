import { Person } from '@/gql/graphql'
import { chatbotResolvers } from './chatbot-resolvers'
import { inviteMutations } from './invite-resolver'

const resolvers = {
  // Resolver Parameters
  // source: the parent result of a previous resolver
  // Args: Field Arguments
  // Context: Context object, database connection, API, etc
  // GraphQLResolveInfo

  Person: {
    name: (source: Person) => {
      console.log('🚀 ~ index.ts:14 ~ source:', source)

      return `${source.firstName} ${source.lastName}`
    },
  },

  Mutation: {
    ...chatbotResolvers,
    ...inviteMutations,
  },
  Query: {},
}

export default resolvers
