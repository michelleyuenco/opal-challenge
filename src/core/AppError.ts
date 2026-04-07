export type AppErrorCode =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'STORAGE'
  | 'UNKNOWN'

export class AppError extends Error {
  readonly code: AppErrorCode
  override readonly cause?: unknown

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.cause = cause
  }

  static notFound(message: string): AppError {
    return new AppError('NOT_FOUND', message)
  }

  static unauthorized(message: string): AppError {
    return new AppError('UNAUTHORIZED', message)
  }

  static forbidden(message: string): AppError {
    return new AppError('FORBIDDEN', message)
  }

  static validation(message: string): AppError {
    return new AppError('VALIDATION', message)
  }

  static conflict(message: string): AppError {
    return new AppError('CONFLICT', message)
  }

  static storage(message: string, cause?: unknown): AppError {
    return new AppError('STORAGE', message, cause)
  }

  static unknown(message: string, cause?: unknown): AppError {
    return new AppError('UNKNOWN', message, cause)
  }
}
