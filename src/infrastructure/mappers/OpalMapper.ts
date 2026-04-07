import type { DocumentData } from 'firebase/firestore'
import type { Opal } from '@domain/entities/Opal'

export const OpalMapper = {
  toDomain(doc: DocumentData, id: string): Opal {
    return {
      id,
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      thumbnailUrl: doc.thumbnailUrl ?? null,
      mediaIds: doc.mediaIds ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isDeleted: doc.isDeleted ?? false,
      createdBy: doc.createdBy ?? null,
    }
  },

  toFirestore(entity: Opal): Record<string, unknown> {
    return {
      slug: entity.slug,
      title: entity.title,
      description: entity.description,
      thumbnailUrl: entity.thumbnailUrl,
      mediaIds: [...entity.mediaIds],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      isDeleted: entity.isDeleted,
      createdBy: entity.createdBy,
    }
  },
}
