import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  usePoster,
  useVersionTree,
  useUpdatePoster,
  useSharePoster,
  useDeletePoster,
} from '@presentation/hooks/usePoster'
import { VersionTree } from '@presentation/components/poster/VersionTree'
import { VersionDetailPanel } from '@presentation/components/poster/VersionDetailPanel'
import { UploadVersionModal } from '@presentation/components/poster/UploadVersionModal'
import { Button } from '@presentation/components/ui/Button'
import { Input } from '@presentation/components/ui/Input'
import { Modal } from '@presentation/components/ui/Modal'
import { Spinner } from '@presentation/components/ui/Spinner'
import type { PosterVersionNode } from '@domain/entities/PosterVersion'

export function PosterEditorPage() {
  const { posterId } = useParams<{ posterId: string }>()
  const navigate = useNavigate()

  const { data: poster, isLoading: posterLoading } = usePoster(posterId ?? '')
  const { data: tree, isLoading: treeLoading } = useVersionTree(posterId ?? '')
  const updatePoster = useUpdatePoster()
  const sharePoster = useSharePoster()
  const deletePoster = useDeletePoster()

  const [selectedNode, setSelectedNode] = useState<PosterVersionNode | null>(null)
  const [uploadParent, setUploadParent] = useState<{
    id: string | null
    label?: string
  } | null>(null)

  // Title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState('')

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (posterLoading || treeLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!poster || !posterId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Journey not found</h2>
        <p className="mt-2 text-sm text-gray-400">
          This poster journey may have been deleted or doesn't exist.
        </p>
      </div>
    )
  }

  const treeNodes = tree ?? []
  const hasVersions = treeNodes.length > 0

  const handleStartEditTitle = () => {
    setEditTitle(poster.title)
    setIsEditingTitle(true)
  }

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) return
    await updatePoster.mutateAsync({
      posterId,
      title: editTitle.trim(),
    })
    setIsEditingTitle(false)
  }

  const handleToggleShare = () => {
    sharePoster.mutate({ posterId, isShared: !poster.isShared })
  }

  const handleDelete = async () => {
    await deletePoster.mutateAsync(posterId)
    navigate('/poster/my')
  }

  const handleAddVersion = (parentNode: PosterVersionNode) => {
    setUploadParent({ id: parentNode.id, label: parentNode.label })
  }

  const handleUploadRoot = () => {
    setUploadParent({ id: null })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle()
                    if (e.key === 'Escape') setIsEditingTitle(false)
                  }}
                />
                <Button
                  variant="ghost"
                  onClick={handleSaveTitle}
                  loading={updatePoster.isPending}
                >
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setIsEditingTitle(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {poster.title}
                </h1>
                <button
                  type="button"
                  onClick={handleStartEditTitle}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Edit title"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Share toggle */}
            <button
              type="button"
              onClick={handleToggleShare}
              disabled={sharePoster.isPending}
              className={`
                relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer items-center rounded-full
                transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${poster.isShared ? 'bg-indigo-600' : 'bg-gray-200'}
              `}
              role="switch"
              aria-checked={poster.isShared}
              aria-label="Share journey"
            >
              <span
                className={`
                  inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300
                  ${poster.isShared ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
            <span className="text-sm text-gray-500">
              {poster.isShared ? 'Shared' : 'Private'}
            </span>

            {/* Delete */}
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </Button>
          </div>
        </div>

        {/* Description */}
        {poster.description && (
          <p className="mt-2 max-w-2xl text-sm text-gray-500">{poster.description}</p>
        )}

        {/* Main workspace */}
        <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:flex-row">
          {/* Tree area */}
          <div className="min-w-0 flex-1">
            {!hasVersions ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-24 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-purple-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Upload your first photo</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
                  Start by uploading a street poster photograph. This will be the root of your
                  creative transformation tree.
                </p>
                <Button className="mt-6" onClick={handleUploadRoot}>
                  Upload First Photo
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
                <VersionTree
                  nodes={treeNodes}
                  selectedId={selectedNode?.id}
                  onSelect={setSelectedNode}
                  onAddVersion={handleAddVersion}
                />
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedNode && (
            <div className="w-full flex-shrink-0 lg:w-80 xl:w-96">
              <VersionDetailPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Upload modal */}
      {uploadParent !== null && (
        <UploadVersionModal
          open
          onClose={() => setUploadParent(null)}
          posterId={posterId}
          parentVersionId={uploadParent.id}
          parentLabel={uploadParent.label}
        />
      )}

      {/* Delete confirmation */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Journey"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong>{poster.title}</strong>? This will
          permanently remove all versions and cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deletePoster.isPending}
          >
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  )
}
