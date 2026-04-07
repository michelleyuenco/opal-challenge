import { ok, err } from '@core/Result'
import type { Result } from '@core/Result'
import { AppError } from '@core/AppError'
import type { PosterVersion } from '@domain/entities/PosterVersion'
import type { IPosterRepository } from '@domain/repositories/IPosterRepository'
import type { IPosterVersionRepository } from '@domain/repositories/IPosterVersionRepository'
import type { IStorageService } from '@domain/services/IStorageService'

export class UploadPosterVersionUseCase {
  readonly #versionRepo: IPosterVersionRepository
  readonly #posterRepo: IPosterRepository
  readonly #storageService: IStorageService

  constructor(
    versionRepo: IPosterVersionRepository,
    posterRepo: IPosterRepository,
    storageService: IStorageService,
  ) {
    this.#versionRepo = versionRepo
    this.#posterRepo = posterRepo
    this.#storageService = storageService
  }

  async execute(input: {
    posterId: string
    parentVersionId: string | null
    file: File
    label: string
    notes: string
    userId: string
  }): Promise<Result<PosterVersion, AppError>> {
    const posterResult = await this.#posterRepo.findById(input.posterId)
    if (!posterResult.ok) return posterResult

    const poster = posterResult.value

    const isOwner = poster.userId === input.userId
    if (!isOwner && !poster.isShared) {
      return err(AppError.unauthorized('This journey is private'))
    }
    // Non-owner contributors must build on an existing version (no replacing the root)
    if (!isOwner && input.parentVersionId === null) {
      return err(AppError.unauthorized('Only the creator can post the original'))
    }

    if (input.parentVersionId !== null) {
      const parentResult = await this.#versionRepo.findById(input.parentVersionId)
      if (!parentResult.ok) return parentResult
    }

    let versionNumber: number
    if (input.parentVersionId === null) {
      versionNumber = 1
    } else {
      const allVersionsResult = await this.#versionRepo.findByPosterId(
        input.posterId,
      )
      if (!allVersionsResult.ok) return allVersionsResult

      const siblings = allVersionsResult.value.filter(
        (v) => v.parentVersionId === input.parentVersionId,
      )
      const maxVersion = siblings.reduce(
        (max, v) => Math.max(max, v.versionNumber),
        0,
      )
      versionNumber = maxVersion + 1
    }

    const versionId = crypto.randomUUID()
    const ext = input.file.name.split('.').pop() ?? ''
    const storagePath = `posters/${input.posterId}/versions/${versionId}.${ext}`

    const uploadResult = await this.#storageService.upload(
      storagePath,
      input.file,
    )
    if (!uploadResult.ok) return uploadResult

    const version: PosterVersion = {
      id: versionId,
      posterId: input.posterId,
      parentVersionId: input.parentVersionId,
      storagePath,
      thumbnailPath: null,
      label: input.label,
      notes: input.notes,
      versionNumber,
      createdAt: Date.now(),
    }

    const saveResult = await this.#versionRepo.save(version)
    if (!saveResult.ok) return saveResult

    // Only the owner can re-save the parent poster doc (firestore rules restrict updates)
    if (isOwner) {
      const updatedPoster = {
        ...poster,
        rootVersionId:
          input.parentVersionId === null ? versionId : poster.rootVersionId,
        updatedAt: Date.now(),
      }

      const posterSaveResult = await this.#posterRepo.save(updatedPoster)
      if (!posterSaveResult.ok) return posterSaveResult
    }

    return ok(version)
  }
}
