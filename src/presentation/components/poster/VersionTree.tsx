import type { PosterVersionNode } from '@domain/entities/PosterVersion'

interface VersionTreeProps {
  nodes: PosterVersionNode[]
  selectedId?: string
  onSelect: (node: PosterVersionNode) => void
  onAddVersion: (parentNode: PosterVersionNode) => void
}

function TreeNode({
  node,
  selectedId,
  onSelect,
  onAddVersion,
  isRoot,
}: {
  node: PosterVersionNode
  selectedId?: string
  onSelect: (node: PosterVersionNode) => void
  onAddVersion: (parentNode: PosterVersionNode) => void
  isRoot: boolean
}) {
  const isSelected = selectedId === node.id
  const hasChildren = node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Vertical connector from parent */}
      {!isRoot && (
        <div className="h-4 w-px bg-gradient-to-b from-indigo-300 to-indigo-400 sm:h-6" />
      )}

      {/* Node card */}
      <div className="relative">
        <button
          type="button"
          onClick={() => onSelect(node)}
          className={`
            group relative flex flex-col items-center rounded-2xl border-2 bg-white p-1.5
            transition-all duration-300 active:scale-95 sm:p-2
            ${isSelected
              ? 'border-amber-400 shadow-lg shadow-amber-100 ring-2 ring-amber-300/50'
              : 'border-white/60 shadow-lg hover:border-indigo-200 hover:shadow-xl'
            }
          `}
        >
          {/* Thumbnail — touch-friendly minimum size */}
          <div className="relative h-24 w-24 overflow-hidden rounded-xl sm:h-32 sm:w-32 lg:h-36 lg:w-36">
            {node.downloadUrl ? (
              <img
                src={node.downloadUrl}
                alt={node.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                </svg>
              </div>
            )}

            {/* Version badge */}
            <span className="absolute left-1 top-1 rounded-full bg-indigo-900/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-200 backdrop-blur-sm sm:left-1.5 sm:top-1.5 sm:px-2">
              v{node.versionNumber}
            </span>

            {/* Selected glow overlay */}
            {isSelected && (
              <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-amber-400/30" />
            )}
          </div>

          {/* Label */}
          <p className="mt-1.5 max-w-[6rem] truncate text-center text-[11px] font-medium text-gray-700 sm:mt-2 sm:max-w-[8rem] sm:text-xs lg:max-w-[9rem] lg:text-sm">
            {node.label || 'Untitled'}
          </p>
        </button>

        {/* Add child button — always visible on touch, hover on desktop */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAddVersion(node)
          }}
          className={`
            absolute -bottom-3 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center
            rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-xs font-bold text-white
            shadow-md transition-all duration-300 active:scale-95
            sm:h-6 sm:w-6
            ${isSelected ? 'scale-100 opacity-100' : 'scale-100 opacity-70 sm:scale-75 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100'}
          `}
          title="Add a version from here"
        >
          +
        </button>
      </div>

      {/* Children */}
      {hasChildren && (
        <>
          <div className="h-4 w-px bg-gradient-to-b from-indigo-400 to-indigo-300 sm:h-6" />

          <div className="flex items-start gap-3 sm:gap-5 lg:gap-6">
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
                onAddVersion={onAddVersion}
                isRoot={false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function VersionTree({ nodes, selectedId, onSelect, onAddVersion }: VersionTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center sm:py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 sm:h-20 sm:w-20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-300 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
          </svg>
        </div>
        <p className="text-base font-medium text-gray-400 sm:text-lg">No versions yet</p>
        <p className="mt-1 max-w-xs text-sm text-gray-300">
          Upload your first street poster photograph to begin the creative journey.
        </p>
      </div>
    )
  }

  return (
    <div className="-mx-2 overflow-x-auto px-2 py-6 sm:px-4 sm:py-8">
      <div className="flex min-w-min justify-center gap-6 sm:gap-8">
        {nodes.map((root) => (
          <TreeNode
            key={root.id}
            node={root}
            selectedId={selectedId}
            onSelect={onSelect}
            onAddVersion={onAddVersion}
            isRoot
          />
        ))}
      </div>
    </div>
  )
}
