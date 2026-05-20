// CDN configuration for static assets and images
// EN-11, EN-17

const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || ''

export function cdnUrl(path) {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return `${CDN_BASE}${path}`
}

export function assetUrl(path) {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return `${CDN_BASE}${path}`
}

export { CDN_BASE }