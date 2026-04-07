import type { DocumentData } from 'firebase/firestore'
import type { Submission } from '@domain/entities/Submission'

export const SubmissionMapper = {
  toDomain(doc: DocumentData, id: string): Submission {
    return {
      id,
      challengeId: doc.challengeId,
      userId: doc.userId,
      guessedOpalId: doc.guessedOpalId,
      submittedAt: doc.submittedAt,
      isCorrect: doc.isCorrect ?? null,
    }
  },

  toFirestore(entity: Submission): Record<string, unknown> {
    return {
      challengeId: entity.challengeId,
      userId: entity.userId,
      guessedOpalId: entity.guessedOpalId,
      submittedAt: entity.submittedAt,
      isCorrect: entity.isCorrect,
    }
  },
}
