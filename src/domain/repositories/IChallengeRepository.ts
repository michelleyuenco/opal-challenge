import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Challenge } from '@domain/entities/Challenge'

export interface IChallengeRepository {
  findActive(): Promise<Result<Challenge | null, AppError>>
  findById(id: string): Promise<Result<Challenge, AppError>>
  findAll(): Promise<Result<Challenge[], AppError>>
  save(challenge: Challenge): Promise<Result<void, AppError>>
}
