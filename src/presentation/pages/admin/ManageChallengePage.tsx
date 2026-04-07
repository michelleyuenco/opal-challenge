import { useState, useRef } from 'react'
import { compressFile } from '@presentation/utils/compressImage'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useChallenge } from '@presentation/hooks/useChallenge'
import { useOpals } from '@presentation/hooks/useOpals'
import { useDI } from '@presentation/providers/DIProvider'
import { TOKENS } from '@di/tokens'
import { Spinner } from '@presentation/components/ui/Spinner'
import { Button } from '@presentation/components/ui/Button'
import { Input } from '@presentation/components/ui/Input'
import { Modal } from '@presentation/components/ui/Modal'
import { ChallengeStatusBadge } from '@presentation/components/challenge/ChallengeStatusBadge'
import type { CreateChallengeUseCase } from '@application/use-cases/challenge/CreateChallengeUseCase'
import type { ActivateChallengeUseCase } from '@application/use-cases/challenge/ActivateChallengeUseCase'
import type { ConcludeChallengeUseCase } from '@application/use-cases/challenge/ConcludeChallengeUseCase'

const createChallengeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

type CreateChallengeFormData = z.infer<typeof createChallengeSchema>

export function ManageChallengePage() {
  const container = useDI()
  const queryClient = useQueryClient()
  const challengeQuery = useChallenge()
  const opalsQuery = useOpals()

  const [showConcludeModal, setShowConcludeModal] = useState(false)
  const [selectedOpalId, setSelectedOpalId] = useState('')
  const [revealFile, setRevealFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateChallengeFormData>({
    resolver: zodResolver(createChallengeSchema),
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateChallengeFormData) => {
      const useCase = container.resolve<CreateChallengeUseCase>(
        TOKENS.CreateChallengeUseCase,
      )
      const result = await useCase.execute(data)
      if (!result.ok) throw result.error
      return result.value
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge', 'active'] })
      reset()
    },
  })

  const activateMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const useCase = container.resolve<ActivateChallengeUseCase>(
        TOKENS.ActivateChallengeUseCase,
      )
      const result = await useCase.execute({ challengeId })
      if (!result.ok) throw result.error
      return result.value
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge', 'active'] })
    },
  })

  const concludeMutation = useMutation({
    mutationFn: async (params: {
      challengeId: string
      revealOpalId: string
      revealMediaFile: File
    }) => {
      const useCase = container.resolve<ConcludeChallengeUseCase>(
        TOKENS.ConcludeChallengeUseCase,
      )
      const compressedFile = await compressFile(params.revealMediaFile)
      const result = await useCase.execute({ ...params, revealMediaFile: compressedFile })
      if (!result.ok) throw result.error
      return result.value
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge', 'active'] })
      setShowConcludeModal(false)
      setSelectedOpalId('')
      setRevealFile(null)
    },
  })

  const onCreateSubmit = (data: CreateChallengeFormData) => {
    createMutation.mutate(data)
  }

  const handleConclude = () => {
    if (!challenge || !selectedOpalId || !revealFile) return
    concludeMutation.mutate({
      challengeId: challenge.id,
      revealOpalId: selectedOpalId,
      revealMediaFile: revealFile,
    })
  }

  if (challengeQuery.isLoading || opalsQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const challenge = challengeQuery.data ?? null
  const opals = opalsQuery.data ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Manage Challenge</h1>

      {/* No challenge exists */}
      {!challenge && (
        <div className="mt-8 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Create a New Challenge
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            No challenge currently exists. Create one to get started.
          </p>
          <form
            onSubmit={handleSubmit(onCreateSubmit)}
            className="mt-6 space-y-4"
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
                  : 'Failed to create challenge'}
              </p>
            )}
            <Button type="submit" loading={createMutation.isPending}>
              Create Challenge
            </Button>
          </form>
        </div>
      )}

      {/* Draft challenge */}
      {challenge && challenge.status === 'draft' && (
        <div className="mt-8 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {challenge.title}
            </h2>
            <ChallengeStatusBadge status={challenge.status} />
          </div>
          <p className="mt-2 text-sm text-gray-600">{challenge.description}</p>
          <p className="mt-1 text-xs text-gray-400">
            Created {new Date(challenge.createdAt).toLocaleDateString()}
          </p>

          {activateMutation.isError && (
            <p className="mt-4 text-sm text-red-600">
              {activateMutation.error instanceof Error
                ? activateMutation.error.message
                : 'Failed to activate challenge'}
            </p>
          )}

          <Button
            className="mt-6"
            loading={activateMutation.isPending}
            onClick={() => activateMutation.mutate(challenge.id)}
          >
            Activate Challenge
          </Button>
        </div>
      )}

      {/* Active challenge */}
      {challenge && challenge.status === 'active' && (
        <div className="mt-8 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {challenge.title}
            </h2>
            <ChallengeStatusBadge status={challenge.status} />
          </div>
          <p className="mt-2 text-sm text-gray-600">{challenge.description}</p>
          <p className="mt-1 text-xs text-gray-400">
            Activated{' '}
            {challenge.activatedAt
              ? new Date(challenge.activatedAt).toLocaleDateString()
              : 'N/A'}
          </p>

          <Button
            className="mt-6"
            variant="danger"
            onClick={() => setShowConcludeModal(true)}
          >
            Conclude Challenge
          </Button>
        </div>
      )}

      {/* Concluded challenge */}
      {challenge && challenge.status === 'concluded' && (
        <div className="mt-8 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {challenge.title}
            </h2>
            <ChallengeStatusBadge status={challenge.status} />
          </div>
          <p className="mt-2 text-sm text-gray-600">{challenge.description}</p>

          <dl className="mt-6 divide-y divide-gray-200">
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">
                {new Date(challenge.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-gray-500">Activated</dt>
              <dd className="text-sm text-gray-900">
                {challenge.activatedAt
                  ? new Date(challenge.activatedAt).toLocaleDateString()
                  : 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-gray-500">Concluded</dt>
              <dd className="text-sm text-gray-900">
                {challenge.concludedAt
                  ? new Date(challenge.concludedAt).toLocaleDateString()
                  : 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-gray-500">
                Reveal Opal ID
              </dt>
              <dd className="text-sm font-mono text-gray-900">
                {challenge.revealOpalId ?? 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Conclude Modal */}
      <Modal
        open={showConcludeModal}
        onClose={() => {
          setShowConcludeModal(false)
          setSelectedOpalId('')
          setRevealFile(null)
        }}
        title="Conclude Challenge"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select the correct opal and upload a reveal media file.
          </p>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Correct Opal
            </label>
            <select
              value={selectedOpalId}
              onChange={(e) => setSelectedOpalId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              <option value="">Select an opal...</option>
              {opals.map((opal) => (
                <option key={opal.id} value={opal.id}>
                  {opal.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Reveal Media
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                setRevealFile(file)
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {revealFile && (
              <p className="text-xs text-gray-500">{revealFile.name}</p>
            )}
          </div>

          {concludeMutation.isError && (
            <p className="text-sm text-red-600">
              {concludeMutation.error instanceof Error
                ? concludeMutation.error.message
                : 'Failed to conclude challenge'}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowConcludeModal(false)
                setSelectedOpalId('')
                setRevealFile(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={concludeMutation.isPending}
              disabled={!selectedOpalId || !revealFile}
              onClick={handleConclude}
            >
              Conclude
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
