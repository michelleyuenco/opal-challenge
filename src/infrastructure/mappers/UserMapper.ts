import type { DocumentData } from 'firebase/firestore'
import type { User } from '@domain/entities/User'

export const UserMapper = {
  toDomain(doc: DocumentData, id: string): User {
    return {
      id,
      email: doc.email,
      role: doc.role,
      displayName: doc.displayName ?? null,
      createdAt: doc.createdAt,
    }
  },

  toFirestore(entity: User): Record<string, unknown> {
    return {
      email: entity.email,
      role: entity.role,
      displayName: entity.displayName,
      createdAt: entity.createdAt,
    }
  },
}
