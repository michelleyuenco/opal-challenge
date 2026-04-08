import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Media } from '@domain/entities/Media'
import type { MediaKind } from '@domain/value-objects/MediaKind'
import type { IMediaRepository } from '@domain/repositories/IMediaRepository'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'
import type { IStorageService } from '@domain/services/IStorageService'

export class UploadMediaUseCase {
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

  async execute(input: {
    opalId: string
    file: File
    uploadedBy: string
    sourceUrl?: string | null
    tool?: string | null
  }): Promise<Result<Media, AppError>> {
    const opalResult = await this.#opalRepo.findById(input.opalId)
    if (!opalResult.ok) return opalResult

    const opal = opalResult.value

    const kind: MediaKind = input.file.type.startsWith('video/')
      ? 'video'
      : 'image'
    const folder = kind === 'video' ? 'videos' : 'images'
    const ext = input.file.name.split('.').pop() ?? ''
    const mediaId = crypto.randomUUID()
    const storagePath = `opals/${input.opalId}/${folder}/${mediaId}.${ext}`

    const uploadResult = await this.#storageService.upload(
      storagePath,
      input.file,
    )
    if (!uploadResult.ok) return uploadResult

    const media: Media = {
      id: mediaId,
      opalId: input.opalId,
      kind,
      storagePath,
      mimeType: input.file.type,
      sizeBytes: input.file.size,
      durationSeconds: null,
      displayOrder: opal.mediaIds.length,
      uploadedAt: Date.now(),
      uploadedBy: input.uploadedBy,
      sourceUrl: input.sourceUrl?.trim() || null,
      tool: input.tool?.trim() || null,
    }

    const saveResult = await this.#mediaRepo.save(media)
    if (!saveResult.ok) return saveResult

    const updatedOpal = {
      ...opal,
      mediaIds: [...opal.mediaIds, mediaId],
      updatedAt: Date.now(),
    }

    const opalSaveResult = await this.#opalRepo.save(updatedOpal)
    if (!opalSaveResult.ok) return opalSaveResult

    return ok(media)
  }
}
