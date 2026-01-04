import cors from 'cors'
import { NextApiRequest, NextApiResponse } from 'next'

export const applyCorsMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // In development, allow all origins and headers
  const isDevelopment = process.env.NODE_ENV === 'development'

  const corsOptions = {
    origin: isDevelopment ? true : process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Apollo-Require-Preflight',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
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
