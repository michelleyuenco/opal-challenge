import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { User } from '@domain/entities/User'
import type { IAuthService } from '@domain/services/IAuthService'

export class SignInUseCase {
  readonly #authService: IAuthService

  constructor(authService: IAuthService) {
    this.#authService = authService
  }

  async execute(input: {
    email: string
    password: string
  }): Promise<Result<User, AppError>> {
    return this.#authService.signIn(input.email, input.password)
  }
}
