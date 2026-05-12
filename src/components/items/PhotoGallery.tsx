import { useEffect, useState } from 'react'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import { arrayRemove, serverTimestamp, updateDoc } from 'firebase/firestore'
import { storage } from '../../firebase'
import { itemDoc } from '../../lib/firestorePaths'
import type { Photo } from '../../lib/types'
import { useUploadPhoto } from '../../hooks/useUploadPhoto'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  tripId: string
  itemId: string
  photos: Photo[]
}

export function PhotoGallery({ tripId, itemId, photos }: Props) {
  const { user } = useAuth()
  const { getUrl } = useUploadPhoto()
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      const map: Record<string, string> = {}
      for (const p of photos) {
        if (urls[p.photoId]) {
          map[p.photoId] = urls[p.photoId]
          continue
        }
        map[p.photoId] = await getUrl(p.storagePath)
      }
      if (!cancelled) setUrls(map)
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.map((p) => p.photoId).join(',')])

  async function remove(p: Photo) {
    if (!user) return
    if (!confirm('Delete this photo?')) return
    try {
      await deleteObject(storageRef(storage, p.storagePath))
    } catch {
      /* ignore — doc removal still proceeds */
    }
    await updateDoc(itemDoc(tripId, itemId), {
      photos: arrayRemove(p),
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
    })
  }

  if (photos.length === 0) {
    return <p className="text-xs text-neutral-500">No photos yet.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((p) => (
        <div key={p.photoId} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
          {urls[p.photoId] && (
            <img src={urls[p.photoId]} alt="" className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => remove(p)}
            className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
