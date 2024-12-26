interface DecodedToken {
  exp: number
  // Add other properties from the decoded token as needed
}

interface User {
  name: string
  email: string
  // Add other user properties as needed
}

export interface Token {
  accessToken: string
  accessTokenDecoded: DecodedToken
  user: User
  expiresAt: number
}
