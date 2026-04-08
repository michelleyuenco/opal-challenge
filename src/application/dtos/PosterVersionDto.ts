export interface PosterVersionDto {
  readonly id: string
  readonly posterId: string
  readonly parentVersionId: string | null
  readonly downloadUrl: string
  readonly label: string
  readonly notes: string
  readonly sourceUrl: string | null
  readonly tool: string | null
  readonly versionNumber: number
  readonly createdAt: number
}
