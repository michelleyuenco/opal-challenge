import { Link } from 'react-router-dom'
import { useOpals } from '@presentation/hooks/useOpals'
import { useChallenge } from '@presentation/hooks/useChallenge'
import { Spinner } from '@presentation/components/ui/Spinner'
import { ChallengeStatusBadge } from '@presentation/components/challenge/ChallengeStatusBadge'

export function AdminDashboardPage() {
  const opalsQuery = useOpals()
  const challengeQuery = useChallenge()

  if (opalsQuery.isLoading || challengeQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const opals = opalsQuery.data ?? []
  const challenge = challengeQuery.data ?? null

  const totalOpals = opals.length
  const totalMedia = opals.reduce((sum, opal) => sum + opal.mediaIds.length, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of the Opal Challenge platform.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Opals */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Opals</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {totalOpals}
          </p>
          <Link
            to="/admin/opals"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Manage opals &rarr;
          </Link>
        </div>

        {/* Total Media */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Media Files</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {totalMedia}
          </p>
          <p className="mt-4 text-sm text-gray-400">
            Across {totalOpals} opal{totalOpals !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Challenge Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Challenge Status</p>
          <div className="mt-2">
            {challenge ? (
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-900">
                    {challenge.title}
                  </span>
                  <ChallengeStatusBadge status={challenge.status} />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {challenge.description}
                </p>
              </div>
            ) : (
              <p className="text-lg font-semibold text-gray-400">
                No active challenge
              </p>
            )}
          </div>
          <Link
            to="/admin/challenge"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Manage challenge &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Quick Links</h2>
        <nav className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/opals"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Manage Opals
          </Link>
          <Link
            to="/admin/opals/new"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Add New Opal
          </Link>
          <Link
            to="/admin/challenge"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Manage Challenge
          </Link>
          <Link
            to="/admin/submissions"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            View Submissions
          </Link>
        </nav>
      </div>
    </div>
  )
}
