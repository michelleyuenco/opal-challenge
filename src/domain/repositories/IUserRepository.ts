import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { User } from '@domain/entities/User'

export interface IUserRepository {
  findById(id: string): Promise<Result<User, AppError>>
  save(user: User): Promise<Result<void, AppError>>
}
