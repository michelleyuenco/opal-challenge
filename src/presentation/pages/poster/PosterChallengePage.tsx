import { Link } from 'react-router-dom'
import { useAuth } from '@presentation/hooks/useAuth'
import { useSharedPosters } from '@presentation/hooks/usePoster'
import { Spinner } from '@presentation/components/ui/Spinner'
import type { PosterDto } from '@application/dtos/PosterDto'

const steps = [
  {
    number: '01',
    title: 'Capture',
    description:
      'Spot a striking poster on the street and snap a photo. This is your raw material -- the seed of creative imitation.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Transform',
    description:
      'Use AI tools to reimagine the poster as a Michelle Yuen Jewelry promotion. Each iteration builds on the last, forming a creative tree.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Share',
    description:
      'Share your creative journey with the community. Let others see your transformation process and the branches you explored.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
]

function PosterCard({ poster }: { poster: PosterDto }) {
  return (
    <Link
      to={`/poster/journey/${poster.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {poster.thumbnailUrl ? (
          <img
            src={poster.thumbnailUrl}
            alt={poster.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-amber-200 backdrop-blur-sm">
          {poster.versionCount} {poster.versionCount === 1 ? 'version' : 'versions'}
        </span>
      </div>
      <div className="px-5 py-4">
        <h3 className="text-base font-semibold text-white/90 transition-colors group-hover:text-amber-200">
          {poster.title}
        </h3>
        {poster.description && (
          <p className="mt-1 line-clamp-2 text-sm text-white/50">
            {poster.description}
          </p>
        )}
      </div>
    </Link>
  )
}

export function PosterChallengePage() {
  const { user, loading: authLoading } = useAuth()
  const { data: sharedPosters, isLoading: postersLoading } = useSharedPosters()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        {/* Subtle decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-amber-300/70">
            The Opal Challenge
          </p>
          <h1 className="bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            Creative Imitation Challenge
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-200/70 sm:text-xl">
            Inspired by Peter Drucker's creative imitation -- the art of taking what exists
            and reimagining it for a new purpose.
          </p>

          {/* Steps */}
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/20 hover:bg-white/10"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 text-amber-300 transition-all duration-300 group-hover:from-amber-400/30 group-hover:to-amber-600/20">
                  {step.icon}
                </div>
                <p className="text-xs font-bold tracking-widest text-amber-400/60">
                  {step.number}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white/90">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-indigo-200/50">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Michelle Yuen link */}
          <p className="mt-12 text-sm text-indigo-300/50">
            A creative project for{' '}
            <a
              href="https://michelleyuenjewelry.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-300/70 underline decoration-amber-400/30 underline-offset-4 transition-colors hover:text-amber-200"
            >
              Michelle Yuen Jewelry
            </a>
          </p>

          {/* CTA */}
          <div className="mt-10">
            {authLoading ? null : user ? (
              <Link
                to="/poster/my"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3.5 text-sm font-semibold text-indigo-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:from-amber-300 hover:to-amber-400 hover:shadow-xl hover:shadow-amber-500/30"
              >
                Start Your Journey
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3.5 text-sm font-semibold text-indigo-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:from-amber-300 hover:to-amber-400 hover:shadow-xl hover:shadow-amber-500/30"
              >
                Start Your Journey
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Community Journeys */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white/90 sm:text-3xl">
              Community Journeys
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-indigo-300/50">
              Explore how others have reimagined street posters into luxury jewelry promotions.
            </p>
          </div>

          {postersLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-8 w-8 text-amber-300" />
            </div>
          ) : !sharedPosters || sharedPosters.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-indigo-300/40">
                No shared journeys yet. Be the first to share yours!
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sharedPosters.map((poster) => (
                <PosterCard key={poster.id} poster={poster} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
