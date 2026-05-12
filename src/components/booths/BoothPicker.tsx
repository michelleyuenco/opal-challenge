import { useState } from 'react'
import { useBooths } from '../../hooks/useBooths'
import { useTripContext } from '../../context/TripContext'
import { Sheet } from '../ui/Sheet'
import { BoothForm } from './BoothForm'

interface Props {
  value: string | null
  onChange: (boothId: string) => void
}

export function BoothPicker({ value, onChange }: Props) {
  const { trip } = useTripContext()
  const { booths } = useBooths(trip.id)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const current = booths.find((b) => b.id === value)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-left text-sm"
      >
        {current ? (
          <span>
            <span className="font-medium">{current.number}</span>
            {current.vendorName ? ` · ${current.vendorName}` : ''}
          </span>
        ) : (
          <span className="text-neutral-400">Pick a booth</span>
        )}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Pick booth">
        {creating ? (
          <BoothForm
            onCreated={(id) => {
              onChange(id)
              setCreating(false)
              setOpen(false)
            }}
          />
        ) : (
          <div className="space-y-2">
            {booths.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onChange(b.id)
                  setOpen(false)
                }}
                className="block w-full rounded-lg border border-neutral-200 bg-white p-3 text-left hover:bg-neutral-50"
              >
                <div className="font-medium">{b.number}</div>
                {b.vendorName && (
                  <div className="text-xs text-neutral-500">{b.vendorName}</div>
                )}
              </button>
            ))}
            <button
              onClick={() => setCreating(true)}
              className="block w-full rounded-lg border border-dashed border-neutral-300 p-3 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              ＋ New booth
            </button>
          </div>
        )}
      </Sheet>
    </>
  )
}
