import { ok } from '@core/Result'
import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Opal } from '@domain/entities/Opal'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'

export class UpdateOpalUseCase {
  readonly #opalRepo: IOpalRepository

  constructor(opalRepo: IOpalRepository) {
    this.#opalRepo = opalRepo
  }

  async execute(input: {
    id: string
    title?: string
    description?: string
  }): Promise<Result<Opal, AppError>> {
    const findResult = await this.#opalRepo.findById(input.id)
    if (!findResult.ok) return findResult

    const existing = findResult.value

    const updated: Opal = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      updatedAt: Date.now(),
    }

    const saveResult = await this.#opalRepo.save(updated)
    if (!saveResult.ok) return saveResult

    return ok(updated)
  }
}
