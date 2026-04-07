import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Poster } from '@domain/entities/Poster'
import type { IPosterRepository } from '@domain/repositories/IPosterRepository'

export class UpdatePosterUseCase {
  readonly #posterRepo: IPosterRepository

  constructor(posterRepo: IPosterRepository) {
    this.#posterRepo = posterRepo
  }

  async execute(input: {
    posterId: string
    title?: string
    description?: string
  }): Promise<Result<Poster, AppError>> {
    const posterResult = await this.#posterRepo.findById(input.posterId)
    if (!posterResult.ok) return posterResult

    const existing = posterResult.value
    const updated: Poster = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      updatedAt: Date.now(),
    }

    const saveResult = await this.#posterRepo.save(updated)
    if (!saveResult.ok) return saveResult

    return ok(updated)
  }
}
