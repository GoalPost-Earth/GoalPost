import { Session } from 'neo4j-driver'

export interface JwtPayload {
  sub: string
  user: {
    id: string
    email: string
  }
  // Add other properties as needed
}

export interface AuthContext {
  jwt: JwtPayload
}

export interface Context {
  auth: AuthContext
  jwt: JwtPayload
  executionContext: { session: () => Session }
  // Add other properties as needed
}
