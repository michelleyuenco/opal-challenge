import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-gray-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <Link to="/" className="text-lg font-bold tracking-tight text-gray-900">
              Opal<span className="text-indigo-600">Challenge</span>
            </Link>
            <p className="mt-1 text-sm text-gray-400">
              Identify. Create. Transform.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 text-sm text-gray-400 sm:flex-row sm:gap-8">
            <Link to="/gallery" className="transition-colors hover:text-gray-600">Gallery</Link>
            <Link to="/poster" className="transition-colors hover:text-gray-600">Poster Challenge</Link>
            <a
              href="https://michelleyuenjewelry.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-amber-600"
            >
              Michelle Yuen Jewelry
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
