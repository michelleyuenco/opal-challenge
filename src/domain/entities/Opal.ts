import type { Timestamp } from '@core/types'

export interface Opal {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly thumbnailUrl: string | null
  readonly mediaIds: readonly string[]
  readonly createdAt: Timestamp
  readonly updatedAt: Timestamp
  readonly isDeleted: boolean
  readonly createdBy: string | null
}

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
