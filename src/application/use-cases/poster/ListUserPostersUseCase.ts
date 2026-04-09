import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { PosterDto } from '@application/dtos/PosterDto'
import type { IPosterRepository } from '@domain/repositories/IPosterRepository'
import type { IPosterVersionRepository } from '@domain/repositories/IPosterVersionRepository'
import type { IStorageService } from '@domain/services/IStorageService'

export class ListUserPostersUseCase {
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
    userId: string
  }): Promise<Result<PosterDto[], AppError>> {
    const postersResult = await this.#posterRepo.findByUserId(input.userId)
    if (!postersResult.ok) return postersResult

    const dtos: PosterDto[] = []

    for (const poster of postersResult.value) {
      const versionsResult = await this.#versionRepo.findByPosterId(poster.id)
      const versions = versionsResult.ok ? versionsResult.value : []

      // Pick a representative version: explicit root, otherwise the most recent
      const sorted = [...versions].sort((a, b) => b.createdAt - a.createdAt)
      const representative =
        versions.find((v) => v.id === poster.rootVersionId) ?? sorted[0]

      let thumbnailUrl: string | null = null
      if (representative) {
        const path = representative.thumbnailPath ?? representative.storagePath
        const urlResult = await this.#storageService.getDownloadUrl(path)
        if (urlResult.ok) {
          thumbnailUrl = urlResult.value
        }
      }

      dtos.push({
        id: poster.id,
        userId: poster.userId,
        title: poster.title,
        description: poster.description,
        isShared: poster.isShared,
        rootVersionId: poster.rootVersionId,
        thumbnailUrl,
        versionCount: versions.length,
        createdAt: poster.createdAt,
        updatedAt: poster.updatedAt,
      })
    }

    return ok(dtos)
  }
}
