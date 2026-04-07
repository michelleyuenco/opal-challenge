import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Opal } from '@domain/entities/Opal'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'

export class GetOpalUseCase {
  readonly #opalRepo: IOpalRepository

  constructor(opalRepo: IOpalRepository) {
    this.#opalRepo = opalRepo
  }

  async execute(input: {
    idOrSlug: string
  }): Promise<Result<Opal, AppError>> {
    const byId = await this.#opalRepo.findById(input.idOrSlug)
    if (byId.ok) return byId

    return this.#opalRepo.findBySlug(input.idOrSlug)
  }
}
