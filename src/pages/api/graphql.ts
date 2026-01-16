import { NextApiRequest, NextApiResponse } from 'next'
import initializeApolloServer from '@/lib/graphql/apollo'
import { applyCorsMiddleware } from '@/lib/middleware/cors'

let apolloHandler: Awaited<ReturnType<typeof initializeApolloServer>> | null =
  null

async function getApolloHandler() {
  if (!apolloHandler) {
    apolloHandler = await initializeApolloServer()
  }
  return apolloHandler
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  await applyCorsMiddleware(req, res)

  // Get or initialize Apollo handler
  const yoga = await getApolloHandler()

  // Handle GraphQL requests
  if (req.method === 'OPTIONS') {
    res.end()
  } else {
    await yoga(req, res)
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
