import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@presentation/hooks/useAuth'
import { Button } from '@presentation/components/ui/Button'
import { clsx } from 'clsx'

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'block rounded-xl px-4 py-3 text-base font-medium transition-colors duration-200',
    isActive
      ? 'bg-indigo-50 text-indigo-600'
      : 'text-gray-600 active:bg-gray-50',
  )

const mobileSublinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'block rounded-lg px-4 py-2.5 text-sm transition-colors duration-200',
    isActive
      ? 'text-indigo-600 font-medium'
      : 'text-gray-500 active:bg-gray-50',
  )

function DesktopDropdown({
  label,
  isActive,
  children,
}: {
  label: string
  isActive: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'flex items-center gap-1 text-sm font-medium transition-colors duration-200',
          isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900',
        )}
      >
        {label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={clsx('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200/80 bg-white py-2 shadow-xl">
          <div onClick={() => setOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

function DropdownLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'block px-4 py-2.5 transition-colors duration-150',
          isActive ? 'bg-indigo-50' : 'hover:bg-gray-50',
        )
      }
    >
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <span className="mt-0.5 block text-xs text-gray-400">{desc}</span>
    </NavLink>
  )
}

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo + desktop nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
            Opal<span className="text-indigo-600">Challenge</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {/* Poster Challenge dropdown */}
            <DesktopDropdown
              label="Poster Challenge"
              isActive={location.pathname.startsWith('/poster')}
            >
              <DropdownLink to="/poster" label="About" desc="Learn about creative imitation" />
              {user && (
                <DropdownLink to="/poster/my" label="My Journeys" desc="Your poster transformations" />
              )}
            </DesktopDropdown>

            {/* Opal Identification dropdown */}
            <DesktopDropdown
              label="Opal Identification"
              isActive={['/gallery', '/dataset', '/challenge'].some((p) => location.pathname.startsWith(p))}
            >
              <DropdownLink to="/gallery" label="Gallery" desc="Browse opal images & videos" />
              <DropdownLink to="/dataset" label="Dataset" desc="Download for ML training" />
              <DropdownLink to="/challenge" label="Challenge" desc="Identify the mystery opal" />
            </DesktopDropdown>
          </div>
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-4 md:flex">
          {isAdmin && (
            <Link
              to="/admin"
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                {(user.displayName?.[0] ?? user.email[0]).toUpperCase()}
              </div>
              <Button
                variant="ghost"
                onClick={() => signOut.mutate()}
                loading={signOut.isPending}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="rounded-full px-5">Sign in</Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors active:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={clsx(
          'overflow-hidden transition-all duration-300 ease-in-out md:hidden',
          mobileOpen ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="border-t border-gray-100 px-4 pb-5 pt-3">
          {/* Poster Challenge section */}
          <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Poster Challenge
          </p>
          <NavLink to="/poster" end className={mobileSublinkClass} onClick={() => setMobileOpen(false)}>
            About
          </NavLink>
          {user && (
            <NavLink to="/poster/my" className={mobileSublinkClass} onClick={() => setMobileOpen(false)}>
              My Journeys
            </NavLink>
          )}

          <div className="my-2 border-t border-gray-100" />

          {/* Opal Identification section */}
          <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Opal Identification
          </p>
          <NavLink to="/gallery" className={mobileSublinkClass} onClick={() => setMobileOpen(false)}>
            Gallery
          </NavLink>
          <NavLink to="/dataset" className={mobileSublinkClass} onClick={() => setMobileOpen(false)}>
            Dataset
          </NavLink>
          <NavLink to="/challenge" className={mobileSublinkClass} onClick={() => setMobileOpen(false)}>
            Challenge
          </NavLink>

          {isAdmin && (
            <>
              <div className="my-2 border-t border-gray-100" />
              <NavLink to="/admin" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                Admin Panel
              </NavLink>
            </>
          )}

          {/* Auth */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            {user ? (
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                    {(user.displayName?.[0] ?? user.email[0]).toUpperCase()}
                  </div>
                  <span className="max-w-[180px] truncate text-sm text-gray-600">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => { signOut.mutate(); setMobileOpen(false) }}
                  loading={signOut.isPending}
                  className="text-sm"
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button className="w-full rounded-xl">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
