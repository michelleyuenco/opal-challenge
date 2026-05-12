import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Chip({ active, className, ...props }: Props) {
  return (
    <button
      type="button"
      className={clsx(
        'whitespace-nowrap rounded-full border px-3 py-1 text-xs transition',
        active
          ? 'border-neutral-900 bg-neutral-900 text-white'
          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
        className,
      )}
      {...props}
    />
  )
}
