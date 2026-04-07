import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Challenge } from '@domain/entities/Challenge'
import type { IChallengeRepository } from '@domain/repositories/IChallengeRepository'

export class CreateChallengeUseCase {
  readonly #challengeRepo: IChallengeRepository

  constructor(challengeRepo: IChallengeRepository) {
    this.#challengeRepo = challengeRepo
  }

  async execute(input: {
    title: string
    description: string
  }): Promise<Result<Challenge, AppError>> {
    const challenge: Challenge = {
      id: crypto.randomUUID(),
      status: 'draft',
      title: input.title,
      description: input.description,
      revealOpalId: null,
      revealMediaId: null,
      activatedAt: null,
      concludedAt: null,
      createdAt: Date.now(),
    }

    const saveResult = await this.#challengeRepo.save(challenge)
    if (!saveResult.ok) return saveResult

    return ok(challenge)
  }
}
