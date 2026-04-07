import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOpals } from '@presentation/hooks/useOpals'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import { Spinner } from '@presentation/components/ui/Spinner'
import { Button } from '@presentation/components/ui/Button'
import { Input } from '@presentation/components/ui/Input'
import { Modal } from '@presentation/components/ui/Modal'
import type { CreateOpalUseCase } from '@application/use-cases/opal/CreateOpalUseCase'
import type { DeleteOpalUseCase } from '@application/use-cases/opal/DeleteOpalUseCase'

const createOpalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

type CreateOpalFormData = z.infer<typeof createOpalSchema>

export function ManageOpalsPage() {
  const container = useDI()
  const queryClient = useQueryClient()
  const opalsQuery = useOpals()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    title: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOpalFormData>({
    resolver: zodResolver(createOpalSchema),
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateOpalFormData) => {
      const useCase = container.resolve<CreateOpalUseCase>(
        TOKENS.CreateOpalUseCase,
      )
      const result = await useCase.execute(data)
      if (!result.ok) throw result.error
      return result.value
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opals'] })
      setShowCreateModal(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const useCase = container.resolve<DeleteOpalUseCase>(
        TOKENS.DeleteOpalUseCase,
      )
      const result = await useCase.execute({ id })
      if (!result.ok) throw result.error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opals'] })
      setDeleteTarget(null)
    },
  })

  const onCreateSubmit = (data: CreateOpalFormData) => {
    createMutation.mutate(data)
  }

  if (opalsQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const opals = opalsQuery.data ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Opals</h1>
          <p className="mt-1 text-sm text-gray-500">
            {opals.length} opal{opals.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Add Opal</Button>
      </div>

      {/* Opals Table */}
      <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Media Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {opals.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No opals yet. Add your first opal to get started.
                </td>
              </tr>
            ) : (
              opals.map((opal) => (
                <tr key={opal.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {opal.title}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {opal.mediaIds.length}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(opal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      to={`/admin/opals/${opal.id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        setDeleteTarget({ id: opal.id, title: opal.title })
                      }
                      className="ml-4 font-medium text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Opal Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          reset()
        }}
        title="Add New Opal"
      >
        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
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
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            />
            {errors.description?.message && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
          {createMutation.isError && (
            <p className="text-sm text-red-600">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : 'Failed to create opal'}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Opal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Opal"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{deleteTarget?.title}</span>? This
          action cannot be undone.
        </p>
        {deleteMutation.isError && (
          <p className="mt-2 text-sm text-red-600">
            {deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : 'Failed to delete opal'}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => {
              if (deleteTarget) {
                deleteMutation.mutate(deleteTarget.id)
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
