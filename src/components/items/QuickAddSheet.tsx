import { useState } from 'react'
import { addDoc, serverTimestamp } from 'firebase/firestore'
import { useTripContext } from '../../context/TripContext'
import { useAuth } from '../../hooks/useAuth'
import { itemsCol } from '../../lib/firestorePaths'
import { applyDiscount } from '../../lib/currency'
import { Sheet } from '../ui/Sheet'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { BoothPicker } from '../booths/BoothPicker'

interface Props {
  open: boolean
  onClose: () => void
}

export function QuickAddSheet({ open, onClose }: Props) {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const [boothId, setBoothId] = useState<string | null>(null)
  const [asking, setAsking] = useState('')
  const [discount, setDiscount] = useState('0')
  const [busy, setBusy] = useState(false)

  const askingJpy = Number(asking) || 0
  const discountPct = Number(discount) || 0
  const discountedJpy = applyDiscount(askingJpy, discountPct)

  async function save() {
    if (!user || !boothId || !askingJpy) return
    setBusy(true)
    try {
      await addDoc(itemsCol(trip.id), {
        boothId,
        formFactor: 'other',
        opalTypeTags: [],
        remark: '',

        vendorAskingJpy: askingJpy,
        discountPercent: discountPct,
        discountedJpy,
        targetBuyJpy: null,
        plannedResaleJpy: null,
        finalPaidJpy: null,

        overrideUsd: null,
        overrideHkd: null,

        status: 'spotted',
        interestStars: 3,

        photos: [],

        createdAt: serverTimestamp(),
        createdByUid: user.uid,
        updatedAt: serverTimestamp(),
        updatedByUid: user.uid,
      })
      setBoothId(null)
      setAsking('')
      setDiscount('0')
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Quick add">
      <div className="space-y-3">
        <BoothPicker value={boothId} onChange={setBoothId} />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Vendor asking"
            type="number"
            inputMode="numeric"
            value={asking}
            onChange={(e) => setAsking(e.target.value)}
            suffix="JPY"
          />
          <Input
            label="Discount"
            type="number"
            inputMode="numeric"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            suffix="%"
          />
        </div>
        {askingJpy > 0 && discountPct > 0 && (
          <div className="text-xs text-neutral-500">
            Discounted: ¥{discountedJpy.toLocaleString()}
          </div>
        )}
        <p className="text-xs text-neutral-500">
          Photos, opal type tags, target prices, remark — fill in from the item detail page after saving.
        </p>
        <Button
          className="w-full"
          onClick={save}
          disabled={busy || !boothId || !askingJpy}
        >
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </Sheet>
  )
}
