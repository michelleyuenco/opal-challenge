import { useEffect, useState } from 'react'
import { onSnapshot, orderBy, query } from 'firebase/firestore'
import { boothsCol } from '../lib/firestorePaths'
import type { Booth } from '../lib/types'

export function useBooths(tripId: string) {
  const [booths, setBooths] = useState<Booth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(boothsCol(tripId), orderBy('number'))
    setLoading(true)
    return onSnapshot(
      q,
      (snap) => {
        setBooths(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booth, 'id'>) })),
        )
        setLoading(false)
      },
      () => {
        setBooths([])
        setLoading(false)
      },
    )
  }, [tripId])

  return { booths, loading }
}
