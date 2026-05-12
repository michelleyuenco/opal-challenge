import { useMemo } from 'react'
import type { Trip, Item } from '../../lib/types'
import {
  budgetRemaining,
  jpyToUsd,
  jpyToHkd,
  formatJpy,
  formatUsd,
  formatHkd,
} from '../../lib/currency'

interface Props { trip: Trip; items: Item[] }

export function BudgetCard({ trip, items }: Props) {
  const { remaining, spent, pct } = useMemo(() => {
    const r = budgetRemaining(trip.budgetJpy, items)
    const s = trip.budgetJpy - r
    const p = trip.budgetJpy > 0 ? Math.max(0, Math.min(100, (s / trip.budgetJpy) * 100)) : 0
    return { remaining: r, spent: s, pct: p }
  }, [trip.budgetJpy, items])

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-neutral-500">Budget remaining</span>
        <span className="text-xs text-neutral-500">{formatJpy(trip.budgetJpy)} set</span>
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{formatJpy(remaining)}</div>
      <div className="text-xs text-neutral-500">
        ≈ {formatHkd(jpyToHkd(remaining, trip.rates.jpyToHkd))} · {formatUsd(jpyToUsd(remaining, trip.rates.jpyToUsd))}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-neutral-500">
        Spent {formatJpy(spent)} of {formatJpy(trip.budgetJpy)} ({pct.toFixed(0)}%)
      </div>
    </div>
  )
}
