import { Link, useParams } from 'react-router-dom'
import { useOpalDetail } from '@presentation/hooks/useOpalDetail'
import { MediaCarousel } from '@presentation/components/opal/MediaCarousel'
import { Spinner } from '@presentation/components/ui/Spinner'

export function OpalDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, error } = useOpalDetail(slug ?? '')

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-center text-red-600">
          {error ? 'Failed to load opal details.' : 'Opal not found.'}
        </p>
        <div className="mt-4 text-center">
          <Link to="/gallery" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Back to Gallery
          </Link>
        </div>
      </div>
    )
  }

  const { opal, media } = data

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/gallery"
        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        &larr; Back to Gallery
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-gray-900">{opal.title}</h1>
        <p className="mt-3 text-gray-600">{opal.description}</p>
      </div>

      {media.length > 0 && (
        <div className="mt-8">
          <MediaCarousel media={media} />
        </div>
      )}
    </div>
  )
}
