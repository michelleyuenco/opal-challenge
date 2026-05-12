import { useEffect, useState } from 'react'
import {
  onSnapshot,
  query,
  where,
  orderBy,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore'
import { tripsCol } from '../lib/firestorePaths'
import type { Trip } from '../lib/types'
import { useAuth } from './useAuth'

function snapToTrips(snap: QuerySnapshot<DocumentData>): Trip[] {
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Trip, 'id'>) }))
}

export function useTrips() {
  const { user } = useAuth()
  const [owned, setOwned] = useState<Trip[]>([])
  const [collab, setCollab] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setOwned([])
      setCollab([])
      setLoading(false)
      return
    }
    setLoading(true)
    const qOwned = query(
      tripsCol(),
      where('ownerUid', '==', user.uid),
      orderBy('updatedAt', 'desc'),
    )
    const qCollab = query(
      tripsCol(),
      where('collaboratorUids', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc'),
    )
    let gotOwned = false
    let gotCollab = false
    const stopL = () => {
      if (gotOwned && gotCollab) setLoading(false)
    }
    const unsubA = onSnapshot(
      qOwned,
      (s) => {
        setOwned(snapToTrips(s))
        gotOwned = true
        stopL()
      },
      () => {
        setOwned([])
        gotOwned = true
        stopL()
      },
    )
    const unsubB = onSnapshot(
      qCollab,
      (s) => {
        setCollab(snapToTrips(s))
        gotCollab = true
        stopL()
      },
      () => {
        setCollab([])
        gotCollab = true
        stopL()
      },
    )
    return () => {
      unsubA()
      unsubB()
    }
  }, [user])

  const all = [...owned, ...collab].sort(
    (a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0),
  )
  return { trips: all, loading }
}
