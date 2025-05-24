interface DecodedToken {
  exp: number
  // Add other properties from the decoded token as needed
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface Token {
  accessToken: string
  accessTokenDecoded: DecodedToken
  user: UserProfile
  expiresAt: number
}
