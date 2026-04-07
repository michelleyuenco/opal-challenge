import type { Result } from '@core/Result'
import type { AppError } from '@core/AppError'
import type { Submission } from '@domain/entities/Submission'

export interface ISubmissionRepository {
  findByUserAndChallenge(userId: string, challengeId: string): Promise<Result<Submission | null, AppError>>
  findByChallengeId(challengeId: string): Promise<Result<Submission[], AppError>>
  save(submission: Submission): Promise<Result<void, AppError>>
}
