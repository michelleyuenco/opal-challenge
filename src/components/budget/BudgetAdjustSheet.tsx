import { useState } from 'react'
import { increment, serverTimestamp, updateDoc } from 'firebase/firestore'
import { tripDoc } from '../../lib/firestorePaths'
import { hkdToJpy } from '../../lib/currency'
import type { Trip } from '../../lib/types'
import { Sheet } from '../ui/Sheet'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props {
  trip: Trip
  open: boolean
  onClose: () => void
}

type Mode = 'add-hkd' | 'add-jpy' | 'set-jpy'

export function BudgetAdjustSheet({ trip, open, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('add-hkd')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const n = Number(amount) || 0

  const previewJpy =
    mode === 'add-hkd'
      ? hkdToJpy(n, trip.rates.jpyToHkd)
      : n

  async function apply() {
    if (!n) return
    setBusy(true)
    try {
      const delta = mode === 'add-hkd' || mode === 'add-jpy' ? previewJpy : null
      if (mode === 'set-jpy') {
        await updateDoc(tripDoc(trip.id), {
          budgetJpy: n,
          updatedAt: serverTimestamp(),
        })
      } else if (delta != null) {
        await updateDoc(tripDoc(trip.id), {
          budgetJpy: increment(delta),
          updatedAt: serverTimestamp(),
        })
      }
      setAmount('')
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Adjust budget">
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'add-hkd' ? 'primary' : 'secondary'}
            onClick={() => setMode('add-hkd')}
          >
            + HKD
          </Button>
          <Button
            size="sm"
            variant={mode === 'add-jpy' ? 'primary' : 'secondary'}
            onClick={() => setMode('add-jpy')}
          >
            + JPY
          </Button>
          <Button
            size="sm"
            variant={mode === 'set-jpy' ? 'primary' : 'secondary'}
            onClick={() => setMode('set-jpy')}
          >
            Set JPY
          </Button>
        </div>
        <Input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          suffix={mode === 'add-hkd' ? 'HKD' : 'JPY'}
          placeholder="Negative to subtract"
        />
        {mode === 'add-hkd' && n !== 0 && (
          <p className="text-xs text-neutral-500">
            = {previewJpy.toLocaleString()} JPY at rate {trip.rates.jpyToHkd}
          </p>
        )}
        <Button onClick={apply} disabled={busy || !n} className="w-full">
          {busy ? 'Saving…' : 'Apply'}
        </Button>
      </div>
    </Sheet>
  )
}
