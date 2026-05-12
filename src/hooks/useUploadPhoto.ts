import imageCompression from 'browser-image-compression'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  serverTimestamp,
  arrayUnion,
  updateDoc,
  type FieldValue,
} from 'firebase/firestore'
import { storage } from '../firebase'
import { itemDoc, itemPhotoStoragePath } from '../lib/firestorePaths'
import { useAuth } from './useAuth'
import { useState } from 'react'

interface UploadInput {
  tripId: string
  itemId: string
  files: File[]
}

interface ProgressState {
  total: number
  done: number
  current: string | null
  errors: string[]
}

export function useUploadPhoto() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<ProgressState>({
    total: 0,
    done: 0,
    current: null,
    errors: [],
  })

  async function upload({ tripId, itemId, files }: UploadInput) {
    if (!user) return
    setProgress({ total: files.length, done: 0, current: null, errors: [] })
    for (const file of files) {
      setProgress((p) => ({ ...p, current: file.name }))
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        })
        const photoId = crypto.randomUUID()
        const path = itemPhotoStoragePath(tripId, itemId, photoId)
        const sref = storageRef(storage, path)
        await uploadBytes(sref, compressed, {
          contentType: 'image/jpeg',
        })
        const { width, height } = await readDimensions(compressed)
        const photoMeta = {
          photoId,
          storagePath: path,
          thumbPath: null,
          width,
          height,
          uploadedAt: serverTimestamp() as unknown as FieldValue,
          uploadedByUid: user.uid,
        }
        await updateDoc(itemDoc(tripId, itemId), {
          photos: arrayUnion(photoMeta),
          updatedAt: serverTimestamp(),
          updatedByUid: user.uid,
        })
        setProgress((p) => ({ ...p, done: p.done + 1 }))
      } catch (err) {
        setProgress((p) => ({
          ...p,
          errors: [...p.errors, `${file.name}: ${(err as Error).message}`],
          done: p.done + 1,
        }))
      }
    }
    setProgress((p) => ({ ...p, current: null }))
  }

  async function getUrl(storagePath: string): Promise<string> {
    return getDownloadURL(storageRef(storage, storagePath))
  }

  return { upload, getUrl, progress }
}

function readDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(blob)
  })
}
