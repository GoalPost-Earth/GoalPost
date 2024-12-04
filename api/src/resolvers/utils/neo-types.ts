import { Session } from 'neo4j-driver'

export type Context = {
  auth: { roles: any[]; jwt: { sub: string } }
  executionContext: { session: () => Session }
}
