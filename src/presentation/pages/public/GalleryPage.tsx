import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOpals, useCreateOpal } from '@presentation/hooks/useOpals'
import { useUploadMedia } from '@presentation/hooks/useUploadMedia'
import { useAuth } from '@presentation/hooks/useAuth'
import { OpalGrid } from '@presentation/components/opal/OpalGrid'
import { Spinner } from '@presentation/components/ui/Spinner'
import { Button } from '@presentation/components/ui/Button'

export function GalleryPage() {
  const { data: opals, isLoading, error } = useOpals()
  const { user } = useAuth()
  const createOpal = useCreateOpal()
  const uploadMedia = useUploadMedia()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const openPicker = () => fileInputRef.current?.click()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return
    const sourceUrl = window.prompt(
      'Source URL (optional) — where is this opal from?',
    ) ?? ''
    const tool = window.prompt(
      'Tool or camera (optional) — e.g. iPhone 15 macro, Canon R5',
    ) ?? ''

    setUploading(true)
    setErrorMsg(null)
    try {
      const title = file.name.replace(/\.[^.]+$/, '') || 'My Opal'
      const opal = await createOpal.mutateAsync({
        title,
        description: `Submitted by ${user.email ?? 'a community member'}`,
        createdBy: user.id,
      })
      await uploadMedia.mutateAsync({
        opalId: opal.id,
        file,
        uploadedBy: user.id,
        sourceUrl,
        tool,
      })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Opal Gallery</h1>
          <p className="mt-2 text-gray-600">
            Explore curated opals and community submissions from around the world.
          </p>
        </div>
        {user ? (
          <>
            <Button onClick={openPicker} loading={uploading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Submit Your Opal
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </>
        ) : (
          <Link
            to="/login?returnTo=/gallery"
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Sign in to submit your opal
          </Link>
        )}
      </div>

      {errorMsg && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMsg}
        </p>
      )}

      <div className="mt-8">
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}

        {error && (
          <p className="text-center text-red-600">
            Failed to load opals. Please try again later.
          </p>
        )}

        {opals && <OpalGrid opals={opals} />}
      </div>
    </div>
  )
}
