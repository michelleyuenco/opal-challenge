import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateDoc, deleteDoc, serverTimestamp, arrayRemove } from 'firebase/firestore'
import { useTripContext } from '../context/TripContext'
import { useAuth } from '../hooks/useAuth'
import { tripDoc } from '../lib/firestorePaths'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function SettingsPage() {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOwner = user?.uid === trip.ownerUid

  const [name, setName] = useState(trip.name)
  const [savingName, setSavingName] = useState(false)

  async function saveName() {
    if (!name.trim() || name === trip.name) return
    setSavingName(true)
    try {
      await updateDoc(tripDoc(trip.id), {
        name: name.trim(),
        updatedAt: serverTimestamp(),
      })
    } finally {
      setSavingName(false)
    }
  }

  async function leaveTrip() {
    if (!user) return
    if (!confirm('Leave this trip? You will lose access.')) return
    await updateDoc(tripDoc(trip.id), {
      collaboratorUids: arrayRemove(user.uid),
      updatedAt: serverTimestamp(),
    })
    navigate('/')
  }

  async function deleteTrip() {
    if (!confirm(`Delete "${trip.name}"? Items and booths are not auto-deleted yet.`)) return
    await deleteDoc(tripDoc(trip.id))
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <h1 className="text-xl font-semibold">Trip settings</h1>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <Input label="Trip name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={saveName} disabled={savingName || name === trip.name}>
          {savingName ? 'Saving…' : 'Save'}
        </Button>
      </section>

      <section className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
        <div className="font-medium">Members</div>
        <div className="text-neutral-600">Owner: {trip.ownerUid === user?.uid ? 'you' : trip.ownerUid}</div>
        <div className="text-neutral-600">
          Collaborators: {trip.collaboratorUids.length === 0 ? '—' : trip.collaboratorUids.join(', ')}
        </div>
        <p className="text-xs text-neutral-500">Invite UI added in Task 14.</p>
      </section>

      <section className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="text-sm font-medium">Budget &amp; rates</div>
        <p className="text-xs text-neutral-500">Added in Task 11.</p>
      </section>

      <div className="pt-2">
        {isOwner ? (
          <Button variant="danger" onClick={deleteTrip} className="w-full">
            Delete trip
          </Button>
        ) : (
          <Button variant="danger" onClick={leaveTrip} className="w-full">
            Leave trip
          </Button>
        )}
      </div>
    </div>
  )
}
