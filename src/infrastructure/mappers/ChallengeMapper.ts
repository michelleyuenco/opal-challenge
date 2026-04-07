import type { DocumentData } from 'firebase/firestore'
import type { Challenge } from '@domain/entities/Challenge'

export const ChallengeMapper = {
  toDomain(doc: DocumentData, id: string): Challenge {
    return {
      id,
      status: doc.status,
      title: doc.title,
      description: doc.description,
      revealOpalId: doc.revealOpalId ?? null,
      revealMediaId: doc.revealMediaId ?? null,
      activatedAt: doc.activatedAt ?? null,
      concludedAt: doc.concludedAt ?? null,
      createdAt: doc.createdAt,
    }
  },

  toFirestore(entity: Challenge): Record<string, unknown> {
    return {
      status: entity.status,
      title: entity.title,
      description: entity.description,
      revealOpalId: entity.revealOpalId,
      revealMediaId: entity.revealMediaId,
      activatedAt: entity.activatedAt,
      concludedAt: entity.concludedAt,
      createdAt: entity.createdAt,
    }
  },
}
