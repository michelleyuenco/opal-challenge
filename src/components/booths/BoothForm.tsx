import { useState } from 'react'
import { addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { boothsCol, boothDoc } from '../../lib/firestorePaths'
import { useTripContext } from '../../context/TripContext'
import { useAuth } from '../../hooks/useAuth'
import type { Booth } from '../../lib/types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface Props {
  booth?: Booth
  onCreated?: (boothId: string) => void
}

export function BoothForm({ booth, onCreated }: Props) {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const [number, setNumber] = useState(booth?.number ?? '')
  const [vendorName, setVendorName] = useState(booth?.vendorName ?? '')
  const [note, setNote] = useState(booth?.note ?? '')
  const [busy, setBusy] = useState(false)

  const isEdit = booth != null

  async function save() {
    if (!user || !number.trim()) return
    setBusy(true)
    try {
      if (isEdit) {
        await updateDoc(boothDoc(trip.id, booth.id), {
          number: number.trim(),
          vendorName: vendorName.trim(),
          note: note.trim(),
        })
        onCreated?.(booth.id)
      } else {
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
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <Input label="Booth number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="C-15" />
      <Input label="Vendor name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Yamamoto Gem" />
      <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button onClick={save} disabled={busy || !number.trim()} className="w-full">
        {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add booth'}
      </Button>
    </div>
  )
}
