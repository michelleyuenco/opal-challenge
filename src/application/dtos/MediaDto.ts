import type { MediaKind } from '@domain/value-objects/MediaKind'

export interface MediaDto {
  readonly id: string
  readonly opalId: string
  readonly kind: MediaKind
  readonly downloadUrl: string
  readonly mimeType: string
  readonly sizeBytes: number
  readonly durationSeconds: number | null
  readonly displayOrder: number
}
