import { useDatasetManifest } from '@presentation/hooks/useDatasetManifest'
import { Spinner } from '@presentation/components/ui/Spinner'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DatasetPage() {
  const { data: manifest, isLoading, error } = useDatasetManifest()

  const totalOpals = manifest?.length ?? 0
  const totalMedia =
    manifest?.reduce((sum, entry) => sum + entry.media.length, 0) ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Download Dataset</h1>
      <p className="mt-2 text-gray-600">
        Use this dataset to train machine-learning models for opal
        classification and identification. Each opal includes high-resolution
        images and, where available, video footage.
      </p>

      <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
        <h2 className="text-sm font-semibold text-indigo-900">
          How to use this dataset
        </h2>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-indigo-800">
          <li>Download individual media files below, or fetch them programmatically via the URLs.</li>
          <li>Organize files by opal for supervised classification tasks.</li>
          <li>Use the opal title and description as label metadata.</li>
          <li>Split into training and validation sets for your model pipeline.</li>
        </ol>
      </div>

      {!isLoading && manifest && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-6">
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{totalOpals}</p>
            <p className="text-sm text-gray-500">Opals</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{totalMedia}</p>
            <p className="text-sm text-gray-500">Media files</p>
          </div>
        </div>
      )}

      <div className="mt-10">
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}

        {error && (
          <p className="text-center text-red-600">
            Failed to load dataset manifest. Please try again later.
          </p>
        )}

        {manifest && (
          <div className="space-y-8">
            {manifest.map((entry) => (
              <div
                key={entry.opal.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {entry.opal.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {entry.opal.description}
                </p>

                {entry.media.length > 0 ? (
                  <ul className="mt-4 divide-y divide-gray-100">
                    {entry.media.map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{m.kind}</span>
                          <span className="ml-2 text-gray-400">
                            {m.mimeType}
                          </span>
                          <span className="ml-2 text-gray-400">
                            {formatBytes(m.sizeBytes)}
                          </span>
                        </div>
                        <a
                          href={m.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-gray-400">
                    No media files available.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
