import type { DocumentData } from 'firebase/firestore'
import type { Poster } from '@domain/entities/Poster'

export const PosterMapper = {
  toDomain(doc: DocumentData, id: string): Poster {
    return {
      id,
      userId: doc.userId,
      title: doc.title,
      description: doc.description,
      isShared: doc.isShared ?? false,
      rootVersionId: doc.rootVersionId ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }
  },

  toFirestore(entity: Poster): Record<string, unknown> {
    return {
      userId: entity.userId,
      title: entity.title,
      description: entity.description,
      isShared: entity.isShared,
      rootVersionId: entity.rootVersionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  },
}
