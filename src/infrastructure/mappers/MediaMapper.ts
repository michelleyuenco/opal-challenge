import type { DocumentData } from 'firebase/firestore'
import type { Media } from '@domain/entities/Media'

export const MediaMapper = {
  toDomain(doc: DocumentData, id: string): Media {
    return {
      id,
      opalId: doc.opalId,
      kind: doc.kind,
      storagePath: doc.storagePath,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      durationSeconds: doc.durationSeconds ?? null,
      displayOrder: doc.displayOrder,
      uploadedAt: doc.uploadedAt,
      uploadedBy: doc.uploadedBy,
      sourceUrl: doc.sourceUrl ?? null,
      tool: doc.tool ?? null,
    }
  },

  toFirestore(entity: Media): Record<string, unknown> {
    return {
      opalId: entity.opalId,
      kind: entity.kind,
      storagePath: entity.storagePath,
      mimeType: entity.mimeType,
      sizeBytes: entity.sizeBytes,
      durationSeconds: entity.durationSeconds,
      displayOrder: entity.displayOrder,
      uploadedAt: entity.uploadedAt,
      uploadedBy: entity.uploadedBy,
      sourceUrl: entity.sourceUrl,
      tool: entity.tool,
    }
  },
}
