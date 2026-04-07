import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Media } from '@domain/entities/Media'

export interface IMediaRepository {
  findById(id: string): Promise<Result<Media, AppError>>
  findByOpalId(opalId: string): Promise<Result<Media[], AppError>>
  findAll(): Promise<Result<Media[], AppError>>
  save(media: Media): Promise<Result<void, AppError>>
  delete(id: string): Promise<Result<void, AppError>>
}
