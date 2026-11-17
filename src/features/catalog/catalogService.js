import { products } from '../../data/products'

// Keep the controlled data and object identities; do not duplicate product facts.
export function getCatalogProducts() {
  return products
}

export function productById(productId) {
  return products.find((product) => product.id === productId) || null
}
