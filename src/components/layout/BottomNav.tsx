import { NavLink, useParams } from 'react-router-dom'
import { clsx } from 'clsx'

export function BottomNav() {
  const { tripId } = useParams<{ tripId: string }>()
  if (!tripId) return null

  const tabs = [
    { to: `/trips/${tripId}`, label: 'Items', end: true },
    { to: `/trips/${tripId}/booths`, label: 'Booths', end: false },
    { to: `/trips/${tripId}/settings`, label: 'Settings', end: false },
  ]

  return (
    <nav className="sticky bottom-0 grid grid-cols-3 border-t border-neutral-200 bg-white">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            clsx(
              'py-3 text-center text-sm',
              isActive ? 'font-semibold text-neutral-900' : 'text-neutral-500',
            )
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
