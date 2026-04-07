import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Poster } from '@domain/entities/Poster'

export interface IPosterRepository {
  findById(id: string): Promise<Result<Poster, AppError>>
  findByUserId(userId: string): Promise<Result<Poster[], AppError>>
  findShared(): Promise<Result<Poster[], AppError>>
  save(poster: Poster): Promise<Result<void, AppError>>
  delete(id: string): Promise<Result<void, AppError>>
}
