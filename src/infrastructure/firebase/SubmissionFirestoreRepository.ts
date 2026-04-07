import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { Result } from '@core/Result'
import { ok, err } from '@core/Result'
import { AppError } from '@core/AppError'
import type { Submission } from '@domain/entities/Submission'
import type { ISubmissionRepository } from '@domain/repositories/ISubmissionRepository'
import { SubmissionMapper } from '@infrastructure/mappers/SubmissionMapper'

export class SubmissionFirestoreRepository implements ISubmissionRepository {
  readonly #collectionName = 'submissions'
  readonly #db: Firestore

  constructor(db: Firestore) {
    this.#db = db
  }

  async findByUserAndChallenge(
    userId: string,
    challengeId: string,
  ): Promise<Result<Submission | null, AppError>> {
    try {
      const q = query(
        collection(this.#db, this.#collectionName),
        where('userId', '==', userId),
        where('challengeId', '==', challengeId),
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return ok(null)
      }

      const docSnap = snapshot.docs[0]
      return ok(SubmissionMapper.toDomain(docSnap.data(), docSnap.id))
    } catch (error) {
      return err(AppError.unknown('Failed to fetch submission by user and challenge', error))
    }
  }

  async findByChallengeId(challengeId: string): Promise<Result<Submission[], AppError>> {
    try {
      const q = query(
        collection(this.#db, this.#collectionName),
        where('challengeId', '==', challengeId),
      )
      const snapshot = await getDocs(q)

      const submissions = snapshot.docs.map((docSnap) =>
        SubmissionMapper.toDomain(docSnap.data(), docSnap.id),
      )

      return ok(submissions)
    } catch (error) {
      return err(AppError.unknown('Failed to fetch submissions by challenge id', error))
    }
  }

  async save(submission: Submission): Promise<Result<void, AppError>> {
    try {
      const docRef = doc(this.#db, this.#collectionName, submission.id)
      await setDoc(docRef, SubmissionMapper.toFirestore(submission))
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to save submission', error))
    }
  }
}
