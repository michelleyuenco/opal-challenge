import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useUploadPhoto } from '../../hooks/useUploadPhoto'
import { Button } from '../ui/Button'

interface Props {
  tripId: string
  itemId: string
  remainingSlots: number
}

export function PhotoUploader({ tripId, itemId, remainingSlots }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const { upload, progress } = useUploadPhoto()

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, remainingSlots)
    e.target.value = ''
    if (files.length === 0) return
    await upload({ tripId, itemId, files })
  }

  const busy = progress.current != null

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="hidden"
      />
      <Button
        variant="secondary"
        size="sm"
        disabled={busy || remainingSlots <= 0}
        onClick={() => ref.current?.click()}
      >
        {busy ? `Uploading… ${progress.done}/${progress.total}` : `＋ Add photo (${remainingSlots} left)`}
      </Button>
      {progress.errors.length > 0 && (
        <div className="mt-1 text-xs text-red-600">
          {progress.errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}
    </div>
  )
}
