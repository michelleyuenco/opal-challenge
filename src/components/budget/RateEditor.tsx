import { useState } from 'react'
import { serverTimestamp, updateDoc } from 'firebase/firestore'
import { tripDoc } from '../../lib/firestorePaths'
import type { Trip } from '../../lib/types'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export function RateEditor({ trip }: { trip: Trip }) {
  const [usd, setUsd] = useState(String(trip.rates.jpyToUsd))
  const [hkd, setHkd] = useState(String(trip.rates.jpyToHkd))
  const [busy, setBusy] = useState(false)

  async function save() {
    const u = Number(usd) || 0
    const h = Number(hkd) || 0
    if (u <= 0 || h <= 0) return
    setBusy(true)
    try {
      await updateDoc(tripDoc(trip.id), {
        rates: {
          jpyToUsd: u,
          jpyToHkd: h,
          updatedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <Input
        label="JPY → USD"
        type="number"
        inputMode="decimal"
        value={usd}
        onChange={(e) => setUsd(e.target.value)}
      />
      <Input
        label="JPY → HKD"
        type="number"
        inputMode="decimal"
        value={hkd}
        onChange={(e) => setHkd(e.target.value)}
      />
      <Button onClick={save} disabled={busy}>
        {busy ? 'Saving…' : 'Save rates'}
      </Button>
    </div>
  )
}
