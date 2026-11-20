export const APP_HISTORY_MARKER = 'yaspretty-navigation-v1'

const MAIN_VIEWS = ['home', 'library', 'assistant', 'culture', 'favorites']

function productIdFromPathname(pathname = '') {
  const match = pathname.match(/^\/products\/([^/]+)\/?$/)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

export function createNavigationEntry({
  view = 'home',
  productId = null,
  drawerProductId = null,
  returnTo = null,
  scrollY = 0,
  depth = 0,
} = {}) {
  const normalizedView = view === 'product' || MAIN_VIEWS.includes(view) ? view : 'home'
  const entry = {
    marker: APP_HISTORY_MARKER,
    view: normalizedView,
    productId: normalizedView === 'product' && typeof productId === 'string' ? productId : null,
    drawerProductId: normalizedView !== 'product' && typeof drawerProductId === 'string' ? drawerProductId : null,
    scrollY: Number.isFinite(scrollY) ? Math.max(0, scrollY) : 0,
    depth: Number.isInteger(depth) ? Math.max(0, depth) : 0,
  }
  if (normalizedView === 'library' && returnTo === 'makeup-table') entry.returnTo = returnTo
  return entry
}

export function resolveNavigationEntry(historyState, pathname = '/') {
  if (historyState?.marker === APP_HISTORY_MARKER) {
    const entry = createNavigationEntry(historyState)
    if (entry.view !== 'product' || entry.productId) return entry
  }

  const productId = productIdFromPathname(pathname)
  if (productId) return createNavigationEntry({ view: 'product', productId })
  return createNavigationEntry()
}

export function navigationPath(entry) {
  if (entry.view === 'product' && entry.productId) {
    return `/products/${encodeURIComponent(entry.productId)}`
  }
  return '/'
}
