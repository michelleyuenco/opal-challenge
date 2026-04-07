import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'

export interface IStorageService {
  upload(
    path: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<Result<string, AppError>>
  getDownloadUrl(storagePath: string): Promise<Result<string, AppError>>
  delete(storagePath: string): Promise<Result<void, AppError>>
}
