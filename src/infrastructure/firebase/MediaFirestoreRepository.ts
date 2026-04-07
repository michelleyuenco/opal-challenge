import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { deleteDoc } from 'firebase/firestore'
import type { Result } from '@core/Result'
import { ok, err } from '@core/Result'
import { AppError } from '@core/AppError'
import type { Media } from '@domain/entities/Media'
import type { IMediaRepository } from '@domain/repositories/IMediaRepository'
import { MediaMapper } from '@infrastructure/mappers/MediaMapper'

export class MediaFirestoreRepository implements IMediaRepository {
  readonly #collectionName = 'media'
  readonly #db: Firestore

  constructor(db: Firestore) {
    this.#db = db
  }

  async findById(id: string): Promise<Result<Media, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, id)
      const snapshot = await getDoc(docRef)

      if (!snapshot.exists()) {
        return err(AppError.notFound(`Media not found: ${id}`))
      }

      return ok(MediaMapper.toDomain(snapshot.data(), snapshot.id))
    } catch (error) {
      return err(AppError.unknown('Failed to fetch media by id', error))
    }
  }

  async findByOpalId(opalId: string): Promise<Result<Media[], AppError>> {
    try {
      const q = query(
        collection(this.#db, this.#collectionName),
        where('opalId', '==', opalId),
        orderBy('displayOrder', 'asc'),
      )
      const snapshot = await getDocs(q)

      const media = snapshot.docs.map((docSnap) =>
        MediaMapper.toDomain(docSnap.data(), docSnap.id),
      )

      return ok(media)
    } catch (error) {
      return err(AppError.unknown('Failed to fetch media by opal id', error))
    }
  }

  async findAll(): Promise<Result<Media[], AppError>> {
    try {
      const snapshot = await getDocs(collection(this.#db, this.#collectionName))

      const media = snapshot.docs.map((docSnap) =>
        MediaMapper.toDomain(docSnap.data(), docSnap.id),
      )

      return ok(media)
    } catch (error) {
      return err(AppError.unknown('Failed to fetch all media', error))
    }
  }

  async save(media: Media): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, media.id)
      await setDoc(docRef, MediaMapper.toFirestore(media))
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to save media', error))
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, id)
      await deleteDoc(docRef)
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to delete media', error))
    }
  }
}
