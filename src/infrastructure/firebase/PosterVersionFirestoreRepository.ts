import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { Result } from '@core/Result'
import { ok, err } from '@core/Result'
import { AppError } from '@core/AppError'
import type { PosterVersion } from '@domain/entities/PosterVersion'
import type { IPosterVersionRepository } from '@domain/repositories/IPosterVersionRepository'
import { PosterVersionMapper } from '@infrastructure/mappers/PosterVersionMapper'

export class PosterVersionFirestoreRepository implements IPosterVersionRepository {
  readonly #collectionName = 'posterVersions'
  readonly #db: Firestore

  constructor(db: Firestore) {
    this.#db = db
  }

  async findById(id: string): Promise<Result<PosterVersion, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, id)
      const snapshot = await getDoc(docRef)

      if (!snapshot.exists()) {
        return err(AppError.notFound(`Poster version not found: ${id}`))
      }

      return ok(PosterVersionMapper.toDomain(snapshot.data(), snapshot.id))
    } catch (error) {
      return err(AppError.unknown('Failed to fetch poster version by id', error))
    }
  }

  async findByPosterId(posterId: string): Promise<Result<PosterVersion[], AppError>> {
    try {
      const q = query(
        collection(this.#db, this.#collectionName),
        where('posterId', '==', posterId),
        orderBy('createdAt', 'asc'),
      )
      const snapshot = await getDocs(q)

      const versions = snapshot.docs.map((docSnap) =>
        PosterVersionMapper.toDomain(docSnap.data(), docSnap.id),
      )

      return ok(versions)
    } catch (error) {
      return err(AppError.unknown('Failed to fetch poster versions', error))
    }
  }

  async save(version: PosterVersion): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, version.id)
      await setDoc(docRef, PosterVersionMapper.toFirestore(version))
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to save poster version', error))
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, id)
      await deleteDoc(docRef)
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to delete poster version', error))
    }
  }
}
