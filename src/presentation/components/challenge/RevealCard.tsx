import type { ChallengeDto } from '@application/dtos/ChallengeDto'

export function RevealCard({ challenge }: { challenge: ChallengeDto }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      {challenge.revealMediaUrl && (
        <div className="aspect-video bg-gray-100">
          {challenge.revealMediaUrl.includes('.mp4') ||
          challenge.revealMediaUrl.includes('.mov') ||
          challenge.revealMediaUrl.includes('.webm') ? (
            <video
              src={challenge.revealMediaUrl}
              controls
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              src={challenge.revealMediaUrl}
              alt="Challenge reveal"
              className="h-full w-full object-contain"
            />
          )}
        </div>
      )}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">{challenge.title}</h2>
        <p className="mt-2 text-gray-600">{challenge.description}</p>
      </div>
    </div>
  )
}
