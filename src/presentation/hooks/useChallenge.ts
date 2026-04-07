import { useQuery } from '@tanstack/react-query'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import type { GetActiveChallengeUseCase } from '@application/use-cases/challenge/GetActiveChallengeUseCase'

export function useChallenge() {
  const container = useDI()

  return useQuery({
    queryKey: ['challenge', 'active'],
    queryFn: async () => {
      const useCase = container.resolve<GetActiveChallengeUseCase>(
        TOKENS.GetActiveChallengeUseCase,
      )
      const result = await useCase.execute()
      if (!result.ok) throw result.error
      return result.value
    },
  })
}
