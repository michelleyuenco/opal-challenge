import type { Timestamp } from 'firebase/firestore'

export type FormFactor =
  | 'loose-stone'
  | 'ring'
  | 'pendant'
  | 'earrings'
  | 'necklace'
  | 'brooch'
  | 'bracelet'
  | 'other'

export const FORM_FACTORS: FormFactor[] = [
  'loose-stone',
  'ring',
  'pendant',
  'earrings',
  'necklace',
  'brooch',
  'bracelet',
  'other',
]

export const FORM_FACTOR_LABELS: Record<FormFactor, string> = {
  'loose-stone': 'Loose stone',
  ring: 'Ring',
  pendant: 'Pendant',
  earrings: 'Earrings',
  necklace: 'Necklace',
  brooch: 'Brooch',
  bracelet: 'Bracelet',
  other: 'Other',
}

export type ItemStatus = 'spotted' | 'bought' | 'passed'

export interface Photo {
  photoId: string
  storagePath: string
  thumbPath: string | null
  width: number
  height: number
  uploadedAt: Timestamp
  uploadedByUid: string
}

export interface Trip {
  id: string
  name: string
  startDate: Timestamp | null
  endDate: Timestamp | null
  ownerUid: string
  collaboratorUids: string[]
  budgetJpy: number
  rates: {
    jpyToUsd: number
    jpyToHkd: number
    updatedAt: Timestamp
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Booth {
  id: string
  number: string
  vendorName: string
  note: string
  createdAt: Timestamp
  createdByUid: string
}

export interface Item {
  id: string
  boothId: string
  formFactor: FormFactor
  opalTypeTags: string[]
  remark: string

  vendorAskingJpy: number
  discountPercent: number
  discountedJpy: number
  targetBuyJpy: number | null
  plannedResaleJpy: number | null
  finalPaidJpy: number | null

  overrideUsd: number | null
  overrideHkd: number | null

  status: ItemStatus
  interestStars: number

  photos: Photo[]

  createdAt: Timestamp
  createdByUid: string
  updatedAt: Timestamp
  updatedByUid: string
}

export interface AppUser {
  uid: string
  email: string
  displayName: string
  photoURL: string
}
