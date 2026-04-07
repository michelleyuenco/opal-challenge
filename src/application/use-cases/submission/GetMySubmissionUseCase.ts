import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Submission } from '@domain/entities/Submission'
import type { ISubmissionRepository } from '@domain/repositories/ISubmissionRepository'

export class GetMySubmissionUseCase {
  readonly #submissionRepo: ISubmissionRepository

  constructor(submissionRepo: ISubmissionRepository) {
    this.#submissionRepo = submissionRepo
  }

  async execute(input: {
    userId: string
    challengeId: string
  }): Promise<Result<Submission | null, AppError>> {
    return this.#submissionRepo.findByUserAndChallenge(
      input.userId,
      input.challengeId,
    )
  }
}
