import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { MediaDto } from '@application/dtos/MediaDto'

export function MediaCarousel({ media }: { media: MediaDto[] }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const images = media.filter((m) => m.kind === 'image')
  const videos = media.filter((m) => m.kind === 'video')

  return (
    <div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setLightboxIndex(idx)}
              className="aspect-square overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                src={m.downloadUrl}
                alt={`Opal image ${idx + 1}`}
                className="h-full w-full object-cover transition hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {videos.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Videos</h4>
          {videos.map((v) => (
            <video
              key={v.id}
              src={v.downloadUrl}
              controls
              className="w-full rounded-lg"
            />
          ))}
        </div>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={images.map((m) => ({ src: m.downloadUrl }))}
      />
    </div>
  )
}
