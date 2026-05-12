import { useState, useMemo } from 'react'
import { useTripContext } from '../context/TripContext'
import { useItems } from '../hooks/useItems'
import { useBooths } from '../hooks/useBooths'
import { ItemCard } from '../components/items/ItemCard'
import { QuickAddSheet } from '../components/items/QuickAddSheet'
import { Button } from '../components/ui/Button'
import { BudgetCard } from '../components/budget/BudgetCard'

export function ItemsPage() {
  const { trip } = useTripContext()
  const { items, loading } = useItems(trip.id)
  const { booths } = useBooths(trip.id)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const boothMap = useMemo(
    () => new Map(booths.map((b) => [b.id, b])),
    [booths],
  )

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">{trip.name}</h1>
        <BudgetCard trip={trip} items={items} />
      </div>

      {loading && <div className="text-sm text-neutral-500">Loading…</div>}
      {!loading && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No items yet. Tap Quick add to record what you saw.
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            trip={trip}
            booth={boothMap.get(item.boothId)}
          />
        ))}
      </div>

      <Button
        className="fixed bottom-20 left-1/2 z-10 w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
        size="lg"
        onClick={() => setQuickAddOpen(true)}
      >
        ＋ Quick add
      </Button>

      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}
