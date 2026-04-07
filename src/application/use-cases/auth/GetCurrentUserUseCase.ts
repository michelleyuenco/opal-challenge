import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { User } from '@domain/entities/User'
import type { IAuthService } from '@domain/services/IAuthService'

export class GetCurrentUserUseCase {
  readonly #authService: IAuthService

  constructor(authService: IAuthService) {
    this.#authService = authService
  }

  async execute(): Promise<Result<User | null, AppError>> {
    return this.#authService.getCurrentUser()
  }
}
