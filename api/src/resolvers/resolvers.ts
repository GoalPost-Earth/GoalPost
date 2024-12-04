/* eslint-disable no-underscore-dangle */

const dotenv = require('dotenv')

dotenv.config()

const resolvers = {
  // Resolver Parameters
  // Object: the parent result of a previous resolver
  // Args: Field Arguments
  // Context: Context object, database connection, API, etc
  // GraphQLResolveInfo

  Person: {
    fullName: (source: any) => `${source.firstName} ${source.lastName}`,
  },

  Mutation: {},
  Query: {},
}

export default resolvers
