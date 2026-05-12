import { collection, doc } from 'firebase/firestore'
import { db } from '../firebase'

export const usersCol = () => collection(db, 'users')
export const userDoc = (uid: string) => doc(db, 'users', uid)

export const tripsCol = () => collection(db, 'trips')
export const tripDoc = (tripId: string) => doc(db, 'trips', tripId)

export const boothsCol = (tripId: string) =>
  collection(db, 'trips', tripId, 'booths')
export const boothDoc = (tripId: string, boothId: string) =>
  doc(db, 'trips', tripId, 'booths', boothId)

export const itemsCol = (tripId: string) =>
  collection(db, 'trips', tripId, 'items')
export const itemDoc = (tripId: string, itemId: string) =>
  doc(db, 'trips', tripId, 'items', itemId)

export const itemPhotoStoragePath = (
  tripId: string,
  itemId: string,
  photoId: string,
): string => `trips/${tripId}/items/${itemId}/${photoId}.jpg`
