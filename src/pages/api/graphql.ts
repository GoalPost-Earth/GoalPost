import { NextApiRequest, NextApiResponse } from 'next'
import initializeApolloServer from '@/lib/graphql/apollo'
import { applyCorsMiddleware } from '@/lib/middleware/cors'

// Initialize Apollo Server
const apolloHandler = await initializeApolloServer()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  await applyCorsMiddleware(req, res)

  // Handle GraphQL requests
  if (req.method === 'OPTIONS') {
    res.end()
  } else {
    await apolloHandler(req, res)
  }
}
// export default function handler(req, res) {
//   res.status(200).json({ message: 'Hello GraphQL' })
// }

export const config = {
  api: {
    bodyParser: false,
    maxDuration: 60,
  },
}
