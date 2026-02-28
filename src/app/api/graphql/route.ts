import { initializeApolloServer } from '@/lib/graphql/apollo-server'

// Initialize Apollo Server once
let yogaServerPromise: ReturnType<typeof initializeApolloServer> | null = null

function getYogaServer() {
  if (!yogaServerPromise) {
    yogaServerPromise = initializeApolloServer()
  }
  return yogaServerPromise
}

export async function OPTIONS(request: Request) {
  // Handle CORS preflight
  const response = new Response(null, { status: 204 })

  // Apply CORS headers
  const corsOrigin =
    process.env.CORS_ORIGIN ||
    (process.env.NODE_ENV === 'development' ? '*' : 'http://localhost:3000')

  response.headers.set('Access-Control-Allow-Origin', corsOrigin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Apollo-Require-Preflight'
  )
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}

export async function GET(request: Request) {
  const yogaServer = await getYogaServer()
  const response = await yogaServer.handleRequest(request, {})

  // Add CORS headers
  const corsOrigin =
    process.env.CORS_ORIGIN ||
    (process.env.NODE_ENV === 'development' ? '*' : 'http://localhost:3000')

  response.headers.set('Access-Control-Allow-Origin', corsOrigin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}

export async function POST(request: Request) {
  const yogaServer = await getYogaServer()
  const response = await yogaServer.handleRequest(request, {})

  // Add CORS headers
  const corsOrigin =
    process.env.CORS_ORIGIN ||
    (process.env.NODE_ENV === 'development' ? '*' : 'http://localhost:3000')

  response.headers.set('Access-Control-Allow-Origin', corsOrigin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}

export const maxDuration = 60
