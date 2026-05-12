import { useMemo, useState } from 'react'
import { useTripContext } from '../context/TripContext'
import { useItems } from '../hooks/useItems'
import { useBooths } from '../hooks/useBooths'
import { ItemCard } from '../components/items/ItemCard'
import { QuickAddSheet } from '../components/items/QuickAddSheet'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Input } from '../components/ui/Input'
import { BudgetCard } from '../components/budget/BudgetCard'
import { filterItems } from '../lib/search'
import type { ItemStatus } from '../lib/types'

type StatusFilter = 'all' | ItemStatus

export function ItemsPage() {
  const { trip } = useTripContext()
  const { items, loading } = useItems(trip.id)
  const { booths } = useBooths(trip.id)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const [status, setStatus] = useState<StatusFilter>('all')
  const [minStars, setMinStars] = useState<0 | 4>(0)
  const [query, setQuery] = useState('')

  const boothMap = useMemo(
    () => new Map(booths.map((b) => [b.id, b])),
    [booths],
  )

  const filtered = useMemo(
    () => filterItems(items, { status, minStars, query }),
    [items, status, minStars, query],
  )

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <div className="mb-3">
        <h1 className="text-xl font-semibold">{trip.name}</h1>
      </div>

      <BudgetCard trip={trip} items={items} />

      <div className="mt-3 flex gap-2 overflow-x-auto py-1">
        <Chip active={status === 'all'} onClick={() => setStatus('all')}>All</Chip>
        <Chip active={status === 'spotted'} onClick={() => setStatus('spotted')}>Spotted</Chip>
        <Chip active={status === 'bought'} onClick={() => setStatus('bought')}>Bought</Chip>
        <Chip active={status === 'passed'} onClick={() => setStatus('passed')}>Passed</Chip>
        <Chip active={minStars === 4} onClick={() => setMinStars(minStars === 4 ? 0 : 4)}>
          ★ 4+
        </Chip>
      </div>

      <div className="my-3">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search remark…"
        />
      </div>

      {loading && <div className="text-sm text-neutral-500">Loading…</div>}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          {items.length === 0
            ? 'No items yet. Tap Quick add to record what you saw.'
            : 'No items match the current filters.'}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((item) => (
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
