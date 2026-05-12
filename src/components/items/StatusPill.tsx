import { useState } from 'react'
import { updateDoc, serverTimestamp } from 'firebase/firestore'
import { clsx } from 'clsx'
import type { Item, ItemStatus } from '../../lib/types'
import { useTripContext } from '../../context/TripContext'
import { useAuth } from '../../hooks/useAuth'
import { itemDoc } from '../../lib/firestorePaths'
import { Sheet } from '../ui/Sheet'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props { item: Item }

const styles: Record<ItemStatus, string> = {
  spotted: 'bg-indigo-50 text-indigo-700',
  bought: 'bg-emerald-50 text-emerald-700',
  passed: 'bg-neutral-100 text-neutral-500',
}
const labels: Record<ItemStatus, string> = {
  spotted: 'Spotted',
  bought: 'Bought ✓',
  passed: 'Passed',
}

export function StatusPill({ item }: Props) {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [finalPaid, setFinalPaid] = useState(String(item.finalPaidJpy ?? ''))

  async function setStatus(status: ItemStatus) {
    if (!user) return
    if (status === 'bought') {
      const n = Number(finalPaid)
      if (!n || n <= 0) return
      await updateDoc(itemDoc(trip.id, item.id), {
        status: 'bought',
        finalPaidJpy: n,
        updatedAt: serverTimestamp(),
        updatedByUid: user.uid,
      })
    } else {
      await updateDoc(itemDoc(trip.id, item.id), {
        status,
        finalPaidJpy: null,
        updatedAt: serverTimestamp(),
        updatedByUid: user.uid,
      })
    }
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx('rounded-full px-3 py-1 text-xs font-medium', styles[item.status])}
      >
        {labels[item.status]}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Change status">
        <div className="space-y-2">
          <Button variant="secondary" className="w-full" onClick={() => setStatus('spotted')}>
            Spotted
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => setStatus('passed')}>
            Passed
          </Button>
          <div className="rounded-lg border border-neutral-200 p-3">
            <Input
              label="Final paid (JPY)"
              type="number"
              inputMode="numeric"
              value={finalPaid}
              onChange={(e) => setFinalPaid(e.target.value)}
            />
            <Button
              className="mt-2 w-full"
              onClick={() => setStatus('bought')}
              disabled={!finalPaid || Number(finalPaid) <= 0}
            >
              Mark bought
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  )
}
