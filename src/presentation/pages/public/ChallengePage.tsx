import { Link } from 'react-router-dom'
import { useChallenge } from '@presentation/hooks/useChallenge'
import { useAuth } from '@presentation/hooks/useAuth'
import { useOpals } from '@presentation/hooks/useOpals'
import { useMySubmission } from '@presentation/hooks/useSubmission'
import { ChallengeStatusBadge } from '@presentation/components/challenge/ChallengeStatusBadge'
import { GuessForm } from '@presentation/components/challenge/GuessForm'
import { Spinner } from '@presentation/components/ui/Spinner'
import { Badge } from '@presentation/components/ui/Badge'

export function ChallengePage() {
  const { data: challenge, isLoading: challengeLoading } = useChallenge()
  const { user } = useAuth()
  const { data: opals } = useOpals()
  const { data: submission } = useMySubmission(user?.id, challenge?.id)

  if (challengeLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            No Active Challenge
          </h1>
          <p className="mt-2 text-gray-600">
            There is no challenge running right now. Check back soon!
          </p>
          <Link
            to="/gallery"
            className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Browse the Gallery &rarr;
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-start gap-3">
        <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
        <ChallengeStatusBadge status={challenge.status} />
      </div>
      <p className="mt-3 text-gray-600">{challenge.description}</p>

      {challenge.status === 'concluded' && (
        <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <p className="font-medium text-yellow-800">
            This challenge has concluded.
          </p>
          <Link
            to={`/results/${challenge.id}`}
            className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View results &rarr;
          </Link>
        </div>
      )}

      {challenge.status === 'active' && (
        <div className="mt-8">
          {submission ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-2">
                <p className="font-medium text-green-800">
                  You have already submitted your guess.
                </p>
                <Badge color="green">Submitted</Badge>
              </div>
              <p className="mt-1 text-sm text-green-700">
                Your guess was recorded on{' '}
                {new Date(submission.submittedAt).toLocaleDateString()}. Results
                will be revealed when the challenge concludes.
              </p>
            </div>
          ) : user ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Submit Your Guess
              </h2>
              {opals ? (
                <div className="mt-4">
                  <GuessForm
                    opals={opals}
                    challengeId={challenge.id}
                    userId={user.id}
                  />
                </div>
              ) : (
                <div className="mt-4 flex justify-center py-8">
                  <Spinner />
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-gray-700">
                Sign in to submit your guess for this challenge.
              </p>
              <Link
                to={`/login?returnTo=/challenge`}
                className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
