import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { Result } from '@core/Result'
import { ok, err } from '@core/Result'
import { AppError } from '@core/AppError'
import type { Challenge } from '@domain/entities/Challenge'
import type { IChallengeRepository } from '@domain/repositories/IChallengeRepository'
import { ChallengeMapper } from '@infrastructure/mappers/ChallengeMapper'

export class ChallengeFirestoreRepository implements IChallengeRepository {
  readonly #collectionName = 'challenges'
  readonly #db: Firestore

  constructor(db: Firestore) {
    this.#db = db
  }

  async findActive(): Promise<Result<Challenge | null, AppError>> {
    try {
      const q = query(
        collection(this.#db, this.#collectionName),
        where('status', '==', 'active'),
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return ok(null)
      }

      const docSnap = snapshot.docs[0]
      return ok(ChallengeMapper.toDomain(docSnap.data(), docSnap.id))
    } catch (error) {
      return err(AppError.unknown('Failed to fetch active challenge', error))
    }
  }

  async findById(id: string): Promise<Result<Challenge, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, id)
      const snapshot = await getDoc(docRef)

      if (!snapshot.exists()) {
        return err(AppError.notFound(`Challenge not found: ${id}`))
      }

      return ok(ChallengeMapper.toDomain(snapshot.data(), snapshot.id))
    } catch (error) {
      return err(AppError.unknown('Failed to fetch challenge by id', error))
    }
  }

  async findAll(): Promise<Result<Challenge[], AppError>> {
    try {
      const snapshot = await getDocs(collection(this.#db, this.#collectionName))

      const challenges = snapshot.docs.map((docSnap) =>
        ChallengeMapper.toDomain(docSnap.data(), docSnap.id),
      )

      return ok(challenges)
    } catch (error) {
      return err(AppError.unknown('Failed to fetch challenges', error))
    }
  }

  async save(challenge: Challenge): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, challenge.id)
      await setDoc(docRef, ChallengeMapper.toFirestore(challenge))
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to save challenge', error))
    }
  }
}
