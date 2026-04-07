import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { IAuthService } from '@domain/services/IAuthService'

export class SendPasswordResetUseCase {
  readonly #authService: IAuthService

  constructor(authService: IAuthService) {
    this.#authService = authService
  }

  async execute(input: { email: string }): Promise<Result<void, AppError>> {
    return this.#authService.sendPasswordReset(input.email)
  }
}
