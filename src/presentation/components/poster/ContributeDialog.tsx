import { useEffect, useState } from 'react'
import { Modal } from '@presentation/components/ui/Modal'
import { Input } from '@presentation/components/ui/Input'
import { Button } from '@presentation/components/ui/Button'

export interface ContributeFormValues {
  tool: string
  sourceUrl: string
}

interface ContributeDialogProps {
  open: boolean
  file: File | null
  title: string
  submitLabel?: string
  loading?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (values: ContributeFormValues) => void
}

/** Shared modal for prompting tool + source URL alongside an image preview. */
export function ContributeDialog({
  open,
  file,
  title,
  submitLabel = 'Upload',
  loading = false,
  error = null,
  onCancel,
  onSubmit,
}: ContributeDialogProps) {
  const [tool, setTool] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Reset fields whenever a new file is shown
  useEffect(() => {
    if (open) {
      setTool('')
      setSourceUrl('')
    }
  }, [open, file])

  return (
    <Modal open={open} onClose={() => !loading && onCancel()} title={title}>
      <div className="space-y-5">
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="mx-auto max-h-56 w-auto rounded-xl object-contain shadow-md"
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Tool used"
            placeholder="Gemini, Nano Banana, Photoshop…"
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

        <p className="text-xs text-gray-400">
          Both fields are optional but help others understand your contribution.
        </p>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ tool: tool.trim(), sourceUrl: sourceUrl.trim() })}
            loading={loading}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
