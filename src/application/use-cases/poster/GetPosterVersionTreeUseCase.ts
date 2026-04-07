import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { PosterVersionNode } from '@domain/entities/PosterVersion'
import type { IPosterVersionRepository } from '@domain/repositories/IPosterVersionRepository'
import type { IStorageService } from '@domain/services/IStorageService'

export class GetPosterVersionTreeUseCase {
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
    posterId: string
  }): Promise<Result<PosterVersionNode[], AppError>> {
    const versionsResult = await this.#versionRepo.findByPosterId(input.posterId)
    if (!versionsResult.ok) return versionsResult

    const nodeMap = new Map<string, PosterVersionNode>()

    for (const version of versionsResult.value) {
      const urlResult = await this.#storageService.getDownloadUrl(
        version.storagePath,
      )
      const downloadUrl = urlResult.ok ? urlResult.value : ''

      nodeMap.set(version.id, {
        ...version,
        downloadUrl,
        children: [],
      })
    }

    const roots: PosterVersionNode[] = []

    for (const node of nodeMap.values()) {
      if (node.parentVersionId === null) {
        roots.push(node)
      } else {
        const parent = nodeMap.get(node.parentVersionId)
        if (parent) {
          ;(parent.children as PosterVersionNode[]).push(node)
        } else {
          roots.push(node)
        }
      }
    }

    return ok(roots)
  }
}
