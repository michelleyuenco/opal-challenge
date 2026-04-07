import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Challenge } from '@domain/entities/Challenge'
import type { IChallengeRepository } from '@domain/repositories/IChallengeRepository'

export class GetActiveChallengeUseCase {
  readonly #challengeRepo: IChallengeRepository

  constructor(challengeRepo: IChallengeRepository) {
    this.#challengeRepo = challengeRepo
  }

  async execute(): Promise<Result<Challenge | null, AppError>> {
    return this.#challengeRepo.findActive()
  }
}
