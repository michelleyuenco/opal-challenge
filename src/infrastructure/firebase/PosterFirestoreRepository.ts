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
import type { Poster } from '@domain/entities/Poster'
import type { IPosterRepository } from '@domain/repositories/IPosterRepository'
import { PosterMapper } from '@infrastructure/mappers/PosterMapper'

export class PosterFirestoreRepository implements IPosterRepository {
  readonly #collectionName = 'posters'
  readonly #db: Firestore

  constructor(db: Firestore) {
    this.#db = db
  }

  async findById(id: string): Promise<Result<Poster, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, id)
      const snapshot = await getDoc(docRef)

      if (!snapshot.exists()) {
        return err(AppError.notFound(`Poster not found: ${id}`))
      }

      return ok(PosterMapper.toDomain(snapshot.data(), snapshot.id))
    } catch (error) {
      return err(AppError.unknown('Failed to fetch poster by id', error))
    }
  }

  async findByUserId(userId: string): Promise<Result<Poster[], AppError>> {
    try {
      const q = query(
        collection(this.#db, this.#collectionName),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
      )
      const snapshot = await getDocs(q)

      const posters = snapshot.docs.map((docSnap) =>
        PosterMapper.toDomain(docSnap.data(), docSnap.id),
      )

      return ok(posters)
    } catch (error) {
      return err(AppError.unknown('Failed to fetch posters by user', error))
    }
  }

  async findShared(): Promise<Result<Poster[], AppError>> {
    try {
      const q = query(
        collection(this.#db, this.#collectionName),
        where('isShared', '==', true),
        orderBy('updatedAt', 'desc'),
      )
      const snapshot = await getDocs(q)

      const posters = snapshot.docs.map((docSnap) =>
        PosterMapper.toDomain(docSnap.data(), docSnap.id),
      )

      return ok(posters)
    } catch (error) {
      return err(AppError.unknown('Failed to fetch shared posters', error))
    }
  }

  async save(poster: Poster): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, poster.id)
      await setDoc(docRef, PosterMapper.toFirestore(poster))
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to save poster', error))
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, id)
      await deleteDoc(docRef)
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to delete poster', error))
    }
  }
}
