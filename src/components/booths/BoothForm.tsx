import { useState } from 'react'
import { addDoc, serverTimestamp } from 'firebase/firestore'
import { boothsCol } from '../../lib/firestorePaths'
import { useTripContext } from '../../context/TripContext'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function BoothForm({
  onCreated,
}: {
  onCreated?: (boothId: string) => void
}) {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const [number, setNumber] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  async function create() {
    if (!user || !number.trim()) return
    setBusy(true)
    try {
      const ref = await addDoc(boothsCol(trip.id), {
        number: number.trim(),
        vendorName: vendorName.trim(),
        note: note.trim(),
        createdAt: serverTimestamp(),
        createdByUid: user.uid,
      })
      setNumber('')
      setVendorName('')
      setNote('')
      onCreated?.(ref.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <Input label="Booth number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="C-15" />
      <Input label="Vendor name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Yamamoto Gem" />
      <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button onClick={create} disabled={busy || !number.trim()} className="w-full">
        {busy ? 'Saving…' : 'Add booth'}
      </Button>
    </div>
  )
}
