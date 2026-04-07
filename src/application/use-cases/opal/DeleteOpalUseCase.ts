import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'

export class DeleteOpalUseCase {
  readonly #opalRepo: IOpalRepository

  constructor(opalRepo: IOpalRepository) {
    this.#opalRepo = opalRepo
  }

  async execute(input: { id: string }): Promise<Result<void, AppError>> {
    return this.#opalRepo.delete(input.id)
  }
}
