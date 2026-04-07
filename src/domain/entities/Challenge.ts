import type { Timestamp } from '@core/types'
import type { ChallengeStatus } from '@domain/value-objects/ChallengeStatus'

export interface Challenge {
  readonly id: string
  readonly status: ChallengeStatus
  readonly title: string
  readonly description: string
  readonly revealOpalId: string | null
  readonly revealMediaId: string | null
  readonly activatedAt: Timestamp | null
  readonly concludedAt: Timestamp | null
  readonly createdAt: Timestamp
}

export function canActivate(challenge: Challenge): boolean {
  return challenge.status === 'draft'
}

export function canConclude(challenge: Challenge): boolean {
  return challenge.status === 'active'
}
