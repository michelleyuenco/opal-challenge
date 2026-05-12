import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { setDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from '../firebase'
import { userDoc } from '../lib/firestorePaths'

interface AuthCtx {
  user: User | null
  loading: boolean
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        await setDoc(
          userDoc(u.uid),
          {
            email: u.email ?? '',
            displayName: u.displayName ?? '',
            photoURL: u.photoURL ?? '',
            createdAt: serverTimestamp(),
          },
          { merge: true },
        )
      }
    })
  }, [])

  return <Ctx.Provider value={{ user, loading }}>{children}</Ctx.Provider>
}

export function useAuthContext(): AuthCtx {
  return useContext(Ctx)
}
