import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import type { FirebaseStorage } from 'firebase/storage'
import type { Result } from '@core/Result'
import { ok, err } from '@core/Result'
import { AppError } from '@core/AppError'
import type { IStorageService } from '@domain/services/IStorageService'

export class FirebaseStorageService implements IStorageService {
  readonly #storage: FirebaseStorage

  constructor(storage: FirebaseStorage) {
    this.#storage = storage
  }

  upload(
    path: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<Result<string, AppError>> {
    return new Promise((resolve) => {
      try {
        const storageRef = ref(this.#storage, path)
        const uploadTask = uploadBytesResumable(storageRef, file)

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (onProgress) {
              const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              onProgress(percent)
            }
          },
          (error) => {
            resolve(err(AppError.storage('Failed to upload file', error)))
          },
          () => {
            resolve(ok(path))
          },
        )
      } catch (error) {
        resolve(err(AppError.storage('Failed to initiate upload', error)))
      }
    })
  }

  async getDownloadUrl(storagePath: string): Promise<Result<string, AppError>> {
    try {
      const storageRef = ref(this.#storage, storagePath)
      const url = await getDownloadURL(storageRef)
      return ok(url)
    } catch (error) {
      return err(AppError.storage('Failed to get download URL', error))
    }
  }

  async delete(storagePath: string): Promise<Result<void, AppError>> {
    try {
      const storageRef = ref(this.#storage, storagePath)
      await deleteObject(storageRef)
      return ok(undefined)
    } catch (error) {
      return err(AppError.storage('Failed to delete file', error))
    }
  }
}
