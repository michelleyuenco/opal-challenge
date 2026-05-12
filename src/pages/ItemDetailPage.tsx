import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useTripContext } from '../context/TripContext'
import { useBooths } from '../hooks/useBooths'
import { useAuth } from '../hooks/useAuth'
import { itemDoc } from '../lib/firestorePaths'
import { applyDiscount, formatJpy } from '../lib/currency'
import type { Item, FormFactor } from '../lib/types'
import { FORM_FACTORS, FORM_FACTOR_LABELS } from '../lib/types'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Chip } from '../components/ui/Chip'
import { BoothPicker } from '../components/booths/BoothPicker'
import { StatusPill } from '../components/items/StatusPill'
import { StarRating } from '../components/items/StarRating'
import { OpalTagInput } from '../components/items/OpalTagInput'

export function ItemDetailPage() {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const { booths } = useBooths(trip.id)
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<Item | null>(null)

  useEffect(() => {
    if (!itemId) return
    return onSnapshot(doc(db, 'trips', trip.id, 'items', itemId), (snap) => {
      if (!snap.exists()) {
        setItem(null)
      } else {
        setItem({ id: snap.id, ...(snap.data() as Omit<Item, 'id'>) })
      }
    })
  }, [trip.id, itemId])

  const boothMap = useMemo(() => new Map(booths.map((b) => [b.id, b])), [booths])

  if (!item) {
    return <div className="p-6 text-sm text-neutral-500">Loading…</div>
  }

  async function patch(updates: Partial<Item>) {
    if (!user || !item) return
    await updateDoc(itemDoc(trip.id, item.id), {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
    })
  }

  async function setAskingAndDiscount(askingJpy: number, discountPercent: number) {
    await patch({
      vendorAskingJpy: askingJpy,
      discountPercent,
      discountedJpy: applyDiscount(askingJpy, discountPercent),
    })
  }

  async function remove() {
    if (!item) return
    if (!confirm('Delete this item?')) return
    await deleteDoc(itemDoc(trip.id, item.id))
    navigate(`/trips/${trip.id}`)
  }

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <StatusPill item={item} />
      </div>

      <div className="text-xs text-neutral-500">
        Photos UI in Task 10 · {item.photos.length} attached
      </div>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div>
          <span className="block text-sm font-medium text-neutral-700 mb-1">Form factor</span>
          <div className="flex flex-wrap gap-1">
            {FORM_FACTORS.map((f) => (
              <Chip
                key={f}
                active={item.formFactor === f}
                onClick={() => patch({ formFactor: f as FormFactor })}
              >
                {FORM_FACTOR_LABELS[f]}
              </Chip>
            ))}
          </div>
        </div>

        <OpalTagInput
          value={item.opalTypeTags}
          onChange={(opalTypeTags) => patch({ opalTypeTags })}
        />

        <Input
          label="Remark"
          value={item.remark}
          onChange={(e) => patch({ remark: e.target.value })}
        />

        <div>
          <span className="block text-sm font-medium text-neutral-700 mb-1">Booth</span>
          <BoothPicker value={item.boothId} onChange={(boothId) => patch({ boothId })} />
          {boothMap.get(item.boothId) && (
            <p className="mt-1 text-xs text-neutral-500">
              {boothMap.get(item.boothId)!.number}
              {boothMap.get(item.boothId)!.vendorName ? ` · ${boothMap.get(item.boothId)!.vendorName}` : ''}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Vendor asking"
            type="number"
            inputMode="numeric"
            value={String(item.vendorAskingJpy)}
            onChange={(e) =>
              setAskingAndDiscount(Number(e.target.value) || 0, item.discountPercent)
            }
            suffix="JPY"
          />
          <Input
            label="Discount"
            type="number"
            inputMode="numeric"
            value={String(item.discountPercent)}
            onChange={(e) =>
              setAskingAndDiscount(item.vendorAskingJpy, Number(e.target.value) || 0)
            }
            suffix="%"
          />
        </div>
        <div className="text-xs text-neutral-500">
          Discounted: <span className="font-semibold text-neutral-700">{formatJpy(item.discountedJpy)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Target buy"
            type="number"
            inputMode="numeric"
            value={item.targetBuyJpy != null ? String(item.targetBuyJpy) : ''}
            onChange={(e) =>
              patch({ targetBuyJpy: e.target.value ? Number(e.target.value) : null })
            }
            suffix="JPY"
          />
          <Input
            label="Planned resale"
            type="number"
            inputMode="numeric"
            value={item.plannedResaleJpy != null ? String(item.plannedResaleJpy) : ''}
            onChange={(e) =>
              patch({ plannedResaleJpy: e.target.value ? Number(e.target.value) : null })
            }
            suffix="JPY"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-neutral-700">
            Currency overrides (optional)
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input
              label="USD"
              type="number"
              inputMode="decimal"
              value={item.overrideUsd != null ? String(item.overrideUsd) : ''}
              onChange={(e) =>
                patch({ overrideUsd: e.target.value ? Number(e.target.value) : null })
              }
            />
            <Input
              label="HKD"
              type="number"
              inputMode="decimal"
              value={item.overrideHkd != null ? String(item.overrideHkd) : ''}
              onChange={(e) =>
                patch({ overrideHkd: e.target.value ? Number(e.target.value) : null })
              }
            />
          </div>
        </details>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <span className="block text-sm font-medium text-neutral-700 mb-1">Interest</span>
        <StarRating
          value={item.interestStars}
          onChange={(n) => patch({ interestStars: n })}
        />
      </section>

      <Button variant="danger" className="w-full" onClick={remove}>
        Delete item
      </Button>
    </div>
  )
}
