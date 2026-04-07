import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { PosterVersion } from '@domain/entities/PosterVersion'

export interface IPosterVersionRepository {
  findById(id: string): Promise<Result<PosterVersion, AppError>>
  findByPosterId(posterId: string): Promise<Result<PosterVersion[], AppError>>
  save(version: PosterVersion): Promise<Result<void, AppError>>
  delete(id: string): Promise<Result<void, AppError>>
}
