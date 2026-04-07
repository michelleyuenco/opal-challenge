import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Opal } from '@domain/entities/Opal'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'

export class ListOpalsUseCase {
  readonly #opalRepo: IOpalRepository

  constructor(opalRepo: IOpalRepository) {
    this.#opalRepo = opalRepo
  }

  async execute(): Promise<Result<Opal[], AppError>> {
    return this.#opalRepo.findAll()
  }
}
