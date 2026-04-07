import type { PosterVersionNode } from '@domain/entities/PosterVersion'

interface VersionDetailPanelProps {
  node: PosterVersionNode
  onClose: () => void
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function VersionDetailPanel({ node, onClose }: VersionDetailPanelProps) {
  return (
    <div className="animate-in slide-in-from-right relative flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-900/90 px-2.5 py-0.5 text-xs font-bold tracking-wide text-amber-200">
            v{node.versionNumber}
          </span>
          <h3 className="text-lg font-semibold text-gray-900">
            {node.label || 'Untitled Version'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close detail panel"
        >
          &#x2715;
        </button>
      </div>

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50">
        {node.downloadUrl ? (
          <img
            src={node.downloadUrl}
            alt={node.label}
            className="h-auto max-h-[28rem] w-full object-contain"
          />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <span className="text-5xl text-gray-200">&#x1f5bc;</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-4 px-6 py-5">
        {/* Notes */}
        {node.notes && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
              Notes
            </p>
            <p className="text-sm leading-relaxed text-gray-700">{node.notes}</p>
          </div>
        )}

        {/* Timestamp */}
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
            Created
          </p>
          <p className="text-sm text-gray-600">{formatDate(node.createdAt)}</p>
        </div>

        {/* Download */}
        {node.downloadUrl && (
          <a
            href={node.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Image
          </a>
        )}
      </div>
    </div>
  )
}
