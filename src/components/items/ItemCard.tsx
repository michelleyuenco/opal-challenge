import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Item, Booth, Trip } from '../../lib/types'
import {
  formatJpy,
  formatUsd,
  formatHkd,
  jpyToUsd,
  jpyToHkd,
  effectiveItemJpy,
} from '../../lib/currency'
import { FORM_FACTOR_LABELS } from '../../lib/types'

interface Props {
  item: Item
  trip: Trip
  booth: Booth | undefined
}

const statusStyles: Record<Item['status'], string> = {
  spotted: 'bg-indigo-50 text-indigo-700',
  bought: 'bg-emerald-50 text-emerald-700',
  passed: 'bg-neutral-100 text-neutral-500',
}

const statusLabels: Record<Item['status'], string> = {
  spotted: 'Spotted',
  bought: 'Bought ✓',
  passed: 'Passed',
}

export function ItemCard({ item, trip, booth }: Props) {
  const navigate = useNavigate()
  const headlineJpy = effectiveItemJpy(item)
  const headlineUsd = item.overrideUsd ?? jpyToUsd(headlineJpy, trip.rates.jpyToUsd)
  const headlineHkd = item.overrideHkd ?? jpyToHkd(headlineJpy, trip.rates.jpyToHkd)
  const cover = item.photos[0]

  return (
    <button
      onClick={() => navigate(`/trips/${trip.id}/items/${item.id}`)}
      className="flex w-full gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left hover:bg-neutral-50"
    >
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {cover && (
          <img
            src={`https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(cover.storagePath)}?alt=media`}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="truncate text-sm font-semibold">
            {FORM_FACTOR_LABELS[item.formFactor]}
            {item.opalTypeTags.length > 0 && (
              <span className="text-neutral-500"> · {item.opalTypeTags.join(', ')}</span>
            )}
          </div>
          <span className={clsx('rounded-full px-2 py-0.5 text-[10px]', statusStyles[item.status])}>
            {statusLabels[item.status]}
          </span>
        </div>
        <div className="truncate text-xs text-neutral-500">
          {booth ? `${booth.number}${booth.vendorName ? ` · ${booth.vendorName}` : ''}` : 'No booth'}
        </div>
        <div className="mt-1 text-xs">
          {item.status === 'bought' && item.finalPaidJpy != null ? (
            <span className="font-semibold text-emerald-700">{formatJpy(item.finalPaidJpy)} paid</span>
          ) : (
            <>
              {item.discountPercent > 0 && (
                <span className="mr-1 text-neutral-400 line-through">
                  {formatJpy(item.vendorAskingJpy)}
                </span>
              )}
              <span className="font-semibold">{formatJpy(item.discountedJpy)}</span>
              {item.discountPercent > 0 && (
                <span className="ml-1 text-neutral-500">(-{item.discountPercent}%)</span>
              )}
            </>
          )}
        </div>
        <div className="text-[11px] text-neutral-500">
          {formatHkd(headlineHkd)} · {formatUsd(headlineUsd)}
        </div>
        <div className="text-[11px] text-amber-500">
          {'★'.repeat(item.interestStars)}
          <span className="text-neutral-300">{'★'.repeat(5 - item.interestStars)}</span>
        </div>
      </div>
    </button>
  )
}
