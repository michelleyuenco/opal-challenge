import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

export function SignInPage() {
  const { user, signIn } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Opal Show Tracker</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Sign in to track potential buys across your trips.
        </p>
      </div>
      <Button onClick={signIn} size="lg">
        Continue with Google
      </Button>
    </div>
  )
}
