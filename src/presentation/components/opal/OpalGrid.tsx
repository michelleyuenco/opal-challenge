import type { Opal } from '@domain/entities/Opal'
import { OpalCard } from './OpalCard'

export function OpalGrid({ opals }: { opals: Opal[] }) {
  if (opals.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No opals available yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {opals.map((opal) => (
        <OpalCard key={opal.id} opal={opal} />
      ))}
    </div>
  )
}
