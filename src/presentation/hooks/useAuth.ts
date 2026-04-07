import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDI } from '@presentation/providers/DIProvider'
import { useAuthContext } from '@presentation/providers/AuthProvider'
import { TOKENS } from '@di/tokens'
import type { SignInUseCase } from '@application/use-cases/auth/SignInUseCase'
import type { SignInWithGoogleUseCase } from '@application/use-cases/auth/SignInWithGoogleUseCase'
import type { SendPasswordResetUseCase } from '@application/use-cases/auth/SendPasswordResetUseCase'
import type { SignOutUseCase } from '@application/use-cases/auth/SignOutUseCase'

export function useAuth() {
  const { user, loading } = useAuthContext()
  const container = useDI()
  const queryClient = useQueryClient()

  const signIn = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const useCase = container.resolve<SignInUseCase>(TOKENS.SignInUseCase)
      const result = await useCase.execute(input)
      if (!result.ok) throw result.error
      return result.value
    },
  })

  const signInWithGoogle = useMutation({
    mutationFn: async () => {
      const useCase = container.resolve<SignInWithGoogleUseCase>(TOKENS.SignInWithGoogleUseCase)
      const result = await useCase.execute()
      if (!result.ok) throw result.error
      return result.value
    },
  })

  const sendPasswordReset = useMutation({
    mutationFn: async (input: { email: string }) => {
      const useCase = container.resolve<SendPasswordResetUseCase>(TOKENS.SendPasswordResetUseCase)
      const result = await useCase.execute(input)
      if (!result.ok) throw result.error
    },
  })

  const signOut = useMutation({
    mutationFn: async () => {
      const useCase = container.resolve<SignOutUseCase>(TOKENS.SignOutUseCase)
      const result = await useCase.execute()
      if (!result.ok) throw result.error
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })

  return {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    signIn,
    signInWithGoogle,
    sendPasswordReset,
    signOut,
  }
}
