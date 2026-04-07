import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { IAuthService } from '@domain/services/IAuthService'

export class SignOutUseCase {
  readonly #authService: IAuthService

  constructor(authService: IAuthService) {
    this.#authService = authService
  }

  async execute(): Promise<Result<void, AppError>> {
    return this.#authService.signOut()
  }
}
