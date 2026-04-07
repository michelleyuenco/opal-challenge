import { ok, err } from '@core/Result'
import type { Result } from '@core/Result'
import { AppError } from '@core/AppError'
import type { Challenge } from '@domain/entities/Challenge'
import { canConclude } from '@domain/entities/Challenge'
import type { IChallengeRepository } from '@domain/repositories/IChallengeRepository'
import type { ISubmissionRepository } from '@domain/repositories/ISubmissionRepository'
import type { IStorageService } from '@domain/services/IStorageService'

export class ConcludeChallengeUseCase {
  readonly #challengeRepo: IChallengeRepository
  readonly #submissionRepo: ISubmissionRepository
  readonly #storageService: IStorageService

  constructor(
    challengeRepo: IChallengeRepository,
    submissionRepo: ISubmissionRepository,
    storageService: IStorageService,
  ) {
    this.#challengeRepo = challengeRepo
    this.#submissionRepo = submissionRepo
    this.#storageService = storageService
  }

  async execute(input: {
    challengeId: string
    revealOpalId: string
    revealMediaFile: File
  }): Promise<Result<Challenge, AppError>> {
    const challengeResult = await this.#challengeRepo.findById(
      input.challengeId,
    )
    if (!challengeResult.ok) return challengeResult

    const challenge = challengeResult.value

    if (!canConclude(challenge)) {
      return err(
        AppError.validation('Challenge must be active to conclude'),
      )
    }

    const ext = input.revealMediaFile.name.split('.').pop() ?? ''
    const revealMediaId = crypto.randomUUID()
    const storagePath = `challenges/${input.challengeId}/reveal/${revealMediaId}.${ext}`

    const uploadResult = await this.#storageService.upload(
      storagePath,
      input.revealMediaFile,
    )
    if (!uploadResult.ok) return uploadResult

    const concluded: Challenge = {
      ...challenge,
      status: 'concluded',
      revealOpalId: input.revealOpalId,
      revealMediaId,
      concludedAt: Date.now(),
    }

    const saveResult = await this.#challengeRepo.save(concluded)
    if (!saveResult.ok) return saveResult

    const submissionsResult = await this.#submissionRepo.findByChallengeId(
      input.challengeId,
    )
    if (!submissionsResult.ok) return submissionsResult

    for (const submission of submissionsResult.value) {
      const updated = {
        ...submission,
        isCorrect: submission.guessedOpalId === input.revealOpalId,
      }
      const updateResult = await this.#submissionRepo.save(updated)
      if (!updateResult.ok) return updateResult
    }

    return ok(concluded)
  }
}
