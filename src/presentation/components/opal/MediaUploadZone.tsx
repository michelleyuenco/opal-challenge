import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useUploadMedia } from '@presentation/hooks/useUploadMedia'
import { useAuth } from '@presentation/hooks/useAuth'

interface MediaUploadZoneProps {
  opalId: string
}

export function MediaUploadZone({ opalId }: MediaUploadZoneProps) {
  const { user } = useAuth()
  const uploadMedia = useUploadMedia()

  const onDrop = useCallback(
    (files: File[]) => {
      if (!user) return
      for (const file of files) {
        uploadMedia.mutate({ opalId, file, uploadedBy: user.id })
      }
    },
    [opalId, user, uploadMedia],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.webm'],
    },
  })

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${
        isDragActive
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      {uploadMedia.isPending ? (
        <p className="text-sm text-gray-500">Uploading...</p>
      ) : isDragActive ? (
        <p className="text-sm text-indigo-600">Drop files here</p>
      ) : (
        <div>
          <p className="text-sm text-gray-600">
            Drag and drop images or videos, or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-400">
            JPG, PNG, WebP, MP4, MOV, WebM
          </p>
        </div>
      )}
    </div>
  )
}
