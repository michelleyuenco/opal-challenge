import { useQuery } from '@tanstack/react-query'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import type { GetOpalWithMediaUseCase } from '@application/use-cases/opal/GetOpalWithMediaUseCase'

export function useOpalDetail(idOrSlug: string) {
  const container = useDI()

  return useQuery({
    queryKey: ['opal', idOrSlug],
    queryFn: async () => {
      const useCase = container.resolve<GetOpalWithMediaUseCase>(
        TOKENS.GetOpalWithMediaUseCase,
      )
      const result = await useCase.execute({ idOrSlug })
      if (!result.ok) throw result.error
      return result.value
    },
    enabled: !!idOrSlug,
  })
}
