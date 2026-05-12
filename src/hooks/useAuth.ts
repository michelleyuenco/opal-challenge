import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuthContext } from '../context/AuthContext'

export function useAuth() {
  const { user, loading } = useAuthContext()
  return {
    user,
    loading,
    signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
    signOut: () => signOut(auth),
  }
}
