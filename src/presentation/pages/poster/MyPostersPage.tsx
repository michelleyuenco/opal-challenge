import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@presentation/hooks/useAuth'
import { useUserPosters, useCreatePoster, useUploadVersion, useSharePoster } from '@presentation/hooks/usePoster'
import { Button } from '@presentation/components/ui/Button'
import { Spinner } from '@presentation/components/ui/Spinner'
import type { PosterDto } from '@application/dtos/PosterDto'

function PosterCard({ poster }: { poster: PosterDto }) {
  return (
    <Link
      to={`/poster/editor/${poster.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {poster.thumbnailUrl ? (
          <img
            src={poster.thumbnailUrl}
            alt={poster.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Version count badge */}
        <span className="absolute right-3 top-3 rounded-full bg-indigo-900/80 px-2.5 py-0.5 text-xs font-bold text-amber-200 backdrop-blur-sm">
          {poster.versionCount} {poster.versionCount === 1 ? 'version' : 'versions'}
        </span>

        {/* Shared indicator */}
        {poster.isShared && (
          <span className="absolute left-3 top-3 rounded-full bg-green-500/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            Shared
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
          {poster.title}
        </h3>
        {poster.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {poster.description}
          </p>
        )}
        <p className="mt-auto pt-3 text-xs text-gray-400">
          {new Date(poster.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
    </Link>
  )
}

export function MyPostersPage() {
  const { user } = useAuth()
  const { data: posters, isLoading } = useUserPosters(user?.id)
  const createPoster = useCreatePoster()
  const uploadVersion = useUploadVersion()
  const sharePoster = useSharePoster()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [creating, setCreating] = useState(false)

  const openFilePicker = () => fileInputRef.current?.click()

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return

    const sourceUrl = window.prompt(
      'Source URL (optional) — where did this photo come from?',
    ) ?? ''
    const tool = window.prompt(
      'Tool used (optional) — e.g. iPhone, Gemini, Nano Banana',
    ) ?? ''

    setCreating(true)
    try {
      const defaultTitle = file.name.replace(/\.[^.]+$/, '') || 'Untitled Journey'
      const poster = await createPoster.mutateAsync({
        userId: user.id,
        title: defaultTitle,
        description: '',
      })
      await uploadVersion.mutateAsync({
        posterId: poster.id,
        parentVersionId: null,
        file,
        label: 'Original',
        notes: 'Street poster captured in the wild',
        sourceUrl,
        tool,
        userId: user.id,
      })
      await sharePoster.mutateAsync({ posterId: poster.id, isShared: true })
      navigate(`/poster/editor/${poster.id}`)
    } finally {
      setCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Poster Journeys
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Your creative imitation transformations
          </p>
        </div>
        <Button onClick={openFilePicker} loading={creating}>
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload Poster
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {/* Grid or empty state */}
      {!posters || posters.length === 0 ? (
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-purple-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Start your first creative journey
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            Capture a street poster, transform it with AI tools, and document your creative
            imitation process step by step.
          </p>
          <Button className="mt-8" onClick={openFilePicker} loading={creating}>
            Upload Your First Poster
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posters.map((poster) => (
            <PosterCard key={poster.id} poster={poster} />
          ))}
        </div>
      )}

    </div>
  )
}
