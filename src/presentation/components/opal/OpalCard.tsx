import { Link } from 'react-router-dom'
import type { Opal } from '@domain/entities/Opal'

export function OpalCard({ opal }: { opal: Opal }) {
  return (
    <Link
      to={`/gallery/${opal.slug}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {opal.thumbnailUrl ? (
          <img
            src={opal.thumbnailUrl}
            alt={opal.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900">{opal.title}</h3>
        <p className="mt-1 text-xs text-gray-500">
          {opal.mediaIds.length} media file{opal.mediaIds.length !== 1 ? 's' : ''}
        </p>
      </div>
    </Link>
  )
}
