import { useState } from 'react'
import type { KeyboardEvent } from 'react'

interface Props {
  value: string[]
  onChange: (v: string[]) => void
}

export function OpalTagInput({ value, onChange }: Props) {
  const [draft, setDraft] = useState('')

  function commit() {
    const t = draft.trim()
    if (!t) return
    if (value.includes(t)) {
      setDraft('')
      return
    }
    onChange([...value, t])
    setDraft('')
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      <span className="block text-sm font-medium text-neutral-700 mb-1">Opal types</span>
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-neutral-300 bg-white p-2">
        {value.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== t))}
              aria-label={`remove ${t}`}
              className="text-neutral-300 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={commit}
          placeholder={value.length === 0 ? 'black, crystal, welo…' : ''}
          className="flex-1 min-w-[6rem] border-none bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  )
}
