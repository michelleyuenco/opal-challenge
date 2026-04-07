import { ok, err } from '@core/Result'
import type { Result } from '@core/Result'
import { AppError } from '@core/AppError'
import type { Challenge } from '@domain/entities/Challenge'
import { canActivate } from '@domain/entities/Challenge'
import type { IChallengeRepository } from '@domain/repositories/IChallengeRepository'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'

export class ActivateChallengeUseCase {
  readonly #challengeRepo: IChallengeRepository
  readonly #opalRepo: IOpalRepository

  constructor(
    challengeRepo: IChallengeRepository,
    opalRepo: IOpalRepository,
  ) {
    this.#challengeRepo = challengeRepo
    this.#opalRepo = opalRepo
  }

  async execute(input: {
    challengeId: string
  }): Promise<Result<Challenge, AppError>> {
    const challengeResult = await this.#challengeRepo.findById(
      input.challengeId,
    )
    if (!challengeResult.ok) return challengeResult

    const challenge = challengeResult.value

    if (!canActivate(challenge)) {
      return err(
        AppError.validation('Challenge must be in draft status to activate'),
      )
    }

    const opalsResult = await this.#opalRepo.findAll()
    if (!opalsResult.ok) return opalsResult

    if (opalsResult.value.length === 0) {
      return err(
        AppError.validation(
          'At least one opal must exist before activating a challenge',
        ),
      )
    }

    const activated: Challenge = {
      ...challenge,
      status: 'active',
      activatedAt: Date.now(),
    }

    const saveResult = await this.#challengeRepo.save(activated)
    if (!saveResult.ok) return saveResult

    return ok(activated)
  }
}
