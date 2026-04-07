import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import type { SubmitGuessUseCase } from '@application/use-cases/submission/SubmitGuessUseCase'
import type { GetMySubmissionUseCase } from '@application/use-cases/submission/GetMySubmissionUseCase'

export function useMySubmission(userId: string | undefined, challengeId: string | undefined) {
  const container = useDI()

  return useQuery({
    queryKey: ['submission', userId, challengeId],
    queryFn: async () => {
      const useCase = container.resolve<GetMySubmissionUseCase>(
        TOKENS.GetMySubmissionUseCase,
      )
      const result = await useCase.execute({
        userId: userId!,
        challengeId: challengeId!,
      })
      if (!result.ok) throw result.error
      return result.value
    },
    enabled: !!userId && !!challengeId,
  })
}

export function useSubmitGuess() {
  const container = useDI()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      userId: string
      challengeId: string
      guessedOpalId: string
    }) => {
      const useCase = container.resolve<SubmitGuessUseCase>(
        TOKENS.SubmitGuessUseCase,
      )
      const result = await useCase.execute(input)
      if (!result.ok) throw result.error
      return result.value
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['submission', variables.userId, variables.challengeId],
      })
    },
  })
}
