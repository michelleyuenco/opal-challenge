import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import type { UploadMediaUseCase } from '@application/use-cases/media/UploadMediaUseCase'
import { compressFile } from '@presentation/utils/compressImage'

export function useUploadMedia() {
  const container = useDI()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      opalId: string
      file: File
      uploadedBy: string
    }) => {
      const compressed = await compressFile(input.file)
      const useCase = container.resolve<UploadMediaUseCase>(
        TOKENS.UploadMediaUseCase,
      )
      const result = await useCase.execute({ ...input, file: compressed })
      if (!result.ok) throw result.error
      return result.value
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opal', variables.opalId] })
      queryClient.invalidateQueries({ queryKey: ['opals'] })
    },
  })
}
