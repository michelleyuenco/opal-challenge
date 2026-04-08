import type { DocumentData } from 'firebase/firestore'
import type { PosterVersion } from '@domain/entities/PosterVersion'

export const PosterVersionMapper = {
  toDomain(doc: DocumentData, id: string): PosterVersion {
    return {
      id,
      posterId: doc.posterId,
      parentVersionId: doc.parentVersionId ?? null,
      storagePath: doc.storagePath,
      thumbnailPath: doc.thumbnailPath ?? null,
      label: doc.label,
      notes: doc.notes,
      sourceUrl: doc.sourceUrl ?? null,
      tool: doc.tool ?? null,
      versionNumber: doc.versionNumber,
      createdAt: doc.createdAt,
    }
  },

  toFirestore(entity: PosterVersion): Record<string, unknown> {
    return {
      posterId: entity.posterId,
      parentVersionId: entity.parentVersionId,
      storagePath: entity.storagePath,
      thumbnailPath: entity.thumbnailPath,
      label: entity.label,
      notes: entity.notes,
      sourceUrl: entity.sourceUrl,
      tool: entity.tool,
      versionNumber: entity.versionNumber,
      createdAt: entity.createdAt,
    }
  },
}
