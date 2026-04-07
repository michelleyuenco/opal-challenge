import type { Timestamp } from '@core/types'
import type { ChallengeStatus } from '@domain/value-objects/ChallengeStatus'

export interface ChallengeDto {
  readonly id: string
  readonly status: ChallengeStatus
  readonly title: string
  readonly description: string
  readonly revealMediaUrl: string | null
  readonly activatedAt: Timestamp | null
  readonly concludedAt: Timestamp | null
}
