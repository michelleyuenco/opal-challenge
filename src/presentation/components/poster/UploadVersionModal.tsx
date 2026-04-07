import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Modal } from '@presentation/components/ui/Modal'
import { Input } from '@presentation/components/ui/Input'
import { Button } from '@presentation/components/ui/Button'
import { useUploadVersion } from '@presentation/hooks/usePoster'
import { useAuth } from '@presentation/hooks/useAuth'

interface UploadVersionModalProps {
  open: boolean
  onClose: () => void
  posterId: string
  parentVersionId: string | null
  parentLabel?: string
}

export function UploadVersionModal({
  open,
  onClose,
  posterId,
  parentVersionId,
  parentLabel,
}: UploadVersionModalProps) {
  const { user } = useAuth()
  const uploadVersion = useUploadVersion()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [label, setLabel] = useState('')
  const [notes, setNotes] = useState('')

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  const resetForm = () => {
    setFile(null)
    setPreview(null)
    setLabel('')
    setNotes('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!file || !user) return

    await uploadVersion.mutateAsync({
      posterId,
      parentVersionId,
      file,
      label: label.trim() || 'Untitled',
      notes: notes.trim(),
      userId: user.id,
    })

    resetForm()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Upload Version">
      <div className="space-y-5">
        {/* Parent info */}
        {parentVersionId && parentLabel && (
          <div className="rounded-xl bg-indigo-50/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
              Creating from
            </p>
            <p className="mt-0.5 text-sm font-semibold text-indigo-700">
              {parentLabel}
            </p>
          </div>
        )}

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed
            p-5 transition-all duration-300 sm:p-8
            ${isDragActive
              ? 'border-amber-400 bg-amber-50/50'
              : file
                ? 'border-green-300 bg-green-50/30'
                : 'border-gray-200 bg-gray-50/50 hover:border-indigo-300 hover:bg-indigo-50/30'
            }
          `}
        >
          <input {...getInputProps()} />
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="h-40 w-auto rounded-xl object-contain shadow-md"
              />
              <p className="mt-2 text-center text-xs text-gray-500">
                Click or drop to replace
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">
                {isDragActive ? 'Drop your image here' : 'Drag and drop an image, or click to browse'}
              </p>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
            </>
          )}
        </div>

        {/* Label */}
        <Input
          label="Label"
          placeholder='e.g. "Street Photo", "Gemini Edit v1"'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        {/* Notes */}
        <div className="space-y-1">
          <label htmlFor="upload-notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="upload-notes"
            rows={3}
            placeholder="Describe the transformation or tools used..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={uploadVersion.isPending}
            disabled={!file}
          >
            Upload
          </Button>
        </div>
      </div>
    </Modal>
  )
}
