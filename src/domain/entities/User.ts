import type { Timestamp } from '@core/types'
import type { Role } from '@domain/value-objects/Role'

export interface User {
  readonly id: string
  readonly email: string
  readonly role: Role
  readonly displayName: string | null
  readonly createdAt: Timestamp
}
