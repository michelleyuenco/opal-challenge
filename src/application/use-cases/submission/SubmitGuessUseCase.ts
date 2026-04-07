import { ok, err } from '@core/Result'
import type { Result } from '@core/Result'
import { AppError } from '@core/AppError'
import type { Submission } from '@domain/entities/Submission'
import type { ISubmissionRepository } from '@domain/repositories/ISubmissionRepository'
import type { IChallengeRepository } from '@domain/repositories/IChallengeRepository'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'

export class SubmitGuessUseCase {
  readonly #submissionRepo: ISubmissionRepository
  readonly #challengeRepo: IChallengeRepository
  readonly #opalRepo: IOpalRepository

  constructor(
    submissionRepo: ISubmissionRepository,
    challengeRepo: IChallengeRepository,
    opalRepo: IOpalRepository,
  ) {
    this.#submissionRepo = submissionRepo
    this.#challengeRepo = challengeRepo
    this.#opalRepo = opalRepo
  }

  async execute(input: {
    userId: string
    challengeId: string
    guessedOpalId: string
  }): Promise<Result<Submission, AppError>> {
    const challengeResult = await this.#challengeRepo.findById(
      input.challengeId,
    )
    if (!challengeResult.ok) return challengeResult

    if (challengeResult.value.status !== 'active') {
      return err(AppError.validation('Challenge is not active'))
    }

    const opalResult = await this.#opalRepo.findById(input.guessedOpalId)
    if (!opalResult.ok) return opalResult

    const existingResult = await this.#submissionRepo.findByUserAndChallenge(
      input.userId,
      input.challengeId,
    )
    if (!existingResult.ok) return existingResult

    if (existingResult.value !== null) {
      return err(
        AppError.conflict(
          'User has already submitted a guess for this challenge',
        ),
      )
    }

    const submission: Submission = {
      id: crypto.randomUUID(),
      challengeId: input.challengeId,
      userId: input.userId,
      guessedOpalId: input.guessedOpalId,
      submittedAt: Date.now(),
      isCorrect: null,
    }

    const saveResult = await this.#submissionRepo.save(submission)
    if (!saveResult.ok) return saveResult

    return ok(submission)
  }
}
