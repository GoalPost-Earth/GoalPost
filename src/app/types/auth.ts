import { UserProfile } from '@auth0/nextjs-auth0/client'

interface DecodedToken {
  exp: number
  // Add other properties from the decoded token as needed
}

export interface Token {
  accessToken: string
  accessTokenDecoded: DecodedToken
  user: UserProfile
  expiresAt: number
}
