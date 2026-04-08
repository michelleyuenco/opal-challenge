import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'
import type { IMediaRepository } from '@domain/repositories/IMediaRepository'
import type { IStorageService } from '@domain/services/IStorageService'
import type { OpalDto } from '@application/dtos/OpalDto'
import type { MediaDto } from '@application/dtos/MediaDto'

export class GetDatasetManifestUseCase {
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

  async execute(): Promise<
    Result<Array<{ opal: OpalDto; media: MediaDto[] }>, AppError>
  > {
    const opalsResult = await this.#opalRepo.findAll()
    if (!opalsResult.ok) return opalsResult

    const allMediaResult = await this.#mediaRepo.findAll()
    if (!allMediaResult.ok) return allMediaResult

    const mediaByOpalId = new Map<
      string,
      Array<(typeof allMediaResult.value)[number]>
    >()
    for (const m of allMediaResult.value) {
      const list = mediaByOpalId.get(m.opalId) ?? []
      list.push(m)
      mediaByOpalId.set(m.opalId, list)
    }

    const manifest: Array<{ opal: OpalDto; media: MediaDto[] }> = []

    for (const opal of opalsResult.value) {
      const opalMedia = mediaByOpalId.get(opal.id) ?? []

      const mediaDtos: MediaDto[] = []
      for (const m of opalMedia) {
        const urlResult = await this.#storageService.getDownloadUrl(
          m.storagePath,
        )
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
          sourceUrl: m.sourceUrl,
          tool: m.tool,
        })
      }

      manifest.push({
        opal: {
          id: opal.id,
          slug: opal.slug,
          title: opal.title,
          description: opal.description,
          thumbnailUrl: opal.thumbnailUrl,
          mediaCount: opal.mediaIds.length,
        },
        media: mediaDtos,
      })
    }

    return ok(manifest)
  }
}
