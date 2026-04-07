import type { Timestamp } from '@core/types'

export interface Poster {
  readonly id: string
  readonly userId: string
  readonly title: string
  readonly description: string
  readonly isShared: boolean
  readonly rootVersionId: string | null
  readonly createdAt: Timestamp
  readonly updatedAt: Timestamp
}
