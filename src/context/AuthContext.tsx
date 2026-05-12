import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
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
        const ref = userDoc(u.uid)
        const existing = await getDoc(ref)
        const profile = {
          email: (u.email ?? '').toLowerCase(),
          displayName: u.displayName ?? '',
          photoURL: u.photoURL ?? '',
          lastSeenAt: serverTimestamp(),
          ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
        }
        await setDoc(ref, profile, { merge: true })
      }
    })
  }, [])

  return <Ctx.Provider value={{ user, loading }}>{children}</Ctx.Provider>
}

export function useAuthContext(): AuthCtx {
  return useContext(Ctx)
}
