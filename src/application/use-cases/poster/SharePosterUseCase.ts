import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Poster } from '@domain/entities/Poster'
import type { IPosterRepository } from '@domain/repositories/IPosterRepository'

export class SharePosterUseCase {
  readonly #posterRepo: IPosterRepository

  constructor(posterRepo: IPosterRepository) {
    this.#posterRepo = posterRepo
  }

  async execute(input: {
    posterId: string
    isShared: boolean
  }): Promise<Result<Poster, AppError>> {
    const posterResult = await this.#posterRepo.findById(input.posterId)
    if (!posterResult.ok) return posterResult

    const existing = posterResult.value
    const updated: Poster = {
      ...existing,
      isShared: input.isShared,
      updatedAt: Date.now(),
    }

    const saveResult = await this.#posterRepo.save(updated)
    if (!saveResult.ok) return saveResult

    return ok(updated)
  }
}
