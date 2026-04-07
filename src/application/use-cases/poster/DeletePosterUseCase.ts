import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { IPosterRepository } from '@domain/repositories/IPosterRepository'
import type { IPosterVersionRepository } from '@domain/repositories/IPosterVersionRepository'
import type { IStorageService } from '@domain/services/IStorageService'

export class DeletePosterUseCase {
  readonly #posterRepo: IPosterRepository
  readonly #versionRepo: IPosterVersionRepository
  readonly #storageService: IStorageService

  constructor(
    posterRepo: IPosterRepository,
    versionRepo: IPosterVersionRepository,
    storageService: IStorageService,
  ) {
    this.#posterRepo = posterRepo
    this.#versionRepo = versionRepo
    this.#storageService = storageService
  }

  async execute(input: {
    posterId: string
  }): Promise<Result<void, AppError>> {
    const versionsResult = await this.#versionRepo.findByPosterId(input.posterId)
    if (!versionsResult.ok) return versionsResult

    for (const version of versionsResult.value) {
      const deleteStorageResult = await this.#storageService.delete(
        version.storagePath,
      )
      if (!deleteStorageResult.ok) return deleteStorageResult

      const deleteVersionResult = await this.#versionRepo.delete(version.id)
      if (!deleteVersionResult.ok) return deleteVersionResult
    }

    const deletePosterResult = await this.#posterRepo.delete(input.posterId)
    if (!deletePosterResult.ok) return deletePosterResult

    return ok(undefined)
  }
}
