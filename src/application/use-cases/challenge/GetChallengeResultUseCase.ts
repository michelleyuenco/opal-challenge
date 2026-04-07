import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { IChallengeRepository } from '@domain/repositories/IChallengeRepository'
import type { IStorageService } from '@domain/services/IStorageService'
import type { ChallengeDto } from '@application/dtos/ChallengeDto'

export class GetChallengeResultUseCase {
  readonly #challengeRepo: IChallengeRepository
  readonly #storageService: IStorageService

  constructor(
    challengeRepo: IChallengeRepository,
    storageService: IStorageService,
  ) {
    this.#challengeRepo = challengeRepo
    this.#storageService = storageService
  }

  async execute(input: {
    challengeId: string
  }): Promise<Result<ChallengeDto, AppError>> {
    const challengeResult = await this.#challengeRepo.findById(
      input.challengeId,
    )
    if (!challengeResult.ok) return challengeResult

    const challenge = challengeResult.value
    let revealMediaUrl: string | null = null

    if (
      challenge.status === 'concluded' &&
      challenge.revealMediaId !== null
    ) {
      const storagePath = `challenges/${challenge.id}/reveal/${challenge.revealMediaId}`
      const urlResult =
        await this.#storageService.getDownloadUrl(storagePath)
      if (!urlResult.ok) return urlResult
      revealMediaUrl = urlResult.value
    }

    return ok({
      id: challenge.id,
      status: challenge.status,
      title: challenge.title,
      description: challenge.description,
      revealMediaUrl,
      activatedAt: challenge.activatedAt,
      concludedAt: challenge.concludedAt,
    })
  }
}
