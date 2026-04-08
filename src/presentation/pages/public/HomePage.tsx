import { Link } from 'react-router-dom'
import { useChallenge } from '@presentation/hooks/useChallenge'
import { useAuth } from '@presentation/hooks/useAuth'
import { ChallengeStatusBadge } from '@presentation/components/challenge/ChallengeStatusBadge'
import { InfiniteGrid } from '@presentation/components/ui/InfiniteGrid'

export function HomePage() {
  const { data: challenge } = useChallenge()
  const { user } = useAuth()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 py-28">
        <InfiniteGrid />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Pick Your{' '}
            <span className="bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-transparent">
              Challenge
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            Reimagine a street poster for Opal with AI, or help make opals truly unique again. Jump in below.
          </p>

          {/* Quick challenge selector */}
          <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            <Link
              to="/poster"
              className="group flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-4 text-left shadow-lg shadow-amber-900/30 ring-1 ring-amber-300/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-100">
                  Challenge 1
                </p>
                <p className="text-lg font-bold text-white">Reimagine Posters for Opal</p>
              </div>
              <span className="text-2xl text-white transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
            <Link
              to="/challenge"
              className="group flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-4 text-left shadow-lg shadow-indigo-900/30 ring-1 ring-indigo-300/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
                  Challenge 2
                </p>
                <p className="text-lg font-bold text-white">Make Opals Unique Again</p>
              </div>
              <span className="text-2xl text-white transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Active opal challenge banner */}
      {challenge && challenge.status === 'active' && (
        <section className="border-b border-green-200 bg-green-50/60">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <Link
              to="/challenge"
              className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-green-200 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <ChallengeStatusBadge status={challenge.status} />
                <div>
                  <p className="font-semibold text-gray-900">{challenge.title}</p>
                  <p className="text-sm text-gray-500">{challenge.description}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium text-indigo-600">
                Participate now &rarr;
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* Two Challenges — Side by Side */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">

            {/* LEFT — Poster Creative Imitation Challenge */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-1 transition-all duration-500 hover:shadow-2xl">
              <div className="h-full rounded-[1.35rem] bg-white p-8 sm:p-10">
                {/* Icon */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-200/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Creative Imitation
                </h2>
                <p className="mt-1 text-sm font-medium text-amber-600">
                  Poster Transformation Challenge
                </p>

                {/* Description */}
                <p className="mt-4 leading-relaxed text-gray-600">
                  Inspired by Peter Drucker's idea of creative imitation &mdash;
                  photograph a street poster that catches your eye, then use AI
                  tools like Gemini or Nano Banana to reimagine it as a{' '}
                  <a
                    href="https://michelleyuenjewelry.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-amber-700 underline decoration-amber-300 underline-offset-2 transition-colors hover:text-amber-900"
                  >
                    Michelle Yuen Jewelry
                  </a>{' '}
                  promotion. Track every version and share your creative journey.
                </p>

                {/* Steps */}
                <div className="mt-8 space-y-4">
                  <Step number="1" title="Capture" desc="Spot an inspiring poster on the street and photograph it" color="amber" />
                  <Step number="2" title="Transform" desc="Use AI to reimagine it for Michelle Yuen Jewelry — iterate and branch freely" color="amber" />
                  <Step number="3" title="Share" desc="Publish your creative journey for the community to explore" color="amber" />
                </div>

                {/* CTAs */}
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    to="/poster"
                    className="inline-flex items-center rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-200/50 transition-all duration-300 hover:bg-amber-700 hover:shadow-lg"
                  >
                    Explore Challenge
                  </Link>
                  {user ? (
                    <Link
                      to="/poster/my"
                      className="inline-flex items-center rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    >
                      My Journeys
                    </Link>
                  ) : (
                    <Link
                      to="/login?returnTo=/poster/my"
                      className="inline-flex items-center rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    >
                      Sign In to Start
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — Opal Identification Challenge */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 p-1 transition-all duration-500 hover:shadow-2xl">
              <div className="h-full rounded-[1.35rem] bg-white p-8 sm:p-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Opal Identification
                </h2>
                <p className="mt-1 text-sm font-medium text-indigo-500">
                  Machine Learning Challenge
                </p>

                <p className="mt-4 leading-relaxed text-gray-600">
                  Can you tell one opal from another? Study our curated gallery
                  of 30-40 rare oval opals through high-resolution images and
                  videos. Download the dataset, train your own ML model, and
                  identify the mystery specimen when the challenge concludes.
                </p>

                <div className="mt-8 space-y-4">
                  <Step number="1" title="Explore" desc="Browse the opal gallery with images and videos of each piece" />
                  <Step number="2" title="Train" desc="Download the full dataset and build your identification model" />
                  <Step number="3" title="Identify" desc="Recognise the mystery opal from the final reveal image" />
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    to="/gallery"
                    className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200/50 transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg"
                  >
                    Browse Gallery
                  </Link>
                  <Link
                    to="/dataset"
                    className="inline-flex items-center rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    Download Dataset
                  </Link>
                  <Link
                    to="/challenge"
                    className="inline-flex items-center rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    View Challenge
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

function Step({
  number,
  title,
  desc,
  color = 'indigo',
}: {
  number: string
  title: string
  desc: string
  color?: 'indigo' | 'amber'
}) {
  const dotColor = color === 'amber'
    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
    : 'bg-gradient-to-br from-indigo-400 to-purple-500'

  return (
    <div className="flex items-start gap-4">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${dotColor}`}>
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  )
}
