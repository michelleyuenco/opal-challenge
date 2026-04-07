import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { Result } from '@core/Result'
import { ok, err } from '@core/Result'
import { AppError } from '@core/AppError'
import type { User } from '@domain/entities/User'
import type { IUserRepository } from '@domain/repositories/IUserRepository'
import { UserMapper } from '@infrastructure/mappers/UserMapper'

export class UserFirestoreRepository implements IUserRepository {
  readonly #collectionName = 'users'
  readonly #db: Firestore

  constructor(db: Firestore) {
    this.#db = db
  }

  async findById(id: string): Promise<Result<User, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, id)
      const snapshot = await getDoc(docRef)

      if (!snapshot.exists()) {
        return err(AppError.notFound(`User not found: ${id}`))
      }

      return ok(UserMapper.toDomain(snapshot.data(), snapshot.id))
    } catch (error) {
      return err(AppError.unknown('Failed to fetch user by id', error))
    }
  }

  async save(user: User): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, user.id)
      await setDoc(docRef, UserMapper.toFirestore(user))
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to save user', error))
    }
  }
}
