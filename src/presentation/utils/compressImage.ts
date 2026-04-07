import imageCompression from 'browser-image-compression'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2560,
  useWebWorker: true,
  preserveExif: true,
}

/**
 * Compresses an image file while preserving visual clarity.
 * Non-image files (e.g. videos) are returned as-is.
 */
export async function compressFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file
  }

  // Skip already-small images (under 500KB)
  if (file.size < 500 * 1024) {
    return file
  }

  const compressed = await imageCompression(file, COMPRESSION_OPTIONS)

  // If compression didn't actually reduce size, return original
  if (compressed.size >= file.size) {
    return file
  }

  return new File([compressed], file.name, { type: compressed.type })
}
