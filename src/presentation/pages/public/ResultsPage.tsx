import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useChallenge } from '@presentation/hooks/useChallenge'
import { useAuth } from '@presentation/hooks/useAuth'
import { useMySubmission } from '@presentation/hooks/useSubmission'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import { RevealCard } from '@presentation/components/challenge/RevealCard'
import { Badge } from '@presentation/components/ui/Badge'
import { Spinner } from '@presentation/components/ui/Spinner'
import type { GetChallengeResultUseCase } from '@application/use-cases/challenge/GetChallengeResultUseCase'

export function ResultsPage() {
  const { challengeId: paramChallengeId } = useParams<{
    challengeId: string
  }>()
  const { data: activeChallenge } = useChallenge()
  const { user } = useAuth()
  const container = useDI()

  const challengeId = paramChallengeId ?? activeChallenge?.id

  const {
    data: challengeResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['challenge', 'result', challengeId],
    queryFn: async () => {
      const useCase = container.resolve<GetChallengeResultUseCase>(
        TOKENS.GetChallengeResultUseCase,
      )
      const result = await useCase.execute({ challengeId: challengeId! })
      if (!result.ok) throw result.error
      return result.value
    },
    enabled: !!challengeId,
  })

  const { data: submission } = useMySubmission(user?.id, challengeId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error || !challengeResult) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-center text-red-600">
          {error
            ? 'Failed to load challenge results.'
            : 'Challenge not found.'}
        </p>
      </div>
    )
  }

  if (challengeResult.status !== 'concluded') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Results Not Yet Available
          </h1>
          <p className="mt-2 text-gray-600">
            This challenge has not yet concluded. Check back after it ends to
            see the results.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Challenge Results</h1>
      <p className="mt-2 text-gray-600">{challengeResult.title}</p>

      <div className="mt-8">
        <RevealCard challenge={challengeResult} />
      </div>

      {user && submission && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Submission
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-gray-700">
              Submitted on{' '}
              {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
            {submission.isCorrect === true && (
              <Badge color="green">Correct</Badge>
            )}
            {submission.isCorrect === false && (
              <Badge color="gray">Incorrect</Badge>
            )}
            {submission.isCorrect === null && (
              <Badge color="yellow">Pending</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
