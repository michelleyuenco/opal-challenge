import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { IMediaRepository } from '@domain/repositories/IMediaRepository'
import type { IStorageService } from '@domain/services/IStorageService'
import type { MediaDto } from '@application/dtos/MediaDto'

export class GetMediaForOpalUseCase {
  readonly #mediaRepo: IMediaRepository
  readonly #storageService: IStorageService

  constructor(mediaRepo: IMediaRepository, storageService: IStorageService) {
    this.#mediaRepo = mediaRepo
    this.#storageService = storageService
  }

  async execute(input: {
    opalId: string
  }): Promise<Result<MediaDto[], AppError>> {
    const mediaResult = await this.#mediaRepo.findByOpalId(input.opalId)
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

    return ok(mediaDtos)
  }
}
