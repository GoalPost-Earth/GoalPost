import cors from 'cors'
import { NextApiRequest, NextApiResponse } from 'next'

export const applyCorsMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*', // Use CORS_ORIGIN environment variable if set, otherwise allow requests from any origin
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  }

  return new Promise((resolve, reject) => {
    cors(corsOptions)(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}
