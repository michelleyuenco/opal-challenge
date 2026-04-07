import { useQuery } from '@tanstack/react-query'
import { useChallenge } from '@presentation/hooks/useChallenge'
import { useOpals } from '@presentation/hooks/useOpals'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import { Spinner } from '@presentation/components/ui/Spinner'
import { Badge } from '@presentation/components/ui/Badge'
import { ChallengeStatusBadge } from '@presentation/components/challenge/ChallengeStatusBadge'
import type { ListSubmissionsUseCase } from '@application/use-cases/submission/ListSubmissionsUseCase'

export function SubmissionsPage() {
  const container = useDI()
  const challengeQuery = useChallenge()
  const opalsQuery = useOpals()

  const challenge = challengeQuery.data ?? null

  const submissionsQuery = useQuery({
    queryKey: ['submissions', challenge?.id],
    queryFn: async () => {
      const useCase = container.resolve<ListSubmissionsUseCase>(
        TOKENS.ListSubmissionsUseCase,
      )
      const result = await useCase.execute({ challengeId: challenge!.id })
      if (!result.ok) throw result.error
      return result.value
    },
    enabled: !!challenge,
  })

  if (challengeQuery.isLoading || opalsQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const opals = opalsQuery.data ?? []
  const opalMap = new Map(opals.map((o) => [o.id, o]))

  if (!challenge) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <p className="mt-4 text-sm text-gray-500">
          No challenge exists. Create and activate a challenge first.
        </p>
      </div>
    )
  }

  const submissions = submissionsQuery.data ?? []
  const totalSubmissions = submissions.length
  const correctCount = submissions.filter((s) => s.isCorrect === true).length
  const incorrectCount = submissions.filter(
    (s) => s.isCorrect === false,
  ).length
  const pendingCount = submissions.filter((s) => s.isCorrect === null).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <ChallengeStatusBadge status={challenge.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Challenge: {challenge.title}
      </p>

      {/* Summary Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Submissions
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {totalSubmissions}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Correct</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {correctCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Incorrect</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            {incorrectCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-600">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Submissions Table */}
      {submissionsQuery.isLoading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Guessed Opal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Submitted At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Correct?
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => {
                  const guessedOpal = opalMap.get(submission.guessedOpalId)
                  return (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-900">
                        {submission.userId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {guessedOpal?.title ?? submission.guessedOpalId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {submission.isCorrect === true && (
                          <Badge color="green">Correct</Badge>
                        )}
                        {submission.isCorrect === false && (
                          <Badge color="red">Incorrect</Badge>
                        )}
                        {submission.isCorrect === null && (
                          <Badge color="gray">Pending</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
