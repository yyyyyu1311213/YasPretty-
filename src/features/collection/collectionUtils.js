export const statusOptions = ['想买', '正在用', '会回购']

/** @typedef {Object.<string, string>} Collection Product IDs mapped to existing status labels. */

/** @param {Collection} collection */
export function setCollectionStatus(collection, productId, status) {
  return { ...collection, [productId]: status }
}

/** @param {Collection} collection */
export function removeCollectionProduct(collection, productId) {
  const next = { ...collection }
  delete next[productId]
  return next
}

// The header counts stored keys; the list only shows known products with truthy states.
export function getCollectionCount(collection) {
  return Object.keys(collection).length
}

export function getCollectionProducts(products, collection) {
  return products.filter((product) => collection[product.id])
}
