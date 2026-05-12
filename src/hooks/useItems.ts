import { useEffect, useState } from 'react'
import { onSnapshot, orderBy, query } from 'firebase/firestore'
import { itemsCol } from '../lib/firestorePaths'
import type { Item } from '../lib/types'

export function useItems(tripId: string) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(itemsCol(tripId), orderBy('updatedAt', 'desc'))
    setLoading(true)
    return onSnapshot(q, (snap) => {
      setItems(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Item, 'id'>) })),
      )
      setLoading(false)
    })
  }, [tripId])

  return { items, loading }
}
