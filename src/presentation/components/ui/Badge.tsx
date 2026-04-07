import { clsx } from 'clsx'

type BadgeColor = 'gray' | 'green' | 'yellow' | 'red' | 'indigo'

const colorStyles: Record<BadgeColor, string> = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  indigo: 'bg-indigo-100 text-indigo-700',
}

export function Badge({
  color = 'gray',
  children,
}: {
  color?: BadgeColor
  children: React.ReactNode
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorStyles[color],
      )}
    >
      {children}
    </span>
  )
}
