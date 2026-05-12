import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateDoc, deleteDoc, serverTimestamp, arrayRemove, getDocs, query, where, arrayUnion } from 'firebase/firestore'
import { useTripContext } from '../context/TripContext'
import { useAuth } from '../hooks/useAuth'
import { tripDoc, usersCol } from '../lib/firestorePaths'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { BudgetAdjustSheet } from '../components/budget/BudgetAdjustSheet'
import { RateEditor } from '../components/budget/RateEditor'

export function SettingsPage() {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOwner = user?.uid === trip.ownerUid

  const [name, setName] = useState(trip.name)
  const [savingName, setSavingName] = useState(false)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  async function invite() {
    setInviteError(null)
    setInviting(true)
    try {
      const q = query(usersCol(), where('email', '==', inviteEmail.trim().toLowerCase()))
      const snap = await getDocs(q)
      if (snap.empty) {
        setInviteError(
          'No matching user. They must sign in once before you can add them.',
        )
        return
      }
      const uid = snap.docs[0].id
      if (uid === trip.ownerUid || trip.collaboratorUids.includes(uid)) {
        setInviteError('Already a member.')
        return
      }
      await updateDoc(tripDoc(trip.id), {
        collaboratorUids: arrayUnion(uid),
        updatedAt: serverTimestamp(),
      })
      setInviteEmail('')
    } finally {
      setInviting(false)
    }
  }

  async function removeCollaborator(uid: string) {
    if (!confirm('Remove this collaborator?')) return
    await updateDoc(tripDoc(trip.id), {
      collaboratorUids: arrayRemove(uid),
      updatedAt: serverTimestamp(),
    })
  }

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

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="text-sm font-medium">Members</div>
        <div className="text-xs text-neutral-600">
          Owner: {trip.ownerUid === user?.uid ? 'you' : trip.ownerUid}
        </div>
        <div className="space-y-1">
          {trip.collaboratorUids.length === 0 && (
            <p className="text-xs text-neutral-500">No collaborators yet.</p>
          )}
          {trip.collaboratorUids.map((uid) => (
            <div key={uid} className="flex items-center justify-between text-xs">
              <span>{uid}</span>
              {isOwner && (
                <Button variant="ghost" size="sm" onClick={() => removeCollaborator(uid)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        {isOwner && (
          <div className="space-y-2 pt-2">
            <Input
              label="Invite by email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="partner@example.com"
            />
            {inviteError && <p className="text-xs text-red-600">{inviteError}</p>}
            <Button onClick={invite} disabled={inviting || !inviteEmail.trim()}>
              {inviting ? 'Adding…' : 'Add collaborator'}
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="text-sm font-medium">Budget</div>
        <div className="text-xs text-neutral-500">Current: ¥{trip.budgetJpy.toLocaleString()}</div>
        <Button variant="secondary" onClick={() => setBudgetOpen(true)}>Adjust budget</Button>
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="text-sm font-medium">Conversion rates</div>
        <RateEditor trip={trip} />
      </section>

      <BudgetAdjustSheet trip={trip} open={budgetOpen} onClose={() => setBudgetOpen(false)} />

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
