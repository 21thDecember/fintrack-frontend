export interface User {
  id?: string
  username: string
  fullName?: string
  email?: string
  role?: string
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  token: string
  tokenType?: string
  expiresInMs?: number
  username?: string
  user?: User
}
