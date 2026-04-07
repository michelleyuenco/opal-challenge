import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import type { ListOpalsUseCase } from '@application/use-cases/opal/ListOpalsUseCase'
import type { CreateOpalUseCase } from '@application/use-cases/opal/CreateOpalUseCase'

export function useOpals() {
  const container = useDI()

  return useQuery({
    queryKey: ['opals'],
    queryFn: async () => {
      const useCase = container.resolve<ListOpalsUseCase>(TOKENS.ListOpalsUseCase)
      const result = await useCase.execute()
      if (!result.ok) throw result.error
      return result.value
    },
  })
}

export function useCreateOpal() {
  const container = useDI()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      title: string
      description: string
      createdBy?: string | null
    }) => {
      const useCase = container.resolve<CreateOpalUseCase>(TOKENS.CreateOpalUseCase)
      const result = await useCase.execute(input)
      if (!result.ok) throw result.error
      return result.value
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opals'] }),
  })
}
