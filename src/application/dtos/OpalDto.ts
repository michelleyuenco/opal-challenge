export interface OpalDto {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly thumbnailUrl: string | null
  readonly mediaCount: number
}
