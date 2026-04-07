import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { IPosterVersionRepository } from '@domain/repositories/IPosterVersionRepository'
import type { IStorageService } from '@domain/services/IStorageService'

export class DeletePosterVersionUseCase {
  readonly #versionRepo: IPosterVersionRepository
  readonly #storageService: IStorageService

  constructor(
    versionRepo: IPosterVersionRepository,
    storageService: IStorageService,
  ) {
    this.#versionRepo = versionRepo
    this.#storageService = storageService
  }

  async execute(input: {
    versionId: string
  }): Promise<Result<void, AppError>> {
    const versionResult = await this.#versionRepo.findById(input.versionId)
    if (!versionResult.ok) return versionResult

    const version = versionResult.value

    const deleteStorageResult = await this.#storageService.delete(
      version.storagePath,
    )
    if (!deleteStorageResult.ok) return deleteStorageResult

    const deleteVersionResult = await this.#versionRepo.delete(version.id)
    if (!deleteVersionResult.ok) return deleteVersionResult

    return ok(undefined)
  }
}
