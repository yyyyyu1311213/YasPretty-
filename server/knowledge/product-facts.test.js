import { describe, expect, it } from 'vitest'
import indexModule from './product-facts-index.cjs'
import schema from './product-facts-schema.cjs'

const product = { id: 'sample', name: '合成气垫（哑光）', brand: '测试品牌', category: '气垫', specification: '15g', price: 200, shades: [], skins: [] }
const reviewed = { productId: 'sample', reviewedFacts: { productId: 'sample', productName: product.name, reviewStatus: 'verified', productMatch: true,
  specification: '15g', verifiedAt: '2026-11-01', source: { workbookPath: '合成证据/核验.xlsx', sheet: '测试', row: 3 } },
  commerce: { status: 'verified', officialStoreFlag: '是', productUrl: 'https://e.tb.cn/h.synthetic?tk=synthetic' }, issues: [] }

describe('AI-R02 read-only product fact mappings', () => {
  it('maps a hidden reviewed specification without maintaining another value or mutating source records', () => {
    const catalog = { ...product, specification: undefined }
    const original = structuredClone(reviewed)
    const index = indexModule.createProductFactsIndex([catalog], { sample: reviewed })
    const result = index.read('sample', ['netContent', 'refill', 'usageDuration'])
    expect(result.fields[0]).toMatchObject({ value: '15g', status: 'recorded', verifiedAt: '2026-11-01' })
    expect(result.fields[0].evidence[0].location).toContain('合成证据/核验.xlsx')
    expect(result.fields.slice(1).every((field) => field.value === null && field.status === 'unknown')).toBe(true)
    expect(result.sources[0].url).toBeNull()
    expect(JSON.stringify(result.sources)).not.toContain('核验.xlsx')
    expect(reviewed).toEqual(original)
    expect(catalog.specification).toBeUndefined()
  })
  it('does not convert a compound specification into a package or sum it as one net weight', () => {
    const index = indexModule.createProductFactsIndex([{ ...product, specification: '15g+15g' }])
    const result = index.read('sample', ['specification', 'netContent', 'refill', 'setContents'])
    expect(result.fields[0].value).toBe('15g+15g')
    expect(result.fields.slice(1).every((field) => field.value === null)).toBe(true)
  })
  it('keeps catalog and reviewed conflicts visible', () => {
    const index = indexModule.createProductFactsIndex([{ ...product, specification: '30g' }], { sample: reviewed })
    expect(index.read('sample', ['netContent']).fields[0]).toMatchObject({ status: 'conflict', value: null })
  })
  it('records the catalog size policy separately from merchant packaging and retains version isolation', () => {
    const index = indexModule.createProductFactsIndex([product], { sample: reviewed })
    const result = index.read('sample', ['fullSize', 'saleUnit', 'refill'])
    expect(result.fields[0]).toMatchObject({ value: '正装', status: 'recorded', verifiedAt: '2026-11-21' })
    expect(result.sources).toHaveLength(1)
    expect(result.sources[0]).toMatchObject({ publisher: 'YasPretty', url: null, supports: ['收录规格'] })
    expect(result.fields.slice(1).every((f) => f.value === null)).toBe(true)
    expect(index.read('sample', ['fullSize'], { sku: 'UNLISTED' }).fields[0].value).toBeNull()
  })
  it('does not apply a supplement from another SKU or version', () => {
    const initial = indexModule.createProductFactsIndex([product], { sample: reviewed })
    const record = { ...initial.records().find((r) => r.field === 'netContent'), field: 'refill' }
    const index = indexModule.createProductFactsIndex([product], { sample: reviewed }, [{ ...record, sku: 'REFILL-30', value: '含替换芯', status: 'recorded' }])
    expect(index.read('sample', ['refill']).fields[0].value).toBeNull()
    expect(index.read('sample', ['netContent'], { sku: 'UNLISTED' })).toMatchObject({ mismatch: true, sources: [] })
    expect(index.read('missing', ['netContent'])).toBeNull()
  })
  it('reads an explicitly covered SKU without borrowing missing fields from the default record', () => {
    const initial = indexModule.createProductFactsIndex([product], { sample: reviewed })
    const record = initial.records().find((r) => r.field === 'netContent')
    const index = indexModule.createProductFactsIndex([product], { sample: reviewed }, [{ ...record, sku: 'REFILL-30', value: '30g' }])
    const result = index.read('sample', ['netContent', 'price'], { sku: 'REFILL-30' })
    expect(result.mismatch).toBe(false)
    expect(result.fields[0].value).toBe('30g')
    expect(result.fields[1].value).toBeNull()
    expect(result.sources[0].sku).toBe('REFILL-30')
  })
  it('does not accept contradictory supplements or unknown product IDs as verified truth', () => {
    const index = indexModule.createProductFactsIndex([product], { sample: reviewed })
    const record = index.records().find((r) => r.field === 'netContent')
    const conflict = indexModule.createProductFactsIndex([product], { sample: reviewed }, [{ ...record, value: '30g' }])
    expect(conflict.read('sample', ['netContent']).fields[0].status).toBe('conflict')
    expect(() => indexModule.createProductFactsIndex([product], {}, [{ ...record, productId: 'missing' }])).toThrow()
  })
  it.each(['https://example.test/item.htm?id=100', 'https://detail.tmall.com.evil.test/item.htm?id=100', 'https://detail.tmall.com/search?id=100', 'file:///private/evidence', 'https://user:pass@detail.tmall.com/item.htm?id=100'])('rejects a nonqualifying product URL: %s', (url) => {
    expect(schema.officialItemUrl(url)).toBeNull()
  })
})
