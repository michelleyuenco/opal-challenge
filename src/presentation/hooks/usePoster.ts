import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import { compressFile } from '@presentation/utils/compressImage'
import type { CreatePosterUseCase } from '@application/use-cases/poster/CreatePosterUseCase'
import type { GetPosterUseCase } from '@application/use-cases/poster/GetPosterUseCase'
import type { ListUserPostersUseCase } from '@application/use-cases/poster/ListUserPostersUseCase'
import type { ListSharedPostersUseCase } from '@application/use-cases/poster/ListSharedPostersUseCase'
import type { UpdatePosterUseCase } from '@application/use-cases/poster/UpdatePosterUseCase'
import type { SharePosterUseCase } from '@application/use-cases/poster/SharePosterUseCase'
import type { DeletePosterUseCase } from '@application/use-cases/poster/DeletePosterUseCase'
import type { UploadPosterVersionUseCase } from '@application/use-cases/poster/UploadPosterVersionUseCase'
import type { GetPosterVersionTreeUseCase } from '@application/use-cases/poster/GetPosterVersionTreeUseCase'

export function usePoster(posterId: string) {
  const container = useDI()
  return useQuery({
    queryKey: ['poster', posterId],
    queryFn: async () => {
      const uc = container.resolve<GetPosterUseCase>(TOKENS.GetPosterUseCase)
      const r = await uc.execute({ posterId })
      if (!r.ok) throw r.error
      return r.value
    },
    enabled: !!posterId,
  })
}

export function useUserPosters(userId: string | undefined) {
  const container = useDI()
  return useQuery({
    queryKey: ['posters', 'user', userId],
    queryFn: async () => {
      const uc = container.resolve<ListUserPostersUseCase>(TOKENS.ListUserPostersUseCase)
      const r = await uc.execute({ userId: userId! })
      if (!r.ok) throw r.error
      return r.value
    },
    enabled: !!userId,
  })
}

export function useSharedPosters() {
  const container = useDI()
  return useQuery({
    queryKey: ['posters', 'shared'],
    queryFn: async () => {
      const uc = container.resolve<ListSharedPostersUseCase>(TOKENS.ListSharedPostersUseCase)
      const r = await uc.execute()
      if (!r.ok) throw r.error
      return r.value
    },
  })
}

export function useVersionTree(posterId: string) {
  const container = useDI()
  return useQuery({
    queryKey: ['poster', posterId, 'tree'],
    queryFn: async () => {
      const uc = container.resolve<GetPosterVersionTreeUseCase>(TOKENS.GetPosterVersionTreeUseCase)
      const r = await uc.execute({ posterId })
      if (!r.ok) throw r.error
      return r.value
    },
    enabled: !!posterId,
  })
}

export function useCreatePoster() {
  const container = useDI()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { userId: string; title: string; description: string }) => {
      const uc = container.resolve<CreatePosterUseCase>(TOKENS.CreatePosterUseCase)
      const r = await uc.execute(input)
      if (!r.ok) throw r.error
      return r.value
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posters'] }),
  })
}

export function useUpdatePoster() {
  const container = useDI()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { posterId: string; title?: string; description?: string }) => {
      const uc = container.resolve<UpdatePosterUseCase>(TOKENS.UpdatePosterUseCase)
      const r = await uc.execute(input)
      if (!r.ok) throw r.error
      return r.value
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['poster', v.posterId] })
      qc.invalidateQueries({ queryKey: ['posters'] })
    },
  })
}

export function useSharePoster() {
  const container = useDI()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { posterId: string; isShared: boolean }) => {
      const uc = container.resolve<SharePosterUseCase>(TOKENS.SharePosterUseCase)
      const r = await uc.execute(input)
      if (!r.ok) throw r.error
      return r.value
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['poster', v.posterId] })
      qc.invalidateQueries({ queryKey: ['posters'] })
    },
  })
}

export function useDeletePoster() {
  const container = useDI()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (posterId: string) => {
      const uc = container.resolve<DeletePosterUseCase>(TOKENS.DeletePosterUseCase)
      const r = await uc.execute({ posterId })
      if (!r.ok) throw r.error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posters'] }),
  })
}

export function useUploadVersion() {
  const container = useDI()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      posterId: string
      parentVersionId: string | null
      file: File
      label: string
      notes: string
      sourceUrl?: string | null
      tool?: string | null
      userId: string
    }) => {
      const compressed = await compressFile(input.file)
      const uc = container.resolve<UploadPosterVersionUseCase>(TOKENS.UploadPosterVersionUseCase)
      const r = await uc.execute({ ...input, file: compressed })
      if (!r.ok) throw r.error
      return r.value
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['poster', v.posterId, 'tree'] })
      qc.invalidateQueries({ queryKey: ['poster', v.posterId] })
      qc.invalidateQueries({ queryKey: ['posters'] })
    },
  })
}
