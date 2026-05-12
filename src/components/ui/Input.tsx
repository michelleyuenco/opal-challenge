import { clsx } from 'clsx'
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, suffix, className, ...props },
  ref,
) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </span>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={clsx(
            'block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2',
            'text-sm focus:border-neutral-900 focus:outline-none',
            suffix && 'pr-12',
            error && 'border-red-500',
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute inset-y-0 right-3 flex items-center text-sm text-neutral-500">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
})
