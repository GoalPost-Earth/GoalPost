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
  /**
   * Best-effort client IP, derived from x-forwarded-for / x-real-ip on
   * the inbound request by the Yoga context builder. Used as a rate-
   * limit key in resolvers that can be invoked anonymously enough that
   * a single attacker could flood them (e.g. addSpaceMember's invite-
   * blast policy in GOAL-249). May be 'unknown' when no proxy header
   * is set (local curl / unit tests).
   */
  clientIp?: string
  // Add other properties as needed
}
