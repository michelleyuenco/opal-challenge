export interface PosterDto {
  readonly id: string
  readonly userId: string
  readonly title: string
  readonly description: string
  readonly isShared: boolean
  readonly rootVersionId: string | null
  readonly thumbnailUrl: string | null
  readonly versionCount: number
  readonly createdAt: number
  readonly updatedAt: number
}
