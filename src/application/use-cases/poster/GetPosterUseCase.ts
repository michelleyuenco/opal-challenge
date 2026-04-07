import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Poster } from '@domain/entities/Poster'
import type { IPosterRepository } from '@domain/repositories/IPosterRepository'

export class GetPosterUseCase {
  readonly #posterRepo: IPosterRepository

  constructor(posterRepo: IPosterRepository) {
    this.#posterRepo = posterRepo
  }

  async execute(input: {
    posterId: string
  }): Promise<Result<Poster, AppError>> {
    return this.#posterRepo.findById(input.posterId)
  }
}
