import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTripContext } from '../context/TripContext'
import { useItems } from '../hooks/useItems'
import { useBooths } from '../hooks/useBooths'
import { ItemCard } from '../components/items/ItemCard'
import { Button } from '../components/ui/Button'

export function BoothDetailPage() {
  const { trip } = useTripContext()
  const { boothId } = useParams<{ boothId: string }>()
  const { items } = useItems(trip.id)
  const { booths } = useBooths(trip.id)
  const navigate = useNavigate()

  const booth = booths.find((b) => b.id === boothId)
  const boothMap = useMemo(() => new Map(booths.map((b) => [b.id, b])), [booths])
  const boothItems = useMemo(
    () => items.filter((i) => i.boothId === boothId),
    [items, boothId],
  )

  if (!booth) {
    return (
      <div className="p-6 text-sm text-neutral-500">
        Booth not found. <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-3 px-4 py-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>← Back</Button>
      <div>
        <h1 className="text-xl font-semibold">{booth.number}</h1>
        {booth.vendorName && (
          <p className="text-sm text-neutral-600">{booth.vendorName}</p>
        )}
        {booth.note && <p className="text-xs text-neutral-500">{booth.note}</p>}
        <p className="mt-1 text-xs text-neutral-500">{boothItems.length} item(s) recorded</p>
      </div>

      <div className="space-y-2">
        {boothItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            trip={trip}
            booth={boothMap.get(item.boothId)}
          />
        ))}
      </div>
    </div>
  )
}
