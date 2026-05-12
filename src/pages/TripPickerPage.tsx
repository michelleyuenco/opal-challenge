import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, serverTimestamp } from 'firebase/firestore'
import { useTrips } from '../hooks/useTrips'
import { useAuth } from '../hooks/useAuth'
import { tripsCol } from '../lib/firestorePaths'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Sheet } from '../components/ui/Sheet'

export function TripPickerPage() {
  const { user, signOut } = useAuth()
  const { trips, loading } = useTrips()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  async function createTrip() {
    if (!user || !name.trim()) return
    setBusy(true)
    try {
      const ref = await addDoc(tripsCol(), {
        name: name.trim(),
        startDate: null,
        endDate: null,
        ownerUid: user.uid,
        collaboratorUids: [],
        budgetJpy: 0,
        rates: {
          jpyToUsd: 0.00657,
          jpyToHkd: 0.0509,
          updatedAt: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setCreating(false)
      setName('')
      navigate(`/trips/${ref.id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Your Trips</h1>
          <p className="text-xs text-neutral-500">{user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>

      {loading && <div className="text-sm text-neutral-500">Loading…</div>}

      {!loading && trips.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No trips yet. Create one to start tracking.
        </div>
      )}

      <div className="space-y-2">
        {trips.map((t) => (
          <button
            key={t.id}
            onClick={() => navigate(`/trips/${t.id}`)}
            className="block w-full rounded-xl border border-neutral-200 bg-white p-4 text-left hover:bg-neutral-50"
          >
            <div className="font-medium">{t.name}</div>
            <div className="text-xs text-neutral-500">
              {t.ownerUid === user?.uid ? 'Owner' : 'Collaborator'} ·
              budget ¥{t.budgetJpy.toLocaleString()}
            </div>
          </button>
        ))}
      </div>

      <Button className="mt-6 w-full" size="lg" onClick={() => setCreating(true)}>
        ＋ New trip
      </Button>

      <Sheet open={creating} onClose={() => setCreating(false)} title="New trip">
        <div className="space-y-3">
          <Input
            label="Trip name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kobe Show — May 2026"
          />
          <Button onClick={createTrip} disabled={!name.trim() || busy} className="w-full">
            {busy ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
