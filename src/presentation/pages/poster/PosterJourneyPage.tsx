import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePoster, useVersionTree, useUploadVersion } from '@presentation/hooks/usePoster'
import { useAuth } from '@presentation/hooks/useAuth'
import { Spinner } from '@presentation/components/ui/Spinner'
import { Button } from '@presentation/components/ui/Button'
import { ContributeDialog } from '@presentation/components/poster/ContributeDialog'
import type { PosterVersionNode } from '@domain/entities/PosterVersion'

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Flatten the tree into a depth-first ordered list with depth info for timeline rendering. */
function flattenTree(
  nodes: PosterVersionNode[],
  depth = 0,
): Array<{ node: PosterVersionNode; depth: number }> {
  const result: Array<{ node: PosterVersionNode; depth: number }> = []
  for (const node of nodes) {
    result.push({ node, depth })
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }
  return result
}

function TimelineStep({
  node,
  depth,
  isLast,
  posterId,
}: {
  node: PosterVersionNode
  depth: number
  isLast: boolean
  posterId: string
}) {
  const isBranch = depth > 0
  const { user } = useAuth()
  const uploadVersion = useUploadVersion()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return
    setUploadError(null)
    setPendingFile(file)
  }

  const submitContribution = async ({
    tool,
    sourceUrl,
  }: {
    tool: string
    sourceUrl: string
  }) => {
    if (!pendingFile || !user) return
    try {
      await uploadVersion.mutateAsync({
        posterId,
        parentVersionId: node.id,
        file: pendingFile,
        label: 'Community remix',
        notes: '',
        sourceUrl: sourceUrl || null,
        tool: tool || null,
        userId: user.id,
      })
      setPendingFile(null)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <div className="relative flex gap-6 pb-12 last:pb-0">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div
          className={`
            z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full
            text-xs font-bold shadow-md
            ${isBranch
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
              : 'bg-gradient-to-br from-amber-400 to-amber-500 text-indigo-950'
            }
          `}
        >
          v{node.versionNumber}
        </div>
        {/* Line */}
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-indigo-200 to-indigo-100" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        {/* Branch indicator */}
        {isBranch && (
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-purple-400">
            Branch
          </p>
        )}

        {/* Image */}
        <div className="overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl">
          {node.downloadUrl ? (
            <img
              src={node.downloadUrl}
              alt={node.label}
              className="h-auto max-h-[32rem] w-full object-contain bg-gray-50"
            />
          ) : (
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {node.label || 'Untitled'}
          </h3>
          {node.notes && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{node.notes}</p>
          )}
          {(node.tool || node.sourceUrl) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {node.tool && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-100">
                  {node.tool}
                </span>
              )}
              {node.sourceUrl && (
                <a
                  href={node.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-100 hover:bg-gray-100 hover:text-indigo-700"
                >
                  source ↗
                </a>
              )}
            </div>
          )}
          <p className="mt-2 text-xs text-gray-400">{formatDate(node.createdAt)}</p>

          {/* Continue from here */}
          <div className="mt-4">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadVersion.isPending}
                  className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 disabled:opacity-60"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {uploadVersion.isPending ? 'Uploading…' : 'Continue from here'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
              </>
            ) : (
              <Link
                to={`/login?returnTo=/poster/journey/${posterId}`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-indigo-200 hover:text-indigo-700"
              >
                Sign in to contribute
              </Link>
            )}
          </div>
        </div>
      </div>

      <ContributeDialog
        open={pendingFile !== null}
        file={pendingFile}
        title="Continue this journey"
        submitLabel="Add to journey"
        loading={uploadVersion.isPending}
        error={uploadError}
        onCancel={() => {
          setPendingFile(null)
          setUploadError(null)
        }}
        onSubmit={submitContribution}
      />
    </div>
  )
}

export function PosterJourneyPage() {
  const { posterId } = useParams<{ posterId: string }>()
  const { data: poster, isLoading: posterLoading } = usePoster(posterId ?? '')
  const { data: tree, isLoading: treeLoading } = useVersionTree(posterId ?? '')
  const [copied, setCopied] = useState(false)

  if (posterLoading || treeLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!poster) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Journey not found</h2>
        <p className="mt-2 text-sm text-gray-400">
          This poster journey may have been deleted or doesn't exist.
        </p>
      </div>
    )
  }

  if (!poster.isShared) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700">This journey is private</h2>
        <p className="mt-2 text-sm text-gray-400">
          The creator hasn't shared this journey publicly yet.
        </p>
      </div>
    )
  }

  const treeNodes = tree ?? []
  const flatSteps = flattenTree(treeNodes)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-8 sm:px-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {poster.title}
            </h1>
            {poster.description && (
              <p className="mt-2 max-w-xl text-base text-gray-500">
                {poster.description}
              </p>
            )}
            <p className="mt-3 text-xs text-gray-400">
              {flatSteps.length} {flatSteps.length === 1 ? 'version' : 'versions'}
              {' '}&middot;{' '}
              {formatDate(poster.createdAt)}
            </p>
          </div>
          <Button variant="secondary" onClick={handleCopyLink}>
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Copy Link
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Timeline */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {flatSteps.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">
              This journey has no versions yet.
            </p>
          </div>
        ) : (
          <div className="relative">
            {flatSteps.map(({ node, depth }, idx) => (
              <TimelineStep
                key={node.id}
                node={node}
                depth={depth}
                isLast={idx === flatSteps.length - 1}
                posterId={poster.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
