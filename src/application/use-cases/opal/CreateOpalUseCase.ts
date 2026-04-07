import { ok, err } from '@core/Result'
import type { Result } from '@core/Result'
import { AppError } from '@core/AppError'
import type { Opal } from '@domain/entities/Opal'
import { createSlug } from '@domain/entities/Opal'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'

export class CreateOpalUseCase {
  readonly #opalRepo: IOpalRepository

  constructor(opalRepo: IOpalRepository) {
    this.#opalRepo = opalRepo
  }

  async execute(input: {
    title: string
    description: string
    createdBy?: string | null
  }): Promise<Result<Opal, AppError>> {
    if (!input.title.trim()) {
      return err(AppError.validation('Title must not be empty'))
    }

    const now = Date.now()
    const opal: Opal = {
      id: crypto.randomUUID(),
      slug: input.createdBy
        ? `${createSlug(input.title)}-${now.toString(36)}`
        : createSlug(input.title),
      title: input.title,
      description: input.description,
      thumbnailUrl: null,
      mediaIds: [],
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      createdBy: input.createdBy ?? null,
    }

    const saveResult = await this.#opalRepo.save(opal)
    if (!saveResult.ok) return saveResult

    return ok(opal)
  }
}
