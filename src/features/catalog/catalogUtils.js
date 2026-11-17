export const emptyFilters = {
  categories: [], skins: [], finishes: [], coverages: [], minWear: '', oxidations: [], regions: [], price: '', keyword: '', scene: '', maxPrice: null,
}

export function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((item) => item !== value) : [...array, value]
}

export function containsText(product, keyword) {
  if (!keyword) return true
  const needle = keyword.trim().toLowerCase()
  if (!needle) return true
  const source = [product.brand, product.name, product.category, ...product.shades.flatMap((shade) => Object.values(shade)), ...product.scenes].join(' ').toLowerCase()
  return source.includes(needle)
}

export function productMatches(product, filters) {
  if (!containsText(product, filters.keyword)) return false
  if (filters.categories.length && !filters.categories.includes(product.category)) return false
  if (filters.skins.length && !filters.skins.some((skin) => product.skins.includes(skin))) return false
  if (filters.finishes.length && !filters.finishes.includes(product.finish)) return false
  if (filters.coverages.length && !filters.coverages.includes(product.coverage)) return false
  if (filters.minWear && product.wear < Number(filters.minWear)) return false
  if (filters.oxidations.length && !filters.oxidations.includes(product.oxidation)) return false
  if (filters.regions.length && !filters.regions.includes(product.brandRegion)) return false
  if (filters.price) {
    const [min, max] = filters.price.split('-').map(Number)
    if (product.price < min || product.price > max) return false
  }
  if (filters.maxPrice && product.price > filters.maxPrice) return false
  if (filters.scene && !product.scenes.includes(filters.scene)) return false
  return true
}

export function sortCatalogProducts(list, sort) {
  return [...list].sort((a, b) => {
    if (sort === 'rating') return b.rating - a.rating
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    return b.rating * 10 + b.wear - (a.rating * 10 + a.wear)
  })
}
