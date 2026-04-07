export type Role = 'admin' | 'user'

export function isAdmin(role: Role): boolean {
  return role === 'admin'
}
