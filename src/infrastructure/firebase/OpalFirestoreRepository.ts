import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { Result } from '@core/Result'
import { ok, err } from '@core/Result'
import { AppError } from '@core/AppError'
import type { Opal } from '@domain/entities/Opal'
import type { IOpalRepository } from '@domain/repositories/IOpalRepository'
import { OpalMapper } from '@infrastructure/mappers/OpalMapper'

export class OpalFirestoreRepository implements IOpalRepository {
  readonly #collectionName = 'opals'
  readonly #db: Firestore

  constructor(db: Firestore) {
    this.#db = db
  }

  async findById(id: string): Promise<Result<Opal, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, id)
      const snapshot = await getDoc(docRef)

      if (!snapshot.exists()) {
        return err(AppError.notFound(`Opal not found: ${id}`))
      }

      return ok(OpalMapper.toDomain(snapshot.data(), snapshot.id))
    } catch (error) {
      return err(AppError.unknown('Failed to fetch opal by id', error))
    }
  }

  async findBySlug(slug: string): Promise<Result<Opal, AppError>> {
    try {
      const q = query(
        collection(this.#db, this.#collectionName),
        where('slug', '==', slug),
        where('isDeleted', '==', false),
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return err(AppError.notFound(`Opal not found with slug: ${slug}`))
      }

      const docSnap = snapshot.docs[0]
      return ok(OpalMapper.toDomain(docSnap.data(), docSnap.id))
    } catch (error) {
      return err(AppError.unknown('Failed to fetch opal by slug', error))
    }
  }

  async findAll(opts?: { includeDeleted?: boolean }): Promise<Result<Opal[], AppError>> {
    try {
      const q = opts?.includeDeleted
        ? query(collection(this.#db, this.#collectionName), orderBy('createdAt', 'desc'))
        : query(
            collection(this.#db, this.#collectionName),
            where('isDeleted', '==', false),
            orderBy('createdAt', 'desc'),
          )
      const snapshot = await getDocs(q)

      const opals = snapshot.docs.map((docSnap) =>
        OpalMapper.toDomain(docSnap.data(), docSnap.id),
      )

      return ok(opals)
    } catch (error) {
      return err(AppError.unknown('Failed to fetch opals', error))
    }
  }

  async save(opal: Opal): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, opal.id)
      await setDoc(docRef, OpalMapper.toFirestore(opal))
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to save opal', error))
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, id)
      await updateDoc(docRef, { isDeleted: true })
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to delete opal', error))
    }
  }
}
