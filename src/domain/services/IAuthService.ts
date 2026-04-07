import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Unsubscribe } from '@core/types'
import type { User } from '@domain/entities/User'

export interface IAuthService {
  signIn(email: string, password: string): Promise<Result<User, AppError>>
  signInWithGoogle(): Promise<Result<User, AppError>>
  signOut(): Promise<Result<void, AppError>>
  sendPasswordReset(email: string): Promise<Result<void, AppError>>
  getCurrentUser(): Promise<Result<User | null, AppError>>
  onAuthStateChange(callback: (user: User | null) => void): Unsubscribe
}
