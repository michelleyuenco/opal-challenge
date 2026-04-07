import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@domain/entities/User'
import type { IAuthService } from '@domain/services/IAuthService'
import { useDI } from './DIProvider'
import { TOKENS } from '@di/tokens'

interface AuthContextValue {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const container = useDI()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authService = container.resolve<IAuthService>(TOKENS.AuthService)
    const unsubscribe = authService.onAuthStateChange((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [container])

  return <AuthContext value={{ user, loading }}>{children}</AuthContext>
}

export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext)
}
