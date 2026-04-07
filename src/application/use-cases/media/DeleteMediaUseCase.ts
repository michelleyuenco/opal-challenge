import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { IMediaRepository } from '@domain/repositories/IMediaRepository'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'
import type { IStorageService } from '@domain/services/IStorageService'

export class DeleteMediaUseCase {
  readonly #mediaRepo: IMediaRepository
  readonly #opalRepo: IOpalRepository
  readonly #storageService: IStorageService

  constructor(
    mediaRepo: IMediaRepository,
    opalRepo: IOpalRepository,
    storageService: IStorageService,
  ) {
    this.#mediaRepo = mediaRepo
    this.#opalRepo = opalRepo
    this.#storageService = storageService
  }

  async execute(input: { mediaId: string }): Promise<Result<void, AppError>> {
    const mediaResult = await this.#mediaRepo.findById(input.mediaId)
    if (!mediaResult.ok) return mediaResult

    const media = mediaResult.value

    const deleteStorageResult = await this.#storageService.delete(
      media.storagePath,
    )
    if (!deleteStorageResult.ok) return deleteStorageResult

    const deleteMediaResult = await this.#mediaRepo.delete(media.id)
    if (!deleteMediaResult.ok) return deleteMediaResult

    const opalResult = await this.#opalRepo.findById(media.opalId)
    if (!opalResult.ok) return opalResult

    const opal = opalResult.value
    const updatedOpal = {
      ...opal,
      mediaIds: opal.mediaIds.filter((id) => id !== media.id),
      updatedAt: Date.now(),
    }

    return this.#opalRepo.save(updatedOpal)
  }
}
