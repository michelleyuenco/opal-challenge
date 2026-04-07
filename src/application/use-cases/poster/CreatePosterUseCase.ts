import { ok, err } from '@core/Result'
import type { Result } from '@core/Result'
import { AppError } from '@core/AppError'
import type { Poster } from '@domain/entities/Poster'
import type { IPosterRepository } from '@domain/repositories/IPosterRepository'

export class CreatePosterUseCase {
  readonly #posterRepo: IPosterRepository

  constructor(posterRepo: IPosterRepository) {
    this.#posterRepo = posterRepo
  }

  async execute(input: {
    userId: string
    title: string
    description: string
  }): Promise<Result<Poster, AppError>> {
    if (!input.title.trim()) {
      return err(AppError.validation('Title must not be empty'))
    }

    const now = Date.now()
    const poster: Poster = {
      id: crypto.randomUUID(),
      userId: input.userId,
      title: input.title,
      description: input.description,
      isShared: false,
      rootVersionId: null,
      createdAt: now,
      updatedAt: now,
    }

    const saveResult = await this.#posterRepo.save(poster)
    if (!saveResult.ok) return saveResult

    return ok(poster)
  }
}
