import { describe, expect, it } from 'vitest'
import { products } from '../../data/products'
import { getCatalogProducts, productById } from './catalogService'

describe('controlled catalog access', () => {
  it('reads the unique data array with the same order and object references', () => {
    expect(getCatalogProducts()).toBe(products)
    expect(getCatalogProducts()).toBe(getCatalogProducts())
    for (const product of products) expect(productById(product.id)).toBe(product)
  })

  it('uses exact stable IDs and returns null for missing or unrecognized IDs', () => {
    for (const id of [undefined, null, '', 'missing-product', products[0].id.toUpperCase(), { toString: () => products[0].id }]) {
      expect(productById(id)).toBeNull()
    }
  })
})
