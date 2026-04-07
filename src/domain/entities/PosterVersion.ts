import type { Timestamp } from '@core/types'

export interface PosterVersion {
  readonly id: string
  readonly posterId: string
  readonly parentVersionId: string | null
  readonly storagePath: string
  readonly thumbnailPath: string | null
  readonly label: string
  readonly notes: string
  readonly versionNumber: number
  readonly createdAt: Timestamp
}

export interface PosterVersionNode extends PosterVersion {
  readonly downloadUrl: string
  readonly children: PosterVersionNode[]
}
