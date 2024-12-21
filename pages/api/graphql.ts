import initializeApolloServer from './apollo'
import { NextApiRequest, NextApiResponse } from 'next'

// Initialize Apollo Server
const server = await initializeApolloServer()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Start Apollo Server
  console.log('Starting Apollo Server')

  const startServer = server.start()
  await startServer
  await server.createHandler({ path: '/api/graphql' })(req, res)
}
// export default function handler(req, res) {
//   res.status(200).json({ message: 'Hello GraphQL' })
// }

export const config = {
  api: {
    bodyParser: false,
  },
}
