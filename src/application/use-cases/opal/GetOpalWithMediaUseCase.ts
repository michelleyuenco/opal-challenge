import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Opal } from '@domain/entities/Opal'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'
import type { IMediaRepository } from '@domain/repositories/IMediaRepository'
import type { IStorageService } from '@domain/services/IStorageService'
import type { MediaDto } from '@application/dtos/MediaDto'

export class GetOpalWithMediaUseCase {
  readonly #opalRepo: IOpalRepository
  readonly #mediaRepo: IMediaRepository
  readonly #storageService: IStorageService

  constructor(
    opalRepo: IOpalRepository,
    mediaRepo: IMediaRepository,
    storageService: IStorageService,
  ) {
    this.#opalRepo = opalRepo
    this.#mediaRepo = mediaRepo
    this.#storageService = storageService
  }

  async execute(input: {
    idOrSlug: string
  }): Promise<Result<{ opal: Opal; media: MediaDto[] }, AppError>> {
    const byId = await this.#opalRepo.findById(input.idOrSlug)
    const opalResult = byId.ok
      ? byId
      : await this.#opalRepo.findBySlug(input.idOrSlug)
    if (!opalResult.ok) return opalResult

    const opal = opalResult.value

    const mediaResult = await this.#mediaRepo.findByOpalId(opal.id)
    if (!mediaResult.ok) return mediaResult

    const mediaDtos: MediaDto[] = []
    for (const m of mediaResult.value) {
      const urlResult = await this.#storageService.getDownloadUrl(m.storagePath)
      if (!urlResult.ok) return urlResult

      mediaDtos.push({
        id: m.id,
        opalId: m.opalId,
        kind: m.kind,
        downloadUrl: urlResult.value,
        mimeType: m.mimeType,
        sizeBytes: m.sizeBytes,
        durationSeconds: m.durationSeconds,
        displayOrder: m.displayOrder,
      })
    }

    return ok({ opal, media: mediaDtos })
  }
}
