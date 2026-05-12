import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { tripDoc } from '../lib/firestorePaths'
import type { Trip } from '../lib/types'

export function useTrip(tripId: string | null) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripId) {
      setTrip(null)
      setLoading(false)
      return
    }
    setLoading(true)
    return onSnapshot(tripDoc(tripId), (snap) => {
      if (!snap.exists()) {
        setTrip(null)
      } else {
        setTrip({ id: snap.id, ...(snap.data() as Omit<Trip, 'id'>) })
      }
      setLoading(false)
    })
  }, [tripId])

  return { trip, loading }
}
