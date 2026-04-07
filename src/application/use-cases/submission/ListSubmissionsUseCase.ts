import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Submission } from '@domain/entities/Submission'
import type { ISubmissionRepository } from '@domain/repositories/ISubmissionRepository'

export class ListSubmissionsUseCase {
  readonly #submissionRepo: ISubmissionRepository

  constructor(submissionRepo: ISubmissionRepository) {
    this.#submissionRepo = submissionRepo
  }

  async execute(input: {
    challengeId: string
  }): Promise<Result<Submission[], AppError>> {
    return this.#submissionRepo.findByChallengeId(input.challengeId)
  }
}
