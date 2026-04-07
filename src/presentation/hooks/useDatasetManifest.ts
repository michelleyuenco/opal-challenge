import { useQuery } from '@tanstack/react-query'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import type { GetDatasetManifestUseCase } from '@application/use-cases/dataset/GetDatasetManifestUseCase'

export function useDatasetManifest() {
  const container = useDI()

  return useQuery({
    queryKey: ['dataset', 'manifest'],
    queryFn: async () => {
      const useCase = container.resolve<GetDatasetManifestUseCase>(
        TOKENS.GetDatasetManifestUseCase,
      )
      const result = await useCase.execute()
      if (!result.ok) throw result.error
      return result.value
    },
  })
}
