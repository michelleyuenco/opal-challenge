import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTripContext } from '../context/TripContext'
import { useBooths } from '../hooks/useBooths'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { BoothForm } from '../components/booths/BoothForm'

export function BoothsPage() {
  const { trip } = useTripContext()
  const { booths, loading } = useBooths(trip.id)
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Booths</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          ＋ Add
        </Button>
      </div>

      {loading && <div className="text-sm text-neutral-500">Loading…</div>}
      {!loading && booths.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No booths yet. Add the first one.
        </div>
      )}

      <div className="space-y-2">
        {booths.map((b) => (
          <button
            key={b.id}
            onClick={() => navigate(`/trips/${trip.id}/booths/${b.id}`)}
            className="block w-full rounded-xl border border-neutral-200 bg-white p-4 text-left hover:bg-neutral-50"
          >
            <div className="font-medium">{b.number}</div>
            {b.vendorName && (
              <div className="text-xs text-neutral-500">{b.vendorName}</div>
            )}
            {b.note && (
              <div className="mt-1 text-xs text-neutral-500">{b.note}</div>
            )}
          </button>
        ))}
      </div>

      <Sheet open={creating} onClose={() => setCreating(false)} title="New booth">
        <BoothForm onCreated={() => setCreating(false)} />
      </Sheet>
    </div>
  )
}
