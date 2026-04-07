import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/opals', label: 'Opals' },
  { to: '/admin/challenge', label: 'Challenge' },
  { to: '/admin/submissions', label: 'Submissions' },
]

export function AdminSidebar() {
  return (
    <>
      {/* Mobile: horizontal scrollable tabs */}
      <div className="border-b border-gray-200 bg-white sm:hidden">
        <nav className="-mb-px flex gap-1 overflow-x-auto px-4 py-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                clsx(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 active:bg-gray-100',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop: vertical sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-gray-50 p-4 sm:block">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Admin
        </h2>
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                clsx(
                  'block rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
