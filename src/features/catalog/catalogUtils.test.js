import { describe, expect, it } from 'vitest'
import { containsText, emptyFilters, productMatches, sortCatalogProducts, toggleArrayValue } from './catalogUtils'
import { products } from '../../data/products'

const product = {
  id: 'example', brand: 'Sample BRAND', name: '柔雾粉底', category: '粉底液', skins: ['油皮', '混油皮'],
  finish: '柔雾', coverage: '高', wear: 8, oxidation: '低', brandRegion: '中国', price: 200,
  rating: 4.5, shades: [{ name: 'N01', tone: '中性调', lightness: '白皙', suitable: '黄一白' }],
  scenes: ['通勤', '拍照'], note: '不在文本搜索字段中',
}
const matches = (patch, item = product) => productMatches(item, { ...emptyFilters, ...patch })

describe('catalog text and hard filters', () => {
  it('retains trimmed case-insensitive substring matching across all original fields', () => {
    for (const keyword of ['', null, undefined, '  ', ' sample brand ', '柔雾粉底', '粉底液', 'n01', '中性调', '白皙', '黄一白', '通勤']) {
      expect(containsText(product, keyword), String(keyword)).toBe(true)
    }
    for (const keyword of ['不在文本搜索字段中', '油皮', 'BRAND N01', '不存在']) expect(containsText(product, keyword)).toBe(false)
  })

  it('does not mutate arrays when adding or removing a multi-value choice', () => {
    const source = ['油皮', '干皮']
    expect(toggleArrayValue(source, '油皮')).toEqual(['干皮'])
    expect(toggleArrayValue(source, '敏感肌')).toEqual(['油皮', '干皮', '敏感肌'])
    expect(source).toEqual(['油皮', '干皮'])
  })

  it.each([
    ['keyword', '不存在', ' Sample '], ['categories', ['腮红'], ['腮红', '粉底液']],
    ['skins', ['干皮'], ['干皮', '油皮']], ['finishes', ['哑光'], ['哑光', '柔雾']],
    ['coverages', ['低'], ['低', '高']], ['minWear', '10', '8'],
    ['oxidations', ['中'], ['中', '低']], ['regions', ['法国'], ['法国', '中国']],
    ['price', '201-400', '0-200'], ['maxPrice', 199, 200], ['scene', '约会', '通勤'],
  ])('enforces %s while retaining OR within a choice group', (key, rejected, accepted) => {
    expect(matches({ [key]: rejected })).toBe(false)
    expect(matches({ [key]: accepted })).toBe(true)
  })

  it('combines filter groups with AND and preserves inclusive overlapping price endpoints', () => {
    expect(matches({ skins: ['油皮'], categories: ['粉底液'], price: '200-400', scene: '拍照', minWear: 8 })).toBe(true)
    expect(matches({ skins: ['油皮'], categories: ['粉底液'], price: '200-400', scene: '约会' })).toBe(false)
    expect(matches({ price: '0-200' })).toBe(true)
    expect(matches({ price: '200-400' })).toBe(true)
    expect(matches({ price: '400-800' }, { ...product, price: 800 })).toBe(true)
    expect(matches({ price: '400-800' }, { ...product, price: 801 })).toBe(false)
  })

  it('retains the original falsy and numeric-coercion behavior without normalizing facts', () => {
    expect(matches({ maxPrice: 0 })).toBe(true)
    expect(matches({ maxPrice: null })).toBe(true)
    expect(matches({ minWear: '' }, { ...product, wear: null })).toBe(true)
    expect(matches({ minWear: '6' }, { ...product, wear: null })).toBe(false)
    expect(matches({ minWear: '6' }, { ...product, wear: undefined })).toBe(true)
    expect(matches({ price: '0-200' }, { ...product, price: null })).toBe(true)
  })
})

describe('catalog ordering', () => {
  const rows = [
    { id: 'a', rating: 4.8, wear: 6, price: 300 },
    { id: 'b', rating: 4.6, wear: 12, price: 200 },
    { id: 'c', rating: 4.8, wear: 6, price: 200 },
    { id: 'd', rating: null, wear: null, price: null },
  ]

  it.each([
    ['recommended', ['b', 'a', 'c', 'd']], ['rating', ['a', 'c', 'b', 'd']],
    ['price-asc', ['d', 'b', 'c', 'a']], ['price-desc', ['a', 'b', 'c', 'd']],
    ['unknown', ['b', 'a', 'c', 'd']],
  ])('retains %s ordering, ties and null arithmetic', (sort, ids) => {
    const result = sortCatalogProducts(rows, sort)
    expect(result.map((p) => p.id)).toEqual(ids)
    expect(result).not.toBe(rows)
    expect(rows.map((p) => p.id)).toEqual(['a', 'b', 'c', 'd'])
    expect(result.find((p) => p.id === 'a')).toBe(rows[0])
  })

  it('handles no matches and keeps the accepted real-catalog recommendation leader', () => {
    expect(sortCatalogProducts([], 'recommended')).toEqual([])
    const result = sortCatalogProducts(products.filter((p) => productMatches(p, emptyFilters)), 'recommended')
    expect(result[0].id).toBe('estee-lauder-double-wear')
    expect(result).toHaveLength(35)
  })
})
