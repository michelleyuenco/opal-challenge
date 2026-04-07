import type { Timestamp } from '@core/types'

export interface SubmissionDto {
  readonly id: string
  readonly challengeId: string
  readonly userId: string
  readonly guessedOpalId: string
  readonly submittedAt: Timestamp
  readonly isCorrect: boolean | null
}
