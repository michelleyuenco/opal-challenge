import type { Timestamp } from '@core/types'
import type { MediaKind } from '@domain/value-objects/MediaKind'

export interface Media {
  readonly id: string
  readonly opalId: string
  readonly kind: MediaKind
  readonly storagePath: string
  readonly mimeType: string
  readonly sizeBytes: number
  readonly durationSeconds: number | null
  readonly displayOrder: number
  readonly uploadedAt: Timestamp
  readonly uploadedBy: string
  readonly sourceUrl: string | null
  readonly tool: string | null
}
