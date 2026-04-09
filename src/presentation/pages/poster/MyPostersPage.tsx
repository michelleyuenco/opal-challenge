import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@presentation/hooks/useAuth'
import {
  useUserPosters,
  useCreatePoster,
  useUploadVersion,
  useSharePoster,
} from '@presentation/hooks/usePoster'
import { Button } from '@presentation/components/ui/Button'
import { Input } from '@presentation/components/ui/Input'
import { Modal } from '@presentation/components/ui/Modal'
import { Spinner } from '@presentation/components/ui/Spinner'
import type { PosterDto } from '@application/dtos/PosterDto'

function PosterCard({ poster }: { poster: PosterDto }) {
  return (
    <Link
      to={`/poster/editor/${poster.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
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

        <span className="absolute right-3 top-3 rounded-full bg-indigo-900/80 px-2.5 py-0.5 text-xs font-bold text-amber-200 backdrop-blur-sm">
          {poster.versionCount} {poster.versionCount === 1 ? 'version' : 'versions'}
        </span>

        {poster.isShared && (
          <span className="absolute left-3 top-3 rounded-full bg-green-500/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            Shared
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 py-4">
        <h3 className="truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
          {poster.title}
        </h3>
        {poster.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {poster.description}
          </p>
        )}
        <p className="mt-auto pt-3 text-xs text-gray-400">
          Updated{' '}
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

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
    </div>
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

  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [tool, setTool] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [shareJourney, setShareJourney] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Generate / clean up preview URL
  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  const stats = useMemo(() => {
    const list = posters ?? []
    const totalVersions = list.reduce((sum, p) => sum + p.versionCount, 0)
    const sharedCount = list.filter((p) => p.isShared).length
    return { journeys: list.length, versions: totalVersions, shared: sharedCount }
  }, [posters])

  const openFilePicker = () => fileInputRef.current?.click()

  const acceptFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setError(null)
    setPendingFile(file)
    setTitle(file.name.replace(/\.[^.]+$/, '') || 'Untitled Journey')
    setTool('')
    setSourceUrl('')
    setShareJourney(true)
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) acceptFile(file)
  }

  // Page-wide drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.currentTarget === e.target) setIsDragging(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) acceptFile(file)
  }

  const closeModal = () => {
    if (creating) return
    setPendingFile(null)
    setTitle('')
    setTool('')
    setSourceUrl('')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!pendingFile || !user || !title.trim()) return
    setCreating(true)
    setError(null)
    try {
      const poster = await createPoster.mutateAsync({
        userId: user.id,
        title: title.trim(),
        description: '',
      })
      await uploadVersion.mutateAsync({
        posterId: poster.id,
        parentVersionId: null,
        file: pendingFile,
        label: 'Original',
        notes: 'Street poster captured in the wild',
        sourceUrl: sourceUrl.trim() || null,
        tool: tool.trim() || null,
        userId: user.id,
      })
      if (shareJourney) {
        await sharePoster.mutateAsync({ posterId: poster.id, isShared: true })
      }
      // Close the dialog before navigating away so React Router unmounts cleanly
      setPendingFile(null)
      navigate(`/poster/editor/${poster.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
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
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-indigo-950/70 backdrop-blur-sm">
          <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-white/10 px-12 py-10 text-center">
            <p className="text-2xl font-bold text-white">Drop to upload</p>
            <p className="mt-1 text-sm text-amber-200">Release to start a new journey</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Poster Journeys
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Capture posters in the wild and remix them with AI. Drag a photo onto the page to start.
          </p>
        </div>
        <Button onClick={openFilePicker}>
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

      {/* Stats */}
      {stats.journeys > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4 sm:max-w-md">
          <StatPill label="Journeys" value={stats.journeys} />
          <StatPill label="Versions" value={stats.versions} />
          <StatPill label="Shared" value={stats.shared} />
        </div>
      )}

      {/* Grid or empty state */}
      {!posters || posters.length === 0 ? (
        <div
          onClick={openFilePicker}
          className="mt-12 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white/40 px-6 py-20 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-purple-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Start your first creative journey
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            Drag a photo here, or click to choose one. Then transform it with AI and share the trail.
          </p>
          <Button className="mt-8" onClick={(e) => { e.stopPropagation(); openFilePicker() }}>
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

      {/* Upload modal */}
      <Modal
        open={pendingFile !== null}
        onClose={closeModal}
        title="New Poster Journey"
      >
        <div className="space-y-5">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto max-h-56 w-auto rounded-xl object-contain shadow-md"
            />
          )}

          <Input
            label="Title"
            placeholder='e.g. "Tokyo Subway Campaign"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Tool used"
              placeholder="iPhone, Gemini, Photoshop…"
              value={tool}
              onChange={(e) => setTool(e.target.value)}
            />
            <Input
              label="Source URL"
              placeholder="https://…"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={shareJourney}
              onChange={(e) => setShareJourney(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Share publicly so others can remix it
          </label>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={creating}
              disabled={!title.trim()}
            >
              Create Journey
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
