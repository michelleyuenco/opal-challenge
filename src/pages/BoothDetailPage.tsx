import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { deleteDoc } from 'firebase/firestore'
import { useTripContext } from '../context/TripContext'
import { useItems } from '../hooks/useItems'
import { useBooths } from '../hooks/useBooths'
import { boothDoc } from '../lib/firestorePaths'
import { ItemCard } from '../components/items/ItemCard'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { BoothForm } from '../components/booths/BoothForm'

export function BoothDetailPage() {
  const { trip } = useTripContext()
  const { boothId } = useParams<{ boothId: string }>()
  const { items } = useItems(trip.id)
  const { booths } = useBooths(trip.id)
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)

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

  async function deleteBooth() {
    if (!booth) return
    const itemCount = boothItems.length
    const msg = itemCount > 0
      ? `Delete booth "${booth.number}"? ${itemCount} item(s) will keep their booth reference but no longer have a booth to display.`
      : `Delete booth "${booth.number}"?`
    if (!confirm(msg)) return
    await deleteDoc(boothDoc(trip.id, booth.id))
    navigate(`/trips/${trip.id}/booths`)
  }

  return (
    <div className="mx-auto max-w-md space-y-3 px-4 py-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>← Back</Button>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={deleteBooth}>Delete</Button>
        </div>
      </div>

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

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit booth">
        <BoothForm booth={booth} onCreated={() => setEditing(false)} />
      </Sheet>
    </div>
  )
}
