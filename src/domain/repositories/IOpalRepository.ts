import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Opal } from '@domain/entities/Opal'

export interface IOpalRepository {
  findById(id: string): Promise<Result<Opal, AppError>>
  findBySlug(slug: string): Promise<Result<Opal, AppError>>
  findAll(opts?: { includeDeleted?: boolean }): Promise<Result<Opal[], AppError>>
  save(opal: Opal): Promise<Result<void, AppError>>
  delete(id: string): Promise<Result<void, AppError>>
}
