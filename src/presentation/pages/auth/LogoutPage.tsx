import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@presentation/hooks/useAuth'
import { Spinner } from '@presentation/components/ui/Spinner'

export function LogoutPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  useEffect(() => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        navigate('/', { replace: true })
      },
      onError: () => {
        navigate('/', { replace: true })
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="mt-4 text-sm text-gray-600">Signing out...</p>
      </div>
    </div>
  )
}
