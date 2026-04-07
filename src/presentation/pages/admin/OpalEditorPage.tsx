import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOpalDetail } from '@presentation/hooks/useOpalDetail'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import { Spinner } from '@presentation/components/ui/Spinner'
import { Button } from '@presentation/components/ui/Button'
import { Input } from '@presentation/components/ui/Input'
import { MediaUploadZone } from '@presentation/components/opal/MediaUploadZone'
import { MediaCarousel } from '@presentation/components/opal/MediaCarousel'
import type { CreateOpalUseCase } from '@application/use-cases/opal/CreateOpalUseCase'
import type { UpdateOpalUseCase } from '@application/use-cases/opal/UpdateOpalUseCase'

const opalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

type OpalFormData = z.infer<typeof opalSchema>

export function OpalEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const container = useDI()
  const queryClient = useQueryClient()

  const isNew = id === 'new'
  const opalDetailQuery = useOpalDetail(isNew ? '' : id ?? '')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OpalFormData>({
    resolver: zodResolver(opalSchema),
  })

  useEffect(() => {
    if (!isNew && opalDetailQuery.data) {
      reset({
        title: opalDetailQuery.data.opal.title,
        description: opalDetailQuery.data.opal.description,
      })
    }
  }, [isNew, opalDetailQuery.data, reset])

  const createMutation = useMutation({
    mutationFn: async (data: OpalFormData) => {
      const useCase = container.resolve<CreateOpalUseCase>(
        TOKENS.CreateOpalUseCase,
      )
      const result = await useCase.execute(data)
      if (!result.ok) throw result.error
      return result.value
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opals'] })
      navigate('/admin/opals')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: OpalFormData) => {
      const useCase = container.resolve<UpdateOpalUseCase>(
        TOKENS.UpdateOpalUseCase,
      )
      const result = await useCase.execute({ id: id!, ...data })
      if (!result.ok) throw result.error
      return result.value
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opals'] })
      queryClient.invalidateQueries({ queryKey: ['opal', id] })
      navigate('/admin/opals')
    },
  })

  const mutation = isNew ? createMutation : updateMutation

  const onSubmit = (data: OpalFormData) => {
    mutation.mutate(data)
  }

  if (!isNew && opalDetailQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isNew && opalDetailQuery.isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-red-600">Failed to load opal details.</p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/admin/opals')}
        >
          Back to Opals
        </Button>
      </div>
    )
  }

  const opalData = opalDetailQuery.data

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/opals')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Opals
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">
        {isNew ? 'Create New Opal' : `Edit: ${opalData?.opal.title ?? ''}`}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 max-w-2xl space-y-6"
      >
        <Input
          label="Title"
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          />
          {errors.description?.message && (
            <p className="text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600">
            {mutation.error instanceof Error
              ? mutation.error.message
              : `Failed to ${isNew ? 'create' : 'update'} opal`}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={mutation.isPending}>
            {isNew ? 'Create Opal' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/opals')}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Media section — only for existing opals */}
      {!isNew && id && (
        <div className="mt-12 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900">Media</h2>

          {opalData && opalData.media.length > 0 && (
            <div className="mt-4">
              <MediaCarousel media={opalData.media} />
            </div>
          )}

          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Upload Media
            </h3>
            <MediaUploadZone opalId={id} />
          </div>
        </div>
      )}
    </div>
  )
}
